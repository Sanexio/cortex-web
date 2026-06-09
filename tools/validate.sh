#!/usr/bin/env bash
# Cortex-Web — Schema-Validation (CW-002).
# Exit 0 = alle Objekte valide, 1 = Setup-Problem, 2 = Validation-Fehler.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [ ! -d node_modules ]; then
  echo "validate: node_modules missing — run 'bun install' in $REPO_ROOT" >&2
  exit 1
fi

node tools/lib/schema-validate.mjs

# Optional Shopify connectivity check (CW-002 extension, Phase 2).
# Activated by sync-shopify.sh (CHECK_SHOPIFY=1) or manually for pre-flight.
if [ "${CHECK_SHOPIFY:-0}" = "1" ]; then
  if [ ! -f .env.local ]; then
    echo "validate: CHECK_SHOPIFY=1 requested but .env.local missing" >&2
    exit 1
  fi
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
  : "${SHOPIFY_STORE:?validate: SHOPIFY_STORE missing in .env.local}"
  : "${SHOPIFY_ADMIN_TOKEN:?validate: SHOPIFY_ADMIN_TOKEN missing in .env.local}"

  echo "validate: shopify connectivity check (/shop.json)"
  http_code="$(curl -sS -o /tmp/cortex-web-shop.json -w '%{http_code}' \
    -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_TOKEN" \
    "https://${SHOPIFY_STORE}/admin/api/2026-04/shop.json")" || http_code=000
  if [ "$http_code" != "200" ]; then
    echo "validate: shopify check FAILED (HTTP $http_code) — see /tmp/cortex-web-shop.json (token NOT logged)" >&2
    exit 2
  fi
  echo "validate: shopify OK ($SHOPIFY_STORE, HTTP 200)"
  rm -f /tmp/cortex-web-shop.json
fi
