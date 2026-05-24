---
slot_name: <kebab-case-name>
status: PROPOSED  # PROPOSED | SANDBOX | HARDENED | PROMOTED | RETIRED
proposed_at: YYYY-MM-DD
proposed_by: <mac-hostname>

# Worauf operiert das Tool? (CW-009 Tenant-Trennung, ADR 01_CORTEX_WEB_SPLIT)
#   framework — generisch, kein Tenant-Daten-Zugriff (z.B. Validator, Build-Helper)
#   tenant    — liest/schreibt Tenant-Daten (z.B. Content-Sync, Adapter)
#   both      — operiert auf beiden (z.B. Migrations-Skripte, Linter)
# Konsequenz: 'tenant'/'both' MÜSSEN tools/lib/tenant-path.sh nutzen,
# nicht hartcodierte Pfade auf trunk/content/ oder sites/.
operates_on: framework  # framework | tenant | both

# Wo die Sandbox-Version lebt (relativ zu ~/Cortex/).
sandbox_location: projects/<projekt>/<sub>/

# Wohin im Trunk promotet wird.
trunk_target: tools/<name>/

# Welcher Mac führt die Sandbox-Härtung (1 Mac = primary owner während SANDBOX).
owner_mac: <mac-hostname>

# Welche Macs müssen das Tool grün laufen lassen, bevor HARDENED?
verification_macs: [<host1>, <host2>]

# Wird nach PROMOTED gesetzt.
promoted_at: null
promotion_commit: null
retired_at: null
---

# Slot: <Slot-Name>

## Zweck (eine Zeile)

<Was tut das Tool? In einem Satz, ohne Marketing.>

## Pain-Point (Warum jetzt?)

<Welcher konkrete Schmerz im Cortex-Web-Alltag wird damit behoben?
Bezug zu CW-PRIO-001 — auf welcher Prio-Stufe?>

## Interface-Vertrag

**Kommando(s):**
```
<beispiel-aufruf>
```

**Inputs:** <welche Files/Argumente/ENV>
**Outputs:** <welche Files/Effekte/Exit-Codes>
**Nicht-Ziele:** <was das Tool explizit NICHT macht>

## Akzeptanz-Kriterien (für HARDENED-Status)

- [ ] Lauffähig auf `owner_mac`
- [ ] Lauffähig auf mindestens einem `verification_macs`-Mac
- [ ] Mindestens 2 echte Anwendungsfälle dokumentiert (kein Toy-Beispiel)
- [ ] README im Sandbox-Ordner mit Install-/Run-/Troubleshoot-Sektion
- [ ] Kein hardcodierter Pfad, der nur auf einem Mac existiert
- [ ] Trockenlauf-/Dry-run-Modus vorhanden (wenn destruktiv)
- [ ] Tier-3-konform (keine Secrets in Repo, keine externen Empfänger ohne Bestätigung)

## Promotion-Plan

- **Verschiebung:** `git mv <sandbox> <trunk_target>` (Historie) oder
  `git subtree add` (wenn aus eigenem Repo).
- **Tests im Trunk:** <welche Validate-Pipeline läuft danach?>
- **Doku-Updates:** <welche `.md`-Files müssen mit?>
- **Sandbox-Endzustand:** Archiv-Kopie? Löschen? Pointer in alten Pfad?

## Risiken

- <was kann schiefgehen?>

## Entscheidungs-Historie

- `YYYY-MM-DD`: Slot vorgeschlagen.
- `…`
