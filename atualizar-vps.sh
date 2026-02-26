#!/bin/bash

# Script para atualizar aplicação na VPS
# Uso: ./atualizar-vps.sh [diretorio-da-app]

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório da aplicação (padrão ou passado como argumento)
APP_DIR="${1:-/var/www/ctrldespesas-web/web-app}"

echo -e "${BLUE}🔄 Iniciando atualização da aplicação...${NC}"
echo -e "${YELLOW}📁 Diretório: $APP_DIR${NC}"

# Verificar se diretório existe
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Erro: Diretório não encontrado: $APP_DIR${NC}"
    echo -e "${YELLOW}💡 Use: ./atualizar-vps.sh /caminho/para/app${NC}"
    exit 1
fi

# Navegar até o diretório
cd "$APP_DIR" || exit 1

echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências!${NC}"
    exit 1
fi

echo -e "${YELLOW}🔨 Fazendo build da aplicação...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
    
    echo -e "${YELLOW}🔄 Reiniciando aplicação com PM2...${NC}"
    
    # Tentar reiniciar com diferentes nomes possíveis
    if pm2 restart ctrldespesas-web 2>/dev/null; then
        echo -e "${GREEN}✅ Aplicação 'ctrldespesas-web' reiniciada!${NC}"
    elif pm2 restart all 2>/dev/null; then
        echo -e "${GREEN}✅ Todas as aplicações PM2 reiniciadas!${NC}"
    else
        echo -e "${YELLOW}⚠️  PM2 não encontrado ou aplicação não está rodando${NC}"
        echo -e "${YELLOW}💡 Inicie manualmente com: pm2 start npm --name 'ctrldespesas-web' -- start${NC}"
    fi
    
    echo -e "${BLUE}📊 Status do PM2:${NC}"
    pm2 status
    
    echo -e "${GREEN}✅ Atualização concluída!${NC}"
    echo -e "${YELLOW}💡 Verifique os logs com: pm2 logs ctrldespesas-web${NC}"
else
    echo -e "${RED}❌ Erro no build! Verifique os logs acima.${NC}"
    exit 1
fi
