# Welle F Phase B — Live-Deploy WordPress (westend-hausarzt.de)

> Spec angelegt 2026-05-06 nach Phase-A-Abschluss (Wartungsseite + Basic-Auth live).
> Ziel: Vollständige Praxis-Staging-Site (PXZ 2.7.176, 6 Sprachen × 63 Pages, S71-Stand) auf Domainfactory unter `https://westend-hausarzt.de/` mit Basic-Auth `praxis:Sanexio`.

---

## 1. Architektur-Entscheidung

### DocRoot

**Gewählt: `/public_html/` als DocRoot (aktueller Stand nach DF-Support-Revert)**, mit Hostname-Scoping in `.htaccess`.

| Option | Pro | Kontra |
|---|---|---|
| **A: `/public_html/`** | Kein cPanel-Re-Konfig nötig, sofort startbar | Cross-Cascade-Risiko mit `staging.westend-hausarzt.com` (Apache vererbt `.htaccess` an Sub-DocRoots) |
| B: cPanel-DocRoot auf `/westend-hausarzt.de/` umstellen | Saubere Trennung | Tier-3-Op (cPanel-API), Dr. Stracke hatte das schon mal versucht, Support hat revertet |

**Mitigation für A:** Apache-`<If "HTTP_HOST == 'westend-hausarzt.de' || …">`-Block für alle WP-Direktiven. `staging.westend-hausarzt.com` hat eigenes DocRoot — Cross-Cascade gilt nur für vererbte Direktiven, nicht für Files in `/public_html/`. WP-Core-Files (`index.php`, `wp-admin/`, `wp-content/`) sind nur via Hostname-Scoped-Rewrite erreichbar.

### Plugins (Stand Local 2026-05-06)

11 aktive Plugins:
- WPML-Suite (`sitepress-multilingual-cms`, `wpml-string-translation`, `wpml-media-translation`, `wpml-import`)
- `otgs-installer-plugin` (WPML-Lizenz-Manager)
- `all-in-one-seo-pack`
- `wpforms` (Pro)
- `wp-mail-smtp-pro`
- `safe-svg`
- `types` (Custom-Field-Plugin)

WPML-Lizenz: Auf live-Domain neu aktivieren (OTGS-Account erlaubt 1 Live + N Dev).

### WPML-Sprach-URL-Mode

- Lokal: **Mode 3** (Verzeichnis-Format `/de/`, `/en/`, …)
- Live: **Mode 2** (gleiches Verzeichnis-Format) — Sub-Directory ohne SSL-Zertifikate-Aufwand für Sub-Domains.
- DB-Variable: `wp_options.WPML_LANGUAGE_NEGOTIATION_TYPE` (1=subdomain, 2=directory, 3=parameter); Code-Wert für directory ist 1 in der WPML-Logik. Nach Import prüfen + ggf. via `wp option update` setzen.

### Theme

- **Parent:** `blocksy` (öffentliches WP.org-Theme — bei Bedarf reinstallieren)
- **Child:** `praxiszentrum` (PXZ 2.7.176, Theme-HEAD `0ca1ddc`)

---

## 2. Phasen

| Phase | Inhalt | Tier | Vorab |
|---|---|:-:|:-:|
| **B-0** | Local-Site starten (manuell) + cPanel-DB anlegen (manuell) + Credentials liefern | 3 | wartet auf Dr. Stracke |
| **B-1** | DB-Dump mit Search-Replace via wp-cli | 1 | sobald Local-Site läuft |
| **B-2** | wp-config-Live, htaccess-Live | 1 | parallel |
| **B-3** | Tarballs (wp-core, wp-content ohne uploads, uploads) | 1 | parallel, läuft schon |
| **B-4** | FTPS-Upload (lftp mirror + parallelize=4) | 3 | nach B-2 |
| **B-5** | DB-Import (mysql -h DF-Host < dump.sql) | 3 | nach B-1 + Credentials |
| **B-6** | WP-CLI-Verify oder direkter HTTP-Smoke für 6×10 Stichprobe | 3 | nach B-4 + B-5 |

---

## 3. Search-Replace-Map

| Quelle (Local) | Ziel (Live) |
|---|---|
| `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local` | `https://westend-hausarzt.de` |
| `http://gpmedicalcenterwestend-…local` | `https://westend-hausarzt.de` (Force-SSL) |
| `gpmedicalcenterwestend-…local` (host-only) | `westend-hausarzt.de` |
| Pfad-Strings für `/wp-content/uploads/` bleiben unverändert |

Ausführung via `wp search-replace --recurse-objects --skip-columns=guid` (guid bleibt für SEO-Continuity).

---

## 4. Risiken + Mitigationen

| Risiko | Mitigation |
|---|---|
| WPML-Lizenz-Aktivierung scheitert | OTGS-Token ist im Account; falls Domain-Limit überschritten → eine Dev-Instanz deaktivieren |
| WP-Mail-SMTP-Pro-Lizenz | Plugin läuft trotz inaktiver Lizenz; nur die SMTP-Config kommt aus DB |
| `staging.westend-hausarzt.com` bricht durch /public_html/.htaccess-Cascade | Hostname-Scope-`<If>`-Block, Verify nach jedem `.htaccess`-Push |
| 530 MB Upload-Zeit | Tarballs separat, Uploads parallel via lftp `parallelize=4`. Optional: `wp-content/uploads/` separat mit niedrigerer Priorität |
| Permalinks brechen nach Import | Nach Import: `wp rewrite flush` über CLI oder `?flush_rewrite=1`-Trick |
| DocRoot-Re-Konfig durch cPanel automatic | `.htaccess` mit `RewriteBase /` setzen, idempotent |

---

## 5. Rollback

- **Backup:** Aktueller Wartungsseiten-Stand in `/public_html/` ist nur `index.html` + 4 Favicons + `.htaccess`. Backup als `/public_html/_phase-A-backup.tar.gz` vor Phase-B-Start.
- **Bei Bruch:** Tarball entpacken, alles wieder auf Phase-A-Stand. Auth bleibt, DB bleibt unangetastet (Phase A hat keine DB).

---

## 6. Sukzessive Sichtbarkeit

Während Upload (~25-40 min) liefert `/public_html/index.html` weiterhin die Wartungsseite, weil `DirectoryIndex index.html index.php` priorisiert. Erst beim Live-Switch (DirectoryIndex umstellen auf `index.php index.html`) wird WP aktiv. So kein Halbzustand sichtbar.

---

*Spec angelegt 2026-05-06 in Welle F Phase B Vorbereitung.*
