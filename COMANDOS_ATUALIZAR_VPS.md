# ⚡ Comandos Rápidos: Atualizar VPS

Guia rápido com os principais comandos para atualizar a VPS. Para detalhes completos, veja `GUIA_ATUALIZAR_VPS.md`.

---

## 🚀 Processo Rápido (3 Passos)

### **1. Transferir Código (Windows PowerShell)**

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas - Copia\web-app
.\transferir-para-vps.ps1 -VpsIp "SEU_IP_VPS" -SshKeyPath "$env:USERPROFILE\.ssh\id_rsa"
```

**Substitua `SEU_IP_VPS` pelo IP da sua VPS.**

---

### **2. Conectar na VPS**

```bash
ssh appuser@SEU_IP_VPS
```

---

### **3. Atualizar na VPS (Copiar e Colar Tudo)**

```bash
cd /var/www/ctrldespesas-web/web-app && \
cp .env.local .env.local.backup && \
cd /var/www && \
unzip -o web-app-*.zip -d /tmp/ctrldespesas-update && \
cd /var/www/ctrldespesas-web/web-app && \
cp -r /tmp/ctrldespesas-update/web-app/* . && \
cp .env.local.backup .env.local && \
npm install && \
rm -rf .next node_modules/.cache && \
npm run build && \
pm2 restart ctrldespesas-web && \
pm2 logs ctrldespesas-web --lines 50
```

---

## 📋 Comandos Individuais (Passo a Passo)

### **Conectar na VPS**
```bash
ssh appuser@SEU_IP_VPS
```

### **Ir para diretório da aplicação**
```bash
cd /var/www/ctrldespesas-web/web-app
```

### **Fazer backup**
```bash
cp .env.local .env.local.backup
```

### **Descompactar e copiar arquivos**
```bash
cd /var/www
unzip -o web-app-*.zip -d /tmp/ctrldespesas-update
cd /var/www/ctrldespesas-web/web-app
cp -r /tmp/ctrldespesas-update/web-app/* .
cp .env.local.backup .env.local
rm -rf /tmp/ctrldespesas-update
rm /var/www/web-app-*.zip
```

### **Instalar dependências**
```bash
npm install
```

### **Fazer build**
```bash
rm -rf .next node_modules/.cache
npm run build
```

### **Reiniciar aplicação**
```bash
pm2 restart ctrldespesas-web
```

### **Verificar status**
```bash
pm2 status
pm2 logs ctrldespesas-web --lines 50
```

---

## 🔄 Atualização via Git

### **No Computador Local:**
```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas - Copia\web-app
git add .
git commit -m "Descrição das alterações"
git push origin main
```

### **Na VPS:**
```bash
cd /var/www/ctrldespesas-web/web-app
cp .env.local .env.local.backup
git pull origin main
npm install
npm run build
pm2 restart ctrldespesas-web
pm2 logs ctrldespesas-web --lines 50
```

---

## 🛠️ Comandos Úteis

### **Ver status**
```bash
pm2 status
```

### **Ver logs**
```bash
pm2 logs ctrldespesas-web
```

### **Reiniciar apenas (sem atualizar código)**
```bash
pm2 restart ctrldespesas-web
```

### **Parar aplicação**
```bash
pm2 stop ctrldespesas-web
```

### **Iniciar aplicação**
```bash
pm2 start ctrldespesas-web
```

### **Ver informações detalhadas**
```bash
pm2 show ctrldespesas-web
```

### **Monitorar recursos**
```bash
pm2 monit
```

---

## 🐛 Solução Rápida de Problemas

### **Erro: "Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart ctrldespesas-web
```

### **Build falha**
```bash
rm -rf .next node_modules/.cache
npm run build
```

### **Aplicação não atualiza**
```bash
rm -rf .next node_modules/.cache
npm run build
pm2 restart ctrldespesas-web
pm2 logs ctrldespesas-web --lines 100
```

---

## ⚠️ Lembrete Importante

**SEMPRE faça backup do `.env.local` antes de atualizar!**

```bash
cp .env.local .env.local.backup
```

---

**📖 Para mais detalhes, consulte: `GUIA_ATUALIZAR_VPS.md`**
