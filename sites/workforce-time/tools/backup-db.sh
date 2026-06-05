#!/usr/bin/env bash
# Workforce-Time — SQLite backup with integrity check and retention.
#
# Uses sqlite3's online ".backup" command, which is safe while the API is
# running (consistent snapshot, no downtime). Each backup is verified with
# PRAGMA integrity_check before it counts as successful, then gzipped.
#
# Configuration (env vars, all optional):
#   ARBEITSZEITEN_DB        path to the live DB
#                           (default: $CORTEX_TENANT_DIR/trunk/workforce/db/arbeitszeiten.sqlite)
#   WORKFORCE_BACKUP_DIR    target directory (default: <db dir>/backups)
#   WORKFORCE_BACKUP_KEEP   how many backups to keep (default: 30)
#
# Usage:
#   tools/backup-db.sh            # create backup + prune old ones
#   tools/backup-db.sh --verify-only <file.sqlite.gz>   # check an existing backup
#
# Restore (documented in docs/BACKUP.md):
#   1. systemctl stop workforce-time      (production) / stop dev server
#   2. gunzip -k <backup>.sqlite.gz
#   3. mv <live-db> <live-db>.broken && mv <backup>.sqlite <live-db>
#   4. sqlite3 <live-db> "PRAGMA integrity_check;"
#   5. systemctl start workforce-time
set -euo pipefail

log() { printf '[backup-db] %s\n' "$*"; }
fail() { printf '[backup-db] FEHLER: %s\n' "$*" >&2; exit 1; }

command -v sqlite3 >/dev/null || fail "sqlite3 nicht gefunden"

if [ "${1:-}" = "--verify-only" ]; then
  [ -n "${2:-}" ] || fail "--verify-only braucht einen Dateipfad"
  TMP=$(mktemp -d)
  trap 'rm -rf "$TMP"' EXIT
  case "$2" in
    *.gz) gunzip -c "$2" > "$TMP/check.sqlite" ;;
    *) cp "$2" "$TMP/check.sqlite" ;;
  esac
  RESULT=$(sqlite3 "$TMP/check.sqlite" "PRAGMA integrity_check;")
  [ "$RESULT" = "ok" ] || fail "Integritaetspruefung fehlgeschlagen: $RESULT"
  log "OK: $2 ist intakt ($(sqlite3 "$TMP/check.sqlite" "SELECT COUNT(*) FROM time_entries;") time_entries)"
  exit 0
fi

DB="${ARBEITSZEITEN_DB:-${CORTEX_TENANT_DIR:+$CORTEX_TENANT_DIR/trunk/workforce/db/arbeitszeiten.sqlite}}"
[ -n "$DB" ] || fail "Weder ARBEITSZEITEN_DB noch CORTEX_TENANT_DIR gesetzt"
[ -f "$DB" ] || fail "Datenbank nicht gefunden: $DB"

BACKUP_DIR="${WORKFORCE_BACKUP_DIR:-$(dirname "$DB")/backups}"
KEEP="${WORKFORCE_BACKUP_KEEP:-30}"
STAMP=$(date +%Y%m%d-%H%M%S)
TARGET="$BACKUP_DIR/arbeitszeiten-$STAMP.sqlite"

mkdir -p "$BACKUP_DIR"

# 1. Consistent online snapshot (works while the API holds the DB open).
sqlite3 "$DB" ".backup '$TARGET'"

# 2. Verify the snapshot before trusting it.
RESULT=$(sqlite3 "$TARGET" "PRAGMA integrity_check;")
if [ "$RESULT" != "ok" ]; then
  rm -f "$TARGET"
  fail "Integritaetspruefung des Snapshots fehlgeschlagen: $RESULT"
fi
ROWS=$(sqlite3 "$TARGET" "SELECT (SELECT COUNT(*) FROM time_entries) || ' entries, ' || (SELECT COUNT(*) FROM shifts) || ' shifts, ' || (SELECT COUNT(*) FROM employees) || ' employees';")

# 3. Compress.
gzip -f "$TARGET"
SIZE=$(du -h "$TARGET.gz" | cut -f1 | tr -d ' ')
log "Backup OK: $TARGET.gz ($SIZE; $ROWS)"

# 4. Retention: keep the newest $KEEP, delete the rest.
ls -1t "$BACKUP_DIR"/arbeitszeiten-*.sqlite.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | while read -r OLD; do
  rm -f "$OLD"
  log "Retention: $OLD geloescht (keep=$KEEP)"
done
