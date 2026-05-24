#!/usr/bin/env bash
# tools/sync-local-to-com.sh — Local → .com Live Theme-Sync (PRODUCTION)
#
# Inkrementelles Push des Local-Praxiszentrum-Themes auf westend-hausarzt.com
# via FTPS. Production-Sibling zu sync-local-to-de.sh — REMOTE = praxis2021/
# (Domain-Mapping: .com docroot ist praxis2021/, nicht public_html/).
#
# Domain-Rollen (Stand 2026-05-19): .com = Live customer-facing,
# .de 301→.com. .com-Push ist der eigentliche Patient-sichtbare Deploy.
#
# Usage:
#   ./tools/sync-local-to-com.sh                  # theme + verify (Default)
#   ./tools/sync-local-to-com.sh --theme          # nur theme push
#   ./tools/sync-local-to-com.sh --verify         # nur verify
#   ./tools/sync-local-to-com.sh --dry-run        # lftp im --dry-run-Mode
#   ./tools/sync-local-to-com.sh --skip-git-check # Pre-Push-Guard überspringen
#
# Pre-Push-Guard:
# Theme muss committet UND auf GitHub gepusht sein. Sonst Exit 3.
#
# Vorbedingungen:
#   - .env.sprint1.local mit SFTP_COM_* gesetzt
#   - lftp installiert (`brew install lftp`)
#   - Local-Theme-Pfad existiert
#
# Exit-Codes: 0 = ok, 1 = fail, 2 = config, 3 = pre-push-guard

set -euo pipefail

DO_THEME=0
DO_VERIFY=0
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

: "${SFTP_COM_HOST:?SFTP_COM_HOST not set}"
: "${SFTP_COM_PORT:?SFTP_COM_PORT not set}"
: "${SFTP_COM_USERNAME:?SFTP_COM_USERNAME not set}"
: "${SFTP_COM_PASSWORD:?SFTP_COM_PASSWORD not set}"

LOCAL_THEME="/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum"
REMOTE_THEME="praxis2021/wp-content/themes/praxiszentrum"

if [ "$DO_THEME" = "1" ]; then
  if [ ! -d "$LOCAL_THEME" ]; then
    echo "FAIL: Local theme not found at $LOCAL_THEME" >&2
    exit 1
  fi

  if [ "$SKIP_GIT_CHECK" = "0" ]; then
    if [ -d "$LOCAL_THEME/.git" ]; then
      echo "=== Pre-Push-Guard: Theme-Repo prüfen ==="
      THEME_DIRTY=$(git -C "$LOCAL_THEME" status --porcelain 2>/dev/null | head -1)
      if [ -n "$THEME_DIRTY" ]; then
        echo "FAIL: Local-Theme hat uncommittete Änderungen." >&2
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
        exit 3
      else
        echo "  ✓ Theme-Repo synchron mit Remote (HEAD $(echo "$THEME_LOCAL_HEAD" | cut -c1-7))"
      fi
    else
      echo "WARN: $LOCAL_THEME ist kein Git-Repo — Pre-Push-Guard übersprungen." >&2
    fi
    echo ""
  fi

  echo "=== Theme-Sync Local → .com LIVE ==="
  echo "  Local : $LOCAL_THEME"
  echo "  Remote: $REMOTE_THEME"
  if [ "$DRY_RUN" = "1" ]; then
    echo "  Mode  : DRY-RUN (no upload)"
    DRY_FLAG="--dry-run"
  else
    DRY_FLAG=""
  fi
  echo ""

  # GoDaddy/DF-cPanel: FTPS-Connection-Limit 8, deshalb parallel=2 (statt 4 .de).
  # Per Memory `GoDaddy/DF cPanel FTPS Connection-Limit 8`.
  lftp -u "$SFTP_COM_USERNAME","$SFTP_COM_PASSWORD" -p "$SFTP_COM_PORT" "ftp://$SFTP_COM_HOST" <<EOF 2>&1 | grep -v "^mkdir -p ftp://" || true
set ftp:ssl-force true
set ssl:verify-certificate no
set cmd:trace off
set net:max-retries 3
set mirror:parallel-transfer-count 2
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

if [ "$DO_VERIFY" = "1" ]; then
  echo "=== Live-Verify .com (Theme-Version + HTTP) ==="
  EXPECTED_VER=$(grep -oE "PXZ_VERSION', '[0-9.]+'" "$LOCAL_THEME/functions.php" | grep -oE "[0-9]+\.[0-9]+\.[0-9]+")
  echo "  Expected PXZ_VERSION: $EXPECTED_VER"
  sleep 4  # Hoster-Cache settle
  LIVE_VER=$(curl -sS "https://westend-hausarzt.com/wp-content/themes/praxiszentrum/functions.php?v=$(date +%s)" -A "Mozilla/5.0 Cortex-Verify" 2>/dev/null \
    || curl -sS "https://westend-hausarzt.com/" -A "Mozilla/5.0 Cortex-Verify" 2>/dev/null | grep -oE "ver=[0-9]+\.[0-9]+\.[0-9]+" | head -1 | sed 's/ver=//')
  HTTP_STATUS=$(curl -sS "https://westend-hausarzt.com/" -A "Mozilla/5.0 Cortex-Verify" -o /dev/null -w '%{http_code}')
  CSS_VER=$(curl -sS "https://westend-hausarzt.com/" -A "Mozilla/5.0 Cortex-Verify" 2>/dev/null | grep -oE 'praxiszentrum[^"]*ver=[0-9.]+' | head -1)
  echo "  HTTP / .com : $HTTP_STATUS"
  echo "  CSS-Ver-Stamp: $CSS_VER"
fi

echo ""
echo "=== sync-local-to-com.sh done ==="
