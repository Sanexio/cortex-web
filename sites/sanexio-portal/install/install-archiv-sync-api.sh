#!/usr/bin/env bash
# Installiert den ARCHIV-Sync-API-LaunchAgent auf dem aktuellen Mac.
# Idempotent — re-run bootstrap'et neu, falls Plist sich geändert hat.
#
# WICHTIG · TCC/FDA (siehe Nexus-Memory feedback_launchagent_icloud_tcc.md):
# Der LaunchAgent kann das archiv-icloud-sync.sh nur erfolgreich rsync'en,
# wenn das aufrufende Node-Binary einen Full-Disk-Access-Eintrag hat.
# Manueller Schritt nach Install:
#   Systemeinstellungen → Datenschutz & Sicherheit → Festplattenvollzugriff
#   → "+" → /opt/homebrew/opt/node@22/bin/node hinzufügen + aktivieren.

set -euo pipefail

LABEL="de.sanexio.archiv-sync-api"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLIST_SRC="$SCRIPT_DIR/$LABEL.plist"
PLIST_DST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG_DIR="$HOME/Library/Logs/cortex-services"

[[ -f "$PLIST_SRC" ]] || { echo "FATAL: plist-Template fehlt: $PLIST_SRC" >&2; exit 1; }

# Node-Binary detektieren — bevorzugt @22 (Konsistenz mit workforce-api),
# Fallback in Reihenfolge: @22 → @20 → @25 → generisches node-Keg → PATH.
NODE_BIN=""
for cand in \
  /opt/homebrew/opt/node@22/bin/node \
  /opt/homebrew/opt/node@20/bin/node \
  /opt/homebrew/opt/node@25/bin/node \
  /opt/homebrew/opt/node/bin/node \
  /usr/local/opt/node@22/bin/node \
  /usr/local/opt/node@20/bin/node \
  /usr/local/opt/node/bin/node \
  "$(command -v node 2>/dev/null)"; do
  if [[ -n "$cand" && -x "$cand" ]]; then
    NODE_BIN="$cand"
    break
  fi
done
[[ -n "$NODE_BIN" ]] || { echo "FATAL: kein node-Binary gefunden (brew install node)" >&2; exit 2; }
NODE_DIR="$(dirname "$NODE_BIN")"

echo "→ node:    $NODE_BIN ($("$NODE_BIN" --version))"
echo "→ plist:   $PLIST_DST"
echo "→ logs:    $LOG_DIR"

mkdir -p "$HOME/Library/LaunchAgents" "$LOG_DIR"

# Plist-Template platzhalter-substituieren.
sed -e "s|\${HOME}|$HOME|g" \
    -e "s|__NODE_BIN__|$NODE_BIN|g" \
    -e "s|__NODE_DIR__|$NODE_DIR|g" \
    "$PLIST_SRC" > "$PLIST_DST"

uid="$(id -u)"
target="gui/$uid/$LABEL"

# Bootout falls bereits geladen, danach bootstrap.
launchctl bootout "gui/$uid" "$PLIST_DST" 2>/dev/null || true
launchctl bootstrap "gui/$uid" "$PLIST_DST"
launchctl enable "$target"
launchctl kickstart -k "$target" || true

# Smoke-Test gegen /health.
sleep 1
if curl -sS -m 3 http://127.0.0.1:5177/health >/dev/null 2>&1; then
  echo "OK · $LABEL läuft auf 127.0.0.1:5177"
else
  echo "WARN · $LABEL gebootstrap'et, /health antwortet noch nicht. Logs:"
  echo "  tail -f $LOG_DIR/archiv-sync-api.log"
  echo "  tail -f $LOG_DIR/archiv-sync-api.err.log"
fi

echo
echo "WICHTIGER NACHARBEITS-SCHRITT:"
echo "  Settings → Datenschutz & Sicherheit → Festplattenvollzugriff →"
echo "  '+' → $NODE_BIN hinzufügen → Toggle aktivieren."
echo "  (alternativ Finder: cmd+shift+G → $NODE_DIR → node markieren → ins FDA-Fenster ziehen)"
echo "  Ohne FDA kann der LaunchAgent zwar starten, aber rsync nach iCloud-Drive scheitert silent."
