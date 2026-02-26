# 🖥️ Guia Completo: Hospedar Web App na VPS

Este guia mostra passo a passo como migrar seu web app Next.js da Vercel para uma VPS própria.

---

## 📋 Pré-requisitos

1. **VPS com acesso SSH** (Ubuntu 20.04+ ou Debian 11+ recomendado)
2. **Domínio apontando para o IP da VPS** (opcional, mas recomendado)
3. **Acesso root ou usuário com sudo**
4. **Portas abertas no firewall**: 22 (SSH), 80 (HTTP), 443 (HTTPS)

---

## 🔐 Configurar Autenticação SSH (Recomendado)

**⚠️ IMPORTANTE:** Para facilitar a transferência de arquivos e evitar digitar senha toda vez, configure autenticação por chave SSH.

**📖 Guia completo:** Veja `CONFIGURAR_SSH_SEM_SENHA.md` para instruções detalhadas.

---

## 👤 Criar Usuário appuser na VPS

**⚠️ IMPORTANTE:** O usuário `appuser` precisa ser criado na VPS antes de transferir arquivos!

**📖 Guia completo:** Veja `CRIAR_USUARIO_APPUSER.md` para instruções detalhadas.

**Resumo rápido:**

```bash
# Na VPS, como root:
sudo adduser appuser
# Defina uma senha quando solicitado

# OU criar sem senha e definir depois:
sudo adduser --disabled-password --gecos "" appuser
sudo passwd appuser
```

**Resumo rápido:**

```powershell
# No Windows PowerShell
ssh-keygen -t rsa -b 4096
ssh-copy-id appuser@SEU_IP_VPS
```

Agora você pode usar o script de transferência sem digitar senha:

```powershell
.\transferir-para-vps.ps1 -VpsIp "192.168.0.47" -SshKeyPath "$env:USERPROFILE\.ssh\id_rsa"
```

---

## 🚀 Passo 1: Conectar na VPS e Atualizar Sistema

```bash
# Conectar via SSH
ssh root@SEU_IP_VPS

# Atualizar sistema
sudo apt update && sudo apt upgrade -y
```

---

## 📦 Passo 2: Instalar Node.js (Versão 18 ou Superior)

### Opção A: Usando NodeSource (Recomendado)

```bash
# Instalar Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version   # Deve mostrar 10.x.x
```

### Opção B: Usando NVM (Node Version Manager)

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar terminal
source ~/.bashrc

# Instalar Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verificar
node --version
npm --version
```

---

## 🔧 Passo 3: Instalar Git e Ferramentas Necessárias

```bash
sudo apt install -y git build-essential
```

---

## 📁 Passo 4: Preparar Diretório da Aplicação

```bash
# Criar diretório para aplicações
sudo mkdir -p /var/www
cd /var/www

# Criar usuário para a aplicação (recomendado para segurança)
sudo adduser --disabled-password --gecos "" appuser

# ⚠️ IMPORTANTE: Definir senha para o usuário appuser
# Você será solicitado a digitar a senha duas vezes
sudo passwd appuser

# Dar permissões ao usuário
sudo chown -R appuser:appuser /var/www

# Trocar para o usuário da aplicação
sudo su - appuser
cd /var/www
```

---

## 📥 Passo 5: Clonar ou Transferir o Projeto

### Opção A: Se o código está no GitHub/GitLab

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git ctrldespesas-web
cd ctrldespesas-web/web-app
```

### Opção B: Se precisa transferir do seu computador

**No seu computador Windows (PowerShell):**

```powershell
# Compactar o projeto
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
Compress-Archive -Path * -DestinationPath web-app.zip -Force

# Transferir via SCP (substitua SEU_IP_VPS)
scp web-app.zip appuser@SEU_IP_VPS:/var/www/
```

**Na VPS:**

```bash
cd /var/www
unzip web-app.zip -d ctrldespesas-web
cd ctrldespesas-web/web-app
```

---

## 📦 Passo 6: Instalar Dependências e Fazer Build

```bash
# Instalar dependências
npm install

# Criar arquivo .env.local com as variáveis de ambiente
nano .env.local
```

**Conteúdo do `.env.local`:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972931672046
NEXT_PUBLIC_FIREBASE_APP_ID=1:972931672046:web:0d02d9c8e72caca6e0d0ff
NEXT_PUBLIC_APP_URL=https://seu-dominio.com.br
NEXT_PUBLIC_DOMAIN=giratech.com.br
NEXT_PUBLIC_FILE_RETENTION_DAYS=90
```

**Salvar:** `Ctrl+X`, depois `Y`, depois `Enter`

```bash
# Fazer build da aplicação
npm run build

# Verificar se o build foi bem-sucedido
ls -la .next
```

---

## 🔄 Passo 7: Instalar e Configurar PM2 (Gerenciador de Processos)

PM2 mantém sua aplicação rodando mesmo após reiniciar o servidor.

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar aplicação com PM2
pm2 start npm --name "ctrldespesas-web" -- start

# Verificar status
pm2 status

# Ver logs
pm2 logs ctrldespesas-web

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar automaticamente no boot
pm2 startup
# Execute o comando que aparecer (algo como: sudo env PATH=... pm2 startup ...)
```

**Comandos úteis do PM2:**

```bash
pm2 restart ctrldespesas-web    # Reiniciar aplicação
pm2 stop ctrldespesas-web      # Parar aplicação
pm2 delete ctrldespesas-web    # Remover aplicação
pm2 monit                      # Monitor em tempo real
```

---

## 🌐 Passo 8: Instalar e Configurar Nginx (Proxy Reverso)

Nginx vai receber as requisições HTTP/HTTPS e redirecionar para o Next.js na porta 3000.

```bash
# Voltar para usuário root
exit

# Instalar Nginx
sudo apt install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

### Configurar Site no Nginx

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/ctrldespesas
```

**Conteúdo do arquivo (substitua `seu-dominio.com.br` pelo seu domínio ou IP):**

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;  # ⚠️ IMPORTANTE: Use o domínio REAL, não "_" ou IP!

    # Redirecionar HTTP para HTTPS (descomente após configurar SSL)
    # return 301 https://$server_name$request_uri;

    # Configuração temporária para HTTP (remova após configurar SSL)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Tamanho máximo de upload (ajuste conforme necessário)
    client_max_body_size 10M;
}
```

**Salvar:** `Ctrl+X`, depois `Y`, depois `Enter`

```bash
# Remover link existente se já existir (evita erro "File exists")
sudo rm -f /etc/nginx/sites-enabled/ctrldespesas

# Criar link simbólico para habilitar o site
sudo ln -s /etc/nginx/sites-available/ctrldespesas /etc/nginx/sites-enabled/

# OU usar -sf para forçar (cria novo link mesmo se já existir)
# sudo ln -sf /etc/nginx/sites-available/ctrldespesas /etc/nginx/sites-enabled/

# Remover configuração padrão (opcional)
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
sudo nginx -t

# Se tudo estiver OK, recarregar Nginx
sudo systemctl reload nginx
```

---

## 🔒 Passo 9: Configurar SSL com Let's Encrypt (HTTPS Gratuito)

**⚠️ IMPORTANTE:** Você precisa ter um domínio apontando para o IP da VPS para usar Let's Encrypt.

**📖 Não tem domínio próprio?** Veja `SSL_SEM_DOMINIO.md` para alternativas (DuckDNS, Cloudflare Tunnel, ngrok).

**📖 Se encontrar erros:** Veja `SOLUCAO_ERRO_CERTBOT_SSL.md` para troubleshooting completo.

### Antes de Começar - Verificações Obrigatórias:

```bash
# 1. Verificar se o domínio aponta para o IP da VPS
nslookup seu-dominio.com.br
# Deve mostrar o IP da sua VPS

# 2. Verificar se o Nginx está configurado com o server_name correto
sudo cat /etc/nginx/sites-available/ctrldespesas | grep server_name
# Deve mostrar: server_name seu-dominio.com.br;

# 3. Verificar se o site está acessível via HTTP
curl -I http://seu-dominio.com.br
# Deve retornar HTTP 200 ou 301/302
```

### Obter Certificado SSL:

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL (substitua seu-dominio.com.br pelo seu domínio real)
sudo certbot --nginx -d seu-dominio.com.br

# Seguir as instruções:
# - Email: seu email
# - Aceitar termos: Y
# - Compartilhar email: N (ou Y, sua escolha)
# - Redirecionar HTTP para HTTPS: 2 (recomendado)
```

**Renovação automática:**

O Certbot configura renovação automática. Você pode testar com:

```bash
sudo certbot renew --dry-run
```

---

## 🔥 Passo 10: Configurar Firewall (UFW)

```bash
# Verificar status do firewall
sudo ufw status

# Permitir SSH (IMPORTANTE fazer antes de habilitar firewall!)
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable

# Verificar regras
sudo ufw status verbose
```

---

## ✅ Passo 11: Verificar se Tudo Está Funcionando

```bash
# Verificar se PM2 está rodando
pm2 status

# Verificar se Nginx está rodando
sudo systemctl status nginx

# Verificar se aplicação está respondendo
curl http://localhost:3000

# Verificar logs em caso de erro
pm2 logs ctrldespesas-web --lines 50
sudo tail -f /var/log/nginx/error.log
```

**Acesse no navegador:**
- `http://seu-dominio.com.br` ou `http://SEU_IP_VPS`
- Se configurou SSL: `https://seu-dominio.com.br`

---

## 🔄 Passo 12: Configurar Deploy Automático (Opcional)

### Opção A: Script de Deploy Manual

Crie um script para facilitar atualizações:

```bash
cd /var/www/ctrldespesas-web/web-app
nano deploy.sh
```

**Conteúdo:**

```bash
#!/bin/bash
echo "🚀 Iniciando deploy..."

# Atualizar código
git pull origin main

# Instalar dependências
npm install

# Fazer build
npm run build

# Reiniciar aplicação
pm2 restart ctrldespesas-web

echo "✅ Deploy concluído!"
```

```bash
# Dar permissão de execução
chmod +x deploy.sh
```

**Usar:**

```bash
./deploy.sh
```

### Opção B: Webhook do GitHub (Avançado)

Configure um webhook no GitHub para fazer deploy automático quando houver push.

---

## 📝 Passo 13: Atualizar Variáveis de Ambiente

Se precisar atualizar variáveis de ambiente:

```bash
cd /var/www/ctrldespesas-web/web-app
nano .env.local

# Após editar, reiniciar aplicação
pm2 restart ctrldespesas-web
```

---

## 🛠️ Comandos Úteis para Manutenção

```bash
# Ver logs da aplicação
pm2 logs ctrldespesas-web

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Reiniciar serviços
pm2 restart ctrldespesas-web
sudo systemctl restart nginx

# Ver uso de recursos
pm2 monit
htop  # (instalar com: sudo apt install htop)

# Verificar espaço em disco
df -h

# Verificar processos rodando na porta 3000
sudo lsof -i :3000
```

---

## 🆘 Troubleshooting

### Problema: Erro "File exists" ao criar link simbólico do Nginx

**Erro:**
```
ln: failed to create symbolic link '/etc/nginx/sites-enabled/ctrldespesas': File exists
```

**Solução:**

```bash
# Opção 1: Remover o link existente e criar novo
sudo rm -f /etc/nginx/sites-enabled/ctrldespesas
sudo ln -s /etc/nginx/sites-available/ctrldespesas /etc/nginx/sites-enabled/

# Opção 2: Usar -sf para forçar (substitui se existir)
sudo ln -sf /etc/nginx/sites-available/ctrldespesas /etc/nginx/sites-enabled/

# Verificar se foi criado corretamente
ls -la /etc/nginx/sites-enabled/ctrldespesas
```

**Verificar se o link está correto:**

```bash
# Deve mostrar algo como:
# lrwxrwxrwx 1 root root 45 ... /etc/nginx/sites-enabled/ctrldespesas -> /etc/nginx/sites-available/ctrldespesas
```

---

### Problema: Erro ao Obter Certificado SSL (Certbot)

**Erro:** `Certbot failed to authenticate some domains` ou `404` no desafio ACME

**📖 Guia completo:** Veja `SOLUCAO_ERRO_CERTBOT_SSL.md` para solução detalhada.

**Solução rápida:**

```bash
# 1. Verificar se domínio aponta para VPS
nslookup projmanager.com.br

# 2. Verificar configuração do Nginx
sudo cat /etc/nginx/sites-available/ctrldespesas | grep server_name
# Deve mostrar: server_name projmanager.com.br;

# 3. Se estiver errado, corrigir:
sudo nano /etc/nginx/sites-available/ctrldespesas
# Alterar server_name _; para server_name projmanager.com.br;

# 4. Recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx

# 5. Verificar se site está acessível
curl -I http://projmanager.com.br

# 6. Tentar Certbot novamente
sudo certbot --nginx -d projmanager.com.br
```

**Causas comuns:**
- Domínio não aponta para o IP da VPS
- `server_name` no Nginx está como `_` ao invés do domínio real
- Firewall bloqueando porta 80
- DNS ainda não propagou

---

### Problema: Aplicação não inicia

```bash
# Verificar logs
pm2 logs ctrldespesas-web --lines 100

# Verificar se porta 3000 está em uso
sudo lsof -i :3000

# Verificar variáveis de ambiente
cd /var/www/ctrldespesas-web/web-app
cat .env.local
```

### Problema: Nginx retorna 502 Bad Gateway

```bash
# Verificar se aplicação está rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Verificar se aplicação está escutando na porta 3000
curl http://localhost:3000
```

### Problema: Erro de permissão

```bash
# Verificar permissões
ls -la /var/www/ctrldespesas-web/web-app

# Corrigir permissões (se necessário)
sudo chown -R appuser:appuser /var/www/ctrldespesas-web
```

### Problema: Build falha

```bash
# Limpar cache e node_modules
rm -rf node_modules .next
npm install
npm run build
```

---

## 📊 Monitoramento e Backup

### Backup do Código

```bash
# Criar backup do diretório
tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/ctrldespesas-web/web-app

# Ou usar Git para versionamento
git add .
git commit -m "Backup manual"
git push origin main
```

### Monitoramento com PM2

```bash
# Instalar módulo de monitoramento web
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🎯 Checklist Final

- [ ] Node.js instalado e funcionando
- [ ] Aplicação clonada/transferida para VPS
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env.local` configurado
- [ ] Build executado com sucesso (`npm run build`)
- [ ] PM2 instalado e aplicação rodando
- [ ] PM2 configurado para iniciar no boot
- [ ] Nginx instalado e configurado
- [ ] SSL configurado (Let's Encrypt)
- [ ] Firewall configurado (UFW)
- [ ] Aplicação acessível via navegador
- [ ] Logs sendo monitorados

---

## 💡 Dicas Importantes

1. **Sempre faça backup antes de atualizar**
2. **Mantenha o sistema operacional atualizado**: `sudo apt update && sudo apt upgrade`
3. **Monitore os logs regularmente** para identificar problemas
4. **Configure alertas** se possível (ex: UptimeRobot para monitorar se o site está online)
5. **Use domínio ao invés de IP** para facilitar SSL e manutenção
6. **Considere usar Docker** para facilitar deploy e isolamento (opcional)

---

## 📚 Recursos Adicionais

- [Documentação Next.js - Deploy](https://nextjs.org/docs/deployment)
- [Documentação PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Documentação Nginx](https://nginx.org/en/docs/)
- [Documentação Let's Encrypt](https://letsencrypt.org/docs/)

---

**✅ Pronto!** Seu web app agora está rodando na sua VPS!

Se precisar de ajuda com algum passo específico, me avise! 🚀
