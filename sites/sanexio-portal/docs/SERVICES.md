# Sanexio-Portal — Persistent Services (macOS LaunchAgents)

Drei LaunchAgents laufen den vollen Stack im Hintergrund, sodass der
Footer-Klick im Praxis-Theme immer ein erreichbares Portal trifft.

| Label                       | Port | Was es macht                              |
|-----------------------------|------|-------------------------------------------|
| `de.sanexio.portal`         | 5176 | Sanexio-Portal (Vite Dev-Server)         |
| `de.sanexio.workforce-web`  | 5174 | Workforce-Time Frontend (Vite)            |
| `de.sanexio.workforce-api`  | 5175 | Workforce-Time Backend (Node + SQLite)    |

## Installation auf einem neuen Mac

```bash
# Repos klonen, dependencies installieren
cd ~/Cortex/projects/Cortex-Web/sites/sanexio-portal && npm install
cd ~/Cortex/projects/Cortex-Web/sites/workforce-time && npm install

# Plists nach Vorlage anlegen und Pfade an dein Setup anpassen:
#  - WorkingDirectory (Repo-Root)
#  - EnvironmentVariables → CORTEX_TENANT_DIR, ARBEITSZEITEN_EXTRA_ORIGINS
#  - StandardOutPath / StandardErrorPath
# Vorlagen sind in install/ abgelegt.

cp install/de.sanexio.portal.plist        ~/Library/LaunchAgents/
cp install/de.sanexio.workforce-api.plist ~/Library/LaunchAgents/
cp install/de.sanexio.workforce-web.plist ~/Library/LaunchAgents/

# Bootstrappen
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/de.sanexio.portal.plist
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/de.sanexio.workforce-api.plist
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/de.sanexio.workforce-web.plist
```

## Status / Smoke-Check

```bash
launchctl list | grep sanexio
for p in 5174 5175 5176; do
  echo "port $p → HTTP $(curl -sI -o /dev/null -w '%{http_code}' http://127.0.0.1:$p/)"
done
curl -s http://127.0.0.1:5175/api/health | jq
```

Erwartet:

```
port 5174 → HTTP 200
port 5175 → HTTP 401   ← korrekt, /api/* unter Auth-Gate
port 5176 → HTTP 200
{"ok":true,"database":"sqlite",...}
```

## Restart / Stop

```bash
# Restart einzelner Service
launchctl kickstart -k gui/$UID/de.sanexio.portal

# Stop einzelner Service (bleibt geladen, läuft aber nicht)
launchctl bootout gui/$UID/de.sanexio.portal

# Komplett deinstallieren (LaunchAgent entfernen)
launchctl bootout gui/$UID ~/Library/LaunchAgents/de.sanexio.portal.plist
rm ~/Library/LaunchAgents/de.sanexio.portal.plist
```

## Logs

```
~/Library/Logs/cortex-services/
  sanexio-portal.{log,err.log}
  workforce-api.{log,err.log}
  workforce-web.{log,err.log}
```

## Login

Portal-Login: `Sanexio / Sanexio` (Dev-Default).
Override per Build-ENV `VITE_PORTAL_USER` + `VITE_PORTAL_PASS`
(siehe `src/components/LoginGate.tsx`).

Welle P.2 ersetzt diesen Dev-Login durch Magic-Link-Auth analog
Workforce-Time (siehe `~/Cortex/Nexus/specs/workforce-time-cutover/
03_AUTH_ARCHITECTURE.md`).
