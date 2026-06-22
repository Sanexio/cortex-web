# Legacy-Delta-Import

Diese Pipeline bereitet den Delta-Import seit der letzten Legacy-Import-Baseline
vom **2026-05-24** vor. Sie ist read-only gegen Legacy-Import und schreibt erst
dann in Workforce-Time, wenn der Import explizit ausgelöst wird.

## Sicherheitsrahmen

- Legacy-Import wird nur im Browser gelesen. Keine Schreibaktionen, keine
  Kündigungs-, Lösch- oder Stammdatenänderungen.
- Keine Screenshots, HAR-Dateien oder Echtdaten ins Repo schreiben.
- Secrets werden nicht geloggt. Der Live-Lauf startet nur, wenn
  `~/.cortex/secrets/legacy-import.env` vorhanden ist und die Laufzeitumgebung
  `LEGACY_BASE_URL`, `LEGACY_EMAIL` (oder `LEGACY_USER`), `LEGACY_PASSWORD` enthält.
- Stop-Kriterien: unbekannte Login-Hürde, 2FA/CAPTCHA, sichtbare
  Schreibdialoge, unerwartete Legacy-Import-Fehler, Snapshot-Validierungsfehler.

## Dry-Run ohne Credentials

```bash
npm run legacy-import:delta -- --dry-run
npm run test:legacy-import
```

Ohne `--fixture` und ohne `--live` nutzt die CLI automatisch die
anonymisierte Fixture unter `tools/legacy-import/fixtures/`. Der Dry-Run mappt
auf das Snapshot-Format, validiert Pflichtbezüge und gibt nur Zählwerte
aus.

## Snapshot aus Fixture oder Export

```bash
npm run legacy-import:delta -- \
  --fixture /pfad/zu/legacy-import-export.json \
  --out private/imports/import-snapshot.json
```

Das schreibt einen lokalen Snapshot im Format, das
`POST /api/imports/delta-snapshot` bereits importiert. Der Pfad
`private/imports/` ist für lokale Importartefakte gedacht und darf keine
Echtdaten im Git erzeugen.

## Live-Erfassung vorbereiten

```bash
set -a
source ~/.cortex/secrets/legacy-import.env
set +a

npm run legacy-import:delta -- \
  --live \
  --dry-run \
  --from 2026-05-25 \
  --to 2026-06-05
```

Playwright wird erst im Live-Pfad dynamisch importiert. Wenn Browser oder
Chromium noch nicht installiert sind, bleiben Fixture-Dry-Run und Tests
weiter lauffähig.

## Import in Workforce-Time

Vor dem echten Import:

1. Dry-Run ausführen und Zählwerte prüfen.
2. Snapshot in `private/imports/import-snapshot.json` schreiben.
3. Datenbank-Backup erzeugen.
4. API lokal mit Admin-Session starten.

```bash
npm run legacy-import:delta -- \
  --fixture /pfad/zu/geprueftem-snapshot-rohexport.json \
  --out private/imports/import-snapshot.json \
  --post
```

`--post` sendet an `POST /api/imports/delta-snapshot`:

```json
{ "source": "legacy-snapshot", "path": "private/imports/import-snapshot.json" }
```

Wenn Auth aktiv ist, muss `WORKFORCE_SESSION_COOKIE` in der Umgebung
gesetzt sein. Der Cookie wird nicht ausgegeben.
