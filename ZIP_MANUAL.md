# 📦 Criar ZIP Manualmente - Guia Alternativo

## ⚠️ Problema com Script Automatizado

O script `transferir-para-vps.ps1` pode ter problemas ao criar o ZIP automaticamente. Se você encontrar erros como:
- Arquivos faltando após descompactação
- Estrutura de diretórios incorreta
- `package.json` ou `app/` não encontrados

**Solução:** Crie o ZIP manualmente seguindo este guia.

---

## ✅ Método 1: Usando PowerShell (Recomendado)

### Passo 1: Navegar até a pasta web-app

```powershell
cd c:\Users\giratech02\Documents\CtrlDespesas\web-app
```

### Passo 2: Criar ZIP Manualmente

```powershell
# Criar nome único para o arquivo
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipFile = "web-app-$timestamp.zip"

# Criar ZIP excluindo arquivos desnecessários
Compress-Archive -Path `
    app,components,hooks,lib,public,types,*.json,*.js,*.ts,*.tsx,*.md `
    -DestinationPath $zipFile `
    -Force `
    -Exclude "node_modules","*.log",".next",".git","*.zip"

Write-Host "✅ ZIP criado: $zipFile" -ForegroundColor Green
```

### Passo 3: Verificar Conteúdo do ZIP

```powershell
# Verificar se package.json está no ZIP
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipFile)
$zip.Entries | Where-Object { $_.Name -eq "package.json" } | Select-Object FullName
$zip.Dispose()

# Verificar se app/ está no ZIP
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipFile)
$zip.Entries | Where-Object { $_.FullName -like "app/*" } | Select-Object FullName -First 5
$zip.Dispose()
```

### Passo 4: Transferir para VPS

```powershell
# Transferir usando SCP
scp -i "$env:USERPROFILE\.ssh\id_rsa" "$zipFile" root@SEU_IP_VPS:/root/

# OU sem chave SSH (vai pedir senha)
scp "$zipFile" root@SEU_IP_VPS:/root/
```

---

## ✅ Método 2: Usando Interface Gráfica (Windows Explorer)

### Passo 1: Navegar até a pasta

1. Abra o Windows Explorer
2. Navegue até: `C:\Users\giratech02\Documents\CtrlDespesas\web-app`

### Passo 2: Selecionar Arquivos

Selecione as seguintes pastas e arquivos (mantenha Ctrl pressionado para seleção múltipla):
- ✅ `app/`
- ✅ `components/`
- ✅ `hooks/`
- ✅ `lib/`
- ✅ `public/`
- ✅ `types/`
- ✅ `package.json`
- ✅ `tsconfig.json`
- ✅ `next.config.js`
- ✅ `postcss.config.js`
- ✅ `tailwind.config.js`
- ✅ `.env.local` (se necessário)

**NÃO selecione:**
- ❌ `node_modules/`
- ❌ `.next/`
- ❌ `.git/`
- ❌ `*.zip`
- ❌ `*.log`

### Passo 3: Criar ZIP

1. Clique com botão direito nos arquivos selecionados
2. Escolha: **"Enviar para" → "Pasta compactada (em zip)"**
3. Renomeie para: `web-app-YYYYMMDD-HHMMSS.zip` (ex: `web-app-20240219-153000.zip`)

### Passo 4: Transferir para VPS

Use WinSCP, FileZilla, ou PowerShell:

```powershell
# Via PowerShell
scp -i "$env:USERPROFILE\.ssh\id_rsa" "web-app-*.zip" root@SEU_IP_VPS:/root/
```

---

## ✅ Método 3: Script PowerShell Melhorado

Crie um arquivo `criar-zip-manual.ps1`:

```powershell
# Script para criar ZIP manualmente
param(
    [string]$OutputPath = "."
)

$ErrorActionPreference = "Stop"

Write-Host "📦 Criando ZIP manualmente..." -ForegroundColor Cyan

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: package.json não encontrado!" -ForegroundColor Red
    Write-Host "Execute este script dentro da pasta web-app" -ForegroundColor Yellow
    exit 1
}

# Criar nome único
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipFile = Join-Path $OutputPath "web-app-$timestamp.zip"

# Lista de arquivos/pastas para incluir
$itemsToInclude = @(
    "app",
    "components",
    "hooks",
    "lib",
    "public",
    "types",
    "package.json",
    "tsconfig.json",
    "next.config.js",
    "postcss.config.js",
    "tailwind.config.js"
)

# Verificar quais existem
$existingItems = $itemsToInclude | Where-Object { Test-Path $_ }

if ($existingItems.Count -eq 0) {
    Write-Host "❌ Nenhum arquivo encontrado para incluir!" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Incluindo $($existingItems.Count) itens..." -ForegroundColor Gray

# Criar ZIP
try {
    Compress-Archive -Path $existingItems -DestinationPath $zipFile -Force
    Write-Host "✅ ZIP criado: $zipFile" -ForegroundColor Green
    
    # Verificar tamanho
    $size = (Get-Item $zipFile).Length / 1MB
    Write-Host "📊 Tamanho: $([math]::Round($size, 2)) MB" -ForegroundColor Gray
    
    # Verificar conteúdo
    Write-Host ""
    Write-Host "🔍 Verificando conteúdo..." -ForegroundColor Cyan
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipFile)
    
    $hasPackageJson = $zip.Entries | Where-Object { $_.Name -eq "package.json" }
    $hasApp = $zip.Entries | Where-Object { $_.FullName -like "app/*" }
    
    if ($hasPackageJson) {
        Write-Host "✅ package.json encontrado no ZIP" -ForegroundColor Green
    } else {
        Write-Host "⚠️  package.json NÃO encontrado no ZIP!" -ForegroundColor Yellow
    }
    
    if ($hasApp) {
        Write-Host "✅ Diretório app/ encontrado no ZIP" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Diretório app/ NÃO encontrado no ZIP!" -ForegroundColor Yellow
    }
    
    $zip.Dispose()
    
    Write-Host ""
    Write-Host "📤 Próximo passo: Transferir para VPS" -ForegroundColor Cyan
    Write-Host "   scp -i `$env:USERPROFILE\.ssh\id_rsa `"$zipFile`" root@SEU_IP_VPS:/root/" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erro ao criar ZIP: $_" -ForegroundColor Red
    exit 1
}
```

**Uso:**

```powershell
cd c:\Users\giratech02\Documents\CtrlDespesas\web-app
.\criar-zip-manual.ps1
```

---

## 🔍 Verificar ZIP Antes de Transferir

Sempre verifique o conteúdo do ZIP antes de transferir:

```powershell
# Verificar estrutura
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("web-app-*.zip")

Write-Host "=== ESTRUTURA DO ZIP ==="
$zip.Entries | Select-Object FullName | Format-Table -AutoSize

Write-Host ""
Write-Host "=== VERIFICAÇÕES ==="
$hasPackageJson = $zip.Entries | Where-Object { $_.Name -eq "package.json" }
$hasApp = $zip.Entries | Where-Object { $_.FullName -like "app/*" }
$hasNextConfig = $zip.Entries | Where-Object { $_.Name -eq "next.config.js" }

Write-Host "package.json: $(if ($hasPackageJson) { '✅' } else { '❌' })"
Write-Host "app/: $(if ($hasApp) { '✅' } else { '❌' })"
Write-Host "next.config.js: $(if ($hasNextConfig) { '✅' } else { '❌' })"

$zip.Dispose()
```

---

## 📝 Checklist

Antes de transferir o ZIP para VPS, verifique:

- [ ] `package.json` está no ZIP
- [ ] Diretório `app/` está no ZIP
- [ ] `next.config.js` está no ZIP
- [ ] `tsconfig.json` está no ZIP
- [ ] `node_modules/` NÃO está no ZIP
- [ ] `.next/` NÃO está no ZIP
- [ ] `.git/` NÃO está no ZIP

---

## 💡 Dicas

1. **Sempre verifique o ZIP** antes de transferir
2. **Use nomes únicos** com timestamp para evitar conflitos
3. **Mantenha o ZIP local** até confirmar que funcionou na VPS
4. **Use o método manual** se o script automatizado falhar

---

**✅ O método manual é mais confiável e garante que todos os arquivos sejam incluídos corretamente!**
