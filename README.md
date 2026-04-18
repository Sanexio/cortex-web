# Cortex-Web

> Common Trunk + Adapter für `westend-hausarzt.com` (WordPress) und `sanexio.eu` (Shopify).
>
> **Idee in einem Satz:** Inhalt einmal pflegen, Adapter rendern plattform-spezifisch.

## Status

**Phase 0 abgeschlossen** (Skelett, Konfig, Regel-Infrastruktur, Nexus-Eintragung).
Nächste Phase: POC WordPress-Adapter. Siehe `SESSION_RESUME.md` für Status.

## Struktur (Kurz)

```
trunk/        ← plattform-unabhängig (Content, Design, Schemas, Media-Registry)
_media-source/← lokale Original-Medien (git-ignoriert)
adapters/     ← plattform-spezifisch (wordpress, shopify, ios)
tools/        ← validate, sync, verify
sites/        ← (ab Phase 4) subsumierte Webseiten-Projekte
_config/      ← Regeln, Fehlerprotokoll, Workflow-Checklist
_rules/       ← Architektur, Pre-Flight, Working-Mode-Referenz
```

## Einstieg

- Neue Session: „Projekt fortsetzen" im Chat → lädt Pflicht-Init + `SESSION_RESUME.md`.
- Entscheidungshistorie: `projects/praxis-redesign/specs/bridge-strategy/` (00/01/02).

## Architektur-Prinzipien (Kurz)

- **Single Source of Truth:** Content nur im Trunk, nicht parallel in WP/Shopify
- **Plattform-Unabhängigkeit:** Adapter austauschbar, Trunk bleibt stabil
- **Rechtssicherheit:** Adapter-Views rendern Praxis-Variante HWG-konform (ohne Preis/Kauf-CTA)
- **Mehrsprachigkeit nativ:** I-2 hybrid Schema, Default-Locale `de`
- **Medien-Migration vorbereitet:** M-3c Shopify Files heute, M-3d NAS morgen

## Kontakt

Dr. Stracke — Projektleiter. Alle Entscheidungen.
