#!/usr/bin/env bash
# tools/pull-com-to-local.sh — .com → Local Theme-Pull (Backup-Direction).
#
# Eingeführt 2026-05-17 für den neuen Workflow:
#   1. Live-Edit auf .com (Referenz-Site)
#   2. pull-com-to-local.sh  → Local-Backup
#   3. sync-local-to-de.sh   → .de spiegeln
#
# Default-Verhalten: Theme-Files von .com nach Local mirroren, mit
# vorhergehendem Backup des Local-Stands. Verify per MD5-Diff.
#
# Usage:
#   ./tools/pull-com-to-local.sh                  # theme + verify (Default)
#   ./tools/pull-com-to-local.sh --dry-run        # lftp --dry-run, kein Write
#   ./tools/pull-com-to-local.sh --no-backup      # ohne Pre-Pull-Backup (NICHT empfohlen)
#   ./tools/pull-com-to-local.sh --skip-git-check # Pre-Pull-Guard übersprungen
#
# Pre-Pull-Guard:
#   Wenn das Local-Theme dirty ist (uncommittete Änderungen), bricht das
#   Skript ab. Pull würde sonst lokale, nicht-committete Edits überschreiben.
#   Override mit --skip-git-check (eigenes Risiko).
#
# Vorbedingungen:
#   - .env.sprint1.local mit SFTP_COM_* gesetzt
#   - lftp installiert (`brew install lftp`)
#
# Exit-Codes: 0 = ok, 1 = fail, 2 = config, 3 = dirty git

set -euo pipefail

DRY_RUN=0
DO_BACKUP=1
SKIP_GIT_CHECK=0
DO_VERIFY=1

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --no-backup) DO_BACKUP=0; shift ;;
    --no-verify) DO_VERIFY=0; shift ;;
    --skip-git-check) SKIP_GIT_CHECK=1; shift ;;
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

LOCAL_THEME="/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum"
REMOTE_THEME="praxis2021/wp-content/themes/praxiszentrum"
BACKUP_ROOT="$REPO_DIR/_backups"

if [ ! -d "$LOCAL_THEME" ]; then
  echo "FAIL: Local theme not found at $LOCAL_THEME" >&2
  exit 1
fi

# --- Pre-Pull-Guard: Local muss git-clean sein (sonst werden uncommittete
#     Änderungen vom Mirror überschrieben). ---
if [ "$SKIP_GIT_CHECK" = "0" ]; then
  if [ -d "$LOCAL_THEME/.git" ]; then
    echo "=== Pre-Pull-Guard: Local-Theme-Repo prüfen ==="
    THEME_DIRTY=$(git -C "$LOCAL_THEME" status --porcelain 2>/dev/null | head -1)
    if [ -n "$THEME_DIRTY" ]; then
      echo "FAIL: Local-Theme hat uncommittete Änderungen." >&2
      echo "      Pull würde sie überschreiben." >&2
      echo "      Lösung: commit + push, dann pull. Oder: --skip-git-check (eigenes Risiko)." >&2
      git -C "$LOCAL_THEME" status --short >&2
      exit 3
    else
      LOCAL_HEAD=$(git -C "$LOCAL_THEME" rev-parse HEAD 2>/dev/null | cut -c1-7)
      echo "  ✓ Local-Theme-Repo clean (HEAD $LOCAL_HEAD)"
    fi
  else
    echo "WARN: $LOCAL_THEME ist kein Git-Repo — Pre-Pull-Guard übersprungen." >&2
  fi
  echo ""
fi

# --- Pre-Pull-Backup: tar des aktuellen Local-Theme-Stands ---
if [ "$DO_BACKUP" = "1" ] && [ "$DRY_RUN" = "0" ]; then
  TS=$(date +%Y-%m-%d_%H%M%S)
  mkdir -p "$BACKUP_ROOT"
  BACKUP_FILE="$BACKUP_ROOT/theme-pre-pull-com_$TS.tgz"
  echo "=== Pre-Pull-Backup: $BACKUP_FILE ==="
  (cd "$(dirname "$LOCAL_THEME")" && \
    COPYFILE_DISABLE=1 tar --no-mac-metadata --no-xattrs -czf "$BACKUP_FILE" \
      --exclude='praxiszentrum/.git' \
      --exclude='praxiszentrum/node_modules' \
      "praxiszentrum")
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | awk '{print $1}')
  echo "  ✓ Backup written: $BACKUP_SIZE"
  echo ""
fi

# --- Theme-Pull via lftp mirror (REVERSE: kein -R) ---
echo "=== Theme-Pull .com → Local ==="
echo "  Remote: $REMOTE_THEME"
echo "  Local : $LOCAL_THEME"
if [ "$DRY_RUN" = "1" ]; then
  echo "  Mode  : DRY-RUN (no write)"
  DRY_FLAG="--dry-run"
else
  DRY_FLAG=""
fi
echo ""

lftp -u "$SFTP_COM_USERNAME","$SFTP_COM_PASSWORD" -p "$SFTP_COM_PORT" "ftp://$SFTP_COM_HOST" <<EOF 2>&1 | grep -v "^mkdir -p ftp://" || true
set ftp:ssl-force true
set ssl:verify-certificate no
set cmd:trace off
set net:max-retries 3
set mirror:parallel-transfer-count 2
mirror \
  --delete \
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
  $DRY_FLAG \
  "$REMOTE_THEME" \
  "$LOCAL_THEME"
quit
EOF

if [ "$DRY_RUN" = "1" ]; then
  echo ""
  echo "DRY-RUN done — no files were written locally."
  exit 0
fi

# --- Verify: MD5-Diff Local vs .com via Helper-PHP ---
if [ "$DO_VERIFY" = "1" ]; then
  echo ""
  echo "=== Verify: MD5-Diff Local ↔ .com ==="

  TOKEN=$(openssl rand -hex 16)
  HELPER="/tmp/_pxz-pull-verify-$TOKEN.php"
  cat > "$HELPER" <<PHPEOF
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

  HELPER_NAME="_pxz-pull-verify-$TOKEN.php"
  lftp -u "$SFTP_COM_USERNAME","$SFTP_COM_PASSWORD" -p "$SFTP_COM_PORT" "ftp://$SFTP_COM_HOST" <<EOF >/dev/null 2>&1 || true
set ftp:ssl-force true
set ssl:verify-certificate no
cd praxis2021
put -O . "$HELPER" -o "$HELPER_NAME"
quit
EOF

  COM_SUMS=$(mktemp)
  LOC_SUMS=$(mktemp)
  curl -sS --max-time 120 "https://westend-hausarzt.com/$HELPER_NAME?token=$TOKEN" | sort > "$COM_SUMS"

  (cd "$LOCAL_THEME" && find . -type f \
      ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./screenshots/*" \
      -exec md5 -r {} \;) \
    | sed 's| \./| |' | awk '{print $1" "$2}' | sort > "$LOC_SUMS"

  COM_COUNT=$(wc -l < "$COM_SUMS")
  LOC_COUNT=$(wc -l < "$LOC_SUMS")

  DIFF_LINES=$(diff "$LOC_SUMS" "$COM_SUMS" | wc -l | awk '{print $1}')

  if [ "$DIFF_LINES" = "0" ] && [ "$COM_COUNT" = "$LOC_COUNT" ]; then
    echo "  ✓ Local und .com bit-identisch ($LOC_COUNT Files)"
  else
    echo "  ⚠ Drift erkannt — Local=$LOC_COUNT Files, .com=$COM_COUNT Files"
    echo "  --- first 20 diff lines ---"
    diff "$LOC_SUMS" "$COM_SUMS" | head -20
  fi

  # Cleanup remote helper
  curl -sS --max-time 15 "https://westend-hausarzt.com/$HELPER_NAME?token=$TOKEN&step=cleanup" >/dev/null || true

  rm -f "$HELPER" "$COM_SUMS" "$LOC_SUMS"
fi

echo ""
echo "=== Pull done ==="
echo ""
echo "Nächste Schritte:"
echo "  1. cd \"$LOCAL_THEME\""
echo "  2. git status            # Diff sichten"
echo "  3. git add -p && git commit -m 'Pull from .com YYYY-MM-DD'"
echo "  4. git push"
echo "  5. ./tools/sync-local-to-de.sh    # Spiegel auf .de"
