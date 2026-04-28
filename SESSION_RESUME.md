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

### §1.0 Sessions S43–S50 Catch-Up

S43–S46 fanden ohne Session-Resume-Update statt — nur git-log dokumentiert.
Zusammenfassung aus Theme-Commits:

| Session | Theme-Commit | Inhalt |
|:---:|:---:|---|
| S43 | `6214b33` | Home-Refactor (Sammel-Commit lange uncommitted) |
| S44 | `9907b7f` + `e3e0631` | Location-Card SSoT + Nav „Hauptpraxis Grüneburgweg" (PXZ 2.7.51) |
| S45 | `ff3720a` + `901b602` | Swipeable Room-Slider /zweigpraxis-bockenheimer/ (PXZ 2.7.52/53) |
| S46 | `7653efa` + `2927f37` | Fullbleed-Slider + Homepage-Carousel + Mobile-Responsive + EN/FR/ES Nav-Parity (PXZ 2.7.63) |
| S47 | `501f9d5` | Mid-Range-Reality-Check (PXZ 2.7.71) — fluid clamp() T1–T8 + Header-Logo right-sized + Hard-Coded Buttons fluid + Lesetext ≤960 |
| S49 | `90fc4db` | Radikaler Sanexio-Spiegel-Umbau — Untersuchungen + Labor als Top-Level (PXZ 2.7.72) |
| **S50** | **(commits folgen am Session-Ende)** | **Sanexio-Detail-Page-Mirror — 25 Detail-Pages mit Sanexio-Layout (PXZ 2.7.73)** |

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

## §3 Letzte Session — Session 47, 2026-04-27 (Mid-Range-Reality-Check)

### Gerät
**Cluster-Mini-02** (home-Mac M2) via SSH von Mac-Studio (praxis-studio).
Dr. Stracke saß am Mac-Studio + Studio Display, Browser auf der Local-Site
mit `innerWidth: 1365 px`, Claude Code per SSH am Home-Mac.

### Auftrag
Initial: „Projekt fortsetzen Cortex-Web". Während des Pre-Flight meldete
Dr. Stracke einen Layout-Bruch im Header + „Body wirkt zu groß" — der
ganze Sprint wurde zur S47 „Mid-Range-Reality-Check".

### Verlauf

**Phase 0 — Setup-Hürde:**
Setup-Skript für Praxis-Mac-Browser-Zugriff auf Local-Site funktionierte
nicht (scp scheiterte, weil Tailscale MagicDNS auf Mac-Studio nicht aktiv).
Lösung: einzeiliger /etc/hosts-Eintrag ohne das Skript. Site lief sofort.

**Phase 1 — Diagnose Header-Bug:**
Probe bei 1365 × 879 zeigte: Logo 296 px (S46-Bump) + Wortmarke 370 px +
Nav-Liste 1049 px + Lang 226 px = ~2200 px Mindestbreite. Header brach
auf jedem Viewport unter 2200 px. SESSION_RESUME war auf S42-Stand fixiert
(„7 Top-Level"), tatsächlich war Theme längst auf 5 Top-Level + PXZ 2.7.68.

**Phase 2 — Spec-Freigabe:**
Architekten-Modus: Spec mit AK-1 bis AK-5, drei Optionen für Mid-Range-
Schwelle / Wortmarke / Hero-Type-Scale. Dr. Stracke wählte Option A in
allen drei Punkten (1100 px / Wortmarke aus / clamp()-Hero).

**Phase 3 — Umsetzung:**
- `nav.css`: Logo 64/80/96/120 (statt 110/150/240/296), Wortmarke nur ≥1440, Nav-List kompakter (1.05rem statt 1.85rem), CTA 17–18 px (statt fix 34), Right-Side inline statt column-stack
- `tokens.css`: T1–T8 alle als clamp() (vorher fix Desktop + 767px-Override für T1–T5)
- `homepage.css`: Header-Block (Logo + Wortmarke + Right-Side + CTA + Lang) komplett entfernt — Pattern `single-source-ui-region` aus S38 endlich konsequent durchgezogen. Davor war der Block in homepage.css dupliziert und drift­ete bei jedem S46-Bump
- 4 Hard-Coded Hero/MFA/Final-Buttons + Final-Privacy ebenfalls clamp()
- `page.css`: `.pxz-page-content-inner` max-width 1140 → 960 px für Lesetext

**Phase 4 — Selbstprüfung:**
Probe bei 5 Viewports (1024 / 1280 / 1365 / 1440 / 1920): kein Overflow,
Hero fluid 51 → 80, Body fluid 17 → 26, Privacy 18 → 32 (statt fix 46).

### Pre-Flight-Metriken am Session-Ende 47
- `validate.sh` — OK · `verify.sh` — VERIFY OK
- Sanitizer `--probe`: alle 5 Dateien im Budget
- HTTP-Sweep: nicht relaufen (Theme-CSS-only Änderung, keine Routes geändert)
- Pending-Queues: 0 Fragen, 2 Anweisungen (langlaufend WV-001 / WV-002)

### Working-Tree (Commit-Stand am Session-Ende 47)
- **Theme** ✅ committed `501f9d5` (5 Files +157/-214 LoC) — PXZ 2.7.71
- **Theme** 🟡 3 Files seit S43–S46 uncommitted (arzt.css / inc/homepage-data.php / template-homepage.php) — nicht von S47, nicht angetastet
- **Cortex-Web** 🟡 SESSION_RESUME.md (dieses Update) — wird gleich committed
- **Nexus** 🟡 2 neue Patterns + Tutorial 27 — werden gleich committed

### Patterns + Memory + Tutorials (neu in Session 47)
- **Pattern neu:** `Nexus/_memory/patterns/mid-range-viewport-coverage.md` — 5-Viewport-Probe-Pflicht (1024/1280/1365/1440/1920) statt nur 1440+430
- **Pattern neu:** `Nexus/_memory/patterns/fluid-type-scale-clamp.md` — clamp() für T-Tokens, Faustregel für vw-Faktor, Anti-Patterns
- **Tutorial neu:** `Second Brain/30 Tutorials/Webentwicklung/Webdesign/27-fluid-type-scale-mid-range-coverage.md` — komplett mit Glossar (Viewport, Retina, dpr, vw, Skalierung, Mid-Range, Stufen-Shift, Apple-HIG)

### Nicht erledigt (bewusst)
- **DESIGN_GUIDELINES §5.2 / §8.2 / §9.1** Update mit clamp()-Konvention — Spec-Block E offen
- **`probe-mid-range.mjs` in `verify.sh` integrieren** — Spec-Block D offen (verify.sh ist alt, Cleanup-Aufwand größer als heute geplant)
- **S43–S46-SESSION_RESUME-Lücke vollständig nachpflegen** — heute nur Catch-Up-Tabelle, keine §3-legacy-43..46-Blöcke
- **3 Theme-Files uncommitted (arzt.css / homepage-data.php / template-homepage.php)** — gehören zu früheren Sessions, klären beim nächsten Sessionstart
- **P3a Phase 3 Content-Review** — wartet weiter auf Dr. Stracke

### Konsistenz-Auffälligkeiten (KON-001)
- `sites/praxis-webseite/SESSION_RESUME.md` weiterhin veraltet seit S19
- Tutorial „WP-CLI mit Local-by-Flywheel auf Mac" weiter offen

## §3-legacy-42 Session 42 (verkürzt)

S42 P3a Phase 1+2: 9 Stub-Pages mit Volltext (DB) + Header-Nav 7-Top-Level (in S46+ konsolidiert auf 5) + Footer-Cookie-Legal + WP-DB-Cleanup (53 alte Menü-Items aus term_id=5 gelöscht) + Architektur-Entscheidung „Status quo PHP-Code". Theme-Commits `1760546`+`b2d805f` PXZ 2.7.36. Pattern `theme-rendering-source-check.md`. Memory `feedback_praxis_nav_via_code.md`. HTTP-Sweep 54/54 = 200.

## §3-legacy-42-detail Session 42 (Detail-Auszug)

### Gerät
**Cluster-Mini-02** (home-Mac M2).

### Auftrag
„Setze Projekt Redesign Webpage um — heute müssen der komplette deutsche Content und die Menüs mit funktionierender Weiterleitung stehen!" — klare Tagesdirektive von Dr. Stracke nach S41 Re-Prio. Klärungsfragen: Stub-Quelle = Variante A (`_content-archive/`), Datenschutz-Page = neue ID 4223, Bio-Stubs trotz leerem Inhalt ins Menü, „funktionierende Weiterleitung" = alle gezogenen Pages über Menü erreichbar.

### Verlauf in drei Phasen

**Phase 1 — 9 Stub-Pages mit Volltext (DB):**
- Inventar: 62 DE-Pages, 39 unverlinkt; alle 9 Quell-Dateien im `_content-archive/` lokalisiert.
- Python-Build-Skript (`/tmp/build_stubs.py`): Frontmatter parsen, Body extrahieren, WPForms-Shortcodes durch Mailto/Tel-Fallback ersetzen, Local-Embed-URL relativieren.
- Mojibake-Quellen (rund-ums-impfen 472, rund-ums-labor 475 — `?` statt Umlaute) frisch von Prod (`westend-hausarzt.com`) via curl gezogen, `entry-content`-Block extrahiert, Class-Attribute weggekürzt.
- Cookie-Richtlinie 9709: Original-Quelle war nur `wp:complianz/document`-Plugin-Block → eigenen Standard-DSGVO-Cookie-Hinweistext geschrieben (5 H3-Sektionen, 2010 Zeichen).
- Import via WP-CLI `post update` mit `--post_content` aus File. Verification: alle 9 Pages clen 800–7100 Bytes.
- FAQ-Slug-Konflikt: 3 anderssprachige Pages (4553/4567/4571) hatten gleichen Slug; meine Page 9705 wurde auf `frequently-asked-questions-2` ge-suffixt → direktem `UPDATE wp_posts SET post_name='frequently-asked-questions'` korrigiert.
- HTTP-Sweep aller 9 Stub-Slugs nach `wp rewrite flush`: **9/9 = 200**.

**Phase 2 — Header-Nav 7-Top-Level-Hierarchie + Architektur-Pivot:**
- **Erster Versuch (falsch):** WP-DB-Menü via WP-CLI aufgebaut. 53 Items unter `term_id=5` (Main Menu) angelegt mit Parent-Hierarchie via direktem SQL-UPDATE. HTTP-Sweep aller 49 Menü-Targets nach Redirect: 49/49 = 200.
- **Live-Probe Dr. Stracke:** „ich sehe weder Phase 1 noch Phase 2 umgesetzt". Diagnose: Theme rendert das Header-Nav **nicht** über `wp_nav_menu()`, sondern über `template-parts/header-nav.php` aus `inc/nav-data.php` (PHP-Array, S2.4 Decision F1b). Das ganze WP-Menü-System ist tote Infrastruktur im Praxis-Theme.
- **Architektur-Entscheidung Dr. Stracke:** „Status quo — das ist für mich ok." Trade-off-Diskussion (Optionen A/B/C: WP-Menü-Umstellung / Custom-Admin-Page / Hybrid) → Entscheidung pro PHP-Code, NICHT auf WP-Admin umstellen. Memory: `feedback_praxis_nav_via_code.md`. Pattern: `Nexus/_memory/patterns/theme-rendering-source-check.md`.
- **Zweite Umsetzung (richtig):** `inc/nav-data.php` DE-Block überschrieben mit 7 Top-Level + 49 Sub-Items + `match_prefix` für Active-States.
- **WP-DB-Cleanup:** Alle 53 angelegten Menü-Items aus term_id=5 via SQL gelöscht (Datenmüll, Theme nutzt sie nicht).
- HTTP-Sweep der gerenderten Menü-Hrefs (mit Redirect-Follow `-L`): **54/54 = 200** (49 Header + 3 Footer-Legal + Doctolib + Sono-Sub-URLs).

**Phase 3 — Footer-Legal-Block (Cookie-Richtlinie ergänzt):**
- `inc/footer-data.php` `legal_nav` für alle 4 Sprachen (de/en/fr/es): Cookie-Richtlinie als 3. Legal-Item ergänzt.
- Datenschutz-Href umgestellt: `/datenschutz/` (zeigte auf alte ID 3) → `/datenschutzerklaerung-2/` (neue ID 4223 mit Volltext-Inhalt).
- Live-Probe Footer: 3/3 Legal-Links 200 OK.

### Pre-Flight-Metriken am Session-Ende 42
- `validate.sh` — OK · `verify.sh` — VERIFY OK (10 Showpieces delta=0 auf 1440 + 430)
- Sanitizer `--probe`: alle 5 Dateien im Budget (MEMORY 19.5 k / Nexus-CLAUDE 27 k / GLOBAL_RULES 42 k / cortex-agent-RESUME 6.9 k / Cortex-Web-RESUME 31.9 k)
- HTTP-Sweep S42: 54/54 = 200
- Pending-Queues leer

### Working-Tree (Commit-Stand am Session-Ende 42)
- **Theme** ✅ committed `1760546` (Hauptcommit, 2 Files +76/-23 LoC) + `b2d805f` (PXZ_VERSION-Bump → 2.7.36)
- **DB** ✅ Live in Local-WP (9 Stub-Inhalte via WP-CLI + 53 alte Menü-Items via SQL gelöscht)
- **Cortex-Web** 🟡 uncommitted: SESSION_RESUME.md (dieses Update) — wird gleich committed
- **Nexus** 🟡 uncommitted: `MEMORY.md` (S42-Zelle-Update + neuer Memory-Eintrag) + `_memory/patterns/theme-rendering-source-check.md` (neu) + `~/.claude/projects/.../memory/feedback_praxis_nav_via_code.md` (neu) — werden gleich committed

### Patterns + Memory (neu in Session 42)
- **Pattern neu:** `Nexus/_memory/patterns/theme-rendering-source-check.md` — Vor jeder DB-Schreibaktion auf einem Custom-Theme prüfen, ob das Theme tatsächlich `wp_nav_menu()`/Standard-WP-System nutzt oder eine eigene Render-Quelle (PHP-Array, ACF, Block-Pattern) hat. Anti-Pattern aus S42 dokumentiert (53 unnötige Menü-DB-Items).
- **Memory neu:** `feedback_praxis_nav_via_code.md` (in `~/.claude/projects/.../memory/`) — Status-quo-Entscheidung: Nav/Footer/Stammdaten bleiben PHP-Code, NICHT WP-Admin-bearbeitbar.

### Nicht erledigt (bewusst, kommt in Folge-Sessions)
- **DB-Migrations-Skript für Prod-Push** (9 Stub-Inhalte + WP-DB-Cleanup-Statements) — Pflicht-Punkt vor M1, aber kann erst sinnvoll erstellt werden, wenn S43 Content-Review abgeschlossen ist.
- **Page-by-Page-Content-Review mit Dr. Stracke** — Auftrag für Session 43.
- **i18n** (Übersetzungen aller Pages in EN/FR/ES) — nach Content-Review.
- **Funktionalität** (Forms, Doctolib, Cookie-Banner-Plugin, Kontaktformular) — nach i18n.
- Externe Blocker unverändert (L-1/L-2 Legal-Review, C-1 DF-Support, A-2 Foto-Shooting).

### Konsistenz-Auffälligkeiten (KON-001)
- `sites/praxis-webseite/SESSION_RESUME.md` ist mit ~35 k Tokens (Stand Session 19) **weiterhin stark veraltet** und überholt. Sanitizer überwacht es nicht. LL-044-Kandidat für Rotation in S43 (TODO).
- Tutorial „WP-CLI mit Local-by-Flywheel auf Mac (Sock-Pfad-Workaround)" weiterhin offen (heute mehrfach genutzt, würde künftige Sessions beschleunigen).

## §3-legacy-41 Session 41 (verkürzt)

S41 Re-Priorisierung „DE-Content vor i18n" + S37-Header-Rollback (Flex statt 4+3-Grid, PXZ 2.7.34 → 2.7.35) + 9 DE-Slug-Stubs (DB-Migration IDs 9701-9709 + WPML-DE-Zuweisung in trid 14701-14709, FAQ in trid=602 verschmolzen) + 8 Slug-Mismatch-Redirects in `inc/redirects.php` + Reading-Width 1,5× (`standard.css`+`page.css`) + Doctolib-Floating-Button mittig rechts (`components.css` §7) + Footer-Single-Source-Fix Homepage (chalk-Override aus `homepage.css` entfernt, Pattern `single-source-ui-region` Footer-Variante) + Doctolib-CTA → Col 1 Adresse + Footer-Nav-Links weiß + Homepage-Texte mit `<br>`-Struktur (mfa_subtitle 3 Zeilen, spec_intro 2 Zeilen, spec/team/loc-Title 1 Zeile) + Container-Cap-Fixes (`.pxz-mfa-hero max-width: none`). HTTP-Sweep 21/21 = 200. Theme-Commit `5e9bb22` PXZ 2.7.35.

## §3-legacy-40 Session 40 (verkürzt)

S40 DS-Block Apple Type-Scale (DS-1..DS-6: Referenz `apple.com/de` → Puppeteer-Scale-Probe → T1–T8 Tokens + Pill-Buttons + Body ×1.5 Option B + Mobile-Stufen-Shift). 116 font-size-Deklarationen auf T-Tokens gemappt. Commits Theme `cc2a0e2` + Cortex-Web `a4898ba`. Phase B: 11 Polish-Requests (Footer ×2/full-width/Flex, Homepage 1987→2019/Hero-Sub `<br>`/Final ×2/MFA ×1.5, Loc-Badges ×3 + Zweitstandort-Hours + Anfahrt-Button, Footer-Logo ×4 auf Header-SVG). Sammel-Commit `7265c70` (PXZ 2.7.34) am S41-Anfang nachgeholt. Patterns: `reference-driven-type-scale`, `button-text-disambiguation`. Tutorial 10.

## §3-legacy-39 Session 39 (verkürzt)

Home-Polish (Hero-Bild `grueneburgweg-empfang.jpg`, Sprachen-Stack unter CTA, Content +25 % auf 1600/1500/1750 px, Hero-Img 1600 px) + Font-Verdopplungs-Rollback (mechanische Regel ohne Type-Scale = FK-3). Meta-Erkenntnis: Claude hat kein visuelles Urteil — Session 40 bekommt Referenz-Seite. S39-Änderungen blieben uncommitted und wurden in S40-Bundle-Commit `cc2a0e2` integriert. PXZ 2.7.29 → 2.7.31.

## §3-legacy-38 Session 38 (verkürzt)

S38 Header-Variante-A + 2 Iterationen (Schrift 21 px bold, Homepage 4+3-Bug-Fix) + Footer-Doppelung gefixt · PXZ 2.7.29 · Pattern `Nexus/_memory/patterns/single-source-ui-region.md` + Tutorial `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/24-doppelte-render-quellen-aufspueren.md` · Commits `bca1521` (Theme) · `61fd5db` (Cortex-Web).

---

## §3-legacy-36 Session 34–36 — 24h-MVP-Sprint (verkürzt, Vollversion `_archive/sessions/2026-04/sessions-34-36-mvp-sprint.md`)

**Auftrag:** Dr. Stracke „MVP innerhalb 24–48 h" → 24h-Sprint, autonomer Modus mit Kurz-Spec pro Block.

**Drei-Fronten-Verlauf:**
- **Front 1 — S34 B-2c + B-2d:** Zweigpraxis Bockenheimer Hub + Detail · `inc/redirects.php` mit 15 Legacy-301-Redirects (URI-basiert, parse_request-Hook, cross-site-aware) · 14 Orphan-Pages bereinigt · Slug-Fix Parent-Prefix-Doublung
- **Front 2 — S35 B-1-template + B-1-6rest + B-2b:** `team-praxis.mjs` + `template-arzt.php` Bio-Renderer für `bio.de` + Qualifikations-Pills · `arzt.css` `.pxz-arzt-chips` · 6 Bio-Stubs für dr-barcsay/seelig/jawich/shahin/landeberg/arbitmann · 6 Merge-Ops via Redirect-Map + Trash
- **Front 3 — S36 B-3 + B-4-Review + Nav-Anpassung:** `/aktuelles/` neu, Google-Maps-Embed `/standorte/` (Marker-Platzhalter), Impressum + Datenschutz haben Content (Legal-Review L-1/L-2 als Pre-Live-Blocker), Nav `repeat(4, auto)` 7→4+3, S38-Spec geschrieben

**Commits:** Cortex-Web `3481884` · Theme `cb4cfc4` (PXZ 2.7.25) · Theme `e8f7cf3` (PXZ 2.7.26)
**Artefakte:** `MVP_HANDOFF.md` · `specs/sprint-2/S38_header-menu-redesign.md`
**Pre-Flight:** 29/29 URLs HTTP 200 · `verify.sh` OK · Sanitizer SESSION_RESUME bei Soft-Warn (15375 Tokens, in S38 rotiert)

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

## §5 Sofort-Status-Frage an Dr. Stracke — Session 48

> **S47 abgeschlossen** (Theme `501f9d5` PXZ 2.7.71). Header sauber bei Mid-Range-Viewports (1024/1280/1365/1440/1920) — kein Overflow mehr, Logo right-sized, Wortmarke ≥1440, Type-Scale fluid via clamp(), Lesetext-Container ≤960. Pattern `single-source-ui-region` (S38) endlich konsequent durchgezogen. Body bei 1365 jetzt 20 px statt 26 px, Hero 68 statt 80, Privacy-Hinweis 32 statt 46.
>
> **Vor S43-S46-Lücken-Doku + P3a Phase 3 Content-Review starten:**
>
> | | Front | Was passiert | Aufwand |
> |---|---|---|---|
> | **α** | **P3a Phase 3 Content-Review starten** (ursprünglicher Auftrag aus S42) | Page-Inventory + Walk-Through pro Page | 1 Session Vorbereitung + iterativ |
> | **β** | **DESIGN_GUIDELINES §5.2/§8.2/§9.1 nachpflegen** + Spec-Block E + verify.sh erweitern (Block D) | Doku + Tooling-Cleanup | ~30 min |
> | **γ** | **S43-S46 SESSION_RESUME-Catch-Up** vollständig schreiben (§3-legacy-43..46) | Pure Doku-Arbeit, anhand git log + Theme-Commits | ~45 min |
> | **δ** | **3 uncommitted Theme-Files klären** (arzt.css/homepage-data.php/template-homepage.php) | Diff-Review, ggf. Sammel-Commit | ~15 min |
> | ε | Andere Front (S2-Aufräum, Juvantis, etc.) | — | — |

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
