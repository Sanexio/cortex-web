# Cold Archive — Cortex-Web Sessions S31-S55

> Ausgelagert aus `SESSION_RESUME.md` am 2026-05-13 im Rahmen von
> Cortex Lean v3 L2. Diese Datei enthaelt den bisherigen Hot-Layer mit
> Detail-Chronik, Index und historischen Session-Bloecken.

---

# Original SESSION_RESUME — Cortex-Web

> **Standard-Einstieg** (Phoenix seit 2026-05-12):
> In einer neuen Session **„Projekt fortsetzen Cortex-Web"** tippen. Claude lädt:
>
> 1. Pflicht-Init Nexus (CLAUDE.md, AUTONOMY_CONTRACT.md, AI_COOPERATION.md, MULTI_AI_BOUNDARIES.md, _memory/USER.md)
> 2. Diese Datei (SESSION_RESUME.md)
> 3. Alle in §0 unten als Pflicht-Lesung markierten Folgedateien
> 4. Pre-Flight (`tools/validate.sh`, optional `CHECK_SHOPIFY=1`, optional `tools/review.sh`)
> 5. Status-Statement im Architekten-Stil → wartet auf Wahl der Front

---

## §0 ROADMAP — Holistische Prio-Leiter (CW-PRIO-001, seit Session 31)

> **Regel:** Vor jeder Front-Wahl prüfen, welcher Prio-Block adressiert wird.
> P1–P5 dominieren. Popt/Pios nur bei konkret benanntem Pain-Point.
> Details: `_config/RULES.md` → CW-PRIO-001.
> Pattern: `Nexus/_memory/patterns/holistic-system-priority.md`.
> Tutorial: `Second Brain/30 Tutorials/Arbeitsweise & Prozess/06-projekt-prio-leiter-holistic.md`.

### Aktueller Prio-Stand (2026-04-25, Ende Session 41)

> **Re-Priorisierung S41 (Dr.-Stracke-Direktive):** „DE-Content komplett →
> Menüführung → DE-Funktionalität testen → DE-SEO → dann i18n-Transfer".
> Block B (P3) bleibt formal grün, aber **DE-Content ist real noch lückenhaft**:
> 9 Slug-Stubs angelegt (Texte folgen), 8 Slug-Mismatch-Redirects live,
> Volltext-Content für die Stubs offen → DE-Content-Vervollständigung
> wird neuer P3a-Block.

| Prio | Block | Status | Next Session |
|:---:|---|:---:|:---:|
| **P1** | Medien-Pipeline (ohne Framework): 2/8 Fotos live | 🟢 **durch (Block A)** | 6 weitere Fotos = externer Foto-Shoot |
| **P2** | Prod-Deployment-Pipelines (Praxis via DF/SFTP) | 🟡 offen, DF-Support extern blockiert | wenn C-1 freigegeben |
| **P3** | Praxis Content-Rest (Block B MVP-Rohling) | 🟢 **durch (S34–S36)** | — |
| **P3a** | **DE-Content-Vervollständigung (NEU S41):** 9 Slug-Stubs mit Volltext füllen + Menü-Restrukturierung (31 Pages aktuell unverlinkt) + DE-SEO-Pass | 🟡 Stubs + Redirects ✅ · Content-Texte + Menü offen | **Session 42 + folgende** |
| **Ppol-type** | S40 Apple Type-Scale | 🟢 committed `cc2a0e2` + `a4898ba` | — |
| **Ppol-S40-it** | S40-Folge-Iteration (Footer/Loc/Footer-Logo) | 🟢 committed `7265c70` | — |
| **Ppol-S41** | **S41 Dr.-Stracke-Polish:** Header 1-Zeile, Footer-Single-Source, Doctolib-Position, Reading-Width 1,5×, Homepage-Texte | 🟢 **committed `5e9bb22`** (PXZ 2.7.35) | — |
| **P4** | **M1**: Erster Prod-Push westend-hausarzt.com + Verify | 🔴 Meilenstein | nach DE-Content + L-1/L-2 + C-1 |
| **P5** | Juvantis Content-Alltag | 🔴 offen | nach M1 |
| **P6** | Mehrsprachigkeit Praxis | 🔴 offen | nach P5 |
| **Ppol-rest** | A11y-Audit, Mobile-Finish, Design-Feinschliff | 🔴 offen | nach P4 |
| **Popt** | N-6.4, N-6.5, Pattern C, Media-Registry-Framework | ⏸ gefrierend | nur bei Pain-Point |
| **Pios** | N-3 Design-Token + iOS-Adapter | ⏸ gefrierend | wenn iOS-Scope aktiv |

### Zeit-Schätzung bis „holistisches System trägt" (2026-04-25)

| Scope | Sessions | Realistisch bei 2–3/Tag |
|---|:---:|---|
| Kern-System (P1–P5) | 9–14 | 3–6 Wochen |
| + P6 Mehrsprachigkeit | 15–24 | 5–10 Wochen |
| + Ppol Polish | 16–26 | 6–11 Wochen |

Externe Blocker eingerechnet: DF-Support, Rechtsquellen (Impressum/Datenschutz), Arzt-Fotos, externe Übersetzungen. Gegenüber S39-Ende etwa 2 Sessions schneller durch abgeschlossenen Type-Scale-Block.

---

## §0a EINSTIEG „Projekt fortsetzen Cortex-Web" — Pflicht-Lesung

### Basis (immer)
1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_rules/AUTONOMY_CONTRACT.md`
3. `~/Cortex/Nexus/_rules/AI_COOPERATION.md`
4. `~/Cortex/Nexus/_rules/MULTI_AI_BOUNDARIES.md`
5. `~/Cortex/Nexus/_memory/USER.md`
6. `~/Cortex/projects/Cortex-Web/CLAUDE.md`
7. Diese Datei (`SESSION_RESUME.md`)
8. `~/Cortex/projects/Cortex-Web/_rules/ARCHITECTURE.md`
9. `~/Cortex/projects/Cortex-Web/_config/RULES.md`
10. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/_rules/WORKING_MODE.md` (Architekten-Modus)

### Wenn Praxis-Sprint-Arbeit ansteht (S2.1+)
10. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/SESSION_RESUME.md` — Praxis-Sprint-Stand
11. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/_rules/ARCHITECTURE.md` — Sprint 2 Plan
12. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/_rules/FEHLERPROTOKOLL.md` — PXZ-E-001…008
13. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/DESIGN_GUIDELINES.md` — v2.3, §13–§16

### Wenn Juvantis-Web-Arbeit ansteht
14. `~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/SESSION_RESUME.md`
15. `~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/SHOPIFY_THEME_POINTER.md`
16. `~/Cortex/projects/Juvantis/_config/RULES.md`

---

## §1 Stand & Version

- **Version:** `0.9.16` — Stand 2026-05-08 Spätabend nach **Welle Repo-Workflow-Setup** (auf S55b-d aufbauend). Cortex-Web-HEAD `c120595` (README Rollback-Konzept + sync-skript Pre-Push-Guard). Praxis-Theme-HEAD `4badc0d` (README + .gitignore gehärtet). Nexus-HEAD `c600305` (Tutorial 14). **Erster offizieller Rollback-Anker als Tag `live-de-2026-05-08-01` in beiden Code-Repos parallel** (Theme `cad2ff2` PXZ 2.7.179 + Cortex-Web `e93e722`). **Detail-Chronik in `sites/praxis-webseite/SESSION_RESUME.md` §1**.
- **Welle Repo-Workflow-Setup (2026-05-08 Spätabend):** Auslöser Dr.-Stracke-Frage „Wie verfahren wir mit Local + Staging + GitHub?". Ergebnis: 5 Punkte umgesetzt — (1) Theme-README erweitert um GitHub-Mirror-Sektion + Rollback-6-Schritte + Workflow-Reihenfolge, (2) Theme-`.gitignore` gehärtet (Secrets, Welle-F-Helper-PHP, Build-Artefakte), (3) Cortex-Web-README mit GitHub-Mirror + Rollback-Konzept ergänzt, (4) Tag `live-de-2026-05-08-01` parallel in beiden Repos gesetzt + gepusht (Theme + Cortex-Web), (5) `tools/sync-local-to-de.sh` Pre-Push-Guard eingebaut (Stop bei dirty Theme-Repo oder ahead-of-Remote, Override mit `--skip-git-check`). Bonus: Tutorial 14 (`Webdesign/14-rollback-via-git-tag.md`, 161 Zeilen) in Nexus. Strategische Wahl Tag-Konvention `live-de-YYYY-MM-DD-NN` statt SemVer (PXZ_VERSION beschreibt Code-Stand, Live-Tag braucht Datum-Anker).
- **Welle S55b-d (2026-05-08, Polish-Phase):** drei aufeinander aufbauende Polish-Schritte. **S55b** (Footer-Right-Size): S40-Footer-`×2`-Bump zurück, Migration auf T-Token (T6/T7/T8), Logo-Mark `×4 → ×2` (288/352→144/176). **S55c** (Karriere-Vorname + Mobile-Drawer): WPForms-Name-`<fieldset>`-Default-Padding-Reset + `overflow-x: clip` Hardguard auf html+body (team/dr-stracke @375/768 Mobile-Drawer-Overflow eliminiert). **S55d** (C-Token-Container-System): 4-Tier C1-C4 in `tokens.css` analog T1-T8, ~50 Selektoren über 14 CSS-Files migriert. Karriere-Card @1920: 972→1272 px (+300). 60-Probe Multi-Viewport-Audit-Tool `tools/responsive-audit.mjs` (Cortex-Web-Repo) eingeführt. Theme-Commit `cad2ff2` (25 Files, PXZ 2.7.176→2.7.179). Cortex-Web-Commit `f6df0af`. **GitHub-Mirror-Setup:** `gh` CLI installiert, beide Repos (Cortex-Web + praxiszentrum-theme) auf GitHub privat angelegt, gepusht.
- **Welle K (2026-05-07 Spät):** Spec `specs/sprint-2/K_com-go-live.md` mit 11 Phasen K0a-K11, Modell A (Local=Master) als Polish-Workflow festgelegt. Polish-Sync-Skript `tools/sync-local-to-de.sh` (lftp mirror -R --only-newer mit Welle-J-Exclusions, Passwort-Echo-Filter). `.com`-Ist-Zustand-Probe: gleiche IP wie `.de`, alter Theme `freesia-empire`, kein DNS-Switch nötig. Tutorial 13 (`Webdesign/13-local-master-staging-prod-pipeline.md`) angelegt. Cortex-Web `64255b6` (4 Files, +373 Zeilen).
- **Welle J (2026-05-07):** Logo-404-Fix (Permission-Bug 0600→0644 für 2 Theme-Files) · Diskrepanz-Scan Local↔Staging (Theme byte-identisch, 343 Asset-Refs alle 200) · Pre-Launch-Hardening (`.git/` rm, `error_log` rm, mod_rewrite-`[F]`-Block für Recon-Targets, Verify-Suite 21/21). 2 neue Patterns: `php-tar-extract-permission-fix.md` + `htaccess-rewrite-deny-trumps-auth.md`. Welle K (`.com`-Go-Live) entblockt. Cortex-Web `9c5aae5` · Nexus `1353922`.
- **Vorherige Welle I (2026-05-05):** 9 Cluster Altbestand entfernt (Repo 2,3 GB → 1,6 GB) · PXZ-E-010 (Probe-Bug + Mobile-Header-Overflow ≤540 px). Pattern `probe-layout-viewport-vs-visual-viewport.md`. Commits `6fbd3db` + `401e7b6`. Theme `bc345df` (PXZ 2.7.175).
- **Vorheriger Stand (S50, zur Orientierung):** Sanexio-Detail-Page-Mirror, 25 Detail-Pages mit Sanexio-Produktseiten-Layout, PXZ 2.7.73.

### §1.0 Sessions S43–S54 — Index (Hot-Layer, Details cold)

> **LL-053 Anti-Bloat:** Detailblöcke ausgelagert. Hot-Layer = Index, Cold-Layer = `_archive/sessions/`.

| Session | Datum | Theme-Commit(s) | PXZ | Slug | Cold-Archiv |
|:---:|:---:|:---:|:---:|---|---|
| S34–S36 | 2026-04-22/23 | `cb4cfc4` · `e8f7cf3` · `3481884` | 2.7.25→26 | 24h-MVP-Sprint (Front 1/2/3) | [`_archive/sessions/2026-04/sessions-34-36-mvp-sprint.md`](_archive/sessions/2026-04/sessions-34-36-mvp-sprint.md) |
| S38 | 2026-04-23 | `bca1521` · `61fd5db` | 2.7.29 | Header-Variante-A + Footer-Doppelung-Fix | [`_archive/sessions/2026-04/sessions-38-42-polish-arc.md`](_archive/sessions/2026-04/sessions-38-42-polish-arc.md#s38) |
| S39 | 2026-04-24 | (in `cc2a0e2` integriert) | 2.7.29→31 | Home-Polish + Font-Rollback | [`_archive/sessions/2026-04/sessions-38-42-polish-arc.md`](_archive/sessions/2026-04/sessions-38-42-polish-arc.md#s39) |
| S40 | 2026-04-25 | `cc2a0e2` · `a4898ba` · `7265c70` | 2.7.32→34 | DS-Block Apple Type-Scale | [`_archive/sessions/2026-04/sessions-38-42-polish-arc.md`](_archive/sessions/2026-04/sessions-38-42-polish-arc.md#s40) |
| S41 | 2026-04-25 | `5e9bb22` | 2.7.35 | Re-Prio „DE-Content vor i18n" + Polish | [`_archive/sessions/2026-04/sessions-38-42-polish-arc.md`](_archive/sessions/2026-04/sessions-38-42-polish-arc.md#s41) |
| S42 | 2026-04-25 | `1760546` · `b2d805f` | 2.7.36 | P3a Phase 1+2: Content-Stubs + Header-Nav 7-Top-Level | [`_archive/sessions/2026-04/sessions-38-42-polish-arc.md`](_archive/sessions/2026-04/sessions-38-42-polish-arc.md#s42) |
| S43 | 2026-04-26 | `6214b33` | 2.7.51 | Home-Refactor (Sammel-Commit) | [`_archive/sessions/2026-04/sessions-43-46-catch-up.md`](_archive/sessions/2026-04/sessions-43-46-catch-up.md#s43) |
| S44 | 2026-04-26 | `9907b7f` · `e3e0631` | 2.7.51 | Location-Card SSoT + Nav „Hauptpraxis Grüneburgweg" | [`_archive/sessions/2026-04/sessions-43-46-catch-up.md`](_archive/sessions/2026-04/sessions-43-46-catch-up.md#s44) |
| S45 | 2026-04-26 | `ff3720a` · `901b602` | 2.7.52→53 | Swipeable Room-Slider Zweigpraxis + Dynamic Height | [`_archive/sessions/2026-04/sessions-43-46-catch-up.md`](_archive/sessions/2026-04/sessions-43-46-catch-up.md#s45) |
| S46 | 2026-04-26 | `7653efa` · `2927f37` | 2.7.63 | Fullbleed-Slider + Homepage-Carousel + Mobile + i18n-Nav-Parity | [`_archive/sessions/2026-04/sessions-43-46-catch-up.md`](_archive/sessions/2026-04/sessions-43-46-catch-up.md#s46) |
| S47 | 2026-04-27 | `501f9d5` | 2.7.71 | Mid-Range-Reality-Check (fluid clamp() T1–T8 + Header right-sized) | [`_archive/sessions/2026-04/session-47-mid-range-reality-check.md`](_archive/sessions/2026-04/session-47-mid-range-reality-check.md) |
| S49 | 2026-04-27 | `90fc4db` | 2.7.72 | Sanexio-Spiegel-Umbau (Untersuchungen + Labor als Top-Level) | siehe §1.1 (kein Cold-File, Detail in S50-Block) |
| S50 | 2026-04-28 | `52cc942` | 2.7.73 | Sanexio-Detail-Page-Mirror — 25 Detail-Pages | siehe §1.1 (HOT — N-1 vor S51) |
| S51 | 2026-04-28/29 | `cc71286` (Cortex-Web) · `12dd7d8`+`af41475` (Nexus) | — | LL-053 Anti-Bloat + Drift-Sync Sanexio→Praxis + WV-002 V2-Fix | siehe §3 (HOT — letzte Cortex-Web-Architektur-Session) |
| S52 | 2026-04-29 | `bfaefd2` (Cortex-Web Probe-Tools) · `cbd6470`+`a4ecf5c`+`fb88c41` (Theme) | 2.7.76 | Untersuchungen-Submenu in 3 Gruppen (Ultraschall/Funktion/Check-Ups) + Mega-Menu Desktop + h3-Trenner Mobile + Hub-Page sektioniert + Doctolib-Floating-Button-Probe | Praxis-Resume §1.0/§3 (S52-Block) |
| S53 | 2026-04-29 | `f014ef2` (Theme) | 2.7.77 | Standorte-Container vereint (Layout A: 2 Spalten + gemeinsamer Footer) + Padding +20% + Praxis-Submenu „Standorte" (4 langs) | Praxis-Resume §1 §53 |
| S54 | 2026-04-29 | `e49b187` (Theme) | 2.7.78 | FINAL CTA von Homepage entfernt + Tools-Drift-Fix | Praxis-Resume §1 §54 |
| **S55** | **2026-04-30** | uncommitted (Theme + Cortex-Web Trunk) | **2.7.79–2.7.85** | **Homepage-Slider auf halbe Höhe (32:9-Strip, 2 Bilder) + Labor-Begriffe DE (9) + Labor-Mega-Menu (Check-Up/Organe/Risikoprofile) + Untersuchungen-Sweep (10 Pages: Body-Check, Augen-Check, Tauchtauglichkeit, Sono-Kürzungen)** | **Praxis-Resume §1 (HOT — N)** |

- **Stand:** 2026-04-28 Ende S50:
  - **Theme-Stand:** PXZ **2.7.72 → 2.7.73** (Bump für S50). Theme-Commits folgen am Session-Ende.
  - **Schema erweitert:** `hero.image` (optional, lokaler image-key oder absoluter Pfad) + `body.body_html` (alternativ zu `body_md`, für 1:1 HTML-Übernahme aus Sanexio).
  - **Builder erweitert (`adapters/wordpress/build-page-hub.mjs`):** Pre-Pass-Loop sammelt alle Detail-Pages, generiert pro Page `related_overview` (alle Pages außer der aktuellen, mit category 'lab' / 'examination'). Doctolib-Resolver: `views.praxis.doctolib_url || cta_url || /service/terminanfrage/`. body-Normalize bevorzugt `body_html`, fällt sonst auf `markdownToHtml(body_md)` zurück.
  - **Renderer erweitert (`template-parts/page-hub-renderer.php`):** Hero mit `image` rendert 2-Spalten-Layout (Bild + Text-Block + Hero-CTA). body-Case rendert `body_html` mit `wp_kses_post`. Übersichts-Block am Seitenende — gesplittet in 2 Karussells „Weitere Untersuchungen" + „Laboruntersuchungen" mit Pfeil-Buttons.
  - **Template-detail-page.php:** Legacy-WP-Content wird nur noch dann gerendert, wenn der Trunk keinen `body` mit `body_html` liefert (saubere Übergangs-Strategie für nicht-gerollten Pages).
  - **CSS:** `assets/css/page-hub.css` ergänzt um `.pxz-hub-product-hero` (2-Spalten Desktop, Mobile stacked), `.pxz-hub-related-overview`, `.pxz-hub-overview-grid` (CSS scroll-snap horizontal Karussell), `.pxz-hub-carousel` + `.pxz-hub-carousel-arrow--prev/next`.
  - **JS neu:** `assets/js/page-hub-carousel.js` — wires up arrow buttons mit scroll-by-card-width + disabled-state. Conditional enqueued nur auf detail-pages.
  - **Bilder:** 23 Sanexio-Hero-Bilder gespiegelt nach `_media-source/shopify-mirror/detail/<slug>/hero.<ext>` + `wp-content/uploads/2026/04/sanexio-imports/<slug>-hero.<ext>`. 2 Pool-Bilder als Übergang für eye-check + labor-biohack.
  - **23 Trunk-YAMLs aktualisiert** mit Sie-Form-konvertiertem HWG-bereinigtem `body_html` aus Sanexio-Spiegel. 2 Pages (eye-check, labor-biohack) mit Praxis-eigenem Skelett.
  - **Pre-Flight Session-Ende 50:** Schema-Validation 28/28 ✅ · Build 27 PHP-Datenfiles ✅ · HTTP-Sweep 25/25 = 200 ✅ · Hero-Bild auf jeder Page ✅ · 0 Placeholder-Karten im Karussell ✅ · Sanitizer-Probe alle 5 Dateien im Budget
  - **Patterns + Tutorial neu:** `Nexus/_memory/patterns/storefront-auth-mirror.md` · `auto-related-page-grid.md` · `Second Brain/30 Tutorials/Webentwicklung/Webdesign/28-detail-page-mirror-shopify-zu-wp.md`
  - **Spec:** `sites/praxis-webseite/specs/sprint-2/S50_sanexio-detail-page-mirror.md` (V1.0 + §14 Reduktion auf 4 Sektionen)
  - **Doctolib-Mapping** ist Phase 3d — Dr. Stracke gibt pro Page den Doctolib-Direktlink (oder `/service/terminanfrage/` als Sammeltermin) im Verlauf rein. YAML-Feld vorbereitet als `views.praxis.doctolib_url`.

### Vorheriger Stand (S47, zur Orientierung)

- **Stand:** 2026-04-25 Ende S42:
  - **Theme-Stand:** PXZ **2.7.35 → 2.7.36** committed `1760546` (Hauptcommit, 2 Files +76/-23 LoC) + `b2d805f` (Versionsbump).
  - **Header-Nav (`inc/nav-data.php` DE-Block):** 7 Top-Level (Praxis · Ärzte · Diagnostik · Leistungen · Service · Standorte · Kontakt) + 49 Sub-Items mit `match_prefix` für Active-States. EN/FR/ES bleiben unverändert (i18n-Sprint P6).
  - **Footer-Legal (`inc/footer-data.php` alle 4 Sprachen):** Cookie-Richtlinie als 3. Legal-Item ergänzt. Datenschutz-Href umgestellt auf `/datenschutzerklaerung-2/` (neue Page ID 4223 mit Volltext-Inhalt; alte ID 3 entkoppelt).
  - **Page-Content (DB):** 9 Stub-Pages (IDs 9701-9709) mit Volltext befüllt. Quellen: 7× `_content-archive/legacy/de/`, 1× `services/de/`, 1× selbst geschrieben (Cookie-Richtlinie). 2 Mojibake-Pages (rund-ums-impfen, rund-ums-labor) frisch von Prod via curl gezogen. WPForms-Shortcodes durch Mailto/Tel-Fallback ersetzt. FAQ-Slug-Konflikt mit ES/FR/EN via direktem `post_name`-Update gelöst.
  - **WP-DB-Cleanup:** 53 alte Menü-Items aus term_id=5 (Main Menu) gelöscht. Theme nutzt PHP-Array, NICHT `wp_nav_menu()` — DB-Items waren Datenmüll.
  - **HTTP-Sweep S42:** 54/54 = 200 OK (49 Header-Nav-Targets + 3 Footer-Legal + Doctolib + 9 Stubs als Direkt-Test).
  - **Architektur-Entscheidung Dr. Stracke 2026-04-25:** Header-Nav, Footer-Legal, Standorte, Team, Homepage-Texte bleiben **bewusst PHP-Code in `inc/*-data.php`**, NICHT WP-Admin-bearbeitbar. Pages selbst bleiben WP-Admin-bearbeitbar. Memory: `feedback_praxis_nav_via_code.md`. Pattern: `Nexus/_memory/patterns/theme-rendering-source-check.md`.
- **Pre-Flight Session-Ende 42:** `validate.sh` 🟢 · `verify.sh` 🟢 (10 Showpieces delta=0) · Sanitizer-Probe alle 5 Dateien im Budget · pending-Queues leer

### §1.1 Phasen-Status

| Phase | Ziel | Status |
|:---:|------|:---:|
| 0–5 | Cortex-Web-Aufbau | ✅ |
| Praxis-Sprint-2 | 6 Cluster + Menü + Bridge | ✅ |
| Adapter-Symmetrie A/B (S24..S30) | Push/Pull/Diff für Pages + Templates | ✅ |
| CW-PRIO-001 + Block A | Holistische Prio + 2 Arzt-Fotos | ✅ S31–S33 |
| **MVP-Rohling (S34–S36)** | Block B durch | ✅ |
| **S38 Header-Polish** | PXZ 2.7.29 | ✅ |
| **S39 Home-Polish** | im S40-Bundle | ✅ |
| **S40 DS-Block Apple Type-Scale** | T1–T8 + Pill + Body ×1.5 | ✅ `cc2a0e2`+`a4898ba` |
| **S40-Folge-Iteration** | Footer/Loc/Footer-Logo ×4 | ✅ `7265c70` |
| **S41 Dr.-Stracke-Polish + Re-Prio** | Header 1-Zeile, 9 Stubs, Reading-Width, Doctolib, Footer-Single-Source, Homepage-Texte | ✅ **`5e9bb22`** PXZ 2.7.35 |
| **S42 P3a Phase 1+2** | 9 Stub-Volltexte (Archiv-Übernahme) + Header-Nav 7-Top-Level-Hierarchie + Footer-Cookie-Legal + WP-DB-Cleanup + Architektur-Entscheidung „Status quo PHP-Code" | ✅ **`1760546`+`b2d805f`** PXZ 2.7.36 |
| **S43–S46** | Home-Refactor + Location-Card SSoT + Room-Slider Zweigpraxis + Fullbleed-Slider + Homepage-Carousel + Mobile-Responsive + EN/FR/ES Nav-Parity | ✅ Theme-only (kein SESSION_RESUME-Update — nachzupflegen) PXZ 2.7.36→2.7.63 |
| **S47 Mid-Range-Reality-Check** | Fluid clamp() für T1–T8 + Header-Reflow (Logo 296→96, Wortmarke ≥1440) + Hard-Coded Buttons fluid + Lesetext-Container 960 px + homepage.css Header-Duplikate entfernt + 2 Patterns + Tutorial 27 | ✅ **`501f9d5`** PXZ 2.7.71 |
| **S49 Sanexio-Spiegel** | Top-Nav 5 Items (Praxis · Untersuchungen · Labor · Service · Kontakt) + 19 Detail-Pages angelegt + Sanexio-Bilder + Builder Auto-Discovery | ✅ **`90fc4db`** PXZ 2.7.72 |
| **S50 Sanexio-Detail-Page-Mirror** | Schema (`hero.image`, `body.body_html`) + Builder Pre-Pass `related_overview` + Renderer 2-Spalten-Hero + 2 Karussells mit Pfeilen + 23 Pages mit Sanexio-Spiegel + 2 Pages mit Praxis-Skelett + Spec V1.0 + 2 Patterns + Tutorial 28 | ✅ PXZ 2.7.73 |
| **S51 LL-053 Anti-Bloat** | Hot/Warm/Cold-Memory + Sliding-Window + Sanitizer-Hardgate + Lazy-Read + Single-Source. 3 Cold-Archives + Spec + Pattern + Tooling + Lifecycle Schritt 3c. | ✅ |
| **S51 Drift-Sync Sanexio→Praxis** | Provenance-Schema (`sanexio_source`-Block) + Drift-Detector + HWG-Curate-Pipeline + Auto-Sync mit Review-Gate (D3-Stufe). 5 Drift-Scopes. Live-Test: 9 NEW Bluttest-Trunk-YAMLs auto-curated. | ✅ Tooling produktiv, WP-Push für Pages folgt |
| **S51 WV-002 V2-Fix** | `nexus-sync.sh` Pathspec-Isolation: Auto-Sync committet nur whitelisted Pfade via expliziter Pathspec, vereinnahmt User-Stages nicht mehr. | ✅ `12dd7d8` |
| **S52 Untersuchungen-Submenu + Doctolib-Probe** | 3 Gruppen Ultraschall/Funktion/Check-Ups + Mega-Menu Desktop + h3-Trenner Mobile + Hub-Page sektioniert + Eye-Check zu Funktion + Doctolib-Floating-Button-Probe-Tools | ✅ PXZ 2.7.76 (Theme `cbd6470`+`a4ecf5c`+`fb88c41` · Cortex-Web `bfaefd2`) |
| **S53 Standorte-Container vereint** | Hauptstandort + Zweitstandort in 1 Card (Layout A: 2 Spalten oben + gemeinsamer Footer mit Tel/E-Mail/Notes) auf Homepage + `/standorte/` + `/standorte/zweigpraxis-bockenheimer/`, Padding +20%, Praxis-Submenu „Standorte" (4 langs), `loc-main.php` + `loc-secondary.php` gelöscht | ✅ **`f014ef2`** PXZ 2.7.77 |
| **S54 FINAL CTA entfernt + Tools-Drift-Fix** | FINAL-CTA-Section von Homepage komplett raus (Mobile-Sticky-Bar bleibt einziger CTA-Anker), `cta_title_a/b` aus 4 Sprachen raus, `.pxz-final*` CSS raus, `alignment-probe`/`ab-diff`/`page-registry` auf `.pxz-loc-card--combined` | ✅ **`e49b187`** PXZ 2.7.78 |
| **Praxis Doctolib-Mapping (Phase 3d)** | Pro Page: Dr.-Stracke-Doctolib-Direktlink in `views.praxis.doctolib_url` einsetzen | 🔴 offen, asynchron |
| **Praxis Page-Review (Sie-Form / fachlich)** | Dr.-Stracke-Walkthrough der 25 Detail-Pages, Korrekturwünsche umsetzen | 🔴 offen, kommt mit Doctolib |
| **Praxis i18n P6** | Übersetzung aller Pages in EN/FR/ES (WPML) | 🔴 nach Page-Review |
| **Praxis Funktionalität** | Forms (WPForms ersetzen), Cookie-Banner-Plugin, Kontaktformular, E-Mail-Versand | 🔴 nach i18n |

**Status:** S54 abgeschlossen (Praxis-Theme PXZ 2.7.78, Cortex-Web HEAD `5e6f15c`). Pre-Live-Blocker unverändert: L-1/L-2 (extern), C-1 (extern). Letzte Cortex-Web-Architektur-Session war S51 (Anti-Bloat + Drift-Sync) — S52–S54 sind reine Praxis-Polish-Sessions. Nächste Front S55: α Doctolib-Mapping · β Page-Review (25 Sanexio-Pages) · γ eye-check + labor-biohack Bild/Text · δ S52-Builder-Output-Commits (27 uncommitted Theme-Files) · ε Blocksy-Backup-Menü · ζ stale-refs.

### §1.2 Vorherige Sessions

> Detail-Beschreibungen entfernt (LL-053d Single-Source). Sessions liegen im §1.0-Index mit Cold-Link, oder in §3 als HOT-Block (N + N-1).

---

## §2 Pre-Flight-Befehle

### Standard
```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
```

### Praxis-Site Pre-Flight
```bash
cd ~/Cortex/projects/Cortex-Web/sites/praxis-webseite && bash tools/verify.sh
```

### Header-Probe (S38, Re-Run nach Iterationen)
```bash
cd ~/Cortex/projects/Cortex-Web && bun run sites/praxis-webseite/specs/sprint-2/S38_evidence/probe.mjs
# 4+3-Probe Homepage
PXZ_URL="https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/" \
  bun run sites/praxis-webseite/specs/sprint-2/S38_evidence/probe-rows.mjs
# Footer-Anzahl
PXZ_URL="https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/" \
  bun run sites/praxis-webseite/specs/sprint-2/S38_evidence/probe-double-footer.mjs
```

### Sanitizer-Probe (LL-044, Schritt 3b)
```bash
bash ~/Cortex/Nexus/tools/cortex-sanitizer/rotate.sh --probe   # Statusbericht
bash ~/Cortex/Nexus/tools/cortex-sanitizer/rotate.sh --learn   # für Session-Ende (alle 3 Probes + Growth-Log)
```

### Juvantis-Site Pre-Flight
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://sanexio.eu/
git -C ~/Cortex/projects/Juvantis/juvantis-web/theme rev-parse HEAD
```

---

## §3 Letzte Cortex-Web-Architektur-Session

**S51 (2026-04-28/29) — Anti-Bloat-Architektur LL-053 + Drift-Sync Sanexio→Praxis + WV-002 V2-Fix.** 6 Phasen, Commit `cc71286` (Cortex-Web, 32 Files) + `12dd7d8`+`af41475` (Nexus). Detail im Cold-Archive: [`_archive/sessions/2026-04/session-51-anti-bloat-drift-sync.md`](_archive/sessions/2026-04/session-51-anti-bloat-drift-sync.md). Auslagerung am 2026-04-30 (S55-Session-Beenden) per LL-053a Sliding-Window.

S52–S55 sind reine Praxis-Polish-Sessions (Submenu-Gruppen / Standorte vereint / FINAL CTA / Slider-Halbierung / Begriffe-Sweep) — Detail in `sites/praxis-webseite/SESSION_RESUME.md`.

## §3-legacy — Sessions 34–46 (Cold-Archive)

> **LL-053-Sweep (Session 51, 2026-04-28):** Detail-Blöcke S34–S46 ausgelagert. Hot-Layer behält nur §3 (Session 47, N-1 vor S50).
>
> Cold-Archive-Files (verlinkt aus §1.0-Index):
> - **S34–S36** — 24h-MVP-Sprint: [`sessions-34-36-mvp-sprint.md`](_archive/sessions/2026-04/sessions-34-36-mvp-sprint.md)
> - **S38–S42** — Polish-Arc Header → Type-Scale → Re-Prio → Content-Stubs: [`sessions-38-42-polish-arc.md`](_archive/sessions/2026-04/sessions-38-42-polish-arc.md)
> - **S43–S46** — Sonntags-Sprint Home-Refactor + Location-SSoT + Slider: [`sessions-43-46-catch-up.md`](_archive/sessions/2026-04/sessions-43-46-catch-up.md)
>
> Vor dem Sweep waren §3-legacy-36, -38, -39, -40, -41, -42, -42-detail im Hot-Layer. Single-Source-Konsequenz (LL-053d): jede Session hat genau einen Detail-Pfad.

---

## §4 Offene Tasks — Praxis-Launch-Fokus

> **Strategie-Rahmen S42 (Dr. Stracke 2026-04-25):** S43 Content-Review Page-by-Page → S44+ i18n (EN/FR/ES) → S45+ Funktionalität (Forms, Doctolib, Cookie-Banner). Externe Blocker L-1/L-2 + C-1 unverändert.

### Block P3a-Phase-3 — Content-Review (Session 43, NEU TOP-PRIO)

**Auftrag Dr. Stracke 2026-04-25:** „In der nächsten Session werden wir alle Seiten durchgehen und es wird entsprechende Änderungsvorschläge geben. Das wird eine Menge Arbeit."

| Task | Was passiert | Status |
|---|---|:---:|
| **CR-1** Page-Inventory mit Status-Spalte | Liste aller 49 verlinkten DE-Pages mit Content-Längen, letzten Änderungen, Hub-vs-Detail | 🔴 vorbereiten Session 43 Start |
| **CR-2** Reihenfolge-Vorschlag Dr. Stracke | Strukturierte Walk-Through-Reihenfolge: Top-Level-Hubs zuerst (Praxis, Diagnostik, Leistungen, Service, Standorte), dann Detail-Pages | 🔴 |
| **CR-3** Pro Page: Live-Probe → Änderungswunsch → Umsetzung → Verify | Iterativ. Per Page Block-Edit (Gutenberg) ODER direkter DB-Update via WP-CLI | 🔴 |
| **CR-4** HWG-Check pro Page | Keine Heilversprechen, keine Werbeaussagen, keine Preise | 🔴 |
| **CR-5** Bilder/Medien pro Page bewerten | Welche brauchen neue/zusätzliche Bilder? (Block A Foto-Shooting nutzbar?) | 🔴 |

### Block i18n-P6 — Übersetzungen (Sessions 44+)

**Trigger:** Sobald S43 Content-Review komplett.

| Task | Was passiert | Status |
|---|---|:---:|
| **I-1** WPML-Strategie-Pin | Slug-Strategie pro Sprache (EN/FR/ES): identisch DE oder lokalisiert? | 🔴 |
| **I-2** Übersetzungs-Quelle | Eigene Übersetzungen, MT (DeepL Pro), oder externer Übersetzer? | 🔴 |
| **I-3** 9 neue Stubs in EN/FR/ES erstellen | Inkl. WPML-trid-Verknüpfung mit DE-Master | 🔴 |
| **I-4** EN/FR/ES-Hub-Pages | praxis, team, diagnostik, leistungen, service, standorte, aktuelles, karriere | 🔴 |
| **I-5** EN/FR/ES Header-Nav in `inc/nav-data.php` | Übersetzte Labels, Slugs entsprechend I-1 | 🔴 |
| **I-6** EN/FR/ES Footer-Tagline/Claim | `inc/footer-data.php` bereits vorbereitet, evtl. Texte aktualisieren | 🔴 |
| **I-7** EN/FR/ES Homepage-Texte | `inc/homepage-data.php` bereits gepflegt — Konsistenzcheck | 🔴 |

### Block Funktionalität (Sessions 45+)

**Trigger:** Sobald i18n komplett.

| Task | Was passiert | Status |
|---|---|:---:|
| **F-1** Patienten-Fragebogen-Forms | Aktuell Mailto-Fallback. WPForms-Plugin installieren (mit DSGVO-Versand) ODER Alternative (Gravity Forms, Forminator, Bloomerang Form) | 🔴 |
| **F-2** Kontaktformular `/contact-us/` | Funktioniert es? E-Mail-Versand testen | 🔴 |
| **F-3** Doctolib-Integration | CTA-Button-Zielprüfung, Buchungsfluss live durchspielen | 🔴 |
| **F-4** Cookie-Banner | Plugin-Wahl (Complianz alt, Cookiebot, Borlabs, Real Cookie Banner) — DSGVO-Pflicht für Prod | 🔴 |
| **F-5** SEO-Pflege | AIOSEO oder Yoast: Title-Tags, Meta-Descriptions, OG-Tags pro Page | 🔴 |
| **F-6** Sitemap.xml | Wird automatisch generiert; Verify nach Content-Review | 🔴 |
| **F-7** E-Mail-Versand | SMTP-Plugin oder server-seitig (DF-Hosting), Test-Mail von Kontaktformular | 🔴 |
| **F-8** Performance-Audit | Lighthouse, evtl. Caching-Plugin (W3 Total Cache, WP Rocket) | 🔴 |
| **F-9** A11y-Audit | WCAG-Check, Tastatur-Navigation, Screen-Reader, Kontraste | 🔴 |

### Block A — Arzt-Fotos
| Task | Status |
|---|:---:|
| **A-1** 2 Fotos Stracke + Saul live | ✅ S32–S33 |
| **A-2** 6 weitere Foto-Shootings | ⏸ Dr. Stracke extern (Termin + Fotograf) |
| **A-3** Prod-Re-Upload nach P4 | 🔴 wartet |

### Block B — Praxis Content-Rest
| Task | Status |
|---|:---:|
| **B-1-saul** Bio extrahiert + gerendert | ✅ S33 + S35 |
| **B-1-6rest** Volltext-Bios statt Stubs | 🟡 wartet auf CV-Stichworte / Mail-Antworten |
| **B-2..B-3 / B-4-Content** | ✅ S34–S36 (MVP) |
| **L-1 Impressum Legal-Review** | 🔴 Anwalt extern |
| **L-2 Datenschutz Legal-Review** | 🔴 Anwalt extern |

### Block C — Prod-Deploy-Pipeline
| Task | Status |
|---|:---:|
| **C-1** DF-Support reaktivieren (SFTP-Zugang) | 🔴 Dr. Stracke extern |
| **C-2** SFTP-Deploy-Script | 🔴 wartet auf C-1 |

### Block D — M1 Prod-Launch
| Task | Status |
|---|:---:|
| **D-1** Erster Prod-Push westend-hausarzt.com | 🔴 wartet auf Theme-Commits + C-2 + L-1/L-2 |
| **D-2** Verify Prod (SEO/Forms/Maps/DNS) | 🔴 wartet auf D-1 |
| **D-3** Arzt-Foto-Re-Upload Prod | 🔴 wartet auf D-1 |

### Design-Block (NEU — Session 40 Default)

| Task | Status |
|---|:---:|
| **DS-1** Dr. Stracke liefert Referenzseite (Netz-Link) | 🔴 Session-40-Einstieg |
| **DS-2** Puppeteer extrahiert Type-Scale der Referenz | 🔲 automatisch nach DS-1 |
| **DS-3** Type-Scale als Design-Token in `tokens.css` (T1–T8) | 🔲 |
| **DS-4** Homepage-Klassen auf Stufen mappen (30+ Selektoren) | 🔲 |
| **DS-5** Phase-4-Probe (Screenshots 1920/1440/430) + Abnahme | 🔲 |
| **DS-6** Gebündelter Commit `feat(s39+s40): home-polish + type-scale` | 🔲 |

### Hygiene Session 43 (Eintritts-Status)
1. ✅ **Theme committed** — `b2d805f` PXZ 2.7.36 (Hauptcommit `1760546`)
2. 🟡 **Cortex-Web uncommitted** — SESSION_RESUME.md (dieses Update) → wird bei Session-End committed
3. 🟡 **Nexus uncommitted** — MEMORY.md (S42-Zelle-Update + Memory-Eintrag) + neuer Pattern `theme-rendering-source-check.md` → wird bei Session-End committed
4. 🟡 **DB-Migrations-Skript für Prod** offen — wartet sinnvollerweise bis nach S43 Content-Review

### Folge-Blöcke (nach Praxis-Launch M1)
- **E** Juvantis Content-Alltag (P5)
- **G** Design-Polish / A11y / Mobile-Feinschliff (Ppol-Rest, post DS-*)
  → Hinweis: A11y wird bereits in Block Funktionalität F-9 mit erfasst

### Gefrierend offen (nicht anfassen bis Praxis live)
- Medien-Registry-Framework · Shopify-Media-Upload-Pfad · N-6.4 / N-6.5 · N-3 Design-Token · `_inbox/media-root/` Sortierung

### Ewige externe Blocker
- Santapress-Archive-Entscheidung fällig ab 2026-05-19
- Sono-atlas DSGVO-Gate (R-7)

---

## §5 Sofort-Status-Frage an Dr. Stracke — nächste Session

> **Aktueller Stand 2026-05-07 Ende:** Welle F (.de-Live), Welle J (Hardening), Welle K (Spec-only) abgeschlossen. **Polish-Phase startbereit** unter Modell A (Local = Master). `.de`-Verify 21/21 grün, Sync-Skript getestet, Welle K Spec liegt für späteren `.com`-Push bereit.
>
> **Default-Front:** Polish-Phase starten — Sie nennen Inhalte/Design-Punkte, die nachgeschärft werden sollen, ich arbeite sie iterativ ab (Local-Edit → `tools/sync-local-to-de.sh` → Verify auf `.de`).
>
> **Kollaterale Fronten (nicht-blockierend, aber ratsam vorm Welle-K-Trigger):**
>
> | | Front | Was passiert | Aufwand |
> |---|---|---|---|
> | **a** | **Polish-Iterationen** (Hauptpfad) — Ihre Stichworte zu Content/Design | iterativ |
> | **b** | **`SFTP_COM_*`-Credentials** klären (oder bestätigen, dass `.de`-Login auf `/Praxis/`-DocRoot greift) — entblockt Welle K Phase K0a | ~15 min |
> | **c** | **L-1 Impressum + L-2 Datenschutz Legal-Review** — extern, blockt Welle K | extern (Anwalt) |
> | **d** | **Doctolib-Mapping** für 25 Detail-Pages — `views.praxis.doctolib_url` füllen | iterativ |
> | **e** | **Page-Review / Sie-Form-Korrekturen** auf 25 Sanexio-Mirror-Pages | längere Session |
> | **f** | **eye-check + labor-biohack** — Praxis-eigenes Bild + Text (Stub schließen) | ~30–60 min |
> | **g** | **88 stale refs** aus Sanitizer-Learn aufräumen | ~30 min |
> | **h** | **GLOBAL_RULES.md Hard-Warn** beheben — Sliding-Window-Spec auf Nexus-Regel-Datei anwenden (LL-053-Mechanismus selbst) | 2–3 Sessions |
> | **i** | Andere Front (Juvantis, Cortex-Mesh, etc.) | — |
>
> **Vorlauf:** Sanitizer `--enforce` blockt aktuell auf `Nexus/_rules/GLOBAL_RULES.md` (15759 Tokens > 12k Cap). Cortex-Web-Files alle im Budget. Pre-Commit-Hardgate ist für Cortex-Web-Commits damit grün, aber Front **h** sollte mittelfristig adressiert werden.

## §6 Verbote / harte Regeln (Session 43 NIE passieren darf)

- **HWG/Berufsordnung:** Keine Werbung, keine Heilversprechen, keine Preise auf Praxis-Site (CW-005)
- **Trunk ist Master (CW-001):** Keine Inhalte direkt im WP-Admin oder Shopify-Admin ändern
- **Gerichteter, expliziter Transfer (CW-006):** Kein Auto-Sync, kein Webhook-Live-Mirror
- **Trunk alleinige Brücke (CW-007):** Immer Site → Trunk → Site
- **Backup vor destruktivem Push (CW-008):** Kein Overwrite ohne `adapters/*/.backups/`
- **Mojibake-Disziplin** bei Content-Migration
- **Brand-Switch-Konsistenz:** Neue Doctor-Slugs immer in `pxz_doctor_slugs()` registrieren
- **Single-Source UI-Region (NEU S38):** Vor jedem Komponenten-Refactor Volltextsuche auf `<tag>` und CSS-Klasse — keine Doppelungen, keine Page-CSS-Override für globale Komponenten-Selektoren
- **Type-Scale-Pflicht bei Font-Änderungen (S39/S40):** Keine mechanischen font-size-Iterationen ohne verbindliches Type-Scale-System. Größen werden aus Stufen T1–T8 referenziert, nicht aus freien px. Begründung: Claude hat kein visuelles Urteil (FK-3). Pattern: `Nexus/_memory/patterns/reference-driven-type-scale.md`.
- **Button-Text-Disambiguation (NEU S40):** Bei mehrdeutigen Button-Anfragen („Hauptstandort-Button") konkret den sichtbaren Text abklären, bevor Edit. Pattern: `Nexus/_memory/patterns/button-text-disambiguation.md`.
- **Keine eigenmächtigen Strukturänderungen** ohne Dr.-Stracke-Freigabe (LL-023, KON-001)
- **Token-Budgets einhalten (LL-044):** SESSION_RESUME ≤ 15 k · MEMORY ≤ 10 k · Nexus/CLAUDE ≤ 12 k
- **Holistische Prio (CW-PRIO-001, S31):** P1–P5 dominieren; Popt/Pios nur bei Pain-Point
- **Theme-Render-Source vor DB-Schreiben prüfen (NEU S42):** Custom-Themes können WP-Standard-System (wp_nav_menu, Customizer, Widgets) komplett umgehen. Vor jeder DB-Schreibaktion verifizieren, dass das Theme die Daten dort liest. Pattern: `Nexus/_memory/patterns/theme-rendering-source-check.md`. Praxis-Theme: nav/footer/practice/team/homepage in `inc/*-data.php`, NICHT in DB.
- **Praxis-Theme: Status quo PHP-Code (NEU S42):** Nav-Daten, Footer-Daten, Stammdaten bleiben hart kodiert. NICHT auf WP-Admin-Menü-System umstellen ohne explizite Freigabe. Memory: `feedback_praxis_nav_via_code.md`.

---

## §7 Archivierte Sessions — Index

Alle historischen Session-Logs unter `_archive/sessions/YYYY-MM/`.

| Session | Datum | Thema | Archiv-Pfad |
|:---:|---|---|---|
| **47** | 2026-04-27 | **Mid-Range-Reality-Check: T1–T8 fluid via clamp() + Header-Reflow (Logo 296→96/120, Wortmarke nur ≥1440) + 4 hard-coded Buttons + Privacy-Hinweis ebenfalls clamp() + homepage.css Header-Duplikate entfernt + Lesetext-Container 960 px. Patterns neu: `mid-range-viewport-coverage.md`, `fluid-type-scale-clamp.md`. Tutorial 27 neu.** Theme `501f9d5` PXZ 2.7.71. | §3 (aktuelle Session) in dieser Datei |
| **43–46** | 2026-04-25 → 26 | Home-Refactor (S43, `6214b33`) · Location-Card SSoT + Nav „Hauptpraxis Grüneburgweg" (S44, `9907b7f`+`e3e0631` PXZ 2.7.51) · Swipeable Room-Slider Zweigpraxis (S45, `ff3720a`+`901b602` PXZ 2.7.52/53) · Fullbleed-Slider + Homepage-Carousel + Aktuelles-Banner + Mobile-Responsive + EN/FR/ES Nav-Parity (S46, `7653efa`+`2927f37` PXZ 2.7.63). **SESSION_RESUME-Catch-Up offen — nur git-log dokumentiert.** | nur via Theme-`git log` (Catch-Up-Front γ in S48) |
| 42 | 2026-04-25 | P3a Phase 1+2: 9 Stub-Pages mit Volltext + Header-Nav 7-Top-Level (in S46+ auf 5 konsolidiert) + Footer-Cookie + WP-DB-Cleanup + Architektur-Entscheidung „Status quo PHP-Code". Theme-Commits `1760546` + `b2d805f` PXZ 2.7.36. | §3-legacy-42 (verkürzt) in dieser Datei |
| 41 | 2026-04-25 | Re-Prio „DE vor i18n" + Header-Rollback Flex + 9 DE-Slug-Stubs + 8 Mismatch-Redirects + Reading-Width 1,5× + Doctolib-Floating mittig + Footer-Single-Source-Fix + Homepage-Texte + Container-Cap-Fixes. Theme `5e9bb22` PXZ 2.7.35. | §3-legacy-41 (verkürzt) in dieser Datei |
| 40 | 2026-04-24/25 | Apple Type-Scale (DS-1..DS-6): T1-T8 Tokens + Pill-Buttons + Body ×1.5 Option B + 11 Polish-Iterationen (Footer ×2/full-width, Homepage-Polish, Badges ×3, Footer-Logo ×4, Loc-Hours). Bundle-Commits `cc2a0e2` (Theme S39+S40-A) + `a4898ba` (Cortex-Web) + `7265c70` (Theme S40-B-Sammel-Commit). | §3-legacy-40 (verkürzt) in dieser Datei |
| 39 | 2026-04-24 | Home-Polish (Hero-Bild Empfang · Sprachen-Stack · Content +25 %) + Type-Scale-Erkenntnis → Session-40-Trigger. S39-Edits in S40-Bundle-Commit integriert. | §3-legacy-39 (verkürzt) in dieser Datei |
| 38 | 2026-04-24 | Header-Variante-A live + 2 Iterationen (Schrift 21 px bold, Homepage 4+3-Bug) + Footer-Doppelung gefixt + Pattern `single-source-ui-region` + Tutorial 24 | §3-legacy-38 (verkürzt) · Commits `bca1521` · `61fd5db` |
| 34–36 | 2026-04-24 | 24h-MVP-Sprint Block B (6 Service-Pages bereits committed `0ee4e96`, Zweigpraxis Bockenheimer, Aktuelles, 15 Redirects, Bio-Renderer + 6 Stubs, Nav-Umbau, S38-Spec) — 29/29 URLs HTTP 200 | §3-legacy-36 (verkürzt) in dieser Datei · Vollversion in `MVP_HANDOFF.md` + Commits |
| 33 | 2026-04-24 | S32-Commit-Hygiene + B-2 Legacy/DE Triage (25 Pages) + Docteur-Saul-Bio + Pattern `content-archive-triage` + Tutorial 08 | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 32 | 2026-04-24 | Praxis-Fokus-Schwenk + Block A schlank (2 Arzt-Fotos live) + Juvantis/_assets → _media-source Migration + Pattern `wp-cli-media-upload-wpml-memory` + Tutorial 07 | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 31 | 2026-04-23 | Live-Verify N-8 Guard (7/7 AKs) + CW-PRIO-001 Prio-Shift | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 30 | 2026-04-23 | N-6.3 `cw-transfer diff wp:template` (FS-Variante) + Extended Drift-Test | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 29 | 2026-04-23 | N-1 WP-Template-Adapter (Pattern B reverse für /team/) | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 28 | 2026-04-23 | N-6.2 `cw-transfer diff shopify:template` + Live-Diff EQUAL | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 27 | 2026-04-23 | N-8 Pattern-A-vs-B-Guard + Pre-Write-Classification-Pattern | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 26 | 2026-04-23 | N-6 `cw-transfer diff shopify:page` + Build-then-Fetch-then-Diff | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 25 | 2026-04-23 | S24-Close + S2.4b Footer-Umbau + S2.4d Design-Polish (PXZ 2.7.21) | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 24 | 2026-04-22 | Shopify-Page-Adapter N-5 PUBLISH=1 + N-7 CW-008 Backup + S2.4c Praxis-Cross-Links | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 23 | 2026-04-22 | Cortex-Sanitizer V4 + V5 (selbstlernend + Auto-Apply) | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 22 | 2026-04-22 | Cortex-Web content-bridge-v1 + cross-site-transfer | `_archive/sessions/2026-04/session-22-content-bridge-v1.md` |
| 21 | 2026-04-22 | Praxis S2.3-diagnostik (8 URLs, dual-mode hub, atlas DSGVO-gated) | `_archive/sessions/2026-04/sessions-23-33-arc.md` |
| 20 | 2026-04-22 | Praxis S2.3-aerzte-services (8 Arzt-Pages + Services-Hub) | `_archive/sessions/2026-04/session-20-s2.3-aerzte-services.md` |
| 19 | 2026-04-22 | Praxis S2.4 Menü-Restrukturierung | `_archive/sessions/2026-04/session-19-s2.4-menue.md` |
| 16 | 2026-04-20 | Praxis S2.3-D Phase 2 Content-Archive | `_archive/sessions/2026-04/session-16-s2.3-d-content-archive.md` |
| 15 | 2026-04-20 | Praxis S2.3-D Phase 1 Mojibake | `_archive/sessions/2026-04/session-15-s2.3-d-mojibake.md` |
| 14 | 2026-04-19 | Praxis S2.3-B (3 P0-Pages + SEO + Brand-Switch) | `_archive/sessions/2026-04/session-14-s2.3-b-3p0-pages.md` |
| 13 | 2026-04-19 | Praxis S2.0f Santapress-Entfernung | `_archive/sessions/2026-04/session-13-s2.0f-santapress.md` |
| 12 | 2026-04-19 | Praxis S2.0e Verify-Hardening | `_archive/sessions/2026-04/session-12-s2.0e-verify-hardening.md` |
| 11 | 2026-04-19 | Praxis S2.0b Component-Library | `_archive/sessions/2026-04/session-11-s2.0b-components.md` |
| 10 | 2026-04-19 | Praxis S2.2 Template-Typologie | `_archive/sessions/2026-04/session-10-s2.2-templates.md` |
| 9 | 2026-04-19 | Praxis S2.1 Page-Inventory | `_archive/sessions/2026-04/session-09-s2.1-page-inventory.md` |
| 7 | 2026-04-19 | Phase 5 Juvantis-Web-Subsumption | `_archive/sessions/2026-04/session-07-phase5-juvantis-subsumption.md` |

**Sessions 17, 18, 37** sind inhaltlich in MEMORY.md-Aktive-Projekte-Zelle + im Nexus-Sprint-Log enthalten; separates Archive nicht notwendig.

**Vor-Session-7-Historie** (Phasen 0–5 Aufbau + Praxis S2.0/c/S2.1): siehe `Nexus/_archive/claude-md/2026-04.md` und `git log --oneline`.
