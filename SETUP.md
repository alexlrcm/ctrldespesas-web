# Guia de Configuração - CtrlDespesas Web App

## Passo 1: Instalar Dependências

```bash
cd web-app
npm install
```

## Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto `web-app/` com as seguintes variáveis:

```env
# Firebase Configuration (obtenha do Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAATPDjSZApYFuuX5yWxbDRX0aHb3DE-g0",
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="controle-de-despesas-78687.firebaseapp.com",
NEXT_PUBLIC_FIREBASE_PROJECT_ID="controle-de-despesas-78687",
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="controle-de-despesas-78687.firebasestorage.app",
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="972931672046",
NEXT_PUBLIC_FIREBASE_APP_ID="1:972931672046:web:0d02d9c8e72caca6e0d0ff"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_DOMAIN=giratech.com.br

# File Retention (days) - 90 dias = 3 meses
NEXT_PUBLIC_FILE_RETENTION_DAYS=90
```

**Nota:** Use as mesmas credenciais do Firebase que você já usa no app Android.

## Passo 3: Executar em Desenvolvimento

```bash
npm run dev
```

O app estará disponível em: http://localhost:3000

## Passo 4: Próximos Passos

1. ✅ Estrutura do projeto criada
2. ⏳ Configurar Firebase (usar mesmo projeto do Android)
3. ⏳ Criar sistema de autenticação
4. ⏳ Implementar telas e funcionalidades

## Estrutura Criada

```
web-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   └── page.tsx          # Página inicial (redireciona para /login)
├── lib/
│   ├── firebase/
│   │   └── config.ts      # Configuração Firebase
│   └── models/
│       └── types.ts       # Modelos TypeScript (User, Company, Project, etc.)
├── components/            # Componentes React (a criar)
├── hooks/                # Custom hooks (a criar)
└── types/                # Tipos TypeScript adicionais (a criar)
```

## Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Firebase** - Backend (mesmo do Android)
- **Tailwind CSS** - Estilização
- **React Hook Form** - Formulários
- **Zod** - Validação

## Observações Importantes

1. **Sem Biometria**: A autenticação web usa apenas email/senha
2. **Mesmo Firebase**: Usa o mesmo projeto Firebase do app Android
3. **Retenção de Arquivos**: Configurado para 90 dias (3 meses)
4. **Domínio**: giratech.com.br (configurar depois no Firebase Hosting)

## Próximas Implementações

- Sistema de autenticação (login/senha)
- CRUD completo de todas as entidades
- Upload de arquivos com retenção automática
- Geração de PDFs
- Envio de emails
- Interface responsiva
