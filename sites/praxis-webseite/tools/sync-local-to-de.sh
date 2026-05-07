#!/usr/bin/env bash
# tools/sync-local-to-de.sh — Local → .de Polish-Sync (Modell A, Welle K Vorlauf)
#
# Inkrementelles Push des Local-Praxiszentrum-Themes auf .de-Staging via FTPS.
# Default-Workflow für die Polish-Phase zwischen Welle J und Welle K.
#
# Usage:
#   ./tools/sync-local-to-de.sh                  # theme + verify (Default)
#   ./tools/sync-local-to-de.sh --theme          # nur theme push
#   ./tools/sync-local-to-de.sh --verify         # nur verify
#   ./tools/sync-local-to-de.sh --db patch.sql   # zusätzlich DB-Patch via import-db.php (nur wenn Path angegeben)
#   ./tools/sync-local-to-de.sh --dry-run        # lftp im --dry-run-Mode
#
# Vorbedingungen:
#   - .env.sprint1.local mit SFTP_DE_* gesetzt
#   - lftp installiert (`brew install lftp`)
#   - Local-Theme-Pfad existiert
#
# Rationale: Nicht-destruktive Iteration für Polish-Phase. Volltext-Re-Upload
# nur in Welle K (Tier-3), hier ist's Tier-1 (Test-Staging .de).
#
# Exit-Codes: 0 = ok, 1 = fail, 2 = config

set -euo pipefail

DO_THEME=0
DO_VERIFY=0
DB_PATCH=""
DRY_RUN=0

if [ $# -eq 0 ]; then
  DO_THEME=1
  DO_VERIFY=1
fi

while [ $# -gt 0 ]; do
  case "$1" in
    --theme) DO_THEME=1; shift ;;
    --verify) DO_VERIFY=1; shift ;;
    --db) DB_PATCH="${2:-}"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    --all) DO_THEME=1; DO_VERIFY=1; shift ;;
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

: "${SFTP_DE_HOST:?SFTP_DE_HOST not set}"
: "${SFTP_DE_PORT:?SFTP_DE_PORT not set}"
: "${SFTP_DE_USERNAME:?SFTP_DE_USERNAME not set}"
: "${SFTP_DE_PASSWORD:?SFTP_DE_PASSWORD not set}"

LOCAL_THEME="/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum"
REMOTE_THEME="public_html/wp-content/themes/praxiszentrum"

if [ "$DO_THEME" = "1" ]; then
  if [ ! -d "$LOCAL_THEME" ]; then
    echo "FAIL: Local theme not found at $LOCAL_THEME" >&2
    exit 1
  fi

  echo "=== Theme-Sync Local → .de ==="
  echo "  Local : $LOCAL_THEME"
  echo "  Remote: $REMOTE_THEME"
  if [ "$DRY_RUN" = "1" ]; then
    echo "  Mode  : DRY-RUN (no upload)"
    DRY_FLAG="--dry-run"
  else
    DRY_FLAG=""
  fi
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
  "$LOCAL_THEME" \
  "$REMOTE_THEME"
quit
EOF

  echo ""
  echo "Theme sync complete."
fi

if [ -n "$DB_PATCH" ]; then
  echo "=== DB-Patch ==="
  if [ ! -f "$DB_PATCH" ]; then
    echo "FAIL: DB patch not found: $DB_PATCH" >&2
    exit 1
  fi
  echo "  Patch: $DB_PATCH ($(wc -l <"$DB_PATCH" | tr -d ' ') lines)"
  echo "  NOTE : SQL-Patch-Apply nicht automatisiert in v1 — manuell via phpMyAdmin"
  echo "         oder import-db.php (Welle-F-Tooling). Skript-Stub für v2 vorgesehen."
  echo ""
fi

if [ "$DO_VERIFY" = "1" ]; then
  echo "=== Pre-Launch Verify auf .de ==="
  bash "$REPO_DIR/tools/pre-launch-verify.sh" --target=de
fi

echo ""
echo "=== sync-local-to-de.sh done ==="
