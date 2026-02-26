# 🚀 Como Atualizar a Aplicação na VPS

## ✅ Situação Atual

Sua aplicação está funcionando em `https://cdespesas.projmanager.com.br`! 🎉

Agora você precisa saber como atualizar quando fizer alterações no código.

---

## 🎯 Métodos de Atualização

### Método 1: Transferir Arquivos e Atualizar (Recomendado)

#### Passo 1: Fazer Alterações Localmente

1. Faça suas alterações no código
2. Teste localmente se possível

#### Passo 2: Transferir para VPS

**Opção A: Usar Script PowerShell (Mais Fácil)**

```powershell
# No Windows, dentro da pasta web-app
.\transferir-para-vps.ps1 -VpsIp "192.168.0.47" -SshKeyPath "$env:USERPROFILE\.ssh\id_rsa"
```

**Opção B: Transferir Manualmente**

```powershell
# Compactar projeto (excluindo node_modules e .next)
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
Compress-Archive -Path * -Exclude @("node_modules",".next",".git") -DestinationPath update.zip

# Transferir para VPS
scp update.zip appuser@192.168.0.47:/var/www/
```

#### Passo 3: Na VPS - Atualizar Código

```bash
# Conectar na VPS
ssh appuser@192.168.0.47

# Ir para diretório da aplicação
cd /var/www/ctrldespesas-web/web-app

# Fazer backup (opcional mas recomendado)
cp -r . ../backup-$(date +%Y%m%d-%H%M%S)

# Descompactar atualização
cd /var/www
unzip -o update.zip -d ctrldespesas-web/web-app

# OU se transferiu arquivos específicos, copie-os
# cp -r /var/www/update/* /var/www/ctrldespesas-web/web-app/
```

#### Passo 4: Instalar Dependências e Fazer Build

```bash
cd /var/www/ctrldespesas-web/web-app

# Instalar novas dependências (se houver)
npm install

# Fazer build da aplicação
npm run build
```

#### Passo 5: Reiniciar Aplicação

```bash
# Reiniciar com PM2
pm2 restart ctrldespesas-web

# Verificar status
pm2 status

# Ver logs se necessário
pm2 logs ctrldespesas-web --lines 50
```

---

### Método 2: Usar Git (Recomendado para Produção)

#### Passo 1: Configurar Git na VPS

```bash
# Na VPS, ir para diretório da aplicação
cd /var/www/ctrldespesas-web/web-app

# Se ainda não tem Git configurado:
git init
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
```

#### Passo 2: Fazer Alterações e Commit

**No seu computador:**

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
git add .
git commit -m "Descrição das alterações"
git push origin main
```

#### Passo 3: Atualizar na VPS

```bash
# Na VPS
cd /var/www/ctrldespesas-web/web-app

# Atualizar código
git pull origin main

# Instalar dependências (se necessário)
npm install

# Fazer build
npm run build

# Reiniciar aplicação
pm2 restart ctrldespesas-web
```

---

### Método 3: Script de Deploy Automático

#### Criar Script na VPS

```bash
# Criar script de deploy
nano /var/www/ctrldespesas-web/web-app/deploy.sh
```

**Conteúdo do script:**

```bash
#!/bin/bash
echo "🚀 Iniciando deploy..."

# Ir para diretório da aplicação
cd /var/www/ctrldespesas-web/web-app

# Fazer backup
echo "📦 Fazendo backup..."
BACKUP_DIR="../backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/" 2>/dev/null

# Atualizar código (se usar Git)
if [ -d ".git" ]; then
    echo "📥 Atualizando código do Git..."
    git pull origin main
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Fazer build
echo "🔨 Fazendo build..."
npm run build

# Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart ctrldespesas-web

# Verificar status
echo "✅ Verificando status..."
pm2 status

echo "✅ Deploy concluído!"
```

**Dar permissão:**

```bash
chmod +x /var/www/ctrldespesas-web/web-app/deploy.sh
```

**Usar:**

```bash
# Executar script
/var/www/ctrldespesas-web/web-app/deploy.sh

# OU se estiver no diretório:
./deploy.sh
```

---

## 📋 Checklist de Deploy

- [ ] Fiz alterações no código localmente
- [ ] Testei localmente (se possível)
- [ ] Transferi arquivos para VPS OU fiz push no Git
- [ ] Na VPS, atualizei o código
- [ ] Executei `npm install` (se houver novas dependências)
- [ ] Executei `npm run build`
- [ ] Reiniciei aplicação com `pm2 restart ctrldespesas-web`
- [ ] Verifiquei status com `pm2 status`
- [ ] Testei acesso: `https://cdespesas.projmanager.com.br`

---

## 🔄 Processo Rápido (Resumo)

### Para Atualizações Simples:

```bash
# Na VPS
cd /var/www/ctrldespesas-web/web-app
npm run build
pm2 restart ctrldespesas-web
```

### Para Atualizações com Novos Arquivos:

1. **Transferir arquivos** (via script PowerShell ou SCP)
2. **Na VPS:**
   ```bash
   cd /var/www/ctrldespesas-web/web-app
   npm install  # Se houver novas dependências
   npm run build
   pm2 restart ctrldespesas-web
   ```

---

## 🆘 Troubleshooting

### Erro: "npm: command not found"

**Solução:**
```bash
# Verificar se Node.js está instalado
node --version
npm --version

# Se não estiver, instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Erro: "Build failed"

**Solução:**
```bash
# Ver logs do build
npm run build

# Limpar cache e tentar novamente
rm -rf .next node_modules
npm install
npm run build
```

### Erro: "PM2 não encontrado"

**Solução:**
```bash
# Instalar PM2
sudo npm install -g pm2

# Reiniciar aplicação
pm2 restart ctrldespesas-web
```

### Aplicação não atualiza após deploy

**Solução:**
```bash
# Verificar se build foi feito
ls -la .next

# Verificar logs
pm2 logs ctrldespesas-web --lines 100

# Reiniciar forçadamente
pm2 delete ctrldespesas-web
pm2 start npm --name "ctrldespesas-web" -- start
```

---

## 💡 Dicas Importantes

1. **Sempre faça backup antes de atualizar:**
   ```bash
   cp -r /var/www/ctrldespesas-web/web-app /var/www/backup-$(date +%Y%m%d)
   ```

2. **Verifique variáveis de ambiente:**
   ```bash
   # Verificar .env.local
   cat /var/www/ctrldespesas-web/web-app/.env.local
   ```

3. **Monitore logs após deploy:**
   ```bash
   pm2 logs ctrldespesas-web --lines 50
   ```

4. **Teste antes de fazer deploy em produção:**
   - Teste localmente primeiro
   - Ou tenha um ambiente de staging

---

## 🎯 Comandos Rápidos

### Deploy Completo:

```bash
cd /var/www/ctrldespesas-web/web-app && \
npm install && \
npm run build && \
pm2 restart ctrldespesas-web && \
pm2 logs ctrldespesas-web --lines 20
```

### Apenas Reiniciar:

```bash
pm2 restart ctrldespesas-web
```

### Ver Status:

```bash
pm2 status
pm2 logs ctrldespesas-web
```

---

**✅ Agora você sabe como atualizar sua aplicação na VPS!**
