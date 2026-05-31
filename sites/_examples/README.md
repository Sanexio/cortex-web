# sites/_examples/ — Demo-Tenant-Slot (OSS-Demo)

> **Status 2026-05-31:** Stub-Anlage nach Welle 1.3+1.5b
> (Stracke-Tenant-Migration nach `sanexio-tenant`). Befüllung folgt in
> eigener Demo-Tenant-Welle.

## Zweck

`sites/_examples/` ist der **Slot für öffentliche Demo-Konfigurationen**, mit
denen das Cortex-Web-Framework (Trunk + Adapter) ohne realen Tenant
lauffähig vorgeführt werden kann. Anders gesagt: hier liegt eine
**Fake-Praxis** (z.B. „Dr. Demo, Westend") mit anonymisierten Beispiel-
Inhalten, an der Contributors und Tester den Framework-Code prüfen können.

## Was hier später hineinkommt

```
sites/_examples/
├── praxis-demo/         # Beispiel-Tenant (WordPress-Adapter)
│   ├── tenant.config.json    # Demo-Konfiguration (Fake-Praxis-Daten)
│   ├── content/              # Demo-Trunk-Content (anonyme Team-/Service-/Page-YAMLs)
│   ├── media/                # Lizenzfreie Beispiel-Medien (CC0/Public-Domain)
│   └── README.md
├── juvantis-demo/       # Beispiel-Shop-Tenant (Shopify-Adapter), optional
└── README.md            (diese Datei)
```

## Abgrenzung gegenüber `sites/sanexio-github-io/`

`sites/sanexio-github-io/` ist die **echte Sanexio-Hauptseite** (Astro,
public Repo) und bleibt als realer Tenant in Cortex-Web. `sites/_examples/`
ist demgegenüber **rein didaktisch** — keine Production, keine Live-Domains,
keine echten Daten.

## Querverweise

- Migration Welle 1.3+1.5b: `Nexus/specs/cortex-platform/02_OPEN_DECISIONS_RECOMMENDATIONS.md` §10.9
- Tenant-Trennungs-Helper: `tools/lib/tenant-path.{sh,mjs}`
- Framework/Tenant-Split-Pattern: `Nexus/_memory/feedback_framework_tenant_split.md`
- Cortex-Plattform Vision: `Nexus/specs/cortex-platform/00_VISION_UND_ROADMAP.md`
