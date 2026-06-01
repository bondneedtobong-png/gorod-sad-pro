# =====================================================================
#  Gorod-Sad - first deploy (no GitHub needed, direct scp)
#  Usage: PowerShell -ExecutionPolicy Bypass -File .\scripts\deploy-first.ps1
#
#  What it does:
#    1. Reads .deploy-info
#    2. Asks for ANTHROPIC_API_KEY (optional)
#    3. Generates random Postgres password
#    4. Copies project files to server via scp (skip node_modules, .git, .next)
#    5. Writes .env on server
#    6. Starts docker compose
#    7. Installs nginx config (HTTP only for now; SSL is a separate step)
# =====================================================================

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$RepoRoot   = (Split-Path $PSScriptRoot -Parent)
$DeployInfo = (Join-Path $RepoRoot ".deploy-info")

function Step($Msg) { Write-Host "`n>>> $Msg" -ForegroundColor Cyan }
function Ok($Msg)   { Write-Host "    [OK] $Msg" -ForegroundColor Green }
function Warn($Msg) { Write-Host "    [!]  $Msg" -ForegroundColor Yellow }
function Fail($Msg) { Write-Host "    [X]  $Msg" -ForegroundColor Red; exit 1 }

# ---- Parse .deploy-info ----
if (-not (Test-Path $DeployInfo)) { Fail "No .deploy-info. Run setup-vps.ps1 first." }
$cfg = @{}
Get-Content $DeployInfo | ForEach-Object {
  if ($_ -match '^(\w+):\s*(.+)$') { $cfg[$matches[1]] = $matches[2].Trim() }
}
$ServerSpec  = $cfg['server']
$KeyRel      = $cfg['ssh_key'] -replace '^~', $HOME
$ProjectPath = $cfg['project_path_on_server']
$Domain      = $cfg['domain']

Step "Deploy target"
Write-Host "    Server: $ServerSpec"
Write-Host "    Path:   $ProjectPath"
Write-Host "    Domain: $Domain"
Write-Host "    Key:    $KeyRel"

# ---- Anthropic API key ----
Step "Anthropic API key"
$AnthropicKey = Read-Host "Paste ANTHROPIC_API_KEY (Enter to skip - AI chat will return placeholder)"
if (-not $AnthropicKey) { $AnthropicKey = "" }

# ---- Generate Postgres password ----
Step "Generating Postgres password"
$chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
$PgPass = -join ((1..32) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
Ok "Generated 32-char password"

# ---- Build .env content ----
$envContent = @"
POSTGRES_USER=gorodsad
POSTGRES_PASSWORD=$PgPass
POSTGRES_DB=gorodsad
DATABASE_URL=postgresql+psycopg://gorodsad:$PgPass@postgres:5432/gorodsad
API_PREFIX=/api/v1
CORS_ORIGINS=https://$Domain,https://www.$Domain,http://$Domain
ANTHROPIC_API_KEY=$AnthropicKey
NEXT_PUBLIC_API_URL=https://$Domain/api/v1
NEXT_PUBLIC_SITE_URL=https://$Domain
"@

# Save local copy (for reference)
$envLocal = Join-Path $RepoRoot ".env"
$envContent | Out-File -FilePath $envLocal -Encoding utf8 -NoNewline
Ok "Saved local .env (in .gitignore)"

# ---- Copy project to server ----
Step "Copying project files to server via scp"
$exclude = @("node_modules", ".next", "__pycache__", ".venv", "venv", ".git", "*.pyc")

# Create remote project dir
& ssh -i $KeyRel $ServerSpec "mkdir -p $ProjectPath && rm -rf $ProjectPath/* $ProjectPath/.??*"
if ($LASTEXITCODE -ne 0) { Fail "Cannot prepare remote dir" }

# Use tar + ssh for efficient copy (skip excluded paths)
Write-Host "    Packing..."
$tarFile = Join-Path $env:TEMP "gorod-sad-deploy.tar"
$pushd = Get-Location
Set-Location $RepoRoot
$tarArgs = @('-cf', $tarFile, '--exclude=node_modules', '--exclude=.next', '--exclude=__pycache__', '--exclude=.venv', '--exclude=venv', '--exclude=.git', '--exclude=*.pyc', '.')
& tar @tarArgs
Set-Location $pushd
if ($LASTEXITCODE -ne 0) { Fail "tar pack failed" }
Ok "Packed"

Write-Host "    Uploading..."
& scp -i $KeyRel $tarFile "${ServerSpec}:/tmp/gorod-sad-deploy.tar"
if ($LASTEXITCODE -ne 0) { Fail "scp upload failed" }
Remove-Item $tarFile
Ok "Uploaded"

Write-Host "    Extracting on server..."
& ssh -i $KeyRel $ServerSpec "cd $ProjectPath && tar -xf /tmp/gorod-sad-deploy.tar && rm /tmp/gorod-sad-deploy.tar && ls -la"
if ($LASTEXITCODE -ne 0) { Fail "extract failed" }
Ok "Extracted on server"

# ---- Write .env on server ----
Step "Writing .env on server (secrets)"
$envB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($envContent))
& ssh -i $KeyRel $ServerSpec "echo $envB64 | base64 -d > $ProjectPath/.env && chmod 600 $ProjectPath/.env && echo done"
if ($LASTEXITCODE -ne 0) { Fail ".env write failed" }
Ok ".env saved on server (chmod 600)"

# ---- docker compose up ----
Step "Building and starting docker stack (may take 3-7 minutes)"
& ssh -i $KeyRel $ServerSpec "cd $ProjectPath && docker compose up -d --build"
if ($LASTEXITCODE -ne 0) { Fail "docker compose failed" }
Ok "Stack started"

Write-Host "    Waiting 10s for services to settle..."
Start-Sleep -Seconds 10

Step "Checking container status"
& ssh -i $KeyRel $ServerSpec "cd $ProjectPath && docker compose ps"

# ---- Install nginx config ----
Step "Installing nginx config (HTTP only, SSL comes later)"
$nginxScript = @"
set -e
cp $ProjectPath/nginx/gorod-sad.conf /etc/nginx/sites-available/gorod-sad
ln -sf /etc/nginx/sites-available/gorod-sad /etc/nginx/sites-enabled/gorod-sad
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
echo nginx-ok
"@
& ssh -i $KeyRel $ServerSpec $nginxScript
if ($LASTEXITCODE -ne 0) { Fail "nginx config failed" }
Ok "Nginx configured"

# ---- Health check ----
Step "Health check"
$health = & ssh -i $KeyRel $ServerSpec "curl -s http://127.0.0.1:8000/health || echo FAIL"
Write-Host "    API:  $health"
$web = & ssh -i $KeyRel $ServerSpec "curl -sI http://127.0.0.1:3000 | head -1"
Write-Host "    Web:  $web"

# ---- Summary ----
$ip = ($ServerSpec -split '@')[1]
Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "  FIRST DEPLOY DONE" -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "  HTTP test:  http://$ip            (works right now)"
Write-Host "  Domain:     http://$Domain        (works after DNS propagates)"
Write-Host "  HTTPS:      run 'bash scripts/deploy.sh ssl' after DNS works"
Write-Host "==================================================================="
Write-Host ""
Write-Host "DNS to configure at your registrar:"
Write-Host "  Type=A   Name=@      Value=$ip"
Write-Host "  Type=A   Name=www    Value=$ip"
Write-Host ""
Write-Host "Check DNS:  nslookup $Domain    (should return $ip)"
