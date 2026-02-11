# 🎯 Solução Final: Erro de API Key Inválida

## ✅ Status Atual

O console mostra que:
- ✅ Firebase está configurado corretamente
- ✅ API Key está sendo carregada: `AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0`
- ✅ Todas as variáveis estão corretas

**MAS** ainda há erro `auth/api-key-not-valid` ao tentar fazer login.

---

## 🔍 Causa Provável

A API Key pode ter **restrições** no Google Cloud Console que estão bloqueando o uso do localhost.

---

## ✅ Solução: Verificar e Ajustar Restrições

### Método 1: Via Google Cloud Console (Recomendado)

1. **Acesse**: https://console.cloud.google.com/
2. **Selecione o projeto**: "controle-de-despesas-78687"
3. **Vá em**: "APIs e serviços" > "Credenciais"
4. **Procure pela API Key**: `AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0`
5. **Clique na API Key** para abrir configurações
6. **Verifique "Restrições de aplicativo"**:
   - Se estiver **"Nenhuma"** = OK ✅
   - Se tiver restrições, adicione `localhost:3000` e `localhost:3001`
7. **Verifique "Restrições de API"**:
   - Se estiver **"Não restringir chave"** = OK ✅
   - Se tiver restrições, certifique-se de que **"Identity Toolkit API"** está habilitada
8. **Salve** as alterações
9. **Aguarde 1-2 minutos** para propagar
10. **Teste o login novamente**

### Método 2: Remover Restrições Temporariamente (Para Teste)

1. Na página da API Key, clique em **"Editar"**
2. **Restrições de aplicativo**: Selecione **"Nenhuma"**
3. **Restrições de API**: Selecione **"Não restringir chave"**
4. Clique em **"Salvar"**
5. Aguarde e teste

### Método 3: Verificar se Identity Toolkit API está Habilitada

1. No Google Cloud Console, vá em **"APIs e serviços"** > **"Biblioteca"**
2. Procure por **"Identity Toolkit API"**
3. Se não estiver habilitada, clique em **"Ativar"**
4. Aguarde a ativação
5. Teste o login

---

## 🔄 Alternativa: Usar API Key do App Android

Se o app Android está funcionando, você pode usar a mesma API Key:

1. No Firebase Console, vá em **"Configurações do projeto"**
2. Role até **"Seus apps"**
3. Clique no **app Android** (não o Web)
4. Veja as credenciais
5. Use a mesma API Key no `.env.local`
6. Reinicie o servidor

---

## 📋 Checklist de Verificação

- [ ] API Key não tem restrições OU localhost está permitido
- [ ] Identity Toolkit API está habilitada no Google Cloud
- [ ] Aguardou 1-2 minutos após ajustar restrições
- [ ] Navegador foi fechado e reaberto
- [ ] Servidor foi reiniciado após qualquer mudança

---

## 🐛 Se Nada Funcionar

### Criar Nova API Key Sem Restrições

1. No Firebase Console > Configurações do projeto
2. Role até "Seus apps" > App Web
3. Clique nos **3 pontinhos** ao lado do app
4. Selecione **"Gerenciar chaves da API"**
5. Clique em **"Criar chave"**
6. Dê um nome: "CtrlDespesas Web - Sem Restrições"
7. **NÃO adicione restrições** (deixe tudo aberto para teste)
8. Copie a nova API Key
9. Atualize o `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=nova_api_key_aqui
   ```
10. Reinicie o servidor
11. Teste o login

---

## 💡 Dica Importante

Para produção, você deve adicionar restrições de segurança. Mas para desenvolvimento/teste, pode deixar sem restrições temporariamente.

---

## 📞 Próximos Passos

1. Verifique as restrições da API Key no Google Cloud Console
2. Ajuste conforme necessário
3. Aguarde alguns minutos
4. Teste o login novamente
5. Compartilhe o resultado
