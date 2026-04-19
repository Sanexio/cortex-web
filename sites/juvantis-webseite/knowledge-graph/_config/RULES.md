# Knowledge Graph — Projektregeln

## Projekt-Identität
- **Name:** Juvantis Medical Knowledge Graph
- **Pfad:** `projects/Juvantis/website/knowledge-graph/`
- **Ziel:** Interaktiver Network Graph aller menschlichen Organe, Laborwerte und Erkrankungen
- **Verwendung:** Juvantis-Website (Digital Health Twin), Patientenedukation
- **Zielgruppe:** Medizinische Laien UND Fachpublikum

## Datenherkunft
Die Daten stammen aus dem **medizinischen Fachwissen von Claude (Opus)**,
basierend auf dem Trainingskorpus der medizinischen Fachliteratur:
- Standardwerke der Labormedizin (Thomas, Laborlexikon)
- Innere Medizin Lehrbücher (Herold, Harrison's)
- Klinische Chemie und Hämatologie
- ICD-10-GM Katalog
- Referenzbereiche: Deutsche Laborstandards (DGKL)

**WICHTIG:** Die Daten sind medizinisch korrekt, aber NICHT als Diagnose-Tool gedacht.
Der Graph dient der Visualisierung und Edukation, nicht der klinischen Entscheidungsfindung.

## Architektur

### Drei Knotentypen
1. **Organe** (`organs[]`) — Anatomische Strukturen und Organsysteme
2. **Laborwerte** (`labvalues[]`) — Bestimmbare klinische Parameter
3. **Erkrankungen** (`diseases[]`) — Pathologische Zustände (mit ICD-10)

### Drei Kantentypen
1. **organ_produces_lab** — Organ → beeinflusst/produziert diesen Laborwert
2. **lab_indicates_disease** — Abweichung des Laborwerts → deutet auf diese Erkrankung
3. **disease_affects_organ** — Erkrankung → schädigt dieses Organ

### Datenstruktur (JSON)
```
medical-knowledge-graph.json   ← Haupt-Datenbasis (SINGLE SOURCE OF TRUTH)
```

Jeder Knoten hat eine eindeutige `id` (snake_case, englisch).
Jede Kante referenziert `from` → `to` über diese IDs.
Kanten haben ein `detail`-Feld mit medizinischer Erklärung (deutsch).

## Regeln für Erweiterungen

### R-KG-001: Keine Duplikate
Vor jeder Erweiterung MUSS geprüft werden, ob der Laborwert, das Organ
oder die Erkrankung bereits existiert. IDs sind eindeutig.

### R-KG-002: Referenzbereiche immer angeben
Jeder Laborwert MUSS `normalRange` haben. Bei geschlechtsspezifischen
Werten: `"M: x-y / F: x-y"`.

### R-KG-003: ICD-10 bei Erkrankungen
Jede Erkrankung MUSS einen ICD-10-Code haben.

### R-KG-004: Kanten brauchen Erklärungen
Jede Kante MUSS ein `detail`-Feld haben, das in einem Satz erklärt
WARUM diese Verbindung existiert.

### R-KG-005: Richtungsinformation bei lab_indicates_disease
Jede Kante vom Typ `lab_indicates_disease` MUSS ein `direction`-Feld
haben: `"↑"`, `"↓"` oder `"↑↓"`.

### R-KG-006: Severity bei Erkrankungen
Jede Erkrankung MUSS `severity` haben. Erlaubte Werte:
- `akut-lebensbedrohlich`
- `akut-schwer`
- `akut-mittel`
- `chronisch-schwer`
- `chronisch-progredient`
- `chronisch-mittel`
- `chronisch-leicht`
- `variabel`

### R-KG-007: Validierung nach jeder Erweiterung
Nach JEDER Erweiterung MUSS das Validierungsskript laufen:
```bash
python3 _config/validate_graph.py
```
Prüft: Referenzintegrität, Duplikate, fehlende Felder, verwaiste Knoten.

### R-KG-008: STATUS.md aktualisieren
Nach jeder Erweiterung MUSS `_config/STATUS.md` aktualisiert werden
mit: was hinzugefügt wurde, aktuelle Zählung, nächster geplanter Batch.

### R-KG-009: Batch-Workflow
Erweiterungen erfolgen in **Batches**. Jeder Batch hat:
- Eine Kategorie (z.B. "Differentialblutbild", "Autoimmunmarker")
- Eine definierte Anzahl neuer Knoten und Kanten
- Validierung am Ende

### R-KG-010: Medizinische Korrektheit vor Vollständigkeit
Lieber weniger Verbindungen als falsche. Im Zweifelsfall die Kante
weglassen und in STATUS.md als "zu prüfen" markieren.
