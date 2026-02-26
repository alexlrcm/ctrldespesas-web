# 🌐 Como Adicionar Rota Pública ao Túnel Cloudflare

## ✅ Situação Atual

Seu túnel `ctrldespesas` está criado e funcionando, mas não tem rotas públicas configuradas (por isso não há URL).

---

## 🎯 Passo a Passo: Adicionar Rota Pública

### Passo 1: Abrir Configuração do Túnel

1. No dashboard do Cloudflare, você está na página **Networks > Conectores**
2. **Clique no nome do túnel** `ctrldespesas` (não no ícone de informação)
3. Isso abrirá a página de configuração do túnel

### Passo 2: Adicionar Public Hostname

Na página do túnel, você verá:

1. **Abas no topo:** Procure por **"Public Hostnames"** ou **"Hostnames Públicos"**
2. **OU procure por um botão:** "Add a public hostname" ou "Adicionar hostname público"
3. **Clique para adicionar**

### Passo 3: Configurar Hostname

Você terá duas opções:

#### Opção A: Usar Domínio Próprio (se tiver)

- **Subdomain:** `app` (ou `ctrldespesas`, ou o que preferir)
- **Domain:** Selecione seu domínio (ex: `projmanager.com.br`)
- **Service:** `http://localhost:3000`
- **Path:** Deixe vazio (ou `/` se pedir)
- Clique em **Save** ou **Salvar**

#### Opção B: Usar Workers.dev (Gratuito - Recomendado)

- **Subdomain:** `ctrldespesas` (ou o que preferir)
- **Domain:** Escolha um domínio `.workers.dev` disponível
  - Exemplo: `ctrldespesas.your-account.workers.dev`
  - Se não aparecer, você pode criar um novo
- **Service:** `http://localhost:3000`
- **Path:** Deixe vazio
- Clique em **Save** ou **Salvar**

### Passo 4: Aguardar e Testar

Após salvar:

1. Aguarde alguns segundos (geralmente 10-30 segundos)
2. A rota aparecerá na lista de hostnames públicos
3. Você verá a URL completa (ex: `https://ctrldespesas.workers.dev`)
4. Teste acessando no navegador!

---

## 🔍 Se Não Encontrar a Opção

### Alternativa: Via Configuração do Conector

1. Na lista de túneis, clique no **ID do conector** (link com ícone externo)
   - Para `ctrldespesas`: `50803bc5-c117-4845-aea5-674c77dedbef`
2. Isso abrirá a página do conector
3. Procure por **"Public Hostnames"** ou **"Routes"**
4. Adicione uma nova rota pública

### Ou Editar Configuração Manualmente

Se preferir editar o arquivo de configuração:

```bash
# Editar configuração na VPS
sudo nano /etc/cloudflared/config.yml
```

**Adicionar hostname:**

```yaml
tunnel: ctrldespesas
credentials-file: /root/.cloudflared/35a2a1b2-493a-4072-9f7e-310417737a62.json

ingress:
  - hostname: ctrldespesas.workers.dev  # OU seu-dominio.com.br
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

**⚠️ IMPORTANTE:** Você ainda precisa configurar o domínio no Dashboard do Cloudflare primeiro!

---

## 📋 Checklist

- [ ] Túnel `ctrldespesas` existe e está saudável ✅
- [ ] Acessei a página de configuração do túnel
- [ ] Adicionei um Public Hostname
- [ ] Configurei Service como `http://localhost:3000`
- [ ] Salvei a configuração
- [ ] Aguardei alguns segundos
- [ ] Testei a URL no navegador

---

## 🆘 Problemas Comuns

### Não encontro a opção "Public Hostname"

**Solução:**
- Procure por **"Routes"** ou **"Rotas"**
- Ou clique no **ID do conector** para ver mais opções
- Verifique se está na aba correta do túnel

### Domínio Workers.dev não aparece

**Solução:**
- Você pode criar um novo domínio Workers.dev
- Ou usar um domínio próprio se tiver configurado no Cloudflare

### Rota não funciona após adicionar

**Solução:**
```bash
# Verificar se serviço está rodando
sudo systemctl status cloudflared

# Reiniciar serviço
sudo systemctl restart cloudflared

# Ver logs
sudo journalctl -u cloudflared -n 50
```

---

## 💡 Dica: URL Rápida com Workers.dev

A forma mais rápida:

1. Clique no túnel `ctrldespesas`
2. Vá em **Public Hostnames** > **Add a public hostname**
3. **Subdomain:** `ctrldespesas`
4. **Domain:** Escolha qualquer `.workers.dev` disponível
5. **Service:** `http://localhost:3000`
6. **Save**

**Resultado:** `https://ctrldespesas.workers.dev` (ou similar)

---

**✅ Após adicionar a rota, sua URL estará disponível!**
