# 🚀 Guia Completo: Atualizar VPS com Versão Local

Este guia apresenta o processo passo a passo para atualizar sua VPS com a última versão do código local.

---

## 📋 Pré-requisitos

- ✅ VPS configurada e funcionando
- ✅ Acesso SSH à VPS (usuário: `appuser`)
- ✅ Aplicação rodando com PM2
- ✅ Script `transferir-para-vps.ps1` disponível (opcional, mas recomendado)

---

## 🎯 Método Recomendado: Transferência via Script PowerShell

### **Passo 1: Preparar Código Local**

Certifique-se de que:
- ✅ Todas as alterações foram testadas localmente
- ✅ Código está salvo e commitado (se usar Git)
- ✅ Você está na pasta `web-app`

```powershell
# Verificar se está no diretório correto
cd C:\Users\giratech02\Documents\CtrlDespesas - Copia\web-app

# Verificar se package.json existe
Test-Path package.json
```

---

### **Passo 2: Transferir Código para VPS**

**Opção A: Com chave SSH (Recomendado - sem senha)**

```powershell
# No PowerShell, dentro da pasta web-app
.\transferir-para-vps.ps1 -VpsIp "SEU_IP_VPS" -SshKeyPath "$env:USERPROFILE\.ssh\id_rsa"
```

**Opção B: Sem chave SSH (vai pedir senha)**

```powershell
.\transferir-para-vps.ps1 -VpsIp "SEU_IP_VPS"
```

**⚠️ IMPORTANTE:** Substitua `SEU_IP_VPS` pelo IP real da sua VPS (ex: `192.168.0.47`)

O script irá:
1. Compactar o projeto (excluindo `node_modules`, `.next`, `.git`)
2. Transferir o arquivo ZIP para a VPS
3. Mostrar os próximos passos

---

### **Passo 3: Conectar na VPS**

```bash
# Conectar via SSH
ssh appuser@SEU_IP_VPS

# Exemplo:
# ssh appuser@192.168.0.47
```

---

### **Passo 4: Navegar até o Diretório da Aplicação**

```bash
# Ir para o diretório da aplicação
cd /var/www/ctrldespesas-web/web-app

# OU se estiver em outro local:
# cd ~/ctrldespesas-web/web-app
```

---

### **Passo 5: Fazer Backup (IMPORTANTE!)**

```bash
# Fazer backup do .env.local (preservar configurações)
cp .env.local .env.local.backup

# Fazer backup completo (opcional, mas recomendado)
cd /var/www
tar -czf backup-ctrldespesas-$(date +%Y%m%d-%H%M%S).tar.gz ctrldespesas-web/web-app
cd ctrldespesas-web/web-app
```

---

### **Passo 6: Descompactar e Atualizar Código**

```bash
# Voltar para o diretório onde o ZIP foi transferido
cd /var/www

# Descompactar o arquivo ZIP em diretório temporário
unzip -o web-app-*.zip -d /tmp/ctrldespesas-update

# Copiar arquivos atualizados (preservando .env.local)
cd /var/www/ctrldespesas-web/web-app
cp -r /tmp/ctrldespesas-update/web-app/* .

# Restaurar .env.local (caso tenha sido sobrescrito)
cp .env.local.backup .env.local

# Limpar arquivos temporários
rm -rf /tmp/ctrldespesas-update
rm /var/www/web-app-*.zip
```

---

### **Passo 7: Instalar Dependências**

```bash
# Instalar novas dependências (se houver)
npm install

# Se houver problemas, limpar e reinstalar:
# rm -rf node_modules package-lock.json
# npm install
```

---

### **Passo 8: Fazer Build da Aplicação**

```bash
# Limpar cache do Next.js (recomendado)
rm -rf .next node_modules/.cache

# Fazer build da aplicação
npm run build

# Verificar se o build foi bem-sucedido
ls -la .next
```

**✅ Build bem-sucedido se:**
- Pasta `.next` foi criada
- Não há erros no terminal
- Mensagem "Compiled successfully" aparece

---

### **Passo 9: Reiniciar Aplicação com PM2**

```bash
# Reiniciar aplicação (preserva configurações do PM2)
pm2 restart ctrldespesas-web

# OU se o nome for diferente:
pm2 restart all

# Verificar status
pm2 status

# Ver logs para confirmar que está funcionando
pm2 logs ctrldespesas-web --lines 50
```

---

### **Passo 10: Verificar se Funcionou**

```bash
# Verificar status do PM2
pm2 status

# Deve mostrar:
# - Status: online
# - Uptime: tempo rodando
# - CPU/Memory: uso normal

# Ver logs recentes
pm2 logs ctrldespesas-web --lines 100

# Procurar por:
# ✅ "Compiled successfully"
# ✅ "Ready on http://localhost:3000"
# ❌ Erros de compilação ou runtime
```

**Testar no navegador:**
- Acesse sua aplicação (ex: `https://cdespesas.projmanager.com.br`)
- Verifique se as novas funcionalidades estão presentes
- Abra o console (F12) e verifique se não há erros

---

## 🔄 Método Alternativo: Usando Git

Se você usa Git para versionamento, pode atualizar diretamente na VPS:

### **No Computador Local:**

```powershell
# Fazer commit das alterações
cd C:\Users\giratech02\Documents\CtrlDespesas - Copia\web-app
git add .
git commit -m "Descrição das alterações"
git push origin main
```

### **Na VPS:**

```bash
# Conectar na VPS
ssh appuser@SEU_IP_VPS

# Ir para diretório da aplicação
cd /var/www/ctrldespesas-web/web-app

# Fazer backup
cp .env.local .env.local.backup

# Atualizar código do repositório
git pull origin main

# Instalar dependências (se necessário)
npm install

# Fazer build
npm run build

# Reiniciar aplicação
pm2 restart ctrldespesas-web

# Verificar status
pm2 status
pm2 logs ctrldespesas-web --lines 50
```

---

## 🛠️ Script Automatizado na VPS (Opcional)

Para facilitar atualizações futuras, você pode criar um script na VPS:

### **Criar Script de Atualização**

```bash
# Na VPS, criar arquivo de atualização
nano ~/atualizar-app.sh
```

**Cole o seguinte conteúdo:**

```bash
#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Iniciando atualização da aplicação...${NC}"

# Diretório da aplicação
APP_DIR="/var/www/ctrldespesas-web/web-app"
cd "$APP_DIR" || exit 1

# Fazer backup do .env.local
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}📦 Fazendo backup do .env.local...${NC}"
    cp .env.local .env.local.backup
fi

# Se usar Git, atualizar código
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Atualizando código do Git...${NC}"
    git pull origin main
fi

# Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm install

# Limpar cache
echo -e "${YELLOW}🧹 Limpando cache...${NC}"
rm -rf .next node_modules/.cache

# Fazer build
echo -e "${YELLOW}🔨 Fazendo build...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build concluído com sucesso!${NC}"
    
    # Restaurar .env.local se necessário
    if [ -f ".env.local.backup" ] && [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}📋 Restaurando .env.local...${NC}"
        cp .env.local.backup .env.local
    fi
    
    # Reiniciar aplicação
    echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
    pm2 restart ctrldespesas-web
    
    echo -e "${GREEN}✅ Aplicação atualizada e reiniciada!${NC}"
    echo -e "${YELLOW}📊 Status:${NC}"
    pm2 status
else
    echo -e "${RED}❌ Erro no build! Verifique os logs acima.${NC}"
    exit 1
fi
```

**Tornar executável:**

```bash
chmod +x ~/atualizar-app.sh
```

**Usar o script:**

```bash
# Executar script de atualização
~/atualizar-app.sh
```

---

## 📝 Comandos Rápidos (Resumo)

### **Atualização Completa (Copiar e Colar):**

```bash
# Conectar na VPS primeiro, depois execute tudo de uma vez:

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

### **Apenas Reiniciar (sem atualizar código):**

```bash
pm2 restart ctrldespesas-web
pm2 logs ctrldespesas-web --lines 20
```

### **Ver Status:**

```bash
pm2 status
pm2 logs ctrldespesas-web
```

---

## 🐛 Solução de Problemas

### **Erro: "Cannot find module"**

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart ctrldespesas-web
```

### **Erro: "Port 3000 already in use"**

```bash
# Verificar processos usando a porta
sudo lsof -i :3000

# Parar PM2 e reiniciar
pm2 stop ctrldespesas-web
pm2 restart ctrldespesas-web
```

### **Build falha**

```bash
# Limpar cache e rebuild
rm -rf .next node_modules/.cache
npm run build
```

### **Aplicação não atualiza após deploy**

```bash
# Limpar cache do Next.js e rebuild
rm -rf .next node_modules/.cache
npm run build
pm2 restart ctrldespesas-web

# Verificar logs
pm2 logs ctrldespesas-web --lines 100
```

### **Erro: "PM2 não encontrado"**

```bash
# Instalar PM2
sudo npm install -g pm2

# Reiniciar aplicação
pm2 restart ctrldespesas-web
```

### **Erro: "npm: command not found"**

```bash
# Verificar se Node.js está instalado
node --version
npm --version

# Se não estiver, instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## ⚠️ Importante: Preservar Configurações

### **Arquivos que NÃO devem ser sobrescritos:**

- ✅ `.env.local` - Variáveis de ambiente (Firebase, URLs, etc.)
- ✅ `pm2.config.js` - Configurações do PM2 (se existir)
- ✅ Arquivos de log

### **Sempre faça backup antes de atualizar:**

```bash
# Backup do .env.local
cp .env.local .env.local.backup

# Backup completo (opcional)
cd /var/www
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz ctrldespesas-web/web-app
```

---

## 📋 Checklist de Atualização

Use este checklist para garantir que nada foi esquecido:

- [ ] Código atualizado e testado localmente
- [ ] Arquivo ZIP transferido para VPS (ou código commitado no Git)
- [ ] Conectado na VPS via SSH
- [ ] Backup do `.env.local` feito
- [ ] Arquivos descompactados/copiados
- [ ] `.env.local` preservado/restaurado
- [ ] `npm install` executado
- [ ] `npm run build` executado com sucesso
- [ ] PM2 reiniciado
- [ ] Logs verificados (sem erros)
- [ ] Aplicação testada no navegador
- [ ] Novas funcionalidades verificadas

---

## 💡 Dicas Importantes

1. **Sempre teste localmente antes de atualizar na VPS**
   ```powershell
   npm run dev
   ```

2. **Faça backup do `.env.local` antes de atualizar**
   ```bash
   cp .env.local .env.local.backup
   ```

3. **Use o script de atualização para facilitar**
   - Crie o script `~/atualizar-app.sh` uma vez
   - Use sempre que precisar atualizar

4. **Monitore os logs após atualizar**
   ```bash
   pm2 logs ctrldespesas-web --lines 50
   ```

5. **Mantenha o PM2 salvo**
   ```bash
   pm2 save
   ```

6. **Configure autenticação SSH por chave** para evitar digitar senha
   - Veja: `CONFIGURAR_SSH_SEM_SENHA.md`

---

## 🚨 Rollback (Voltar Versão Anterior)

Se algo der errado e você precisar voltar:

```bash
# Na VPS, restaurar versão anterior do código
cd /var/www/ctrldespesas-web/web-app

# Se usar Git:
git checkout HEAD~1

# OU restaurar do backup
cd /var/www
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz

# Rebuild e restart
cd /var/www/ctrldespesas-web/web-app
npm run build
pm2 restart ctrldespesas-web
```

---

## 📊 Comandos Úteis para Monitoramento

```bash
# Ver status do PM2
pm2 status

# Ver logs em tempo real
pm2 logs ctrldespesas-web

# Ver últimas 100 linhas dos logs
pm2 logs ctrldespesas-web --lines 100

# Monitorar recursos (CPU, memória)
pm2 monit

# Ver informações detalhadas
pm2 show ctrldespesas-web

# Ver logs do Nginx (se usar)
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## ✅ Resumo do Processo

1. **Local:** Transferir código via script PowerShell
2. **VPS:** Conectar via SSH
3. **VPS:** Fazer backup do `.env.local`
4. **VPS:** Descompactar e copiar arquivos
5. **VPS:** Restaurar `.env.local`
6. **VPS:** `npm install`
7. **VPS:** `npm run build`
8. **VPS:** `pm2 restart ctrldespesas-web`
9. **VPS:** Verificar logs e status
10. **Navegador:** Testar aplicação

---

**✅ Pronto!** Agora você tem um guia completo para atualizar sua VPS com a última versão local.

Para dúvidas ou problemas, consulte os outros guias específicos:
- `CONFIGURAR_SSH_SEM_SENHA.md` - Configurar autenticação SSH
- `GUIA_DEPLOY_VPS.md` - Guia completo de deploy inicial
- `SOLUCAO_ERRO_*.md` - Soluções para erros específicos
