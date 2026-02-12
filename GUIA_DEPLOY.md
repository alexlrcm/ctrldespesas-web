# 🚀 Guia de Deploy - Controle de Despesas Web App

Este guia mostra como publicar a aplicação para acesso de qualquer lugar.

## 📋 Pré-requisitos

1. Conta no GitHub (recomendado) ou GitLab/Bitbucket
2. Conta na plataforma de deploy escolhida
3. Variáveis de ambiente do Firebase configuradas

---

## 🎯 Opção 1: Firebase Hosting (Recomendado - Mesmo Projeto Firebase)

O Firebase Hosting é gratuito e integra perfeitamente com seu projeto Firebase existente!

### Passo 1: Instalar Firebase CLI

```powershell
npm install -g firebase-tools
```

### Passo 2: Fazer Login no Firebase

```powershell
firebase login
```

Isso abrirá o navegador para autenticação.

### Passo 3: Inicializar Firebase Hosting

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
firebase init hosting
```

**Durante a inicialização:**
- Selecione o projeto: `controle-de-despesas-78687`
- Public directory: `.next`
- Configure as single-page app: **Não** (Next.js já gerencia rotas)
- Set up automatic builds: **Não** (faremos manualmente)

### Passo 4: Configurar Firebase Hosting para Next.js

Edite o arquivo `firebase.json` (será criado automaticamente):

```json
{
  "hosting": {
    "public": ".next",
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

**⚠️ IMPORTANTE:** Para Next.js, precisamos fazer build estático ou usar Firebase Functions. Vou criar uma configuração melhor.

### Passo 5: Criar Script de Build

Adicione ao `package.json`:

```json
"scripts": {
  "build": "next build",
  "export": "next build && next export",
  "deploy": "npm run build && firebase deploy --only hosting"
}
```

### Passo 6: Fazer Deploy

```powershell
npm run build
firebase deploy --only hosting
```

**✅ Pronto!** Sua aplicação estará em: `https://controle-de-despesas-78687.web.app`

**Nota:** Para Next.js com SSR, considere usar Firebase Functions ou export estático.

---

## 🎯 Opção 2: Vercel (Recomendado - Mais Fácil para Next.js)

A Vercel é a plataforma oficial do Next.js e oferece deploy gratuito.

### Passo 1: Preparar o Repositório

1. **Criar repositório no GitHub:**
   - Acesse https://github.com
   - Crie um novo repositório (ex: `ctrldespesas-web`)
   - **NÃO** faça commit do arquivo `.env.local` (já está no `.gitignore`)

2. **Fazer commit e push:**
   ```powershell
   cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/ctrldespesas-web.git
   git push -u origin main
   ```

### Passo 2: Deploy na Vercel

1. **Acesse:** https://vercel.com
2. **Faça login** com sua conta GitHub
3. **Clique em "Add New Project"**
4. **Importe o repositório** que você criou
5. **Configure as variáveis de ambiente:**

   Na seção "Environment Variables", adicione:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972931672046
   NEXT_PUBLIC_FIREBASE_APP_ID=1:972931672046:web:0d02d9c8e72caca6e0d0ff
   NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
   NEXT_PUBLIC_DOMAIN=giratech.com.br
   NEXT_PUBLIC_FILE_RETENTION_DAYS=90
   ```

6. **Clique em "Deploy"**

### Passo 3: Configurar Domínio Personalizado (Opcional)

1. Na Vercel, vá em **Settings > Domains**
2. Adicione seu domínio (ex: `app.giratech.com.br`)
3. Configure os registros DNS conforme instruções da Vercel

**✅ Pronto!** Sua aplicação estará disponível em: `https://seu-app.vercel.app`

---

## 🌐 Opção 2: Netlify

### Passo 1: Preparar o Repositório
(Same as Vercel - criar repositório no GitHub)

### Passo 2: Deploy na Netlify

1. **Acesse:** https://netlify.com
2. **Faça login** com GitHub
3. **Clique em "Add new site" > "Import an existing project"**
4. **Selecione seu repositório**
5. **Configure o build:**
   - Build command: `npm run build`
   - Publish directory: `.next`
6. **Adicione as variáveis de ambiente** em **Site settings > Environment variables**
7. **Deploy!**

---

## 🚂 Opção 3: Railway

### Passo 1: Preparar o Repositório
(Same as above)

### Passo 2: Deploy na Railway

1. **Acesse:** https://railway.app
2. **Faça login** com GitHub
3. **Clique em "New Project" > "Deploy from GitHub repo"**
4. **Selecione seu repositório**
5. **Adicione as variáveis de ambiente** em **Variables**
6. **Deploy!**

---

## 🖥️ Opção 4: Servidor Próprio (VPS/Cloud)

### Passo 1: Preparar o Servidor

1. **Contrate um servidor** (ex: DigitalOcean, AWS, Azure, Google Cloud)
2. **Instale Node.js** (versão 18 ou superior):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

### Passo 2: Configurar a Aplicação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/ctrldespesas-web.git
   cd ctrldespesas-web
   ```

2. **Instale dependências:**
   ```bash
   npm install
   ```

3. **Crie o arquivo `.env.local`** com as variáveis de ambiente

4. **Faça o build:**
   ```bash
   npm run build
   ```

5. **Execute em produção:**
   ```bash
   npm start
   ```

### Passo 3: Usar PM2 (Gerenciador de Processos)

```bash
npm install -g pm2
pm2 start npm --name "ctrldespesas" -- start
pm2 save
pm2 startup
```

### Passo 4: Configurar Nginx (Proxy Reverso)

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔐 Variáveis de Ambiente Necessárias

Certifique-se de configurar todas estas variáveis na plataforma escolhida:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
NEXT_PUBLIC_APP_URL=https://seu-dominio.com.br
NEXT_PUBLIC_DOMAIN=giratech.com.br
NEXT_PUBLIC_FILE_RETENTION_DAYS=90
```

**⚠️ IMPORTANTE:** 
- Substitua `NEXT_PUBLIC_APP_URL` pela URL real da sua aplicação após o deploy
- Não compartilhe essas credenciais publicamente

---

## 📝 Checklist de Deploy

- [ ] Repositório criado no GitHub
- [ ] Código commitado e enviado
- [ ] Conta criada na plataforma de deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Build executado com sucesso
- [ ] Aplicação acessível pela URL fornecida
- [ ] Teste de login funcionando
- [ ] Domínio personalizado configurado (opcional)

---

## 🆘 Troubleshooting

### Erro: "Environment variables not found"
- Verifique se todas as variáveis começam com `NEXT_PUBLIC_`
- Certifique-se de que foram adicionadas na plataforma de deploy

### Erro: "Build failed"
- Verifique os logs de build na plataforma
- Certifique-se de que todas as dependências estão no `package.json`

### Erro: "Firebase not initialized"
- Verifique se as variáveis de ambiente estão corretas
- Certifique-se de que `NEXT_PUBLIC_APP_URL` aponta para a URL correta

---

## 💡 Recomendação

**Para começar rapidamente, use a Vercel:**
- ✅ Deploy gratuito
- ✅ Integração direta com GitHub
- ✅ Deploy automático a cada push
- ✅ SSL gratuito
- ✅ Otimizado para Next.js
