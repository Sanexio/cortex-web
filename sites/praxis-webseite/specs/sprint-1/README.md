# Sprint 1 — Rollout-Infrastruktur

**Status:** ⏸ **PAUSIERT am 2026-04-18** — Wartet auf Domainfactory-Support.

**Grund:** Dr. Stracke konnte die FTP-Zugangsdaten im DF-Kundencenter nicht finden (siehe Screenshot vom 2026-04-18, DF-Panel ManagedHosting 24 — FTP-Unterpunkt unter den sichtbaren Menüpunkten nicht auffindbar). DF-Support wurde am 2026-04-18 angeschrieben. Sobald Support antwortet und SFTP-Zugang klar ist → Sprint 1 reaktivieren.

**Design-Freigabe bleibt gültig** (für den späteren Restart, nicht neu zu beschließen):
- (a)=2 · (b)=1 · (c)=2 · (d)=offen/ASAP · Test-Empfänger=`stracke.md@me.com`

---

## Ziel des Sprints

Nach Sprint 1 existiert eine risikoarme Deploy-Kette:
1. Staging-Instanz live auf `westend-hausarzt.de` (die bisherige 301-Weiterleitung auf `.com` ist aufgehoben, Basic-Auth davor, `noindex`).
2. Pre-Deploy-Snapshot der Prod-Site (`.com`) + verprobter Rollback-Weg.
3. End-to-End-Beweis, dass das MFA-Bewerbungsformular auf Staging mit echter Outlook-SMTP eine Mail inkl. PDF-Anhang an `stracke.md@me.com` ausliefert.

## Globale Constraints

- `westend-hausarzt.com` bleibt während Sprint 1 **unberührt** (kein Theme-Deploy, keine Plugin-Änderung, keine DB-Änderung).
- Theme-Repo bleibt auf v2.7.4, keine Code-Änderung in `praxiszentrum/`.
- `tools/verify.sh` bleibt grün auf Local.
- `mu-plugins/000-local-mail-redirect.php` wird **nicht** auf Staging kopiert (Dev-only — Mails gehen auf Staging echt raus).
- Keine geheimen Zugangsdaten werden ins Git-Repo (weder Theme- noch Docs-Repo) commited.

## Entscheidungen (freigegeben 2026-04-18)

| ID | Entscheidung | Konsequenz |
|---|---|---|
| (a)=2 | Staging auf Root-Domain `westend-hausarzt.de`, Weiterleitung zu `.com` wird aufgehoben | Besucher, die `.de` eingeben, sehen Basic-Auth-Dialog; SEO-301 bricht bis Go-Live |
| (b)=1 | AkeebaBackup Pro für Full-Backup + Restore | Bereits installiert, ein Archiv für Files+DB |
| (c)=2 | Mail-Test mit Text + 1 PDF-Anhang (~2 MB) | Belastet nicht das 50-MB-Limit, prüft aber den Anhang-Pfad |
| (d) | Deadline offen, ASAP | Keine Shortcut-Fehler, aber jeder Tag zählt |
| Test-Empfänger | `stracke.md@me.com` | Kein Prod-Posteingang `praxis@…` wird bespielt |

---

## Teilschritte (strikt sequenziell)

### S1.1 — Staging auf westend-hausarzt.de

**Strategie:** Weiterleitung im Domainfactory-Panel aufheben, neuen Webspace für `.de` mit frischer WordPress-Installation belegen, mit Basic-Auth und `noindex` vor Besuchern + Suchmaschinen schützen.

**Schritte:**
1. DF-Kundencenter einloggen → Domain `westend-hausarzt.de` → 301-Weiterleitung entfernen.
2. Webspace-Root der `.de` provisionieren (bei DF in der Regel ein eigenes Verzeichnis pro Domain).
3. WordPress 6.x frisch installieren (DB-Name/-User separat von `.com`).
4. `.htaccess` Basic-Auth: User `staging`, Passwort zufällig (nicht commited).
5. `robots.txt` → `User-agent: * / Disallow: /`.
6. `<meta name="robots" content="noindex,nofollow">` im aktiven Theme-Header.
7. HTTPS-Zertifikat für `.de` (DF bietet meist Let's Encrypt per Klick).
8. WP-Admin-User anlegen + 2FA aktivieren.

**Akzeptanzkriterien:**
- `curl -I https://westend-hausarzt.de` gibt `401 Unauthorized` (Basic-Auth-Challenge), nicht mehr `301 Moved Permanently` zu `.com`.
- Nach Basic-Auth: WordPress-Startseite sichtbar.
- `https://westend-hausarzt.de/robots.txt` zeigt `Disallow: /`.
- Screenshot der neuen Staging-Startseite in `screenshots/claude/2026-MM-DD_sprint1_s1-1_staging.png` abgelegt.

### S1.2 — Backup/Rollback-SOP

**Strategie:** AkeebaBackup auf Prod (`.com`) läuft einmalig als Voll-Backup (Files+DB → ein `.jpa`-Archiv). Archiv wird heruntergeladen, offsite in GDrive gespiegelt, und **aktiv in einer dritten Umgebung verprobt** — nicht nur „das Archiv existiert" als grüner Haken.

**Schritte:**
1. Auf `.com`: AkeebaBackup → Voll-Backup anstoßen, Fortschritt per WP-CLI oder AkeebaBackup-UI verfolgen.
2. Archiv in `/wp-content/backups/` lokalisieren → via SFTP lokal herunterladen.
3. Archiv zusätzlich nach GDrive `Claude-Sync/praxis-redesign/backups/YYYY-MM-DD_praxis-com_full.jpa`.
4. **Restore-Probe** (Pflicht): Auf Cluster-Mini-02 eine zweite Local-by-Flywheel-Site `praxis-com-restore-probe` anlegen → Akeeba-Kickstart-Installer darauf → Archiv einspielen → per Browser verifizieren, dass die rekonstruierte Seite identisch zur Prod-Startseite aussieht (Headless-Screenshot).
5. SOP `tools/backup-rollback.md` dokumentieren: Backup-Trigger, Download-Pfad, Restore-Schritte, verifizierter Wiederherstellungs-Screenshot.

**Akzeptanzkriterien:**
- Archiv existiert lokal + in GDrive, ≤ 24 h alt, Größe > 0, Integrität via `jpa --test` (oder Akeeba-Integrity-Check) grün.
- Restore-Probe auf Cluster-Mini-02 liefert Home-Screenshot, der zu >95 % mit Prod-Screenshot übereinstimmt (visuelle Kontrolle reicht — harter Pixel-Diff nicht nötig, weil Local vs. Prod minimale Font-Rendering-Deltas hat).
- `tools/backup-rollback.md` enthält: Commands + Screenshots des verprobten Durchlaufs.

### S1.3 — End-to-End-Mail-Test

**Strategie:** Theme v2.7.4 inklusive MFA-Formular-Generator auf Staging deployen, WP Mail SMTP Pro mit Outlook-Credentials konfigurieren, eine realistische Bewerbung (1 PDF, ~2 MB) abschicken und in `stracke.md@me.com` empfangen.

**Schritte:**
1. Theme-Repo `praxiszentrum/` v2.7.4 via SFTP auf Staging `/wp-content/themes/` hochladen → im WP-Admin aktivieren.
2. `tools/create_karriere_page.php` + `tools/create_mfa_form.php` auf Staging via WP-CLI oder `wp eval-file` ausführen (Karriere-Seite + MFA-Formular-ID).
3. WP Mail SMTP Pro Plugin auf Staging installieren + aktivieren.
4. SMTP-Konfiguration: `smtp.office365.com:587` (STARTTLS), User=`praxis@westend-hausarzt.de`, App-Passwort, From=`praxis@westend-hausarzt.de`, From-Name=`Praxiszentrum Bewerbung`.
5. Ein kleines Dummy-PDF (~2 MB) ablegen und auf Staging `/karriere/` hochladen: Vorname=Claude, Nachname=Test, E-Mail=`stracke.md@me.com`, Telefon=`0000`, Nachricht=`Testbewerbung Sprint 1`, Datenschutz=✓.
6. In `stracke.md@me.com` Posteingang + Spam-Ordner verifizieren.

**Akzeptanzkriterien:**
- Mail kommt innerhalb von ≤5 min in `stracke.md@me.com` an.
- Keine Spam-Klassifikation (Posteingang, nicht Spam-Ordner).
- Betreff = WPForms-Notification-Betreff.
- PDF als Anhang dabei, openbar, Dateiname = Original.
- From = `praxis@westend-hausarzt.de`, Reply-To = Bewerber-E-Mail (`stracke.md@me.com`).
- Screenshot der empfangenen Mail (Apple Mail / iCloud Web) in `screenshots/claude/2026-MM-DD_sprint1_s1-3_mail.png` archiviert.

---

## Risiken + Mitigation

| Risiko | Mitigation |
|---|---|
| DF-Zugang fehlt/unklar | Credentials vor S1.1 via `OPEN_DECISIONS.md` einfordern |
| `.de`-Webspace bei DF nicht getrennt von `.com` | DF-Panel prüfen, ggf. zusätzlichen Webspace buchen (Dr. Stracke-Freigabe) |
| SPF/DKIM/DMARC für `.de` nicht gesetzt → Mail landet in Spam | DNS-Check vor S1.3; ggf. TXT-Records ergänzen |
| Outlook verlangt App-Passwort bei aktivierter 2FA | Dr. Stracke generiert App-Passwort im Microsoft-Konto |
| Weiterleitung-Aufhebung stört bestehende Links (Visitenkarten, E-Mail-Signaturen) | Dr. Stracke prüft, ob `.de` aktuell irgendwo beworben wird — falls ja: Fallback auf (a1) Subdomain |
| AkeebaBackup Timeout bei großem `.com`-Datenbestand | Backup-Profile tunen (Chunk-Size kleiner), notfalls via SSH `mysqldump` + `tar` manuell |

## Selbstprüfung-Schema (am Ende jedes Teilschritts)

| Kriterium | Soll | Ist | Abweichung | Bewertung |
|-----------|------|-----|------------|-----------|
| Akzeptanzkriterien aus Teilschritt erfüllt | 100 % | ? | ? | ? |
| Prod-Website unberührt | Ja | ? | ? | ? |
| `tools/verify.sh` grün | OK | ? | ? | ? |
| Keine Credentials im Git | Ja | ? | ? | ? |
| Screenshot-Beweis vorhanden | Ja | ? | ? | ? |
| Gesamt (0–100 %) | 100 % | — | — | — |

---

## Alternativen je Teilschritt (dokumentiert für späteren Re-Review)

| Teilschritt | Gewählt | Alternative | Warum gewählt |
|-------------|---------|-------------|---------------|
| S1.1 Staging-Host | `.de` Root-Domain (a=2) | `staging.westend-hausarzt.de` Subdomain (a=1); Hetzner; Docker | Dr. Stracke-Entscheidung 2026-04-18 |
| S1.2 Backup-Tool | AkeebaBackup (b=1) | Duplicator; UpdraftPlus; WP-CLI+mysqldump-Skript | bereits installiert, spart Plugin-Pflege |
| S1.3 Mail-Test-Tiefe | Text+1 PDF (c=2) | Text-only; 5×10 MB Grenzfall; Prod-Dummy | realistisch, kein Prod-Risiko |
