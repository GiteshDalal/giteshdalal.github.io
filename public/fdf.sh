#!/usr/bin/env bash
# Installs fdf, the Feature Document Format CLI: https://giteshdalal.com/projects/fdf/
#
#   curl -fsSL https://giteshdalal.com/fdf.sh | bash
#   curl -fsSL https://giteshdalal.com/fdf.sh | bash -s -- --version v1.2.0
#   curl -fsSL https://giteshdalal.com/fdf.sh | FDF_INSTALL_DIR="$HOME/bin" bash
#
# This short link only hands off to the installer kept in the fdf repository,
# https://github.com/GiteshDalal/fdf/blob/main/install.sh, so there is one
# installer to maintain. Arguments and environment pass through unchanged.
set -euo pipefail

main() {
  local url="https://raw.githubusercontent.com/GiteshDalal/fdf/main/install.sh"
  local installer
  if command -v curl >/dev/null 2>&1; then
    installer=$(curl -fsSL "$url") || installer=""
  elif command -v wget >/dev/null 2>&1; then
    installer=$(wget -qO- "$url") || installer=""
  else
    printf 'fdf-install: error: need curl or wget\n' >&2
    exit 1
  fi
  if [ -z "$installer" ]; then
    printf 'fdf-install: error: could not download %s\n' "$url" >&2
    exit 1
  fi
  # The whole installer is downloaded before any of it runs.
  exec bash -c "$installer" fdf-install "$@"
}

main "$@"
