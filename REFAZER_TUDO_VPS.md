# 🔄 Refazer Tudo na VPS - Processo Limpo

Este guia mostra como **limpar completamente** e **reinstalar** a aplicação na VPS do zero, resolvendo todos os problemas acumulados.

---

## 📋 Pré-requisitos

- ✅ VPS já configurada (Node.js, PM2, Cloudflare Tunnel)
- ✅ Acesso SSH à VPS
- ✅ Script `transferir-para-vps.ps1` disponível
- ✅ Código atualizado e funcionando localmente

---

## 🚀 Passo 1: Limpar Tudo na VPS

Conecte na VPS e execute:

```bash
# Conectar na VPS
ssh root@SEU_IP_VPS
# OU
ssh appuser@SEU_IP_VPS

# Navegar até o diretório da aplicação
cd /var/www/ctrldespesas-web/web-app

# Fazer backup do .env.local (IMPORTANTE!)
cp .env.local .env.local.backup 2>/dev/null || echo "Sem .env.local para backup"

# Parar PM2
pm2 stop ctrldespesas-web 2>/dev/null || true
pm2 delete ctrldespesas-web 2>/dev/null || true

# LIMPAR TUDO (exceto .env.local)
rm -rf node_modules
rm -rf .next
rm -rf .cache
rm -rf node_modules/.cache
rm -f package-lock.json
rm -f .browserslistrc
rm -f package.json.corrompido
rm -f tsconfig.json.backup
rm -f postcss.config.js.backup

# Remover arquivos ZIP antigos
rm -f /home/appuser/web-app-*.zip 2>/dev/null || true
rm -f /root/web-app-*.zip 2>/dev/null || true

echo "✅ Limpeza concluída!"
```

---

## 🚀 Passo 2: Transferir Código Limpo do Windows

No PowerShell, na pasta `web-app`:

```powershell
# Com chave SSH (recomendado)
.\transferir-para-vps.ps1 -VpsIp "SEU_IP_VPS" -SshKeyPath "$env:USERPROFILE\.ssh\id_rsa"

# OU sem chave SSH (vai pedir senha)
.\transferir-para-vps.ps1 -VpsIp "SEU_IP_VPS"
```

**Substitua `SEU_IP_VPS` pelo IP da sua VPS.**

---

## 🚀 Passo 3: Descompactar e Preparar na VPS

Na VPS:

```bash
# Navegar até o diretório
cd /var/www/ctrldespesas-web/web-app

# Encontrar o arquivo ZIP mais recente
ZIP_FILE=$(ls -t /home/appuser/web-app-*.zip 2>/dev/null | head -1)
if [ -z "$ZIP_FILE" ]; then
    ZIP_FILE=$(ls -t /root/web-app-*.zip 2>/dev/null | head -1)
fi

if [ -z "$ZIP_FILE" ]; then
    echo "❌ Arquivo ZIP não encontrado!"
    exit 1
fi

echo "📦 Descompactando: $ZIP_FILE"

# Criar diretório temporário
mkdir -p /tmp/ctrldespesas-clean
rm -rf /tmp/ctrldespesas-clean/*

# Descompactar
unzip -q "$ZIP_FILE" -d /tmp/ctrldespesas-clean

# Copiar arquivos (preservando .env.local se existir)
cp -r /tmp/ctrldespesas-clean/web-app/* .

# Restaurar .env.local se existir backup
if [ -f .env.local.backup ]; then
    cp .env.local.backup .env.local
    echo "✅ .env.local restaurado do backup"
fi

# Limpar diretório temporário
rm -rf /tmp/ctrldespesas-clean

echo "✅ Arquivos copiados!"
```

---

## 🚀 Passo 4: Verificar Arquivos Críticos

```bash
# Verificar se package.json existe e está válido
if [ ! -f package.json ]; then
    echo "❌ package.json não encontrado!"
    exit 1
fi

# Verificar sintaxe JSON
cat package.json | python3 -m json.tool > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ package.json inválido!"
    exit 1
fi

echo "✅ package.json válido!"

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local não encontrado! Você precisa criá-lo."
    echo "Copie do .env.example ou crie manualmente."
fi

# Verificar outros arquivos importantes
ls -la tsconfig.json postcss.config.js tailwind.config.js 2>/dev/null
```

---

## 🚀 Passo 5: Instalar Dependências

```bash
# Instalar dependências (limpo)
npm install

# Verificar se instalou corretamente
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências!"
    exit 1
fi

echo "✅ Dependências instaladas!"
```

---

## 🚀 Passo 6: Fazer Build

```bash
# Limpar cache antes do build
rm -rf .next
rm -rf node_modules/.cache

# Fazer build
npm run build

# Verificar se build foi bem-sucedido
if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    echo "Verifique os erros acima."
    exit 1
fi

echo "✅ Build concluído com sucesso!"
```

---

## 🚀 Passo 7: Iniciar com PM2

```bash
# Iniciar aplicação
pm2 start npm --name "ctrldespesas-web" -- start

# Salvar configuração do PM2
pm2 save

# Verificar status
pm2 status

# Ver logs
pm2 logs ctrldespesas-web --lines 50
```

---

## 🚀 Script Completo (Copiar e Colar Tudo)

Crie um script na VPS para facilitar:

```bash
# Na VPS, criar script
nano /root/refazer-app.sh
```

Cole o seguinte conteúdo:

```bash
#!/bin/bash

set -e  # Parar em caso de erro

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="/var/www/ctrldespesas-web/web-app"

echo -e "${YELLOW}🔄 Iniciando processo completo de reinstalação...${NC}"

# Passo 1: Limpar
echo -e "${YELLOW}🧹 Limpando arquivos antigos...${NC}"
cd "$APP_DIR" || exit 1

# Backup .env.local
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    echo -e "${GREEN}✅ Backup do .env.local criado${NC}"
fi

# Parar PM2
pm2 stop ctrldespesas-web 2>/dev/null || true
pm2 delete ctrldespesas-web 2>/dev/null || true

# Limpar
rm -rf node_modules .next .cache node_modules/.cache
rm -f package-lock.json .browserslistrc
rm -f package.json.corrompido tsconfig.json.backup postcss.config.js.backup

# Passo 2: Encontrar e descompactar ZIP
echo -e "${YELLOW}📦 Procurando arquivo ZIP...${NC}"
ZIP_FILE=$(ls -t /home/appuser/web-app-*.zip /root/web-app-*.zip 2>/dev/null | head -1)

if [ -z "$ZIP_FILE" ]; then
    echo -e "${RED}❌ Arquivo ZIP não encontrado!${NC}"
    echo -e "${YELLOW}Execute primeiro: transferir-para-vps.ps1 no Windows${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Encontrado: $ZIP_FILE${NC}"

# Descompactar
mkdir -p /tmp/ctrldespesas-clean
rm -rf /tmp/ctrldespesas-clean/*
unzip -q "$ZIP_FILE" -d /tmp/ctrldespesas-clean

# Copiar arquivos
echo -e "${YELLOW}📋 Copiando arquivos...${NC}"
cp -r /tmp/ctrldespesas-clean/web-app/* .

# Restaurar .env.local
if [ -f .env.local.backup ]; then
    cp .env.local.backup .env.local
    echo -e "${GREEN}✅ .env.local restaurado${NC}"
fi

rm -rf /tmp/ctrldespesas-clean

# Passo 3: Verificar package.json
echo -e "${YELLOW}🔍 Verificando package.json...${NC}"
if ! cat package.json | python3 -m json.tool > /dev/null 2>&1; then
    echo -e "${RED}❌ package.json inválido!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ package.json válido${NC}"

# Passo 4: Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

# Passo 5: Build
echo -e "${YELLOW}🔨 Fazendo build...${NC}"
rm -rf .next node_modules/.cache
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build concluído!${NC}"

# Passo 6: Iniciar PM2
echo -e "${YELLOW}🚀 Iniciando aplicação...${NC}"
pm2 start npm --name "ctrldespesas-web" -- start
pm2 save

echo -e "${GREEN}✅ Aplicação iniciada!${NC}"
echo -e "${YELLOW}📊 Status:${NC}"
pm2 status

echo -e "${YELLOW}📋 Últimos logs:${NC}"
pm2 logs ctrldespesas-web --lines 20 --nostream
```

Tornar executável:

```bash
chmod +x /root/refazer-app.sh
```

Executar:

```bash
/root/refazer-app.sh
```

---

## 🔍 Verificar se Funcionou

### 1. Verificar Logs do PM2

```bash
pm2 logs ctrldespesas-web --lines 100
```

Procure por:
- ✅ "Compiled successfully"
- ✅ "Ready on http://localhost:3000"
- ❌ Sem erros

### 2. Verificar Status

```bash
pm2 status
```

Deve mostrar:
- Status: `online`
- Uptime: tempo rodando

### 3. Testar Aplicação

Acesse sua aplicação no navegador:
- ✅ Página carrega normalmente
- ✅ Sem erros no console (F12)

---

## 🐛 Solução de Problemas

### Erro: "package.json inválido"

```bash
# Verificar sintaxe
cat package.json | python3 -m json.tool

# Se inválido, recriar do zero (veja CORRIGIR_PACKAGE_JSON.md)
```

### Erro: "Cannot find module"

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Build failed"

```bash
# Limpar tudo e tentar novamente
rm -rf .next node_modules/.cache
npm run build
```

### Erro: ".env.local não encontrado"

```bash
# Criar .env.local baseado no .env.example
# OU restaurar do backup
cp .env.local.backup .env.local
```

---

## 📝 Checklist Completo

- [ ] Conectado na VPS via SSH
- [ ] Executado limpeza completa (Passo 1)
- [ ] Transferido código do Windows (Passo 2)
- [ ] Descompactado e copiado arquivos (Passo 3)
- [ ] Verificado package.json válido (Passo 4)
- [ ] Instalado dependências (Passo 5)
- [ ] Build concluído com sucesso (Passo 6)
- [ ] PM2 iniciado e funcionando (Passo 7)
- [ ] Logs verificados (sem erros)
- [ ] Aplicação testada no navegador

---

## 💡 Dicas

1. **Sempre faça backup do `.env.local` antes de limpar**
2. **Teste localmente antes de transferir para VPS**
3. **Use o script automatizado para facilitar**
4. **Monitore os logs após reinstalar**
5. **Mantenha o PM2 salvo**: `pm2 save`

---

**✅ Pronto!** Aplicação reinstalada do zero e funcionando!
