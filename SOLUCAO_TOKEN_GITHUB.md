# 🔐 Solução: Problemas com Token no GitHub Actions

## Problemas Comuns

### 1. Erro: "Permission denied" ou "Authentication failed"

Isso geralmente acontece quando:
- Chave SSH está incorreta
- Chave SSH tem senha (não deve ter)
- Permissões incorretas na VPS

---

## ✅ Solução: Configurar Chave SSH Corretamente

### Passo 1: Gerar Nova Chave SSH (Sem Senha)

**Na VPS:**

```bash
# Criar chave dedicada para GitHub Actions (SEM senha)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions -N ""

# Verificar se foi criada
ls -la ~/.ssh/github_actions*
```

**⚠️ IMPORTANTE:** Quando pedir senha, pressione ENTER (deixe vazio)!

### Passo 2: Adicionar Chave Pública ao authorized_keys

```bash
# Na VPS
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Verificar permissões
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions
```

### Passo 3: Obter Chave Privada

```bash
# Na VPS, mostrar chave privada
cat ~/.ssh/github_actions
```

**Copie TODO o conteúdo**, incluindo:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

### Passo 4: Adicionar ao GitHub Secrets

1. No GitHub, vá em: **Settings → Secrets and variables → Actions**
2. Clique em **New repository secret**
3. Nome: `VPS_SSH_KEY`
4. Valor: Cole a chave privada completa (todo o conteúdo copiado)
5. Clique em **Add secret**

---

## 🔧 Solução Alternativa: Usar Deploy Key

Se preferir usar uma Deploy Key do GitHub:

### Passo 1: Gerar Par de Chaves

```bash
# Na sua máquina local ou VPS
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy -N ""
```

### Passo 2: Adicionar Chave Pública como Deploy Key

1. No GitHub, vá em: **Settings → Deploy keys**
2. Clique em **Add deploy key**
3. Title: `VPS Deploy Key`
4. Key: Cole a chave pública (`~/.ssh/github_deploy.pub`)
5. ✅ Marque **Allow write access** (se necessário)
6. Clique em **Add key**

### Passo 3: Usar Chave Privada no Secret

1. Copie a chave privada (`~/.ssh/github_deploy`)
2. Adicione como secret `VPS_SSH_KEY` no GitHub

---

## 🔍 Verificar Configuração

### Testar Conexão SSH Manualmente

```bash
# Na sua máquina local, testar conexão
ssh -i ~/.ssh/github_actions root@SEU_IP_VPS

# OU se estiver usando chave existente
ssh -i ~/.ssh/id_rsa root@SEU_IP_VPS
```

Se conectar sem pedir senha, está funcionando!

---

## 🚨 Erros Comuns e Soluções

### Erro: "Host key verification failed"

**Solução:** Adicionar host à known_hosts no workflow:

```yaml
- name: Add VPS to known_hosts
  run: |
    mkdir -p ~/.ssh
    ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts
```

### Erro: "Permission denied (publickey)"

**Causas possíveis:**
1. Chave SSH incorreta no secret
2. Chave SSH tem senha
3. Permissões incorretas na VPS

**Solução:**

```bash
# Na VPS, verificar permissões
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions

# Verificar se chave pública está em authorized_keys
grep "github_actions" ~/.ssh/authorized_keys
```

### Erro: "Connection refused"

**Solução:** Verificar se SSH está rodando na VPS:

```bash
# Na VPS
systemctl status ssh
# OU
systemctl status sshd

# Se não estiver rodando:
systemctl start ssh
systemctl enable ssh
```

### Erro: "Too many authentication failures"

**Solução:** Especificar chave no workflow:

O workflow já usa `key: ${{ secrets.VPS_SSH_KEY }}`, mas você pode adicionar:

```yaml
- name: Deploy to VPS
  uses: appleboy/scp-action@master
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USER }}
    key: ${{ secrets.VPS_SSH_KEY }}
    passphrase: "" # Vazio se chave não tem senha
```

---

## 🔄 Workflow Atualizado com Verificações

Aqui está uma versão melhorada do workflow que adiciona verificações:

```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.VPS_SSH_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts

      - name: Test SSH connection
        run: |
          ssh -i ~/.ssh/deploy_key -o StrictHostKeyChecking=no \
            ${{ secrets.VPS_USER }}@${{ secrets.VPS_HOST }} \
            "echo 'SSH connection successful'"

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: web-app/package-lock.json

      - name: Install dependencies
        working-directory: ./web-app
        run: npm ci

      - name: Build application
        working-directory: ./web-app
        env:
          NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
          NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN }}
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_PROJECT_ID }}
          NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }}
          NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }}
          NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.NEXT_PUBLIC_FIREBASE_APP_ID }}
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
          NEXT_PUBLIC_DOMAIN: ${{ secrets.NEXT_PUBLIC_DOMAIN }}
          NEXT_PUBLIC_FILE_RETENTION_DAYS: ${{ secrets.NEXT_PUBLIC_FILE_RETENTION_DAYS }}
        run: npm run build

      - name: Create deployment package
        working-directory: ./web-app
        run: |
          mkdir -p ../deploy-package
          cp -r app components hooks lib public types package.json tsconfig.json next.config.js postcss.config.js tailwind.config.js ../deploy-package/ 2>/dev/null || true
          cd ../deploy-package
          tar czf ../web-app-deploy.tar.gz .
          cd ..

      - name: Deploy to VPS
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT || 22 }}
          source: "web-app-deploy.tar.gz"
          target: "/tmp"
          strip_components: 0

      - name: Execute deployment script on VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT || 22 }}
          script: |
            cd /var/www/ctrldespesas-web/web-app
            
            # Backup atual
            if [ -d ".next" ]; then
              echo "📦 Fazendo backup..."
              tar czf /tmp/backup-$(date +%Y%m%d-%H%M%S).tar.gz .next .env.local 2>/dev/null || true
            fi
            
            # Extrair novo código
            echo "📦 Extraindo novo código..."
            mkdir -p /tmp/deploy-extract
            tar xzf /tmp/web-app-deploy.tar.gz -C /tmp/deploy-extract
            rm -f /tmp/web-app-deploy.tar.gz
            
            # Copiar arquivos (preservando .env.local e node_modules)
            echo "📋 Copiando arquivos..."
            cp -r /tmp/deploy-extract/* .
            rm -rf /tmp/deploy-extract
            
            # Instalar dependências se necessário
            if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/next" ]; then
              echo "📦 Instalando dependências..."
              npm install
            fi
            
            # Corrigir permissões
            chmod +x node_modules/.bin/* 2>/dev/null || true
            
            # Rebuild
            echo "🔨 Fazendo build..."
            rm -rf .next node_modules/.cache
            npm run build
            
            # Verificar build
            if [ ! -f ".next/BUILD_ID" ]; then
              echo "❌ Build falhou!"
              exit 1
            fi
            
            # Reiniciar PM2
            echo "🚀 Reiniciando aplicação..."
            pm2 restart ctrldespesas-web || pm2 start npm --name "ctrldespesas-web" -- start
            pm2 save
            
            echo "✅ Deploy concluído com sucesso!"
```

---

## 📋 Checklist de Troubleshooting

- [ ] Chave SSH gerada SEM senha
- [ ] Chave pública adicionada ao `authorized_keys` na VPS
- [ ] Permissões corretas na VPS (`chmod 700 ~/.ssh`, `chmod 600 ~/.ssh/authorized_keys`)
- [ ] Chave privada completa copiada para secret `VPS_SSH_KEY`
- [ ] Secret `VPS_HOST` configurado (IP ou domínio)
- [ ] Secret `VPS_USER` configurado (geralmente `root`)
- [ ] Secret `VPS_PORT` configurado (geralmente `22`)
- [ ] Conexão SSH testada manualmente
- [ ] Workflow executado e logs verificados

---

## 🔍 Verificar Logs do GitHub Actions

1. No GitHub, vá em **Actions**
2. Clique no workflow que falhou
3. Clique no job que falhou
4. Expanda o step que deu erro
5. Veja a mensagem de erro completa

**Erros comuns nos logs:**
- `Permission denied` → Problema com chave SSH
- `Connection refused` → SSH não está rodando na VPS
- `Host key verification failed` → Problema com known_hosts
- `Too many authentication failures` → Muitas chaves tentadas

---

## 💡 Dica: Usar SSH Agent (Alternativa)

Se continuar com problemas, você pode usar SSH agent:

```yaml
- name: Setup SSH
  run: |
    eval $(ssh-agent -s)
    echo "${{ secrets.VPS_SSH_KEY }}" | ssh-add -
    mkdir -p ~/.ssh
    ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts
```

---

**✅ Siga os passos acima para resolver problemas de token/autenticação!**
