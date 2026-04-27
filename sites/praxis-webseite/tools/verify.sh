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

# === §1b Split-Location-Check CSS-Schichten (S2.0e / S2.0b AK-10) ===
grep_split_css() {
  echo ""
  echo "=== §1b Split-Location-Check CSS-Schichten (S2.0b-AK-10) ==="
  local components="$THEME_DIR/assets/css/components.css"
  local homepage="$THEME_DIR/assets/css/homepage.css"
  local karriere="$THEME_DIR/assets/css/karriere.css"
  local tmp_c tmp_h tmp_k
  tmp_c=$(mktemp); tmp_h=$(mktemp); tmp_k=$(mktemp)
  grep -oE '^\.pxz-[A-Za-z0-9_-]+' "$components" 2>/dev/null | sort -u > "$tmp_c"
  grep -oE '^\.pxz-[A-Za-z0-9_-]+' "$homepage"   2>/dev/null | sort -u > "$tmp_h"
  grep -oE '^\.pxz-[A-Za-z0-9_-]+' "$karriere"   2>/dev/null | sort -u > "$tmp_k"

  local pair_fail=0
  # Paare als Parallel-Arrays (bash kennt keine Array-of-Arrays)
  local names=("components:homepage" "components:karriere" "homepage:karriere")
  local files_a=("$tmp_c" "$tmp_c" "$tmp_h")
  local files_b=("$tmp_h" "$tmp_k" "$tmp_k")
  local i
  for i in 0 1 2; do
    local name="${names[$i]}"
    local a="${files_a[$i]}"
    local b="${files_b[$i]}"
    local dupes
    dupes=$(comm -12 "$a" "$b")
    if [ -n "$dupes" ]; then
      echo "  ✗ Doppelte Basis-Selektoren in [$name]:"
      echo "$dupes" | sed 's/^/    /'
      pair_fail=$((pair_fail + 1))
    else
      echo "  ✓ Keine doppelten Basis-Selektoren in [$name]"
    fi
  done
  rm -f "$tmp_c" "$tmp_h" "$tmp_k"
  [ "$pair_fail" -gt 0 ] && FAIL=$((FAIL + 1))
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

# === §3b Component-Probe (S2.0e / S2.0b AK-8) ===
# Zweistufige Probe fuer Schicht 3 (components.css):
#   Stufe A — Datei-Korrektheit: grep auf 8 erwartete Komponenten-Regeln
#             in der CSS-Datei selbst (pinnt IST-Werte aus Theme-Commit 8f596f7).
#   Stufe B — Enqueue-Korrektheit: curl auf Home-URL + grep auf <link>-Tag,
#             das components.css mit korrekter Version-Query referenziert.
# Rewrite-Rule-unabhaengig, kein Puppeteer, keine Probe-Page noetig.
component_probe() {
  echo ""
  echo "=== §3b Component-Probe (S2.0b-AK-8) ==="
  local components="$THEME_DIR/assets/css/components.css"
  local stage_fail=0

  # --- Stufe A: Datei-Regeln ---
  echo "  --- Stufe A: components.css Datei-Korrektheit ---"
  if [ ! -f "$components" ]; then
    echo "  ✗ $components not found"
    stage_fail=$((stage_fail + 1))
  else
    # 8 Assertions — Format (Beschreibung|Startanker-Regex|Inhalts-Regex|Kontext-Lines).
    # Zweistufig: Startanker findet Regel-Kopf (Selektor-Zeile), dann wird in N
    # Folgezeilen der Inhalts-Regex gesucht. Funktioniert fuer single-line- UND
    # multi-line-CSS-Regeln.
    local assertions=(
      "pxz-container max-width:1600px (S39-it1)|^\.pxz-container[[:space:]]*\{|max-width:[[:space:]]*1600px|1"
      "pxz-btn border-radius via token (S40)|^\.pxz-btn[[:space:]]*\{|border-radius:[[:space:]]*var\(--pxz-radius-btn\)|12"
      "pxz-eyebrow text-transform:uppercase|^\.pxz-eyebrow[[:space:]]|text-transform:[[:space:]]*uppercase|1"
      "pxz-hero background:#fff|^\.pxz-hero[[:space:]]*\{|background:[[:space:]]*#fff|1"
      "pxz-display uses T1 token (S40)|^\.pxz-display[[:space:]]|font-size:[[:space:]]*var\(--pxz-t1-size\)|1"
      "pxz-title-1 uses T2 token (S40)|^\.pxz-title-1[[:space:]]|font-size:[[:space:]]*var\(--pxz-t2-size\)|1"
      "pxz-headline uses T5 token (S40)|^\.pxz-headline[[:space:]]|font-size:[[:space:]]*var\(--pxz-t5-size\)|1"
      "pxz-body uses T6 token (S40)|^\.pxz-body[[:space:]]|font-size:[[:space:]]*var\(--pxz-t6-size\)|1"
    )
    local a
    for a in "${assertions[@]}"; do
      local desc head content ctx
      IFS='|' read -r desc head content ctx <<< "$a"
      # grep findet den Selektor-Kopf mit N Folgezeilen, dann im Ergebnis
      # nach Inhalts-Regex suchen.
      if grep -E "$head" -A "$ctx" "$components" 2>/dev/null | grep -qE "$content"; then
        echo "  ✓ $desc"
      else
        echo "  ✗ $desc  (Regel fehlt/abweichend in components.css)"
        stage_fail=$((stage_fail + 1))
      fi
    done
  fi

  # --- Stufe B: Enqueue via Home-HTML ---
  echo "  --- Stufe B: components.css Enqueue-Korrektheit ---"
  local home_html
  home_html=$(curl -sk "$URL" 2>/dev/null)
  if [ -z "$home_html" ]; then
    echo "  ✗ Home-URL $URL nicht erreichbar"
    stage_fail=$((stage_fail + 1))
  else
    # Link-Tag zu components.css muss existieren mit pxz-components-ID
    if echo "$home_html" | grep -qE "id=['\"]pxz-components-css['\"]"; then
      echo "  ✓ <link id='pxz-components-css'> im Home-HTML vorhanden"
    else
      echo "  ✗ <link id='pxz-components-css'> fehlt im Home-HTML"
      stage_fail=$((stage_fail + 1))
    fi
    # URL auf components.css in irgendeinem <link> Tag
    if echo "$home_html" | grep -qE "assets/css/components\.css\?ver="; then
      echo "  ✓ href enthaelt assets/css/components.css?ver=..."
    else
      echo "  ✗ href fuer components.css mit ?ver=-Query nicht gefunden"
      stage_fail=$((stage_fail + 1))
    fi
  fi

  if [ "$stage_fail" -gt 0 ]; then
    FAIL=$((FAIL + 1))
    echo "  ✗ Component-Probe FAILED ($stage_fail Assertion(s) fehlgeschlagen)"
  else
    echo "  ✓ Component-Probe OK (Stufe A: 8 Regeln, Stufe B: Enqueue)"
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

# === §5 HWG-Konformität (S49 — CW-005) ===
# Praxis-Webseite darf keine Preise enthalten (HWG, Berufsordnung).
# Strippt <style>/<script>/HTML-Tags, sucht dann auf reinem Text nach Preis-Patterns.
hwg_check() {
  echo ""
  echo "=== §5 HWG-Probe (CW-005, keine Preise) ==="
  local base="${PXZ_URL:-https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local}"
  local pages=("/" "/diagnostik/" "/labor/" "/leistungen/" "/check-ups/" "/basic-check/" "/sonographie/" "/echokardiographie/" "/carotis-duplex/" "/sonographie/schilddruese/" "/sonographie/beingefaesse/" "/belastungs-ekg/" "/lungenfunktion/" "/tumorscreening/")
  local total_hits=0
  for url in "${pages[@]}"; do
    local body
    body=$(curl -sk "$base$url" 2>/dev/null | python3 -c "
import sys, re
h = sys.stdin.read()
h = re.sub(r'<style[^>]*>.*?</style>', '', h, flags=re.S|re.I)
h = re.sub(r'<script[^>]*>.*?</script>', '', h, flags=re.S|re.I)
print(re.sub(r'<[^>]+>', ' ', h))
" 2>/dev/null)
    local hits
    hits=$(echo "$body" | grep -ciE '(\b[0-9]+,[0-9]{2} ?€|\b[0-9]+ ?EUR\b|\bab [0-9]+,[0-9]{2}|\bPreis:|\bkostet [0-9])' || true)
    if [ "$hits" -gt 0 ]; then
      echo "  ✗ $url: $hits Treffer"
      echo "$body" | grep -iE '(\b[0-9]+,[0-9]{2} ?€|\b[0-9]+ ?EUR\b|\bab [0-9]+,[0-9]{2}|\bPreis:|\bkostet [0-9])' | head -2 | sed 's/^/      /'
      total_hits=$((total_hits + hits))
    else
      echo "  ✓ $url HWG-konform"
    fi
  done
  if [ "$total_hits" -gt 0 ]; then
    FAIL=$((FAIL + 1))
  fi
}

case "$MODE" in
  --grep-split)      grep_split ;;
  --grep-split-css)  grep_split_css ;;
  --reset-scope)     reset_scope ;;
  --screenshots)     take_screenshots ;;
  --probe)           probe ;;
  --component-probe) component_probe ;;
  --alignment)       alignment ;;
  --hwg)             hwg_check ;;
  --all|"")          grep_split; grep_split_css; reset_scope; take_screenshots; probe; component_probe; alignment; hwg_check ;;
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
