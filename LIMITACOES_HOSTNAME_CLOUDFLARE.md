# 🌐 Limitações e Opções para Hostname no Cloudflare

## ⚠️ Limitações Importantes

**NÃO**, você não pode colocar qualquer nome! Existem algumas regras:

---

## ✅ Opções Disponíveis

### Opção 1: Domínio Workers.dev (Gratuito - Recomendado)

**Formato:** `seu-nome.workers.dev`

**Exemplos válidos:**
- `ctrldespesas.workers.dev`
- `app-ctrldespesas.workers.dev`
- `meuapp.workers.dev`

**Como usar:**
1. No campo "Nome do host", digite: `ctrldespesas.workers.dev`
   - **Subdomain:** `ctrldespesas`
   - **Domain:** Escolha `workers.dev` (ou seu domínio workers.dev específico)

**⚠️ IMPORTANTE:** 
- O domínio `workers.dev` precisa estar disponível na sua conta Cloudflare
- Se não aparecer, você pode criar um novo domínio Workers.dev

---

### Opção 2: Domínio Próprio (Se Você Tiver)

**Formato:** `subdominio.seu-dominio.com.br`

**Exemplos válidos:**
- `app.projmanager.com.br`
- `ctrldespesas.projmanager.com.br`
- `www.projmanager.com.br`

**Como usar:**
1. No campo "Nome do host", digite: `app.projmanager.com.br`
2. O domínio precisa estar:
   - Configurado no Cloudflare
   - Com DNS apontando para Cloudflare

**⚠️ IMPORTANTE:**
- Você precisa ter o domínio configurado no Cloudflare primeiro
- O domínio precisa estar ativo na sua conta

---

### Opção 3: Domínio Privado (Para Rede Interna)

**Formato:** `nome.local` ou `nome.internal`

**Exemplos:**
- `app.local`
- `ctrldespesas.internal`

**⚠️ LIMITAÇÃO:** 
- Só funciona dentro da sua rede privada
- Não é acessível pela internet pública
- Precisa configurar políticas de resolvedor DNS

---

## ❌ O Que NÃO Funciona

### Não Pode Usar:

1. **Nomes sem domínio:**
   - ❌ `ctrldespesas` (sem `.com`, `.dev`, etc.)
   - ❌ `meu-app` (sem domínio)

2. **Domínios que você não possui:**
   - ❌ `google.com`
   - ❌ `facebook.com`
   - ❌ Qualquer domínio que não seja seu

3. **Domínios não configurados no Cloudflare:**
   - ❌ Se você tem `projmanager.com.br` mas não está no Cloudflare

---

## 🎯 Recomendação para Você

### Use Workers.dev (Mais Fácil):

**No campo "Nome do host", digite:**

```
ctrldespesas.workers.dev
```

**OU se preferir outro nome:**

```
app-ctrldespesas.workers.dev
```

**Depois, configure o serviço:**

- **Service:** `http://localhost:3000`
- **Path:** Deixe vazio (ou `/`)

---

## 📋 Formato Correto do Hostname

### Estrutura:

```
[subdomain].[domain]
```

**Exemplos válidos:**

✅ `ctrldespesas.workers.dev`
✅ `app.projmanager.com.br`
✅ `meuapp.workers.dev`
✅ `www.meusite.com.br`

**Exemplos inválidos:**

❌ `ctrldespesas` (sem domínio)
❌ `app` (sem domínio)
❌ `google.com` (não é seu domínio)

---

## 🔍 Como Verificar Domínios Disponíveis

### Para Workers.dev:

1. No campo de hostname, comece a digitar
2. O Cloudflare mostrará domínios disponíveis
3. Escolha um que esteja disponível

### Para Domínio Próprio:

1. O domínio precisa estar na sua conta Cloudflare
2. Vá em **"Overview"** > **"Domains"** para ver seus domínios
3. Use apenas domínios que aparecem lá

---

## 💡 Dica: Criar Domínio Workers.dev

Se o domínio `workers.dev` não aparecer:

1. Vá em **Workers & Pages** no menu do Cloudflare
2. Clique em **"Create application"**
3. Escolha **"Workers"**
4. Crie um worker (pode ser qualquer nome)
5. Isso criará o domínio `workers.dev` disponível

---

## ✅ Checklist Antes de Configurar

- [ ] Escolhi um formato válido: `nome.workers.dev` ou `subdominio.meu-dominio.com.br`
- [ ] Verifiquei que o domínio está disponível ou é meu
- [ ] Configurei o Service como `http://localhost:3000`
- [ ] Deixei Path vazio (ou `/`)

---

## 🎯 Exemplo Prático para Você

**No campo "Nome do host", digite exatamente:**

```
ctrldespesas.workers.dev
```

**OU se preferir:**

```
app.workers.dev
```

**Depois:**

1. Configure **Service:** `http://localhost:3000`
2. **Path:** Deixe vazio
3. **Descrição:** (opcional) "CtrlDespesas Web App"
4. Clique em **"Salvar"** ou **"Save"**

**Resultado:** Sua aplicação estará disponível em `https://ctrldespesas.workers.dev`!

---

## 🆘 Se Der Erro

### Erro: "Domain not found"

**Solução:** Use `workers.dev` ou configure um domínio próprio no Cloudflare primeiro.

### Erro: "Hostname already in use"

**Solução:** Escolha outro nome, ex: `app-ctrldespesas.workers.dev`

### Erro: "Invalid hostname format"

**Solução:** Certifique-se de usar o formato `nome.dominio.com` (com ponto e domínio válido)

---

**✅ Use `ctrldespesas.workers.dev` ou `app.workers.dev` - são as opções mais simples!**
