#!/bin/bash

set -e

cd /var/www/ctrldespesas-web/web-app || exit 1

echo "🧹 Limpando variáveis de ambiente problemáticas..."

# Remover variáveis de ambiente
unset BASEDIR
unset BROWSERSLIST_BASEDIR
unset BROWSERSLIST_ENV
unset BROWSERSLIST_CONFIG
unset BROWSERSLIST

# Verificar
echo "📋 Variáveis de ambiente relacionadas ao Browserslist:"
env | grep -i browser || echo "✅ Nenhuma encontrada"

# Remover arquivos de configuração
echo "🗑️  Removendo arquivos de configuração..."
rm -f .browserslistrc

# Verificar package.json
echo "🔍 Verificando package.json..."
if grep -q '"browserslist"' package.json; then
    echo "⚠️  package.json contém 'browserslist' - removendo..."
    # Criar package.json sem browserslist usando Python
    python3 << 'PYTHON'
import json
import sys

try:
    with open('package.json', 'r') as f:
        data = json.load(f)
    
    if 'browserslist' in data:
        del data['browserslist']
        print("✅ Removendo 'browserslist' do package.json")
    
    with open('package.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print("✅ package.json atualizado")
except Exception as e:
    print(f"❌ Erro ao processar package.json: {e}")
    sys.exit(1)
PYTHON
else
    echo "✅ package.json OK (sem browserslist)"
fi

# Verificar se package.json está válido
echo "🔍 Validando package.json..."
if ! cat package.json | python3 -m json.tool > /dev/null 2>&1; then
    echo "❌ package.json inválido!"
    exit 1
fi
echo "✅ package.json válido"

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf .next node_modules/.cache

# Fazer build
echo "🔨 Executando build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Verificar BUILD_ID
    if [ -f ".next/BUILD_ID" ]; then
        BUILD_ID=$(cat .next/BUILD_ID)
        echo "✅ BUILD_ID: $BUILD_ID"
        
        # Iniciar PM2
        echo "🚀 Iniciando aplicação..."
        pm2 stop ctrldespesas-web 2>/dev/null || true
        pm2 delete ctrldespesas-web 2>/dev/null || true
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
    else
        echo "❌ BUILD_ID não encontrado após build!"
        exit 1
    fi
else
    echo "❌ Build falhou!"
    exit 1
fi
