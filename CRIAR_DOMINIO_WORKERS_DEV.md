# 🌐 Como Criar Domínio Workers.dev no Cloudflare

## 🔍 Problema Identificado

O erro `NXDOMAIN` significa que o domínio `cdespesas.workers.dev` não existe ainda. Você precisa criá-lo no Cloudflare primeiro!

---

## ✅ Solução: Criar Domínio Workers.dev

### Método 1: Criar via Workers & Pages (Recomendado)

1. **No Dashboard do Cloudflare:**
   - Vá em **Workers & Pages** (no menu lateral)
   - Clique em **"Create application"** ou **"Criar aplicação"**
   - Escolha **"Workers"**

2. **Configurar Worker:**
   - **Name:** `cdespesas` (ou qualquer nome)
   - Clique em **"Deploy"** ou **"Publicar"**

3. **Isso criará automaticamente:**
   - O domínio `cdespesas.workers.dev` (ou `cdespesas.your-account.workers.dev`)
   - Agora você pode usar no túnel!

4. **Voltar ao Túnel:**
   - Vá em **Networks** > **Conectores** > **ctrldespesas**
   - Configure o hostname como `cdespesas.workers.dev`

---

### Método 2: Usar Domínio Existente

Se você já tem um worker criado:

1. **Vá em Workers & Pages**
2. **Veja seus workers existentes**
3. **Use o domínio que já existe** (ex: `seu-worker.workers.dev`)

---

## 🎯 Solução Alternativa: Usar Modo Temporário

Se você só precisa testar AGORA, use o modo temporário que cria URL automaticamente:

```bash
# Parar serviço atual
sudo systemctl stop cloudflared

# Rodar em modo temporário
cloudflared tunnel --url http://localhost:3000
```

Isso criará uma URL como `https://random-name.trycloudflare.com` imediatamente!

**Para manter rodando:**

```bash
# Usar screen
screen -S cloudflared
cloudflared tunnel --url http://localhost:3000
# Após ver URL, pressione Ctrl+A depois D
```

---

## 🔧 Após Criar o Domínio

### 1. Verificar se Domínio Foi Criado

```bash
# Aguardar alguns segundos e testar
nslookup cdespesas.workers.dev

# Deve mostrar IPs do Cloudflare (não mais NXDOMAIN)
```

### 2. Verificar Configuração do Túnel

```bash
# Verificar arquivo
sudo cat /etc/cloudflared/config.yml
```

**Deve estar assim:**

```yaml
tunnel: ctrldespesas
credentials-file: /root/.cloudflared/35a2a1b2-493a-4072-9f7e-310417737a62.json

ingress:
  - hostname: cdespesas.workers.dev
    service: http://localhost:3000
  - service: http_status:404
```

### 3. Reiniciar Túnel

```bash
# Reiniciar serviço
sudo systemctl restart cloudflared

# Verificar status
sudo systemctl status cloudflared

# Ver logs
sudo journalctl -u cloudflared -n 50
```

### 4. Testar Acesso

Após alguns segundos, teste:

```bash
# Testar DNS
nslookup cdespesas.workers.dev

# Testar acesso (do seu computador)
curl -I https://cdespesas.workers.dev
```

---

## 🆘 Se Ainda Não Funcionar

### Verificar se Domínio Está Configurado no Dashboard

1. **No Dashboard do Cloudflare:**
   - Vá em **Networks** > **Conectores** > **ctrldespesas**
   - Vá na aba **"Rotas do nome do host"** ou **"Public Hostnames"**
   - Verifique se `cdespesas.workers.dev` está listado
   - Se não estiver, adicione manualmente pelo dashboard

### Verificar Logs do Túnel

```bash
# Ver logs detalhados
sudo journalctl -u cloudflared -f

# Procure por mensagens sobre o hostname
# Deve mostrar algo como "Registered tunnel connection"
```

---

## 💡 Dica: Usar Nome Mais Simples

Se `cdespesas.workers.dev` não funcionar, tente:

- `app.workers.dev`
- `ctrldespesas.workers.dev`
- `webapp.workers.dev`

**Importante:** Crie o worker primeiro no Cloudflare antes de usar no túnel!

---

## ✅ Checklist

- [ ] Criei um Worker no Cloudflare (Workers & Pages)
- [ ] O domínio `cdespesas.workers.dev` foi criado automaticamente
- [ ] Verifiquei DNS: `nslookup cdespesas.workers.dev` (não mostra mais NXDOMAIN)
- [ ] Configurei o túnel com o hostname correto
- [ ] Reiniciei o serviço Cloudflare
- [ ] Testei acesso: `https://cdespesas.workers.dev`

---

## 🚀 Solução Mais Rápida: Modo Temporário

Se você só precisa testar agora:

```bash
sudo systemctl stop cloudflared
cloudflared tunnel --url http://localhost:3000
```

Isso funciona imediatamente sem precisar criar domínio!

---

**✅ Crie o Worker primeiro no Cloudflare, depois configure o túnel!**
