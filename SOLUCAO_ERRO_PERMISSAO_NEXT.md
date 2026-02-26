# 🔧 Solução: Erro Permission Denied - next

## Problema

O erro `sh: 1: next: Permission denied` indica que o executável `next` não tem permissões de execução.

**Causa comum:** Arquivos copiados sem preservar permissões de execução, especialmente em `node_modules/.bin/`.

---

## ✅ Solução Rápida

Execute na VPS:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Verificar permissões do executável next
ls -la node_modules/.bin/next 2>/dev/null || echo "next não encontrado em node_modules/.bin/"

# 2. Corrigir permissões de todos os executáveis em node_modules/.bin/
chmod +x node_modules/.bin/* 2>/dev/null || true

# 3. Verificar se next está acessível
which next || echo "next não está no PATH"

# 4. Tentar build novamente
npm run build
```

---

## 🚀 Solução Completa: Reinstalar Dependências

Se corrigir permissões não funcionar, reinstale as dependências:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Remover node_modules completamente
rm -rf node_modules package-lock.json

# 2. Limpar cache npm
npm cache clean --force

# 3. Reinstalar dependências (isso criará os executáveis com permissões corretas)
npm install

# 4. Verificar permissões após instalação
ls -la node_modules/.bin/next

# 5. Tentar build
npm run build
```

---

## 🔧 Solução Alternativa: Usar npx

Se o problema persistir, use `npx` para executar o next diretamente:

```bash
cd /var/www/ctrldespesas-web/web-app

# Usar npx em vez do executável direto
npx next build
```

Ou modificar temporariamente o `package.json`:

```bash
# Verificar scripts atuais
cat package.json | grep -A 5 '"scripts"'

# O script 'build' já deve estar usando 'next build' que será resolvido pelo npm
# Mas você pode forçar usar npx:
```

---

## 🔍 Diagnóstico Completo

Execute para ver o que está acontecendo:

```bash
cd /var/www/ctrldespesas-web/web-app

echo "=== DIAGNÓSTICO PERMISSÕES ==="
echo ""
echo "1. Verificando node_modules/.bin/next:"
ls -la node_modules/.bin/next 2>/dev/null || echo "❌ Não encontrado"
echo ""

echo "2. Verificando permissões de node_modules/.bin/:"
ls -la node_modules/.bin/ | head -10
echo ""

echo "3. Verificando se next está no PATH:"
which next || echo "❌ Não está no PATH"
echo ""

echo "4. Tentando executar next diretamente:"
node_modules/.bin/next --version 2>&1 || echo "❌ Erro ao executar"
echo ""

echo "5. Verificando usuário atual:"
whoami
echo ""

echo "6. Verificando permissões do diretório:"
ls -ld .
echo ""

echo "7. Verificando node e npm:"
node --version
npm --version
```

---

## 🚀 Script Completo de Correção

```bash
cd /var/www/ctrldespesas-web/web-app && \
echo "🔧 Corrigindo permissões..." && \
chmod +x node_modules/.bin/* 2>/dev/null || true && \
if [ -f node_modules/.bin/next ]; then \
    chmod +x node_modules/.bin/next && \
    echo "✅ Permissões corrigidas para next"; \
else \
    echo "⚠️  next não encontrado - reinstalando dependências..." && \
    rm -rf node_modules package-lock.json && \
    npm install && \
    echo "✅ Dependências reinstaladas"; \
fi && \
echo "🔨 Tentando build..." && \
npm run build
```

---

## 💡 Prevenção

Para evitar este problema no futuro:

1. **Não copie `node_modules`** - sempre reinstale com `npm install`
2. **Use `npm install`** após copiar código para garantir permissões corretas
3. **Mantenha permissões corretas** nos scripts de instalação

---

## ⚠️ Se Nada Funcionar

Se mesmo após reinstalar as dependências o problema persistir:

```bash
cd /var/www/ctrldespesas-web/web-app

# Verificar se há problemas com o sistema de arquivos
df -h .
mount | grep $(df . | tail -1 | awk '{print $1}')

# Verificar se há problemas com SELinux (se aplicável)
getenforce 2>/dev/null || echo "SELinux não está ativo"

# Tentar usar npx diretamente
npx next build
```

---

**✅ Execute a solução rápida primeiro. Se não funcionar, reinstale as dependências!**
