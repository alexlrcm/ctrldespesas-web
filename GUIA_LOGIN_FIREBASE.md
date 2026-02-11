# 🔐 Guia Completo: Implementar Login com Firebase

## 📋 Pré-requisitos

1. ✅ Node.js instalado e funcionando
2. ✅ Projeto Next.js rodando
3. ✅ Firebase configurado (mesmo projeto do app Android)
4. ✅ Arquivo `.env.local` criado com credenciais Firebase

---

## Passo 1: Obter Credenciais do Firebase

### Opção A: Do Firebase Console (Recomendado)

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto (mesmo usado no app Android)
3. Clique no ícone de **engrenagem** ⚙️ ao lado de "Visão geral do projeto"
4. Selecione **"Configurações do projeto"**
5. Role até **"Seus apps"**
6. Se já tiver um app Web, clique nele
7. Se **NÃO tiver**, crie um:
   - Clique no ícone **`</>`** (Web)
   - Dê um nome: "CtrlDespesas Web"
   - Clique em "Registrar app"
   - **NÃO marque** "Também configure o Firebase Hosting" por enquanto

8. Copie as credenciais que aparecem na tela

### Opção B: Criar App Web no Firebase

Se você ainda não tem um app Web no Firebase:

1. No Firebase Console, vá em **"Visão geral do projeto"**
2. Clique no ícone **`</>`** (Add app > Web)
3. Configure:
   - **Apelido do app**: CtrlDespesas Web
   - **Firebase Hosting**: Deixe desmarcado por enquanto
4. Clique em **"Registrar app"**
5. Copie as credenciais

---

## Passo 2: Configurar Arquivo .env.local

1. Na pasta `web-app/`, crie ou edite o arquivo `.env.local`

2. Adicione as credenciais (substitua pelos valores reais):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DOMAIN=giratech.com.br

# File Retention (days) - 90 dias = 3 meses
NEXT_PUBLIC_FILE_RETENTION_DAYS=90
```

**⚠️ IMPORTANTE:**
- Não use espaços ao redor do `=`
- Não use aspas nos valores
- Todas as variáveis devem começar com `NEXT_PUBLIC_`

---

## Passo 3: Habilitar Authentication no Firebase

1. No Firebase Console, vá em **"Authentication"** (Autenticação)
2. Clique em **"Começar"** (Get started)
3. Vá na aba **"Sign-in method"** (Métodos de login)
4. Clique em **"Email/Password"**
5. Ative o primeiro toggle (Email/Password)
6. Clique em **"Salvar"**

**Métodos disponíveis:**
- ✅ Email/Password (recomendado para começar)
- ⏳ Google (opcional, para depois)
- ⏳ Outros métodos (opcional)

---

## Passo 4: Criar Usuário de Teste no Firebase

### Opção A: Criar via Firebase Console

1. No Firebase Console, vá em **"Authentication"**
2. Aba **"Users"**
3. Clique em **"Add user"**
4. Preencha:
   - **Email**: teste@giratech.com.br
   - **Password**: uma senha segura
5. Clique em **"Add user"**

### Opção B: Criar via Código (será implementado)

O código que vamos criar permitirá criar usuários automaticamente.

---

## Passo 5: Verificar Configuração Firebase no Código

O arquivo `lib/firebase/config.ts` já está criado. Verifique se está correto:

```typescript
// lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { getAuth, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// ... resto do código
```

---

## Passo 6: Implementar Autenticação (Próximo Passo)

Após configurar tudo acima, o próximo passo é implementar:

1. **Hook de autenticação** (`hooks/useAuth.ts`)
2. **Contexto de autenticação** (`contexts/AuthContext.tsx`)
3. **Atualizar página de login** para usar Firebase Auth
4. **Proteção de rotas** (middleware ou componente)

---

## ✅ Checklist de Configuração

Antes de implementar o código, verifique:

- [ ] Firebase Console acessível
- [ ] App Web criado no Firebase
- [ ] Credenciais copiadas do Firebase
- [ ] Arquivo `.env.local` criado com todas as variáveis
- [ ] Authentication habilitado no Firebase
- [ ] Método Email/Password ativado
- [ ] Usuário de teste criado (opcional, para testar)
- [ ] Servidor Next.js reiniciado após criar `.env.local`

---

## 🐛 Solução de Problemas

### Erro: "Firebase: Error (auth/configuration-not-found)"
- **Causa**: Credenciais Firebase não configuradas ou incorretas
- **Solução**: Verifique o arquivo `.env.local` e reinicie o servidor

### Erro: "Firebase: Error (auth/invalid-api-key)"
- **Causa**: API Key incorreta ou não começa com `NEXT_PUBLIC_`
- **Solução**: Verifique se todas as variáveis começam com `NEXT_PUBLIC_`

### Erro: "Firebase: Error (auth/operation-not-allowed)"
- **Causa**: Método de login não habilitado no Firebase
- **Solução**: Habilite Email/Password em Authentication > Sign-in method

### Variáveis não carregam
- **Causa**: Servidor não reiniciado após criar `.env.local`
- **Solução**: Pare o servidor (`Ctrl+C`) e execute `npm run dev` novamente

---

## 📞 Próximos Passos

Após completar este guia:

1. ✅ Configuração Firebase completa
2. ⏳ Implementar código de autenticação
3. ⏳ Testar login
4. ⏳ Criar proteção de rotas

---

## 📚 Referências

- Firebase Auth Docs: https://firebase.google.com/docs/auth
- Next.js Environment Variables: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
