# Script de Teste de Configuração - CtrlDespesas Web App
# Verifica se tudo está configurado corretamente antes de executar

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Teste de Configuração - CtrlDespesas Web" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()

# Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
    } else {
        $errors += "Node.js não encontrado. Instale de https://nodejs.org/"
    }
} catch {
    $errors += "Node.js não encontrado. Instale de https://nodejs.org/"
}

# Verificar npm
Write-Host "2. Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ npm instalado: $npmVersion" -ForegroundColor Green
    } else {
        $errors += "npm não encontrado."
    }
} catch {
    $errors += "npm não encontrado."
}

# Verificar arquivo .env.local
Write-Host "3. Verificando arquivo .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✓ Arquivo .env.local encontrado" -ForegroundColor Green
    
    # Verificar variáveis obrigatórias
    $envContent = Get-Content ".env.local" -Raw
    $requiredVars = @(
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID"
    )
    
    foreach ($var in $requiredVars) {
        if ($envContent -match $var) {
            Write-Host "   ✓ $var configurado" -ForegroundColor Green
        } else {
            $warnings += "Variável $var não encontrada no .env.local"
        }
    }
} else {
    $errors += "Arquivo .env.local não encontrado. Crie baseado em ENV_EXAMPLE.txt"
}

# Verificar node_modules
Write-Host "4. Verificando dependências..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✓ Dependências instaladas" -ForegroundColor Green
} else {
    $warnings += "Dependências não instaladas. Execute: npm install"
}

# Verificar package.json
Write-Host "5. Verificando package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "   ✓ package.json encontrado" -ForegroundColor Green
} else {
    $errors += "package.json não encontrado"
}

# Resultado
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "✓ Configuração OK!" -ForegroundColor Green
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "Avisos:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "Pronto para executar: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "✗ Erros encontrados:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    if ($warnings.Count -gt 0) {
        Write-Host ""
        Write-Host "Avisos:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
}
Write-Host "========================================" -ForegroundColor Cyan
