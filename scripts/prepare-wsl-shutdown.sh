#!/usr/bin/env bash
# Run while WSL is still alive, before wsl --terminate or Windows shutdown.
set -euo pipefail

if (( EUID != 0 )); then
  echo 'ERRO: execute com sudo.' >&2
  exit 1
fi

if systemctl is-active --quiet docker.service; then
  # A live-restored container could outlive dockerd; do not claim a clean stop.
  live_restore=$(docker info --format '{{.LiveRestoreEnabled}}')
  if [[ "$live_restore" != false ]]; then
    echo 'ERRO: live-restore está ativo; desligamento automático abortado.' >&2
    exit 1
  fi
fi

echo 'Aguardando o encerramento do Docker e de seus containers...'
# Stop the socket too, so a client cannot reactivate Docker during shutdown.
systemctl stop docker.socket docker.service
systemctl stop containerd.service

for unit in docker.service docker.socket containerd.service; do
  state=$(systemctl show "$unit" --property=ActiveState --value)
  result=$(systemctl show "$unit" --property=Result --value)
  if [[ "$state" != inactive || "$result" != success ]]; then
    echo "ERRO: $unit state=$state result=$result; desligamento abortado." >&2
    exit 1
  fi
done

# Docker uses KillMode=process; check that no container shim survived it.
if pgrep -f '(^|/)containerd-shim[^ /]*([[:space:]]|$)' >/dev/null; then
  echo 'ERRO: ainda existem processos containerd-shim; desligamento abortado.' >&2
  exit 1
fi
sync
echo 'Docker e containerd encerrados. É seguro encerrar esta distribuição WSL.'
