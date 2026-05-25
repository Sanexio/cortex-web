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

## Historisch-dokumentarische Spec-Verzeichnisse

Neben Evidence gibt es eine zweite Klasse von Spec-Files, die naturgemäß
Tenant-Identifier enthalten dürfen: **abgeschlossene Aufbau-, Strategie-
und Session-Specs**. Diese MDs sind Snapshot-in-Time-Artefakte (z.B.
Brainstorming-Protokolle, Phase-Specs mit Tenant-Operator-Freigabe-Zitaten,
Session-spezifische Sub-Tasks). Sie zu anonymisieren würde ihren
historischen Charakter verfälschen.

`tools/lint-no-tenant-leaks.sh` schließt diese Verzeichnisse ebenfalls
aus:

- `specs/phase-N/` — die durchnumerierten Aufbau-Phasen (Phase 1 POC-WP-
  Adapter, Phase 2 POC-Shopify-Adapter, … Phase 5 Subsumption). Jede
  Phase wird mit Self-Check geschlossen und nicht mehr verändert.
- `specs/bridge-strategy/` — die strategische Diskussion 2026-04-18
  (Brainstorming, Common-Trunk-Lokale-Entwicklung, finale Entscheidungen).
- `specs/content-bridge-v1/` — explizite Versionierung im Namen markiert
  v1 als abgeschlossen; aktuelle lebende Bridge-Specs liegen unter
  `cross-site-transfer/` und `drift-sync/`.
- `specs/session-N/` — Session-spezifische Sub-Specs (z.B. session-24
  N-5/N-7-Page-Adapter-Extension) sind per Definition Snapshot-in-Time.

Neue **lebende** Spec-Verzeichnisse gehören explizit nicht in diese
Schemata — sie sollen anders benannt sein (keine `phase-N` und keine
`session-N` Namensgebung), damit der Linter sie greift.

## Was bleibt anonymisierungspflichtig?

- **Lebende Spec-Hauptfiles** (`SPEC.md`, `ARCHITECTURE.md`, `PATTERNS.md`,
  `SELF_CHECK.md` außerhalb der oben gelisteten historischen
  Verzeichnisse): hier sollen Beispiele tenant-neutral formuliert werden
  — diese MDs sind Framework-Dokumentation, kein Roundtrip-Beweis.
- **`adapters/`, `tools/`, `_config/`, `_rules/`, `trunk/schema/`**:
  bleiben volle Framework-Zone (siehe CW-009 / ADR §10.9).

Konkret bedeutet das: wenn `specs/cross-site-transfer/ARCHITECTURE.md`
eine konkrete Tenant-Domain erwähnt, ist das Linter-Treffer; wenn
`specs/cross-site-transfer/evidence/2026-04-23_n-1_self-check.md` oder
`specs/phase-3/REVIEW.md` das tut, ist das gewollte Snapshot-Doku und
kein Linter-Treffer mehr.
