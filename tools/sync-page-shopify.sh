#!/usr/bin/env bash
# Cortex-Web — Shopify-Page-Sync-Pipeline (content-bridge-v1).
# 1. build-page.mjs -> payload JSON on stdout
# 2. pages-to-shopify.mjs -> REST POST/PUT (published=false enforced)
#
# Usage:
#   bash tools/sync-page-shopify.sh [trunk/content/pages/_shared/<id>.yaml]
# Default: trunk/content/pages/_shared/ueber-uns.yaml
#
# Env:
#   ALLOW_OVERWRITE=1   to overwrite an already-published page
#
# Exit codes:
#   0 success
#   1 setup / config error
#   2 validation / REST error (propagated from adapters)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONTENT_FILE="${1:-trunk/content/pages/_shared/ueber-uns.yaml}"

if [ ! -f "$CONTENT_FILE" ]; then
  echo "sync-page-shopify: content file not found: $CONTENT_FILE" >&2
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "sync-page-shopify: .env.local missing." >&2
  echo "  1. cp .env.local.template .env.local" >&2
  echo "  2. fill SHOPIFY_STORE + SHOPIFY_ADMIN_TOKEN" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ./.env.local
set +a

: "${SHOPIFY_STORE:?sync-page-shopify: SHOPIFY_STORE missing in .env.local}"
: "${SHOPIFY_ADMIN_TOKEN:?sync-page-shopify: SHOPIFY_ADMIN_TOKEN missing in .env.local}"

echo "sync-page-shopify: [1/2] build  ($CONTENT_FILE)"
PAYLOAD="$(bun adapters/shopify/build-page.mjs "$CONTENT_FILE")"

echo "sync-page-shopify: [2/2] push"
printf '%s' "$PAYLOAD" | bun adapters/shopify/pages-to-shopify.mjs

echo "sync-page-shopify: OK"
