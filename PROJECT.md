---
name: Cortex-Web
version: "0.1"
status: aktiv
geraete: [home-mac-mini]
erstellt: 2026-04-18
aktualisiert: 2026-04-18
phase: "Phase 0 abgeschlossen — Skelett"
---

# Cortex-Web — Projekt-Container-Manifest

> Dach-Projekt für die beiden Webseiten-Ökosysteme (Praxis & Juvantis).
> Common Trunk mit plattform-spezifischen Adaptern (WordPress, Shopify, später iOS).

## Beschreibung

Cortex-Web ist der gemeinsame Content-, Design- und Medien-Trunk für
`westend-hausarzt.com` (Praxis Dr. Stracke) und `sanexio.eu` (Juvantis-Distribution).
Inhalte werden **einmal** im Trunk gepflegt und via **Adapter** plattform-spezifisch
ausgeliefert. Die beiden Webseiten bleiben formal getrennt (rechtlich, organisatorisch,
markentechnisch), teilen sich aber Ressourcen, Komponenten und Design-Tokens.

**Scope:**
- Content: Pages, Products, Team, Legal — mehrsprachig (DE/EN/FR/ES, I-2 hybrid)
- Design: Tokens + UI-Komponenten-Specs (Maximal-Trunk)
- Media: Master in Shopify Files (M-3c) + lokale Originale in `_media-source/`
- Adapter: WordPress (praxis-webseite) + Shopify (juvantis-webseite) + iOS (später)

## Unterprojekte (geplante Subsumierung, nach POC)

| UP | Beschreibung | Pfad (Ziel) | Technologie |
|----|-------------|-------------|-------------|
| praxis-webseite | Praxis-Dr.-Stracke-Webseite | `sites/praxis-webseite/` | WordPress (Blocksy Child: praxiszentrum) |
| juvantis-webseite | Sanexio-Juvantis-Distribution | `sites/juvantis-webseite/` | Shopify Taste 8.0.1 |

**Wichtig:** Die Subsumierung erfolgt in Phase 4 (Praxis) und Phase 5 (Juvantis),
jeweils mit separatem Go von Dr. Stracke via `git mv` (Historie bleibt erhalten).

## Strategie-Dokumente

- `/projects/praxis-redesign/specs/bridge-strategy/00_BRAINSTORMING_KONZEPT.md`
- `/projects/praxis-redesign/specs/bridge-strategy/01_COMMON_TRUNK_LOKALE_ENTWICKLUNG.md`
- `/projects/praxis-redesign/specs/bridge-strategy/02_ENTSCHEIDUNGEN_FINAL.md`

Diese drei Dokumente bilden die Entscheidungshistorie. Nach Phase 4 werden sie
nach `Cortex-Web/specs/bridge-strategy/` mitverschoben.

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
- Architekten-Modus wird aus `projects/praxis-redesign/_rules/WORKING_MODE.md` referenziert (Phase 0 Entscheidung)

## Datenvolumen (initial, wächst)

| Ordner | Beschreibung |
|--------|--------------|
| `trunk/` | Content, Design, Schemas (Text/YAML/MD, klein) |
| `_media-source/` | Lokale Original-Medien (git-ignoriert) |
| `adapters/` | Build-Skripte pro Plattform |
| `sites/` | Nach Subsumierung: praxis-webseite + juvantis-webseite |

## Phasen-Roadmap

| Phase | Ziel | Session | Status |
|-------|------|:-------:|:-----:|
| **0** | Skelett + Regel-Infrastruktur + Nexus-Eintragung | 1 | ✅ heute |
| **1** | POC WordPress-Adapter (1 Produkt → WP-Page lokal) | 1 | ⏳ nächste |
| **2** | POC Shopify-Adapter (gleiches Produkt → Shopify) | 1 | ⏳ |
| **3** | Review & Go/No-Go | 1 | ⏳ |
| **4** | Subsumierung praxis-redesign → sites/praxis-webseite/ | 1 | ⏳ |
| **5** | Subsumierung Juvantis/juvantis-web → sites/juvantis-webseite/ | 1 | ⏳ |

## Regeln

- `_config/RULES.md` — Projekt-spezifische Regeln (CW-001+)
- `_rules/ARCHITECTURE.md` — Phasen-Plan + Sprint-Roadmap
- Architekten-Modus: Referenz auf `projects/praxis-redesign/_rules/WORKING_MODE.md`
  (wird nach Promotion zum globalen Pattern nach `Nexus/_rules/` verschoben)

## Hinweise

- Sprint 2 praxis-redesign + Juvantis-Weiterentwicklung laufen PARALLEL weiter, keine Blockade durch Cortex-Web-Phasen 0–3.
- Phasen 4/5 (Subsumierung) pausieren die jeweilige Site für ca. 30 Min (git mv).
- Alle Medien bekommen lokale Originale in `_media-source/` — auch bei M-3c. Das sichert den späteren Umzug auf M-3d (NAS).
