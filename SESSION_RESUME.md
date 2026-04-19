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

- **Version:** `0.6.0` — **Phase 5 abgeschlossen** (Juvantis-Web-Subsumierung)
- **Stand:** 2026-04-19, Session 7 abgeschlossen
- **Working Tree:** clean
- **Cortex-Web-Aufbau (Phase 0–5):** ✅ **vollständig**
- **Trunk-Content:** unverändert, 1 Produkt (`basic-check.yaml`)
- **WP-Adapter:** Phase 1, idempotent, HWG-konform, Review-geprüft
- **Shopify-Adapter:** Phase 2, idempotent, draft-only, Review-geprüft
- **Review-Pipeline:** Phase 3, 11/11 automatische AKs grün
- **Praxis-Site:** `sites/praxis-webseite/`, Theme-Pointer auf Commit `257304e` (PXZ_VERSION 2.7.5)
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

**Stand Ende Session 7:** alle vier grün (validate, CHECK_SHOPIFY, theme-Klon-HEAD `1fbc35b`, status clean).

---

## §3 Letzte Session — Session 7, 2026-04-19

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

### P0 — Praxis-Redesign fortsetzen (Dr. Stracke explizit angekündigt)

**Dr. Stracke: „machen wir mit dem Redesign der Webpage weiter; FTP-Daten
habe ich mittlerweile; wir machen aber trotzdem zuerst Design und Content."**

Einstieg: **Praxis-Sprint 2 / S2.1 — Seiten-Inventar & Content-Audit.**
- Pfad: `sites/praxis-webseite/`
- Sprint-1-Reanimation (SFTP/Staging) bewusst zurückgestellt, obwohl
  Credentials vorliegen — Design + Content zuerst.
- Befehl nächste Session: `„Projekt fortsetzen Cortex-Web"` → Option A
  (oder direkt `„Projekt fortsetzen praxis-webseite"` für tieferen Einstieg).

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

> **„Cortex-Web Phase 5 (Juvantis-Web-Subsumierung) abgeschlossen — 12/12 AKs grün,
> 8+ Commits, Juvantis-Web-Docs-Schicht in `sites/juvantis-webseite/` integriert,
> Shopify-Theme-Klon und Live-Site unberührt. Cortex-Web-Aufbau Phase 0–5 damit
> vollständig.**
>
> **Dr. Stracke hat für die nächste Session festgelegt: Praxis-Redesign
> fortsetzen — zuerst Design + Content, danach SFTP/Staging-Sprint.
> Welche Front konkret?**
>
> A. **Praxis-Sprint 2 / S2.1 — Seiten-Inventar & Content-Audit** (empfohlen
>    als logischer Folgeschritt, Vorbedingung für Kernseiten-Batches).
>    Einstieg: `cd sites/praxis-webseite && cat SESSION_RESUME.md`
> B. **Praxis-Sprint 2 / S2.0b — Komponenten-Abstraktion** (wenn Token-SSoT
>    weitergedacht werden soll, bevor neue Seiten entstehen).
> C. **Andere Praxis-Sprint-Front** (Dr. Stracke nennt).
> D. **Doch zuerst Juvantis-Web oder Phase 2b Medien** (wenn sich die
>    Priorität ändert)."

Keine Code-Änderung vor Ihrer Wahl.

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
| *(8)* | *tbd* | *Praxis-Sprint 2 / S2.1* | *Seiten-Inventar & Content-Audit (von Dr. Stracke festgelegt)* | — |

---

*Stand: 2026-04-19, Ende Session 7. Nächste Session: per „Projekt fortsetzen Cortex-Web" (LL-043) → Status-Frage A–D aus §6 wählen. Erwartete Wahl laut Dr.-Stracke-Ankündigung: A (Praxis-Sprint 2 / S2.1).*
