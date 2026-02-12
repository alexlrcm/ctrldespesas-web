# 🚀 Deploy Manual na Vercel - Passo a Passo

## 🎯 Objetivo

Forçar a Vercel a fazer deploy do commit mais recente (`567581a`) que está no GitHub mas não foi detectado automaticamente.

## 📋 Passo a Passo Visual

### Passo 1: Acessar Deployments

1. Na Vercel, clique em **"Deployments"** no menu superior
2. Você verá uma lista de todos os deploys anteriores

### Passo 2: Criar Novo Deploy

**Opção A: Botão "Create Deployment" (Recomendado)**

1. No topo da página de Deployments, procure por um botão:
   - **"Create Deployment"** ou
   - **"Novo Deploy"** ou
   - Um botão com ícone de **"+"** ou **"Add"**
2. Clique nele

**Opção B: Se não encontrar o botão**

1. Clique nos **três pontos** (⋯) de qualquer deploy
2. Selecione **"Redeploy"**
3. Isso vai fazer deploy do mesmo commit, mas pode ajudar

### Passo 3: Configurar o Deploy ⚠️ IMPORTANTE

Quando a janela/modal abrir:

**❌ NÃO USE:** URL completa como `https://github.com/alexlrcm/ctrldespesas-web/tree/main`

**✅ USE UMA DAS OPÇÕES:**

**Opção 1: Apenas o hash do commit (Recomendado)**
1. No campo **"Commit or Branch Reference"**, apague tudo
2. Digite apenas: `567581a`
3. Ou o hash completo: `567581ac744866d7f90e8598d6f6393d8b76d4a9`

**Opção 2: Apenas o nome do branch**
1. No campo **"Commit or Branch Reference"**, apague tudo
2. Digite apenas: `main`

**Opção 3: Se aparecer dropdown de commits**
- Selecione o commit `567581a` ("Forçar novo deploy - atualizar cache") no dropdown

### Passo 4: Confirmar e Aguardar

1. Clique em **"Deploy"** ou **"Create"**
2. Aguarde 2-3 minutos enquanto o deploy acontece
3. Você verá o progresso em tempo real

### Passo 5: Verificar

1. Após o deploy concluir, verifique:
   - O **commit hash** deve ser `567581a` (ou pelo menos não ser `00714b2`)
   - O status deve estar **"Ready"** (verde)
2. Acesse sua aplicação e teste se as alterações aparecem

## 🔄 Alternativa: Reconectar Repositório

Se o deploy manual não funcionar:

1. Vá em **Settings > Git**
2. Clique em **"Disconnect"**
3. Clique em **"Connect Git Repository"**
4. Selecione **alexlrcm/ctrldespesas-web**
5. Autorize a conexão
6. Isso vai fazer um novo deploy automaticamente

## ✅ O Que Esperar

Após o deploy manual:

- ✅ Novo deploy aparece na lista com commit `567581a`
- ✅ Status fica "Ready" (verde)
- ✅ Suas alterações aparecem na aplicação
- ✅ Header fixo funciona em todas as páginas

## 🆘 Se Ainda Não Funcionar

### Solução 1: Usar Apenas o Hash do Commit

Se aparecer erro "A commit author is required":
1. **Apague** a URL completa do campo
2. Digite apenas: `567581a` (sem URL, sem `https://`, sem nada mais)
3. Clique em "Create Deployment"

### Solução 2: Fazer Novo Commit para Forçar Deploy Automático

Se o deploy manual não funcionar, force um novo deploy automático:

```powershell
# Criar commit vazio (não altera código, só força deploy)
git commit --allow-empty -m "Forçar deploy Vercel - atualizar cache"

# Enviar para GitHub
git push origin main
```

Depois:
- Aguarde 2-3 minutos
- A Vercel deve detectar automaticamente o novo commit
- Um novo deploy aparecerá na lista

### Solução 3: Reconectar Repositório (Último Recurso)

1. Vá em **Settings > Git**
2. Clique em **"Disconnect"**
3. Clique em **"Connect Git Repository"**
4. Selecione **alexlrcm/ctrldespesas-web**
5. Autorize a conexão
6. Isso vai fazer um novo deploy automaticamente do último commit
