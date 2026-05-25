# Cross-Site-Transfer — Architektur

> **Status:** Spec (Phase 2, Lösungsdesign) — 2026-04-22
> **Freigabe Tenant-Operator:** „Bereite zukünftige Transfers architektonisch vor" (2026-04-22)
> **Scope:** Architektur-Skelett, nicht vollständige Implementierung
> **Related:** `SPEC.md` content-bridge-v1 (bereits live), `docs/cross-site-transfer.md`

---

## 1. Grundprinzipien

### 1.1 Trunk als alleinige Brücke (CW-001 verschärft)

Jeder Transfer zwischen den beiden Sites läuft **zwingend** über den Trunk.
**Keine** direkten Site-zu-Site-Kopiervorgänge. Gründe:

- HWG-Trennung bleibt schema-erzwungen (CW-005)
- Single Source of Truth — auch bei rückwärtigen Extraktionen
- Versionierbarkeit (Git-Historie im Trunk)
- Auditierbarkeit (jeder Transfer hinterlässt ein Trunk-Artefakt)

### 1.2 Gerichteter, expliziter Transfer

Jeder Transfer ist ein **benannter, von Tenant-Operator bewusst ausgelöster Befehl**.
**Kein** Auto-Sync. **Kein** Webhook-basiertes Live-Mirroring. Der Zustand der
Sites kann jederzeit vom Trunk abweichen — das ist gewollt.

### 1.3 Bidirektional, aber nie gleichzeitig

Transfers laufen **entweder** Site→Trunk (Extraktion) **oder** Trunk→Site
(Rendering). Kein Two-Way-Merge, keine Konflikt-Auflösung.

### 1.4 Idempotenz

Jeder Trunk→Site-Transfer ist idempotent. Zweimal derselbe Befehl → selber
End-Zustand, kein Drift. Shopify und WordPress beide verhalten sich diff-aware,
wenn wir sauber Lookup→Create-or-Update pushen (empirisch bewiesen in Lauf 1+2
der Ueber-Uns-Bridge).

### 1.5 Vor jedem überschreibenden Push: Backup

Jeder Trunk→Site-Transfer, der existierende Daten überschreibt, legt vorher ein
lokales Backup an (`adapters/shopify/.backups/<ts>_<key>` resp. WP-Äquivalent).
Rollback = zurückspielen des Backups.

---

## 2. Transfer-Matrix

Die vollständige Matrix der möglichen Transfer-Arten und ihr aktueller
Implementierungs-Stand:

### 2.1 Nach Quelle × Ziel

|   | → Trunk | → WordPress | → Shopify |
|---|---|---|---|
| **von WordPress** | P-Extract-WP (🟡 Skelett) | n/a | → über Trunk |
| **von Shopify** | P-Extract-Shopify (🟡 Skelett) | → über Trunk | n/a |
| **von Trunk** | n/a | P-Render-WP (🟢 teilweise) | P-Render-Shopify (🟢 live) |

Legende: 🟢 produktiv · 🟡 Skelett vorhanden · 🔴 nicht gebaut

### 2.2 Nach Inhaltstyp × Richtung

|   | Content | Design (Tokens) | Funktion (Komponenten) |
|---|---|---|---|
| **Trunk → WP** | 🟢 Page-Adapter (Pages) · 🟡 Template-Adapter (nicht gebaut) | 🔴 | 🔴 |
| **Trunk → Shopify** | 🟢 `sync-page-shopify.sh` (body_html) | 🟢 `sync-template-shopify.sh` (template.json über Section-Blocks) | 🟡 indirekt (via Custom-Section) |
| **WP → Trunk** | 🟡 Skelett `extract-wp-page.mjs` | 🔴 | 🔴 |
| **Shopify → Trunk** | 🟡 Skelett `extract-shopify-page.mjs` | 🟡 Skelett `extract-shopify-template.mjs` | 🔴 |

---

## 3. Naming Conventions

### 3.1 Shell-Tools

| Muster | Bedeutung | Beispiel |
|---|---|---|
| `tools/sync-<artifact>-<target>.sh` | Trunk → Site-Push | `sync-page-shopify.sh`, `sync-template-shopify.sh` |
| `tools/extract-<artifact>-<source>.sh` | Site → Trunk-Pull | `extract-page-shopify.sh` |
| `tools/diff-<artifact>-<target>.sh` | Trunk vs. Site (read-only) | `diff-template-shopify.sh` (geplant) |
| `tools/cw-transfer` | Meta-Orchestrator (push/pull/diff/list) | `cw-transfer push shopify:page trunk/…/ueber-uns.yaml` |

### 3.2 Adapter-Module

Pro `<source> × <artifact-type>` gibt es genau einen Extractor bzw. Renderer:

| Muster | Bedeutung | Beispiel |
|---|---|---|
| `adapters/<target>/build-<artifact>.mjs` | Trunk-YAML → Payload (stdout) | `adapters/shopify/build-page.mjs`, `build-template.mjs` |
| `adapters/<target>/<artifact>-to-<target>.mjs` | Payload (stdin) → API-Call | `adapters/shopify/pages-to-shopify.mjs`, `template-to-shopify.mjs` |
| `adapters/<target>/lib/renderers/<section-type>-<view>.mjs` | Section-spezifischer Renderer | `page-juvantis.mjs`, `template-juvantis-ueber-uns.mjs` |
| `adapters/<source>/extract-<artifact>.mjs` | Site-API → Trunk-Proto-JSON (stdout) | `adapters/shopify/extract-page.mjs`, `extract-template.mjs` |
| `adapters/<source>/lib/extractors/<section-type>-<view>.mjs` | Section-spezifischer Extraktor | (geplant) |

### 3.3 Trunk-Pfade

| Trunk-Pfad | Bedeutung |
|---|---|
| `trunk/content/pages/_shared/<id>.yaml` | Page, beide Sites |
| `trunk/content/pages/praxis/<id>.yaml` | Page, nur Praxis |
| `trunk/content/pages/juvantis/<id>.yaml` | Page, nur Juvantis |
| `trunk/content/team/<slug>.yaml` | Team-Member (shared) |
| `trunk/content/products/<category>/<id>.yaml` | Produkt (Juvantis-primär, Praxis-Info) |
| `trunk/content/legal/<id>.md` | Impressum, DSGVO, AGB (pro Site separat) |
| `trunk/design/tokens.json` (geplant) | Design-Tokens (shared master) |
| `trunk/design/tokens-<site>.json` (geplant) | Pro-Brand-Overrides |
| `trunk/design/components/<name>/spec.md` (geplant) | Komponenten-Specs |

---

## 4. Registry-Pattern

### 4.1 Renderer-Registry

**Problem:** Welcher Renderer wird für welche Trunk-Content-Datei benutzt?

**Lösung:** `adapters/<target>/lib/renderer-registry.mjs` mit zentraler Map.
Lookup-Schlüssel: `(target, artifact-type, view)`.

```js
// Beispiel-Signatur
export const RENDERER_REGISTRY = {
  "shopify.page.juvantis":               renderPageJuvantis,
  "shopify.template.juvantis-ueber-uns": renderTemplateJuvantisUeberUns,
  "shopify.product.juvantis":            renderProductJuvantis,
  "wordpress.page.praxis":               renderPagePraxis,        // geplant
  "wordpress.product.praxis":            renderProductPraxis,     // exists
};
```

Build-Scripts dispatchen nicht mehr per `switch`, sondern per Registry-Lookup
basierend auf dem `views.<view>.renderer`-Feld in der YAML (oder einem sinnvollen
Default für bekannte Page-IDs).

### 4.2 Extractor-Registry

Analog für Extraktions-Richtung. Lookup-Schlüssel: `(source, artifact-type, section-type)`.

```js
export const EXTRACTOR_REGISTRY = {
  "shopify.page":                      extractShopifyPage,
  "shopify.template.juvantis-ueber-uns": extractTemplateJuvantisUeberUns,  // geplant
  "wordpress.page":                    extractWpPage,
  "wordpress.theme-file":              extractWpThemeFile,                  // geplant
};
```

### 4.3 Warum Registry statt Switch

- **Neuer Renderer = ein Eintrag + ein Modul**, kein Build-Script-Edit nötig
- Testbarkeit: Registry-Tabelle ist die Auflistung aller unterstützten Transfers
- Self-Documenting: `cw-transfer list` kann die Tabelle ausgeben

---

## 5. Das `cw-transfer` Orchestrator-CLI

Ein Meta-Befehl, der alle Transfers verbform einheitlich ausführt:

```bash
# Trunk → Site (push)
cw-transfer push shopify:page     trunk/content/pages/_shared/ueber-uns.yaml
cw-transfer push shopify:template trunk/content/pages/_shared/ueber-uns.yaml
cw-transfer push wp:page          trunk/content/pages/_shared/ueber-uns.yaml

# Site → Trunk (pull)
cw-transfer pull shopify:page     uber-uns        # by handle
cw-transfer pull shopify:template page.uber-uns   # by template-name
cw-transfer pull wp:page          9670            # by id, or by slug "team"

# Read-only Vergleich
cw-transfer diff  shopify:template trunk/content/pages/_shared/ueber-uns.yaml

# Listet alle konfigurierten Transfers (Registry dump)
cw-transfer list
```

**Dispatch:** Der Orchestrator ruft intern die bereits existierenden
`sync-*.sh`-/`extract-*.sh`-Tools auf. Kein neuer API-Code, nur zusätzliches
UI-Verb-Layer für Konsistenz und Entdeckbarkeit.

---

## 6. Extraktions-Pipeline (Site → Trunk)

### 6.1 Generischer Ablauf

```
[Site-API] → [Extract-Modul]
            → (stdout: Proto-Trunk-JSON)
            → [jq/yq/Hand] → kurratierter Trunk-YAML
            → (git add, commit)
```

Wichtig: Der Extractor schreibt **niemals direkt** in `trunk/`. Stattdessen gibt
er Proto-JSON aus, das Tenant-Operator (oder Claude) **bewusst** in eine YAML
überführt — inklusive Kuration, Schema-Anpassung, i18n-Split.

### 6.2 Warum kein Direct-Overwrite des Trunks

- Extraktionen sind typischerweise verlustbehaftet: Shopify-HTML → strukturierte Sections → manuelle Rekonstruktion der Semantik
- Mojibake, unkonventionelle Encodings, Legacy-Metadaten müssen gesichtet werden
- Der Trunk ist SSoT — was da landet, muss schema-konform sein

### 6.3 Workflow-Beispiel: Shopify-Page → Trunk

```bash
cw-transfer pull shopify:page uber-uns > /tmp/uber-uns.proto.json
# inspect
jq '.title, .body_html | length' /tmp/uber-uns.proto.json
# manually curate into trunk YAML
$EDITOR trunk/content/pages/_shared/ueber-uns.yaml
bash tools/validate.sh
git add trunk/content/pages/_shared/ueber-uns.yaml
git commit -m "content: refresh ueber-uns from shopify"
```

---

## 7. Rollback-Strategie

Jeder Trunk→Site-Push, der ein bestehendes Asset überschreibt, legt ein Backup:

| Plattform | Was wird gebackupt | Ort |
|---|---|---|
| Shopify Page (body_html) | vorheriger body_html + title | `adapters/shopify/.backups/<ts>_page_<handle>.json` (geplant, noch nicht erzwungen) |
| Shopify Template-Asset | vorheriges JSON | `adapters/shopify/.backups/<ts>_theme<id>_templates_page.<slug>.json` ✅ (implementiert) |
| Shopify Section-Liquid | vorheriges Liquid | gleiches Schema (geplant) |
| WordPress Page (REST) | vorheriger post_content + meta | `adapters/wordpress/.backups/<ts>_wp-page-<id>.json` (geplant) |

**Rollback per Hand:** Backup-Datei lesen, per PUT zurückschreiben. Der
Orchestrator kann später ein `cw-transfer rollback <target> <backup-path>`
anbieten (nicht jetzt gebaut).

---

## 8. Sicherheits-Guards (was der Orchestrator verhindert)

| Guard | Zweck |
|---|---|
| `ALLOW_OVERWRITE=1` Pflicht bei `published_at != null` (Shopify) | Verhindert unbeabsichtigtes Überschreiben live-sichtbarer Pages |
| `published: false` hardcoded im Page-Adapter | CW-001-Roundtrip: Admin-Edits werden beim nächsten Sync re-gedrafted |
| Schema-Validation VOR API-Push | CW-002 — keine broken Writes |
| Backup vor destruktivem Write | CW-008 (neu, siehe `RULES.md`) |
| HWG-View-Trennung (praxis vs juvantis) | CW-005 |

---

## 9. Was NICHT gebaut wird (bewusst out-of-scope)

| Nicht-Ziel | Warum |
|---|---|
| Auto-Sync / Webhooks | Widerspricht Tenant-Operators Entscheidung (explizit, gerichtet) |
| Two-Way-Merge | CW-001-Verletzung; Konflikt-Auflösung ist eigenes Problem |
| Live-Preview der Trunk-YAML | Pre-Commit-Hooks + Self-Check sind ausreichend |
| Team-Collaboration-Workflows | Tenant-Operator ist alleiniger Editor (R-001 Juvantis) |
| Multi-Environment (staging/prod) | Shopify = single live theme; WP-Local = Prod-Staging-Proxy |

---

## 10. State-of-Play (2026-04-22, Ende der Architektur-Session)

| Baustein | Ort | Stand |
|----------|-----|-------|
| **Specs** | `specs/cross-site-transfer/{ARCHITECTURE,PATTERNS}.md` | ✅ diese Session |
| **Trunk-Content** | `trunk/content/pages/_shared/ueber-uns.yaml`, 8× `team/*.yaml` | ✅ content-bridge-v1 |
| **Schemas** | `trunk/schema/page.schema.json`, `team-member.schema.json` | ✅ content-bridge-v1 |
| **Shopify Content-Push** | `adapters/shopify/build-page.mjs`, `pages-to-shopify.mjs` | ✅ produktiv |
| **Shopify Template-Push** | `adapters/shopify/build-template.mjs`, `template-to-shopify.mjs` | ✅ produktiv |
| **Shopify Product-Push** | `adapters/shopify/build.mjs`, `products-to-shopify.mjs` | ✅ produktiv |
| **WP Page-Push** | `adapters/wordpress/content-to-wp-pages.mjs` | ✅ (Products→Pages) |
| **WP Template-Push** | `adapters/wordpress/template-*` | 🔴 nicht gebaut |
| **Shopify Extract-Page** | `adapters/shopify/extract-page.mjs` | 🟡 Skelett diese Session |
| **Shopify Extract-Template** | `adapters/shopify/extract-template.mjs` | 🟡 Skelett diese Session |
| **WP Extract-Page** | `adapters/wordpress/extract-page.mjs` | 🟡 Skelett diese Session |
| **Renderer-Registry** | `adapters/shopify/lib/renderer-registry.mjs` | 🟡 Skelett diese Session |
| **Extractor-Registry** | `adapters/shopify/lib/extractor-registry.mjs`, `adapters/wordpress/lib/extractor-registry.mjs` | 🟡 Skelett diese Session |
| **`cw-transfer` CLI** | `tools/cw-transfer` | 🟡 Skelett diese Session |
| **Backup vor Template-Push** | in `template-to-shopify.mjs` | ✅ implementiert |
| **Rollback-Automatik** | — | 🔴 nicht gebaut |
| **Design-Token-Transfer** | `trunk/design/*` | 🔴 vorbereitet, nicht aktiv |
| **Komponenten-Specs** | `trunk/design/components/*` | 🔴 vorbereitet, nicht aktiv |

---

## 11. Roadmap

### Phase C1 (Content) — ✅ **abgeschlossen 2026-04-22**
- Content-Bridge v1 (page.content)
- Template-Bridge Option B (template.json mit Section-Blocks)
- Ueber-Uns produktiv auf <distribution-domain>

### Phase C2 (Content, rückwärts) — ⏳ offen
- Extraktions-Tools ausbauen (Proto-JSON → kuratierter YAML)
- Pattern-Library für WP-Theme-Scraping (Template-Logik extrahieren)
- Erster rückwärtiger Use-Case: Shopify-Impressum → Trunk → Praxis-WP

### Phase D (Design) — ⏳ offen
- `trunk/design/tokens.json` schema + initial Extraction aus `<tenant-theme>/tokens.css`
- `adapters/wordpress/tokens-to-wp-css.mjs`
- `adapters/shopify/tokens-to-liquid.mjs`
- Design-Master-Frage: Praxis / Juvantis / Neutral? (Tenant-Operator entscheidet)

### Phase F (Funktion / Komponenten) — ⏳ offen
- `trunk/design/components/<name>/spec.md` + `reference.html`
- Adapter: Spec → Liquid-Section + WP-Partial
- Erster Use-Case: `team-grid` Component (Praxis `/team/` + Juvantis `/uber-uns`)

---

*Erstellt 2026-04-22 in content-bridge-v1 + Template-Bridge-Session.
Operator-Freigabe: architektonische Vorbereitung bidirektionaler Transfers.*
