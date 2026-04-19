# Phase 5 — Subsumierung Juvantis-Webseite → Cortex-Web/sites/juvantis-webseite/

> Architekten-Modus, Phase 1 (Verständnis) + Phase 2 (Lösungsdesign) + Phase 3 (Umsetzung).
> Stand: 2026-04-19, Session 7.
> Status: **Entscheidung gefällt** — E1a + E2a + E3a + E4a (Dr. Stracke 2026-04-19, „Ich folge deiner Entscheidung").
> Bezug: SESSION_RESUME §6 Option B, Phase-4-Lessons PH4-LL-1…5, Pattern `cross-repo-subsumption.md`.

---

## §1 Verständnis (Phase 1)

### §1.1 Anforderung in eigenen Worten

Die Juvantis-Webseite (Shopify-Store `medzpoint` / Custom Domain `sanexio.eu`)
wird unter dem Dach-Projekt Cortex-Web sichtbar gemacht. Der Shopify-Theme-Klon
(`Juvantis/juvantis-web/theme/`, eigener Git-Remote auf `github.com:Sanexio/JUVANTIS`,
Branch `shopify-theme`, 217 Commits, bidirektionale Shopify-GitHub-Integration)
bleibt **physisch unberührt** am aktuellen Pfad; seine operative Rolle im
Juvantis-Workstream wird nicht angetastet.

Was nach Cortex-Web wandert: die konzeptionelle Schicht rund um den Theme-Klon
(Deploy-Skript, Theme-Backup-ZIPs, Knowledge-Graph-Dokumentation) + ein
`SHOPIFY_THEME_POINTER.md` analog zum Phase-4-Pattern.

### §1.2 Zielzustand (was am Ende wahr ist)

1. `~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/` existiert und enthält:
   - `shopify-sync.sh` (Theme-Deploy-Skript, `THEME_DIR` auf absoluten Pfad zum
     Juvantis-Theme-Klon gepatched, weil Theme nicht mitwandert)
   - `shopify_export/` (Theme-Backup-ZIPs)
   - `knowledge-graph/` (medical-knowledge-graph.json + index.html)
   - `SHOPIFY_THEME_POINTER.md` (Externe-Repo-Pointer nach PH4-LL-5)
   - `SESSION_RESUME.md` (LL-043-Einstieg, Pflichtformat §3 SESSION_LIFECYCLE)
   - `README.md` (Kurzbeschreibung)
2. `~/Cortex/projects/Juvantis/juvantis-web/` enthält **nur noch** `theme/`
   (als Git-Repo mit GitHub-Remote, HEAD `1fbc35b`, clean, unverändert).
3. `theme/.git/HEAD` weiterhin auf `1fbc35b` (Branch `shopify-theme`),
   `git status --short` leer.
4. Cortex-Web-Pre-Flight `tools/validate.sh` (+ `CHECK_SHOPIFY=1`) grün.
5. Nexus-Pfad-Referenzen zeigen auf neue Pfade (MEMORY.md, CLAUDE.md,
   SYSTEM_MAP.md, devices.json).
6. Juvantis-Projekt-Doku (`Juvantis/CLAUDE.md`, `Juvantis/_config/RULES.md`)
   weist den neuen Pfad aus, Theme-Klon-Rolle unverändert beschrieben.
7. `specs/phase-5/evidence/2026-04-19_self-check.md` mit AK-Tabelle.
8. `CHANGELOG.md` v0.6.0-Eintrag.

### §1.3 Constraints (was nicht passieren darf)

- **Kein Touch** am Theme-Repo `Juvantis/juvantis-web/theme/` (keine Commits,
  kein `git mv`, kein Remote-Eingriff). HEAD `1fbc35b` muss identisch bleiben.
- **Kein Push** zur Shopify-GitHub-Integration. Die bidirektionale Sync läuft
  weiter, ohne dass diese Session sie berührt.
- Kein Verlust der drei konzeptionellen Artefakte (shopify-sync.sh,
  shopify_export, knowledge-graph).
- Die laufende Juvantis-Webseite auf `sanexio.eu` darf durch diese Session
  nicht beeinflusst werden (keine Änderung an Live-Content).
- `shopify-sync.sh` muss nach dem Transfer funktional bleiben — d. h. der
  Theme-Pfad im Skript wird auf den absoluten Juvantis-Theme-Pfad umgestellt,
  nicht auf eine relative Position, die es am neuen Ort nicht gibt.
- PH4-LL-1 (gitignored-Daten-Check): vor Transfer explizit prüfen.
- Keine `--force`-Git-Operationen.

### §1.4 Implizite Annahmen (benannt)

A1. `juvantis-web/` ist **kein** Git-Repo (verifiziert: `git rev-parse --git-dir` → fatal).
A2. `theme/` hat **keine** `.gitignore` (verifiziert) und keine gitignored
    Datei-Leichen mit echten Daten (verifiziert: `git status --ignored` leer).
A3. `juvantis-web/` enthält auf Parent-Ebene **keine** `.env*` (verifiziert).
A4. Der Auto-Sync-Hook in `Juvantis/.claude/settings.local.json` ist Praxis-Mac-
    historisch (enthält GDrive-Pfade aus Claude-OS). Auf Cluster-Mini-02 ist er
    nicht aktiv und muss nicht angepasst werden.
A5. Cortex-Web-HEAD `7515822` (Session-6-Post-Verify-Shots) ist stabil. Phase 5
    baut darauf auf.
A6. Juvantis-Live-Site auf `sanexio.eu` bleibt unberührt — keine Deploy-Aktion
    in dieser Session.

---

## §2 Pre-Audit (IST-Befund, gemessen 2026-04-19)

### §2.1 Repo-Topologie

| Objekt | Pfad | Git | Commits | Remote | Größe |
|--------|------|:---:|:-------:|:---:|------:|
| **A — Juvantis/juvantis-web** | `~/Cortex/projects/Juvantis/juvantis-web/` | ❌ | — | — | 32 MB |
| **A.1 — Theme-Klon** | `.../juvantis-web/theme/` | ✅ | 217 | `github.com:Sanexio/JUVANTIS` (Branch `shopify-theme`) | 31 MB (davon 20 MB `.git`) |
| **B — Cortex-Web** | `~/Cortex/projects/Cortex-Web/` | ✅ | 10+ | — | ~30 MB |

**Konsequenz:** `juvantis-web/` hat keine eigene Historie → kein `git subtree add`
vom Parent nötig, einfacher Dateitransfer reicht. Das Theme-Repo mit 217 Commits
und Remote wäre ein **ungeeigneter** Subtree-Kandidat — Log würde von
„Update from Shopify for theme…"-Auto-Commits dominiert.

### §2.2 Inhalt `juvantis-web/`

| Artefakt | Größe | Typ | Gehört zu |
|----------|------:|------|-----------|
| `theme/` | 31 MB | Git-Repo, Remote GitHub, Branch `shopify-theme` | Site (operativ) |
| `shopify-sync.sh` | 1.8 KB | Bash, relativer Theme-Pfad | Site (Deploy-Tooling) |
| `shopify_export/` | 752 KB | Theme-Backup-ZIPs | Site (Historie/Snapshot) |
| `knowledge-graph/` | 944 KB | JSON + index.html (med. Wissensgraph für Avatar-Content) | Site (Content-Referenz) |

### §2.3 Working Tree

- `theme/`: **clean** (`git status --short` leer).
- `juvantis-web/` Parent: keine Git-Tracking-Kategorie (kein Git).
- Cortex-Web: **clean** vor Phase-5-Start (HEAD `7515822`).

### §2.4 Gitignored-Daten-Check (PH4-LL-1)

```bash
cd Juvantis/juvantis-web && find . -maxdepth 2 -name ".env*"
# → leer

cd theme && git status --ignored --short
# → leer
```

**Kein gitignored Daten-Risiko.** Im Gegensatz zu Phase 4 keine `.env.<x>.local`-
Migration nötig.

### §2.5 Externe Pfad-Verweise (13 MD-Dateien referenzieren `Juvantis/juvantis-web`)

Klassifikation (PH4-LL-4):

**Aktiv (werden umgeschrieben):**
- `~/Cortex/Nexus/CLAUDE.md` (Juvantis-Sektion + Pfadreferenz-Tabelle)
- `~/Cortex/Nexus/_memory/MEMORY.md` (Aktive-Projekte + Pfad-Referenz-Tabelle)
- `~/Cortex/projects/Cortex-Web/CLAUDE.md` (Verbundene-Projekte-Tabelle)
- `~/Cortex/projects/Cortex-Web/SESSION_RESUME.md` (§7 Verbote, §4 Tasks)
- `~/Cortex/projects/Cortex-Web/_rules/ARCHITECTURE.md` (Ziel-Struktur, Phasen-Roadmap)
- `~/Cortex/projects/Cortex-Web/PROJECT.md`
- `~/Cortex/projects/Juvantis/PROJECT.md`
- `~/Cortex/projects/Juvantis/_config/SHOPIFY_BUILD_PROMPT.md` (Entscheidung nach Inspektion)
- `~/Cortex/projects/Juvantis/CLAUDE.md` (Webseite-Sektion)
- `~/Cortex/projects/Juvantis/_config/RULES.md` (R-010 Asset-Pfad)

**Historisch (bleiben unverändert, Whitelist):**
- `~/Cortex/projects/Cortex-Web/specs/phase-2/**` (POC-Spezifikation & Self-Check)
- `~/Cortex/projects/Cortex-Web/specs/bridge-strategy/02_ENTSCHEIDUNGEN_FINAL.md`
- `~/Cortex/Nexus/Second Brain/10 Projekte/Juvantis*.md` (Obsidian-Notes,
  historische Projekt-Beschreibung)
- `~/Cortex/projects/Juvantis/DHT/AVATAR_SOURCES.md` (Lizenz-Dokumentation)
- `~/Cortex/projects/Cortex-Web/CHANGELOG.md` (Versions-Historie)

---

## §3 Lösungsdesign (Phase 2) — Gewählte Optionen

**Entscheidung Dr. Stracke 2026-04-19:** „Ich folge deiner Entscheidung" → **E1a + E2a + E3a + E4a.**

### §3.1 E1a — Was wandert nach `sites/juvantis-webseite/`

Alles **außer** `theme/`:
- `shopify-sync.sh` (mit Pfad-Patch)
- `shopify_export/`
- `knowledge-graph/`
+ neu erzeugte Dateien:
- `SHOPIFY_THEME_POINTER.md`
- `SESSION_RESUME.md`
- `README.md`

### §3.2 E2a — Theme-Klon bleibt am aktuellen Pfad

`Juvantis/juvantis-web/theme/` bleibt physisch und operativ unverändert.
Shopify-GitHub-Integration, `shopify-theme`-Branch und lokaler Klon laufen
weiter wie bisher. Keine Hook- oder Remote-Änderung.

### §3.3 E3a — Kein `git subtree`, einfacher `mv` + Commit

Da der Source (`juvantis-web/`) keine Git-Historie hat, gibt es keine zu
erhaltende Commit-Kette. Wir verwenden:
```bash
mv Juvantis/juvantis-web/shopify-sync.sh Cortex-Web/sites/juvantis-webseite/
mv Juvantis/juvantis-web/shopify_export Cortex-Web/sites/juvantis-webseite/
mv Juvantis/juvantis-web/knowledge-graph Cortex-Web/sites/juvantis-webseite/
cd Cortex-Web && git add sites/juvantis-webseite && git commit
```

### §3.4 E4a — Container `juvantis-web/` bleibt bestehen (nur mit theme/)

`Juvantis/juvantis-web/` wird nach Transfer nur noch `theme/` enthalten.
Juvantis-Projekt-Doku wird so aktualisiert, dass der Container als reiner
Theme-Halter beschrieben wird; die anderen Artefakte sind in die Cortex-Web-
Site gewandert.

### §3.5 shopify-sync.sh Pfad-Patch (deterministisch)

Vor Transfer (Zeile 12):
```bash
THEME_DIR="$(cd "$(dirname "$0")/theme" && pwd)"
```

Nach Transfer:
```bash
THEME_DIR="$HOME/Cortex/projects/Juvantis/juvantis-web/theme"
```

Begründung: Skript liegt ab jetzt in `sites/juvantis-webseite/`, Theme aber
weiterhin bei `Juvantis/juvantis-web/theme/`. Absoluter Pfad über `$HOME`
statt hardcodiertem `/Users/cluster-mini-02` bleibt gerätekompatibel
(Nexus-Prinzip: portabel, siehe `devices.json`).

### §3.6 Reihenfolge Phase 3 (Umsetzung)

```
T0   Pre-Flight grün (bereits bestätigt: Cortex-Web validate.sh grün)
T1   Diese Spec schreiben + committen (docs(phase-5): SUBSUMPTION spec)
T2   mv der drei Artefakte + shopify-sync.sh THEME_DIR patchen + commit
T3   SHOPIFY_THEME_POINTER.md schreiben + commit
T4   sites/juvantis-webseite/SESSION_RESUME.md + README.md + commit
T5   Pfad-Referenz-Updates in Nexus + Cortex-Web + commit
T6   Juvantis-Projekt-Doku anpassen (Juvantis/CLAUDE.md, _config/RULES.md) + commit
T7   Post-Subsumption Pre-Flight: validate.sh grün, Theme-HEAD unverändert
T8   Self-Check specs/phase-5/evidence/2026-04-19_self-check.md mit AK-Tabelle + commit
T9   Session-Ende LL-042 5 Schritte + CHANGELOG v0.6.0
```

---

## §4 Akzeptanzkriterien (Phase 4 Selbstprüfung)

| AK | Kriterium | Mess-Methode |
|---:|-----------|--------------|
| AK-1 | `sites/juvantis-webseite/` enthält shopify-sync.sh + shopify_export/ + knowledge-graph/ + SHOPIFY_THEME_POINTER.md + SESSION_RESUME.md + README.md | `ls sites/juvantis-webseite/` zeigt alle 6 Einträge |
| AK-2 | `shopify-sync.sh` THEME_DIR = absoluter Pfad auf Juvantis-Theme-Klon | `grep '^THEME_DIR=' sites/juvantis-webseite/shopify-sync.sh` |
| AK-3 | `SHOPIFY_THEME_POINTER.md` referenziert HEAD `1fbc35b` + Remote + Branch `shopify-theme` + Store `medzpoint` + Theme-ID | `grep "1fbc35b" + grep "shopify-theme" + grep "medzpoint"` in Datei |
| AK-4 | `Juvantis/juvantis-web/` enthält nur `theme/` (keine Subsumierungs-Reste) | `ls Juvantis/juvantis-web/` = `theme` |
| AK-5 | Theme-Repo unverändert: HEAD `1fbc35b`, status clean | `cd theme && git rev-parse HEAD == 1fbc35b && git status --short` leer |
| AK-6 | Cortex-Web-Pre-Flight grün: `validate.sh` + `CHECK_SHOPIFY=1 validate.sh` | beide Exit 0 |
| AK-7 | Nexus-Pfad-Referenzen zeigen auf `sites/juvantis-webseite/` | `grep -rn "Juvantis/juvantis-web" Nexus/` liefert nur Whitelist-Treffer |
| AK-8 | Juvantis-Projekt-Doku (`Juvantis/CLAUDE.md`, `_config/RULES.md`) weist die Subsumierung aus | Text-Check auf Hinweis-Absatz |
| AK-9 | Cortex-Web `SESSION_RESUME.md` + `_rules/ARCHITECTURE.md` zeigen Phase 5 als ✅ | Text-Check |
| AK-10 | `CHANGELOG.md` enthält v0.6.0-Eintrag | `grep "^## 0.6.0" CHANGELOG.md` |
| AK-11 | Self-Check-Datei existiert mit Score 11/11 | `specs/phase-5/evidence/2026-04-19_self-check.md` vorhanden |
| AK-12 | `git status --short` am Ende clean in Cortex-Web | `git status --porcelain` leer |

---

## §5 Risiken & Rollback

| Risiko | Wahrscheinlichkeit | Schwere | Mitigation |
|--------|:------:|:------:|------------|
| `shopify-sync.sh` findet `theme/` nicht nach Pfad-Patch | niedrig | mittel | AK-2 prüft Wert, manueller Smoke-Test nach Transfer optional (`bash -n shopify-sync.sh`) |
| Versehentlicher Touch am Theme-Repo | niedrig | **hoch** | AK-5 erzwingt HEAD-Gleichheit; keine T-Operation schreibt in `theme/` |
| Shopify-Auto-Sync-Commit während Session | mittel | niedrig | Theme-HEAD-Check nach T7 gibt ggf. neuen Hash → Pointer bekommt Update, aber Auto-Sync bleibt unabhängig von Cortex-Web-Git |
| Pfad-Referenz übersehen | mittel | niedrig | AK-7 grep, Whitelist nach PH4-LL-4 |
| Live-Site `sanexio.eu` wird berührt | niedrig | **hoch** | Kein Task berührt `theme/` → kein Push → kein Impact |

### Rollback-Plan

- **Nach T2 (mv)**, falls Problem: Artefakte zurückschieben + `git reset --hard HEAD~1` in Cortex-Web.
- **Nach T5 (Pfad-Refs)**, falls Problem: Einzelne `git revert <commit>` oder manuelle Korrektur.
- **Theme-Repo** wird in keiner Phase angefasst → kein Rollback dort nötig.

---

## §6 Was diese Spec NICHT macht (Out-of-Scope)

- Kein Eingriff in den Shopify-Store, kein Theme-Push, kein Admin-Edit.
- Keine Änderung am Shopify-Theme-Klon (kein commit, kein merge, kein checkout).
- Keine Änderung an `DHT/`, `social-media/`, `_docs/` innerhalb Juvantis.
- Kein Refactoring von `shopify-sync.sh` über den Pfad-Patch hinaus.
- Keine Verschmelzung mit Phase 3 Review-Pipeline (Juvantis-Adapter-Build ist
  ein eigenes Thema — Shopify-Adapter funktioniert schon seit Phase 2 gegen
  dem Store, unabhängig vom Theme-Klon).
- Kein Subsumieren von `DHT/` oder `social-media/` — die bleiben unter `Juvantis/`.

---

## §7 Lessons Learned aus Phase 4, die hier angewandt werden

| Lesson | Anwendung in Phase 5 |
|--------|---------------------|
| **PH4-LL-1** (gitignored-Daten) | §2.4 Pre-Audit verifiziert: keine `.env*` im Container, kein `git status --ignored`-Befund in `theme/` |
| **PH4-LL-2** (`git log <pfad>` vs. Subtree) | nicht relevant — kein Subtree-Merge diesmal (E3a) |
| **PH4-LL-3** (Re-Run von Pre-Flights aktualisiert frühere Evidenz) | T7 läuft nur `validate.sh` (nicht `review.sh`, der Phase-3-Evidence anfasst) → kein unschuldiger Mit-Commit |
| **PH4-LL-4** (grep-Whitelist) | §2.5 trennt aktiv/historisch explizit |
| **PH4-LL-5** (Externer-Repo-Pointer) | SHOPIFY_THEME_POINTER.md analog zu THEME_POINTER.md, aber mit Remote-spezifischen Feldern (GitHub-URL, Branch, Store-ID, Theme-ID, Auto-Sync-Charakter) |

---

*Stand: 2026-04-19, Session 7. DRAFT → Umsetzung in Phase 3 (T2–T9).*
