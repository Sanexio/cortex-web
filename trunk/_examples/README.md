# Cortex-Web — Beispiel-Tenant (Demo-Content)

> Dieser Ordner enthält **rein anonymisierte Beispiele**, die zeigen, wie
> Tenant-Inhalt im Cortex-Web-Trunk aussieht. Er wird NIE direkt für eine
> echte Webseite verwendet.

## Wofür ist `_examples/`?

Cortex-Web ist Framework + (heute noch) Tenant-Daten. Das Framework
soll Open Source werden, Tenant-Daten gehören in ein **separates,
privates Repo pro Tenant**. Bis diese Trennung vollzogen ist, dient
`_examples/` zwei Zwecken:

1. **Demo für externe Nutzer**: Wer Cortex-Web klont, sieht hier sofort,
   in welchem Format Team-Profile, Pages und Produkte angelegt werden —
   ohne private Daten von anderen Tenants zu sehen.
2. **Default für Adapter-Tests**: Wenn keine `CORTEX_TENANT_DIR`-ENV-
   Variable gesetzt ist, fallen Adapter auf `trunk/_examples/` zurück.
   So lässt sich der Adapter-Build immer demonstrieren, auch ohne
   echte Tenant-Daten.

## Aufbau

```
trunk/_examples/                 ← „Pseudo-Tenant-Root" für Demo
├── README.md                    ← diese Datei
└── trunk/                       ← spiegelt Tenant-Repo-Struktur
    └── content/
        ├── team/dr-example.yaml
        ├── pages/praxis-example/standorte.yaml
        └── products/example-category/example-product.yaml
```

Die Pfad-Struktur unter `_examples/trunk/` ist identisch zur künftigen
Tenant-Repo-Struktur (`Sanexio-Tenant/trunk/content/…`). Der Pfad-Resolver
`tools/lib/tenant-path.sh` löst `tenant_path trunk/content/team` in beiden
Modi konsistent auf:
- Demo-Modus: `<cortex-web-repo>/trunk/_examples/trunk/content/team`
- Tenant-Modus: `<tenant-repo>/trunk/content/team`

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
für das vollständige Konzept. Diese Beispiele sind Welle 1.1 der
5-stufigen Migration.
