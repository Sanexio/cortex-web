# Phase 4 — Subsumierung praxis-redesign → Cortex-Web/sites/praxis-webseite/

> Architekten-Modus, Phase 1 (Verständnis) + Phase 2 (Lösungsdesign).
> Stand: 2026-04-19, Session 6.
> Status: **DRAFT — wartet auf Freigabe Dr. Stracke** (drei Entscheidungspunkte E1/E2/E3).
> Verbot: keine Datei-/Repo-Operation vor Freigabe (Cortex-Web SESSION_RESUME §7).

---

## §1 Verständnis (Phase 1)

### §1.1 Anforderung in eigenen Worten

`projects/praxis-redesign/` (eigenes lokales Git-Repo, 11 Commits, Docs- und
Tools-Repo der WordPress-Site `westend-hausarzt.com`) wird unter
`projects/Cortex-Web/sites/praxis-webseite/` subsumiert. Das WordPress-Theme-Repo
unter Local-by-Flywheel bleibt physisch dort, wird aber durch einen Pointer in
Cortex-Web sichtbar gemacht. Die drei Strategie-Dokumente
`praxis-redesign/specs/bridge-strategy/00..02` werden hochpromoted nach
`Cortex-Web/specs/bridge-strategy/`, weil sie Dach-Architektur betreffen.

Vorgaben aus Session 6 (Dr. Stracke):
- **1a** — vollständiger Umzug aller Ordner, kein Cherry-Pick
- **2a** — WP-Theme-Repo bleibt im Local-WP-Pfad
- **3b** — bridge-strategy nach `Cortex-Web/specs/bridge-strategy/` (nicht in die Site)

### §1.2 Zielzustand (was am Ende wahr ist)

1. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/` enthält den vollständigen Inhalt von praxis-redesign (außer bridge-strategy, siehe 3.).
2. `~/Cortex/projects/Cortex-Web/specs/bridge-strategy/` enthält die drei Strategie-Dokumente (3b).
3. `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/THEME_POINTER.md` dokumentiert den absoluten Pfad zum Theme-Repo + aktuellen Theme-Commit-Hash (2a).
4. `~/Cortex/projects/praxis-redesign/` existiert nicht mehr (oder als markiertes Archiv, je nach E1).
5. Pre-Flight `tools/verify.sh` läuft am neuen Pfad weiterhin grün (Split/Reset/Probe/Alignment auf Home + Karriere).
6. Local-WP-Theme funktioniert unverändert; PXZ_VERSION 2.7.5 weiterhin live.
7. Pfad-Referenzen in Nexus (`MEMORY.md`, `CLAUDE.md`, `SYSTEM_MAP.md`, `devices.json`) zeigen auf neue Pfade.
8. Git-Historie: je nach Strategie E1 entweder im Cortex-Web-Log sichtbar (E1a/E1b) oder im archivierten praxis-redesign-Repo nachschlagbar (E1c).

### §1.3 Constraints (was nicht passieren darf)

- Kein Verlust der praxis-redesign-Git-Historie (11 Commits, Versionsketten v2.6.0…v2.7.5).
- Keine Beschädigung des Local-WP-Theme-Repos (`praxiszentrum/`).
- Keine Beschädigung der Cortex-Web-Adapter (Phase 1/2/3 Funktionalität).
- Keine `screenshots/` weglassen (sind Audit-Trail für PXZ-E-001…008).
- Kein Verlust der ungespeicherten Änderung in `praxis-redesign/_rules/ARCHITECTURE.md` (Sektion 4b „Cortex-Web — Dach-Projekt") — gehört zur Doku.
- Kein Verlust der drei untracked `specs/bridge-strategy/*.md` — sind Phase-Strategie-Dokumente.
- Keine `--force`-Operationen ohne Dr.-Stracke-Go.
- Pre-Flight-Pipeline darf in keiner Phase rot werden, ohne dass es bemerkt wird.

### §1.4 Implizite Annahmen (gemacht und explizit benannt)

A1. Beide Repos (praxis-redesign + Cortex-Web) sind lokal, kein Remote-Push betroffen.
A2. `node_modules/` und `_archive/`-Inhalte bleiben gitignored und müssen nicht migriert werden — werden nach Bedarf neu installiert/erzeugt.
A3. `legacy-juvantis-praxis-web/` (1.1 MB, von Git getrackt, in praxis-redesign-Doku nicht erwähnt) ist ein Legacy-Subprojekt aus Juvantis-Zeiten und wandert mit (1a). README im Ordner deutet auf altes WordPress-Subprojekt hin.
A4. Theme-Repo unter Local-WP wird in Phase 4 NICHT angefasst — nur dokumentiert.
A5. Cortex-Web-Top-Commit `314a41c` ist stabil; Phase-4-Arbeit baut darauf auf.
A6. Praxis-Sprint 2 ist nach Subsumierung weiterhin aktiv; SESSION_RESUME wird in Phase 5 (Schritt 5) auf neuen Pfad umgeschrieben.

---

## §2 Pre-Audit (IST-Befund, gemessen)

### §2.1 Repo-Topologie

| Repo | Pfad | Git | Commits | Größe | Tracked-Dateien |
|------|------|:---:|:-------:|------:|:--------------:|
| **A — praxis-redesign Docs** | `~/Cortex/projects/praxis-redesign/` | ✅ eigenes `.git` | 11 | 264 MB | 118 |
| **B — Cortex-Web** | `~/Cortex/projects/Cortex-Web/` | ✅ eigenes `.git` | 8 | ~25 MB | viele |
| **C — Theme** | `~/Local Sites/.../themes/praxiszentrum/` | ✅ eigenes `.git` | ≥3 | 96 KB | 11 |

Drei separate Git-Repos. **`git mv` allein reicht NICHT** für Cross-Repo-Historie-Erhalt.

### §2.2 Working Tree praxis-redesign — UNCLEAN

```
M _rules/ARCHITECTURE.md     ← Sektion 4b „Cortex-Web — Dach-Projekt", +45/-0
?? specs/bridge-strategy/     ← 3 untracked Markdown-Dateien (00, 01, 02)
```

**Konsequenz:** Vor Subsumierung muss eine Entscheidung über diesen lokalen Zustand getroffen werden (siehe E2).

### §2.3 Verzeichnisinhalt praxis-redesign (was getrackt ist)

```
_rules/                  Architektur-Regeln, Working-Mode, Fehlerprotokoll, Pre-Flight
assets/             27M  Logos, Praxis-Bilder, Team-Fotos
legacy-juvantis-praxis-web/  1.1M  altes WP-Subprojekt aus Juvantis-Zeiten (in keiner Doku erwähnt)
phase2/             36K  Legacy-Arbeitsordner
screenshots/        151M  Verifikations-Shots (Audit-Trail PXZ-E-001…008)
specs/              108K  sprint-0/, sprint-1/, sprint-2/, bridge-strategy/ (untracked!)
tools/              44K   verify.sh, probe-design.mjs, ab-diff.mjs, alignment-probe.mjs, page-registry.mjs, shoot.mjs, …
DESIGN_GUIDELINES.md      v2.3
HANDOFF_PROMPT.md         8 Aufgaben
PHASE1_AUDIT.md           5-Phasen-Plan
SESSION_RESUME.md         40 KB Wiederaufnahme
SESSION_START.md          5 KB Einstieg
.env.sprint1.local.template
.gitignore
package.json + bun.lock   nur puppeteer-core
```

NICHT getrackt (gitignored): `node_modules/` (51 MB), `screenshots/_archive/`, `.env.sprint1.local`.

### §2.4 Cortex-Web — relevante Pfade

```
sites/                    leer (.gitkeep) — Ziel-Slot für Phase 4
specs/phase-1/            POC WP-Adapter
specs/phase-2/            POC Shopify-Adapter
specs/phase-3/            Review-Pipeline
specs/phase-4/            NEU (diese Spec)
specs/bridge-strategy/    NEU (Ziel für E3)
```

### §2.5 Verfügbarkeit Cross-Repo-Tools

| Tool | Status |
|------|:------:|
| `git subtree` | ✅ Standard-Git, vorhanden |
| `git filter-repo` | ❌ nicht installiert (kein brew, kein pip) — müsste `pip3 install --user git-filter-repo` |
| `git read-tree --prefix` + Index-Manipulation | ✅ vorhanden, aber Low-Level |

---

## §3 Lösungsdesign (Phase 2)

### §3.1 Entscheidungspunkt E1 — Cross-Repo-Strategie für Historie-Erhalt

Drei Optionen mit Trade-offs (LL-034). Dr. Stracke entscheidet.

#### Option E1a — `git subtree add`

```bash
cd ~/Cortex/projects/Cortex-Web
git subtree add --prefix=sites/praxis-webseite \
  ~/Cortex/projects/praxis-redesign main
```

| Aspekt | Bewertung |
|--------|-----------|
| Historie | ✅ alle 11 Commits erscheinen in Cortex-Web-Log mit Original-Datum/Autor |
| `git log sites/praxis-webseite/` | ✅ funktioniert |
| `git log --follow <datei>` | ✅ funktioniert für umgezogene Dateien |
| Komplexität | mittel — Subtree-Merge-Commit, einmalig komplex |
| Spätere Synchronisation | ❌ keine bidirektionale Sync nötig (Praxis-Repo wird stillgelegt) |
| Externe Tools | keine |
| Risiko | niedrig — Subtree-Merge ist Standard-Git seit 1.7 |
| Praxis-Repo nach Phase 4 | wird gelöscht ODER umbenannt zu `praxis-redesign.archiv/` (E1-Suboption) |

#### Option E1b — `git filter-repo --to-subdirectory-filter`

```bash
# Vorbereitung in /tmp/-Klon (kein Eingriff in Original)
git clone ~/Cortex/projects/praxis-redesign /tmp/praxis-rewrite
cd /tmp/praxis-rewrite
pip3 install --user git-filter-repo  # Vorbedingung
git filter-repo --to-subdirectory-filter sites/praxis-webseite

# Pull in Cortex-Web
cd ~/Cortex/projects/Cortex-Web
git remote add praxis-rewrite /tmp/praxis-rewrite
git fetch praxis-rewrite
git merge --allow-unrelated-histories praxis-rewrite/main
git remote remove praxis-rewrite
```

| Aspekt | Bewertung |
|--------|-----------|
| Historie | ✅ alle Commits, mit Pfad-Prefix sites/praxis-webseite umgeschrieben |
| `git log` | ✅ saubere lineare Historie |
| `git log --follow` | ✅ funktioniert nativ |
| Komplexität | hoch — externes Tool, Klon, Rewrite, Merge |
| Externe Tools | git-filter-repo (Python, nicht installiert) |
| Risiko | mittel — Rewrite ist destruktiv, deshalb auf Klon |
| Vorteil ggü. E1a | sauberere Log-Struktur, kein Subtree-Merge-Commit |

#### Option E1c — Plain Copy + Single Import-Commit

```bash
# praxis-redesign zu read-only Archiv umbenennen
mv ~/Cortex/projects/praxis-redesign ~/Cortex/projects/praxis-redesign.archiv
# Dateien (außer .git und node_modules) nach Cortex-Web kopieren
rsync -av --exclude='.git' --exclude='node_modules' --exclude='_archive' \
  ~/Cortex/projects/praxis-redesign.archiv/ \
  ~/Cortex/projects/Cortex-Web/sites/praxis-webseite/
cd ~/Cortex/projects/Cortex-Web
git add sites/praxis-webseite
git commit -m "feat(phase-4): subsume praxis-redesign as sites/praxis-webseite (snapshot v2.7.5, full history in praxis-redesign.archiv/)"
```

| Aspekt | Bewertung |
|--------|-----------|
| Historie in Cortex-Web | ❌ nur 1 Import-Commit, keine 11 Commits |
| Historie in Archiv-Repo | ✅ vollständig erhalten in `praxis-redesign.archiv/.git` |
| `git log --follow` | ❌ funktioniert nicht über Repo-Grenze |
| Komplexität | niedrig — rsync + commit, robust |
| Externe Tools | keine |
| Risiko | niedrig — Archiv bleibt erhalten, Backup ist eingebaut |
| Vorteil | einfachst-möglich, Archiv-Pattern ist erprobt (Cortex-OS-Migration) |

#### Architekten-Empfehlung E1

**E1a (subtree)** ist der beste Trade-off:
- Historie wandert mit (Constraint §1.3 erfüllt)
- Kein externes Tool nötig
- Subtree-Merge ist einmalig, danach weg
- E1b liefert minimal saubereres Log, der Mehraufwand (Tool-Install + Klon + Merge) lohnt sich für 11 Commits nicht
- E1c verliert die Cortex-Web-interne Historie, was später das Audit-Trail bricht

Dr. Stracke entscheidet.

### §3.2 Entscheidungspunkt E2 — Pre-Subsumierungs-Cleanup in praxis-redesign

#### Option E2a — Strict: erst commit, dann subsumieren

1. `cd ~/Cortex/projects/praxis-redesign`
2. `git add _rules/ARCHITECTURE.md` — die Sektion 4b einchecken
3. `cp -r specs/bridge-strategy ~/Cortex/projects/Cortex-Web/specs/` (nach E3-Promotion)
4. `git rm -r specs/bridge-strategy` — aus praxis-redesign entfernen
5. `git commit -m "docs: promote bridge-strategy to Cortex-Web; finalize ARCHITECTURE 4b"`
6. Dann E1-Strategie (subtree/filter-repo/copy)

| Aspekt | Bewertung |
|--------|-----------|
| Sauberkeit | ✅ Working Tree clean vor Subsumierung |
| Historie | ✅ Promotion ist als Commit dokumentiert |
| Risiko | niedrig |

#### Option E2b — Pragmatisch: untracked direkt promoten, Modified mit-committen

1. `mv praxis-redesign/specs/bridge-strategy ~/Cortex/projects/Cortex-Web/specs/`
2. `cd ~/Cortex/projects/Cortex-Web && git add specs/bridge-strategy && git commit -m "docs(phase-4): promote bridge-strategy from praxis-redesign"`
3. `cd praxis-redesign && git add _rules/ARCHITECTURE.md && git commit -m "docs: finalize ARCHITECTURE 4b before subsumption"`
4. Dann E1-Strategie

| Aspekt | Bewertung |
|--------|-----------|
| Sauberkeit | ✅ identisch zu E2a, andere Reihenfolge |
| Trennung Promotion / Subsumierung | ✅ klarer: bridge-strategy bekommt eigenen Commit in Cortex-Web |
| Vorteil | Promotion-Commit ist semantisch im Ziel-Repo (Cortex-Web), wo das Konzept lebt |

**Architekten-Empfehlung E2:** **E2b** — bridge-strategy gehört nach 3b ins Dach, also auch der Promotion-Commit. Die ARCHITECTURE.md-Änderung wird in praxis-redesign committed (gehört dorthin), bevor Subsumierung läuft.

### §3.3 Entscheidungspunkt E3 — Umgang mit `praxis-redesign/` nach Subsumierung

#### Option E3a — Komplett löschen

```bash
rm -rf ~/Cortex/projects/praxis-redesign
```

Pro: kein Verwirrungspotential, Pfad ist eindeutig weg.
Con: bei E1c (plain copy) wäre die Historie weg.

#### Option E3b — Umbenennen zu Archiv

```bash
mv ~/Cortex/projects/praxis-redesign ~/Cortex/projects/praxis-redesign.archiv
```

Pro: Notfall-Rollback möglich, alte Historie bleibt nachschlagbar.
Con: 264 MB belegt, möglicher Zugriff verwirrend.

#### Option E3c — Tarball + Löschen

```bash
tar -czf ~/Cortex/projects/praxis-redesign.tar.gz \
  --exclude=node_modules ~/Cortex/projects/praxis-redesign
rm -rf ~/Cortex/projects/praxis-redesign
```

Pro: kompaktes Backup, verzeichnisfrei, jederzeit reversibel.
Con: ein Schritt mehr.

**Architekten-Empfehlung E3:**
- Bei E1a/E1b → **E3a** (Historie ist sicher in Cortex-Web, Original kann weg)
- Bei E1c → **E3b** (Archiv ist die Historie-Quelle, darf nicht weg)

### §3.4 Theme-Pointer (deterministisch, unabhängig von E1/E2/E3)

Datei `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/THEME_POINTER.md`:

```markdown
# Theme-Pointer praxiszentrum (Local-by-Flywheel)

Das WordPress-Child-Theme `praxiszentrum` lebt physisch unter:

  /Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum/

## Warum getrennt?

Local-by-Flywheel scannt `wp-content/themes/<name>/` literal. Symlinks aus
Cortex-Web sind unzuverlässig (LBF-Updates, WP-Core-Funktionen folgen Symlinks
inkonsistent). Das Theme-Repo bleibt deshalb am LBF-Pfad.

## Aktueller Theme-Stand (Stand Phase-4-Subsumierung)

- Commit: 257304e
- PXZ_VERSION: 2.7.5 (S2.0 Design-Token-SSoT, MD5-byte-identisch zu v2.7.4)
- Letzter freigegebene Commit Dr. Stracke: 257304e (2026-04-18)

## Wiederherstellung des Theme-Repos

Falls Local-WP-Site neu aufgesetzt wird:

1. Local-Site importieren (Backup) → Theme liegt automatisch dort
2. Falls Theme weg: `git clone <…>` aus dem Backup-Repo
3. PXZ_VERSION-Bump-Policy: siehe `assets/css/CHANGELOG.md` im Theme-Repo

## Pflege

Bei Theme-Änderungen wird der Commit-Hash hier aktualisiert (Manual-Pflege,
da getrennte Repos). Spätestens bei jedem `Session beenden` (LL-042 Schritt 1).
```

### §3.5 Pfad-Referenz-Updates (deterministisch, nach Subsumierung)

Folgende Dateien zeigen aktuell auf `projects/praxis-redesign/`. Sie werden in
Phase 3 (Umsetzung) per `sed`/Edit aktualisiert:

| Datei | Anzahl Treffer (geschätzt) |
|-------|:--------------------------:|
| `~/Cortex/Nexus/_memory/MEMORY.md` | ~15 (Pfad-Referenz-Tabelle, aktive-Projekte-Tabelle, Top-Fehler-Block) |
| `~/Cortex/Nexus/CLAUDE.md` | ~5 (praxis-redesign-Sektion, Cortex-Web-Sektion) |
| `~/Cortex/Nexus/SYSTEM_MAP.md` | ~3 |
| `~/Cortex/Nexus/.config/devices.json` | 1 (Projekt-Liste Cluster-Mini-02) |
| `~/Cortex/projects/Cortex-Web/CLAUDE.md` | ~3 |
| `~/Cortex/projects/Cortex-Web/SESSION_RESUME.md` | ~10 |
| `~/Cortex/projects/Cortex-Web/_rules/ARCHITECTURE.md` | ~5 |
| `~/Cortex/projects/Cortex-Web/specs/bridge-strategy/*` (nach Promotion) | ~10 |
| Tools im neuen Pfad: `sites/praxis-webseite/tools/verify.sh` | (referenziert relative Pfade — vermutlich kein Eingriff) |

### §3.6 Reihenfolge Phase 3 (Umsetzung, NACH Freigabe)

Definitiver Plan (deterministisch, dokumentiert vor Ausführung):

```
T0  Pre-Flight grün vor Beginn:
    Cortex-Web tools/validate.sh ✅
    praxis-redesign tools/verify.sh ✅

T1  Pre-Subsumierungs-Cleanup (E2-Wahl):
    [E2b empfohlen]
    - mv praxis-redesign/specs/bridge-strategy → Cortex-Web/specs/bridge-strategy/
    - Cortex-Web: git add + commit "docs(phase-4): promote bridge-strategy from praxis-redesign"
    - praxis-redesign: git add _rules/ARCHITECTURE.md + commit "docs: finalize ARCHITECTURE 4b before subsumption"

T2  Cross-Repo-Subsumierung (E1-Wahl):
    [E1a empfohlen]
    - Cortex-Web: git subtree add --prefix=sites/praxis-webseite ~/Cortex/projects/praxis-redesign main

T3  Theme-Pointer:
    - Cortex-Web: write sites/praxis-webseite/THEME_POINTER.md
    - git add + commit "docs(phase-4): add THEME_POINTER for Local-WP theme repo"

T4  Pfad-Referenz-Updates (siehe §3.5):
    - sed/Edit in allen aufgelisteten Dateien
    - Sammel-Commit: "refs(phase-4): update paths to sites/praxis-webseite/ across Nexus + Cortex-Web docs"

T5  Praxis-Repo-Final (E3-Wahl):
    [E3a bei E1a/E1b empfohlen]
    - rm -rf ~/Cortex/projects/praxis-redesign
    ODER
    - mv ~/Cortex/projects/praxis-redesign ~/Cortex/projects/praxis-redesign.archiv/

T6  Post-Subsumption Pre-Flight:
    - cd Cortex-Web/sites/praxis-webseite && tools/verify.sh ✅
    - Local-WP-Theme funktional (PXZ_VERSION 2.7.5 weiterhin aktiv)
    - Cortex-Web tools/validate.sh ✅ (basic + CHECK_SHOPIFY)
    - Cortex-Web tools/review.sh ✅ (12/12 AKs grün)

T7  Phase-4-Selbstprüfung:
    - specs/phase-4/evidence/2026-04-19_self-check.md mit Akzeptanzkriterien-Tabelle (siehe §4)
```

---

## §4 Akzeptanzkriterien (Phase 4 Selbstprüfung)

| AK | Kriterium | Mess-Methode |
|---:|-----------|--------------|
| AK-1 | `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/` enthält alle 118 ehemals von praxis-redesign getrackten Dateien | `git ls-files sites/praxis-webseite/ \| wc -l ≥ 118` (+ 1 für THEME_POINTER) |
| AK-2 | `~/Cortex/projects/Cortex-Web/specs/bridge-strategy/` enthält 00, 01, 02 | `ls -1 specs/bridge-strategy/ \| wc -l == 3` |
| AK-3 | Theme-Pointer-Datei existiert mit aktuellem Commit-Hash 257304e | `grep "257304e" sites/praxis-webseite/THEME_POINTER.md` |
| AK-4 | Git-Historie verfügbar (E1-abhängig): bei E1a/E1b 11+ Commits sichtbar in `git log sites/praxis-webseite/` | `git log --oneline sites/praxis-webseite/ \| wc -l ≥ 11` |
| AK-5 | Pre-Flight am neuen Pfad grün | `cd sites/praxis-webseite && bash tools/verify.sh; echo $?` == 0 |
| AK-6 | Cortex-Web-Hauptpipeline weiter grün | `bash tools/validate.sh && CHECK_SHOPIFY=1 bash tools/validate.sh && bash tools/review.sh` alle Exit 0 |
| AK-7 | Local-WP-Theme funktional (PXZ_VERSION 2.7.5 live, Homepage rendert) | Puppeteer-Shot über `tools/verify.sh §3 Computed-Style 54/54 grün` |
| AK-8 | Keine alten `~/Cortex/projects/praxis-redesign/`-Pfade in Nexus oder Cortex-Web mehr referenziert | `grep -rn "projects/praxis-redesign" ~/Cortex/Nexus ~/Cortex/projects/Cortex-Web` liefert 0 Treffer (außer Doku-Verweise auf Historie) |
| AK-9 | `~/Cortex/projects/praxis-redesign/` existiert nicht mehr (E3a) ODER ist als `.archiv` markiert (E3b) | `ls ~/Cortex/projects/` |
| AK-10 | praxis-redesign-Working-Tree-Reste sauber: keine `M`/`??` in praxis-redesign vor Subsumierung | (vor T2 geprüft, T1 macht es) |
| AK-11 | Theme-Repo unverändert: Commit `257304e` weiterhin HEAD | `cd <theme-pfad> && git rev-parse HEAD == 257304e` |
| AK-12 | Self-Check-Datei vorhanden mit Score 12/12 | `specs/phase-4/evidence/2026-04-19_self-check.md` existiert |

---

## §5 Risiken & Rollback

| Risiko | Wahrscheinlichkeit | Schwere | Mitigation |
|--------|:------:|:------:|------------|
| `git subtree add` schlägt wegen ungespeicherter Änderungen fehl | mittel | mittel | T1 (Cleanup) muss vor T2 (subtree) laufen |
| Pfad-Referenz-Updates übersehen einen Treffer | hoch | niedrig | grep-Suche in T6, AK-8 erzwingt 0 Treffer |
| Local-WP-Theme-Pfad wird trotz 2a versehentlich angefasst | niedrig | hoch | THEME_POINTER macht Abgrenzung explizit; T6 prüft Theme-Repo-HEAD |
| `node_modules/` in praxis-redesign muss nach Subsumierung neu installiert werden | hoch | niedrig | nach T2: `cd sites/praxis-webseite && bun install` |
| Verify-Pipeline am neuen Pfad bricht wegen relativer Pfade in Tools | mittel | mittel | T6 deckt das ab; falls rot: gezielte sed-Korrektur |
| Subtree-Merge-Konflikt | niedrig | mittel | praxis-redesign und Cortex-Web haben disjunkte Pfade — kein Konflikt erwartet |
| `legacy-juvantis-praxis-web/` enthält Inhalte, die woanders hingehören | mittel | niedrig | nach Subsumierung: separates Audit, ggf. Move in einer Folge-Session |

### Rollback-Plan

- **Nach T2 (subtree)**, falls Probleme: `git reset --hard HEAD~1` in Cortex-Web setzt subtree-Commit zurück.
- **Nach T5 (Löschen)**, falls Bedauern: bei E3a Wiederherstellung nur via E1a-Historie möglich (`git checkout sites/praxis-webseite` + `git mv` zurück); bei E3b einfach `mv .archiv praxis-redesign`.
- **Theme-Repo unberührt** → niemals Rollback nötig auf Theme-Seite.

---

## §6 Was diese Spec NICHT macht (Out-of-Scope)

- Keine inhaltliche Änderung an praxis-redesign-Dateien
- Keine inhaltliche Änderung am WP-Theme `praxiszentrum`
- Kein Sprint-2-Fortschritt (S2.1 Seiten-Inventar etc.) — bleibt offene Task in Sprint-2
- Keine Phase 5 (Juvantis-Subsumierung) — eigene separate Session, eigene Spec
- Keine `git mv`-Operation INNERHALB Cortex-Web (bridge-strategy ist `mv` zwischen Repos, nicht `git mv`)
- Kein Remote-Push (beide Repos kein Remote, dabei bleibt's)

---

## §7 Drei Entscheidungspunkte für Dr. Stracke

| ID | Frage | Optionen | Architekten-Empfehlung |
|----|-------|----------|:----------------------:|
| **E1** | Cross-Repo-Strategie | (a) `git subtree`, (b) `git filter-repo`, (c) plain copy + Archiv | **E1a** |
| **E2** | Pre-Subsumierungs-Cleanup | (a) strict / (b) pragmatisch (untracked direkt promoten) | **E2b** |
| **E3** | praxis-redesign nach Phase 4 | (a) löschen, (b) `.archiv/` umbenennen, (c) tarball | **E3a (bei E1a/b)** / **E3b (bei E1c)** |

Sobald Dr. Stracke E1/E2/E3 beantwortet hat, geht die Spec in Phase 3 (Umsetzung). Erst dann startet eine einzige `git mv`-/`subtree`-Operation.

---

## §8 Self-Check-Vorlage (für Phase 4 Selbstprüfung nach Umsetzung)

Wird unter `specs/phase-4/evidence/2026-04-19_self-check.md` angelegt — analog
zu Phase-2/3-Self-Checks. AK-Tabelle aus §4, mit Evidenz-Spalte (gemessene
Werte, Datei-Pfade, Grep-Output, exit-codes).

---

*Stand: 2026-04-19, DRAFT, wartet auf Freigabe E1/E2/E3.*
