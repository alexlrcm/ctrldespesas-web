# 🔧 Solução: Browserslist - Variáveis de Ambiente Inválidas

## Problema

O erro mostra que uma variável de ambiente está sendo interpretada como query do Browserslist:

**Erro:** `Unknown browser query 'basedir=$(dirname "$(echo "$0" | sed -e 's'`

Isso indica que variáveis como `BASEDIR`, `BROWSERSLIST_BASEDIR`, ou `BROWSERSLIST_ENV` estão configuradas incorretamente.

---

## ✅ Solução Rápida

Execute na VPS:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Limpar TODAS as variáveis de ambiente problemáticas
unset BASEDIR
unset BROWSERSLIST_BASEDIR
unset BROWSERSLIST_ENV
unset BROWSERSLIST_CONFIG
unset BROWSERSLIST

# 2. Verificar se foram removidas
env | grep -i browser || echo "✅ Nenhuma variável Browserslist encontrada"

# 3. Remover .browserslistrc se existir
rm -f .browserslistrc

# 4. Verificar package.json não tem browserslist
grep -q '"browserslist"' package.json && echo "⚠️  package.json tem browserslist" || echo "✅ package.json OK"

# 5. Limpar cache
rm -rf .next node_modules/.cache

# 6. Fazer build
npm run build
```

---

## 🚀 Script Completo de Correção

```bash
#!/bin/bash

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
    # Criar package.json sem browserslist
    cat package.json | python3 -c "import sys, json; data=json.load(sys.stdin); data.pop('browserslist', None); print(json.dumps(data, indent=2))" > package.json.tmp
    mv package.json.tmp package.json
    echo "✅ Removido do package.json"
fi

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
        pm2 status
    else
        echo "❌ BUILD_ID não encontrado após build!"
    fi
else
    echo "❌ Build falhou!"
    exit 1
fi
```

---

## 🔍 Diagnóstico Completo

Execute para ver todas as variáveis problemáticas:

```bash
cd /var/www/ctrldespesas-web/web-app

echo "=== DIAGNÓSTICO VARIÁVEIS DE AMBIENTE ==="
echo ""
echo "Variáveis relacionadas ao Browserslist:"
env | grep -i browser
echo ""

echo "Variável BASEDIR:"
echo "BASEDIR=${BASEDIR:-não definida}"
echo ""

echo "Variável BROWSERSLIST_BASEDIR:"
echo "BROWSERSLIST_BASEDIR=${BROWSERSLIST_BASEDIR:-não definida}"
echo ""

echo "Arquivo .browserslistrc existe?"
[ -f .browserslistrc ] && echo "✅ Sim (conteúdo abaixo)" && cat .browserslistrc || echo "❌ Não"
echo ""

echo "package.json tem browserslist?"
grep -q '"browserslist"' package.json && echo "✅ Sim" && grep -A 10 '"browserslist"' package.json || echo "❌ Não"
```

---

## 🚨 Solução Definitiva: Limpar Ambiente e Rebuild

Execute este script completo:

```bash
cd /var/www/ctrldespesas-web/web-app && \
unset BASEDIR BROWSERSLIST_BASEDIR BROWSERSLIST_ENV BROWSERSLIST_CONFIG BROWSERSLIST && \
rm -f .browserslistrc && \
if grep -q '"browserslist"' package.json; then \
    cat package.json | python3 -c "import sys, json; data=json.load(sys.stdin); data.pop('browserslist', None); print(json.dumps(data, indent=2))" > package.json.tmp && \
    mv package.json.tmp package.json; \
fi && \
rm -rf .next node_modules/.cache && \
npm run build && \
if [ -f ".next/BUILD_ID" ]; then \
    pm2 stop ctrldespesas-web 2>/dev/null || true && \
    pm2 delete ctrldespesas-web 2>/dev/null || true && \
    pm2 start npm --name "ctrldespesas-web" -- start && \
    pm2 save && \
    echo "✅ Sucesso!" && \
    pm2 logs ctrldespesas-web --lines 30 --nostream; \
else \
    echo "❌ Build falhou - BUILD_ID não encontrado"; \
fi
```

---

## 🔧 Se Ainda Não Funcionar: Criar Ambiente Limpo

Se o problema persistir, crie um ambiente completamente limpo:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Parar tudo
pm2 stop all
pm2 delete all

# 2. Limpar variáveis no shell atual
unset BASEDIR BROWSERSLIST_BASEDIR BROWSERSLIST_ENV BROWSERSLIST_CONFIG BROWSERSLIST

# 3. Limpar arquivos
rm -f .browserslistrc
rm -rf .next node_modules/.cache

# 4. Verificar e corrigir package.json
cat package.json | python3 -m json.tool > /dev/null || echo "package.json inválido!"

# Remover browserslist do package.json se existir
if grep -q '"browserslist"' package.json; then
    python3 << 'PYTHON'
import json
with open('package.json', 'r') as f:
    data = json.load(f)
if 'browserslist' in data:
    del data['browserslist']
with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)
print("✅ browserslist removido do package.json")
PYTHON
fi

# 5. Reinstalar dependências (limpo)
rm -rf node_modules package-lock.json
npm install

# 6. Build
npm run build

# 7. Verificar BUILD_ID
if [ -f ".next/BUILD_ID" ]; then
    echo "✅ Build OK: $(cat .next/BUILD_ID)"
    pm2 start npm --name "ctrldespesas-web" -- start
    pm2 save
    pm2 logs ctrldespesas-web --lines 30
else
    echo "❌ Build falhou!"
fi
```

---

## 💡 Prevenir no Futuro

Para evitar que variáveis de ambiente sejam definidas incorretamente:

1. **Não definir variáveis globais** no `/etc/environment` ou `~/.bashrc` relacionadas ao Browserslist
2. **Usar apenas configuração padrão** do Next.js (sem `.browserslistrc` ou `browserslist` no `package.json`)
3. **Verificar variáveis antes de fazer build**:

```bash
env | grep -i browser
```

---

**✅ Execute o script completo acima para resolver o problema!**
