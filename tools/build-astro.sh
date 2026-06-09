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
#   bash tools/build-astro.sh [--sync-only] [--build] [--dry-run] [--out <pfad>]
#
# Phase 1+2 (2026-05-23): nur Sync + Astro-Build. Kein GitHub-Pages-Push —
# das passiert separat per gh-pages-Action im Astro-Repo.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

DO_BUILD=0
DRY_RUN=0
OUT_PATH=""

usage() {
  cat <<'EOF'
Usage: bash tools/build-astro.sh [--sync-only] [--build] [--dry-run] [--out <path>]

Options:
  --help       Show this help and exit.
  --sync-only  Run only the Trunk -> Astro data sync. This is the default.
  --build      Also run bun install && bun run build if the Astro target is a real project.
  --dry-run    Validate/render adapter output without writing files or running the Astro build.
  --out <path> Write adapter output to this path instead of the configured Astro repo target.

No browser is opened by this tool.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --sync-only)
      DO_BUILD=0
      shift
      ;;
    --build)
      DO_BUILD=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --out)
      [ "${2:-}" ] || { echo "ERROR: --out requires a path" >&2; exit 2; }
      OUT_PATH="$2"
      shift 2
      ;;
    --out=*)
      OUT_PATH="${1#--out=}"
      shift
      ;;
    *)
      echo "ERROR: unexpected argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

echo "=== 1. Trunk → Astro-Data-Sync ==="
ADAPTER_ARGS=()
if [ "$DRY_RUN" -eq 1 ]; then ADAPTER_ARGS+=(--dry-run); fi
if [ -n "$OUT_PATH" ]; then ADAPTER_ARGS+=(--out "$OUT_PATH"); fi
bun adapters/astro/build.mjs "${ADAPTER_ARGS[@]}"

if [ "$DO_BUILD" -eq 0 ]; then
  echo ""
  echo "=== build-astro.sh done ==="
  echo "Adapter-Sync: erledigt"
  echo "Astro-Build: übersprungen (Default --sync-only; nutze --build für Astro-Build)"
  exit 0
fi

ASTRO_REPO_REL="$(bun tools/lib/tenant-config.mjs astro.repo_path)"
ASTRO_REPO="$REPO_ROOT/$ASTRO_REPO_REL"
if [ ! -d "$ASTRO_REPO" ]; then
  echo "ERROR: Astro-Build angefordert, aber Astro-Repo nicht gefunden: $ASTRO_REPO (tenant.config.json astro.repo_path=$ASTRO_REPO_REL)" >&2
  exit 1
fi

echo ""
echo "=== 2. Astro-Build im Astro-Repo ($ASTRO_REPO_REL) ==="
cd "$ASTRO_REPO"

if [ ! -f "package.json" ]; then
  echo "ERROR: Astro-Build angefordert, aber package.json fehlt in $ASTRO_REPO." >&2
  echo "       Prüfe tenant.config.json astro.repo_path oder nutze den Default --sync-only." >&2
  exit 1
fi

if [ "$DRY_RUN" -eq 1 ]; then
  echo "DRY-RUN: würde ausführen: bun install --silent && bun run build"
  exit 0
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
