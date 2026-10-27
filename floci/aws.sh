#!/usr/bin/env bash
set -euo pipefail

if (($# == 0)); then
  echo "Uso: $0 <aws-cli arguments>" >&2
  exit 2
fi

if ! docker service ps floci_floci --filter desired-state=running --format '{{.CurrentState}}' | grep -q '^Running'; then
  echo "ERRO: serviço floci_floci não está em execução; rode make deploy-floci." >&2
  exit 1
fi

exec docker run --rm -i \
  --network floci-internal \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  --cap-drop ALL \
  --security-opt no-new-privileges:true \
  --env AWS_ACCESS_KEY_ID=test \
  --env AWS_SECRET_ACCESS_KEY=test \
  --env AWS_DEFAULT_REGION=us-east-1 \
  --env AWS_ENDPOINT_URL=http://floci:4566 \
  public.ecr.aws/aws-cli/aws-cli@sha256:c8156a0e74e13929a42d7e60f0d4e14e7d28d980cd21822505d4bff80e5460c1 \
  "$@"
