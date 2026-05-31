# Cortex-Web — Claude-Kontext

> Projekt-spezifische Instruktionen. Zusätzlich zu Nexus-Pflicht-Init
> (CLAUDE.md, AUTONOMY_CONTRACT.md, AI_COOPERATION.md, MULTI_AI_BOUNDARIES.md —
> Phoenix-Stand seit 2026-05-12).

## Projekt-Kurzbeschreibung

Cortex-Web ist seit Welle 1.3+1.5b (2026-05-26 / §10.9 final 2026-05-31)
ein **reines Framework-Repo** (OSS, `Sanexio/cortex-web`): Schemas,
Adapter, Tools, Trunk-Generika, Slot-Definitionen. Tenant-eigene Sites
liegen **nicht mehr in diesem Repo**, sondern im privaten Tenant-Repo
`Sanexio/sanexio-tenant` (Pfad-Auflösung via Helper-Trio
`tools/lib/tenant-path.{sh,mjs}`, Env-Override `CORTEX_TENANT_DIR`,
Fallback `~/.cortex/tenant-path`).

Das Framework treibt heute zwei rechtlich getrennte Stracke-Sites (im
Tenant gehostet, hier nur als Konsumenten relevant):

- **Praxis-Webseite** (`westend-hausarzt.com`) — Praxis Dr. Stracke
  - Plattform: WordPress mit Blocksy Child-Theme `praxiszentrum`
  - HWG-/Berufsordnungs-konform (keine Preise, kein Anpreisen)
  - Site-Tree: `${CORTEX_TENANT_DIR}/sites/praxis-webseite/`
- **Juvantis-Webseite** (`sanexio.eu`) — Sanexio GmbH Distribution
  - Plattform: Shopify Taste 8.0.1, Store `juvantis.myshopify.com`
  - B2C + B2B Distribution von Juvantis-Produkten (DHT, Bluttests, Body Checks)
  - Site-Tree: `${CORTEX_TENANT_DIR}/sites/juvantis-webseite/`

Die Sites bleiben formal getrennt (eigenes Impressum, eigene DSGVO,
eigene Domain, eigene Plattform). Sie teilen sich nur die **Substanz**
aus dem Trunk (Produkt-, Team-, Page-Daten; Design-Tokens; Medien) und
laufen über dieselben Framework-Adapter.

## Arbeitsprinzip — Architekten-Modus

Es gilt der **Architekten-Modus** aus
`${CORTEX_TENANT_DIR}/sites/praxis-webseite/_rules/WORKING_MODE.md`
(FK-1…FK-5, 4-Phasen-Prozess: Verständnis → Lösungsdesign → Umsetzung
→ Selbstprüfung). Keine Umsetzung ohne Spec. Keine Spec ohne Freigabe.

Bei Überschneidung: Architekten-Modus hat Vorrang vor Explorations-/Mitdenk-Impulsen.

## Pflicht-Lesung bei „Projekt fortsetzen"

1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_rules/AUTONOMY_CONTRACT.md`
3. `~/Cortex/Nexus/_rules/AI_COOPERATION.md`
4. `~/Cortex/Nexus/_rules/MULTI_AI_BOUNDARIES.md`
5. `~/Cortex/Nexus/_memory/USER.md` (Profil)
6. Diese Datei (`Cortex-Web/CLAUDE.md`)
7. `Cortex-Web/SESSION_RESUME.md`
8. `Cortex-Web/_rules/ARCHITECTURE.md`
9. `Cortex-Web/_config/RULES.md`
10. `${CORTEX_TENANT_DIR}/sites/praxis-webseite/_rules/WORKING_MODE.md`
    (Architekten-Modus — Site lebt im Tenant-Repo seit Welle 1.3)

Site-spezifisch (sobald Site-Arbeit ansteht):
- POC-Produkt-Smokes: zusätzlich `trunk/schema/product.schema.json`
- Site-Arbeiten: zusätzlich
  `${CORTEX_TENANT_DIR}/sites/<site>/SESSION_RESUME.md`

## Aktuelle Sprint-Roadmap

Siehe `_rules/ARCHITECTURE.md`. Phasen-Nummerierung 0 → 5 für Cortex-Web-Aufbau;
nach Phase 5 übernehmen die subsumierten Site-Sprints ihre eigene Nummerierung weiter.

## Verbundene Projekte

| Projekt | Zustand | Bezug zu Cortex-Web |
|---------|---------|---------------------|
| `Sanexio-Tenant/sites/praxis-webseite/` (ex `praxis-redesign`, ex `Cortex-Web/sites/`) | aktiv, im Tenant-Repo seit Welle 1.3 (2026-05-26) | Eigenes WORKING_MODE / FEHLERPROTOKOLL / Sprints; konsumiert Cortex-Web-Framework |
| `Sanexio-Tenant/sites/juvantis-webseite/` | aktiv, im Tenant-Repo seit Welle 1.3 | Eigene SESSION_RESUME + SHOPIFY_THEME_POINTER; Theme-Klon bleibt bei `Juvantis/juvantis-web/theme/` |
| `Juvantis/juvantis-web/theme/` | produktiv, unverändert | Shopify-Theme-Klon, GitHub-Remote Branch `shopify-theme`, Deploy via `${CORTEX_TENANT_DIR}/sites/juvantis-webseite/shopify-sync.sh` |
| `Juvantis/DHT`, `Juvantis/social-media` | produktiv | bleiben unter `projects/Juvantis/` |
| `Sanexio-Tenant` (Repo `Sanexio/sanexio-tenant`, privat) | aktiv | Hostet Stracke-Sites + tenant-spezifische YAML-Daten; Pfad via `CORTEX_TENANT_DIR` |
| `telegram-bridge` | produktiv | unabhängig |

## Wichtige Regeln (Top-Level)

- **Trunk ist Master** (CW-001) — Änderung im Trunk + Adapter-Run, nicht direkt in WP/Shopify
- **Schema-Validation vor Build** (CW-002)
- **Lokale Originale pflichtig** (CW-003) — jedes Medium in Shopify Files hat auch lokale Kopie
- **i18n I-2 hybrid** (CW-004) — Top-Level invariant, `.de/.en/.fr/.es` auf Unter-Feldern
- **Plattform-Trennung bleibt bestehen** (CW-005) — keine gemeinsame Kasse, keine
  Vermischung von Praxis- und Sanexio-Impressum

Details in `_config/RULES.md`.

## Hinweise für Claude

- Dr. Stracke ist Arzt, kein IT-Experte. LL-024 (WAS / WARUM / WAS BEDEUTET DAS) gilt.
- Deutsch in Output, Englisch in Code-Kommentaren.
- LL-034: Optionen mit Trade-offs, Dr. Stracke wählt selbst.
- Bei Adapter-Bugs: nie in Prod pushen. Verify-Pipeline vor jedem Deploy.
