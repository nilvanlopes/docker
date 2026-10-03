#!/usr/bin/env bash
set -euo pipefail
command_name=${0##*/}
printf '%s %s\n' "$command_name" "$*" >> "$SHUTDOWN_TEST_LOG"
case "$command_name" in
  docker)
    [[ "$SHUTDOWN_TEST_CASE" == live-restore ]] && echo true || echo false
    ;;
  systemctl)
    case "$1" in
      is-active) exit 0 ;;
      stop) [[ "$SHUTDOWN_TEST_CASE" != stop-failed ]] ;;
      show)
        case "$*" in
          *ActiveState*) echo inactive ;;
          *Result*)
            [[ "$SHUTDOWN_TEST_CASE" == timeout ]] && echo timeout || echo success
            ;;
        esac
        ;;
    esac
    ;;
  pgrep) [[ "$SHUTDOWN_TEST_CASE" == shim-alive ]] ;;
  sync) exit 0 ;;
esac
