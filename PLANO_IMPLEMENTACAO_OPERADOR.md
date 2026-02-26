# 📋 Plano de Implementação: Perfil OPERADOR no Web App

## 🎯 Objetivo

Implementar todas as funcionalidades do perfil OPERADOR do aplicativo Android no web app.

---

## 📊 Funcionalidades do OPERADOR no Android

### Dashboard:
- ✅ Ver despesas sem relatórios (próprias)
- ✅ Ver adiantamentos (próprios, todos os status)
- ✅ Ver relatórios (próprios)
- ✅ Botões de ação:
  - Novo Relatório
  - Novo Adiantamento
  - Nova Despesa
  - Projetos

### Funcionalidades:
1. **Criar/Editar Despesas**
   - Tipo de despesa
   - Valor
   - Data
   - Método de pagamento
   - Reembolsável
   - Projeto associado
   - Observações
   - Upload de comprovante (imagem/PDF)

2. **Criar/Editar Relatórios**
   - Nome do relatório
   - Data
   - Adicionar despesas ao relatório
   - Empresa
   - Projeto
   - Status

3. **Criar/Editar Adiantamentos**
   - Nome
   - Valor
   - Período de trabalho
   - Motivo
   - Projeto
   - Status

4. **Visualizar Projetos**
   - Lista de projetos
   - Detalhes do projeto

5. **Perfil do Usuário**
   - Editar informações pessoais
   - Alterar senha
   - Foto de perfil

---

## 🏗️ Estrutura de Arquivos a Criar

```
web-app/
├── app/
│   ├── dashboard/
│   │   └── page.tsx (atualizar para suportar OPERADOR)
│   ├── expenses/
│   │   ├── page.tsx (lista de despesas)
│   │   ├── new/
│   │   │   └── page.tsx (criar despesa)
│   │   └── [id]/
│   │       └── page.tsx (editar despesa)
│   ├── reports/
│   │   ├── page.tsx (lista de relatórios - já existe parcialmente)
│   │   ├── new/
│   │   │   └── page.tsx (criar relatório)
│   │   └── [id]/
│   │       └── page.tsx (detalhes do relatório - já existe)
│   ├── advances/
│   │   ├── page.tsx (lista de adiantamentos)
│   │   ├── new/
│   │   │   └── page.tsx (criar adiantamento)
│   │   └── [id]/
│   │       └── page.tsx (detalhes do adiantamento - já existe parcialmente)
│   ├── projects/
│   │   ├── page.tsx (lista de projetos)
│   │   └── [id]/
│   │       └── page.tsx (detalhes do projeto)
│   └── profile/
│       └── page.tsx (perfil do usuário)
├── hooks/
│   └── useOperador.ts (hook para operações do OPERADOR)
├── components/
│   ├── ExpenseForm.tsx (formulário de despesa)
│   ├── ReportForm.tsx (formulário de relatório)
│   ├── AdvanceForm.tsx (formulário de adiantamento)
│   └── ProjectCard.tsx (card de projeto)
└── lib/
    └── services/
        └── operador.ts (serviços específicos do OPERADOR)
```

---

## 📝 Checklist de Implementação

### Fase 1: Estrutura Base ✅
- [x] Verificar que UserRole.OPERADOR existe
- [x] Verificar que useUserRole retorna isOperador
- [ ] Criar hook useOperador
- [ ] Criar serviços para OPERADOR

### Fase 2: Dashboard do OPERADOR
- [ ] Atualizar dashboard/page.tsx para suportar OPERADOR
- [ ] Mostrar despesas sem relatórios (próprias)
- [ ] Mostrar adiantamentos (próprios)
- [ ] Mostrar relatórios (próprios)
- [ ] Adicionar botões de ação

### Fase 3: Gestão de Despesas
- [ ] Criar página de lista de despesas
- [ ] Criar página de criar/editar despesa
- [ ] Implementar upload de comprovante
- [ ] Integrar com Firestore

### Fase 4: Gestão de Relatórios
- [ ] Criar página de criar relatório
- [ ] Atualizar página de detalhes do relatório
- [ ] Permitir adicionar despesas ao relatório
- [ ] Integrar com Firestore

### Fase 5: Gestão de Adiantamentos
- [ ] Criar página de lista de adiantamentos
- [ ] Criar página de criar adiantamento
- [ ] Atualizar página de detalhes
- [ ] Integrar com Firestore

### Fase 6: Projetos
- [ ] Criar página de lista de projetos
- [ ] Criar página de detalhes do projeto
- [ ] Integrar com Firestore

### Fase 7: Perfil do Usuário
- [ ] Criar página de perfil
- [ ] Permitir editar informações
- [ ] Permitir alterar senha
- [ ] Permitir upload de foto

---

## 🔧 Próximos Passos

1. **Criar hook useOperador** - Para gerenciar estado e operações do OPERADOR
2. **Atualizar dashboard** - Para mostrar conteúdo específico do OPERADOR
3. **Criar páginas de CRUD** - Despesas, Relatórios, Adiantamentos
4. **Implementar upload de arquivos** - Para comprovantes
5. **Testar integração** - Com Firestore e autenticação

---

## 📚 Referências

- Código Android: `app-android/app/src/main/java/com/projmanager/ctrldespesas/ui/screens/`
- Tipos e modelos: `lib/models/types.ts`
- Serviços Firestore: `lib/services/firestore.ts`
- Hook de role: `hooks/useUserRole.ts`

---

**Vamos começar pela Fase 1 e 2!**
