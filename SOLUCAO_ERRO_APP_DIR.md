# 🔧 Solução: Erro - Couldn't find any `pages` or `app` directory

## Problema

O Next.js não está encontrando o diretório `app` ou `pages`, o que significa que os arquivos da aplicação não foram copiados corretamente durante a descompactação.

**Erro:** `Couldn't find any 'pages' or 'app' directory. Please create one under the project root`

---

## ✅ Solução Rápida

Execute na VPS para diagnosticar:

```bash
cd /var/www/ctrldespesas-web/web-app

echo "=== DIAGNÓSTICO ==="
echo ""
echo "1. Diretório atual:"
pwd
echo ""

echo "2. Arquivos e diretórios no diretório atual:"
ls -la
echo ""

echo "3. Procurando diretório 'app':"
find . -maxdepth 2 -type d -name "app" 2>/dev/null
echo ""

echo "4. Procurando diretório 'pages':"
find . -maxdepth 2 -type d -name "pages" 2>/dev/null
echo ""

echo "5. Estrutura de diretórios:"
find . -maxdepth 2 -type d | head -20
echo ""

echo "6. Verificando ZIP original:"
ZIP_FILE=$(ls -t /home/appuser/web-app-*.zip /root/web-app-*.zip 2>/dev/null | head -1)
if [ -n "$ZIP_FILE" ]; then
    echo "ZIP encontrado: $ZIP_FILE"
    echo "Conteúdo do ZIP (procurando app/):"
    unzip -l "$ZIP_FILE" | grep -E "(app/|pages/)" | head -20
else
    echo "❌ ZIP não encontrado!"
fi
```

---

## 🔧 Solução: Re-descompactar Corretamente

Se o diretório `app` não existir, você precisa re-descompactar o ZIP corretamente:

```bash
cd /var/www/ctrldespesas-web/web-app

# 1. Limpar tudo (exceto node_modules e .env.local)
rm -rf app pages components hooks lib types *.tsx *.ts *.jsx *.js 2>/dev/null || true
rm -rf public 2>/dev/null || true

# 2. Encontrar ZIP mais recente
ZIP_FILE=$(ls -t /home/appuser/web-app-*.zip /root/web-app-*.zip 2>/dev/null | head -1)

if [ -z "$ZIP_FILE" ]; then
    echo "❌ Arquivo ZIP não encontrado!"
    echo "Você precisa transferir o código novamente do Windows usando transferir-para-vps.ps1"
    exit 1
fi

echo "📦 Descompactando: $ZIP_FILE"

# 3. Descompactar em diretório temporário
TMP_DIR="/tmp/ctrldespesas-reinstall"
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"

unzip -q "$ZIP_FILE" -d "$TMP_DIR"

# 4. Verificar estrutura descompactada
echo ""
echo "🔍 Estrutura descompactada:"
ls -la "$TMP_DIR"

# 5. Verificar onde está o diretório 'app'
if [ -d "$TMP_DIR/web-app/app" ]; then
    echo "✅ Encontrado: $TMP_DIR/web-app/app"
    echo "📋 Copiando arquivos de web-app/..."
    cp -r "$TMP_DIR/web-app"/* .
elif [ -d "$TMP_DIR/app" ]; then
    echo "✅ Encontrado: $TMP_DIR/app"
    echo "📋 Copiando arquivos da raiz..."
    cp -r "$TMP_DIR"/* .
else
    echo "❌ Diretório 'app' não encontrado no ZIP!"
    echo ""
    echo "Conteúdo completo do ZIP:"
    unzip -l "$ZIP_FILE" | head -50
    exit 1
fi

# 6. Verificar se app foi copiado
if [ -d "app" ]; then
    echo "✅ Diretório 'app' encontrado!"
    echo "Conteúdo:"
    ls -la app/ | head -10
else
    echo "❌ Diretório 'app' ainda não encontrado após cópia!"
    exit 1
fi

# 7. Limpar diretório temporário
rm -rf "$TMP_DIR"

# 8. Tentar build novamente
echo ""
echo "🔨 Tentando build novamente..."
npm run build
```

---

## 🚀 Script Completo de Correção

```bash
cd /var/www/ctrldespesas-web/web-app && \
rm -rf app pages components hooks lib types public *.tsx *.ts *.jsx *.js 2>/dev/null || true && \
ZIP_FILE=$(ls -t /home/appuser/web-app-*.zip /root/web-app-*.zip 2>/dev/null | head -1) && \
if [ -z "$ZIP_FILE" ]; then \
    echo "❌ ZIP não encontrado! Execute transferir-para-vps.ps1 no Windows"; \
    exit 1; \
fi && \
TMP_DIR="/tmp/ctrldespesas-reinstall" && \
rm -rf "$TMP_DIR" && \
mkdir -p "$TMP_DIR" && \
unzip -q "$ZIP_FILE" -d "$TMP_DIR" && \
if [ -d "$TMP_DIR/web-app/app" ]; then \
    cp -r "$TMP_DIR/web-app"/* .; \
elif [ -d "$TMP_DIR/app" ]; then \
    cp -r "$TMP_DIR"/* .; \
else \
    echo "❌ Diretório 'app' não encontrado no ZIP!"; \
    exit 1; \
fi && \
rm -rf "$TMP_DIR" && \
[ -d "app" ] && echo "✅ app/ encontrado!" || (echo "❌ app/ não encontrado!" && exit 1) && \
npm run build
```

---

## 🔍 Se o ZIP Não Contém os Arquivos

Se o ZIP não contém o diretório `app`, você precisa:

1. **Verificar no Windows** se o código está completo:
   ```powershell
   cd c:\Users\giratech02\Documents\CtrlDespesas\web-app
   Test-Path app
   ```

2. **Transferir novamente** do Windows:
   ```powershell
   .\transferir-para-vps.ps1 -VpsIp "SEU_IP_VPS" -SshKeyPath "$env:USERPROFILE\.ssh\id_rsa"
   ```

3. **Verificar o ZIP** antes de descompactar:
   ```bash
   # Na VPS
   unzip -l /home/appuser/web-app-*.zip | grep -E "(app/|package.json)"
   ```

---

## 💡 Prevenção

Para evitar este problema:

1. **Sempre verifique** se o diretório `app` existe após descompactar
2. **Use o script automatizado** `reinstalar-app.sh` que já inclui essas verificações
3. **Monitore a descompactação** para garantir que todos os arquivos foram copiados

---

**✅ Execute o diagnóstico primeiro para ver o que está faltando!**
