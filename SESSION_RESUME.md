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

### Wenn Phase-5-Arbeit ansteht (Juvantis-Subsumierung — kein Go bisher)
14. `~/Cortex/projects/Juvantis/_config/RULES.md` — Juvantis-Regeln R-001…R-018
15. `~/Cortex/projects/Cortex-Web/specs/phase-4/SUBSUMPTION.md` + `evidence/2026-04-19_self-check.md` — Phase-4-Lessons (PH4-LL-1…5)
16. `~/Cortex/Nexus/_memory/patterns/cross-repo-subsumption.md` — der Pattern aus Phase 4

---

## §1 Stand & Version

- **Version:** `0.5.0` — **Phase 4 abgeschlossen** (Praxis-Subsumierung)
- **Stand:** 2026-04-19, Session 6 abgeschlossen
- **Git-Commits Session 6 (chronologisch):**
  - `c350b05` — Promote bridge-strategy from praxis-redesign (T1)
  - `94e6e91` — Add 'sites/praxis-webseite/' from commit 'c519852…' (T2 Subtree-Add)
  - `77adfc7` — Add THEME_POINTER for Local-WP theme repo (T3)
  - `dd38922` — Path refs + SUBSUMPTION spec + post-subsumption verify shots (T4 + T6)
  - `61b5187` — Refresh phase-3 review evidence after phase-4 (T6 evidence)
  - `b7266ab` — Self-check 12/12 green (T7)
- **Working Tree:** clean nach Session-6-LL-042-Audit
- **Trunk-Content:** unverändert, 1 Produkt (`basic-check.yaml`)
- **WP-Adapter:** Phase 1, idempotent, HWG-konform, Review-geprüft
- **Shopify-Adapter:** Phase 2, idempotent, draft-only, Review-geprüft
- **Review-Pipeline:** Phase 3, 11/11 automatische AKs nach Phase 4 weiterhin grün
- **Praxis-Site:** subsumiert als `sites/praxis-webseite/`, Theme-Pointer auf Commit `257304e` (PXZ_VERSION 2.7.5)
- **Theme-Repo (extern):** unverändert, HEAD `257304e7e9...`, working tree clean

### §1.1 Phasen-Status

| Phase | Ziel | Status |
|:---:|------|:---:|
| 0 | Skelett + Regeln + Nexus | ✅ |
| 1 | POC WP-Adapter | ✅ |
| 2 (Setup) | Shopify Custom App + Token | ✅ |
| 2 (Adapter) | POC Shopify-Adapter | ✅ |
| 3 | Review-Pipeline + Go/No-Go | ✅ |
| **4** | **Subsumierung praxis-redesign → sites/praxis-webseite/** | **✅ 2026-04-19** |
| 5 | Subsumierung Juvantis/juvantis-web → sites/juvantis-webseite/ | ⏳ kein Go |

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

### Vollreview (langsam, ~30–60s, Regressions-Schutz)
```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/review.sh
```
Erwartet: `AK automatisch: 11/11 grün`, Exit 0.

**Stand Ende Session 6:** alle vier grün, Evidenz in `specs/phase-3/evidence/` (Refresh) + `sites/praxis-webseite/screenshots/claude/2026-04-19_0925_verify_*.png` (Post-Subsumption).

---

## §3 Letzte Session — Session 6, 2026-04-19

### Ziel
Phase 4 (Praxis-Subsumierung) deterministisch ausführen — `praxis-redesign/` →
`Cortex-Web/sites/praxis-webseite/` mit Historie-Erhalt, ohne Pre-Flight-Regression,
ohne Touch am WP-Theme-Repo.

### Durchgeführt (Architekten-Modus 4 Phasen)

1. **Pflicht-Init geladen.** Pre-Flight `validate.sh` grün vor Beginn.
2. **Phase 1 (Verständnis):** Pre-Audit über vier Befunde (drei separate Git-Repos, unclean Working-Tree, undokumentierter `legacy-juvantis-praxis-web/`-Ordner, `git-filter-repo` nicht installiert) in `specs/phase-4/SUBSUMPTION.md` §1+§2 dokumentiert.
3. **Phase 2 (Lösungsdesign):** Drei Entscheidungspunkte E1/E2/E3 mit je 3 Optionen + Architekten-Empfehlung formuliert. 12 AKs, 7-Risiken-Matrix, Rollback-Plan.
4. **Dr.-Stracke-Wahl:** „ich folge deiner Entscheidung" → **E1a + E2b + E3a**.
5. **Phase 3 (Umsetzung) T0–T7:** in genau dieser Reihenfolge:
   - T0 Pre-Flight beider Repos grün
   - T1 Cleanup (E2b): bridge-strategy nach Cortex-Web promotet, ARCHITECTURE 4b in praxis-redesign committed, Verify-Shots committed → Working Tree clean
   - T2 `git subtree add --prefix=sites/praxis-webseite ~/Cortex/projects/praxis-redesign main` → 13 Commits eingemerged
   - T3 THEME_POINTER für Local-WP-Theme (Commit `257304e`)
   - T4 Pfad-Updates: 4 Nexus-Dateien (Auto-Sync) + 8 Cortex-Web-Dateien
   - T5 `.env.sprint1.local` (gitignored) MD5-identisch nach `sites/praxis-webseite/` migriert + chmod 600 + `git check-ignore`-Beweis → `rm -rf praxis-redesign`
   - T6 Post-Subsumption Pre-Flight: verify.sh am neuen Pfad 54/54+10/10 grün, validate.sh + CHECK_SHOPIFY grün, review.sh 11/11 grün
6. **Phase 4 (Selbstprüfung):** Self-Check `specs/phase-4/evidence/2026-04-19_self-check.md` mit AK-Tabelle (12/12 ✅) und 5 Lessons Learned (PH4-LL-1…5).
7. **„Session beenden"-Workflow LL-042:**
   - Schritt 1: Projekt-Audit grün (clean tree, keine Backups, keine TODOs, Pre-Flight bestätigt)
   - Schritt 2: Nexus-Audit grün (devices.json ohne praxis-redesign, MEMORY 7× praxis-webseite, CLAUDE 16× sites/praxis-webseite, SYSTEM_MAP §3.7 umbenannt)
   - Schritt 3: Pattern-Optimierung — neuer Pattern `Nexus/_memory/patterns/cross-repo-subsumption.md`
   - Schritt 4: Tutorial-Update — `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/08-cross-repo-subsumption-mit-git-subtree.md`
   - Schritt 5: Diese Datei finalisiert + CHANGELOG v0.5.0

### Verifiziert (Auszug aus Self-Check)

| AK | Status | Evidenz |
|---|:---:|---|
| AK-1 | ✅ | 123 tracked files in `sites/praxis-webseite/` |
| AK-2 | ✅ | 3 bridge-strategy-Dokumente in `Cortex-Web/specs/bridge-strategy/` |
| AK-3 | ✅ | THEME_POINTER referenziert Commit `257304e` |
| AK-4 | ✅ | 13 praxis-Commits via `git log c519852 --oneline \| wc -l` |
| AK-5 | ✅ | verify.sh am neuen Pfad 54/54+10/10 grün |
| AK-6 | ✅ | validate.sh basic+CHECK_SHOPIFY+review.sh alle Exit 0 |
| AK-7 | ✅ | PXZ_VERSION 2.7.5 lebt unverändert |
| AK-8 | ✅ | 0 aktive `projects/praxis-redesign`-Verweise (34 historische klassifiziert) |
| AK-9 | ✅ | `~/Cortex/projects/praxis-redesign/` existiert nicht mehr |
| AK-10 | ✅ | Working Trees clean vor T2 |
| AK-11 | ✅ | Theme-Repo HEAD `257304e7e9...` unverändert, status clean |
| AK-12 | ✅ | Self-Check vorhanden |

**Score: 12/12 = 100 %**

### Lessons Learned (für Phase 5)

- **PH4-LL-1** (kritisch): gitignored Dateien mit echten Daten beim `rm -rf` müssen explizit migriert werden — `.env.sprint1.local` wäre sonst weg gewesen. Pre-Audit für Phase 5 listet alle gitignored-Daten-Dateien auf.
- **PH4-LL-2:** `git log <pfad>` zeigt Subtree-Historie nicht; AK-Definition für „Historie erreichbar" muss `git log <hash>` oder `git log --all --grep` als Mess-Befehl nehmen.
- **PH4-LL-3:** Re-Run von Pre-Flights aktualisiert Evidenz früherer Phasen → separater Commit pro Phase, sonst unschuldige Mit-Modifikation.
- **PH4-LL-4:** AK „keine alten Pfad-Verweise" braucht Whitelist-Pattern, sonst Handarbeit.
- **PH4-LL-5:** Externer-Repo-Pointer-Pattern (THEME_POINTER) ist generisch wiederverwendbar — für Juvantis als `sites/juvantis-webseite/THEME_REPO_POINTER.md`.

---

## §4 Offene Tasks (Priorität absteigend)

### P0 — Aktive Sub-Site-Arbeit (höchste Prio, wann immer Dr. Stracke will)

**Praxis-Sprint 2 / S2.1 — Seiten-Inventar & Content-Audit**
- Pfad: `sites/praxis-webseite/`
- Einstieg: aus dieser SESSION_RESUME.md den `cd sites/praxis-webseite && cat SESSION_RESUME.md` Befehl ausführen, dann Architekten-Modus 4 Phasen
- Wahl-Optionen aus Praxis-SESSION_RESUME.md §3 stehen unverändert (S2.0b, S2.1, S2.3, Sprint 1 Reanimation, Backlog)

### P1 — Phase 5 vorbereiten (Juvantis-Subsumierung — KEIN Go bisher)

Architekten-Modus Phase 1 (Verständnis-Sicherung) wäre der erste Schritt. Vor dem Start:
- Dr. Stracke explizit Go geben (analog zu Phase 4)
- `Juvantis/juvantis-web/` ist GitHub-Branch `shopify-theme` (Remote!) → Strategie weicht von Phase 4 ab (Remote spielt eine Rolle)
- PH4-LL-1 (gitignored-Daten-Sicherheits-Check) ist Pflicht — speziell `.env`, `.shopify/`, `_secrets/` prüfen
- PH4-LL-5 anwenden: `THEME_REPO_POINTER.md` für Juvantis-Theme

### P2 — Phase-4-Nachzieher (klein, optional)

- Tutorial 08 ggf. um Diagramm/Skizze ergänzen (visuelle Veranschaulichung des Subtree-Mergens)
- AK-8-Whitelist als Pattern formalisieren (PH4-LL-4)

### P3 — Phase 2b Medien (verschoben)

Medien-Pipeline wurde nicht angefasst. Kandidat parallel zu Sprint 2 oder vor Phase 5.
Details: `_config/RULES.md CW-003` + `trunk/schema/media.schema.json` (Platzhalter).

### Parallel laufende Arbeiten (NICHT in Cortex-Web-Sessions berührt)

- `Juvantis/juvantis-web` — läuft unverändert
- `Juvantis/DHT`, `Juvantis/social-media` — bleiben dauerhaft unter `projects/Juvantis/`
- `telegram-bridge` — unabhängig

---

## §5 Phasen-spezifische Pflicht-Lesung (Repeat aus §0)

### Für Praxis-Sprint-Arbeit
Items 10–13 aus §0 oben.

### Für Phase 5 (Juvantis)
Items 14–16 aus §0 oben + **Go von Dr. Stracke einholen vor Spec-Schreiben**.

---

## §6 Sofort-Status-Frage für nächste Session

> **„Cortex-Web Phase 4 (Praxis-Subsumierung) abgeschlossen — 12/12 AKs grün,
> 6 Commits, praxis-redesign per `git subtree add` als `sites/praxis-webseite/`
> integriert, Theme-Repo unverändert, alle Pre-Flights weiter grün.
> Welche Front bearbeiten wir?
>
> A. **Praxis-Sprint 2 / S2.1 — Seiten-Inventar & Content-Audit** (am wahrscheinlichsten
>    nächster Schritt, weil S2.0 ✅ und S2.1 die Vorbedingung für die Kernseiten-Batches ist).
>    Einstieg: `cd sites/praxis-webseite && cat SESSION_RESUME.md` → die dortige Status-Frage
>    listet die Praxis-internen Optionen A–F.
> B. **Phase 5 vorbereiten — Juvantis-Subsumierung.** Architekten-Phase 1
>    (Verständnis-Sicherung) starten. Vorbedingung: explizites Go, weil
>    `Juvantis/juvantis-web` Remote-Branch hat (anders als praxis-redesign).
>    Zusätzlich: PH4-LL-1 (gitignored-Daten-Check) ist Pflicht-Bestandteil.
> C. **Praxis-Sprint 1 reanimieren** (falls DF-Support in der Zwischenzeit
>    SFTP-Credentials geliefert hat). Check: `grep -E '^SFTP_DE_HOST=.' sites/praxis-webseite/.env.sprint1.local`
>    nicht mehr leer?
> D. **Phase 2b Medien-Pipeline** angehen.
> E. **Andere konkrete Änderung** — Sie nennen."**

Keine Code-Änderung vor expliziter Wahl.

---

## §7 Verbote / harte Regeln — dürfen NIE passieren

### Allgemein (aus früheren Sessions, weiter gültig)
- **Keine Datenverschiebung** aus `Juvantis/juvantis-web/` (Phase 5 separat, noch kein Go)
- **Kein Push zu Prod-Shopify in `status="active"`** — Adapter bleibt hartcodiert auf `draft`
- **Kein Touch am `praxiszentrum`-Theme** und am `juvantis-web/theme/`-Repo in Cortex-Web-Sessions
- **CW-001 Trunk-Master bleibt unbestritten** — Admin-Edits werden vom nächsten Adapter-Lauf zurückgesetzt
- **CW-005 Plattform-Trennung** — KEIN Preis, KEIN Kauf-CTA auf Praxis-Site (schema-erzwungen)
- **Keine Shopify-API-Credentials oder WP-Passwörter im Repo**
- **Kein `--force` bei Git** außer bei explizitem Dr.-Stracke-Go
- **Kein Admin-/Root-/Login-Passwort im Chat** — nur App-Passwords, API-Tokens
- **Kein Zurücklesen/Loggen des Shopify-Client-Secrets** oder `SHOPIFY_ADMIN_TOKEN` im Chat
- **Keine Scope-Erweiterung der Custom App ohne Go** — Token würde invalidiert
- **Kein Test-Produkt im Store löschen ohne Dr.-Stracke-Go** — `10940942844171` ist Phase-3-Review-Artefakt
- **Kein Eingriff in Juvantis/juvantis-web Auto-Sync-Hook** (PostToolUse-Hook auf `theme/`)
- **Review-Pipeline-Änderungen NICHT eigenmächtig** — `tools/review/*` ist Phase-3-Artefakt, Erweiterungen brauchen eigene Spec

### Phase-4-spezifisch (neu seit 2026-04-19)
- **Kein `git mv` quer zwischen `sites/praxis-webseite/`-Inhalten und Cortex-Web-Top-Level** ohne Spec — die Subsumierung hat eine bewusste Trennung gezogen, die nicht versehentlich aufgelöst werden darf
- **Kein Touch am `sites/praxis-webseite/THEME_POINTER.md`** außer bei Theme-Commit-Updates (manuelle Pflege, manuelle Verifikation)
- **Keine Pfad-Referenzen mehr auf `projects/praxis-redesign/`** in neuen Dokumenten — nur in historischen Specs/Logs/CHANGELOG erlaubt

### Phase-5-spezifisch (vorbereitend)
- **Kein Subtree-Add für Juvantis ohne explizites Go**
- **Kein Eingriff in den `shopify-theme`-Branch** (Remote!) ohne Spec
- **Pre-Audit für Phase 5 MUSS PH4-LL-1 anwenden** (gitignored-Daten-Check als Pflicht-Bestandteil)

---

## §8 Session-Historie

| Session | Datum | Phase | Ergebnis | Commits |
|---------|-------|:-----:|----------|---------|
| 1 | 2026-04-18 | 0 | Skelett + Regeln + Nexus ✅ | `6178d2f`, `d9577cd` |
| 2 | 2026-04-18 | 1 | POC WP-Adapter End-to-End ✅, Local-WP-Setup, Pattern + Tutorial | `778635c`, `19fd8ce` |
| 3 | 2026-04-18 | 2 (Setup) | Shopify Custom App + Admin-API-Token ✅, OAuth-Catcher, Tutorial 05 | `48c4170` |
| 4 | 2026-04-19 | 2 (Adapter) | POC Shopify-Adapter ✅ End-to-End, 12/12 AKs, Spec + Self-Check, Pattern + Tutorial 06 | `7d6f665`, `f52abc2` |
| 5 | 2026-04-19 | 3 (Review) | Review-Pipeline 12/12 AKs ✅, 6 Dimensionen automatisiert, 2 Bugs in-session gefixt, Pattern + Tutorial 07, Dr. Stracke Go für Phase 4 | `98d1f67`, `314a41c` |
| **6** | **2026-04-19** | **4 (Subsumierung)** | **Praxis-Subsumierung ✅ via `git subtree add` (E1a/E2b/E3a), 12/12 AKs grün, 5 Lessons Learned, Pattern `cross-repo-subsumption.md` + Tutorial 08, `.env.sprint1.local` MD5-sicher migriert** | **`c350b05`, `94e6e91`, `77adfc7`, `dd38922`, `61b5187`, `b7266ab`** |
| *(7)* | *tbd* | *Sprint 2 / S2.1 ODER 5* | — | — |

---

*Stand: 2026-04-19, Ende Session 6. Nächste Session: per „Projekt fortsetzen Cortex-Web" (LL-043) → Status-Frage A–E aus §6 wählen.*
