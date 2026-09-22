#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec "${script_dir}/sites-env.sh" -- "$0" "$@"
fi

command -v timeout || {
  echo "build-verified.sh requires GNU timeout." >&2
  exit 69
}

static_builder="${SITES_PROJECT_ROOT}/node_modules/.bin/next"
if [[ ! -x "${static_builder}" ]]; then
  echo "The static builder is unavailable. Install the locked dependencies before building." >&2
  exit 69
fi

echo "Exporting Clubismo Off for GitHub Pages..."
timeout \
  --signal=TERM \
  --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" \
  "${SITES_BUILD_TIMEOUT:-3m}" \
  "${static_builder}" build --webpack
