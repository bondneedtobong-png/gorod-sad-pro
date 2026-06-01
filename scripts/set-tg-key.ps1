# =====================================================================
#  Gorod-Sad - configure Telegram bot
#  - Takes bot token from user
#  - Auto-detects chat_id of the admin group via getUpdates
#  - Writes TELEGRAM_* vars to .env on server
#  - Registers webhook https://gorod-sad.pro/api/v1/telegram/webhook
#  Usage: PowerShell -ExecutionPolicy Bypass -File .\scripts\set-tg-key.ps1
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
$Domain      = $cfg['domain']

Write-Host "`n--- Telegram bot setup ---" -ForegroundColor Cyan
Write-Host "Open KeePass and copy bot token from @BotFather`n"
Write-Host "Paste token. WARNING: visible while pasting (so we see length)." -ForegroundColor Yellow
$token = (Read-Host "Bot token").Trim()
if (-not $token -or $token -notmatch '^\d+:[\w-]+$') {
  throw "Token looks wrong. Expected format: 1234567890:AAH... (got length=$($token.Length))"
}
Write-Host "  Token length: $($token.Length), prefix: $($token.Substring(0,10))..." -ForegroundColor Green

# --- Auto-detect chat_id ---
Write-Host "`n>>> Asking Telegram for recent updates to find your group's chat_id"
Write-Host "    (please make sure you wrote any message in the group AFTER adding the bot)"

try {
  $resp = Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/getUpdates" -Method Get
} catch {
  throw "Failed to call Telegram API: $_"
}

if (-not $resp.ok) {
  throw "Telegram API returned error: $($resp | ConvertTo-Json -Depth 5)"
}

# Find the most recent group/supergroup chat
$candidates = @()
foreach ($u in $resp.result) {
  $msg = if ($u.message) { $u.message } elseif ($u.my_chat_member) { $u.my_chat_member } else { $null }
  if ($msg -and $msg.chat -and ($msg.chat.type -eq 'group' -or $msg.chat.type -eq 'supergroup')) {
    $candidates += [PSCustomObject]@{
      chat_id = $msg.chat.id
      title   = $msg.chat.title
      type    = $msg.chat.type
    }
  }
}

if ($candidates.Count -eq 0) {
  Write-Host "`n[!] No group chats detected." -ForegroundColor Yellow
  Write-Host "    1. Make sure bot is added to the group"
  Write-Host "    2. Make sure bot is admin (or that 'group privacy' is disabled via @BotFather → /setprivacy → Disable)"
  Write-Host "    3. Write any message in the group (mentioning bot helps: '@yourbot ping')"
  Write-Host "    Then re-run this script."
  $manual = Read-Host "`nOr enter chat_id manually (e.g. -1001234567890, blank to abort)"
  if (-not $manual) { exit 1 }
  $chatId = $manual.Trim()
} else {
  $unique = $candidates | Sort-Object chat_id -Unique
  Write-Host "`nFound group(s):" -ForegroundColor Green
  for ($i = 0; $i -lt $unique.Count; $i++) {
    Write-Host "  $($i+1). $($unique[$i].title)  [chat_id=$($unique[$i].chat_id), type=$($unique[$i].type)]"
  }
  if ($unique.Count -eq 1) {
    $chatId = "$($unique[0].chat_id)"
    Write-Host "  Auto-selected the only one." -ForegroundColor Green
  } else {
    $idx = Read-Host "Choose 1-$($unique.Count)"
    $chatId = "$($unique[[int]$idx - 1].chat_id)"
  }
}

# --- Generate webhook secret ---
$secretBytes = New-Object byte[] 24
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($secretBytes)
$webhookSecret = [Convert]::ToBase64String($secretBytes) -replace '[+/=]', ''

# --- Push to server via base64 ---
$tokenB64  = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($token))
$chatB64   = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($chatId))
$secretB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($webhookSecret))

Write-Host "`n>>> Writing TELEGRAM_* to .env on $ServerSpec" -ForegroundColor Cyan

$remoteScript = @"
set -e
cd $ProjectPath
TG_TOKEN=`$(echo '$tokenB64'  | base64 -d)
TG_CHAT=`$(echo  '$chatB64'   | base64 -d)
TG_SECRET=`$(echo '$secretB64' | base64 -d)
sed -i '/^TELEGRAM_BOT_TOKEN=/d;/^TELEGRAM_CHAT_ID=/d;/^TELEGRAM_WEBHOOK_SECRET=/d' .env
echo "TELEGRAM_BOT_TOKEN=`$TG_TOKEN"       >> .env
echo "TELEGRAM_CHAT_ID=`$TG_CHAT"          >> .env
echo "TELEGRAM_WEBHOOK_SECRET=`$TG_SECRET" >> .env
chmod 600 .env
echo '--- env vars ---'
if grep -q '^TELEGRAM_BOT_TOKEN=.' .env;       then echo 'TELEGRAM_BOT_TOKEN: set'; else echo 'TELEGRAM_BOT_TOKEN: EMPTY'; fi
grep '^TELEGRAM_CHAT_ID=' .env
if grep -q '^TELEGRAM_WEBHOOK_SECRET=.' .env;  then echo 'TELEGRAM_WEBHOOK_SECRET: set'; else echo 'TELEGRAM_WEBHOOK_SECRET: EMPTY'; fi
echo
echo '>>> Restarting api container'
docker compose up -d --force-recreate api
"@

& ssh -i $KeyRel $ServerSpec $remoteScript
if ($LASTEXITCODE -ne 0) { Write-Host "  [X] failed" -ForegroundColor Red; exit 1 }
Write-Host "  [OK] env updated" -ForegroundColor Green

# --- Register Telegram webhook ---
Write-Host "`n>>> Registering Telegram webhook at https://$Domain/api/v1/telegram/webhook" -ForegroundColor Cyan
$webhookUrl = "https://$Domain/api/v1/telegram/webhook"
$setWebhookResp = Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$token/setWebhook" -ContentType 'application/json' -Body (@{
  url           = $webhookUrl
  secret_token  = $webhookSecret
  allowed_updates = @('message', 'callback_query')
} | ConvertTo-Json)

if ($setWebhookResp.ok) {
  Write-Host "  [OK] webhook registered: $($setWebhookResp.description)" -ForegroundColor Green
} else {
  Write-Host "  [X] webhook setup failed: $($setWebhookResp | ConvertTo-Json)" -ForegroundColor Red
}

Write-Host "`n--- Quick test ---" -ForegroundColor Cyan
Write-Host "Send a test message into the group from the API:"
Write-Host "  ssh gorod-sad 'curl -s -X POST -H \`"Content-Type: application/json\`" --data ''{`"messages`":[{`"role`":`"user`",`"content`":`"test`"}]}'' http://127.0.0.1:8000/api/v1/telegram/test'"
