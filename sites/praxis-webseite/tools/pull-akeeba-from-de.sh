#!/usr/bin/env bash
# Pull Akeeba V2 backup from westend-hausarzt.de via FTPS (Binary mode).
#
# Source : public_html/wp-content/plugins/akeebabackupwp/app/backups/
# Target : ~/Cortex/projects/praxis-webseite/_akeeba-archive/V2-<YYYY-MM-DD>/
#
# Voraussetzung: Akeeba Backup for WordPress ist auf .de installiert,
# ein frisches Full-Site-Backup wurde erstellt.
#
# Vor erstem Aufruf: BACKUP_PREFIX + PARTS unten an den tatsächlichen
# Filename anpassen (kommt aus dem Pre-Flight-Check in Phase A2).
#
# Pattern: pget -n 2 + 20s Sleep zwischen Files
# (GoDaddy/DF cPanel limitiert 8 Connections — Lesson aus V1-Pull).

set -euo pipefail

CORTEX_REPO="/Users/cluster-mini-02/Cortex/projects/Cortex-Web/sites/praxis-webseite"
ENV_FILE="$CORTEX_REPO/.env.sprint1.local"
DATE_STAMP="${V2_DATE:-$(date +%Y-%m-%d)}"
TARGET_DIR="/Users/cluster-mini-02/Cortex/projects/praxis-webseite/_akeeba-archive/V2-$DATE_STAMP"
REMOTE_DIR="public_html/wp-content/plugins/akeebabackupwp/app/backups"

# === ADJUST BEFORE FIRST RUN ===
BACKUP_PREFIX="${BACKUP_PREFIX:-}"          # z. B. site-westend-hausarzt.de-20260520-093015cest-fmABC123
PARTS="${PARTS:-3}"                         # Anzahl der .j01..jNN Files (jpa NICHT mitzählen)
LOG_FILE="${LOG_FILE:-}"                    # z. B. akeeba.backend.id-...log.php (optional)
# ===============================

if [ -z "$BACKUP_PREFIX" ]; then
  echo "FAIL: BACKUP_PREFIX not set. Edit script or pass as env var." >&2
  echo "  Run pre-flight first to discover filename:" >&2
  echo '  lftp -u "$SFTP_COM_USERNAME","$SFTP_COM_PASSWORD" -p "$SFTP_COM_PORT" "ftp://$SFTP_COM_HOST" \' >&2
  echo '    -e "cls -la '"$REMOTE_DIR"'; quit"' >&2
  exit 2
fi

[ -f "$ENV_FILE" ] || { echo "FAIL: $ENV_FILE not found" >&2; exit 2; }
set -a; . "$ENV_FILE"; set +a
: "${SFTP_COM_HOST:?SFTP_COM_HOST missing}"
: "${SFTP_COM_PORT:?SFTP_COM_PORT missing}"
: "${SFTP_COM_USERNAME:?SFTP_COM_USERNAME missing}"
: "${SFTP_COM_PASSWORD:?SFTP_COM_PASSWORD missing}"

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

LOG="$TARGET_DIR/download.log"
echo "=== Pull start $(date '+%F %T %Z') ===" | tee -a "$LOG"
echo "Target: $TARGET_DIR" | tee -a "$LOG"
echo "Remote: $REMOTE_DIR" | tee -a "$LOG"
echo "Prefix: $BACKUP_PREFIX" | tee -a "$LOG"
echo "Parts:  $PARTS" | tee -a "$LOG"

pull_one() {
  local fname="$1"
  echo "--- pulling $fname at $(date +%H:%M:%S) ---" | tee -a "$LOG"
  lftp -u "$SFTP_COM_USERNAME","$SFTP_COM_PASSWORD" -p "$SFTP_COM_PORT" "ftp://$SFTP_COM_HOST" <<EOF 2>&1 | tee -a "$LOG"
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate no
set ftp:passive-mode on
set ftp:use-feat off
set ftp:idle-timeout 30
set xfer:clobber on
set net:max-retries 5
set net:reconnect-interval-base 8
set net:timeout 60
cd $REMOTE_DIR
pget -n 2 -c $fname
quit
EOF
  echo "--- finished $fname at $(date +%H:%M:%S), sleeping 20s for server cleanup ---" | tee -a "$LOG"
  sleep 20
}

pull_one "$BACKUP_PREFIX.jpa"
for i in $(seq -f "%02g" 1 "$PARTS"); do
  pull_one "$BACKUP_PREFIX.j$i"
done

if [ -n "$LOG_FILE" ]; then
  echo "--- pulling log $LOG_FILE ---" | tee -a "$LOG"
  lftp -u "$SFTP_COM_USERNAME","$SFTP_COM_PASSWORD" -p "$SFTP_COM_PORT" "ftp://$SFTP_COM_HOST" <<EOF 2>&1 | tee -a "$LOG"
set ftp:ssl-force true; set ssl:verify-certificate no
set ftp:passive-mode on
cd $REMOTE_DIR
get -c $LOG_FILE
quit
EOF
fi

echo "=== Pull done $(date '+%F %T %Z') ===" | tee -a "$LOG"
echo "=== Local files ===" | tee -a "$LOG"
ls -lah "$TARGET_DIR" | tee -a "$LOG"
echo "=== SHA256 ===" | tee -a "$LOG"
shasum -a 256 "$TARGET_DIR"/${BACKUP_PREFIX}.* 2>/dev/null | tee -a "$LOG"

# bundle kickstart from V1 (already in archive)
KICKSTART_SRC="/Users/cluster-mini-02/Cortex/projects/praxis-com-v1-archive/kickstart/kickstart.php"
KICKSTART_INI="/Users/cluster-mini-02/Cortex/projects/praxis-com-v1-archive/kickstart/en-GB.kickstart.ini"
if [ -f "$KICKSTART_SRC" ]; then
  cp "$KICKSTART_SRC" "$TARGET_DIR/kickstart.php"
  cp "$KICKSTART_INI" "$TARGET_DIR/en-GB.kickstart.ini"
  echo "  ✓ Bundled kickstart.php into archive (rename to restore-v2.php before deploying)"
fi

echo "=== V2-Pull COMPLETE ===" | tee -a "$LOG"
