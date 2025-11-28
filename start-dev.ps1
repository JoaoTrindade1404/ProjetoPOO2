# Script para iniciar Spring Boot e Vite simultaneamente
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Spring Boot e Vite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifica se a porta 8081 está em uso (Spring Boot)
$port8081 = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
if ($port8081) {
    Write-Host "⚠️  AVISO: A porta 8081 está em uso!" -ForegroundColor Yellow
    Write-Host "   Parando processo na porta 8081..." -ForegroundColor Yellow
    $process = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Verifica se a porta 8080 está em uso (Vite)
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    Write-Host "⚠️  AVISO: A porta 8080 está em uso!" -ForegroundColor Yellow
    Write-Host "   Parando processo na porta 8080..." -ForegroundColor Yellow
    $process = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

Write-Host "🚀 Iniciando Spring Boot na porta 8081..." -ForegroundColor Green
$springBootProcess = Start-Process -FilePath ".\mvnw.cmd" -ArgumentList "spring-boot:run" -NoNewWindow -PassThru

Write-Host "⏳ Aguardando Spring Boot inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🚀 Iniciando Vite na porta 8080..." -ForegroundColor Green
Set-Location -Path ".\frontend-poo-main"
$viteProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru
Set-Location -Path ".."

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Serviços iniciados!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Spring Boot: http://localhost:8081" -ForegroundColor White
Write-Host "  Vite (Frontend): http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "  Pressione Ctrl+C para parar todos os serviços" -ForegroundColor Yellow
Write-Host ""

# Aguarda até que o usuário pressione Ctrl+C
try {
    Wait-Process -Id $springBootProcess.Id, $viteProcess.Id -ErrorAction SilentlyContinue
} catch {
    Write-Host ""
    Write-Host "🛑 Parando serviços..." -ForegroundColor Red
    Stop-Process -Id $springBootProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $viteProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Serviços parados!" -ForegroundColor Green
}

