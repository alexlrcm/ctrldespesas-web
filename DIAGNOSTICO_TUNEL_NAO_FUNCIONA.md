# 🔍 Diagnóstico: Túnel Cloudflare Não Está Funcionando

## ✅ Situação Atual

Você configurou:
- **Hostname:** `cdespesas.projmanager.com.br`
- **Service:** `http://localhost:3000`
- **Serviço Cloudflare:** Rodando ✅

Mas não consegue acessar a página.

---

## 🔍 Verificações Necessárias

### 1. Verificar se a Aplicação Está Rodando

```bash
# Verificar se PM2 está rodando a aplicação
pm2 status

# Deve mostrar "ctrldespesas-web" como "online"

# Se não estiver rodando:
cd /var/www/ctrldespesas-web/web-app
pm2 start npm --name "ctrldespesas-web" -- start

# Verificar se está escutando na porta 3000
sudo lsof -i :3000
# OU
sudo netstat -tlnp | grep :3000
```

**Deve mostrar:** `node` ou `npm` escutando na porta 3000

---

### 2. Verificar DNS do Domínio

```bash
# Verificar se o domínio aponta para Cloudflare
nslookup cdespesas.projmanager.com.br

# Deve mostrar IPs do Cloudflare (não seu IP da VPS)
# Exemplo: 104.x.x.x ou 172.x.x.x (IPs do Cloudflare)
```

**⚠️ IMPORTANTE:** O domínio precisa estar:
- Configurado no Cloudflare
- Com DNS apontando para Cloudflare (não para seu IP da VPS)
- Com registro CNAME ou A apontando para o túnel

---

### 3. Verificar Logs do Cloudflare Tunnel

```bash
# Ver logs recentes do túnel
sudo journalctl -u cloudflared -n 100 --no-pager

# Ver logs em tempo real
sudo journalctl -u cloudflared -f
```

**Procure por:**
- Erros de conexão
- Mensagens sobre o hostname
- Problemas de autenticação

---

### 4. Verificar Configuração do Arquivo

```bash
# Verificar arquivo de configuração
sudo cat /etc/cloudflared/config.yml
```

**Deve mostrar:**
```yaml
tunnel: ctrldespesas
credentials-file: /root/.cloudflared/35a2a1b2-493a-4072-9f7e-310417737a62.json

ingress:
  - hostname: cdespesas.projmanager.com.br
    service: http://localhost:3000
  - service: http_status:404
```

---

### 5. Testar Acesso Local

```bash
# Testar se a aplicação responde localmente
curl http://localhost:3000

# Deve retornar HTML da aplicação
```

Se não funcionar, a aplicação não está rodando!

---

## 🆘 Problemas Comuns e Soluções

### Problema 1: Aplicação Não Está Rodando

**Sintomas:**
- `pm2 status` mostra aplicação como "stopped"
- `curl http://localhost:3000` não funciona

**Solução:**

```bash
# Iniciar aplicação
cd /var/www/ctrldespesas-web/web-app
pm2 start npm --name "ctrldespesas-web" -- start

# Verificar
pm2 status
curl http://localhost:3000
```

---

### Problema 2: DNS Não Está Configurado

**Sintomas:**
- `nslookup cdespesas.projmanager.com.br` mostra IP da VPS (não Cloudflare)
- Ou domínio não resolve

**Solução:**

1. **No Dashboard do Cloudflare:**
   - Vá em **DNS** > **Records**
   - Adicione registro:
     - **Type:** `CNAME`
     - **Name:** `cdespesas`
     - **Target:** `35a2a1b2-493a-4072-9f7e-310417737a62.cfargotunnel.com`
     - **Proxy:** ✅ (laranja)
   - Salve

2. **Aguarde propagação DNS** (alguns minutos)

3. **Verifique novamente:**
   ```bash
   nslookup cdespesas.projmanager.com.br
   ```

---

### Problema 3: Domínio Não Está no Cloudflare

**Sintomas:**
- Domínio não aparece no dashboard do Cloudflare
- Não consegue adicionar registro DNS

**Solução:**

1. **Adicionar domínio ao Cloudflare:**
   - No dashboard, clique em **"Add a Site"**
   - Digite `projmanager.com.br`
   - Siga as instruções para configurar DNS

2. **OU usar Workers.dev** (mais simples):
   - Mude o hostname para `cdespesas.workers.dev`
   - Não precisa configurar DNS manualmente

---

### Problema 4: Túnel Não Está Conectado

**Sintomas:**
- Logs mostram erros de conexão
- Status do túnel mostra "INOPERANTE"

**Solução:**

```bash
# Reiniciar serviço
sudo systemctl restart cloudflared

# Verificar status
sudo systemctl status cloudflared

# Ver logs
sudo journalctl -u cloudflared -n 50
```

---

## 🎯 Checklist de Diagnóstico

Execute estes comandos na ordem:

```bash
# 1. Verificar aplicação
pm2 status
curl http://localhost:3000

# 2. Verificar túnel
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -n 50

# 3. Verificar DNS
nslookup cdespesas.projmanager.com.br
dig cdespesas.projmanager.com.br

# 4. Verificar configuração
sudo cat /etc/cloudflared/config.yml

# 5. Testar acesso externo
curl -I https://cdespesas.projmanager.com.br
```

---

## ✅ Solução Rápida: Usar Workers.dev

Se o problema for DNS, use Workers.dev que não precisa de configuração DNS:

```bash
# Editar configuração
sudo nano /etc/cloudflared/config.yml
```

**Alterar para:**

```yaml
tunnel: ctrldespesas
credentials-file: /root/.cloudflared/35a2a1b2-493a-4072-9f7e-310417737a62.json

ingress:
  - hostname: cdespesas.workers.dev
    service: http://localhost:3000
  - service: http_status:404
```

**Salvar:** `Ctrl+X`, `Y`, `Enter`

```bash
# Reiniciar serviço
sudo systemctl restart cloudflared

# Verificar
sudo systemctl status cloudflared
```

**Acesse:** `https://cdespesas.workers.dev`

---

## 🔍 Comandos de Diagnóstico Completo

Execute este script para verificar tudo:

```bash
echo "=== 1. Status da Aplicação ==="
pm2 status
echo ""
echo "=== 2. Teste Local ==="
curl -I http://localhost:3000 2>&1 | head -5
echo ""
echo "=== 3. Status do Túnel ==="
sudo systemctl status cloudflared --no-pager | head -15
echo ""
echo "=== 4. DNS ==="
nslookup cdespesas.projmanager.com.br
echo ""
echo "=== 5. Logs Recentes ==="
sudo journalctl -u cloudflared -n 20 --no-pager | tail -10
```

---

## 💡 Próximos Passos

1. **Execute os comandos de diagnóstico acima**
2. **Me diga o resultado de cada um**
3. **Especialmente importante:**
   - `pm2 status` - está rodando?
   - `curl http://localhost:3000` - funciona?
   - `nslookup cdespesas.projmanager.com.br` - o que mostra?

---

**✅ Execute os comandos e me diga os resultados para identificar o problema!**
