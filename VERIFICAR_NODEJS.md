# ✅ Verificar Instalação do Node.js

## Problema Comum

Após instalar o Node.js (mesmo que tenha dado erro no Chocolatey), o terminal atual pode não reconhecer os comandos `node` e `npm` porque o PATH não foi atualizado.

## Solução: Reiniciar o Terminal

### Passo 1: Fechar o Terminal Atual

1. Feche completamente o PowerShell/terminal que está usando
2. **Não apenas feche a aba**, feche a janela inteira

### Passo 2: Abrir Novo Terminal

1. Abra um **novo** PowerShell ou terminal
2. Navegue até a pasta do projeto:
   ```powershell
   cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
   ```

### Passo 3: Verificar Instalação

Execute estes comandos:

```powershell
node --version
npm --version
```

**Se funcionar**, você verá algo como:
```
v20.11.0
10.2.4
```

**Se ainda não funcionar**, veja a seção "Solução Alternativa" abaixo.

---

## Solução Alternativa: Verificar Instalação Manual

Se mesmo após reiniciar não funcionar:

### 1. Verificar se Node.js está instalado

```powershell
# Verificar se existe na pasta padrão
Test-Path "C:\Program Files\nodejs\node.exe"
```

### 2. Adicionar ao PATH manualmente (se necessário)

1. Pressione `Win + R`
2. Digite: `sysdm.cpl` e pressione Enter
3. Aba "Avançado" > "Variáveis de Ambiente"
4. Em "Variáveis do sistema", encontre "Path"
5. Clique em "Editar"
6. Verifique se existe: `C:\Program Files\nodejs`
7. Se não existir, clique em "Novo" e adicione: `C:\Program Files\nodejs`
8. Clique em "OK" em todas as janelas
9. **Reinicie o terminal novamente**

---

## Teste Rápido

Após reiniciar o terminal, execute:

```powershell
cd C:\Users\giratech02\Documents\CtrlDespesas\web-app
node --version
npm --version
```

Se ambos funcionarem, você está pronto para continuar!

---

## Próximos Passos

1. ✅ Node.js instalado e funcionando
2. ⏳ Instalar dependências: `npm install`
3. ⏳ Configurar `.env.local` com credenciais Firebase
4. ⏳ Executar: `npm run dev`
