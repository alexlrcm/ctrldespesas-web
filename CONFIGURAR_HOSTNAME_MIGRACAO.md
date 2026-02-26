# 🌐 Configurar Hostname na Tela de Migração

## ✅ Você Está Aqui

Você está na tela de **"Verificar a configuração remota de ctrldespesas"** durante o processo de migração.

---

## 🎯 O Que Fazer Agora

### Opção 1: Completar Migração Primeiro (Recomendado)

1. **Na parte inferior da tela**, você vê:
   - "Regra completa: http://localhost:3000" com botão **"Editar"**
   - Botões: **"Cancelar e sair"** e **"Confirmar"**

2. **Clique em "Confirmar"** (botão azul) para completar a migração

3. **Após migrar**, você será redirecionado para a página do túnel

4. **Na página do túnel migrado**, procure por:
   - Aba **"Public Hostnames"** ou **"Hostnames Públicos"**
   - OU botão **"+ Add public hostname"**

5. **Adicione o hostname público** lá

---

### Opção 2: Adicionar Rota Agora (Se Disponível)

Na tela atual, você pode tentar:

1. **Procure por um botão ou link** que diga:
   - **"Add public hostname"**
   - **"Adicionar hostname público"**
   - **"Public Hostnames"** (pode estar em uma aba ou menu)

2. **Se encontrar**, clique e configure:
   - **Subdomain:** `ctrldespesas` (ou o que preferir)
   - **Domain:** Escolha um `.workers.dev` ou domínio próprio
   - **Service:** `http://localhost:3000`

3. **Depois**, clique em **"Confirmar"** para completar a migração

---

## 🔍 Onde Procurar o Botão de Hostname

### Locais Comuns:

1. **No topo da página:**
   - Procure por abas: **"Public Hostnames"**, **"Routes"**, **"Ingress"**

2. **Na seção "Rotas de aplicativo publicadas":**
   - Pode haver um botão **"+ Adicionar hostname público"** além do botão CIDR

3. **No menu lateral:**
   - Procure por **"Public Hostnames"** ou **"Hostnames Públicos"**

4. **Use Ctrl+F:**
   - Pressione `Ctrl+F` e busque por: **"hostname"**, **"public"**, **"domain"**

---

## 💡 Solução Mais Simples: Completar Migração Primeiro

**Recomendação:** Complete a migração primeiro e depois adicione o hostname:

1. **Clique em "Confirmar"** (botão azul na parte inferior)
2. Aguarde a migração completar
3. Você será redirecionado para a página do túnel
4. **Lá você encontrará facilmente** a opção de adicionar Public Hostname

---

## 🎯 Passo a Passo Recomendado

### Passo 1: Completar Migração

1. Na parte inferior, clique no botão azul **"Confirmar"**
2. Aguarde alguns segundos
3. A migração será concluída

### Passo 2: Adicionar Public Hostname

Após a migração:

1. Você estará na página principal do túnel `ctrldespesas`
2. Procure por uma aba **"Public Hostnames"** ou **"Routes"**
3. Clique em **"+ Add public hostname"** ou **"+ Adicionar hostname público"**
4. Configure:
   - **Subdomain:** `ctrldespesas`
   - **Domain:** Escolha um `.workers.dev` disponível
   - **Service:** `http://localhost:3000`
5. Clique em **"Save"** ou **"Salvar"**

### Passo 3: Testar

Após adicionar, aguarde alguns segundos e teste a URL!

---

## 🆘 Se Não Encontrar Após Migrar

Se após migrar você ainda não encontrar a opção:

### Alternativa: Configurar via Arquivo

```bash
# Na VPS, editar configuração
sudo nano /etc/cloudflared/config.yml
```

**Adicionar hostname:**

```yaml
tunnel: ctrldespesas
credentials-file: /root/.cloudflared/35a2a1b2-493a-4072-9f7e-310417737a62.json

ingress:
  - hostname: ctrldespesas.workers.dev
    service: http://localhost:3000
  - service: http_status:404
```

**Salvar:** `Ctrl+X`, `Y`, `Enter`

```bash
# Reiniciar serviço
sudo systemctl restart cloudflared
```

---

## 📋 Checklist

- [ ] Estou na tela de migração
- [ ] Vi a seção "Rotas de aplicativo publicadas"
- [ ] Procurei por botão "Add public hostname" (se não encontrar, tudo bem)
- [ ] Vou clicar em "Confirmar" para completar migração
- [ ] Após migrar, vou procurar aba "Public Hostnames"
- [ ] Vou adicionar um hostname público
- [ ] Vou testar a URL

---

## ✅ Próximo Passo

**Clique no botão azul "Confirmar"** na parte inferior da tela para completar a migração. Depois você poderá adicionar o hostname público facilmente!

---

**💡 Dica:** É mais fácil adicionar o hostname após completar a migração. O dashboard ficará mais completo e organizado.
