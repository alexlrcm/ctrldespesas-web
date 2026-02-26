# 🔧 Corrigir Configuração do Service no Cloudflare

## ❌ Problema Identificado

Na configuração do dashboard, o **Service** está assim:
- **Tipo:** HTTPS ❌
- **URL:** `cdespesas.projmanager.com.br` ❌

**Isso está ERRADO!** Está criando um loop - o túnel está tentando acessar a si mesmo.

---

## ✅ Configuração Correta

O **Service** deve apontar para sua aplicação LOCAL na VPS:

- **Tipo:** HTTP ✅
- **URL:** `http://localhost:3000` ✅

---

## 🎯 Como Corrigir no Dashboard

### Passo 1: Editar a Rota

1. No dashboard do Cloudflare, você está na tela de edição da rota
2. Na seção **"Serviço"**:

### Passo 2: Corrigir Tipo e URL

1. **Tipo:** Mude de `HTTPS` para **`HTTP`**
2. **URL:** Mude de `cdespesas.projmanager.com.br` para **`http://localhost:3000`**

**Deve ficar assim:**

```
Tipo: HTTP
URL: http://localhost:3000
```

### Passo 3: Salvar

1. Clique em **"Salvar"** ou **"Save"**
2. Aguarde alguns segundos

---

## 🔍 Verificar Configuração Correta

### No Dashboard:

**Nome do host:**
- Subdomínio: `cdespesas`
- Domínio: `projmanager.com.br`
- Caminho: (deixe vazio ou `/`)

**Serviço:**
- Tipo: **HTTP** (não HTTPS!)
- URL: **`http://localhost:3000`** (não o domínio!)

---

## 🔧 Verificar na VPS

### Verificar Arquivo de Configuração:

```bash
# Ver configuração atual
sudo cat /etc/cloudflared/config.yml
```

**Deve estar assim:**

```yaml
tunnel: ctrldespesas
credentials-file: /root/.cloudflared/35a2a1b2-493a-4072-9f7e-310417737a62.json

ingress:
  - hostname: cdespesas.projmanager.com.br
    service: http://localhost:3000
  - service: http_status:404
```

**⚠️ IMPORTANTE:** 
- `service: http://localhost:3000` (HTTP, não HTTPS!)
- `localhost:3000` (não o domínio!)

### Se Precisar Corrigir na VPS:

```bash
# Editar configuração
sudo nano /etc/cloudflared/config.yml
```

**Garanta que está assim:**

```yaml
tunnel: ctrldespesas
credentials-file: /root/.cloudflared/35a2a1b2-493a-4072-9f7e-310417737a62.json

ingress:
  - hostname: cdespesas.projmanager.com.br
    service: http://localhost:3000  # ← HTTP e localhost:3000!
  - service: http_status:404
```

**Salvar:** `Ctrl+X`, `Y`, `Enter`

```bash
# Reiniciar serviço
sudo systemctl restart cloudflared

# Verificar status
sudo systemctl status cloudflared
```

---

## ✅ Verificações Finais

### 1. Verificar Aplicação Está Rodando

```bash
# Verificar PM2
pm2 status

# Testar localmente
curl http://localhost:3000
```

### 2. Verificar Túnel Está Rodando

```bash
# Status do serviço
sudo systemctl status cloudflared

# Ver logs
sudo journalctl -u cloudflared -n 50
```

### 3. Verificar DNS

```bash
# DNS deve mostrar IPs do Cloudflare
nslookup cdespesas.projmanager.com.br
```

### 4. Testar Acesso

Após corrigir, aguarde alguns segundos e teste:

```bash
# Do seu computador (não da VPS)
curl -I https://cdespesas.projmanager.com.br
```

**OU** acesse no navegador: `https://cdespesas.projmanager.com.br`

---

## 🆘 Se Ainda Não Funcionar

### Verificar Logs Detalhados

```bash
# Ver logs em tempo real
sudo journalctl -u cloudflared -f

# Procure por:
# - Erros de conexão
# - Mensagens sobre o hostname
# - Problemas com localhost:3000
```

### Verificar se Aplicação Responde

```bash
# Testar acesso local
curl -v http://localhost:3000

# Deve retornar HTML da aplicação
# Se não funcionar, a aplicação não está rodando!
```

### Verificar Porta 3000

```bash
# Verificar se algo está escutando na porta 3000
sudo lsof -i :3000

# Deve mostrar node ou npm
```

---

## 📋 Checklist de Correção

- [ ] No dashboard, mudei Tipo de HTTPS para **HTTP**
- [ ] No dashboard, mudei URL de `cdespesas.projmanager.com.br` para **`http://localhost:3000`**
- [ ] Salvei a configuração no dashboard
- [ ] Verifiquei arquivo `/etc/cloudflared/config.yml` na VPS
- [ ] Confirmei que está `service: http://localhost:3000`
- [ ] Reiniciei o serviço: `sudo systemctl restart cloudflared`
- [ ] Verifiquei que aplicação está rodando: `pm2 status`
- [ ] Testei acesso local: `curl http://localhost:3000`
- [ ] Aguardei alguns segundos após salvar
- [ ] Testei acesso externo: `https://cdespesas.projmanager.com.br`

---

## 💡 Resumo da Correção

**❌ ERRADO:**
```
Tipo: HTTPS
URL: cdespesas.projmanager.com.br
```

**✅ CORRETO:**
```
Tipo: HTTP
URL: http://localhost:3000
```

---

**✅ Corrija no dashboard e teste novamente!**
