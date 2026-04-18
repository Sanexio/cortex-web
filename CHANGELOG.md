# CHANGELOG — Cortex-Web

Alle nennenswerten Änderungen an diesem Projekt. Format: [Keep a Changelog](https://keepachangelog.com/de/1.1.0/). Versionierung: SemVer.

## [0.1.0] — 2026-04-18

### Phase 0 abgeschlossen — Skelett

#### Hinzugefügt
- Projekt-Ordnerstruktur (`trunk/`, `adapters/`, `tools/`, `sites/`, `_config/`, `_rules/`, `_media-source/`)
- `PROJECT.md` (Container-Manifest nach Nexus-Standard)
- `CLAUDE.md` (Projekt-Kontext, Pflicht-Lesung)
- `README.md` (Kurzbeschreibung)
- `SESSION_RESUME.md` (LL-043-Format, Phase-0-Abschluss-Stand)
- `_config/RULES.md` (CW-001 bis CW-005 definiert)
- `_config/FEHLERPROTOKOLL.md` (leer, wartet auf erste CW-E-Einträge)
- `_config/WORKFLOW_CHECKLIST.md`
- `_rules/ARCHITECTURE.md` (Phasen-Roadmap 0–5 + Sprint-Anschluss)
- `_rules/WORKING_MODE.md` (Referenz auf praxis-redesign Architekten-Modus)
- `_rules/PRE_FLIGHT_CHECKLIST.md` (Platzhalter, wächst mit Adaptern)
- `_rules/FEHLERPROTOKOLL.md`
- `trunk/schema/*.schema.json` (leere Schema-Gerüste: page, product, team-member, component, media)
- `trunk/media/registry.yaml` (leer)
- `adapters/{wordpress,shopify,ios}/README.md` (Platzhalter)
- `tools/README.md`
- `.gitignore` (ignoriert `_media-source/`, `node_modules/`, `bun.lock`-Konflikte)
- `package.json` (Bun, puppeteer-core)

#### Nexus-Updates (außerhalb des Projekt-Repos)
- `Nexus/_memory/MEMORY.md`: Cortex-Web als aktives Projekt ergänzt
- `Nexus/CLAUDE.md`: Cortex-Web-Abschnitt hinzugefügt
- `Nexus/.config/devices.json`: Cortex-Web unter Cluster-Mini-02 ergänzt
- `projects/praxis-redesign/_rules/ARCHITECTURE.md`: Sprint T0–T5 + Parallelität dokumentiert
- `projects/Juvantis/PROJECT.md`: Vermerk über spätere Subsumierung

#### Initial-Commit
- Git-Repo initialisiert
- Erster Commit: `6178d2f — chore: phase 0 – skeleton, rules, nexus integration`
