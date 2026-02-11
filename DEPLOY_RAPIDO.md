# ⚡ Deploy Rápido - Vercel (5 minutos)

## Passo 1: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome do repositório: `ctrldespesas-web`
3. Marque como **Private** (recomendado)
4. Clique em **Create repository**

## Passo 2: Enviar Código para GitHub

Execute no PowerShell:

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app

# Inicializar git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - Controle de Despesas Web App"

# Adicionar repositório remoto (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/ctrldespesas-web.git

# Enviar código
git branch -M main
git push -u origin main
```

## Passo 3: Deploy na Vercel

1. **Acesse:** https://vercel.com/signup
2. **Faça login** com sua conta GitHub
3. **Clique em "Add New..." > "Project"**
4. **Importe o repositório** `ctrldespesas-web`
5. **Configure as variáveis de ambiente:**

   Clique em **"Environment Variables"** e adicione uma por uma:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = controle-de-despesas-78687.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID = controle-de-despesas-78687
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = controle-de-despesas-78687.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 972931672046
   NEXT_PUBLIC_FIREBASE_APP_ID = 1:972931672046:web:0d02d9c8e72caca6e0d0ff
   NEXT_PUBLIC_DOMAIN = giratech.com.br
   NEXT_PUBLIC_FILE_RETENTION_DAYS = 90
   ```

   **⚠️ IMPORTANTE:** 
   - Não adicione `NEXT_PUBLIC_APP_URL` ainda (será preenchido automaticamente)
   - Após o primeiro deploy, volte e atualize `NEXT_PUBLIC_APP_URL` com a URL fornecida pela Vercel

6. **Clique em "Deploy"**

## Passo 4: Aguardar Deploy

- O deploy leva cerca de 2-3 minutos
- Você verá uma URL como: `https://ctrldespesas-web-xxxxx.vercel.app`

## Passo 5: Atualizar NEXT_PUBLIC_APP_URL

Após o deploy concluir:

1. Vá em **Settings > Environment Variables**
2. Edite `NEXT_PUBLIC_APP_URL` e coloque a URL fornecida pela Vercel
3. Faça um novo deploy (ou aguarde o próximo push)

## ✅ Pronto!

Sua aplicação estará disponível em: `https://seu-app.vercel.app`

**Acesso de qualquer lugar:** Sim! A URL funciona de qualquer dispositivo conectado à internet.

---

## 🔄 Deploy Automático

A partir de agora, **cada vez que você fizer push no GitHub**, a Vercel fará deploy automaticamente!

```powershell
git add .
git commit -m "Sua mensagem"
git push
```

---

## 🌐 Domínio Personalizado (Opcional)

Para usar um domínio próprio (ex: `app.giratech.com.br`):

1. Na Vercel, vá em **Settings > Domains**
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções
4. Aguarde propagação DNS (pode levar até 24h)
