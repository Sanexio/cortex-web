# ARCHITECTURE — Cortex-Web

> Lebendes Dokument. Stand: 2026-04-18 nach Phase 0.

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
│   ├── praxis-webseite/         ex praxis-redesign/
│   └── juvantis-webseite/       ex Juvantis/juvantis-web/
```

Juvantis-Kern (`DHT/`, `social-media/`) bleibt unter `projects/Juvantis/`.

---

## 3. Phasen-Roadmap

| Phase | Ziel | Session | Status | Kommentar |
|:---:|------|:-------:|:-----:|-----------|
| **0** | Skelett + Regeln + Nexus | 1 | ✅ 2026-04-18 | Commit `6178d2f` / `d9577cd` |
| **1** | POC WP-Adapter: 1 Produkt → WP-Page | 1 | ✅ 2026-04-18 | Commit `778635c`, 10/10 AK, HWG-konform, idempotent |
| **2** | POC Shopify-Adapter: gleiches Produkt | 1 | ⏳ | nächste Session |
| **3** | Review — trägt der Ansatz? | 1 | ⏳ | Go/No-Go |
| **4** | Praxis-Subsumierung: `praxis-redesign/` → `sites/praxis-webseite/` | 1 | ⏳ | `git mv` |
| **5** | Juvantis-Subsumierung: `Juvantis/juvantis-web/` → `sites/juvantis-webseite/` | 1 | ⏳ | `git mv` |

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

Die drei Strategie-Dokumente:

- `projects/praxis-redesign/specs/bridge-strategy/00_BRAINSTORMING_KONZEPT.md` — Phase-1-Verständnis
- `projects/praxis-redesign/specs/bridge-strategy/01_COMMON_TRUNK_LOKALE_ENTWICKLUNG.md` — Phase-2-Lösungsdesign
- `projects/praxis-redesign/specs/bridge-strategy/02_ENTSCHEIDUNGEN_FINAL.md` — finale Entscheidungen

Liegen physisch noch in praxis-redesign, weil die Entscheidungen DORT begonnen haben.
Bei Phase 4 wandern sie nach `sites/praxis-webseite/specs/bridge-strategy/` oder — besser —
nach `Cortex-Web/specs/bridge-strategy/` (Architektur-Dokumente gehören zum Dach).

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
