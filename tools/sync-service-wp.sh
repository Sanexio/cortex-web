#!/usr/bin/env bash
# Cortex-Web — Praxis Service-Pages WordPress sync (S34 B-2a, 2026-04-24).
#
# Flow:
#   1. validate all page YAMLs (build-service.mjs includes schema validation)
#   2. build + push the /service/ hub page -> extract hub ID
#   3. build + push each /service/<slug>/ child with parent=<hub-id>
#
# CW-008 backup happens automatically per child inside content-to-wp-pages.mjs.
# CW-007: Trunk YAML is the single source; adapter is the only writer.
#
# Usage:
#   bash tools/sync-service-wp.sh [--dry-run]
#
# Exit codes:
#   0 success
#   1 setup / config error
#   2 validation / REST error (propagates)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    *) echo "sync-service-wp: unknown arg: $arg" >&2; exit 1 ;;
  esac
done

HUB_YAML="trunk/content/pages/praxis/service.yaml"
CHILD_DIR="trunk/content/pages/praxis/service"

if [ ! -f "$HUB_YAML" ]; then
  echo "sync-service-wp: hub YAML missing: $HUB_YAML" >&2
  exit 1
fi

CHILDREN=()
while IFS= read -r -d '' f; do
  CHILDREN+=("$f")
done < <(find "$CHILD_DIR" -maxdepth 1 -type f -name '*.yaml' -print0 | sort -z)

if [ "${#CHILDREN[@]}" -eq 0 ]; then
  echo "sync-service-wp: no child YAMLs found under $CHILD_DIR" >&2
  exit 1
fi

if [ "$DRY_RUN" -eq 0 ]; then
  if [ ! -f .env.local ]; then
    echo "sync-service-wp: .env.local missing (need WP_REST_BASE + WP_USER + WP_APP_PASSWORD)" >&2
    exit 1
  fi
  set -a
  # shellcheck disable=SC1091
  . ./.env.local
  set +a
  : "${WP_REST_BASE:?sync-service-wp: WP_REST_BASE missing}"
  : "${WP_USER:?sync-service-wp: WP_USER missing}"
  : "${WP_APP_PASSWORD:?sync-service-wp: WP_APP_PASSWORD missing}"
fi

echo "sync-service-wp: [1/3] validate ($((1 + ${#CHILDREN[@]})) pages)"
bun adapters/wordpress/build-service.mjs "$HUB_YAML" > /dev/null
for child in "${CHILDREN[@]}"; do
  bun adapters/wordpress/build-service.mjs "$child" > /dev/null
done

if [ "$DRY_RUN" -eq 1 ]; then
  echo "sync-service-wp: [dry-run] validation ok, skipping push"
  exit 0
fi

echo "sync-service-wp: [2/3] push hub"
HUB_PAYLOAD="$(bun adapters/wordpress/build-service.mjs "$HUB_YAML")"
HUB_SUMMARY="$(printf '%s' "$HUB_PAYLOAD" | bun adapters/wordpress/content-to-wp-pages.mjs)"
echo "$HUB_SUMMARY"
HUB_ID="$(printf '%s' "$HUB_SUMMARY" | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")"
if ! [[ "$HUB_ID" =~ ^[0-9]+$ ]]; then
  echo "sync-service-wp: hub push did not return an integer id" >&2
  exit 2
fi
echo "sync-service-wp: hub id=$HUB_ID"

echo "sync-service-wp: [3/3] push ${#CHILDREN[@]} children (parent=$HUB_ID)"
for child in "${CHILDREN[@]}"; do
  base="$(basename "$child" .yaml)"
  echo "sync-service-wp:   -> $base"
  CHILD_PAYLOAD="$(bun adapters/wordpress/build-service.mjs "$child" --parent-id="$HUB_ID")"
  CHILD_SUMMARY="$(printf '%s' "$CHILD_PAYLOAD" | bun adapters/wordpress/content-to-wp-pages.mjs)"
  echo "$CHILD_SUMMARY" | python3 -c "import json,sys; d=json.load(sys.stdin); print(f\"      id={d['id']} slug={d['slug']} parent={d['parent']} template={d['template']} backup={d['backup_path']}\")"
done

echo "sync-service-wp: OK"
