# Instalação do Node.js - Passo a Passo

## Por que preciso do Node.js?

O Node.js é necessário para executar o projeto web Next.js. Ele inclui o `npm` (gerenciador de pacotes) que instala as dependências do projeto.

## Como Instalar

### Opção 1: Download Direto (Recomendado)

1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (Long Term Support) - recomendada para produção
3. Execute o instalador `.msi`
4. Siga as instruções do instalador (aceite os padrões)
5. **IMPORTANTE**: Marque a opção "Automatically install the necessary tools" se aparecer
6. Reinicie o terminal/PowerShell após a instalação

### Opção 2: Via Chocolatey (se já tiver instalado)

```powershell
choco install nodejs-lts
```

## Verificar Instalação

Após instalar, abra um **novo** terminal/PowerShell e execute:

```powershell
node --version
npm --version
```

Você deve ver algo como:
```
v20.11.0
10.2.4
```

## Próximos Passos Após Instalação

1. Navegue até a pasta do projeto web:
   ```powershell
   cd web-app
   ```

2. Instale as dependências:
   ```powershell
   npm install
   ```

3. Configure o arquivo `.env.local` (veja SETUP.md)

4. Execute o projeto:
   ```powershell
   npm run dev
   ```

5. Acesse no navegador: http://localhost:3000

## Versão Recomendada

- **Node.js**: v20.x LTS ou superior
- **npm**: v10.x ou superior (vem junto com Node.js)

## Problemas Comuns

### "node não é reconhecido"
- Reinicie o terminal/PowerShell
- Verifique se Node.js está instalado: `where node`
- Adicione ao PATH manualmente se necessário

### Erro de permissões
- Execute o PowerShell como Administrador
- Ou configure npm para não usar permissões elevadas:
  ```powershell
  npm config set prefix %APPDATA%\npm
  ```
