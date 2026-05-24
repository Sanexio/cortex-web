# Spec — eRezept (gematik FHIR) (#14)

**Status:** 📋 Spec, kein Code
**Blocker:** KIM-Postfach + gematik-Zertifikat + SMC-B-Karte.

## Ziel
Statt manueller Apothekenfaxe: eRezept-Token aus dem PVS direkt in den
Patient-Portal-Status (`rx-status.php`) übergeben → Patient sieht Status
und kann den Token in der eRezept-App einlösen.

## Mechanik
1. PVS (Praxis-Verwaltungs-System) erzeugt eRezept-Verordnung.
2. PVS-Plugin sendet Token via FHIR-Bundle an gematik-Fachdienst.
3. Praxis-Backend ruft `/wp-json/pxz/v1/rx-token-attach` mit `case_id` + `token` auf.
4. `rx-status.php` setzt State `ready` und Token in Post-Meta.
5. Bestätigungsmail mit Token-Link (Magic-Link) geht an Patient.

## Voraussetzungen
- Praxis muss Telematik-Infrastruktur-Anschluss aktiv haben.
- KIM (Kommunikation im Medizinwesen) Adresse für authentifizierten Mailtransport.
- SMC-B-Karte für Kartenlesegerät.
- Vertragspartner für gematik-Anbindung (z. B. RISE, akquinet, eHealth-Experts).

## DSGVO / Recht
- Token enthält keinen PII. Versand per KIM ist DSGVO-konform.
- Patient muss eRezept-App auf Smartphone haben (gematik-App, ELGA o. ä.).

## Aufwand
3–6 Wochen externe Beratung + 2 Sprints intern.

## Realistisches Vorgehen
1. PVS-Hersteller fragen, ob FHIR-Webhook out-of-the-box.
2. Falls ja: eigenes WP-Plugin-Stub bauen (gegen den im Praxis-PVS exportierten Webhook).
3. Falls nein: zunächst `rx-status.php` mit MFA-Manuell-State pflegen, eRezept-Roll-out aufschieben.

## TODO
- [ ] Klärung: hat aktuelles PVS (CGM Albis? Tomedo?) eRezept-Webhook?
- [ ] KIM-Adresse beantragt? Status?
- [ ] Datenschutz-Folgenabschätzung (DSFA) für Token-Storage?
