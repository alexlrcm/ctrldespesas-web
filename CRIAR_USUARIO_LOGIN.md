# 👤 Como Criar Usuário para Login

## Método 1: Criar Usuário no Firebase Console (Mais Fácil)

### Passo a Passo:

1. **Acesse o Firebase Console**:
   - Vá para: https://console.firebase.google.com/
   - Selecione seu projeto (mesmo usado no app Android)

2. **Vá em Authentication**:
   - No menu lateral, clique em **"Authentication"** (Autenticação)
   - Se ainda não habilitou, clique em **"Começar"** (Get started)

3. **Habilite Email/Password** (se ainda não fez):
   - Clique na aba **"Sign-in method"** (Métodos de login)
   - Clique em **"Email/Password"**
   - Ative o primeiro toggle (Email/Password)
   - Clique em **"Salvar"**

4. **Criar Novo Usuário**:
   - Vá na aba **"Users"** (Usuários)
   - Clique no botão **"Add user"** (Adicionar usuário)
   - Preencha:
     - **Email**: exemplo: `admin@giratech.com.br`
     - **Password**: uma senha segura (mínimo 6 caracteres)
   - Clique em **"Add user"**

5. **Pronto!** Agora você pode usar essas credenciais para fazer login.

---

## Método 2: Criar Usuário via Código (Registro)

Se preferir criar usuários diretamente pelo sistema, podemos implementar uma página de registro. Por enquanto, use o Método 1 acima.

---

## Credenciais de Teste Sugeridas

Você pode criar um usuário de teste com:

**Email**: `teste@giratech.com.br`  
**Senha**: `123456` (ou outra senha segura)

**⚠️ IMPORTANTE**: Use uma senha segura em produção!

---

## Como Fazer Login

1. Acesse: http://localhost:3001/login
2. Digite o **email** criado no Firebase
3. Digite a **senha** criada no Firebase
4. Clique em **"Entrar"**
5. Você será redirecionado para o Dashboard

---

## Problemas Comuns

### Erro: "Usuário não encontrado"
**Solução**: Certifique-se de que criou o usuário no Firebase Console primeiro

### Erro: "Senha incorreta"
**Solução**: Verifique se digitou a senha corretamente

### Erro: "Operação não permitida"
**Solução**: Habilite Email/Password em Authentication > Sign-in method

### Erro: "Firebase: Error (auth/configuration-not-found)"
**Solução**: Verifique se o arquivo `.env.local` está configurado corretamente

---

## Criar Múltiplos Usuários

Você pode criar quantos usuários quiser no Firebase Console:

1. Vá em Authentication > Users
2. Clique em "Add user"
3. Preencha email e senha
4. Repita para cada usuário

---

## Usuários Existentes do App Android

**⚠️ IMPORTANTE**: Os usuários criados no app Android (via Firestore) são diferentes dos usuários de Authentication.

Para usar o mesmo sistema de autenticação:
- Você precisa criar os usuários também no Firebase Authentication
- Ou podemos sincronizar os usuários do Firestore com Authentication (implementação futura)

Por enquanto, crie usuários diretamente no Firebase Authentication para testar o login web.

---

## Próximos Passos

Após fazer login com sucesso:
1. ✅ Você será redirecionado para o Dashboard
2. ⏳ Implementaremos as funcionalidades principais
3. ⏳ Criaremos sistema de sincronização com usuários do app Android
