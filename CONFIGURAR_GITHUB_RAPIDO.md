# ⚡ Configurar GitHub Actions - Guia Rápido

## 🚀 Passo a Passo Rápido

### Passo 1: Gerar Chave SSH na VPS (SEM SENHA)

```bash
# Conectar na VPS
ssh root@SEU_IP_VPS

# Gerar chave SSH (IMPORTANTE: pressione ENTER quando pedir senha - deixe vazio!)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions -N ""

# Adicionar chave pública ao authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Corrigir permissões
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions

# Mostrar chave privada (copie TODO o conteúdo)
cat ~/.ssh/github_actions
```

**⚠️ IMPORTANTE:** Copie TODO o conteúdo da chave privada, incluindo:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

---

### Passo 2: Adicionar Secrets no GitHub

1. No GitHub, vá em: **Settings → Secrets and variables → Actions**
2. Clique em **New repository secret**

Adicione estes secrets (um por vez):

#### Secrets da VPS:

| Nome | Valor | Exemplo |
|------|-------|---------|
| `VPS_HOST` | IP da VPS | `192.168.1.100` |
| `VPS_USER` | Usuário SSH | `root` |
| `VPS_SSH_KEY` | Chave privada completa | (cole todo o conteúdo copiado) |
| `VPS_PORT` | Porta SSH | `22` |

#### Secrets do Firebase:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `controle-de-despesas-78687.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `controle-de-despesas-78687` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `controle-de-despesas-78687.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `972931672046` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:972931672046:web:0d02d9c8e72caca6e0d0ff` |

#### Secrets de Configuração:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_DOMAIN` | `projmanager.com.br` |
| `NEXT_PUBLIC_FILE_RETENTION_DAYS` | `90` |

---

### Passo 3: Testar Conexão SSH

```bash
# Na sua máquina local, testar conexão
ssh -i ~/.ssh/github_actions root@SEU_IP_VPS

# Se conectar sem pedir senha, está funcionando!
```

---

### Passo 4: Fazer Primeiro Deploy

#### Opção A: Push para Trigger Automático

```bash
# No seu repositório local
git add .
git commit -m "Configurar deploy automático"
git push origin main
```

#### Opção B: Executar Manualmente

1. No GitHub, vá em **Actions**
2. Selecione **Deploy to VPS**
3. Clique em **Run workflow**
4. Selecione branch `main` e clique em **Run workflow**

---

## 🔍 Verificar se Funcionou

### No GitHub Actions:

1. Vá em **Actions**
2. Clique no workflow mais recente
3. Verifique se todos os steps estão ✅ verdes

### Na VPS:

```bash
# Verificar se aplicação foi atualizada
cd /var/www/ctrldespesas-web/web-app
ls -la app/

# Verificar logs do PM2
pm2 logs ctrldespesas-web --lines 50

# Verificar status
pm2 status
```

---

## 🐛 Problemas Comuns

### Erro: "Permission denied"

**Solução:**
```bash
# Na VPS, verificar permissões
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions
```

### Erro: "Host key verification failed"

**Solução:** O workflow já adiciona automaticamente. Se persistir, verifique se `VPS_HOST` está correto.

### Erro: "Connection refused"

**Solução:**
```bash
# Na VPS, verificar se SSH está rodando
systemctl status ssh
# OU
systemctl status sshd

# Se não estiver:
systemctl start ssh
systemctl enable ssh
```

### Erro: "Too many authentication failures"

**Solução:** Use apenas uma chave SSH. Remova outras chaves do `authorized_keys` se necessário.

---

## ✅ Checklist Rápido

- [ ] Chave SSH gerada na VPS (SEM senha)
- [ ] Chave pública adicionada ao `authorized_keys`
- [ ] Permissões corretas na VPS
- [ ] Chave privada copiada para secret `VPS_SSH_KEY`
- [ ] Todos os secrets configurados no GitHub
- [ ] Conexão SSH testada manualmente
- [ ] Workflow executado com sucesso

---

## 💡 Dica: Verificar Secret

Para verificar se o secret está correto:

1. No GitHub, vá em **Settings → Secrets and variables → Actions**
2. Clique no secret `VPS_SSH_KEY`
3. Verifique se começa com `-----BEGIN OPENSSH PRIVATE KEY-----`
4. Verifique se termina com `-----END OPENSSH PRIVATE KEY-----`

**⚠️ NÃO deve ter espaços extras no início ou fim!**

---

**✅ Siga estes passos e o deploy automático funcionará!**
