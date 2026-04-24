# Cortex-Web — Sessions 21–33 (April 2026)

> Konsolidiertes Archiv aller Session-Logs S21 bis S33, ausgelagert aus
> `SESSION_RESUME.md` im Zuge der Sanitizer-Rotation Session 38 (2026-04-24)
> gemäß LL-044. Index: `SESSION_RESUME.md §7`.

---

## Session 33 — 2026-04-24 (Block-A-Closure + B-2 Triage + Docteur-Saul-Bio)

### Gerät
**Cluster-Mini-02** (home-Mac M2).

### Drei-Akte-Verlauf

**Akt 1 — S32-Commit-Hygiene (Aufräum-Front, 15 Min):**
Dr. Stracke hat mit „entscheide selbst unter den bisher festgelegten Kriterien" autonome Freigabe gegeben. Befund: S32 war nicht commit-abgeschlossen (Working-Tree 5 Cortex-Web-Files + Theme-team.json). Priorität Hygiene vor neuer Arbeit (FK-5-Vermeidung, LL-021). Commits:
- `cbbe158` Theme: `inc/data/team.json` mit image_id=9683/9684
- `bea5330` Cortex-Web: Block-A-Trunk (2 YAMLs + Schema-Int + Renderer-Patch) + SESSION_RESUME-Update

**Akt 2 — B-2 Legacy/DE Triage (Haupt-Front, P3):**
Strukturierte Sichtung aller 25 Pages im `legacy/de`-Cluster (23 published + 2 private). Jede Page bewertet in 4 Dimensionen (Content-Substanz, Redundanz, Cluster-Fehler, Launch-Relevanz), genau 1 von 5 Empfehlungen vergeben:

| Kategorie | # | Launch-Impact |
|---|:-:|---|
| **PFLEGEN** | 7 | 6 Service-Pages unter `/service/<slug>/` + Zweigpraxis Bockenheimer — alle bestehender HWG-neutraler Content, 0 Schreibaufwand |
| **MERGEN** | 6 | Sprechzeiten → `/sprechstunden/` · Docteur-Saul-Bio → B-1 · Carotis → Diagnostik · FAQ → Accordion in `/praxis/` · 2× Forms-Stub |
| **ARCHIV-ONLY** | 5 | DocVocat (inaktiv) · Corona · Weihnachtskalender · 2× private |
| **LÖSCHEN** | 6 | 3× leere ES/FR/EN-Dubletten · under-construction · cookie-Fragment · ES-Form-Dublette |
| **DR.-STRACKE-FRAGE** | 1 → 0 | „Alte Oper" geklärt → Terminologie-Neuschnitt |

Dr.-Stracke-Antworten eingearbeitet:
1. **Zweigpraxis Bockenheimer Landstraße** = neue Terminologie (ersetzt „Alte Oper")
2. **DocVocat nicht mehr aktiv** → ARCHIV-ONLY final
3. **Service-Pages-Struktur:** `/service/<slug>/` (Unter-Bereich)
4. **FAQ:** Accordion-Block in `/praxis/` (Default-Interpretation, Antwort „accordion")

Commits: `a859d51` (Erstfassung) + `ce50c6d` (Freigabe mit 4 Antworten).

**Akt 3 — Goldstück-Anwendung (B-1-Vorarbeit, 15 Min):**
`docteur-en-med-s-saul-375.md` aus Legacy-Archiv (6586 chars, DE-Content trotz FR-Slug) als Bio-Rohmaterial nach Trunk extrahiert:
- Mojibake-Fix
- HWG-Filter (werbende Formulierungen raus)
- Sprachverdichtung 6586 → ~900 chars, 4 Absätze
- Ziel: `trunk/content/team/docteur-saul.yaml:bio.de`
- `qualifications`: „Arbeitsunfallmedizin" ergänzt (Juvantis-View)

Render-Status: bio.de wurde vom Praxis-Renderer noch NICHT konsumiert (team-praxis.mjs mapped nur `intro`). Theme `inc/data/team.json` byte-identisch, kein Theme-Commit. Ausführlicher Profil-Bio-Block erscheint auf `/docteur-saul/` erst nach Renderer- + Template-Erweiterung (B-1-Template-Arbeit, eigene Folge-Session = später erledigt in S35).

Commit: `ace49ed`.

### Pre-Flight-Metriken am Session-Ende
- `tools/validate.sh` — OK (1 file)
- `sites/praxis-webseite/tools/verify.sh` — VERIFY OK
- Sanitizer-Probe: alle im Budget (MEMORY 4030 Tok, Nexus/CLAUDE 6410 Tok, SESSION_RESUME vor Update 13.7k Tok, GLOBAL_RULES 7.5k Tok)
- Sanitizer-Learn: 0 Duplikate, 110 stale-refs (+2 vs. S32)

### Pattern + Tutorial
- **NEU** `Nexus/_memory/patterns/content-archive-triage.md` — 4-Dimensionen-Bewertung, 5-Kategorien-Empfehlung, Goldstück-Erkennungs-Workflow, Mojibake-Fix-Muster
- **NEU** `Second Brain/30 Tutorials/Arbeitsweise & Prozess/08-content-archive-triage.md`

### Commits
- Cortex-Web: `bea5330` · `a859d51` · `ce50c6d` · `ace49ed`
- Theme: `cbbe158`
- Nexus: Pattern + Tutorial + MEMORY (Auto-Sync)

---

## Session 32 — 2026-04-24 (Praxis-Fokus-Schwenk + Block A schlank)

### Gerät
**Cluster-Mini-02** (home-Mac M2).

### Session-Verlauf in drei Akten

**Akt 1 — Prio-Default P1-a angegangen, Scope-Check:**
Dr. Stracke hat den S31-Default „P1 Medien-Registry" gewählt. Phase-1-Verständnis-Modus (Schema B + Upload-α + URI I), mehrfach Rückfragen (Fotos-Ort, Platform-Target, WP-Credentials).

**Akt 2 — Strukturelles Refactor: Juvantis/_assets → Cortex-Web/_media-source:**
Dr. Strackes Hinweis „Warum ist der Ordner nicht im Common Trunk" offenbarte, dass der gesamte Juvantis-Asset-Bestand architektur-widrig lag (CW-001/003 verletzt). Migration:
- `Juvantis/_assets/Media/_Praxis/` → `_media-source/{team/, praxis/standorte/{bockenheimer,grueneburgweg,leerbachstrasse}/}` (Umlaut-Normalisierung)
- `Juvantis/_assets/Logos/{Praxiszentrum,Sanexio}/` → `_media-source/logos/{praxiszentrum,sanexio}/`
- `Juvantis/_assets/Icons/` → `_media-source/icons/` (129 Files)
- `Juvantis/_assets/Media/_Slider/` → `_media-source/slider/` (19 Files)
- `Juvantis/_assets/Media/MFA Team/` → `_media-source/team/mfa/` (4 Files)
- `Juvantis/_assets/Media/online-medical-assistance-illustration/` → `_media-source/illustrations/online-medical-assistance/` (4 Files)
- `Juvantis/_assets/Media/`-Root (96 Files, gemischt) → `_media-source/_inbox/media-root/` + README mit Sortier-Anleitung
- `Juvantis/_assets/` komplett entfernt ✅

**Akt 3 — Refocus Dr. Stracke: „Wir verzetteln uns. Fokus Praxis live.":**
Projekt-Übersicht geliefert (ASCII-System-Anatomie, Projekt-Matrix, Fokus-Roadmap Block A–D bis M1), dann **Framework-Plan verworfen** und stattdessen schlanken Direktpfad gewählt:
- **Befund:** Nur 2 von 8 Ärzten haben Fotos im Bestand (Siegbert Stracke 1900x1900, Sonja Saul 1900x1900 — beides web-optimiert, quadratisch, ~38 KB)
- **Upload:** `wp media import` via Local-by-Flywheel mit MySQL-Socket-Override in wp-config.php + `WP_CLI_PHP_ARGS=-d memory_limit=512M` + `--skip-plugins=sitepress-multilingual-cms` (WPML-Memory-Bombe) → Attachment-IDs 9683 (Stracke) + 9684 (Saul)
- **Trunk-Patch:** 2 YAMLs `image: <int>`, Schema um `integer` erweitert, Renderer `typeof member.image === "number" ? member.image : 0`
- **Build + Push:** `sync-team-wp.sh build && push` → `inc/data/team.json` mit image_id=9683/9684 für 2 von 8 Ärzten, 0 für übrige
- **Smoke-Test:** alle grün

### Pre-Flight-Metriken
- `tools/validate.sh` — OK
- `sites/praxis-webseite/tools/verify.sh` — VERIFY OK
- Sanitizer-Probe: alle im Budget
- Sanitizer-Learn: 0 Duplikate, 108 stale-refs (+4 vs. S31)

### Commits
- Cortex-Web: Block A (trunk-YAMLs + Schema + Renderer) + S31-Nachtrag (CW-PRIO-001 + §0)
- Theme: team.json regeneriert (PXZ 2.7.22)
- Nexus: Pattern `wp-cli-media-upload-wpml-memory` + Tutorial `07-lazy-path-shortcuts-statt-framework`

---

## Session 31 — 2026-04-23 (Live-Verify N-8 Guard + CW-PRIO-001 Prio-Shift)

### Ziel
1. Live-Verify N-8 Pattern-B-Guard in Produktiv-Shopify
2. Nach Dr.-Stracke-Feedback („wir kommen nicht vom Fleck") holistische Strategie-Neuausrichtung

### Umsetzung Teil 1 — Live-Verify
- Pre-Snapshot GET → `bash tools/sync-page-shopify.sh trunk/content/pages/_shared/ueber-uns.yaml` → Post-Snapshot GET → `ls .backups/`
- Ergebnis (7/7 AKs): Exit-Code 2 ✅ · Error-Message wortgleich ✅ · Pre-/Post-GET byte-identisch ✅ · `.backups/` nicht erzeugt → Guard feuerte VOR Backup-Block ✅
- Evidence: `specs/cross-site-transfer/evidence/2026-04-23_live-verify-n8-guard.md`
- Bedeutung: Pattern B auf Shopify ist empirisch vollständig geschützt

### Umsetzung Teil 2 — CW-PRIO-001
- Audit: 7/10 Sessions (S22–S31) Infrastruktur, nur 3 Praxis-direkt → Adapter-Suite 90 % symmetrisch, aber Medien leer, Prod nicht deployed
- Neue Prio-Leiter P1–P6 + Popt + Pios in `_config/RULES.md` als CW-PRIO-001
- §0 Roadmap in SESSION_RESUME als erster Block neu strukturiert
- Pattern `Nexus/_memory/patterns/holistic-system-priority.md`
- Tutorial `Second Brain/30 Tutorials/Arbeitsweise & Prozess/06-projekt-prio-leiter-holistic.md`
- Default-Pfad ab S32: P1 Medien-Registry

### Pre-Flight-Metriken
- `tools/validate.sh` — OK · Sanitizer alles im Budget · Theme PXZ 2.7.22 unverändert · Shopify Page `/uber-uns` unverändert

---

## Session 30 — 2026-04-23 (N-6.3 `cw-transfer diff wp:template`, autonom)

### Architektur-Wahl
4 Weichen entschieden: D1 CLI-Arg = Option B (Renderer-Handle als Arg) · D2 Build-Reuse = Option A (Sub-Prozess-Spawn) · Evidence = Extended (Parity + Drift × 2 + ABSENT + Restore + Re-Diff) · Ablauf = Bündel

### Umsetzung
- Spec `specs/cross-site-transfer/N-6.3_cw-transfer-diff-wp-template.md` (244 Z., 16 AKs)
- NEU `adapters/wordpress/diff-team.mjs` (290 Z., 7.0 KB Bundle)
- `DIFF_RENDERERS` Registry · Sub-Prozess-Spawn `build-team.mjs` · 0 Schreib-Calls · Path-Escape-Guard · Canonical-JSON · 3 Compare-Felder (`member_count`, `member_slugs_sorted`, `team_json`) · Text + JSON Output · Exit 0/1/2

### Selbstprüfung 16/16 AK
- T-1 Parity text: Exit 0, alle 3 Felder EQUAL (2171 chars canonical beidseitig)
- T-3 Drift Field-Mutation: Exit 1, nur `team_json` DIFFER, first_diff_offset 387 ✅ korrekte Granularität
- T-4 Drift Member-Removal: Exit 1, alle 3 Felder DIFFER, `diff_count: 3`
- T-5 ABSENT: `live_file: ABSENT`
- T-6 Restore via MD5-Match
- T-6b Re-Diff EQUAL

### Pattern + Tutorial
- Pattern `build-then-fetch-then-diff.md` erweitert um Filesystem-Variante (5 Dimensionen HTTP vs. FS)
- Tutorial `03-cross-site-adapter-diffs.md` erweitert um „Drei Lehren aus N-6.3"

---

## Session 29 — 2026-04-23 (N-1 WP-Template-Adapter, autonom)

### Architektur
4 Varianten geprüft: V1 PHP-Generate · **V2 JSON-Data-File** ⭐ · V3 WP-Option · V4 Post-Meta. Gewählt V2: höchste Symmetrie zu Shopify-Pattern-B.

### Umsetzung
- Spec `specs/cross-site-transfer/N-1_wp-template-adapter.md` (244 Z., 13 AKs)
- NEU Adapter-Suite (593 Z. total): `build-team.mjs` (124 Z.) · `team-to-wp.mjs` (113 Z.) · `lib/renderers/team-praxis.mjs` (77 Z.) · `tools/sync-team-wp.sh` (35 Z.)
- Modifiziert: `tools/cw-transfer` + `renderer-registry.mjs` (status: planned → stable)
- Theme-Patch `praxiszentrum@29dcaf8` (PXZ 2.7.22): `inc/data/team.json` (NEU, 2797 Bytes, 8 Doctors) + `inc/team-data.php` JSON-first + Inline-Fallback

### Selbstprüfung 12/13 AK + 1 dokumentierte Abweichung
- AK-2 `build-team.mjs` ≥150 Z. → 124 Z. ⚠️ (funktional komplett)
- AK-11 Dry-Run-Parität PHP-side: `diff` Exit 0
- AK-12 Live-Test Local-WP: `/team/` HTTP 200, 8× `pxz-team-card-link`, `/dr-stracke/` 200, `/docteur-saul/` 200

### Pattern + Tutorial
- NEU `wp-theme-data-json.md` — Pattern B reverse für WP
- NEU `Second Brain/30 Tutorials/Arbeitsweise & Prozess/05-adapter-theme-file-write.md`

### Commits
- Theme: `29dcaf8` (PXZ 2.7.22)
- Cortex-Web: `963c93d`

---

## Session 28 — 2026-04-23 (N-6.2 `cw-transfer diff shopify:template`, autonom)

### Wahl
N-6.2 gewählt nach Effizienz-/Effektivitäts-Bewertung: komplettiert den Diff-Quadrant mit Wiederverwendung des N-6-Patterns. Read-only, kein CW-006-Graubereich.

### Umsetzung
- Spec `specs/cross-site-transfer/N-6.2_cw-transfer-diff-template.md` (14168 Bytes, 14 AKs)
- NEU `adapters/shopify/diff-template.mjs` (306 Z., 9881 Bytes)
- Sub-Prozess-Spawn `build-template.mjs` · Theme-ID-Resolution · Live-Fetch `GET /themes/<id>/assets.json` · **symmetrisches Header-Stripping** (`HEADER_STRIP_RE = /^\/\*[\s\S]*?\*\/\s*/m`) · canonical-JSON · 4 Compare-Felder · Exit 0/1/2

### Selbstprüfung 14/14 AK
### Bonus Live-Diff
```
live_theme_id    : 181128757515
live_asset       : exists (size 6860 bytes, updated 2026-04-22T20:42:06+02:00)
section_count    : EQUAL (local=2, live=2)
section_types    : EQUAL (["juvantis-ueber-uns","main-page"])
order            : EQUAL (2 items)
template_json    : EQUAL (4836 chars canonical)
RESULT           : EQUAL (Exit 0)
```
**Bedeutung:** Trunk + Renderer byte-genau identisch mit Shopify-Live-Template-Asset. **Stärkster Roundtrip-Beweis für content-bridge-v1.**

### Pattern A vs B Symmetrie
- S26 N-6 Pattern A `pages/uber-uns`: body_html DIFFER (live=0, trunk=8505) — weil Pattern B die Page mit Theme-Asset rendert, Body soll leer sein
- S27 N-8: write-time Drift-Blocker
- S28 N-6.2 Pattern B `templates/page.uber-uns.json`: template_json EQUAL (4836↔4836)

---

## Session 27 — 2026-04-23 (N-8 Pattern-A-vs-B-Guard, autonom)

Vollversion: Commit `74c6470` + Evidence `2026-04-23_n-8_self-check.md`
- Adapter-Erweiterung `pages-to-shopify.mjs` (+25 Z.): template_suffix im Lookup, `ALLOW_PATTERN_OVERRIDE` Env-Flag, Guard-Block vor Publish-Check, Error-Message nennt Flag wörtlich
- Spec `specs/cross-site-transfer/N-8_pattern-a-vs-b-guard.md` (125 Z., 11 AKs, 100 %)
- 4 Szenarien: Create / Pattern-A-Update / Pattern-B-Update ohne Flag (Exit 2, Haupt-Use-Case) / Pattern-B-Update mit Override (auditierbarer PUT)
- Pattern `adapter-pattern-classification-guard.md` + Tutorial 04 `cross-site-adapter-guards.md`
- Bundle 6.88 KB

---

## Session 26 — 2026-04-23 (N-6 `cw-transfer diff shopify:page`, autonom)

Vollversion: Commit `02c57cb` + Evidence `2026-04-23_n-6_self-check.md`
- Adapter NEU `adapters/shopify/diff-page.mjs` (240 Z.): Build-then-Fetch-then-Diff, spawnt `build-page.mjs`, GET-only, field-by-field Compare mit Normalisierung (`null` ↔ `""`), konditionale Felder. Exit 0/1/2
- CLI `tools/cw-transfer`: `DIFF_TOOLS` Dispatch + `cmdDiff` aktiviert
- Spec `specs/cross-site-transfer/N-6_cw-transfer-diff.md` (12 AKs, 100 %)
- Live-Test `juvantis.myshopify.com/pages/uber-uns`: title EQUAL, template_suffix DIFFER, body_html DIFFER (8505↔0) → war Auslöser für S27/N-8
- Pattern `build-then-fetch-then-diff.md` + Tutorial 03 `cross-site-adapter-diffs.md`

---

## Session 25 — 2026-04-23 (S24-Close + S2.4b Footer + S2.4d Design-Polish, autonom)

- **Block 1 S24-Close:** Cortex-Web `d3aea84`/`b1101ad` + Theme `f5a9bec` (PXZ 2.7.19, S2.4c Praxis-Cross-Links)
- **Block 2 S2.4b Footer-Umbau:** Theme `f85611a` (PXZ 2.7.20). Eigener `footer.php` Child-Override, `template-parts/site-footer.php` (142 Z.), `inc/footer-data.php` (4-sprachig), `assets/css/footer.css` (241 Z.). Selbstprüfung 12/12. Cortex-Web `247af3f`
- **Block 3 S2.4d Design-Polish:** Theme `42001ec` (PXZ 2.7.21). Card-Hover-Normalisierung (4 Files → 180ms cubic-bezier(0.2,0,0,1) + translateY(-3px) + shadow-card-hi). iOS-Drawer-Easing in `nav.css`. Card-Title clamp(). Selbstprüfung 9/9. Cortex-Web `c94d840`
- 3 Patterns + Tutorial 24 in Nexus committed `1011494`

---

## Session 24 — 2026-04-22 (N-5 + N-7 + E, autonom)

### Ziel
Drei Fronten in einer Session: **N-5** (Shopify-Page-Publish-Helper), **N-7** (CW-008-Backup am Page-Adapter), **E** (Cross-Links `/praxis/` → `/leistungen/` + `/diagnostik/`).

### Kernergebnisse
- **N-5 + N-7 (`pages-to-shopify.mjs`):** `PUBLISH=1` Env-Flag → `effectivePage.published = true`. Vor jedem Update: GET → JSON-Dump in `.backups/<ts>_page<id>_<handle>.json`. Backup-Fail = Exit 2. Summary +2 Felder. Selbstprüfung 10/10 AK
- **E (S2.4c) — Praxis-Cross-Links:** Template-Part `template-parts/praxis-crosslinks.php` mit 2 Cards · Guard `is_page('praxis')` in `template-standard.php` · CSS-Block (+94 Z.) in `standard.css` · `PXZ_VERSION 2.7.18 → 2.7.19` · Selbstprüfung 12/12 AK

### Pattern + Tutorial
- Pattern `adapter-runtime-flag-vs-content-state.md`
- Tutorial `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/23-template-parts-mit-is-page-guard.md`

### Sanitizer Schritt 3b
- Probe alle im Budget · Learn 0 Duplikate, 81 stale-refs

---

## Session 23 — 2026-04-22 (Cortex-Sanitizer V4 + V5)

**V4 Retroaktiv-Kur** (Spec `specs/cortex-sanitizer/SPEC.md`):
- 12 Legacy-Session-Blöcke (7, 9-16, 19, 20, 22) → `_archive/sessions/2026-04/`
- SESSION_RESUME 123 KB → 15 KB (88 %), MEMORY 53 KB → 14 KB (73 %), Nexus/CLAUDE 41 KB → 26 KB (38 %)
- Nexus/CLAUDE Sprint-Logs → `Nexus/_archive/claude-md/2026-04.md`
- LL-044 in `GLOBAL_RULES.md §21` + Sanitizer-Probe in `SESSION_LIFECYCLE.md §2 Schritt 3b`
- Commits: Cortex-Web `03887b8` · Nexus `1440df9` + `652fc9b` + `076a018`

**V5 Selbstlernend + Auto-Apply** (Spec `specs/cortex-sanitizer/SPEC-V5.md`):
- 3 Probes: `growth-log.sh` · `redundancy-scan.sh` · `stale-ref-scan.sh`
- `actions/rotate-session-resume.sh` — Auto-Apply für §3-legacy-Rotation
- `rotate.sh` erweitert: `--learn` + echter `--apply`
- `SESSION_LIFECYCLE §2 Schritt 3b` erweitert: bei Hard-Warn auto `--apply` + immer `--learn`
- Initial-Run: 0 Duplikate, 80 stale-refs
- Pattern `self-regulating-token-budget.md`
- Tutorial `02-selbstregulierende-memory-systeme.md`
- Commits: Cortex-Web `ecde8de` · Nexus `52e77be` + `132f3b0`

**Ziel-Metrik erreicht:** Pflicht-Init Summe ~20 k Tokens (vorher ~120 k) — weit unter 50 k Ziel.

---

## Session 22 — 2026-04-22 (content-bridge-v1 + cross-site-transfer)

- Commits: `987e3e4` (Block 1) + `98e063b` (Block 2)
- Live: `sanexio.eu/pages/uber-uns` (Shopify Page ID 157742137611) aus Trunk gerendert via Template-Bridge (Pattern B, Goldstandard)
- Architektur: 6 Patterns A–F · 4 Registries · `tools/cw-transfer` Meta-Orchestrator · CW-006/007/008 kodifiziert
- Inhalte: 8 Team-YAMLs + `ueber-uns.yaml` + erweiterte Schemas
- Doku: `specs/content-bridge-v1/SELF_CHECK.md` + `specs/cross-site-transfer/ARCHITECTURE.md` + `PATTERNS.md`
- Vollog: separat als `_archive/sessions/2026-04/session-22-content-bridge-v1.md`

---

## Session 21 — 2026-04-22 (Praxis-Sprint 2 / S2.3-diagnostik)

### Ziel
Cluster `diagnostik` live bringen. Eigener Top-Nav-Bereich `Diagnostik ▼`. Hub `/diagnostik/` + Sub-Hub `/sonographie/` mit 3 Nested-Kindern + 3 flache Detail-Pages. Labor-Konsolidierung. 301-Redirects. atlas DSGVO-gated.

### Kernergebnisse
- 8 neue URLs (7 publish + 1 draft atlas), 4 alte Slugs → 301, 3 URLs → 404 wie erwartet
- `inc/diagnostik-data.php` als SSoT (4 Helper)
- `template-diagnostik-hub.php` (Dual-Mode: Top-Hub + Sub-Hub)
- `inc/seo-data.php` +8 Funktionen (MedicalProcedure, DiagnosticProcedure, MedicalTest, MedicalWebPage, ImageGallery)
- `inc/nav-data.php` neues Top-Item `Diagnostik ▼` + `match_prefix`-Feld
- `pxz_old_slug_fallback_redirect()` weil WP-Core-Redirect für Pages unzuverlässig

### Verifiziert
- Migration idempotent (Lauf 2 = 0 Mutationen)
- HTML-Assertions: 4 Card-Grids, 5 H2 Labor, Mojibake 0×, Active-State korrekt
- verify.sh §1+§3 grün
- 12/12 AK = 100 %

### Commits
- Theme: `25662ad` (PXZ 2.7.18)
- Cortex-Web: `fb9c0eb` + `133d7f1`
- Nexus: `71d6358`

### Pattern-Kandidaten → Nexus
`wp-old-slug-redirect-reliability` · `wp-nested-pages-rewrite-flush` · `nav-match-prefix-active-state` · `dsgvo-draft-gate-pattern` · `php-getenv-normalization`

### Tutorial
`Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/22-wp-nested-pages-und-old-slug-redirects.md`

---

## §5-legacy Sofort-Status-Frage Session 34 (archiviert)

> **Session 33 abgeschlossen:** S32-Commit-Hygiene + B-2 Legacy-Triage (25 Pages) + Goldstück Docteur-Saul-Bio.
>
> **Default für Session 34 — B-2a:** 6 Service-Pages aus Legacy → Trunk unter `/service/<slug>/`:
> 1. `/service/terminanfrage/` (mit `[wpforms id="4010"]`)
> 2. `/service/rezeptbestellung/`
> 3. `/service/ueberweisung/` (mit `[wpforms id="4016"]`)
> 4. `/service/arbeitsunfaehigkeit/` (3062 chars Patient-Info)
> 5. `/service/einweisungen-ueberweisungen/` (3904 chars)
> 6. `/service/neupatienten/` (2029 chars, bilingual DE/EN)
>
> Plus `template-service.php` als gemeinsames Template (HWG-neutrale Patient-Info-Darstellung, optionales WPForms-Embed).
>
> **Warum B-2a Default:** Triage freigegeben, Content existiert bereits (nur Umzug + Template-Integration, kein Schreibaufwand). Direkter Launch-Fortschritt zu M1.
>
> **Alternativen:** B-2c Zweigpraxis · B-2b Merge-Ops · B-1-template · B-3 Aktuelles · B-4 Impressum/DSE · C-1 DF-Support · B-1 weitere Ärzte · Ad-hoc.

*Wurde in Session 34–36 als 24h-MVP-Sprint umgesetzt (siehe `SESSION_RESUME.md §3`).*
