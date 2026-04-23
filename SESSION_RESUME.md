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

- **Version:** `0.7.5` — Session 27: N-8 Pattern-A-vs-B-Guard in `pages-to-shopify.mjs` ✅ (2026-04-23, autonom Cluster-Mini-02)
- **Stand:** 2026-04-23, Cortex-Web-Aufbau (Phase 0–5) ✅ + Content-Bridge + Cross-Site-Transfer (push/pull/diff symmetrisch für `shopify:page`) ✅ + **Pattern-Konversions-Schutz am Shopify-Page-Push** ✅ + Praxis-Sprint 2 → 6/7 Cluster ✅ + Footer-Umbau S2.4b ✅ + Design-Polish S2.4d ✅
- **Jüngste Commits (Session 27):**
  - Cortex-Web: `74c6470` (N-8 guard + spec + evidence) · folgt: S27-Close-Commit (SESSION_RESUME + MEMORY + Dashboard)
  - Nexus: folgt: S27-Pattern + Tutorial 04 + MEMORY-Update
  - Theme: unverändert seit S25 (`42001ec` PXZ 2.7.21)
- **Working Tree:** Cortex-Web — `74c6470` gelandet; SESSION_RESUME wird in dieser Session zusätzlich committed. Nexus committed lokal am Session-Ende, Auto-Sync läuft in Folge.

### §1.1 Phasen-Status

| Phase | Ziel | Status |
|:---:|------|:---:|
| 0 | Skelett + Regeln + Nexus | ✅ |
| 1 | POC WP-Adapter | ✅ |
| 2 (Setup+Adapter) | Shopify Custom App + POC-Adapter | ✅ |
| 3 | Review-Pipeline + Go/No-Go | ✅ |
| 4 | Subsumierung praxis-redesign → `sites/praxis-webseite/` | ✅ |
| 5 | Subsumierung Juvantis-Web-Docs → `sites/juvantis-webseite/` | ✅ |
| **Praxis S2.3-B…S2.3-kern…checkups…S2.4…aerzte-services…diagnostik** | **6 Content-Cluster + Menü + Bridge Praxis↔Juvantis** | **✅ Session 14→21** |
| **Cortex-Web content-bridge-v1** | **Shopify-Page/Template-Adapter + Trunk `ueber-uns`** | **✅ Session 22** |
| **Cortex-Web cross-site-transfer** | **Architektur + 6 Patterns + 4 Registries + cw-transfer CLI + CW-006/007/008** | **✅ Session 22** |
| **Sanitizer V4 Retroaktiv-Kur** | **SESSION_RESUME + MEMORY + Nexus/CLAUDE verdichtet, 12 Sessions archiviert, Tool + LL-044 + SESSION_LIFECYCLE §2 Schritt 3b** | **✅ Session 23** |
| **Page-Adapter N-5+N-7 + Cross-Links E (S2.4c)** | **`PUBLISH=1` Runtime-Flag + CW-008-Backup vor PUT + `/praxis/` Teaser zu `/leistungen/`+`/diagnostik/`** | **✅ Session 24** |
| **S2.4b Footer-Umbau** | **Blocksy-Default raus, eigener PXZ-Footer mit Brand + 4-Spalten-Grid + Bottom-Bar (footer-data.php SSoT, 4-sprachig)** | **✅ Session 25** |
| **S2.4d Design-Polish** | **Card-Hover-Normalisierung (4 Files, shadow-card-hi + 180ms cubic-bezier + translateY(-3px)) + iOS-Drawer-Easing + Diagnostik-Typo clamp()** | **✅ Session 25** |
| **N-6 `cw-transfer diff`** | **Read-only Build-then-Fetch-then-Diff für `shopify:page`. 240-Zeilen-Adapter, 12/12 AKs, Live-Test gegen `/uber-uns` zeigt Pattern-A-vs-B-Drift.** | **✅ Session 26** |
| **N-8 Pattern-A-vs-B-Guard** | **`pages-to-shopify.mjs` verweigert Push auf Pattern-B-Page ohne `ALLOW_PATTERN_OVERRIDE=1`. +25 Z. Adapter, 11/11 AKs, Bundle 6.88 KB.** | **✅ Session 27** |

**Status:** Cortex-Web-Aufbau abgeschlossen. Adapter-Suite hat jetzt symmetrisch push/pull/diff für `shopify:page` **und** einen Pattern-Konversions-Guard (verhindert unbeabsichtigte B→A-Konversion beim Push). Praxis-Footer vollständig gebrandet, global konsistent. Design-Polish über 5 CSS-Dateien harmonisiert. 6/7 Content-Cluster migriert. Verbleibend: `legacy/de` (23 P2) · Footer-Legal-Ziele (Impressum, Datenschutz brauchen Content aus S2.3-A) · N-6.2 `cw-transfer diff shopify:template` (Symmetrie auf Pattern-B-Ebene).

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

### Praxis-Site Pre-Flight (für Sprint-2-Arbeit)
```bash
cd ~/Cortex/projects/Cortex-Web/sites/praxis-webseite && bash tools/verify.sh
```

### Juvantis-Site Pre-Flight (für Theme-/Content-Arbeit)
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://sanexio.eu/
git -C ~/Cortex/projects/Juvantis/juvantis-web/theme rev-parse HEAD
```

### Vollreview (langsam, Regressions-Schutz)
```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/review.sh
```

### Sanitizer-Probe (NEU seit Session 23)
```bash
bash ~/Cortex/Nexus/tools/cortex-sanitizer/rotate.sh --probe
```
Erwartet: Alle gepflegten Dateien unter Token-Budget (LL-044). Siehe `Nexus/tools/cortex-sanitizer/README.md`.

---

## §3 Letzte Session — Session 27, 2026-04-23 (N-8 Pattern-A-vs-B-Guard, autonom)

### Gerät
**Cluster-Mini-02** (home-Mac M2), autonom-Modus.

### Ziel
Umsetzung N-5/N-7-Schutz aus SESSION_RESUME-S26-§4. Dr. Stracke gab
Front-Wahl frei („du darfst entscheiden"). Claude wählte nach
Effizienz-/Effektivitäts-Bewertung:
- **Quick-Win mit höchstem Sicherheits-Hebel** — schließt das durch N-6
  Live-Test sichtbar gewordene Push-Loch (Pattern-B-Page würde von
  Pattern-A-Trunk überschrieben, Theme-Binding ginge verloren).
- **Nicht gewählt:** Live-Verify (CW-006: explizite Operator-Aktion),
  N-6.2 (eigene Session), N-1 (größere Front).

### Umsetzung

**Spec:** `specs/cross-site-transfer/N-8_pattern-a-vs-b-guard.md` (125 Z., §1–§4, 11 AKs)

**Code-Änderungen `adapters/shopify/pages-to-shopify.mjs` (+25 Z.):**
1. Lookup-Fields erweitert: `...,template_suffix` (kein Extra-Request, nur
   zusätzliches Feld im bestehenden GET)
2. Neuer Env-Flag `ALLOW_PATTERN_OVERRIDE` (default: verweigern, kein
   Silent-Konversion)
3. Guard-Block **VOR** dem Publish-Check im `pages.length === 1`-Zweig —
   „gröbere" Aktion (Pattern-Konversion) greift vor „feinerer" (Publish-Overwrite)
4. Error-Message nennt Flag wörtlich: `...is Pattern B (template_suffix="uber-uns")
   — a Pattern-A push would discard the theme binding. Set ALLOW_PATTERN_OVERRIDE=1
   to proceed.`
5. Summary-Felder `live_template_suffix` + `pattern_override` immer
   ausgegeben (auditierbar, auch bei Create → null/false)

**Doku-Änderungen:**
- Adapter-Header-Comment: neuer Env-Block + N-8-Vermerk in Revisionsliste
- `tools/sync-page-shopify.sh`: Env-Liste um ALLOW_PATTERN_OVERRIDE erweitert

**Evidence:** `specs/cross-site-transfer/evidence/2026-04-23_n-8_self-check.md`

### Selbstprüfung 11/11 AK = 100 %
- AK-1 Spec (125 Z., §1–§4) ✅
- AK-2 template_suffix im Lookup (Zeile 95) ✅
- AK-3 ALLOW_PATTERN_OVERRIDE gelesen (Zeile 77) ✅
- AK-4 Guard vor published-Check (Z. 121–131 vor Z. 133–136) ✅
- AK-5 Error-Message enthält template_suffix-Wert + Flag-Text ✅
- AK-6 allow=1 → Durchlauf (Code-Review) ✅
- AK-7 !isPatternB → unverändert (Code-Review) ✅
- AK-8 Create-Pfad → live_template_suffix=null ✅
- AK-9 Summary enthält beide Felder immer (Z. 187–188) ✅
- AK-10 Adapter + Shell-Wrapper dokumentiert ✅
- AK-11 `validate.sh` grün + Bundle `6.88 KB · Bundled 2 modules in 30ms` ✅

### Bonus: 4 Szenarien durchgespielt (Evidence-Datei §Bonus-Betrachtung)
- S-1 Create (new page) — Guard inaktiv, Summary `live_template_suffix=null`
- S-2 Update Pattern-A-Page — Guard durchfällt, Publish-Check übernimmt
- S-3 Update Pattern-B-Page ohne Flag — Exit 2 mit klarer Message ← Haupt-Use-Case
- S-4 Update Pattern-B-Page mit `ALLOW_PATTERN_OVERRIDE=1` — Guard durchfällt,
  Backup + PUT, Summary zeigt Override-Tatsache auditierbar

### Bezug zu S26-Live-Test

N-6 `cw-transfer diff` (S26) hatte gegen `sanexio.eu/pages/uber-uns` den Drift
aufgedeckt:
```
template_suffix DIFFER (live="uber-uns" ≠ trunk=null)
body_html DIFFER (live=0 chars, trunk=8505 chars)
```
Nach N-8 scheitert der Push-Versuch gegen diese Page jetzt am Guard (Exit 2),
bevor das Backup auch nur angelegt würde. Die beiden Systeme sind komplementär:
- **N-6** = read-only Drift-Report (Operator sieht den Unterschied)
- **N-8** = write-time Drift-Blocker (Adapter verweigert Konversion)

### Pre-Flight-Metriken am Session-Ende
- `tools/validate.sh` — OK (1 file)
- Sanitizer Probe — alle 5 Dateien im Budget (MEMORY 3666, Nexus/CLAUDE 6410, GLOBAL_RULES 6171, cortex-agent 1721, Cortex-Web 6413 Tokens)
- Sanitizer Learn — 0 Duplikate, 89 stale-refs (+1 ggü. S26 durch N-8-Spec-Pfade, stabil)
- Theme: PXZ 2.7.21 unverändert

### Pattern + Tutorial (geschrieben in dieser Session)
- Pattern: `Nexus/_memory/patterns/adapter-pattern-classification-guard.md` (NEU)
- Tutorial: `Second Brain/30 Tutorials/Arbeitsweise & Prozess/04-cross-site-adapter-guards.md` (NEU)

### Commits
- Cortex-Web: `74c6470` (N-8 guard + spec + evidence) · SESSION_RESUME + MEMORY folgt am Session-Ende
- Nexus: folgt am Session-Ende (Pattern + Tutorial + MEMORY)

### Nicht erledigt (bewusst verschoben)
- **Live-Verify N-5/N-7/N-8** — Push-Versuch gegen `/uber-uns` würde jetzt
  den Guard auslösen (Exit 2, read-only-äquivalent). Kann in S28 als
  Integration-Test gefahren werden. CW-006: Operator-Entscheidung.
- **N-6.2** `cw-transfer diff shopify:template` — eigene Session
- **N-1** WP-Template-Adapter — eigene Front
- **Cluster `legacy/de` Content-Sichtung** — eigene Front
- **`/impressum/` + `/datenschutz/` Content** — Blocker: Rechtsquellen Dr. Stracke

---

## §3-legacy-26 Session 26, 2026-04-23 (N-6 `cw-transfer diff shopify:page`, autonom)

### Kerninhalt (Vollversion: Commit `02c57cb` + Evidence `2026-04-23_n-6_self-check.md`)
- **Adapter NEU** `adapters/shopify/diff-page.mjs` (240 Z.): Build-then-Fetch-then-Diff,
  spawnt `build-page.mjs` als Sub-Prozess, GET-only Live-Fetch, field-by-field
  Compare mit Normalisierung (`null` ↔ `""`), konditionale Felder (`published`
  nur bei `PUBLISH=1`). Exit 0/1/2.
- **CLI** `tools/cw-transfer`: `DIFF_TOOLS` Dispatch + `cmdDiff` aktiviert + Help-Text
- **Spec** `specs/cross-site-transfer/N-6_cw-transfer-diff.md` (12 AKs, 100 %)
- **Live-Test** `juvantis.myshopify.com/pages/uber-uns`: title EQUAL, template_suffix
  DIFFER, body_html DIFFER (8505↔0) → Pattern-A-vs-B-Drift sichtbar → war direkter
  Auslöser für S27/N-8.
- **Pattern** `build-then-fetch-then-diff.md` + **Tutorial 03** `cross-site-adapter-diffs.md`

---

## §3-legacy-25 Session 25, 2026-04-23 (S24-Close + S2.4b Footer + S2.4d Design-Polish, autonom)

### Kerninhalt (Vollversion in Git-Historie + Nexus/_archive nach Sanitizer-Rotation)
- **Block 1 S24-Close:** Cortex-Web `d3aea84`/`b1101ad` + Theme `f5a9bec` (PXZ 2.7.19, S2.4c Praxis-Cross-Links)
- **Block 2 S2.4b Footer-Umbau:** Theme `f85611a` (PXZ 2.7.20). Eigener `footer.php` Child-Override, `template-parts/site-footer.php` (142 Z.), `inc/footer-data.php` (4-sprachig), `assets/css/footer.css` (241 Z., dark-ink + red-accent). Selbstprüfung 12/12. Cortex-Web `247af3f`.
- **Block 3 S2.4d Design-Polish:** Theme `42001ec` (PXZ 2.7.21). Card-Hover-Normalisierung (`arzt.css`/`leistungen.css`/`diagnostik-hub.css`/`checkup-hub.css` → 180ms cubic-bezier(0.2,0,0,1) + translateY(-3px) + shadow-card-hi). iOS-Drawer-Easing in `nav.css`. Card-Title clamp(). Selbstprüfung 9/9. Cortex-Web `c94d840`.
- **Pattern + Tutorial:** 3 Patterns + Tutorial 24 in Nexus committed `1011494`.

---

## §3-legacy-24 Session 24, 2026-04-22 (N-5 + N-7 + E, autonom)

### Ziel
Drei Infrastruktur-/Content-Fronten in einer Session selbständig erledigen
(Freigabe Dr. Stracke: „nach eigenem Ermessen, ohne Rückfragen fortsetzen"):
**N-5** (Shopify-Page-Publish-Helper), **N-7** (CW-008-Backup am
Page-Adapter), **E** (Cross-Links von `/praxis/` nach `/leistungen/` +
`/diagnostik/`).

### Kernergebnisse

**N-5 + N-7 (`adapters/shopify/pages-to-shopify.mjs`):**
- `PUBLISH=1` Env-Flag → `effectivePage.published = true` am Write. Trunk
  bleibt Draft-pflichtig (CW-001).
- Vor jedem Update: voller GET `/pages/<id>.json` → JSON-Dump in
  `adapters/shopify/.backups/<ts>_page<id>_<handle>.json`. Backup-Fail =
  Exit 2 (kein Write ohne Backup, CW-008).
- Summary +2 Felder: `publish_flag`, `backup_path`.
- `tools/sync-page-shopify.sh` Header um beide Flags + CW-008 ergänzt.
- Bundle-Build grün (`Bundled 2 modules in 5ms`).
- Code-Marker-Selbsttest 6/6 ✓. Selbstprüfung 10/10 AK = 100 %.
- Live-Verify: verschoben auf nächsten regulären Transfer (CW-006: kein
  autonomer Live-Push).

**E (S2.4c) — Praxis-Cross-Links:**
- Neues Template-Part `template-parts/praxis-crosslinks.php` mit 2 Cards
  (Leistungen · Diagnostik).
- Guard `is_page('praxis')` in `template-standard.php` — andere
  Standard-Seiten (Impressum, Datenschutz, Team-narrativ) unberührt.
- CSS-Block (+94 Zeilen) in `assets/css/standard.css` (2-col grid, mobile
  stack, Hover-Lift).
- `PXZ_VERSION 2.7.18 → 2.7.19` (Cache-Buster).
- Live-Verify: 2 Cards im `/praxis/`-HTML, 1 Link `/leistungen/`, 1 Link
  `/diagnostik/`, 0 Cross-Link-Marker auf `/impressum/`, beide Targets
  HTTP 200. `smoke-http.sh` 5/5, `smoke-seo.sh` 21/21.
- Selbstprüfung 12/12 AK = 100 %.

### Pattern + Tutorial (Nexus)
- Pattern: `Nexus/_memory/patterns/adapter-runtime-flag-vs-content-state.md`
  — Lehre aus N-5 (Laufzeit-Flag vs. Content-State).
- Tutorial: `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/23-template-parts-mit-is-page-guard.md`.

### Sanitizer-Status (Schritt 3b, LL-044)
- Probe: Alle Dateien im Budget (MEMORY 3604 Tok, Nexus/CLAUDE 6410 Tok,
  SESSION_RESUME 3820 Tok). Kein Apply nötig.
- Learn: 0 Duplikate, 81 stale-refs (+1 gg. Session 23, minimal).

### Commits (steht aus, Session-Ende-Abschluss)
Cortex-Web: pages-to-shopify + sync-page-shopify + specs/session-24 + S2.4c-Spec.
Theme: PXZ_VERSION, template-standard, template-parts/praxis-crosslinks, standard.css.
Nexus: MEMORY, Pattern, Tutorial.

---

## §3-legacy-21 Vorherige Praxis-Session — Session 21, 2026-04-22 (Praxis-Sprint 2 / S2.3-diagnostik)

### Ziel
Cluster `diagnostik` live bringen. Eigener Top-Nav-Bereich `Diagnostik ▼`. Hub `/diagnostik/` + Sub-Hub `/sonographie/` mit 3 Nested-Kindern + 3 flache Detail-Pages. Labor-Konsolidierung. 301-Redirects. atlas DSGVO-gated.

### Kernergebnisse
- 8 neue URLs (7 publish + 1 draft atlas), 4 alte Slugs → 301, 3 URLs → 404 wie erwartet
- `inc/diagnostik-data.php` als SSoT (4 Helper)
- `template-diagnostik-hub.php` (Dual-Mode: Top-Hub + Sub-Hub)
- `inc/seo-data.php` +8 Funktionen (MedicalProcedure, DiagnosticProcedure, MedicalTest, MedicalWebPage, ImageGallery)
- `inc/nav-data.php` neues Top-Item `Diagnostik ▼` + `match_prefix`-Feld für Nested-Active-State
- `pxz_old_slug_fallback_redirect()` weil WP-Core-Redirect für Pages unzuverlässig ist

### Verifiziert
- Migration idempotent (Lauf 2 = 0 Mutationen)
- HTML-Assertions: 4 Card-Grids, 5 H2 Labor, Mojibake 0×, Active-State auf allen Diagnostik-URIs
- verify.sh §1+§3 grün (Full-Run hatte unrelated Puppeteer-Chrome-Hang, nicht blockierend)
- 12/12 AK = 100 %

### Commits
- Theme: `25662ad` (PXZ_VERSION 2.7.18)
- Cortex-Web: `fb9c0eb` (Spec+Migration+Evidence+Self-Check) + `133d7f1` (SESSION_RESUME)
- Nexus: `71d6358` (MEMORY-Update)

### 5 Pattern-Kandidaten → Nexus
`wp-old-slug-redirect-reliability` · `wp-nested-pages-rewrite-flush` · `nav-match-prefix-active-state` · `dsgvo-draft-gate-pattern` · `php-getenv-normalization`

### Tutorial
`Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/22-wp-nested-pages-und-old-slug-redirects.md`

---

## §3-legacy-22 Parallele Cortex-Web-Session — Session 22, 2026-04-22 (content-bridge-v1 + cross-site-transfer)

- **Commits:** `987e3e4` (Block 1) + `98e063b` (Block 2)
- **Live:** `sanexio.eu/pages/uber-uns` (Shopify Page ID 157742137611) aus Trunk gerendert via Template-Bridge (Pattern B, Goldstandard)
- **Architektur:** 6 Patterns A–F (Simple Page · Template-Based Page · Metafield · Theme-Asset-Overwrite · Product-Sync · Design-Token), 4 Registries, `tools/cw-transfer` Meta-Orchestrator, CW-006/007/008 kodifiziert
- **Inhalte:** 8 Team-YAMLs + `ueber-uns.yaml` + erweiterte Schemas (page + team-member)
- **Kanonische Doku:** `specs/content-bridge-v1/SELF_CHECK.md` + `specs/cross-site-transfer/ARCHITECTURE.md` + `PATTERNS.md` + `docs/cross-site-transfer.md`
- **Voller Session-Log:** `_archive/sessions/2026-04/session-22-content-bridge-v1.md`

---

## §3-legacy-23 Session — Session 23, 2026-04-22 (Cortex-Sanitizer V4 + V5)

**V4 Retroaktiv-Kur** (Spec `specs/cortex-sanitizer/SPEC.md`):
- 12 Legacy-Session-Blöcke (7, 9-16, 19, 20, 22) → `_archive/sessions/2026-04/`
- SESSION_RESUME 123 KB → 15 KB (88 %), MEMORY 53 KB → 14 KB (73 %), Nexus/CLAUDE 41 KB → 26 KB (38 %)
- Nexus/CLAUDE Sprint-Logs → `Nexus/_archive/claude-md/2026-04.md`
- LL-044 in `GLOBAL_RULES.md §21` + Sanitizer-Probe in `SESSION_LIFECYCLE.md §2 Schritt 3b`
- Commits: Cortex-Web `03887b8` · Nexus `1440df9` + `652fc9b` + `076a018`

**V5 Selbstlernend + Auto-Apply** (Spec `specs/cortex-sanitizer/SPEC-V5.md`):
- 3 Probes: `growth-log.sh` (JSONL-Trend), `redundancy-scan.sh` (Paragraphen-Duplikate), `stale-ref-scan.sh` (tote Pfad-Links)
- `actions/rotate-session-resume.sh` — echter Auto-Apply für §3-legacy-Rotation
- `rotate.sh` erweitert: `--learn` + echter `--apply`
- `SESSION_LIFECYCLE §2 Schritt 3b` erweitert: bei Hard-Warn auto `--apply` + immer `--learn` + Dashboard-Integration (✅/🔧/🔴 + Learn-Befunde)
- Initial-Run: 0 Duplikate (sauber nach V4), 80 stale-refs (meist Platzhalter — V6-Polish)
- Pattern: `Nexus/_memory/patterns/self-regulating-token-budget.md`
- Tutorial: `Second Brain/30 Tutorials/Arbeitsweise & Prozess/02-selbstregulierende-memory-systeme.md`
- Commits: Cortex-Web `ecde8de` · Nexus `52e77be` + `132f3b0`

**Ziel-Metrik erreicht:** Pflicht-Init Summe ~20 k Tokens (vorher ~120 k) — weit unter 50 k Ziel.

---

## §4 Offene Tasks (Priorität absteigend)

### Wählbare Fronten für Session 28

| Prio | Front | Aufwand | Kommentar |
|:---:|---|---|---|
| **Live-Verify** | **Realer Shopify-Push-Versuch gegen `/uber-uns`** | 15–30 Min | Soll am N-8-Guard mit Exit 2 scheitern (Integration-Test, read-only-äquivalent, KEIN PUT). Beweist N-6 + N-8 end-to-end. Optional: zweiter Lauf mit `ALLOW_PATTERN_OVERRIDE=1` als bewusste Pattern-A-Konversion (dann echter PUT + Backup in `.backups/`). |
| **N-6.2** | **`cw-transfer diff shopify:template`** | 1 Session | Diff für Template-Asset-JSON (Pattern B). Dasselbe Build-then-Fetch-Pattern wie N-6, aber gegen Theme-Asset statt Page. Macht Diff-Quadrant symmetrisch auf beiden Render-Pattern. |
| **N-1** | **WP-Template-Adapter (Pattern B reverse)** | 1–2 Sessions | Dasselbe YAML für WP `/team/`. Rein Cortex-Web-Arbeit. |
| **N-6.3** | **`cw-transfer diff wp:page`** | 1 Session | Symmetrische WP-Page-Diff. Setzt N-1 voraus (oder zumindest WP-extract-page-Reuse). |
| **N-3** | **Design-Token-Adapter (Phase D)** | 2 Sessions | **Blocker:** Master-Frage (Praxis/Sanexio/Neutral). |
| **C** | **Cluster `legacy/de` Content-Sichtung** | mittel | Content aus `_content-archive/legacy/de/` sichten, archivierbar-Entscheidung. |
| **S2.3-A** | **`/impressum/` + `/datenschutz/` Content-Füllen** | 1 Session | Theme-Edit. **Blocker:** Rechtsquellen/Textvorlagen Dr. Stracke. |
| **B2** | **Weiterer Design-Polish** | klein | Falls S2.4d-Ergebnis im Browser zeigt dass mehr Tuning nötig ist. |

**Unverändert offen / blockiert:**

| Prio | Front | Aufwand | Blocker |
|:---:|---|---|---|
| **D** | Echt-Content + Fotos für 7 Stub-Arzt-Profile | groß | Bio-Text + Foto-Shooting extern |
| **G** | Beginn Sprint 3 i18n | 6+ Sessions | Erst nach C sinnvoll |
| **R-7** | sono-atlas DSGVO | — | DSGVO-Entscheidung Dr. Stracke |

### P1-Punkte aus Vorgänger-Sessions (offen)

- Santapress-Archive-Entscheidung fällig ab 2026-05-19
- WPForms-Marker (S2.3-kern)
- Google My Map mit POIs (S2.3-kern)
- „Aktuelles aus der Praxis"-Inhalt (S2.3-kern Setting leer)
- Footer-Legal-Links (Impressum/Datenschutz) führen aktuell auf leere Pages — wird mit S2.3-A gelöst

---

## §5 Sofort-Status-Frage an Dr. Stracke

> **Session 27 abgeschlossen (autonom auf Cluster-Mini-02):** N-8 Pattern-A-vs-B-Guard in `pages-to-shopify.mjs` ✅ (11/11 AK). Das in S26-Live-Test sichtbar gewordene Push-Loch ist geschlossen. Adapter-Suite hat jetzt read-only Drift-Detektor (N-6) und write-time Drift-Blocker (N-8) — komplementäre Sicherheitsebenen.
>
> **Welche Front für Session 28?**
>
> **Quick-Win (≤ ½ Session):**
> - **Live-Verify** — Push-Versuch gegen `/uber-uns` muss am N-8-Guard mit Exit 2 scheitern (Integration-Test, KEIN PUT). Beweist N-6/N-8 end-to-end. Optional: 2. Lauf mit `ALLOW_PATTERN_OVERRIDE=1` als bewusste Konversion.
>
> **Mittlere Fronten (1 Session):**
> - **N-6.2** — `cw-transfer diff shopify:template` (Pattern-B-Diff, gleiche Architektur wie N-6)
> - **C** — Cluster `legacy/de` Content-Sichtung (7/7-Vervollständigung)
> - **S2.3-A** — `/impressum/` + `/datenschutz/` Content (Blocker: Rechtsquellen)
>
> **Größer (1–2+ Sessions):**
> - **N-1** — WP-Template-Adapter (Pattern B reverse) für `/team/`
> - **N-6.3** — `cw-transfer diff wp:page` (setzt N-1 voraus)
> - **N-3** — Design-Token-Adapter (Blocker: Master-Frage)
>
> **Ad-hoc:** „Heute möchte ich X" / Review der S27-Ergebnisse / „weiter nach Effizienz/Effektivität entscheiden"

---

## §6 Verbote / harte Regeln (in Session 28 NIE passieren darf)

- **HWG/Berufsordnung:** Keine Werbung, keine Heilversprechen, keine Preise auf Praxis-Site (CW-005)
- **Trunk ist Master (CW-001):** Bei Bridge-Pages keine Inhalte direkt im WP-Admin oder Shopify-Admin ändern
- **Gerichteter, expliziter Transfer (CW-006):** Kein Auto-Sync, kein Webhook-Live-Mirror
- **Trunk alleinige Brücke (CW-007):** Keine direkten Shopify→WP-/WP→Shopify-Extractoren. Immer Site→Trunk→Site
- **Backup vor destruktivem Push (CW-008):** Kein Overwrite ohne vorheriges Backup in `adapters/*/.backups/`
- **Mojibake-Disziplin:** Bei Content-Migration IMMER Mojibake-Check
- **Brand-Switch-Konsistenz:** Neue Doctor-Slugs IMMER in `pxz_doctor_slugs()` registrieren
- **`grep -c` ist tückisch:** WP-HTML auf einer Zeile → IMMER `grep -oE … | wc -l` für Counts
- **WP-Filter-Hooks-Lade-Reihenfolge:** Helper vor Filter-Registrierung laden
- **Keine eigenmächtigen Strukturänderungen** in Nexus oder Cortex-Web ohne Dr.-Stracke-Freigabe (LL-023, KON-001)
- **Token-Budgets einhalten (LL-044):** SESSION_RESUME ≤ 15 k · MEMORY ≤ 10 k · Nexus/CLAUDE ≤ 12 k. Sanitizer-Probe bei Session-Ende pflichtig.

---

## §7 Archivierte Sessions — Index

Alle historischen Session-Logs sind git-tracked unter `_archive/sessions/YYYY-MM/`.

| Session | Datum | Thema | Archiv-Pfad |
|:---:|---|---|---|
| 27 | 2026-04-23 | N-8 Pattern-A-vs-B-Guard in `pages-to-shopify.mjs` + Pre-Write-Classification-Pattern | §3 (aktuelle Session) in dieser Datei |
| 26 | 2026-04-23 | N-6 `cw-transfer diff shopify:page` + Build-then-Fetch-then-Diff Pattern | §3-legacy-26 in dieser Datei |
| 25 | 2026-04-23 | S24-Close + S2.4b Footer-Umbau + S2.4d Design-Polish (PXZ 2.7.21) | §3-legacy-25 in dieser Datei |
| 24 | 2026-04-22 | Shopify-Page-Adapter N-5 PUBLISH=1 + N-7 CW-008 Backup + S2.4c Praxis-Cross-Links | §3-legacy-24 in dieser Datei |
| 23 | 2026-04-22 | Cortex-Sanitizer V4 + V5 (selbstlernend + Auto-Apply) | §3-legacy-23 in dieser Datei, siehe auch `Nexus/tools/cortex-sanitizer/` |
| 22 | 2026-04-22 | Cortex-Web content-bridge-v1 + cross-site-transfer | `_archive/sessions/2026-04/session-22-content-bridge-v1.md` |
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

**Sessions 17, 18, 21** sind inhaltlich in §3 (Session 21) und `MEMORY.md`-Aktive-Projekte-Zelle enthalten + im Nexus-Sprint-Log; separates Archive nicht notwendig.

**Vor-Session-7-Historie** (Phasen 0–5 Aufbau + Praxis S2.0 / S2.0c / S2.1): siehe `Nexus/_archive/claude-md/2026-04.md` und Git-Log (`git log --oneline`).
