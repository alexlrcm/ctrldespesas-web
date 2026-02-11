# 📚 Guia Completo: Criar Collection `users` no Firebase Firestore

Este guia mostra passo a passo como criar a collection `users` e adicionar usuários no Firebase Firestore.

---

## 🎯 Objetivo

Criar a collection `users` no Firestore com documentos contendo:
- `email`: Email do usuário (mesmo do Firebase Authentication)
- `role`: Perfil do usuário (`FINANCEIRO`, `ADMINISTRADOR`, `APROVADOR`, `OPERADOR`)
- `password`: (opcional) Senha do usuário
- `mustChangePassword`: (opcional) Boolean indicando se precisa alterar senha

---

## 📋 Passo a Passo

### Passo 1: Acessar Firebase Console

1. Abra seu navegador e acesse: **https://console.firebase.google.com/**
2. Faça login com sua conta Google
3. Selecione o projeto **CtrlDespesas** (ou o nome do seu projeto)

### Passo 2: Navegar até Firestore Database

1. No menu lateral esquerdo, clique em **"Firestore Database"** ou **"Firestore"**
2. Se for a primeira vez, você verá uma tela de boas-vindas
3. Clique em **"Criar banco de dados"** ou **"Create database"**

### Passo 3: Configurar Regras de Segurança (Primeira Vez)

Se for a primeira vez criando o Firestore:

1. Escolha o modo de segurança:
   - **Modo de teste**: Permite leitura/escrita por 30 dias (OK para desenvolvimento)
   - **Modo de produção**: Requer regras de segurança (mais seguro)

2. Selecione **"Modo de teste"** para começar rapidamente

3. Escolha a localização do servidor (ex: `southamerica-east1` para Brasil)

4. Clique em **"Habilitar"** ou **"Enable"**

### Passo 4: Criar a Collection `users`

#### Opção A: Criar Collection do Zero

1. Na tela do Firestore, você verá uma mensagem: **"Comece criando sua primeira coleção"** ou **"Start by creating your first collection"**

2. Clique em **"Iniciar coleção"** ou **"Start collection"**

3. **ID da coleção**: Digite `users` (em minúsculas, sem espaços)

4. Clique em **"Próximo"** ou **"Next"**

#### Opção B: Collection Já Existe

Se a collection `users` já existir:

1. Você verá uma lista de collections no lado esquerdo
2. Procure por `users` na lista
3. Se não existir, clique no botão **"+ Adicionar coleção"** ou **"+ Add collection"** no topo
4. Digite `users` como ID da coleção

### Passo 5: Adicionar Primeiro Documento (Usuário)

Após criar a collection, você será direcionado para adicionar o primeiro documento:

#### 5.1: Escolher ID do Documento

Você tem duas opções:

**Opção 1: Usar UID do Firebase Auth (Recomendado)**
- No campo **"ID do documento"**, cole o **UID** do usuário do Firebase Authentication
- Para encontrar o UID: Firebase Console → Authentication → Users → clique no usuário → copie o **User UID**

**Opção 2: Deixar Firebase Gerar Automaticamente**
- Deixe o campo **"ID do documento"** vazio
- O Firebase gerará um ID aleatório automaticamente
- ⚠️ **Importante**: Se usar esta opção, você precisará adicionar um campo `id` com o UID do Firebase Auth

#### 5.2: Adicionar Campos

Clique em **"Adicionar campo"** ou **"Add field"** para cada campo:

**Campo 1: `email`**
- **Nome do campo**: `email`
- **Tipo**: `string` (texto)
- **Valor**: O email do usuário (ex: `admin@giratech.com.br` ou `financeiro@giratech.com.br`)
- ⚠️ **Deve ser exatamente igual ao email no Firebase Authentication**

**Campo 2: `role`**
- **Nome do campo**: `role`
- **Tipo**: `string` (texto)
- **Valor**: Um dos seguintes (em MAIÚSCULAS):
  - `FINANCEIRO` - Para acessar dashboard financeiro
  - `ADMINISTRADOR` - Acesso total
  - `APROVADOR` - Aprova relatórios
  - `OPERADOR` - Cria relatórios e despesas

**Campo 3: `password` (Opcional)**
- **Nome do campo**: `password`
- **Tipo**: `string` (texto)
- **Valor**: A senha do usuário (ex: `Giratech2023@`)
- ⚠️ Este campo não é usado pelo web app, mas pode ser útil para referência

**Campo 4: `mustChangePassword` (Opcional)**
- **Nome do campo**: `mustChangePassword`
- **Tipo**: `boolean`
- **Valor**: `false` (marque a caixa se for `true`)

**Campo 5: `id` (Apenas se não usar UID como ID do documento)**
- **Nome do campo**: `id`
- **Tipo**: `string` (texto)
- **Valor**: O UID do Firebase Authentication
- ⚠️ Use apenas se deixou o Firebase gerar o ID do documento automaticamente

#### 5.3: Salvar Documento

1. Após adicionar todos os campos, clique em **"Salvar"** ou **"Save"**
2. O documento será criado e aparecerá na collection `users`

---

## 📝 Exemplo Prático: Criar Usuário Financeiro

### Cenário: Criar usuário `financeiro@giratech.com.br` com role `FINANCEIRO`

1. **Firebase Console → Authentication → Users**
   - Encontre o usuário `financeiro@giratech.com.br`
   - Copie o **User UID** (ex: `abc123xyz456`)

2. **Firebase Console → Firestore Database**
   - Clique em **"Iniciar coleção"** (se não existir) ou **"+ Adicionar documento"** na collection `users`
   - **ID do documento**: Cole o UID: `abc123xyz456`
   - Adicione campos:
     ```
     email: "financeiro@giratech.com.br" (string)
     role: "FINANCEIRO" (string)
     password: "senha123" (string, opcional)
     mustChangePassword: false (boolean)
     ```
   - Clique em **"Salvar"**

3. **Resultado**: O documento será criado e o usuário poderá fazer login no web app com acesso ao dashboard financeiro.

---

## 🔍 Verificar se Está Funcionando

### No Firebase Console:

1. Vá em **Firestore Database**
2. Clique na collection `users`
3. Você deve ver o documento criado
4. Clique no documento para ver os campos

### No Web App:

1. Faça login com o email do usuário criado
2. O sistema deve buscar o documento na collection `users`
3. Se encontrar, o perfil será carregado e o usuário terá acesso às funcionalidades correspondentes

---

## ⚠️ Dicas Importantes

### 1. Email Deve Ser Exatamente Igual
- O email no documento do Firestore **deve ser exatamente igual** ao email no Firebase Authentication
- Case-sensitive: `admin@giratech.com.br` ≠ `Admin@giratech.com.br`

### 2. Role é Case-Sensitive
- Use sempre MAIÚSCULAS: `FINANCEIRO`, `ADMINISTRADOR`, etc.
- `financeiro` ≠ `FINANCEIRO` (não funcionará)

### 3. UID como ID do Documento (Recomendado)
- Usar o UID do Firebase Auth como ID do documento facilita a busca
- O sistema pode buscar tanto por email quanto por UID

### 4. Múltiplos Usuários
- Repita o processo para cada usuário que precisar criar
- Cada documento representa um usuário

---

## 🆘 Problemas Comuns e Soluções

### Problema: "Collection não encontrada"
**Solução**: Certifique-se de que digitou `users` corretamente (minúsculas, sem espaços)

### Problema: "Acesso Restrito - Não definido"
**Solução**: 
1. Verifique se o documento existe na collection `users`
2. Verifique se o campo `email` está correto (case-sensitive)
3. Verifique se o campo `role` está preenchido e em MAIÚSCULAS

### Problema: "Erro ao buscar role"
**Solução**:
1. Abra o console do navegador (F12)
2. Verifique se há erros de permissão no Firestore
3. Verifique se as regras de segurança do Firestore permitem leitura

### Problema: "Usuário não encontrado"
**Solução**:
1. Verifique se o email no documento é exatamente igual ao email do Firebase Auth
2. Tente buscar manualmente no Firestore usando a query: `email == "seu@email.com"`

---

## 📸 Estrutura Final Esperada

Após criar, a collection `users` deve ter esta estrutura:

```
Collection: users
├── Documento 1 (ID: UID do Firebase Auth ou gerado)
│   ├── email: "financeiro@giratech.com.br" (string)
│   ├── role: "FINANCEIRO" (string)
│   ├── password: "senha123" (string, opcional)
│   └── mustChangePassword: false (boolean)
│
├── Documento 2 (ID: UID do Firebase Auth ou gerado)
│   ├── email: "admin@giratech.com.br" (string)
│   ├── role: "ADMINISTRADOR" (string)
│   ├── password: "Giratech2023@" (string, opcional)
│   └── mustChangePassword: false (boolean)
│
└── ... (mais documentos conforme necessário)
```

---

## ✅ Checklist

Antes de testar, verifique:

- [ ] Collection `users` foi criada no Firestore
- [ ] Documento foi criado com o email correto
- [ ] Campo `role` está preenchido e em MAIÚSCULAS
- [ ] Email no documento é exatamente igual ao email do Firebase Auth
- [ ] Se não usou UID como ID, adicionou campo `id` com o UID

---

## 🎉 Pronto!

Após seguir estes passos, o usuário poderá fazer login no web app e terá acesso às funcionalidades correspondentes ao seu perfil!
