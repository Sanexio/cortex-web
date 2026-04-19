#!/usr/bin/env bash
# verify.sh — Pre-Flight-Runner für praxis-redesign.
# Führt die Pre-Flight-Checkliste §1 (Split-Check) und §3 (Probe) aus,
# nimmt Screenshots auf und prüft Computed Styles.
#
# Usage:
#   tools/verify.sh                  # run all
#   tools/verify.sh --grep-split     # only §1
#   tools/verify.sh --probe          # only §3
#   tools/verify.sh --screenshots    # only screenshots
#
# Reference: _rules/PRE_FLIGHT_CHECKLIST.md

set -u

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
THEME_DIR="/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum"
URL="https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/"
OUT_DIR="$PROJECT_DIR/screenshots/claude"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

MODE="${1:---all}"
FAIL=0

# === §1 Split-Location-Check (PXZ-E-001) ===
grep_split() {
  echo ""
  echo "=== §1 Split-Location-Check (PXZ-E-001) ==="
  local css_file="$THEME_DIR/style.css"
  local tpl_file="$THEME_DIR/template-homepage.php"
  # Find selectors matching body.page-template-template-homepage in BOTH files
  local css_rules
  local tpl_rules
  css_rules=$(grep -oE "body\.page-template-template-homepage[^{]*" "$css_file" 2>/dev/null | sort -u)
  tpl_rules=$(grep -oE "body\.page-template-template-homepage[^{]*" "$tpl_file" 2>/dev/null | sort -u)
  local dupes
  dupes=$(comm -12 <(echo "$css_rules") <(echo "$tpl_rules") 2>/dev/null)
  if [ -n "$dupes" ]; then
    echo "  ✗ Duplicate page-template selectors found in BOTH style.css and template-homepage.php:"
    echo "$dupes" | sed 's/^/    /'
    echo "    → Consolidate into ONE file. See _rules/FEHLERPROTOKOLL.md#PXZ-E-001"
    FAIL=$((FAIL + 1))
  else
    echo "  ✓ No duplicate selectors between style.css and template-homepage.php"
  fi
}

# === §2 Reset-Scope-Check (PXZ-E-002) ===
reset_scope() {
  echo ""
  echo "=== §2 Reset-Scope-Check (PXZ-E-002) ==="
  # Find generic tag selectors (article/section/div) standalone with !important padding:0
  local bad
  bad=$(grep -rnE "(^|[[:space:],{])(article|section|div)\s*\{[^}]*padding\s*:\s*0[^}]*!important" \
        "$THEME_DIR/style.css" "$THEME_DIR/template-homepage.php" 2>/dev/null || true)
  if [ -n "$bad" ]; then
    echo "  ✗ Generic tag selector with !important padding:0 found:"
    echo "$bad" | sed 's/^/    /'
    FAIL=$((FAIL + 1))
  else
    echo "  ✓ No generic tag reset selectors detected"
  fi
}

# === Screenshots ===
take_screenshots() {
  echo ""
  echo "=== Screenshots (Desktop 1440 + Mobile 430) ==="
  mkdir -p "$OUT_DIR"
  local stamp
  stamp=$(date +%Y-%m-%d_%H%M)
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --ignore-certificate-errors --allow-insecure-localhost \
    --window-size=1440,11000 \
    --virtual-time-budget=10000 \
    --run-all-compositor-stages-before-draw \
    --screenshot="$OUT_DIR/${stamp}_verify_desktop.png" \
    "$URL?v=$(date +%s)" 2>/dev/null | tail -1
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --ignore-certificate-errors --allow-insecure-localhost \
    --window-size=430,17000 \
    --virtual-time-budget=10000 \
    --run-all-compositor-stages-before-draw \
    --screenshot="$OUT_DIR/${stamp}_verify_mobile.png" \
    "$URL?v=$(date +%s)" 2>/dev/null | tail -1
  echo "  ✓ Saved to $OUT_DIR/${stamp}_verify_{desktop,mobile}.png"
}

# === §3 Computed-Style-Probe ===
probe() {
  echo ""
  echo "=== §3 Computed-Style-Probe (PXZ-E-004) ==="
  cd "$PROJECT_DIR" || exit 1
  if bun run "$SCRIPT_DIR/probe-design.mjs"; then
    echo "  ✓ All computed styles match"
  else
    echo "  ✗ Computed-Style-Probe FAILED"
    FAIL=$((FAIL + 1))
  fi
}

# === §4 Alignment-Probe (PXZ-E-008) ===
alignment() {
  echo ""
  echo "=== §4 Alignment-Probe (PXZ-E-008) ==="
  cd "$PROJECT_DIR" || exit 1
  if bun run "$SCRIPT_DIR/alignment-probe.mjs"; then
    echo "  ✓ All Showpiece-Elemente zentriert"
  else
    echo "  ✗ Alignment-Probe FAILED"
    FAIL=$((FAIL + 1))
  fi
}

case "$MODE" in
  --grep-split)   grep_split ;;
  --reset-scope)  reset_scope ;;
  --screenshots)  take_screenshots ;;
  --probe)        probe ;;
  --alignment)    alignment ;;
  --all|"")       grep_split; reset_scope; take_screenshots; probe; alignment ;;
  *) echo "Unknown mode: $MODE"; exit 2 ;;
esac

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "==> VERIFY OK"
  exit 0
else
  echo "==> VERIFY FAILED ($FAIL check(s))"
  exit 1
fi
