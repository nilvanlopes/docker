#!/usr/bin/env bash
set -euo pipefail

MAKE_CMD="${MAKE_CMD:-make}"
ORDER=(
  tunnel
  traefik
  authentik
  foundry-signup
  authentik-outpost-traefik
  authentik-outpost-portainer
  authentik-outpost-foundry
  crowdsec
  portainer
  foundry
  n8n
  waha
  qbittorrent
  honcho
  excalidraw
  stremio
  whoami
  fred
  curriculum-optimizer
)

is_running_stack() {
  docker stack ls --format '{{.Name}}' 2>/dev/null | grep -qx "$1"
}

is_running_compose() {
  local dir="$1"
  (cd "$dir" && docker compose ps --services --filter status=running 2>/dev/null | grep -q .)
}

service_is_running() {
  case "$1" in
    fred) is_running_compose fred ;;
    curriculum-optimizer) is_running_compose curriculum-optimizer ;;
    *) is_running_stack "$1" ;;
  esac
}

deploy_one() {
  case "$1" in
    tunnel) "$MAKE_CMD" --no-print-directory deploy-tunnel ;;
    traefik) "$MAKE_CMD" --no-print-directory deploy-traefik ;;
    authentik) "$MAKE_CMD" --no-print-directory deploy-authentik ;;
    foundry-signup) "$MAKE_CMD" --no-print-directory deploy-foundry-signup ;;
    authentik-outpost-traefik) "$MAKE_CMD" --no-print-directory deploy-authentik-outpost-traefik ;;
    authentik-outpost-portainer) "$MAKE_CMD" --no-print-directory deploy-authentik-outpost-portainer ;;
    authentik-outpost-foundry) "$MAKE_CMD" --no-print-directory deploy-authentik-outpost-foundry ;;
    crowdsec) "$MAKE_CMD" --no-print-directory deploy-crowdsec ;;
    portainer) "$MAKE_CMD" --no-print-directory deploy-portainer ;;
    foundry) "$MAKE_CMD" --no-print-directory deploy-foundry ;;
    n8n) "$MAKE_CMD" --no-print-directory deploy-n8n ;;
    waha) "$MAKE_CMD" --no-print-directory deploy-waha ;;
    qbittorrent) "$MAKE_CMD" --no-print-directory deploy-qbittorrent ;;
    honcho) "$MAKE_CMD" --no-print-directory deploy-honcho ;;
    excalidraw) "$MAKE_CMD" --no-print-directory deploy-excalidraw ;;
    stremio) "$MAKE_CMD" --no-print-directory deploy-stremio ;;
    whoami) "$MAKE_CMD" --no-print-directory deploy-whoami ;;
    fred) "$MAKE_CMD" --no-print-directory deploy-fred ;;
    curriculum-optimizer) "$MAKE_CMD" --no-print-directory deploy-curriculum-optimizer ;;
    *)
      echo "ERRO: serviço desconhecido: $1" >&2
      return 1
      ;;
  esac
}

deploy_list() {
  local requested=" $1 "
  local svc

  for svc in "${ORDER[@]}"; do
    if [[ "$requested" == *" $svc "* ]]; then
      deploy_one "$svc"
    fi
  done
}

if [[ -n "${SERVICES:-}" ]]; then
  if [[ "${SERVICES}" == "all" ]]; then
    deploy_list "${ORDER[*]}"
  else
    deploy_list "${SERVICES//,/ }"
  fi
  echo "✓ Deploy concluído"
  exit 0
fi

if [[ ! -t 0 ]]; then
  echo 'ERRO: modo interativo requer TTY. Use SERVICES="all" ou SERVICES="svc1 svc2".' >&2
  exit 1
fi

if ! command -v whiptail >/dev/null 2>&1; then
  echo "ERRO: whiptail não encontrado. Instale whiptail ou use SERVICES=..." >&2
  exit 1
fi

items=()
for svc in "${ORDER[@]}"; do
  if ! service_is_running "$svc"; then
    items+=("$svc" "" off)
  fi
done

if ((${#items[@]} == 0)); then
  echo "Tudo já está rodando."
  exit 0
fi

selected_output="$(
  whiptail \
    --title "Deploy de serviços" \
    --checklist "Use ESPACO para marcar/desmarcar e ENTER para iniciar o deploy." \
    28 88 18 \
    "${items[@]}" \
    3>&1 1>&2 2>&3
)" || {
  echo "Cancelado."
  exit 0
}

if [[ -z "${selected_output}" ]]; then
  echo "Nenhum serviço selecionado."
  exit 0
fi

selected_output="${selected_output//\"/}"
selected_output="${selected_output//$'\n'/ }"
deploy_list "${selected_output}"
echo "✓ Deploy concluído"
