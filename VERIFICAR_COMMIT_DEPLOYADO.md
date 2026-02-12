# 🔍 Como Verificar Qual Commit Foi Deployado na Vercel

## 📋 Passo a Passo Completo

### Passo 1: Acessar o Dashboard da Vercel

1. Acesse: https://vercel.com
2. Faça login na sua conta
3. Você verá a lista de seus projetos

### Passo 2: Abrir o Projeto

1. Clique no projeto **"ctrldespesas-web"** (ou o nome do seu projeto)
2. Você será direcionado para a página do projeto

### Passo 3: Ver os Deployments

1. No menu superior, clique em **"Deployments"** (ou "Deploys")
2. Você verá uma lista de todos os deploys feitos

### Passo 4: Verificar o Último Deploy

1. O último deploy aparece no **topo da lista**
2. Você verá informações como:
   - Status (Ready, Building, Error, etc.)
   - Tempo do deploy
   - Branch (geralmente "main")
   - **Commit hash** (ex: `26bd306`)

### Passo 5: Ver Detalhes do Commit

1. **Clique no último deploy** (na linha do deploy)
2. Você verá uma página com detalhes do deploy
3. Procure por:
   - **"Commit"** ou **"Git Commit"**
   - O hash do commit (ex: `26bd306`)
   - A mensagem do commit (ex: "Header fixo em todas as páginas de relatórios")

### Passo 6: Comparar com o GitHub

1. Abra uma nova aba e acesse: https://github.com/alexlrcm/ctrldespesas-web
2. Clique em **"Commits"** (ou veja na página inicial)
3. Compare o hash do commit mais recente com o que aparece na Vercel

**Exemplo:**
- **Vercel mostra:** `26bd306` - "Header fixo em todas as páginas de relatórios"
- **GitHub mostra:** `26bd306` - "Header fixo em todas as páginas de relatórios"
- ✅ **Se forem iguais:** O deploy está usando o commit correto
- ❌ **Se forem diferentes:** O deploy está usando um commit antigo

---

## 🎯 O Que Procurar na Vercel

### Na Lista de Deployments:

```
┌─────────────────────────────────────────────────┐
│ Status  │ Branch │ Commit    │ Time             │
├─────────────────────────────────────────────────┤
│ ✅ Ready│ main   │ 26bd306   │ 2 minutes ago   │ ← Último deploy
│ ✅ Ready│ main   │ ccd5150   │ 1 hour ago      │
│ ✅ Ready│ main   │ 00714b2   │ 2 hours ago     │
└─────────────────────────────────────────────────┘
```

### Na Página de Detalhes do Deploy:

Você verá algo como:

```
Deployment Details
─────────────────
Status: Ready
Branch: main
Commit: 26bd306
Message: Header fixo em todas as páginas de relatórios
Author: Seu Nome
Time: 2 minutes ago
```

---

## 🔍 Verificação Rápida via Terminal

Você também pode verificar via terminal:

```powershell
# Ver commits locais
git log --oneline -5

# Ver commits no GitHub (remoto)
git fetch origin
git log origin/main --oneline -5

# Comparar local com remoto
git log HEAD..origin/main --oneline  # Commits no remoto que não estão local
git log origin/main..HEAD --oneline  # Commits locais que não estão no remoto
```

---

## ⚠️ Problemas Comuns

### Problema 1: Commit na Vercel é diferente do GitHub

**Causa:** O deploy pode ter sido feito antes do push, ou houve um problema no webhook.

**Solução:**
1. Faça um redeploy na Vercel
2. Ou faça um novo commit vazio para forçar deploy

### Problema 2: Não consigo ver o commit na Vercel

**Causa:** Pode estar na página errada ou o deploy ainda está em andamento.

**Solução:**
1. Certifique-se de estar em **Deployments** (não Settings)
2. Aguarde o deploy concluir se estiver "Building"

### Problema 3: O commit está correto mas as alterações não aparecem

**Causa:** Cache do navegador ou cache da Vercel.

**Solução:**
1. Limpe o cache do navegador (`Ctrl + F5`)
2. Faça um redeploy na Vercel
3. Limpe o cache da Vercel em Settings > General > Clear Build Cache

---

## 📸 Onde Encontrar na Interface da Vercel

### Opção 1: Lista de Deployments
```
Dashboard → Projeto → Deployments (menu superior)
```

### Opção 2: Página do Projeto
```
Dashboard → Projeto → Ver último deploy (card no topo)
```

### Opção 3: URL Direta
```
https://vercel.com/[seu-usuario]/ctrldespesas-web/deployments
```

---

## ✅ Checklist de Verificação

- [ ] Acessei o dashboard da Vercel
- [ ] Abri o projeto correto
- [ ] Fui para a aba "Deployments"
- [ ] Identifiquei o último deploy
- [ ] Anotei o hash do commit (ex: `26bd306`)
- [ ] Comparei com o commit mais recente no GitHub
- [ ] Verifiquei se são iguais

---

## 🆘 Se Precisar de Ajuda

Se os commits não coincidirem ou houver algum problema:

1. **Tire um print** da tela da Vercel mostrando o commit
2. **Tire um print** da tela do GitHub mostrando os commits
3. **Execute** `git log --oneline -5` no terminal
4. Compartilhe essas informações para análise
