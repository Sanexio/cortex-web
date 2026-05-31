# Cortex-Web — Beispiel-Tenant (Demo-Content)

> Dieser Ordner enthält **rein anonymisierte Beispiele**, die zeigen, wie
> Tenant-Inhalt im Cortex-Web-Trunk aussieht. Er wird NIE direkt für eine
> echte Webseite verwendet.

## Wofür ist `_examples/`?

Cortex-Web ist seit Welle 1.3+1.5b (Mai 2026) ein reines
Framework-Repo — Tenant-Daten leben in einem separaten Tenant-Repo
(z.B. `Sanexio/sanexio-tenant`). `trunk/_examples/` ist der
**kanonische Demo-Tenant**, der zwei Zwecken dient:

1. **Demo für externe Nutzer**: Wer Cortex-Web klont, sieht hier sofort,
   in welchem Format Team-Profile, Pages, Produkte und Legal-Pages
   angelegt werden — ohne private Daten anderer Tenants zu sehen.
2. **Default-Fallback der Adapter**: Wenn keine `CORTEX_TENANT_DIR`-ENV-
   Variable gesetzt ist (und kein `~/.cortex/tenant-path`-Fallback
   existiert), fallen Adapter automatisch auf `trunk/_examples/`
   zurück. So lässt sich der Build immer demonstrieren — auch ohne
   echte Tenant-Daten.

## Aufbau

```
trunk/_examples/                          ← „Pseudo-Tenant-Root" für Demo
├── README.md                             ← diese Datei
├── tenant.config.json                    ← funktionale Tenant-Konstanten
└── trunk/                                ← spiegelt Tenant-Repo-Struktur
    └── content/
        ├── team/
        │   ├── dr-example.yaml           ← Allgemeinmedizin, accent: ink
        │   ├── dr-muster.yaml            ← Innere Medizin, drei Sprachen (de/en/fr)
        │   └── dr-probe.yaml             ← Kinderheilkunde, minimaler Schema-Bestand
        ├── pages/
        │   ├── _shared/
        │   │   ├── leistungen.yaml       ← Hub-Page (build-page-hub-Demo)
        │   │   └── impressum.yaml        ← Legal-Page-Schema-Beispiel
        │   └── practice-example/
        │       └── standorte.yaml        ← Practice-Page mit Gutenberg-Blocks
        └── products/
            └── example-category/
                └── example-product.yaml  ← Produkt mit views.{shop,practice}
```

Die Pfad-Struktur unter `_examples/trunk/` ist identisch zur produktiven
Tenant-Repo-Struktur (`<tenant>/trunk/content/…`). Der Pfad-Resolver
`tools/lib/tenant-path.{sh,mjs}` löst `tenant_path trunk/content/team`
in beiden Modi konsistent auf:

- **Demo-Modus:** `<cortex-web-repo>/trunk/_examples/trunk/content/team`
- **Tenant-Modus:** `<tenant-repo>/trunk/content/team`

## Demo-Lauf

```bash
# Adapter laufen lassen, Demo-Modus erzwingen (überschreibt evtl. ~/.cortex/tenant-path):
CORTEX_TENANT_DIR="$PWD/trunk/_examples" bun adapters/wordpress/build-team.mjs
CORTEX_TENANT_DIR="$PWD/trunk/_examples" bun adapters/wordpress/build-page-hub.mjs

# Schema-Validierung gegen Demo:
CORTEX_TENANT_DIR="$PWD/trunk/_examples" bash tools/validate.sh
```

## Was hier NICHT hingehört

- Echte Personen-Daten (auch nicht „fast anonym" — kein Name aus dem Telefonbuch)
- Echte Adressen
- Echte Bild-URLs/Medien-IDs
- Echte Preise / SKUs
- Branding/Identity eines echten Tenants
- Aktuelles Datum, das einen Tenant identifizierbar macht

Wenn etwas davon hier auftaucht, ist es ein Bug — bitte als Issue im
Cortex-Web-Repo melden.

## Beziehung zum Tenant-Trennungs-Plan

Siehe `specs/cortex-platform/01_CORTEX_WEB_SPLIT.md` (im Nexus-Repo)
für das vollständige Konzept. `trunk/_examples/` entstand in Welle 1.1
der 5-stufigen Plattform-Split-Migration und wurde in Welle 1.5c
(2026-05-31) zum kanonischen Phase-4-OSS-Demo-Tenant ausgebaut.
