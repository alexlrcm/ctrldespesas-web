# 📝 Como Criar Usuário no Firestore para o Web App

Este guia explica como criar um usuário na collection `users` do Firestore para que o sistema web possa identificar o perfil (role) do usuário.

## 🔍 Problema

O Firebase Authentication gerencia apenas autenticação (email/senha), mas o sistema precisa saber o **perfil (role)** do usuário, que está armazenado no Firestore na collection `users`.

## ✅ Solução: Criar Documento no Firestore

### Passo 1: Acessar Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Selecione seu projeto
3. Vá em **Firestore Database**

### Passo 2: Criar/Editar Documento na Collection `users`

1. Se a collection `users` não existir, clique em **"Iniciar coleção"**
   - **ID da coleção**: `users`
   - Clique em **"Próximo"**

2. Clique em **"Adicionar documento"** (ou edite um documento existente)

3. **ID do documento**: 
   - Opção A: Use o **UID do Firebase Auth** (recomendado)
     - Para encontrar o UID: Firebase Console → Authentication → Users → copie o UID do usuário
   - Opção B: Deixe o Firebase gerar automaticamente

4. Adicione os seguintes campos:

| Campo | Tipo | Valor | Descrição |
|-------|------|-------|-----------|
| `email` | string | `seu@email.com` | Email do usuário (deve ser o mesmo do Firebase Auth) |
| `role` | string | `FINANCEIRO` | Perfil do usuário (veja valores abaixo) |
| `password` | string | (opcional) | Senha (não é usada no web app, mas pode ser útil) |
| `mustChangePassword` | boolean | `false` | Se o usuário precisa alterar senha |
| `id` | string | (opcional) | Se o documento não usar UID como ID, adicione este campo |

### Valores Possíveis para `role`:

- `FINANCEIRO` - Perfil Financeiro (acesso ao dashboard de relatórios)
- `ADMINISTRADOR` - Administrador (acesso total)
- `APROVADOR` - Aprovador (aprova relatórios)
- `OPERADOR` - Operador (cria relatórios e despesas)

### Exemplo de Documento:

**Opção A: Usando UID como ID do documento**
```
ID do documento: abc123xyz456 (UID do Firebase Auth)

Campos:
- email: "financeiro@giratech.com.br" (string)
- role: "FINANCEIRO" (string)
- password: "senha123" (string, opcional)
- mustChangePassword: false (boolean)
```

**Opção B: Firebase gera ID automaticamente**
```
ID do documento: (gerado automaticamente pelo Firebase)

Campos:
- id: "abc123xyz456" (string) - UID do Firebase Auth
- email: "financeiro@giratech.com.br" (string)
- role: "FINANCEIRO" (string)
- password: "senha123" (string, opcional)
- mustChangePassword: false (boolean)
```

## 🔍 Verificar se Está Funcionando

1. Faça login no web app com o email do usuário
2. O sistema deve buscar o documento na collection `users` pelo email
3. Se encontrar, o perfil será carregado e o usuário terá acesso às funcionalidades correspondentes

## ⚠️ Importante

- O **email** no documento do Firestore deve ser **exatamente igual** ao email usado no Firebase Authentication
- O campo **role** é **case-sensitive** (use maiúsculas: `FINANCEIRO`, `ADMINISTRADOR`, etc.)
- Se o documento não for encontrado, o sistema mostrará "Acesso Restrito" e uma mensagem informando que o perfil não foi definido

## 🆘 Problemas Comuns

### "Acesso Restrito - Não definido"
- Verifique se existe um documento na collection `users` com o email correto
- Verifique se o campo `role` está preenchido e com valor válido
- Verifique se o email no documento é exatamente igual ao email do Firebase Auth

### Usuário não encontrado
- Verifique se a collection `users` existe no Firestore
- Verifique se o email está correto (case-sensitive)
- Tente buscar manualmente no Firebase Console usando a query: `email == "seu@email.com"`
