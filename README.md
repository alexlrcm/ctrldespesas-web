# CtrlDespesas Web App

Aplicação web para controle de despesas, desenvolvida com Next.js, TypeScript e Firebase.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20.x ou superior
- npm 10.x ou superior
- Conta Firebase (mesmo projeto do app Android)

### Instalação

1. **Instalar Node.js** (se ainda não tiver):
   - Baixe de: https://nodejs.org/
   - Veja guia detalhado em: `INSTALACAO_NODEJS.md`

2. **Instalar dependências:**
   ```bash
   cd web-app
   npm install
   ```

3. **Configurar Firebase:**
   - Crie arquivo `.env.local` baseado em `ENV_EXAMPLE.txt`
   - Veja guia completo em: `GUIA_TESTE_COMPLETO.md`

4. **Testar configuração:**
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/test-setup.ps1
   ```

5. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

6. **Acessar no navegador:**
   - http://localhost:3000

## 📚 Documentação

- **`INSTALACAO_NODEJS.md`** - Como instalar Node.js
- **`SETUP.md`** - Configuração inicial do projeto
- **`GUIA_TESTE_COMPLETO.md`** - Guia completo para testar o app
- **`ENV_EXAMPLE.txt`** - Exemplo de variáveis de ambiente

## 🛠️ Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Firebase** - Backend (Firestore, Storage, Auth)
- **Tailwind CSS** - Estilização
- **React Hook Form** - Formulários
- **Zod** - Validação de schemas

## 📁 Estrutura do Projeto

```
web-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas protegidas
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e configurações
│   ├── firebase/         # Configuração Firebase
│   └── models/           # Modelos TypeScript
├── hooks/                # Custom hooks
├── scripts/              # Scripts utilitários
└── types/                # Tipos TypeScript

```

## ✨ Funcionalidades

- ✅ Autenticação (Login/Senha - sem biometria)
- ⏳ CRUD de Empresas
- ⏳ CRUD de Projetos
- ⏳ CRUD de Despesas
- ⏳ CRUD de Relatórios
- ⏳ CRUD de Adiantamentos
- ⏳ Upload de arquivos (comprovantes)
- ⏳ Geração de PDFs
- ⏳ Envio de emails
- ⏳ Retenção de arquivos (3 meses)

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Executa build de produção
- `npm run lint` - Executa linter
- `npm run type-check` - Verifica tipos TypeScript

## 🌐 Domínio

- **Produção**: https://giratech.com.br (a configurar)
- **Desenvolvimento**: http://localhost:3000

## 📝 Observações Importantes

1. **Sem Biometria**: A autenticação web usa apenas email/senha
2. **Mesmo Firebase**: Usa o mesmo projeto Firebase do app Android
3. **Retenção de Arquivos**: Configurado para 90 dias (3 meses)
4. **Domínio**: giratech.com.br (configurar depois no Firebase Hosting)

## 🐛 Solução de Problemas

Veja `GUIA_TESTE_COMPLETO.md` para solução de problemas comuns.

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs no terminal
2. Verifique o console do navegador (F12)
3. Execute o script de teste: `scripts/test-setup.ps1`
