#!/usr/bin/env bash
# Cortex-Web — Shopify Theme-Template-Sync (content-bridge-v1 Option B).
# Builds a templates/page.<slug>.json asset from trunk and PUTs it to the live theme.
#
# Usage:
#   bash tools/sync-template-shopify.sh [trunk/content/pages/_shared/<id>.yaml]
# Default: trunk/content/pages/_shared/ueber-uns.yaml
#
# Env:
#   SHOPIFY_THEME_ID    optional, pin a specific theme
#
# Exit codes:
#   0 success
#   1 setup / config error
#   2 validation / REST error

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONTENT_FILE="${1:-trunk/content/pages/_shared/ueber-uns.yaml}"

if [ ! -f "$CONTENT_FILE" ]; then
  echo "sync-template-shopify: content file not found: $CONTENT_FILE" >&2
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "sync-template-shopify: .env.local missing." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ./.env.local
set +a

: "${SHOPIFY_STORE:?missing in .env.local}"
: "${SHOPIFY_ADMIN_TOKEN:?missing in .env.local}"

echo "sync-template-shopify: [1/2] build  ($CONTENT_FILE)"
PAYLOAD="$(bun adapters/shopify/build-template.mjs "$CONTENT_FILE")"

echo "sync-template-shopify: [2/2] push (Theme-Asset)"
printf '%s' "$PAYLOAD" | bun adapters/shopify/template-to-shopify.mjs

echo "sync-template-shopify: OK"
