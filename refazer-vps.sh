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
