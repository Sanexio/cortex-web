---
slot_name: file-renamer-cli
status: PROPOSED
proposed_at: 2026-05-24
proposed_by: SSMD-MacBookPro-M5

operates_on: framework  # nimmt beliebige Quell-Ordner als Argument; kein hartcodierter Tenant-Zugriff

sandbox_location: projects/file-renamer/
trunk_target: tools/file-renamer/

owner_mac: SSMD-MacBookPro
verification_macs: [Cluster-Mini-02, Mac-Studio-von-MacStudioZi2]

promoted_at: null
promotion_commit: null
retired_at: null
---

# Slot: file-renamer-cli

## Zweck

Patient- und Praxis-Dateien deterministisch umbenennen (Datum + Typ +
Kurz-Slug), damit Trunk-Imports/Media-Registry nicht an inkonsistenten
Dateinamen ersticken.

## Pain-Point

`_media-source/`-Registrierungen (CW-003, P1 der Prio-Leiter) brechen
heute regelmäßig an Original-Dateinamen wie `IMG_4567.HEIC`,
`Scan 2026-04-18 13_22.pdf`, `unbenannt-3.png`. Manueller Rename ist
fehleranfällig und teuer. Die Registry braucht stabile, sortierbare,
maschinenlesbare Dateinamen.

Prio-Stufe: **P1** (Medien-Registry-Flow blockiert ohne stabile Namen).

## Interface-Vertrag

**Kommando:**
```
file-renamer <quell-ordner> [--pattern <regel>] [--dry-run] [--commit]
```

**Inputs:**
- Quell-Ordner mit beliebigen Dateien
- Pattern-Regel: `YYYY-MM-DD_<typ>_<slug>.<ext>` (Default)
- ENV `FILE_RENAMER_TZ` für Datums-Source (Default: `Europe/Berlin`)

**Outputs:**
- Stdout: Mapping-Tabelle (alt → neu), 1 Zeile pro Datei
- File: `_renames.log` im Quell-Ordner mit Vollverlauf
- Exit 0 bei Erfolg, 1 bei Konflikt (zwei Dateien → gleicher Zielname)

**Nicht-Ziele:**
- Kein Upload, kein Move zwischen Ordnern, keine Konvertierung
- Kein OCR/Inhalts-Klassifikation (das ist Sache des Desk-Projekts)

## Akzeptanz-Kriterien (für HARDENED-Status)

- [ ] Lauffähig auf SSMD-MacBookPro
- [ ] Lauffähig auf Cluster-Mini-02 ODER Mac-Studio
- [ ] Mindestens 2 echte Anwendungsfälle dokumentiert (z.B. Patient-Scans, Praxis-Fotos)
- [ ] README mit Install + Beispielen
- [ ] Keine Praxis-MBP-spezifischen Pfade hardcodiert
- [ ] Dry-run als Default, `--commit` für echten Rename
- [ ] Tier-3-konform (rein lokal, keine externen Calls)

## Promotion-Plan

- **Verschiebung:** `git subtree add --prefix=tools/file-renamer/`
  aus `~/Cortex/projects/file-renamer/` (eigenes Repo? oder lokaler
  Ordner → dann via `tools/promote-to-trunk.sh`)
- **Tests im Trunk:** Integration in `tools/media/register.mjs`
  (Pre-Step: erst rename, dann register)
- **Doku-Updates:** `_config/RULES.md` CW-003-Ergänzung, neues
  Modul in `_tutorials/cortex-web/`
- **Sandbox-Endzustand:** `projects/file-renamer/` wird zur
  read-only-Historie, neuer Code lebt nur noch im Trunk

## Risiken

- Datums-Extraktion aus EXIF/Filename-Parsing fragil (HEIC vs. PDF
  vs. Scan ohne Metadaten)
- Konflikt bei zwei Dateien mit identischem Datum/Typ — braucht
  Suffix-Strategie (`_a`, `_b` oder Sequenznummer)

## Entscheidungs-Historie

- 2026-05-24: Slot vorgeschlagen als erstes Beispiel der Promotion-Pipeline.
