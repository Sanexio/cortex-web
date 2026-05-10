# Theme-Workflow Juvantis-Web

> Pflicht-Lese vor jedem Theme-Edit. Stand: 2026-05-10.
> Begleitspec: `SHOPIFY_THEME_POINTER.md` (warum Theme physisch bei `Juvantis/`).

---

## TL;DR — der typische Edit

```bash
# 1. Vorher: aktuellen Live-Stand ziehen (Shopify hat Vorrang, R-006)
~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/shopify-sync.sh --pull

# 2. Editieren in Cursor / Claude Code
cursor ~/Cortex/projects/Juvantis/juvantis-web/theme/sections/header.liquid

# 3. Nach Edit: nur die geänderten Dateien pushen
~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/shopify-sync.sh

# 4. Live verifizieren
open https://sanexio.eu/
```

Es gibt **keinen Auto-Sync-Hook auf Cluster-Mini-02** (war Praxis-Mac-historisch).
Auf diesem Gerät ist der Push immer manuell — keine Tool-Edits gehen ohne
expliziten `shopify-sync.sh`-Aufruf live.

---

## Ein-Satz-Topologie

| Was | Wo |
|-----|----|
| Theme-Klon (Liquid, Assets, Settings) | `~/Cortex/projects/Juvantis/juvantis-web/theme/` |
| Deploy-Skript | `~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/shopify-sync.sh` |
| Knowledge-Graph + Theme-Export-ZIP | `~/Cortex/projects/Cortex-Web/sites/juvantis-webseite/` |
| Trunk-Content (Produkte, Pages, Media) | `~/Cortex/projects/Cortex-Web/trunk/content/` |
| Adapter Trunk → Shopify | `~/Cortex/projects/Cortex-Web/adapters/shopify/` |

Der Trunk-Content geht **nicht** über `shopify-sync.sh` live, sondern über die
Adapter-Pipeline (`build.mjs` + `products-to-shopify.mjs`).

---

## Skript-Modi

```bash
# Pull: Live → lokal. IMMER vor jedem neuen Edit-Block (R-006).
shopify-sync.sh --pull

# Push alle changed/untracked Theme-Dateien (per git diff erkannt)
shopify-sync.sh

# Push einzelne Datei(en)
shopify-sync.sh sections/header.liquid templates/index.json
```

Whitelist im Skript: `.liquid|.json|.css|.js|.glb|.gltf|.png|.jpe?g|.webp|.svg|.mp4|.webm|.woff2?|.ttf|.otf`.
Andere Erweiterungen werden ignoriert.

---

## Trennlinie: Theme-Edit vs. Trunk-Content-Edit

| Gegenstand | Pfad | Deploy via |
|------------|------|------------|
| Liquid-Section, Snippets, Assets, Settings | `Juvantis/juvantis-web/theme/` | `shopify-sync.sh` |
| Produkt-Daten (Beschreibung, Preis, SKU) | `Cortex-Web/trunk/content/products/<kat>/<id>.yaml` | `bun adapters/shopify/build.mjs … \| bun adapters/shopify/products-to-shopify.mjs` |
| Shopify-Pages (z. B. Body Checks Übersicht) | `Cortex-Web/trunk/content/pages/_shared/<id>.yaml` | `bun adapters/shopify/pages-to-shopify.mjs` |
| Media (Bilder im CDN) | `Cortex-Web/trunk/media/registry.yaml` + `Cortex-Web/_media-source/` | `tools/mirror-shopify-images.sh` (CDN→lokal) bzw. künftig Upload-Skript |

CW-001: Trunk ist Master für **Produkte und Pages**. Theme-Layout darf direkt am Theme-Klon editiert werden.

---

## Häufige Fehler (Lessons Learned)

1. **Kein Pull vor Edit** → Local überschreibt einen Live-Edit aus Admin (R-006).
   Mitigation: immer `--pull` vor neuen Sessions.
2. **Pushen aus dem falschen CWD.** Skript wechselt selbst in `$THEME_DIR`,
   aber `npx shopify` würde aus einem Nicht-Theme-CWD scheitern. Skript verwenden,
   nicht direkt `shopify theme push`.
3. **`source ~/.nvm/nvm.sh` vergessen.** Skript macht es selbst. Wer manuell
   pusht, muss es selbst tun (R-007).
4. **Template-Änderungen über GitHub-Sync.** Die Shopify-GitHub-Integration
   pullt Template-Änderungen NICHT bidirektional zuverlässig ein (R-005).
   Templates immer per `shopify-sync.sh` direkt pushen.
5. **Trunk-Edit ohne Adapter-Run.** Eine Änderung in `trunk/content/products/...yaml`
   landet erst nach `build.mjs | products-to-shopify.mjs` im Store.

---

## Rollback

```bash
# Letzten Live-Stand zurückziehen (überschreibt lokale Edits — Vorsicht):
shopify-sync.sh --pull

# Im Theme-Repo direkt:
cd ~/Cortex/projects/Juvantis/juvantis-web/theme
git log --oneline -10
git checkout <hash> -- <pfad>
shopify-sync.sh <pfad>
```

Theme-Backup-ZIPs liegen in `Cortex-Web/sites/juvantis-webseite/shopify_export/`.

---

## Voraussetzungen einmalig

- Shopify CLI installiert (`npm install -g @shopify/cli`).
- Erste Authentifizierung: `npx shopify login --store medzpoint`. Token wird
  im Keychain abgelegt.
- `.env.local` in `Cortex-Web/` mit `SHOPIFY_STORE` + `SHOPIFY_ADMIN_TOKEN`
  (für Adapter-Push, NICHT für `shopify-sync.sh`).

---

*Workflow-Tutorial erstellt 2026-05-10 als Erfüllung des P2-Tasks aus
`SESSION_RESUME.md`.*
