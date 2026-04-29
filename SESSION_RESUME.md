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
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`
4. `~/Cortex/Nexus/_rules/SESSION_LIFECYCLE.md`
5. `~/Cortex/projects/Cortex-Web/CLAUDE.md`
6. Diese Datei (`SESSION_RESUME.md`)
7. `~/Cortex/projects/Cortex-Web/_rules/ARCHITECTURE.md`
8. `~/Cortex/projects/Cortex-Web/_config/RULES.md`
9. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/_rules/WORKING_MODE.md` (Architekten-Modus)

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

- **Version:** `0.9.8` — Session 50 **Sanexio-Detail-Page-Mirror: 25 Detail-Pages bekommen Sanexio-Produktseiten-Layout (Hero mit Bild + Body + CTA + 2 Karussells „Weitere Untersuchungen" / „Laboruntersuchungen" mit Pfeil-Buttons + Auto-Übersicht aus Page-Registry).** Schema erweitert (`hero.image`, `body.body_html`), Builder mit Pre-Pass für `related_overview`, Renderer mit 2-Spalten-Hero + Übersichts-Block. 23 Pages mit Sanexio-Spiegel (Sie-Form, HWG-bereinigt), 2 Pages mit Praxis-eigenem Skelett (eye-check, labor-biohack). PXZ **2.7.73** (2026-04-28, Cluster-Mini-02 / Praxis-Mac via SSH).

### §1.0 Sessions S43–S50 — Index (Hot-Layer, Details cold)

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
| **S51** | **2026-04-28** | (Doku-only, kein Theme-Commit) | — | **Anti-Bloat-Architektur LL-053 + Sliding-Window + Sanitizer-Hardgate** | **siehe §3 (HOT — N, aktuell)** |

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
| **S51 Anti-Bloat-Architektur LL-053** | Hot/Warm/Cold-Memory-Schichten + Sliding-Window-Auto-Archive + Sanitizer-Hardgate (`rotate.sh --enforce`) + Lazy-Read + Single-Source. 3 Cold-Archive-Files + Spec `MEMORY_LAYERS.md` + Pattern + Tooling (`session-index/build.sh`) + `SESSION_LIFECYCLE` Schritt 3c. Resume −16,5 % Tokens. | ✅ Doku-only (kein Theme-Commit) |
| **Praxis Doctolib-Mapping (Phase 3d)** | Pro Page: Dr.-Stracke-Doctolib-Direktlink in `views.praxis.doctolib_url` einsetzen | 🔴 offen, asynchron |
| **Praxis Page-Review (Sie-Form / fachlich)** | Dr.-Stracke-Walkthrough der 25 Detail-Pages, Korrekturwünsche umsetzen | 🔴 offen, kommt mit Doctolib |
| **Praxis i18n P6** | Übersetzung aller Pages in EN/FR/ES (WPML) | 🔴 nach Page-Review |
| **Praxis Funktionalität** | Forms (WPForms ersetzen), Cookie-Banner-Plugin, Kontaktformular, E-Mail-Versand | 🔴 nach i18n |

**Status:** S50 abgeschlossen. Pre-Live-Blocker unverändert: L-1/L-2 (extern), C-1 (extern). Detail-Pages-Roll-out komplett (25/25 = 200, alle mit Hero-Bild), Doctolib-Mapping + Page-Review folgen.

### §1.2 Vorherige Sessions — Verkürzt

- **S49** (Sanexio-Spiegel-Umbau, `90fc4db`, PXZ 2.7.72): Top-Nav reduziert auf 5 (Praxis · Untersuchungen · Labor · Service · Kontakt; Leistungen + 7 Submenus gelöscht). „Diagnostik" → „Untersuchungen" (Slug-Wechsel + 301-Redirect). 19 NEUE Detail-Pages als Sanexio-Spiegel (10 Untersuchungen + 9 Labor). Section-Type `body` im Schema. Builder Auto-Discovery. 24 Sanexio-Bilder gespiegelt.
- **S47** (Mid-Range-Reality-Check, `501f9d5`, PXZ 2.7.71): Fluid clamp() T1–T8 · Header-Logo right-sized 296→96 · Wortmarke nur ≥1440 · Lesetext-Container ≤960. Patterns mid-range-viewport-coverage + fluid-type-scale-clamp. Tutorial 27.
- **S41** (Re-Prio „DE-Content vor i18n", `5e9bb22`, PXZ 2.7.35): 9 DE-Slug-Stubs + 8 Slug-Mismatch-Redirects + Reading-Width 1,5× + Doctolib-Floating-Button + Footer-Single-Source.

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

## §3 Letzte Session — Session 51, 2026-04-28 (Anti-Bloat-Architektur LL-053)

### Gerät
**Cluster-Mini-02** (home-Mac M2). Claude Code CLI direkt am Home-Mac.

### Auftrag
Dr. Stracke startete mit „setze Projekt webdesign fort". Nach Klarstellung Wahl C → Cortex-Web Dachprojekt fortsetzen. Front γ → „S43–S46-SESSION_RESUME-Lücke nachpflegen". Während Phase-2-Spec-Diskussion erweiterte sich der Auftrag auf eine **Anti-Bloat-Architektur**, weil das Resume bereits 27 k Read-Tokens hatte (Truncation beim Read).

### Verlauf in 4 Phasen (Architekten-Modus + 3 Schritte)

**Phase 1 — Pilot (Schritt 1):**
Cold-Archive `_archive/sessions/2026-04/sessions-43-46-catch-up.md` für S43–S46 geschrieben (alle 7 Theme-Commits am 2026-04-26, ein Sonntags-Sprint mit Home-Refactor + Location-SSoT + Room-Slider + Fullbleed-Carousel + Mobile-Audit). §1.0-Catch-Up-Tabelle durch Index mit Cold-Anchor-Links ersetzt. Sanitizer-Probe lief grün.

**Phase 2 — Spec (Schritt 2):**
Neue Datei `Nexus/_rules/MEMORY_LAYERS.md` mit LL-053a–d definiert (Sliding-Window, Hardgate, Lazy-Read, Single-Source) + 3-Schichten-Modell (HOT/WARM/COLD). Pattern `Nexus/_memory/patterns/session-archive-sliding-window.md`. Cap-Verschärfung: Resume 15 k → 12 k. LL-053 in `GLOBAL_RULES.md` §30 als Anker eingetragen, in `MEMORY.md` als Goldene Regel ergänzt.

**Phase 3 — Tooling (Schritt 3):**
`Nexus/tools/cortex-sanitizer/rotate.sh` V5.3 erweitert um `--enforce`-Modus (Pre-Commit-Hardgate, Exit 1 bei Soft-Cap-Verletzung). Cap-Tabelle auf LL-053-Werte verschärft. Neuer Generator `Nexus/tools/session-index/build.sh` schreibt `<projekt>/SESSION_INDEX.md` (WARM-Schicht, Bash-3-kompatibel auf BSD-awk). Test gegen Cortex-Web: Index mit 17 Sessions generiert (S07–S46), 767 Tokens / 5 k Cap.

**Phase 4 — Sweep + Konflikt-Resolution + Lifecycle-Integration:**
- **Sweep:** S38–S42 (Polish-Arc Header + Type-Scale + Re-Prio + Content-Stubs) als zweites Cold-Archive `sessions-38-42-polish-arc.md` ausgelagert. Resume §3-legacy-Blöcke (38, 39, 40, 41, 42, 42-detail, 36) komplett entfernt, nur 1-Zeilen-Verweis-Block geblieben. §1.0-Index erweitert um S34-S36, S38, S39, S40, S41, S42.
- **§29-Kürzung:** USER.md-Block in GLOBAL_RULES auf 6 Zeilen kompaktiert.
- **KON-001-Konflikt erkannt:** Hermes-Self-Learning Phase 3 (Cron-Job) hat parallel einen ZWEITEN §30-Block in GLOBAL_RULES eingefügt („Memory-Nudges via trigger.md") — beide nutzten LL-053. Resolution Option D (Dr. Stracke): Mein §30-Block entfernt (SSoT in MEMORY_LAYERS.md), Hermes-Block auf §30/LL-054 umnummeriert. Hermes-Spec angepasst.
- **Lifecycle-Integration:** `Nexus/_rules/SESSION_LIFECYCLE.md` Schritt 3c „Sliding-Window-Rotation + Hardgate" pflichtig hinzugefügt — neue Sub-Sektion im „Session beenden"-Workflow.
- **Erste produktive Anwendung von LL-053a:** S47-Detail-Block aus §3 in `_archive/sessions/2026-04/session-47-mid-range-reality-check.md` ausgelagert. Heute (S51) wird neuer §3.

### Pre-Flight-Metriken am Session-Ende 51

- Sanitizer `--enforce` → **Exit 0** ✅ (alle 7 überwachten Files unter Cap)
- Resume-Δ: Cortex-Web SESSION_RESUME 12 387 → 10 348 Tokens (**−16,5 %**)
- GLOBAL_RULES-Δ: 12 324 → 11 970 Tokens (**−2,9 %**, trotz parallel +Hermes-Block und +LL-053-Anker)
- 3 neue Cold-Archive-Files (~32 KB Detail-Chronik ausgelagert, S38–S42 + S43–S46 + S47)
- SESSION_INDEX.md mit 17 Sessions auto-generiert
- Pending-Queues: 0 Fragen, 2 Anweisungen (langlaufend WV-001 / WV-002)

### Working-Tree (Commit-Stand am Session-Ende 51)

- **Theme** unverändert seit S47 (`501f9d5` PXZ 2.7.71 → S49 `90fc4db` 2.7.72 → S50 `52cc942` 2.7.73). 3 Files seit S43–S46 weiterhin uncommitted (arzt.css / homepage-data.php / template-homepage.php) — nicht heute angefasst.
- **Cortex-Web** 🟡 uncommitted: `SESSION_RESUME.md` + 3 neue Cold-Files + `SESSION_INDEX.md` + `WORKING_MODE.md` (Hermes-Modifikation, nicht heute).
- **Nexus** 🟡 uncommitted: `MEMORY.md`, `GLOBAL_RULES.md`, `SESSION_LIFECYCLE.md`, neue `_rules/MEMORY_LAYERS.md`, neues Pattern, neues `tools/session-index/`, modifizierte `tools/cortex-sanitizer/rotate.sh`, modifizierte `specs/hermes-self-learning/SPEC.md`. Plus: parallele Modifikationen durch Hermes (`Second Brain/40 Regeln/LL-053.md`, `LL-054.md`, `_MOC` Updates).

### Neu in Session 51

- **Spec:** `Nexus/_rules/MEMORY_LAYERS.md` (LL-053 SSoT, Hot/Warm/Cold + 4 Mechanismen + Caps + Roll-Out-Plan)
- **Pattern:** `Nexus/_memory/patterns/session-archive-sliding-window.md`
- **Cold-Archives:** `sessions-38-42-polish-arc.md`, `sessions-43-46-catch-up.md`, `session-47-mid-range-reality-check.md`
- **Tool:** `Nexus/tools/cortex-sanitizer/rotate.sh --enforce` (V5.3)
- **Tool:** `Nexus/tools/session-index/build.sh`
- **Workflow-Erweiterung:** `Nexus/_rules/SESSION_LIFECYCLE.md` Schritt 3c

### Konsistenz-Auffälligkeiten (KON-001)

- 🔴 **Hermes-Vault-Stubs verweisen auf falsche Quelle:** `Second Brain/40 Regeln/LL-053.md` zeigt auf `GLOBAL_RULES.md` als SSoT, korrekt wäre `MEMORY_LAYERS.md`. Beim nächsten Hermes-Sync-Lauf vermutlich auto-korrigiert. Beobachten.
- 🟡 4 Cortex-Web-Tools weiter uncommitted (`probe-1365.mjs`, `probe-mid-range.mjs`, `make-staff-presentation.mjs`, `remote-access/`) — gehören zu S47 oder älter, nicht heute geklärt.
- 🟡 `sites/praxis-webseite/SESSION_RESUME.md` weiterhin veraltet seit S19.
- 🟡 3 Theme-Files seit S43–S46 weiter uncommitted.

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

## §5 Sofort-Status-Frage an Dr. Stracke — Session 53

> **S52 abgeschlossen (2026-04-29, Session abgebrochen vor Session-beenden-Workflow):**
> Untersuchungen-Submenu in 3 Gruppen unterteilt — Theme-Commits `a4ecf5c` (PXZ 2.7.75 Mega-Menu + Hub sektioniert) + `fb88c41` (PXZ 2.7.76 Labels gekürzt auf Ultraschall/Funktion/Check-Ups). Gruppen-Verteilung: 8 Ultraschall + 3 Funktion (inkl. Eye Check) + 5 Check-Ups. Mega-Menu Desktop / `<h3>`-Trenner Mobile / 3 Bento-Sections auf Hub. Spec `S52_untersuchungen-submenu-gruppen.md`. Memory neu: `feedback_design_length_proactive.md` (Längen-Hinweise früh geben).
>
> **🟡 OFFEN AUS S52 — EINSTIEGSPUNKT FÜR S53 (Dr.-Stracke-Anfrage am Ende, nicht beantwortet):**
> Architektur-Entscheidung: „Soll ich künftig eigenständig neue Untersuchungen auf der Sanexio-Storefront erkennen + automatisch der Praxis-Webseite (Menü + Hub-Page) in der richtigen Gruppe zuordnen — oder Architektur erst verfestigen?"
>
> 4 Optionen liegen vor (kein Spec geschrieben, nur Architektur-Skizze im Chat):
> - **A** Single-Source-Registry `untersuchungen.registry.yaml` mit Pflichtfeld `group: ultraschall|funktion|checkup` → `nav-data.php` + `untersuchungen.yaml` werden daraus generiert (~1 Session)
> - **B** A + Detection-Tool `tools/sanexio-watch.mjs` (Storefront-Diff Trunk vs. Live) (+0,5 Session)
> - **C** A + B + Bestätigungs-Gate (pro neuer Slug Vorschlag an Dr. Stracke per Telegram/Chat, dann Auto-Rollout) (+0,3 Session) — von mir als haltbarste empfohlen
> - **D** Status quo, jede neue Untersuchung als Einzel-Auftrag mit Phase 1–4
>
> Ungeklärt: SSoT für Klassifikation (heute lebt die Gruppen-Zuordnung in nav-data.php UND untersuchungen.yaml — Drift technisch möglich), Detection-Mechanismus (heute gibt es keinen), Klassifikations-Sicherheit (Eye Check war Grenzfall — fachlich Funktion, Marketing-Name suggeriert Check-Up).
>
> **🔴 Session-Beenden-Workflow nicht ausgeführt:** kein Konsistenz-Audit, kein Sanitizer-Probe/Apply, kein Sliding-Window, kein Dashboard. Bei nächstem Session-Start: explizit „Session 52 nachträglich beenden" anbieten ODER S53 startet direkt mit der Architektur-Frage und beendet beide Sessions am Ende von S53.
>
> **Praxis-Pfad zu M1 unverändert:** Doctolib-Mapping + Page-Review + i18n + Funktionalität + 3 externe Blocker (L-1/L-2/C-1).
>
> **Default-Optionen für Session 53:**
>
> | | Front | Was passiert | Aufwand |
> |---|---|---|---|
> | **α** | **Sanexio-Auto-Mirror-Architektur** (Fortsetzung S52-Frage) — Sie wählen A/B/C/D, ich schreibe Spec | iterativ |
> | **β** | **Session 52 nachträglich beenden** (6-Schritte-Workflow + Sanitizer + Dashboard) | ~10 min |
> | γ | P3a Phase 3 Content-Review starten | iterativ |
> | δ | Doctolib-Mapping starten (Phase 3d für 16 Detail-Pages) | iterativ |
> | ε | 3 uncommitted Theme-Files klären (arzt.css/homepage-data.php/template-homepage.php) | ~15 min |
> | ζ | 4 uncommitted Cortex-Web-Tools klären | ~15 min |
> | η | DESIGN_GUIDELINES §5.2/§8.2/§9.1 nachpflegen (clamp() aus S47) | ~30 min |
> | θ | sites/praxis-webseite/SESSION_RESUME.md aufräumen (seit S19 veraltet) | ~30 min |
> | ι | Andere Front (Juvantis, Cortex-Mesh, etc.) | — |

## §5-old-Session-52 Sofort-Status-Frage an Dr. Stracke — Session 52 (ARCHIV)

> **S51 abgeschlossen (2026-04-28):** Anti-Bloat-Architektur LL-053 produktiv. Cortex-Web SESSION_RESUME 12 387 → 10 348 Tokens (−16,5 %). Alle 7 überwachten Files unter Cap. Sanitizer-Hardgate `--enforce` läuft, blockt Commit bei Verletzung. Drei Cold-Archives angelegt (S38–S42, S43–S46, S47). `SESSION_LIFECYCLE` Schritt 3c jetzt pflichtig.
>
> **Praxis-Pfad zu M1 unverändert** (nicht heute angefasst): Doctolib-Mapping + Page-Review + i18n + Funktionalität + 3 externe Blocker.
>
> **Default-Optionen für Session 52:**
>
> | | Front | Was passiert | Aufwand |
> |---|---|---|---|
> | **α** | **P3a Phase 3 Content-Review starten** (Default seit S42) | Page-Inventory + Walk-Through pro Page (25 Detail-Pages) | 1 Session Vorbereitung + iterativ |
> | **β** | **3 uncommitted Theme-Files klären** (arzt.css/homepage-data.php/template-homepage.php seit S43–S46) | Diff-Review, Sammel-Commit | ~15 min |
> | **γ** | **4 uncommitted Cortex-Web-Tools klären** (probe-1365.mjs / probe-mid-range.mjs / make-staff-presentation.mjs / remote-access/) — gehören zu S47 oder älter | Diff-Review, ggf. .gitignore oder Commit | ~15 min |
> | **δ** | **Doctolib-Mapping starten** (Phase 3d für 25 Detail-Pages) — Sie liefern die Direktlinks pro Page | iterativ, abhängig von Ihrer Vorlage | — |
> | **ε** | **DESIGN_GUIDELINES §5.2/§8.2/§9.1 nachpflegen** mit clamp()-Konvention (Spec-Block E aus S47 offen) | Doku-Cleanup | ~30 min |
> | **ζ** | **`sites/praxis-webseite/SESSION_RESUME.md` aufräumen** (seit S19 veraltet) — kann jetzt mit LL-053 sauber rotiert werden | Sliding-Window auf Site-Resume anwenden | ~30 min |
> | η | Andere Front (Juvantis, Cortex-Mesh, etc.) | — | — |
>
> **Vorlauf nicht nötig:** Nach Schritt 3c-Workflow rotiert das System bei „Session beenden" automatisch. Sliding-Window kümmert sich.

## §5-old Sofort-Status-Frage an Dr. Stracke — Session 43 (ARCHIV)

> **S42 abgeschlossen** (Theme `b2d805f` PXZ 2.7.36, +76/-23 LoC). 9 Stubs mit Volltext live, Header-Nav 7-Top-Level + 49 Sub-Items, Footer-Cookie ergänzt, 54/54 HTTP 200. Architektur-Entscheidung „Status quo PHP-Code" verankert.
>
> **Auftrag Session 43 (Dr. Stracke 2026-04-25):**
> „In der nächsten Session werden wir alle Seiten durchgehen und es wird entsprechende Änderungsvorschläge geben. Das wird eine Menge Arbeit. Wenn das erledigt ist, müssen alle Seiten auf die anderen Sprachen übersetzt werden. Im Anschluss kommt die Funktionalität."
>
> **Sequenzplan steht: S43 Content-Review → S44+ i18n (EN/FR/ES) → S45+ Funktionalität (Forms/Doctolib/Cookie-Banner)**
>
> **Vorbereitung für Session 43-Start (Default):**
>
> | | Front | Was passiert | Trade-off |
> |---|---|---|---|
> | **α** | **Page-Inventory mit Status-Spalte erstellen** | CSV/Tabelle aller 49 verlinkten DE-Pages: ID · Slug · Title · Content-Länge · Last-Modified · Hub vs. Detail · Block A Foto vorhanden? Dr. Stracke kann am Inventory entlang priorisieren | 5–10 Min Vorbereitung; Sie sehen direkt was wo steht |
> | **β** | **Empfohlene Walk-Through-Reihenfolge** | Top-Level-Hubs (Praxis, Diagnostik, Leistungen, Service, Standorte, Kontakt, Aktuelles, Karriere) zuerst, dann Detail-Pages absteigend nach Patient-Importance | Strukturierter, vermeidet Lücken |
> | **γ** | **Per-Page-Iterationsformat festlegen** | Vorschlag: pro Page Live-URL → Sie sagen Änderungswünsche → ich setze um → kurze Verify (Live-Probe) → nächste Page. Alternativ: Sie schicken Änderungswünsche im Block (z.B. per Sprachnachricht), ich setze um, dann Sammel-Verify | Iterativ ist flüssiger; Block ist effizienter wenn viele kleine Änderungen |
>
> **Optionale Vorab-Aufgaben (falls Sie vor S43 was klären wollen):**
> - **DB-Migrations-Skript für Prod-Push** (kann erst sinnvoll nach Content-Review erstellt werden)
> - **`sites/praxis-webseite/SESSION_RESUME.md` rotieren** (LL-044-Hygiene, ~35 k Tokens veraltet)
> - **Tutorial „WP-CLI mit Local-by-Flywheel"** schreiben (Sock-Pfad-Workaround, heute mehrfach genutzt)
>
> **Nicht in der Default-Liste (Popt/Pios, gefrierend):** Media-Registry-Framework · N-6.4/6.5 · iOS · `_inbox/`-Sortierung.

---

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
