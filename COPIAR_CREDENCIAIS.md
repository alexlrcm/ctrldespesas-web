# 📋 Copiar Credenciais do Firebase para .env.local

## ✅ Credenciais Encontradas

Baseado nas imagens que você compartilhou, aqui estão as credenciais corretas:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972931672046
NEXT_PUBLIC_FIREBASE_APP_ID=1:972931672046:web:0d02d9c8e72caca6e0d0ff
```

---

## 📝 Passo a Passo para Configurar

### Passo 1: Criar Arquivo .env.local

1. **Navegue até a pasta web-app**:
   ```powershell
   cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
   ```

2. **Crie o arquivo `.env.local`**:
   - Você pode usar o Notepad, VS Code, ou qualquer editor de texto
   - Crie um arquivo chamado `.env.local` (sem extensão)
   - **IMPORTANTE**: O arquivo deve estar na pasta `web-app/`, não em subpastas

### Passo 2: Cole o Conteúdo Abaixo

Abra o arquivo `.env.local` e cole exatamente este conteúdo:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972931672046
NEXT_PUBLIC_FIREBASE_APP_ID=1:972931672046:web:0d02d9c8e72caca6e0d0ff

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DOMAIN=giratech.com.br

# File Retention (days) - 90 dias = 3 meses
NEXT_PUBLIC_FILE_RETENTION_DAYS=90
```

**⚠️ IMPORTANTE**:
- Não adicione espaços antes ou depois do `=`
- Não use aspas nos valores
- Não adicione vírgulas ou ponto-e-vírgula
- Salve o arquivo como texto simples (sem formatação)

### Passo 3: Verificar se o Arquivo Foi Criado

```powershell
cd web-app
dir .env.local
```

Deve mostrar o arquivo `.env.local`

### Passo 4: Verificar Conteúdo (Opcional)

```powershell
type .env.local
```

Deve mostrar todas as variáveis preenchidas.

### Passo 5: REINICIAR O SERVIDOR

**CRÍTICO**: Após criar/editar `.env.local`, você DEVE reiniciar o servidor:

1. **Pare o servidor atual**:
   - No terminal onde está rodando `npm run dev`
   - Pressione `Ctrl+C`

2. **Execute novamente**:
   ```powershell
   npm run dev
   ```

3. **Aguarde** até ver "Ready" no terminal

4. **Acesse**: http://localhost:3001/login (ou a porta mostrada)

### Passo 6: Verificar no Console

1. **Abra o navegador**: http://localhost:3001/login
2. **Abra o console** (F12)
3. **Recarregue a página** (F5)
4. **Procure por**:
   - ✅ "Firebase configurado corretamente" = SUCESSO!
   - ✅ "📋 Config: { projectId: 'controle-de-despesas-78687', ... }" = OK!
   - ❌ "Variáveis Firebase não configuradas" = Ainda há problema

### Passo 7: Testar Login

1. Digite o email: `admin@giratech.com.br`
2. Digite a senha: `123456`
3. Clique em "Entrar"
4. Deve funcionar agora! ✅

---

## 🔍 Verificação Final

### Checklist:

- [ ] Arquivo `.env.local` criado na pasta `web-app/`
- [ ] Todas as 6 variáveis Firebase preenchidas
- [ ] Sem espaços extras ou aspas
- [ ] Servidor reiniciado após criar o arquivo
- [ ] Console mostra "Firebase configurado corretamente"
- [ ] Login funciona!

---

## 🐛 Se Ainda Não Funcionar

1. **Verifique o arquivo**:
   ```powershell
   type .env.local
   ```
   Deve mostrar todas as variáveis sem valores vazios

2. **Verifique o console** (F12):
   - Veja se há erros
   - Veja se mostra "Firebase configurado corretamente"

3. **Certifique-se de que reiniciou o servidor**:
   - Pare com `Ctrl+C`
   - Execute `npm run dev` novamente

4. **Verifique a porta**:
   - Use a porta mostrada no terminal (provavelmente 3001)

---

## ✅ Próximos Passos Após Funcionar

1. Login funcionando ✅
2. Implementar CRUD de empresas
3. Implementar CRUD de projetos
4. Implementar CRUD de despesas
5. E assim por diante...
