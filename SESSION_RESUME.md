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

- **Version:** `0.9.5` — Session 41 **Re-Priorisierung „DE-Content vor i18n" + S37-Header-Rollback + 9 DE-Slug-Stubs + 8 Slug-Mismatch-Redirects + Reading-Width 1,5× + Doctolib/Footer/Homepage-Polish** (2026-04-25, Cluster-Mini-02). Theme-HEAD `5e9bb22` PXZ 2.7.35. Cortex-Web/Nexus-Commits siehe §3.

- **Stand:** 2026-04-25 Ende S41:
  - **Theme-Stand:** PXZ **2.7.34 → 2.7.35** committed `5e9bb22` (11 Files, +81/-58 LoC).
  - **DB-Migration (separat zu dokumentieren für Prod-Push):** 9 publish stub-Pages (IDs 9701-9709) + WPML-DE-Zuweisung in trid 14701-14709 (FAQ ID 9705 in trid=602 verschmolzen mit EN/ES/FR-Übersetzungen). 4 alte Konflikt-Pages auf `<slug>-legacy-<id>` (IDs 472, 475, 5709, 4028).
  - **inc/redirects.php:** 5 Einträge entfernt (sind jetzt eigene Stub-Pages), 8 Slug-Mismatch-Redirects ergänzt (`arzt-team`, `dr-siegbert-stracke-mba`, `labordiagnostik`, `schilddruesen-sonographie`, `ultraschall-der-beingefaesse`, `internistische-…`, `ultraschalldiagnostik`, `projekt-docvocat`).
  - **HTTP-Sweep S41:** 21/21 = 200 (9 Stubs direkt + 12 alte URLs via 301).
  - **CSS-Grossreparaturen:** Header zurück 1-Zeile (Flex statt Grid 4+3), Footer-Override-Block aus `homepage.css` entfernt → Single-Source `footer.css` greift überall (Footer-Variante des `single-source-ui-region`-Patterns), Reading-Width 1,5× in `standard.css`+`page.css`, Doctolib-Floating-Button mittig rechts statt unter Header.
  - **Homepage-Texte:** mfa_subtitle 3 Zeilen, spec_intro 2 Zeilen, spec/team/loc-Title 1 Zeile (Hard-`<br>` + Container-Caps gelockert).
  - **Sanitizer (S41-Ende):** alle 5 Dateien im Budget. 0 Duplikate, 0 Cross-Project-Leaks. 95 stale-refs (Bestand).
- **Pre-Flight Session-Ende 41:** `validate.sh` 🟢 · `verify.sh` 🟢 (10 Showpieces delta=0) · pending-Queues leer

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
| **Praxis DE-Content P3a (NEU)** | 9 Stub-Texte schreiben + Menü-Restrukturierung + DE-SEO-Pass | 🔴 startet S42 |

**Status:** S41 abgeschlossen. Pre-Live-Blocker unverändert: L-1/L-2 (extern), C-1 (extern). Neuer Block P3a (DE-Content-Vervollständigung) wird vor M1 abgearbeitet.

### §1.2 Vorherige Session — Stand-Auszug Session 40 (verkürzt, voll im Archiv)
S40 DS-Block Apple Type-Scale (T1–T8 Tokens, Pill-Buttons, Body ×1.5 Option B) committed `cc2a0e2`+`a4898ba`. S40-Folge-Iteration (Footer ×2/full-width, Homepage-Polish, Badges ×3, Footer-Logo ×4, Loc-Hours) committed `7265c70`. Patterns: `reference-driven-type-scale`, `button-text-disambiguation`. Tutorial 10 (`type-scale-referenz-basiert`). Voll-Log siehe `_archive/sessions/2026-04/session-40-apple-type-scale.md` (TODO Auslagerung).

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

## §3 Letzte Session — Session 41, 2026-04-25 (Re-Priorisierung „DE-Content vor i18n" + S37-Header-Rollback + 9 DE-Slug-Stubs + Reading-Width 1,5× + Doctolib/Footer/Homepage-Polish)

### Gerät
**Cluster-Mini-02** (home-Mac M2).

### Auftrag
„Projekt fortsetzen Cortex-Web". Dr. Stracke korrigiert die Prio-Leiter im Verlauf: „erst DE-Content komplett abschließen, komplette Menüführung etablieren, DE-Funktionalität testen, DE-SEO-Pass, DANN auf andere Sprachen transferieren". Parallel mehrere Polish-Iterationen.

### Verlauf in vier Blöcken

**Block 1 — Header-Rollback (Sofort-Mini-Step):**
- `nav.css`: S37 4+3-Grid (`grid-template-columns: repeat(4, auto)`) → Single-Row-Flex (`display: flex; flex-wrap: nowrap`). PXZ 2.7.34 → 2.7.35.

**Block 2 — DE-Content-Bestandsaufnahme + Slug-Lücken-Schluss:**
- Original-Site `westend-hausarzt.com/page-sitemap.xml` (47 DE-Pages) ↔ lokale REST-API (48 Pages) verglichen. 12 Slug-Mismatches und 9 inhaltliche Lücken identifiziert.
- Standort-Konflikt geklärt: Dr. Stracke bestätigt „Alte Oper" = Bockenheimer (Bezeichnungs-Wechsel, kein neuer Standort).
- 9 Slug-Stub-Pages angelegt via WP-CLI (IDs 9701–9709): `beschwerden-beim-wasserlassen`, `covid-19-risikofragebogen`, `fragebogen-bauchschmerzen`, `fragebogen-personalisierte-medizin`, `frequently-asked-questions`, `rund-ums-impfen`, `rund-ums-labor`, `corona-impfung`, `cookie-richtlinie-eu`.
- 4 Konflikt-Pages (3 Drafts + 1 Private mit gleichem Slug) auf `<slug>-legacy-<id>` umbenannt (IDs 472, 475, 5709, 4028) → meine Stubs bekamen finalen Slug ohne `-2`-Suffix.
- WPML-DE-Zuweisungen via direktem SQL in `wp_icl_translations` (trid 14701–14709). FAQ-Sonderfall: trid=602 hatte schon EN/ES/FR, mein Stub 9705 wurde als DE-Master in diese Übersetzungs-Gruppe verschmolzen (alte trashed DE-Variante ID 398 ist im Trash, der DE-Slot war frei).
- `inc/redirects.php`: 5 Einträge entfernt (FAQ, cookies, fragebogen-bauch, beschwerden, fragebogen-pers — sind jetzt eigene Pages); 8 Slug-Mismatch-Redirects ergänzt.
- HTTP-Sweep nach `wp rewrite flush`: 21/21 = 200 (9 Stubs + 12 alte URLs via 301).
- **Sono-Atlas**: auf Dr.-Stracke-Wunsch komplett übersprungen (kein Stub, kein Redirect — wird neu angelegt wenn Bedarf).

**Block 3 — Footer + Doctolib-Polish (1) + Reading-Width (2) + Doctolib-Position (3):**
1. **Footer-Adresse linksbündig + Nav-Links weiß:**
   - `template-parts/site-footer.php`: Doctolib-CTA aus Col 2 (Kontakt) → Col 1 (Adresse, unter Adress-Stack).
   - `footer.css`: `.pxz-footer-nav a` `var(--pxz-line)` → `var(--pxz-white)`, Hover wechselt jetzt zu rot. `.pxz-footer-appointment-cta margin-top` 14 → 32 (Luft im Address-Stack).
   - **Wichtigster Fund S41 (Single-Source-Verstoß diesmal Footer):** Dr. Stracke meldet „auf Startseite ist Nav nicht weiß". Ursache: `homepage.css` Z. 485–503 enthielt einen kompletten chalk-Footer-Override mit grauen Links, der den S40-Footer auf der Homepage überschrieb. Override-Block entfernt → Single-Source `footer.css` greift auch auf Home. Pattern `single-source-ui-region.md` erweitert.
2. **Reading-Width 1,5× (Architekten-Wahl C-α):** `standard.css` 6 max-widths × 1,5 (760→1140, 840→1260, 680→1020, 1120→1680, 1040→1560), `page.css` 2 max-widths × 1,5. Hub-/Doctor-/Team-/Karriere-/Kontakt-Layouts bewusst NICHT angefasst (eigene Card-/Grid-Strukturen, würden bei 1,5× Viewport-Overflow geben).
3. **Doctolib-Floating-Button (D-B mittig rechts):** `components.css` neuer §7 mit `a[href*="doctolib.de"][style*="position:fixed"] { top: 50% !important; transform: translateY(-50%) !important; }` — überschreibt Inline-Style des Doctolib-Widgets, kein Header-Konflikt mehr, responsive ohne JS.

**Block 4 — Homepage-Texte (Hard-Break-Struktur + Container-Caps):**
- `inc/homepage-data.php` DE: `mfa_subtitle` 2× `<br>` (3 Zeilen), `spec_intro` 1× `<br>` (2 Zeilen).
- `template-homepage.php`: Z. 87/121/191 `spec/team/loc_title` `<br>` → ` ` (1 Zeile); Z. 88 `spec_intro` `esc_html` → `wp_kses ['br'=>[]]`. Service- und CTA-Title hatten bereits ` `.
- **Container-Caps gelockert (Iteration 1):** `.pxz-home .pxz-sect-head { max-width: none; }` + `.pxz-home .pxz-sect-intro { max-width: 75ch; }`. components.css `52rem`-Cap zwang die Title-Pairs auf 2 Zeilen trotz fehlendem `<br>`.
- **Container-Caps gelockert (Iteration 2):** MFA-Subtitle blieb in 5+ Zeilen statt 3. Ursache: nicht `.pxz-mfa-sub max-width: 40rem` (das hatte ich schon entfernt), sondern Parent `.pxz-mfa-hero { max-width: 56rem }` cappte den Container — `none` setzen behoben.
- **Cache-Diagnose (Bonus-Lerneffekt):** WP Object-Cache, WP Transients, Browser, privates Fenster — Server liefert immer korrekt aus, Symptom auf Browser-Side war reine CSS-Cap-Wirkung, nicht Cache.

### Pre-Flight-Metriken am Session-Ende 41
- `validate.sh` — OK · `verify.sh` — VERIFY OK (10 Showpieces delta=0 auf 1440 + 430)
- Sanitizer `--learn`: 0 Duplikate · 0 Cross-Project-Leaks · 95 stale-refs (Bestand) · alle Dateien im Budget
- HTTP-Sweep S41: 21/21 = 200 (9 Stubs + 12 Redirects)
- Pending-Queues leer

### Working-Tree (Commit-Stand am Session-Ende 41)
- **Theme** ✅ committed `5e9bb22` — `feat(s41): header 1-row rollback + 9 DE slug stubs + reading-width 1.5x + footer/doctolib polish + homepage line-breaks (PXZ 2.7.35)` — 11 Files, +81/-58 LoC
- **DB** ✅ Live in Local-WP — wird beim Prod-Push als separates Migrations-Skript gebraucht (siehe „Nicht erledigt" unten)
- **Cortex-Web** 🟡 uncommitted: SESSION_RESUME.md (dieses Update) — wird gleich committed
- **Nexus** 🟡 uncommitted: `single-source-ui-region.md` Pattern-Erweiterung + MEMORY.md Praxis-Zelle-Update — wird gleich committed

### Patterns + Tutorial (neu/erweitert in Session 41)
- **Pattern erweitert:** `Nexus/_memory/patterns/single-source-ui-region.md` — neuer Abschnitt „Wiederholtes Vorkommen — Footer-CSS-Variante (S41)". Footer-Tabelle aktualisiert, drei neue Lessons (Architekturregel beim Komponenten-Refactor, Render-Cache-Tarnung-Pitfall, Komponenten-Inventar-Pflicht).
- **Tutorial offen (TODO S42):** „WP-CLI mit Local-by-Flywheel auf Mac (Sock-Pfad-Workaround)" — wäre nützlich für künftige DB-Operationen, aber nicht zeitkritisch.

### Nicht erledigt (bewusst, S42 oder später)
- **DB-Migrations-Skript für Prod-Push:** 9 Slug-Stubs müssen auch auf Prod-DB existieren. Aktuell nur lokal. Pflicht-Punkt vor M1.
- **Volltext-Content für die 9 Stubs** — Dr. Stracke schreibt selbst. P3a-Block.
- **Menü-Restrukturierung** (31 lokale Pages aktuell unverlinkt) — P3a-Block.
- **DE-SEO-Pass** — P3a-Block.
- **MFA-Subtitle Schrift-Cap:** ~135 Zeichen passen auch bei Card-Voll-Breite nicht in echte 1 Zeile. Optional Schrift T6 statt T5 ODER Text kürzen — Dr. Stracke entscheidet bei Content-Edit „die Texte müssen wir eh umschreiben".
- **Andere Sprachen** für mfa_subtitle/spec_intro `<br>`-Struktur — i18n-Sprint (P6).
- Externe Blocker unverändert (L-1/L-2, C-1, A-2).

### Konsistenz-Auffälligkeiten (KON-001)
- `sites/praxis-webseite/SESSION_RESUME.md` ist mit ~35 k Tokens (Stand Session 19, 22.04.) **stark veraltet** und überholt durch dieses Cortex-Web RESUME. Wird vom Sanitizer NICHT überwacht (nicht in `--probe`-Liste). LL-044-Kandidat für Rotation in S42.

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

> **Strategie-Rahmen S41 (Re-Prio Dr. Stracke 2026-04-25):** „DE-Content komplett → Menüführung → DE-Funktionalität testen → DE-SEO → dann i18n-Transfer". Block P3a (DE-Content-Vervollständigung) ist neu vor M1 eingezogen. Externe Blocker L-1/L-2 + C-1 unverändert.

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

## §5 Sofort-Status-Frage an Dr. Stracke — Session 42

> **S41 abgeschlossen** (Theme `5e9bb22` PXZ 2.7.35). **Re-Priorisierung verankert:** „DE-Content komplett → Menü → DE-Test → DE-SEO → dann i18n". Block P3a (DE-Content-Vervollständigung) ist neu vor M1.
>
> **Default für Session 42 — DE-Content-Vervollständigung starten (P3a):**
>
> | | Front | Was passiert | Trade-off |
> |---|---|---|---|
> | **α** | **Volltext für die 9 Slug-Stubs** | Inhaltliche Texte für FAQ, Cookie-Richtlinie, 4× Patientenfragebögen, Corona-Impfung, „Rund ums Impfen/Labor" — Sie liefern Rohinhalt, ich rendere mit Standard-Template-Struktur | Stubs verschwinden als „Lücke", Page-Anzahl mit echtem Content wächst von 39 → 48 |
> | **β** | **Menü-Restrukturierung** (31 unverlinkte Pages) | Service-Hub als Top-Level-Submenu (Rezept/Termin/Einweisung/Überweisung/Neupatient/Impfungen/AU/Fragebögen), Standorte-Hub, Aktuelles, Footer-Block für Legal | Sichtbarste Verbesserung Patient-Side, klärt aber nichts inhaltlich |
> | **γ** | **DE-SEO-Pass** (vor Migration zu i18n) | Title-Tags, Meta-Descriptions, Heading-Hierarchie pro Page durchgehen, AIOSEO oder eigene Helpers nutzen | Wartet sinnvollerweise auf α + β, sonst Doppel-Arbeit |
>
> **Empfohlen β VOR α** (Architekten-Tendenz): Menü-Struktur klären, was wo hingehört, dann gezielt Content schreiben pro Bereich. Sonst Risiko, dass Texte später anders verortet werden müssen.
>
> Nicht-P3a Alternativen, falls Sie was anderes wollen:
> - **L-1/L-2 Legal-Review-Iteration** (P4 Pre-M1, extern abhängig)
> - **C-1 DF-Support reaktivieren** (P4 Pre-M1, extern)
> - **DB-Migrations-Skript für Prod-Push** (Pflicht-Punkt VOR M1, kleine Aufgabe)
> - **`sites/praxis-webseite/SESSION_RESUME.md` rotieren** (LL-044-Hygiene, ~35 k Tokens veraltet)
>
> **Nicht in der Default-Liste (Popt/Pios, gefrierend):** Media-Registry-Framework · N-6.4/6.5 · iOS · `_inbox/`-Sortierung.

---

## §6 Verbote / harte Regeln (Session 42 NIE passieren darf)

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
| **41** | 2026-04-25 | **Re-Priorisierung „DE-Content vor i18n" + S37-Header-Rollback (Flex statt 4+3-Grid) + 9 DE-Slug-Stubs (DB-Migration + WPML-DE) + 8 Slug-Mismatch-Redirects + Reading-Width 1,5× (standard.css/page.css) + Doctolib-Floating-Button mittig rechts + Footer-Single-Source-Fix für Homepage (analog Pattern S38) + Doctolib-Button → Col 1 Adresse + Footer-Nav-Links weiß + Homepage-Texte (mfa_subtitle 3 Zeilen, spec_intro 2 Zeilen, spec/team/loc-Title 1 Zeile) + Container-Cap-Fixes für Title-Pairs.** Theme-Commit `5e9bb22` PXZ 2.7.35. Pattern `single-source-ui-region` erweitert (Footer-Variante). | §3 (aktuelle Session) in dieser Datei |
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
