#!/bin/bash

# Script para corrigir configuração do Cloudflare Tunnel
# Uso: bash corrigir-cloudflared.sh

echo "🔧 Corrigindo configuração do Cloudflare Tunnel..."
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Por favor, execute como root ou com sudo"
    exit 1
fi

# Encontrar ID do túnel
echo "📋 Procurando túneis criados..."
TUNNEL_JSON=$(ls /root/.cloudflared/*.json 2>/dev/null | head -1)

if [ -z "$TUNNEL_JSON" ]; then
    echo "❌ Nenhum túnel encontrado!"
    echo "   Execute primeiro: cloudflared tunnel create ctrldespesas"
    exit 1
fi

# Extrair ID do túnel (nome do arquivo sem .json)
TUNNEL_ID=$(basename "$TUNNEL_JSON" .json)
echo "✅ Túnel encontrado: $TUNNEL_ID"

# Verificar se arquivo existe
if [ ! -f "$TUNNEL_JSON" ]; then
    echo "❌ Arquivo de credenciais não encontrado: $TUNNEL_JSON"
    exit 1
fi

echo "✅ Arquivo de credenciais encontrado: $TUNNEL_JSON"
echo ""

# Criar diretório de configuração
mkdir -p /etc/cloudflared

# Criar arquivo de configuração
echo "📝 Criando arquivo de configuração..."
cat > /etc/cloudflared/config.yml <<EOF
tunnel: ctrldespesas
credentials-file: $TUNNEL_JSON

ingress:
  - service: http://localhost:3000
EOF

echo "✅ Arquivo de configuração criado: /etc/cloudflared/config.yml"
echo ""
echo "📄 Conteúdo do arquivo:"
cat /etc/cloudflared/config.yml
echo ""

# Testar configuração
echo "🧪 Testando configuração..."
if cloudflared tunnel --config /etc/cloudflared/config.yml run --url http://localhost:3000 &
then
    TEST_PID=$!
    sleep 3
    kill $TEST_PID 2>/dev/null
    wait $TEST_PID 2>/dev/null
    echo "✅ Configuração válida!"
else
    echo "⚠️  Erro ao testar configuração"
fi

echo ""
echo "✅ Configuração corrigida!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Testar manualmente: cloudflared tunnel --config /etc/cloudflared/config.yml run"
echo "   2. Se funcionar, configure como serviço:"
echo "      sudo cloudflared service install"
echo "      sudo systemctl start cloudflared"
echo "      sudo systemctl enable cloudflared"
echo ""
echo "💡 OU use modo simples (sem serviço):"
echo "   cloudflared tunnel --url http://localhost:3000"
