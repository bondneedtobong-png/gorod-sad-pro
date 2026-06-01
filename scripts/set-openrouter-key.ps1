# =====================================================================
#  Gorod-Sad - set OPENROUTER_API_KEY on server (base64 transport)
#  Usage: PowerShell -ExecutionPolicy Bypass -File .\scripts\set-openrouter-key.ps1
# =====================================================================

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$RepoRoot   = (Split-Path $PSScriptRoot -Parent)
$DeployInfo = (Join-Path $RepoRoot ".deploy-info")

if (-not (Test-Path $DeployInfo)) { throw "No .deploy-info" }
$cfg = @{}
Get-Content $DeployInfo | ForEach-Object {
  if ($_ -match '^(\w+):\s*(.+)$') { $cfg[$matches[1]] = $matches[2].Trim() }
}
$ServerSpec  = $cfg['server']
$KeyRel      = $cfg['ssh_key'] -replace '^~', $HOME
$ProjectPath = $cfg['project_path_on_server']

$secure = Read-Host "Paste OPENROUTER_API_KEY (input hidden)" -AsSecureString
$key = [System.Net.NetworkCredential]::new("", $secure).Password
if (-not $key) { throw "Empty key" }

Write-Host "`nAvailable free models:" -ForegroundColor Yellow
Write-Host "  1. meta-llama/llama-3.3-70b-instruct:free   (recommended)"
Write-Host "  2. deepseek/deepseek-r1:free                (reasoning)"
Write-Host "  3. google/gemma-2-9b-it:free                (fast)"
Write-Host "  4. mistralai/mistral-7b-instruct:free       (lightweight)"
$choice = Read-Host "Choose 1-4 (default 1)"
$model = switch ($choice) {
  "2" { "deepseek/deepseek-r1:free" }
  "3" { "google/gemma-2-9b-it:free" }
  "4" { "mistralai/mistral-7b-instruct:free" }
  default { "meta-llama/llama-3.3-70b-instruct:free" }
}
Write-Host "  Using model: $model" -ForegroundColor Green

# Encode to base64 to safely pass through SSH without escaping issues
$keyB64   = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($key))
$modelB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($model))

Write-Host "`n>>> Writing .env on $ServerSpec" -ForegroundColor Cyan

$remoteScript = @"
set -e
cd $ProjectPath
AI_KEY=`$(echo '$keyB64' | base64 -d)
AI_MODEL=`$(echo '$modelB64' | base64 -d)
# Remove old AI lines
sed -i '/^OPENROUTER_API_KEY=/d;/^OPENROUTER_MODEL=/d' .env
# Append fresh
echo "OPENROUTER_API_KEY=`$AI_KEY" >> .env
echo "OPENROUTER_MODEL=`$AI_MODEL" >> .env
chmod 600 .env
echo '--- Updated env ---'
if grep -q '^OPENROUTER_API_KEY=.' .env; then
  echo 'OPENROUTER_API_KEY: set'
else
  echo 'OPENROUTER_API_KEY: EMPTY'
fi
grep '^OPENROUTER_MODEL=' .env
echo
echo '>>> Restarting api container'
docker compose up -d --force-recreate api
"@

& ssh -i $KeyRel $ServerSpec $remoteScript
if ($LASTEXITCODE -ne 0) { Write-Host "  [X] failed" -ForegroundColor Red; exit 1 }
Write-Host "`n  [OK] AI configured" -ForegroundColor Green

Write-Host "`nWait 5 seconds and verify:" -ForegroundColor Cyan
Write-Host "  curl.exe https://gorod-sad.pro/api/v1/health"
Write-Host "  Should show: ai_configured: true"
