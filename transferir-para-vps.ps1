# Script para transferir web-app para VPS
# Uso: .\transferir-para-vps.ps1 -VpsIp "192.168.0.47" -VpsUser "appuser" -VpsPath "/var/www"
# Com chave SSH: .\transferir-para-vps.ps1 -VpsIp "192.168.0.47" -SshKeyPath "$env:USERPROFILE\.ssh\id_rsa"

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIp,
    
    [Parameter(Mandatory=$false)]
    [string]$VpsUser = "appuser",
    
    [Parameter(Mandatory=$false)]
    [string]$VpsPath = "/var/www",
    
    [Parameter(Mandatory=$false)]
    [string]$SshKeyPath
)

Write-Host "[*] Preparando transferencia para VPS..." -ForegroundColor Cyan

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "[ERRO] package.json nao encontrado!" -ForegroundColor Red
    Write-Host "Execute este script dentro da pasta web-app" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Diretorio correto detectado" -ForegroundColor Green

# Criar arquivo temporário com nome único
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipFile = "web-app-$timestamp.zip"

Write-Host "[*] Compactando projeto..." -ForegroundColor Cyan

try {
    Write-Host "[*] Criando arquivo ZIP (excluindo node_modules, .next, etc.)..." -ForegroundColor Cyan
    
    # Criar arquivo ZIP excluindo arquivos desnecessários usando 7zip ou método alternativo
    # Primeiro, tentar criar lista de arquivos para incluir
    $filesToInclude = @()
    
    # Adicionar arquivos e pastas, excluindo os desnecessários
    Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
        $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")
        $shouldInclude = $true
        
        # Excluir pastas específicas
        if ($relativePath -match "\\node_modules\\" -or 
            $relativePath -match "\\.next\\" -or 
            $relativePath -match "\\.git\\" -or
            $relativePath -match "\\dist\\" -or
            $relativePath -match "\\build\\" -or
            $relativePath -match "\\.cache\\" -or
            $relativePath -match "\\\.env\.local$" -or
            $relativePath -match "\\\.env$" -or
            $relativePath -match "\.zip$" -or
            $relativePath -match "\.log$") {
            $shouldInclude = $false
        }
        
        if ($shouldInclude) {
            $filesToInclude += $_.FullName
        }
    }
    
    Write-Host "[*] Encontrados $($filesToInclude.Count) arquivos para incluir no ZIP" -ForegroundColor Cyan
    
    # Criar arquivo ZIP
    if ($filesToInclude.Count -gt 0) {
        Compress-Archive -Path $filesToInclude -DestinationPath $zipFile -Force -CompressionLevel Fastest -ErrorAction Stop
    } else {
        throw "Nenhum arquivo encontrado para incluir no ZIP"
    }
    
    Write-Host "[OK] Arquivo criado: $zipFile" -ForegroundColor Green
    
    # Verificar tamanho do arquivo
    $fileSize = (Get-Item $zipFile).Length / 1MB
    Write-Host "[*] Tamanho do arquivo: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "[*] Transferindo para VPS..." -ForegroundColor Cyan
    Write-Host "   IP: $VpsIp" -ForegroundColor Gray
    Write-Host "   Usuario: $VpsUser" -ForegroundColor Gray
    Write-Host "   Destino: $VpsPath" -ForegroundColor Gray
    Write-Host ""
    
    # Preparar comando SCP
    $scpCommand = "scp"
    
    # Adicionar chave SSH se fornecida
    if ($SshKeyPath -and (Test-Path $SshKeyPath)) {
        $scpCommand += " -i `"$SshKeyPath`""
        Write-Host "[*] Usando chave SSH: $SshKeyPath" -ForegroundColor Gray
    }
    
    # Adicionar arquivo e destino
    $scpCommand += " `"$zipFile`" `"${VpsUser}@${VpsIp}:${VpsPath}/`""
    
    # Aviso se não estiver usando chave SSH
    if (-not $SshKeyPath) {
        Write-Host "[AVISO] Voce precisara digitar a senha quando solicitado" -ForegroundColor Yellow
        Write-Host "   Para evitar isso, configure autenticacao por chave SSH (veja instrucoes abaixo)" -ForegroundColor Yellow
        Write-Host ""
    }
    
    # Transferir via SCP
    Invoke-Expression $scpCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[OK] Transferencia concluida com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "[*] Proximos passos na VPS:" -ForegroundColor Yellow
        Write-Host "   1. Conecte na VPS: ssh ${VpsUser}@${VpsIp}" -ForegroundColor Gray
        Write-Host "   2. Navegue ate: cd $VpsPath" -ForegroundColor Gray
        Write-Host "   3. Descompacte: unzip $zipFile -d ctrldespesas-web" -ForegroundColor Gray
        Write-Host "   4. Entre no diretorio: cd ctrldespesas-web/web-app" -ForegroundColor Gray
        Write-Host "   5. Instale dependencias: npm install" -ForegroundColor Gray
        Write-Host "   6. Configure .env.local com suas variaveis" -ForegroundColor Gray
        Write-Host "   7. Faca build: npm run build" -ForegroundColor Gray
        Write-Host "   8. Inicie com PM2: pm2 start npm --name 'ctrldespesas-web' -- start" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "[ERRO] Erro na transferencia!" -ForegroundColor Red
        Write-Host "Verifique:" -ForegroundColor Yellow
        Write-Host "   - Conexao SSH esta funcionando" -ForegroundColor Gray
        Write-Host "   - Usuario e IP estao corretos" -ForegroundColor Gray
        Write-Host "   - Permissoes na VPS estao corretas" -ForegroundColor Gray
    }
    
    # Perguntar se quer manter o arquivo ZIP
    Write-Host ""
    $keepZip = Read-Host "Deseja manter o arquivo ZIP local? (S/N)"
    if ($keepZip -ne "S" -and $keepZip -ne "s") {
        Remove-Item $zipFile -Force
        Write-Host "[*] Arquivo ZIP removido" -ForegroundColor Gray
    } else {
        Write-Host "[*] Arquivo ZIP mantido: $zipFile" -ForegroundColor Gray
    }
    
} catch {
    Write-Host ""
    Write-Host "[ERRO] Erro ao criar arquivo ZIP: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[OK] Processo concluido!" -ForegroundColor Green
Write-Host ""
Write-Host "[DICA] Para evitar digitar senha toda vez, configure autenticacao por chave SSH:" -ForegroundColor Cyan
Write-Host "   1. Gere uma chave SSH: ssh-keygen -t rsa -b 4096" -ForegroundColor Gray
Write-Host "   2. Copie para VPS: ssh-copy-id ${VpsUser}@${VpsIp}" -ForegroundColor Gray
Write-Host "   3. Use o script com: -SshKeyPath `"C:\Users\$env:USERNAME\.ssh\id_rsa`"" -ForegroundColor Gray
