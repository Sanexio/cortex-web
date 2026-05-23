#!/usr/bin/env bash
# Cortex-Web — Sanexio Master-Build.
#
# Orchestriert:
#   1. Trunk → Sanexio-Astro-Data-Sync via adapters/astro/build.mjs
#   2. Astro-Build im Sanexio-Repo (bun run build)
#
# Aufruf:
#   bash tools/build-sanexio.sh
#
# Phase 1+2 (2026-05-23): nur Sync + Astro-Build. Kein GitHub-Pages-Push —
# das passiert separat per gh-pages-Action im Sanexio-Repo.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "=== 1. Trunk → Sanexio-Data-Sync ==="
bun adapters/astro/build.mjs

SANEXIO_REPO="$REPO_ROOT/sites/sanexio-github-io/repo"
if [ ! -d "$SANEXIO_REPO" ]; then
  echo "ERROR: Sanexio-Repo nicht gefunden unter $SANEXIO_REPO" >&2
  exit 1
fi

echo ""
echo "=== 2. Astro-Build im Sanexio-Repo ==="
cd "$SANEXIO_REPO"

if [ ! -f "package.json" ]; then
  echo "ERROR: package.json fehlt im Sanexio-Repo" >&2
  exit 1
fi

bun install --silent
bun run build

echo ""
echo "=== 3. Build-Output ==="
if [ -d "dist" ]; then
  echo "  Astro-dist/-Files: $(find dist -type f | wc -l | tr -d ' ')"
fi

echo ""
echo "=== build-sanexio.sh done ==="
echo "Adapter-Output: src/data/team.ts"
echo "Astro-Build:    sites/sanexio-github-io/repo/dist/"
echo "Deploy:         im Sanexio-Repo manuell pushen (GitHub-Pages-Action greift)"
