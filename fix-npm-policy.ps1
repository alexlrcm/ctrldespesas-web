# Script para corrigir política de execução do PowerShell para npm
# Execute este script como Administrador

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Corrigindo Política de Execução do npm" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  ATENÇÃO: Este script precisa ser executado como Administrador!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para executar como Administrador:" -ForegroundColor Yellow
    Write-Host "1. Clique com botão direito no PowerShell" -ForegroundColor Yellow
    Write-Host "2. Selecione 'Executar como administrador'" -ForegroundColor Yellow
    Write-Host "3. Execute novamente este script" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OU execute manualmente:" -ForegroundColor Cyan
    Write-Host "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor White
    exit 1
}

Write-Host "Política atual:" -ForegroundColor Yellow
Get-ExecutionPolicy -List | Format-Table

Write-Host ""
Write-Host "Alterando política para RemoteSigned (CurrentUser)..." -ForegroundColor Yellow

try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "✓ Política alterada com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Nova política:" -ForegroundColor Yellow
    Get-ExecutionPolicy -List | Format-Table
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Configuração concluída!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora feche e abra um NOVO PowerShell e teste:" -ForegroundColor Cyan
    Write-Host "  npm --version" -ForegroundColor White
    Write-Host "  node --version" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "✗ Erro ao alterar política: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente executar manualmente:" -ForegroundColor Yellow
    Write-Host "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor White
    exit 1
}
