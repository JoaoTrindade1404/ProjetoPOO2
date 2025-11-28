@echo off
echo ========================================
echo   Parando Spring Boot e Vite
echo ========================================
echo.

echo Parando processos na porta 8081 (Spring Boot)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8081') do (
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo Nenhum processo encontrado na porta 8081
    ) else (
        echo Processo na porta 8081 parado
    )
)

echo Parando processos na porta 8083 (Vite)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8083') do (
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 (
        echo Nenhum processo encontrado na porta 8083
    ) else (
        echo Processo na porta 8083 parado
    )
)

echo.
echo Parando processos Java (Spring Boot)...
taskkill /F /IM java.exe >nul 2>&1

echo Parando processos Node (Vite)...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo ========================================
echo   Serviços parados!
echo ========================================
timeout /t 2 /nobreak >nul

