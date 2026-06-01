# =====================================================================
#  Gorod-Sad - set AI provider key/model on server
#  Supports xAI, OpenAI, OpenRouter, Groq (anything with OpenAI-compatible API).
#  Usage: PowerShell -ExecutionPolicy Bypass -File .\scripts\set-ai-key.ps1
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

Write-Host "Choose AI provider:" -ForegroundColor Yellow
Write-Host "  1. xAI            (api.x.ai)         - Grok models"
Write-Host "  2. OpenAI         (api.openai.com)   - GPT models"
Write-Host "  3. OpenRouter     (openrouter.ai)    - aggregator (free + paid)"
Write-Host "  4. Groq           (api.groq.com)     - fast inference"
Write-Host "  5. Custom         (other endpoint)"
$prov = Read-Host "Choose 1-5 (default 1)"
switch ($prov) {
  "2" { $baseUrl = "https://api.openai.com/v1";  $defaultModel = "gpt-4o-mini" }
  "3" { $baseUrl = "https://openrouter.ai/api/v1"; $defaultModel = "meta-llama/llama-3.3-70b-instruct:free" }
  "4" { $baseUrl = "https://api.groq.com/openai/v1"; $defaultModel = "llama-3.3-70b-versatile" }
  "5" {
    $baseUrl = Read-Host "Base URL (e.g. https://api.example.com/v1)"
    $defaultModel = Read-Host "Default model name"
  }
  default { $baseUrl = "https://api.x.ai/v1"; $defaultModel = "grok-4-1-fast-reasoning" }
}
Write-Host "  Base URL: $baseUrl" -ForegroundColor Green

$model = Read-Host "Model (default: $defaultModel)"
if (-not $model) { $model = $defaultModel }
Write-Host "  Model: $model" -ForegroundColor Green

Write-Host "`nPaste API key. WARNING: it will be visible (so you can verify paste worked)." -ForegroundColor Yellow
Write-Host "It is NOT saved in PowerShell history or logs." -ForegroundColor Yellow
$key = (Read-Host "API key").Trim()
if (-not $key) { throw "Empty key" }
if ($key.Length -lt 20) {
  Write-Host "  Suspiciously short key (length=$($key.Length)). Did paste work?" -ForegroundColor Red
  $confirm = Read-Host "Continue anyway? [y/N]"
  if ($confirm -notmatch '^[yY]') { exit 1 }
}
Write-Host "  Key length: $($key.Length), prefix: $($key.Substring(0, [Math]::Min(8, $key.Length)))..." -ForegroundColor Green

# Base64 transport (safe through SSH/heredoc)
$keyB64     = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($key))
$modelB64   = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($model))
$baseUrlB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($baseUrl))

Write-Host "`n>>> Writing .env on $ServerSpec" -ForegroundColor Cyan

$remoteScript = @"
set -e
cd $ProjectPath
AI_KEY=`$(echo '$keyB64' | base64 -d)
AI_MODEL=`$(echo '$modelB64' | base64 -d)
AI_BASE=`$(echo '$baseUrlB64' | base64 -d)
# Remove old AI lines (any naming)
sed -i '/^OPENROUTER_API_KEY=/d;/^OPENROUTER_MODEL=/d;/^XAI_API_KEY=/d;/^XAI_MODEL=/d;/^AI_API_KEY=/d;/^AI_MODEL=/d;/^AI_BASE_URL=/d' .env
# Append universal AI block
echo "AI_API_KEY=`$AI_KEY" >> .env
echo "AI_MODEL=`$AI_MODEL" >> .env
echo "AI_BASE_URL=`$AI_BASE" >> .env
chmod 600 .env
echo '--- Updated .env ---'
if grep -q '^AI_API_KEY=.' .env; then echo 'AI_API_KEY: set'; else echo 'AI_API_KEY: EMPTY'; fi
grep '^AI_MODEL=' .env
grep '^AI_BASE_URL=' .env
echo
echo '>>> Restarting api container'
docker compose up -d --force-recreate api
"@

& ssh -i $KeyRel $ServerSpec $remoteScript
if ($LASTEXITCODE -ne 0) { Write-Host "  [X] failed" -ForegroundColor Red; exit 1 }
Write-Host "`n  [OK] AI configured" -ForegroundColor Green
Write-Host "`nVerify:" -ForegroundColor Cyan
Write-Host "  curl.exe https://gorod-sad.pro/api/v1/health"
