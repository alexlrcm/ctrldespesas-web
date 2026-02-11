# 🔧 Solução de Erros nos Testes

## Problema 1: Porta Diferente (3000 vs 3001)

### Situação
O servidor Next.js está rodando na porta **3001** porque a porta 3000 está ocupada.

### Solução

**Opção 1: Usar a porta 3001 (Mais Rápido)**
- Acesse: http://localhost:3001/login
- Ou: http://localhost:3001

**Opção 2: Liberar a porta 3000**
1. Pare o servidor atual (`Ctrl+C`)
2. Encontre o processo usando a porta 3000:
   ```powershell
   netstat -ano | findstr :3000
   ```
3. Mate o processo (substitua PID pelo número encontrado):
   ```powershell
   taskkill /PID <PID> /F
   ```
4. Execute novamente:
   ```powershell
   npm run dev
   ```

---

## Problema 2: Página "Carregando..." Infinitamente

### Possíveis Causas

#### Causa 1: Firebase não configurado
**Sintoma**: Página fica em "Carregando..." e não carrega

**Solução**:
1. Verifique se o arquivo `.env.local` existe na pasta `web-app/`
2. Verifique se todas as variáveis estão preenchidas:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```
3. **Reinicie o servidor** após criar/editar `.env.local`

#### Causa 2: Erro no código de autenticação
**Sintoma**: Erros no console do navegador (F12)

**Solução**:
1. Abra o console do navegador (F12)
2. Veja os erros exibidos
3. Verifique se o Firebase está inicializado corretamente

#### Causa 3: Credenciais Firebase incorretas
**Sintoma**: Erro "Firebase: Error (auth/configuration-not-found)"

**Solução**:
1. Verifique as credenciais no Firebase Console
2. Certifique-se de que copiou corretamente
3. Verifique se não há espaços extras no `.env.local`

---

## Problema 3: Erro "Cannot find module"

### Solução
```powershell
# Limpar cache e reinstalar
rm -rf node_modules .next
npm install
npm run dev
```

---

## Problema 4: Erro de TypeScript

### Solução
```powershell
# Verificar erros de tipo
npm run type-check
```

---

## Checklist de Verificação

Antes de testar, verifique:

- [ ] Servidor rodando (veja a porta no terminal)
- [ ] Acessando a porta correta (3001 se mostrado no terminal)
- [ ] Arquivo `.env.local` existe e está configurado
- [ ] Servidor foi reiniciado após criar `.env.local`
- [ ] Console do navegador (F12) não mostra erros críticos
- [ ] Firebase Authentication habilitado no Console

---

## Como Verificar Erros

### 1. Console do Navegador
1. Abra o navegador
2. Pressione **F12**
3. Vá na aba **Console**
4. Veja se há erros em vermelho

### 2. Terminal do Servidor
1. Veja o terminal onde o `npm run dev` está rodando
2. Procure por erros em vermelho
3. Veja se há mensagens de compilação

### 3. Network Tab
1. No navegador, pressione **F12**
2. Vá na aba **Network**
3. Recarregue a página (F5)
4. Veja se há requisições falhando (em vermelho)

---

## Erros Comuns e Soluções

### Erro: "Firebase: Error (auth/configuration-not-found)"
**Solução**: Verifique `.env.local` e reinicie o servidor

### Erro: "Cannot read property 'auth' of undefined"
**Solução**: Verifique se o Firebase está inicializado corretamente em `lib/firebase/config.ts`

### Erro: "useAuthContext must be used within an AuthProvider"
**Solução**: Verifique se o `AuthProvider` está no `layout.tsx`

### Erro: "Module not found"
**Solução**: Execute `npm install` novamente

---

## Teste Passo a Passo

1. **Verifique a porta**:
   - Veja no terminal qual porta está sendo usada
   - Acesse essa porta no navegador

2. **Verifique o console**:
   - Abra F12 no navegador
   - Veja se há erros

3. **Verifique o Firebase**:
   - Confirme que `.env.local` existe
   - Confirme que todas as variáveis estão preenchidas

4. **Reinicie o servidor**:
   - Pare com `Ctrl+C`
   - Execute `npm run dev` novamente

5. **Teste novamente**:
   - Acesse a URL correta
   - Veja se a página carrega

---

## Se Nada Funcionar

1. Compartilhe os erros do console do navegador (F12)
2. Compartilhe os erros do terminal
3. Verifique se o arquivo `.env.local` está correto
4. Tente acessar http://localhost:3001 diretamente
