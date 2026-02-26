# 🔧 Solução: Erro "Missing script: start"

## Problema

O erro `Missing script: "start"` indica que o `package.json` na VPS não tem o script `start` definido ou está corrompido.

---

## ✅ Solução Rápida

Execute na VPS:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Verificar package.json
cat package.json

# 2. Verificar se o script "start" existe
cat package.json | grep -A 10 "scripts"

# 3. Se não existir, vamos corrigir manualmente
```

---

## 🔧 Corrigir package.json

Se o script `start` não existir, edite o `package.json`:

```bash
nano package.json
```

Certifique-se de que a seção `scripts` tenha:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`.

---

## 🚀 Alternativa: Usar next start diretamente

Se não conseguir corrigir o package.json, use o comando direto:

```bash
# Parar PM2
pm2 delete ctrldespesas-web 2>/dev/null || true

# Iniciar com next start diretamente
pm2 start "npm run start" --name "ctrldespesas-web"

# OU usar o caminho completo do next
pm2 start node_modules/.bin/next --name "ctrldespesas-web" -- start

# OU usar npx
pm2 start "npx next start" --name "ctrldespesas-web"
```

---

## ✅ Solução Recomendada (Copiar package.json correto)

Execute na VPS:

```bash
cd /var/www/ctrldespesas-web/web-app

# Fazer backup do package.json atual
cp package.json package.json.backup

# Criar package.json correto
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

# Verificar se ficou correto
cat package.json | grep -A 5 "scripts"

# Reinstalar dependências (se necessário)
npm install

# Reiniciar PM2
pm2 delete ctrldespesas-web 2>/dev/null || true
pm2 start npm --name "ctrldespesas-web" -- start
pm2 save
pm2 logs ctrldespesas-web --lines 50
```

---

## 🔍 Verificar o que está acontecendo

```bash
# Ver conteúdo do package.json
cat package.json

# Ver scripts disponíveis
npm run

# Verificar se next está instalado
which next
npx next --version

# Verificar node_modules
ls -la node_modules/.bin/ | grep next
```

---

## 🚀 Script Completo de Correção

```bash
cd /var/www/ctrldespesas-web/web-app && \
cp package.json package.json.backup && \
cat > package.json << 'EOF'
{
  "name": "ctrldespesas-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
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
npm install && \
pm2 delete ctrldespesas-web 2>/dev/null || true && \
pm2 start npm --name "ctrldespesas-web" -- start && \
pm2 save && \
pm2 logs ctrldespesas-web --lines 50
```

---

## 📝 Verificar se Funcionou

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs ctrldespesas-web --lines 100
```

Procure por:
- ✅ "Ready on http://localhost:3000"
- ✅ "started server on 0.0.0.0:3000"
- ✅ Status: `online`
- ❌ Nenhum erro sobre "Missing script"

---

**✅ Após executar, sua aplicação deve estar rodando corretamente!**
