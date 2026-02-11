# 🚀 Script Rápido: Criar Usuário no Firestore

## Para Usuário FINANCEIRO

### Passos Rápidos:

1. **Firebase Console** → **Firestore Database**
2. Clique em **"+ Adicionar documento"** (ou crie collection `users` se não existir)
3. **ID do documento**: Cole o UID do Firebase Auth (ou deixe vazio)
4. Adicione campos:

```
email: "financeiro@giratech.com.br"
role: "FINANCEIRO"
password: "senha123" (opcional)
mustChangePassword: false
```

5. Clique em **"Salvar"**

---

## Para Usuário ADMINISTRADOR

```
email: "admin@giratech.com.br"
role: "ADMINISTRADOR"
password: "Giratech2023@" (opcional)
mustChangePassword: false
```

---

## Para Usuário APROVADOR

```
email: "aprovador@giratech.com.br"
role: "APROVADOR"
password: "senha123" (opcional)
mustChangePassword: false
```

---

## Para Usuário OPERADOR

```
email: "operador@giratech.com.br"
role: "OPERADOR"
password: "senha123" (opcional)
mustChangePassword: false
```

---

## ⚠️ Lembrete

- O **email** deve ser exatamente igual ao email no Firebase Authentication
- O **role** deve estar em MAIÚSCULAS
- Se não usar UID como ID do documento, adicione campo `id` com o UID
