# 🔍 Como Descobrir a URL do Cloudflare Tunnel

## ✅ Verificar URL Atual

### Método 1: Ver Logs do Serviço

```bash
# Ver logs recentes do Cloudflare Tunnel
sudo journalctl -u cloudflared -n 50 --no-pager

# OU ver logs em tempo real
sudo journalctl -u cloudflared -f
```

Procure por linhas que contenham URLs como:
- `https://random-name.trycloudflare.com`
- `https://seu-tunel.workers.dev`
- Ou qualquer URL `https://`

### Método 2: Verificar Configuração Atual

```bash
# Ver arquivo de configuração
sudo cat /etc/cloudflared/config.yml
```

Se tiver `hostname` configurado, essa é sua URL!

### Método 3: Listar Túneis e Rotas

```bash
# Listar túneis criados
cloudflared tunnel list

# Ver rotas do túnel (se configurado com domínio)
cloudflared tunnel route dns list ctrldespesas
```

### Método 4: Testar Manualmente

```bash
# Parar serviço temporariamente
sudo systemctl stop cloudflared

# Rodar manualmente para ver a URL
cloudflared tunnel --config /etc/cloudflared/config.yml run
```

A URL aparecerá nos logs quando o túnel iniciar!

---

## 🌐 Tipos de URL Possíveis

### 1. URL Temporária (trycloudflare.com)

Se você rodou `cloudflared tunnel --url http://localhost:3000` sem configuração:

```
https://random-name.trycloudflare.com
```

**Características:**
- ✅ Funciona imediatamente
- ⚠️ URL muda a cada reinício (modo temporário)
- ⚠️ Não funciona como serviço permanente

### 2. URL com Domínio Próprio

Se você configurou um domínio no Cloudflare:

```
https://seu-dominio.com.br
```

### 3. URL Workers.dev (Gratuita)

Se você configurou no dashboard do Cloudflare:

```
https://ctrldespesas.your-account.workers.dev
```

---

## 🔧 Como Configurar URL Fixa

### Opção 1: Usar Domínio Próprio

1. **Acesse o Dashboard do Cloudflare:**
   - https://dash.cloudflare.com/
   - Vá em **Zero Trust** > **Networks** > **Tunnels**

2. **Configure o túnel:**
   - Selecione seu túnel `ctrldespesas`
   - Adicione uma rota pública
   - Configure o domínio desejado

### Opção 2: Usar Workers.dev (Gratuito)

1. **No Dashboard do Cloudflare:**
   - Vá em **Zero Trust** > **Networks** > **Tunnels**
   - Selecione seu túnel
   - Adicione rota pública
   - Escolha um subdomínio `.workers.dev`

### Opção 3: Ver URL Atual nos Logs

```bash
# Ver URL atual sendo usada
sudo journalctl -u cloudflared -n 100 | grep -i "https://"
```

---

## 🚀 Solução Rápida: Descobrir URL Agora

Execute estes comandos na ordem:

```bash
# 1. Ver configuração atual
echo "=== Configuração ==="
sudo cat /etc/cloudflared/config.yml

# 2. Ver logs recentes procurando por URL
echo ""
echo "=== Procurando URL nos logs ==="
sudo journalctl -u cloudflared -n 200 | grep -E "(https://|trycloudflare|workers.dev)" | tail -5

# 3. Se não encontrar, verificar rotas DNS
echo ""
echo "=== Rotas DNS ==="
cloudflared tunnel route dns list ctrldespesas 2>/dev/null || echo "Nenhuma rota DNS configurada"

# 4. Testar acesso direto (se souber o domínio)
echo ""
echo "=== Testando acesso ==="
echo "Tente acessar: https://ctrldespesas.your-account.workers.dev"
```

---

## 💡 Dica: Criar URL Fixa Rápida

Se você quer uma URL fixa agora mesmo:

```bash
# 1. Parar serviço
sudo systemctl stop cloudflared

# 2. Rodar manualmente para ver URL temporária
cloudflared tunnel --url http://localhost:3000
```

Isso mostrará uma URL como `https://abc123.trycloudflare.com` que você pode usar imediatamente!

---

## 📋 Checklist

- [ ] Serviço está rodando (`sudo systemctl status cloudflared`)
- [ ] Verifiquei os logs (`sudo journalctl -u cloudflared -n 50`)
- [ ] Verifiquei a configuração (`sudo cat /etc/cloudflared/config.yml`)
- [ ] Testei acesso à URL encontrada

---

**✅ Execute os comandos acima para descobrir sua URL!**
