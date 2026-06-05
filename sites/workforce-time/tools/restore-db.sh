#!/usr/bin/env bash
# Workforce-Time — verified SQLite restore.
#
# Default mode is a dry-run: decompress/copy the backup, verify integrity and
# schema, then print the planned target. Use --apply for the actual swap.
set -euo pipefail

log() { printf '[restore-db] %s\n' "$*"; }
fail() { printf '[restore-db] FEHLER: %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Usage:
  tools/restore-db.sh --backup <backup.sqlite[.gz]> [--db <target.sqlite>] [--apply]

Options:
  --backup <path>   Required backup file from tools/backup-db.sh.
  --db <path>       Target DB. Default: ARBEITSZEITEN_DB or CORTEX_TENANT_DIR/trunk/workforce/db/arbeitszeiten.sqlite.
  --apply           Swap target DB after verification. Without this: dry-run.
  --keep-current    Keep <db>.pre-restore-<stamp> instead of deleting it.
EOF
}

command -v sqlite3 >/dev/null || fail "sqlite3 nicht gefunden"

BACKUP=""
DB="${ARBEITSZEITEN_DB:-${CORTEX_TENANT_DIR:+$CORTEX_TENANT_DIR/trunk/workforce/db/arbeitszeiten.sqlite}}"
APPLY=0
KEEP_CURRENT=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --backup)
      BACKUP="${2:-}"
      [ -n "$BACKUP" ] || fail "--backup braucht einen Pfad"
      shift 2
      ;;
    --db)
      DB="${2:-}"
      [ -n "$DB" ] || fail "--db braucht einen Pfad"
      shift 2
      ;;
    --apply)
      APPLY=1
      shift
      ;;
    --keep-current)
      KEEP_CURRENT=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "Unbekannte Option: $1"
      ;;
  esac
done

[ -n "$BACKUP" ] || fail "--backup fehlt"
[ -f "$BACKUP" ] || fail "Backup nicht gefunden: $BACKUP"
[ -n "$DB" ] || fail "Weder --db noch ARBEITSZEITEN_DB/CORTEX_TENANT_DIR gesetzt"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
RESTORE_CANDIDATE="$TMP/restore.sqlite"

case "$BACKUP" in
  *.gz) gunzip -c "$BACKUP" > "$RESTORE_CANDIDATE" ;;
  *) cp "$BACKUP" "$RESTORE_CANDIDATE" ;;
esac

RESULT=$(sqlite3 "$RESTORE_CANDIDATE" "PRAGMA integrity_check;")
[ "$RESULT" = "ok" ] || fail "Integritaetspruefung fehlgeschlagen: $RESULT"

for table in employees shifts time_entries auth_users; do
  COUNT=$(sqlite3 "$RESTORE_CANDIDATE" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='$table';")
  [ "$COUNT" = "1" ] || fail "Pflichttabelle fehlt im Backup: $table"
done

ROWS=$(sqlite3 "$RESTORE_CANDIDATE" "SELECT (SELECT COUNT(*) FROM employees) || ' employees, ' || (SELECT COUNT(*) FROM shifts) || ' shifts, ' || (SELECT COUNT(*) FROM time_entries) || ' time_entries';")

if [ "$APPLY" != "1" ]; then
  log "Dry-Run OK: $BACKUP ist wiederherstellbar ($ROWS). Ziel waere: $DB"
  log "Zum Anwenden erneut mit --apply ausfuehren und API vorher stoppen."
  exit 0
fi

mkdir -p "$(dirname "$DB")"
STAMP=$(date +%Y%m%d-%H%M%S)
CURRENT_COPY=""
if [ -f "$DB" ]; then
  CURRENT_COPY="$DB.pre-restore-$STAMP"
  cp "$DB" "$CURRENT_COPY"
  sqlite3 "$CURRENT_COPY" "PRAGMA integrity_check;" >/dev/null
  rm -f "$DB-wal" "$DB-shm"
fi

cp "$RESTORE_CANDIDATE" "$DB"
sqlite3 "$DB" "PRAGMA integrity_check;" >/dev/null

if [ "$KEEP_CURRENT" = "1" ] && [ -n "$CURRENT_COPY" ]; then
  log "Restore OK: $DB ersetzt ($ROWS). Vorheriger Stand: $CURRENT_COPY"
else
  [ -z "$CURRENT_COPY" ] || rm -f "$CURRENT_COPY"
  log "Restore OK: $DB ersetzt ($ROWS)."
fi
