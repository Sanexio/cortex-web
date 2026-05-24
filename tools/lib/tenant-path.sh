#!/usr/bin/env bash
# ============================================================
# tenant-path.sh — zentraler Resolver für Tenant-Daten-Pfad
# ============================================================
# Zweck: Cortex-Web wird (Phase 1, ADR 01_CORTEX_WEB_SPLIT) in
# Framework + Tenant-Daten aufgespalten. Adapter dürfen NICHT mehr
# hartcodiert in $REPO/trunk/content/ lesen, sondern müssen über
# diesen Helper den aktiven Tenant-Pfad ermitteln.
#
# Auflösungs-Reihenfolge:
#   1. ENV-Variable CORTEX_TENANT_DIR (explizit gesetzt) — höchste Priorität
#   2. ~/.cortex/tenant-path (lokales Default-File, optional)
#   3. $REPO/trunk/_examples (Fallback für Demo / OSS-Nutzer ohne Tenant)
#
# Konvention für die ENV-Variable:
#   CORTEX_TENANT_DIR=/Users/ssmd/Cortex/projects/Sanexio-Tenant
#   (= Pfad zum Tenant-Repo-Root, NICHT zum trunk/-Unterordner —
#    der Helper hängt /trunk selber an, wenn ein Content-Sub-Pfad
#    angefragt wird.)
#
# Nutzung in Skripten:
#   source "$(dirname "$0")/lib/tenant-path.sh"   # oder relativer Pfad
#   tenant_root=$(tenant_path)                    # → Repo-Root
#   tenant_trunk=$(tenant_path trunk)             # → $tenant/trunk
#   team_dir=$(tenant_path trunk/content/team)    # → $tenant/trunk/content/team
#
#   if tenant_is_examples; then echo "Demo-Modus läuft"; fi
# ============================================================

# Repo-Root des Cortex-Web (zwei Verzeichnisse über lib/)
__cw_repo_root() {
    cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd
}

# Pfad-Default-File (optional, pro Mac)
__cw_path_default_file="$HOME/.cortex/tenant-path"

# Hauptfunktion: gibt den aktiven Tenant-Pfad zurück
# Args: optional Sub-Pfad, der angehängt wird
tenant_path() {
    local subpath="${1:-}"
    local base=""

    if [ -n "${CORTEX_TENANT_DIR:-}" ]; then
        base="$CORTEX_TENANT_DIR"
    elif [ -f "$__cw_path_default_file" ]; then
        base=$(cat "$__cw_path_default_file" | head -1 | tr -d '[:space:]')
    fi

    if [ -z "$base" ] || [ ! -d "$base" ]; then
        # Fallback: Demo-Examples im Repo selbst
        base="$(__cw_repo_root)/trunk/_examples"
    fi

    if [ -n "$subpath" ]; then
        echo "${base%/}/${subpath#/}"
    else
        echo "$base"
    fi
}

# Bool-Check: läuft Skript gerade im Demo-Modus (Fallback)?
# Returns 0 (true), wenn aktiver Pfad = $REPO/trunk/_examples.
tenant_is_examples() {
    local current expected
    current=$(tenant_path)
    expected="$(__cw_repo_root)/trunk/_examples"
    [ "$current" = "$expected" ]
}

# Diagnose-Ausgabe für Adapter-Logs
tenant_describe() {
    if [ -n "${CORTEX_TENANT_DIR:-}" ]; then
        echo "Tenant: $CORTEX_TENANT_DIR (via CORTEX_TENANT_DIR)"
    elif [ -f "$__cw_path_default_file" ]; then
        echo "Tenant: $(cat "$__cw_path_default_file" | head -1) (via $__cw_path_default_file)"
    else
        echo "Tenant: trunk/_examples (Demo-Fallback)"
    fi
}
