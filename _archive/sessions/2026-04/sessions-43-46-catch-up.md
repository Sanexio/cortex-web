# Sessions 43–46 — 7-Stunden-Sprint Home-Refactor + Location-SSoT + Room-Slider + Fullbleed-Carousel

> **Datum:** 2026-04-26 (Sonntag, 09:53 → 16:54 Lokal-Zeit)
> **Gerät:** Cluster-Mini-02 (home-Mac M2)
> **Theme-Commits:** 7 (PXZ 2.7.50 → 2.7.51 → 2.7.52 → 2.7.53 → 2.7.63)
> **Status bei Schreibung:** Catch-Up am 2026-04-28 (Session 51) — S43–S46 wurden ohne `SESSION_RESUME`-Update durchgeführt, nur git-log dokumentiert. Dieses Archiv-File ist die nachträgliche Detail-Chronik.
> **Trigger:** Front γ in Session 51 (Pilot Anti-Bloat-Architektur, LL-053)

---

## Übergreifend — Auftrag und Verlauf

S43–S46 lief als zusammenhängender Sonntags-Sprint zwischen S42 (Header-Nav 7 Top-Level) und S47 (Mid-Range-Reality-Check). Ausgangspunkt: nach S42 standen Praxis-/Standort-Pages mit lebenden Räumen-Bildern noch nicht da, Home-Refactor war im working copy hängen geblieben.

Reihenfolge im Sprint:

| Phase | Zeit | Sessionsblock |
|---|---|---|
| 09:53–10:37 | S43 + S44 (Home-Refactor + Location-SSoT) |
| 11:40–12:10 | S45 (Room-Slider Zweigpraxis + Dynamic Height) |
| 16:25–16:54 | S46 (Fullbleed-Slider + Mobile-Audit + i18n-Nav-Parity) |

Versionsbumps: S43 bringt PXZ 2.7.50 nur ins working copy (kein Commit), S44 committet 2.7.51, S45 → 2.7.52 → 2.7.53, S46 → 2.7.63 (Sprung über 2.7.54..62, Versionsnummern intern verbraucht).

---

<a id="s43"></a>
## §S43 — Home-Refactor Sammel-Commit (PXZ 2.7.50 → 2.7.51)

**Theme-Commit:** `6214b33` `chore(s43): commit pending S43 home-refactor work (was uncommitted)` · 15 Files +255/-110 LoC

### Auftrag

Pending-Arbeit aus dem working copy committen, die seit dem 2026-04-26-Memory-Eintrag „PXZ 2.7.50" angekündigt war, aber nie in die Git-Historie kam. Risiko: bei frischem Checkout oder Theme-Restore wäre der Helper `inc/specialty-icons.php` gefehlt → Fatal-Error in `functions.php:223`.

### Inhalt

| Block | Was |
|---|---|
| **Specialty-Icons** | `inc/specialty-icons.php` (Helper, 56 LoC) + 10 SVG-Icons in `assets/icons/specialties/` (ear, gynecology, internal, kardiology, optometrist, orthopedy, osteopathy, psychotherapy, pulmology, urology). Solid-filled Icon-Style |
| **Team-Disziplinen-Korrektur** | `inc/team-data.php`: Stub-Ärzte vorher alle als „Facharzt für Innere Medizin" → korrekt zugewiesen: Barcsay→Urologie, Seelig→Gynäkologie, Jawich→HNO, Shahin→Psychotherapie etc. |
| **Team-Foto-Mapping** | `template-team.php`: Slug→Photo-Mapping für 8 Arzt-Cards (Echt-Foto in `wp-content/uploads/2026/04/`, Fallback auf bestehende `image_id` falls absent) |
| **Homepage-Stats + Section-Merge** | `inc/homepage-data.php`: Stats + Fachrichtungen+Team zu einer Section zusammengezogen |
| **Strukturierte Team-Quelle** | `inc/data/team.json` (67 LoC) als Daten-Quelle |

### Files

`assets/icons/specialties/{ear,gynecology,internal,kardiology,optometrist,orthopedy,osteopathy,psychotherapy,pulmology,urology}.svg` · `inc/data/team.json` · `inc/homepage-data.php` · `inc/specialty-icons.php` · `inc/team-data.php` · `template-team.php`

### Anmerkung zur Versionierung

Der PXZ 2.7.50-Bump fand nur im working copy statt — im commit-Verlauf gibt es keinen 2.7.50-Tag. Der nächste committete Bump ist 2.7.51 in S44 `9907b7f`. Daher rollt S43 effektiv 2.7.49 → 2.7.51.

---

<a id="s44"></a>
## §S44 — Location-Card SSoT + Nav-Restructure (PXZ 2.7.51)

**Theme-Commits:**
- `9907b7f` `feat(s44): location-card SSoT + nav restructure (PXZ_VERSION 2.7.51)` · 8 Files +392/-325 LoC
- `e3e0631` `feat(s44): rename Praxis-submenu 'Hauptpraxis' → 'Hauptpraxis Grüneburgweg'` · 1 File ±1 LoC

### Auftrag

Nach S42 (7 Top-Level-Nav) war doppelte Pflege fällig: „Ärzte" zeigte auf dieselbe Page wie Praxis → Unser Team, „Standorte" passte besser als Praxis-Sub. Außerdem waren `.pxz-loc-*`-Styles in `homepage.css` eingebacken → Standort-Detail-Pages renderten die Cards nicht oder anders. Ziel: **eine Quelle für Standort-Daten und -Look**, drei Renderorte (Home + `/standorte/` + `/zweigpraxis-bockenheimer/`).

### Verlauf

**Block 1 — Nav-Schlankheit (7 → 5):**
- `inc/nav-data.php`: Top-Level „Ärzte" + „Standorte" entfernt
- Neues Praxis-Submenu: Über uns · Unser Team · Hauptpraxis · Zweigpraxis Bockenheimer · Aktuelles · Karriere
- Header geht von 7 → 5 Top-Items

**Block 2 — Location-Cards als Template-Parts:**
- Neu: `template-parts/loc-main.php` (64 LoC) + `template-parts/loc-secondary.php` (57 LoC)
- `template-homepage.php` konsumiert beide via `get_template_part()` (Reduktion: 232 → ~115 LoC für den Loc-Block)
- `template-standard.php` injiziert die Parts vor `the_content()` auf `/standorte/` und `/standorte/zweigpraxis-bockenheimer/`

**Block 3 — Style-Extraktion:**
- Neu: `assets/css/loc-cards.css` (131 LoC) mit allen `.pxz-loc-*`-Regeln
- `homepage.css`: -149 LoC (Loc-Block raus)
- `functions.php`: conditional enqueue von `loc-cards.css` auf Home + den 2 Detail-Pages

**Block 4 — Submenu-Rename (Folge-Commit `e3e0631`):**
- „Hauptpraxis" → „Hauptpraxis Grüneburgweg" für Disambiguation in der Drop-Down-Sicht

### Effekt

Editing `inc/practice-data.php` (Adresse, Telefone, Sprechzeiten, Hinweise) propagiert jetzt zu allen drei Render-Orten. Pattern: `single-source-ui-region` (S38) auf den Loc-Block angewendet.

### Files

`assets/css/homepage.css` · `assets/css/loc-cards.css` (NEU) · `functions.php` · `inc/nav-data.php` · `template-homepage.php` · `template-parts/loc-main.php` (NEU) · `template-parts/loc-secondary.php` (NEU) · `template-standard.php`

---

<a id="s45"></a>
## §S45 — Swipeable Room-Slider Zweigpraxis + Dynamic Height (PXZ 2.7.52 → 2.7.53)

**Theme-Commits:**
- `ff3720a` `feat(s45-rooms): swipeable room slider on /zweigpraxis-bockenheimer/ (PXZ 2.7.52)` · 5 Files +507/-1 LoC
- `901b602` `feat(s45-rooms): dynamic container height follows active slide (PXZ 2.7.53)` · 3 Files +50/-4 LoC

### Auftrag

Standort-Pages hatten bislang flache `core/media-text`-Blöcke pro Raum-Bild + Text → unübersichtlich auf Mobile, aufgeblähte Page-Höhe. Dr.-Stracke-Wunsch: Räume in einem Karussell darstellen, klickbar mit Pfeilen + Dots + Swipe + Tastatur, A11y-konform.

### Verlauf

**Phase 1 — Slider-Engine (Commit `ff3720a`):**
- Neu: `template-parts/room-slider.php` (130 LoC). Splittet `core/media-text`-Blöcke aus `post_content` via `parse_blocks()` in Slides. Non-media-text-Blöcke vor erstem Slide → Head, nach letztem → Tail.
- Neu: `assets/css/room-slider.css` (213 LoC). Container-Variante V1 (chalk-bg + 1 px line + soft shadow), 50/50-Desktop-Layout, Dot+Arrow-Controls, `prefers-reduced-motion`-Support
- Neu: `assets/js/room-slider.js` (139 LoC). Vanilla `pointerdown/move/up`-Events für Swipe (Mouse/Touch/Pen), Keyboard-Navigation (Left/Right/Home/End), ARIA-Controls
- `template-standard.php`: Conditional Render via Postmeta `pxz_use_room_slider`. Wenn aktiv, läuft Slider-Section in `.pxz-container` (1600 px) → matches Adress-Container-Breite oben; Tail-Content max 1140 px Lesebreite
- `functions.php`: PXZ 2.7.51 → 2.7.52, conditional enqueue von Room-Slider CSS+JS nur auf Standard-Template-Pages mit Toggle = 1
- Test-Bed: Page 9691 (`/standorte/`) bleibt unverändert; Page 9693 (`/zweigpraxis-bockenheimer/`) bekommt Slider mit 2 Slides aus bestehendem Media-Text-Content

**Phase 2 — Dynamic Container Height (Commit `901b602`):**
- Problem: Container-Höhe blieb fix → tote Fläche bei Hochformat-Slides, Overflow bei Querformat.
- Fix in `room-slider.js`: `setHeight()` misst `offsetHeight` der aktiven Slide und setzt es auf den Track bei jedem `update()`. `bindImages()` lauscht auf `image-load`-Events (WP gibt keine width/height-Attribute aus → ohne diesen Hook bleibt Initial-Höhe 0). Resize re-misst.
- `room-slider.css`: Track bekommt `align-items: flex-start`, damit non-active Slides ihre natürliche Höhe behalten. Transition wird auf `height` erweitert (0.4 s easing matches horizontal slide motion). Reduced-motion killt auch Arrow-Transitions.
- PXZ 2.7.52 → 2.7.53.

### Effekt

Container „atmet" — Hauptpraxis Hochformat-Flur und Querformat-Räume bekommen jeweils ihre eigene Höhe, keine tote Fläche mehr. Greift automatisch auf `/standorte/` und `/zweigpraxis-bockenheimer/`.

### Spec & Patterns

- Spec: `sites/praxis-webseite/specs/sprint-2/S45_room-slider.md` (10/10 AKs grün)
- Pattern neu: `Nexus/_memory/patterns/dynamic-height-flex-carousel.md`
- Pattern neu: `Nexus/_memory/patterns/wp-media-text-blocks-as-carousel.md`
- Cortex-Web-Commit: `6aea32f` `feat(s45): room-slider spec + session-resume + theme-pointer (PXZ 2.7.53)`

### Files

`assets/css/room-slider.css` (NEU) · `assets/js/room-slider.js` (NEU) · `functions.php` · `template-parts/room-slider.php` (NEU) · `template-standard.php`

---

<a id="s46"></a>
## §S46 — Fullbleed-Slider + Homepage-Carousel + Mobile-Audit + i18n-Nav-Parity (PXZ 2.7.63)

**Theme-Commits:**
- `7653efa` `feat(s46): fullbleed slider + homepage carousel + Aktuelles banner (PXZ 2.7.63)` · 10 Files +774/-66 LoC
- `2927f37` `feat(s46-followup): mobile responsive + EN/FR/ES nav parity (PXZ 2.7.63)` · 6 Files +202/-69 LoC

### Auftrag

Drei zusammenhängende Aufgaben:
1. **Slider-Engine erweitern** für Homepage-Hero (Fullbleed-Layout statt 50/50-Media-Text)
2. **„Aktuelles"-Banner extrahieren** als dauerhaft sichtbarer roter Hinweis-Block
3. **Mobile-Audit** der S46-Sizing-Bumps + **i18n-Nav-Parität** für EN/FR/ES (S42 hatte nur DE auf 5 Top-Level umgestellt)

### Verlauf

**Block 1 — Slider als Engine (Commit `7653efa`):**

| Element | Was |
|---|---|
| **Layout-Toggle** | `data-layout="fullbleed"` schaltet Slider von 50/50-Grid auf Image-on-top + Caption-below (`flex-column`-Slides) |
| **16:9-Aspect-Ratio** | Bild fix 16:9, Controls overlay mirrors aspect für Arrow-Positioning (`top: 50%` = Image mid ohne JS-Höhenmath) |
| **Auto-play 5 s** | Mit Wrap-around, Pause bei Hover/Focus/Visibility-Change, `prefers-reduced-motion`-Respect |
| **Größere Arrows** | 56–64 px, zentrierte Dot-Pill auf Image-Bottom |
| **Aktuelles-Banner** | Aus dem Carousel rausgezogen in dedizierten roten-Akzent-Banner unter dem Slider (immer sichtbar) |

**Daten-Aggregation:**
- Neu: `inc/homepage-slider-data.php` (44 LoC) — sammelt media-text-Blöcke aus Pages 9691 + 9693, daily-stable Fisher-Yates-Shuffle (Seed = Datum)
- Neu: `inc/slider-render.php` (158 LoC) mit `pxz_render_homepage_slider()`, `pxz_render_fullbleed_slide()`, `pxz_render_aktuelles_banner()`

**Header-Rebalance:**
- Logo +20 % (180/240/296 px statt 150/200/247)
- Wordmark „Praxiszentrum" bold + larger (2/2.5/3.25 rem)
- Nav-Items rebalanced (1.75/1.85 rem)
- CTA-Button enlarged + bold (34 px, 18×60 padding, 76 px min-height)
- Lang-Switcher fills column-width below CTA via `space-between`
- Hero-CTAs entfernt — primäre Action lebt jetzt im sticky Header

**Standort-Page-Cleanup:**
- 2 Hochformat-Room-Slides auf Page 9691 entfernt (Rooms 3 + 10 → passten nicht mehr zum Layout)
- `pxz_slider_layout=fullbleed` Postmeta auf 9691 + 9693 gesetzt

**Cache-Busting:**
- Helper `pxz_asset_ver()` in `functions.php` — filemtime-basiertes Asset-Versioning, auf room-slider.css/js angewendet (gegen stale-asset-Pain während Iteration)

**Nav-Cleanup:**
- „Aktuelles"-Item aus DE-Primary-Nav entfernt (war unter Praxis-Parent); EN/FR/ES hatten es nie

**Block 2 — Mobile-Audit (Commit `2927f37`):**

S46-Sizing war Desktop-zentriert, Mobile (320–640 px) brach. Folge-Commit nivelliert:

| Token | Mobile (≤640) | Tablet (640–1099) | Desktop (≥1100) | Dann (≥1280) |
|---|:---:|:---:|:---:|:---:|
| Logo | 110 px | 150 px | 240 px | 296 px |
| Wordmark | 1.4 rem | 2 rem | 2.5 rem | 3.25 rem |
| CTA | 17 px / 8×18 / 40 min-h | 22 px / 12×32 / 56 | 34 px / 18×60 / 76 | — |
| Slider-Caption-Heading | 20 px (statt T4 = 38 px) | — | — | — |
| Slider-Caption-Body | 16 px (statt T6 = 26 px) | — | — | — |

**Header-CTA-Label Mobile-Variante:**
- Neu: Feld `cta_appointment_short` in `inc/homepage-data.php` (DE/EN/FR/ES)
- `header-nav.php` liest Short-Label („Termin"/„Appointment"/„Rendez-vous"/„Cita")
- Long-Label („Termin anfragen" etc.) bleibt auf Final-CTA + mobile sticky-bottom CTA

**i18n-Nav-Parität:**
- EN/FR/ES bekommen die volle 5-Top-Item-Struktur (Praxis · Diagnostik · Leistungen · Service · Kontakt) mit übersetzten Children
- Hrefs bleiben auf DE-Slugs — WPML-Slug-Translation kommt erst in i18n-P6
- `match_prefix` synced mit DE → Active-State-Highlighting funktioniert in allen Sprachen

### Spec & Patterns

- Spec: `sites/praxis-webseite/specs/sprint-2/S46_homepage-slider-fullbleed.md`
- Cortex-Web-Commit: `5106dfc` `docs(s46): session 27 SESSION_RESUME §1 forward + spec + backups (PXZ 2.7.63)`

### Files

**Block 1 (`7653efa`):** `assets/css/homepage.css` · `assets/css/nav.css` · `assets/css/room-slider.css` · `assets/js/room-slider.js` · `functions.php` · `inc/homepage-slider-data.php` (NEU) · `inc/nav-data.php` · `inc/slider-render.php` (NEU) · `template-homepage.php` · `template-parts/room-slider.php`

**Block 2 (`2927f37`):** `assets/css/homepage.css` · `assets/css/nav.css` · `assets/css/room-slider.css` · `inc/homepage-data.php` · `inc/nav-data.php` · `template-parts/header-nav.php`

---

## Pre-Flight, Verify und Commit-Stand am Sprint-Ende

| Check | S43 | S44 | S45 | S46 |
|---|:---:|:---:|:---:|:---:|
| Theme-Commit | `6214b33` | `9907b7f` + `e3e0631` | `ff3720a` + `901b602` | `7653efa` + `2927f37` |
| PXZ-Version | 2.7.51 (über S44) | 2.7.51 | 2.7.52 → 2.7.53 | 2.7.63 |
| Cortex-Web-Doku-Commit | — (in `86b741c` S47-Catch-Up) | — (in `86b741c`) | `6aea32f` | `5106dfc` |
| HTTP-Sweep | nicht relaufen | nicht relaufen | manuell für 9691+9693 | nicht relaufen |
| `validate.sh` | nicht protokolliert | nicht protokolliert | nicht protokolliert | nicht protokolliert |
| `verify.sh` | nicht protokolliert | nicht protokolliert | nicht protokolliert | nicht protokolliert |

**Konsistenz-Anomalie:** Der Sprint lief ohne `SESSION_RESUME`-Updates und ohne pflichtige Sanitizer-Probes (LL-044). Nachträglich aufgearbeitet in S47 (`86b741c`) mit der §1.0-Catch-Up-Tabelle. Vollständige Detail-Chronik in diesem File (entstanden in Session 51 als Pilot der LL-053-Anti-Bloat-Architektur).

---

## Patterns + Specs + Tutorials (im Sprint entstanden)

| Artefakt | Pfad | Session |
|---|---|:---:|
| Spec S45 Room-Slider | `sites/praxis-webseite/specs/sprint-2/S45_room-slider.md` | S45 |
| Spec S46 Fullbleed-Slider | `sites/praxis-webseite/specs/sprint-2/S46_homepage-slider-fullbleed.md` | S46 |
| Pattern Dynamic-Height-Flex-Carousel | `Nexus/_memory/patterns/dynamic-height-flex-carousel.md` | S45 |
| Pattern WP-media-text-Blocks-as-Carousel | `Nexus/_memory/patterns/wp-media-text-blocks-as-carousel.md` | S45 |

Tutorials wurden in diesem Sprint nicht gepflegt — Tutorial 27 (Mid-Range-Type-Scale) entstand erst in S47.

---

## Lessons Learned (Pattern-Kandidaten, post-hoc)

- **S43-LL-1** Working-Copy-Bumps ohne Commit sind Zeitbomben: PXZ 2.7.50 stand im `style.css`-Header, aber nicht in der Git-Historie → frischer Checkout hätte Fatal-Error ausgelöst, weil 10 SVG-Icons + Helper fehlten.
- **S44-LL-1** „Single-Source-UI-Region" (S38-Pattern) skaliert über Loc-Cards hinaus auf jede mehrfach gerenderte Komponente. Voraussetzung: Daten-Quelle (`practice-data.php`) + Template-Parts + scoped CSS in eigener Datei.
- **S45-LL-1** WordPress liefert keine `width`/`height`-Attribute auf Bilder im Block-Output → Initial-`offsetHeight` ist 0 vor `image.load`. Pattern: `bindImages()` mit Load-Event-Hook, danach `setHeight()` re-measure.
- **S45-LL-2** `parse_blocks()` ist die richtige API für Block-Splitting in Themes. Nicht `the_content()` mit Regex-Hacks.
- **S46-LL-1** Sizing immer auf Mobile-First testen, nicht Desktop-First. S46 brauchte einen Folge-Commit (`2927f37`) für Mobile-Reparatur — wäre vermeidbar gewesen mit 5-Viewport-Probe schon in der Hauptarbeit (Pattern `mid-range-viewport-coverage` aus S47).
- **S46-LL-2** `pxz_asset_ver()` mit `filemtime()` als Cache-Buster ist robuster als manuelles Version-Bumpen während Iteration. PXZ_VERSION-Bumps bleiben für Major-Sprints, `filemtime` für File-Iteration.
- **Sprint-LL** Sammel-Sprint mit 4 Sessions an einem Tag ohne Resume-Updates → Doku-Schuld, die zwei Tage später (in Session 51) nachgeholt werden musste. **Konsequenz:** LL-053 (Sliding-Window-Auto-Archive) + Sanitizer-Hardgate, damit Resume-Pflege nicht mehr optional ist.

---

## Bezüge zu Folge-Sessions

- **S47** (Mid-Range-Reality-Check, `501f9d5` PXZ 2.7.71): rollte die Header-Sizing-Bumps aus S46 zurück (Logo 296 → 96, Wordmark erst ab 1440). Type-Scale T1–T8 von fix auf `clamp()` umgestellt, weil S46-Sizing ohne Mid-Range-Probe (1024–1440) Header-Overflow erzeugte.
- **S49** (Sanexio-Spiegel, `90fc4db` PXZ 2.7.72): Nav-Restructure von 5 → 5 anders (Praxis · **Untersuchungen** · **Labor** · Service · Kontakt). „Diagnostik" → „Untersuchungen" mit Slug-Wechsel + 301-Redirect.
- **S50** (Sanexio-Detail-Page-Mirror, PXZ 2.7.73): 25 Detail-Pages mit Sanexio-Layout (Hero + Body + 2 Karussells).

---

*Erstellt 2026-04-28 in Session 51 als Pilot der LL-053-Anti-Bloat-Architektur (Front γ). Quelle: git-log Theme + Cortex-Web, Spec-Files S45/S46, Theme-Pointer.*
