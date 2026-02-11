# 🔑 Criar Nova API Key Sem Restrições (Solução Mais Simples)

## 🎯 Objetivo

Criar uma nova API Key sem restrições para testar o login rapidamente.

---

## ✅ Método 1: Via Firebase Console (Mais Fácil)

### Passo 1: Acessar Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Selecione o projeto: **"Controle de Despesas"**

### Passo 2: Ir para Configurações

1. Clique no ícone de **engrenagem** ⚙️ ao lado de "Visão geral do projeto"
2. Selecione **"Configurações do projeto"**

### Passo 3: Encontrar App Web

1. Role até a seção **"Seus apps"**
2. Encontre o app Web: **"GCDespesasWeb"**
3. Clique nos **3 pontinhos** (⋮) ao lado do app
4. Selecione **"Gerenciar chaves da API"** ou **"Manage API keys"**

**OU** se não aparecer essa opção:

1. Clique diretamente no app Web
2. Na página que abrir, procure por um link **"Gerenciar chaves da API"**

### Passo 4: Criar Nova Chave

1. Isso deve abrir o Google Cloud Console
2. Clique no botão **"+ Criar chave"** ou **"+ Create credentials"**
3. Selecione **"Chave de API"** ou **"API key"**
4. Dê um nome: **"CtrlDespesas Web - Sem Restrições"**
5. **NÃO adicione restrições** (deixe tudo como padrão)
6. Clique em **"Criar"** ou **"Create"**
7. **Copie a nova API Key** que aparece

### Passo 5: Atualizar .env.local

1. Abra o arquivo `.env.local` na pasta `web-app/`
2. Substitua a linha:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
   ```
   Por:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=nova_api_key_copiada_aqui
   ```

3. Salve o arquivo

### Passo 6: Reiniciar Servidor

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app

# Pare o servidor (Ctrl+C)

# Limpar cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Reiniciar
npm run dev
```

### Passo 7: Testar Login

1. Feche e reabra o navegador
2. Acesse: http://localhost:3000/login (ou a porta mostrada)
3. Tente fazer login

---

## ✅ Método 2: Via Google Cloud Console Direto

Se conseguir acessar o Google Cloud Console:

1. Acesse: https://console.cloud.google.com/
2. Selecione projeto: **"controle-de-despesas-78687"**
3. Vá em **"APIs e serviços"** > **"Credenciais"**
4. Clique em **"+ Criar credenciais"** > **"Chave de API"**
5. Dê um nome e **não adicione restrições**
6. Copie a nova chave
7. Atualize o `.env.local`
8. Reinicie o servidor

---

## 🔄 Método 3: Usar API Key do App Android

Se o app Android está funcionando:

1. Firebase Console > Configurações do projeto
2. "Seus apps" > App Android
3. Veja as credenciais
4. Use a mesma API Key no `.env.local`
5. Reinicie o servidor

---

## ✅ Checklist

- [ ] Nova API Key criada (sem restrições)
- [ ] API Key copiada
- [ ] Arquivo `.env.local` atualizado
- [ ] Servidor reiniciado
- [ ] Cache limpo (.next removido)
- [ ] Navegador fechado e reaberto
- [ ] Login testado

---

## 📞 Se Não Conseguir Criar Nova API Key

Compartilhe:
1. O que aparece quando clica nos 3 pontinhos do app Web
2. Se há opção "Gerenciar chaves da API"
3. Se consegue acessar o Google Cloud Console
