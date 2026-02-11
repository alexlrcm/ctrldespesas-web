# 🔍 Verificar Arquivo .env.local

## Problema: API Key ainda inválida após reiniciar

Vamos verificar se o arquivo `.env.local` está sendo lido corretamente.

---

## Passo 1: Verificar Conteúdo do Arquivo

Execute no PowerShell:

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
type .env.local
```

**Deve mostrar** (sem aspas, sem vírgulas):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972931672046
NEXT_PUBLIC_FIREBASE_APP_ID=1:972931672046:web:0d02d9c8e72caca6e0d0ff
```

---

## Passo 2: Verificar Localização

O arquivo deve estar em:
```
C:\Users\giratech02\Documents\CtrlDespesas\web-app\.env.local
```

**Verifique**:
```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
Test-Path .env.local
```

Deve retornar: `True`

---

## Passo 3: Verificar no Console do Navegador

Após reiniciar o servidor e recarregar a página, abra o console (F12) e procure por:

```
🔍 ========================================
🔍 DEBUG - Variáveis de Ambiente
🔍 ========================================
NEXT_PUBLIC_FIREBASE_API_KEY existe? true
NEXT_PUBLIC_FIREBASE_API_KEY valor: AIzaSyAATPDjSZAPYF...
NEXT_PUBLIC_FIREBASE_API_KEY completo: AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
```

**Se aparecer "UNDEFINED"**, o problema é que o Next.js não está lendo o arquivo.

---

## Passo 4: Recriar Arquivo Manualmente

Se as variáveis aparecem como "UNDEFINED" no console:

1. **Delete o arquivo atual**:
   ```powershell
   Remove-Item .env.local
   ```

2. **Crie um novo arquivo** usando o Notepad:
   - Abra o Notepad
   - Cole exatamente este conteúdo (copie e cole linha por linha):

```
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

3. **Salvar como**:
   - Tipo: "Todos os arquivos" (não "Documentos de texto")
   - Nome: `.env.local` (com o ponto no início!)
   - Localização: `C:\Users\giratech02\Documents\CtrlDespesas\web-app\`

4. **Verificar**:
   ```powershell
   type .env.local
   ```

5. **Reiniciar servidor**:
   ```powershell
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

---

## Passo 5: Verificar Encoding

O arquivo deve estar em **UTF-8 sem BOM**.

No VS Code:
1. Abra o arquivo `.env.local`
2. Veja no canto inferior direito o encoding
3. Se não for UTF-8, clique e selecione "Save with Encoding" > "UTF-8"

---

## Passo 6: Verificar Restrições da API Key no Firebase

Pode ser que a API Key tenha restrições. Verifique:

1. Firebase Console > Configurações do projeto
2. Role até "Seus apps" > App Web
3. Verifique se há restrições de API Key
4. Se houver, remova temporariamente para testar

---

## Teste Final

Após seguir todos os passos:

1. **Reinicie o servidor completamente**
2. **Feche e reabra o navegador**
3. **Abra o console** (F12)
4. **Veja as mensagens de debug**
5. **Compartilhe o que aparece** no console
