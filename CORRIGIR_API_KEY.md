# 🔑 Corrigir API Key Inválida do Firebase

## ❌ Erro Identificado

```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

**Causa**: A API Key do Firebase está incorreta ou não está configurada no arquivo `.env.local`.

---

## ✅ Solução Passo a Passo

### Passo 1: Obter API Key Correta do Firebase

1. **Acesse o Firebase Console**:
   - https://console.firebase.google.com/
   - Selecione seu projeto "Controle de Despesas"

2. **Vá em Configurações do Projeto**:
   - Clique no ícone de **engrenagem** ⚙️ ao lado de "Visão geral do projeto"
   - Selecione **"Configurações do projeto"**

3. **Encontre o App Web**:
   - Role até a seção **"Seus apps"**
   - Procure pelo app Web (ícone `</>`)
   - Se não existir, crie um:
     - Clique no ícone `</>` (Add app > Web)
     - Dê um nome: "CtrlDespesas Web"
     - Clique em "Registrar app"
     - **NÃO marque** "Também configure o Firebase Hosting"

4. **Copie a API Key**:
   - Na tela que aparece, você verá um código JavaScript
   - Procure por `apiKey: "AIza..."`
   - **Copie toda a string** que começa com `AIza` (é bem longa)

### Passo 2: Verificar Arquivo .env.local

1. **Navegue até a pasta web-app**:
   ```powershell
   cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
   ```

2. **Verifique se o arquivo existe**:
   ```powershell
   dir .env.local
   ```

3. **Se não existir, crie o arquivo**:
   - Crie um arquivo chamado `.env.local` (sem extensão)
   - Na pasta `web-app/`

### Passo 3: Configurar .env.local Corretamente

1. **Abra o arquivo `.env.local`** no editor de texto

2. **Adicione/Corrija todas as variáveis**:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...cole_aqui_a_api_key_completa
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

**⚠️ IMPORTANTE**:
- Substitua `AIza...cole_aqui_a_api_key_completa` pela API Key real que você copiou
- Substitua os outros valores pelos valores reais do seu projeto
- **NÃO use espaços** ao redor do `=`
- **NÃO use aspas** nos valores
- Todas as variáveis devem começar com `NEXT_PUBLIC_`

### Passo 4: Obter Todas as Credenciais

No Firebase Console, na tela do app Web, você verá algo como:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",                    // ← Copie este
  authDomain: "projeto.firebaseapp.com",   // ← Copie este
  projectId: "projeto-id",                 // ← Copie este
  storageBucket: "projeto.appspot.com",    // ← Copie este
  messagingSenderId: "123456789",          // ← Copie este
  appId: "1:123456789:web:abc123"          // ← Copie este
};
```

**Mapeamento para .env.local**:
- `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
- `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### Passo 5: Reiniciar Servidor

**CRÍTICO**: Após editar `.env.local`, você DEVE reiniciar o servidor:

1. **Pare o servidor**:
   - No terminal onde está rodando `npm run dev`
   - Pressione `Ctrl+C`

2. **Execute novamente**:
   ```powershell
   npm run dev
   ```

3. **Aguarde** até ver "Ready" no terminal

4. **Acesse**: http://localhost:3001/login

### Passo 6: Verificar no Console

1. **Abra o console do navegador** (F12)
2. **Recarregue a página** (F5)
3. **Procure por**:
   - ✅ "Firebase configurado corretamente" = OK!
   - ❌ "Variáveis Firebase não configuradas" = Ainda há problema

---

## 🔍 Verificação Rápida

### Verificar se o arquivo está correto:

```powershell
cd web-app
type .env.local
```

Você deve ver todas as 6 variáveis preenchidas (sem valores vazios).

### Verificar no Console do Navegador:

1. Abra F12 > Console
2. Recarregue a página
3. Deve aparecer: "✅ Firebase configurado corretamente"
4. E também: "📋 Config: { projectId: '...', authDomain: '...', apiKey: 'AIza...' }"

---

## ⚠️ Erros Comuns

### Erro: "Variáveis Firebase não configuradas"
**Causa**: Alguma variável está vazia ou faltando  
**Solução**: Verifique se todas as 6 variáveis estão preenchidas

### Erro: "api-key-not-valid" continua
**Causa**: API Key ainda incorreta ou servidor não reiniciado  
**Solução**: 
1. Verifique se copiou a API Key completa (é bem longa)
2. Certifique-se de que não há espaços extras
3. Reinicie o servidor novamente

### Erro: "Cannot find module"
**Causa**: Arquivo `.env.local` não está na pasta correta  
**Solução**: Certifique-se de que está em `web-app/.env.local`

---

## ✅ Checklist Final

- [ ] Firebase Console acessado
- [ ] App Web criado no Firebase (se não existia)
- [ ] API Key copiada do Firebase Console
- [ ] Arquivo `.env.local` criado na pasta `web-app/`
- [ ] Todas as 6 variáveis preenchidas no `.env.local`
- [ ] Servidor reiniciado após editar `.env.local`
- [ ] Console do navegador mostra "Firebase configurado corretamente"
- [ ] Tentou fazer login novamente

---

## 📞 Se Ainda Não Funcionar

Compartilhe:
1. Mensagens do console após reiniciar (F12)
2. Se o arquivo `.env.local` existe e tem conteúdo (sem mostrar valores reais)
3. Se o servidor foi reiniciado
