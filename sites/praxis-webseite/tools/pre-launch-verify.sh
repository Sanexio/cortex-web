#!/usr/bin/env bash
# tools/pre-launch-verify.sh — Welle J Verify-Suite
#
# Prüft auf Staging (.de) bzw. Live (.com) ob alle Pre-Launch-Hardening-Findings
# geschlossen sind und legitime Routes weiter funktionieren.
#
# ⚠️ WARN: DF-Hoster (LFD/CSF auf Account-Ebene) sperrt bei Recon-Pattern-
#   Scans (.env, debug.log, .git, wp-config). Lehre 2026-05-09: voller Lauf
#   gegen .de hat unsere IP geblockt — Daniel/DF: „Whitelisting nicht
#   möglich." Daher: Throttling 2 s zwischen Requests, klarer User-Agent,
#   und --target=com erfordert explizite Bestätigung via Env-Var.
#
# Usage:
#   ./tools/pre-launch-verify.sh                    # Default: .de mit Basic-Auth
#   ./tools/pre-launch-verify.sh --target=de        # explizit Staging
#   PXZ_VERIFY_COM_CONFIRMED=yes ./tools/pre-launch-verify.sh --target=com
#
# Exit 0 bei Pass, Exit 1 bei Fail, Exit 2 bei .com ohne Bestätigung.

set -u

TARGET="${1:-de}"
TARGET="${TARGET#--target=}"
THROTTLE_SECONDS="${PXZ_VERIFY_THROTTLE:-2}"
USER_AGENT="Mozilla/5.0 (cortex-verify; contact:stracke.md@me.com)"

case "$TARGET" in
  de)
    BASE="https://westend-hausarzt.de"
    AUTH="-u praxis:Sanexio"
    ;;
  com)
    if [ "${PXZ_VERIFY_COM_CONFIRMED:-no}" != "yes" ]; then
      cat <<'EOF' >&2
✋ STOP — Verify gegen .com Live-Domain.

DF-Hoster sperrt bei wiederholten Recon-Pattern-Requests (.env, debug.log,
.git/config, wp-config.php, xmlrpc.php). Block dauert Stunden, Whitelisting
nicht möglich.

Wenn der Lauf wirklich nötig ist, bestätige explizit:

  PXZ_VERIFY_COM_CONFIRMED=yes ./tools/pre-launch-verify.sh --target=com

Besser: SSH/SFTP-File-Existence-Check auf Server-Seite statt HTTP-GET von außen.
EOF
      exit 2
    fi
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
  code=$($CURL -skL -A "$USER_AGENT" $AUTH -o /dev/null -w "%{http_code}" "${BASE}${path}")
  if [ "$code" = "403" ] || [ "$code" = "404" ]; then
    printf "  ✅  %s  %s\n" "$code" "$path"
  else
    printf "  ❌  %s  %s  (expected 403 or 404)\n" "$code" "$path"
    fails=$((fails+1))
  fi
  sleep "$THROTTLE_SECONDS"
done

echo ""
echo "EXPECT 200 (legitime Routes):"
for path in "${EXPECT_OK[@]}"; do
  total=$((total+1))
  code=$($CURL -skL -A "$USER_AGENT" $AUTH -o /dev/null -w "%{http_code}" "${BASE}${path}")
  if [ "$code" = "200" ]; then
    printf "  ✅  %s  %s\n" "$code" "$path"
  else
    printf "  ❌  %s  %s  (expected 200)\n" "$code" "$path"
    fails=$((fails+1))
  fi
  sleep "$THROTTLE_SECONDS"
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
