# 🔧 Solução: Erro next.config.js - module is not defined

## Problema

O erro indica que:
1. Há um `package.json` em `/var/www/` com `"type": "module"`
2. O Next.js está tentando carregar `/var/www/next.config.js` em vez de `/var/www/ctrldespesas-web/web-app/next.config.js`
3. O `next.config.js` está usando sintaxe CommonJS mas está sendo tratado como ES module

**Erro:** `ReferenceError: module is not defined in ES module scope`

---

## ✅ Solução Rápida

Execute na VPS:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Verificar se next.config.js existe no diretório correto
if [ ! -f next.config.js ]; then
    echo "🔧 Criando next.config.js..."
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

# 2. Verificar se há package.json problemático em /var/www/
if [ -f /var/www/package.json ]; then
    echo "⚠️  Encontrado package.json em /var/www/"
    echo "Conteúdo:"
    cat /var/www/package.json
    
    echo ""
    echo "🔧 Removendo ou renomeando para evitar conflito..."
    mv /var/www/package.json /var/www/package.json.backup 2>/dev/null || true
fi

# 3. Verificar se há next.config.js em /var/www/
if [ -f /var/www/next.config.js ]; then
    echo "⚠️  Encontrado next.config.js em /var/www/"
    echo "🔧 Removendo para evitar conflito..."
    rm -f /var/www/next.config.js
fi

# 4. Verificar package.json no diretório correto
if [ -f package.json ]; then
    echo "✅ package.json encontrado no diretório correto"
    # Verificar se tem "type": "module" e remover se necessário
    if grep -q '"type": "module"' package.json; then
        echo "⚠️  package.json contém 'type: module' - removendo..."
        python3 << 'PYTHON'
import json
with open('package.json', 'r') as f:
    data = json.load(f)
if 'type' in data:
    del data['type']
with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)
print("✅ Removido 'type: module' do package.json")
PYTHON
    fi
fi

# 5. Tentar build novamente
echo ""
echo "🔨 Tentando build novamente..."
npm run build
```

---

## 🚀 Solução Completa (Script)

```bash
cd /var/www/ctrldespesas-web/web-app

# Remover arquivos problemáticos em /var/www/
rm -f /var/www/package.json /var/www/next.config.js

# Criar next.config.js se não existir
if [ ! -f next.config.js ]; then
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

# Remover "type": "module" do package.json se existir
if grep -q '"type": "module"' package.json 2>/dev/null; then
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

# Build
npm run build
```

---

## 🔍 Diagnóstico

Execute para ver o que está causando o problema:

```bash
echo "=== DIAGNÓSTICO ==="
echo ""
echo "1. Diretório atual:"
pwd
echo ""

echo "2. next.config.js no diretório atual:"
[ -f next.config.js ] && echo "✅ Existe" || echo "❌ Não existe"
echo ""

echo "3. package.json no diretório atual:"
[ -f package.json ] && echo "✅ Existe" && grep -q '"type": "module"' package.json && echo "⚠️  Contém 'type: module'" || echo "✅ OK" || echo "❌ Não existe"
echo ""

echo "4. Arquivos em /var/www/:"
ls -la /var/www/ | grep -E "(package.json|next.config)" || echo "Nenhum encontrado"
echo ""

echo "5. Conteúdo de /var/www/package.json (se existir):"
[ -f /var/www/package.json ] && cat /var/www/package.json || echo "Não existe"
```

---

## 💡 Prevenção

Para evitar este problema:

1. **Não crie `package.json` em `/var/www/`** - apenas no diretório da aplicação
2. **Não use `"type": "module"`** no `package.json` do Next.js (Next.js gerencia isso internamente)
3. **Mantenha `next.config.js`** no diretório correto (`/var/www/ctrldespesas-web/web-app/`)

---

**✅ Execute a solução rápida acima e tente o build novamente!**
