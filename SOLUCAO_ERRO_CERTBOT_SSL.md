# 🔒 Solução: Erro ao Obter Certificado SSL com Certbot

## ❌ Erro Encontrado

```
Certbot failed to authenticate some domains (authenticator: nginx)
Domain: projmanager.com.br
Type: unauthorized
Detail: Invalid response from http://projmanager.com.br/.well-known/acme-challenge/...: 404
```

## 🔍 Diagnóstico: Por Que Isso Acontece?

O Certbot precisa acessar `http://projmanager.com.br/.well-known/acme-challenge/...` para validar o domínio, mas está recebendo um erro 404. Isso pode acontecer por:

1. **Domínio não aponta para o IP da VPS**
2. **Nginx não está configurado com o `server_name` correto**
3. **Firewall bloqueando porta 80**
4. **Nginx não está rodando ou não está acessível externamente**

---

## ✅ Solução Passo a Passo

### Passo 1: Verificar se o Domínio Aponta para o IP da VPS

```bash
# Verificar qual IP o domínio está apontando
nslookup projmanager.com.br

# OU
dig projmanager.com.br

# Deve mostrar o IP da sua VPS
```

**Se não mostrar o IP correto:**
- Acesse o painel do seu provedor de domínio
- Configure o registro A apontando para o IP da VPS
- Aguarde propagação DNS (pode levar até 24h, geralmente 1-2h)

### Passo 2: Verificar Configuração do Nginx

```bash
# Verificar configuração atual
sudo cat /etc/nginx/sites-available/ctrldespesas
```

**A configuração deve ter o `server_name` correto:**

```nginx
server {
    listen 80;
    server_name projmanager.com.br;  # ← Deve estar assim!

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

**Se o `server_name` estiver errado ou como `_`, corrija:**

```bash
sudo nano /etc/nginx/sites-available/ctrldespesas
```

Altere `server_name _;` para `server_name projmanager.com.br;`

Salve: `Ctrl+X`, `Y`, `Enter`

### Passo 3: Testar e Recarregar Nginx

```bash
# Testar configuração
sudo nginx -t

# Se estiver OK, recarregar
sudo systemctl reload nginx

# Verificar se está rodando
sudo systemctl status nginx
```

### Passo 4: Verificar se o Domínio Está Acessível

**Do seu computador Windows:**

```powershell
# Testar se o domínio responde
curl http://projmanager.com.br

# OU abra no navegador:
# http://projmanager.com.br
```

**Deve mostrar:** A página da sua aplicação ou pelo menos não dar erro de conexão.

**Se não funcionar:**
- Verifique se o firewall permite porta 80
- Verifique se o DNS propagou (use `nslookup` novamente)

### Passo 5: Verificar Firewall

```bash
# Na VPS, verificar regras do firewall
sudo ufw status

# Deve mostrar:
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere

# Se não estiver permitido:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### Passo 6: Verificar se Nginx Está Escutando na Porta 80

```bash
# Verificar se algo está escutando na porta 80
sudo netstat -tlnp | grep :80

# OU
sudo ss -tlnp | grep :80

# Deve mostrar nginx escutando
```

### Passo 7: Testar Acesso ao Arquivo de Desafio Manualmente

```bash
# Criar diretório de desafio
sudo mkdir -p /var/www/html/.well-known/acme-challenge

# Criar arquivo de teste
echo "teste" | sudo tee /var/www/html/.well-known/acme-challenge/teste.txt

# Testar acesso (do seu computador ou da VPS)
curl http://projmanager.com.br/.well-known/acme-challenge/teste.txt

# Deve retornar: teste
```

**Se não funcionar**, o problema está na configuração do Nginx ou DNS.

### Passo 8: Tentar Certbot Novamente

Após corrigir tudo acima:

```bash
# Limpar tentativas anteriores (opcional)
sudo certbot delete --cert-name projmanager.com.br

# Tentar novamente
sudo certbot --nginx -d projmanager.com.br
```

---

## 🔧 Solução Alternativa: Usar Certbot Standalone

Se o método `--nginx` não funcionar, use o modo standalone:

```bash
# Parar Nginx temporariamente
sudo systemctl stop nginx

# Obter certificado em modo standalone
sudo certbot certonly --standalone -d projmanager.com.br

# Reiniciar Nginx
sudo systemctl start nginx

# Configurar Nginx manualmente para usar o certificado
sudo nano /etc/nginx/sites-available/ctrldespesas
```

**Adicionar configuração SSL:**

```nginx
server {
    listen 80;
    server_name projmanager.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name projmanager.com.br;

    ssl_certificate /etc/letsencrypt/live/projmanager.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/projmanager.com.br/privkey.pem;

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

---

## 🆘 Checklist de Verificação

Antes de tentar o Certbot novamente, verifique:

- [ ] Domínio `projmanager.com.br` aponta para o IP da VPS (`nslookup projmanager.com.br`)
- [ ] Nginx está rodando (`sudo systemctl status nginx`)
- [ ] Configuração do Nginx tem `server_name projmanager.com.br;`
- [ ] Porta 80 está aberta no firewall (`sudo ufw status`)
- [ ] Site está acessível via HTTP (`curl http://projmanager.com.br`)
- [ ] Nginx está escutando na porta 80 (`sudo netstat -tlnp | grep :80`)

---

## 🔍 Comandos de Diagnóstico

```bash
# Verificar DNS
nslookup projmanager.com.br
dig projmanager.com.br

# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
sudo cat /etc/nginx/sites-available/ctrldespesas

# Verificar portas
sudo netstat -tlnp | grep :80
sudo ufw status

# Verificar logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Testar acesso HTTP
curl -I http://projmanager.com.br
```

---

## 💡 Dicas Importantes

1. **Aguarde propagação DNS:** Pode levar até 24h (geralmente 1-2h)
2. **Use `nslookup` ou `dig`** para verificar se o DNS propagou
3. **Certifique-se que o `server_name` no Nginx está correto**
4. **Teste o acesso HTTP antes de tentar SSL**
5. **Verifique os logs** se algo não funcionar

---

## 📝 Configuração Correta do Nginx (Antes do SSL)

Seu arquivo `/etc/nginx/sites-available/ctrldespesas` deve estar assim **ANTES** de rodar o Certbot:

```nginx
server {
    listen 80;
    server_name projmanager.com.br;  # ← IMPORTANTE: usar o domínio real!

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

**⚠️ IMPORTANTE:** O `server_name` deve ser exatamente `projmanager.com.br` (não `_`, não `localhost`, não o IP).

---

## ✅ Após Corrigir, Tentar Novamente

```bash
# Verificar tudo está OK
sudo nginx -t
sudo systemctl reload nginx

# Tentar Certbot novamente
sudo certbot --nginx -d projmanager.com.br
```

**✅ Pronto!** Se tudo estiver configurado corretamente, o Certbot deve funcionar!
