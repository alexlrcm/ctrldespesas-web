# 🔄 INSTRUÇÕES: Reiniciar Servidor Corretamente

## ⚠️ PROBLEMA ATUAL

O erro "api-key-not-valid" continua porque o servidor Next.js **não foi reiniciado** após corrigir o arquivo `.env.local`.

---

## ✅ SOLUÇÃO RÁPIDA (3 Passos)

### Passo 1: Parar o Servidor

1. **Vá no terminal onde está rodando `npm run dev`**
2. **Pressione `Ctrl+C`**
3. **AGUARDE** até voltar ao prompt `PS C:\Users\...>`
4. **NÃO feche o terminal ainda**

### Passo 2: Limpar Cache e Reiniciar

**Opção A: Usar o Script Automático** (Mais Fácil)

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
powershell -ExecutionPolicy Bypass -File reiniciar-servidor.ps1
```

**Opção B: Manual**

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app

# Limpar cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Reiniciar servidor
npm run dev
```

### Passo 3: Verificar no Navegador

1. **Feche completamente o navegador** (todas as abas)
2. **Abra um novo navegador**
3. **Acesse**: http://localhost:3001/login (ou a porta mostrada no terminal)
4. **Abra o console** (F12)
5. **Recarregue a página** (F5)
6. **Veja as mensagens**:
   - ✅ "Firebase configurado corretamente" = SUCESSO!
   - ✅ "📋 Config: { projectId: 'controle-de-despesas-78687', ... }" = OK!
   - ❌ "Variáveis Firebase não configuradas" = Problema no .env.local

---

## 🔍 Verificação no Console

Após reiniciar e recarregar a página, você deve ver no console (F12):

```
🔍 Debug - Variáveis de ambiente: {
  NEXT_PUBLIC_FIREBASE_API_KEY existe?: true
  NEXT_PUBLIC_FIREBASE_API_KEY (primeiros 10 chars): "AIzaSyAATPD"
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "controle-de-despesas-78687"
}
✅ Firebase configurado corretamente
📋 Config: {
  projectId: "controle-de-despesas-78687",
  authDomain: "controle-de-despesas-78687.firebaseapp.com",
  apiKey: "AIzaSyAATPDjSZAP..."
}
```

**Se aparecer "NÃO DEFINIDA"**, o problema é que o servidor não está lendo o `.env.local`.

---

## ✅ Teste o Login

Após verificar que o Firebase está configurado corretamente:

1. Email: `admin@giratech.com.br`
2. Senha: `123456`
3. Clique em "Entrar"

**Deve funcionar agora!** ✅

---

## 🐛 Se Ainda Não Funcionar

### Verificar se o Servidor Foi Parado

Certifique-se de que:
- O terminal voltou ao prompt `PS C:\Users\...>`
- Não há processo do Node.js rodando em segundo plano

### Verificar Arquivo .env.local

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
type .env.local
```

Deve mostrar (sem aspas, sem vírgulas):
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
...
```

### Verificar Localização do Arquivo

O arquivo `.env.local` deve estar em:
```
C:\Users\giratech02\Documents\CtrlDespesas\web-app\.env.local
```

**NÃO** em:
- `web-app\app\.env.local` ❌
- `web-app\lib\.env.local` ❌
- Outra pasta ❌

---

## 📞 Compartilhe

Se ainda não funcionar, compartilhe:
1. Mensagens do console após reiniciar (F12)
2. Se o servidor foi completamente parado antes de reiniciar
3. Conteúdo do `.env.local` (pode mascarar parte da API Key)
