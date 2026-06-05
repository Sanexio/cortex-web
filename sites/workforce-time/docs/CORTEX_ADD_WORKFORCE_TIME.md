# T-201: `cortex add workforce-time` — Install-Manifest

Dieses Repo enthaelt keine Cortex-CLI-Implementierung. Der vorbereitete
Integrationspunkt ist daher ein Manifest plus Setup-Wizard:

- `install/workforce-time.manifest.json`
- `tools/setup-workforce-tenant.mjs`

Eine spaetere CLI kann das Manifest lesen und nach `afterAdd` delegieren.
Bis dahin kann der Wizard direkt genutzt werden.

## Dry-Run

```bash
node tools/setup-workforce-tenant.mjs \
  --tenant-dir /pfad/zum/tenant \
  --slug demo-praxis \
  --tenant-name "Demo Praxis" \
  --host arbeitszeiten.localhost \
  --admin-email admin@example.test \
  --dry-run
```

## Anwenden

```bash
node tools/setup-workforce-tenant.mjs \
  --tenant-dir /pfad/zum/tenant \
  --slug demo-praxis \
  --tenant-name "Demo Praxis" \
  --host arbeitszeiten.localhost \
  --admin-email admin@example.test
```

Der Wizard legt nur generische Workforce-Time-Strukturen an:

- `trunk/workforce/db/`
- `trunk/workforce/imports/`
- `trunk/workforce/seed.json`, falls noch nicht vorhanden
- `tenant.config.json` mit `workforce.*`-Block oder Merge in einen
  bestehenden Block

Er schreibt keine Secrets. SMTP-Passwoerter und `WORKFORCE_TOTP_KEY`
bleiben Umgebung/Passwortmanager.

## Offene Cortex-CLI-Aufgaben

- Manifest-Schema zentral definieren.
- `cortex add workforce-time` auf `install/workforce-time.manifest.json`
  mappen.
- Tenant-Repo-Write explizit bestaetigen lassen.
- Nach dem Add automatisch `npm run build` und `npm run test:backup`
  ausfuehren.
