# ⚡ Solução Rápida: Erro Certbot para projmanager.com.br

## 🔍 Diagnóstico Rápido

Execute estes comandos na VPS para identificar o problema:

```bash
# 1. Verificar DNS
nslookup projmanager.com.br

# 2. Verificar configuração do Nginx
sudo cat /etc/nginx/sites-available/ctrldespesas | grep server_name

# 3. Verificar se Nginx está rodando
sudo systemctl status nginx

# 4. Verificar firewall
sudo ufw status | grep 80

# 5. Testar acesso HTTP
curl -I http://projmanager.com.br
```

---

## ✅ Solução Mais Provável

O problema mais comum é o `server_name` no Nginx estar como `_` ao invés de `projmanager.com.br`.

### Corrigir Configuração do Nginx:

```bash
# Editar configuração
sudo nano /etc/nginx/sites-available/ctrldespesas
```

**Alterar esta linha:**
```nginx
server_name _;  # ❌ ERRADO
```

**Para:**
```nginx
server_name projmanager.com.br;  # ✅ CORRETO
```

**Salvar:** `Ctrl+X`, `Y`, `Enter`

```bash
# Testar e recarregar
sudo nginx -t
sudo systemctl reload nginx

# Tentar Certbot novamente
sudo certbot --nginx -d projmanager.com.br
```

---

## 🔧 Se Ainda Não Funcionar

### Verificar DNS:

```bash
# Verificar se o domínio aponta para o IP da VPS
nslookup projmanager.com.br

# Se não mostrar o IP correto:
# 1. Acesse o painel do seu provedor de domínio
# 2. Configure registro A apontando para o IP da VPS
# 3. Aguarde propagação (1-2 horas)
```

### Verificar Firewall:

```bash
# Permitir porta 80
sudo ufw allow 80/tcp
sudo ufw reload
```

### Verificar se Site Está Acessível:

```bash
# Do seu computador Windows (PowerShell)
curl http://projmanager.com.br

# OU abra no navegador:
# http://projmanager.com.br
```

Se não abrir, o problema é DNS ou firewall.

---

## 📋 Checklist Rápido

Antes de tentar Certbot novamente:

- [ ] `nslookup projmanager.com.br` mostra o IP da VPS
- [ ] `server_name projmanager.com.br;` no Nginx (não `_`)
- [ ] `sudo nginx -t` não mostra erros
- [ ] `sudo systemctl status nginx` mostra "active (running)"
- [ ] `sudo ufw status` mostra porta 80 permitida
- [ ] `curl http://projmanager.com.br` funciona

---

## 🚀 Tentar Certbot Novamente

Após corrigir tudo:

```bash
sudo certbot --nginx -d projmanager.com.br
```

**✅ Deve funcionar agora!**

---

**📖 Para mais detalhes:** Veja `SOLUCAO_ERRO_CERTBOT_SSL.md`
