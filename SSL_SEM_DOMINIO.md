# 🔒 SSL sem Domínio Próprio - Alternativas

Se você não pode alterar o DNS do domínio `projmanager.com.br` para apontar para sua VPS, existem várias alternativas para ter SSL/HTTPS.

---

## 🎯 Opção 1: Usar Serviço de DNS Dinâmico (Recomendado)

Serviços gratuitos que fornecem um subdomínio que você pode apontar para qualquer IP.

### Cloudflare Tunnel (Mais Moderno e Seguro)

**Vantagens:**
- ✅ Gratuito
- ✅ SSL automático (gratuito)
- ✅ Não precisa abrir portas no firewall
- ✅ Funciona mesmo com IP dinâmico
- ✅ Proteção DDoS incluída

**Como configurar:**

1. **Criar conta no Cloudflare** (gratuito): https://dash.cloudflare.com/sign-up

2. **Instalar Cloudflared na VPS:**

```bash
# Baixar e instalar Cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Autenticar (login via navegador)
cloudflared tunnel login
# ⚠️ IMPORTANTE: Uma URL aparecerá no terminal
# Abra essa URL no navegador do seu computador e faça login no Cloudflare
# O certificado será baixado automaticamente após autorizar
```

**📖 Guia completo do login:** Veja `CLOUDFLARE_TUNNEL_LOGIN.md`

# Criar túnel
cloudflared tunnel create ctrldespesas

# Criar arquivo de configuração
sudo mkdir -p /etc/cloudflared
sudo nano /etc/cloudflared/config.yml
```

**Conteúdo do arquivo (⚠️ IMPORTANTE: Substitua `[ID_DO_TUNEL]` pelo ID real!):**

```yaml
tunnel: ctrldespesas
credentials-file: /root/.cloudflared/35a2a1b2-493a-4072-9f7e-310417737a62.json
# ⚠️ SUBSTITUA o ID acima pelo ID do SEU túnel (veja após criar o túnel)

ingress:
  - service: http://localhost:3000
```

**📖 Para encontrar o ID do túnel:**

```bash
# Após criar o túnel, o ID aparece na mensagem:
# "Tunnel credentials written to /root/.cloudflared/SEU_ID_AQUI.json"

# OU liste os túneis:
cloudflared tunnel list

# OU veja os arquivos:
ls -la /root/.cloudflared/*.json
```

3. **Rodar o túnel:**

```bash
# Testar primeiro (deve mostrar URL)
cloudflared tunnel --config /etc/cloudflared/config.yml run

# Se funcionar, pressione Ctrl+C e configure como serviço:
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Verificar status
sudo systemctl status cloudflared
```

**📖 Se encontrar erros:** Veja `SOLUCAO_CLOUDFLARE_SERVICO.md` para troubleshooting completo.

**Resultado:** Sua aplicação estará disponível em `https://ctrldespesas.your-domain.workers.dev` com SSL automático!

---

### DuckDNS (Mais Simples)

**Vantagens:**
- ✅ Gratuito
- ✅ Muito simples de configurar
- ✅ Atualização automática de IP

**Como configurar:**

1. **Criar conta:** https://www.duckdns.org/

2. **Escolher um subdomínio:** ex: `meuapp.duckdns.org`

3. **Configurar na VPS:**

```bash
# Instalar atualizador DuckDNS
sudo apt install -y curl

# Criar script de atualização
sudo nano /usr/local/bin/duckdns-update.sh
```

**Conteúdo:**

```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=meuapp&token=SEU_TOKEN&ip=" | curl -k -o /tmp/duckdns.log -K -
```

```bash
# Dar permissão
sudo chmod +x /usr/local/bin/duckdns-update.sh

# Executar manualmente para testar
sudo /usr/local/bin/duckdns-update.sh

# Configurar atualização automática (a cada 5 minutos)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/duckdns-update.sh >/dev/null 2>&1") | crontab -
```

4. **Configurar Nginx:**

```bash
sudo nano /etc/nginx/sites-available/ctrldespesas
```

```nginx
server {
    listen 80;
    server_name meuapp.duckdns.org;

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
    }
}
```

5. **Obter SSL com Certbot:**

```bash
sudo certbot --nginx -d meuapp.duckdns.org
```

**Resultado:** `https://meuapp.duckdns.org` com SSL válido!

---

### No-IP (Alternativa)

Similar ao DuckDNS, também gratuito: https://www.noip.com/

---

## 🎯 Opção 2: Usar ngrok (Rápido para Testes)

**Vantagens:**
- ✅ Configuração em 2 minutos
- ✅ SSL automático
- ✅ Não precisa configurar DNS

**Desvantagens:**
- ⚠️ URL muda a cada reinício (versão gratuita)
- ⚠️ Limitado para testes/protótipos

**Como configurar:**

```bash
# Instalar ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Autenticar (criar conta em https://dashboard.ngrok.com/)
ngrok config add-authtoken SEU_TOKEN

# Rodar túnel
ngrok http 3000
```

**Resultado:** URL temporária como `https://abc123.ngrok.io` com SSL.

**Para produção:** Use plano pago com domínio fixo.

---

## 🎯 Opção 3: Certificado Auto-Assinado (Não Recomendado)

**⚠️ AVISO:** Navegadores mostrarão aviso de segurança. Use apenas para testes internos.

```bash
# Gerar certificado auto-assinado
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt

# Configurar Nginx para usar
sudo nano /etc/nginx/sites-available/ctrldespesas
```

```nginx
server {
    listen 443 ssl;
    server_name SEU_IP_OU_DOMINIO;

    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;

    location / {
        proxy_pass http://localhost:3000;
        # ... resto da configuração
    }
}
```

---

## 🎯 Opção 4: Usar IP Diretamente com Cloudflare Tunnel

Se você só tem o IP da VPS:

```bash
# Instalar Cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Autenticar (login via navegador)
cloudflared tunnel login
# ⚠️ Abra a URL que aparece no terminal no seu navegador e faça login no Cloudflare

# Criar túnel (opcional, para URL fixa)
cloudflared tunnel create ctrldespesas

# Rodar túnel apontando para localhost:3000
cloudflared tunnel --url http://localhost:3000
```

Isso criará uma URL temporária com SSL. Para URL fixa, configure no dashboard do Cloudflare.

---

## 📊 Comparação das Opções

| Opção | SSL Válido | URL Fixa | Gratuito | Dificuldade |
|-------|------------|----------|----------|-------------|
| **Cloudflare Tunnel** | ✅ Sim | ✅ Sim | ✅ Sim | Média |
| **DuckDNS + Certbot** | ✅ Sim | ✅ Sim | ✅ Sim | Fácil |
| **ngrok (gratuito)** | ✅ Sim | ❌ Não | ✅ Sim | Muito Fácil |
| **ngrok (pago)** | ✅ Sim | ✅ Sim | ❌ Não | Muito Fácil |
| **Auto-assinado** | ⚠️ Com aviso | ✅ Sim | ✅ Sim | Fácil |

---

## 🎯 Recomendação

**Para produção:** Use **Cloudflare Tunnel** ou **DuckDNS + Certbot**

**Para testes rápidos:** Use **ngrok**

---

## 🚀 Configuração Rápida: DuckDNS + Certbot

**Passo a passo completo:**

```bash
# 1. Criar conta em https://www.duckdns.org/
# 2. Escolher subdomínio (ex: ctrldespesas.duckdns.org)
# 3. Copiar o token

# 4. Na VPS, criar script de atualização
echo 'echo url="https://www.duckdns.org/update?domains=ctrldespesas&token=SEU_TOKEN&ip=" | curl -k -o /tmp/duckdns.log -K -' | sudo tee /usr/local/bin/duckdns-update.sh
sudo chmod +x /usr/local/bin/duckdns-update.sh

# 5. Executar uma vez
sudo /usr/local/bin/duckdns-update.sh

# 6. Configurar atualização automática
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/duckdns-update.sh >/dev/null 2>&1") | crontab -

# 7. Configurar Nginx
sudo nano /etc/nginx/sites-available/ctrldespesas
# Alterar server_name para: ctrldespesas.duckdns.org

# 8. Recarregar Nginx
sudo nginx -t && sudo systemctl reload nginx

# 9. Obter SSL
sudo certbot --nginx -d ctrldespesas.duckdns.org

# ✅ Pronto! Acesse: https://ctrldespesas.duckdns.org
```

---

## 💡 Dica Extra: Usar IP com Cloudflare Tunnel

Se você só tem o IP e não quer configurar nada:

```bash
# Instalar Cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Autenticar primeiro (login via navegador)
cloudflared tunnel login
# ⚠️ Abra a URL que aparece no terminal no seu navegador e faça login

# Rodar (vai criar URL temporária com SSL)
cloudflared tunnel --url http://localhost:3000
```

Isso criará uma URL como `https://random-name.trycloudflare.com` com SSL válido!

---

**✅ Escolha a opção que melhor se adapta ao seu caso!**
