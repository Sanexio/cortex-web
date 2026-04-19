# Cortex-Web

> Common Trunk + Adapter für `westend-hausarzt.com` (WordPress) und `sanexio.eu` (Shopify).
>
> **Idee in einem Satz:** Inhalt einmal pflegen, Adapter rendern plattform-spezifisch.

## Status

**Phasen 0–4 abgeschlossen.** Phase 4 (Subsumierung praxis-redesign → `sites/praxis-webseite/`) am 2026-04-19. Siehe `SESSION_RESUME.md` für aktuellen Status.

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
- Entscheidungshistorie: `Cortex-Web/specs/bridge-strategy/` (00/01/02, seit Phase 4 hier).

## Architektur-Prinzipien (Kurz)

- **Single Source of Truth:** Content nur im Trunk, nicht parallel in WP/Shopify
- **Plattform-Unabhängigkeit:** Adapter austauschbar, Trunk bleibt stabil
- **Rechtssicherheit:** Adapter-Views rendern Praxis-Variante HWG-konform (ohne Preis/Kauf-CTA)
- **Mehrsprachigkeit nativ:** I-2 hybrid Schema, Default-Locale `de`
- **Medien-Migration vorbereitet:** M-3c Shopify Files heute, M-3d NAS morgen

## Kontakt

Dr. Stracke — Projektleiter. Alle Entscheidungen.
