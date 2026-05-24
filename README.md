# Cortex-Web

> **Trunk + Adapter Framework** für die Cortex-Plattform-Schicht.
> Ein generischer Content-Trunk wird über Plattform-Adapter (WordPress,
> Shopify, Astro, später iOS) in mehrere getrennte Webseiten ausgeliefert.
>
> **Idee in einem Satz:** Inhalt einmal pflegen, Adapter rendern
> plattform-spezifisch — mit klarer Tenant-Trennung.

## Architektur

```
┌──────────────────────────────────────────┐
│  Tenant-Repo (z.B. Sanexio-Tenant)        │
│  trunk/content/                            │
│    ├─ team/                                │
│    ├─ pages/                               │
│    ├─ products/                            │
│    └─ legal/                               │
│  sites/<tenant-site>/                      │
└────────────────┬─────────────────────────┘
                 │  (CORTEX_TENANT_DIR)
                 ▼
┌──────────────────────────────────────────┐
│  Cortex-Web (dieses Repo)                  │
│  trunk/schema/  — JSON-Schemas             │
│  trunk/_examples/  — Demo-Tenant           │
│  adapters/                                 │
│    ├─ wordpress/  → WP-Pages               │
│    ├─ shopify/    → Shopify-Templates      │
│    ├─ astro/      → statische Sites        │
│    └─ ios/        → (geplant)              │
│  tools/   — Validate, Sync, Promote, Mirror│
│  _integration-slots/  — Tool-Aufnahme      │
└──────────────────────────────────────────┘
```

**Cortex-Web enthält keine Tenant-Daten.** Echter Tenant-Inhalt
(Praxis-Profile, Site-Konfigurationen, Medien) lebt in einem **separaten**
Repo pro Tenant und wird zur Build-Zeit über die Umgebungs-Variable
`CORTEX_TENANT_DIR` eingebunden.

## Quickstart (Demo-Modus)

Ohne Tenant-Repo läuft alles gegen `trunk/_examples/` — anonymisierte
Demo-Inhalte, die zeigen, in welchem Schema Team-Profile, Pages und
Produkte angelegt werden.

```bash
git clone git@github.com:Sanexio/cortex-web.git
cd cortex-web
bun install   # falls Adapter-Dependencies gebraucht werden

# Demo-Lauf des Team-Adapters (liest aus trunk/_examples/)
bun adapters/wordpress/build-team.mjs
```

Output:
```
[build-team] Tenant: trunk/_examples (Demo-Fallback)
[build-team] TEAM_DIR=…/trunk/_examples/trunk/content/team
{ "asset": { … }, "meta": { "source_count": 1 } }
```

## Eigenen Tenant aufsetzen

1. Eigenes (privates) Repo anlegen, das die Tenant-Repo-Struktur spiegelt:

   ```
   <my-tenant>/
   ├── trunk/
   │   ├── content/{team,pages,products,legal}/
   │   ├── media/
   │   └── design/
   └── sites/<my-site>/
   ```

2. ENV-Variable setzen (in `~/.zshrc` oder `~/.bashrc`):

   ```bash
   export CORTEX_TENANT_DIR=$HOME/path/to/<my-tenant>
   ```

3. Adapter laufen lassen — sie lesen jetzt aus deinem Tenant statt aus
   den Demo-Beispielen.

Vollständige Anleitung: siehe Tutorial `_tutorials/cortex-web/05-tenant-trennung.md`
im Sanexio-Nexus-Repo (Plattform-Tutorials werden später unter
`docs.cortex-plattform.org` veröffentlicht).

## Plattform-Kontext

Cortex-Web ist **das erste** Anwendungs-Projekt des **Cortex-Layer**
in der Sanexio-Cortex-Plattform-Architektur. Weitere Projekte folgen.

Vision + Roadmap + Split-ADR liegen im Sanexio-Nexus-Repo unter
`specs/cortex-platform/` (nicht öffentlich; Auszüge werden bei
OSS-Launch unter `docs.cortex-plattform.org` veröffentlicht).

## Mitarbeit

Beiträge willkommen — siehe [CONTRIBUTING.md](./CONTRIBUTING.md).

Für die Aufnahme neuer Adapter oder Sub-Tools wird das
**Integration-Slot-System** genutzt (`_integration-slots/`), das einen
Vertrag + Härtungs-Prozess vor jeder Trunk-Aufnahme verlangt.

## Lizenz

Apache License 2.0 — siehe [LICENSE](./LICENSE).

## Eigentümer / Kuration

Sanexio GmbH ([sanexio.eu](https://sanexio.eu)) kuratiert den
Upstream-Branch. PRs werden im üblichen GitHub-Flow gereviewt.
