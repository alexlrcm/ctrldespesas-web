# 🔧 Solução: Conflito ".browserslistrc and browserslist"

## Problema

O erro ocorre porque há dois arquivos de configuração do Browserslist ao mesmo tempo:
- Arquivo `.browserslistrc` 
- Campo `browserslist` no `package.json`

**Erro:** `/var/www/ctrldespesas-web/web-app contains both .browserslistrc and browserslist`

O Browserslist não permite ambos ao mesmo tempo. Você precisa escolher UM método.

---

## ✅ Solução Rápida

Execute na VPS (IMPORTANTE: no diretório correto):

```bash
# 1. Navegar para o diretório correto
cd /var/www/ctrldespesas-web/web-app

# 2. Verificar o que existe
ls -la .browserslistrc
cat package.json | grep -A 5 browserslist

# 3. OPÇÃO A: Remover .browserslistrc e usar apenas package.json
rm -f .browserslistrc

# OU OPÇÃO B: Remover browserslist do package.json e usar apenas .browserslistrc
# (Veja instruções abaixo)

# 4. Limpar e rebuild
rm -rf .next node_modules/.cache
npm run build
```

---

## 🚀 Solução Recomendada: Usar apenas .browserslistrc

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Verificar se há browserslist no package.json
cat package.json | grep -A 10 browserslist

# 2. Se houver, vamos remover (manter apenas .browserslistrc)
# Primeiro fazer backup
cp package.json package.json.backup

# 3. Remover campo browserslist do package.json manualmente
# OU usar este método automático (se possível)
```

---

## 🚀 Script Completo de Correção

```bash
cd /var/www/ctrldespesas-web/web-app && \
rm -f .browserslistrc && \
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
# Verificar se .browserslistrc existe
ls -la .browserslistrc

# Verificar se há browserslist no package.json
cat package.json | grep -A 10 browserslist

# Se ambos existirem, você tem um conflito!
```

---

## 📝 Opções de Configuração

### Opção 1: Usar apenas .browserslistrc (Recomendado)

```bash
# Remover browserslist do package.json (se existir)
# Manter apenas .browserslistrc
```

### Opção 2: Usar apenas package.json

```bash
# Remover .browserslistrc
rm -f .browserslistrc

# Adicionar browserslist no package.json:
# {
#   "browserslist": {
#     "production": [">0.5%", "last 2 versions", "Firefox ESR", "not dead"],
#     "development": ["last 1 chrome version", "last 1 firefox version"]
#   }
# }
```

---

## ⚠️ IMPORTANTE: Diretório Correto

**SEMPRE execute os comandos no diretório correto:**

```bash
cd /var/www/ctrldespesas-web/web-app
```

**NÃO execute em:**
- ❌ `/home/appuser`
- ❌ `/root`
- ❌ Qualquer outro diretório

---

**✅ Após remover o conflito, o build deve funcionar!**
