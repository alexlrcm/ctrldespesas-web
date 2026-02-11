# Script para reiniciar o servidor Next.js corretamente

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reiniciando servidor Next.js" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se esta na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: Execute este script na pasta web-app!" -ForegroundColor Red
    exit 1
}

Write-Host "1. Limpando cache do Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "   Cache removido" -ForegroundColor Green
} else {
    Write-Host "   Nenhum cache encontrado" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2. Verificando arquivo .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   Arquivo .env.local encontrado" -ForegroundColor Green
    $envContent = Get-Content .env.local -Raw
    if ($envContent -match "NEXT_PUBLIC_FIREBASE_API_KEY=AIza") {
        Write-Host "   API Key configurada" -ForegroundColor Green
    } else {
        Write-Host "   AVISO: API Key pode nao estar configurada corretamente" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ERRO: Arquivo .env.local nao encontrado!" -ForegroundColor Red
    Write-Host "   Crie o arquivo .env.local antes de continuar" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Iniciando servidor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servidor iniciando..." -ForegroundColor Cyan
Write-Host "Aguarde ate ver 'Ready' no terminal" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar servidor
npm run dev
