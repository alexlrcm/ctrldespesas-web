# 🚀 Deploy Automatizado com GitHub Actions

Este guia mostra como configurar deploy automático para a VPS usando GitHub Actions. Após configurado, cada push para `main` ou `master` fará deploy automático!

---

## 📋 Pré-requisitos

- ✅ Repositório GitHub criado
- ✅ Código já commitado no GitHub
- ✅ VPS configurada e funcionando
- ✅ Acesso SSH à VPS
- ✅ Chave SSH configurada

---

## 🔧 Passo 1: Criar Workflow do GitHub Actions

O arquivo `.github/workflows/deploy-vps.yml` já foi criado. Ele contém:

- ✅ Build automático do Next.js
- ✅ Criação de pacote de deploy
- ✅ Transferência para VPS via SCP
- ✅ Execução de script de deploy na VPS
- ✅ Reinicialização automática do PM2

---

## 🔐 Passo 2: Configurar Secrets no GitHub

No GitHub, vá em: **Settings → Secrets and variables → Actions → New repository secret**

Adicione os seguintes secrets:

### Secrets Obrigatórios da VPS:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `VPS_HOST` | `seu-ip-vps` | IP ou domínio da VPS |
| `VPS_USER` | `root` | Usuário SSH da VPS |
| `VPS_SSH_KEY` | Conteúdo da chave privada SSH | Chave SSH privada (sem senha) |
| `VPS_PORT` | `22` | Porta SSH (opcional, padrão 22) |

### Secrets do Firebase (Variáveis de Ambiente):

| Nome | Valor | Descrição |
|------|-------|-----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0` | API Key do Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `controle-de-despesas-78687.firebaseapp.com` | Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `controle-de-despesas-78687` | Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `controle-de-despesas-78687.firebasestorage.app` | Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `972931672046` | Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:972931672046:web:0d02d9c8e72caca6e0d0ff` | App ID |

### Secrets de Configuração da Aplicação:

| Nome | Valor | Descrição |
|------|-------|-----------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | URL da aplicação |
| `NEXT_PUBLIC_DOMAIN` | `projmanager.com.br` | Domínio da aplicação |
| `NEXT_PUBLIC_FILE_RETENTION_DAYS` | `90` | Dias de retenção de arquivos |

---

## 🔑 Passo 3: Obter Chave SSH Privada

### Opção A: Usar Chave Existente

Se você já tem uma chave SSH configurada:

```powershell
# No Windows PowerShell
type $env:USERPROFILE\.ssh\id_rsa
```

Copie TODO o conteúdo (incluindo `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`).

### Opção B: Criar Nova Chave SSH (Recomendado)

```bash
# Na VPS, criar chave dedicada para GitHub Actions
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions -N ""

# Mostrar chave pública
cat ~/.ssh/github_actions.pub

# Adicionar ao authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
```

Depois, copie a chave privada:

```bash
cat ~/.ssh/github_actions
```

**⚠️ IMPORTANTE:** Copie a chave PRIVADA (não a pública) para o secret `VPS_SSH_KEY` no GitHub.

---

## 📝 Passo 4: Criar Script de Deploy na VPS (Opcional)

Crie um script na VPS para facilitar o deploy manual também:

```bash
# Na VPS
nano /root/deploy-from-github.sh
```

Cole o seguinte conteúdo:

```bash
#!/bin/bash

set -e

APP_DIR="/var/www/ctrldespesas-web/web-app"
DEPLOY_FILE="/tmp/web-app-deploy.tar.gz"

if [ ! -f "$DEPLOY_FILE" ]; then
    echo "❌ Arquivo de deploy não encontrado: $DEPLOY_FILE"
    exit 1
fi

cd "$APP_DIR"

# Backup
if [ -d ".next" ]; then
    echo "📦 Fazendo backup..."
    tar czf /tmp/backup-$(date +%Y%m%d-%H%M%S).tar.gz .next .env.local 2>/dev/null || true
fi

# Extrair
echo "📦 Extraindo novo código..."
mkdir -p /tmp/deploy-extract
tar xzf "$DEPLOY_FILE" -C /tmp/deploy-extract
rm -f "$DEPLOY_FILE"

# Copiar arquivos
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

Tornar executável:

```bash
chmod +x /root/deploy-from-github.sh
```

---

## 🚀 Passo 5: Testar Deploy

### Opção A: Push para Trigger Automático

```bash
# No seu repositório local
git add .
git commit -m "Configurar deploy automático"
git push origin main
```

O GitHub Actions executará automaticamente!

### Opção B: Executar Manualmente

No GitHub:
1. Vá em **Actions**
2. Selecione o workflow **Deploy to VPS**
3. Clique em **Run workflow**
4. Selecione a branch e clique em **Run workflow**

---

## 🔍 Verificar Deploy

### No GitHub Actions

1. Vá em **Actions** no GitHub
2. Clique no workflow mais recente
3. Verifique os logs de cada step

### Na VPS

```bash
# Verificar logs do PM2
pm2 logs ctrldespesas-web --lines 50

# Verificar status
pm2 status

# Verificar se aplicação está rodando
curl http://localhost:3000
```

---

## 🐛 Solução de Problemas

### Erro: "Permission denied" no SSH

**Solução:** Verifique se a chave SSH está correta e tem permissões adequadas na VPS:

```bash
# Na VPS
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Erro: "Build failed"

**Solução:** Verifique se todos os secrets do Firebase estão configurados corretamente no GitHub.

### Erro: "PM2 not found"

**Solução:** Instale PM2 na VPS:

```bash
npm install -g pm2
pm2 startup systemd -u root --hp /root
```

### Erro: "Cannot find module"

**Solução:** O script de deploy já instala dependências automaticamente. Se persistir, verifique os logs do GitHub Actions.

---

## 📊 Monitoramento

### Ver Histórico de Deploys

No GitHub:
- **Actions** → Veja todos os deploys executados
- Clique em um deploy para ver logs detalhados

### Notificações (Opcional)

Configure notificações no GitHub:
- **Settings → Notifications → Actions**
- Escolha como quer ser notificado (email, etc.)

---

## 🔄 Fluxo de Trabalho

1. **Desenvolver localmente**
2. **Commit e push para GitHub**
3. **GitHub Actions executa automaticamente:**
   - Build da aplicação
   - Criação do pacote
   - Deploy para VPS
   - Reinicialização do PM2
4. **Aplicação atualizada automaticamente!**

---

## ✅ Vantagens do Deploy Automatizado

- ✅ **Sem erros manuais:** Tudo automatizado
- ✅ **Rápido:** Deploy em minutos
- ✅ **Rastreável:** Histórico completo no GitHub
- ✅ **Seguro:** Secrets protegidos no GitHub
- ✅ **Rollback fácil:** Voltar para commit anterior
- ✅ **Notificações:** Saber quando deploy falha

---

## 📝 Checklist de Configuração

- [ ] Repositório GitHub criado
- [ ] Código commitado no GitHub
- [ ] Arquivo `.github/workflows/deploy-vps.yml` criado
- [ ] Secrets da VPS configurados (`VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`)
- [ ] Secrets do Firebase configurados
- [ ] Secrets de configuração da aplicação configurados
- [ ] Chave SSH testada manualmente
- [ ] Primeiro deploy executado com sucesso
- [ ] Aplicação funcionando após deploy

---

**✅ Pronto! Agora cada push para `main` fará deploy automático para a VPS!**
