# praxis-web — Projekt-Regeln

Unterprojekt von Juvantis. WordPress-Seite der Praxis Dr. Stracke.
Diese Regeln ergaenzen `Nexus/_rules/GLOBAL_RULES.md` und `projects/Juvantis/_config/RULES.md`.

---

## 1. Stammdaten

| Parameter | Wert |
|---|---|
| Live-URL | https://westend-hausarzt.com/ |
| Hoster | Domainfactory |
| CMS | WordPress |
| Git-Repo | Lokal im `theme/`-Ordner, **kein Remote** |
| Staging | Lokal via Local by Flywheel, Site `praxis-stracke-staging` |
| WP-Export | `praxis-web/exports/gpmedicalcenterwestend.WordPress.2026-04-04.md` |

---

## 2. Zugangsregeln (PW-001)

- **Credentials IMMER in `_config/.env`**, niemals im Repo/Markdown
- `.env` ist via `.gitignore` ausgeschlossen
- Application Password wird in WP unter *Users → Profile → Application Passwords* generiert
- Schema:
  ```
  WP_URL=https://westend-hausarzt.com
  WP_USER=<admin-username>
  WP_APP_PASSWORD=<xxxx xxxx xxxx xxxx xxxx xxxx>
  ```
- Revoke-Prozedur: Bei Verdacht auf Leak sofort in WP-Admin revoken, neues App-PW anlegen

---

## 3. Aenderungs-Workflow (PW-002)

### Content-Aenderungen (Texte, Bilder, neue Seiten)
1. Direkt auf Live via REST-API oder WP-Admin
2. WP-Revisions sind Rollback-Quelle (auto)
3. Aenderung in `praxis-web/_config/CHANGELOG.md` dokumentieren

### Theme-/Code-Aenderungen (PHP, CSS, JS)
1. **PFLICHT: Zuerst auf Staging** (Local by Flywheel)
2. Git-Commit im Theme-Ordner nach jedem funktionalen Schritt
3. Lokal testen: Rendering, Plugin-Kompatibilitaet, Mobile-View
4. Erst danach Deploy auf Live via SFTP (Domainfactory) oder WP-Admin-Upload
5. Nach Live-Deploy: Live-Seite in 3+ Browsern pruefen

### NIEMALS:
- Direkte PHP-Edits auf Live (WSOD-Risiko)
- Plugin-Updates auf Live ohne vorherigen Staging-Test
- Datenbank-Direktmanipulationen ohne Backup

---

## 4. Werkzeug-Prioritaet (PW-003)

Reihenfolge bei Aenderungen:

| Prio | Tool | Einsatz |
|---|---|---|
| 1 | WP REST API via `curl`/Python | Pages, Posts, Media — programmatisch |
| 2 | Lokales Staging + Git | Theme-Reparatur, Plugin-Test |
| 3 | Chrome-MCP auf wp-admin | Nur wenn REST-API keinen Endpoint hat (z.B. Plugin-Settings) |
| 4 | SFTP zum Domainfactory-Server | Theme-Deploy auf Live |
| 5 | phpMyAdmin | Nur bei explizitem Bedarf, mit DB-Backup davor |

---

## 5. Backup-Regel (PW-004)

Vor jeder nicht-trivialen Aenderung:
- **Content-Aenderung:** WP-Revisions reichen
- **Theme-Aenderung:** Git-Commit vor Edit
- **Plugin-Aktivierung/-Deaktivierung:** Vorher Domainfactory-Backup pruefen (automatisches Backup?)
- **DB-Eingriff:** Export via Duplicator oder phpMyAdmin PFLICHT

---

## 6. Output-Konvention

- Verarbeitete Dokumente (z.B. Content-Briefings, Reparatur-Reports) → `praxis-web/Output/`
- Eingangs-Material (z.B. neue Texte von Dr. Stracke) → `praxis-web/Input/`
- Exporte/Archive (WP-XML, DB-Dumps) → `praxis-web/exports/`

---

## 7. Gemeinsame Ressourcen mit juvantis-web

Zugriff auf `projects/Juvantis/_shared/` ist erlaubt fuer:
- Logos, Farben (brand/)
- Wiederverwendbare Texte (content/)
- Impressum/DSGVO-Bausteine (legal/)

**Upload-Regel:** Bilder aus `_shared/media/` werden in die WP-Mediathek hochgeladen,
nicht per Hotlink verknuepft. `_shared/` ist Quelle, nicht Auslieferung.
