# 🔄 Como Reiniciar o Servidor Corretamente

## ⚠️ Problema: API Key ainda inválida após corrigir .env.local

Isso acontece porque o Next.js precisa ser **completamente reiniciado** para ler as novas variáveis de ambiente.

---

## ✅ Solução: Reiniciar Corretamente

### Passo 1: Parar o Servidor Completamente

1. **No terminal onde está rodando `npm run dev`**:
   - Pressione `Ctrl+C`
   - **Aguarde** até ver que o processo terminou completamente
   - Você deve voltar ao prompt `PS C:\Users\...>`

### Passo 2: Limpar Cache do Next.js (Opcional mas Recomendado)

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

Isso remove o cache do Next.js que pode estar usando as variáveis antigas.

### Passo 3: Verificar Arquivo .env.local

```powershell
type .env.local
```

Certifique-se de que está assim (SEM aspas, SEM vírgulas):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972931672046
NEXT_PUBLIC_FIREBASE_APP_ID=1:972931672046:web:0d02d9c8e72caca6e0d0ff
```

### Passo 4: Iniciar Servidor Novamente

```powershell
npm run dev
```

### Passo 5: Verificar no Console do Navegador

1. **Feche completamente o navegador** (todas as abas)
2. **Abra um novo navegador**
3. **Acesse**: http://localhost:3001/login (ou a porta mostrada)
4. **Abra o console** (F12)
5. **Recarregue a página** (F5)
6. **Procure por**:
   - ✅ "Firebase configurado corretamente"
   - ✅ "📋 Config: { projectId: 'controle-de-despesas-78687', ... }"

### Passo 6: Testar Login

1. Email: `admin@giratech.com.br`
2. Senha: `123456`
3. Clique em "Entrar"

---

## 🔍 Verificação Adicional

### Verificar se as Variáveis Estão Sendo Carregadas

No console do navegador (F12), após recarregar a página, você deve ver:

```
✅ Firebase configurado corretamente
📋 Config: {
  projectId: 'controle-de-despesas-78687',
  authDomain: 'controle-de-despesas-78687.firebaseapp.com',
  apiKey: 'AIzaSy...'
}
```

Se aparecer "Variáveis Firebase não configuradas", o problema está no arquivo `.env.local`.

---

## 🐛 Se Ainda Não Funcionar

### Opção 1: Verificar Formato do Arquivo

O arquivo `.env.local` deve:
- Estar na pasta `web-app/` (mesmo nível do `package.json`)
- Ter extensão `.local` (não `.txt` ou outra)
- Não ter BOM (Byte Order Mark) - salve como UTF-8 sem BOM

### Opção 2: Recriar o Arquivo Manualmente

1. **Delete o arquivo atual**:
   ```powershell
   Remove-Item .env.local
   ```

2. **Crie um novo arquivo**:
   - Use o Notepad ou VS Code
   - Cole exatamente este conteúdo:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972931672046
NEXT_PUBLIC_FIREBASE_APP_ID=1:972931672046:web:0d02d9c8e72caca6e0d0ff
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DOMAIN=giratech.com.br
NEXT_PUBLIC_FILE_RETENTION_DAYS=90
```

3. **Salve como**: `.env.local` (sem extensão)
4. **Localização**: `web-app/.env.local`

### Opção 3: Verificar no Código

Abra o arquivo `lib/firebase/config.ts` e adicione um log temporário:

```typescript
console.log('🔍 Debug Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
})
```

Isso mostrará no console se as variáveis estão sendo carregadas.

---

## ✅ Checklist Final

- [ ] Servidor parado completamente (Ctrl+C)
- [ ] Cache do Next.js limpo (pasta .next removida)
- [ ] Arquivo `.env.local` verificado e correto
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Navegador fechado e reaberto
- [ ] Console mostra "Firebase configurado corretamente"
- [ ] Tentou fazer login novamente

---

## 📞 Se Continuar com Erro

Compartilhe:
1. Conteúdo do arquivo `.env.local` (pode mascarar parte da API Key)
2. Mensagens do console após reiniciar
3. Se o servidor foi completamente parado antes de reiniciar
