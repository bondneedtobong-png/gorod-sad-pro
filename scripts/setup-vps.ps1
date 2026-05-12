# =====================================================================
#  Gorod-Sad - VPS bootstrap one-shot script
#  Usage: PowerShell -ExecutionPolicy Bypass -File .\scripts\setup-vps.ps1
#
#  Saved in ASCII to avoid Win10 PowerShell encoding issues.
# =====================================================================

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ---- Settings ----
$ServerIP    = "46.173.28.247"
$ServerUser  = "root"
$Domain      = "gorod-sad.pro"
$ProjectName = "gorod-sad"
$ProjectPath = "/opt/$ProjectName"
$KeyName     = "gorod-sad"
$SshDir      = "$HOME\.ssh"
$KeyPath     = "$SshDir\$KeyName"
$KeyPubPath  = "$SshDir\$KeyName.pub"
$RepoRoot    = (Split-Path $PSScriptRoot -Parent)
$DeployInfo  = (Join-Path $RepoRoot ".deploy-info")

function Step($Msg) { Write-Host "`n>>> $Msg" -ForegroundColor Cyan }
function Ok($Msg)   { Write-Host "    [OK] $Msg" -ForegroundColor Green }
function Warn($Msg) { Write-Host "    [!]  $Msg" -ForegroundColor Yellow }
function Fail($Msg) { Write-Host "    [X]  $Msg" -ForegroundColor Red; exit 1 }

# ---- 1. Tools check ----
Step "Checking ssh / ssh-keygen"
foreach ($t in @("ssh","ssh-keygen")) {
  if (-not (Get-Command $t -ErrorAction SilentlyContinue)) {
    Fail "$t not found. Enable OpenSSH Client in Windows Features."
  }
}
Ok "Tools available"

# ---- 2. SSH key ----
Step "Preparing SSH key at $KeyPath"
if (-not (Test-Path $SshDir)) { New-Item -ItemType Directory -Path $SshDir -Force | Out-Null }
if (Test-Path $KeyPath) {
  Ok "Key already exists, reusing"
} else {
  & ssh-keygen -t ed25519 -C "claude-deploy-$ProjectName" -f $KeyPath -N '""' | Out-Null
  Ok "New key created"
}

# ---- 3. Copy pub key to server ----
Step "Copying public key to $ServerUser@$ServerIP (will ask for password ONCE)"
$pub = (Get-Content $KeyPubPath -Raw).Trim()
$remoteCmd = "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$pub' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && sort -u -o ~/.ssh/authorized_keys ~/.ssh/authorized_keys"
& ssh -o StrictHostKeyChecking=accept-new "$ServerUser@$ServerIP" $remoteCmd
if ($LASTEXITCODE -ne 0) { Fail "Failed to copy key. Check IP/password." }
Ok "Key installed on server"

# ---- 4. Verify keyless login ----
Step "Verifying key-based login"
$test = & ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -i $KeyPath "$ServerUser@$ServerIP" 'echo OK'
if ($test -ne "OK") { Fail "Key login does not work" }
Ok "Key login works"

# ---- 5. SSH config alias ----
Step "Adding SSH alias '$ProjectName'"
$cfg = "$SshDir\config"
if (-not (Test-Path $cfg)) { New-Item -ItemType File -Path $cfg -Force | Out-Null }
$cur = Get-Content $cfg -Raw -ErrorAction SilentlyContinue
if ($cur -notmatch "Host\s+$ProjectName(\s|$)") {
  $entry = "`nHost $ProjectName`n  HostName $ServerIP`n  User $ServerUser`n  IdentityFile $KeyPath`n"
  Add-Content -Path $cfg -Value $entry
  Ok "Alias added. Use: ssh $ProjectName"
} else {
  Ok "Alias already present"
}

# ---- 6. Server prep ----
Step "Preparing server (nginx, certbot, ufw, swap, project dir)"
$prep = @'
set -e
export DEBIAN_FRONTEND=noninteractive

echo '[1/6] apt update + base packages'
apt-get update -y -qq
apt-get install -y -qq ca-certificates curl wget gnupg git ufw nginx software-properties-common

echo '[2/6] docker'
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

echo '[3/6] certbot'
apt-get install -y -qq certbot python3-certbot-nginx

echo '[4/6] firewall'
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null

echo '[5/6] swap'
if [ "$(free -m | awk '/Swap:/ {print $2}')" -eq 0 ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo 'swap enabled'
else
  echo 'swap already present'
fi

echo '[6/6] project dir'
mkdir -p PROJECT_PATH_PLACEHOLDER

echo '--- readiness ---'
for t in git nginx docker certbot; do
  command -v $t >/dev/null && echo "$t: OK" || echo "$t: MISSING"
done
systemctl is-active nginx docker
'@
$prep = $prep -replace 'PROJECT_PATH_PLACEHOLDER', $ProjectPath

& ssh -i $KeyPath "$ServerUser@$ServerIP" $prep
if ($LASTEXITCODE -ne 0) { Fail "Server prep failed" }
Ok "Server prepared"

# ---- 7. Write .deploy-info ----
Step "Writing .deploy-info"
$info = @"
server: $ServerUser@$ServerIP
ssh_host_alias: $ProjectName
ssh_key: ~/.ssh/$KeyName
project_name: $ProjectName
project_path_on_server: $ProjectPath
domain: $Domain
created_at: $(Get-Date -Format 'yyyy-MM-dd HH:mm')
"@
$info | Out-File -FilePath $DeployInfo -Encoding utf8
Ok "Saved $DeployInfo"

# ---- 8. Optional: disable password auth ----
Write-Host ""
$disable = Read-Host "Disable password login on server (recommended)? [y/N]"
if ($disable -match '^[yY]') {
  & ssh -i $KeyPath "$ServerUser@$ServerIP" "sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config && systemctl reload ssh && echo done"
  Ok "Password login disabled (key-only now)"
} else {
  Warn "Password login left enabled. Remember to disable later."
}

# ---- Summary ----
Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "  VPS READY" -ForegroundColor Green
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "  Server:   $ServerUser@$ServerIP"
Write-Host "  Alias:    ssh $ProjectName"
Write-Host "  Path:     $ProjectPath"
Write-Host "  Key:      $KeyPath"
Write-Host "  Domain:   $Domain  (configure A records at registrar)"
Write-Host "==================================================================="
Write-Host ""
Write-Host "Next: create GitHub repo, git push, then deploy. See README.md"
