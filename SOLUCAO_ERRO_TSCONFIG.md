# 🔧 Solução: Erro "File '@ljharb/tsconfig' not found"

## Problema

O erro ocorre porque o `tsconfig.json` na VPS está referenciando um pacote `@ljharb/tsconfig` que não existe ou não está instalado.

**Erro:** `Error: error TS6053: File '@ljharb/tsconfig' not found.`

---

## ✅ Solução Rápida

Execute na VPS para corrigir o `tsconfig.json`:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Fazer backup do tsconfig.json atual
cp tsconfig.json tsconfig.json.backup

# 2. Recriar tsconfig.json correto
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# 3. Verificar se ficou correto
cat tsconfig.json

# 4. Tentar build novamente
npm run build
```

---

## 🚀 Script Completo de Correção

```bash
cd /var/www/ctrldespesas-web/web-app && \
cp tsconfig.json tsconfig.json.backup && \
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF
npm run build && \
pm2 start npm --name "ctrldespesas-web" -- start && \
pm2 save && \
pm2 logs ctrldespesas-web --lines 50
```

---

## 🔍 Verificar o tsconfig.json Atual

Antes de corrigir, veja o que está errado:

```bash
# Ver conteúdo atual
cat tsconfig.json

# Procurar por referências problemáticas
cat tsconfig.json | grep -i "@ljharb"
cat tsconfig.json | grep -i "extends"
```

---

## 🐛 Se Ainda Der Erro

### Limpar cache do TypeScript

```bash
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

### Reinstalar dependências

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Verificar outros arquivos tsconfig

```bash
# Procurar por outros arquivos tsconfig
find . -name "tsconfig*.json" -type f

# Verificar se há algum extends problemático
grep -r "extends" tsconfig*.json
```

---

**✅ Após corrigir o tsconfig.json, o build deve funcionar!**
