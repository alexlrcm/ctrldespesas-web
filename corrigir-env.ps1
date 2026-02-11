# Script para corrigir o arquivo .env.local

$envFile = ".env.local"
$envFileBackup = ".env.local.backup"

Write-Host "Corrigindo arquivo .env.local" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $envFile)) {
    Write-Host "Arquivo .env.local nao encontrado!" -ForegroundColor Red
    exit 1
}

# Fazer backup
Copy-Item $envFile $envFileBackup
Write-Host "Backup criado: $envFileBackup" -ForegroundColor Green

# Criar conteudo correto
$correctContent = @"
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAATPDjSZAPYFuuX5yWxbDRX0aHb3DE-g0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=controle-de-despesas-78687.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=controle-de-despesas-78687
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=controle-de-despesas-78687.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=972931672046
NEXT_PUBLIC_FIREBASE_APP_ID=1:972931672046:web:0d02d9c8e72caca6e0d0ff

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DOMAIN=giratech.com.br

# File Retention (days) - 90 dias = 3 meses
NEXT_PUBLIC_FILE_RETENTION_DAYS=90
"@

# Salvar arquivo corrigido
$correctContent | Out-File -FilePath $envFile -Encoding UTF8

Write-Host ""
Write-Host "Arquivo .env.local corrigido!" -ForegroundColor Green
Write-Host ""
Write-Host "Conteudo corrigido:" -ForegroundColor Yellow
Get-Content $envFile
Write-Host ""
Write-Host "IMPORTANTE: Reinicie o servidor (Ctrl+C e npm run dev)" -ForegroundColor Yellow
Write-Host ""
