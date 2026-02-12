# 🔄 Reconectar Repositório na Vercel - Solução Definitiva

## 🎯 Objetivo

Reconectar o repositório GitHub na Vercel para forçar sincronização completa e resolver o erro "A commit author is required".

## 📋 Passo a Passo

### Passo 1: Desconectar o Repositório

1. Na Vercel, vá em **Settings** (menu superior)
2. No menu lateral esquerdo, clique em **Git**
3. Na seção **"Connected Git Repository"**, você verá:
   - Repositório: `alexlrcm/ctrldespesas-web`
   - Status: "Connected X ago"
   - Botão: **"Disconnect"**
4. Clique no botão **"Disconnect"**
5. Confirme a desconexão (se pedir confirmação)

### Passo 2: Reconectar o Repositório

1. Após desconectar, você verá um botão **"Connect Git Repository"** ou **"Add Git Repository"**
2. Clique nele
3. Uma lista de repositórios do GitHub aparecerá
4. Procure e selecione: **`alexlrcm/ctrldespesas-web`**
5. Autorize as permissões necessárias (se pedir)

### Passo 3: Configurar o Deploy (Se Aparecer)

Quando reconectar, pode aparecer uma tela de configuração:

1. **Production Branch:** Deixe como **"main"** (ou selecione se aparecer opção)
2. **Root Directory:** Deixe vazio ou **"./"**
3. **Build Command:** Deve aparecer automaticamente como **"npm run build"**
4. **Output Directory:** Deve aparecer automaticamente como **".next"**
5. **Framework Preset:** Deve aparecer como **"Next.js"**

**⚠️ IMPORTANTE:** Se não aparecer essas opções, não se preocupe! A Vercel detecta automaticamente.

### Passo 4: Verificar Variáveis de Ambiente

Após reconectar, verifique se as variáveis de ambiente ainda estão configuradas:

1. Vá em **Settings > Environment Variables**
2. Confirme que todas as 8 variáveis estão lá:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_DOMAIN`
   - `NEXT_PUBLIC_FILE_RETENTION_DAYS`

**Se faltar alguma, adicione novamente!**

### Passo 5: Aguardar Deploy Automático

1. Após reconectar, a Vercel vai fazer um deploy automático
2. Vá em **Deployments** para acompanhar
3. Aguarde 2-3 minutos
4. O deploy deve usar o commit mais recente (`bff0236` ou `567581a`)

## ✅ O Que Esperar

Após reconectar:

- ✅ Um novo deploy aparece automaticamente em Deployments
- ✅ O commit usado será o mais recente do branch `main`
- ✅ Status ficará "Ready" (verde) após alguns minutos
- ✅ Suas alterações aparecerão na aplicação

## 🔍 Verificar se Funcionou

1. Vá em **Deployments**
2. Verifique o commit hash do novo deploy:
   - Deve ser `bff0236` ou `567581a` (não deve ser `00714b2`)
3. Clique no deploy para ver detalhes
4. Confirme que o status está "Ready"

## 🆘 Se Ainda Não Funcionar

### Alternativa: Verificar Permissões do GitHub

1. No GitHub, vá em: https://github.com/settings/applications
2. Procure por **"Vercel"** nas aplicações autorizadas
3. Verifique se está autorizada
4. Se não estiver, autorize novamente ao reconectar na Vercel

### Último Recurso: Criar Novo Projeto

Se nada funcionar:

1. Na Vercel, crie um **novo projeto**
2. Importe o mesmo repositório `alexlrcm/ctrldespesas-web`
3. Configure as variáveis de ambiente
4. Faça o deploy

## 📝 Notas Importantes

- ⚠️ **Não se preocupe:** Desconectar e reconectar não apaga nada
- ✅ **Variáveis de ambiente:** Podem ser preservadas, mas verifique sempre
- ✅ **Domínios:** Continuam funcionando normalmente
- ✅ **Histórico de deploys:** Pode ser perdido, mas novos deploys funcionarão
