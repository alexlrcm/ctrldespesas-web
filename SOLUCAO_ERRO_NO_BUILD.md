# 🔧 Solução: Erro "Could not find a production build"

## Problema

O erro ocorre porque o PM2 está tentando executar `next start` (modo produção), mas não há um build de produção na pasta `.next`.

**Erro:** `Could not find a production build in the '.next' directory`

---

## ✅ Solução Rápida

Execute na VPS:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. PARAR o PM2 primeiro (importante!)
pm2 stop ctrldespesas-web
pm2 delete ctrldespesas-web

# 2. Fazer build da aplicação
npm run build

# 3. Verificar se o build foi criado
ls -la .next

# 4. Iniciar PM2 novamente
pm2 start npm --name "ctrldespesas-web" -- start

# 5. Salvar configuração
pm2 save

# 6. Verificar logs
pm2 logs ctrldespesas-web --lines 50
```

---

## 🚀 Script Completo (Copiar e Colar Tudo)

```bash
cd /var/www/ctrldespesas-web/web-app && \
pm2 stop ctrldespesas-web 2>/dev/null || true && \
pm2 delete ctrldespesas-web 2>/dev/null || true && \
npm run build && \
pm2 start npm --name "ctrldespesas-web" -- start && \
pm2 save && \
pm2 logs ctrldespesas-web --lines 50
```

---

## 🔍 Verificar se Funcionou

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs ctrldespesas-web --lines 100
```

Procure por:
- ✅ "Compiled successfully"
- ✅ "Ready on http://localhost:3000"
- ✅ "started server on 0.0.0.0:3000"
- ✅ Status: `online`
- ❌ Nenhum erro sobre "production build"

---

## 🐛 Se o Build Falhar

### Erro: "Cannot find module"

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erro: "Memory limit" ou build muito lento

```bash
# Aumentar memória do Node.js temporariamente
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Erro: Build falha mas não mostra erro claro

```bash
# Limpar cache e rebuild
rm -rf .next node_modules/.cache
npm run build
```

---

## 📝 Ordem Correta dos Comandos

**SEMPRE siga esta ordem:**

1. ✅ **Parar PM2** (`pm2 stop` ou `pm2 delete`)
2. ✅ **Fazer build** (`npm run build`)
3. ✅ **Verificar build** (`ls -la .next`)
4. ✅ **Iniciar PM2** (`pm2 start`)
5. ✅ **Salvar** (`pm2 save`)

**NUNCA inicie o PM2 antes de fazer o build!**

---

## 💡 Dica: Script de Atualização Completo

Crie um script na VPS para facilitar atualizações futuras:

```bash
# Criar script
nano ~/atualizar-app.sh
```

Cole:

```bash
#!/bin/bash
cd /var/www/ctrldespesas-web/web-app
pm2 stop ctrldespesas-web 2>/dev/null || true
pm2 delete ctrldespesas-web 2>/dev/null || true
npm install
npm run build
pm2 start npm --name "ctrldespesas-web" -- start
pm2 save
pm2 logs ctrldespesas-web --lines 50
```

Tornar executável:

```bash
chmod +x ~/atualizar-app.sh
```

Usar:

```bash
~/atualizar-app.sh
```

---

**✅ Após executar o build, sua aplicação deve estar rodando corretamente!**
