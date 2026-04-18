#!/usr/bin/env bash
# Cortex-Web — Phase 3 Review orchestrator.
# Runs all review dimensions (content parity, HWG scan, commerce check,
# idempotency, trunk-master roundtrip, screenshots) and writes structured
# evidence to specs/phase-3/evidence/.
#
# Usage:
#   bash tools/review.sh [trunk/content/products/<kategorie>/<id>.yaml]
# Default: trunk/content/products/bluttests/basic-check.yaml
#
# Exit codes:
#   0 = all 11 automated AKs green (AK-12 self-check is manual)
#   1 = setup / config error
#   2 = at least one AK red

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONTENT_FILE="${1:-trunk/content/products/bluttests/basic-check.yaml}"

if [ ! -f "$CONTENT_FILE" ]; then
  echo "review: content file not found: $CONTENT_FILE" >&2
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "review: .env.local missing — WP + Shopify credentials required" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
. ./.env.local
set +a

: "${WP_REST_BASE:?review: WP_REST_BASE missing in .env.local}"
: "${WP_USER:?review: WP_USER missing in .env.local}"
: "${WP_APP_PASSWORD:?review: WP_APP_PASSWORD missing in .env.local}"
: "${SHOPIFY_STORE:?review: SHOPIFY_STORE missing in .env.local}"
: "${SHOPIFY_ADMIN_TOKEN:?review: SHOPIFY_ADMIN_TOKEN missing in .env.local}"

exec bun tools/review/run.mjs "$CONTENT_FILE"
