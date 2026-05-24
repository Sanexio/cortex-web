# Spec — Patient-Portal-Lite (Magic-Link Auth) (#18)

**Status:** 📋 Spec
**Blocker:** Mail-Server-Reliability + DSGVO-Folgenabschätzung.

## Ziel
Ohne Passwort-Login: Patient gibt E-Mail + Geburtsdatum ein → Magic-Link
in Mail → kommt auf Personal-Page → sieht **Status** zu Rezepten,
Befund-Abholbereit, Termine. **Keine Befund-PDFs im Browser, nur Status.**

## Mechanik
1. WP-CPT `pxz_patient` (E-Mail + DOB + opt. Telefon).
2. Login-Form `/portal/login/`: Mail+DOB → Magic-Link mit JWT-Token (TTL 15 min).
3. Verified Session in Cookie (HttpOnly, Secure, 24h TTL).
4. Personal-Page rendert:
   - Aktive Rezept-Tickets (ab `rx-status.php`)
   - Termine (read-only aus Doctolib oder PVS)
   - Pre-Visit-Fragebögen (laufend)
   - „Meine Daten exportieren" (DSGVO-Auskunft Art. 15)

## Sicherheit
- Magic-Link nur für genau eine Verwendung (Token-Hash in DB, nach Use invalidate).
- Rate-Limit 5 Logins/h.
- Brute-Force-Schutz für DOB-Eingabe (kein Hint, ob Mail existiert).
- Kein Passwort = kein Hash = keine Credential-Stuffing-Attack-Surface.

## DSGVO
- Patient-Daten in WP-DB, regelmäßiges Backup (verschlüsselt).
- Recht auf Löschung: Lösch-Endpoint im Portal.
- Recht auf Auskunft: Export-Endpoint im Portal.
- Verarbeitungsverzeichnis nach Art. 30.

## Aufwand
3 Sprints. Magic-Link-Crypto + Session-Mgmt + UI + DSFA.

## TODO
- [ ] DSFA mit Datenschutzbeauftragter.
- [ ] JWT-Lib für PHP wählen (firebase/php-jwt).
- [ ] UI-Mockup Portal-Dashboard.
