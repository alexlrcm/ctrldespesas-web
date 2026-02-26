# 🦆 Configuração Rápida: DuckDNS + SSL

Guia passo a passo para configurar DuckDNS e obter SSL sem precisar de domínio próprio.

---

## ✅ Passo 1: Criar Conta no DuckDNS

1. Acesse: https://www.duckdns.org/
2. Clique em **"Sign in"** (pode usar conta Google/GitHub)
3. Após login, escolha um subdomínio (ex: `ctrldespesas`)
4. Anote seu **token** (aparece na página)

**Exemplo:** Seu subdomínio será `ctrldespesas.duckdns.org`

---

## ✅ Passo 2: Configurar DuckDNS na VPS

```bash
# Conectar na VPS
ssh root@SEU_IP_VPS

# Criar script de atualização
sudo nano /usr/local/bin/duckdns-update.sh
```

**Cole este conteúdo (substitua `ctrldespesas` e `SEU_TOKEN`):**

```bash
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=ctrldespesas&token=SEU_TOKEN&ip=" | curl -k -o /tmp/duckdns.log -K -
```

**Salvar:** `Ctrl+X`, `Y`, `Enter`

```bash
# Dar permissão de execução
sudo chmod +x /usr/local/bin/duckdns-update.sh

# Testar execução
sudo /usr/local/bin/duckdns-update.sh

# Verificar se funcionou
cat /tmp/duckdns.log
# Deve mostrar: OK
```

---

## ✅ Passo 3: Configurar Atualização Automática

```bash
# Adicionar ao crontab (atualiza a cada 5 minutos)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/duckdns-update.sh >/dev/null 2>&1") | crontab -

# Verificar se foi adicionado
crontab -l
```

---

## ✅ Passo 4: Configurar Nginx

```bash
# Editar configuração do Nginx
sudo nano /etc/nginx/sites-available/ctrldespesas
```

**Alterar `server_name` para:**

```nginx
server {
    listen 80;
    server_name ctrldespesas.duckdns.org;  # ← Seu subdomínio DuckDNS

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
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    client_max_body_size 10M;
}
```

**Salvar:** `Ctrl+X`, `Y`, `Enter`

```bash
# Testar e recarregar Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ Passo 5: Verificar DNS

```bash
# Verificar se o DuckDNS está apontando para sua VPS
nslookup ctrldespesas.duckdns.org

# Deve mostrar o IP da sua VPS
# Se não mostrar, aguarde alguns minutos e tente novamente
```

---

## ✅ Passo 6: Obter Certificado SSL

```bash
# Instalar Certbot (se ainda não instalou)
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d ctrldespesas.duckdns.org

# Seguir as instruções:
# - Email: seu email
# - Aceitar termos: Y
# - Compartilhar email: N (ou Y)
# - Redirecionar HTTP para HTTPS: 2 (recomendado)
```

---

## ✅ Passo 7: Verificar se Funcionou

```bash
# Testar acesso HTTPS
curl -I https://ctrldespesas.duckdns.org

# Deve retornar HTTP 200
```

**Acesse no navegador:** `https://ctrldespesas.duckdns.org`

---

## 🔄 Atualizar Variáveis de Ambiente

Não esqueça de atualizar a variável `NEXT_PUBLIC_APP_URL`:

```bash
cd /var/www/ctrldespesas-web/web-app
nano .env.local
```

**Alterar:**
```env
NEXT_PUBLIC_APP_URL=https://ctrldespesas.duckdns.org
```

**Reiniciar aplicação:**
```bash
pm2 restart ctrldespesas-web
```

---

## 🆘 Troubleshooting

### DuckDNS não atualiza IP

```bash
# Verificar logs
cat /tmp/duckdns.log

# Executar manualmente
sudo /usr/local/bin/duckdns-update.sh

# Verificar crontab
crontab -l
```

### Certbot falha

```bash
# Verificar se DNS propagou
nslookup ctrldespesas.duckdns.org

# Verificar se site está acessível
curl -I http://ctrldespesas.duckdns.org

# Verificar configuração do Nginx
sudo cat /etc/nginx/sites-available/ctrldespesas | grep server_name
```

---

## ✅ Checklist Final

- [ ] Conta criada no DuckDNS
- [ ] Subdomínio escolhido e token anotado
- [ ] Script de atualização criado e testado
- [ ] Crontab configurado
- [ ] Nginx configurado com `server_name` correto
- [ ] DNS propagado (`nslookup` mostra IP correto)
- [ ] Certificado SSL obtido com sucesso
- [ ] Site acessível via HTTPS
- [ ] Variável `NEXT_PUBLIC_APP_URL` atualizada

---

**✅ Pronto!** Sua aplicação está disponível em `https://ctrldespesas.duckdns.org` com SSL válido! 🎉
