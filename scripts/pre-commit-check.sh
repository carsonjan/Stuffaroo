#!/bin/sh
set -e

# GUI Git clients may not load the shell configuration that sets up nvm and uv.
if ! command -v pnpm >/dev/null 2>&1 || ! command -v node >/dev/null 2>&1; then
  NVM_DIR=${NVM_DIR:-"$HOME/.nvm"}
  export NVM_DIR
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh" --no-use
    nvm use --silent default >/dev/null || true
  fi
fi
PATH="$HOME/.local/bin:$PATH"
export PATH

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm was not found. Install pnpm or make it available to your Git client." >&2
  exit 1
fi
if ! command -v uv >/dev/null 2>&1; then
  echo "uv was not found. Install uv or make it available to your Git client." >&2
  exit 1
fi

exec pnpm check
