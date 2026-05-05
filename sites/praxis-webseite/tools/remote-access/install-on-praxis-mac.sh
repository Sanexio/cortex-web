#!/usr/bin/env bash
# Setup-Script: Praxis-Webseite vom Praxis-Mac aus aufrufen
# Auszufuehren AUF DEM PRAXIS-MAC (SSMD-MacBookPro), nicht auf Home-Mac.
#
# Vom Home-Mac per scp rueberholen:
#   scp ~/Cortex/projects/Cortex-Web/sites/praxis-webseite/tools/remote-access/install-on-praxis-mac.sh \
#       <praxis-mac>:~/install-praxis-remote.sh
# Dann auf Praxis-Mac:
#   bash ~/install-praxis-remote.sh

set -euo pipefail

HOME_MAC_TS_IP="100.89.44.67"
SITE_HOST="gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local"
SITE_PORT="10003"

echo "==> Praxis-Webseite Remote-Setup"
echo "    Home-Mac (Tailscale): ${HOME_MAC_TS_IP}"
echo "    Site-Hostname:        ${SITE_HOST}"
echo

# 1. Voraussetzungen pruefen
echo "==> Pruefe Voraussetzungen ..."
if ! command -v tailscale >/dev/null 2>&1; then
  echo "FEHLER: tailscale nicht installiert."
  exit 1
fi

if ! tailscale status >/dev/null 2>&1; then
  echo "FEHLER: tailscale laeuft nicht. Bitte starten."
  exit 1
fi

if ! tailscale ping -c 1 cluster-mini-02 >/dev/null 2>&1; then
  echo "FEHLER: cluster-mini-02 ist im Tailnet nicht erreichbar."
  exit 1
fi
echo "    [OK] Tailscale + Mesh-Verbindung"

# 2. Erreichbarkeit des Master-nginx pruefen
if curl -skI -m 5 -H "Host: ${SITE_HOST}" "https://${HOME_MAC_TS_IP}/" 2>/dev/null | grep -qE "^HTTP/[12]"; then
  echo "    [OK] Master-nginx auf Home-Mac antwortet"
else
  echo "WARNUNG: Master-nginx auf Home-Mac antwortet nicht."
  echo "    Pruefe auf Home-Mac, ob Local-Site laeuft."
fi

# 3. /etc/hosts-Eintrag (Variante A)
HOSTS_LINE="${HOME_MAC_TS_IP}   ${SITE_HOST}"
if grep -qF "${SITE_HOST}" /etc/hosts; then
  echo "    [SKIP] /etc/hosts enthaelt bereits einen Eintrag fuer ${SITE_HOST}"
else
  echo "==> Trage Eintrag in /etc/hosts ein (sudo)"
  echo "${HOSTS_LINE}" | sudo tee -a /etc/hosts >/dev/null
  echo "    [OK] hinzugefuegt: ${HOSTS_LINE}"
fi

# 4. zsh-Alias fuer SSH-Tunnel (Variante B Fallback)
if ! grep -q "alias praxis-tunnel=" "${HOME}/.zshrc" 2>/dev/null; then
  echo "==> Lege zsh-Alias 'praxis-tunnel' an"
  cat >> "${HOME}/.zshrc" <<EOF

# Praxis-Webseite SSH-Tunnel (Fallback) — siehe Cortex-Web/sites/praxis-webseite/tools/remote-access/
alias praxis-tunnel='ssh -L 8080:localhost:${SITE_PORT} cluster-mini-02'
EOF
  echo "    [OK] Alias hinzugefuegt. Neue Shell starten oder: source ~/.zshrc"
else
  echo "    [SKIP] Alias 'praxis-tunnel' existiert bereits"
fi

# 5. End-to-End-Test
echo
echo "==> End-to-End-Test"
if curl -skI -m 5 "https://${SITE_HOST}/" | grep -qE "^HTTP/[12] 200"; then
  echo "    [OK] Site antwortet via https://${SITE_HOST}/"
else
  echo "    [WARN] Site antwortet noch nicht. Browser-Aufruf testen, ggf. Zert-Warnung akzeptieren."
fi

echo
echo "==> FERTIG"
echo
echo "    Variante A (empfohlen):"
echo "      Browser: https://${SITE_HOST}/"
echo "      WP-Admin: https://${SITE_HOST}/wp-admin"
echo
echo "    Variante B (Fallback):"
echo "      Terminal:  praxis-tunnel"
echo "      Browser:   http://localhost:8080"
