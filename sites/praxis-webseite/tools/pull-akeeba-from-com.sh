#!/usr/bin/env bash
# Pull Akeeba V1 backup from westend-hausarzt.com via FTPS (Binary mode).
#
# Source : praxis2021/wp-content/plugins/akeebabackupwp/app/backups/
# Target : ~/Cortex/projects/praxis-webseite/_akeeba-archive/V1-2026-05-16/
#
# Backup-Set (4 parts, ~6.6 GB total):
#   .jpa  166 MB  (header + start)
#   .j01  2 GB
#   .j02  2 GB
#   .j03  2 GB
#   .log.php  20 MB  (Akeeba backend log, optional)
#
# Binary mode is mandatory (Akeeba warns: any non-binary transfer corrupts archive).
# pget -n 4 -c = 4 parallel chunks per file with resume.

set -euo pipefail

CORTEX_REPO="/Users/cluster-mini-02/Cortex/projects/Cortex-Web/sites/praxis-webseite"
ENV_FILE="$CORTEX_REPO/.env.sprint1.local"
TARGET_DIR="/Users/cluster-mini-02/Cortex/projects/praxis-webseite/_akeeba-archive/V1-2026-05-16"
REMOTE_DIR="praxis2021/wp-content/plugins/akeebabackupwp/app/backups"
BACKUP_PREFIX="site-westend-hausarzt.com-20260516-173459cest-fm_mg4U3MdZk35Yb"
LOG_FILE="akeeba.backend.id-20260516-153459-859582.log.php"

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

pull_one() {
  local fname="$1" mode="${2:-pget}"
  echo "--- pulling $fname ($mode) at $(date +%H:%M:%S) ---" | tee -a "$LOG"
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
$mode -n 2 -c $fname
quit
EOF
  echo "--- finished $fname at $(date +%H:%M:%S), sleeping 20s for server cleanup ---" | tee -a "$LOG"
  sleep 20
}

pull_one "$BACKUP_PREFIX.jpa" "pget"
pull_one "$BACKUP_PREFIX.j01" "pget"
pull_one "$BACKUP_PREFIX.j02" "pget"
pull_one "$BACKUP_PREFIX.j03" "pget"

# small log file — single connection, no pget
echo "--- pulling $LOG_FILE (get) at $(date +%H:%M:%S) ---" | tee -a "$LOG"
lftp -u "$SFTP_COM_USERNAME","$SFTP_COM_PASSWORD" -p "$SFTP_COM_PORT" "ftp://$SFTP_COM_HOST" <<EOF 2>&1 | tee -a "$LOG"
set ftp:ssl-force true
set ftp:ssl-protect-data true
set ssl:verify-certificate no
set ftp:passive-mode on
cd $REMOTE_DIR
get -c $LOG_FILE
quit
EOF

echo "=== Pull done $(date '+%F %T %Z') ===" | tee -a "$LOG"
echo "=== Local files ===" | tee -a "$LOG"
ls -lah "$TARGET_DIR" | tee -a "$LOG"
echo "=== SHA256 ===" | tee -a "$LOG"
shasum -a 256 "$TARGET_DIR"/${BACKUP_PREFIX}.* | tee -a "$LOG"

EXPECTED_SIZES=(
  "${BACKUP_PREFIX}.jpa:166119652"
  "${BACKUP_PREFIX}.j01:2147352576"
  "${BACKUP_PREFIX}.j02:2147352576"
  "${BACKUP_PREFIX}.j03:2147352576"
)
echo "=== Size verification ===" | tee -a "$LOG"
FAILED=0
for entry in "${EXPECTED_SIZES[@]}"; do
  f="${entry%:*}"; expect="${entry##*:}"
  actual=$(stat -f%z "$TARGET_DIR/$f" 2>/dev/null || echo 0)
  if [ "$actual" = "$expect" ]; then
    echo "  OK   $f  $actual bytes" | tee -a "$LOG"
  else
    echo "  FAIL $f  expected=$expect actual=$actual" | tee -a "$LOG"
    FAILED=1
  fi
done

if [ "$FAILED" = "1" ]; then
  echo "=== INCOMPLETE — re-run script to resume ===" | tee -a "$LOG"
  exit 1
fi

echo "=== Backup pull COMPLETE ===" | tee -a "$LOG"
