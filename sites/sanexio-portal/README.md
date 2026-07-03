# Sanexio Portal

Login-gated Cortex-Hub mit Workforce-Time-Embed. Cyberpunk-Design, Read-only
Second-Brain-Graph aus dem Nexus-Vault. Welle P.1 (2026-06-13).

## Themes: CyberDark (Default) + CyberWhite (2026-07-04)

Fixer Theme-Pin oben rechts (`ThemeToggle.tsx`) schaltet zwischen
CyberDark und CyberWhite (helles Tron-Theme, Tageslicht-Auslegung —
Palette identisch zur cortex-sanexio.tech-Landing). Persistenz via
localStorage `cortex_cyber_theme`, früher Boot ohne Flackern als
Inline-Script in `index.html`, `?theme=cyber-white|cyber-dark`
überschreibt. Der Second-Brain-Graph bleibt bewusst eine dunkle
Insel (Cytoscape-Farben sind JS-seitig auf dunklen Grund gebaut).

## Quick Start

```bash
cd sites/sanexio-portal
npm install
npm run dev    # → http://127.0.0.1:5176
```

Der `predev`-Hook generiert `public/graph.json` aus
`~/Cortex/Nexus/Second Brain/` (read-only auf den Vault).

## Build

```bash
npm run build  # tsc --noEmit + vite build → dist/
```

## Karten-Liste

Datenquelle: `src/data/cards.ts`. Status `production` zeigt das aktive Modul,
`locked` blendet ein Lock-Overlay + Toast ein. Aktuell freigeschaltet:

| ID            | Status     | Ziel-URL                  |
|---------------|------------|---------------------------|
| workforce-time| production | `http://127.0.0.1:5174/`  |
| sanexio-cortex| production | `http://127.0.0.1:9119/projects` |
| cortex-qm     | locked     | —                         |
| cortex-desk   | locked     | —                         |
| cortex-cli    | locked     | —                         |
| cortex-harness| production | `http://127.0.0.1:8765/harness` |
| cortex-rename | locked     | —                         |
| juvantis      | locked     | —                         |

## Graph

`scripts/build-graph-data.mjs` scannt alle `*.md` unter
`~/Cortex/Nexus/Second Brain/`, parsed `[[Wiki-Links]]` als Kanten und
schreibt `public/graph.json` (Top-320 Knoten nach Degree). Cluster werden
nach Top-Level-Ordner gefärbt.

Renderer: `src/components/SecondBrainGraph.tsx` (Cytoscape.js + fcose).

## Praxis-Test

Siehe `docs/PRAXIS_TEST.md`.

## Local-Stage-Only

Diese Site läuft ausschließlich auf der lokalen Praxis-Staging
(Local-Flywheel). Kein Deploy auf .de- oder .com-Domains.
