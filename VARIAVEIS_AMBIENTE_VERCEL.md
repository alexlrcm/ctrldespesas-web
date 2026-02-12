# 🔐 Variáveis de Ambiente na Vercel - Guia Completo

## ⚠️ IMPORTANTE: São NECESSÁRIAS!

**SIM, essas variáveis são ESSENCIAIS!** Sem elas, sua aplicação **NÃO funcionará** porque:

1. ✅ O Firebase precisa delas para conectar ao seu projeto
2. ✅ Sem elas, o login não funcionará
3. ✅ Sem elas, não será possível acessar os dados do Firestore
4. ✅ Sem elas, não será possível fazer upload de comprovantes

**Pense nelas como "senhas" que a aplicação precisa para acessar o Firebase.**

---

## 📋 Quais Variáveis Adicionar

Você precisa adicionar **8 variáveis** na Vercel. Elas são as mesmas que estão no seu arquivo `.env.local` local.

### Variáveis OBRIGATÓRIAS (6 variáveis do Firebase):

| Nome da Variável | Valor | O que é? |
|-----------------|-------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0` | Chave de API do Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `controle-de-despesas-78687.firebaseapp.com` | Domínio de autenticação |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `controle-de-despesas-78687` | ID do seu projeto Firebase |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `controle-de-despesas-78687.firebasestorage.app` | Bucket de armazenamento |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `972931672046` | ID do remetente de mensagens |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:972931672046:web:0d02d9c8e72caca6e0d0ff` | ID da aplicação web |

### Variáveis OPCIONAIS (2 variáveis de configuração):

| Nome da Variável | Valor Sugerido | O que é? |
|-----------------|----------------|----------|
| `NEXT_PUBLIC_DOMAIN` | `giratech.com.br` | Domínio da empresa (para validações) |
| `NEXT_PUBLIC_FILE_RETENTION_DAYS` | `90` | Dias para manter arquivos (90 = 3 meses) |

### Variável para Adicionar DEPOIS do Deploy:

| Nome da Variável | Valor | Quando Adicionar |
|-----------------|-------|------------------|
| `NEXT_PUBLIC_APP_URL` | `https://seu-app.vercel.app` | **DEPOIS** do primeiro deploy, quando você souber a URL |

---

## 📝 Como Adicionar na Vercel (Passo a Passo Visual)

### Passo 1: Localizar a Seção "Environment Variables"

Na tela de configuração do projeto na Vercel, você verá uma seção chamada **"Environment Variables"** (Variáveis de Ambiente).

### Passo 2: Adicionar Cada Variável

Para cada variável abaixo, faça:

1. **Clique no botão "+ Add More"** (ou similar)
2. **No campo "Key"**, digite o nome da variável (ex: `NEXT_PUBLIC_FIREBASE_API_KEY`)
3. **No campo "Value"**, digite o valor correspondente
4. **Clique em "Add"** ou "Save"

### Passo 3: Adicionar Todas as Variáveis

Adicione uma por uma, copiando e colando exatamente como está abaixo:

```
NEXT_PUBLIC_FIREBASE_API_KEY
AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
controle-de-despesas-78687.firebaseapp.com

NEXT_PUBLIC_FIREBASE_PROJECT_ID
controle-de-despesas-78687

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
controle-de-despesas-78687.firebasestorage.app

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
972931672046

NEXT_PUBLIC_FIREBASE_APP_ID
1:972931672046:web:0d02d9c8e72caca6e0d0ff

NEXT_PUBLIC_DOMAIN
giratech.com.br

NEXT_PUBLIC_FILE_RETENTION_DAYS
90
```

---

## 🎯 Formato Visual na Vercel

Quando você adicionar, ficará assim na interface da Vercel:

```
┌─────────────────────────────────────────┐
│ Environment Variables                   │
├─────────────────────────────────────────┤
│ Key                          Value      │
├─────────────────────────────────────────┤
│ NEXT_PUBLIC_FIREBASE_API_KEY           │
│ AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0│
│                                         │
│ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN       │
│ controle-de-despesas-78687.firebaseapp.com│
│                                         │
│ ... (e assim por diante)                │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist

Marque cada variável conforme adicionar:

- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_DOMAIN`
- [ ] `NEXT_PUBLIC_FILE_RETENTION_DAYS`

**⚠️ NÃO adicione `NEXT_PUBLIC_APP_URL` ainda!** Isso será feito depois do primeiro deploy.

---

## 🔄 Depois do Deploy

Após o primeiro deploy concluir:

1. A Vercel fornecerá uma URL como: `https://ctrldespesas-web-xxxxx.vercel.app`
2. Vá em **Settings > Environment Variables**
3. Adicione:
   - **Key:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://ctrldespesas-web-xxxxx.vercel.app` (a URL que a Vercel forneceu)
4. Faça um novo deploy ou aguarde o próximo push

---

## ❓ Dúvidas Frequentes

### "De onde vêm esses valores?"
Esses valores vêm do seu projeto Firebase. Você já os tem no arquivo `.env.local` do seu computador.

### "Posso usar valores diferentes?"
Não! Esses valores são específicos do seu projeto Firebase. Se mudar, a aplicação não conseguirá conectar.

### "E se eu esquecer alguma?"
A aplicação não funcionará. O Firebase mostrará erros de configuração.

### "Posso adicionar depois?"
Sim, mas você precisará fazer um novo deploy após adicionar.

### "Essas variáveis são seguras?"
Sim! Variáveis que começam com `NEXT_PUBLIC_` são expostas no cliente, mas isso é normal para configurações do Firebase. Elas são públicas por design.

---

## 🆘 Se Algo Der Errado

Se você esquecer alguma variável ou colocar o valor errado:

1. Vá em **Settings > Environment Variables**
2. Edite ou adicione a variável correta
3. Faça um novo deploy

A Vercel mostrará erros no build se alguma variável obrigatória estiver faltando.
