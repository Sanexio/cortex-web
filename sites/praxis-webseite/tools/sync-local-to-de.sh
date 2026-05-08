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
#   ./tools/sync-local-to-de.sh --skip-git-check # Pre-Push-Guard überspringen (nicht empfohlen)
#
# Pre-Push-Guard (seit 2026-05-08, Welle Repo-Workflow):
# Vor jedem Theme-Sync wird geprüft, ob der Local-Theme-Stand committet ist
# UND auf GitHub gepusht wurde. Sonst: Stop mit Exit 3.
# Begründung: Reihenfolge Git-Push -> lftp-Sync ist verbindlich, sonst gibt es
# einen Live-Stand, der nirgendwo dokumentiert ist (= kein Rollback möglich).
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
SKIP_GIT_CHECK=0

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
    --skip-git-check) SKIP_GIT_CHECK=1; shift ;;
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

  # --- Pre-Push-Guard: Theme muss committet UND gepusht sein ---
  # (überspringbar mit --skip-git-check, aber dann kein Rollback-Anker)
  if [ "$SKIP_GIT_CHECK" = "0" ]; then
    if [ -d "$LOCAL_THEME/.git" ]; then
      echo "=== Pre-Push-Guard: Theme-Repo prüfen ==="
      THEME_DIRTY=$(git -C "$LOCAL_THEME" status --porcelain 2>/dev/null | head -1)
      if [ -n "$THEME_DIRTY" ]; then
        echo "FAIL: Local-Theme hat uncommittete Änderungen." >&2
        echo "      Reihenfolge: erst commit + push, dann sync." >&2
        echo "      Override: --skip-git-check (kein Rollback-Anker dann)." >&2
        git -C "$LOCAL_THEME" status --short >&2
        exit 3
      fi

      THEME_LOCAL_HEAD=$(git -C "$LOCAL_THEME" rev-parse HEAD 2>/dev/null || echo "")
      THEME_REMOTE_HEAD=$(git -C "$LOCAL_THEME" rev-parse '@{u}' 2>/dev/null || echo "")
      if [ -z "$THEME_REMOTE_HEAD" ]; then
        echo "WARN: Theme-Branch hat keinen Upstream — überspringe Push-Check." >&2
      elif [ "$THEME_LOCAL_HEAD" != "$THEME_REMOTE_HEAD" ]; then
        AHEAD=$(git -C "$LOCAL_THEME" rev-list --count '@{u}..HEAD' 2>/dev/null || echo "?")
        echo "FAIL: Theme-Repo ist $AHEAD Commit(s) vor GitHub-Remote." >&2
        echo "      Bitte erst 'git push' im Theme-Repo, dann sync wiederholen." >&2
        echo "      Override: --skip-git-check." >&2
        exit 3
      else
        echo "  ✓ Theme-Repo synchron mit Remote (HEAD $(echo "$THEME_LOCAL_HEAD" | cut -c1-7))"
      fi
    else
      echo "WARN: $LOCAL_THEME ist kein Git-Repo — Pre-Push-Guard übersprungen." >&2
    fi
    echo ""
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
