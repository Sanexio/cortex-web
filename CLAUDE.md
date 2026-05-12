# Cortex-Web — Claude-Kontext

> Projekt-spezifische Instruktionen. Zusätzlich zu Nexus-Pflicht-Init
> (CLAUDE.md, AUTONOMY_CONTRACT.md, AI_COOPERATION.md, MULTI_AI_BOUNDARIES.md —
> Phoenix-Stand seit 2026-05-12).

## Projekt-Kurzbeschreibung

Cortex-Web ist das Dach-Projekt für zwei rechtlich getrennte Webseiten, die sich
einen gemeinsamen Content-, Design- und Medien-Trunk teilen:

- **Praxis-Webseite** (`westend-hausarzt.com`) — Praxis Dr. Stracke & Kollegen
  - Plattform: WordPress mit Blocksy Child-Theme `praxiszentrum`
  - HWG-/Berufsordnungs-konform (keine Preise, kein Anpreisen)
- **Juvantis-Webseite** (`sanexio.eu`) — Sanexio GmbH Distribution
  - Plattform: Shopify Taste 8.0.1, Store `juvantis.myshopify.com` (öffentliche Domain: `sanexio.eu`)
  - B2C + B2B Distribution von Juvantis-Produkten (DHT, Bluttests, Body Checks)

Die Webseiten bleiben formal getrennt (eigenes Impressum, eigene DSGVO, eigene
Domain, eigene Plattform). Sie teilen sich nur ihre **Substanz**:
Produktdaten, Team-Infos, gemeinsame Seiten (Partnerpraxis, DHT-Erklärung),
Design-Tokens, Medien.

## Arbeitsprinzip — Architekten-Modus

Es gilt der **Architekten-Modus aus `sites/praxis-webseite/_rules/WORKING_MODE.md`**
(FK-1…FK-5, 4-Phasen-Prozess: Verständnis → Lösungsdesign → Umsetzung → Selbstprüfung).
Keine Umsetzung ohne Spec. Keine Spec ohne Freigabe.

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
10. `sites/praxis-webseite/_rules/WORKING_MODE.md` (Architekten-Modus)

Phasen-spezifisch (siehe SESSION_RESUME.md):
- Phase 1/2 POC: zusätzlich `trunk/schema/product.schema.json` und das POC-Produkt
- Phase 4/5 Subsumierung: zusätzlich `sites/<site>/SESSION_RESUME.md` nach Umzug

## Aktuelle Sprint-Roadmap

Siehe `_rules/ARCHITECTURE.md`. Phasen-Nummerierung 0 → 5 für Cortex-Web-Aufbau;
nach Phase 5 übernehmen die subsumierten Site-Sprints ihre eigene Nummerierung weiter.

## Verbundene Projekte

| Projekt | Zustand | Bezug zu Cortex-Web |
|---------|---------|---------------------|
| `sites/praxis-webseite/` (ex `praxis-redesign`) | Sprint 2 aktiv, in Cortex-Web subsumiert 2026-04-19 | Eigenes WORKING_MODE / FEHLERPROTOKOLL / Sprints |
| `sites/juvantis-webseite/` | Docs subsumiert 2026-04-19 (Phase 5) | Eigene SESSION_RESUME + SHOPIFY_THEME_POINTER; Theme-Klon bleibt bei `Juvantis/juvantis-web/theme/` |
| `Juvantis/juvantis-web/theme/` | produktiv, unverändert | Shopify-Theme-Klon, GitHub-Remote Branch `shopify-theme`, Deploy via `sites/juvantis-webseite/shopify-sync.sh` |
| `Juvantis/DHT`, `Juvantis/social-media` | produktiv | bleiben unter `projects/Juvantis/` |
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
