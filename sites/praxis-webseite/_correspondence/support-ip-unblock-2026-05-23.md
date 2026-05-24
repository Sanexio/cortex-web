# Support-Ticket — IP-Aufhebung beim Hoster (DF.eu / GoDaddy)

**Stand:** 23.05.2026, 19:30 CEST
**Account-Domain:** westend-hausarzt.de / westend-hausarzt.com
**Betroffene IP:** 92.208.77.94 (Cluster-Mini-02 / Frankfurter Standort Dr. Stracke)

---

## E-Mail-Variante (direkt versendbar)

**Betreff:** Bitte um Aufhebung eines IP-Blocks — Account westend-hausarzt.de

> Sehr geehrtes Support-Team,
>
> ich bin der Inhaber des Hosting-Accounts für **westend-hausarzt.de**
> und **westend-hausarzt.com** (Praxis Dr. Stracke & Kollegen, Frankfurt).
>
> Meine IP-Adresse **92.208.77.94** ist heute Nachmittag von Ihrer Firewall
> (vermutlich LFD/CSF / mod_security) gesperrt worden. Seitdem bekomme ich
> auf allen drei Domains
>
> - https://westend-hausarzt.com
> - https://westend-hausarzt.de
> - https://staging.westend-hausarzt.com
>
> entweder **keine Antwort** (Connection refused / Timeout, `HTTP 000`)
> oder **HTTP 415 (Unsupported Media Type)** auf vanilla Apache statt
> WordPress-Output. Auch der FTPS-Login schlägt mit „max-retries
> überschritten" fehl.
>
> Hintergrund: ich habe heute Theme-Updates via FTPS hochgeladen und
> anschließend mit einem eigenen Test-Skript geprüft, ob bestimmte
> Pfade korrekt gesperrt sind (z. B. `.git/config`, `.env`, `wp-config.php`).
> Das war ein **legitimer Site-Owner-Test**, keine externe Attacke —
> die Test-Skripte erwarten bewusst HTTP 403/404 auf diesen Pfaden und
> dienen der Verifikation der Server-Härtung nach jedem Deploy.
>
> Bitte heben Sie die IP-Sperre für **92.208.77.94** auf. Ich passe meine
> Test-Skripte so an, dass sie diese Pfade in Zukunft nicht mehr in
> dichter Folge abfragen.
>
> Falls Sie weitere Angaben benötigen (Kunden-Nr., letzte FTPS-User), bin
> ich telefonisch erreichbar.
>
> Vielen Dank und freundliche Grüße
> Dr. Siegbert Stracke
> Praxiszentrum Dr. Stracke & Kollegen
> Grüneburgweg 12, 60322 Frankfurt am Main

---

## Wichtige Daten für den Support-Mitarbeiter

| Feld | Wert |
|---|---|
| Account / Domain | westend-hausarzt.de + westend-hausarzt.com |
| Kunde | Dr. Siegbert Stracke / Sanexio GmbH |
| Geblockte IP | **92.208.77.94** |
| Zeitpunkt Block | 23.05.2026 ca. 17:00 CEST |
| Symptom (HTTP) | alle Requests → 415 (vanilla Apache) oder Connection refused |
| Symptom (FTPS) | `lftp` ftp-ssl Connect timeout/max-retries |
| Auslöser | Pre-Launch-Verify-Skript mit `EXPECT_DENY`-Probes auf `.git/config`, `.env`, `wp-config.php`, `xmlrpc.php`, `debug.log` — direkt nach Theme-Upload |
| Ziel | IP-Block aufheben, optional Whitelist für die Stracke-Praxis-IP setzen |
