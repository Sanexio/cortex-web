# sites/juvantis-webseite/ — Juvantis-Webseite (Shopify, sanexio.eu)

> Seit Cortex-Web Phase 5 (2026-04-19) unter Cortex-Web subsumiert.
> Theme-Klon bleibt bei `Juvantis/juvantis-web/theme/` (siehe `SHOPIFY_THEME_POINTER.md`).

## Inhalt

| Pfad | Zweck |
|------|-------|
| `shopify-sync.sh` | Deploy-Wrapper (`npx shopify theme push/pull` gegen Store `medzpoint`) |
| `shopify_export/` | ZIP-Backups historischer Theme-Stände |
| `knowledge-graph/` | Medical-Knowledge-Graph (Content-Referenz für Avatar-/DHT-Pages) |
| `SHOPIFY_THEME_POINTER.md` | Externer-Repo-Pointer (Pfad + HEAD + GitHub-Remote + Store-Metadaten) |
| `SESSION_RESUME.md` | LL-043-Einstieg für spätere Juvantis-Web-Sprints |
| `README.md` | diese Datei |

## Was hier **nicht** liegt

- **Der Theme-Code** (Liquid, CSS, JS, Assets) — der lebt bei
  `~/Cortex/projects/Juvantis/juvantis-web/theme/` mit eigenem Git-Repo und
  GitHub-Remote (Branch `shopify-theme`).
- **Rechtliche Dokumente** (Impressum, DSGVO, AGB) — noch nicht zentralisiert.
  Werden bei künftigem Content-Sprint in `Cortex-Web/trunk/content/legal/` abgelegt.
- **Produkt-Content** — liegt als Trunk-Quelle in `Cortex-Web/trunk/content/products/`
  und wird von `adapters/shopify/` in den Juvantis-Store gerendert (Phase 2 POC).

## Deploy

```bash
cd ~/Cortex/projects/Cortex-Web/sites/juvantis-webseite

# Alle geänderten Theme-Dateien pushen:
./shopify-sync.sh

# Vom Store pullen:
./shopify-sync.sh --pull

# Einzelne Datei pushen:
./shopify-sync.sh sections/juvantis-hero.liquid
```

## Quer-Verweise

- **Dach-Projekt:** `~/Cortex/projects/Cortex-Web/`
- **Praxis-Site (Schwester):** `~/Cortex/projects/Cortex-Web/sites/praxis-webseite/`
- **Juvantis-Projekt (Parent):** `~/Cortex/projects/Juvantis/` (DHT, social-media, Businessplan bleiben dort)
- **Trunk-Content:** `~/Cortex/projects/Cortex-Web/trunk/content/`
- **Shopify-Adapter:** `~/Cortex/projects/Cortex-Web/adapters/shopify/`

---

*Stand: 2026-04-19.*
