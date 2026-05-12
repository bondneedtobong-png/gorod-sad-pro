#!/usr/bin/env bash
# Обновление gorod-sad на VPS одной командой.
#
# Использование:
#   ./scripts/deploy.sh              — git pull на сервере + docker compose up
#   ./scripts/deploy.sh logs         — посмотреть логи
#   ./scripts/deploy.sh ps           — статус контейнеров
#   ./scripts/deploy.sh restart      — рестарт без пересборки
#   ./scripts/deploy.sh ssl          — выпустить/обновить SSL через certbot
#
# Требуется: .deploy-info в корне проекта (создаёт setup-vps.ps1), SSH-ключ.

set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .deploy-info ]; then
  echo "Нет .deploy-info — запусти scripts/setup-vps.ps1 сначала."
  exit 1
fi

SERVER=$(grep '^server:' .deploy-info | awk '{print $2}')
SSH_KEY=$(grep '^ssh_key:' .deploy-info | awk '{print $2}')
PROJECT_PATH=$(grep '^project_path_on_server:' .deploy-info | awk '{print $2}')
DOMAIN=$(grep '^domain:' .deploy-info | awk '{print $2}')

# Раскрываем ~ в путь к ключу
SSH_KEY="${SSH_KEY/#\~/$HOME}"

SSH_OPTS="-o StrictHostKeyChecking=accept-new"
[ -f "$SSH_KEY" ] && SSH_OPTS="$SSH_OPTS -i $SSH_KEY"

ACTION="${1:-deploy}"

ssh_exec() {
  ssh $SSH_OPTS "$SERVER" "$@"
}

case "$ACTION" in
  deploy)
    echo "→ Деплою на $SERVER ($PROJECT_PATH)"
    ssh_exec bash <<EOF
set -e
cd $PROJECT_PATH
echo "→ git pull"
git pull --ff-only
echo "→ docker compose up -d --build"
docker compose up -d --build
echo "→ docker compose ps"
docker compose ps
EOF
    echo "✅ Готово. https://$DOMAIN"
    ;;
  logs)
    ssh_exec "cd $PROJECT_PATH && docker compose logs -f --tail 80"
    ;;
  ps)
    ssh_exec "cd $PROJECT_PATH && docker compose ps"
    ;;
  restart)
    echo "→ Перезапускаю стек"
    ssh_exec "cd $PROJECT_PATH && docker compose restart"
    echo "✅ Готово."
    ;;
  ssl)
    echo "→ Выпускаю SSL для $DOMAIN и www.$DOMAIN"
    ssh_exec "certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m bondneedtobong@gmail.com"
    echo "✅ HTTPS поднят."
    ;;
  *)
    echo "Использование: $0 [deploy|logs|ps|restart|ssl]"
    exit 1
    ;;
esac
