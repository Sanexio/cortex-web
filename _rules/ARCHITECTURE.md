# ARCHITECTURE — Cortex-Web

> Lebendes Dokument. Stand: 2026-04-19 nach Phase 4 (Praxis subsumiert).

---

## 1. IST-Architektur (Phase 0 Abschluss)

```
~/Cortex/projects/Cortex-Web/
├── PROJECT.md                   Container-Manifest
├── CLAUDE.md                    Projekt-Kontext für Claude
├── README.md
├── CHANGELOG.md                 SemVer-Verlauf
├── SESSION_RESUME.md            LL-043-Einstieg
├── .gitignore
├── package.json                 Bun + puppeteer-core + js-yaml + ajv
│
├── _config/
│   ├── RULES.md                 CW-001…CW-005
│   ├── FEHLERPROTOKOLL.md       leer
│   └── WORKFLOW_CHECKLIST.md
│
├── _rules/
│   ├── WORKING_MODE.md          Verweis auf praxis-redesign
│   ├── ARCHITECTURE.md          diese Datei
│   ├── PRE_FLIGHT_CHECKLIST.md  Platzhalter
│   └── FEHLERPROTOKOLL.md       leer
│
├── trunk/
│   ├── content/{pages,products,team,legal,media}
│   ├── design/{components/}
│   ├── media/registry.yaml      leer
│   └── schema/
│       ├── page.schema.json     Platzhalter
│       ├── product.schema.json  Platzhalter
│       ├── team-member.schema.json
│       ├── component.schema.json
│       └── media.schema.json
│
├── adapters/{wordpress,shopify,ios}/README.md   Platzhalter
│
├── tools/
│   ├── README.md
│   └── media/                   leer
│
├── sites/                       leer, füllt sich ab Phase 4
├── _media-source/{logos,produkte,team,praxis}/  leer, git-ignoriert
```

### 1.1 Nexus-Integration

| Datei | Status |
|-------|:------:|
| `Nexus/_memory/MEMORY.md` → Cortex-Web als aktives Projekt | ✅ Phase 0 |
| `Nexus/CLAUDE.md` → Abschnitt Cortex-Web | ✅ Phase 0 |
| `Nexus/.config/devices.json` → Cortex-Web unter Cluster-Mini-02 | ✅ Phase 0 |
| `Nexus/SYSTEM_MAP.md` → Struktur aktualisiert | ⏳ wird in Session-Ende geprüft |

---

## 2. Ziel-Architektur (nach Phase 5)

```
~/Cortex/projects/Cortex-Web/
├── trunk/                       befüllt mit echten Inhalten
├── adapters/wordpress/          implementiert, testet gegen Local WP
├── adapters/shopify/            implementiert, testet gegen medzpoint
├── sites/
│   ├── praxis-webseite/         ex praxis-redesign/ (Phase 4)
│   └── juvantis-webseite/       Docs + Deploy-Tooling (Phase 5) — Theme-Klon bleibt bei Juvantis/juvantis-web/theme/
```

Juvantis-Kern (`DHT/`, `social-media/`) bleibt unter `projects/Juvantis/`.

---

## 3. Phasen-Roadmap

| Phase | Ziel | Session | Status | Kommentar |
|:---:|------|:-------:|:-----:|-----------|
| **0** | Skelett + Regeln + Nexus | 1 | ✅ 2026-04-18 | Commit `6178d2f` / `d9577cd` |
| **1** | POC WP-Adapter: 1 Produkt → WP-Page | 2 | ✅ 2026-04-18 | Commit `778635c`, 10/10 AK, HWG-konform, idempotent |
| **2 (Setup)** | Shopify Custom App + Admin-API-Token | 3 | ✅ 2026-04-18 | Commit `48c4170`, OAuth-Catcher + Authorize-Script |
| **2 (Adapter)** | POC Shopify-Adapter: gleiches Produkt → Draft | 4 | ✅ 2026-04-19 | Commit `7d6f665`, 12/12 AK, Trunk-Master via Roundtrip nachgewiesen |
| **3** | Review — trägt der Ansatz? | 5 | ✅ 2026-04-19 | Commit `98d1f67`, 12/12 AK, 6 Dimensionen automatisiert, Tenant-Operator-Go für Phase 4 |
| **4** | Praxis-Subsumierung: `praxis-redesign/` → `sites/praxis-webseite/` | 6 | ✅ 2026-04-19 | `git subtree add` (E1a, alle 13 Commits erhalten); bridge-strategy nach `Cortex-Web/specs/bridge-strategy/` (3b); `THEME_POINTER.md` für Local-WP-Theme (2a) |
| **5** | Juvantis-Web-Docs-Subsumierung: `juvantis-web/{shopify-sync.sh,shopify_export,knowledge-graph}` → `sites/juvantis-webseite/` | 7 | ✅ 2026-04-19 | `mv` + SHOPIFY_THEME_POINTER (E1a+E2a+E3a+E4a); Theme-Klon bleibt bei `Juvantis/juvantis-web/theme/` (Remote GitHub `shopify-theme`); shopify-sync.sh THEME_DIR auf absoluten Pfad via `$HOME` |

**Wichtig:** Phasen sind in separaten Sessions abzuschließen. Jede Phase endet mit
„Session beenden" (LL-042), nächste Phase startet mit „Projekt fortsetzen" (LL-043).

---

## 4. Parallelität zu bestehenden Projekten

Während Phasen 0–3 laufen **praxis-redesign** und **Juvantis** UNGESTÖRT weiter:

| Projekt | Laufende Arbeit | Kreuzt sich mit Cortex-Web? |
|---------|-----------------|:---:|
| praxis-redesign Sprint 2 (Kernseiten-Ausbau) | ja, aktiv | nein — neue Seiten werden direkt in WP gebaut, später ggf. retro-aktiv in Trunk überführt |
| praxis-redesign Sprint 1 (Staging/SFTP) | pausiert wegen DF-Support | nein |
| Juvantis-Shopify Weiterentwicklung | ja | nein — neue Sections / Products laufen direkt in Shopify |

Die Subsumierung (Phase 4/5) ist ein ORDNER-UMZUG mit `git mv`, keine Content-Migration.
Git-Historien bleiben erhalten.

---

## 5. Entscheidungshistorie

Die drei Strategie-Dokumente liegen seit Phase 4 (2026-04-19, Entscheidung 3b)
hier im Dach-Projekt:

- `Cortex-Web/specs/bridge-strategy/00_BRAINSTORMING_KONZEPT.md` — Phase-1-Verständnis
- `Cortex-Web/specs/bridge-strategy/01_COMMON_TRUNK_LOKALE_ENTWICKLUNG.md` — Phase-2-Lösungsdesign
- `Cortex-Web/specs/bridge-strategy/02_ENTSCHEIDUNGEN_FINAL.md` — finale Entscheidungen

Sie wurden ursprünglich in praxis-redesign begonnen, weil die Entscheidungen
dort entstanden — aber konzeptionell betreffen sie das Dach (beide Sites),
deshalb hochpromotet.

---

## 6. Offene Architektur-Entscheidungen

Werden in Phase 1/2 beim POC konkretisiert:

- Adapter-Lauf: Idempotent vs. Destructive (anlegen oder überschreiben)?
- Cache-Buster-Strategie (WP-Theme-Version, Shopify-Asset-Hash)
- Multi-Device-Koordination (beim Build auf Cluster-Mini-02 vs. SSMD-MacBookPro)
- Dedupe bei Medien-Upload (Hash-basiert)

---

## 7. Anschluss an praxis-redesign Sprint-Plan

Nach Phase 4 wird die praxis-redesign-Sprint-Nummerierung (Sprint 0–4) nahtlos in
`Cortex-Web/sites/praxis-webseite/_rules/ARCHITECTURE.md` fortgeführt. Keine Renumerierung.
