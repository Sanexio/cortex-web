#!/usr/bin/env bash
# Cortex-Web — Astro-Master-Build (tenant-agnostisch).
#
# Orchestriert:
#   1. Trunk → Astro-Data-Sync via adapters/astro/build.mjs
#   2. Astro-Build im Tenant-Astro-Repo (bun run build)
#
# Der Astro-Repo-Pfad wird aus tenant.config.json → astro.repo_path
# gelesen (relativ zum Cortex-Web-Framework-Root). Vor Welle 15 war
# "sites/sanexio-github-io/repo" hartcodiert.
#
# Aufruf:
#   bash tools/build-astro.sh
#
# Phase 1+2 (2026-05-23): nur Sync + Astro-Build. Kein GitHub-Pages-Push —
# das passiert separat per gh-pages-Action im Astro-Repo.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "=== 1. Trunk → Astro-Data-Sync ==="
bun adapters/astro/build.mjs

ASTRO_REPO_REL="$(bun tools/lib/tenant-config.mjs astro.repo_path)"
ASTRO_REPO="$REPO_ROOT/$ASTRO_REPO_REL"
if [ ! -d "$ASTRO_REPO" ]; then
  echo "ERROR: Astro-Repo nicht gefunden unter $ASTRO_REPO (tenant.config.json astro.repo_path=$ASTRO_REPO_REL)" >&2
  exit 1
fi

echo ""
echo "=== 2. Astro-Build im Astro-Repo ($ASTRO_REPO_REL) ==="
cd "$ASTRO_REPO"

if [ ! -f "package.json" ]; then
  echo "ERROR: package.json fehlt im Astro-Repo" >&2
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
echo "=== build-astro.sh done ==="
echo "Adapter-Output: src/data/team.ts"
echo "Astro-Build:    $ASTRO_REPO_REL/dist/"
echo "Deploy:         im Astro-Repo manuell pushen (GitHub-Pages-Action greift)"
