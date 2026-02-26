# 🔧 Solução: Erro "require is not defined" - server.js

## Problema

O erro ocorre porque:
1. Existe um arquivo `server.js` na VPS que não deveria existir
2. Ou o PM2 está tentando executar o arquivo errado
3. Next.js não precisa de `server.js` - usa `next start` diretamente

---

## ✅ Solução Rápida

Execute na VPS:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Verificar se existe server.js (não deveria existir)
ls -la server.js

# 2. Se existir, remover
rm -f server.js

# 3. Verificar package.json (não deve ter "type": "module")
cat package.json | grep -i "type"

# 4. Parar PM2 se estiver rodando
pm2 delete ctrldespesas-web 2>/dev/null || true

# 5. Iniciar corretamente com Next.js
pm2 start npm --name "ctrldespesas-web" -- start

# 6. Salvar configuração
pm2 save

# 7. Verificar logs
pm2 logs ctrldespesas-web --lines 50
```

---

## 🔍 Verificar o que está acontecendo

```bash
# Ver qual comando o PM2 está executando
pm2 describe ctrldespesas-web

# Ver arquivos na pasta
ls -la

# Verificar se há algum server.js
find . -name "server.js" -type f
```

---

## ✅ Comando Correto para PM2

Para Next.js, o PM2 deve executar:

```bash
pm2 start npm --name "ctrldespesas-web" -- start
```

Isso executa: `npm start` → que executa: `next start`

**NÃO use:**
- ❌ `pm2 start server.js` (não existe)
- ❌ `pm2 start app.js` (não existe)
- ❌ `pm2 start index.js` (não existe)

---

## 🚀 Script Completo de Correção

```bash
cd /var/www/ctrldespesas-web/web-app && \
rm -f server.js && \
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
- ❌ Nenhum erro sobre "require" ou "server.js"

---

## 🐛 Se Ainda Der Erro

### Verificar package.json

```bash
# Ver conteúdo do package.json
cat package.json

# Se tiver "type": "module", remover (Next.js não precisa)
# Editar package.json
nano package.json
# Remover a linha: "type": "module",
```

### Verificar se há outros arquivos problemáticos

```bash
# Procurar por arquivos .js na raiz
ls -la *.js

# Se houver algum que não deveria existir, remover
```

---

**✅ Após executar, sua aplicação deve estar rodando corretamente!**
