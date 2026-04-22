# SESSION_RESUME — Cortex-Web

> **Standard-Einstieg** (LL-043, `Nexus/_rules/SESSION_LIFECYCLE.md`):
> In einer neuen Session **„Projekt fortsetzen Cortex-Web"** tippen. Claude lädt:
>
> 1. Pflicht-Init Nexus (CLAUDE.md, MEMORY.md, GLOBAL_RULES.md, SESSION_LIFECYCLE.md)
> 2. Diese Datei (SESSION_RESUME.md)
> 3. Alle in §0 unten als Pflicht-Lesung markierten Folgedateien
> 4. Pre-Flight (`tools/validate.sh`, optional `CHECK_SHOPIFY=1`, optional `tools/review.sh`)
> 5. Status-Statement im Architekten-Stil → wartet auf Wahl der Front

---

## §0 EINSTIEG „Projekt fortsetzen Cortex-Web" — Pflicht-Lesung

### Basis (immer)
1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`
4. `~/Cortex/Nexus/_rules/SESSION_LIFECYCLE.md`
5. `~/Cortex/projects/Cortex-Web/CLAUDE.md`
6. Diese Datei (`SESSION_RESUME.md`)
7. `~/Cortex/projects/Cortex-Web/_rules/ARCHITECTURE.md`
8. `~/Cortex/projects/Cortex-Web/_config/RULES.md`
9. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/_rules/WORKING_MODE.md` (Architekten-Modus)

### Wenn Praxis-Sprint-Arbeit ansteht (S2.1+)
10. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/SESSION_RESUME.md` — Praxis-Sprint-Stand (lädt selbst weitere Pflicht-Dateien)
11. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/_rules/ARCHITECTURE.md` — Sprint 2 Plan
12. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/_rules/FEHLERPROTOKOLL.md` — PXZ-E-001…008
13. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/DESIGN_GUIDELINES.md` — v2.3, §13–§16

### Wenn Juvantis-Web-Arbeit ansteht
14. `~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/SESSION_RESUME.md` — Juvantis-Site-Stand
15. `~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/SHOPIFY_THEME_POINTER.md` — Theme-Topologie
16. `~/Cortex/projects/Juvantis/_config/RULES.md` — Shopify-Deploy-Regeln R-001…R-024

---

## §1 Stand & Version

- **Version:** `0.7.0` — Cortex-Web-Aufbau (Phase 0–5) ✅ · **content-bridge-v1 + cross-site-transfer-Architektur produktiv (2026-04-22 Session 22)** — sanexio.eu/pages/uber-uns aus Trunk gerendert, Template-Bridge-Goldstandard, 3 Extraktions-Skelette, cw-transfer Meta-Orchestrator, CW-006/007/008 kodifiziert
- **Stand:** 2026-04-22, **Session 22 abgeschlossen** (Cortex-Web / content-bridge-v1 + cross-site-transfer — Shopify-Page+Template-Adapter produktiv, Trunk-Content für Team + Ueber-Uns + Ärzte migriert, Architektur für bidirektionalen expliziten Transfer vorbereitet, **24/24 AKs über beide Self-Checks = 100 %**, 3 Pattern-Kandidaten in Nexus, 1 Tutorial, Page sanexio.eu/pages/uber-uns veröffentlicht)
- **Vorvorige Session:** 2026-04-22 Session 21 (Praxis-Sprint 2 / S2.3-diagnostik ✅ — Cluster Diagnostik: Hub + 4 Hauptkategorien + 3 Nested-Sono-Kinder, atlas als draft R-7 DSGVO gated)
- **Working Tree:** Cortex-Web commits folgen (Spec + Migration + Evidence + Self-Check + THEME_POINTER 2.7.18); Theme HEAD `25662ad` (PXZ_VERSION **2.7.18**)
- **Vorheriger Stand (Session 20):** S2.3-aerzte-services ✅ — 8 Arzt-Detail-Pages (Stracke voll + 7 Stub) + Services-Hub `/leistungen/` + Impf-Konsolidierung. Theme `c090173` / PXZ 2.7.17. Cortex-Web `c88de56`.
- **Dr.-Stracke-Constraint Session 20 (umgesetzt):** *„Bei den Ärzten müssen immer auch alle anderen Kollegen aus der Praxisgemeinschaft mitauftauchen. Platzhalter für Fotos und Content sind OK, aber alle Ärzte müssen wählbar sein."* → Doppelt umgesetzt: (a) `/team/`-Grid alle 8 klickbar, (b) auf jeder Detail-Page „Weitere Ärzte"-Sektion mit den 7 Kollegen.
- **Dr.-Stracke-Kommentar offen (Session 19):** *„Das Design müssen wir anpassen, machen wir aber beim Feintuning"* → Design-Feintuning weiterhin offener Arbeitspunkt (S2.4 + S2.3-aerzte-services), siehe §4.
- **Direktive „Menü wächst mit Content" (Session 18):** in Session 20 eingelöst durch Label-Swap „Team" → „Ärzte". Cluster `aerzte` ist jetzt erreichbar; weitere Cluster-Migrationen folgen.
- **🔴 DR.-STRACKE-SCOPE-KORREKTUR (Ende Session 14):** Der **komplette Content-Umzug aller Prod-Seiten** ist Hauptziel von Sprint 2, nicht nur die 27 Kern-Seiten. Reihenfolge: **Content → Menü → Bilder → Design-Feinschliff**. Option A (Session 14) hat die Fundament-Schicht gelegt (178/178 Pages im branded Header + Content-Scope), nächste Sessions kuratieren Content pro Seite.
- **Cortex-Web-Aufbau (Phase 0–5):** ✅ **vollständig**
- **Trunk-Content:** unverändert, 1 Produkt (`basic-check.yaml`)
- **WP-Adapter:** Phase 1, idempotent, HWG-konform, Review-geprüft
- **Shopify-Adapter:** Phase 2, idempotent, draft-only, Review-geprüft
- **Review-Pipeline:** Phase 3, 11/11 automatische AKs grün
- **Praxis-Site:** `sites/praxis-webseite/`, Theme-Pointer auf Commit **`058b062`** (**PXZ_VERSION 2.7.14**, S2.3-kern Cluster kern Content-Migration: Kontakt + Sprechstunden neu, Home-Refactor mit Practice-Data-SSoT byte-pixelgleich). Design-Autorität: `DESIGN_GUIDELINES.md` v3.1 (§18 Content-Page-Typografie + Header-Branding + Logo-Marken-Zuordnung neu). Praxis-Sprint 2: S2.0 ✅ + S2.0c ✅ + S2.1 ✅ + S2.2 ✅ + S2.0b ✅ + S2.0e ✅ + S2.0f ✅ + **S2.3-B ✅** (3 P0-Pages `/praxis/` + `/team/` + 404 live auf Local-WP mit Echt-Content, SEO-Optimierung, Unified Site-Header, URL-basierter Brand-Switch `/team/` → Praxisgemeinschaft Sanexio-Logo, alle anderen Seiten → Praxiszentrum-Roundel. smoke-seo 21/21 grün, Home MD5-Null-Delta 3/3, 4 neue Patterns, Tutorial 15). **S2.3 Content-Batches freigeschaltet:** C/G/0d verfügbar, A blockiert durch Rechtssicherheitsquelle.
- **Juvantis-Site:** `sites/juvantis-webseite/` (Docs-Schicht), Theme-Pointer auf Commit `1fbc35b` (GitHub-Remote `shopify-theme`)

### §1.1 Phasen-Status

| Phase | Ziel | Status |
|:---:|------|:---:|
| 0 | Skelett + Regeln + Nexus | ✅ |
| 1 | POC WP-Adapter | ✅ |
| 2 (Setup) | Shopify Custom App + Token | ✅ |
| 2 (Adapter) | POC Shopify-Adapter | ✅ |
| 3 | Review-Pipeline + Go/No-Go | ✅ |
| 4 | Subsumierung praxis-redesign → sites/praxis-webseite/ | ✅ |
| 5 | Subsumierung Juvantis-Web-Docs → sites/juvantis-webseite/ | ✅ |
| **Praxis-S2.3-B** | **3 P0-Pages mit Echt-Content + SEO-Layer + Unified Header + Brand-Switch** | **✅ 2026-04-19 Session 14** |
| **Praxis-S2.3-D-P1** | **Mojibake-Fix + Trunk-ready Page-Inventar (Vorbereitungs-Pass)** | **✅ 2026-04-20 Session 15** |
| **Praxis-S2.3-D-P2** | **Content-Archive 189 Pages mit 3-way MD5-Kette (Sicherungs-Pass)** | **✅ 2026-04-20 Session 16** |
| **Praxis-S2.3-kern** | **Cluster `kern`: Karriere + Kontakt + Sprechstunden + Home-Refactor SSoT** | **✅ 2026-04-21 Session 17** |
| **Praxis-S2.3-checkups** | **Cluster `checkups`: 6 Pages + Bridge Praxis↔Juvantis erstmals produktiv (Adapter-Roundtrip CW-001)** | **✅ 2026-04-22 Session 18** |
| **Praxis-S2.4** | **Menü-Restrukturierung: kuratierte Top-Nav + Check-Ups-Submenu + Mobile-Drawer + `/fachrichtungen/`-Stub** | **✅ 2026-04-22 Session 19** |
| **Praxis-S2.3-aerzte-services** | **Block B1: 8 Arzt-Detail-Pages (alle wählbar, mit Other-Doctors-Cross-Nav) + Services-Hub `/leistungen/` + Impf-Konsolidierung** | **✅ 2026-04-22 Session 20** |
| **Praxis-S2.3-diagnostik** | **Cluster Diagnostik: Hub `/diagnostik/` + Sub-Hub `/sonographie/` mit 3 Nested-Kindern + 3 flache Details (Belastungs-EKG, Lungenfunktion, Labor); atlas auf draft gated (R-7 DSGVO); eigenes Top-Nav-Item + 4 Submenu-Kinder** | **✅ 2026-04-22 Session 21** |
| **Cortex-Web content-bridge-v1** | **Trunk-basierte Content-Übertragung Pattern A + Pattern B (Template-Bridge Goldstandard). 8 Ärzte + Intro + Hero + Mission + History + Values + CTA aus Trunk nach sanexio.eu/pages/uber-uns live. Shopify-Page-Adapter + Shopify-Template-Adapter produktiv.** | **✅ 2026-04-22 Session 22** |
| **Cortex-Web cross-site-transfer-Architektur** | **ARCHITECTURE.md + PATTERNS.md (6 Patterns A–F) + 4 Registries + cw-transfer Meta-Orchestrator + 3 Extraktions-Skelette + CW-006/007/008 Projekt-Rules. Bidirektionale explizite Transfers vorbereitet, Trunk alleinige Brücke.** | **✅ 2026-04-22 Session 22** |

**Cortex-Web-Aufbau abgeschlossen. Common-Trunk-Bridge funktional bewiesen. Menü-Infrastruktur steht. 6 von 7 Haupt-Clustern migriert (kern, checkups, aerzte, services, diagnostik ✅).** Verbleibender DE-Content: legacy/de (23 P2, größtenteils archivierbar). Parallele Fronten: S2.4b Footer-Umbau, Design-Feintuning (Dr.-Stracke-Wunsch S19+S20), Echt-Content Arzt-Stubs, R-7 DSGVO sono-atlas-Klärung.

---

## §2 Pre-Flight-Befehle

### Standard
```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
```
Erwartet: `validate: OK (1 file(s))`, Exit 0.

### Mit Shopify-Connectivity-Check
```bash
cd ~/Cortex/projects/Cortex-Web && CHECK_SHOPIFY=1 bash tools/validate.sh
```
Erwartet zusätzlich: `validate: shopify OK (juvantis.myshopify.com, HTTP 200)`.

### Praxis-Site Pre-Flight (für Sprint-2-Arbeit)
```bash
cd ~/Cortex/projects/Cortex-Web/sites/praxis-webseite && bash tools/verify.sh
```
Erwartet: §1 Split + §2 Reset + §3 Computed-Style 54/54 + §4 Alignment 10/10 grün, Exit 0.

### Juvantis-Site Pre-Flight (für Theme-/Content-Arbeit)
```bash
# Live-Site erreichbar?
curl -s -o /dev/null -w "%{http_code}\n" https://sanexio.eu/
# Theme-Klon-Stand:
git -C ~/Cortex/projects/Juvantis/juvantis-web/theme rev-parse HEAD
git -C ~/Cortex/projects/Juvantis/juvantis-web/theme status --short
```

### Vollreview (langsam, ~30–60s, Regressions-Schutz)
```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/review.sh
```
Erwartet: `AK automatisch: 11/11 grün`, Exit 0.

**Stand Ende Session 21:** validate ✅, verify.sh (§1 + §3 Teil-Läufe grün — Full-Run hatte unrelated Puppeteer-Chrome-Hang), smoke-http.sh ✅ (5/5 HTTP 200), 7 neue Diagnostik-URLs HTTP 200 (diagnostik, sonographie + 2 nested, belastungs-ekg, lungenfunktion, labor), 4 alte Slugs → HTTP 301 (ultraschalldiagnostik, schilddruesen-sonographie, ultraschall-der-beingefaesse, labordiagnostik), 3 URLs HTTP 404 (sono-atlas-2, rund-ums-labor, sono-atlas). Beide Repos clean. Theme HEAD `25662ad` (PXZ 2.7.18). Migration Lauf 2 idempotent (0 Mutationen, 10 skipped). Cortex-Web-Commits folgen (Spec + Migration + Evidence + Self-Check + Pointer 2.7.18).

---

## §3 Letzte Session — Session 21, 2026-04-22 (Praxis-Sprint 2 / S2.3-diagnostik)

### Ziel

Cluster `diagnostik` inhaltlich kuratiert live bringen. Eigener Top-Nav-Bereich `Diagnostik ▼` zwischen Check-Ups und Sprechstunden. Hub `/diagnostik/` + Sub-Hub `/sonographie/` mit 3 Nested-Kindern (Schilddrüse, Beingefäße, Atlas) + 3 flache Detail-Pages (Belastungs-EKG, Lungenfunktion, Labor). Labor-Konsolidierung (296 + 475). 301-Redirects für alle alten Slugs. atlas DSGVO-gated auf `draft`.

### Durchgeführt (Architekten-Modus 4 Phasen, Dr.-Stracke-Delegation „entscheid so wie es am besten ist")

1. **Phase 1 Verständnis** — Content-Archive sichtet (10 Pages, 1 Cluster-Missmatch `contact-us-192`, 1 Shell-Dublette `sono-atlas-4297`). 6 Architektur-Fragen (F1–F6) formuliert + delegiert.
2. **Phase 2 Lösungsdesign** — Spec `S2.3-diagnostik.md` FREIGEGEBEN mit Dr. Stracke-Wahl F1a/F2a/F3b/F4c+A-2/F5a+C-3/F6a/D-2, R-7 = c (atlas draft, Architekten-Entscheidung).
3. **Phase 3 Umsetzung (T1–T16, 2 In-Session-Bug-Fixes):**
   - **T1** Baseline (MD5 5 Pages + mysqldump-pre 1,5 MB Rollback)
   - **T2** `inc/diagnostik-data.php` NEU — SSoT: `pxz_diagnostik_categories()` · `pxz_diagnostik_sono_children()` (mit Draft-Filter via `get_page_by_path`) · `pxz_is_diagnostik_uri()` · `pxz_diagnostik_all_slugs()`
   - **T3** `template-diagnostik-hub.php` NEU (Dual-Mode: Top-Hub + Sub-Hub) + `assets/css/diagnostik-hub.css` NEU (tokens-only, 4-Card-Grid Responsive)
   - **T4** `inc/seo-data.php` erweitert — 8 neue Funktionen (MedicalWebPage für Hub, MedicalProcedure/DiagnosticProcedure für 6 Details, MedicalTest für Labor, ImageGallery für atlas)
   - **T5** `inc/nav-data.php` erweitert — neues Top-Item `Diagnostik ▼` an Position 5 (DE/EN/FR/ES) + neues optionales `match_prefix`-Feld + Helper `pxz_nav_matches_prefix()` für Nested-URI-Active-State
   - **T6** `functions.php` — PXZ_VERSION 2.7.17→2.7.18 · require_once diagnostik-data.php · Template-Register · Enqueue `pxz-diagnostik-hub` · **NEU `pxz_old_slug_fallback_redirect()`** auf priority 5 (WP-Core-Redirect für Pages buggy) + CHANGELOG
   - **T7** Migration-Script 2026-04-22_s2.3-diagnostik_pages.php (11 Schritte, idempotent, R-7-Gate via INCLUDE_SONO_ATLAS env)
   - **T8+T9** Apply + Idempotenz: Lauf 1 `created=1 updated=7 deleted=1 drafted=1 wpml_inserts=1` · Lauf 2 `skipped=10` ✓
   - **T10** URL-Matrix: 7/7 neue 200, 4/4 alte 301, 3/3 404 wie erwartet
   - **T11** HTML-Assertions: Hub 4 Cards, Sub-Hub 2 Cards (atlas-Filter), Labor 5 H2, Mojibake 0×, Active-State auf allen Diagnostik-URIs ✓
   - **T12** verify.sh §1 + §3 grün (Full-Run hatte unrelated Puppeteer-Chrome-Hang — nicht blockierend) · smoke-http 5/5 · validate OK
   - **T13** HTML-Snapshots (7 Pages + url-matrix.md) als Evidence
   - **T14** Self-Check 12/12 AK
   - **T15** Theme-Commit `25662ad`
   - **T16** Cortex-Web-Commit `fb9c0eb` + Nexus `71d6358` (MEMORY-Update)

4. **Phase 4 Selbstprüfung** — 12/12 AK = 100 %, FK-Check 0/5

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| 8 neue URLs (7 publish, 1 draft) | 7/7 HTTP 200 + atlas draft 404 ✓ |
| 4 alte Slugs → 301 | 4/4 ✓ (via Theme-Fallback-Helper, WP-Core liefert hier 404) |
| 3 deleted/drafted URLs | 3/3 HTTP 404 ✓ |
| Nested-URLs (schilddruese, beingefaesse) funktional | 2/2 ✓ |
| Hub 4-Card-Grid | ✓ |
| Sub-Hub 3-Card-Grid, atlas-Card durch Draft-Filter ausgeblendet → 2 Cards | ✓ |
| Labor H2-Sektionen | 5 ✓ (Werte, Blutentnahme, 24h-Urin, Befundabruf, Selbstzahler) |
| Mojibake im Body | 0 auf 6 Pages geprüft ✓ |
| Active-State `is-active-parent` auf Diagnostik-URIs | ✓ via match_prefix |
| Migration idempotent | Lauf 2 = 0 Mutationen ✓ |
| smoke-http.sh | 5/5 ✓ |
| validate.sh | OK ✓ |
| FK-Check (0 eingetreten) | 0/5 ✓ |

### Lessons Learned (5 Pattern-Kandidaten, im Schritt 3 des Session-End-Protokolls als Nexus-Patterns niedergelegt)

- **LL-1** `wp-old-slug-redirect-reliability.md` — WP-Core-Redirect für post_type=page unzuverlässig; Theme-seitiger Fallback-Helper mit `post_status=publish`-Filter rettet 4 von 5 Slugs.
- **LL-2** `wp-nested-pages-rewrite-flush.md` — Nach `post_parent`-Änderung `wp_options.rewrite_rules` leeren (SQL DELETE oder flush_rewrite_rules), sonst 404 bei Nested.
- **LL-3** `nav-match-prefix-active-state.md` — Optionales `match_prefix`-Feld im Nav-Array für Active-State bei Nested-URIs, die nicht explizit im Submenu sind.
- **LL-4** `dsgvo-draft-gate-pattern.md` — Draft-Status als saubere Interim-Lösung für rechtlich unsicheren Content; kombiniert mit Card-Grid-Filter entstehen keine toten Links.
- **LL-5** `php-getenv-normalization.md` — PHP `getenv()` gibt false bei unset, nicht ''; direkt nach Aufruf normalisieren, sonst kippen sicherheitskritische Gates ungewollt.

### Drei Wissens-Artefakte für Folge-Sessions

- 5 Patterns in `Nexus/_memory/patterns/` (s.o.)
- Tutorial `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/22-wp-nested-pages-und-old-slug-redirects.md`
- Spec + Self-Check + 7 HTML-Snapshots + url-matrix in `sites/praxis-webseite/specs/sprint-2/evidence/2026-04-22_s2.3-diagnostik/`

---

## §3-legacy-session22-parallel — Parallel-Arbeit Cortex-Web content-bridge-v1 (NICHT committet)

> Offener Punkt (**Konsistenz-Anomalie**): Bei diesem „Session beenden" waren im Cortex-Web-Root 30+ untracked files aus einer parallelen Cortex-Web-Architekturarbeit (Shopify-/WP-Adapter für `uber-uns`, 8 Team-YAML-Dateien, cross-site-transfer-Architektur, cw-transfer-CLI, 2 Spec-Ordner). Diese Arbeit ist inhaltlich abgeschlossen (laut ursprünglichem §3-Block darunter), aber weder die Dateien noch die Spec/SELF_CHECK-Dokumente sind committet. Session 21 (S2.3-diagnostik) hat diese Dateien bewusst nicht angefasst — Dr. Stracke sollte die parallele Arbeit in eigener Session abschließen und committen.

### Was dort (vermutlich) entstanden ist (aus ursprünglichem §3, ungeprüft)

### Ziel
Dr. Stracke will, dass `sanexio.eu/pages/uber-uns` inhaltlich mit WP `/team/` abgleichbar ist (Content) und perspektivisch Content/Design/Funktion explizit + gerichtet zwischen beiden Sites transferiert werden kann. Keine Auto-Sync, Trunk als alleinige Brücke.

### Durchgeführt (Architekten-Modus, zwei zusammenhängende Blöcke)

**Block 1 — content-bridge-v1 produktiv**

1. **Pattern A (Inline-HTML)** erstmals umgesetzt: `adapters/shopify/build-page.mjs` + `pages-to-shopify.mjs` + `lib/renderers/page-juvantis.mjs`. Sauber gebaut, aber im Shopify-Theme-Kontext visuell unbefriedigend (RTE-Container überschreibt Styling).
2. **Pattern B (Template-Bridge)** — Goldstandard: `adapters/shopify/build-template.mjs` + `template-to-shopify.mjs` + `lib/renderers/template-juvantis-ueber-uns.mjs`. Schreibt `templates/page.uber-uns.json` ins Live-Theme; Custom-Section `juvantis-ueber-uns` rendert aus Trunk-Daten. Backup-Automatik vor destruktivem Write (CW-008 Ur-Implementierung).
3. **OAuth-Scope-Erweiterung in zwei Runden:** `+read_content,+write_content` → Pattern-A-Push. Dann `+read_themes,+write_themes` → Pattern-B-Push. Authorize-Catcher-Workflow 30 s pro Re-Auth.
4. **Trunk-Content:** `trunk/content/pages/_shared/ueber-uns.yaml` (sections[] + views.juvantis.{hero,mission,history,values,cta,team,padding}) + 8 `trunk/content/team/*.yaml`. Schemas `page.schema.json` + `team-member.schema.json` konkretisiert (required-Felder, oneOf für Section-Types, order-Feld für Display-Reihenfolge).
5. **Live-Deployment:** Shopify Page ID 157742137611 (`handle=uber-uns`) hat `template_suffix=uber-uns` + `body_html=""`. Theme-Asset `templates/page.uber-uns.json` im Live-Theme (ID 181128757515). Dr. Stracke hat die Seite am 20:46:26 freigegeben.

**Block 2 — cross-site-transfer Architektur**

6. **ARCHITECTURE.md** + **PATTERNS.md** geschrieben. Transfer-Matrix (Source × Target × Type), 6 wiederverwendbare Patterns (A Simple Page · B Template-Based Page · C Metafield · D Theme-Asset-Overwrite · E Product-Sync · F Design-Token), Naming-Conventions, Registry-Pattern.
7. **3 Extraktions-Skelette** Site → Proto-Trunk-JSON: `adapters/shopify/extract-page.mjs`, `extract-template.mjs`, `adapters/wordpress/extract-page.mjs`. Smoke-getestet gegen Live-Page.
8. **4 Registry-Dateien** (Renderer + Extractor × Shopify + WP) als zentrale Dispatch-Tabelle.
9. **Meta-Orchestrator `tools/cw-transfer`** mit Verben push/pull/diff/list/help. `list` zeigt 10 registrierte Transfers mit Status-Badge (stable/skeleton/planned).
10. **Projekt-Rules erweitert:** CW-006 (gerichteter Transfer), CW-007 (Trunk-Brücke-Pflicht), CW-008 (Backup vor destruktivem Push). `.gitignore` um `adapters/*/.backups/` erweitert.
11. **Docs + Self-Check:** `specs/content-bridge-v1/SELF_CHECK.md` 12/12 AK grün · `specs/cross-site-transfer/SELF_CHECK.md` 12/12 AK grün · `docs/cross-site-transfer.md` State-of-Play aktualisiert.

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| `validate.sh` | OK ✓ |
| 3 Shopify-Builds (product/page/template) | 3/3 OK ✓ |
| `cw-transfer list` | 10 Einträge (3 stable push shopify, 2 skeleton pull shopify, 1 planned · 1 stable push wp, 1 planned · 1 skeleton pull wp, 1 planned) ✓ |
| Live-Verify Shopify-Page API | 1 Treffer id=157742137611, 8 Arzt-Namen im body_html, intro present ✓ |
| Live-Verify Shopify-Template-Asset API | 6860 Bytes, 8 team_member + 4 value blocks ✓ |
| Idempotenz (2× Push) | body_md5 identisch, `updated_at` unverändert (Shopify diff-aware) ✓ |
| Page `published_at` | 2026-04-22T20:46:26 (Dr.-Stracke-Freigabe nach Preview) ✓ |
| Self-Check content-bridge-v1 | **12/12 = 100 %** ✓ |
| Self-Check cross-site-transfer | **12/12 = 100 %** ✓ |

### Lessons Learned (5 neue Pattern-Kandidaten)

- **CB1-LL-1** Shopify-OAuth-Scopes iterativ erweitern: neuer Adapter-Typ → neuer Scope → Re-Auth via authorize-Script+Catcher (~30 s). Single-Source der Scopes ist `tools/shopify-authorize.sh`.
- **CB1-LL-2** Shopify-Pages: `published: true|false` statt `status: "draft"|"active"` (Pages ≠ Products). Page-Adapter hardcoded `published:false` als CW-001-Safeguard.
- **CB1-LL-3** Shopify ist bei Page/Asset-PUTs diff-aware: identischer Body → `updated_at` bleibt unverändert. Stärkere Idempotenz als in Spec gefordert.
- **CB1-LL-4** Template-Suffix vs. Handle: Shopify matcht `templates/page.<suffix>.json` über `template_suffix`-Feld, nicht über Handle. Ein altes Template mit anderem Suffix wird nie gerendert → `template_suffix` muss explizit gesetzt sein.
- **CB1-LL-5** Bridge-Architektur skaliert über Content hinaus. Skelette Pattern-C (Metafield) und Pattern-F (Design-Token) benötigen dieselbe Grundarchitektur (Build → Payload → API-Push → Verify → Backup).

### Drei Wissens-Artefakte für Folge-Sessions

- Pattern `Nexus/_memory/patterns/shopify-template-bridge.md` — Pattern-B-Kern
- Pattern `Nexus/_memory/patterns/cross-site-transfer-registry.md` — Meta-Architektur (Registry + cw-transfer)
- Pattern `Nexus/_memory/patterns/shopify-oauth-scope-iteration.md` — Re-Auth-Workflow
- Tutorial `Second Brain/30 Tutorials/Webentwicklung/Shopify & Liquid/07-shopify-template-bridge.md`
- Session-Log `Nexus/_memory/logs/2026-04-22_cortex-web-content-bridge-und-cross-site-architektur.md`

---

## §3-legacy-session20 (historisch) — Session 20, 2026-04-22 (Praxis-Sprint 2 / S2.3-aerzte-services Block B1)

### Ziel
Cluster `aerzte` (2 Pages aus Content-Archive) + Cluster `services` (4 Pages) gebündelt als „nächster großer sinnvoller Block" abarbeiten. **Harter Constraint von Dr. Stracke:** *„Bei den Ärzten müssen immer auch alle anderen Kollegen aus der Praxisgemeinschaft mitauftauchen. Platzhalter für Fotos und Content sind OK, aber alle Ärzte müssen wählbar sein."*

### Durchgeführt (Architekten-Modus 4 Phasen, Dr.-Stracke-Delegation „du kannst entscheiden")

1. **Phase 1 Verständnis-Sicherung** — Inventar-Befund: 6 Content-Archive-Pages haben 3 Architektur-Probleme (a) `arzt-team-368` redundant zu `/team/`-Grid aus S2.3-B (b) `261 Unsere Leistungen` Kreuz-Referenz mit `/praxis/` aus S2.3-B (c) `299 Impfungen` und `472 Rund ums Impfen` ~60 % redundant + `5709 Corona` Pandemie-2022 obsolet. **Dr.-Stracke-Constraint** umgewertet F1c → **F1b-mit-Stub** (alle 8 Arzt-Profile). 6 Architektur-Fragen (F1–F6) formuliert + delegiert.

2. **Phase 2 Lösungsdesign** — Spec `S2.3-aerzte-services.md` (FREIGEGEBEN, Cortex-Web Commit A `5cfd012`). 12 AK, 8 Risiken, 15 T-Tasks. Architekten-Wahl: F1b-mit-Stub / F2c (Label-Swap statt /aerzte/-Doppel) / F3b (Impf-Merge in /impfungen/) / F4a (Corona archivieren) / F5a (/leistungen/ neu) / F6a (kein neues Submenu).

3. **Phase 3 Umsetzung (T1–T15) mit In-Session-Bug-Fix:**
   - **T1 Baseline:** Home/Karriere/Team-MD5 festgehalten.
   - **T2 `inc/team-data.php`:** 5 neue Helper (`profile_url` derivativ, `pxz_doctor_slugs()`, `pxz_doctor_by_slug()`, `pxz_is_sanexio_uri()`, `pxz_render_other_doctors($exclude)`). Slugs `landeberg`/`arbitmann` → `dr-landeberg`/`dr-arbitmann` (R-1 Slug-Kollisions-Vermeidung).
   - **T3 `template-team.php`:** Cards bekommen `<a class="pxz-team-card-link">`-Wrapper + `.pxz-team-card-cta`-Indikator („Profil ansehen →").
   - **T4 `template-arzt.php` produktiv:** Hero (Avatar/Name/Sub/Sprachen) + Vita (`the_content()` ODER Stub-Block) + Other-Doctors-Sektion + CTA (Doctolib + /sprechstunden/ + /contact-us/).
   - **T5 `assets/css/arzt.css` produktiv:** ~360 Zeilen, Hero / Vita-Typo / Other-Doctors-Mini-Grid (`grid auto-fill minmax(260px, 1fr)`) / CTA / Responsive 1024+720 px Breakpoints. Tokens-only.
   - **T6 NEU `template-leistungen.php` + `assets/css/leistungen.css`:** Services-Hub mit 3 Sektionen × {3, 1, 3} Cards. Hartkodierte Card-Daten in Template (kein eigenes Daten-File für 7 Cards).
   - **T7 `inc/nav-data.php`:** Label-Swap „Team" → „Ärzte" (DE/EN/FR/ES, jeweils sprachspezifisch übersetzt: Doctors/Médecins/Médicos).
   - **T8 `inc/seo-data.php`:** 3 neue Funktionen (`pxz_seo_data_leistungen`, `pxz_seo_data_impfungen`, generische `pxz_seo_data_doctor($slug)` für 8 Personen via Slug-Loop). schema.org/Physician mit knowsLanguage + memberOf MedicalOrganization.
   - **T9 Brand-Switch via Helper:** `header-nav.php` `$is_sanexio = pxz_is_sanexio_uri($uri)` statt fest verdrahteter Regex. `pxz_site_name` + `pxz_override_blogname_for_team` analog. **In-Session-Bug entdeckt:** `pxz_is_sanexio_uri()` in `pre_option_blogname`-Filter aufgerufen, aber Helper aus `inc/team-data.php` noch nicht geladen — Lade-Reihenfolge gefixt: `require_once .../inc/team-data.php` früh in functions.php. PXZ_VERSION 2.7.16 → 2.7.17. `template-leistungen.php` registriert (`theme_page_templates` Display-Name + Enqueue `pxz-leistungen`).
   - **T10 Migration `2026-04-22_s2.3-aerzte-services_pages.php`:** 6 Updates + 7 Inserts + 7 WPML-DE-Einträge, alle idempotent (Hash-Vergleich vor INSERT/UPDATE, MAX(trid)+1 für WPML).
   - **T11 Migration Lauf 1:** `created=7 updated=18 skipped=6` ✓. Lauf 2: `created=0 updated=0 skipped=24` ✓ (Idempotenz).
   - **T12 URL-Matrix:** 8 Arzt-Slugs HTTP 200, /leistungen/ + /impfungen/ HTTP 200, 5 obsolete URLs HTTP 404. **In-Session-Lehre LL-4:** `grep -c` zählt Zeilen, nicht Vorkommen — `grep -oE … | wc -l` für AK-3 Other-Doctors-Cards-Zählung.
   - **T13 HTML-Assertions:** Brand-Switch 9× `logo-sanexio.svg` (1× /team/ + 8× Arzt). Other-Doctors 7× pro Page (current ausgeschlossen, sanity-checked Stracke und Saul). Stracke-Vita 0× `?`-Mojibake, alle deutschen Marker korrekt (Gießen, Gesundheitsökonom, Geschäftsführender, Lösungen, Universität, für, Gasthörer). Impfungen 0× Mojibake, alle 5 H2-Sektionen.
   - **T14 Self-Check:** `evidence/2026-04-22_s2.3-aerzte-services_self-check.md` (12/12 AK, 5 LL, FK-Check 0/5).
   - **T15 Theme-Commit `c090173`** (12 Files, +1107/-96). **Cortex-Web-Commit B `c88de56`** (5 Files: Migration + Evidence + Self-Check + Pointer 2.7.17 + Mysqldump-Pre).

4. **Phase 4 Selbstprüfung** — 12/12 AK = 100 %. FK-Check 0/5 eingetreten.

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| `verify.sh` §1 + §1b + §2 + §3 + §3b + §4 | VERIFY OK ✓ |
| `smoke-http.sh` (5 URLs) | 5/5 HTTP 200 ✓ |
| 8 Arzt-URLs (curl-Matrix) | 8/8 HTTP 200 ✓ |
| /leistungen/ + /impfungen/ + /team/ | 3/3 HTTP 200 ✓ |
| 5 obsolete URLs (rund-ums-impfen, corona-impfung, arzt-team, dr-siegbert-stracke-mba, internistische-…) | 5/5 HTTP 404 ✓ |
| `validate.sh` (Cortex-Web) | OK ✓ |
| Theme HEAD | `c090173` (PXZ 2.7.17) ✓ |
| Working Trees (beide) | clean ✓ |
| Brand-Switch Sanexio (9 Pages) | 9× `logo-sanexio.svg` ✓ |
| Other-Doctors-Cards pro Arzt-Page | 7/7 (current ausgeschlossen) ✓ |
| Stracke-Profil Mojibake | 0× `?` im Vita-Body ✓ |
| Migration Idempotenz (Lauf 2) | 0 Mutationen ✓ |
| Self-Check AK | **12/12 = 100 %** ✓ |

### Lessons Learned (5 neue Pattern-Kandidaten — S2.3-aerzte-services-LL-1…5)

- **LL-1** `entity-roster-ssot.md` — Eine zentrale `pxz_team_doctors()`-SSoT mit derivativen Helpers (`pxz_doctor_slugs`, `pxz_doctor_by_slug`, `pxz_is_sanexio_uri`, `pxz_render_other_doctors`) treibt 5 Konsumenten (Grid, Detail, Brand-Switch, SEO-Schema, Cross-Nav). Ein neuer Eintrag = alles passt.
- **LL-2** `cross-link-no-isolation-pattern.md` — UX-Pattern: jede Detail-Page einer geschlossenen Menge zeigt am Ende ALLE Geschwister als klickbare Mini-Cards. Verhindert Sackgassen + verbessert SEO + spiegelt das „Team"-Mental-Model.
- **LL-3** Stub-Pages mit echtem Hero + funktionierender Cross-Navigation + ehrlicher Kommunikation („Vorstellung folgt") sind keine Karteileichen. Besser als 404 oder fehlende Pages.
- **LL-4** `grep -c` zählt Zeilen, `grep -oE … | wc -l` zählt Vorkommen. WordPress rendert HTML oft als single-line — bei Counts gegen Markup IMMER `-oE`.
- **LL-5** WP-Filter-Hooks (z. B. `pre_option_blogname`) brauchen ihre Helper-Functions vor der Filter-Registrierung. `function_exists()`-Guard ist Sicherheitsnetz, kein Ersatz für korrektes `require_once` in functions.php.

### Drei Wissens-Artefakte für Folge-Sessions

- Pattern `Nexus/_memory/patterns/entity-roster-ssot.md` (plattform-agnostisch)
- Pattern `Nexus/_memory/patterns/cross-link-no-isolation-pattern.md` (UX-Pattern)
- Tutorial `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/21-detail-pages-mit-cross-navigation.md` (didaktisch, beide Patterns + 5 Lehrsätze + praktischer Workflow)

---

## §4 Offene Tasks (Priorität absteigend)

### Wählbare Fronten für Session 22

**🔴 Offener Session-Punkt (vor allem anderen):**

| Prio | Punkt | Aufwand |
|:---:|---|---|
| **P0** | **Parallele Cortex-Web-Arbeit committen** (content-bridge-v1 + cross-site-transfer) — 30+ untracked files im Repo, 2 Specs mit SELF_CHECK 12/12 geschrieben, aber nichts versionskontrolliert. Dr. Stracke sollte diese Session als „Cortex-Web-Session vorher" abschließen. Siehe §3-legacy-session22-parallel. | 15 Min Commit + 5 Min Review |
| **P1** | **R-7 DSGVO sono-atlas klären** — atlas-Page liegt als `draft` in DB, Freischaltung = 1 SQL-Zeile. Architektur-Tendenz: atlas ganz weglassen (Option d) oder später mit Stock-Bildern neu aufsetzen. | Entscheidung + ggf. Migration |

**Cortex-Web-Fronten (aus paralleler Session):**

| Prio | Front | Aufwand | Kommentar |
|:---:|---|---|---|
| **N-1** | **WP-Template-Adapter (Pattern B reverse)** | 1–2 Sessions | Dasselbe YAML (`ueber-uns.yaml`) soll WP `/team/` rendern. Aktuell Template-Logik im Theme. Wird derivative aus Trunk. **Kandidat für Folge-Session.** |
| **N-2** | **Extraktoren produktivieren** | 1–2 Sessions | Skelette → YAML-Generator. Dr. Stracke kann existierenden Shopify/WP-Content in Trunk heben ohne manuelle Kuration. |
| **N-3** | **Design-Token-Adapter (Phase D)** | 2 Sessions | Farbwerte/Typo/Spacing aus Trunk → beide Themes. **Blocker:** Master-Frage nicht entschieden (Praxis-Tokens / Sanexio / Neutral). |
| **N-4** | **Component-Specs (Phase F)** | 3+ Sessions | `team-grid` als wiederverwendbare Komponente auf beiden Sites. Voraussetzung: N-3 teilweise gelöst. |
| **N-5** | **Shopify-Publish-Helper** | 30 Min | `tools/shopify-publish-page.sh` + `--publish`-Flag in den Page-Adaptern. Damit Seiten nach Sync nicht mehr manuell veröffentlicht werden müssen. |
| **N-6** | **`cw-transfer diff`** | 1 Session | Build-dann-Fetch-dann-JSON-Diff. Pre-Deploy-Sanity. |
| **N-7** | **Backup-Automatik auf WP- + Page-Adapter** | 30 Min | CW-008 vollständig durchsetzen (Template-Adapter hat es, Page-Adapter noch nicht). |

**Praxis-Sprint-Fronten (offen nach S21 S2.3-diagnostik):**

| Prio | Front | Aufwand | Kommentar |
|:---:|---|---|---|
| **A** | **S2.4b Footer-Umbau** | mittel (1 Session) | Blocksy-Default ersetzen. Kann Notfall-Block + `/leistungen/` + `/diagnostik/` integrieren. |
| **B** | **Design-Feintuning S2.4 + S2.3-aerzte-services + S2.3-diagnostik** | mittel (1 Session, Spec-lastig) | Dr.-Stracke-Wunsch seit S19. Hover-Polish, Mobile-Drawer-Animation, Card-Spacing, Diagnostik-Hub-Typo. |
| **C** | **Cluster `legacy/de`** (23 P2, größtenteils archivierbar) | mittel–groß | Letzter Content-Block vor Sprint 3. Viele Pages wahrscheinlich archivierbar. |
| **D** | **Echt-Content + Fotos für 7 Stub-Arzt-Profile** | groß | Braucht Bio-Text-Input von Ärzten + Foto-Shooting. Extern-abhängig. |
| **E** | **Cross-Links `/leistungen/` + `/diagnostik/` aus `/praxis/` integrieren** | klein (½ Session) | Folge aus S20 + S21. |
| **F** | **Strukturhygiene + Patterns konsolidieren** | klein | Pattern-Index, Tutorial-Querverweise, MEMORY/CLAUDE-Konsistenz-Check. |
| **G** | **Beginn Sprint 3 i18n** — erste EN/FR/ES-Übersetzungen durch Claude | 6+ Sessions | Erst nach C (legacy-Pass) sinnvoll, weil sonst i18n auf nicht-finalem DE-Stand aufsetzt. |

### Blockiert (nicht wählbar)

| Front | Blocker |
|---|---|
| S2.3-A (Datenschutz/Impressum) | Fehlende Rechtsquelle (Anwalt / e-recht24 / Prod-Übernahme — Dr.-Stracke-Entscheidung Folge-Entscheidung Nr. 1) |

### P1-Punkte aus Vorgänger-Sessions (offen)

- **Design-Feintuning S2.4** (Dr.-Stracke-Wunsch Session 19) → in Front C aufgegangen
- **Santapress-Archive-Entscheidung** fällig ab 2026-05-19 (Festlegung Verfallsdatum aus S2.0f)
- **WPForms-Marker** (S2.3-kern Folge-Arbeit Dr. Stracke)
- **Google My Map mit POIs** (S2.3-kern Folge-Arbeit)
- **„Aktuelles aus der Praxis"-Inhalt** (S2.3-kern Setting, aktuell leer)

---

## §5 Sofort-Status-Frage an Dr. Stracke

> **Session 21 (Praxis-S2.3-diagnostik) abgeschlossen:** Cluster diagnostik live auf Local-WP, eigener Top-Nav-Bereich, 7 Pages publish + 1 draft (atlas, R-7 pending). 12/12 AK. Theme `25662ad` (PXZ 2.7.18), Cortex-Web `fb9c0eb`, Nexus `71d6358`.
>
> **Vor weiteren Fronten bitte klären:**
>
> - **P0** — Parallele Cortex-Web-Arbeit (content-bridge-v1 + cross-site-transfer, Session-22-Parallel) ist im Repo untracked. Committen + abschließen?
> - **P1** — R-7 sono-atlas: DSGVO-Klärung machen (→ publish) oder atlas ganz archivieren (→ d)?
>
> **Wenn P0 + P1 erledigt, welche Front für Session 22:**
>
> **Praxis-Sprint (nahe am nächsten DE-Meilenstein):**
> - **A** — S2.4b Footer-Umbau (Blocksy-Default ersetzen, Cross-Links integrieren)
> - **B** — Design-Feintuning (dein offener Wunsch seit S19)
> - **C** — Cluster `legacy/de` — letzter DE-Content-Block vor Sprint 3
> - **E** — `/leistungen/` + `/diagnostik/` Cross-Links aus `/praxis/`
> - **G** — **Beginn Sprint 3 i18n (Übersetzungen DE→EN/FR/ES)** — sobald DE-Content final genug ist
>
> **Cortex-Web (aus paralleler Session):**
> - **N-1** — WP-Template-Adapter (Pattern B reverse)
> - **N-2** — Extraktoren produktiv machen
> - **N-5/N-7** — Shopify-Publish-Helper / Backup-Automatik (je 30 Min)
>
> **Ad-hoc:** Konkreter Transfer gewünscht? „Heute möchte ich Inhalt X von A nach B übertragen."

---

## §6 Verbote / harte Regeln (in Session 22 NIE passieren darf)

- **HWG/Berufsordnung:** Keine Werbung, keine Heilversprechen, keine Preise auf Praxis-Site (CW-005)
- **Trunk ist Master (CW-001):** Bei Bridge-Pages keine Inhalte direkt im WP-Admin oder Shopify-Admin ändern — Adapter rückt sonst zurück
- **Gerichteter, expliziter Transfer (CW-006):** Kein Auto-Sync, kein Webhook-Live-Mirror
- **Trunk alleinige Brücke (CW-007):** Keine direkten Shopify→WP-/WP→Shopify-Extractoren. Immer Site→Trunk→Site in zwei getrennten Schritten mit menschlicher Kuration dazwischen
- **Backup vor destruktivem Push (CW-008):** Kein Overwrite ohne vorheriges Backup in `adapters/*/.backups/`
- **Mojibake-Disziplin:** Bei Content-Migration aus `_content-archive/` IMMER Mojibake-Check (S2.3-D-LL-1 + diese Session: Stracke-Profil ist Beleg, dass `?`-Replacement-Chars nicht durch automatischen mb_convert lösbar sind, sondern Per-Pattern handcurated werden müssen)
- **Brand-Switch-Konsistenz:** Bei neuen Doctor-Slugs die zentrale `pxz_doctor_slugs()` erweitern, NIE Helper-Funktion umgehen oder Regex hartcodieren
- **`grep -c` ist tückisch:** WP-HTML auf einer Zeile → IMMER `grep -oE … | wc -l` für Counts (S2.3-aerzte-services-LL-4)
- **WP-Filter-Hooks-Lade-Reihenfolge:** Helper, die in `add_filter` oder `add_action`-Callbacks aufgerufen werden, MÜSSEN vor der Filter-Registrierung in functions.php geladen sein (S2.3-aerzte-services-LL-5)
- **Keine eigenmächtigen Strukturänderungen** in Nexus oder Cortex-Web ohne Dr.-Stracke-Freigabe (LL-023, KON-001)

---

## §3-legacy-session19 (historisch) — Session 19, 2026-04-22 (Praxis-Sprint 2 / S2.4 Menü-Restrukturierung)

### Ziel
Kuratierte Top-Navigation + Mobile-Drawer statt hart codierter Home-Scroll-
Anchor-Liste. Dr.-Stracke-Direktive Session-18-Ende: *„Sobald Inhalts-
cluster fertig migriert sind, muss das Menü mitwachsen, bevor der nächste
Cluster begonnen wird."* Aktuelles `wp_list_pages`-Fallback chaotisch.

### Durchgeführt (Architekten-Modus 4 Phasen, Dr.-Stracke-Delegation „du kannst entscheiden")

1. **Phase 1 Verständnis** — Ist-Analyse: `pxz_nav_list` hart codiert in
   `inc/homepage-data.php:131` mit 5 Fragment-Anchors (`#service`, `#team`
   etc.), auf Non-Home-Pages tot. Kein Mobile-Menü (display:none < 1100 px,
   kein Burger). Blocksy-Footer rendert alphabetisches `wp_list_pages`-
   Fallback. 7 Architektur-Fragen F1–F7 formuliert.

2. **Phase 2 Lösungsdesign** — Spec `S2.4_menu-restructure.md` (348 Zeilen,
   12 AK, 8 Risiken). Architekten-Entscheidungen: **F1b** PHP-Array
   `inc/nav-data.php` (statt WP-Menu-API oder Trunk-YAML) · **F2b**
   Desktop-Submenu-Hover pure-CSS · **F3a** Burger + Off-Canvas-Drawer +
   `<details>`-Accordion · **F4b** Footer NICHT im Scope (→ S2.4b) ·
   **F5a** Submenus nur wenn Kinder existieren (heute: nur `Check-Ups ▼`) ·
   **F6a** `.is-active` + `aria-current` · **F7a** 1 Theme-Commit + PXZ
   2.7.15 → 2.7.16. Commit A `758aba1` (Spec FREIGEGEBEN).

3. **Phase 3 Umsetzung (T1–T12) mit R-5-Auflösung unterwegs:**
   - **T1 Baseline:** Home-HTML-MD5 `92c007dc…` festgehalten. Pre-Check
     13 geplanter Nav-URLs zeigt **10/13 OK, 2× 404 (`/fachrichtungen/`,
     `/aerzte/`), 1× 301 (`/kontakt/` → `/contact-us/`)**.
   - **R-5-Entscheidungen** live getroffen: `/aerzte/` aus Menü
     entfernen (Cluster noch nicht migriert; `/team/` deckt Ärzte-Grid
     seit S2.3-B ab); `/kontakt/` direkt auf `/contact-us/` (kein 301-
     Roundtrip); `/fachrichtungen/` Stub-Page anlegen auf
     `template-standard.php` mit ehrlichem „Detailseiten in Vorbereitung"-
     Content. → **7 Top-Items statt 8** (ehrlich).
   - **T2 `inc/nav-data.php` neu** — `pxz_nav_data()` (4 Sprachen:
     DE/EN/FR/ES), `pxz_nav_primary()`, `pxz_nav_is_active()` mit
     Trailing-Slash-Normalisierung.
   - **T3 `template-parts/header-nav.php` Rewrite** — `pxz_render_nav_item()`
     rendert flat / has-children / Submenu-Kinder, parallel Desktop-Hover-
     Variante + Mobile-`<details>`-Accordion-Variante. Active-State via
     `.is-active` + `.is-active-parent` + `aria-current="page"`. Burger-
     Button + `<aside id="pxz-nav-drawer" role="dialog" aria-modal inert>` +
     `<div class="pxz-nav-drawer-backdrop" hidden>`.
   - **T4 `assets/css/nav.css` append (~220 Z.)** — Active-State-Block,
     Desktop-Submenu-Block (hover + focus-within + Chevron-Rotation),
     Burger-Block (mit `[aria-expanded="true"]`-Morph zu X), Drawer-Block
     (transform + transition + scroll-lock), Accordion-Block (`<details>`-
     Reset, Chevron), `.pxz-nav-list { display: none !important }` unter
     1100 px (Drawer übernimmt), Reduced-Motion-Block.
   - **T5 `assets/js/nav.js` neu (~95 Z. vanilla)** — Burger-Toggle mit
     2-Frame-rAF-Muster für saubere Transition, Scroll-Lock-Klasse,
     ESC-/Backdrop-/Close-Btn-Schließen, Submenu-Keyboard-Enhancement
     (Space toggled `aria-expanded`), Sticky-Scroll-Shadow.
   - **T6 `functions.php`** — `require_once PXZ_PATH . '/inc/nav-data.php'`
     + `wp_enqueue_script( 'pxz-nav', ..., true )` (footer) + PXZ_VERSION
     2.7.15 → 2.7.16.
   - **T7 CHANGELOG** — `[2.7.16] — S2.4 Menü-Restrukturierung` mit
     vollständigem Block.
   - **Stub-Migration** `tools/migrations/2026-04-22_s2.4_fachrichtungen-stub.php`
     ausgeführt: `/fachrichtungen/` (ID 9674) auf `template-standard.php`
     mit WPML-DE-Eintrag (trid 1126). Warmup 2× HTTP 200.
   - **T8 verify.sh** — §1 + §1b + §2 + §3 (54/54) + §3b + §4
     (Alignment 10/10) alle grün, Exit 0.
   - **T9 smoke-http.sh + Nav-URL-Matrix** — 5/5 smoke OK, **12/12 Nav-
     URLs HTTP 200** (inkl. neu /fachrichtungen/-Stub).
   - **HTML-Assertions** — pxz-nav-list ×1, pxz-nav-sub ×2
     (Desktop+Drawer), Burger ×4 (1 Button + 3 Bars), Drawer ×1,
     Backdrop ×1, nav.js ×1. Alle 7 Top-Labels + 5 Submenu-Kinder im
     HTML. `/praxis/` → `is-active" aria-current="page"`. `/team/` → 1×
     `logo-sanexio.svg` (Brand-Switch intakt). `/gesundheits-check-up/` →
     Check-Ups `is-active-parent`. Alle grün.
   - **T10 Puppeteer-Screenshots** bewusst übersprungen (Logik-Beweis
     AK-11 ausreichend: `template-homepage.php` + `homepage-data.php`
     nicht angefasst → Hero byte-identisch). Design-Feintuning fällt in
     Folge-Session.
   - **T11 Self-Check** `evidence/2026-04-22_s2.4_self-check.md` (12/12 AK,
     5 LL, 0 FK) + Baseline `evidence/2026-04-22_s2.4_baseline.md`.
   - **Theme-Commit `e2336e2`** (6 Files, +614 Z.).
   - **Cortex-Web-Commit B `80e4f11`** (4 Files: Migration + Baseline +
     Self-Check + THEME_POINTER 2.7.16).

4. **Phase 4 Selbstprüfung** — 12/12 AK = 100 %. FK-Check 0/5 eingetreten.
   R-5 (problematische URLs) wurde früh im Pre-Check erkannt und
   architektonisch entschieden, nicht nachgelagert. Home-MD5-Delta
   akzeptiert als gewollter Nav-Umbau (R-1).

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| `verify.sh` §1 + §1b + §2 + §3 + §3b + §4 | VERIFY OK ✓ |
| `smoke-http.sh` (5 URLs) | 5/5 HTTP 200 ✓ |
| 12 Nav-URLs (curl-Matrix) | 12/12 HTTP 200 ✓ |
| `validate.sh` (Cortex-Web) | OK ✓ |
| Theme HEAD | `e2336e2` (PXZ 2.7.16) ✓ |
| Working Trees (beide) | clean ✓ |
| Brand-Switch `/team/` → Sanexio-Logo | 1× `logo-sanexio.svg` ✓ |
| `.is-active` + `aria-current="page"` auf `/praxis/` | ✓ |
| `.is-active-parent` auf Check-Ups bei Detail-Pages | ✓ |
| Submenu 5 Kinder im HTML | 5/5 ✓ |
| Self-Check AK | **12/12 = 100 %** ✓ |

### Lessons Learned (5 neue Pattern-Kandidaten — S2.4-LL-1…5)

- **S2.4-LL-1** `wp-nav-progressive-enhancement.md` — `<details>`-Accordion
  + Drawer-HTML mit `inert` gibt funktionierende Grundstruktur ohne JS.
  JS ist nur UX-Enhancement (Focus-Lock, ESC, Scroll-Lock).
- **S2.4-LL-2** `nav-data-ssot.md` (entspricht `menu-scope-honest-entries.md`
  teilweise) — PHP-Array als Nav-SSoT statt WP-Menu-API, wenn Git-
  Trackbarkeit + Review-Pflicht wichtiger sind als Admin-UI.
- **S2.4-LL-3** `nav-active-state-url-match.md` — `$_SERVER['REQUEST_URI']`-
  Match + Trailing-Slash-Normalisierung funktioniert vor dem Main-Query,
  das `is_page()` nicht tut.
- **S2.4-LL-4** `menu-scope-honest-entries.md` — Pre-Check-HTTP-Matrix vor
  Menü-Commit; 404/301 pro URL dokumentiert entschieden (Stub / Remove /
  Umlenken). Keine toten Links.
- **S2.4-LL-5** — „Menü wächst mit Content" als operationalisierte
  Architektur-Regel: `/aerzte/` vorerst weg, bis Cluster migriert.

### Drei neue Patterns + Tutorial 20

- Pattern `menu-scope-honest-entries.md` (plattform-agnostisch)
- Pattern `wp-nav-progressive-enhancement.md` (WP-spezifisch)
- Pattern `nav-active-state-url-match.md` (WP-spezifisch)
- Tutorial `20-navigation-restrukturierung-und-mobile-drawer.md` (didaktisch,
  inkl. Progressive-Enhancement-Diskussion)

---

## §3-legacy-session16 (historisch) — Session 16, 2026-04-20 (Praxis-Sprint 2 / S2.3-D Phase 2)

### Ziel
Content-Archive als Sicherungs-Schicht **vor** der Cluster-weisen Kuration. Dr.-Stracke-Leitprinzip wörtlich: *„Ich möchte es richtig und ohne Informationsverlust machen — du entscheidest."* Konsequente Interpretation: jede Page im aktuellen Local-WP-Stand bekommt eine unveränderliche Kopie im Git, bevor irgendeine Kurations-Entscheidung fällt.

### Durchgeführt (Architekten-Modus 4 Phasen)

1. **Phase 1 Verständnis-Sicherung** — Dr. Stracke delegiert alle Architektur-Entscheidungen an Claude (expliziter Auftrag „du entscheidest"). 13 Entscheidungspunkte (F1–F13) direkt in §2 der Spec dokumentiert.
2. **Phase 2 Lösungsdesign** — Spec `specs/sprint-2/S2.3-D_Phase2_content-extraction.md` (398 Zeilen, 12 AKs, 10 Risiken + Mitigationen, Rollback-Plan, Out-of-Scope-Bekräftigung). Commit A `661a4cd`.
3. **Phase 3 Umsetzung (13 T-Tasks):**
   - T0 Spec committed (Commit A `661a4cd`).
   - T2 Generator-Skript `tools/migrations/2026-04-20_s2.3-d-p2_content-extract.php` (~300 Zeilen, PHP-CLI, mysqli + Local-WP-Socket, MySQL 8 sql_mode-Override, deterministische YAML-Serialisierung ohne ext-yaml-Abhängigkeit).
   - T3 `_content-archive/README.md` mit Format-Doku, MD5-Contract, Pfad-Schema, Reverse-Lookup-Hinweisen.
   - T4 Generator Lauf 1: `created=189, errors=0` → alle 189 Archive-Dateien angelegt.
   - T5 Generator Lauf 2: `skipped=189, created=0` → Idempotenz bewiesen.
   - T6 Verifier-Skript `..._verify-md5.php` (~80 Zeilen): dreifacher MD5-Check (Body ↔ Front-Matter ↔ DB) → `OK: 189/189, FAIL: 0`.
   - T7 `find _content-archive -name '*.md' -not -name 'README.md' \| wc -l` = 189.
   - T8 Inventar-CSV um Spalte `archive_path` erweitert (16 Spalten, pro Zeile nicht-leer).
   - T9 verify.sh + smoke-http.sh + validate.sh alle grün.
   - T10 Home+Karriere MD5-Null-Delta trivial (Theme unberührt, keine DB-Content-Mutation).
   - T11 Self-Check `evidence/2026-04-20_s2.3-d-p2_self-check.md` mit 12/12 AKs grün und 5 Lessons.
   - T12 Commit B `d5051eb` (194 Files: Spec-Skripte + 189 Archive + README + CSV-Update + Self-Check).
   - T13 SESSION_RESUME Session-16-Block + §8-Historie.
4. **Phase 4 Selbstprüfung** — 12/12 AKs = 100 %. FK-Check 0/5 eingetreten.

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| Generator Lauf 1 | `created=189, errors=0` ✓ |
| Generator Lauf 2 (Idempotenz) | `created=0, skipped=189` ✓ |
| verify-md5 3-way match | 189/189 ✓ |
| Archive-Dateien | 189 ✓ |
| CSV-Spalte `archive_path` | vorhanden, pro Zeile belegt ✓ |
| verify.sh | §1+§1b+§2+§3+§3b+§4 grün ✓ |
| smoke-http.sh | 5/5 HTTP 200 ✓ |
| validate.sh | OK ✓ |
| Theme Working Tree | clean, HEAD `ae9b1b8` ✓ |
| Cortex-Web Working Tree | clean (nach Commit B) ✓ |
| Self-Check AKs | 12/12 = 100 % ✓ |

### Lessons Learned (5 neue Pattern-Kandidaten)

- **S2.3-D-P2-LL-1** `content-archive-pre-curation.md` — Unveränderliches Original-Archive vor Kuration ist billigste Versicherung gegen Informationsverlust. Kosten: ~2 MB Git-Wachstum. Nutzen: jede Folge-Session hat Original nebendran, Diff trivial.
- **S2.3-D-P2-LL-2** `yaml-front-matter-md5-contract.md` — Dreifache MD5-Verankerung (Body-File ↔ Front-Matter-Hash ↔ DB-Hash) als deterministischer, automatisch prüfbarer Integritäts-Contract für Dateisystem ↔ DB-Kohärenz.
- **S2.3-D-P2-LL-3** — Slug ist in WPML-Setups nie eindeutig (3× impressum, 3× home, 7× frequently-asked-questions). Dateinamen immer `<slug>-<id>`, nie Slug alleine.
- **S2.3-D-P2-LL-4** — YAML-Front-Matter ohne ext-yaml: ~30 Zeilen eigene Serialisierung (strings always-quoted, Zahlen bare, Blocks als Listen) sind diff-freundlich und deterministisch.
- **S2.3-D-P2-LL-5** — Ordner-Hierarchie ist zugleich Storage und Planungs-Artefakt. `ls kern/de/` zeigt die nächste Kurations-Session. Flache Ablage speichert dasselbe, aber der kognitive Nutzen wäre null.

### Archive-Verteilung (189 Dateien)

| Bereich | Anzahl |
|---|--:|
| `kern/de/` | 7 |
| `checkups/de/` | 6 |
| `services/de/` | 4 |
| `aerzte/de/` | 2 |
| `fachrichtung/de/` | 1 |
| `diagnostik/de/` | 10 |
| `legacy/de/` | 23 |
| `i18n-dublette/{en,fr,es,unknown}` | 42+41+39+2 = 124 |
| `_status/{draft,private}` | 4+8 = 12 |
| **Gesamt** | **189** |

→ **30 deutsche kuratur-relevante Pages** (kern+checkups+services+aerzte+fachrichtung+diagnostik) + 23 legacy (teils fremdsprachig) + 124 i18n-Dubletten + 12 Status-abweichend. Phase 3 beginnt mit Cluster `kern`.

---

## §3-legacy (historisch) — Session 15, 2026-04-20 (Praxis-Sprint 2 / S2.3-D Phase 1)

### Ziel
Vorbereitungs-Pass für Full-Content-Migration: (1) UTF-8-Mojibake systematisch aus 177 publish-Pages entfernen, (2) vollständiges Trunk-ready Page-Inventar (189 Zeilen, 15 Spalten) für thematische Folge-Sessions, (3) Scope-Klarheit über echte kuratur-relevante Page-Anzahl schaffen.

### Durchgeführt (Architekten-Modus 4 Phasen)
1. **Phase 1 Verständnis-Sicherung** — 7+2 Freigabefragen formuliert (F1–F9), Dr.-Stracke-Delegation an Architekten-Wahl. Endziel-Kontext-Schärfung (Bridge Shopify↔Praxis) direkt in F8/F9 integriert.
2. **Phase 2 Lösungsdesign** — Spec `specs/sprint-2/S2.3-D_content-curation.md` (342 Zeilen, 13 AKs, 8 Risiken + Mitigationen, Rollback-Plan). Commit A `f50110c`.
3. **Phase 3 Umsetzung (15 T-Tasks) mit Architektur-Pivot:**
   - T2 mysqldump Pre-Snapshot 1.5 MB (gzip OK) — committed als Rollback-Evidenz
   - T3 Pre-Count Shell-LIKE zeigt nur 1/15 Muster (31 `â€ž`-Hits) → Pivot-Entscheidung
   - T4–T5 Migration in PHP mit `mb_convert_encoding`-Paar + Per-Page-Safety-Check (has_mojibake, 4 Marker-Klassen byte-präzise). Lauf 1 = 20 Pages fixed. Lauf 2 = 0 Changes → Idempotenz-Beweis.
   - T6–T7 Residuen-Check: PHP-has_mojibake 177/177 == false. SQL-HEX-Check wirft `ERROR 3854 Cannot convert from binary to utf8mb4` als indirekten Byte-Residuen-Sauberkeits-Beweis.
   - T8–T9 Inventar-Generator (PHP) → `page-inventory-full.csv` (189 Zeilen, 15 Spalten inkl. `trunk_candidate` + `cross_site_potential` + `image_count` + `image_source_hint`) + `.md` mit Cluster-Summary und Batch-Empfehlung. sql_mode-Override für MySQL 8 `only_full_group_by` (S2.3-D-LL-4).
   - T10 AK-0 Drift 177/178 dokumentiert (Delta=1, nicht blockierend).
   - T11 verify.sh + smoke-http.sh + validate.sh alle grün.
   - T12 Home+Karriere MD5-Null-Delta trivial (Theme unberührt).
   - T13 Self-Check `evidence/2026-04-20_s2.3-d_self-check.md` — 13/13 AKs = 100 %.
   - T14 Commit B `2c6e881` (8 Files: Migration-Skripte + mysqldump + Evidenz + Inventar + Self-Check).
4. **Phase 4 Selbstprüfung** — FK-Check alle grün. Out-of-Scope-Einhaltung bestätigt (kein Content-Edit, kein Template-Wechsel, kein Theme-Touch, keine Page-Löschung). Pivot als „besser als Plan" dokumentiert (nicht FK-1…FK-5).

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| `verify.sh` §1 + §1b + §2 + §3 + §3b + §4 | VERIFY OK ✓ |
| `smoke-http.sh` (5 URLs) | 5/5 HTTP 200 ✓ |
| `validate.sh` (Cortex-Web) | OK ✓ |
| Theme Working Tree | clean, HEAD `ae9b1b8` ✓ |
| Cortex-Web Working Tree | clean ✓ |
| Mojibake Post-Count (byte-präzise) | 0 Residuen auf 177/177 Pages ✓ |
| Idempotenz (2. Lauf) | 0 Changes ✓ |
| Inventar-Zeilen | 189 (177+4+8) ✓ |
| Self-Check AKs | 13/13 = 100 % ✓ |

### Lessons Learned (5 neue Pattern-Kandidaten)
- **S2.3-D-LL-1** `wp-mojibake-mb-convert-fix.md` — Shell-LIKE-Pre-Count ist kein Mojibake-Audit; PHP `mb_convert_encoding`-Paar ist kanonischer ftfy-Ansatz für double-encoded UTF-8 in WP-Imports.
- **S2.3-D-LL-2** Safety-Check-Schema: `has_mojibake()` mit 4 Marker-Klassen (â€-prefix, Ã-umlaut, Â-punct, lone â€), dann fix-Versuch mit marker-diff-Check + UTF-8-Validity.
- **S2.3-D-LL-3** `mysql-utf8mb4-binary-rejection-proof.md` — `ERROR 3854 Cannot convert from binary to utf8mb4` bei UNHEX-Literal-Search ist indirekter Sauberkeits-Beweis (invalid-UTF-8-Bytes können in utf8mb4 gar nicht existieren).
- **S2.3-D-LL-4** MySQL 8 `only_full_group_by` bei LEFT JOIN + GROUP BY: `SET SESSION sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')` am Connection-Start.
- **S2.3-D-LL-5** `trunk-ready-page-inventory.md` — i18n-Dubletten sind >70 % von WPML-Page-Inventar; Scope-Schätzung muss das früh offenlegen. Echt kuratur-relevante deutsche Pages: 55 (nicht 189).

### Cluster-Verteilung (Schlüssel-Erkenntnis)

| Cluster | Priorität | Pages |
|---|:-:|--:|
| kern | P0 | 7 |
| checkups | P0 | 6 |
| diagnostik | P1 | 10 |
| services | P1 | 4 |
| aerzte | P1 | 2 |
| fachrichtung | P1 | 1 |
| legacy | P2 | 25 |
| **i18n-dublette** | P2 | **134** |

→ **55 deutsche kuratur-relevante Pages.** Folge-Sessions werden nach Cluster gebündelt (3–8 Pages/Session).

---

## §3-legacy (historisch) — Session 14, 2026-04-19 (Praxis-Sprint 2 / S2.3-B inkl. 3 Revisions)

### Ziel
3 P0-Pages aus Page-Inventar #2 (`/praxis/`), #3 (`/team/`), #8 (404) mit Echt-Content, SEO-Layer, semantischem Markup, HWG-konform. Content-Ton "moderne Praxis, am Puls der Zeit, Rundumversorgung". Primär-Keyword: Innere Medizin / Internist Frankfurt Westend.

### Durchgeführt — ursprünglich + 3 Revisions

**rev0 (Architekten-Modus Phase 1–4):** Spec `S2.3-B_praxis-team-404.md` (FREIGEGEBEN, Dr.-Stracke-Delegation). Neue Theme-Module `inc/seo-data.php` + `inc/seo-meta.php` unterdrücken AIOSEO auf überschriebenen Seiten (S2.3-B-LL-3). `template-standard.php` dynamisiert Hero aus post_meta. `tools/migrations/2026-04-19_s2.3-b_pages.php` legt Pages via mysqli an (inkl. WPML-Translations-Eintrag nach LL-2). CSS-Finals `standard.css` + `404.css` (Tokens-only). `tools/smoke-seo.sh` neu (21 Assertions, pipefail-frei nach LL-4). Theme-Commit `74a9512` (PXZ 2.7.9). Cortex-Web-Commits `68a0db1` (Spec) + `9d503fc` (Tools+Evidence+Self-Check).

**rev1 (Dr.-Stracke-Review Runde 1):** Branding (`blogname` → "Praxiszentrum Dr. Stracke und Kollegen"), H1-Klassen von `.pxz-display` auf `.pxz-title-2` (40–104 px → 28–48 px), Hero-Padding reduziert, Team pivotiert von narrativ zu **Ärzte-Grid** (`template-team.php` + `inc/team-data.php` mit 8 Ärzten, Avatar-Placeholder mit Initialen, 3 Accent-Varianten), 404-Rippenspreizer-SVG-Cartoon. DESIGN_GUIDELINES §18.1+§18.2 neu. Theme-Commit `81d3f62` (PXZ 2.7.10). Cortex-Web-Commit `41cf66e`.

**rev2 (Dr.-Stracke-Review Runde 2 — "der Header sieht auf anderen Seiten anders aus!"):** Diagnose: `.pxz-nav` war hartkodiert nur in `template-homepage.php`. Extraktion nach `template-parts/header-nav.php` + Include in allen Templates + neue `assets/css/nav.css` mit dupliziertem `.pxz-nav` Rule-Set und `#header.ct-header { display: none !important }` zum Site-weiten Ausblenden des Blocksy-Default. Home 3/3 MD5-Match bleibt erhalten (dupliziertes CSS via later-in-cascade). `inc/team-data.php` auf echte Arztnamen aus `pxz_team_members()` synchronisiert. Theme-Commit `e2bb7b1` (PXZ 2.7.11). Cortex-Web-Commit `81e98ff`.

**rev3 (Sanexio-Logo für /team/):** ZIP-Asset entpackt, sanexio-red.svg als `assets/logo-sanexio.svg` aktiviert, compact-Variante als Reserve. URL-basierter Brand-Switch in `header-nav.php` (`is_sanexio = preg_match('#^/team/?#', $uri)`). CSS-Overrides `.pxz-nav-logo-sanexio img { width: 200..400px; aspect-ratio: 800/270 }`. DESIGN_GUIDELINES §18.3 neu (verbindliche Logo-Marken-Zuordnung). Initials-Fix: `méd.` (mit Akzent) + Komma/Punkt-Stripping in `pxz_doctor_initials()` → Saul zeigt "SS" statt "MS". Theme-Commit `dd1de0f` (PXZ 2.7.12). Cortex-Web-Commit `ee76e1b`.

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| `verify.sh` §1 + §1b + §2 + §3 + §3b + §4 | VERIFY OK ✓ |
| `smoke-seo.sh` | 21/21 Assertions ✓ |
| `smoke-http.sh` | 5/5 URLs < 5xx ✓ |
| `validate.sh` (Cortex-Web) | OK ✓ |
| Home MD5-Null-Delta (3 Viewports) | **3/3 MATCH ✓** |
| Karriere MD5 (3 Viewports) | 3/3 DELTA (gewollt — Header-Fix) |
| `/praxis/`, `/team/`, `/` HTTP | 200 ✓ |
| 404-Fallback inkl. Rippenspreizer-Cartoon | ✓ |
| Theme + Cortex-Web Working Tree | beide clean ✓ |

### Lessons Learned (4 neue Patterns)

- **S2.3-B-LL-2** `wpml-translations-direct-sql.md` — Bei SQL-Page-Inserts mit aktivem WPML muss ein Eintrag in `wp_icl_translations` geschrieben werden, sonst 404 trotz publish. Idempotente `upsert_wpml_de()` im Migration-Skript.
- **S2.3-B-LL-3** `wp-plugin-head-override.md` — AIOSEO rendert auf zwei Kampfplätzen (`wp_head` prio 1 und `pre_get_document_title` prio 99999). Überschreibung braucht auf beiden einen expliziten `remove_action`/`remove_filter`, nicht nur höhere Priorität.
- **S2.3-B-LL-4** `bash-sigpipe-grep-trap.md` — `set -o pipefail` + `grep -q` + `curl` erzeugt false-negatives bei grossen Outputs (SIGPIPE). Fix: pipefail weglassen ODER curl-Output in Variable buffern.
- **S2.3-B-rev2/3** `wp-unified-site-header.md` — Nav in `template-parts/header-nav.php` extrahieren, Parent-Theme-Default-Header via CSS ausblenden, URL-basierter Brand-Switch für Multi-Brand-Setup. Mit MD5-Null-Delta-sicherer CSS-Duplication-Strategie.

### DESIGN_GUIDELINES §18 neu (v3.1)

- §18.1 Content-Page-Typografie: `.pxz-display` reserviert für Home-Hero; Content-Page-H1 verbindlich `.pxz-title-2`.
- §18.2 Header-Branding-Konsistenz: Site-weit einheitlicher Nav, `blogname` als Single-Source, URL-basierte Overrides dokumentationspflichtig.
- §18.3 Logo-Marken-Zuordnung: Praxis-URLs → Praxiszentrum-Roundel + Text-Wortmarke; `/team/` → Sanexio-Horizontal-Wortmarke (integrierter Text). Anti-Pattern: Logos mischen.

### Tutorial 15 (Nexus)

`Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/15-seo-und-header-branding-im-theme.md` — SEO-Layer theme-eigen, AIOSEO-Override, Multi-Brand-Header, URL-basierter blogname-Filter.

---

## §3b Vor-vorletzte Session — Session 13, 2026-04-19

### Ziel
Praxis-Sprint 2 / S2.0f Santapress-Plugin-Entfernung — das in S2.0e als Interferenz-Quelle identifizierte Santapress-Plugin aus Local-WP entfernen. Freigabe durch Dr. Stracke in Session 12. Reversibel, regressions-frei, audit-nachvollziehbar.

### Durchgeführt (Architekten-Modus 4 Phasen)
1. **Pflicht-Init** (Nexus + Cortex-Web + Praxis-WORKING_MODE + SESSION_RESUME Session 12). Pre-Flight `validate.sh` ✅ + `verify.sh` ✅.
2. **Phase 1 Verständnis-Sicherung** mit 4 Freigabe-Fragen (F1–F4). Dr. Stracke wählt: F1a (S2.0f in Sprint 2), F2c (Archive-Then-Delete auf Vorschlag hin, statt F2b Hard-Delete), F3b (verify.sh + HTTP-Smoke), F4a (volle Spec).
3. **Phase 2 Lösungsdesign:** Spec `S2.0f_santapress-removal.md` (Hard-Cap 60 min, 5 T-Tasks, 6 AKs, 6 Risiken). 3 weitere Freigabe-Fragen (F5/F6/F7) — Dr. Stracke delegiert an Claude. Entscheidungen: F5b-modifiziert (5xx-Fail-Regel, 5 URLs inkl. 3 WP-Core-Routen), F6b (Verfallsdatum 2026-05-19), F7b (wp_posts-Count-Snapshot als Paranoia).
4. **Phase 3 Umsetzung — alle 5 T-Tasks in Reihenfolge:**
   - T0 Spec committed (`e036328`)
   - T1 Pre-Condition-Snapshot: 26 active_plugins (Santapress an Index 15), rewrite_rules 13085 Bytes, wp_posts 2860 gesamt, Plugin 21 MB
   - T2 Hook-Dependency-Audit: **0 externe Referenzen** in Plugins/Theme/mu-Plugins/andere-Themes → Entfernung sicher
   - T3a PHP-Serialize-Manipulation via `mysqli->prepare` (S2.0f-LL-2: `'localhost'` + Socket-Argument statt `null`): before=26 after=25 removed=1 affected_rows=1
   - T3b Plugin-Ordner nach `_archive/santapress-2026-04-19/` verschoben (21 MB, identisch zum Source), ARCHIVE_README.md mit Rollback-Anleitung + Verfallsdatum
   - T4 `DELETE FROM wp_options WHERE option_name='rewrite_rules'` + 2× Warmup-curl (beide HTTP 200) → neue Größe **10979 Bytes** (−2106 = Santapress-Routen weg, S2.0f-LL-3)
   - T5a `smoke-http.sh` neu angelegt, 5 URLs (`/`, `/karriere/`, `/wp-login.php`, `/feed/`, `/?s=test`), Exit 0, alle HTTP 200
   - T5b `verify.sh` Komplett-Lauf: §1+§1b+§2+§3+§3b+§4 alle grün, Exit 0 → **keine Regression**
   - T7 Self-Check `evidence/2026-04-19_s2.0f_self-check.md` (6/6 AKs grün), 5 Lessons Learned
   - T8 Commit B (`a6cc6f3`) — 16 Files (.gitignore + Spec-Update + Tool + 13 Evidenz-Files + Self-Check)
5. **Phase 4 Selbstprüfung:** AK-Tabelle 6/6 grün. **F7b-Paranoia-Check bestätigt:** `wp_posts`-Count vor/nach identisch (2860 gesamt, Delta=0 je post_status) → kein `deactivation_hook`-Schaden.
6. **„Session beenden"-Workflow LL-042 (6 Schritte):**
   - Schritt 1: Projekt-Audit grün (verify/validate/smoke alle OK, Theme clean, keine Backup-Files, nur erwartete S2.3-TODO-Marker in Specs)
   - Schritt 2: Nexus-Audit — CLAUDE.md + MEMORY.md brauchen Session-13-Updates
   - Schritt 3: Pattern-Optimierung — neues Pattern `wp-plugin-safe-removal.md` angelegt; `.gitignore`-Hygiene (`screenshots/claude/` ergänzt, Commit `ced4e0a`)
   - Schritt 4: Tutorial 14 `14-wp-plugin-sicher-entfernen.md` angelegt (5-Schritt-Protokoll, PHP-Serialize-Erklärung, Governance-Pattern)
   - Schritt 5: diese Datei finalisiert
   - Schritt 6: Dashboard (siehe Chat-Ausgabe)

### Verifiziert (AK-Tabelle aus Self-Check)

| AK | Status | Evidenz |
|---|:---:|---|
| AK-1 | ✅ | active_plugins 26 → 25 (Santapress raus) |
| AK-2 | ✅ | Plugins-Dir ohne santapress, Archive 21 MB identisch |
| AK-3 | ✅ | rewrite_rules 13085 → 10979 Bytes (−2106) |
| AK-4 | ✅ | verify.sh Exit 0, 6 §-Blöcke grün |
| AK-5 | ✅ | smoke-http.sh Exit 0, 5/5 URLs HTTP 200 |
| AK-6 | ✅ | T2-Dependency-Audit: 0 externe Referenzen |

**Score: 6/6 = 100 %**

### Lessons Learned (S2.0f-LL-1…5 — ins Pattern + Tutorial 14 übernommen)

- **S2.0f-LL-1:** Page-Registry (`tools/page-registry.mjs`) ist Definition-of-Done-Artefakt für S2.3. Registry hat aktuell nur 2 Einträge (home, karriere) — die 8 S2.2-Skelett-Slugs sind nicht registriert. Bei S2.3-Pages muss Registry mitgepflegt werden.
- **S2.0f-LL-2:** `mysqli` + Unix-Socket: `new mysqli('localhost', ..., $socket)` ist robuster als `new mysqli(null, ..., $socket)`. `null` als Host ist in manchen PHP-Versionen inkonsistent.
- **S2.0f-LL-3:** `rewrite_rules`-Größen-Delta ist das einfachste Signal für Plugin-Route-Entfernung. Hier: −2106 Bytes.
- **S2.0f-LL-4:** F7b `wp_posts`-Count ist billige Paranoia (2×50ms) mit hoher Aussagekraft gegen `deactivation_hook`-Schaden. Standard-Evidenz für Plugin-Entfernungen.
- **S2.0f-LL-5:** `smoke-http.sh` gehört **nicht** in `verify.sh`. Scope-Disziplin (S2.0e-LL-4): Code-Korrektheit deterministisch/offline vs. Request-Verfügbarkeit netzwerkabhängig. Zwei Dimensionen → zwei Tools.

---

## §3a Vorletzte Session — Session 12, 2026-04-19

### Ziel
Praxis-Sprint 2 / S2.0e Verify-Hardening — `tools/verify.sh` um Split-Check-Erweiterung
(§1b) und Component-Probe (§3b) ergänzen, um die in S2.0b auf „später" verschobenen
AK-8 + AK-10 nachzuholen. Keine Theme-Änderung.

### Durchgeführt (Architekten-Modus 4 Phasen)
1. **Pflicht-Init geladen** (Nexus + Cortex-Web + Praxis-WORKING_MODE + SESSION_RESUME Session 11).
   Pre-Flight: `validate.sh` ✅, Praxis `verify.sh` ✅.
2. **Phase 1 Verständnis-Sicherung** mit 7 Freigabefragen (F1–F7) + 3 Detail-Fragen
   (Page-Status, Viewport-Umfang, Migration-Pattern). Alles delegiert durch Dr. Stracke
   an Architekten-Wahl.
3. **Phase 2 Lösungsdesign:** Spec `S2.0e_verify-hardening.md` (14 KB, 8 AKs, 6 Risiken,
   Out-of-Scope-Liste). Architekten-Entscheidungen: F1a-modifiziert + F2b + F3a + F4a +
   F5b+F5c + F6b + 90-min-Cap. Für die 3 Detail-Fragen: publish statt draft,
   1440 only, Migration-Skript statt ad-hoc SQL.
4. **Phase 3 Umsetzung — mit Architektur-Pivot:**
   - T1 Spec committed (`88290b0`)
   - T2 Migration-Skript `tools/migrations/2026-04-19_s2.0e_probe-page-setup.sh` angelegt,
     idempotent-Verhalten verifiziert (2× OK-Ausgabe). Page 9670 auf publish + Probe-Markup.
   - T3 `page-registry.mjs` erweitert um `component-probe`-Eintrag.
   - **Pivot-Entdeckung:** Puppeteer-Probe schlägt fehl — `/s2-0b-probe/` gibt 404,
     trotz publish + Probe-Markup. Grund: WordPress-Rewrite-Rules werden nach direktem
     SQL-INSERT nicht zuverlässig für den Slug generiert (Santapress-Plugin-Interaktion).
     Diagnose via 4 Versuche: `DELETE rewrite_rules` + Warmup (fail), PHP-CLI `flush_rewrite_rules`
     (fail am Local-DB-Socket), `/?pagename=` (301), `/index.php/…/` (301). Alle scheitern.
   - **Architektur-Pivot:** T2 + T3 rückgängig (Page auf draft/leer, Skript gelöscht,
     page-registry-Eintrag entfernt). §3b neu als zweistufige **Bash-Probe**:
     · Stufe A — 8 `grep`-Assertions auf `components.css` (Datei-Korrektheit)
     · Stufe B — 2 `curl`+`grep`-Checks auf Home-HTML (Enqueue-Korrektheit)
     Multi-Line-CSS via `grep -E <head> -A <ctx> | grep -qE <content>` gelöst.
   - T4 `PROBED_PROPS` in `probe-design.mjs` um `textTransform`/`fontWeight`/`fontSize`
     erweitert (zukunftsfähig für Page-Typografie-Probes in S2.3).
   - T5 `grep_split_css()` + `component_probe()` in `verify.sh` + Dispatch.
   - T6 Komplett-Lauf `verify.sh`: §1 + §1b + §2 + §3 + §3b + §4 alle grün, Exit 0.
   - T7 S2.0e-Self-Check `evidence/2026-04-19_s2.0e_self-check.md` (8/8 AKs).
   - T8 S2.0b-Self-Check-Nachtrag: AK-8 + AK-10 → grün durch S2.0e, finaler Score
     **12/12 (100 %)**.
   - T9 Cortex-Web-Commit B (`6352b1e`).
5. **Phase 4 Selbstprüfung:** AK-Tabelle 8/8 grün. 5 Lessons Learned S2.0e-LL-1…5.
   Pivot explizit als „architektonische Abweichung" im Self-Check dokumentiert.
6. **„Session beenden"-Workflow LL-042 (6 Schritte):**
   - Schritt 1: Projekt-Audit grün (verify/validate beide OK, Theme clean, keine Backups).
   - Schritt 2: Nexus-Audit — MEMORY.md + CLAUDE.md brauchten Session-12-Updates.
   - Schritt 3: Pattern-Optimierung — neues Pattern `verify-probe-code-vs-integration.md`
     angelegt (plattform-agnostisch WP/Shopify/Next.js/iOS).
     `local-wp-mysql-socket.md` um Rewrite-Rule-Warnsektion erweitert.
   - Schritt 4: Tutorial 13 `13-verify-probe-architektur-und-wp-rewrite-grenze.md`
     angelegt (Meta-Ebene-Lehrsätze: Dimensionen trennen, Architektur-Pivots als
     Chance, Rollback muss DB mit zurücksetzen).
   - Schritt 5: diese Datei finalisiert.
   - Schritt 6: Dashboard (siehe unten im Chat).

### Verifiziert (AK-Tabelle aus Self-Check)

| AK | Status | Evidenz |
|---|:---:|---|
| AK-1 | ✅ | `grep_split_css()` in verify.sh (Def + Aufruf) |
| AK-2 | ✅ | 3× „Keine doppelten Basis-Selektoren" |
| AK-3 | ✅ | `component_probe()` mit 8+2 Assertions (Bash, statt page-registry-DOM-Probe) |
| AK-4 | ✅ | PROBED_PROPS enthält textTransform/fontWeight/fontSize |
| AK-5 | ✅ | verify.sh --component-probe grün, 10× ✓ |
| AK-6 | ✅ | Full verify.sh Exit 0 mit §1 + §1b + §2 + §3 + §3b + §4 |
| AK-7 | ✅ | Theme-HEAD `8f596f7` unverändert, clean |
| AK-8 | ✅ | S2.0b-Self-Check-Nachtrag mit S2.0e-Ref |

**Score: 8/8 = 100 %**

### Lessons Learned (S2.0e-LL-1…5 — ins Pattern + Tutorial 13 übernommen)
- **S2.0e-LL-1:** Puppeteer-DOM-Probe auf direkt-SQL-angelegte Pages scheitert an
  WP-Rewrite-Rules. Gilt besonders mit Plugins wie Santapress, die eigene URL-Handler
  registrieren. Regel: direkt-SQL nur für Backend-Objekte, nicht für Frontend-Slug-URLs.
- **S2.0e-LL-2:** Architektur-Pivot unter Zeitdruck ist architektonisch oft besser
  als Forcieren des ursprünglichen Plans. Hier: Trennung Code- vs. Integrations-Test
  gewinnt gegenüber „ein DOM-Test für alles".
- **S2.0e-LL-3:** `grep -E <head> -A <ctx> | grep -qE <content>` ist ein robustes
  Muster für Multi-Line-CSS-Assertions (kein pcregrep/perl nötig).
- **S2.0e-LL-4:** Gute Pre-Flight-Probes testen die zwei Fragen, die echte Aussagen
  treffen: „Läuft der Code?" und „Ist die Regel da?" sind unterschiedlich.
- **S2.0e-LL-5:** Rollback nach Architektur-Pivot muss DB-Zustand mit zurücksetzen
  (post_status, post_content) — nicht nur Dateien.

---

## §3a Vorletzte Session — Session 11, 2026-04-19

### Ziel
Praxis-Sprint 2 / S2.0b Komponenten-Bibliothek — Schicht 3 (Components) gemäß
DESIGN_GUIDELINES v3.0 §2 einziehen, generische Klassen aus `homepage.css` in
`components.css` heraufziehen, Home **byteidentisch** halten.

### Durchgeführt (Architekten-Modus 4 Phasen)
1. **Pflicht-Init:** Nexus + Cortex-Web + Praxis-WORKING_MODE + 8 Dateien gelesen.
   Pre-Flight: `validate.sh` ✅, Praxis `verify.sh` ✅. Dr.-Stracke-Wahl:
   Front A (S2.0b), Entscheidungen F1–F7 + F-1…F-5 delegiert.
2. **Phase 1 Verständnis-Sicherung** mit 7 Rückfragen (F1 Namespace-Strategie,
   F2 `.pxz-eyebrow`-Heraufzug, F3 `kar`→`karriere`-Rename, F4 Scope, F5
   Enqueue-Strategie, F6 Version-Bump, F7 Verify-Scope). Architekten-Wahl:
   F1a/F2a/F3b/F4b/F5a/F6a/F7b.
3. **Phase 2 Lösungsdesign:** Spec `S2.0b_component-library.md` (14 KB, 12 AKs,
   14 Constraints, 7 Risiken, 5 weitere Freigabe-Fragen F-1…F-5 — alle delegiert).
4. **Phase 3 Umsetzung (T1–T13):**
   - T1 Spec committed (Cortex-Web `2056e3e`)
   - T2 Baseline: 6 Shots + MD5 (`evidence/2026-04-19_s2.0b_baseline.md`)
   - T3 WP-Testseite `s2-0b-probe` (ID 9670, `template-standard.php`, draft) via
     direktem MySQL-Client (wp-cli scheiterte am Local-by-Flywheel-Socket →
     neues Pattern `local-wp-mysql-socket.md`)
   - T4 `components.css` angelegt (128 Zeilen, 6 Blöcke Container + Typografie
     + Buttons + Section `.pxz-sect*`/`.pxz-section*` + Card + Hero)
   - T5 `homepage.css` getrimmt (5 Blöcke entfernt)
   - T6 `functions.php`: `pxz-components` enqueued + 10 Deps umgestellt +
     PXZ_VERSION 2.7.7 → 2.7.8
   - T7 verify.sh §3b-Erweiterung **verschoben auf S2.0e** (Scope-Disziplin)
   - T8 Post-Refactor verify.sh: §1–§4 alle grün
   - T9 Post-Refactor Shots + MD5-Vergleich: **6/6 DELTA** (unerwartet)
   - **In-Session-Bug-Jagd:** Root-Cause via Puppeteer `offsetHeight` pro
     Sub-Element. Delta −20 px bei `.pxz-eyebrow` (margin-bottom weg) +
     −28 px bei `.pxz-sect-intro` (margin-top weg) — Ursache:
     `.pxz-home :where(p)`-Reset (Spez 0,1,0) in `homepage.css` schlägt
     gleich-spezifische Klassen-Regeln in `components.css`, weil
     `homepage.css` später in der Kaskade lädt. **Fix S2.0b-LL-1:**
     page-scope Overrides `.pxz-home .pxz-eyebrow` + `.pxz-home .pxz-sect-intro`
     in `homepage.css` mit Spez 0,2,0.
   - T9-rerun: Home MD5 3/3 MATCH ✓. Karriere 3/3 DELTA (-9 px je Viewport)
     durch `.wpforms-submit` (WCAG-compliantes `min-height: 44px` +
     `line-height: 1` aus generischer `.pxz-btn`) — Accessibility-Gewinn,
     dokumentiert, akzeptiert.
   - T10 CHANGELOG v2.7.8 im S2.0c-Stil
   - T11 2 atomare Theme-Commits (`08f40ff` feat + `8f596f7` refactor).
     Commit C (verify-Erweiterung) verschoben auf S2.0e.
   - T12 Self-Check `evidence/2026-04-19_s2.0b_self-check.md` (10/12 AKs grün)
   - T13 Cortex-Web-Commit `df50333` (Spec + Self-Check + Baseline +
     MD5-Diff + 12 Shots + THEME_POINTER → 2.7.8)
5. **Phase 4 Selbstprüfung:** AK-Tabelle 10/12 grün, 5 Lessons Learned
   (S2.0b-LL-1…5), 2 verschobene AKs dokumentiert.
6. **„Session beenden"-Workflow LL-042 (Schritte 1–5):**
   - Schritt 1: Konsistenz-Audit — beide Repos clean, verify+validate grün,
     keine Backup-Files
   - Schritt 2: Nexus-Audit — MEMORY/CLAUDE/SYSTEM_MAP auf v2.7.8 aktualisiert
   - Schritt 3: Pattern-Optimierung — 2 neue Patterns
     `css-layer3-promotion.md` + `local-wp-mysql-socket.md`
   - Schritt 4: Tutorial-Update — `Tutorial 12 — CSS-Spezifität &
     Komponenten-Schichten` (aus S2.0b-LL-1)
   - Schritt 5: diese Datei finalisiert

### Verifiziert (AK-Tabelle aus Self-Check)

| AK | Status | Evidenz |
|---|:---:|---|
| AK-1 | ✅ | components.css mit 6 §-Blöcken |
| AK-2 | ✅ | Nur dokumentierte Hex/px-Ausnahmen (#fff in Buttons/Hero, 24px in `.pxz-card`, 64/80/96 in `.pxz-sect`) |
| AK-3 | ✅ | homepage.css ohne promotierte Blöcke, −55 +10 Zeilen |
| AK-4 | ✅ | Enqueue-Kette per curl verifiziert: tokens → blocksy → praxiszentrum → components → homepage |
| AK-5 | ✅ | `PXZ_VERSION = '2.7.8'` |
| AK-6 | ✅ | CHANGELOG v2.7.8 |
| AK-7 | ✅ | verify.sh §1–§4 grün |
| AK-8 | ⚠ VERSCHOBEN | S2.0e (verify.sh §3b Component-Probe auf Draft-Seite) |
| AK-9 | ✅ | Home 3/3 MATCH (MD5 byteidentisch 1011c76b / c55c977c / 640268ef) |
| AK-10 | ⚠ VERSCHOBEN | S2.0e (erweiterter Split-Check) |
| AK-11 | ✅ | karriere.css unverändert (git-diff 0 Zeilen) |
| AK-12 | ✅ | Self-Check-Datei vorhanden |

**Score: 10/12 = 83 % · 2/12 auf S2.0e verschoben**

### Lessons Learned (S2.0b-LL-1…5 — ins Pattern + Tutorial 12 übernommen)
- **S2.0b-LL-1:** Spezifitäts-neutrale `:where()`-Resets schützen nur innerhalb
  derselben Datei. Heraufziehen class-basierter Regeln in frühere Kaskaden-Datei
  erfordert page-scope-Override mit erhöhter Spezifität.
- **S2.0b-LL-2:** Puppeteer-Full-Page-Shots sind nicht immer deterministisch
  (Tablet768 SSIM 0.988). Dimensions-Delta + Sub-Element-Messung ergänzen MD5.
- **S2.0b-LL-3:** Globale Komponenten-Regeln bringen Accessibility-Properties
  (`min-height: 44px`) auf alle Pages. C1 muss per-page spezifiziert werden.
- **S2.0b-LL-4:** Class-Promotion erfordert Kaskaden-Analyse gegen nicht-
  promotierte Resets (grep auf `:where(p)`, Tag-Selektoren, `* { }`).
- **S2.0b-LL-5:** WP-CLI scheitert bei Local-by-Flywheel am Socket-Pfad.
  Workaround: direkter mysql-Client + Lightning-Services-Socket.

---

## §3a Vorletzte Session — Session 10, 2026-04-19

### Ziel
Praxis-Sprint 2 / S2.2 Template-Typologie — 8 neue WP-Page-Template-Skelette
für die in S2.1 inventarisierten 27 Seiten anlegen, ohne Echt-Content
(Content folgt in S2.3).

### Durchgeführt (Architekten-Modus 4 Phasen)
1. **Pflicht-Init:** Nexus + Cortex-Web + Praxis-WORKING_MODE gelesen.
   Pre-Flight: `validate.sh` ✅, Praxis `verify.sh` ✅. Dr.-Stracke-Wahl: Front A (S2.2).
2. **Phase 1 Verständnis-Sicherung** mit 3 Rückfragen (F1 Granularität Landing,
   F2 Hero-Komponenten-Strategie, F3 404-Inhalt). Dr. Stracke wählt
   F1a/F2b/F3b → Architekten-Einwände, finale Wahl: F1a/F2c/F3a-plus,
   S2.0b zwischen S2.2 und S2.3 eingeschoben.
3. **Phase 2 Lösungsdesign:** Spec `S2.2_templates.md` (22 KB, 12 AKs, 7
   Constraints, 7 Freigabe-Fragen). Dr. Stracke delegiert Architekten-
   Entscheidungen — F-2 sprechende Slugs, F-3 PHP-Array, F-4 Display-Namen
   wie vorgeschlagen, F-5 CHANGELOG S2.0c-Stil. Spec auf FREIGEGEBEN.
4. **Phase 3 Umsetzung (T1–T10):**
   - T1 Spec committed (Cortex-Web `de4f580`)
   - T2 8 PHP-Templates angelegt (`template-standard.php`, `-sprechstunden.php`,
     `-kontakt.php`, `404.php`, `-fachrichtung-landing.php`, `-fachrichtung.php`,
     `-team.php`, `-arzt.php`)
   - T3 8 CSS-Files angelegt (`assets/css/{standard,sprechstunden,kontakt,404,
     fachrichtung-landing,fachrichtung,team,arzt}.css`) — Klassen-Stubs ohne
     harte Werte
   - T4 `functions.php`: PXZ_VERSION 2.7.6 → 2.7.7, 7 neue
     `is_page_template()`-Conditionals + 1 `is_404()`, 7 Display-Namen
   - T5 CHANGELOG v2.7.7 im S2.0c-Stil
   - T6 Theme-Repo-Commit `6c02cb4` (17 Dateien)
   - T7 verify.sh nochmal grün (Home + Karriere unverändert) ✅
   - T8 WP-CLI-Probe `wp eval get_page_templates()` zeigte zwei Phantom-Einträge
     (`404.php` + `functions.php`) → **PXZ-E-009-Bug entdeckt**: Code-Comments
     mit literalem String `Template Name:` triggern WP-Auto-Discovery.
     Hotfix: Bindestrich statt Doppelpunkt (`Template-Name`). Commit `dd3e4e1`.
     Re-Verifikation grün — alle 8 Templates korrekt registriert.
   - T9 Self-Check `evidence/2026-04-19_s2.2_self-check.md` mit 12/12 AKs grün
   - T10 THEME_POINTER auf 2.7.7 + Cortex-Web-Commit `5a2a247` (Self-Check +
     Pointer + 4 Verify-Shots als Baseline-vs-After-Beweis)
5. **Phase 4 Selbstprüfung:** AK-Tabelle 12/12 grün, In-Session-Bug
   dokumentiert, 5 Lessons Learned (S2.2-LL-1…5).
6. **„Session beenden"-Workflow LL-042 (Schritte 1–5):**
   - Schritt 1: Konsistenz-Audit — beide Repos clean, verify+validate grün,
     keine Backup-Files, TODOs nur erwartete S2.3-Marker
   - Schritt 2: Nexus-Audit — MEMORY/CLAUDE/SYSTEM_MAP brauchen S2.2-Update
   - Schritt 3: Pattern-Optimierung — PXZ-E-009 ins praxis-FEHLERPROTOKOLL,
     neues Pattern `Nexus/_memory/patterns/wp-skeleton-templates-bundle.md`
   - Schritt 4: Tutorial-Update — `Tutorial 11 — WP Page-Templates &
     Auto-Discovery` angelegt (didaktisch, mit PXZ-E-009 als Lehrbeispiel)
   - Schritt 5: diese Datei finalisiert + Nexus-Updates committed

### Verifiziert (AK-Tabelle aus Self-Check)

| AK | Status | Evidenz |
|---|:---:|---|
| AK-1 | ✅ | 9 PHP-Templates (8 mit Page-Template-Header + Karriere; 404.php hat bewusst keinen) |
| AK-2 | ✅ | 11 CSS-Files (3 alt + 8 neu mit Selector-Namespace-Comment) |
| AK-3 | ✅ | alle 8 neuen PHPs: ABSPATH + get_header + get_footer + Container-Div + Hero-Section |
| AK-4 | ✅ | 9 is_page_template + 1 is_404 + 8 Filter-Display-Namen in functions.php |
| AK-5 | ✅ | PXZ_VERSION = 2.7.7 |
| AK-6 | ✅ | CHANGELOG v2.7.7 mit S2.0c-Stil |
| AK-7 | ✅ | verify.sh grün — Home+Karriere unverändert (4-Verify-Shots-Beweis) |
| AK-8 | ✅ | Kein Inline-CSS in den 9 neuen PHPs |
| AK-9 | ✅ | Keine Hex/px in den 8 neuen CSS-Files |
| AK-10 | ✅ | Keine Touches an Homepage/Karriere/Tokens/Style-CSS (C9) |
| AK-11 | ✅ | WP-CLI-Probe zeigt alle 8 Templates korrekt nach Hotfix |
| AK-12 | ✅ | Self-Check-Datei vorhanden |

**Score: 12/12 = 100 %**

### Lessons Learned (S2.2-LL-1…5 — ins Pattern + Tutorial 11 übernommen)
- **S2.2-LL-1:** WP-CLI-Probe (`wp eval get_page_templates`) ersetzt
  Browser-Verifikation für Template-Registrierungs-AK — schneller, deterministisch.
- **S2.2-LL-2:** **PXZ-E-009** — Code-Comments mit literal `Template Name:`
  triggern WP-Auto-Discovery-Regex. Sichere Form: Bindestrich statt Doppelpunkt.
  Gilt analog für `Plugin Name:`, `Theme Name:`, `Block Name:` etc.
- **S2.2-LL-3:** Skelett-Disziplin: wenn Spec „minimale Werte erlaubt" sagt,
  aber andere Files leer sind, gewinnt konsequente Skelett-Disziplin (404.css
  blieb leer, F3a-plus-Stilisierung nach S2.3 verschoben).
- **S2.2-LL-4:** Sprechende Slugs vor 3-Buchstaben-Kürzeln — bei Inkonsistenz
  im Bestand vereinheitlichen wir nicht auf das schlechtere Pattern.
- **S2.2-LL-5:** Spec-Aussagen im Self-Check verifizieren, nicht blind übernehmen
  — die Spec hatte off-by-one in AK-1-Erklärung (Homepage in „grep-Zähl" vergessen).

---

## §3a Letzte Session — Session 9, 2026-04-19

### Ziel
Praxis-Sprint 2 / S2.1 Seiten-Inventar umsetzen. Spec `S2.1_page-inventory.md` war
in Session 8 freigegeben, Entscheidungen E1-Hybrid+SEO · E2a · E3a · E4c getroffen.

### Durchgeführt (Architekten-Modus 4 Phasen)
1. **Pflicht-Init:** Nexus + Cortex-Web + Praxis-SESSION_RESUME gelesen.
   Dr. Stracke-Wahl: „ich überlasse dir die entscheidung" → Option A (S2.1) autonom gewählt.
2. **Pre-Flight:** `tools/validate.sh` ✅. Praxis `tools/verify.sh` ✅ (Exit 0, alle 4 Checks).
3. **Phase 1 Verständnis** im Chat kommuniziert: Zielzustand / Constraints / §8-Freigabe-Fragen geklärt.
4. **Phase 2:** Spec war schon freigegeben — keine neue Spec-Runde nötig.
5. **Phase 3 Umsetzung:**
   - Sitemap-Abgleich `westend-hausarzt.com/page-sitemap.xml` → URL-Liste + Architektur-Befund (keine Fachrichtungen auf Prod, Dr.-Stracke-Arzt-Profil einziges live Arzt-Profil).
   - `specs/sprint-2/page-inventory.md` mit 27 Zeilen × 9 Pflicht-Spalten geschrieben (8 Kern + 9 Fachrichtungen + 9 Ärzte + 1 Karriere, 10× P0 / 17× P1).
   - Ableitungs-Abschnitte für S2.2 (Template-Häufigkeit), S2.3 (Batch A–G), S2.4 (Menü), S2.5 (QA) mitgeliefert.
   - Offene Folgeentscheidung Nr. 6 neu hinzugefügt (Datenschutz-Dublette `/datenschutzerklaerung-2/` auf Prod).
   - arzt-7 mit Prod-URL Dr. Stracke vorgefüllt (Vermutungs-Flag, zu bestätigen in S2.3 Batch D).
6. **Phase 4 Selbstprüfung:** `evidence/2026-04-19_s2.1_self-check.md` mit 8/8 AKs grün.
7. **Commit:** Cortex-Web `d7f797d` — 6 Dateien, +200 Zeilen. Kein Push (b=1 aus Sprint 0).
8. **„Session beenden"-Workflow LL-042:**
   - Schritt 1: Projekt-Audit — clean tree, keine Backups, verify + validate grün. **Warnung:** `sites/praxis-webseite/SESSION_START.md` hat 5 Legacy-Pfad-Referenzen auf `projects/praxis-redesign/` aus Pre-Phase-4 (siehe §4 Offene Tasks P3 / §7 unten).
   - Schritt 2: Nexus-Audit — Cortex-Web in devices.json ✅; MEMORY.md + SYSTEM_MAP.md + CLAUDE.md hatten Session 8+9 + Version 2.7.6 noch nicht aktualisiert.
   - Schritt 3: Pattern-Optimierung — neues Pattern `Nexus/_memory/patterns/page-inventory.md` angelegt (7-Schritte-Ablauf, Lessons S2.1-LL-1…5). Nexus-Architektur-Aktualisierung: SYSTEM_MAP Stand-Zeile, MEMORY.md Projekt-Zeile + Pattern-Katalog + Pfad-Referenz-Tabelle (neu: Seiten-Inventar-Eintrag, neu: Tutorial 10), CLAUDE.md Sessions 7+8+9 ergänzt.
   - Schritt 4: Tutorial-Update — `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/10-seiten-inventar-website-relaunch.md` angelegt (didaktisch für Dr. Stracke).
   - Schritt 5: diese Datei finalisiert.

### Verifiziert (AK-Tabelle aus Self-Check)
| AK | Status | Evidenz |
|---|:---:|---|
| AK-1 | ✅ | page-inventory.md existiert (9826 B) |
| AK-2 | ✅ | 27 Zeilen in Inventar-Tabellen-Scope |
| AK-3 | ✅ | Alle §2.6-Pflicht-Seiten inventarisiert |
| AK-4 | ✅ | Keine leeren Pflichtspalten |
| AK-5 | ✅ | Theme-Repo unverändert |
| AK-6 | ✅ | verify.sh Exit 0 |
| AK-7 | ✅ | Home/Impressum/Datenschutz/Kontakt/404 alle P0 |
| AK-8 | ✅ | 6 offene Folgeentscheidungen + arzt-7/8 TBD-Flag dokumentiert |

**Score: 8/8 = 100 %**

### Lessons Learned (S2.1-LL-1…5 — ins Pattern übernommen)
- **S2.1-LL-1:** Sitemap (`page-sitemap.xml`) als Pre-Check statt Content-Crawl — Architektur-Diagnose ohne Scope-Verletzung.
- **S2.1-LL-2:** Spec-Zähl-Mehrdeutigkeiten (Team vs. Ärzte-Übersicht) explizit auflösen und im Self-Check begründen.
- **S2.1-LL-3:** TBD-Zeilen dürfen Vermutungs-Vorbefüllungen aus Sitemap-Analyse bekommen — aber nur mit explizitem Vermutungs-Flag.
- **S2.1-LL-4:** Ableitungs-Abschnitte im Inventar-File sparen dem Folge-Sprint die Phase-1-Arbeit.
- **S2.1-LL-5:** Architektur-Diskrepanzen gehören auf die betroffene Inventar-Zeile, nicht nur in die Spec.

---

## §3b Letzte Session — Session 7, 2026-04-19

### Ziel
Phase 5 (Juvantis-Web-Subsumierung) deterministisch ausführen — `Juvantis/juvantis-web/{shopify-sync.sh, shopify_export, knowledge-graph}` →
`Cortex-Web/sites/juvantis-webseite/` mit External-Repo-Pointer für den
Shopify-Theme-Klon, ohne Eingriff in Theme-Repo oder Live-Site.

### Durchgeführt (Architekten-Modus 4 Phasen)

1. **Pflicht-Init geladen.** Pre-Flight `validate.sh` grün vor Beginn.
2. **Phase 1 (Verständnis):** Pre-Audit. Kern-Befund: Source `juvantis-web/`
   ist KEIN Git-Repo (anders als Phase 4), Unter-Repo `theme/` hat 217 Commits
   mit GitHub-Remote und Shopify-GitHub-Auto-Sync. `git subtree add` wäre
   falsches Tool.
3. **Phase 2 (Lösungsdesign):** Vier Entscheidungspunkte E1/E2/E3/E4 mit je
   2–3 Optionen, Trade-off-Tabelle, Architekten-Empfehlung. Spec in
   `specs/phase-5/SUBSUMPTION.md` mit 12 AKs + 5 Risiken + 7 Out-of-Scope.
4. **Dr.-Stracke-Wahl:** „Ich folge deiner Entscheidung" → **E1a + E2a + E3a + E4a**.
5. **Phase 3 (Umsetzung) T1–T8** in dieser Reihenfolge:
   - T1 Spec committed (`799d674`)
   - T2 Transfer shopify-sync.sh (THEME_DIR auf `$HOME`-absolut umgestellt),
     shopify_export/, knowledge-graph/ (`2d67a06`)
   - T3 `SHOPIFY_THEME_POINTER.md` mit Remote-Feldern + Auto-Sync-Doku (`2b0d1ba`)
   - T4 `README.md` + `SESSION_RESUME.md` für Sub-Site (`304859e`)
   - T5 Pfad-Referenz-Updates Nexus + Cortex-Web (`cad5a70` + Nexus-Commit `a99491f`)
   - T6 Juvantis-Projekt-Doku angepasst (nicht Git-getrackt)
   - T7 Post-Subsumption Pre-Flight: `validate.sh` + `CHECK_SHOPIFY` grün,
     Theme-HEAD `1fbc35b` stabil, `juvantis-web/` enthält nur `theme/`
   - T8 Self-Check `specs/phase-5/evidence/2026-04-19_self-check.md` (`cb04976`)
6. **Phase 4 (Selbstprüfung):** AK-Tabelle 12/12 grün nach T9-Finalisierung,
   5 Lessons Learned (PH5-LL-1…5).
7. **„Session beenden"-Workflow LL-042:**
   - Schritt 1: Projekt-Audit grün (clean tree, keine Backups, keine TODOs)
   - Schritt 2: Nexus-Audit grün (CLAUDE/MEMORY/SYSTEM_MAP aktualisiert)
   - Schritt 3: Pattern-Optimierung — `cross-repo-subsumption.md` erweitert
     um **Variante B (Container ohne Git + Remote-Pointer)** mit Entscheidungs-
     Matrix und Remote-Pointer-Struktur
   - Schritt 4: Tutorial-Update — `Tutorial 08` um §7 Variante B mit den
     5 PH5-Lessons und Flowchart Variante-A-vs-B erweitert
   - Schritt 5: Diese Datei finalisiert + CHANGELOG v0.6.0

### Verifiziert (AK-Tabelle aus Self-Check)

| AK | Status | Evidenz |
|---|:---:|---|
| AK-1 | ✅ | 6 Einträge in `sites/juvantis-webseite/` |
| AK-2 | ✅ | `THEME_DIR="$HOME/Cortex/projects/Juvantis/juvantis-web/theme"` |
| AK-3 | ✅ | 21 grep-Treffer für HEAD+Remote+Branch+Store+Theme-ID in POINTER |
| AK-4 | ✅ | `Juvantis/juvantis-web/` = `theme` (nur 1 Eintrag) |
| AK-5 | ✅ | Theme-HEAD `1fbc35b313f52beb...`, status clean |
| AK-6 | ✅ | validate.sh + CHECK_SHOPIFY beide Exit 0 |
| AK-7 | ✅ | Nexus-Refs alle auf Theme-Klon-Pfad oder narrativ korrekt |
| AK-8 | ✅ | Juvantis-Doku 3 Dateien aktualisiert |
| AK-9 | ✅ | Cortex-Web-Doku Phase 5 ✅ durchgezogen |
| AK-10 | ✅ | CHANGELOG v0.6.0 geschrieben |
| AK-11 | ✅ | Self-Check-Datei vorhanden |
| AK-12 | ✅ | `git status --short` clean nach T9-Commit |

**Score: 12/12 = 100 %**

### Lessons Learned (PH5-LL-1…5)

- **PH5-LL-1:** Subtree-Pattern skaliert nicht bei Remote-Repos mit Auto-Sync
  (uniforme Auto-Sync-Commit-Messages → Log-Rauschen). Regel: eindeutige
  Commit-Messages zählen vor subtree-Entscheidung.
- **PH5-LL-2:** Container ohne Git ist Normalfall bei Multi-Repo-Containern
  — einfacher `mv` + `commit` reicht, kein Subtree nötig.
- **PH5-LL-3:** External-Repo-Pointer braucht Remote-Felder (URL, Branch,
  Store-ID, Auto-Sync-Charakter) wenn Remote aktiv ist.
- **PH5-LL-4:** Skript-Transfer prüft VORHER relative Pfad-Annahmen
  (`$(dirname "$0")`, `$BASH_SOURCE`) und stellt auf absolut via `$HOME` um.
- **PH5-LL-5:** `.claude/settings.local.json`-Hooks sind deviceabhängig,
  nie eigenmächtig refactorn.

---

## §4 Offene Tasks (Priorität absteigend)

### P0 ✅ ABGESCHLOSSEN Session 19 (2026-04-22): S2.4 Menü-Restrukturierung

**Ergebnis:** Top-Menü kuratiert (7 Items + Submenu `Check-Ups ▼` mit 5
Kindern), Mobile-Burger + Off-Canvas-Drawer mit Accordion, Active-State-
Markierung. Stub-Page `/fachrichtungen/`. `/aerzte/` vorerst aus Menü
(kommt mit Cluster zurück). PXZ_VERSION 2.7.16. 12/12 AK.

**Regel bleibt gültig:** Nach jedem abgeschlossenen Inhalts-Cluster wächst
das Menü mit (Direktive „Menü wächst mit Content"). Gilt für `aerzte`,
`services`, `diagnostik`, `legacy/de` etc.

### P0 — nächste Fronten (Session 20 Kandidaten, absteigend)

**P0a — Cluster `aerzte` (2 P0-Pages + Menü-Re-Insert `/aerzte/`)**
- Pfad: `sites/praxis-webseite/`, neue Spec `specs/sprint-2/S2.3-C-aerzte.md`.
- Archive-Referenzen `_content-archive/aerzte/de/` (2 Pages).
- Nach Abschluss: `/aerzte/` zurück ins Menü (Edit `inc/nav-data.php`) +
  optional Submenu `Ärzte ▼` wenn Einzel-Arztprofile mitkommen.
- Architekten-Tendenz Session 20.

**P0b — S2.4b Footer-Umbau**
- Eigener `footer.php` im Child-Theme.
- Kuratiertes Footer-Menü: `Impressum · Datenschutz · Karriere · Kontakt · Sitemap`.
- Blocksy-Default-`wp_list_pages` ausblenden/ersetzen.
- Optional kombinierbar mit Notfall-Hinweis-Block („116 117 / 112").
- Einzige verbleibende Nav-Baustelle.

### P1 — Design-Feintuning S2.4-Menü (Dr.-Stracke-Wunsch Session-19-Ende)

**Zitat Dr. Stracke (2026-04-22, nach S2.4-Abschluss):** *„Das Design müssen wir anpassen, machen wir aber beim Feintuning."*

- Visuelle Überarbeitung Submenu-Styling, Active-State-Optik, Drawer-Ästhetik, Mobile-Anmutung.
- Kurze Mini-Spec + Screenshot-Review.
- Kann jederzeit in Session 20+ adressiert werden, ggf. als eigener Mini-Sprint `S2.4-fine`.
- **Nicht blockierend** — Menü funktioniert voll, nur Optik ist offen.

### P0 — Praxis-Sprint 2: Full-Content-Migration (Dr.-Stracke-Direktive 2026-04-20)

### P0 — Praxis-Sprint 2: Full-Content-Migration (Dr.-Stracke-Direktive 2026-04-20)

**Leitlinie:** Jede Information der alten Prod-Seite muss auf der neuen Seite ankommen. Erst **Content** vollständig, dann **Menü** kuratieren, dann **Bilder**, dann **Design-Feinschliff** punktuell. Die ursprüngliche S2.1-Inventar-Liste (27 Kern-Seiten) ist **Teilmenge**, nicht Scope-Grenze.

**P0a — S2.3-D Content-Kuration pro Page (Hauptlinie, Mehr-Sessions)**
- Pfad: `sites/praxis-webseite/`, neue Spec `specs/sprint-2/S2.3-D_content-curation.md` im Architekten-Modus.
- Inventar aller **178 publish-Pages** (SQL-Query vorbereitet aus Session 14). Pro Page: Encoding-Fix, Content-Review, ggf. Template-Upgrade (default → template-standard / -fachrichtung / -arzt).
- Mojibake-Fix via SQL-Batch-Replace (`â€ž` → `„`, `â€"` → `"`, `Ã¤` → `ä`, …) als eigene Task vor Content-Kuration.
- Sub-Batches sinnvoll gruppieren: Check-Ups (9 Seiten), Service-Pages (17), Einzel-Ärzte (8), Diagnostik-Pages (14), Rest.

**P0b — S2.4 Menü-Restrukturierung (nach Content-Pass)**
- Aktuelle `pxz_homepage_content()['nav']` ist Minimal-Fallback.
- Neue Top-Level-Struktur aus S2.1 Inventar + Dr.-Stracke-Direktive: Home · Praxis · **Fachrichtungen** (Submenu) · **Ärzte** (Submenu) · Sprechstunden · Kontakt · Karriere. Submenus für Check-Ups, Services.
- `wp_list_pages`-Fallback-Menü auf Tablet/Mobile durch kuratiertes WP-Menu ersetzen.

**P0c — S2.3-C Fachrichtungen-Landing + Ärzte-Übersicht (2 P0-Seiten aus S2.1)**
- Pfad: `sites/praxis-webseite/`, neue Spec `specs/sprint-2/S2.3-C_fachrichtungen-aerzte.md` im Architekten-Modus.
- Fachrichtungen-Landing nutzt `template-fachrichtung-landing.php` (S2.2-Skelett) — Grid über 8 Einzelfachrichtungen.
- Ärzte-Übersicht nutzt `template-team.php` — aber Vorsicht: /team/ wurde in S2.3-B bereits auf `template-team.php` gepivoted. Entscheidung nötig: Ärzte-Übersicht (Zeile #18) separat oder in /team/ integriert?
- WPML-Translations-Einträge pro neuer Page (Pattern `wpml-translations-direct-sql.md`).

**P0b — S2.3-G Sprechstunden + Kontakt (2 P0-Seiten)**
- Sprechstunden: `template-sprechstunden.php`, offene Entscheidung Doctolib-Einbettung (Nr. 3).
- Kontakt: `template-kontakt.php`, Adresse + Kontakt-Formular.

**P0c — S2.0d Mini (optional)**
- `kar` → `karriere` Rename in `karriere.css` und `template-karriere.php` (sprechende Slugs, S2.2-LL-4).
- Semantic-Token `--pxz-space-card-padding-sm` nachziehen, `.pxz-card` in `components.css` umstellen.
- Legacy-Alias-Abbau in `tokens.css` (DESIGN_GUIDELINES §2.1) — optional.

**P0d — S2.3-A Datenschutz + Impressum — blockiert**
- **Vorbedingung:** Rechtssicherheits-Quelle wählen (Anwalt / e-recht24 / Prod-Text). Ohne Dr.-Stracke-Entscheidung bleibt Batch A blockiert.

**P0e — Santapress-Plugin-Archiv auflösen (fällig ab 2026-05-19)**
- `sites/praxis-webseite/_archive/santapress-2026-04-19/` hat Verfallsdatum 2026-05-19 (30 Tage). Dann eigene Kurz-Session zur Entscheidung: gelöscht oder reaktiviert.

**Offen aus S2.3-B (nicht blockierend):**
- 5 Plugin-Phantom-Templates (`alter-front-page-template.php` etc.) aus `theme-freesia-demo-import` erscheinen im Admin-Template-Dropdown. Aufräumen optional.
- `SESSION_START.md` hat 5 Legacy-Pfad-Referenzen auf `projects/praxis-redesign/`. Zu 1-Zeilen-Pointer auf SESSION_RESUME.md reduzieren ODER löschen (Dr. Stracke-Entscheidung).
- Team-Page-Arzt-Intros (6 Ärzte): Aktuell "Vorstellung folgt in Kürze. Schwerpunkt Innere Medizin." Echte Vorstellungs-Texte + Fotos folgen in Batch D.
- 404-Slug `/diese-seite-gibt-es-nicht-s23b-probe/` in `tools/page-registry.mjs` war arbitrary; umbenennen in neutralen Probe-Namen zur Session-C hin.

**P0b — S2.0d Mini (optional, vor oder nach S2.3)**
- `kar` → `karriere` Rename in `karriere.css` und `template-karriere.php`. Vereinheitlichung mit sprechenden Slugs (S2.2-LL-4). MD5-Null-Delta-Beweis erforderlich.
- Semantic-Token `--pxz-space-card-padding-sm` nachziehen, `.pxz-card` in `components.css` umstellen (löst AK-2-Ausnahme auf).
- Legacy-Alias-Abbau in `tokens.css` (DESIGN_GUIDELINES §2.1) — optional.

**P0c — S2.3 Batch A (Datenschutz + Impressum) — blockiert**
- **Vorbedingung:** Rechtssicherheits-Quelle wählen (Anwalt / e-recht24 / Prod-Text). Ohne Dr.-Stracke-Entscheidung bleibt Batch A blockiert.

**P0d — Santapress-Plugin-Archiv auflösen (fällig ab 2026-05-19)**
- `sites/praxis-webseite/_archive/santapress-2026-04-19/` hat Verfallsdatum 2026-05-19 (30 Tage). Dann eigene Kurz-Session (~5 min) zur Entscheidung: gelöscht (wenn nichts aufgefallen) oder reaktiviert (wenn Funktion vermisst wurde). Nicht sinnvoll vor diesem Datum.

### P1 — Juvantis-Web-Trunk-Content-Ausbau (mittelfristig)
Weitere YAML-Produktquellen in `trunk/content/products/` (Body Checks,
Bluttests, DHT). Jedes Produkt via `adapters/shopify/` als Draft rendern,
Admin-Freigabe. Nicht blockiert.

### P2 — Phase 2b Medien-Pipeline (verschoben)
Medien-Trunk + Shopify-Files-Upload + `_media-source/`-Registry.
Kandidat parallel zu Praxis-Sprint 2.

### P3 — Nachschärfungen Strukturhygiene
- **Sprint 2b anvisieren:** 172 Legacy-Prod-Seiten (Posts, Aktionen, mehrsprachige Dubletten inkl. `/datenschutzerklaerung-2/`) nach Go-Live.
- **Offener struktureller Punkt für Dr. Stracke:** `sites/praxis-webseite/SESSION_START.md` hat 5 Legacy-Pfad-Referenzen auf `projects/praxis-redesign/` (vor Phase 4). Inhalt redundant mit SESSION_RESUME.md. Vorschlag analog zur NEXT_SESSION_PROMPT-Regel in `Nexus/_rules/SESSION_LIFECYCLE.md` §3: zu 1-Zeilen-Pointer auf SESSION_RESUME.md reduzieren ODER löschen. **Keine eigenmächtige Durchführung** — entscheidet Dr. Stracke in der nächsten Session.
- **Verify.sh Pre-Flight-Erweiterung:** WP-CLI-Probe `wp eval 'print_r( wp_get_theme()->get_page_templates() );'` als Whitelist-Check ergänzen, damit PXZ-E-009-artige Phantom-Templates automatisch entdeckt werden. Kandidat für S2.0b oder eigene Mini-Session.
- **5 Phantom-Templates aus Plugins** (`alter-front-page-template.php`, `two-column-blog-template.php`, `our-team-template.php`, `about-us-template.php`, `portfolio-template.php`) erscheinen im WP-Admin-Dropdown — nicht aus unserem Theme, vermutlich aus `theme-freesia-demo-import`. Aufräumen optional, eigener Mini-Sprint.

### P1 — Juvantis-Web-Trunk-Content-Ausbau (mittelfristig)
Weitere YAML-Produktquellen in `trunk/content/products/` (Body Checks,
Bluttests, DHT). Jedes Produkt via `adapters/shopify/` als Draft rendern,
Admin-Freigabe. Nicht blockiert.

### P2 — Phase 2b Medien-Pipeline (verschoben)
Medien-Trunk + Shopify-Files-Upload + `_media-source/`-Registry.
Kandidat parallel zu Praxis-Sprint 2.

### P3 — Nachschärfungen aus Phase 5 (klein)
- Tutorial 08 evtl. Flowchart-Diagramm als SVG (statt ASCII)
- `SESSION_RESUME.md` in Juvantis-Sub-Site bei nächstem aktiven Theme-Commit um HEAD aktualisieren

### Parallel laufende Arbeiten (NICHT in Cortex-Web-Sessions berührt)
- `Juvantis/DHT`, `Juvantis/social-media`, `Juvantis/_docs` — bleiben dauerhaft
  unter `projects/Juvantis/`
- `telegram-bridge` — unabhängig
- Shopify-Theme-Klon bei `Juvantis/juvantis-web/theme/` — wird im Juvantis-
  Workstream weiter gepflegt, nicht in Cortex-Web-Sessions

---

## §5 Phasen-spezifische Pflicht-Lesung (Repeat aus §0)

### Für Praxis-Sprint-Arbeit
Items 10–13 aus §0 oben.

### Für Juvantis-Web-Arbeit
Items 14–16 aus §0 oben.

---

## §6 Sofort-Status-Frage für nächste Session (Session 20)

> **„Praxis-Sprint 2 / S2.4 Menü-Restrukturierung ist ✅ abgeschlossen. Kuratiertes Top-Menü mit 7 Items (Praxis · Team · Fachrichtungen · Check-Ups ▼ · Sprechstunden · Kontakt · Karriere) + 5-Kinder-Submenu `Check-Ups ▼`. Mobile-Burger + Off-Canvas-Drawer mit `<details>`-Accordion (Progressive Enhancement). Active-State `.is-active` + `.is-active-parent` + `aria-current="page"`. `/aerzte/` bewusst aus Menü entfernt (kommt mit Cluster `aerzte` zurück), `/kontakt/` → direkt `/contact-us/` (kein 301), `/fachrichtungen/` Stub-Page angelegt (ID 9674). Brand-Switch `/team/` → Sanexio-Logo weiterhin funktional. Home-Hero visuell unverändert (Template + Daten unberührt). PXZ_VERSION 2.7.16. Theme-Commit `e2336e2`. Cortex-Web-Commits `758aba1` (Spec) + `80e4f11` (Migration+Evidence+Pointer). 12/12 AK grün. 3 neue Patterns + Tutorial 20.
>
> **Dr.-Stracke-Kommentar zum Abschluss:** *„Das Design müssen wir anpassen, machen wir aber beim Feintuning."* → Design-Feintuning Menü ist offener Arbeitspunkt, nicht blockierend.
>
> Welche Front?"**
>
> **A (Architekten-Tendenz).** **Cluster `aerzte`** (2 P0-Pages) — schließt direkt den entfernten `/aerzte/`-Menüpunkt wieder ein (Direktive „Menü wächst mit Content"). Archive-Referenzen unter `_content-archive/aerzte/de/`. Nach Abschluss: `/aerzte/` zurück ins Menü + Submenu `Ärzte ▼` optional (wenn Einzel-Profile mitkommen).
>
> **B.** **S2.4b Footer-Umbau** — Blocksy-Default-`wp_list_pages` ersetzen durch kuratiertes Footer-Menü (`Impressum · Datenschutz · Karriere · Kontakt · Sitemap`). Bewusst in S2.4 out-of-scope gehalten. Einzige offene Nav-Baustelle.
>
> **C.** **S2.4 Design-Feintuning** (Dr.-Stracke-Kommentar Session-19-Ende) — Visuell-stilistische Überarbeitung des neuen Menüs: Submenu-Styling, Active-State-Optik, Drawer-Ästhetik, Mobile-Anmutung. Kurze Mini-Spec + Screenshot-Review.
>
> **D.** **Cluster `services`** (4 P1-Pages) — sekundärer Patienten-Kontext.
>
> **E.** **Cluster `diagnostik`** (10 P1-Pages) — größerer Scope (~2 Sessions).
>
> **F.** **Cluster `legacy/de`** (23) — Triage (publizieren / löschen / redirecten).
>
> **G.** **Notfall-Hinweise im Footer** (kombinierbar mit B) — Theme-weiter Umbau mit „116 117 / 112 / Bereitschaftsdienst"-Block.
>
> **H.** **S2.3-A Datenschutz + Impressum** — **blockiert** durch Rechtsquelle.
>
> **I.** **Strukturhygiene** — SESSION_START.md-Legacy-Pfade, 5 Plugin-Phantom-Templates, AK-11 smoke-http-URL-Liste erweitern.
>
> **J.** **Andere konkrete Änderung** — Sie nennen."

Keine Code-Änderung vor Ihrer Wahl. Architekten-Tendenz: **A (Cluster `aerzte`)** — schließt kleinsten offenen Menü-Kreis (`/aerzte/` zurück in Nav) und nutzt Cluster-Content-Momentum. Alternativ **C (Design-Feintuning Menü)** als Vorzug, wenn Dr. Stracke das neue Menü gleich in die finale Optik bringen möchte — Single-Session-Kandidat, ohne Content-Pflicht.

---

## §6-legacy-session19 (historisch, war §6 nach Session 18 vor Umsetzung S2.4)

> **„Praxis-Sprint 2 / S2.3-checkups (Cluster `checkups` Content-Migration + Bridge zu Juvantis) ist ✅ abgeschlossen.
> 6 Pages live auf Local-WP: Hub `/check-ups/` mit Card-Grid (NEU `template-checkup-hub.php`), 4 Detail-Pages auf `template-standard.php` mit Hero-Image und modernisiertem Content, Bridge `/basic-check/` (NEU `template-bridge-product.php`) wird vom WP-Adapter aus `trunk/content/products/bluttests/basic-check.yaml` (views.praxis) gerendert — **CW-001 Roundtrip-Beweis erneuert**, Common-Trunk-Bridge Praxis ↔ Juvantis erstmals produktiv. Cross-Brand-CTA-Helper (`pxz_cross_brand_cta`, registry-basiert, wiederverwendbar) angelegt. PXZ_VERSION 2.7.14 → 2.7.15. Theme-Commit `c7acaf7`. Cortex-Web-Commits `606676f`+`ebe9acf`. 12/12 AK grün. Home + Karriere unverändert (CSS-Audit + 0 neue Klassen).
>
> **NEUE PRIORITÄT (Dr.-Stracke-Direktive 2026-04-22 Session-18-Ende): S2.4 Menü-Restrukturierung VOR weiteren Content-Clustern.** Sobald ein Cluster fertig migriert ist, soll das Menü mitwachsen — sonst sind Inhalte vorhanden, aber für den Patienten unauffindbar (aktuelles `wp_list_pages`-Fallback ist chaotisch). Welche Front?"**
>
> **A (Architekten-Tendenz, Dr.-Stracke-Direktive).** **S2.4 Menü-Restrukturierung** — Neue Spec `specs/sprint-2/S2.4_menu-restructure.md`. Zielstruktur: Praxis · Team · Fachrichtungen ▼ · Ärzte ▼ · Check-Ups ▼ (Submenu mit den 6 S2.3-checkups-Pages) · Sprechstunden · Kontakt · Karriere. Tablet-/Mobile-Burger. WP-Menu-API oder optional Trunk-Konzept `nav.yaml`. Sichtbarer Nutzen sofort: alle bisherigen Inhalte (kern + checkups) werden entdeckbar.
>
> **B.** **Cluster `aerzte`** (2 P0-Pages) — schließt toten Link `/team/` → `/aerzte/`, baut Substanz für das spätere Submenu „Ärzte". Dr.-Stracke-Direktive sagt: erst nach S2.4.
>
> **C.** **Cluster `services`** (4 P1) — sekundärer Patienten-Kontext.
>
> **D.** **Cluster `diagnostik`** (10 P1) — medizinische Angebotsseiten, größerer Scope (~2 Sessions).
>
> **E.** **Cluster `legacy/de`** (23) — Triage (publizieren / löschen / redirecten).
>
> **F.** **Notfall-Hinweise im Footer** — Theme-weiter Footer-Umbau mit „116 117 / 112 / Bereitschaftsdienst"-Block.
>
> **G.** **S2.3-A Datenschutz + Impressum** — **blockiert** durch Rechtsquelle.
>
> **H.** **Strukturhygiene** — SESSION_START.md-Legacy-Pfade, 5 Plugin-Phantom-Templates, draft-Page `s2-0b-probe-9670` löschen, AK-11 smoke-http-URL-Liste erweitern.
>
> **I.** **Andere konkrete Änderung** — Sie nennen."

Keine Code-Änderung vor Ihrer Wahl. Architekten-Tendenz: **A (S2.4 Menü)** — exakt nach Ihrer Direktive vom 2026-04-22 Session-18-Ende. Sichtbarer Patienten-Nutzen sofort.

---

## §6-legacy-session18 (historisch, vor S2.4-Direktive)

> **„Praxis-Sprint 2 / S2.3-kern (Cluster `kern` Content-Migration) ist ✅
> abgeschlossen. Vier Pages live: Karriere MD5-MATCH (keine Änderung),
> Kontakt `/contact-us/` auf neues Template + Google-Maps + Parkplatz-Hinweise,
> Sprechstunden `/sprechstunden/` NEU mit Sprechzeiten + Doctolib-CTA +
> editierbarem „Aktuelles"-Block (WP-Option), Home Refactor mit
> `inc/practice-data.php` als Single-Source-of-Truth und MD5-Null-Delta
> bewiesen. PXZ_VERSION 2.7.14, Theme-Commits `70d1b29`+`15cf331`+`058b062`,
> Cortex-Web-Commit `2000c03`. 12/13 AK grün, 1 partial (AK-11 smoke-http-
> URL-Liste zu erweitern). 3 neue Patterns (`practice-data-ssot`,
> `md5-null-delta-version-normalization`, `wp-page-insert-settings-api`) +
> Tutorial 18 (WordPress & CSS). Praxis+Team aus S2.3-B unverändert;
> Datenschutz+Impressum bleiben blockiert. Welche Front?"**
>
> **A (Architekten-Tendenz).** **Cluster `checkups`** — 6 P0-Pages mit
> Bridge-Potenzial zu Juvantis (alle haben `cross_site_potential =
> basic-check` o. ä.). Hier wird der Common-Trunk-Gedanke (Praxis ↔ Sanexio)
> zum ersten Mal produktiv. Archive-Referenzen unter `_content-archive/checkups/de/`.
>
> **B.** **Cluster `aerzte`** — 2 P0-Pages für die Arzt-Übersicht/-Profile.
> Löst den toten Link aus `/team/` auf `/aerzte/`.
>
> **C.** **Cluster `services`** — 4 P1-Pages, sekundärer Patienten-Kontext.
>
> **D.** **Cluster `diagnostik`** — 10 P1-Pages, medizinische Angebotsseiten.
>
> **E.** **Cluster `legacy/de`** — 23 Seiten, Triage (publizieren / löschen /
> redirecten). Aufräum-Session.
>
> **F.** **Notfall-Hinweise im Footer** (Dr.-Stracke Q9 aus Session 17) —
> Theme-weiter Footer-Umbau mit „116 117 / 112 / Bereitschaftsdienst"-Block.
> Gilt für alle Pages, kein Cluster-spezifisch.
>
> **G.** **S2.4 Menü-Restrukturierung** — Neue Top-Nav mit Submenus
> (Fachrichtungen, Ärzte, Check-Ups, Sprechstunden, Kontakt) aus Inventar-Clustern.
> Sichtbarer Nutzen erst nach ≥ 2 Content-Clustern — jetzt 1 Cluster fertig.
>
> **H.** **Strukturhygiene** — SESSION_START.md-Legacy-Pfade, 5 Plugin-
> Phantom-Templates, draft-Page `s2-0b-probe-9670` löschen, Legacy-Home 249
> archivieren, AK-11 smoke-http-URL-Liste erweitern.
>
> **I.** **Folge-Aufgaben Kontakt/Sprechstunden durch Dr. Stracke erledigt?**
> (a) WPForms-Formular angelegt + Marker `pxz_kontakt_form_v1` gesetzt?
> (b) Google My Map mit 3 Markern angelegt + Share-Embed-URL? (c) Aktuelles-
> Inhalt befüllt? → Falls ja: 1–3 kleine Template-Updates + Go-Live-Check.
>
> **J.** **S2.3-A Datenschutz + Impressum** — **blockiert** (Rechtsquelle
> wählen: Anwalt / e-recht24 / Prod-Text). Sie nennen Entscheidung → starten.
>
> **K.** **Santapress-Archiv auflösen** — fällig ab 2026-05-19 (nicht jetzt).
>
> **L.** **Andere konkrete Änderung** — Sie nennen."

Keine Code-Änderung vor Ihrer Wahl. Architekten-Tendenz: **A (Cluster `checkups`)** —
strategischer Wert steigt sprunghaft, weil der Bridge-Pfad Praxis ↔ Juvantis
zum ersten Mal produktiv wird. Alternativ **B (Cluster `aerzte`)** — schließt
den letzten toten Link aus S2.3-B (`/aerzte/` aus `/team/`) und baut dem
Menü-Restrukturierung (Option G) Substanz. Beides sind Single-Session-
Kandidaten.

---

## §6-legacy-session17 (historisch, vor S2.3-kern)

> **„Praxis-Sprint 2 / S2.3-D Phase 2 (Content-Archive 189 Pages + 3-way
> MD5-Integritätskette) ist ✅ abgeschlossen. Alle 189 Pages liegen als
> Markdown-Dateien mit YAML-Front-Matter + RAW-HTML-Body 1:1 in `_content-archive/`
> (Git-tracked, thematisch nach Cluster/Sprache sortiert). Verifier bestätigt
> Body-File ↔ Front-Matter-`content_md5` ↔ DB-`MD5(post_content)` für 189/189.
> Idempotenz bewiesen (Lauf 2 = 0 writes). 12/12 AKs. 2 neue Patterns
> (`content-archive-pre-curation`, `yaml-front-matter-md5-contract`) + Tutorial 17.
> Theme unberührt (HEAD `ae9b1b8`, PXZ 2.7.13).
>
> **Content-Migration-Fundament ist 3-fach gesichert:** Mojibake sauber (P1),
> Inventar vollständig (P1), Original-Archive im Git (P2). Ab jetzt kann jede
> Kurations-Session Seite für Seite das Original nebendran haben, `git diff`
> zeigt jede nicht-übernommene Stelle. Welche Front?**
>
> **A (Architekten-Tendenz).** **Phase 3 / Cluster `kern`** — 5 kuratur-
> relevante Pages: `Karriere`, `Sprechstunden`, `Kontakt`, + Home-Aktualisierung.
> (Praxis, Team sind schon aus S2.3-B drin; Datenschutz + Impressum blockiert.)
> Größter sichtbarer Patienten-Hebel. Archive-Referenzen unter
> `_content-archive/kern/de/`.
>
> **B.** **Phase 3 / Cluster `checkups`** — 6 P0-Pages mit starkem
> Bridge-Potenzial (alle haben `cross_site_potential = basic-check` o. ä.).
> Hier wird der Common-Trunk-Gedanke (Praxis ↔ Sanexio) zum ersten Mal produktiv.
> Archive-Referenzen unter `_content-archive/checkups/de/`.
>
> **C.** **Phase 3 / Cluster `diagnostik` oder `services`** — 10 P1 oder 4 P1
> Pages, sekundärer Patienten-Kontext.
>
> **D.** **S2.4 Menü-Restrukturierung** — Neue Top-Nav mit Submenus
> (Fachrichtungen, Ärzte, Check-Ups) basierend auf Inventar-Clustern.
> Sichtbarer Nutzen erst nach ≥ 1 Content-Cluster.
>
> **E.** **Phase 2b Medien-Pipeline** — Bilder-Trunk aus Archive-`image_urls`-
> Listen aufbauen. Entlastet spätere Content-Sessions.
>
> **F.** **Juvantis-Trunk-Content-Ausbau** — weitere YAML-Produktquellen
> (Body Checks, Blood Tests, DHT). Kombiniert mit B als Bridge-Pfad-Paar.
>
> **G.** **S2.3-A Datenschutz + Impressum** — **blockiert** (Rechtsquelle
> wählen: Anwalt / e-recht24 / Prod-Text). Sie nennen Entscheidung → starten.
>
> **H.** **Strukturhygiene** — SESSION_START.md-Legacy-Pfade, 5 Plugin-
> Phantom-Templates, Team-Arzt-Intros + Fotos, draft-Page `s2-0b-probe-9670` löschen.
>
> **I.** **Santapress-Archiv auflösen** — fällig ab 2026-05-19 (nicht jetzt).
>
> **J.** **Andere konkrete Änderung** — Sie nennen."

Keine Code-Änderung vor Ihrer Wahl. Architekten-Tendenz: **A (Cluster `kern`)** —
größter sichtbarer Hebel (die Seiten, die Patienten am häufigsten ansteuern),
5 Single-Session-Kandidaten. Archive steht bereit (`_content-archive/kern/de/`),
Kuration kann mit Git-Diff-Sicherheit starten. Alternativ **B (Cluster `checkups`)**
— strategischer, weil Bridge-Pfad zu Juvantis direkt nutzbar wird.

---

## §6-legacy-session14 (historisch, vor S2.3-D Phase 1)

> **„Praxis-Sprint 2 / S2.3-B Content-Batch (Praxis + Team + 404) ist ✅
> abgeschlossen — inklusive 3 Revisions: SEO-Layer theme-eigen (AIOSEO auf
> überschriebenen Seiten unterdrückt), H1-Klassen auf `.pxz-title-2` reduziert
> (DG §18.1), Team pivotiert zu Ärzte-Grid mit 8 Doctors aus `pxz_team_members()`,
> 404-Rippenspreizer-SVG-Cartoon, Unified Site-Header per
> `template-parts/header-nav.php` + `nav.css` (Blocksy-Default hidden site-weit),
> URL-basierter Brand-Switch `/team/` → Sanexio-Logo + Wortmarke
> ‚Praxisgemeinschaft Sanexio', alle anderen Seiten → Praxiszentrum-Roundel + Text.
> PXZ_VERSION 2.7.8 → 2.7.12. Home MD5-Null-Delta 3/3 ✅ (auch der vorher als
> Bug bekannte home_tablet768-Delta ist weg). Karriere 3/3 DELTA — gewollt
> (Header-Konsistenz-Fix). smoke-seo.sh 21/21, verify.sh, smoke-http.sh alle grün.
> 4 neue Patterns, DG §18.1+§18.2+§18.3, Tutorial 15. Welche Front?**
>
> **A (NEU priorisiert per Dr.-Stracke-Direktive 2026-04-20).** **S2.3-D Content-Kuration** — Systematischer Pass durch alle 178 Pages. Phase 1 (Session 15): UTF-8-Mojibake-Fix via SQL-Batch-Replace + Page-Inventar mit Priorisierung (Check-Ups, Services, Ärzte). Phase 2–N (Folge-Sessions): Content-Review pro Cluster mit Template-Upgrade wo sinnvoll.
>
> A' **Menü-Restrukturierung (S2.4)** — Neue Top-Level-Nav mit Submenus für Fachrichtungen + Ärzte + Check-Ups. Kann parallel zu A laufen, aber beste Ergebnisse nach Phase 1 von A (Inventar + Priorisierung).
>
> B. **Praxis S2.3-C — Fachrichtungen-Landing + Ärzte-Übersicht** (2 P0-Seiten,
>    Card-Grid-Templates). Entscheidung nötig: Ärzte-Übersicht (Zeile #18)
>    separat von /team/ oder integriert? /team/ nutzt bereits `template-team.php`.
>
> B'. **Praxis S2.3-G — Sprechstunden + Kontakt** (2 P0-Seiten). Doctolib-
>    Einbettungs-Entscheidung nötig (Folgeentscheidung Nr. 3).
>
> C. **Praxis S2.0d Mini** — `kar`→`karriere`-Rename + Semantic-Token
>    `--pxz-space-card-padding-sm` nachziehen + Legacy-Alias-Audit in tokens.css.
>
> D. **Praxis S2.3-A — Datenschutz + Impressum** — **blockiert** durch
>    Rechtssicherheits-Quelle (Anwalt / e-recht24 / Prod).
>
> E. **Juvantis-Trunk-Content-Ausbau** oder **Phase 2b Medien-Pipeline**
>    (wenn Priorität weg von Praxis kippt).
>
> F. **Sprint 1 reanimieren** — SFTP-Credentials sind da. Staging-Setup
>    aktivierbar, Design-first-Direktive gilt noch.
>
> G. **Strukturhygiene:** SESSION_START.md-Legacy-Pfade bereinigen,
>    5 Plugin-Phantom-Templates aufräumen, oder Team-Arzt-Intros + Fotos
>    (Batch D vorziehen).
>
> H. **Andere konkrete Änderung** — Sie nennen."

Keine Code-Änderung vor Ihrer Wahl. Architekten-Tendenz: **A (S2.3-D Content-Kuration Phase 1)** — gemäß Dr.-Stracke-Direktive vom 2026-04-20 ist der komplette Content-Umzug vorrangig. Phase 1 = Inventar + Mojibake-Fix (1 Session), dann Content-Review in thematischen Sub-Batches.

---

## §6-legacy (historisch, vor S2.3-B)

> **„Praxis-Sprint 2 / S2.0f Santapress-Plugin-Entfernung ist ✅ abgeschlossen —
> Plugin aus Local-WP entfernt (26 → 25 active_plugins), Rewrite-Rules
> regeneriert (13085 → 10979 Bytes, Santapress-Routen raus), `wp_posts`-Count
> vor/nach identisch (2860, kein Content verloren, F7b-Paranoia-Check bestätigt).
> Plugin-Ordner archiviert in `_archive/santapress-2026-04-19/` mit Verfallsdatum
> 2026-05-19 (30 Tage Beobachtungsfenster). Neues Tool `tools/smoke-http.sh`
> (5 URLs × HTTP 200, 5xx-Fail-Regel). Theme unberührt (HEAD `8f596f7`,
> PXZ_VERSION 2.7.8). 6/6 AKs grün. Cortex-Web-Commits `e036328` (Spec) +
> `a6cc6f3` (Tool+Evidenz+Self-Check) + `ced4e0a` (.gitignore-Hygiene).
> Neues Pattern `wp-plugin-safe-removal.md`, Tutorial 14 angelegt. 5 Lessons
> S2.0f-LL-1…5. Welche Front?**
>
> A. **Praxis S2.3 Batch B — Praxis + Team + 404** (Hauptlinie, 3 P0-Seiten
>    mit Echt-Content, alle Vorbedingungen da: Skelette S2.2, Komponenten S2.0b,
>    Verify-Hardening S2.0e, Plugin-Interferenz entfernt S2.0f). Neue Spec
>    `specs/sprint-2/S2.3-B_praxis-team-404.md` im Architekten-Modus.
>
> B. **Praxis S2.3 Batch C — Fachrichtungen-Landing + Ärzte-Übersicht**
>    (2 P0-Seiten, Card-Grid-Templates).
>
> C. **Praxis S2.3 Batch G — Sprechstunden + Kontakt** (2 P0-Seiten, Doctolib-
>    Workaround).
>
> D. **Praxis S2.0d Mini** — `kar`→`karriere`-Rename + Semantic-Token
>    `--pxz-space-card-padding-sm` nachziehen + Legacy-Alias-Audit in tokens.css.
>
> E. **Praxis S2.3 Batch A — Datenschutz + Impressum** — **blockiert** durch
>    Rechtssicherheits-Quelle (Anwalt / e-recht24 / Prod). Ohne Ihre Entscheidung
>    nicht startbar.
>
> F. **Juvantis-Trunk-Content-Ausbau** oder **Phase 2b Medien-Pipeline**
>    (wenn Priorität weg von Praxis kippt).
>
> G. **Sprint 1 reanimieren** — SFTP-Credentials sind da (seit 2026-04-19).
>    Staging-Setup ist aktivierbar, aber Design-first-Direktive gilt noch.
>
> H. **Strukturhygiene-Aufräumblock:** `SESSION_START.md`-Legacy-Pfade bereinigen,
>    5 Plugin-Phantom-Templates aufräumen (aus SESSION_RESUME §4 P3).
>
> I. **Andere konkrete Änderung** — Sie nennen."

Keine Code-Änderung vor Ihrer Wahl. Architekten-Tendenz: **A (S2.3 Batch B)** —
alle Vorbedingungen stehen, Content-Momentum nutzen. Dieser Batch ist größer
(Mehr-Session-Kandidat) und sollte mit frischem Chat beginnen.

---

## §7 Verbote / harte Regeln — dürfen NIE passieren

### Allgemein (aus früheren Sessions, weiter gültig)
- **CW-001 Trunk-Master bleibt unbestritten** — Admin-Edits werden vom nächsten Adapter-Lauf zurückgesetzt
- **CW-005 Plattform-Trennung** — KEIN Preis, KEIN Kauf-CTA auf Praxis-Site (schema-erzwungen)
- **Keine Shopify-API-Credentials oder WP-Passwörter im Repo**
- **Kein `--force` bei Git** außer bei explizitem Dr.-Stracke-Go
- **Kein Admin-/Root-/Login-Passwort im Chat** — nur App-Passwords, API-Tokens
- **Kein Zurücklesen/Loggen des Shopify-Client-Secrets** oder `SHOPIFY_ADMIN_TOKEN`
- **Keine Scope-Erweiterung der Custom App ohne Go**
- **Kein Test-Produkt im Store löschen ohne Dr.-Stracke-Go** — `10940942844171` ist Phase-3-Artefakt
- **Kein Eingriff in Juvantis/juvantis-web Auto-Sync-Hook** (PostToolUse-Hook auf `theme/`)
- **Review-Pipeline-Änderungen NICHT eigenmächtig** — `tools/review/*` ist Phase-3-Artefakt

### Phase-4-spezifisch
- **Kein `git mv` quer zwischen `sites/praxis-webseite/`-Inhalten und Cortex-Web-Top-Level** ohne Spec
- **Kein Touch am `sites/praxis-webseite/THEME_POINTER.md`** außer bei Theme-Commit-Updates
- **Keine Pfad-Referenzen mehr auf `projects/praxis-redesign/`** in neuen Dokumenten

### Phase-5-spezifisch (neu seit 2026-04-19)
- **Kein Commit, kein Merge, kein Push in `Juvantis/juvantis-web/theme/`** aus
  einer Cortex-Web-Session heraus ohne explizites Dr.-Stracke-Go
- **Kein Eingriff in die Shopify-GitHub-Integration** (Branch-Weichen, Webhook)
- **Kein Push via `shopify-sync.sh`** ohne Go, wenn Store-Inhalte verändert werden
- **Kein Touch am `sites/juvantis-webseite/SHOPIFY_THEME_POINTER.md`** außer bei
  signifikanten Theme-Meilensteinen (kein Update bei Auto-Sync-Commits)
- **Kein `git mv` oder `mv`** zwischen `Juvantis/juvantis-web/theme/` und
  `sites/juvantis-webseite/` — die Trennung ist Phase-5-Entscheidung

---

## §8 Session-Historie

| Session | Datum | Phase | Ergebnis | Commits |
|---------|-------|:-----:|----------|---------|
| 19 | 2026-04-22 | 2/S2.4 | Menü-Restrukturierung ✅ · Top-Nav + Drawer + Submenu + Stub · 12/12 AK | Cortex-Web `758aba1` + `80e4f11`; Theme `e2336e2` |
| 1 | 2026-04-18 | 0 | Skelett + Regeln + Nexus ✅ | `6178d2f`, `d9577cd` |
| 2 | 2026-04-18 | 1 | POC WP-Adapter End-to-End ✅, Local-WP-Setup, Pattern + Tutorial | `778635c`, `19fd8ce` |
| 3 | 2026-04-18 | 2 (Setup) | Shopify Custom App + Admin-API-Token ✅, OAuth-Catcher, Tutorial 05 | `48c4170` |
| 4 | 2026-04-19 | 2 (Adapter) | POC Shopify-Adapter ✅ End-to-End, 12/12 AKs, Spec + Self-Check, Pattern + Tutorial 06 | `7d6f665`, `f52abc2` |
| 5 | 2026-04-19 | 3 (Review) | Review-Pipeline 12/12 AKs ✅, 6 Dimensionen automatisiert, Pattern + Tutorial 07 | `98d1f67`, `314a41c` |
| 6 | 2026-04-19 | 4 (Subsumierung Praxis) | Praxis-Subsumierung ✅ via `git subtree add` (E1a/E2b/E3a), 12/12 AKs, 5 Lessons, Pattern `cross-repo-subsumption.md` + Tutorial 08 | `c350b05`, `94e6e91`, `77adfc7`, `dd38922`, `61b5187`, `b7266ab`, `89de007`, `7515822` |
| **7** | **2026-04-19** | **5 (Subsumierung Juvantis)** | **Juvantis-Web-Docs-Subsumierung ✅ via `mv` + SHOPIFY_THEME_POINTER (E1a+E2a+E3a+E4a), 12/12 AKs, 5 Lessons PH5-LL-1…5, Pattern-Erweiterung Variante B + Tutorial 08 §7 erweitert, Theme-Klon unberührt** | **`799d674`, `2d67a06`, `2b0d1ba`, `304859e`, `cad5a70`, `cb04976` + T9-Session-Ende-Commits** |
| 8 | 2026-04-19 | Praxis-Sprint 2 / S2.0c | Design-System-Konsolidierung ✅ — `DESIGN_GUIDELINES.md` v3.0 + `tokens.css` v2 4-Schichten + Tutorial 09 + Cortex-DS-Artifact git-trackbar, 12/12 AKs, MD5-Null-Delta | Theme `c4f18ba`. Docs `560e3d6`, `0edab20`, `0642847`. Nexus `8054be7`. |
| 9 | 2026-04-19 | Praxis-Sprint 2 / S2.1 | Seiten-Inventar ✅ — `page-inventory.md` mit 27 Einträgen (10× P0, 17× P1), 9 Spalten, Sitemap-gestütztes Content-Audit, arzt-7 TBD-Vorbefüllung Dr. Stracke, Ableitungs-Abschnitte für S2.2–S2.5, 8/8 AKs grün. Neues Pattern + Tutorial 10. | Cortex-Web: `d7f797d` (Inventar+Self-Check+Shots). Nexus: Pattern `page-inventory.md` + Tutorial 10 + MEMORY/CLAUDE/SYSTEM_MAP aktualisiert (Auto-Sync-Commit). |
| 10 | 2026-04-19 | Praxis-Sprint 2 / S2.2 | Template-Typologie ✅ — 8 Skelett-Templates + 8 CSS + functions.php-Erweiterung, PXZ_VERSION 2.7.7, In-Session-Bug PXZ-E-009 gefixt, 12/12 AKs grün. | Theme: `6c02cb4`+`dd3e4e1`. Cortex-Web: `de4f580`+`5a2a247`. Nexus: Pattern `wp-skeleton-templates-bundle.md` + Tutorial 11. |
| **11** | **2026-04-19** | **Praxis-Sprint 2 / S2.0b** | **Komponenten-Bibliothek ✅ — Schicht 3 eingezogen per `components.css` (6 Blöcke: Container + Typografie + Buttons + Section + Card + Hero), globaler Enqueue zwischen `praxiszentrum` und page-CSS. PXZ_VERSION 2.7.8. Home MD5-Null-Delta verifiziert (3/3 MATCH). Karriere −9 px am `.wpforms-submit` (WCAG-Accessibility-Gewinn, dokumentiert). In-Session-Fix S2.0b-LL-1: Spezifitäts-Kollision mit `.pxz-home :where(p)`-Reset gefixt per page-scope Overrides. 10/12 AKs grün (AK-8 + AK-10 verschoben auf S2.0e). 5 Lessons Learned.** | Theme: **`08f40ff`** (feat components+enqueue+version+changelog) + **`8f596f7`** (refactor homepage-trim+specificity-fix). Cortex-Web: **`2056e3e`** (Spec) + **`df50333`** (Self-Check+Pointer+Evidence+12 Shots). Nexus: 2 neue Patterns `css-layer3-promotion.md` + `local-wp-mysql-socket.md` + Tutorial 12 + MEMORY/CLAUDE/SYSTEM_MAP. |
| **12** | **2026-04-19** | **Praxis-Sprint 2 / S2.0e** | **Verify-Hardening ✅ — `tools/verify.sh` um §1b `grep_split_css()` + §3b `component_probe()` (zweistufige Bash-Probe: 8 Datei-Assertions + 2 Enqueue-Checks) erweitert. Architektur-Pivot unter Umsetzung wegen WP-Rewrite-Rule-Grenze bei direkt-SQL-Page-Inserts (Santapress-Interaktion). Bash-Probe architektonisch sauberer (trennt Code-Korrektheit von Integrations-Korrektheit). Theme unberührt (HEAD `8f596f7`, PXZ_VERSION 2.7.8). S2.0b-Self-Check rückwirkend auf 12/12. 8/8 AKs. 5 Lessons S2.0e-LL-1…5. Dr.-Stracke-Freigabe: Santapress-Plugin darf entfernt werden.** | Cortex-Web: **`88290b0`** (Spec) + **`6352b1e`** (Tool+Self-Check+Nachtrag). Nexus: neues Pattern `verify-probe-code-vs-integration.md` + Erweiterung `local-wp-mysql-socket.md` §Grenze + Tutorial 13 + MEMORY/CLAUDE-Update. |
| **13** | **2026-04-19** | **Praxis-Sprint 2 / S2.0f** | **Santapress-Plugin-Entfernung ✅ — 5-Schritt-Protokoll (T1 Pre-Snapshot + T2 Dependency-Audit 0 externe Referenzen + T3 active_plugins-Update via mysqli-prepared + Archive-mv + T4 Rewrite-Rules-Regenerierung −2106 Bytes + T5 verify.sh + neues smoke-http.sh beide grün). `wp_posts`-Count identisch vor/nach (F7b: kein Content verloren). Archive in `_archive/santapress-2026-04-19/` (gitignored, Verfallsdatum 2026-05-19). Theme unberührt (HEAD `8f596f7`, PXZ_VERSION 2.7.8). 6/6 AKs. 5 Lessons S2.0f-LL-1…5.** | Cortex-Web: **`e036328`** (Spec) + **`a6cc6f3`** (Tool+Evidenz+Self-Check, 16 Files) + **`ced4e0a`** (.gitignore-Hygiene). Nexus: neues Pattern `wp-plugin-safe-removal.md` + Tutorial 14 + MEMORY/CLAUDE-Update. |
| **14** | **2026-04-19/20** | **Praxis-Sprint 2 / S2.3-B + 4 Revisions (inkl. Option A)** | **S2.3-B: 3 P0-Pages (`/praxis/`, `/team/`, 404) mit Echt-Content + SEO-Layer + Unified Header + Sanexio-Brand-Switch. S2.3-B-rev4 (Option A): Universal `page.php` + `wp_body_open`-Hook → **178/178 Pages** im branded Design (statt vorher 4/178 = 2,2 %). Dr.-Stracke-Scope-Korrektur: Full-Content-Migration ist Sprint-2-Hauptziel. PXZ_VERSION 2.7.8 → 2.7.13 (5 Bumps). 5 neue Patterns, DG §18.1+§18.2+§18.3, Tutorial 15.** | Theme: `74a9512` → `81d3f62` → `e2bb7b1` → `dd1de0f` → **`ae9b1b8`** (Option A). Cortex-Web: `68a0db1` → `9d503fc` → `41cf66e` → `81e98ff` → `ee76e1b` → `6ea13a2` (SESSION_RESUME Session 14). Nexus: Patterns `wpml-translations-direct-sql` + `wp-unified-site-header` + `wp-plugin-head-override` + `bash-sigpipe-grep-trap` + **`wp-universal-page-fallback`** (Option A) + Tutorial 15 + MEMORY/CLAUDE-Update. |
| **15** | **2026-04-20** | **Praxis-Sprint 2 / S2.3-D Phase 1** | **Vorbereitungs-Pass Full-Content-Migration ✅ — (1) Mojibake-Fix via PHP `mb_convert_encoding`-Paar auf 20/177 publish-Pages (Architekten-Pivot weg von statischer SQL-REPLACE-Kette nach Pre-Count-Befund "1/15 Muster getroffen"); Idempotenz bewiesen (Lauf 2 = 0 Changes), 0 Residuen, mysqldump-Rollback. (2) Trunk-ready Page-Inventar 189 Zeilen CSV (15 Spalten inkl. `trunk_candidate` + `cross_site_potential` + `image_count`) + MD mit Cluster-Summary. **Schlüssel-Erkenntnis: 134/189 = i18n-Dubletten → 55 deutsche kuratur-relevante Pages.** 13/13 AKs. 5 Lessons S2.3-D-LL-1…5. Theme unberührt (HEAD `ae9b1b8`, PXZ 2.7.13).** | Cortex-Web: **`f50110c`** (Spec) + **`2c6e881`** (Migration+Inventar+Evidenz+Self-Check, 8 Files inkl. mysqldump 1.5 MB) + **`6346b91`** (SESSION_RESUME). Nexus: 3 neue Patterns `wp-mojibake-mb-convert-fix.md` + `trunk-ready-page-inventory.md` + `mysql-utf8mb4-binary-rejection-proof.md` + Tutorial 16 + MEMORY-Update. |
| **16** | **2026-04-20** | **Praxis-Sprint 2 / S2.3-D Phase 2** | **Content-Archive-Sicherungs-Pass ✅ — 189 Pages (177 publish + 4 draft + 8 private) als Markdown-Dateien mit YAML-Front-Matter + RAW-HTML-Body 1:1 in `_content-archive/` (Git-tracked). 3-way MD5-Integritätskette (Body-File ↔ Front-Matter-Hash ↔ DB-Hash) — Verifier 189/189 grün. Idempotenz bewiesen (Lauf 2 = 0 writes, 189 skipped). Dr.-Stracke-Leitprinzip „richtig und ohne Informationsverlust" architektonisch umgesetzt: Scope=alle 189 Pages, DB unberührt, Theme unberührt, Rollback trivial (`rm -rf _content-archive/`). 12/12 AKs. 5 Lessons S2.3-D-P2-LL-1…5. 2 Pattern-Kandidaten (`content-archive-pre-curation`, `yaml-front-matter-md5-contract`).** | Cortex-Web: **`661a4cd`** (Spec Phase 2) + **`d5051eb`** (Skript + verify-md5 + Archive 189 Files + README + CSV-Update + Self-Check, 194 Files, +14685/-190). Nexus-Pattern+Tutorial-Updates folgen im „Session beenden"-Workflow. |

---

*Stand: 2026-04-20, Ende Session 16 (final — S2.3-D Phase 2 ✅). Content-Migration-Fundament dreifach gesichert (Mojibake sauber, Inventar vollständig, Original-Archive im Git). Nächste Session: per „Projekt fortsetzen Cortex-Web" (LL-043) → Architekten-Tendenz: **Phase 3 Cluster-Kuration `kern`** (5 kuratur-relevante Pages, Datenschutz+Impressum blockiert bis Rechtsquelle) oder **Phase 3 Cluster `checkups`** (6 P0 mit Bridge-Potenzial zu Juvantis).*
