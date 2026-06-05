# Ordio-Delta-Import

Diese Pipeline bereitet den Delta-Import seit der letzten Ordio-Baseline
vom **2026-05-24** vor. Sie ist read-only gegen Ordio und schreibt erst
dann in Workforce-Time, wenn der Import explizit ausgelöst wird.

## Sicherheitsrahmen

- Ordio wird nur im Browser gelesen. Keine Schreibaktionen, keine
  Kündigungs-, Lösch- oder Stammdatenänderungen.
- Keine Screenshots, HAR-Dateien oder Echtdaten ins Repo schreiben.
- Secrets werden nicht geloggt. Der Live-Lauf startet nur, wenn
  `~/.cortex/secrets/ordio.env` vorhanden ist und die Laufzeitumgebung
  `ORDIO_BASE_URL`, `ORDIO_EMAIL`, `ORDIO_PASSWORD` enthält.
- Stop-Kriterien: unbekannte Login-Hürde, 2FA/CAPTCHA, sichtbare
  Schreibdialoge, unerwartete Ordio-Fehler, Snapshot-Validierungsfehler.

## Dry-Run ohne Credentials

```bash
npm run ordio:delta -- --dry-run
npm run test:ordio
```

Ohne `--fixture` und ohne `--live` nutzt die CLI automatisch die
anonymisierte Fixture unter `tools/ordio/fixtures/`. Der Dry-Run mappt
auf das Snapshot-Format, validiert Pflichtbezüge und gibt nur Zählwerte
aus.

## Snapshot aus Fixture oder Export

```bash
npm run ordio:delta -- \
  --fixture /pfad/zu/ordio-export.json \
  --out private/imports/import-snapshot.json
```

Das schreibt einen lokalen Snapshot im Format, das
`POST /api/imports/delta-snapshot` bereits importiert. Der Pfad
`private/imports/` ist für lokale Importartefakte gedacht und darf keine
Echtdaten im Git erzeugen.

## Live-Erfassung vorbereiten

```bash
set -a
source ~/.cortex/secrets/ordio.env
set +a

npm run ordio:delta -- \
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
npm run ordio:delta -- \
  --fixture /pfad/zu/geprueftem-snapshot-rohexport.json \
  --out private/imports/import-snapshot.json \
  --post
```

`--post` sendet an `POST /api/imports/delta-snapshot`:

```json
{ "source": "ordio-snapshot", "path": "private/imports/import-snapshot.json" }
```

Wenn Auth aktiv ist, muss `WORKFORCE_SESSION_COOKIE` in der Umgebung
gesetzt sein. Der Cookie wird nicht ausgegeben.
