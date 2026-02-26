# 🔧 Solução: Erros no Build e PM2 na VPS

## Problemas Identificados

1. ❌ **Erro no build**: `zshy: not found` (problema com pacote zod)
2. ❌ **PM2**: Processo `ctrldespesas-web` não encontrado

---

## ✅ Solução Passo a Passo

### 1️⃣ Corrigir o Build

O erro `zshy: not found` vem do pacote `zod`. Vamos corrigir:

```bash
# Na VPS, execute:

cd /var/www/ctrldespesas-web/web-app

# Limpar cache e node_modules
rm -rf node_modules package-lock.json .next

# Reinstalar dependências
npm install

# Tentar build novamente
npm run build
```

**Se ainda der erro**, tente ignorar o script de build do zod:

```bash
# Instalar dependências ignorando scripts problemáticos
npm install --ignore-scripts

# Depois fazer build normalmente
npm run build
```

### 2️⃣ Iniciar Aplicação no PM2

Como o processo não existe, vamos criá-lo:

```bash
# Verificar se há algum processo rodando
pm2 list

# Iniciar a aplicação
pm2 start npm --name "ctrldespesas-web" -- start

# OU se preferir usar um arquivo de configuração:
pm2 start npm --name "ctrldespesas-web" -- start --update-env

# Salvar configuração do PM2
pm2 save

# Configurar para iniciar automaticamente no boot
pm2 startup
# (Siga as instruções que aparecerem)
```

### 3️⃣ Verificar se Está Funcionando

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs ctrldespesas-web --lines 100

# Ver informações detalhadas
pm2 info ctrldespesas-web
```

---

## 🚀 Script Completo (Copiar e Colar)

Execute tudo de uma vez:

```bash
cd /var/www/ctrldespesas-web/web-app && \
rm -rf node_modules package-lock.json .next && \
npm install && \
npm run build && \
pm2 delete ctrldespesas-web 2>/dev/null || true && \
pm2 start npm --name "ctrldespesas-web" -- start && \
pm2 save && \
pm2 status && \
pm2 logs ctrldespesas-web --lines 50
```

---

## 🔍 Verificar Logs

Após executar, verifique os logs:

```bash
pm2 logs ctrldespesas-web --lines 100
```

Procure por:
- ✅ "Compiled successfully"
- ✅ "Ready on http://localhost:3000"
- ✅ "started server on 0.0.0.0:3000"
- ❌ Erros de compilação ou runtime

---

## 🐛 Se Ainda Der Erro

### Erro: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erro: "Port 3000 already in use"

```bash
# Verificar o que está usando a porta
sudo lsof -i :3000

# Parar processo se necessário
pm2 stop ctrldespesas-web
# OU
sudo kill -9 <PID>
```

### Erro: "zshy: not found" (persiste)

```bash
# Remover e reinstalar zod
npm uninstall zod
npm install zod@latest

# OU instalar sem scripts
npm install --ignore-scripts
npm run build
```

---

## 📝 Comandos Úteis do PM2

```bash
# Listar processos
pm2 list

# Parar aplicação
pm2 stop ctrldespesas-web

# Reiniciar aplicação
pm2 restart ctrldespesas-web

# Ver logs em tempo real
pm2 logs ctrldespesas-web --lines 100 --raw

# Ver uso de recursos
pm2 monit

# Deletar processo
pm2 delete ctrldespesas-web

# Salvar configuração atual
pm2 save
```

---

**✅ Após executar, sua aplicação deve estar rodando!**
