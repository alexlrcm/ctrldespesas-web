# 🔧 Solução: package.json Corrompido

## Problema

O `package.json` foi corrompido pelo comando `sed` que tentou remover o campo `browserslist`.

**Erro:** `JSONParseError: Expected double-quoted property name in JSON at position 713`

---

## ✅ Solução Rápida

Execute na VPS:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Restaurar package.json do backup (se existir)
cp package.json.backup package.json 2>/dev/null || echo "Backup não encontrado"

# 2. OU recriar package.json completo (veja abaixo)

# 3. Verificar se está correto
cat package.json | python3 -m json.tool 2>/dev/null || echo "JSON inválido"

# 4. Tentar build novamente
npm run build
```

---

## 🚀 Recriar package.json Completo

Se o backup não funcionar, recrie o `package.json` completo:

```bash
cd /var/www/ctrldespesas-web/web-app

# Fazer backup do corrompido
cp package.json package.json.corrompido

# Recriar package.json correto
cat > package.json << 'EOF'
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
EOF

# Verificar se está válido
cat package.json | python3 -m json.tool > /dev/null && echo "JSON válido!" || echo "JSON ainda inválido"

# Reinstalar dependências
npm install

# Limpar e rebuild
rm -rf .next node_modules/.cache
npm run build
```

---

## 🚀 Script Completo de Correção

```bash
cd /var/www/ctrldespesas-web/web-app && \
cp package.json package.json.corrompido && \
cat > package.json << 'EOF'
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
EOF
rm -f .browserslistrc && \
cat > .browserslistrc << 'EOF'
defaults
not dead
> 0.5%
last 2 versions
Firefox ESR
EOF
npm install && \
rm -rf .next node_modules/.cache && \
npm run build && \
pm2 start npm --name "ctrldespesas-web" -- start && \
pm2 save && \
pm2 logs ctrldespesas-web --lines 50
```

---

## 🔍 Verificar se package.json está Correto

```bash
# Verificar sintaxe JSON
cat package.json | python3 -m json.tool > /dev/null && echo "✅ JSON válido" || echo "❌ JSON inválido"

# OU usar node
node -e "JSON.parse(require('fs').readFileSync('package.json'))" && echo "✅ JSON válido" || echo "❌ JSON inválido"
```

---

**✅ Após corrigir o package.json, o build deve funcionar!**
