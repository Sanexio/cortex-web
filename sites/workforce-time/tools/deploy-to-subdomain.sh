#!/usr/bin/env bash
# task-3100b6ea5164 — Deploy der Workforce-Time-App auf eine Hosting-Umgebung
# (Default-Ziel arbeitszeiten.westend-hausarzt.com).
#
# Workflow:
#   1. `bun run build` (oder npm run build) — produziert dist/
#   2. server/, dist/, deploy/ + package.json + node_modules-Bun-Bundle werden
#      ueber SFTP zum Hosting hochgeladen.
#   3. Auf dem Hosting: systemctl restart workforce-time (vom Operator).
#
# Default: --dry-run; --commit schaltet den realen Upload frei.
#
# Benoetigt: bash 4+, lftp (brew install lftp). Credentials aus .env
# (SFTP_WORKFORCE_HOST, SFTP_WORKFORCE_USERNAME, SFTP_WORKFORCE_PASSWORD,
# SFTP_WORKFORCE_REMOTE_PATH). Niemals Credentials inline ablegen.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMMIT=false
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --commit) COMMIT=true; shift ;;
    --dry-run) COMMIT=false; shift ;;
    --skip-build) SKIP_BUILD=true; shift ;;
    -h|--help)
      cat <<EOF
Aufruf: $(basename "$0") [--dry-run|--commit] [--skip-build]

  --dry-run     (Default) Build + lftp-Plan ohne Upload.
  --commit      Realer SFTP-Upload.
  --skip-build  Build-Schritt ueberspringen (z.B. wenn dist/ bereits frisch).

Credentials werden aus \${APP_DIR}/.env gelesen:
  SFTP_WORKFORCE_HOST=sftp.example.com
  SFTP_WORKFORCE_USERNAME=workforce-deploy
  SFTP_WORKFORCE_PASSWORD=...
  SFTP_WORKFORCE_REMOTE_PATH=/var/www/arbeitszeiten

Optional:
  SFTP_WORKFORCE_PORT=22

Exit-Codes:
  0  OK
  1  Generischer Fehler
  2  .env fehlt oder Pflicht-Variable nicht gesetzt
  3  Build fehlgeschlagen
  4  lftp nicht installiert
EOF
      exit 0
      ;;
    *) echo "Unbekanntes Flag: $1" >&2; exit 1 ;;
  esac
done

if [[ ! -f "${APP_DIR}/.env" ]]; then
  echo "FEHLER: ${APP_DIR}/.env fehlt. Siehe --help fuer Pflicht-Variablen." >&2
  exit 2
fi

# .env laden (POSIX-konform — keine Shell-Substitution in den Werten erlaubt).
set -a
# shellcheck disable=SC1091
. "${APP_DIR}/.env"
set +a

for var in SFTP_WORKFORCE_HOST SFTP_WORKFORCE_USERNAME SFTP_WORKFORCE_PASSWORD SFTP_WORKFORCE_REMOTE_PATH; do
  if [[ -z "${!var:-}" ]]; then
    echo "FEHLER: \$${var} ist in .env nicht gesetzt." >&2
    exit 2
  fi
done

PORT="${SFTP_WORKFORCE_PORT:-22}"

if ! command -v lftp >/dev/null 2>&1; then
  echo "FEHLER: lftp nicht gefunden. macOS: brew install lftp. Debian: apt install lftp." >&2
  exit 4
fi

cd "${APP_DIR}"

if [[ "${SKIP_BUILD}" == false ]]; then
  echo "[deploy] Build: npm run build"
  if ! npm run build; then
    echo "FEHLER: Build fehlgeschlagen." >&2
    exit 3
  fi
fi

if [[ ! -d dist ]]; then
  echo "FEHLER: dist/ fehlt — Build nicht erfolgreich oder --skip-build ohne vorhandenen Build." >&2
  exit 3
fi

# Manifest der zu uebertragenden Pfade — gezielte Whitelist, kein rsync . .
RSYNC_PATHS=(
  "dist/"
  "server/"
  "deploy/"
  "package.json"
  "package-lock.json"
)

echo
echo "[deploy] Ziel  : sftp://${SFTP_WORKFORCE_USERNAME}@${SFTP_WORKFORCE_HOST}:${PORT}${SFTP_WORKFORCE_REMOTE_PATH}"
echo "[deploy] Lokal : ${APP_DIR}"
echo "[deploy] Mode  : $(${COMMIT} && echo COMMIT || echo DRY-RUN)"
echo "[deploy] Pfade :"
for p in "${RSYNC_PATHS[@]}"; do
  if [[ -e "${p}" ]]; then
    sz=$(du -sh "${p}" 2>/dev/null | awk '{print $1}')
    echo "    - ${p}  (${sz})"
  else
    echo "    - ${p}  (FEHLT, wird uebersprungen)"
  fi
done
echo

if [[ "${COMMIT}" == false ]]; then
  echo "[deploy] DRY-RUN — kein Upload. Mit --commit ausfuehren, um zu pushen."
  exit 0
fi

TMP_SCRIPT="$(mktemp -t workforce-deploy.XXXXXX)"
trap 'rm -f "${TMP_SCRIPT}"' EXIT

{
  echo "set sftp:auto-confirm yes"
  echo "set net:max-retries 2"
  echo "set net:timeout 30"
  echo "open sftp://${SFTP_WORKFORCE_HOST}:${PORT} -u ${SFTP_WORKFORCE_USERNAME},${SFTP_WORKFORCE_PASSWORD}"
  echo "mkdir -fp ${SFTP_WORKFORCE_REMOTE_PATH}"
  echo "cd ${SFTP_WORKFORCE_REMOTE_PATH}"
  for p in "${RSYNC_PATHS[@]}"; do
    [[ -e "${p}" ]] || continue
    if [[ -d "${p}" ]]; then
      base="${p%/}"
      echo "mirror -R --delete --only-newer --exclude-glob .DS_Store --parallel=2 ${p} ${base}"
    else
      echo "put -O . ${p}"
    fi
  done
  echo "bye"
} > "${TMP_SCRIPT}"

echo "[deploy] lftp-Plan:"
sed 's/-u [^,]*,[^ ]*/-u ***,***/' "${TMP_SCRIPT}" | sed 's/^/    /'
echo
echo "[deploy] starte Upload …"

lftp -f "${TMP_SCRIPT}"
echo "[deploy] Upload OK."
echo "[deploy] Auf dem Hosting jetzt: 'sudo systemctl restart workforce-time.service' (systemd) bzw. 'pm2 restart workforce-time' (PM2)."
