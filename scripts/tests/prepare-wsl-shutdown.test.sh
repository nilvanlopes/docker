#!/usr/bin/env bash
# Root is required by the production script; all operational commands are mocked.
set -euo pipefail
(( EUID == 0 )) || { echo 'Execute este teste com sudo.' >&2; exit 1; }
test_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
temp_dir=$(mktemp -d /tmp/docker-shutdown-test.XXXXXXXX)
trap 'rm -f -- "$temp_dir/systemctl" "$temp_dir/docker" "$temp_dir/pgrep" "$temp_dir/sync" "$temp_dir/log" "$temp_dir/output"; rmdir -- "$temp_dir"' EXIT
for command_name in systemctl docker pgrep sync; do
  ln -s "$test_dir/shutdown-command-mock.sh" "$temp_dir/$command_name"
done
export PATH="$temp_dir:$PATH"
export SHUTDOWN_TEST_LOG="$temp_dir/log"
for scenario in success live-restore stop-failed timeout shim-alive; do
  export SHUTDOWN_TEST_CASE="$scenario"
  : > "$SHUTDOWN_TEST_LOG"
  status=0
  bash "$test_dir/../prepare-wsl-shutdown.sh" > "$temp_dir/output" 2>&1 || status=$?
  if [[ "$scenario" == success ]]; then
    [[ "$status" == 0 ]]
    grep -q '^systemctl stop docker.socket docker.service$' "$SHUTDOWN_TEST_LOG"
    grep -q '^systemctl stop containerd.service$' "$SHUTDOWN_TEST_LOG"
    grep -q '^sync ' "$SHUTDOWN_TEST_LOG"
  else
    [[ "$status" != 0 ]]
    ! grep -q '^sync ' "$SHUTDOWN_TEST_LOG"
    ! grep -q 'É seguro' "$temp_dir/output"
  fi
  echo "PASS $scenario"
done
