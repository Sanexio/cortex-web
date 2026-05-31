---
name: Cortex-Web
version: "0.6"
status: aktiv
geraete:
  primary:    [Cluster-Mini-02, Mac-Studio-von-MacStudioZi2]
  mirror:     [SSMD-MacBookPro, SSMD-MacBookPro-M5, Cluster-Mini-04]
erstellt: 2026-04-18
aktualisiert: 2026-05-24
phase: "Phasen 0–5 abgeschlossen — Multi-Device-Mirror eingeführt (CW-009)"
---

# Cortex-Web — Projekt-Container-Manifest

> Dach-Projekt für die beiden Webseiten-Ökosysteme (Praxis & Juvantis).
> Common Trunk mit plattform-spezifischen Adaptern (WordPress, Shopify, später iOS).

## Beschreibung

Cortex-Web ist seit Welle 1.3+1.5b (2026-05-26 / §10.9 final 2026-05-31)
das **OSS-Framework-Repo** für gemeinsamen Content-, Design- und
Medien-Trunk plus Multi-Plattform-Adapter (WordPress + Shopify + iOS).
Tenant-eigene Sites leben **im separaten Tenant-Repo**
`Sanexio/sanexio-tenant` (privat), z.B. `westend-hausarzt.com` (Praxis
Dr. Stracke) und `sanexio.eu` (Juvantis-Distribution). Inhalte werden
**einmal** im Trunk gepflegt und via **Adapter** plattform-spezifisch
ausgeliefert. Die beiden Stracke-Sites bleiben formal getrennt
(rechtlich, organisatorisch, markentechnisch), teilen sich aber
Ressourcen, Komponenten und Design-Tokens.

**Scope (Framework):**
- Content-Schemas: Pages, Products, Team, Legal — mehrsprachig
  (DE/EN/FR/ES, I-2 hybrid)
- Design-Trunk: Tokens + UI-Komponenten-Specs (Maximal-Trunk)
- Media-Pattern: Master in Shopify Files (M-3c) + lokale Originale
  in `_media-source/`
- Adapter: WordPress + Shopify + Astro + iOS (später)
- Slot-System: `_integration-slots/` für Tenant-Sub-Projekte
- Helper-Trio: `tools/lib/tenant-path.{sh,mjs}` für
  Cross-Repo-Pfad-Auflösung

## Aktive Tenant-Sites (im Tenant-Repo, nicht hier)

| Site | Pfad | Technologie |
|------|------|-------------|
| praxis-webseite | `${CORTEX_TENANT_DIR}/sites/praxis-webseite/` | WordPress (Blocksy Child: praxiszentrum) |
| juvantis-webseite | `${CORTEX_TENANT_DIR}/sites/juvantis-webseite/` | Shopify Taste 8.0.1 |

**Hinweis:** Die Tenant-Migration ist abgeschlossen (Welle 1.3+1.5b).
Historisch lagen die Sites in `Cortex-Web/sites/praxis-webseite/` bzw.
`Cortex-Web/sites/juvantis-webseite/` (Phase 4/5, 2026-04-19) — diese
Pfade existieren nicht mehr im Framework-Repo.

## Strategie-Dokumente

- `Cortex-Web/specs/bridge-strategy/00_BRAINSTORMING_KONZEPT.md`
- `Cortex-Web/specs/bridge-strategy/01_COMMON_TRUNK_LOKALE_ENTWICKLUNG.md`
- `Cortex-Web/specs/bridge-strategy/02_ENTSCHEIDUNGEN_FINAL.md`

Diese drei Dokumente bilden die Entscheidungshistorie. Seit Phase 4 (2026-04-19, Entscheidung 3b) hier im Dach.

## Abhängigkeiten

### System-Tools
- Bun (Adapter-Laufzeit, `brew install bun` bereits via tap auf Cluster-Mini-02)
- Node.js >= 18 (nur wenn Shopify CLI gebraucht)
- Shopify CLI (für Shopify-Adapter-Deploy)
- WP-CLI (für WordPress-Adapter-Deploy)
- Puppeteer-core (Visual-Regression-Tests, wie in praxis-redesign)

### Nexus-Abhängigkeiten
- `Nexus/_rules/GLOBAL_RULES.md` (LL-001 … LL-043+)
- `Nexus/_rules/SESSION_LIFECYCLE.md` (LL-042/043)
- `Nexus/_memory/MEMORY.md` (aktive Projekte, Top-Fehler)
- Architekten-Modus wird aus
  `${CORTEX_TENANT_DIR}/sites/praxis-webseite/_rules/WORKING_MODE.md`
  referenziert (Phase 0 Entscheidung; vor Phase 4: `projects/praxis-redesign/_rules/WORKING_MODE.md`;
  seit Welle 1.3 im Tenant-Repo).

## Datenvolumen (initial, wächst)

| Ordner | Beschreibung |
|--------|--------------|
| `trunk/` | Content-Generika, Design, Schemas (Text/YAML/MD, klein) |
| `_media-source/` | Lokale Original-Medien (git-ignoriert) |
| `adapters/` | Build-Skripte pro Plattform |
| `sites/` | Framework-Stubs (`_examples/`, `sanexio-github-io/`, `workforce-time/`); Tenant-Sites liegen seit Welle 1.3 im Tenant-Repo |

## Phasen-Roadmap

| Phase | Ziel | Session | Status |
|-------|------|:-------:|:-----:|
| **0** | Skelett + Regel-Infrastruktur + Nexus-Eintragung | 1 | ✅ 2026-04-18 |
| **1** | POC WordPress-Adapter (1 Produkt → WP-Page lokal) | 2 | ✅ 2026-04-18 |
| **2** | POC Shopify-Adapter (gleiches Produkt → Shopify) | 3+4 | ✅ 2026-04-18/19 |
| **3** | Review & Go/No-Go | 5 | ✅ 2026-04-19 |
| **4** | Subsumierung praxis-redesign → sites/praxis-webseite/ | 6 | ✅ 2026-04-19 |
| **5** | Subsumierung Juvantis-Web-Docs → sites/juvantis-webseite/ (Theme-Klon bleibt bei `Juvantis/juvantis-web/theme/`) | 7 | ✅ 2026-04-19 |

## Regeln

- `_config/RULES.md` — Projekt-spezifische Regeln (CW-001+)
- `_rules/ARCHITECTURE.md` — Phasen-Plan + Sprint-Roadmap
- Architekten-Modus: Referenz auf `sites/praxis-webseite/_rules/WORKING_MODE.md`
  (wird nach Promotion zum globalen Pattern nach `Nexus/_rules/` verschoben)

## Hinweise

- Praxis-Sprint + Juvantis-Weiterentwicklung laufen weiterhin parallel
  zum Framework, jetzt aus dem Tenant-Repo heraus
  (`${CORTEX_TENANT_DIR}/sites/...`); Framework-Wellen blockieren die
  Site-Arbeit nicht.
- Historischer Phase-5-Hinweis: Die Juvantis-Doku-Subsumierung
  (2026-04-19) hat die Site für ~30 Min pausiert (`git subtree add`
  analog Phase 4). Aktuelle Sites werden nicht erneut subsumiert —
  Tenant-Migration (Welle 1.3, 2026-05-26) ist die letzte
  Umzugs-Operation.
- Alle Medien bekommen lokale Originale in `_media-source/` — auch bei
  M-3c. Das sichert den späteren Umzug auf M-3d (NAS).
