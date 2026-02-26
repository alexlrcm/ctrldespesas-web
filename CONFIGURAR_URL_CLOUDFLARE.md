# 🌐 Como Configurar URL no Cloudflare Tunnel

## 🔍 Situação Atual

Sua configuração atual não tem `hostname` configurado, então o túnel está rodando mas sem URL pública.

**Configuração atual:**
```yaml
tunnel: ctrldespesas
credentials-file: /root/.cloudflared/35a2a1b2-493a-4072-9f7e-310417737a62.json

ingress:
  - service: http://localhost:3000
```

---

## ✅ Solução 1: Usar Modo Temporário (Mais Rápido)

Este modo cria uma URL automática sem precisar configurar nada:

```bash
# Parar serviço atual
sudo systemctl stop cloudflared

# Rodar em modo temporário (mostra URL automaticamente)
cloudflared tunnel --url http://localhost:3000
```

**Isso vai mostrar uma URL como:**
```
https://random-name-12345.trycloudflare.com
```

**⚠️ Limitação:** A URL muda a cada vez que você reinicia. Para URL fixa, use a Solução 2.

**Para manter rodando em background:**

```bash
# Usar screen ou nohup
screen -S cloudflared
cloudflared tunnel --url http://localhost:3000
# Pressione Ctrl+A depois D para desanexar

# OU usar nohup
nohup cloudflared tunnel --url http://localhost:3000 > /tmp/cloudflared.log 2>&1 &
```

---

## ✅ Solução 2: Configurar URL Fixa via Dashboard (Recomendado)

### Passo 1: Acessar Dashboard do Cloudflare

1. Acesse: https://dash.cloudflare.com/
2. Faça login na sua conta
3. Vá em **Zero Trust** (ou **Cloudflare Tunnel**)

### Passo 2: Configurar Rota Pública

1. No menu lateral, clique em **Networks** > **Tunnels**
2. Você verá seu túnel `ctrldespesas` listado
3. Clique no túnel para abrir as configurações
4. Clique em **Configure** ou **Public Hostname**
5. Clique em **Add a public hostname**

### Passo 3: Configurar Hostname

**Opção A: Usar Domínio Próprio (se tiver)**

- **Subdomain:** `app` (ou o que preferir)
- **Domain:** Seu domínio (ex: `projmanager.com.br`)
- **Service:** `http://localhost:3000`
- Clique em **Save**

**Opção B: Usar Workers.dev (Gratuito)**

- **Subdomain:** `ctrldespesas` (ou o que preferir)
- **Domain:** Escolha um `.workers.dev` (ex: `ctrldespesas.your-account.workers.dev`)
- **Service:** `http://localhost:3000`
- Clique em **Save**

### Passo 4: Aguardar Propagação

Após salvar, aguarde alguns segundos e sua URL estará disponível!

---

## ✅ Solução 3: Configurar URL Direto no Arquivo (Avançado)

Se você tem um domínio configurado no Cloudflare:

```bash
# Editar configuração
sudo nano /etc/cloudflared/config.yml
```

**Adicionar hostname:**

```yaml
tunnel: ctrldespesas
credentials-file: /root/.cloudflared/35a2a1b2-493a-4072-9f7e-310417737a62.json

ingress:
  - hostname: seu-dominio.com.br  # OU ctrldespesas.workers.dev
    service: http://localhost:3000
  - service: http_status:404
```

**Salvar:** `Ctrl+X`, `Y`, `Enter`

```bash
# Reiniciar serviço
sudo systemctl restart cloudflared

# Verificar status
sudo systemctl status cloudflared
```

**⚠️ IMPORTANTE:** Você precisa ter configurado o domínio no Cloudflare Dashboard primeiro!

---

## 🚀 Solução Mais Rápida: Modo Temporário com Screen

Para ter uma URL funcionando AGORA:

```bash
# Instalar screen (se não tiver)
sudo apt install -y screen

# Parar serviço atual
sudo systemctl stop cloudflared

# Criar sessão screen
screen -S cloudflared

# Rodar túnel (vai mostrar URL)
cloudflared tunnel --url http://localhost:3000
```

**Você verá algo como:**
```
+--------------------------------------------------------------------------------------------+
|  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): |
|  https://random-name-12345.trycloudflare.com                                              |
+--------------------------------------------------------------------------------------------+
```

**Para manter rodando:**
- Pressione `Ctrl+A` depois `D` para desanexar da sessão
- O túnel continuará rodando em background

**Para ver novamente:**
```bash
screen -r cloudflared
```

**Para parar:**
```bash
screen -r cloudflared
# Pressione Ctrl+C
```

---

## 📋 Comparação das Soluções

| Solução | URL Fixa | Dificuldade | Recomendado Para |
|---------|----------|------------|------------------|
| **Modo Temporário** | ❌ Não | ⭐ Muito Fácil | Testes rápidos |
| **Dashboard Cloudflare** | ✅ Sim | ⭐⭐ Fácil | Produção |
| **Arquivo Config** | ✅ Sim | ⭐⭐⭐ Média | Usuários avançados |

---

## 🎯 Recomendação

**Para testar AGORA:** Use a **Solução 1** (modo temporário)

**Para produção:** Use a **Solução 2** (Dashboard Cloudflare) com Workers.dev (gratuito)

---

## ✅ Próximos Passos Após Obter URL

1. **Testar acesso:**
   ```bash
   curl https://sua-url-aqui
   ```

2. **Atualizar variável de ambiente:**
   ```bash
   cd /var/www/ctrldespesas-web/web-app
   nano .env.local
   ```
   
   Alterar:
   ```env
   NEXT_PUBLIC_APP_URL=https://sua-url-aqui
   ```

3. **Reiniciar aplicação:**
   ```bash
   pm2 restart ctrldespesas-web
   ```

---

**✅ Escolha uma solução e configure sua URL!**
