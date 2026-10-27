#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if (($# < 1 || $# > 2)); then
  echo "Uso: $0 <arquivo-de-imagem> [chave-no-bucket]" >&2
  exit 2
fi

source_file="$1"
[[ -f "$source_file" ]] || { echo "ERRO: arquivo não encontrado: $source_file" >&2; exit 1; }
key="${2:-$(basename -- "$source_file")}"

if [[ "$key" == /* || "$key" == *..* || ! "$key" =~ ^[A-Za-z0-9._/-]+$ ]]; then
  echo "ERRO: use uma chave relativa com letras, números, ponto, hífen, sublinhado e barras." >&2
  exit 2
fi

content_type="$(python3 -c 'import mimetypes,sys; print(mimetypes.guess_type(sys.argv[1])[0] or "application/octet-stream")' "$source_file")"
case "$content_type" in
  image/jpeg|image/png|image/webp|image/gif|image/avif)
    ;;
  *)
    echo "ERRO: formato não permitido ($content_type). Use JPEG, PNG, WebP, GIF ou AVIF." >&2
    exit 2
    ;;
esac

"$script_dir/aws.sh" s3 cp - "s3://fichasrpg-assets/$key" \
  --content-type "$content_type" \
  --cache-control "public, max-age=3600" < "$source_file"

printf 'Imagem publicada: https://fichasrpg-assets.nilvanlopes.com/%s\n' "$key"
