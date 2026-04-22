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
