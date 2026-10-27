#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
bucket="fichasrpg-drawings"

# Wait until S3 is ready instead of treating a starting Floci task as a missing bucket.
ready=0
for attempt in {1..30}; do
  if "$script_dir/aws.sh" s3api list-buckets >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done
if ((ready == 0)); then
  echo "ERRO: Floci S3 não ficou pronto; confira make logs-floci." >&2
  exit 1
fi

if ! "$script_dir/aws.sh" s3api head-bucket --bucket "$bucket" >/dev/null 2>&1; then
  "$script_dir/aws.sh" s3api create-bucket --bucket "$bucket" >/dev/null
fi

# O bucket de desenhos nunca publica objetos nem políticas de acesso público.
"$script_dir/aws.sh" s3api put-public-access-block \
  --bucket "$bucket" \
  --public-access-block-configuration \
  'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'
"$script_dir/aws.sh" s3api delete-bucket-policy --bucket "$bucket" >/dev/null 2>&1 || true

printf 'Bucket privado pronto: %s\n' "$bucket"
