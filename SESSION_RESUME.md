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

### Aktueller Prio-Stand (2026-04-24, Ende Session 38)

| Prio | Block | Status | Next Session |
|:---:|---|:---:|:---:|
| **P1** | Medien-Pipeline (ohne Framework): 2/8 Fotos live, Asset-Bestand im Trunk konsolidiert | 🟢 **durch (Block A)** | 6 weitere Fotos = externer Foto-Shoot |
| **P2** | Prod-Deployment-Pipelines (Praxis via DF/SFTP + Juvantis-Shopify-Sync dokumentiert) | 🟡 offen, DF-Support extern blockiert | nach Header-Final-Abnahme |
| **P3** | Praxis Content-Rest (Block B) | 🟢 **durch (S34–S36 MVP-Sprint)** | — |
| **Ppol** | **Header-Menü-Redesign Variante A** — umgesetzt + 2 Iterationen + Footer-Doppelung-Fix | 🟢 **technisch durch S38** · Theme-Commits offen, finale Abnahme + ggf. weitere Iterationen | Browser-Refresh Dr. Stracke + Theme-Commit-Freigabe |
| **P4** | **M1**: Erster Prod-Push westend-hausarzt.com + Verify | 🔴 Meilenstein | nach Theme-Commits + L-1/L-2 + C-1 |
| **P5** | Juvantis Content-Alltag (2–3 weitere Bridge-Seiten, Content-Pflege als Gewohnheit) | 🔴 offen | nach M1 |
| **P6** | Mehrsprachigkeit Praxis (i18n-Mechanik + externe Übersetzungen + Integration) | 🔴 offen | nach P5 |
| **Ppol-rest** | A11y-Audit, Mobile-Finish, Design-Token-Feinschliff | 🔴 offen | nach P4 |
| **Popt** | N-6.4, N-6.5, Pattern C (Metafield), Media-Registry-Framework | ⏸ gefrierend | **nur bei Pain-Point** |
| **Pios** | N-3 Design-Token + iOS-Adapter | ⏸ gefrierend | **wenn iOS-App-Scope aktiv wird** |

### Zeit-Schätzung bis „holistisches System trägt"

| Scope | Sessions | Realistisch bei 2–3/Tag |
|---|:---:|---|
| Kern-System (P1–P5) | 11–16 | 4–7 Wochen |
| + P6 Mehrsprachigkeit | 17–26 | 6–11 Wochen |
| + Ppol Polish | 18–28 | 7–12 Wochen |

Externe Blocker eingerechnet: DF-Support, Rechtsquellen (Impressum/Datenschutz), Arzt-Fotos, externe Übersetzungen.

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

- **Version:** `0.9.1` — Session 38 **Header-Variante-A live + Footer-Doppelung gefixt** (2026-04-24, Cluster-Mini-02)
- **Stand:** 2026-04-24, **S38 technisch durch** (Header-Polish + 2 Dr.-Stracke-Iterationen + Footer-Fix), Theme-Commits offen für visuelle Abnahme:
  - **Theme-Stand:** PXZ **2.7.26 → 2.7.27 → 2.7.28 → 2.7.29** (3 Patch-Bumps in Sequenz)
  - **Header-Polish (S38a Variante A):** Schrift 21 px Bold, Hit-Area 89×64, Underline-Slide-In, Submenu-Card 16px-Radius + shadow-card-hi, Active-Parent 3px ::after, Sub-Label `--pxz-text-muted`, Touch-Click-Toggle in nav.js
  - **Header-Iterations (Dr.-Stracke-Wunsch):** +2pt Schrift (17/18 → 20/21 px), font-weight 500→700 bold, Homepage 4+3-Umbruch repariert (Bug: `homepage.css` überschrieb `nav.css` `display:grid` mit `display:flex`)
  - **Footer-Doppelung gefixt:** `template-homepage.php` rendete inline `<footer class="pxz-footer">`-Block + danach `get_footer()` → zwei Footer untereinander auf Homepage (auf anderen Seiten korrekt). Inline-Footer entfernt, `footer.php` ist Single-Source.
  - **Sanitizer-Rotation:** SESSION_RESUME 16873 → 7432 Tokens (−56 %), §3-legacy-21..33 + §5-legacy nach `_archive/sessions/2026-04/sessions-23-33-arc.md` ausgelagert
  - **Pattern + Tutorial NEU:** `Nexus/_memory/patterns/single-source-ui-region.md` + `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/24-doppelte-render-quellen-aufspueren.md`
- **Working-Tree am Session-Ende:**
  - **Cortex-Web:** SESSION_RESUME.md modified · `_archive/sessions/2026-04/sessions-23-33-arc.md` neu · `specs/sprint-2/S38_evidence/` neu (probe.mjs + 4 Hilfsproben + self-check.md + screenshots/)
  - **Theme `praxiszentrum`:** 5 modified (`nav.css`, `nav.js`, `homepage.css`, `template-homepage.php`, `functions.php`) — **NICHT committed**, wartet auf Dr.-Stracke-Final-Abnahme
  - **Nexus:** Pattern + Tutorial neu · MEMORY.md Auto-Sync · Sanitizer-Logs (growth/redundancy/stale-refs)
- **Pre-Flight Session-Ende:** `validate.sh` 🟢 · `verify.sh` 🟢 · Sanitizer im Budget (alle Dateien OK) · 4+3-Probe Homepage 🟢 · Footer-Anzahl Homepage = 1 🟢

### §1.1 Phasen-Status

| Phase | Ziel | Status |
|:---:|------|:---:|
| 0–5 | Cortex-Web-Aufbau | ✅ |
| Praxis-Sprint-2 (S2.3 + S2.4) | 6 Cluster + Menü + Bridge | ✅ |
| content-bridge-v1 + cross-site-transfer | Adapter-Suite + 6 Patterns + 4 Registries | ✅ Session 22 |
| Sanitizer V4 + V5 | Token-Budget-Pflege automatisiert | ✅ Session 23 |
| Adapter-Symmetrie A/B (S24..S30) | Push/Pull/Diff für Pages + Templates auf beiden Plattformen | ✅ |
| CW-PRIO-001 + Block A | Holistische Prio + 2 Arzt-Fotos | ✅ Session 31–33 |
| **MVP-Rohling 24h-Sprint (S34–S36)** | **Block B durch: 29/29 URLs HTTP 200, MVP_HANDOFF dokumentiert** | **✅ siehe §3-legacy-36** |
| **S38 Header-Variante-A + Iteration + Footer-Fix** | **PXZ 2.7.29: Header 21 px bold + 4+3-Umbruch + ein Footer überall** | **✅ technisch · Commits offen** |

**Status:** MVP-Rohling lokal komplett begehbar. Header-Polish technisch fertig, wartet auf finale visuelle Abnahme + Theme-Commit. Pre-Live-Blocker unverändert: Legal-Review L-1/L-2 (extern), SFTP-Deploy C-1 (extern). Pfad zu M1: ~3 Sessions (Header-Commit-Bestätigung, Legal, Deploy).

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

## §3 Letzte Session — Session 38, 2026-04-24 (Header-Variante-A + 2 Iterationen + Footer-Fix)

### Gerät
**Cluster-Mini-02** (home-Mac M2).

### Auftrag
Dr. Stracke (Session-Start „Projekt fortsetzen Cortex-Web"): Default S38 = Header-Menü-Redesign laut Spec `specs/sprint-2/S38_header-menu-redesign.md`.

### Drei-Akte-Verlauf

**Akt 1 — Architekten-Modus Setup (15 min):**
- Pflicht-Init durch (Nexus/CLAUDE, MEMORY, GLOBAL_RULES, Cortex-Web/CLAUDE, SESSION_RESUME §0–§3, S38-Spec)
- Pre-Flight 🟢 · Sanitizer-Soft-Warn dokumentiert (16873 Tokens)
- Architekten-Statement mit 5 Front-Optionen + 4 Variantenwahl im Header
- Dr. Stracke wählt **„1A"** = Front 1 (S38) + Variante A „Apple klar & groß"
- 3 Mikro-Entscheidungen (Sanitizer-Reihenfolge / Versionierung / Probe-Tiefe) → „die risikoärmste" → 1a/2a/3a (Sanitizer-zuerst, Patch-Bump 2.7.27, Voll-Probe)

**Akt 2 — Sanitizer-Rotation + S38 Variante A (60 min):**
- SESSION_RESUME.md verdichtet von 16873 → 7432 Tokens (−56 %); §3-legacy-21..33 + §5-legacy nach `_archive/sessions/2026-04/sessions-23-33-arc.md` ausgelagert; §7-Index aktualisiert
- nav.css Variante-A-Patches (5 Hunks): Schrift 17/18 px, Hit-Area-Padding, Underline-Slide-In `::after` (180 ms ease-out), Submenu-Card 16px-Radius + `--pxz-shadow-card-hi`, Active-Parent über `::after` (3 px), Sub-Label `--pxz-mist` → `--pxz-text-muted`
- nav.js Touch-Click-Toggle (`window.matchMedia('(hover: none)')`) + Click-outside-to-close + zentrales `closeAllSubmenus()`
- functions.php PXZ_VERSION 2.7.26 → 2.7.27
- Phase-4-Probe: AK-1..AK-6 alle ✅ (Exit 0); Self-Check-Doc + Screenshots in `specs/sprint-2/S38_evidence/`

**Akt 3 — Dr.-Stracke-Iteration 1 (Schrift +2pt + bold + 4+3 Bug-Fix, 30 min):**
- Bug-Befund: auf der Homepage Menü nicht 4+3, sondern alle 7 in einer Zeile. Diagnose: `homepage.css:141` `.pxz-nav-list { display: flex }` überschrieb `nav.css` `display: grid` (homepage.css wird später im Cascade geladen, nur auf Home)
- Fix: Duplikat-Regeln aus homepage.css entfernt, Single-Source-Kommentar gesetzt
- Schrift Iteration: 1.0625rem/1.125rem (17/18 px) → 1.25rem/1.3125rem (20/21 px), font-weight 500 → 700 (bold)
- functions.php PXZ_VERSION 2.7.27 → 2.7.28
- Re-Probe: Homepage 4+3 Reihen ✅, Schrift 21 px ✅, Hit-Area 89×64 ✅, verify.sh 🟢

**Akt 4 — Dr.-Stracke-Iteration 2 (Footer-Doppelung, 25 min):**
- Bild-Befund: zwei Footer untereinander auf Homepage (oberer = altes Inline + Sprachschalter, unterer = neuer S2.4b-Footer mit Adresse + Sprechzeiten + Doctolib)
- Diagnose: `template-homepage.php` Z. 299-332 inline `<footer class="pxz-footer">`-Block + Z. 356 `get_footer()` → beide werden gerendert. Auf anderen Seiten kommt nur `get_footer()`, daher dort kein Bug.
- Fix: Inline-Footer-Block aus `template-homepage.php` entfernt + Single-Source-Kommentar gesetzt; `pxz-mobile-cta` (Mobile-Sticky-Bar) bleibt
- functions.php PXZ_VERSION 2.7.28 → 2.7.29
- Re-Probe: Homepage hat genau 1 `<footer>` ✅

### Pre-Flight-Metriken am Session-Ende
- `tools/validate.sh` — OK (1 file)
- `sites/praxis-webseite/tools/verify.sh` — VERIFY OK
- Sanitizer Probe + Learn — 0 Duplikate, 98 stale-refs (−12 vs. S33; meist Platzhalter)
- Header-Probe AK-1..AK-6 grün
- Homepage 4+3 grün
- Footer-Anzahl Homepage = 1 grün

### Working-Tree (Commit-Stand)
- **Cortex-Web** ✏️ uncommitted: SESSION_RESUME-Update + neue Archiv-Datei + S38_evidence/
- **Theme** ✏️ uncommitted: nav.css · nav.js · homepage.css · template-homepage.php · functions.php (PXZ 2.7.29)
- **Nexus** ✏️ uncommitted: Pattern `single-source-ui-region.md` · Tutorial 24 · Sanitizer-Auto-Logs

### Pattern + Tutorial (NEU)
- Pattern `Nexus/_memory/patterns/single-source-ui-region.md` — Diagnose & Auflösung doppelter Render-Quellen für UI-Regionen
- Tutorial `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/24-doppelte-render-quellen-aufspueren.md` — 3-Schritte-Diagnose-Workflow + 4 typische Doppelungsmuster

### Nicht erledigt (bewusst)
- **Theme-Commits** — warten auf finale visuelle Akzeptanz Dr. Stracke nach Browser-Refresh
- **Spec §6 Folge-Fragen** (Doctolib-URL, Notfall-Hinweis, Icons, Avatare) — bei Variante A nicht relevant; auf Eis bis B/C/D-Diskussion
- Externe Blocker unverändert (L-1/L-2 Legal, C-1 DF-Support, A-2 Foto-Shoot, FAQ-Content, Aktuelles-Echtmeldungen)

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

> **Strategie-Rahmen:** CW-PRIO-001. Header-Polish technisch durch (S38), wartet auf Dr.-Stracke-Akzeptanz + Theme-Commit. Danach Externe-Blocker-Loop (L-1/L-2 + C-1) für M1.

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

### Hygiene Session 39 (Pflicht-Eintritt)
1. **Theme-Commits durchführen** (sobald Dr. Stracke „Header passt + Footer-Fix passt" sagt) — Vorschlag: 1 Commit `feat(s38-a): header polish + iterations + double-footer fix (PXZ 2.7.29)` ODER 2 Commits (Header-Polish · Footer-Fix)
2. **Cortex-Web-Commit** (SESSION_RESUME + Archiv + S38_evidence)
3. **Nexus-Commit** (Pattern `single-source-ui-region` + Tutorial 24)

### Folge-Blöcke (nach M1)
- **E** Juvantis Content-Alltag (P5)
- **F** Mehrsprachigkeit Praxis (P6)
- **G** Design-Polish / A11y / Mobile-Feinschliff (Ppol-Rest)

### Gefrierend offen (nicht anfassen bis Praxis live)
- Medien-Registry-Framework · Shopify-Media-Upload-Pfad · N-6.4 / N-6.5 · N-3 Design-Token · `_inbox/media-root/` Sortierung

### Ewige externe Blocker
- Santapress-Archive-Entscheidung fällig ab 2026-05-19
- Sono-atlas DSGVO-Gate (R-7)

---

## §5 Sofort-Status-Frage an Dr. Stracke — Session 39

> **S38 ist technisch durch:** Header-Polish + 2 Dr.-Stracke-Iterationen (Schrift 21 px bold, Homepage 4+3-Bug behoben) + Footer-Doppelung gefixt. PXZ 2.7.29. Working-Tree: 5 Theme-Files modified, kein Commit.
>
> **Default für Session 39 — Hygiene + Front-Wahl:**
> 1. **Quick-Status-Frage:** Header und Footer optisch akzeptiert? → Theme-Commits durchführen (1 oder 2 Commits) + Cortex-Web/Nexus-Commits
> 2. **Falls Iteration nötig** — direkt anpassen statt commiten
> 3. **Front-Wahl** für Session-Hauptarbeit (siehe Alternativen unten)
>
> **Alternativen für Session 39:**
> - **B-1 für 1–2 Ärzte** — wenn CV-Stichworte bereit sind (½ Session pro Arzt)
> - **L-1/L-2 Legal-Review-Iteration** — wenn Sie Impressum/DSE durchgegangen sind
> - **C-1 DF-Support reaktivieren** — wenn SFTP-Zugang freigegeben ist (Pre-Flight für D-1)
> - **B-3 Aktuelles-Echtmeldungen** — wenn Sie Inhalte parat haben
> - **G Mobile-/A11y-Audit** — wenn Sie das Polishing fortsetzen wollen
>
> **Nicht in der Default-Liste:** Media-Registry-Framework · N-6.4/6.5 · iOS · `_inbox/`-Sortierung · Home-Hero-Redesign (später).

---

## §6 Verbote / harte Regeln (Session 39 NIE passieren darf)

- **HWG/Berufsordnung:** Keine Werbung, keine Heilversprechen, keine Preise auf Praxis-Site (CW-005)
- **Trunk ist Master (CW-001):** Keine Inhalte direkt im WP-Admin oder Shopify-Admin ändern
- **Gerichteter, expliziter Transfer (CW-006):** Kein Auto-Sync, kein Webhook-Live-Mirror
- **Trunk alleinige Brücke (CW-007):** Immer Site → Trunk → Site
- **Backup vor destruktivem Push (CW-008):** Kein Overwrite ohne `adapters/*/.backups/`
- **Mojibake-Disziplin** bei Content-Migration
- **Brand-Switch-Konsistenz:** Neue Doctor-Slugs immer in `pxz_doctor_slugs()` registrieren
- **Single-Source UI-Region (NEU S38):** Vor jedem Komponenten-Refactor Volltextsuche auf `<tag>` und CSS-Klasse — keine Doppelungen, keine Page-CSS-Override für globale Komponenten-Selektoren
- **Keine eigenmächtigen Strukturänderungen** ohne Dr.-Stracke-Freigabe (LL-023, KON-001)
- **Token-Budgets einhalten (LL-044):** SESSION_RESUME ≤ 15 k · MEMORY ≤ 10 k · Nexus/CLAUDE ≤ 12 k
- **Holistische Prio (CW-PRIO-001, S31):** P1–P5 dominieren; Popt/Pios nur bei Pain-Point

---

## §7 Archivierte Sessions — Index

Alle historischen Session-Logs unter `_archive/sessions/YYYY-MM/`.

| Session | Datum | Thema | Archiv-Pfad |
|:---:|---|---|---|
| 38 | 2026-04-24 | Header-Variante-A live + 2 Iterationen (Schrift 21 px bold, Homepage 4+3-Bug) + Footer-Doppelung gefixt + Pattern `single-source-ui-region` + Tutorial 24 | §3 (aktuelle Session) in dieser Datei |
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
