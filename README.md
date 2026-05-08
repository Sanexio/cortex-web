# Cortex-Web

> Common Trunk + Adapter für `westend-hausarzt.com` (WordPress) und `sanexio.eu` (Shopify).
>
> **Idee in einem Satz:** Inhalt einmal pflegen, Adapter rendern plattform-spezifisch.

## GitHub-Mirror

| | |
|---|---|
| **GitHub-Repo** | `git@github.com:Sanexio/cortex-web.git` (privat) |
| **Eingerichtet** | 2026-05-08 (Welle S55b-d) |
| **Begleit-Repos** | [`Sanexio/praxiszentrum-theme`](https://github.com/Sanexio/praxiszentrum-theme) (Theme), [`Sanexio/nexus`](https://github.com/Sanexio/nexus) (Wissenskern) |

Dieses Repo enthält **nicht** das WordPress-Theme selbst, sondern den
Trunk (YAML-Page-Daten), Adapter, Tools, Specs und Sprint-Dokumentation
für `sites/praxis-webseite/` und `sites/juvantis-webseite/`. Das Theme
liegt in einem eigenen Repo (siehe oben).

## Rollback-Konzept (Modell A — Local = Master)

Reihenfolge bei jeder Code-Änderung:

```
1. Edit lokal (LocalWP / Cortex-Web Trunk)
2. git commit + push (zuerst Theme-Repo, dann Cortex-Web)
3. lftp-Sync auf .de-Staging
4. Verify-Suite (21/21) auf .de
5. Wenn grün: Tag live-de-YYYY-MM-DD-NN setzen + push --tags
```

**Tags als Rollback-Anker** liegen im **Theme-Repo** (PXZ-Code) und im
**Cortex-Web-Repo** (Trunk-/Tool-Stand) parallel mit identischem Namen,
sodass ein Rollback beide Repos synchron auf denselben Stand zurücksetzen
kann. Volltutorial:
`~/Cortex/Nexus/Second Brain/30 Tutorials/Webentwicklung/Webdesign/14-rollback-via-git-tag.md`.

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
