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

- **Version:** `0.6.1` — Cortex-Web-Aufbau (Phase 0–5) ✅ vollständig · Praxis-Sprint 2 fortgeführt
- **Stand:** 2026-04-19, **Session 11 abgeschlossen** (Praxis-Sprint 2 / S2.0b Komponenten-Bibliothek)
- **Working Tree:** clean
- **Cortex-Web-Aufbau (Phase 0–5):** ✅ **vollständig**
- **Trunk-Content:** unverändert, 1 Produkt (`basic-check.yaml`)
- **WP-Adapter:** Phase 1, idempotent, HWG-konform, Review-geprüft
- **Shopify-Adapter:** Phase 2, idempotent, draft-only, Review-geprüft
- **Review-Pipeline:** Phase 3, 11/11 automatische AKs grün
- **Praxis-Site:** `sites/praxis-webseite/`, Theme-Pointer auf Commit **`8f596f7`** (Folge von `08f40ff`, **PXZ_VERSION 2.7.8**). Design-Autorität: `DESIGN_GUIDELINES.md` v3.0. Praxis-Sprint 2: S2.0 ✅ + S2.0c ✅ + S2.1 ✅ + S2.2 ✅ + **S2.0b ✅** (Komponenten-Bibliothek `components.css`, 6 Blöcke, globaler Enqueue zwischen `praxiszentrum` und page-CSS, Home MD5-Null-Delta verifiziert, Karriere -9px Accessibility-Gewinn am `.wpforms-submit`, Self-Check 10/12 AKs grün — AK-8 + AK-10 verify.sh-Erweiterung auf S2.0e verschoben, Cortex-Web-Commit `df50333`). **S2.3 Content-Batches jetzt freigeschaltet:** B/C/G verfügbar, A blockiert durch Rechtssicherheitsquelle.
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
| **5** | **Subsumierung Juvantis-Web-Docs → sites/juvantis-webseite/ (Theme-Klon bleibt)** | **✅ 2026-04-19** |

**Cortex-Web-Aufbau damit abgeschlossen.** Weitere Arbeit findet in den
subsumierten Sub-Sites oder am Trunk-Content statt.

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

**Stand Ende Session 11:** validate ✅, verify.sh (Praxis) ✅, beide Repos clean nach Theme-Commits `08f40ff`+`8f596f7` und Cortex-Web-Commits `2056e3e`+`df50333`.

---

## §3 Letzte Session — Session 11, 2026-04-19

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

### P0 — Praxis-Sprint 2 fortsetzen (Dr. Stracke-Direktive „zuerst Design und Content" bleibt)

S2.0b ✅ abgeschlossen. **Sprint-Reihenfolge:** S2.2 ✅ → S2.0b ✅ →
**S2.3 Content-Batches freigeschaltet** → S2.4 → S2.5. Zwei optionale
Mini-Sprints empfohlen vor S2.3.

**P0a — S2.3 Content-Batch B/C/G (Hauptlinie, jetzt freigeschaltet)**
- Pfad: `sites/praxis-webseite/`
- Skelett-Templates (S2.2) + Komponenten-Bibliothek (S2.0b) stehen → jetzt
  können die 7 freien P0-Seiten mit Echt-Content befüllt werden.
- Batch B: Praxis + Team + 404 (3 Seiten)
- Batch C: Fachrichtungen-Landing + Ärzte-Übersicht (2 Seiten, Card-Grid)
- Batch G: Sprechstunden + Kontakt (2 Seiten, Doctolib-Workaround)
- Je Batch eigene Spec `S2.3-<letter>_<name>.md`, Architekten-Modus.

**P0b — S2.0e Mini (empfohlen vor S2.3, ~30 min)**
- verify.sh §3b Component-Probe auf Draft-Testseite `s2-0b-probe` (ID 9670):
  4 Computed-Style-Assertions auf `.pxz-container`, `.pxz-btn`, `.pxz-eyebrow`,
  `.pxz-hero`.
- Split-Check-Erweiterung: `components.css` vs. `homepage.css` vs. `karriere.css`
  auf Doppel-Selektoren (erweitert die bestehende PXZ-E-001-Prüfung).
- Schließt die 2 aus S2.0b verschobenen AKs (AK-8 + AK-10).

**P0c — S2.0d Mini (optional, vor oder nach S2.3)**
- `kar` → `karriere` Rename in `karriere.css` und `template-karriere.php`.
  Vereinheitlichung mit sprechenden Slugs (S2.2-LL-4). MD5-Null-Delta-Beweis
  erforderlich.
- Semantic-Token `--pxz-space-card-padding-sm` nachziehen, `.pxz-card` in
  `components.css` umstellen (löst AK-2-Ausnahme auf).
- Legacy-Alias-Abbau in `tokens.css` (DESIGN_GUIDELINES §2.1) — optional.

**P0d — S2.3 Batch A (Datenschutz + Impressum) — blockiert**
- **Vorbedingung:** Rechtssicherheits-Quelle wählen (Anwalt / e-recht24 /
  Prod-Text). Ohne Dr.-Stracke-Entscheidung bleibt Batch A blockiert.

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

## §6 Sofort-Status-Frage für nächste Session

> **„Praxis-Sprint 2 / S2.0b Komponenten-Bibliothek ist ✅ abgeschlossen —
> Schicht 3 (Components) per `assets/css/components.css` eingezogen, 6 Blöcke
> (Container + Typografie + Buttons + Section + Card + Hero), globaler Enqueue,
> PXZ_VERSION 2.7.8, Home MD5-Null-Delta verifiziert, Karriere −9 px am
> `.wpforms-submit` (WCAG-Accessibility-Gewinn, dokumentiert), 10/12 AKs grün
> (AK-8 + AK-10 verify.sh-Erweiterung auf S2.0e verschoben), 5 Lessons Learned.
> In-Session-Fix S2.0b-LL-1: Spezifitäts-Kollision zwischen `.pxz-home :where(p)`-Reset
> und hochgezogenen Class-Regeln — gefixt per page-scope Overrides.
> Theme-Commits `08f40ff`+`8f596f7`, Cortex-Web-Commits `2056e3e`+`df50333`.
> 2 neue Patterns + Tutorial 12 in Nexus. Welche Front?**
>
> A. **Praxis S2.3 Batch B — Praxis + Team + 404** (empfohlen, frei verfügbar,
>    Skelett + Komponenten-Bibliothek sind da, 3 P0-Seiten mit Echt-Content,
>    Spec `specs/sprint-2/S2.3-B_praxis-team-404.md` neu schreiben).
>
> B. **Praxis S2.3 Batch C — Fachrichtungen-Landing + Ärzte-Übersicht**
>    (2 P0-Seiten, Card-Grid-Templates).
>
> C. **Praxis S2.3 Batch G — Sprechstunden + Kontakt** (2 P0-Seiten, Doctolib-
>    Workaround).
>
> D. **Praxis S2.0e Mini** (vor S2.3 empfohlen, ~30 min) — verify.sh §3b
>    Component-Probe auf Draft-Testseite + erweiterter Split-Check; schließt
>    die 2 aus S2.0b verschobenen AKs (AK-8 + AK-10).
>
> E. **Praxis S2.0d Mini** — `kar`→`karriere`-Rename + Semantic-Token
>    `--pxz-space-card-padding-sm` nachziehen + Legacy-Alias-Audit in tokens.css.
>
> F. **Praxis S2.3 Batch A — Datenschutz + Impressum** — **blockiert** durch
>    Rechtssicherheits-Quelle (Anwalt / e-recht24 / Prod). Ohne Ihre Entscheidung
>    nicht startbar.
>
> G. **Juvantis-Trunk-Content-Ausbau** oder **Phase 2b Medien-Pipeline**
>    (wenn Priorität weg von Praxis kippt).
>
> H. **Sprint 1 reanimieren** — SFTP-Credentials sind da (seit 2026-04-19
>    09:24). Staging-Setup ist aktivierbar, aber Design-first-Direktive gilt noch.
>
> I. **Strukturhygiene-Aufräumblock:** `SESSION_START.md`-Legacy-Pfade bereinigen,
>    5 Plugin-Phantom-Templates aufräumen.
>
> J. **Andere konkrete Änderung** — Sie nennen."

Keine Code-Änderung vor Ihrer Wahl. Empfohlener Default: **A (S2.3 Batch B)** —
das Komponenten-Fundament steht, der Content-Ausbau ist die eigentliche
Sprint-2-Hauptlinie. Alternativ **D (S2.0e Mini)** als Kurz-Vorstufe vorher,
falls Sie verify.sh vollständig grün sehen möchten bevor Content dazukommt.

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
| *(12)* | *tbd* | *Praxis-Sprint 2 / S2.3 B/C/G oder S2.0e* | *S2.3 Batch B/C/G (Content-Batches freigeschaltet, Komponenten-Fundament steht). Oder S2.0e Mini (~30 min, verify-Erweiterung) vorher. Batch A weiter blockiert (Rechtsquelle).* | — |

---

*Stand: 2026-04-19, Ende Session 11. Nächste Session: per „Projekt fortsetzen Cortex-Web" (LL-043) → Status-Frage A–J aus §6 wählen. Empfohlener Default: A (S2.3 Batch B) — das Komponenten-Fundament ist gelegt, Content-Ausbau ist die Hauptlinie. Alternativ D (S2.0e Mini) als kurze Vorstufe.*
