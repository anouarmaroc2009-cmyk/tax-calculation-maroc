@echo off
title FiscalPro Maroc
cd /d "%~dp0"

echo ====================================
echo   FiscalPro Maroc
echo   Cliquez et ca marche!
echo ====================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERREUR: Node.js doit etre installe depuis https://nodejs.org
    pause
    exit /b
)
for /f "tokens=2" %%v in ('node -v 2^>nul') do set nodever=%%v
echo [OK] Node %nodever%

:: Install deps (first time only)
if not exist "backend\node_modules" (
    cd backend && call npm install --silent && cd ..
)
if not exist "frontend\node_modules" (
    cd frontend && call npm install --silent && cd ..
)
echo [OK] Dependances installees

:: Start backend
echo Demarrage du serveur API...
start "FiscalPro-Backend" cmd /c "cd /d "%~dp0backend" && npx nest start --watch"
echo [OK] API: http://localhost:4000

:: Start frontend
echo Demarrage de l'application web...
start "FiscalPro-Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"
echo [OK] App: http://localhost:3000

:: Wait then open browser
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ====================================
echo   Les deux serveurs tournent!
echo   App:  http://localhost:3000
echo   API:  http://localhost:4000
echo ====================================
echo   Fermez cette fenetre pour arreter.
echo.
pause

:: Kill specific windows
taskkill /fi "WINDOWTITLE eq FiscalPro-Backend*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq FiscalPro-Frontend*" /f >nul 2>&1
echo Serveurs arretes.
