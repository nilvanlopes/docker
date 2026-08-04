#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "ERRO: rode com sudo: sudo $0" >&2
  exit 1
fi

stamp="$(date +%Y-%m-%d-%H%M%S)"
docker_root="/var/lib/docker"
swarm_dir="${docker_root}/swarm"
backup_root="/var/lib/docker-backups"
backup_tar="${backup_root}/swarm-${stamp}.tgz"
backup_dir="${backup_root}/swarm-${stamp}"

echo ">>> Stopping Docker services..."
systemctl stop docker docker.socket containerd || true

if [[ ! -d "${swarm_dir}" ]]; then
  echo ">>> No ${swarm_dir} directory found. Nothing to move."
else
  echo ">>> Creating backup at ${backup_tar}..."
  mkdir -p "${backup_root}"
  tar -C "${docker_root}" -czf "${backup_tar}" swarm

  echo ">>> Moving ${swarm_dir} to ${backup_dir}..."
  mv "${swarm_dir}" "${backup_dir}"
fi

echo ">>> Starting Docker without the previous Swarm state..."
systemctl start containerd docker.socket docker.service

echo ">>> Docker status:"
docker info --format 'ServerVersion={{.ServerVersion}} Swarm={{.Swarm.LocalNodeState}} Containers={{.Containers}} Images={{.Images}}'

echo ">>> Done. Backup root: ${backup_root}"
