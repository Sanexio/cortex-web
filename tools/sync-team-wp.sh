#!/usr/bin/env bash
# Cortex-Web — WordPress Praxis-Theme Team-Data Sync (N-1, Pattern B reverse).
# Builds inc/data/team.json from trunk/content/team/*.yaml and writes it into
# the Local-WP theme (with CW-008-compliant backup before overwrite).
#
# Usage:
#   bash tools/sync-team-wp.sh
#   bash tools/sync-team-wp.sh trunk/content/team/   # optional arg, accepted and ignored
#   THEME_PATH=<abs> bash tools/sync-team-wp.sh      # override theme root
#
# Exit codes:
#   0 success
#   1 setup / config error
#   2 backup fail
#   3 write fail
#
# N-1 Session 29, 2026-04-23.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Positional argument is accepted for symmetry with sync-template-shopify.sh and
# for cw-transfer's argument convention (folder path), but intentionally unused:
# the team build always consumes all YAMLs in trunk/content/team/.
ARG_UNUSED="${1:-trunk/content/team/}"

echo "sync-team-wp: [1/2] build  (all trunk/content/team/*.yaml)"
PAYLOAD="$(bun adapters/wordpress/build-team.mjs)"

echo "sync-team-wp: [2/2] push   (theme: ${THEME_PATH:-<default from THEME_POINTER>})"
printf '%s' "$PAYLOAD" | bun adapters/wordpress/team-to-wp.mjs

echo "sync-team-wp: OK"
