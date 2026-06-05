# T-101: Lokales Subdomain-Setup mit Caddy + Mailpit

Ziel: Workforce-Time lokal unter einer echten Subdomain-Form testen,
ohne Production-DNS oder externe SMTP-Zugänge zu verwenden.

## Zieladressen

| Dienst | URL |
|---|---|
| Workforce-Time | `http://arbeitszeiten.localhost` |
| Mailpit UI | `http://mail.arbeitszeiten.localhost` |
| API direkt | `http://127.0.0.1:5175/api/health` |
| SMTP lokal | `127.0.0.1:1025` |

`.localhost` ist für Loopback reserviert; normalerweise ist kein
`/etc/hosts`-Eintrag nötig.

## Start

Terminal 1:

```bash
cd sites/workforce-time
docker compose -f deploy/local/compose.mailpit.yml up
```

Terminal 2:

```bash
cd sites/workforce-time
npm run dev
```

Terminal 3:

```bash
cd sites/workforce-time
caddy run --config deploy/local/Caddyfile --adapter caddyfile
```

Wenn Caddy bereits Ports belegt, `WORKFORCE_LOCAL_HOST` und
`WORKFORCE_MAILPIT_HOST` auf andere `.localhost`-Namen setzen.

## SMTP/Magic-Link gegen Mailpit

Für einen vollständigen Login-Smoke muss der aktive Tenant einen
`workforce.auth.smtp`-Block auf Mailpit zeigen:

```json
{
  "workforce": {
    "auth": {
      "public_base_url": "http://arbeitszeiten.localhost",
      "smtp": {
        "host": "127.0.0.1",
        "port": 1025,
        "secure": false,
        "require_tls": false
      }
    }
  }
}
```

Im Demo-Dev-Modus ist Auth bewusst deaktiviert (`npm run dev` setzt
`WORKFORCE_AUTH_DISABLE=1`). Für einen Auth-Smoke lokal stattdessen die
API gezielt mit Auth starten:

```bash
WORKFORCE_AUTH_ENFORCE=1 \
WORKFORCE_PUBLIC_BASE_URL=http://arbeitszeiten.localhost \
ARBEITSZEITEN_API_HOST=127.0.0.1 \
ARBEITSZEITEN_API_PORT=5175 \
node server/api.js
```

Magic-Link-Mails erscheinen dann in Mailpit. Keine echten SMTP-Secrets
oder externen Postfächer verwenden.

## Smoke-Check

```bash
curl -fsS http://arbeitszeiten.localhost/api/health
curl -fsS http://mail.arbeitszeiten.localhost/api/v1/messages
```

Erwartung:

- `/api/health` antwortet über Caddy.
- Mailpit ist über die Subdomain erreichbar.
- Browser-Reloads auf App-Routen fallen über Vite korrekt zurück.
- Es werden keine Mails nach außen versendet.
