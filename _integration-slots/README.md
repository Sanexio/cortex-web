# Cortex-Web — Integration-Slots

> Markierte Aufnahme-Stellen für Tools/Sub-Projekte, die anderswo
> entwickelt und reifen, bevor sie in den Cortex-Web-Trunk wandern.
>
> Siehe `_config/RULES.md` CW-009 (Multi-Device-Mirror + Promotion-Pipeline)
> und `_tutorials/cortex-web/04-tool-promotion-workflow.md`.

---

## Idee

Cortex-Web ist das Dach für die Web-Welt von Praxis und Juvantis. Neue
Tools (Sync-Skripte, Validatoren, Adapter, kleine Webanwendungen) werden
selten direkt im Cortex-Web-Trunk erfunden — sie entstehen meist
projekt-nah (in `~/Cortex/projects/<projekt>/`, manchmal auch unter
`~/Cortex/Nexus/tools/`), wo der konkrete Pain-Point lebt.

Wenn ein Tool dort reift und sich als Trunk-fähig erweist, wird es
**promotet** — kontrolliert, in einen vorab definierten Slot, mit
Interface-Vertrag und Akzeptanz-Kriterien.

---

## Slot-Lebenszyklus

```
PROPOSED  →  SANDBOX  →  HARDENED  →  PROMOTED  →  RETIRED
    │           │           │            │            │
    │           │           │            │            └─ Trunk-Tool veraltet, archiviert
    │           │           │            └─ Promotion vollzogen, Trunk-Pfad belegt
    │           │           └─ ≥2 Macs / ≥2 echte Anwendungsfälle bestanden
    │           └─ Erste lauffähige Version im Sandbox-Projekt
    └─ Slot reserviert, Vertrag formuliert, Sandbox noch nicht gebaut
```

---

## Verzeichnis-Struktur

```
_integration-slots/
├── README.md                   ← diese Datei
├── _template/
│   └── SLOT.md                 ← Vorlage für neue Slots
├── <slot-name>/
│   ├── SLOT.md                 ← Vertrag + aktueller Status
│   └── (optional weitere Files: Mockups, Schema-Drafts, Test-Fixtures)
└── …
```

Jeder Slot ist ein eigenes Verzeichnis. `SLOT.md` ist Pflicht und folgt
dem Template (`_template/SLOT.md`).

---

## Promotion-Flow (Kurzversion)

1. Slot vorschlagen: `_integration-slots/<slot>/SLOT.md` aus Template
   füllen, Status `PROPOSED`. Commit.
2. Sandbox-Build im Quell-Projekt (z.B. `projects/file-renamer/`).
   Slot-Status auf `SANDBOX`, `sandbox_location` ausfüllen.
3. Nach ≥2-Mac-Verifikation + echtem Anwendungsfall: Slot-Status
   `HARDENED`.
4. Promotion: `tools/promote-to-trunk.sh <quell-pfad> <slot-name>`
   subsumiert in den Trunk-Pfad, Slot-Status `PROMOTED`,
   `promoted_at` + `promotion_commit` werden eingetragen.
5. Trunk-Tool ersetzt Sandbox; Sandbox bleibt zur Historie als
   read-only-Kopie oder wird im Quell-Projekt archiviert.

Details: siehe `tools/promote-to-trunk.sh --help`.

---

## Aktive Slots

| Slot | Status | Quelle | Trunk-Ziel | Verantwortlicher Mac |
|------|:------:|--------|------------|---------------------|
| `file-renamer-cli` | PROPOSED | `projects/file-renamer/` | `tools/file-renamer/` | SSMD-MacBookPro (Praxis) |
| `drift-sync-as-trunk` | SANDBOX | `projects/Cortex-Web/tools/drift-sync/` | `tools/drift-sync/` (in-place-Härtung) | Cluster-Mini-02 |
| `workforce-time-app` | PROMOTED | `projects/Praxis Monitoring/Arbeitszeiten/` (Sandbox als read-only-Historie) | `sites/workforce-time/` (Tenant-Daten in `Sanexio-Tenant`) | SSMD-MacBookPro-M5 |

> Tabelle wird beim Anlegen/Schließen eines Slots aktualisiert. Quelle
> der Wahrheit bleibt aber `<slot>/SLOT.md`.
