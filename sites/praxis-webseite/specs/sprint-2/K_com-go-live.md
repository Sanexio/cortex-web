---
sprint: K
phase: 1 (Verständnis) abgeschlossen · 2 (Lösungsdesign) in Review
status: 🟡 spec-only, kein Datum (wartet auf Polish-Phase + Dr.-Stracke-Freigabe)
created: 2026-05-07
trigger: Welle J abgeschlossen → `.com`-Go-Live entblockt. Architektur-Entscheidung 2026-05-07: Modell A (Local = Master).
blocker: Polish-Phase (Inhalte + Design) auf Local nicht abgeschlossen · L-1/L-2 (Impressum/Datenschutz Legal-Review) · `SFTP_COM_*`-Credentials nicht gesetzt (K0a)
verify: `tools/pre-launch-verify.sh --target=com` muss 21/21 grün liefern, danach Auth-Entfernung + HTTP-Smoke 343 Asset-Refs.
---

# Welle K — `.com`-Go-Live (Praxis-Webseite live auf westend-hausarzt.com)

> Spec angelegt 2026-05-07 nach Welle J (Pre-Launch-Hardening). Ziel: Die in
> Welle F Phase B aufgebaute Praxis-Site (PXZ 2.7.176, 6 Sprachen × 63 Pages)
> als reguläre Live-Site auf `https://westend-hausarzt.com/` unter
> Eigen-DocRoot ablegen, ohne Basic-Auth, mit dem Welle-J-Hardening direkt
> mitgepflanzt.

---

## §1 Architektur — Local = Master (Modell A, 2026-05-07)

Die Frage „wo werden Polish-Edits vorgenommen?" wurde am 2026-05-07 zugunsten
von **Modell A** entschieden:

- **Local** (Local-by-Flywheel `gpmedicalcenterwestend-…local`) = Master für
  Theme-Code (Git) **und** WP-DB-Content (Pages, Options, Menus).
- **`.de`-Staging** = Verify-Stage (mit Basic-Auth `praxis:Sanexio`).
- **`.com`-Production** = Final-Ziel (ohne Auth nach Verify).

Konsequenz für Welle K:
- Der Live-Stand auf `.com` wird aus dem **Local-Stand** gebaut, nicht aus dem
  `.de`-Staging-Stand. `.de` und `.com` sind zwei Sync-Targets desselben
  Local-Masters.
- Polish-Phase läuft als Iteration: Local-Edit → `tools/sync-local-to-de.sh`
  → Verify auf `.de` → nächste Iteration. Erst wenn Local final ist, wird
  Welle K ausgelöst.
- Pattern: `Nexus/_memory/patterns/local-master-staging-prod-pipeline.md`
  (TODO Block K-Doc).

---

## §2 Aktueller `.com`-Ist-Zustand (Probe 2026-05-07)

| Layer | Befund |
|---|---|
| DNS A-Record | `92.204.31.125` (gleiche IP wie `.de` → gleicher Server / cPanel-Konto) |
| NS | `ns75/76.domaincontrol.com` (GoDaddy-DNS) |
| HTTP | `200 OK`, Apache, PHP/8.4.19, x-frame-options SAMEORIGIN |
| Theme | `freesia-empire` (alte/Legacy-Praxis-Site) |
| WPML | aktiv (en/fr/de) |
| Vermuteter DocRoot | `/Praxis/` oder `/Praxis2/` (laut `_archive/welle-F-htaccess-diag/2026-05-06/root-full-listing.txt`); Bestätigung in K0a |

**Kein DNS-Switch nötig.** `.com` zeigt schon auf den richtigen Server. Welle
K = DocRoot-Inhalt auf gleichem Host austauschen, nicht Domain-Wechsel.

---

## §3 Phasen K0 – K11

| Phase | Inhalt | Tier | Vorbedingung |
|:-:|---|:-:|---|
| **K0a** | `SFTP_COM_*`-Credentials in `.env.sprint1.local` setzen + DocRoot über FTPS-Probe bestätigen | 3 | Dr. Stracke (Credentials oder Bestätigung „gleicher cPanel-Login wie `.de`") |
| **K0b** | Aktuelle `.com`-Site komplett sichern: Theme-Files (`freesia-empire`), `wp-content/uploads/`, DB-Dump → `_backups/k/k0-pre-com-go-live.tar.gz` + `.sql` | 3 | nach K0a |
| **K0c** | Polish-Phase abgeschlossen (Local final, `.de`-Verify grün, Dr.-Stracke-Freigabe) | 1 | extern (Polish-Welle, Sessions S55+) |
| **K1** | Tarballs aus aktuellem Local-Stand bauen (analog Welle F-Phase-B, mit `--exclude=.git` und Welle-J-Tarball-Hardening) | 1 | nach K0c |
| **K2** | DB-Dump mit Search-Replace `local → westend-hausarzt.com` via `wp-cli` (analog F-Phase-B, neue Replace-Map) | 1 | parallel zu K1 |
| **K3** | `wp-config-com.php` bauen — frische Salts (api.wordpress.org), `WP_HOME`/`WP_SITEURL` hardcoded auf `https://westend-hausarzt.com`, `FORCE_SSL_ADMIN`, `AUTOMATIC_UPDATER_DISABLED`, `DISALLOW_FILE_EDIT`. DB-Credentials = neue `.com`-DB (cPanel anlegen, K0a-Subschritt) | 1 | parallel zu K1 |
| **K4** | `.htaccess`-Live für `.com`-DocRoot bauen — Welle-J-Block direkt mit drauf, **kein Auth** (Hostname-Scope `<If "HTTP_HOST == 'westend-hausarzt.com'">`), Pretty-Lang-URLs auf `.com` skoped | 1 | parallel zu K1 |
| **K5** | FTPS-Upload aller Tarballs + DB-Dump + extract.php + wp-config nach `<COM_DOCROOT>/_deploy/welle-K/` | 3 | nach K0b + K1 + K2 + K3 + K4 |
| **K6** | Switch-Phase auf Server: extract.php-Run im `.com`-DocRoot. Reihenfolge: (a) DB-Import in neue DB, (b) wp-content extracten, (c) wp-config-com aktivieren, (d) `.htaccess` live ziehen, (e) DirectoryIndex-Switch (alte Site bleibt bis hierhin durch `index.html` o.ä. dominant — falls kein Maintenance möglich, akzeptiert kurze ~30 s Downtime) | 3 | nach K5 |
| **K7** | WPML-Mode auf Live-DB setzen (`wp option update` über `--ssh=` oder via PHP-Endpoint), `wp rewrite flush` | 3 | nach K6 |
| **K8** | Verify-Suite `tools/pre-launch-verify.sh --target=com` muss 21/21 grün liefern | 1 | nach K7 |
| **K9** | HTTP-Smoke 343 Asset-Refs (analog Welle-F-Diskrepanz-Scan) auf `.com` ohne Auth — alle 200 | 1 | nach K8 |
| **K10** | WPML-Lizenz auf `.com` aktivieren (OTGS-Account, Domain-Limit prüfen, ggf. eine Dev-Instanz freigeben) | 3 | nach K8 |
| **K11** | Bestätigung Live-Status, `.de`-Auth bleibt aktiv (`.de` weiter als Verify-Stage erhalten), Welle-Ende-Debrief, SESSION_RESUME-Update | 1 | nach K9 + K10 |

**Tier-3-Phasen** (K0a/K0b/K5/K6/K7/K10) werden in Autonomy Mode hart unterbrochen — Approval-Gate vor jeder einzelnen.

---

## §4 Search-Replace-Map (K2)

| Quelle (Local) | Ziel (Live `.com`) |
|---|---|
| `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local` | `https://westend-hausarzt.com` |
| `http://gpmedicalcenterwestend-…local` | `https://westend-hausarzt.com` (Force-SSL) |
| `gpmedicalcenterwestend-…local` (host-only) | `westend-hausarzt.com` |

Ausführung: `wp search-replace --recurse-objects --skip-columns=guid` (guid bleibt für SEO-Continuity, identisch zu Welle F).

**Variante:** Falls Polish-Phase weiterhin auf Local arbeitet, ist die
Local-DB die Quelle. Falls eine Welle dazwischen `.de`-DB als Quelle nutzt
(unwahrscheinlich nach Modell A), muss die Replace-Map angepasst werden:
`westend-hausarzt.de → westend-hausarzt.com`.

---

## §5 `.com`-`.htaccess`-Template (K4-Vorab)

Basierend auf `_deploy/welle-J/htaccess-public_html`, Hostname-Scope getauscht
und Auth entfernt:

```apache
# /<COM_DOCROOT>/.htaccess — Welle K Live (kein Auth, Hostname-scoped)
DirectoryIndex index.php index.html
Options -MultiViews -Indexes
AddDefaultCharset UTF-8

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # === Welle J Hardening (1:1 von .de übernommen) ===
    RewriteRule "\.(htaccess|htpasswd|gitignore|gitattributes|editorconfig|md|log|bak|swp|sql|tar\.gz|env)$" - [F,L,NC]
    RewriteRule "(?:^|/)(error_log|composer\.(json|lock)|package(-lock)?\.json|wp-config\.php|xmlrpc\.php)$" - [F,L,NC]
    RewriteRule "(?:^|/)(\.git|\.svn|node_modules|_archive|_backups|specs)(?:/|$)" - [F,L]
    # === /Welle J ===

    # Pretty-Lang-URLs auf .com (Hostname-scoped, NICHT auf .de übergreifend)
    RewriteCond %{HTTP_HOST} ^(www\.)?westend-hausarzt\.com$ [NC]
    RewriteRule ^(en|fr|es|it|pt-pt)/?$ /?lang=$1 [QSA,R=302,L]

    RewriteCond %{HTTP_HOST} ^(www\.)?westend-hausarzt\.com$ [NC]
    RewriteRule ^(en|fr|es|it|pt-pt)/(.+?)/?$ /$2/?lang=$1 [QSA,R=302,L]

    # Standard-WP
    RewriteRule ^index\.php$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.php [L]
</IfModule>
```

**Kritisch:** Falls `.com` und `.de` denselben DocRoot teilen würden (unwahrscheinlich, aber zu prüfen in K0a), müsste das `.htaccess` von `/public_html/` um den `.com`-Block erweitert werden. Bei eigenem `.com`-DocRoot bleibt `/public_html/.htaccess` unverändert.

---

## §6 Risiken + Mitigationen

| Risiko | Mitigation |
|---|---|
| Falscher DocRoot identifiziert → Live-Site bleibt freesia-empire | K0a Pflicht-Verify per FTPS-Probe + curl-Vergleich (Inhalt vor/nach extract.php) |
| Alte `.com`-DB wird überschrieben statt neue DB angelegt | K0a-Subschritt: neue DB-Credentials in `wp-config-com.php`, alte DB unangetastet, Backup K0b |
| WPML-Lizenz blockt Live-Aktivierung | OTGS-Token, ggf. Dev-Instanz deaktivieren (siehe Welle F §4) |
| Cross-Cascade `/public_html/.htaccess` greift in `.com`-DocRoot | K0a verifiziert: `.com`-DocRoot hat eigenes `.htaccess`. Falls nicht, Hostname-Scope ergänzen statt überschreiben. |
| `wp_options.siteurl` zeigt nach Import auf Local-URL | Search-Replace muss auch options-Tabelle treffen (`--all-tables-with-prefix`) |
| Permalinks brechen | `wp rewrite flush` in K7 |
| Plugin-Lizenz-Warnungen WPForms-Pro / WP-Mail-SMTP-Pro auf Live | OTGS-Account-Pflicht abklären, ggf. Lizenz-Reaktivierung in K10 erweitern |
| `.de`-Auth bleibt versehentlich aktiv → niemand kann `.de` lokal testen | Spec sagt explizit: `.de`-Auth bleibt aktiv (das ist gewollt — `.de` = Verify-Stage) |
| Downtime-Fenster K6 sichtbar | Kurzer Maintenance-Hinweis im alten Theme oder akzeptiert ~30 s. Optional Phase K6-pre: Wartungsseite (analog Phase A `.de`) für 5 min schalten. |
| SEO-Continuity Bruch | guid-Spalte wird im Search-Replace übersprungen, Permalink-Struktur identisch (gleiche WPML-Mode-Konfiguration), Sitemap-XML wird via AIOSEO-Plugin neu gebaut |

---

## §7 Rollback

| Punkt | Was tun |
|---|---|
| Vor K6 (Switch) | Backup K0b ist intakt, alte Site läuft weiter — kein Live-Bruch |
| Während K6 (extract.php) | extract.php-Backup-Schritt: alter `.htaccess` wird nach `_backups/k/k6-pre-htaccess.htaccess` gesichert; Re-Aktivierung durch `mv` |
| Nach K6 (Live ist neu, etwas bricht) | K0b-Tarball + DB-Dump zurückspielen — mit cPanel-DB-Import + tar-Extract. Geschätzt 15 min Downtime. |
| Welle-K-komplett-Revert | `.com`-DNS bleibt unverändert; nur DocRoot-Inhalt + DB tauschen via K0b |

---

## §8 Akzeptanzkriterien (Phase 4 — Selbstprüfung)

- **K8** `tools/pre-launch-verify.sh --target=com` → 21/21 pass
- **K9** Asset-Smoke 343 Refs → alle 200 (analog Welle-F-Diskrepanz-Scan, aber `.com`-URL)
- **Visual** 6×10 Stichprobe (6 Sprachen × 10 Top-Pages) optisch mit `.de`-Staging deckungsgleich
- **WPML** Sprach-Switcher-Links zeigen auf `westend-hausarzt.com/<lang>/` (nicht `.de` oder `.local`)
- **AIOSEO** Sitemap-XML auf `.com` erreichbar, alle 6 Sprachen drin
- **DSGVO-Hinweis** Cookie-Banner-Plugin-Status (siehe F-4 Block in SESSION_RESUME) — falls noch nicht installiert, **separater Block, nicht Welle K**

---

## §9 Outscoping (NICHT in Welle K)

- Cookie-Banner / Cookiebot / Real-Cookie-Banner / Borlabs — separater Block (Funktionalität F-4)
- WPForms-Pro-Aktivierung produktiv → separater Block (F-1)
- Cloudflare-Frontend / WAF → später
- HTTP-Security-Header (CSP, HSTS, X-Frame-Options vom Theme statt Apache) → separater Hardening-Sprint nach Live-Beobachtung
- Caching-Plugin (W3 Total Cache, WP Rocket) → nach Live-Last-Test
- A11y-Audit, Performance-Audit, SEO-Title-Pflege → separate Sprints

---

## §10 Polish-Phase Workflow (Vorlauf zu Welle K)

Während die Polish-Phase läuft (Sessions S55+ bis K0c), gilt folgender Loop:

```
1. Local-Edit (Theme-Code via Git, Page-Content via WP-Admin auf Local)
2. Theme-Files committen (PXZ-Versions-Bump, Git-Commit)
3. tools/sync-local-to-de.sh --theme [--db <patch.sql>]   ← Tier-1, autonom
4. tools/pre-launch-verify.sh --target=de                 ← muss grün bleiben
5. Browser-Walk auf .de mit Auth                          ← Dr. Stracke
6. → wenn ok: nächste Polish-Iteration; wenn nicht: zurück zu 1
```

`sync-local-to-de.sh` arbeitet **nicht** mit Tarball-Re-Upload (zu langsam), sondern mit `lftp mirror -R --only-newer`. DB-Patches bleiben **selektiv**: pro Polish-Iteration wird ein SQL-Patch-File erstellt (`tools/db-patch-export.sh`), idempotent, und remote via `import-db.php` (Welle-F-Tooling) angewandt. **Volltext-DB-Re-Import nur in Welle K Phase K2.**

---

## §11 Referenzen

- Modell-A-Entscheidung: Chat-Session 2026-05-07 (post-Welle-J).
- Welle F Phase B (Vorgänger-Pipeline): `specs/sprint-2/F_phase-B_live-deploy.md`
- Welle J (Hardening): `specs/sprint-2/J_pre-launch-security-hardening.md`
- `.com`-Ist-Zustand-Probe: 2026-05-07, Theme `freesia-empire`, IP 92.204.31.125, gleicher Server wie `.de`.
- DocRoot-Mapping: `sites/praxis-webseite/_archive/welle-F-htaccess-diag/2026-05-06/root-full-listing.txt`
- Sync-Skript: `sites/praxis-webseite/tools/sync-local-to-de.sh` (angelegt 2026-05-07)
- Verify-Suite: `sites/praxis-webseite/tools/pre-launch-verify.sh` (target=com via `--target=com`)

---

*Spec angelegt 2026-05-07 nach Welle J. Kein Datum, kein Trigger automatisch.
Welle K wird gestartet, sobald (a) Polish-Phase abgeschlossen, (b) `SFTP_COM_*`-
Credentials gesetzt, (c) Dr.-Stracke-Freigabe explizit erteilt.*
