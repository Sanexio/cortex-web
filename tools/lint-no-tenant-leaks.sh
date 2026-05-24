#!/usr/bin/env bash
# ============================================================
# lint-no-tenant-leaks.sh — Audit auf Tenant-Spuren im Framework-Code
# ============================================================
# Zweck: CW-009 / ADR 01_CORTEX_WEB_SPLIT verbietet hartcodierte
# Tenant-Referenzen (Stracke, westend-hausarzt, sanexio.eu, …) in den
# Framework-Pfaden adapters/, tools/, _config/, _rules/, specs/.
#
# Heute (Welle 1.1) ist das ein DIAGNOSE-Lauf — es WIRD Treffer geben,
# weil die Migration noch nicht durch ist. Output zeigt, welche Dateien
# in Phase 1.3 angefasst werden müssen.
#
# Ab Phase 1.5 wird dieser Linter Teil der Pre-Commit-Pipeline und
# exit 1 bei Treffern.
#
# Nutzung:
#   bash tools/lint-no-tenant-leaks.sh           # Diagnose (exit 0)
#   bash tools/lint-no-tenant-leaks.sh --strict  # Pre-Commit-Modus (exit 1 bei Treffern)
# ============================================================

set -uo pipefail

cd "$(dirname "$0")/.." || exit 1
ROOT="$(pwd)"

STRICT=0
[ "${1:-}" = "--strict" ] && STRICT=1

# Pfade, die Framework sein SOLLTEN (keine Tenant-Daten)
FRAMEWORK_PATHS=(
    "adapters"
    "tools"
    "_config"
    "_rules"
    "specs"
    "_integration-slots"
    "trunk/schema"
)

# Pfade, die Tenant sein DÜRFEN (hier wird nicht gemeckert)
# Werden vom Linter ausgespart.
TENANT_PATHS_EXCLUDE=(
    "trunk/content"
    "trunk/media"
    "trunk/design"
    "trunk/_examples"
    "sites"
    "_archive"
    "_media-source"
    "node_modules"
    ".git"
)

# Tenant-Identifier (Indikatoren für Stracke-Daten)
# Case-insensitive grep wird unten verwendet.
TENANT_PATTERNS=(
    "stracke"
    "westend-hausarzt"
    "gpmedicalcenterwestend"
    "praxiszentrum"
    "juvantis.myshopify"
    "sanexio.eu"
    "leerbachstr"
    "frankfurt am main"
)

# Pattern-Liste als grep-egrep aufbauen
EGREP=""
for p in "${TENANT_PATTERNS[@]}"; do
    [ -z "$EGREP" ] && EGREP="$p" || EGREP="$EGREP|$p"
done

# Exclude-Liste für find
FIND_EXCLUDE=""
for p in "${TENANT_PATHS_EXCLUDE[@]}"; do
    FIND_EXCLUDE="$FIND_EXCLUDE -path ./$p -prune -o"
done

echo "=== lint-no-tenant-leaks ==="
echo "Repo: $ROOT"
echo "Modus: $([ $STRICT -eq 1 ] && echo strict || echo diagnose)"
echo

TOTAL_HITS=0
TOTAL_FILES=0

for fp in "${FRAMEWORK_PATHS[@]}"; do
    [ -d "$ROOT/$fp" ] || continue

    # find Files unter Framework-Pfad, grep nach Patterns
    hits=$(grep -rilE "$EGREP" "$ROOT/$fp" 2>/dev/null | grep -v "$ROOT/$fp/.*node_modules" || true)

    if [ -z "$hits" ]; then
        printf "  ✓ %-25s clean\n" "$fp/"
        continue
    fi

    file_count=$(echo "$hits" | wc -l | tr -d ' ')
    TOTAL_FILES=$((TOTAL_FILES + file_count))
    printf "  ✗ %-25s %d Datei(en) mit Tenant-Spuren\n" "$fp/" "$file_count"
    echo "$hits" | sed "s|^$ROOT/|      |"
    echo
done

echo
echo "=== Zusammenfassung ==="
echo "Tenant-Spuren in $TOTAL_FILES Framework-Datei(en) gefunden."

if [ "$STRICT" -eq 1 ] && [ "$TOTAL_FILES" -gt 0 ]; then
    echo
    echo "FAIL: --strict-Modus → Pre-Commit blockt."
    echo "Fix: Tenant-Spuren entfernen oder Datei nach Tenant-Pfad verschieben."
    exit 1
fi

if [ "$TOTAL_FILES" -gt 0 ]; then
    echo
    echo "Hinweis: Diagnose-Modus — exit 0."
    echo "Diese Treffer sind Migrations-Backlog für Welle 1.3 (siehe"
    echo "Nexus/specs/cortex-platform/01_CORTEX_WEB_SPLIT.md)."
fi

exit 0
