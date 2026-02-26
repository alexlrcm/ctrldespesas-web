#!/bin/bash

set -e

echo "🔄 Iniciando reinstalação completa..."

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

APP_DIR="/var/www/ctrldespesas-web/web-app"

# Passo 1: Limpar
echo -e "${YELLOW}🧹 Limpando instalação anterior...${NC}"
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
rm -rf "$APP_DIR"
rm -f /home/appuser/web-app-*.zip /root/web-app-*.zip 2>/dev/null || true

# Passo 2: Verificar Node.js
echo -e "${YELLOW}📦 Verificando Node.js...${NC}"
if ! command -v node &> /dev/null || [ "$(node --version | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    echo -e "${YELLOW}Instalando Node.js 20...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Passo 3: Instalar PM2
echo -e "${YELLOW}📦 Instalando PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
echo -e "${GREEN}✅ PM2 $(pm2 --version)${NC}"

# Passo 4: Criar diretório
echo -e "${YELLOW}📁 Criando diretório...${NC}"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Passo 5: Encontrar e descompactar ZIP
echo -e "${YELLOW}📦 Procurando arquivo ZIP...${NC}"
ZIP_FILE=$(ls -t /home/appuser/web-app-*.zip /root/web-app-*.zip 2>/dev/null | head -1)

if [ -z "$ZIP_FILE" ]; then
    echo -e "${RED}❌ Arquivo ZIP não encontrado!${NC}"
    echo -e "${YELLOW}Execute primeiro: transferir-para-vps.ps1 no Windows${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Encontrado: $ZIP_FILE${NC}"

# Descompactar em diretório temporário
TMP_DIR="/tmp/ctrldespesas-install"
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"

unzip -q "$ZIP_FILE" -d "$TMP_DIR"

# Verificar estrutura e copiar arquivos
if [ -d "$TMP_DIR/web-app" ]; then
    echo -e "${GREEN}✅ Estrutura encontrada: web-app/${NC}"
    cp -r "$TMP_DIR/web-app"/* .
elif [ -f "$TMP_DIR/package.json" ]; then
    echo -e "${GREEN}✅ Arquivos na raiz do ZIP${NC}"
    cp -r "$TMP_DIR"/* .
else
    echo -e "${YELLOW}⚠️  Estrutura não reconhecida - copiando tudo...${NC}"
    cp -r "$TMP_DIR"/* .
fi

rm -rf "$TMP_DIR"

# Passo 6: Criar .env.local
echo -e "${YELLOW}📝 Criando .env.local...${NC}"
cat > .env.local << 'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972931672046
NEXT_PUBLIC_FIREBASE_APP_ID=1:972931672046:web:0d02d9c8e72caca6e0d0ff
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DOMAIN=projmanager.com.br
NEXT_PUBLIC_FILE_RETENTION_DAYS=90
EOF

# Passo 7: Limpar arquivos problemáticos
echo -e "${YELLOW}🧹 Limpando arquivos problemáticos...${NC}"
rm -f .browserslistrc
unset BASEDIR BROWSERSLIST_BASEDIR BROWSERSLIST_ENV BROWSERSLIST_CONFIG BROWSERSLIST

# Passo 8: Verificar package.json
echo -e "${YELLOW}🔍 Verificando package.json...${NC}"
if [ ! -f package.json ]; then
    echo -e "${RED}❌ package.json não encontrado! Recriando...${NC}"
    cat > package.json << 'PKGEOF'
{
  "name": "ctrldespesas-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "date-fns": "^3.3.1",
    "firebase": "^10.14.1",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.3",
    "lucide-react": "^0.344.0",
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.51.0",
    "react-toastify": "^10.0.5",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.2.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
PKGEOF
    echo -e "${GREEN}✅ package.json recriado!${NC}"
elif ! cat package.json | python3 -m json.tool > /dev/null 2>&1; then
    echo -e "${RED}❌ package.json inválido! Recriando...${NC}"
    cat > package.json << 'PKGEOF'
{
  "name": "ctrldespesas-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "date-fns": "^3.3.1",
    "firebase": "^10.14.1",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.3",
    "lucide-react": "^0.344.0",
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.51.0",
    "react-toastify": "^10.0.5",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.2.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
PKGEOF
    echo -e "${GREEN}✅ package.json recriado!${NC}"
else
    echo -e "${GREEN}✅ package.json válido!${NC}"
fi

# Verificar e recriar outros arquivos críticos se necessário
if [ ! -f postcss.config.js ]; then
    echo -e "${YELLOW}⚠️  postcss.config.js não encontrado - recriando...${NC}"
    cat > postcss.config.js << 'POSTCSSEOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
POSTCSSEOF
fi

if [ ! -f tailwind.config.js ]; then
    echo -e "${YELLOW}⚠️  tailwind.config.js não encontrado - recriando...${NC}"
    cat > tailwind.config.js << 'TAILEOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
TAILEOF
fi

# Passo 9: Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

# Passo 10: Verificar next.config.js antes do build
echo -e "${YELLOW}🔍 Verificando next.config.js...${NC}"
if [ ! -f next.config.js ]; then
    echo -e "${YELLOW}⚠️  next.config.js não encontrado - criando...${NC}"
    cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
}

module.exports = nextConfig
EOF
fi

# Remover arquivos problemáticos em /var/www/
rm -f /var/www/package.json /var/www/next.config.js 2>/dev/null || true

# Remover "type": "module" do package.json se existir
if grep -q '"type": "module"' package.json 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Removendo 'type: module' do package.json...${NC}"
    python3 << 'PYTHON'
import json
with open('package.json', 'r') as f:
    data = json.load(f)
if 'type' in data:
    del data['type']
with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)
PYTHON
fi

# Passo 11: Build
echo -e "${YELLOW}🔨 Fazendo build...${NC}"
rm -rf .next node_modules/.cache

# Corrigir permissões dos executáveis
echo -e "${YELLOW}🔧 Corrigindo permissões dos executáveis...${NC}"
chmod +x node_modules/.bin/* 2>/dev/null || true

# Verificar se next está acessível
if [ ! -x node_modules/.bin/next ]; then
    echo -e "${YELLOW}⚠️  next não tem permissão - corrigindo...${NC}"
    chmod +x node_modules/.bin/next
fi

npm run build

if [ ! -f ".next/BUILD_ID" ]; then
    echo -e "${RED}❌ Build falhou!${NC}"
    exit 1
fi

BUILD_ID=$(cat .next/BUILD_ID)
echo -e "${GREEN}✅ Build concluído (ID: $BUILD_ID)${NC}"

# Passo 12: Iniciar PM2
echo -e "${YELLOW}🚀 Iniciando aplicação...${NC}"
pm2 start npm --name "ctrldespesas-web" -- start
pm2 save

echo -e "${GREEN}✅ Aplicação iniciada!${NC}"
echo ""
echo -e "${YELLOW}📊 Status:${NC}"
pm2 status

echo ""
echo -e "${YELLOW}📋 Últimos logs:${NC}"
sleep 3
pm2 logs ctrldespesas-web --lines 30 --nostream
