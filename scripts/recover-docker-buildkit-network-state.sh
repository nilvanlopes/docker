#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "ERRO: rode com sudo: sudo $0" >&2
  exit 1
fi

stamp="$(date +%Y-%m-%d-%H%M%S)"
docker_root="/var/lib/docker"
backup_root="/var/lib/docker-backups"

move_if_exists() {
  local source_path="$1"
  local label="$2"
  local backup_path="${backup_root}/${label}-${stamp}"

  if [[ ! -e "${source_path}" ]]; then
    echo ">>> ${source_path} not found. Skipping."
    return 0
  fi

  echo ">>> Moving ${source_path} to ${backup_path}..."
  mv "${source_path}" "${backup_path}"
}

echo ">>> Stopping Docker services..."
systemctl stop docker docker.socket containerd || true
systemctl reset-failed docker docker.socket containerd || true

echo ">>> Preparing backup directory: ${backup_root}"
mkdir -p "${backup_root}"

move_if_exists "${docker_root}/buildkit" "buildkit"
move_if_exists "${docker_root}/network/files/local-kv.db" "network-local-kv.db"

echo ">>> Starting Docker after isolating BuildKit/network state..."
systemctl start containerd docker.socket docker.service

echo ">>> Docker status:"
docker info --format 'ServerVersion={{.ServerVersion}} Swarm={{.Swarm.LocalNodeState}} Containers={{.Containers}} Images={{.Images}}'

echo ">>> Done. Backup root: ${backup_root}"
