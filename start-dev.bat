@echo off
chcp 65001 >nul
echo ========================================
echo   Iniciando Spring Boot e Vite
echo ========================================
echo.

REM Verifica e para processos nas portas 8081 e 8080
echo Verificando portas...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081') do (
    echo Parando processo na porta 8081...
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8083') do (
    echo Parando processo na porta 8083...
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo.
echo [1/2] Iniciando Spring Boot na porta 8081...
start "Spring Boot - Porta 8081" cmd /k "title Spring Boot - Porta 8081 && .\mvnw.cmd spring-boot:run"

timeout /t 5 /nobreak >nul

echo [2/2] Iniciando Vite na porta 8083...
cd frontend-poo-main
start "Vite - Porta 8083" cmd /k "title Vite - Porta 8083 && npm run dev"
cd ..

echo.
echo ========================================
echo   Serviços iniciados!
echo ========================================
echo   Spring Boot: http://localhost:8081
echo   Vite (Frontend): http://localhost:8083
echo.
echo   Feche as janelas do terminal para parar os serviços
echo   ou execute stop-dev.bat
echo.
pause

