# 🔍 Debug: Problemas no Login

## Erro: "Erro ao autenticar. Tente novamente."

### Passo 1: Verificar Console do Navegador

1. **Abra o Console**:
   - Pressione **F12** no navegador
   - Vá na aba **"Console"**

2. **Procure por mensagens**:
   - ✅ "Firebase configurado corretamente" = Firebase OK
   - ❌ "Variáveis Firebase não configuradas" = Problema no `.env.local`
   - ❌ "Firebase Auth não está configurado" = Problema na inicialização
   - ❌ Erros em vermelho = Veja a mensagem específica

### Passo 2: Verificar Arquivo .env.local

1. **Verifique se o arquivo existe**:
   ```powershell
   cd web-app
   dir .env.local
   ```

2. **Verifique o conteúdo**:
   ```powershell
   type .env.local
   ```

3. **Certifique-se de que TODAS as variáveis estão preenchidas**:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza... (não pode estar vazio)
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=... (não pode estar vazio)
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=... (não pode estar vazio)
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=... (não pode estar vazio)
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=... (não pode estar vazio)
   NEXT_PUBLIC_FIREBASE_APP_ID=... (não pode estar vazio)
   ```

### Passo 3: Reiniciar Servidor

**IMPORTANTE**: Após criar ou editar `.env.local`, você DEVE reiniciar o servidor:

1. Pare o servidor: `Ctrl+C`
2. Execute novamente: `npm run dev`
3. Acesse: http://localhost:3001/login

### Passo 4: Verificar Firebase Console

1. **Confirme que o usuário existe**:
   - Firebase Console > Authentication > Users
   - Veja se `admin@giratech.com.br` está listado

2. **Confirme que Email/Password está habilitado**:
   - Firebase Console > Authentication > Sign-in method
   - Email/Password deve estar **Ativado**

3. **Teste a senha**:
   - Certifique-se de que digitou exatamente `123456`
   - Sem espaços antes ou depois

### Passo 5: Verificar Erros Específicos

No console do navegador (F12), procure por:

#### Erro: "auth/user-not-found"
**Causa**: Usuário não existe no Firebase  
**Solução**: Crie o usuário no Firebase Console

#### Erro: "auth/wrong-password"
**Causa**: Senha incorreta  
**Solução**: Verifique se digitou a senha corretamente

#### Erro: "auth/invalid-email"
**Causa**: Email inválido  
**Solução**: Verifique o formato do email

#### Erro: "auth/operation-not-allowed"
**Causa**: Método Email/Password não habilitado  
**Solução**: Habilite em Authentication > Sign-in method

#### Erro: "Firebase: Error (auth/configuration-not-found)"
**Causa**: Firebase não configurado  
**Solução**: Verifique o arquivo `.env.local` e reinicie o servidor

---

## Checklist de Verificação

- [ ] Console do navegador (F12) não mostra erros críticos
- [ ] Arquivo `.env.local` existe e está completo
- [ ] Servidor foi reiniciado após criar/editar `.env.local`
- [ ] Usuário existe no Firebase Console
- [ ] Email/Password está habilitado no Firebase
- [ ] Senha digitada está correta (sem espaços)
- [ ] Email digitado está correto

---

## Teste Rápido

1. **Abra o Console** (F12)
2. **Tente fazer login**
3. **Veja as mensagens no console**:
   - "🔐 Tentando fazer login com: admin@giratech.com.br"
   - "✅ Login bem-sucedido" OU "❌ Erro no login: [detalhes]"

4. **Compartilhe as mensagens** que aparecem no console

---

## Solução Alternativa: Verificar Credenciais Firebase

Se nada funcionar, verifique se as credenciais do Firebase estão corretas:

1. Firebase Console > Configurações do projeto
2. Role até "Seus apps"
3. Clique no app Web
4. Copie as credenciais novamente
5. Cole no `.env.local`
6. Reinicie o servidor

---

## Se Ainda Não Funcionar

Compartilhe:
1. **Mensagens do console** (F12 > Console)
2. **Conteúdo do `.env.local`** (sem mostrar valores reais, apenas confirme que estão preenchidos)
3. **Mensagens do terminal** onde o servidor está rodando
