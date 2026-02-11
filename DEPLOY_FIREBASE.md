# 🔥 Deploy no Firebase Hosting (Gratuito)

O Firebase Hosting é **100% gratuito** e integra perfeitamente com seu projeto Firebase existente!

## ✅ Vantagens do Firebase Hosting

- ✅ **Gratuito** (10GB de armazenamento, 360MB/dia de transferência)
- ✅ **SSL automático** (HTTPS)
- ✅ **CDN global** (rápido em qualquer lugar)
- ✅ **Mesmo projeto Firebase** (já configurado)
- ✅ **Domínio personalizado** gratuito
- ✅ **Deploy simples** via CLI

---

## 📋 Passo a Passo Completo

### Passo 1: Instalar Firebase CLI

```powershell
npm install -g firebase-tools
```

### Passo 2: Fazer Login no Firebase

```powershell
firebase login
```

Isso abrirá o navegador para você fazer login com sua conta Google.

### Passo 3: Inicializar Firebase Hosting

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
firebase init hosting
```

**Durante a inicialização, responda:**

1. **"Which Firebase features do you want to set up?"**
   - Selecione: `Hosting: Configure files for Firebase Hosting`

2. **"Please select an option:"**
   - Escolha: `Use an existing project`
   - Selecione: `controle-de-despesas-78687`

3. **"What do you want to use as your public directory?"**
   - Digite: `out` (vamos configurar export estático)

4. **"Configure as a single-page app (rewrite all urls to /index.html)?"**
   - Digite: `Yes`

5. **"Set up automatic builds and deploys with GitHub?"**
   - Digite: `No` (podemos configurar depois)

### Passo 4: Configurar Next.js para Export Estático

Como o Firebase Hosting serve arquivos estáticos, precisamos fazer export estático do Next.js.

**Edite o arquivo `next.config.js`:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Adicionar esta linha para export estático
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true, // Necessário para export estático
  },
  // Garantir que variáveis de ambiente sejam carregadas
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
}

module.exports = nextConfig
```

### Passo 5: Configurar firebase.json

O arquivo `firebase.json` será criado automaticamente. Verifique se está assim:

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Passo 6: Adicionar Scripts ao package.json

Adicione estes scripts ao `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "deploy": "npm run build && firebase deploy --only hosting"
  }
}
```

### Passo 7: Criar Arquivo .env.production (Opcional)

Para variáveis de ambiente em produção, você pode criar `.env.production`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972931672046
NEXT_PUBLIC_FIREBASE_APP_ID=1:972931672046:web:0d02d9c8e72caca6e0d0ff
NEXT_PUBLIC_APP_URL=https://controle-de-despesas-78687.web.app
NEXT_PUBLIC_DOMAIN=giratech.com.br
NEXT_PUBLIC_FILE_RETENTION_DAYS=90
```

**⚠️ IMPORTANTE:** 
- Atualize `NEXT_PUBLIC_APP_URL` após o primeiro deploy com a URL real
- O arquivo `.env.production` será usado automaticamente no build

### Passo 8: Fazer Build e Deploy

```powershell
npm run build
firebase deploy --only hosting
```

**Ou use o script combinado:**

```powershell
npm run deploy
```

### Passo 9: Acessar sua Aplicação

Após o deploy, você verá uma URL como:

```
https://controle-de-despesas-78687.web.app
```

**✅ Pronto!** Sua aplicação está no ar!

---

## 🔄 Deploy Automático (Opcional)

Para fazer deploy automático a cada push no GitHub:

1. **No Firebase Console**, vá em **Hosting**
2. Clique em **"Connect GitHub repository"**
3. Autorize e selecione o repositório
4. Configure o build:
   - Build command: `npm run build`
   - Output directory: `out`
5. Salve

Agora, cada push no GitHub fará deploy automático!

---

## 🌐 Configurar Domínio Personalizado

1. **No Firebase Console**, vá em **Hosting**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (ex: `app.giratech.com.br`)
4. Configure os registros DNS conforme instruções
5. Aguarde validação (pode levar alguns minutos)

---

## 📊 Limites Gratuitos do Firebase Hosting

- ✅ **10 GB** de armazenamento
- ✅ **360 MB/dia** de transferência
- ✅ **SSL automático**
- ✅ **CDN global**

Para a maioria dos projetos, isso é mais que suficiente!

---

## 🆘 Troubleshooting

### Erro: "Cannot find module 'firebase-tools'"
```powershell
npm install -g firebase-tools
```

### Erro: "Firebase CLI not found"
Certifique-se de que o npm está no PATH do sistema.

### Erro: "Build failed"
- Verifique se todas as variáveis de ambiente estão configuradas
- Certifique-se de que `output: 'export'` está no `next.config.js`

### Erro: "Images not loading"
- Adicione `unoptimized: true` nas configurações de imagens do Next.js
- Ou use URLs completas para imagens do Firebase Storage

---

## 💡 Dica Importante

**Export Estático vs SSR:**
- O Firebase Hosting serve arquivos estáticos
- Se você precisar de SSR (Server-Side Rendering), considere:
  - Firebase Functions (com custo adicional)
  - Ou usar Vercel (gratuito e suporta SSR nativamente)

Para sua aplicação atual, o export estático funciona perfeitamente!

---

## ✅ Checklist

- [ ] Firebase CLI instalado
- [ ] Login feito (`firebase login`)
- [ ] Hosting inicializado (`firebase init hosting`)
- [ ] `next.config.js` configurado com `output: 'export'`
- [ ] `firebase.json` configurado corretamente
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso (`npm run build`)
- [ ] Deploy feito (`firebase deploy`)
- [ ] Aplicação acessível pela URL do Firebase
