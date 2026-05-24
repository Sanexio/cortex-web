# Spec — Doctolib-API Live-Slots (#13)

**Status:** 📋 Spec, kein Code (Tier-3 Secret-Bedarf)
**Blocker:** Doctolib-API-Zugang (Partner-Programm) + API-Key.

## Ziel
`pxz_availability_get()` (siehe `inc/online-services/availability.php`) liefert echte „nächster freier Slot pro Arzt"-Daten statt Mock.

## Mechanik
1. **Cron** (`wp_schedule_event`, alle 5 min) zieht für jeden Arzt-Slug den nächsten freien Slot.
2. Endpoint (Doctolib): `GET https://api.doctolib.com/availabilities?practitioner_id={id}&start_date=today` (genaue Form aus Partner-Dokumentation).
3. Mapping `slug → practitioner_id` in `inc/practice-data.php` ergänzen (`'doctolib_practitioner_id' => 12345`).
4. Antwort wird normalisiert in das `pxz_availability_default()`-Schema und in `update_option(PXZ_AVAILABILITY_OPTION, ...)` geschrieben.
5. Stale-Detection: wenn letztes Update älter als 30 min, im Frontend „nicht aktuell"-Badge anzeigen.

## DSGVO / Verträge
- Auftragsverarbeitungs-Vertrag mit Doctolib (sollte bestehen).
- Keine Patienten-Daten geladen, nur Slot-Aggregate (kein PII-Issue).
- API-Key in `wp-config.php` als Konstante `PXZ_DOCTOLIB_API_KEY` (NICHT in Git).

## Aufwand
1 Sprint, sobald Key vorhanden.

## Fallback
Bleibt `availability.php` mit Mock-Daten — die Praxis-Verwaltung kann
manuell Werte über die WP-Admin-UI setzen (siehe TODO unten).

## TODO bevor Live
- [ ] Admin-Settings-Page für Mapping `slug → practitioner_id`.
- [ ] Cron-Lock gegen Doppel-Trigger.
- [ ] Health-Check-Endpoint `/wp-json/pxz/v1/availability/health`.
- [ ] Rate-Limit-Backoff bei 429.
