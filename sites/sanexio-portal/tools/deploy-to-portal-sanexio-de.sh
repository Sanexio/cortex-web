#!/usr/bin/env bash
# Deploy sanexio-portal dist/ to portal.sanexio.de via FTPS.
#
# Voraussetzungen:
#   1. cPanel-Subdomain portal.sanexio.de muss angelegt sein
#      (DocRoot typ. /public_html/portal.sanexio.de/).
#   2. ${APP_DIR}/.env.deploy.local mit Pflicht-Vars (siehe --help).
#   3. AutoSSL/Let's Encrypt fuer die Subdomain in cPanel aktiviert
#      (Browser zeigt sonst Cert-Warning).
#
# IP-Block-Vermeidung (Memory-konform):
#   - mirror:parallel-transfer-count 2 (GoDaddy/DF-cPanel-Limit 8, 4 reserved)
#   - Credentials via stdin, nicht -u (ps-Sichtbarkeit)
#   - net:max-retries 3
#   - sleep 4 vor Verify (Hoster-Cache-Settle)
#   - User-Agent "Cortex-Verify" fuer curl-Check
#   - KEIN Triple-Sync in einer Welle: dieses Skript laeuft EINMAL pro
#     Welle, nicht im Loop.
#
# Defaults: --dry-run. --commit schaltet den realen Upload frei.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMMIT=false
SKIP_BUILD=false
SKIP_VERIFY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --commit) COMMIT=true; shift ;;
    --dry-run) COMMIT=false; shift ;;
    --skip-build) SKIP_BUILD=true; shift ;;
    --skip-verify) SKIP_VERIFY=true; shift ;;
    -h|--help)
      cat <<EOF
Aufruf: $(basename "$0") [--dry-run|--commit] [--skip-build] [--skip-verify]

Pflicht-Env in \${APP_DIR}/.env.deploy.local:
  SFTP_HOST=westend-hausarzt.com
  SFTP_USERNAME=claude-backup@westend-hausarzt.com
  SFTP_PASSWORD=...
  SFTP_PORT=21
  REMOTE_PATH=/public_html/portal.sanexio.de
  LIVE_URL=https://portal.sanexio.de

Modi:
  --dry-run      (Default) Build + lftp-Plan ohne Upload.
  --commit       Realer FTPS-Upload.
  --skip-build   Skip 'npm run build' (dist/ muss frisch sein).
  --skip-verify  Skip HTTP-Verify nach Upload.

Exit-Codes:
  0  OK
  1  Generischer Fehler
  2  .env.deploy.local fehlt oder Pflicht-Var nicht gesetzt
  3  Build fehlgeschlagen
  4  lftp nicht installiert
  5  REMOTE_PATH existiert nicht auf Server (Subdomain nicht angelegt?)
EOF
      exit 0
      ;;
    *) echo "Unbekanntes Flag: $1" >&2; exit 1 ;;
  esac
done

ENV_FILE="${APP_DIR}/.env.deploy.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "FEHLER: ${ENV_FILE} fehlt." >&2
  echo "Vorlage: ${APP_DIR}/.env.deploy.template" >&2
  exit 2
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

for var in SFTP_HOST SFTP_USERNAME SFTP_PASSWORD REMOTE_PATH LIVE_URL; do
  if [[ -z "${!var:-}" ]]; then
    echo "FEHLER: \$${var} ist in .env.deploy.local nicht gesetzt." >&2
    exit 2
  fi
done
PORT="${SFTP_PORT:-21}"

command -v lftp >/dev/null 2>&1 || { echo "FEHLER: lftp nicht installiert. brew install lftp." >&2; exit 4; }

if [[ "$SKIP_BUILD" = "false" ]]; then
  echo "=== Build sanexio-portal ==="
  cd "$APP_DIR"
  if ! npm run build; then
    echo "FEHLER: npm run build fehlgeschlagen." >&2
    exit 3
  fi
fi

DIST="${APP_DIR}/dist"
if [[ ! -d "$DIST" ]] || [[ -z "$(ls -A "$DIST" 2>/dev/null)" ]]; then
  echo "FEHLER: ${DIST} fehlt oder ist leer." >&2
  exit 3
fi

DIST_SIZE=$(du -sk "$DIST" | awk '{print $1}')
echo "  dist/ size: ${DIST_SIZE} KB"
if [[ "$DIST_SIZE" -lt 50 ]]; then
  echo "FEHLER: dist/ zu klein (<50 KB) — Build wahrscheinlich kaputt." >&2
  exit 3
fi

DRY_FLAG=""
if [[ "$COMMIT" = "false" ]]; then
  DRY_FLAG="--dry-run"
  echo "=== Mode: DRY-RUN (no upload) ==="
else
  echo "=== Mode: COMMIT (real upload) ==="
fi

echo "  Remote: ftp://${SFTP_HOST}${REMOTE_PATH}"
echo "  Local : ${DIST}"

# Pre-Check: REMOTE_PATH existiert?
echo "=== Pre-Check: REMOTE_PATH existiert? ==="
PRECHECK=$(lftp -p "$PORT" "ftp://$SFTP_HOST" <<EOF 2>&1 | tail -10
user "$SFTP_USERNAME" "$SFTP_PASSWORD"
set ftp:ssl-force true
set ssl:verify-certificate no
set cmd:trace off
set net:max-retries 1
cd "$REMOTE_PATH" && echo PATH_OK || echo PATH_MISSING
quit
EOF
)
echo "$PRECHECK" | tail -3
if ! echo "$PRECHECK" | grep -q "PATH_OK"; then
  echo "FEHLER: REMOTE_PATH ${REMOTE_PATH} existiert nicht." >&2
  echo "Subdomain wahrscheinlich nicht in cPanel angelegt." >&2
  echo "Anleitung: cPanel -> Subdomains -> portal.sanexio.de erstellen," >&2
  echo "DocRoot leer lassen (Default: public_html/portal.sanexio.de)." >&2
  exit 5
fi

# Upload
echo "=== Upload via lftp mirror -R ==="
lftp -p "$PORT" "ftp://$SFTP_HOST" <<EOF 2>&1 | grep -v "^mkdir -p ftp://" || true
user "$SFTP_USERNAME" "$SFTP_PASSWORD"
set ftp:ssl-force true
set ssl:verify-certificate no
set cmd:trace off
set net:max-retries 3
set mirror:parallel-transfer-count 2
mirror -R \
  --only-newer \
  --delete \
  --exclude-glob '.git/' \
  --exclude-glob 'node_modules/' \
  --exclude-glob '*.log' \
  --exclude-glob '.DS_Store' \
  --exclude-glob '.well-known/' \
  $DRY_FLAG \
  "$DIST" \
  "$REMOTE_PATH"
quit
EOF

if [[ "$SKIP_VERIFY" = "true" ]] || [[ "$COMMIT" = "false" ]]; then
  echo "=== Verify skipped (dry-run or --skip-verify) ==="
  exit 0
fi

# Verify mit Cache-settle
echo "=== Verify (sleep 4s for cache-settle) ==="
sleep 4

# Self-signed-tolerant: -k. AutoSSL-Aktivierung ist Stracke-Job.
HTTP_STATUS=$(curl -sSk "$LIVE_URL/" -A "Mozilla/5.0 Cortex-Verify" -o /tmp/portal-verify.html -w '%{http_code}' --max-time 10)
SIZE=$(stat -f "%z" /tmp/portal-verify.html 2>/dev/null || stat -c "%s" /tmp/portal-verify.html 2>/dev/null)
TITLE=$(grep -oE '<title>[^<]+</title>' /tmp/portal-verify.html | head -1 | sed 's|</*title>||g')

echo "  HTTP / ${LIVE_URL}: ${HTTP_STATUS}"
echo "  Bytes              : ${SIZE}"
echo "  Title              : ${TITLE}"

if [[ "$HTTP_STATUS" != "200" ]]; then
  echo "WARN: HTTP ${HTTP_STATUS} (erwartet 200)." >&2
  exit 1
fi
if [[ "$TITLE" != *"Sanexio Portal"* ]]; then
  echo "WARN: Title nicht 'Sanexio Portal ...' (sondern '${TITLE}'). Splash noch aktiv?" >&2
  exit 1
fi

echo
echo "=== DEPLOY OK ==="
