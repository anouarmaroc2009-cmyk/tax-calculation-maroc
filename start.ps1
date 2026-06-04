Write-Host "==============================" -ForegroundColor Cyan
Write-Host " FiscalPro Maroc - Quick Start" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
try { node --version | Out-Null } catch {
  Write-Host "ERROR: Node.js is not installed. Install from https://nodejs.org" -ForegroundColor Red
  exit 1
}
Write-Host "✓ Node.js found: $(node --version)" -ForegroundColor Green

# Install & start backend
Write-Host ""
Write-Host "→ Installing backend dependencies..." -ForegroundColor Yellow
Set-Location -LiteralPath "$PSScriptRoot\backend"
npm install --silent 2>&1 | Out-Null
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green

$backend = Start-Process powershell -ArgumentList "-NoLogo", "-NoProfile", "-WindowStyle", "Normal", "-Command", "Set-Location '$PSScriptRoot\backend'; npx nest start --watch" -PassThru -WindowStyle Hidden
Write-Host "✓ Backend starting on http://localhost:4000" -ForegroundColor Green

# Install & start frontend
Write-Host ""
Write-Host "→ Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location -LiteralPath "$PSScriptRoot\frontend"
npm install --silent 2>&1 | Out-Null
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green

$frontend = Start-Process powershell -ArgumentList "-NoLogo", "-NoProfile", "-WindowStyle", "Normal", "-Command", "Set-Location '$PSScriptRoot\frontend'; npm run dev" -PassThru -WindowStyle Hidden
Write-Host "✓ Frontend starting on http://localhost:3000" -ForegroundColor Green

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host " Open http://localhost:3000" -ForegroundColor White
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Enter to stop all servers..."
Read-Host

Stop-Process $backend -Force -ErrorAction SilentlyContinue
Stop-Process $frontend -Force -ErrorAction SilentlyContinue
Write-Host "Servers stopped." -ForegroundColor Yellow
