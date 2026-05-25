# Cortex-Web — Astro-Adapter

> **Status:** Phase 1+2 Skelett · 2026-05-23
> **Zielsite:** Konfigurierbares Astro-Sub-Projekt unter `sites/<astro-site>/repo/`
> (Astro 5 + TypeScript Data-Files, Deploy typischerweise via GitHub-Pages).
> Die im Reference-Tenant verwendete Site liegt unter
> `sites/sanexio-github-io/repo/`; auf anderen Tenants entsprechend.
> **Architekten-Spec:** `specs/cross-site-transfer/ARCHITECTURE.md`
> **Schema-Erweiterung:** `trunk/schema/page.schema.json` (Site-Enum
> um `hub` ergänzt, plus `status_hub`-Flag analog zu `status_shop`)

## Was dieser Adapter tut

Der Astro-Adapter rendert ausgewählte Trunk-Inhalte in das Sanexio-Astro-Repo
unter `sites/sanexio-github-io/repo/`. Im Unterschied zu den anderen beiden
Adaptern (`wordpress/`, `shopify/`) schreibt er **TypeScript-Data-Files**
(`src/data/*.ts`), nicht REST-API-Payloads. Astro picked die Daten beim
Build (`bun run build`) selber aus `src/data/` und rendert sie in die Astro-
Components.

## Module

```
adapters/astro/
├── README.md                 (diese Datei)
├── build.mjs                 Master — orchestriert alle Trunk→Astro-Steps
├── team-to-astro.mjs         trunk/content/team/*.yaml  → src/data/team.ts
├── pages-to-astro.mjs        trunk/content/pages/... (site=hub|shared)
│                             → src/pages/<slug>.astro (Phase 2: Skelett)
└── lib/
    ├── astro-writer.mjs      TS-/Astro-File-Output-Helper
    │                         (Auto-Generated-Header, Backup-vor-Überschreiben)
    └── renderer-registry.mjs Section-Type → Renderer-Function (Phase 2)
```

## Idempotenz & Backups

Vor jedem Schreibvorgang wird die existierende Ziel-Datei nach
`adapters/astro/.backups/<ISO-ts>_<file>.ts.bak` kopiert. Wenn der Backup-
Write fehlschlägt, wird der Sync abgebrochen — gleicher Sicherheitsmechanismus
wie im Shopify-Adapter (CW-008).

## Schema-Filter

Phase-1/2-Adapter konsumiert:
- alle `trunk/content/team/*.yaml` → `src/data/team.ts` (vollständig)
- später (Phase 2 Aufstockung): `trunk/content/pages/**/*.yaml` mit
  `site == 'hub'` oder (`site == 'shared'` und `status_hub == 'active'`)

## Verwendung

```bash
# Master-Build (schreibt alle Trunk→Astro-Outputs)
bun adapters/astro/build.mjs

# Einzel-Sync: nur Team
bun adapters/astro/team-to-astro.mjs

# Output prüfen, dann Astro bauen
cd sites/sanexio-github-io/repo && bun run build
```

Für komfortableren Top-Level-Aufruf: `tools/build-sanexio.sh` orchestriert
Adapter-Run + Astro-Build + optional Commit+Push der `dist/`-Files.

## Phasen-Roadmap (siehe Architektur-Plan 2026-05-23)

| Phase | Inhalt | Status |
|---|---|---|
| 1 | Skelett, Schema-Sanexio-Enum, build.mjs-Stub | 🟢 jetzt |
| 2 | Team-Sync + Section-Renderer-Registry | 🟢 jetzt |
| 3 | Pages-Adapter + extract-Backflow (Astro → Trunk) | ⏳ später |
| 4 | DHT-Timeline + Health-Graph typed Sections, vollständiger Page-Build | ⏳ später |

## Nicht-Ziele dieser Phase

- Kein Astro-Build (das macht `bun run build` im Sanexio-Repo selbst)
- Kein GitHub-Pages-Push (separat per `gh-pages`-Action im Sanexio-Repo)
- Keine Section-Komponenten — die Astro-Components existieren bereits im
  Sanexio-Repo. Der Adapter füllt nur ihre Data-Sources.
