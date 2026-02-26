# 🔧 Solução Final: Build Antes de Iniciar

## Problema

O PM2 está tentando iniciar a aplicação sem um build válido no diretório `.next`.

**Erro:** `Could not find a production build in the '.next' directory`

---

## ✅ Solução: Verificar Build Antes de Iniciar

Execute na VPS:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Parar PM2
pm2 stop ctrldespesas-web 2>/dev/null || true
pm2 delete ctrldespesas-web 2>/dev/null || true

# 2. Verificar se .next existe e está válido
if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
    echo "❌ Build não encontrado ou inválido!"
    echo "🔨 Executando build..."
    
    # Limpar cache
    rm -rf .next node_modules/.cache
    
    # Fazer build
    npm run build
    
    # Verificar se build foi bem-sucedido
    if [ ! -f ".next/BUILD_ID" ]; then
        echo "❌ Build falhou! Verifique os erros acima."
        exit 1
    fi
    echo "✅ Build concluído!"
else
    echo "✅ Build já existe"
fi

# 3. Verificar BUILD_ID
BUILD_ID=$(cat .next/BUILD_ID 2>/dev/null)
if [ -z "$BUILD_ID" ]; then
    echo "❌ BUILD_ID não encontrado! Rebuild necessário."
    rm -rf .next
    npm run build
fi

# 4. Iniciar PM2
pm2 start npm --name "ctrldespesas-web" -- start
pm2 save

# 5. Verificar logs
sleep 3
pm2 logs ctrldespesas-web --lines 50
```

---

## 🚀 Script Completo Automatizado

```bash
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
    npm run build
    
    # Verificar novamente
    if [ ! -f ".next/BUILD_ID" ]; then
        echo "❌ Build falhou!"
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
echo "📋 Últimos logs:"
sleep 2
pm2 logs ctrldespesas-web --lines 30 --nostream
```

---

## 🔍 Diagnóstico Completo

Execute para ver o que está acontecendo:

```bash
cd /var/www/ctrldespesas-web/web-app

echo "=== DIAGNÓSTICO ==="
echo ""
echo "1. Diretório atual:"
pwd
echo ""

echo "2. Arquivos no diretório:"
ls -la | head -20
echo ""

echo "3. package.json existe?"
[ -f package.json ] && echo "✅ Sim" || echo "❌ Não"
echo ""

echo "4. Diretório .next existe?"
[ -d .next ] && echo "✅ Sim" || echo "❌ Não"
echo ""

echo "5. BUILD_ID existe?"
[ -f .next/BUILD_ID ] && echo "✅ Sim: $(cat .next/BUILD_ID)" || echo "❌ Não"
echo ""

echo "6. node_modules existe?"
[ -d node_modules ] && echo "✅ Sim" || echo "❌ Não"
echo ""

echo "7. PM2 processos:"
pm2 list
echo ""

echo "8. Tentar build manualmente:"
npm run build 2>&1 | tail -20
```

---

## 🚨 Se Build Falhar

### Erro: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erro: "PostCSS" ou "Browserslist"

```bash
# Remover .browserslistrc se existir
rm -f .browserslistrc

# Verificar package.json não tem browserslist
grep -v browserslist package.json > package.json.tmp
mv package.json.tmp package.json

# Rebuild
npm run build
```

### Erro: "TypeScript" ou "tsconfig"

```bash
# Verificar tsconfig.json
cat tsconfig.json | python3 -m json.tool > /dev/null && echo "✅ Válido" || echo "❌ Inválido"

# Se inválido, recriar (veja SOLUCAO_ERRO_TSCONFIG.md)
```

---

## ✅ Checklist Final

Execute e verifique cada item:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. package.json válido?
cat package.json | python3 -m json.tool > /dev/null && echo "✅ package.json OK" || echo "❌ package.json inválido"

# 2. node_modules instalado?
[ -d node_modules ] && echo "✅ node_modules OK" || echo "❌ node_modules faltando"

# 3. Build existe?
[ -f .next/BUILD_ID ] && echo "✅ Build OK: $(cat .next/BUILD_ID)" || echo "❌ Build faltando"

# 4. PM2 rodando?
pm2 list | grep -q ctrldespesas-web && echo "✅ PM2 rodando" || echo "❌ PM2 não rodando"
```

---

**✅ Execute o script completo acima para garantir que tudo funcione!**
