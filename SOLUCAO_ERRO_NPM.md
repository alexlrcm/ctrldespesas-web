# 🔧 Solução: Erro de Execução do npm no PowerShell

## Problema

O PowerShell está bloqueando a execução de scripts do npm devido à política de segurança.

**Erro:**
```
npm : O arquivo C:\Program Files\nodejs\npm.ps1 não pode ser carregado porque 
a execução de scripts foi desabilitada neste sistema.
```

## Solução Rápida (Recomendada)

Execute este comando no PowerShell **como Administrador**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Quando perguntar se deseja continuar, digite `S` (Sim) e pressione Enter.

---

## Passo a Passo Detalhado

### Opção 1: Alterar Política para Usuário Atual (Mais Seguro)

1. Abra o PowerShell **como Administrador**:
   - Clique com botão direito no PowerShell
   - Selecione "Executar como administrador"

2. Execute o comando:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. Digite `S` quando perguntado e pressione Enter

4. Feche e abra um novo PowerShell (não precisa ser admin)

5. Teste:
   ```powershell
   npm --version
   ```

### Opção 2: Alterar Política Temporariamente (Apenas para esta sessão)

Se não quiser alterar a política permanentemente:

```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

**Nota:** Isso só funciona para a sessão atual do PowerShell.

---

## Verificar Política Atual

Para ver qual política está ativa:

```powershell
Get-ExecutionPolicy -List
```

Você verá algo como:
```
        Scope ExecutionPolicy
        ----- ---------------
MachinePolicy       Undefined
   UserPolicy       Undefined
      Process       Undefined
  CurrentUser       Restricted
 LocalMachine       Undefined
```

---

## Explicação das Políticas

- **Restricted**: Bloqueia todos os scripts (padrão em alguns sistemas)
- **RemoteSigned**: Permite scripts locais, mas requer assinatura para scripts baixados (recomendado)
- **Unrestricted**: Permite todos os scripts (menos seguro)
- **Bypass**: Ignora todas as políticas (apenas para testes)

---

## Após Resolver

Depois de alterar a política, teste:

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
npm --version
node --version
```

Se ambos funcionarem, você pode continuar com:

```powershell
npm install
```

---

## Alternativa: Usar CMD ao invés de PowerShell

Se preferir não alterar a política do PowerShell, você pode usar o **CMD** (Prompt de Comando):

1. Abra o CMD (não precisa ser admin)
2. Navegue até a pasta:
   ```cmd
   cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
   ```
3. Execute:
   ```cmd
   npm --version
   npm install
   npm run dev
   ```

O CMD não tem essas restrições de política de execução.
