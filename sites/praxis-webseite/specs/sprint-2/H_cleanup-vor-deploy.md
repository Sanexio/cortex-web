---
sprint: H
phase: 4 (Selbstprüfung) abgeschlossen
status: ✅ erfolgreich 2026-05-05
created: 2026-05-05
trigger: Strategie-Entscheidung 2026-05-05 (Doppelpfad Übergang + Greenfield)
---

## §0 Ergebnis (2026-05-05 Welle H abgeschlossen)

| Bereich | Vorher | Nachher | Delta |
|---|---:|---:|---:|
| Aktive Plugins | 24 | **7** | −17 |
| Plugin-FS-Verzeichnisse | 30+ | **9** | −21+ |
| Installierte Themes | 7 | **3** | −4 |
| Pages publish | 402 | **363** | −39 |
| Trash-Pages | 18 | 0 | −18 |
| `door`-Posts | 25 | 0 | −25 |
| `postman_sent_mail` | 250 | 0 | −250 |
| `wpforms`-Form-Defs | 11 | 0 | −11 |
| Revisions | 846 | 661 | −185 |
| Orphan-postmeta | — | 1072 cleaned | — |
| wp_options | 605 / 1,4 MB | **414 / 477 KB** | −191 / −66 % |

**HTTP-Verify:** 24/24 = 200 OK auf allen geprüften URLs (Frontend + Sprach-Switcher 6 Sprachen + Service-Forms + Detail-Pages + WP-Login + juristische Pages).

**Backups in `_backups/h/`:** h1-pre, h1-plugins-tar, h2-themes-tar, h3-pre.

**Bug während Welle H entdeckt + behoben:** `UPDATE _icl_cache SET option_value=""` warf TypeError, weil WPML ein serialisiertes Array erwartet. Fix: `DELETE` statt UPDATE. Dokumentiert in `Nexus/Second Brain/30 Tutorials/WordPress/01-db-cleanup-fallstricke.md`.

**WPML bleibt KEEP** (Sprint γ — `gamma_trunk-first-i18n-migration.md` — startet nach Welle F).

---


# Welle H — Cleanup vor Live-Deploy

> Vor dem Live-Push der Übergangs-Seite (Welle F, Domainfactory) wird die
> aktuelle WP-Instanz von altem Plugin-/Theme-/Page-/Options-Ballast befreit.
> Substanz (315 Übersetzungen, 174 neuen Page-IDs 10035–10208,
> Theme PXZ 2.7.170) bleibt erhalten.

---

## §1 Auftrag

Direktes Zitat Dr. Stracke (Chat 2026-05-05): „Wir wollen mit der bereinigten
aktuellen Instanz live gehen, parallel den Greenfield-Pfad vorbereiten."

Cleanup-Ziele:
- Plugin-Set auf produktiv-notwendige reduzieren (24 → ~6 aktive Plugins)
- Theme-Set auf {praxiszentrum, blocksy, twentytwentyfive} reduzieren
- Page-Bestand auf aktuelle DE-Master + ihre Übersetzungen reduzieren (402 → ca. 320)
- wp_options-Ballast (Transients, Caches, alte Plugin-Daten) entfernen

---

## §2 Inventur-Befund (Phase 1, abgeschlossen)

| Bereich | Ist-Stand | Soll-Stand | Diff |
|---|---:|---:|---:|
| Aktive Plugins | 24 | ~6 | −18 |
| Installierte Themes | 7 | 3 | −4 |
| Pages publish | 402 | ~320 | −82 |
| Pages trash | 18 | 0 | −18 |
| Pages mit Trid ohne DE-Master | 42 orphan | 0 | −42 |
| Pages letzte Änderung <2024 | 55 | 0–10 | −45+ |
| `door`-Post-Type | 25 | 0 | −25 |
| `postman_sent_mail`-Logs | 250 | 0 | −250 |
| Revisions | 846 | ~315 | −530 (komprimieren) |
| wp_options | 605 / 1,4 MB | ~450 / ~700 KB | −150 Optionen, −50 % Größe |

---

## §3 Block H1 — Plugin-Purge

**Risiko:** mittel — falsch deinstalliertes Plugin kann Render brechen.
**Backup:** vor Block: DB-Dump nach `_backups/h/h1-pre.sql.gz` + `wp-content/plugins/` Tarball.

### KEEP (6 Plugins)

| Plugin | Begründung |
|---|---|
| `sitepress-multilingual-cms` (WPML) | trägt 315 Übersetzungen — Kernsystem |
| `wpml-import` | WPML-Helper |
| `wpml-media-translation` | WPML-Helper |
| `all-in-one-seo-pack` (AIOSEO) | SEO-Title/Meta/JSON-LD |
| `wp-mail-smtp-pro` | E-Mail-Versand für Service-Forms (S63) |
| `safe-svg` | SVG-Upload-Härtung |

### KEEP-VERIFY (1 Plugin, vor Drop verifizieren)

| Plugin | Verifikations-Schritt |
|---|---|
| `types` | WP-CLI-Query auf `door`-Post-Type — bestätigt: 25 publish (Adventskalender-Türen, kein Produktiv-Content). **→ Drop nach Hard-Delete der `door`-Posts in H3.** |

### DROP (17 Plugins)

| Plugin | Begründung |
|---|---|
| `wpforms` + `wpforms-lite` | seit S63 durch Custom-PHP `inc/service-forms.php` ersetzt |
| `all-in-one-wp-migration` / `duplicator` | Migrations-Tools, ad-hoc auf Bedarf reinstallierbar |
| `better-search-replace` | Migrations-Tool, ad-hoc nutzbar |
| `disable-remove-google-fonts` | Theme lädt Inter self-hosted, 0 Pages mit `fonts.googleapis.com` (verifiziert) |
| `freesia-empire-plus` / `theme-freesia-demo-import` | Demo-Plugins vom alten Freesia-Theme |
| `generateblocks` | 0 Pages mit GenerateBlocks-Markup (verifiziert) |
| `header-footer` | Plugin vom ehemaligen Theme |
| `widget-clone` | Legacy-Widget-Helper |
| `google-analytics-for-wordpress` | DSGVO-fragwürdig für Arztpraxis ohne aktivem Cookie-Consent |
| `media-sync` / `wordpress-importer` | nur für initialen Import |
| `optinmonster` / `rapidmail-newsletter-software` / `userfeedback-lite` | Newsletter/Feedback, nicht aktiv |
| `wp-maximum-upload-file-size` | per `php.ini` lösbar |
| `akeebabackupwp` (filesystem only) | nicht aktiv, FS-Eintrag entfernen |
| `complianz-gdpr.DISABLED` (filesystem only) | bereits deaktiviert, FS-Eintrag entfernen |
| `otgs-installer-plugin` | OTGS-Installer (für WPML-Updates) — kann nach manueller Update-Strategie entfernt werden, **vorsichtshalber KEEP-VERIFY** |
| `wpml-string-translation` | **prüfen:** wird String-Translation im Theme genutzt? Falls ja KEEP |

### Schritte H1
1. Backup-Tarball + DB-Dump
2. Plugin-Update-Sweep auf KEEP-Liste (Sicherheits-Patches)
3. Iterativ pro DROP-Plugin: `wp plugin deactivate <slug>` → `wp plugin uninstall <slug>` (löscht auch DB-Optionen)
4. Filesystem-Cleanup: `rm -rf wp-content/plugins/akeebabackupwp wp-content/plugins/complianz-gdpr.DISABLED`
5. Verify: `wp plugin list --status=active --format=count` → 7

---

## §4 Block H2 — Theme-Purge

**Risiko:** gering.
**Backup:** vor Block: `wp-content/themes/` Tarball.

### KEEP (3 Themes)

| Theme | Begründung |
|---|---|
| `praxiszentrum` | aktives Stylesheet (Cortex-Trunk-Render) |
| `blocksy` | aktives Template-Parent (praxiszentrum ist Child-Theme) |
| `twentytwentyfive` | letzter WP-Default als Recovery-Fallback |

### DROP (4 Themes)

| Theme | Begründung |
|---|---|
| `freesia-empire` | Vorgänger-Theme |
| `twentytwentyfour` | überholter WP-Default |
| `twentytwentythree` | überholter WP-Default |
| `twentytwentytwo` | überholter WP-Default |

### Schritte H2
1. Tarball
2. `wp theme delete <slug>` für 4 Themes
3. Verify: `wp theme list` → 3 Einträge

---

## §5 Block H3 — Legacy-Page-Hard-Delete

**Risiko:** hoch — Hard-Delete ist nicht undobar (außer per DB-Restore).
**Backup:** vor Block: vollständiger DB-Dump nach `_backups/h/h3-pre.sql.gz`.

### Strategie

Klassifikation pro Page in 3 Stufen:

1. **KEEP-CURRENT (Cortex-Trunk-konform):** Pages, deren `wp_icl_translations.trid` einen DE-Master hat, der in der aktuellen Trunk-Page-Liste vorkommt (Page-IDs in `/inc/data/page-hub-*.php` referenziert oder Slug in `_shared/*.yaml`). Plus alle WPML-Übersetzungen ihres Trid.

2. **DROP-ORPHAN (42 Stück):** Pages mit Trid, deren DE-Master gelöscht/im Trash ist. Übersetzungs-Leichen aus dem alten Bestand.

3. **DROP-LEGACY (~40 Stück):** Pages mit `post_modified < 2024-01-01` UND Slug nicht im aktuellen Trunk-Set. Manuelle Whitelist-Prüfung pro Slug nötig.

### Whitelist-Sanity-Check (vor Hard-Delete)

```sql
-- Liste der 60 DE-Master-Pages mit Slugs, die KEEP-Set definieren
SELECT p.ID, p.post_name FROM wp_posts p
  JOIN wp_icl_translations t ON t.element_id=p.ID AND t.element_type='post_page'
 WHERE p.post_type='page' AND p.post_status='publish'
   AND t.language_code='de'
 ORDER BY p.ID;
```

Liste in der Spec festhalten (Anhang A folgt nach Phase-2-Freigabe).

### Sub-Schritte H3
- **H3.1:** 18 Trash-Pages permanent löschen
- **H3.2:** 25 `door`-Posts permanent löschen
- **H3.3:** 250 `postman_sent_mail` permanent löschen
- **H3.4:** 42 Orphan-Übersetzungen permanent löschen + Trid-Rows in `wp_icl_translations`
- **H3.5:** Legacy-Pages mit `post_modified<2024` ohne aktuellen Slug-Bezug — pro Page einzeln prüfen, dann Hard-Delete
- **H3.6:** 11 alte `post`-Type publish (Blog-Einträge) — prüfen, vermutlich DROP
- **H3.7:** Revisions auf 5 pro Page begrenzen (`wp post delete` für überzählige)

### Verify nach H3
- `wp post list --post_type=page --post_status=publish --format=count` ≈ 318 (60 DE × 5 Übersetzungs-Sprachen + ~18 Doctor-Bios + Hubs)
- HTTP-Sweep: alle 60 DE-Slugs × 6 Sprachen → 200 OK
- `verify.sh` grün

---

## §6 Block H4 — wp_options-Sweep

**Risiko:** gering — Transients regenerieren sich.
**Backup:** Vor Block: `wp_options`-Tabelle als CSV.

### Schritte H4
1. **Transients hart leeren:** `wp transient delete --all`
2. **`_icl_cache` leeren:** WPML regeneriert
3. **`_transient_codepopular_blog_posts` (167 KB) löschen:** alt-Theme-Daten
4. **Plugin-Reste:** Nach H1 hängen alte `option_name`-Patterns. `wp option delete` für Patterns von gedroppten Plugins (`fs_accounts`, `wpforms_*`, `optinmonster_*`, etc.)
5. **autoload-Audit:** alle Optionen mit `autoload=yes` UND Größe >5 KB anzeigen — pro Eintrag entscheiden, ob `autoload` auf `no` gesetzt werden kann

### Verify nach H4
- wp_options-Count <460
- `SUM(LENGTH(option_value))` <800 KB
- TTFB-Vergleich vor/nach H4 (ggf. messbare Verbesserung durch reduzierte Autoload-Größe)

---

## §7 Acceptance-Kriterien (Dr.-Stracke-Sicht)

- [ ] WP-Admin-Plugin-Liste zeigt nur die 6 KEEP-Plugins (+ ggf. types KEEP-VERIFY)
- [ ] WP-Admin-Theme-Liste zeigt 3 Themes
- [ ] WP-Pages-Liste zeigt nur die aktuellen Trunk-Pages (kein Adventskalender, keine alten Sars-CoV-2-Pages, keine Freesia-Demo-Reste)
- [ ] HTTP-Sweep: alle 60 DE-Slugs × 6 Sprachen = 360 Requests = HTTP 200
- [ ] `tools/verify.sh` grün
- [ ] WP-Admin-Dashboard lädt schnell (TTFB <500 ms, vorher: zu messen)
- [ ] Service-Forms (S63) funktionieren weiter (mind. 1 Test-Submit auf `/service/terminanfrage/`)
- [ ] Mehrsprachigkeit: Sprach-Switcher zeigt alle 6 Sprachen, navigierte Übersetzungen erreichen den Zielinhalt
- [ ] Browser-Smoke: 6 Top-Level-Pages × 2 Sprachen (DE + EN) sichtgeprüft

---

## §8 Risikoliste

| Risiko | Wahrscheinlichkeit | Impact | Gegenmaßnahme |
|---|:---:|:---:|---|
| WPML-String-Translation noch im Theme genutzt | mittel | hoch | grep `praxiszentrum/` nach `icl_t(` / `wpml_translate_string` vor H1 |
| Hard-Delete einer Page, die noch verlinkt ist | niedrig | mittel | Vor H3.5 Whitelist-Review mit Dr. Stracke |
| Custom-Form-AJAX-Endpoint hängt an wpforms | niedrig | hoch | Code-Audit `inc/service-forms.php` — bestätigt: kein wpforms-Dep |
| Theme-Updates über Hard-Delete brechen Kind-Theme | niedrig | hoch | blocksy bleibt KEEP, nur Defaults raus |
| Backup-Restore-Pfad funktioniert nicht | niedrig | hoch | vor H1 Test-Restore in lokales `local-h-test`-Site |

---

## §9 Reihenfolge + Tier-3-Freigaben

1. **Phase-2-Abnahme dieser Spec durch Dr. Stracke** — Korrekturen jetzt, vor Phase 3.
2. **H1 Plugin-Purge** — Tier-3-Freigabe. Backup → Drop → Verify.
3. **H2 Theme-Purge** — Tier-3-Freigabe. Backup → Drop → Verify.
4. **H3 Page-Hard-Delete** — **getrennte Tier-3-Freigaben** pro Sub-Schritt H3.1–H3.7.
5. **H4 wp_options-Sweep** — Tier-3-Freigabe. Backup → Sweep → Verify.
6. **Phase-4 Selbstprüfung** — `verify.sh`, HTTP-Sweep, Browser-Smoke.
7. **Theme-Bump PXZ 2.7.170 → 2.7.171** + SESSION_RESUME-Update + Commit.

---

## §10 Cross-Cutting (LL-058)

- **CW-001 Trunk ist Master:** Cleanup ändert nichts an der Trunk-Quelle. Adapter-Re-Run nach H würde dieselbe Substanz erneut produzieren.
- **CW-008 Backup vor destruktivem Push:** `_backups/h/` als Pfad.
- **LL-050 destruktive Git-Ops:** keine — alle DB-Ops sind WP-CLI / SQL.
- **LL-053 Memory-Layer:** SESSION_RESUME §1 wird mit Welle H ergänzt, ältere Welle nach Cold-Archive.

---

## Anhang A — Whitelist KEEP-CURRENT-Slugs (folgt nach §3 Abnahme)

Wird zur Phase-3-Vorbereitung gefüllt. Pflicht: 60 DE-Master-Slugs in JSON-Liste,
plus Service-Forms-Pages (videosprechstunde, fragebogen-vor-termin, terminanfrage,
rezeptbestellung, ueberweisung, neupatienten), plus alle Doctor-Bio-Slugs.
