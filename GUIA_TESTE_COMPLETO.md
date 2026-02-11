# 🚀 Guia Completo para Testar o Web App

## 📋 Checklist Pré-Teste

- [ ] Node.js instalado (veja `INSTALACAO_NODEJS.md`)
- [ ] Credenciais do Firebase obtidas
- [ ] Arquivo `.env.local` criado e configurado

---

## Passo 1: Instalar Node.js

**Se ainda não instalou:**

1. Baixe Node.js LTS de: https://nodejs.org/
2. Instale seguindo o instalador
3. **Reinicie o terminal/PowerShell**
4. Verifique:
   ```powershell
   node --version
   npm --version
   ```

---

## Passo 2: Obter Credenciais do Firebase

### Opção A: Do Firebase Console (Recomendado)

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto (o mesmo usado no app Android)
3. Clique no ícone de **engrenagem** ⚙️ ao lado de "Visão geral do projeto"
4. Selecione **"Configurações do projeto"**
5. Role até a seção **"Seus apps"**
6. Se já tiver um app Web, clique nele. Se não tiver:
   - Clique no ícone **`</>`** (Web)
   - Dê um nome (ex: "CtrlDespesas Web")
   - Clique em "Registrar app"
   - **NÃO marque** "Também configure o Firebase Hosting" por enquanto
7. Copie as credenciais que aparecem:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Opção B: Do arquivo google-services.json (Android)

Se você já tem o arquivo `app/google-services.json` do Android:

1. Abra o arquivo `app/google-services.json`
2. Procure pela seção `project_info`:

```json
{
  "project_info": {
    "project_number": "123456789",
    "project_id": "seu-projeto-id",
    "storage_bucket": "seu-projeto.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123456789:android:abc123",
        "android_client_info": {
          "package_name": "com.projmanager.ctrldespesas"
        }
      },
      "oauth_client": [...],
      "api_key": [
        {
          "current_key": "AIza..."  // Esta é a API Key
        }
      ]
    }
  ]
}
```

**Mapeamento:**
- `apiKey`: `client[0].api_key[0].current_key`
- `projectId`: `project_info.project_id`
- `storageBucket`: `project_info.storage_bucket`
- `messagingSenderId`: `project_info.project_number`
- `authDomain`: `{project_id}.firebaseapp.com`
- `appId`: Precisa criar app Web no Firebase Console

---

## Passo 3: Criar Arquivo .env.local

1. Na pasta `web-app/`, crie um arquivo chamado `.env.local`
2. Cole o seguinte conteúdo (substitua pelos valores reais):

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
- O arquivo `.env.local` já está no `.gitignore` (não será commitado)

---

## Passo 4: Instalar Dependências

Abra o terminal/PowerShell na pasta `web-app/`:

```powershell
cd web-app
npm install
```

Isso pode levar alguns minutos na primeira vez.

---

## Passo 5: Executar o Projeto

```powershell
npm run dev
```

Você deve ver algo como:
```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## Passo 6: Testar no Navegador

1. Abra seu navegador
2. Acesse: http://localhost:3000
3. Você deve ver a página inicial (que redireciona para /login)

**Se aparecer erro:**
- Verifique se o arquivo `.env.local` está correto
- Verifique se todas as variáveis começam com `NEXT_PUBLIC_`
- Verifique o console do navegador (F12) para erros

---

## 🐛 Solução de Problemas

### Erro: "Module not found"
```powershell
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Firebase config missing"
- Verifique se o arquivo `.env.local` existe
- Verifique se as variáveis começam com `NEXT_PUBLIC_`
- Reinicie o servidor (`Ctrl+C` e `npm run dev` novamente)

### Erro: "Port 3000 already in use"
```powershell
# Use outra porta
npm run dev -- -p 3001
```

### Node.js não encontrado
- Reinicie o terminal/PowerShell
- Verifique: `where node` (Windows) ou `which node` (Linux/Mac)
- Reinstale Node.js se necessário

---

## ✅ Próximos Passos Após Teste Bem-Sucedido

1. Implementar sistema de autenticação
2. Criar telas principais
3. Implementar CRUD completo
4. Configurar domínio giratech.com.br

---

## 📞 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique os logs no terminal
2. Verifique o console do navegador (F12)
3. Verifique se todas as dependências foram instaladas
4. Verifique se o Firebase está configurado corretamente
