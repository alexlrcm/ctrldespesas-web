# 🔒 Corrigir Vulnerabilidades npm - Guia

## ⚠️ Importante

As vulnerabilidades do npm **NÃO impedem** a aplicação de funcionar. Você pode corrigi-las **depois** que tudo estiver rodando.

---

## 📋 Tipos de Vulnerabilidades

### 1. Vulnerabilidades de Desenvolvimento (Não Afetam Produção)

- `eslint`, `eslint-config-next` - Ferramentas de desenvolvimento
- `glob`, `minimatch` - Usados apenas durante build
- `rimraf` - Usado apenas durante build

**Impacto:** Nenhum em produção. Apenas afetam o ambiente de desenvolvimento.

### 2. Vulnerabilidades de Produção (Podem Ser Atualizadas Depois)

- `next` - Framework principal (pode ser atualizado)
- `firebase` - SDK do Firebase (pode ser atualizado)
- `jspdf` - Biblioteca de PDF (pode ser atualizado)

**Impacto:** Baixo. As vulnerabilidades são principalmente DoS (Denial of Service) que requerem configurações específicas para serem exploradas.

---

## ✅ Passo 1: Tentar Correções Sem Breaking Changes

Execute **DEPOIS** que a aplicação estiver funcionando:

```bash
cd /var/www/ctrldespesas-web/web-app

# Parar aplicação temporariamente
pm2 stop ctrldespesas-web

# Tentar correções automáticas (sem breaking changes)
npm audit fix

# Verificar se corrigiu algo
npm audit

# Rebuild se necessário
npm run build

# Reiniciar aplicação
pm2 start ctrldespesas-web
```

---

## 🔧 Passo 2: Atualizar Dependências Manualmente (Se Necessário)

Se `npm audit fix` não resolver tudo, você pode atualizar manualmente:

### Atualizar Next.js

```bash
# Verificar versão atual
npm list next

# Atualizar para versão mais recente compatível
npm install next@latest

# Rebuild
npm run build
pm2 restart ctrldespesas-web
```

### Atualizar Firebase

```bash
# Verificar versão atual
npm list firebase

# Atualizar para versão mais recente
npm install firebase@latest

# Rebuild
npm run build
pm2 restart ctrldespesas-web
```

### Atualizar jspdf

```bash
# Verificar versão atual
npm list jspdf

# Atualizar para versão mais recente
npm install jspdf@latest jspdf-autotable@latest

# Rebuild
npm run build
pm2 restart ctrldespesas-web
```

---

## ⚠️ NÃO Execute Agora

**NÃO execute** `npm audit fix --force` agora porque:

1. Pode atualizar dependências para versões incompatíveis
2. Pode quebrar a aplicação
3. Requer testes extensivos

**Faça isso apenas depois que tudo estiver funcionando e você tiver tempo para testar!**

---

## 📊 Verificar Vulnerabilidades

Para ver detalhes das vulnerabilidades:

```bash
npm audit
```

Para ver apenas vulnerabilidades críticas:

```bash
npm audit --audit-level=critical
```

---

## 💡 Prioridades

1. **Alta Prioridade:** Vulnerabilidades críticas em dependências de produção
2. **Média Prioridade:** Vulnerabilidades high em dependências de produção
3. **Baixa Prioridade:** Vulnerabilidades em dependências de desenvolvimento

---

## ✅ Checklist de Correção

- [ ] Aplicação funcionando normalmente
- [ ] Backup do código atual
- [ ] Executar `npm audit fix` (sem --force)
- [ ] Testar aplicação após correções
- [ ] Se necessário, atualizar dependências manualmente
- [ ] Testar todas as funcionalidades
- [ ] Rebuild e restart da aplicação

---

## 🚨 Se Algo Quebrar Após Atualizar

```bash
# Restaurar versões anteriores
cd /var/www/ctrldespesas-web/web-app

# Ver histórico de package.json
git log package.json  # Se usar Git

# OU restaurar do backup
cp package.json.backup package.json

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
pm2 restart ctrldespesas-web
```

---

**✅ Lembre-se: As vulnerabilidades não impedem a aplicação de funcionar. Corrija depois!**
