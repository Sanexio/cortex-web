---
slot_name: drift-sync-as-trunk
status: SANDBOX
proposed_at: 2026-05-24
proposed_by: SSMD-MacBookPro-M5

operates_on: tenant  # drift-sync vergleicht/synct Trunk-Content gegen Live-Sites — operiert auf Tenant-Daten; MUSS tenant-path.sh nutzen, sobald Phase 1.3 (Migration) durch ist

# drift-sync lebt bereits im Cortex-Web-Repo unter tools/drift-sync/.
# Slot dient hier dazu, die "in-place-Härtung" als Promotion-Pfad zu
# dokumentieren — Tool muss CW-Standards (Vertrag, Tests, README) bestehen.
sandbox_location: projects/Cortex-Web/tools/drift-sync/
trunk_target: tools/drift-sync/

owner_mac: Cluster-Mini-02
verification_macs: [Mac-Studio-von-MacStudioZi2]

promoted_at: null
promotion_commit: null
retired_at: null
---

# Slot: drift-sync-as-trunk

## Zweck

drift-sync (vorhandene 4-Files-Toolchain: `detect.mjs`, `sync.mjs`,
`backfill.mjs`, `config.json`) wird als reguläres Trunk-Tool gehärtet,
nicht mehr als „Tool-Pioneer", sondern mit Vertrag, README und
Akzeptanz-Test.

## Pain-Point

Tool ist bereits operativ, aber:
- Keine README im Tool-Ordner
- Kein dokumentierter Vertrag (was darf rein, was kommt raus)
- Verhalten ist nur durch Code-Lesen erschließbar
- Keine Dry-run-Garantie dokumentiert

Bei Cross-Mac-Bearbeitung (jetzt geplant via CW-009 Mirror) muss jeder
Mac das Tool gleich verstehen — sonst Konflikte beim Promotion-Slot
des nächsten Tools.

Prio-Stufe: **Popt** (Trunk-Hygiene). Wird mitgenommen, weil es bei
der Etablierung der Promotion-Pipeline ohnehin als Referenz-Beispiel
dient.

## Interface-Vertrag

**Kommandos:**
```
node tools/drift-sync/detect.mjs    # nur erkennen, keine Writes
node tools/drift-sync/sync.mjs      # detect + Anwenden (dry-run default!)
node tools/drift-sync/backfill.mjs  # einmalige Initial-Befüllung
```

**Inputs:**
- `tools/drift-sync/config.json` — Quell-/Ziel-Pfade
- (zu vervollständigen — Code lesen)

**Outputs:**
- (zu vervollständigen)

**Nicht-Ziele:**
- Kein Schema-Validate (das ist `tools/validate.sh`)
- Kein Adapter-Build (das sind `sync-<plattform>.sh`)

## Akzeptanz-Kriterien (für HARDENED-Status)

- [ ] README.md im `tools/drift-sync/` mit Interface-Vertrag
- [ ] Lauffähig auf Cluster-Mini-02 (Owner)
- [ ] Lauffähig auf Mac-Studio (Verify)
- [ ] Dry-run als Default, explizit `--commit`/`--apply` für Writes
- [ ] CHANGELOG-Eintrag (Cortex-Web/CHANGELOG.md) für Härtung
- [ ] Keine hardcodierten Mac-spezifischen Pfade

## Promotion-Plan

In-place-Härtung — Tool bleibt unter `tools/drift-sync/`. „Promotion"
heißt hier: aus SANDBOX-Status (= operativ aber unstandardisiert) in
HARDENED-Status (= Vertrag + README + verifiziert) und dann PROMOTED
(= als reguläres Trunk-Tool in Cortex-Web-Doku-Index aufgenommen).

## Risiken

- Initial-Inspektion ergibt eventuell: das Tool macht etwas, was
  gegen CW-001 (Trunk-as-Master) oder CW-006 (gerichteter Transfer)
  verstößt. Dann ist Härtung nicht trivial — eher Refactor.

## Entscheidungs-Historie

- 2026-05-24: Slot eröffnet als Referenz-Beispiel für die Promotion-Pipeline.
