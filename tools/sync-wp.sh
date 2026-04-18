#!/usr/bin/env bash
# Cortex-Web — WordPress-Sync-Pipeline (Phase 1 POC).
# 1. validate.sh (AJV build-gate)
# 2. build.mjs für das gewählte Produkt → Payload
# 3. content-to-wp-pages.mjs → REST POST/PUT
#
# Usage:
#   bash tools/sync-wp.sh [trunk/content/products/<kategorie>/<id>.yaml]
# Default: trunk/content/products/bluttests/basic-check.yaml
#
# Exit codes:
#   0 success
#   1 setup / config error
#   2 validation / REST error (propagiert aus adapters)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONTENT_FILE="${1:-trunk/content/products/bluttests/basic-check.yaml}"

if [ ! -f "$CONTENT_FILE" ]; then
  echo "sync-wp: content file not found: $CONTENT_FILE" >&2
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "sync-wp: .env.local missing." >&2
  echo "  1. cp .env.local.template .env.local" >&2
  echo "  2. fill WP_USER + WP_APP_PASSWORD (from WP admin → Users → Profile → Application Passwords)" >&2
  exit 1
fi

# Load .env.local without leaking into caller shell beyond subshells below.
set -a
# shellcheck disable=SC1091
. ./.env.local
set +a

: "${WP_REST_BASE:?sync-wp: WP_REST_BASE missing in .env.local}"
: "${WP_USER:?sync-wp: WP_USER missing in .env.local}"
: "${WP_APP_PASSWORD:?sync-wp: WP_APP_PASSWORD missing in .env.local}"

echo "sync-wp: [1/3] validate"
bash tools/validate.sh

echo "sync-wp: [2/3] build  ($CONTENT_FILE)"
PAYLOAD="$(bun adapters/wordpress/build.mjs "$CONTENT_FILE")"

echo "sync-wp: [3/3] push"
printf '%s' "$PAYLOAD" | bun adapters/wordpress/content-to-wp-pages.mjs

echo "sync-wp: OK"
