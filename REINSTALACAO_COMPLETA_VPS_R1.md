# 🔄 Reinstalação Completa da VPS - Do Zero

Guia rápido para reinstalação completa da aplicação na VPS.

---

## 📋 Pré-requisitos

- ✅ VPS com acesso SSH (root ou sudo)
- ✅ Código atualizado e funcionando localmente
- ✅ Credenciais do Firebase (para `.env.local`)

---

## 🚀 Passos Rápidos

### 1. Limpar Tudo na VPS

```bash
ssh root@SEU_IP_VPS

pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
rm -rf /var/www/ctrldespesas-web
rm -f /home/appuser/web-app-*.zip /root/web-app-*.zip 2>/dev/null || true
```

---

### 2. Verificar/Instalar Node.js

```bash
node --version  # Deve ser v18+ ou v20+

# Se necessário:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

---

### 3. Instalar PM2

```bash
npm install -g pm2
pm2 startup systemd -u root --hp /root
# Execute o comando que aparecer
```

---

### 4. Criar Estrutura e Transferir Código

**No Windows (PowerShell):**
```powershell
cd c:\Users\giratech02\Documents\CtrlDespesas\web-app

# Criar ZIP 
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipFile = "web-app-$timestamp.zip"
Compress-Archive -Path app,components,hooks,lib,public,types,*.json,*.js,*.ts,*.tsx -DestinationPath $zipFile -Force -Exclude "node_modules","*.log",".next",".git","*.zip"

# Criar ZIP manualmente
Acessar "C:\Users\giratech02\Documents\CtrlDespesas" 
Zipar "web-app"
Colar o arquivo zip em "C:\Users\giratech02\Documents\CtrlDespesas\web-app"

# Transferir para VPS
scp -i "$env:USERPROFILE\.ssh\id_rsa" "$zipFile" root@SEU_IP_VPS:/root/

# Transferir para VPS manualmente
scp "nomedo arquivo .zip" appuser@192.168.0.47:/var/www/ctrldespesas-web/

```

**Na VPS:**
```bash
mkdir -p /var/www/ctrldespesas-web/web-app
cd /var/www/ctrldespesas-web/

# Descompactar ZIP mais recente
unzip -q "nomedo arquivo .zip"

```

---

### 5. Criar .env.local

```bash
cd /var/www/ctrldespesas-web/web-app

cat > .env.local << 'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972931672046
NEXT_PUBLIC_FIREBASE_APP_ID=1:972931672046:web:0d02d9c8e72caca6e0d0ff
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DOMAIN=projmanager.com.br
NEXT_PUBLIC_FILE_RETENTION_DAYS=90
EOF
```

---

### 6. Verificar Arquivos Críticos

```bash
cd /var/www/ctrldespesas-web/web-app

# Verificar se package.json existe
ls -la package.json app/

# Remover arquivos problemáticos
rm -f .browserslistrc
rm -f /var/www/package.json /var/www/next.config.js 2>/dev/null || true
```

---

### 7. Instalar Dependências

```bash
cd /var/www/ctrldespesas-web/web-app

unset BASEDIR BROWSERSLIST_BASEDIR BROWSERSLIST_ENV BROWSERSLIST_CONFIG BROWSERSLIST
npm install
```

> ⚠️ **Nota:** Avisos de vulnerabilidades são normais e não impedem a aplicação de funcionar. Pode continuar.

---

### 8. Fazer Build

```bash
cd /var/www/ctrldespesas-web/web-app

# Limpar cache
rm -rf .next node_modules/.cache

# Remover "type": "module" do package.json se existir
sed -i '/"type": "module"/d' package.json 2>/dev/null || true

# Build
npm run build
```

---

### 9. Iniciar com PM2

```bash
cd /var/www/ctrldespesas-web/web-app

pm2 start npm --name "ctrldespesas-web" -- start
pm2 save
pm2 status
pm2 logs ctrldespesas-web --lines 50
```

---

### 10. Verificar Cloudflare Tunnel (Se Necessário)

```bash
cloudflared --version
systemctl status cloudflared
```

---

## 🔍 Verificação Rápida

```bash
# Verificar logs
pm2 logs ctrldespesas-web --lines 100

# Verificar status
pm2 status

# Procurar por:
# ✅ "Ready on http://localhost:3000"
# ✅ Status: online
```

---

## 📝 Checklist

- [ ] Limpeza executada
- [ ] Node.js instalado (v20+)
- [ ] PM2 instalado e configurado
- [ ] Código transferido e descompactado
- [ ] `.env.local` criado
- [ ] Dependências instaladas
- [ ] Build concluído
- [ ] PM2 iniciado e funcionando
- [ ] Logs verificados (sem erros)

---

## 💡 Dicas

- Use `pm2 save` após iniciar a aplicação
- Monitore logs com `pm2 logs ctrldespesas-web`
- Faça backup do `.env.local` antes de atualizar

---

**✅ Pronto!** Aplicação reinstalada e funcionando!
