# Quick Fix Script for Command Freezes

param (
    [switch]$Force = $false
)

Write-Host "--- Diagnostic & Quick Fix Script ---" -ForegroundColor Cyan

# 1. Check for conflicting lock files
Write-Host "`n[1/3] Checking for lock file conflicts..." -ForegroundColor Yellow
$lockFiles = @()
if (Test-Path "package-lock.json") { $lockFiles += "package-lock.json" }
if (Test-Path "bun.lockb") { $lockFiles += "bun.lockb" }
if (Test-Path "yarn.lock") { $lockFiles += "yarn.lock" }

if ($lockFiles.Count -gt 1) {
    Write-Host "Warning: Found multiple lock files: $($lockFiles -join ', ')" -ForegroundColor Red
    Write-Host "Keeping package-lock.json and removing others to prevent conflicts..."
    foreach ($file in $lockFiles) {
        if ($file -ne "package-lock.json") {
            Remove-Item $file -Force
            Write-Host "Deleted $file" -ForegroundColor Green
        }
    }
} else {
    Write-Host "No lock file conflicts found." -ForegroundColor Green
}

# 2. Check for hanging processes
Write-Host "`n[2/3] Checking for hanging Node/NPM/Bun processes..." -ForegroundColor Yellow
$currentPid = $PID
$procs = Get-Process -Name "node", "npm", "bun" -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $currentPid }

if ($procs) {
    Write-Host "Found $($procs.Count) potentially hanging processes." -ForegroundColor Red
    foreach ($p in $procs) {
        Write-Host "Terminating process: $($p.Name) (PID: $($p.Id))"
        Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Processes terminated." -ForegroundColor Green
} else {
    Write-Host "No hanging processes found." -ForegroundColor Green
}

# 3. Clean environment
Write-Host "`n[3/3] Cleaning environment..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Write-Host "Clearing node_modules cache..."
    Remove-Item "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Cache cleared." -ForegroundColor Green
}

Write-Host "`n--- Diagnostic Complete ---" -ForegroundColor Cyan
Write-Host "If the issue persists, try running 'npm install' again."
