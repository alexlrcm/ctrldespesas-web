#!/bin/bash

set -e

APP_DIR="/var/www/ctrldespesas-web/web-app"
cd "$APP_DIR" || exit 1

echo "🔄 Verificando build..."

# Parar PM2
pm2 stop ctrldespesas-web 2>/dev/null || true
pm2 delete ctrldespesas-web 2>/dev/null || true

# Verificar se precisa fazer build
NEED_BUILD=false

if [ ! -d ".next" ]; then
    echo "❌ Diretório .next não existe"
    NEED_BUILD=true
elif [ ! -f ".next/BUILD_ID" ]; then
    echo "❌ BUILD_ID não encontrado"
    NEED_BUILD=true
else
    BUILD_ID=$(cat .next/BUILD_ID 2>/dev/null)
    if [ -z "$BUILD_ID" ]; then
        echo "❌ BUILD_ID vazio"
        NEED_BUILD=true
    else
        echo "✅ Build existe (ID: $BUILD_ID)"
    fi
fi

# Fazer build se necessário
if [ "$NEED_BUILD" = true ]; then
    echo "🔨 Executando build..."
    rm -rf .next node_modules/.cache
    
    # Verificar se package.json está válido
    if ! cat package.json | python3 -m json.tool > /dev/null 2>&1; then
        echo "❌ package.json inválido!"
        exit 1
    fi
    
    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependências..."
        npm install
    fi
    
    npm run build
    
    # Verificar novamente
    if [ ! -f ".next/BUILD_ID" ]; then
        echo "❌ Build falhou!"
        echo "📋 Últimos erros:"
        tail -50 .next/trace 2>/dev/null || echo "Sem arquivo de trace"
        exit 1
    fi
    
    BUILD_ID=$(cat .next/BUILD_ID)
    echo "✅ Build concluído (ID: $BUILD_ID)"
fi

# Iniciar PM2
echo "🚀 Iniciando aplicação..."
pm2 start npm --name "ctrldespesas-web" -- start
pm2 save

echo "✅ Aplicação iniciada!"
echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "📋 Últimos logs (aguarde 3 segundos...):"
sleep 3
pm2 logs ctrldespesas-web --lines 30 --nostream
