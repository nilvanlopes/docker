#!/bin/sh
set -eu

basedir=$(dirname "$(printf '%s\n' "$0" | sed -e 's,\\,/,g')")

case "$(uname)" in
  *CYGWIN*|*MINGW*|*MSYS*)
    if command -v cygpath >/dev/null 2>&1; then
      basedir=$(cygpath -w "$basedir")
    fi
    ;;
esac

repo_dir="/home/pyu/docker"
pnpm_global_root="${PNPM_GLOBAL_ROOT:-}"

if [ -z "$pnpm_global_root" ] && command -v pnpm >/dev/null 2>&1; then
  pnpm_global_root=$(pnpm root -g 2>/dev/null || true)
fi

if [ -z "$pnpm_global_root" ]; then
  pnpm_global_root="/home/pyu/.local/share/pnpm/global/5/node_modules"
fi

codex_pkg_dir="$pnpm_global_root/@openai/codex"
codex_js="$codex_pkg_dir/bin/codex.js"
pnpm_store_dir=$(dirname "$pnpm_global_root")/.pnpm

if [ ! -f "$codex_js" ]; then
  for candidate in "$pnpm_store_dir"/@openai+codex@*/node_modules/@openai/codex/bin/codex.js; do
    if [ -f "$candidate" ]; then
      codex_js="$candidate"
    fi
  done
fi

if [ ! -f "$codex_js" ]; then
  echo "Could not find Codex CLI. Reinstall with: pnpm add -g @openai/codex" >&2
  exit 1
fi

codex_pkg_dir=$(dirname "$(dirname "$codex_js")")
codex_node_path="$codex_pkg_dir/node_modules:$(dirname "$codex_pkg_dir"):$(dirname "$pnpm_global_root")/.pnpm/node_modules"

if [ -z "${NODE_PATH:-}" ]; then
  export NODE_PATH="$codex_node_path"
else
  export NODE_PATH="$codex_node_path:$NODE_PATH"
fi

if [ "$#" -gt 0 ] && [ "$1" = "sessions" ]; then
  shift
  exec node "$repo_dir/scripts/codex-folder-sessions.mjs" "$@"
fi

if [ -x "$basedir/node" ]; then
  node_bin="$basedir/node"
else
  node_bin="node"
fi

if [ "$#" -gt 0 ] && [ "$1" = "spark" ]; then
  shift
  exec "$node_bin" "$codex_js" -m gpt-5.3-codex-spark "$@"
fi

exec "$node_bin" "$codex_js" "$@"
