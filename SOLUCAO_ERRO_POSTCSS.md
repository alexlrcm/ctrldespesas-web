# 🔧 Solução: Erro PostCSS "must export a plugins key"

## Problema

O erro ocorre porque o `postcss.config.js` na VPS está com formato incorreto ou corrompido.

**Erros:**
- "Your PostCSS configuration defines a field which is not supported (`__esModule`)"
- "Your custom PostCSS configuration must export a `plugins` key"

---

## ✅ Solução Rápida

Execute na VPS:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Fazer backup
cp postcss.config.js postcss.config.js.backup 2>/dev/null || true

# 2. Recriar postcss.config.js correto
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 3. Verificar se ficou correto
cat postcss.config.js

# 4. Tentar build novamente
npm run build
```

---

## 🚀 Script Completo de Correção

```bash
cd /var/www/ctrldespesas-web/web-app && \
cp postcss.config.js postcss.config.js.backup 2>/dev/null || true && \
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
rm -rf .next node_modules/.cache && \
npm run build && \
pm2 start npm --name "ctrldespesas-web" -- start && \
pm2 save && \
pm2 logs ctrldespesas-web --lines 50
```

---

## 🔍 Verificar o postcss.config.js Atual

Antes de corrigir, veja o que está errado:

```bash
# Ver conteúdo atual
cat postcss.config.js

# Procurar por campos problemáticos
cat postcss.config.js | grep -i "__esModule"
cat postcss.config.js | grep -i "plugins"
```

---

## 🐛 Se Ainda Der Erro

### Verificar se há outros arquivos PostCSS

```bash
# Procurar por arquivos postcss
find . -name "postcss*" -type f

# Verificar se há postcss.config.mjs ou .cjs
ls -la postcss.config.*
```

### Limpar tudo e recomeçar

```bash
# Limpar completamente
rm -rf .next node_modules/.cache
rm -f postcss.config.js postcss.config.mjs postcss.config.cjs

# Recriar postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Rebuild
npm run build
```

### Verificar se tailwindcss e autoprefixer estão instalados

```bash
# Verificar instalação
npm list tailwindcss autoprefixer

# Se não estiverem instalados
npm install tailwindcss autoprefixer --save-dev
```

---

## 📝 Formato Correto do postcss.config.js

O arquivo deve ter exatamente este formato:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**NÃO deve ter:**
- ❌ `__esModule: true`
- ❌ `export default`
- ❌ Formato ES6 modules

**DEVE ter:**
- ✅ `module.exports`
- ✅ `plugins` como objeto
- ✅ `tailwindcss` e `autoprefixer` dentro de `plugins`

---

**✅ Após corrigir o postcss.config.js, o build deve funcionar!**
