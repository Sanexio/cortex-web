#!/usr/bin/env bash
# tools/pre-launch-verify.sh — Welle J Verify-Suite
#
# Prüft auf Staging (.de) bzw. Live (.com) ob alle Pre-Launch-Hardening-Findings
# geschlossen sind und legitime Routes weiter funktionieren.
#
# Usage:
#   ./tools/pre-launch-verify.sh                    # Default: .de mit Basic-Auth
#   ./tools/pre-launch-verify.sh --target=de        # explizit Staging
#   ./tools/pre-launch-verify.sh --target=com       # nach Welle K (Live, ohne Auth)
#
# Exit 0 bei Pass, Exit 1 bei Fail.

set -u

TARGET="${1:-de}"
TARGET="${TARGET#--target=}"

case "$TARGET" in
  de)
    BASE="https://westend-hausarzt.de"
    AUTH="-u praxis:Sanexio"
    ;;
  com)
    BASE="https://westend-hausarzt.com"
    AUTH=""
    ;;
  *)
    echo "Unknown target: $TARGET (use 'de' or 'com')"
    exit 1
    ;;
esac

CURL=/usr/bin/curl

EXPECT_DENY=(
  /.htaccess
  /error_log
  /wp-content/themes/praxiszentrum/.git/config
  /wp-content/themes/praxiszentrum/.git/HEAD
  /wp-content/themes/praxiszentrum/CHANGELOG.md
  /wp-content/themes/praxiszentrum/README.md
  /xmlrpc.php
  /wp-config.php
  /.env
  /wp-content/debug.log
)

EXPECT_OK=(
  /
  /team/
  /labor/
  /untersuchungen/
  /karriere/
  /sprechstunden/
  /standorte/
  /kontakt/
  /wp-content/themes/praxiszentrum/style.css
  /wp-content/themes/praxiszentrum/assets/logo.svg
  /wp-content/themes/praxiszentrum/assets/logo-sanexio.svg
)

fails=0
total=0

echo "=== Pre-Launch Verify ($TARGET → $BASE) ==="
echo ""
echo "EXPECT denied (403/404):"
for path in "${EXPECT_DENY[@]}"; do
  total=$((total+1))
  code=$($CURL -skL $AUTH -o /dev/null -w "%{http_code}" "${BASE}${path}")
  if [ "$code" = "403" ] || [ "$code" = "404" ]; then
    printf "  ✅  %s  %s\n" "$code" "$path"
  else
    printf "  ❌  %s  %s  (expected 403 or 404)\n" "$code" "$path"
    fails=$((fails+1))
  fi
done

echo ""
echo "EXPECT 200 (legitime Routes):"
for path in "${EXPECT_OK[@]}"; do
  total=$((total+1))
  code=$($CURL -skL $AUTH -o /dev/null -w "%{http_code}" "${BASE}${path}")
  if [ "$code" = "200" ]; then
    printf "  ✅  %s  %s\n" "$code" "$path"
  else
    printf "  ❌  %s  %s  (expected 200)\n" "$code" "$path"
    fails=$((fails+1))
  fi
done

echo ""
echo "=== Result: $((total - fails))/$total pass ==="

if [ "$fails" -gt 0 ]; then
  echo "FAIL — $fails check(s) failed"
  exit 1
else
  echo "PASS — alle Checks grün"
  exit 0
fi
