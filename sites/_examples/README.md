# sites/_examples/ — Reserviert für Site-Layer-Demos (zukünftig)

> **Status 2026-05-31 (Welle 1.5c-Folgewelle):** Dieser Slot ist
> derzeit **leer und reserviert**. Der **kanonische OSS-Demo-Tenant**
> liegt unter `trunk/_examples/` — *nicht* hier.

## Wo ist der Demo-Tenant?

Der Default-Fallback der Adapter (wenn kein `CORTEX_TENANT_DIR`
gesetzt ist) zeigt auf:

```
trunk/_examples/
├── tenant.config.json
└── trunk/content/
    ├── team/{dr-example,dr-muster,dr-probe}.yaml
    ├── pages/{_shared,practice-example}/*.yaml
    └── products/example-category/example-product.yaml
```

Befüllung + Anwendung dokumentiert in
[`trunk/_examples/README.md`](../../trunk/_examples/README.md).

## Wofür wäre `sites/_examples/` dann da?

Reserviert für zukünftige **Site-Layer-Demos** — also Mini-Beispiele
für Theme-/Site-Code, nicht für Trunk-Daten. Konkret denkbare Slots:

- `sites/_examples/praxis-theme-demo/` — Minimal-WordPress-Child-Theme,
  das den WP-Adapter-Output am Ende einer Build-Pipeline rendert.
- `sites/_examples/shop-theme-demo/` — Minimal-Shopify-Liquid-Theme
  analog für den Shopify-Adapter.
- `sites/_examples/astro-site-demo/` — Astro-Site-Skelett für den
  Astro-Adapter.

Bis solche Site-Layer-Demos konkret gebraucht werden, bleibt der
Ordner leer (außer dieser README).

## Abgrenzung gegenüber `sites/sanexio-github-io/`

`sites/sanexio-github-io/` ist die **echte Sanexio-Hauptseite** (Astro,
public Repo) und bleibt als realer Tenant in Cortex-Web. Sie ist
*keine* Demo, sondern Production.

## Historie

Welle 1.5b (2026-05-31) hatte hier einen Stub angelegt, der einen
parallel-stehenden Demo-Tenant `sites/_examples/praxis-demo/`
skizzierte. Dieser Stub überschnitt sich mit dem bereits funktionierenden
`trunk/_examples/`-Konzept. Folgewelle 1.5c (2026-05-31) hat den Stub
zurückgenommen und stattdessen `trunk/_examples/` als einzige
kanonische Demo-Quelle ausgebaut.

## Querverweise

- Kanonischer Demo-Tenant: [`trunk/_examples/README.md`](../../trunk/_examples/README.md)
- Tenant-Trennungs-Helper: `tools/lib/tenant-path.{sh,mjs}`
- Framework/Tenant-Split-Pattern: `Nexus/_memory/feedback_framework_tenant_split.md`
- Cortex-Plattform Vision: `Nexus/specs/cortex-platform/00_VISION_UND_ROADMAP.md`
