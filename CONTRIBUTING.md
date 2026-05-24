# Contributing to Cortex-Web

Vielen Dank für dein Interesse an Cortex-Web! Dieses Repo ist Teil der
Cortex-Plattform, kuratiert von **Sanexio GmbH** (sanexio.eu).

## Code of Conduct

Sei freundlich, sei präzise, sei geduldig. Wir reviewen PRs sorgfältig
und freuen uns über jeden Beitrag — auch über Issues, die nur Fragen
stellen.

## Vor dem ersten Beitrag

1. **Demo-Setup zum Laufen bringen** (siehe [README.md Quickstart](./README.md#quickstart-demo-modus)).
2. **Architektur verstehen**: Cortex-Web ist Framework, kein Tenant-Repo.
   Code, der Tenant-spezifische Pfade hartcodiert (z.B. `westend-hausarzt.com`,
   konkrete Arzt-Namen, Domain-Strings), wird abgelehnt.
3. **Tenant-Path-Helper kennen**: `tools/lib/tenant-path.{sh,mjs}` ist der
   einzige Weg, auf Tenant-Daten zu lesen. Direkter Zugriff auf
   `trunk/content/` ist verboten.

## Welche Arten von Beiträgen?

### Klein (kein Slot nötig)

- Bug-Fix in einem bestehenden Adapter
- Typo / Doku-Verbesserung
- Schema-Erweiterung (nicht-breaking)
- Adapter-Performance-Optimierung

→ Einfach PR aufmachen, im Beschreibung-Text Bezug zur betroffenen Datei.

### Groß (Slot-System nötig)

Für neue Adapter, neue Tools, neue Top-Level-Mechaniken:

1. **Slot vorschlagen**: `_integration-slots/<slot-name>/SLOT.md` aus dem
   Template kopieren und befüllen. Status: `PROPOSED`.
2. **Sandbox-Build** in einem eigenen Projekt (kein PR in Cortex-Web,
   bis das Tool gehärtet ist).
3. **Härtung** auf mindestens 2 Maschinen + 2 echten Anwendungsfällen.
4. **PR** mit Promotion-Skript: `tools/promote-to-trunk.sh <slot> --commit`.

Hintergrund: das Slot-System verhindert, dass Cortex-Web zu einer Sammlung
unverbundener Skripte wird. Jeder Trunk-Code hat einen dokumentierten
Vertrag und mindestens einen verifizierten Anwendungsfall.

Details: [`_integration-slots/README.md`](./_integration-slots/README.md).

## Lizenz / DCO

Mit deinem PR bestätigst du implizit, dass du das Recht hast, den Code
beizutragen, und ihn unter der Apache-2.0-Lizenz (`LICENSE`)
veröffentlichen darfst. Wir verlangen aktuell keinen signed-off-by
DCO-Footer, behalten uns aber vor, das bei größeren Beiträgen
einzufordern.

## Review-Pipeline

- PR-Autor: stellt PR, beschreibt Was + Warum.
- Sanexio-Reviewer: prüft auf:
  - Keine Tenant-Spuren im Framework-Code (`bash tools/lint-no-tenant-leaks.sh`)
  - Demo-Modus funktioniert (`bun adapters/<dein-adapter>/build-*.mjs`)
  - Vertrag (im SLOT.md, falls neu) ist klar und testbar
- Bei größeren Änderungen: Vor Merge wird per Default ein Sanexio-Test-Tenant
  durchgejagt.

## Kommunikation

- **Issues**: für Bugs, Feature-Anfragen, Architektur-Fragen.
- **Discussions** (sobald aktiviert): für offenere Themen, Roadmap-Input.
- **Direkt-Kontakt** mit Sanexio: über die im sanexio.eu Impressum
  hinterlegten Wege.

## Was wir NICHT akzeptieren

- Hartcodierte Tenant-Daten (Patient-Bezug, konkrete Praxis-Namen, Domains
  außer als anonymisierte Beispiele).
- Breaking-Changes ohne Migrations-Pfad.
- Skripte ohne Dry-Run/Backup-Mechanismus, wenn sie destruktiv sind.
- PRs, die die Plattform-Trennung Nexus ↔ Cortex-Layer verletzen
  (z.B. Versuch, Nexus-interne Module zu importieren).

Danke, dass du Cortex-Web mitgestaltest!

— Sanexio GmbH
