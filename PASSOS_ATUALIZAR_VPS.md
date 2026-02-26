# 🚀 Passos Rápidos: Atualizar VPS Após Transferir ZIP

Você já transferiu o arquivo ZIP para a VPS. Agora siga estes passos:

---

## 📋 Passo a Passo

### 1️⃣ Conectar na VPS

```bash
ssh appuser@192.168.0.47
# (ou o IP da sua VPS)
```

### 2️⃣ Navegar até o diretório da aplicação

```bash
cd /var/www/ctrldespesas-web/web-app
```

### 3️⃣ Fazer backup do .env.local (IMPORTANTE!)

```bash
# Fazer backup do arquivo de configuração
cp .env.local .env.local.backup
```

### 4️⃣ Descompactar o arquivo ZIP

```bash
# Descompactar em um diretório temporário
unzip -o web-app-20260219-104014.zip -d /tmp/ctrldespesas-update

# OU descompactar diretamente (substitua pelo nome do seu arquivo)
unzip -o web-app-*.zip -d /tmp/ctrldespesas-update
```

### 5️⃣ Copiar arquivos atualizados

```bash
# Copiar todos os arquivos, preservando .env.local
cp -r /tmp/ctrldespesas-update/web-app/* .

# OU se o ZIP foi descompactado diretamente na pasta atual:
# unzip -o web-app-*.zip
```

### 6️⃣ Restaurar .env.local (se foi sobrescrito)

```bash
# Se o .env.local foi sobrescrito, restaurar do backup
cp .env.local.backup .env.local
```

### 7️⃣ Instalar dependências (se necessário)

```bash
npm install
```

### 8️⃣ Fazer build da aplicação

```bash
npm run build
```

### 9️⃣ Reiniciar aplicação com PM2

```bash
# Reiniciar a aplicação
pm2 restart ctrldespesas-web

# OU se o nome for diferente:
pm2 restart all

# Verificar status
pm2 status

# Ver logs para confirmar que está funcionando
pm2 logs ctrldespesas-web --lines 50
```

### 🔟 Limpar arquivos temporários (opcional)

```bash
# Remover arquivo ZIP e diretório temporário
rm web-app-*.zip
rm -rf /tmp/ctrldespesas-update
```

---

## ✅ Verificar se Funcionou

### Ver logs do PM2:

```bash
pm2 logs ctrldespesas-web --lines 100
```

Procure por:
- ✅ "Compiled successfully"
- ✅ "Ready on http://localhost:3000"
- ❌ Erros de compilação ou runtime

### Verificar status:

```bash
pm2 status
```

Deve mostrar:
- Status: `online`
- Uptime: tempo rodando
- CPU/Memory: uso normal

### Testar no navegador:

Acesse sua aplicação e verifique:
- ✅ Página carrega normalmente
- ✅ Novas funcionalidades estão presentes
- ✅ Sem erros no console (F12)

---

## 🐛 Se Algo Der Errado

### Erro: "Cannot find module"

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart ctrldespesas-web
```

### Erro: "Port 3000 already in use"

```bash
# Parar e reiniciar PM2
pm2 stop ctrldespesas-web
pm2 restart ctrldespesas-web
```

### Build falha

```bash
# Limpar cache e rebuild
rm -rf .next
npm run build
```

### Aplicação não atualiza

```bash
# Limpar cache do Next.js e rebuild
rm -rf .next node_modules/.cache
npm run build
pm2 restart ctrldespesas-web
```

---

## 📝 Script Rápido (Copiar e Colar Tudo)

```bash
# Conectar na VPS primeiro, depois execute:

cd /var/www/ctrldespesas-web/web-app
cp .env.local .env.local.backup
unzip -o web-app-*.zip -d /tmp/ctrldespesas-update
cp -r /tmp/ctrldespesas-update/web-app/* .
cp .env.local.backup .env.local
npm install
npm run build
pm2 restart ctrldespesas-web
pm2 logs ctrldespesas-web --lines 50
```

---

**✅ Pronto!** Sua aplicação deve estar atualizada e rodando.
