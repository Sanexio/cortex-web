#!/usr/bin/env bash
# smoke-seo.sh — deterministische SEO-Assertions via curl + grep
#
# Angelegt: 2026-04-19 (Sprint 2 / S2.3 Batch B — praxis + team + 404)
# Zweck:    Verifiziert, dass die von inc/seo-meta.php gerenderten SEO-Tags
#           tatsächlich im HTTP-Response stehen. Kein DOM/Headless-Chrome —
#           rein text-basiert, damit deterministisch und schnell.
#
# Scope (analog smoke-http.sh): Request-Pfad-Verfügbarkeit + Content-Assertions,
# nicht Design-/Computed-Style. Letzteres macht verify.sh / probe-design.mjs.
#
# Exit-Codes: 0 = alle Checks OK, 1 = mindestens 1 Assertion fehlgeschlagen.

# NOTE: intentionally NOT using `set -o pipefail`. Pairing `grep -q` with
# curl output produces SIGPIPE on the writer when grep closes stdin after
# the first match, and pipefail would wrongly flag that as a failure.

set -eu

BASE_URL="${BASE_URL:-https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local}"

FAIL=0
PASS=0

assert_grep() {
  local url="$1"
  local pattern="$2"
  local label="$3"
  # Fetch once into a buffer so SIGPIPE can't interfere with result.
  local body
  body="$(curl -sk "$url")"
  if printf '%s' "$body" | grep -qE "$pattern"; then
    echo "  ✓ $label"
    PASS=$((PASS+1))
  else
    echo "  ✗ $label  (pattern: $pattern)"
    FAIL=$((FAIL+1))
  fi
}

assert_count() {
  local url="$1"
  local pattern="$2"
  local expected="$3"
  local label="$4"
  local body n
  body="$(curl -sk "$url")"
  n=$(printf '%s' "$body" | grep -cE "$pattern" || true)
  if [ "$n" -eq "$expected" ]; then
    echo "  ✓ $label  (count=$n)"
    PASS=$((PASS+1))
  else
    echo "  ✗ $label  (expected=$expected got=$n, pattern: $pattern)"
    FAIL=$((FAIL+1))
  fi
}

echo "=== smoke-seo.sh — $BASE_URL ==="

# --- /praxis/ ---------------------------------------------------------------
echo ""
echo "--- /praxis/"
URL="$BASE_URL/praxis/"
assert_grep  "$URL" "<title>Internist Frankfurt Westend – Praxis Dr\\. Stracke & Kollegen</title>" "title tag"
assert_grep  "$URL" "<meta name=\"description\" content=\"Internistische Schwerpunktpraxis im Westend" "meta description"
assert_grep  "$URL" "<link rel=\"canonical\" href=\"https://westend-hausarzt\\.com/praxis/\">" "canonical"
assert_grep  "$URL" "<meta property=\"og:title\" content=\"Internist Frankfurt Westend" "og:title"
assert_grep  "$URL" "<meta property=\"og:type\" content=\"website\">" "og:type"
assert_grep  "$URL" "<script type=\"application/ld\\+json\">" "JSON-LD script tag"
assert_grep  "$URL" "\"@type\": \"MedicalClinic\"" "JSON-LD @type MedicalClinic"
assert_grep  "$URL" "\"streetAddress\": \"Grüneburgweg 12\"" "JSON-LD address"
assert_count "$URL" "<h1[^>]*>" 1 "exactly 1 <h1>"
assert_grep  "$URL" "<h1[^>]*>Internistische Schwerpunktpraxis mit hausärztlicher Grundversorgung</h1>" "h1 content"

# --- /team/ -----------------------------------------------------------------
echo ""
echo "--- /team/"
URL="$BASE_URL/team/"
assert_grep  "$URL" "<title>Unser Team – Praxiszentrum Dr\\. Stracke & Kollegen Frankfurt</title>" "title tag"
assert_grep  "$URL" "<meta name=\"description\" content=\"Wofür unser Praxisteam steht" "meta description"
assert_grep  "$URL" "<link rel=\"canonical\" href=\"https://westend-hausarzt\\.com/team/\">" "canonical"
assert_grep  "$URL" "\"@type\": \"AboutPage\"" "JSON-LD @type AboutPage"
assert_count "$URL" "<h1[^>]*>" 1 "exactly 1 <h1>"
assert_grep  "$URL" "<h1[^>]*>Unser Team – Menschen, die für Ihre Gesundheit arbeiten</h1>" "h1 content"

# --- 404 (any non-existent path) --------------------------------------------
echo ""
echo "--- 404 fallback"
URL="$BASE_URL/diese-seite-gibt-es-nicht-smoke-seo/"
assert_grep  "$URL" "<title>Seite nicht gefunden \\(404\\)" "title tag 404"
assert_grep  "$URL" "<meta name=\"robots\" content=\"noindex, nofollow\">" "robots noindex"
assert_grep  "$URL" "<form role=\"search\"" "search form"
assert_grep  "$URL" "class=\"pxz-404-top-links\"" "top-links block"
assert_count "$URL" "<h1[^>]*>" 1 "exactly 1 <h1>"

# --- Summary -----------------------------------------------------------------
echo ""
TOTAL=$((PASS + FAIL))
if [ "$FAIL" -eq 0 ]; then
  echo "==> SMOKE-SEO OK — $PASS/$TOTAL assertions passed"
  exit 0
else
  echo "==> SMOKE-SEO FAIL — $PASS/$TOTAL (failed: $FAIL)"
  exit 1
fi
