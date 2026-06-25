#!/usr/bin/env bash
# Rotates the .com FTP password in BOTH sanexio-portal/.env.deploy.local
# AND Sanexio-Tenant/sites/praxis-webseite/.env.sprint1.local in one
# silent prompt.
#
# Hintergrund: beide Sites teilen den FTP-User claude-backup@westend-
# hausarzt.com. Wird das Pass im cPanel rotiert, muessen beide env-
# Files mitziehen, sonst bricht entweder praxis-webseite-Sync oder
# portal-Deploy.
#
# Voraussetzungen:
# 1. cPanel -> FTP-Accounts -> claude-backup@westend-hausarzt.com
#    -> "Change Password" -> neues Pass setzen + in Zwischenablage
# 2. Dieses Skript ausfuehren
# 3. Pass im silent prompt einfuegen (2x)
#
# Sicher:
# - Pass landet NIE in History (read -s)
# - Pass landet NIE im Terminal-Echo
# - Python-Write (kein sed-Special-Char-Risiko)
# - Beide env-Files chmod 600

set -euo pipefail

PRAXIS_ENV="$HOME/Cortex/projects/Sanexio-Tenant/sites/praxis-webseite/.env.sprint1.local"
PORTAL_ENV="$HOME/Cortex/projects/Cortex-Web/sites/sanexio-portal/.env.deploy.local"

for f in "$PRAXIS_ENV" "$PORTAL_ENV"; do
  if [[ ! -f "$f" ]]; then
    echo "FAIL: $f existiert nicht." >&2
    exit 1
  fi
done

echo "FTP-Pass-Rotation fuer claude-backup@westend-hausarzt.com"
echo "Voraussetzung: Du hast das Pass im cPanel bereits neu gesetzt."
echo
echo "Neues Passwort (Eingabe wird NICHT angezeigt):"
read -rs NEW_PASS
echo
echo "Bitte wiederholen:"
read -rs NEW_PASS2
echo

if [[ "$NEW_PASS" != "$NEW_PASS2" ]]; then
  echo "FAIL: Passwoerter stimmen nicht ueberein." >&2
  unset NEW_PASS NEW_PASS2
  exit 1
fi
unset NEW_PASS2

if [[ -z "$NEW_PASS" ]]; then
  echo "FAIL: leeres Passwort abgelehnt." >&2
  exit 1
fi

update_env() {
  local file="$1"
  local var="$2"
  local tmp
  tmp="$(mktemp)"
  NEW_PASS="$NEW_PASS" VAR="$var" python3 - "$file" "$tmp" <<'PY'
import os, sys
src, dst = sys.argv[1], sys.argv[2]
var = os.environ["VAR"]
val = os.environ["NEW_PASS"]
new_line = f"{var}={val}\n"
found = False
with open(src) as fh, open(dst, "w") as out:
    for line in fh:
        if line.startswith(f"{var}="):
            out.write(new_line)
            found = True
        else:
            out.write(line)
    if not found:
        out.write(new_line)
PY
  chmod 600 "$tmp"
  mv "$tmp" "$file"
  echo "  updated: $file  ($var)"
}

echo "=== Sync .env-Files ==="
update_env "$PRAXIS_ENV" "SFTP_COM_PASSWORD"
update_env "$PORTAL_ENV" "SFTP_PASSWORD"

unset NEW_PASS

echo
echo "=== Verify (Single FTP-Connect mit neuem Pass) ==="
set -a
# shellcheck disable=SC1090
. "$PORTAL_ENV"
set +a

VERIFY=$(lftp -p "${SFTP_PORT:-21}" "ftp://$SFTP_HOST" <<EOF 2>&1 | tail -3
user "$SFTP_USERNAME" "$SFTP_PASSWORD"
set ftp:ssl-force true
set ssl:verify-certificate no
set cmd:trace off
set net:max-retries 1
cd "$REMOTE_PATH" && echo AUTH_OK || echo AUTH_FAIL
quit
EOF
)
if echo "$VERIFY" | grep -q "AUTH_OK"; then
  echo "  OK: FTP-Login mit neuem Pass erfolgreich, REMOTE_PATH erreichbar."
else
  echo "FAIL: FTP-Login fehlgeschlagen mit neuem Pass." >&2
  echo "$VERIFY" >&2
  exit 1
fi

echo
echo "=== ROTATION OK ==="
echo "Beide .env-Files updated, FTP-Verify gruen."
