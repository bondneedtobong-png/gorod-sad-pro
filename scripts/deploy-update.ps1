# =====================================================================
#  Gorod-Sad - update deploy (preserves .env on server)
#  Usage: PowerShell -ExecutionPolicy Bypass -File .\scripts\deploy-update.ps1
#
#  Use AFTER first deploy. Sends new code, rebuilds containers,
#  KEEPS existing .env on server intact.
# =====================================================================

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$RepoRoot   = (Split-Path $PSScriptRoot -Parent)
$DeployInfo = (Join-Path $RepoRoot ".deploy-info")

function Step($Msg) { Write-Host "`n>>> $Msg" -ForegroundColor Cyan }
function Ok($Msg)   { Write-Host "    [OK] $Msg" -ForegroundColor Green }
function Fail($Msg) { Write-Host "    [X]  $Msg" -ForegroundColor Red; exit 1 }

if (-not (Test-Path $DeployInfo)) { Fail "No .deploy-info" }
$cfg = @{}
Get-Content $DeployInfo | ForEach-Object {
  if ($_ -match '^(\w+):\s*(.+)$') { $cfg[$matches[1]] = $matches[2].Trim() }
}
$ServerSpec  = $cfg['server']
$KeyRel      = $cfg['ssh_key'] -replace '^~', $HOME
$ProjectPath = $cfg['project_path_on_server']
$Domain      = $cfg['domain']

Step "Update target"
Write-Host "    Server: $ServerSpec   Path: $ProjectPath   Domain: $Domain"

# Pack project (skip node_modules, .next, .git, .env)
Step "Packing project"
$tarFile = Join-Path $env:TEMP "gorod-sad-update.tar"
$pushd = Get-Location
Set-Location $RepoRoot
$tarArgs = @('-cf', $tarFile,
  '--exclude=node_modules', '--exclude=.next', '--exclude=__pycache__',
  '--exclude=.venv', '--exclude=venv', '--exclude=.git', '--exclude=*.pyc',
  '--exclude=.env',
  '.')
& tar @tarArgs
Set-Location $pushd
if ($LASTEXITCODE -ne 0) { Fail "tar failed" }
Ok "Packed"

# Upload
Step "Uploading"
& scp -i $KeyRel $tarFile "${ServerSpec}:/tmp/gorod-sad-update.tar"
if ($LASTEXITCODE -ne 0) { Fail "scp failed" }
Remove-Item $tarFile
Ok "Uploaded"

# Extract preserving .env
Step "Extracting on server (keeping .env)"
$remote = @"
set -e
cd $ProjectPath
# Save .env if exists
[ -f .env ] && cp .env /tmp/gorod-sad.env.bak
# Clean except .env
find . -mindepth 1 ! -name '.env' -exec rm -rf {} + 2>/dev/null || true
# Extract new code
tar -xf /tmp/gorod-sad-update.tar
rm /tmp/gorod-sad-update.tar
# Restore .env if was saved
[ -f /tmp/gorod-sad.env.bak ] && cp /tmp/gorod-sad.env.bak .env && rm /tmp/gorod-sad.env.bak
echo --- listing ---
ls -la
"@
& ssh -i $KeyRel $ServerSpec $remote
if ($LASTEXITCODE -ne 0) { Fail "extract failed" }
Ok "Code updated, .env preserved"

# Rebuild
Step "Rebuilding stack (2-5 minutes)"
& ssh -i $KeyRel $ServerSpec "cd $ProjectPath && docker compose up -d --build"
if ($LASTEXITCODE -ne 0) { Fail "compose failed" }
Ok "Stack rebuilt"

Step "Container status"
& ssh -i $KeyRel $ServerSpec "cd $ProjectPath && docker compose ps"

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "  UPDATE DEPLOYED" -ForegroundColor Green
Write-Host "  https://$Domain" -ForegroundColor Green
Write-Host "==================================================================="
