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

### Aktueller Prio-Stand (2026-04-25, Ende Session 40)

| Prio | Block | Status | Next Session |
|:---:|---|:---:|:---:|
| **P1** | Medien-Pipeline (ohne Framework): 2/8 Fotos live, Asset-Bestand im Trunk konsolidiert | 🟢 **durch (Block A)** | 6 weitere Fotos = externer Foto-Shoot |
| **P2** | Prod-Deployment-Pipelines (Praxis via DF/SFTP + Juvantis-Shopify-Sync dokumentiert) | 🟡 offen, DF-Support extern blockiert | wenn C-1 freigegeben |
| **P3** | Praxis Content-Rest (Block B) | 🟢 **durch (S34–S36 MVP-Sprint)** | — |
| **Ppol-type** | **S40 Apple Type-Scale** (T1–T8 Tokens, Pill-Buttons, Body ×1.5 Option B, DS-1..DS-6) | 🟢 **durch, committed** `cc2a0e2` (Theme) + `a4898ba` (Cortex-Web) | — |
| **Ppol** | **S40-Folge-Iteration** (Dr.-Stracke-Interaktiv-Polish): Footer Text ×2 + full-width + Flex; Homepage 1987→2019, Hero-Sub 2-Zeilen, Hero/Final-CTA ×2, Final-priv ×2, MFA×1.5; Loc-Badges ×3 + Zweitstandort-Hours + Anfahrt-Button symmetrisch; Footer-Logo ×4 auf Header-SVG | 🟡 **technisch durch · Working-Tree uncommitted** | **Session 41 · Default: Sammel-Commit** |
| **P4** | **M1**: Erster Prod-Push westend-hausarzt.com + Verify | 🔴 Meilenstein | nach Sammel-Commit + L-1/L-2 + C-1 |
| **P5** | Juvantis Content-Alltag (2–3 weitere Bridge-Seiten, Content-Pflege als Gewohnheit) | 🔴 offen | nach M1 |
| **P6** | Mehrsprachigkeit Praxis (i18n-Mechanik + externe Übersetzungen + Integration) | 🔴 offen | nach P5 |
| **Ppol-rest** | A11y-Audit, Mobile-Finish, Design-Token-Feinschliff | 🔴 offen | nach P4 |
| **Popt** | N-6.4, N-6.5, Pattern C (Metafield), Media-Registry-Framework | ⏸ gefrierend | **nur bei Pain-Point** |
| **Pios** | N-3 Design-Token + iOS-Adapter | ⏸ gefrierend | **wenn iOS-App-Scope aktiv wird** |

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

- **Version:** `0.9.4` — Session 40 **Apple Type-Scale (S40) + Folge-Iteration (Dr.-Stracke-Interaktiv-Polish)** (2026-04-24/25, Cluster-Mini-02)
- **Stand:** 2026-04-25, **S40 DS-Block abgeschlossen + committed**, S40-Folge-Iteration uncommitted:
  - **Theme-Stand:** PXZ **2.7.31 → 2.7.32 (S40-B committed `cc2a0e2`) → 2.7.34 uncommitted** (Working-Tree)
  - **S40 DS-Block (DS-1…DS-6):** Dr. Stracke wählte `apple.com/de` als Referenz. Puppeteer-Probe extrahierte 8-Stufen-Skala. T1–T8 in `tokens.css` (Schicht 1 Primitives + Schicht 2 Semantic), 116 font-size-Deklarationen in 6 Content-CSS-Dateien auf T-Tokens gemappt, Apple-Pill-Buttons (border-radius 9999, 17 px Font, 44 px Höhe Desktop · 14 px / 36 px Mobile, font-weight 400), Body ×1.5 als Option B (T6=26, T5=32, T4=42, T7=23, T8=21; T4 > T3 Inversion bewusst akzeptiert), Button-Font entkoppelt von T6 (eigene Primitives), Mobile-Stufen-Shift T1–T5 via @media. Commit `cc2a0e2` (Theme) + `a4898ba` (Cortex-Web: Spec + Evidence + verify.sh-Assertions auf Token-Matches).
  - **S40-Folge-Iteration (uncommitted, Session-40-Nachmittag/Abend):**
    - **Footer-Paket:** 15 font-size ×2 (Brand 18/22→36/44, Tagline/Col-Title 12→24, Links 15→30, Address 14→28, Bottom 13→26), `.pxz-footer-inner max-width: none` (volle Viewport-Breite), Flex `justify-content: space-between` (Adresse linksbündig, Navigation rechtsbündig, Kontakt+Sprechzeiten äquidistant), Claim-Text one-line ab 1280 px.
    - **Homepage-Polish:** `1987 → 2019` (4 Sprachen eyebrow), Hero-Subtitle mit `<br>` + wp_kses auf 2 Zeilen (`max-width: none`), Hero-CTA-Buttons ×2 (34/88/22-42), Final-Title `<br>` raus (1 Zeile), Final-Card max-width 720→1200 px, Final-CTA-Buttons ×2, Final-priv ×2 (23→46 px), MFA-Buttons ×1.5 (26/66).
    - **Standort-Karten:** `.pxz-loc-badge` Pills (Hauptstandort/Zweitstandort) ×3 (11→33 px), Zweitstandort-Sprechzeiten neu (`loc_sec_hours` Mittwoch 08:00–14:00), Zweitstandort-Anfahrts-Button neu (Bockenheimer Landstraße), `.pxz-loc-num`-Block („Standort 1"/„Standort 2") entfernt (redundant zu Badges), `.pxz-loc-card--sec .pxz-loc-info` Grid-Override raus (3-Spalten-Layout wie Hauptstandort).
    - **Footer-Logo:** Vom stilisierten Mini-Icon (`assets/img/logo.svg`) auf Header-SVG (`assets/logo.svg`) umgestellt via `<img src>` statt inline, dann Container ×4 (72→288 Mobile, 88→352 Desktop), Grid-Column Brand-Row 88→352 px.
    - **Zwischenzeitlicher Fehler + Rückrollung:** `.pxz-loc-directions` wurde 3× skaliert (×2, ×4 von Apple-Base) auf fälschliche Interpretation „Hauptstandort-Button" = Anfahrts-Button; nach Klärung durch Dr. Stracke (*„DAS HIER IST DER FALSCHE BUTTON"*) auf Apple-Base-Token-Referenz zurückgerollt, der neu angelegte Zweitstandort-Anfahrts-Button bewusst rückwärts behalten (wurde in Folge-Request wieder aufgenommen). Pattern `button-text-disambiguation` abgeleitet.
- **Working-Tree am Session-Ende 40:** 7 Theme-Files modified (`assets/css/footer.css`, `assets/css/homepage.css`, `functions.php` → 2.7.34, `inc/homepage-data.php`, `inc/practice-data.php`, `template-homepage.php`, `template-parts/site-footer.php`), SESSION_RESUME.md + evtl. neue Cortex-Web-Evidence (footer-shots/, homepage-polish/, probe-footer.mjs). **Bewusst NICHT committed** — Session 41 macht Sammel-Commit nach Dr.-Stracke-Freigabe am Sessionstart.
- **Pre-Flight Session-Ende 40:** `validate.sh` 🟢 · `verify.sh` 🟢 (10 Showpieces delta=0 auf 1440+430) · Sanitizer alle Dateien im Budget · pending-Queues leer

### §1.1 Phasen-Status

| Phase | Ziel | Status |
|:---:|------|:---:|
| 0–5 | Cortex-Web-Aufbau | ✅ |
| Praxis-Sprint-2 (S2.3 + S2.4) | 6 Cluster + Menü + Bridge | ✅ |
| content-bridge-v1 + cross-site-transfer | Adapter-Suite + 6 Patterns + 4 Registries | ✅ Session 22 |
| Sanitizer V4 + V5 | Token-Budget-Pflege automatisiert | ✅ Session 23 |
| Adapter-Symmetrie A/B (S24..S30) | Push/Pull/Diff für Pages + Templates | ✅ |
| CW-PRIO-001 + Block A | Holistische Prio + 2 Arzt-Fotos | ✅ Session 31–33 |
| **MVP-Rohling (S34–S36)** | Block B durch: 29/29 URLs HTTP 200 | ✅ siehe §3-legacy-36 |
| **S38 Header-Polish** | PXZ 2.7.29: Header 21 px bold + 4+3-Umbruch | ✅ committed `bca1521` |
| **S39 Home-Polish** | Hero-Bild Empfang + Sprachen-Stack + Content +25 % | ✅ im S40-Bundle committed `cc2a0e2` |
| **S40 DS-Block Apple Type-Scale** | T1–T8 + Pill-Buttons + Body ×1.5 | ✅ committed `cc2a0e2` + `a4898ba` |
| **S40-Folge-Iteration (Dr.-Stracke-Interaktiv-Polish)** | Footer ×2/full-width/flex + Homepage-Polish + Badges ×3 + Footer-Logo ×4 + Zweitstandort-Hours | 🟡 **uncommitted** — Session 41 startet mit Sammel-Commit |

**Status:** S40 DS-Block abgeschlossen und committed. Folge-Iteration technisch durch (7 Theme-Files + Template + Data), verify grün, aber noch uncommitted. Pre-Live-Blocker unverändert: L-1/L-2 (extern), C-1 (extern). Pfad zu M1: ~2–3 Sessions (Sammel-Commit + Legal + Deploy).

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

## §3 Letzte Session — Session 40, 2026-04-24/25 (Apple Type-Scale + Dr.-Stracke-Interaktiv-Polish)

### Gerät
**Cluster-Mini-02** (home-Mac M2).

### Auftrag
„Projekt fortsetzen Cortex-Web" → DS-Block Type-Scale. Im Verlauf Freigabe zu mehreren Folge-Iterationen (Footer, Homepage-Polish, Badges, Footer-Logo).

### Verlauf in zwei Phasen

**Phase A — DS-Block (DS-1 bis DS-6):**
- **DS-1 Referenz-URL:** Dr. Stracke wählt `apple.com/de`, Scope „Buttons, Schrift, Größen der Content-Sektion; Header + Footer separat". IST-Analyse: PXZ-Theme nutzte bereits Apple-System-Font-Stack und Apple-Farbpalette, nur Größen-Verhältnisse fehlten.
- **DS-2 Puppeteer-Probe:** `probe-apple.mjs` misst 1920/1440/430 px, clustert Content-Text-Elemente (ausgeschlossen nav/footer/banner), extrahiert CTAs separat. Ergebnis: 6 dominante Stufen (56/40/28/21/17/14 px), Button-Pattern 17/44/11/21/9999 desktop, 14/36/7/15 mobile, font-weight 400. Snapshot in `apple-scale.json`.
- **DS-3 Tokens:** T1 (80 Mega-Hero) + T2–T7 empirisch + T8 (14 Caption) in Schicht 1, Schicht-2-Aliase, Mobile-Stufen-Shift T1–T4 (T5–T8 bleiben), Button-Tokens komplett entkoppelt (eigene Primitives `--btn-font-size-desktop/-mobile`).
- **DS-4 Selektor-Mapping:** 116 font-size-Deklarationen in `homepage.css`, `components.css`, `arzt.css`, `team.css`, `karriere.css`, `leistungen.css` auf T-Tokens, alle `.pxz-btn` auf Pill-Token. PXZ-Version 2.7.31 → 2.7.32. `verify.sh` Assertions von literalen px auf Token-Matches umgestellt.
- **DS-5 Phase-4-Probe + Option B:** Dr. Stracke wählte Option B („T4 mit verdoppeln") bei Body ×1.5 — T4=42 > T3=40 Inversion akzeptiert. Probe 12/12 Pages OK, Body 26/Hero 80 (Home+Karriere) / 40 (Arzt+Leistungen), Buttons entkoppelt 17/14. `.pxz-home` / `.pxz-arzt` / `.pxz-team` / `.pxz-leistungen` bekamen explizit `font-size: var(--pxz-t6-size)` (sonst erbten sie Blocksy-Default).
- **DS-6 Gebündelter Commit:** Theme `cc2a0e2` (S39+S40 bundle, 11 Files), Cortex-Web `a4898ba` (Spec + 15 PNG-Screenshots + 2 JSON + 2 probe-Scripts + verify-Assertion-Update).

**Phase B — Dr.-Stracke-Interaktiv-Polish (11 weitere Requests):**
1. **Footer alle Texte ×2 + volle Breite:** 15 font-size in `footer.css` ×2, `.pxz-footer-inner max-width: none`. PXZ 2.7.32 → 2.7.33.
2. **Claim 1 Zeile + Spalten-Gleichverteilung:** `max-width: 72ch` raus + `white-space: nowrap` ab 1280 px; `.pxz-footer-grid gap: 64px` ab 1280 (= Container-Padding).
3. **Adresse linksbündig, Nav rechtsbündig, Mittlere äquidistant:** Grid → Flex `justify-content: space-between`, Spalten natürliche Content-Breite.
4. **Homepage-Polish (Eyebrow 2019, Hero-Sub 2 Zeilen, Hero/Final-Buttons ×2, Final-Title 1 Zeile, Final-priv ×2):** `inc/homepage-data.php` 4×1987→2019 + `<br>` in `hero_subtitle`, `template-homepage.php` `wp_kses` für subtitle + `<br>` in Final-H2 raus, `homepage.css` Hero-CTAs + Final-CTAs Selektor-Override 34/88/22-42, Final-Card 720→1200 px, Final-priv 46 px.
5. **Mobile Hero-Sub:** 2 Zeilen auf Desktop, Mobile bricht natürlich auf 6 Zeilen (akzeptiert).
6. **MFA-Buttons ×1.5** („Jetzt bewerben" + „Mehr über die Stelle"): Selektor-Override `.pxz-mfa-hero-ctas .pxz-btn` 26/66/17-32.
7. **Standort-Badges „Hauptstandort"/„Zweitstandort" ×3** (11 → 33 px Font). *(Umweg: erst falsch `.pxz-loc-directions` skaliert, nach Klärung rückgerollt — Pattern `button-text-disambiguation` abgeleitet.)*
8. **„Standort 1"/„Standort 2"-Eyebrows entfernt** (redundant zu Badges), **Zweitstandort bekommt Anfahrt-Button** (Maps auf Bockenheimer Landstraße).
9. **Zweitstandort-Sprechzeiten:** `loc_sec_hours` Mittwoch 08:00–14:00, Template-Block analog Hauptstandort, `.pxz-loc-card--sec .pxz-loc-info` 2-Spalten-Override raus → 3-Spalten wie Hauptstandort.
10. **Footer-Logo wie Header:** `file_get_contents` + Inline-SVG aus `assets/img/logo.svg` → `<img src>` aus `assets/logo.svg` (873 KB, echtes Praxis-Logo). `filter: brightness(0) invert(1)` entfernt (machte rotes Logo unsichtbar). Mini-Container-Styling (runder Hintergrund, Padding) aufgeräumt.
11. **Footer-Logo ×4:** 72→288 Mobile, 88→352 Desktop; `.pxz-footer-brand grid-template-columns: 352px 1fr` mitgezogen. PXZ 2.7.33 → 2.7.34.

### Pre-Flight-Metriken am Session-Ende
- `validate.sh` — OK · `verify.sh` — VERIFY OK (10 Showpieces delta=0)
- Sanitizer — alle 5 Dateien im Budget (MEMORY 4200, Nexus/CLAUDE 6616, GLOBAL_RULES 8391, SESSION_RESUME 6077 vor Edit, cortex-agent 1721)

### Working-Tree (Commit-Stand am Session-Ende)
- **Cortex-Web** ✏️ uncommitted: SESSION_RESUME.md + Evidence (footer-shots/, homepage-polish/, probe-footer.mjs)
- **Theme** ✏️ uncommitted (7 Files): `assets/css/footer.css`, `assets/css/homepage.css`, `functions.php` (PXZ 2.7.34), `inc/homepage-data.php`, `inc/practice-data.php`, `template-homepage.php`, `template-parts/site-footer.php`
- **Nexus** zwei neue Patterns + ein Tutorial (Session-Ende dokumentiert, werden mit MEMORY.md-Update committed)
- **Bewusst NICHT committed** — Session 41 startet mit Sammel-Commit

### Patterns + Tutorial (neu in Session 40)
- **Pattern:** `Nexus/_memory/patterns/reference-driven-type-scale.md` — DS-1..DS-6-Workflow als reproduzierbares Muster
- **Pattern:** `Nexus/_memory/patterns/button-text-disambiguation.md` — bei mehrdeutigen Button-Anfragen konkreten Text abklären
- **Tutorial:** `Second Brain/30 Tutorials/Webentwicklung/Webdesign/10-type-scale-referenz-basiert.md` — 6-Schritte-Anleitung für Dr. Stracke

### Nicht erledigt (bewusst)
- **Sammel-Commit der S40-Folge-Iteration** — Session-41-Einstieg
- **Andere Sprachen en/fr/es** für `loc_sec_hours` — noch nicht gesetzt (defensive `?? []` im Template, keine Fehlermeldung)
- Externe Blocker unverändert (L-1/L-2, C-1, A-2, FAQ-Content)

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

> **Strategie-Rahmen:** CW-PRIO-001. Home-Polish technisch durch (S39), wartet auf Type-Scale-Iteration S40. Danach gebündelter Commit + Externe-Blocker-Loop (L-1/L-2 + C-1) für M1.

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

### Hygiene Session 41 (Eintritts-Status)
1. 🟡 **Theme uncommitted** — 7 Files modified (footer.css · homepage.css · functions.php PXZ 2.7.34 · homepage-data.php · practice-data.php · template-homepage.php · site-footer.php)
2. 🟡 **Cortex-Web uncommitted** — SESSION_RESUME.md + Evidence-Ordner (footer-shots/, homepage-polish/, probe-footer.mjs)
3. 🟡 **Nexus uncommitted** — MEMORY.md, 2 neue Patterns (reference-driven-type-scale, button-text-disambiguation), 1 neues Tutorial (10-type-scale-referenz-basiert)
4. 🔲 **Commit-Strategie Session 41:** Sammel-Commit direkt zum Sessionstart vor neuen Edits

### Folge-Blöcke (nach M1)
- **E** Juvantis Content-Alltag (P5)
- **F** Mehrsprachigkeit Praxis (P6)
- **G** Design-Polish / A11y / Mobile-Feinschliff (Ppol-Rest, post DS-*)

### Gefrierend offen (nicht anfassen bis Praxis live)
- Medien-Registry-Framework · Shopify-Media-Upload-Pfad · N-6.4 / N-6.5 · N-3 Design-Token · `_inbox/media-root/` Sortierung

### Ewige externe Blocker
- Santapress-Archive-Entscheidung fällig ab 2026-05-19
- Sono-atlas DSGVO-Gate (R-7)

---

## §5 Sofort-Status-Frage an Dr. Stracke — Session 41

> **S40 DS-Block abgeschlossen + committed** (`cc2a0e2` Theme + `a4898ba` Cortex-Web): Apple-Type-Scale T1–T8, Pill-Buttons, Body ×1.5 Option B live. Anschließend **11 Dr.-Stracke-Interaktiv-Polish-Iterationen** auf Footer + Homepage + Standorte + Footer-Logo — alle technisch durch, Working-Tree uncommitted.
>
> **Default für Session 41 — Sammel-Commit der S40-Folge-Iteration:**
> Drei Commits vorbereiten —
> 1. **Theme-Repo** (`praxiszentrum`, 7 Files + PXZ 2.7.34): `feat(s40-polish): footer full-width + homepage-polish + loc-redesign + footer-logo (PXZ 2.7.34)`
> 2. **Cortex-Web-Repo** (SESSION_RESUME.md + S40_evidence/footer-shots/ + homepage-polish/ + probe-footer.mjs): `docs(s40-polish): session-40 resume + evidence shots`
> 3. **Nexus-Repo** (MEMORY.md + 2 Patterns + 1 Tutorial): `docs(session-40): memory + patterns + type-scale tutorial`
>
> Nach Commit: **M1-Pfad** (P4 Prod-Launch). Alternative Fronten:
> - **L-1/L-2 Legal-Review-Iteration** (P4, M1-Pfad) — Impressum/DSE Text-Arbeit
> - **C-1 DF-Support reaktivieren** (P4, M1-Pfad) — SFTP-Zugang wiederherstellen
> - **B-1 Volltext-Bio** (P3) — wenn CV-Stichworte bereit
> - **Andere Sprachen für `loc_sec_hours`** (en/fr/es Wednesday/Mercredi/Miércoles) — falls i18n-Symmetrie gewünscht
>
> **Nicht in der Default-Liste (Popt/Pios, gefrierend):** Media-Registry-Framework · N-6.4/6.5 · iOS · `_inbox/`-Sortierung.

---

## §6 Verbote / harte Regeln (Session 41 NIE passieren darf)

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

---

## §7 Archivierte Sessions — Index

Alle historischen Session-Logs unter `_archive/sessions/YYYY-MM/`.

| Session | Datum | Thema | Archiv-Pfad |
|:---:|---|---|---|
| 40 | 2026-04-24/25 | Apple Type-Scale (DS-1..DS-6): T1-T8 Tokens + Pill-Buttons + Body ×1.5 Option B + 11 Polish-Iterationen (Footer ×2/full-width, Homepage-Polish, Badges ×3, Footer-Logo ×4, Loc-Hours). Bundle-Commit `cc2a0e2` (Theme) + `a4898ba` (Cortex-Web). S40-Folge-Iteration uncommitted. | §3 (aktuelle Session) in dieser Datei |
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
