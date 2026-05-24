# Spec — Apple-Health-Integration (#17)

**Status:** 📋 Spec, mehrere externe Blocker
**Blocker:** Apple Developer Program ($99/Jahr), App-Entwicklung, App-Store-Prozess.

## Ziel
Vor einem Routine-Termin sieht die Praxis die letzten 30 Tage Vital-Trends
des Patienten (Puls-Median, RR, SpO2, Schlaf, Schritte) — bessere
Anamnese-Vorbereitung. **Patient teilt explizit, kein Permanent-Sync.**

## Realistische Architekturen

### A) Native iOS-App (sauber, aufwändig)
- Eigene iOS-App „Praxiszentrum Westend" mit HealthKit-Integration.
- App lädt anonymisierte Trends in Praxis-Backend hoch (REST-Endpoint).
- Pflicht: App-Store-Approval, Privacy-Manifest, $99/Jahr.
- Aufwand: 3–6 Monate externer iOS-Dev.

### B) Apple-Health-Export-File (pragmatisch)
- Patient exportiert Health-Daten (Apple Health → „Daten exportieren").
- Lädt ZIP in Praxis-Portal (Patient-Portal-Lite, Spec #18).
- Server-seitiger XML-Parser → Trend-Visualisierung.
- KEIN App-Store, KEIN HealthKit-Approval.
- Aufwand: 2 Sprints.

### C) Web-Bluetooth (Withings, Polar, Garmin)
- Patient pairt Withings-Waage / Garmin-Watch direkt mit Web-App.
- Daten fließen via Hersteller-API in Praxis-Backend.
- Hersteller-spezifisch.

## Empfehlung
Variante **B** (Export-File) als Phase 1, Variante A nur, wenn iOS-App
strategisch gewollt ist (Praxis-Branding etc.).

## DSGVO
- Patient lädt aktiv hoch = explizite Einwilligung.
- Einmalige Verarbeitung pro Termin, danach Daten löschen.
- DSFA pflicht.

## Aufwand
2 Sprints für Variante B (inkl. Trend-Visualisierung).

## TODO
- [ ] Mit Datenschutzbeauftragter besprechen.
- [ ] UI-Mockup für Trend-Dashboard (Sparklines, Apple-Health-Style).
- [ ] Parser für iOS-XML-Export schreiben (10 wichtigste Datentypen).
