# Feature-Build #17 — Apple-Health-Import (Variante B, ephemer, Standalone-Token)

**Status:** 🏗️ Build (PXZ 2.7.296, Welle S80)
**Vorlage:** `specs-external/apple-health.md` Variante B
**Architektur-Wahl (2026-05-23, Dr. Stracke „los"):**

1. **Träger:** Standalone-Token-Upload statt #18-Patient-Portal — kein Magic-Link-Portal nötig.
2. **DSFA-Reihenfolge:** Local-Build durchziehen, Live-Schaltung gated bis Datenschutzbeauftragte:r grün gibt.
3. **Persistenz:** ephemer via Transient (TTL 7 d), keine WP-Posts, kein File-Disk-Persist. Originale werden nach Parser-Lauf sofort verworfen.

## Datenfluss

```
Admin (Praxis-Backoffice)
  └─ WP-Admin „Apple-Health-Import" → Generate Upload-Link
       └─ Token (32 ch), Transient pxz_aht_<token> = {status:'waiting', lang, label, created_at}
       └─ Display Magic-URL + QR-Code
       └─ Praxis sendet Link selbst per Mail (kein Tier-3-Versand vom System)

Patient
  └─ Magic-URL /health-upload/<token>
       └─ Upload-Form (ZIP-Picker, max 100 MB, Datenschutz-Hinweis, Submit)
       └─ POST → Parser (XMLReader streaming)
            ├─ Filter: nur Records letzte 30 Tage
            ├─ Aggregat pro Type: median/sum pro Tag + summary (min/max/median/latest)
            └─ Transient pxz_aht_<token> = {status:'received', received_at, trends:[…]}

Admin
  └─ Liste „Aktive Upload-Links" zeigt Status (waiting | received | expired)
  └─ Click „Anzeigen" → Trend-Dashboard (Sparklines pro Type)
  └─ Button „Jetzt löschen" → delete_transient

Auto-Cleanup
  └─ TTL 7 d → WP räumt Transient selbst auf
```

## Datentypen (10 wichtigste)

| Apple-Health Identifier | Anzeige | Aggregat |
|---|---|---|
| `HKQuantityTypeIdentifierHeartRate` | Puls (1/min) | Median pro Tag |
| `HKQuantityTypeIdentifierRestingHeartRate` | Ruhepuls | Mittelwert pro Tag |
| `HKQuantityTypeIdentifierBloodPressureSystolic` | RR systolisch (mmHg) | Median pro Tag |
| `HKQuantityTypeIdentifierBloodPressureDiastolic` | RR diastolisch (mmHg) | Median pro Tag |
| `HKQuantityTypeIdentifierOxygenSaturation` | SpO₂ (%) | Median pro Tag |
| `HKQuantityTypeIdentifierStepCount` | Schritte | Summe pro Tag |
| `HKQuantityTypeIdentifierActiveEnergyBurned` | Aktiv-kcal | Summe pro Tag |
| `HKQuantityTypeIdentifierBodyMass` | Gewicht (kg) | Letzter Wert pro Tag |
| `HKQuantityTypeIdentifierBodyTemperature` | Körpertemperatur (°C) | Median pro Tag |
| `HKCategoryTypeIdentifierSleepAnalysis` | Schlaf (h) | Summe „inBed"-Minuten pro Tag → h |

## DSGVO-Anker

- **Art. 9 DSGVO:** Gesundheitsdaten — explizite Einwilligung des Patienten via Upload-Form-Checkbox.
- **Art. 32 DSGVO:** Datenminimierung — nur 10 Aggregate, kein Roh-XML, keine PII.
- **Art. 35 DSGVO:** **DSFA pflichtig vor Live.** Lokal-Build darf produktiv getestet werden, Live-Schaltung erst nach DSFA-Freigabe.
- **AVV:** keiner nötig (keine Drittverarbeitung, alles im WP).
- **Löschkonzept:** TTL 7 d hart, manueller Lösch-Button zusätzlich.

## REST-Routes

- `GET /wp-json/pxz/v1/health/upload-form/<token>` — HTML-Form (rendert Upload-Template)
- `POST /wp-json/pxz/v1/health/upload/<token>` — multipart/form-data, ZIP-Upload
- Permission: `__return_true` — Token im Path = Capability. Konstante-Time-Check gegen Transient-Existenz.

## Files

- `inc/online-services/apple-health.php` — Backend, Admin-UI, REST, Parser, Sparkline-Renderer
- `assets/css/apple-health.css` — Upload-Form + Dashboard
- `inc/online-services/_loader.php` — `require_once` Eintrag

## Akzeptanz

- [x] Admin generiert Token → URL + QR sichtbar
- [x] Patient öffnet URL → Upload-Form mit Consent-Checkbox
- [x] Patient lädt valid Apple-Health-ZIP → Parser läuft → Status `received`
- [x] Admin sieht 10 Sparklines + 30-Tage-Summary
- [x] Admin kann jederzeit löschen
- [x] Transient läuft nach 7 d ab
- [x] Original-XML/ZIP wird nie auf Disk persistiert
- [x] Reduced-Motion respektiert
- [x] Lokal-only Build, kein Live-Push

## Folge-Wellen

- **S80.1:** Sprach-Erweiterung Patient-Upload-Form auf 6 WPML-Sprachen
- **S80.2:** PDF-Export der Trends für Patientenakte (optional)
- **S80.3:** PVS-Push (Trends als Brief in Praxis-Verwaltungssystem)
- **S80.4:** Live-Freigabe nach DSFA-Approval
