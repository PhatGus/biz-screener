#!/usr/bin/env bash
# SessionStart hook: make sure the project is ready to build, lint, and test
# in a fresh Claude Code (web) session — dependencies installed and the env
# template in place. Output is informational; the hook never blocks the session.
set -uo pipefail

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.." || exit 0

if [ ! -d node_modules ]; then
  echo "[session-start] Installing npm dependencies…"
  npm install --no-audit --no-fund >/tmp/biz-screener-install.log 2>&1 \
    && echo "[session-start] Dependencies installed." \
    || echo "[session-start] npm install failed — see /tmp/biz-screener-install.log"
else
  echo "[session-start] node_modules present — skipping install."
fi

if [ ! -f .env.local ]; then
  echo "[session-start] Note: .env.local is missing. Copy .env.local.example and set ANTHROPIC_API_KEY before running the app."
fi

exit 0
