# Session-Resume — Einstieg via Befehl „Projekt fortsetzen"

> **Standard-Einstieg seit 2026-04-18 (LL-043, `Nexus/_rules/SESSION_LIFECYCLE.md`):**
> In neuer Claude-Code-Session schreibst Dr. Stracke einfach
> **„Projekt fortsetzen"** (optional „… praxis-redesign"). Claude lädt dann
> automatisch:
>
> 1. Pflicht-Init Nexus (CLAUDE.md, MEMORY.md, GLOBAL_RULES.md, SESSION_LIFECYCLE.md)
> 2. Diese Datei (SESSION_RESUME.md)
> 3. Alle in §0 unten als Pflicht-Lesung markierten Folgedateien
> 4. Pre-Flight (`tools/verify.sh`)
> 5. Status-Statement im Architekten-Stil → wartet auf Wahl der Front

---

## §0 EINSTIEG „Projekt fortsetzen" — Pflicht-Lesung in dieser Reihenfolge

1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`
4. `~/Cortex/Nexus/_rules/SESSION_LIFECYCLE.md` (LL-042/043)
5. `~/Cortex/projects/praxis-redesign/_rules/WORKING_MODE.md` (Architekten-Modus)
6. `~/Cortex/projects/praxis-redesign/_rules/ARCHITECTURE.md` (Sprint-Roadmap)
7. `~/Cortex/projects/praxis-redesign/_rules/FEHLERPROTOKOLL.md` (PXZ-E-001…008)
8. `~/Cortex/projects/praxis-redesign/_rules/PRE_FLIGHT_CHECKLIST.md` (§7a/7b/7c)
9. `~/Cortex/projects/praxis-redesign/DESIGN_GUIDELINES.md` (v2.3, §13–§16.6)
10. `~/Cortex/projects/praxis-redesign/specs/sprint-0/README.md` + `OPEN_DECISIONS.md`
11. Diese Datei (SESSION_RESUME.md)
12. `cd ~/Cortex/projects/praxis-redesign && tools/verify.sh` (muss grün sein)

---

## §1 Stand & Version (gültig: 2026-04-18, 12:15)

- **PXZ_VERSION:** 2.7.3 live auf Local by Flywheel (Cluster-Mini-02).
- **Site-Root:** `/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/`
- **URL:** `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local`
- **Child-Theme:** `wp-content/themes/praxiszentrum/`
- **Homepage abgenommen** durch Dr. Stracke bis inkl. v2.7.3:
  - Hero (Logo 151/200/248 px), MFA-Sektion (T-C-Conversion-Text, ~60 % Hero-Höhe),
    Stats, Fachrichtungen, Team, Service, Standorte, Final-CTA, Footer, Nav.
- **Task 2 (Karriere v2.6.0 + MFA-Formular) abgenommen** durch Dr. Stracke am 2026-04-18.
- **`tools/verify.sh`:** alle 4 Checks grün (Split, Reset, Computed-Style, Alignment).

---

## §2 Pre-Flight-Befehl

```bash
cd ~/Cortex/projects/praxis-redesign && tools/verify.sh
```

Erwartet: Exit 0. Prüft §1 Split-Check + §2 Reset-Scope + Screenshots +
§3 Computed-Style-Probe + §4 Alignment-Probe (PXZ-E-008).

Nach jeder CSS-Änderung **zusätzlich**:
```bash
bun run tools/ab-diff.mjs                          # nur Nachher
bun run tools/ab-diff.mjs --override='<vorher-css>' # mit Vorher-Vergleich
```

---

---

## §3 Sofort-Status-Frage an Dr. Stracke (Architekten-Stil)

Nach Pflicht-Init + Pre-Flight grün, fragt Claude:

> „v2.7.3 ist live, Task 2 freigegeben, alle Checks grün. Welche Front bearbeiten wir?
>
> A. **Sprint 0 starten** — Antworten zu `OPEN_DECISIONS.md` (b)/(c)/(d) liefern, dann S0.1 Git-Repo
> B. **Backlog 2026-04-18** — CTA-Anschnitt @ 1440 px ODER PHP-Deprecation `theme-freesia-demo-import`
> C. **Mobile-Eyebrow MFA** — „WIR SUCHEN DICH · MFA M/W/D" bricht 2-zeilig (offen aus v2.7.3)
> D. **Mehrsprachigkeit (Sprint 3)** — Task 3 WPML DE→EN/FR/ES (nicht vor Sprint 0)
> E. **Andere konkrete Änderung** — Sie nennen"

Keine Code-Änderung vor expliziter Wahl.

---

## §4 Verbote / harte Regeln für die nächste Session

- Niemals Status „fertig", ohne dass `tools/verify.sh` grün ist.
- Niemals CSS-Änderung an zwei Stellen (PXZ-E-001).
- Niemals Annahme über Design-Intent ohne Referenz-Bild (PXZ-E-003).
- Niemals Screenshot ohne Computed-Style-Probe (PXZ-E-004).
- Niemals globaler `.pxz-home p { … }`-Reset — immer `.pxz-home :where(p) { … }` (PXZ-E-008).
- Niemals Cache-/DevTools-Delegation an Dr. Stracke (PXZ-E-007 §7a).
- Bei „einige Punkte"/„passt nicht"-Formulierungen: Paraphrase in 1 Satz vor jedem Edit (§7b).
- Bei Hauptask-Abschluss: proaktiv „Session beenden" anbieten (LL-042).

---

## §5 Letzte Session — Was wurde erledigt

### 0. ARBEITSWEISE AB 2026-04-18 — ARCHITEKTEN-MODUS (VERBINDLICH)

Dr. Stracke hat am 2026-04-18 die Arbeitsweise umgestellt. Du agierst ab
sofort als **strukturierter Software-Architekt und technischer Projektpartner**,
nicht als reaktiver Assistent. Deterministisch, nachvollziehbar, reproduzierbar.

**Pflicht-Lesung vor jeder Aufgabe (zusätzlich zu den Nexus-Dateien):**
`_rules/WORKING_MODE.md` — enthält:
- 4-Phasen-Prozess: Verständnis-Sicherung → Lösungsdesign → Umsetzung → Selbstprüfung
- Fehlerklassen FK-1 bis FK-5
- Verbotene Muster + Kommunikationsstandard

**Regel in 1 Zeile:** Keine Umsetzung ohne Spec. Keine Spec ohne Freigabe.

---

## 1. PFLICHT-INITIALISIERUNG (LL-023, KON-001 + 2026-04-18 Update)

Lies in dieser Reihenfolge, **bevor** irgendetwas getan wird:

1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`
4. `~/Cortex/projects/praxis-redesign/_rules/WORKING_MODE.md` (**neu 2026-04-18 — Architekten-Modus**)
5. `~/Cortex/projects/praxis-redesign/_rules/ARCHITECTURE.md` (**neu 2026-04-18 — IST/SOLL, Sprint-Plan**)
6. `~/Cortex/projects/praxis-redesign/_rules/FEHLERPROTOKOLL.md`
7. `~/Cortex/projects/praxis-redesign/_rules/PRE_FLIGHT_CHECKLIST.md`
8. `~/Cortex/projects/praxis-redesign/DESIGN_GUIDELINES.md` (v2.3 — verbindlich, inkl. §13–§16.6)
9. `~/Cortex/projects/praxis-redesign/HANDOFF_PROMPT.md` (Projekt-Kontext, 8 Aufgaben)
10. `~/Cortex/projects/praxis-redesign/PHASE1_AUDIT.md` (5-Phasen-Plan)
11. `~/Cortex/projects/praxis-redesign/specs/sprint-0/README.md` (**aktueller Arbeitsspec**)
12. `~/Cortex/projects/praxis-redesign/specs/sprint-0/OPEN_DECISIONS.md` (**offene Freigaben**)
13. Pre-Flight ausführen: `cd ~/Cortex/projects/praxis-redesign && tools/verify.sh`

---

## 2. NUTZER & ARBEITSWEISE

- **Nutzer:** Dr. Stracke — Internist, Praxisinhaber, kein IT-Experte
- **Sprache Chat:** Deutsch · **Code-Kommentare:** Englisch
- **Transparenz (LL-024):** jeder Schritt mit WAS / WARUM / WAS BEDEUTET DAS
- **Entscheidungen (LL-034):** alle Optionen mit Vor-/Nachteilen, Dr. Stracke wählt
- **Fertig (LL-021):** funktionstüchtig, nicht „Datei existiert"
- **Tempo:** Dr. Stracke hat ausdrücklich gefordert: *„Wir sind zu langsam."* →
  KEINE Zwischenfragen bei klaren Aufgaben. Batches statt Einzelschritten.
- **Design-Verifizierung ist PFLICHT** nach jeder sichtbaren Änderung via
  Chrome Headless Screenshot. Nicht nur Code ändern und behaupten es sei besser.

---

## 3. AKTUELLER STAND (Stand: 2026-04-18)

**WordPress-Instanz (Local by Flywheel):**
- Site-Root: `/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/`
- URL: `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local` (HTTPS via self-signed cert)
- Child-Theme: `wp-content/themes/praxiszentrum/` (Parent = Blocksy)
- **PXZ_VERSION: 2.7.2** (Logo +35 % final, Dr. Stracke abgenommen — „Das passt jetzt erst mal")
- WP-CLI (Cluster-Mini-02): `PHP=/Applications/Local.app/Contents/Resources/extraResources/lightning-services/php-8.2.29+0/bin/darwin-arm64/bin/php`
  + `PHAR=/Applications/Local.app/Contents/Resources/extraResources/bin/wp-cli/wp-cli.phar`
  + `SOCK=/Users/cluster-mini-02/Library/Application Support/Local/run/VFEzUQg6g/mysql/mysqld.sock`
  + Aufruf: `"$PHP" -d memory_limit=512M -d mysqli.default_socket="$SOCK" -d pdo_mysql.default_socket="$SOCK" "$PHAR" --path="$SITE" <cmd>`

**Letzte Session (2026-04-18 v2.6.0) — Task 2: MFA-Bewerbungsformular live**

Dr. Stracke hat Task 1 (v2.5.0: Hero/Standorte/MFA) freigegeben. Task 2 umgesetzt:

1. **Karriere-Seite angelegt** — `/karriere/` (WP-Page-ID 9666) mit
   `template-karriere.php` als Page-Template. Dark-Theme mit Amber-Glow,
   eigener Hero „Werden Sie Teil unseres Teams." + Formular-Card mit
   Anker `#bewerben` (Scroll-Target für den MFA-CTA auf der Homepage).
2. **WPForms-Formular „Bewerbung MFA" programmatisch erzeugt** — Form-ID 9664.
   Felder: Name (Vor/Nachname), E-Mail, Telefon, Nachricht (optional),
   File-Upload (PDF/DOC/JPG, max. 5 Dateien × 10 MB, required), Datenschutz-
   Checkbox mit Link auf `/datenschutz/`. Benachrichtigung an
   `praxis@westend-hausarzt.de`, Reply-To = Bewerber-Mail, File-Upload
   als Anhang. Idempotentes Skript: `tools/create_mfa_form.php`.
3. **Karriere-Page-Inhalt idempotent erstellbar** via
   `tools/create_karriere_page.php` (findet Formular per Marker).
4. **WPForms im Dark-Mode gestylt** — Inputs, Dropzone, Submit-Button
   (Amber-Pill), Checkbox (Amber-Accent), Validation-Messages — alles
   scoped auf `.pxz-kar` (kein Bleed auf andere Seiten, §16.2 respektiert).
5. **Mail-Pipeline in Local bestätigt** — MU-Plugin
   `wp-content/mu-plugins/000-local-mail-redirect.php` leitet auf `.local`-
   Hosts WP-Mail-SMTP an Mailpit (SMTP 10001) um; Production (Outlook) bleibt
   unangetastet. Testmail in Mailpit angekommen: From
   `dev@westend-hausarzt.local` → To `praxis@westend-hausarzt.de`.
6. **Neuer Fehlereintrag PXZ-E-005** — `gdpr-checkbox`-Typ rendert
   programmatisch nicht, wurde durch normalen `checkbox`-Typ mit
   Pflicht-Option ersetzt. Regel: jedes neue Formular visuell verifizieren.

**Verifikation v2.6.0:**
- `tools/verify.sh` grün (Homepage-Regression ausgeschlossen).
- `tools/shoot_karriere.mjs` produziert Desktop/Tablet/Mobile-Shots unter
  `screenshots/claude/2026-04-17_v2.6.0_karriere_*.png`.
- Formular-HTML vorhanden: `wpforms-field-name/email/phone/textarea/file-upload/checkbox`,
  Anker `#bewerben` rendert, Shortcode `[wpforms id="9664"]` eingebettet.

**Status v2.6.0:** ✅ Freigegeben durch Dr. Stracke am 2026-04-18.

---

## Session 2026-04-18 — MFA-Sektion halbiert + Conversion-Text (v2.7.3)

**Auftrag Dr. Stracke:** „Wir suchen Dich"-Container auf ≈ 50 % Höhe der Hero-Sektion bringen UND verkaufsstärkeren Text mit hoher CTA-Conversion. Wahl: **L1** (schlanker CTA-Block, Grid raus) + **T-C** (persönlich, Versprechen, kurz).

**Änderungen v2.7.3:**
- `template-homepage.php` — MFA-Block: `.pxz-mfa-rule` + `.pxz-mfa-grid` (Benefits + Tasks) entfernt. Bleibt: Eyebrow, Titel, Sub, 2 CTAs, Mail-Note.
- `template-homepage.php` Inline-CSS: verwaiste Selektoren `.pxz-mfa-rule`, `.pxz-mfa-grid`, `.pxz-mfa-col-title`, `.pxz-mfa-benefits`, `.pxz-mfa-benefit-h/d`, `.pxz-mfa-tasks`, `.pxz-mfa-task` aufgeräumt.
- `inc/homepage-data.php` — DE/EN/FR/ES Texte auf T-C: Eyebrow „Wir suchen dich · MFA m/w/d", Titel „Hier wirst du **gesehen.**", Subtitle Pull-Faktor mit `„interdisziplinär"`-Highlight, Sekundär-CTA „Mehr über die Stelle". `mfa_benefits[]` und `mfa_tasks[]` bleiben im Daten-Array (nicht gelöscht — verwendbar für spätere Karriere-Seite-Erweiterung).
- `functions.php` — PXZ_VERSION 2.7.2 → 2.7.3.

**Höhen-Beweis (Headless Chrome, Inkognito, cache-disabled):**

| Sektion | v2.7.2 (vorher) | v2.7.3 (nachher) | Delta |
|---|---|---|---|
| MFA Desktop 1440 | 1658 px (113 % Hero) | **864 px (59 % Hero)** | **−794 px (−48 %)** |
| MFA Mobile 430   | 2161 px (272 % Hero) | **884 px (111 % Hero)** | **−1277 px (−59 %)** |

Hero (1474 / 796 px) unverändert.

**Verifikation:**
- `tools/verify.sh` grün (§1 Split + §2 Reset + §3 Computed-Style + §4 Alignment alle ✓).
- AB-Diff via `tools/ab-diff.mjs` (Nachher-Shot + Probe + Alignment grün auf 1440 + 430).
- MFA-Section-Crop: `screenshots/claude/2026-04-18_v2.7.3_mfa_only_{1440,430}.png`.
- Volle After-Shots: `screenshots/claude/2026-04-18_v2.7.3_AB_after_{1440,430}.png`.

**Ziel-Abweichung (transparent):** 50 % wurde nicht exakt getroffen (59 % Desktop). 50 % würde zusätzlich Card-Padding kürzen erfordern (z. B. 112→80 Desktop, ~60 px Gewinn) — als optionale Feinjustage offen.

**Mobile-Hinweis:** Eyebrow „WIR SUCHEN DICH · MFA M/W/D" bricht durch Uppercase + 0.2em letter-spacing in 430 px-Card auf 2 Zeilen um. Nicht fatal, aber kürzbar (z. B. nur „Wir suchen dich" auf Mobile). Klarstellen: Soll nachgeregelt werden?

**Status v2.7.3:** Umsetzung abgeschlossen, Probe grün, wartet auf Browser-Freigabe.

---

## Session 2026-04-18 — Designregeln + visuelle Fixes (v2.6.1 → v2.7.2)

**Dr. Stracke-Abnahme:** v2.7.2 „passt jetzt erst mal". Homepage ist bis
hierhin freigegeben (Hero/MFA/Stats/Fachrichtungen/Team/Service/Standorte/
Final-CTA/Footer + Nav mit großem Logo). Task 2 (Karriere v2.6.0) ist
separat unberührt freigabepflichtig.

### Versionskette dieser Session

| Version | Änderung | Abnahme |
|--------|----------|---------|
| v2.6.0 | Baseline (Karriere + MFA-Formular, Sprint-0-Lösungsdesign) | pending |
| v2.6.1 | Desk-Audit: `.pxz-sect` 160→96 Desktop, `.pxz-mfa-sub` 48→40rem, `.pxz-btn` Mobile-Padding — PXZ-E-006 | zwischen |
| v2.6.2 | Hero+Final-CTA Abstände größer, Standort 2 roter Rahmen + Badge | zwischen |
| v2.6.3 | **Root-Cause-Fix** `.pxz-home :where(p)` statt `.pxz-home p` — Hero-Subtitle + CTAs zentrieren jetzt wirklich — PXZ-E-008 | ✅ |
| v2.7.0 | Logo +54 % (96/128/160 px), Text proportional mit skaliert | zwischen |
| v2.7.1 | Logo max in Nav-Höhe (112/148/184 px), Padding reduziert auf 8/10/12 | zwischen |
| v2.7.2 | **Logo +35 % final** (151/200/248 px), Nav-Höhe wächst proportional | ✅ „passt jetzt" |

### Neue Fehlerkategorien, die NIE mehr passieren dürfen

- **PXZ-E-006 (FK-5)**: alte `DESIGN_GUIDELINES` §3.3 vs. aktuelle §13.4 —
  §3.3 ist ab sofort mit ⚠️ markiert. Regel §16.6: alte Tabellen explizit
  als obsolet kennzeichnen.
- **PXZ-E-007 (FK-1 + Prozess)**: „einige Punkte, die nicht korrigiert
  wurden" wurde als DESIGN_GUIDELINES-Abweichung fehlinterpretiert. Regel:
  PRE_FLIGHT §7b — Aufgaben-Scope in 1 Satz paraphrasieren vor Edit.
  Zusatz: AB-Diff-Beweis mit „fertig"-Meldung mitliefern, keine DevTools-
  Delegation an Dr. Stracke.
- **PXZ-E-008 (FK-5)**: `.pxz-home p { margin: 0 }` hatte Spezifität 0,1,1
  und überschrieb seit Projekt-Start still alle p-Klassen-Margins
  (Hero-Sub, Final-Priv, MFA-Sub, Loc-City, MFA-Email-Note). Fix:
  `:where(p)` macht den Reset spezifitätsneutral. Regel §16.5
  (DESIGN_GUIDELINES).

### Neue/geänderte Tools

- `tools/ab-diff.mjs` — Vorher/Nachher-Shots + Höhen-Delta + Selector-Probe
  + Alignment-Check (Inkognito-Headless, cache-disabled). **Nach jeder
  CSS-Änderung Pflicht.**
- `tools/alignment-probe.mjs` — standalone Spezifitäts-/Alignment-Check für
  Showpiece-Elemente. Lässt sich von `verify.sh --alignment` aufrufen, ist
  Teil von `verify.sh` --all.
- `tools/verify.sh` — erweitert um §4 Alignment-Probe.
- `tools/shoot_karriere.mjs` — zugunsten von `ab-diff.mjs` **deprecated**
  (siehe Datei-Kopf).

### Screenshot-Archivierung

`screenshots/claude/_archive/` enthält alle Test-Shots dieser Session (112
Dateien, ca. 65 MB). Als **aktuelle Baseline** bleiben in `claude/`:
`2026-04-18_v2.7.2_nav_*` + `2026-04-18_v2.7.1_nav_*` + letzter
`verify_desktop/mobile`.

### Offene Backlog-Punkte aus dieser Session

- **CTA-Anschnitt bei exakt 1440 px Viewport:** Logo-Block (248 px) + Nav-Items +
  Right-Block laufen bei genau 1440 px an. Auf ≥ 1500 px unauffällig. Entscheidung
  noch offen, ob Nav-Items-Abstand gekürzt oder Logo-Text leicht kleiner wird.
- **PHP-Deprecation-Warnung:** Plugin `theme-freesia-demo-import` wirft bei
  PHP 8.2 eine Warning (`__wakeup()` public visibility). In Dev sichtbar
  (WP_DEBUG=true), in Prod nicht. Vor Go-Live: Plugin updaten oder entfernen.
- **Sprint-0 `OPEN_DECISIONS.md`** (b)/(c)/(d) weiter offen — durch
  visuelle Detailarbeit diese Session überlagert, keine Antworten.
- **probe-design.mjs EXPECTED-Werte** reflektieren noch v2.5.0-Zeitpunkt —
  ok für Regressionsschutz, könnte Ergänzung um Hero-Sub/Final-CTA-Werte
  vertragen (Sprint 0 / S0.4).

---

**Historie: Session 2026-04-18 v2.6.1 — Desk-Audit Homepage gegen DESIGN_GUIDELINES**

Dr. Stracke-Auftrag: eigenständig die Designregeln durchgehen und offene
Abweichungen auf der Homepage korrigieren. 3 harte Befunde (4-Phasen-Prozess
gemäß WORKING_MODE.md):

1. **`.pxz-sect` Sektions-Padding** (Fachrichtungen/Team/Service/Standorte):
   `96/128/160 px` → **`64/80/96 px`** (§13.4 Standard-Sektion). Desktop war
   +67 % über Soll — Grund für aufgebläht-Eindruck. Neuer
   FEHLERPROTOKOLL-Eintrag `PXZ-E-006` (FK-5 Kontextverlust zwischen §3.3 v2.0
   und §13.4 v2.1).
2. **`.pxz-mfa-sub max-width`**: `48rem` → **`40rem`** (§13.5) +
   `text-wrap: balance` (§15.6 Orphan-Words).
3. **`.pxz-btn` Mobile-Padding**: `14 × 26 px` → **`14 × 28 px`** (§6.1
   Tap-Target-Minimum).

**Verifikation v2.6.1:**
- `tools/verify.sh` grün (Split/Reset/Probe/Shots).
- Ad-hoc-Probe der neuen Werte: `.pxz-sect { paddingTop: 96px }` auf
  Fachrichtungen/Team/Service/Standorte grün; `.pxz-mfa-sub { maxWidth: 640px }`
  grün; `style#pxz-home-v2-6-1` im DOM.
- Screenshots: `screenshots/claude/2026-04-18_v2.6.1_desktop_{full,mfa,fachrichtungen,team,service,standorte}.png`
  + `_mobile_full.png`.

**Status v2.6.1:** Umsetzung abgeschlossen, Probe grün, wartet auf
Browser-Freigabe durch Dr. Stracke. Task 2 (v2.6.0 Karriere) bleibt
freigabe-pflichtig und wird durch v2.6.1 nicht berührt (Karriere-Template
unverändert).

---

**Historie: Session 2026-04-17 v2.5.0 — Hero + Standorte + MFA-Card korrigiert:**

Dr. Stracke-Feedback zu v2.4.0: *„Die Texte in 1 und 3 sind nicht gut positioniert,
Abstände stimmen immer noch nicht, wirkt nicht symmetrisch. Entweder zentral
positionieren oder linksbündig. Bei 2 möchte ich den Container genauso haben wie
bei dem ersten Standort."*

Drei konsistente Batch-Fixes in `template-homepage.php`:

1. **Hero (`.pxz-hero-sub`):** Vollständig zentriert — `text-align: center !important;
   max-width: 36rem; text-wrap: balance/pretty;`.
2. **Standorte (`.pxz-loc-card--main`):** Konsequent linksbündig. Badge
   (`.pxz-loc-badge`) vom `position: absolute` auf Inline-Pill umgestellt
   (auf ALLEN Viewports `position: static`, `display: inline-block`, `margin-bottom: 1.25rem`).
   Header-`padding-right` entfernt, damit der Inhalt nicht mehr asymmetrisch wirkt.
3. **MFA (`.pxz-mfa-card`):** Neue Wrapper-Klasse mit demselben Padding-Scale wie
   Standort-1 (72/96/112 px). Amber-Border + sanftes Shadow + `border-radius: 28px`.
   Zwischen Hero und Grid wurde ein `.pxz-mfa-rule` Trenner (1 px amber) eingefügt.
   HTML: `.pxz-mfa-hero` + `.pxz-mfa-grid` liegen jetzt in einem gemeinsamen
   `<div class="pxz-mfa-card">`.

**Verifikation (alle 3 Viewports grün):**
- `bun run tools/probe-design.mjs` — alle erwarteten Computed-Styles (1440/768/430)
  gematcht: Hero-Sub `textAlign: center`, Standort-Badge `position: static`,
  MFA-Card padding `112/96/72`, Final-Card plain.
- `tools/verify.sh` — Split-Check, Reset-Scope-Check, Screenshots und Probe GREEN.
- Desktop-Slices (Hero/MFA/Standorte/Final) liegen in `screenshots/claude/`.

**Selbstlernendes System (aus v2.4.0, weiterhin aktiv):**
- `_rules/FEHLERPROTOKOLL.md` — PXZ-E-001 bis PXZ-E-004.
- `_rules/PRE_FLIGHT_CHECKLIST.md` — verbindliche Checks vor jedem Deploy.
- `tools/verify.sh` — Split-Check + Reset-Scope-Check + Screenshots + Probe.
- `tools/probe-design.mjs` — Puppeteer-Computed-Style-Probe gegen §13 (v2.5.0 EXPECTED).
- `SESSION_START.md` — 7-Schritt-Einstieg für jede neue Claude-Session.
- `DESIGN_GUIDELINES.md v2.2` — §16 Anti-Patterns auf Implementierungs-Ebene.

**Status v2.5.0:** Umsetzung abgeschlossen, Probe grün, wartet auf Browser-
Freigabe durch Dr. Stracke. KEINE weiteren Code-Änderungen bis zur Freigabe.

**Bekannter, nicht blockierender Minor:** Mobile 430 px — „Bockenheimer Landstraße"
läuft rechts aus dem Container; kein Blocker für Task-1-Freigabe.

---

## 4. OFFENE AUFGABEN (Priorität absteigend)

**Architektur-Ebene (übergeordnet, seit 2026-04-18):**

- **Sprint 0 — Foundation** — wartet auf Freigabe der offenen Entscheidungen.
  - Reihenfolge Sprint 0 → 1 → 2 → 3 → 4 wurde am 2026-04-18 freigegeben.
  - **Offen (blockierend):** `specs/sprint-0/OPEN_DECISIONS.md` — (b) Git-Remote,
    (c) Git-Scope, (d) Deadline-Realität. Ohne Antworten kein Sprint-0-Start.
  - Details: `specs/sprint-0/README.md`.

**Produkt-Ebene (aus HANDOFF_PROMPT.md):**

1. **v2.7.2 Homepage (Logo +35 %)** — ✅ freigegeben 2026-04-18 „passt jetzt erst mal".
2. **Task 2 — v2.6.0 Karriere + MFA-Formular** — ✅ freigegeben 2026-04-18.
3. **Task 1 — v2.5.0** (Hero/Standorte/MFA-Card) ✅ am 2026-04-18 freigegeben.
3. **Task 3 — WPML-Homepage-Duplikate** für EN/FR/ES → läuft als **Sprint 3 / S3.1**
   (siehe `_rules/ARCHITECTURE.md` §4). Nicht vor Sprint 0 beginnen.
4. **Task 4 — Menü „Hauptnavigation"** befüllen.
5. **Task 5 — Phase 4 Rollout** Design-System auf 172 Seiten.
6. **Task 6 — Phase 5 Go-Live** QA / SEO / Schema / Formulare / Staging→Live.
7. **Task 7 — 11 Blogposts** überarbeiten + Content-Pipeline.
8. **Task 8 — Echte Fotos** für 6 Ärzte (Barcsay, Seelig, Jawich, Shahin, Landeberg, Arbitmann).

**Deadline:** Go-Live innerhalb 48 h (ursprünglich ab Session-Start).

---

## 5. SESSION-EFFIZIENZ-KONZEPT (vom Nutzer gefordert)

Dr. Stracke hat verlangt, ein Konzept zu entwickeln, damit redundante Sessions
endlich effektiv werden. Grundregeln:

1. **Rules-First-Prinzip:** Jede Kritik wird sofort als Regel in
   DESIGN_GUIDELINES.md §15 „Anti-Patterns" dokumentiert. Keine Kritik darf
   zweimal geäußert werden müssen.
2. **Batch-Fixes statt Einzelfixes:** Wenn ein Problem auftritt, systematisch
   alle verwandten Stellen gleichzeitig korrigieren.
3. **Pflicht-Verifizierung:** Nach jeder sichtbaren Änderung Chrome-Headless-
   Screenshot. Desktop 1440 + Mobile 390, in Sektions-Slices.
4. **Screenshot-Ordnung:**
   - Dr. Stracke legt Referenzbilder als `1.png, 2.png…` in `screenshots/` ab.
   - Claude legt Verifikationen in `screenshots/claude/` mit Schema
     `YYYY-MM-DD_vX.X.X_device_NN_section.png` ab.
   - Alles Alte wandert in `_archive/`.
5. **Keine Zwischenfragen bei klaren Aufgaben.** Dr. Stracke trifft strategische
   Entscheidungen; Claude arbeitet autonom durch die Umsetzung.
6. **Abschlussbericht pro Batch** mit WAS geändert / WARUM / Vorher-Nachher-
   Screenshots — dann warten auf Freigabe.

---

## 6. ERSTER SCHRITT IN DER NEUEN SESSION (Stand 2026-04-18)

Kurzform:

1. **Alle Pflicht-Dateien aus Abschnitt 1 dieses Dokuments lesen** — insbesondere
   die neuen `WORKING_MODE.md` + `ARCHITECTURE.md`, sowie
   `specs/sprint-0/README.md` und `specs/sprint-0/OPEN_DECISIONS.md`.
2. `screenshots/` prüfen: neue Referenzbilder von Dr. Stracke?
3. **`tools/verify.sh` ausführen (nur lesend)** — muss OK sein (v2.6.0 ist grün).
4. Status-Statement an Dr. Stracke im **Architekten-Stil** (präzise, strukturiert,
   keine Fülltexte):
   - Aktuelle Version: **v2.6.0** (Karriere-Seite + MFA-Formular live).
   - Task 2 wartet auf Browser-Freigabe durch Dr. Stracke.
   - Sprint 0 (Architektur-Foundation) wartet auf Antworten zu
     `specs/sprint-0/OPEN_DECISIONS.md` (b), (c), (d).
5. **KEINE Code-Änderungen, bis:**
   - Task 2 freigegeben **und**
   - Sprint-0-Entscheidungen (b)(c)(d) beantwortet.
6. Nach Freigabe beider: Sprint 0 gemäß `specs/sprint-0/README.md` starten,
   streng nach `WORKING_MODE.md` (4-Phasen-Prozess).
7. Ende der Session: `SESSION_RESUME.md` aktualisieren, ggf. neue Specs unter
   `specs/<sprint>/<task>.md` anlegen.

---

## 7. KRITISCHE KONTAKTDATEN

- Hauptstandort: Grüneburgweg 12, 60322 Frankfurt am Main
- Zweitstandort: Bockenheimer Landstraße, 60323 Frankfurt am Main
- Kasse: 069 247 574 523 · Privat: 069 247 574 526
- E-Mail: praxis@westend-hausarzt.de

---

## 8. ABSOLUTE VERBOTE (DESIGN_GUIDELINES §1.1 + §15)

- NIE schwarzer Text auf dunklem Hintergrund
- NIE Text, der erst bei Hover sichtbar wird
- NIE opacity < 0.95 auf Fließtext
- NIE Text, der am Card-Border klebt (mind. 72px Mobile / 96px Tablet / 112px Desktop)
- NIE Eyebrows direkt gegen den oberen Card-Rand
- NIE Sektionen-Padding > 96px Desktop bei CTA/Formular-Bereichen
