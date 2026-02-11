# 🔍 Como Acessar Google Cloud Console para Verificar API Key

## ⚠️ Importante

As configurações de **restrições da API Key** estão no **Google Cloud Console**, não no Firebase Console.

---

## 🚀 Passo a Passo Detalhado

### Passo 1: Acessar Google Cloud Console

1. **Acesse diretamente**: https://console.cloud.google.com/
2. **Faça login** com a mesma conta Google do Firebase
3. **Selecione o projeto**: "controle-de-despesas-78687"
   - Se não aparecer, clique no dropdown no topo e selecione

### Passo 2: Navegar até Credenciais

1. No menu lateral esquerdo, procure por **"APIs e serviços"**
2. Clique em **"APIs e serviços"**
3. No submenu que aparece, clique em **"Credenciais"**

**OU** use o atalho:
- No topo da página, há uma barra de pesquisa
- Digite: **"credenciais"**
- Selecione **"Credenciais"** nos resultados

### Passo 3: Encontrar a API Key

1. Na página de Credenciais, você verá uma lista de **"Chaves de API"**
2. Procure pela chave que começa com: `AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0`
3. **Clique no nome da chave** (não no ícone de copiar)

### Passo 4: Verificar e Ajustar Restrições

Na página de detalhes da API Key:

#### Seção: "Restrições de aplicativo"
- **Opção 1**: Selecione **"Nenhuma"** (para teste rápido)
- **Opção 2**: Se quiser manter restrições, selecione **"Referenciadores HTTP"** e adicione:
  - `localhost:3000`
  - `localhost:3001`
  - `http://localhost:3000`
  - `http://localhost:3001`

#### Seção: "Restrições de API"
- **Opção 1**: Selecione **"Não restringir chave"** (para teste rápido)
- **Opção 2**: Se quiser manter restrições, certifique-se de que **"Identity Toolkit API"** está na lista

### Passo 5: Salvar

1. Role até o final da página
2. Clique em **"Salvar"**
3. Aguarde a confirmação
4. Aguarde 1-2 minutos para propagar

---

## 🔄 Alternativa: Verificar via Firebase Console

Se não conseguir acessar o Google Cloud Console, tente:

1. **No Firebase Console**, vá em **"Configurações do projeto"**
2. Role até **"Seus apps"**
3. Clique no app Web (`GCDespesasWeb`)
4. Procure por um link que diz **"Gerenciar chaves da API"** ou **"Manage API keys"**
5. Isso deve redirecionar para o Google Cloud Console

---

## 🎯 Solução Mais Simples: Criar Nova API Key Sem Restrições

Se não conseguir encontrar as configurações:

### Via Firebase Console:

1. Firebase Console > Configurações do projeto
2. Role até "Seus apps" > App Web (`GCDespesasWeb`)
3. Clique nos **3 pontinhos** (⋮) ao lado do app
4. Selecione **"Gerenciar chaves da API"** ou **"Manage API keys"**
5. Isso abre o Google Cloud Console
6. Clique em **"+ Criar chave"** ou **"+ Create credentials"**
7. Selecione **"Chave de API"** ou **"API key"**
8. Dê um nome: "CtrlDespesas Web - Sem Restrições"
9. **NÃO adicione restrições** (deixe tudo padrão)
10. Clique em **"Criar"** ou **"Create"**
11. **Copie a nova API Key**
12. Atualize o `.env.local`:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=nova_api_key_aqui
    ```
13. Reinicie o servidor
14. Teste o login

---

## 📋 URL Direta para Credenciais

Tente acessar diretamente:

```
https://console.cloud.google.com/apis/credentials?project=controle-de-despesas-78687
```

Isso deve levar você direto para a página de credenciais do projeto.

---

## 🔍 Se Não Conseguir Acessar Google Cloud Console

### Verificar Permissões:

1. No Firebase Console, vá em **"Configurações do projeto"**
2. Aba **"Usuários e permissões"**
3. Verifique se sua conta tem permissão de **"Proprietário"** ou **"Editor"**
4. Se não tiver, peça para alguém com acesso adicionar você

---

## ✅ Teste Rápido: Usar API Key do App Android

Se o app Android está funcionando, você pode tentar usar a mesma API Key:

1. No Firebase Console > Configurações do projeto
2. Role até "Seus apps"
3. Clique no **app Android** (não o Web)
4. Veja as credenciais
5. Use a mesma API Key no `.env.local`
6. Reinicie o servidor
7. Teste o login

---

## 📞 Próximos Passos

1. Tente acessar: https://console.cloud.google.com/
2. Selecione o projeto "controle-de-despesas-78687"
3. Vá em "APIs e serviços" > "Credenciais"
4. Encontre a API Key e ajuste as restrições
5. OU crie uma nova API Key sem restrições
6. Teste o login

Me diga se conseguiu acessar o Google Cloud Console ou se prefere criar uma nova API Key sem restrições.
