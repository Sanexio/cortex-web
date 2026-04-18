# Sprint 1 — Offene Credentials + Detail-Punkte (blockierend)

**Status:** Spec freigegeben 2026-04-18 ((a)=2, (b)=1, (c)=2, (d)=offen, Test-Empfänger=`stracke.md@me.com`). Sprint 1 startet, sobald untenstehende Credentials geliefert sind.

---

## Grundregel zum Umgang mit Credentials

Credentials werden **NIEMALS** ins Git-Repo (Theme- oder Docs-Repo) commited. Ich nehme sie kurz im Chat oder via Passwort-Manager-Share entgegen und trage sie ausschließlich ein in:
- WordPress-UI (WP Mail SMTP Pro)
- Lokale, `.gitignore`-geschützte `.env`-Dateien auf Staging
- `.htpasswd`-Datei auf Staging-Server (nicht im Repo)

Nach Sprint 1 bleiben sensible Zugangsdaten bei Ihnen (1Password o. ä.). Ich vergesse sie ausdrücklich nicht, aber ich speichere sie nicht im Projekt.

---

## Für S1.1 — Staging-Anlage bei Domainfactory

- [ ] **Domainfactory-Kundencenter-Login:** URL + Benutzername + Passwort
- [ ] **Webspace-Zugang `.de`-Domain:** SFTP-Host, SFTP-User, SFTP-Passwort (oder SSH-Key) und Root-Pfad des `.de`-Webspace
- [ ] **MySQL-Zugang `.de`:** DB-Name, DB-Host, DB-User, DB-Passwort (entweder DF legt auf Anforderung an oder existiert schon separat)
- [ ] **DNS-Zugang** (für SPF/DKIM/DMARC-Prüfung): Admin-Login bei DF oder separater DNS-Provider
- [ ] **Freigabe Weiterleitung aufheben:** Bestätigung, dass die Weiterleitung `.de → .com` aktuell nirgendwo beworben wird (Visitenkarten, Signaturen, Social Media). Falls doch → zurück auf (a1) Subdomain.

## Für S1.3 — Outlook-SMTP-Konfiguration

- [ ] **SMTP-Host** (vermutlich `smtp.office365.com`, muss bestätigt werden)
- [ ] **SMTP-Port** (vermutlich `587` mit STARTTLS)
- [ ] **SMTP-Benutzer** (vermutlich `praxis@westend-hausarzt.de`)
- [ ] **App-Passwort** (nicht das normale Outlook-Passwort — Microsoft verlangt bei aktivierter 2FA ein App-spezifisches Passwort; wird im Microsoft-Konto unter „Sicherheit → Erweiterte Sicherheitsoptionen → App-Passwörter" generiert)
- [ ] **From-Adresse + From-Name:** `praxis@westend-hausarzt.de` / z.B. `Praxiszentrum Bewerbung`

## Für S1.2 — AkeebaBackup auf Prod

- [ ] **WP-Admin-Login für `westend-hausarzt.com`** (Dr. Stracke-User)
- [ ] **SFTP-Zugang `.com`-Webspace** (falls abweichend von `.de`)

---

## Arbeitsweise-Bestätigung

Ich arbeite Sprint 1 in **drei klar getrennten Etappen** (S1.1, S1.2, S1.3). Nach jeder Etappe:
1. kurze Meldung was gemacht wurde
2. Beleg (Screenshot, curl-Output, verify-Auszug)
3. auf Ihr „OK" warten, bevor die nächste Etappe startet

Falls eine Etappe rote Akzeptanzkriterien hat, stoppe ich und melde die Ursache. Keine Silent-Fixes.

---

## Credentials-Lieferweg — Vorschlag

**Option A:** Sie senden die Credentials in **einer einzigen Chat-Nachricht** an mich. Nachteil: landet im Session-Log (Cortex-intern, aber existent).

**Option B:** Sie legen die Credentials in `~/Cortex/projects/praxis-redesign/.env.sprint1.local` ab (Datei ist durch `.gitignore` ausgeschlossen — ich verifiziere das vorher). Ich lese die Datei und trage die Werte weiter. Vorteil: Credentials verlassen Ihre Maschine nicht.

**Option C:** Sie legen die Credentials in macOS Keychain ab und nennen mir die Keychain-Item-Namen; ich hole sie per `security find-generic-password`. Vorteil: vom System verschlüsselt.

Welche Option bevorzugen Sie?
