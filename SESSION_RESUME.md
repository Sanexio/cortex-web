# SESSION_RESUME — Cortex-Web

> **Standard-Einstieg** (LL-043, `Nexus/_rules/SESSION_LIFECYCLE.md`):
> In einer neuen Session **„Projekt fortsetzen Cortex-Web"** tippen. Claude lädt:
>
> 1. Pflicht-Init Nexus (CLAUDE.md, MEMORY.md, GLOBAL_RULES.md, SESSION_LIFECYCLE.md)
> 2. Diese Datei (SESSION_RESUME.md)
> 3. Alle in §0 unten als Pflicht-Lesung markierten Folgedateien
> 4. Pre-Flight (`tools/validate.sh`, optional `CHECK_SHOPIFY=1`)
> 5. **Wegen Phase-4-Go:** zusätzlich `praxis-redesign/SESSION_RESUME.md` als Kontext-Ladung
> 6. Status-Statement im Architekten-Stil → startet direkt mit Phase-4-Verständnis (keine Wahl-Frage mehr)

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
9. `~/Cortex/projects/praxis-redesign/_rules/WORKING_MODE.md` (Architekten-Modus)

### Phase-4-spezifisch (ab jetzt Pflicht, weil Go erteilt)
10. `~/Cortex/projects/praxis-redesign/SESSION_RESUME.md` — aktueller Sprint-Stand, muss VOR `git mv` bekannt sein
11. `~/Cortex/projects/praxis-redesign/_rules/ARCHITECTURE.md` — Sprint T0–T5
12. `~/Cortex/projects/praxis-redesign/_rules/FEHLERPROTOKOLL.md` — PXZ-E-Einträge, damit nichts gebrochen wird
13. `~/Cortex/projects/Cortex-Web/_rules/ARCHITECTURE.md §2+§7` — Ziel-Architektur + Sprint-Anschluss-Regel
14. Optional: `~/Cortex/projects/Cortex-Web/specs/phase-3/evidence/2026-04-19_self-check.md` — Kontext-Evidenz, warum Go erteilt wurde

---

## §1 Stand & Version

- **Version:** `0.4.0` — **Phase 3 abgeschlossen, Phase 4 freigegeben**
- **Stand:** 2026-04-19, Session 5 abgeschlossen — Review-Pipeline 12/12 grün, Dr. Stracke Go für Phase 4
- **Git-Commits (chronologisch):**
  - `6178d2f` · `d9577cd` — Phase 0 Skelett + Nachtrag
  - `778635c` · `19fd8ce` — Phase 1 POC WP-Adapter + Close-Session
  - `48c4170` — Phase 2 Setup (Shopify Custom App + Admin-API-Token)
  - `7d6f665` · `f52abc2` — Phase 2 Adapter (POC Shopify-Adapter, 12/12 AKs) + Close
  - **`98d1f67` — Phase 3 Review-Pipeline (12/12 AKs grün, Common-Trunk-Ansatz auf 2 Plattformen empirisch bewiesen)**
- **Working Tree:** clean nach Session-5-LL-042-Audit (Nexus-Updates gehen separat über `nexus-sync.sh`)
- **Trunk-Content:** unverändert, 1 Produkt (`basic-check.yaml`)
- **WP-Adapter:** Phase 1, idempotent, HWG-konform, Review-geprüft
- **Shopify-Adapter:** Phase 2, idempotent, draft-only, Review-geprüft
- **Review-Pipeline:** `tools/review.sh` — 11 automatische AKs, deterministisch reproduzierbar

### §1.1 Freigabestatus Phase 4

- **Go erteilt am:** 2026-04-19, Session 5 (Dr. Stracke: „alpha")
- **Scope:** `git mv projects/praxis-redesign/` → `projects/Cortex-Web/sites/praxis-webseite/` + Pfad-Audit + Nexus-Updates
- **Nicht freigegeben:** Phase 5 (Juvantis-Subsumierung) — separate Freigabe nötig
- **Verbindlich:** Phase 4 braucht eine **eigene vollständige Session** (Architekten-Modus 4 Phasen)

---

## §2 Pre-Flight-Befehl

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

### Vollreview (lange, optional vor Phase 4 als Baseline)
```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/review.sh
```
Erwartet: `AK automatisch: 11/11 grün`, Exit 0. Läuft ca. 30–60s inkl. Puppeteer + Roundtrip.

**Stand Ende Session 5:** alle drei grün, Evidenz in `specs/phase-3/evidence/`.

---

## §3 Letzte Session — Session 5, 2026-04-19

### Ziel der Session
Phase-3-Review-Pipeline bauen, Common-Trunk-Ansatz empirisch validieren, Go/No-Go für Phase 4 vorbereiten.

### Durchgeführt
1. Pflicht-Init geladen, Pre-Flight `validate.sh` grün (basic + CHECK_SHOPIFY).
2. Dr.-Stracke-Wahl: (α) Phase 3 Review (über (β), (γ), (δ) hinweg).
3. **Phase-1-Verständnis + Phase-2-Lösungsdesign** in `specs/phase-3/REVIEW.md` geschrieben (6 Dimensionen, 12 AKs, 7 Entscheidungen, Risiken-Matrix). Dr. Stracke klärt 3 offene Punkte: verbotene-Token-Liste ohne `99`, Roundtrip-Mutation akzeptabel, Side-by-Side als beides (HTML+PNG).
4. **Phase-3-Umsetzung:** 8 neue Dateien (`tools/review.sh` + 7 Module unter `tools/review/`), keine Adapter-Änderung, kein Trunk-Touch.
5. **Erster Review-Lauf:** 7/11 grün, 4 rote AKs (AK-6/AK-7 Idempotenz, AK-9 WP-Screenshot, AK-11 Side-by-Side kaskadiert).
6. **2 Bugs gefixt (beide im Review-Tool, nicht im Produkt):**
   - **PH3-FIX-1 (FK-2):** Idempotenz-JSON-Parser scheiterte weil Sync-Scripts trailing `sync-*: OK` ausgeben. Fix: line-basierter Parser.
   - **PH3-FIX-2 (FK-5):** Puppeteer bricht an Local-WP-HTTPS-Selbstzert. Fix: `acceptInsecureCerts: true` + `--ignore-certificate-errors`.
7. **Zweiter Review-Lauf:** 11/11 automatisch grün.
8. **Phase-4-Selbstprüfung:** Self-Check `specs/phase-3/evidence/2026-04-19_self-check.md` = 12/12 mit FK-Dokumentation.
9. Commit `98d1f67`: 22 files, +1836/-0.
10. Dr.-Stracke-Go: (α) Phase 4 Subsumierung.
11. **LL-042 5-Schritte-Workflow:**
    - Schritt 1: Projekt-Audit grün (Pre-Flight, keine Backups, keine TODOs)
    - Schritt 2: Nexus-Audit → Updates für `Nexus/CLAUDE.md`, `MEMORY.md`, `ARCHITECTURE.md`, `CHANGELOG.md`
    - Schritt 3: Pattern-Optimierung — neuer Pattern `cross-platform-review-pipeline.md`
    - Schritt 4: Tutorial-Update — `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/07-review-pipeline-und-local-wp-tests.md`
    - Schritt 5: Diese Datei aktualisiert

### Verifiziert (Auszug aus Self-Check)
| AK | Status | Evidenz |
|---|:---:|---|
| AK-1 | ✅ | validate.sh + CHECK_SHOPIFY both exit 0 |
| AK-2 | ✅ | WP-Page 9668: alle 6 Checks grün (headline/tagline/beschreibung/cta_label/cta_url/15 Params) |
| AK-3 | ✅ | Shopify-Product 10940942844171: alle 6 Checks grün (title/tagline/beschreibung/15 Params/price/sku) |
| AK-4 | ✅ | alle 6 verbotenen Tokens `found: false`, erlaubter CTA + URL präsent |
| AK-5 | ✅ | Variant/Preis=99.00/SKU/product_type/Tags/Vendor/Draft-Status OK |
| AK-6 | ✅ | WP 2× → id 9668 konstant, action=update |
| AK-7 | ✅ | Shopify 2× → id 10940942844171 konstant, action=update |
| AK-8 | ✅ | draft → (admin-flip) active → (adapter-run) draft (CW-001 empirisch) |
| AK-9 | ✅ | wp-page-9668.png 91 618 Bytes |
| AK-10 | ✅ | shopify-body-preview.png 45 439 Bytes |
| AK-11 | ✅ | side-by-side.html 2 328 Bytes + side-by-side.png 131 126 Bytes |
| AK-12 | ✅ | Self-Check-Datei existiert, Score 12/12 |

**Score: 12/12 = 100 %**

---

## §4 Offene Tasks — Session 6 startet direkt mit Phase 4

### P0 — Phase 4 Subsumierung (freigegeben, volle Session nötig)

Der Weg:

1. **Architekten-Modus Phase 1 (Verständnis):** Spec schreiben, was genau subsumiert wird. Open questions:
   - Gehen ALLE Ordner aus `praxis-redesign/` mit? Auch `exports/`, `screenshots/`, `specs/`?
   - Oder nur Kern (`_rules/`, `_config/`, `tools/`, `theme/`, `SESSION_RESUME.md`, `DESIGN_GUIDELINES.md`, etc.)?
   - Was mit dem separaten Theme-Repo unter `/Local Sites/.../praxiszentrum/`? Bleibt das, weil Local-WP es braucht — oder wird es ebenfalls umgezogen?
   - Wie weit werden Pfad-Referenzen in `Nexus/_memory/MEMORY.md` mit-gepflegt?
2. **Architekten-Modus Phase 2 (Lösungsdesign):** `specs/phase-4/SUBSUMPTION.md` — Pre-Audit + `git mv`-Kommandos + Post-Audit-Matrix.
3. **Umsetzung:** `git mv` Operationen, keine Content-Änderungen. Alle Pfad-Referenzen ziehen in einem einzigen Commit mit.
4. **Selbstprüfung:** `verify.sh` von praxis-redesign muss am neuen Pfad weiterhin grün laufen. Local-WP-Theme weiterhin funktional. Git-Historie erhalten (`git log --follow`).

### P1 — Phase 4 Precheck vor Session 6 (nicht zwingend)

Falls Du möchtest, kannst Du in einer **kurzen praxis-redesign-Session** vorher:
- Die aktuelle Sprint-2-Arbeit abschließen oder sauber pausieren
- Ein `SESSION_RESUME.md`-Update schreiben, damit Session 6 den Zustand klar hat

Ist aber nicht Pflicht — Session 6 kann mit dem aktuellen praxis-redesign-Stand starten.

### P2 — Phase 2b Medien (verschoben)

Medien-Pipeline wurde in Session 5 nicht angefasst. Kandidat **nach** Phase 4 oder als Zwischenschritt vor Phase 5 (Juvantis-Subsumierung), sobald echte Bilder ins Spiel kommen. Details in `_config/RULES.md CW-003` + `trunk/schema/media.schema.json` (Platzhalter).

### Parallel laufende Arbeiten (NICHT in Cortex-Web-Sessions berührt)

- `praxis-redesign` Sprint 2 (S2.1 Seiten-Inventar) — läuft weiter, aber nach Phase-4-`git mv` als `sites/praxis-webseite/`
- `Juvantis/juvantis-web` — läuft unverändert
- `Juvantis/DHT`, `Juvantis/social-media` — unabhängig, bleiben dauerhaft unter `projects/Juvantis/`

---

## §5 Phasen-spezifische Pflicht-Lesung

### Für Phase 4 (Praxis-Subsumierung) — ab Session 6 aktiv
- `projects/praxis-redesign/SESSION_RESUME.md` — aktueller Sprint-Stand
- `projects/praxis-redesign/_rules/ARCHITECTURE.md` — Sprint-Plan
- `Cortex-Web/_rules/ARCHITECTURE.md §2 + §7` — Ziel-Architektur + Sprint-Anschluss
- **WICHTIG:** Go ist erteilt (siehe §1.1), aber Phase 4 startet mit Spec-Schreiben, nicht mit `git mv`

### Für Phase 2b (Medien-Pipeline, verschoben)
- `Cortex-Web/_config/RULES.md CW-003` (Lokale Originale)
- `Cortex-Web/trunk/schema/media.schema.json` (Platzhalter)
- `Nexus/_memory/patterns/shopify-rest-product-sync.md §11` (Out-of-Scope-Hinweise)

### Für Phase 5 (Juvantis-Web-Subsumierung)
- `projects/Juvantis/juvantis-web/` (Theme-Git-Status)
- **WICHTIG:** noch KEIN Go erteilt — separate Freigabe nötig

---

## §6 Sofort-Status-Frage für nächste Session

> **„Cortex-Web Phase 3 (Review-Pipeline) abgeschlossen — 12/12 AKs grün,
> Commit `98d1f67`. Dr. Stracke hat Go für Phase 4 erteilt: Subsumierung
> `praxis-redesign/` → `Cortex-Web/sites/praxis-webseite/` per `git mv`.
> Phase 4 ist invasiv — ich starte mit Architekten-Modus Phase 1 (Verständnis):
> Scope-Fragen klären und `specs/phase-4/SUBSUMPTION.md` vorbereiten.
> Keine `git mv`-Operation, bis die Spec freigegeben ist.
>
> Die wichtigsten Scope-Fragen, bevor ich die Spec schreibe:
>
> 1. Wandern ALLE Ordner aus `praxis-redesign/` mit (inkl. `exports/`,
>    `screenshots/`, `specs/`) oder nur der Kern?
> 2. Was passiert mit dem separaten WP-Theme-Repo unter
>    `/Local Sites/.../themes/praxiszentrum/` — bleibt oder zieht es mit?
> 3. Sollen die Strategie-Dokumente (`praxis-redesign/specs/bridge-strategy/00..02`)
>    in `Cortex-Web/specs/bridge-strategy/` verschoben werden (passen dort
>    architektonisch besser)?
>
> Antworte, dann schreibe ich die Spec."**

---

## §7 Verbote / harte Regeln — dürfen NIE passieren

- **`git mv` erst nach freigegebener Spec** — kein Ordner-Umzug, bis `specs/phase-4/SUBSUMPTION.md` steht und Dr. Stracke freigegeben hat
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
- **Kein Eingriff in Juvantis/juvantis-web Auto-Sync-Hook** (PostToolUse-Hook auf `theme/`) — Cortex-Web berührt dieses Verzeichnis nicht
- **Review-Pipeline-Änderungen NICHT eigenmächtig** — `tools/review/*` ist Phase-3-Artefakt, Erweiterungen brauchen eigene Spec

---

## §8 Session-Historie

| Session | Datum | Phase | Ergebnis | Commit(s) |
|---------|-------|:-----:|----------|-----------|
| 1 | 2026-04-18 | 0 | Skelett + Regeln + Nexus ✅ | `6178d2f`, `d9577cd` |
| 2 | 2026-04-18 | 1 | POC WP-Adapter End-to-End ✅, Local-WP-Setup, Pattern + Tutorial | `778635c`, `19fd8ce` |
| 3 | 2026-04-18 | 2 (Setup) | Shopify Custom App + Admin-API-Token ✅, OAuth-Catcher, Tutorial 05, MEMORY-Korrektur | `48c4170` |
| 4 | 2026-04-19 | 2 (Adapter) | POC Shopify-Adapter ✅ End-to-End, 12/12 AKs, Spec + Self-Check, Pattern + Tutorial 06, FK-2-Bug (handle) gefunden+gefixt | `7d6f665`, `f52abc2` |
| **5** | **2026-04-19** | **3 (Review)** | **Review-Pipeline 12/12 AKs ✅, 6 Dimensionen automatisiert, 2 Bugs in-session gefixt (FK-2 + FK-5), neuer Pattern + Tutorial 07, Dr. Stracke Go für Phase 4** | **`98d1f67`** |
| *(6)* | *tbd* | *4 (Subsumierung)* | *praxis-redesign → sites/praxis-webseite per `git mv`* | — |

---

*Stand: 2026-04-19, Ende Session 5. Nächste Session: per „Projekt fortsetzen Cortex-Web" (LL-043) → Phase 4 startet mit Verständnis-Sicherung (3 Scope-Fragen aus §6).*
