#!/bin/bash
# Shopify Theme Sync Script
# Pusht geaenderte Theme-Dateien direkt zum Shopify Store
#
# Theme-Klon liegt seit Cortex-Web Phase 5 (2026-04-19) nicht mehr neben
# diesem Skript, sondern bleibt physisch bei Juvantis/juvantis-web/theme/.
# Siehe SHOPIFY_THEME_POINTER.md in diesem Ordner.
#
# Verwendung:
#   ./shopify-sync.sh                    # Alle geaenderten Dateien pushen
#   ./shopify-sync.sh sections/file.liquid  # Einzelne Datei pushen
#   ./shopify-sync.sh --pull             # Vom Store pullen

set -e

# Absoluter Pfad auf den Theme-Klon (E2a aus Phase-5-Spec).
# $HOME bleibt geraete-portabel (vgl. Nexus/.config/devices.json).
THEME_DIR="$HOME/Cortex/projects/Juvantis/juvantis-web/theme"
STORE="medzpoint"
THEME_ID="181128757515"

# Node.js laden
source ~/.nvm/nvm.sh 2>/dev/null || true

cd "$THEME_DIR"

if [ "$1" = "--pull" ]; then
    echo "[SYNC] Pulling theme from Shopify..."
    npx shopify theme pull --store "$STORE" --theme "$THEME_ID" --path "$THEME_DIR"
    echo "[SYNC] Pull complete."
    exit 0
fi

if [ -n "$1" ]; then
    # Einzelne Datei(en) pushen
    echo "[SYNC] Pushing: $@"
    npx shopify theme push --store "$STORE" --theme "$THEME_ID" --only "$@" --allow-live
else
    # Alle geaenderten Dateien per git diff finden und pushen
    CHANGED=$(git diff --name-only 2>/dev/null || true)
    UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null || true)
    # Whitelist of theme file extensions. IMPORTANT: include binary assets
    # like .glb / .png / .jpg / .webp / .mp4 — Shopify CLI handles them fine,
    # but if they're missing here they will be silently skipped.
    ALL_FILES=$(echo -e "$CHANGED\n$UNTRACKED" | grep -E '\.(liquid|json|css|js|glb|gltf|png|jpe?g|webp|svg|mp4|webm|woff2?|ttf|otf)$' | sort -u)

    if [ -z "$ALL_FILES" ]; then
        echo "[SYNC] Keine geaenderten Theme-Dateien gefunden."
        exit 0
    fi

    echo "[SYNC] Geaenderte Dateien:"
    echo "$ALL_FILES"
    echo ""

    ONLY_ARGS=$(echo "$ALL_FILES" | tr '\n' ' ')
    echo "[SYNC] Pushing to Shopify..."
    npx shopify theme push --store "$STORE" --theme "$THEME_ID" --only $ONLY_ARGS --allow-live
fi

echo "[SYNC] Done. Live auf: https://sanexio.eu/"
