#!/bin/bash

# Script de configuração inicial da VPS para hospedar o web app
# Uso: bash setup-vps.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando configuração da VPS para CtrlDespesas Web App..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Por favor, execute como root ou com sudo${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Executando como root${NC}"
echo ""

# Atualizar sistema
echo -e "${YELLOW}📦 Atualizando sistema...${NC}"
apt update && apt upgrade -y

# Instalar Node.js 20.x
echo -e "${YELLOW}📦 Instalando Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verificar instalação
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
echo -e "${GREEN}✅ npm instalado: $NPM_VERSION${NC}"

# Instalar ferramentas necessárias
echo -e "${YELLOW}📦 Instalando ferramentas necessárias...${NC}"
apt install -y git build-essential curl

# Instalar PM2 globalmente
echo -e "${YELLOW}📦 Instalando PM2...${NC}"
npm install -g pm2

# Instalar Nginx
echo -e "${YELLOW}📦 Instalando Nginx...${NC}"
apt install -y nginx

# Criar usuário para aplicação
echo -e "${YELLOW}👤 Criando usuário para aplicação...${NC}"
if id "appuser" &>/dev/null; then
    echo -e "${YELLOW}⚠️  Usuário appuser já existe${NC}"
    echo -e "${YELLOW}💡 Para definir/alterar senha: sudo passwd appuser${NC}"
else
    adduser --disabled-password --gecos "" appuser
    echo -e "${GREEN}✅ Usuário appuser criado${NC}"
    echo ""
    echo -e "${YELLOW}🔐 Definindo senha para appuser...${NC}"
    echo -e "${YELLOW}   ⚠️  ATENÇÃO: Você será solicitado a digitar a senha duas vezes${NC}"
    echo -e "${YELLOW}   Digite a senha que deseja usar para o usuário appuser${NC}"
    echo ""
    passwd appuser
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Senha definida com sucesso${NC}"
    else
        echo -e "${RED}❌ Erro ao definir senha. Execute manualmente: passwd appuser${NC}"
    fi
fi

# Criar diretório da aplicação
echo -e "${YELLOW}📁 Criando diretório da aplicação...${NC}"
mkdir -p /var/www
chown -R appuser:appuser /var/www

# Configurar firewall
echo -e "${YELLOW}🔥 Configurando firewall...${NC}"
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo -e "${GREEN}✅ Firewall configurado${NC}"

# Criar template de configuração do Nginx
echo -e "${YELLOW}📝 Criando template de configuração do Nginx...${NC}"
cat > /etc/nginx/sites-available/ctrldespesas << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    client_max_body_size 10M;
}
EOF

# Habilitar site
ln -sf /etc/nginx/sites-available/ctrldespesas /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
if nginx -t; then
    echo -e "${GREEN}✅ Configuração do Nginx válida${NC}"
    systemctl reload nginx
    systemctl enable nginx
else
    echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Configuração inicial concluída!${NC}"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo "   1. Transfira o código para /var/www/ctrldespesas-web/web-app"
echo "   2. Configure o arquivo .env.local com suas variáveis de ambiente"
echo "   3. Execute: cd /var/www/ctrldespesas-web/web-app"
echo "   4. Execute: npm install"
echo "   5. Execute: npm run build"
echo "   6. Execute: pm2 start npm --name 'ctrldespesas-web' -- start"
echo "   7. Execute: pm2 save && pm2 startup"
echo ""
echo -e "${YELLOW}🔒 Para configurar SSL (HTTPS):${NC}"
echo "   apt install -y certbot python3-certbot-nginx"
echo "   certbot --nginx -d seu-dominio.com.br"
echo ""
echo -e "${GREEN}✨ Tudo pronto!${NC}"
