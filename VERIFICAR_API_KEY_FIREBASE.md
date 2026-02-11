# 🔑 Verificar API Key no Firebase Console

## ✅ Boa Notícia

O console mostra que o Firebase está configurado corretamente:
- ✅ API Key está sendo carregada: `AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0`
- ✅ Project ID correto: `controle-de-despesas-78687`
- ✅ Auth Domain correto: `controle-de-despesas-78687.firebaseapp.com`

## ⚠️ Mas ainda há erro de API Key inválida

Isso pode significar que a API Key tem **restrições** no Firebase Console que estão bloqueando o uso.

---

## 🔍 Verificar Restrições da API Key

### Passo 1: Acessar Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Selecione o projeto: **"controle-de-despesas-78687"**
3. Se pedir para ativar APIs, clique em "Ativar"

### Passo 2: Verificar API Key

1. No menu lateral, vá em **"APIs e serviços"** > **"Credenciais"**
2. Procure pela API Key que começa com `AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0`
3. Clique na API Key para abrir as configurações

### Passo 3: Verificar Restrições

Na página de configuração da API Key, verifique:

#### Restrições de aplicativo
- Se estiver **"Nenhuma"** = OK ✅
- Se tiver restrições HTTP, verifique se `localhost:3000` e `localhost:3001` estão permitidos

#### Restrições de API
- Verifique se **"Identity Toolkit API"** está habilitada
- Se não estiver, habilite ou remova as restrições temporariamente

### Passo 4: Solução Rápida (Teste)

**Opção A: Remover Restrições Temporariamente** (para testar)

1. Na página da API Key, clique em **"Editar"**
2. Em **"Restrições de aplicativo"**, selecione **"Nenhuma"**
3. Em **"Restrições de API"**, selecione **"Não restringir chave"**
4. Clique em **"Salvar"**
5. Aguarde alguns segundos
6. Tente fazer login novamente

**Opção B: Adicionar Restrições Corretas**

Se quiser manter restrições:
1. **Restrições de aplicativo**: Adicione `localhost:3000` e `localhost:3001`
2. **Restrições de API**: Habilite apenas "Identity Toolkit API"

---

## 🔍 Verificar APIs Habilitadas

1. No Google Cloud Console, vá em **"APIs e serviços"** > **"Biblioteca"**
2. Procure por **"Identity Toolkit API"**
3. Verifique se está **habilitada**
4. Se não estiver, clique em **"Ativar"**

---

## 🔄 Alternativa: Criar Nova API Key

Se a API Key atual tiver muitos problemas:

1. No Firebase Console > Configurações do projeto
2. Role até **"Seus apps"** > App Web
3. Clique nos **3 pontinhos** ao lado do app
4. Selecione **"Gerenciar chaves da API"**
5. Crie uma nova API Key sem restrições
6. Atualize o `.env.local` com a nova API Key
7. Reinicie o servidor

---

## ✅ Teste Após Ajustar

1. Ajuste as restrições da API Key
2. Aguarde 1-2 minutos (pode levar tempo para propagar)
3. Feche e reabra o navegador
4. Tente fazer login novamente

---

## 📞 Se Ainda Não Funcionar

Compartilhe:
1. Se a API Key tem restrições no Google Cloud Console
2. Se a "Identity Toolkit API" está habilitada
3. Qualquer erro diferente que apareça
