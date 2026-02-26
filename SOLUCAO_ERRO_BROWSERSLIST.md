# 🔧 Solução: Erro Browserslist "Unknown browser query"

## Problema

O erro ocorre porque há uma variável de ambiente ou configuração do Browserslist incorreta.

**Erro:** `Unknown browser query 'basedir=$(dirname "$(echo "$0" | sed -e 's'`

Isso indica que uma variável de ambiente está sendo interpretada incorretamente pelo Browserslist.

---

## ✅ Solução Rápida

Execute na VPS:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Verificar variáveis de ambiente problemáticas
env | grep -i browserslist
env | grep -i basedir

# 2. Limpar variáveis de ambiente problemáticas (se existirem)
unset BROWSERSLIST_ENV
unset BROWSERSLIST_BASEDIR

# 3. Criar arquivo .browserslistrc correto
cat > .browserslistrc << 'EOF'
defaults
not dead
> 0.5%
last 2 versions
Firefox ESR
EOF

# 4. OU adicionar browserslist no package.json
# (Ver instruções abaixo)

# 5. Limpar cache e rebuild
rm -rf .next node_modules/.cache
npm run build
```

---

## 🚀 Solução 1: Adicionar browserslist no package.json

Edite o `package.json` para incluir a configuração do browserslist:

```bash
cd /var/www/ctrldespesas-web/web-app

# Fazer backup
cp package.json package.json.backup

# Adicionar browserslist ao package.json
# (Veja o formato correto abaixo)
```

O `package.json` deve ter esta seção:

```json
{
  "browserslist": {
    "production": [
      ">0.5%",
      "last 2 versions",
      "Firefox ESR",
      "not dead"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

---

## 🚀 Solução 2: Criar arquivo .browserslistrc

```bash
cd /var/www/ctrldespesas-web/web-app

# Criar arquivo .browserslistrc
cat > .browserslistrc << 'EOF'
defaults
not dead
> 0.5%
last 2 versions
Firefox ESR
EOF

# Verificar se foi criado
cat .browserslistrc

# Limpar e rebuild
rm -rf .next node_modules/.cache
npm run build
```

---

## 🚀 Solução 3: Limpar Variáveis de Ambiente

O problema pode ser uma variável de ambiente mal configurada:

```bash
# Ver todas as variáveis relacionadas
env | grep -i browser
env | grep -i basedir

# Remover variáveis problemáticas
unset BROWSERSLIST_ENV
unset BROWSERSLIST_BASEDIR
unset BASEDIR

# Limpar e rebuild
rm -rf .next node_modules/.cache
npm run build
```

---

## 🚀 Script Completo de Correção

```bash
cd /var/www/ctrldespesas-web/web-app && \
unset BROWSERSLIST_ENV BROWSERSLIST_BASEDIR BASEDIR 2>/dev/null || true && \
cat > .browserslistrc << 'EOF'
defaults
not dead
> 0.5%
last 2 versions
Firefox ESR
EOF
rm -rf .next node_modules/.cache && \
npm run build && \
pm2 start npm --name "ctrldespesas-web" -- start && \
pm2 save && \
pm2 logs ctrldespesas-web --lines 50
```

---

## 🔍 Verificar o Problema

```bash
# Ver variáveis de ambiente
env | grep -i browser
env | grep -i basedir

# Verificar se há arquivo .browserslistrc
cat .browserslistrc 2>/dev/null || echo "Arquivo não existe"

# Verificar browserslist no package.json
cat package.json | grep -A 10 browserslist
```

---

## 🐛 Se Ainda Der Erro

### Reinstalar autoprefixer e browserslist

```bash
npm uninstall autoprefixer browserslist
npm install autoprefixer browserslist --save-dev
npm run build
```

### Usar versão específica do browserslist

```bash
npm install browserslist@latest --save-dev
npm run build
```

### Verificar versão do Node.js

```bash
node --version
# Deve ser 18.x ou superior
```

---

## 📝 Formato Correto do .browserslistrc

O arquivo `.browserslistrc` deve conter:

```
defaults
not dead
> 0.5%
last 2 versions
Firefox ESR
```

OU no `package.json`:

```json
{
  "browserslist": {
    "production": [">0.5%", "last 2 versions", "Firefox ESR", "not dead"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
```

---

**✅ Após corrigir o Browserslist, o build deve funcionar!**
