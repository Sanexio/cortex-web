#!/usr/bin/env bash
# Cortex-Web — Shopify-Sync-Pipeline (Phase 2 POC).
# 1. validate.sh (AJV build-gate, optional Shopify connectivity check)
# 2. build.mjs für das gewählte Produkt → Payload
# 3. products-to-shopify.mjs → REST POST/PUT (status=draft hardcoded)
#
# Usage:
#   bash tools/sync-shopify.sh [trunk/content/products/<kategorie>/<id>.yaml]
# Default: trunk/content/products/bluttests/basic-check.yaml
#
# Env:
#   ALLOW_OVERWRITE=1   to overwrite an already-published product
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
  echo "sync-shopify: content file not found: $CONTENT_FILE" >&2
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "sync-shopify: .env.local missing." >&2
  echo "  1. cp .env.local.template .env.local" >&2
  echo "  2. fill SHOPIFY_STORE + SHOPIFY_ADMIN_TOKEN (run tools/shopify-authorize.sh + tools/shopify-oauth-catcher.mjs)" >&2
  exit 1
fi

# Load .env.local without leaking into caller shell beyond subshells below.
set -a
# shellcheck disable=SC1091
. ./.env.local
set +a

: "${SHOPIFY_STORE:?sync-shopify: SHOPIFY_STORE missing in .env.local}"
: "${SHOPIFY_ADMIN_TOKEN:?sync-shopify: SHOPIFY_ADMIN_TOKEN missing in .env.local}"

echo "sync-shopify: [1/3] validate (with shopify connectivity check)"
CHECK_SHOPIFY=1 bash tools/validate.sh

echo "sync-shopify: [2/3] build  ($CONTENT_FILE)"
PAYLOAD="$(bun adapters/shopify/build.mjs "$CONTENT_FILE")"

echo "sync-shopify: [3/3] push"
printf '%s' "$PAYLOAD" | bun adapters/shopify/products-to-shopify.mjs

echo "sync-shopify: OK"
