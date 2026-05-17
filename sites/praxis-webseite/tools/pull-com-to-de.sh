#!/usr/bin/env bash
# tools/pull-com-to-de.sh — .com → .de Theme-Spiegel (direct).
#
# Eingeführt 2026-05-17 als Begleiter zu pull-com-to-local.sh.
#
# Workflow-Kontext: .com ist seit 2026-05-17 die Referenz-Site. Theme-
# Edits laufen direkt auf .com. Dieses Skript spiegelt den .com-Theme-
# Stand 1:1 auf .de, ohne Umweg über Local. Verwendet wenn:
#   - du nach einem Live-Edit auf .com sofort .de mitziehen willst
#   - Local nicht hochgefahren ist
#   - der Local-Repo-Branch in einem inkonsistenten Zustand ist
#
# Implementierung:
#   1. lftp mirror .com → /tmp/_pxz-com-stage_<TS>/ (Pull)
#   2. lftp mirror -R /tmp/_pxz-com-stage_<TS>/ → .de (Push)
#   3. Verify: MD5-Diff .com ↔ .de via Token-Helper auf beiden Sites
#   4. /tmp-Stage cleanup
#
# Usage:
#   ./tools/pull-com-to-de.sh                 # full pull+push+verify
#   ./tools/pull-com-to-de.sh --dry-run       # alle lftp-Calls dry-run
#   ./tools/pull-com-to-de.sh --no-verify     # md5-verify überspringen
#   ./tools/pull-com-to-de.sh --keep-stage    # /tmp-Stage nach Ende behalten
#
# Vorbedingungen:
#   - .env.sprint1.local mit SFTP_COM_* und SFTP_DE_*
#   - lftp installiert
#   - curl
#
# Exit-Codes: 0 = ok, 1 = fail, 2 = config

set -euo pipefail

DRY_RUN=0
DO_VERIFY=1
KEEP_STAGE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --no-verify) DO_VERIFY=0; shift ;;
    --keep-stage) KEEP_STAGE=1; shift ;;
    -h|--help) sed -n '1,30p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_DIR/.env.sprint1.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "FAIL: $ENV_FILE not found" >&2
  exit 2
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

: "${SFTP_COM_HOST:?SFTP_COM_HOST not set}"
: "${SFTP_COM_PORT:?SFTP_COM_PORT not set}"
: "${SFTP_COM_USERNAME:?SFTP_COM_USERNAME not set}"
: "${SFTP_COM_PASSWORD:?SFTP_COM_PASSWORD not set}"
: "${SFTP_DE_HOST:?SFTP_DE_HOST not set}"
: "${SFTP_DE_PORT:?SFTP_DE_PORT not set}"
: "${SFTP_DE_USERNAME:?SFTP_DE_USERNAME not set}"
: "${SFTP_DE_PASSWORD:?SFTP_DE_PASSWORD not set}"

REMOTE_COM_THEME="praxis2021/wp-content/themes/praxiszentrum"
REMOTE_DE_THEME="public_html/wp-content/themes/praxiszentrum"

TS=$(date +%Y-%m-%d_%H%M%S)
STAGE_DIR="/tmp/_pxz-com-stage_${TS}"
mkdir -p "$STAGE_DIR"

# Im dry-run wird Phase-1 trotzdem real ausgeführt (Stage füllen), damit
# Phase-2 einen aussagekräftigen Diff zeigen kann. Sonst wäre Stage leer
# und der dry-run-Diff zeigte "alles löschen" — gefährlich täuschend.

# --- Phase 1: .com → /tmp stage (immer real) ---
echo "=== Phase 1: Pull .com → $STAGE_DIR ==="
echo "  Remote: $REMOTE_COM_THEME"
echo ""

lftp -u "$SFTP_COM_USERNAME","$SFTP_COM_PASSWORD" -p "$SFTP_COM_PORT" "ftp://$SFTP_COM_HOST" <<EOF 2>&1 | grep -v "^mkdir -p ftp://" || true
set ftp:ssl-force true
set ssl:verify-certificate no
set cmd:trace off
set net:max-retries 3
set mirror:parallel-transfer-count 2
mirror \
  --only-newer \
  --exclude-glob .git/ \
  --exclude-glob .git \
  --exclude-glob node_modules/ \
  --exclude-glob _archive/ \
  --exclude-glob _backups/ \
  --exclude-glob specs/ \
  --exclude-glob '*.log' \
  --exclude-glob '*.bak' \
  --exclude-glob '.DS_Store' \
  "$REMOTE_COM_THEME" \
  "$STAGE_DIR"
quit
EOF

STAGED_COUNT=$(find "$STAGE_DIR" -type f | wc -l | awk '{print $1}')
echo "  ✓ Staged $STAGED_COUNT Files in $STAGE_DIR"
echo ""

# --- Sanity-Threshold: Theme hat ~312 Files. Wenn < 100 nach Phase-1,
#     ist .com nicht vollständig gepullt — Abort, sonst würde
#     --delete auf .de Schaden anrichten. ---
SAFETY_MIN=100
if [ "$STAGED_COUNT" -lt "$SAFETY_MIN" ]; then
  echo "FAIL: Stage hat nur $STAGED_COUNT Files (< $SAFETY_MIN)." >&2
  echo "      Phase-1 (Pull von .com) scheint unvollständig." >&2
  echo "      Abort vor Phase-2 — sonst würde --delete auf .de Schaden anrichten." >&2
  echo "      Stage behalten zur Inspektion: $STAGE_DIR" >&2
  exit 1
fi

# --- Phase 2: /tmp stage → .de ---
if [ "$DRY_RUN" = "1" ]; then
  DRY_FLAG="--dry-run"
else
  DRY_FLAG=""
fi

echo "=== Phase 2: Push $STAGE_DIR → .de ==="
echo "  Remote: $REMOTE_DE_THEME"
if [ "$DRY_RUN" = "1" ]; then echo "  Mode  : DRY-RUN (no write)"; fi
echo ""

lftp -u "$SFTP_DE_USERNAME","$SFTP_DE_PASSWORD" -p "$SFTP_DE_PORT" "ftp://$SFTP_DE_HOST" <<EOF 2>&1 | grep -v "^mkdir -p ftp://" || true
set ftp:ssl-force true
set ssl:verify-certificate no
set cmd:trace off
set net:max-retries 3
set mirror:parallel-transfer-count 4
mirror -R \
  --only-newer \
  --delete \
  --exclude-glob .git/ \
  --exclude-glob .git \
  --exclude-glob node_modules/ \
  --exclude-glob _archive/ \
  --exclude-glob _backups/ \
  --exclude-glob specs/ \
  --exclude-glob '*.log' \
  --exclude-glob '*.bak' \
  --exclude-glob '.DS_Store' \
  $DRY_FLAG \
  "$STAGE_DIR" \
  "$REMOTE_DE_THEME"
quit
EOF

if [ "$DRY_RUN" = "1" ]; then
  echo ""
  echo "DRY-RUN done — kein Write auf .de. Stage entfernt."
  rm -rf "$STAGE_DIR"
  exit 0
fi

echo "  ✓ Push abgeschlossen"
echo ""

# --- Phase 3: Verify .com ↔ .de via Token-Helper auf beiden Sites ---
if [ "$DO_VERIFY" = "1" ]; then
  echo "=== Phase 3: Verify MD5-Diff .com ↔ .de ==="

  TOKEN=$(openssl rand -hex 16)
  HELPER_LOCAL="/tmp/_pxz-pull-verify-com-de-$TOKEN.php"
  HELPER_NAME="_pxz-pull-verify-com-de-$TOKEN.php"

  cat > "$HELPER_LOCAL" <<PHPEOF
<?php
declare(strict_types=1);
const TOKEN = '$TOKEN';
if (!hash_equals(TOKEN, (string)(\$_GET['token'] ?? ''))) { http_response_code(403); exit('forbidden'); }
header('Content-Type: text/plain; charset=utf-8');
\$step = (string)(\$_GET['step'] ?? 'sums');
if (\$step === 'cleanup') { @unlink(__FILE__); echo "deleted\n"; exit; }
\$root = __DIR__ . '/wp-content/themes/praxiszentrum';
if (!is_dir(\$root)) { http_response_code(500); exit('theme not found'); }
\$rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(\$root, FilesystemIterator::SKIP_DOTS));
foreach (\$rii as \$file) {
    if (!\$file->isFile()) continue;
    \$path = \$file->getPathname();
    \$rel  = ltrim(str_replace(\$root, '', \$path), '/');
    if (str_starts_with(\$rel, '.git/') || str_starts_with(\$rel, 'node_modules/') || str_starts_with(\$rel, 'screenshots/')) continue;
    echo md5_file(\$path) . ' ' . \$rel . "\n";
}
PHPEOF

  # Upload helper to .com (in /praxis2021/ docroot)
  lftp -u "$SFTP_COM_USERNAME","$SFTP_COM_PASSWORD" -p "$SFTP_COM_PORT" "ftp://$SFTP_COM_HOST" <<EOF >/dev/null 2>&1 || true
set ftp:ssl-force true
set ssl:verify-certificate no
cd praxis2021
put -O . "$HELPER_LOCAL" -o "$HELPER_NAME"
quit
EOF

  # Upload helper to .de (in /public_html/ docroot)
  lftp -u "$SFTP_DE_USERNAME","$SFTP_DE_PASSWORD" -p "$SFTP_DE_PORT" "ftp://$SFTP_DE_HOST" <<EOF >/dev/null 2>&1 || true
set ftp:ssl-force true
set ssl:verify-certificate no
cd public_html
put -O . "$HELPER_LOCAL" -o "$HELPER_NAME"
quit
EOF

  COM_SUMS=$(mktemp)
  DE_SUMS=$(mktemp)
  curl -sS --max-time 120 "https://westend-hausarzt.com/$HELPER_NAME?token=$TOKEN" | sort > "$COM_SUMS" || true
  curl -sS --max-time 120 "https://westend-hausarzt.de/$HELPER_NAME?token=$TOKEN"  | sort > "$DE_SUMS"  || true

  COM_COUNT=$(wc -l < "$COM_SUMS" | awk '{print $1}')
  DE_COUNT=$(wc -l < "$DE_SUMS"  | awk '{print $1}')
  DIFF_LINES=$(diff "$COM_SUMS" "$DE_SUMS" | wc -l | awk '{print $1}')

  if [ "$DIFF_LINES" = "0" ] && [ "$COM_COUNT" = "$DE_COUNT" ] && [ "$COM_COUNT" -gt 0 ]; then
    echo "  ✓ .com und .de bit-identisch ($COM_COUNT Files)"
  else
    echo "  ⚠ Drift erkannt — .com=$COM_COUNT Files, .de=$DE_COUNT Files"
    echo "  --- first 20 diff lines (< .com, > .de) ---"
    diff "$COM_SUMS" "$DE_SUMS" | head -20
  fi

  # Cleanup remote helpers
  curl -sS --max-time 15 "https://westend-hausarzt.com/$HELPER_NAME?token=$TOKEN&step=cleanup" >/dev/null || true
  curl -sS --max-time 15 "https://westend-hausarzt.de/$HELPER_NAME?token=$TOKEN&step=cleanup"  >/dev/null || true

  rm -f "$HELPER_LOCAL" "$COM_SUMS" "$DE_SUMS"
fi

# --- Cleanup stage ---
if [ "$KEEP_STAGE" = "0" ]; then
  rm -rf "$STAGE_DIR"
  echo ""
  echo "  /tmp-Stage entfernt."
else
  echo ""
  echo "  /tmp-Stage behalten: $STAGE_DIR"
fi

echo ""
echo "=== Pull .com → .de done ==="
