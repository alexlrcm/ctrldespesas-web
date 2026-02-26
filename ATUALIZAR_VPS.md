# 🔄 Guia Rápido: Atualizar Sistema na VPS

Este guia mostra como atualizar o sistema na VPS após fazer alterações no código local.

---

## 📋 Pré-requisitos

- ✅ VPS já configurada e funcionando
- ✅ Acesso SSH à VPS
- ✅ Script `transferir-para-vps.ps1` disponível
- ✅ Aplicação rodando com PM2

---

## 🚀 Opção 1: Atualização Rápida (Recomendada)

### Passo 1: Transferir Código Atualizado

No PowerShell, na pasta `web-app`:

```powershell
# Com chave SSH (sem senha)
.\transferir-para-vps.ps1 -VpsIp "SEU_IP_VPS" -SshKeyPath "$env:USERPROFILE\.ssh\id_rsa"

# OU sem chave SSH (vai pedir senha)
.\transferir-para-vps.ps1 -VpsIp "SEU_IP_VPS"
```

**Substitua `SEU_IP_VPS` pelo IP da sua VPS.**

### Passo 2: Conectar na VPS e Atualizar

```bash
# Conectar na VPS
ssh appuser@SEU_IP_VPS

# Navegar até o diretório da aplicação
cd /var/www/ctrldespesas-web/web-app

# OU se estiver em outro local:
cd ~/ctrldespesas-web/web-app
```

### Passo 3: Descompactar e Atualizar

```bash
# Descompactar o novo arquivo ZIP (substitua pelo nome do arquivo transferido)
unzip -o web-app-*.zip -d /tmp/ctrldespesas-update

# Copiar arquivos atualizados (preservando .env.local)
cp -r /tmp/ctrldespesas-update/web-app/* .

# OU se o ZIP foi descompactado diretamente:
# unzip -o web-app-*.zip -d .
```

### Passo 4: Instalar Dependências e Fazer Build

```bash
# Instalar novas dependências (se houver)
npm install

# Fazer build da aplicação
npm run build
```

### Passo 5: Reiniciar Aplicação com PM2

```bash
# Reiniciar aplicação (preserva configurações do PM2)
pm2 restart ctrldespesas-web

# OU se o nome for diferente:
pm2 restart all

# Verificar status
pm2 status
pm2 logs ctrldespesas-web --lines 50
```

---

## 🔄 Opção 2: Script Automatizado na VPS

Crie um script na VPS para facilitar atualizações futuras:

### Criar Script de Atualização

```bash
# Na VPS, criar arquivo de atualização
nano ~/atualizar-app.sh
```

Cole o seguinte conteúdo:

```bash
#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Iniciando atualização da aplicação...${NC}"

# Diretório da aplicação (ajuste se necessário)
APP_DIR="/var/www/ctrldespesas-web/web-app"
cd "$APP_DIR" || exit 1

echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

echo -e "${YELLOW}🔨 Fazendo build...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
    
    echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
    pm2 restart ctrldespesas-web
    
    echo -e "${GREEN}✅ Aplicação atualizada e reiniciada!${NC}"
    echo -e "${YELLOW}📊 Status:${NC}"
    pm2 status
else
    echo -e "${RED}❌ Erro no build! Verifique os logs acima.${NC}"
    exit 1
fi
```

Tornar executável:

```bash
chmod +x ~/atualizar-app.sh
```

### Usar o Script

```bash
# Executar script de atualização
~/atualizar-app.sh
```

---

## 🔄 Opção 3: Atualização via Git (Se usar Git na VPS)

Se você usa Git na VPS para controlar versões:

```bash
# Conectar na VPS
ssh appuser@SEU_IP_VPS

# Navegar até o diretório
cd /var/www/ctrldespesas-web/web-app

# Atualizar código do repositório
git pull origin main

# Instalar dependências e fazer build
npm install
npm run build

# Reiniciar PM2
pm2 restart ctrldespesas-web
```

---

## ⚠️ Importante: Preservar Configurações

### Arquivos que NÃO devem ser sobrescritos:

- ✅ `.env.local` - Variáveis de ambiente
- ✅ `pm2.config.js` - Configurações do PM2 (se existir)
- ✅ Arquivos de log

### Antes de atualizar, faça backup:

```bash
# Na VPS, fazer backup do .env.local
cp .env.local .env.local.backup

# Após atualizar, restaurar se necessário
# cp .env.local.backup .env.local
```

---

## 🔍 Verificar se Atualização Funcionou

### 1. Verificar Logs do PM2

```bash
pm2 logs ctrldespesas-web --lines 100
```

Procure por:
- ✅ "Compiled successfully"
- ✅ "Ready on http://localhost:3000"
- ❌ Erros de compilação ou runtime

### 2. Verificar Status do PM2

```bash
pm2 status
```

Deve mostrar:
- Status: `online`
- Uptime: tempo rodando
- CPU/Memory: uso normal

### 3. Testar Aplicação

Acesse sua aplicação no navegador e verifique:
- ✅ Página carrega normalmente
- ✅ Funcionalidades novas estão presentes
- ✅ Sem erros no console (F12)

---

## 🐛 Solução de Problemas

### Erro: "Cannot find module"

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart ctrldespesas-web
```

### Erro: "Port 3000 already in use"

```bash
# Verificar processos usando a porta
sudo lsof -i :3000

# Parar PM2 e reiniciar
pm2 stop ctrldespesas-web
pm2 restart ctrldespesas-web
```

### Build falha

```bash
# Limpar cache e rebuild
rm -rf .next
npm run build
```

### Aplicação não atualiza

```bash
# Limpar cache do Next.js e rebuild
rm -rf .next node_modules/.cache
npm run build
pm2 restart ctrldespesas-web
```

---

## 📝 Checklist de Atualização

- [ ] Código atualizado localmente
- [ ] Testado localmente (`npm run dev`)
- [ ] Arquivo ZIP transferido para VPS
- [ ] Conectado na VPS via SSH
- [ ] Arquivos descompactados
- [ ] `.env.local` preservado
- [ ] `npm install` executado
- [ ] `npm run build` executado com sucesso
- [ ] PM2 reiniciado
- [ ] Logs verificados (sem erros)
- [ ] Aplicação testada no navegador

---

## 💡 Dicas

1. **Sempre teste localmente antes de atualizar na VPS**
2. **Faça backup do `.env.local` antes de atualizar**
3. **Use o script de atualização para facilitar**
4. **Monitore os logs após atualizar**
5. **Mantenha o PM2 salvo**: `pm2 save` após configurar

---

## 🚨 Rollback (Voltar Versão Anterior)

Se algo der errado:

```bash
# Na VPS, restaurar versão anterior do código
cd /var/www/ctrldespesas-web/web-app
git checkout HEAD~1  # Se usar Git

# OU restaurar do backup
# (se você fez backup antes)

# Rebuild e restart
npm run build
pm2 restart ctrldespesas-web
```

---

**✅ Pronto!** Sua aplicação está atualizada na VPS.
