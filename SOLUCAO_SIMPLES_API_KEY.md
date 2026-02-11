# 🎯 Solução Simples: API Key Inválida

## ⚠️ Problema

As configurações de API Key estão no **Google Cloud Console**, não no Firebase Console.

---

## ✅ Solução Mais Simples: Usar API Key do App Android

Se o app Android está funcionando, use a mesma API Key:

### Passo 1: Obter API Key do App Android

1. **Firebase Console**: https://console.firebase.google.com/
2. Selecione projeto: **"Controle de Despesas"**
3. Clique no ícone de **engrenagem** ⚙️ > **"Configurações do projeto"**
4. Role até **"Seus apps"**
5. Clique no **app Android** (não o Web)
6. Você verá as credenciais do app Android
7. **Copie a API Key** que aparece lá

### Passo 2: Atualizar .env.local

1. Abra o arquivo `.env.local` na pasta `web-app/`
2. Substitua a linha da API Key pela API Key do app Android
3. Salve o arquivo

### Passo 3: Reiniciar Servidor

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app

# Pare o servidor (Ctrl+C)

# Limpar cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Reiniciar
npm run dev
```

### Passo 4: Testar

1. Feche e reabra o navegador
2. Acesse: http://localhost:3000/login
3. Tente fazer login

---

## 🔄 Alternativa: Acessar Google Cloud Console Direto

Se quiser verificar/ajustar a API Key atual:

### URL Direta:

Acesse diretamente:
```
https://console.cloud.google.com/apis/credentials?project=controle-de-despesas-78687
```

Isso deve abrir a página de credenciais diretamente.

### O Que Fazer Lá:

1. Procure pela API Key: `AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0`
2. Clique nela
3. Em **"Restrições de aplicativo"**: Selecione **"Nenhuma"**
4. Em **"Restrições de API"**: Selecione **"Não restringir chave"**
5. Clique em **"Salvar"**
6. Aguarde 1-2 minutos
7. Teste o login

---

## 🎯 Solução Mais Rápida: Criar Nova API Key

Se não conseguir acessar o Google Cloud Console:

### Via Firebase Console:

1. Firebase Console > Configurações do projeto
2. "Seus apps" > App Web (`GCDespesasWeb`)
3. Clique nos **3 pontinhos** (⋮) ao lado
4. Se aparecer **"Gerenciar chaves da API"**, clique
5. Isso abre o Google Cloud Console
6. Clique em **"+ Criar chave"**
7. Dê um nome e **não adicione restrições**
8. Copie a nova chave
9. Atualize `.env.local`
10. Reinicie o servidor

---

## 💡 Recomendação

**Use a API Key do app Android** - é a solução mais rápida e simples!

Se o app Android está funcionando, significa que essa API Key não tem problemas de restrições. Use a mesma no web app.

---

## 📋 Passo a Passo Resumido

1. ✅ Firebase Console > Configurações > App Android
2. ✅ Copiar API Key do app Android
3. ✅ Colar no `.env.local` (substituir a atual)
4. ✅ Reiniciar servidor
5. ✅ Testar login

---

## 📞 Se Ainda Não Funcionar

Compartilhe:
1. Se conseguiu copiar a API Key do app Android
2. Se atualizou o `.env.local`
3. Se reiniciou o servidor
4. O que aparece no console do navegador após tentar login
