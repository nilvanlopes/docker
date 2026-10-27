#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
bucket="fichasrpg-assets"

if ! "$script_dir/aws.sh" s3api head-bucket --bucket "$bucket" >/dev/null 2>&1; then
  "$script_dir/aws.sh" s3api create-bucket --bucket "$bucket"
fi

# Permite somente a política de leitura pública; ACLs públicas ficam bloqueadas.
"$script_dir/aws.sh" s3api put-public-access-block \
  --bucket "$bucket" \
  --public-access-block-configuration \
  'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false'

policy="$(<"$script_dir/fichasrpg-assets-policy.json")"
"$script_dir/aws.sh" s3api put-bucket-policy --bucket "$bucket" --policy "$policy"

printf 'Bucket pronto: %s\n' "$bucket"
printf 'URL pública: https://fichasrpg-assets.nilvanlopes.com/<chave-do-objeto>\n'
