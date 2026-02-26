# 🔍 Como Encontrar "Public Hostnames" no Cloudflare Dashboard

## 🎯 Você Está Aqui

Você está na página de detalhes do túnel `ctrldespesas`, vendo o painel lateral direito com as informações.

---

## ✅ Método 1: Clicar no Botão "Editar"

1. **No painel lateral direito**, você vê um botão azul **"Editar"**
2. **Clique nele**
3. Isso abrirá a página de edição do túnel
4. Procure por uma aba ou seção chamada:
   - **"Public Hostnames"**
   - **"Hostnames Públicos"**
   - **"Routes"** ou **"Rotas"**
   - **"Ingress Rules"**

---

## ✅ Método 2: Clicar no Nome do Túnel na Tabela

1. **Feche o painel lateral** (clique fora dele ou pressione ESC)
2. **Na tabela principal**, clique diretamente no **nome "ctrldespesas"**
3. Isso deve abrir uma página completa de configuração do túnel
4. Procure por abas no topo como:
   - **"Configuration"** / **"Configuração"**
   - **"Public Hostnames"** / **"Hostnames Públicos"**
   - **"Routes"** / **"Rotas"**

---

## ✅ Método 3: Via ID do Conector

1. **No painel lateral direito**, você vê:
   - **ID do conector:** `50803bc5-c117-4845-aea5-674c77dedbef`
2. **Clique no link** (tem um ícone de link externo)
3. Isso abrirá a página do conector
4. Procure por **"Public Hostnames"** ou **"Routes"**

---

## ✅ Método 4: Via Menu de Configuração

1. **No painel lateral direito**, procure por:
   - Um menu de três pontos (`...`)
   - Ou um ícone de engrenagem
   - Ou links de navegação
2. Clique e procure por opções como:
   - **"Configure"** / **"Configurar"**
   - **"Manage Routes"** / **"Gerenciar Rotas"**
   - **"Add Hostname"** / **"Adicionar Hostname"**

---

## 🎯 Solução Mais Provável

### Passo a Passo Visual:

1. **Clique no botão "Editar"** (azul, no painel lateral direito)
2. Isso deve abrir uma nova página ou expandir o painel
3. **Procure por abas no topo** da página/painel:
   - Pode estar como **"Public Hostnames"**
   - Ou **"Ingress"**
   - Ou **"Routes"**
4. **Se não encontrar abas**, procure por um botão:
   - **"+ Add public hostname"**
   - **"+ Adicionar hostname público"**
   - **"Create route"**

---

## 🔍 Onde Geralmente Está

A opção de Public Hostnames geralmente está em uma destas localizações:

### Localização A: Aba Separada
```
[Overview] [Configuration] [Public Hostnames] [Connectors]
                              ↑ Clique aqui
```

### Localização B: Dentro de Configuration
```
Configuration
  ├── General Settings
  ├── Public Hostnames  ← Aqui!
  └── Private Networks
```

### Localização C: Botão de Ação
```
[Informações do Túnel]
[Botão: + Add public hostname]  ← Clique aqui
```

---

## 💡 Dica: Buscar na Página

1. Pressione **Ctrl+F** (ou Cmd+F no Mac)
2. Digite: **"hostname"** ou **"public"** ou **"route"**
3. Isso destacará onde está a opção na página

---

## 🆘 Se Ainda Não Encontrar

### Alternativa: Configurar via Arquivo na VPS

Se não conseguir encontrar no dashboard, você pode configurar diretamente no arquivo:

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

**⚠️ IMPORTANTE:** Você ainda precisa criar o domínio Workers.dev no dashboard primeiro!

---

## 📸 O Que Procurar

Procure por textos como:
- **"Public Hostnames"**
- **"Hostnames Públicos"**
- **"Add public hostname"**
- **"Adicionar hostname público"**
- **"Routes"** / **"Rotas"**
- **"Ingress"**
- **"Configure ingress"**

---

## 🎯 Próximos Passos

1. **Tente o Método 1 primeiro** (botão "Editar")
2. **Se não encontrar**, tente o Método 2 (clicar no nome na tabela)
3. **Use Ctrl+F** para buscar na página
4. **Se ainda não encontrar**, me diga o que aparece quando você clica em "Editar"

---

**✅ Tente clicar no botão "Editar" primeiro e me diga o que aparece!**
