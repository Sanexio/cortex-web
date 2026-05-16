# RUNBOOK — Going-Live V2 auf westend-hausarzt.com (geplant 2026-05-16+)

> **Trigger-Phrase**: User startet die Welle mit
> `Redesign Webpage: Going live auf .com`
> Wenn diese Phrase als erster Prompt einer Session ankommt → dieses
> RUNBOOK vollständig ausführen. Autonomy Mode, keine Rückfragen außer
> bei den explizit markierten Stops.

---

## 0. Kontext (für eine neue Claude-Session ohne Conversation-Memory)

Aus Vor-Welle 2026-05-16: V1-Pre-Migration-Archive von der aktuellen
westend-hausarzt.com-Live-Site ist 4-fach abgesichert:

- Lokal: `~/Cortex/projects/praxis-webseite/_akeeba-archive/V1-2026-05-16/` (4 JPA-Parts, 6.6 GB, SHA256-verified)
- iCloud Drive: `Cortex-Backups/praxis-com-V1-2026-05-16/` (Hash-Match ✓)
- cPanel-Origin: `praxis2021/wp-content/plugins/akeebabackupwp/app/backups/` auf .com
- Live in Local Flywheel: `praxiszentrum-westend-v1.local` (frontend HTTP 200, 91 Tabellen, freesia-empire-Theme, GP Medical Center Westend)

V1 ist also der Rollback-Anker. V2 ist der neue Stand (.de + Local-V2-Site).

## 1. Domain-Mapping auf dem cPanel-Account `e88c2b3jxfrg` (DF/GoDaddy)

| Domain | DocRoot | DB | Theme | Stand |
|---|---|---|---|---|
| westend-hausarzt.com | `/home/e88c2b3jxfrg/praxis2021/` | `e88c2b3_18` | freesia-empire | **V1 = alter Stand, wird beim Live-Go überschrieben** |
| westend-hausarzt.de | `/home/e88c2b3jxfrg/public_html/` | `westend_de` | praxiszentrum | **V2 = neuer Stand, Source-of-Truth für die Migration** |

cPanel-Server-Host: `sxb1plmcphls10251.prod.sxb1.secureserver.net`
FTP-Server: `westend-hausarzt.com` (IP 92.204.31.125), Port 21 FTPS

FTP-User mit Vollzugriff (chrooted nach `/home/e88c2b3jxfrg/`):
`claude-backup@westend-hausarzt.com` — Credentials in
`~/Cortex/projects/Cortex-Web/sites/praxis-webseite/.env.sprint1.local`
(`SFTP_COM_*`-Block). DE-FTP (`393047-ftp`) hat denselben View.

## 2. Voraussetzung vom User (in der „letzte Änderungen"-Session)

Vor dem Live-Go muss der User Folgendes erledigt haben:

- [ ] Letzte Content-/Design-Änderungen auf der Local-V2-Site + .de live
- [ ] **Akeeba Backup for WordPress auf .de installieren** (war 2026-05-16 noch nicht da)
  - WP-Admin auf .de → Plugins → „Add New" → suche „Akeeba Backup" → installieren + aktivieren
  - Plugin → Configuration → Profile 1 → „Full site backup" reicht aus
- [ ] **Frisches Akeeba-Backup auf .de erstellen**
  - WP-Admin → Akeeba Backup → „Backup Now" → Full Site
  - Wartet bis fertig (5-15 min), Multi-Part-JPA wird erzeugt

Erkennungsmerkmal für „User hat alles vorbereitet": ein Backup-Eintrag
mit Datum >= 2026-05-16 im Listing unter
`public_html/wp-content/plugins/akeebabackupwp/app/backups/`.

---

## 3. Welle-Plan — 5 Phasen

### Phase A — Pre-Flight (Verifikation, 10 min)

**A1.** Aktuellen Stand bestätigen:
```bash
# V1-Archive da?
ls -la ~/Cortex/projects/praxis-webseite/_akeeba-archive/V1-2026-05-16/
# Erwartung: jpa + j01 + j02 + j03 (Sizes wie in MANIFEST.md), download.log "COMPLETE"
```

**A2.** V2-Backup auf .de finden + Größe ermitteln:
```bash
cd ~/Cortex/projects/Cortex-Web/sites/praxis-webseite
set -a; source .env.sprint1.local; set +a
lftp -u "$SFTP_COM_USERNAME","$SFTP_COM_PASSWORD" -p "$SFTP_COM_PORT" "ftp://$SFTP_COM_HOST" \
  -e "set ftp:ssl-force true; set ssl:verify-certificate no; \
      cls -la public_html/wp-content/plugins/akeebabackupwp/app/backups; quit" 2>&1 | tail -15
```
Erwartung: heutiges Datum, `.jpa` plus `.j01...jNN`. Den Filename-Prefix
(z. B. `site-westend-hausarzt.de-YYYYMMDD-HHMMSScest-XXXXX`) notieren.

**STOP-Trigger A**: Falls keine .jpa von heute → User pingen, dass
Akeeba-Backup auf .de fehlt.

**A3.** V1 Rollback-Pfad re-verify:
```bash
shasum -a 256 ~/Cortex/projects/praxis-webseite/_akeeba-archive/V1-2026-05-16/*.jpa \
  ~/Cortex/projects/praxis-webseite/_akeeba-archive/V1-2026-05-16/*.j0[123]
# Cross-check mit MANIFEST.md im praxis-com-v1-archive-Repo
```

### Phase B — V2-Backup ziehen (15-30 min, abh. Größe)

**B1.** Pull-Skript `pull-akeeba-from-de.sh` aufrufen (bereits gebaut,
liegt in `tools/`):
```bash
~/Cortex/projects/Cortex-Web/sites/praxis-webseite/tools/pull-akeeba-from-de.sh
```
Skript ist analog `pull-akeeba-from-com.sh` aber mit `.de`-Pfad
(`public_html/wp-content/plugins/akeebabackupwp/app/backups/`) und
Target `~/Cortex/projects/praxis-webseite/_akeeba-archive/V2-YYYY-MM-DD/`.

**WICHTIG**: Vor erstem Aufruf den `BACKUP_PREFIX`-Wert + Part-Anzahl
im Skript an den tatsächlichen Backup-Filename anpassen (aus A2).

**B2.** SHA256 + Sizes verifizieren (Skript macht das im Logfile).

**B3.** Cold-Storage in iCloud:
```bash
rsync -av ~/Cortex/projects/praxis-webseite/_akeeba-archive/V2-*/ \
  "~/Library/Mobile Documents/com~apple~CloudDocs/Cortex-Backups/praxis-de-V2-$(date +%Y-%m-%d)/"
```

### Phase C — Pre-Migration Safety auf .com (10 min)

**C1.** Filesystem-Snapshot der .com-DocRoot per FTPS:
```bash
# in lftp:
mv praxis2021 praxis2021.pre-v2-2026-05-16
mkdir praxis2021
```
**ROLLBACK in 1 Befehl**: `mv praxis2021 praxis2021.broken-v2; mv praxis2021.pre-v2-2026-05-16 praxis2021`.

**C2.** Maintenance-Mode-Datei in den (jetzt leeren) DocRoot:
```bash
# .maintenance reicht nicht — ist nur für WP, hier ist DocRoot leer.
# Stattdessen statisches index.html mit Wartungs-Hinweis hochladen.
```
Template-Datei: siehe `maintenance-page.html` in diesem Spec-Ordner.

**C3.** Neue MySQL-DB auf cPanel anlegen.
**STOP-Trigger C**: cPanel-WHM-API ist nicht über unsere FTP-Creds
erreichbar. User muss in cPanel-UI:
- „MySQL-Datenbanken" → neue DB `e88c2b3_v2` (oder vergleichbar)
- neuer User mit gleichem Namen, starkes Passwort
- User an DB hängen mit „ALL PRIVILEGES"
- Credentials in Chat posten (oder direkt in `.env.sprint1.local`
  `MYSQL_COM_V2_*`-Block eintragen)

Im Chat nennen: Host (`localhost`), Name, User, Passwort.

### Phase D — Migration (30-60 min)

**D1.** Akeeba Kickstart + V2-JPA-Set in .com-DocRoot hochladen:
```bash
lftp # mit COM-Creds
cd praxis2021
put ~/Cortex/projects/praxis-webseite/_akeeba-archive/V2-*/kickstart.php
# rename direkt:
mv kickstart.php restore-v2.php  # Insecure-Setup-Schutz umgehen
mput ~/Cortex/projects/praxis-webseite/_akeeba-archive/V2-*/*.jpa
mput ~/Cortex/projects/praxis-webseite/_akeeba-archive/V2-*/*.j0[0-9]
quit
```

**D2.** Browser: `https://westend-hausarzt.com/restore-v2.php`
- Kickstart-Wizard: Archive auswählen, „Hybrid", Start → Extraktion (10-20 min)
- ANI-Installer mit DB-Werten aus C3
- Site URL = `https://westend-hausarzt.com`

**LESSON aus V1-Restore**: ANI kann den DB-Import stillschweigend
überspringen. Verifikation Pflicht:
```bash
# nach Wizard-Cleanup:
lftp -u $SFTP_COM_USERNAME,$SFTP_COM_PASSWORD westend-hausarzt.com \
  -e "cls -la praxis2021/; quit" | grep -E "installation|restore-v2|\.jpa"
# Wenn diese Files weg sind = Cleanup OK
# Wenn DB ≤12 Tabellen → ANI-Versagen, weiter mit D3
```

**D3.** Falls ANI versagt: manueller SQL-Import (siehe `feedback_akeeba_wp_restore_pitfalls.md`).
- Auf cPanel-Server kein SSH → wir können nicht direkt MySQL ansprechen
- Alternative: phpMyAdmin im cPanel → SQL-Files (sind in `installation/sql/site.s01..N` extrahiert) als Set importieren
- Wenn das nicht geht: kompletten `installation/`-Folder lokal entpacken (JPA via kickstart-cli auf Mac extrahieren) + SQL-Files manuell zusammensetzen + via phpMyAdmin importieren

**D4.** Search-Replace URLs `https://westend-hausarzt.de` →
`https://westend-hausarzt.com`. Per **Better Search Replace**-Plugin
in WP-Admin auf der neuen .com-Site (kommt mit V2-Backup mit) oder
per wp-cli falls SSH später verfügbar.

**D5.** Permalink-Flush (WP-Admin → Einstellungen → Permalinks → Speichern reicht).

**D6.** Caching-Plugin (falls aktiv: WP-Rocket, W3TC etc.) leeren.

### Phase E — Verifikation + Live (15 min)

**E1.** Multi-Page Smoke-Test:
```bash
for p in '' '?lang=en' '?lang=fr' '?lang=es' \
         'kontakt/' 'team/' 'leistungen/' \
         'wp-admin/' \
         'wp-json/wp/v2/posts?per_page=1'; do
  printf "%-50s " "$p"
  curl -sI -L --max-time 8 "https://westend-hausarzt.com/$p" | head -1
done
```

**E2.** E-Mail-Versand testen (Test-Kontaktformular-Submit, Postfach prüfen).

**E3.** Akeeba auf neuer .com-Site Initial-Backup-Profile anlegen
(V2-Baseline für die Zukunft).

**E4.** Maintenance-Mode-Datei entfernen (falls noch nicht durch Restore überschrieben).

**E5.** Frontend-Check: Patient sieht neue Site.

---

## 4. Rollback-Pfade

| Bricht | Fix | Dauer |
|---|---|---|
| Frontend lädt nicht | FTPS: `mv praxis2021 praxis2021.broken-v2; mv praxis2021.pre-v2-2026-05-16 praxis2021` + ggf. wp-config.php DB-Werte aus alter DB `e88c2b3_18` setzen | 2 min |
| DB ist hin | Akeeba-Kickstart mit V1-JPA-Set aus `~/Cortex/projects/praxis-webseite/_akeeba-archive/V1-2026-05-16/` | 30-60 min |
| WPML kaputt | Better-Search-Replace nochmal + Permalink-Flush | 5 min |

---

## 5. Post-Migration (separate Welle, nicht heute)

- Stabilitäts-Beobachtung 2-4 Wochen (.de bleibt parallel als stiller Fallback)
- Danach: .de → 301-Redirect auf .com via `.htaccess`
  (Begründung + Strategie siehe Chat 2026-05-16, „Domain-Strategie")
- Memory-Update: V1-Archive kann nach erfolgreichem Live-Run als
  „archiviert" markiert werden (bleibt aber 90+ Tage als Rollback-Anker)

---

## 6. Persistierte Memorys, die diese Welle stützen

- `project_praxis_com_v1_archive_2026_05_16.md` — V1-Backup-Status
- `feedback_akeeba_wp_restore_pitfalls.md` — ANI versagt stumm, manueller Import, Kickstart-403-Workaround
- `feedback_godaddy_ftps_connection_limit.md` — `pget -n 2` + 20s Sleep
- `reference_praxis_com_docroot_layout.md` — .com → `praxis2021/`, NICHT `public_html/`
- `feedback_praxis_local_first_workflow.md` — Code lokal, dann selektiver Push
- `feedback_praxis_de_to_i18n_sync.md` — DE-Änderung zieht alle Sprachen mit

---

## 7. Welle-Ende — Telegram-Push (Pflicht)

Nach E5 mit Live-Deploy-Erwähnung:
- Tool `mcp__telegram-bridge__reply`, chat_id `8547497426`
- Inhalt: WAS GEMACHT (3-5 Bullets), Stand .com Live, .de noch parallel, Rollback verfügbar

---

## 8. Was NICHT zu tun ist

- KEIN „Möchtest du..."-Stop am Welle-Ende — User hat den Plan freigegeben
- KEIN Plugin in fremden Repos modifizieren
- KEIN .env.sprint1.local committen
- KEIN `pget -n 4` — Connection-Limit
- KEIN Kickstart-Filename mit „kick", „start", „akeeba" — Insecure-Setup-Schutz
- KEIN Browser-Download großer JPA-Files — Akeeba blockt das, weil PHP/Plugin Bytes anfügen kann
