# Reference-Tenant-Evidence — Konvention

> **Status:** dokumentarisch, kein Migrations-Backlog
> **Eingeführt:** 2026-05-24, Linter-Sub-Welle 2

## Was sind Evidence-Files?

Unterhalb von `specs/<phase>/evidence/` (und vergleichbaren Spec-Verzeichnissen)
liegen **Test-Outputs aus konkreten Adapter-Läufen** — Roundtrip-JSONs,
Parity-Checks, Self-Check-Markdowns, Screenshots, HTML-Snapshots.

Diese Files dokumentieren das Verhalten des Cortex-Web-Frameworks gegen
einen **echten Tenant** (heute: den Sanexio-Reference-Tenant). Sie enthalten
naturgemäß tenant-spezifische Daten:

- Slugs realer Team-Mitglieder, Praxis-Domain-URLs, Shopify-Handles
- Beispiel-Pages, Produktdaten, Live-IDs aus WP/Shopify-APIs
- Stamp-Daten zum Zeitpunkt des Test-Laufs

## Warum sind sie KEIN Migrations-Ziel?

1. **Reproduzierbarkeit**: Specs verlieren ihren Beweischarakter, wenn die
   Evidence-Files anonymisiert werden — die Selbst-Checks dokumentieren
   gerade, dass der reale Roundtrip ge­klappt hat.
2. **Historische Treue**: Phase-1…5-Specs sind abgeschlossen. Ihre
   Evidence ist ein Snapshot-in-Time, kein lebendes Artefakt.
3. **Linter-Pragmatik**: Würde der Linter Evidence-Files greifen, müsste
   jede neue Self-Check-MD Tenant-Identifier vermeiden, was Roundtrip-
   Beweise praktisch unmöglich macht.

## Linter-Behandlung

`tools/lint-no-tenant-leaks.sh` schließt **alle `evidence/`-Verzeichnisse
unterhalb von `specs/`** explizit aus dem Tenant-Audit aus. Neue Test-
Outputs gehören damit immer in ein `evidence/`-Unterverzeichnis, nicht
in den Spec-Hauptordner.

## Was bleibt anonymisierungspflichtig?

- **Spec-Hauptfiles** (`SPEC.md`, `ARCHITECTURE.md`, `PATTERNS.md`,
  `SELF_CHECK.md` auf Spec-Ebene): hier sollen Beispiele tenant-neutral
  formuliert werden — diese MDs sind Framework-Dokumentation, kein
  Roundtrip-Beweis.
- **`adapters/`, `tools/`, `_config/`, `_rules/`, `trunk/schema/`**:
  bleiben volle Framework-Zone (siehe CW-009 / ADR §10.9).

Konkret bedeutet das: wenn `specs/cross-site-transfer/ARCHITECTURE.md`
„westend-hausarzt.com" erwähnt, ist das Linter-Treffer; wenn
`specs/cross-site-transfer/evidence/2026-04-23_n-1_self-check.md` das
tut, ist das gewollte Test-Doku und kein Linter-Treffer mehr.
