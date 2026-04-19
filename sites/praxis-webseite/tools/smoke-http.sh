#!/usr/bin/env bash
# smoke-http.sh — breiter HTTP-Regressions-Smoke nach Infrastruktur-Eingriffen
#
# Angelegt: 2026-04-19 (Sprint 2 / S2.0f Santapress-Entfernung)
# Zweck:    Verifiziert, dass eine Infrastruktur-Änderung (z.B. Plugin-Entfernung,
#           Rewrite-Rule-Regenerierung) keine 5xx-Regressionen erzeugt.
#
# Fail-Regel (F5b-modifiziert):
#   - 2xx, 3xx, 4xx sind OK.
#   - Nur 5xx-Codes sind Fail — das ist das einzige echte Regressions-Signal
#     einer fehlenden Plugin-Abhängigkeit oder eines PHP-Fatal-Errors.
#   - 404 auf Skelett-Template-Slugs ist erwartet (Pages noch nicht angelegt).
#
# Exit-Codes: 0 = alle Checks OK, 1 = mindestens 1× 5xx.
#
# Architekten-Entscheidung S2.0f-DEC-2: NICHT in verify.sh integriert.
# Scope-Disziplin — verify.sh prüft Code-/Design-Korrektheit, smoke-http.sh
# prüft Request-Pfad-Verfügbarkeit. Zwei Dimensionen, zwei Tools.

set -euo pipefail

BASE_URL="${BASE_URL:-https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local}"

# Page-Registry-Pages (tools/page-registry.mjs)
REGISTRY_PATHS=(
  "/"
  "/karriere/"
)

# WP-Core-Routen (unabhängige Code-Pfade für breiteren Regressions-Schutz)
CORE_PATHS=(
  "/wp-login.php"
  "/feed/"
  "/?s=test"
)

PATHS=("${REGISTRY_PATHS[@]}" "${CORE_PATHS[@]}")

echo "=== smoke-http.sh — ${#PATHS[@]} URLs on $BASE_URL ==="
FAIL=0
for path in "${PATHS[@]}"; do
  code=$(curl -sk -o /dev/null -w "%{http_code}" "${BASE_URL}${path}" || echo "000")
  case "$code" in
    2*) echo "  ✓ ${code}  ${path}" ;;
    3*) echo "  ✓ ${code}  ${path} (redirect)" ;;
    4*) echo "  ✓ ${code}  ${path} (client error — expected for unbuilt slugs)" ;;
    5*) echo "  ✗ ${code}  ${path} (SERVER ERROR)" ; FAIL=1 ;;
    *)  echo "  ? ${code}  ${path} (unexpected or connection failure)" ; FAIL=1 ;;
  esac
done

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "==> SMOKE OK — no 5xx across ${#PATHS[@]} URLs"
  exit 0
else
  echo "==> SMOKE FAIL — 5xx detected"
  exit 1
fi
