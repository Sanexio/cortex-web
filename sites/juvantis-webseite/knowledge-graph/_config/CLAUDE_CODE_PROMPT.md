# Claude Code Prompt — Knowledge Graph Expansion

## Universeller Prompt (erkennt automatisch den nächsten Batch)

Kopiere den gesamten Block zwischen den ``` in Claude Code:

```
Du arbeitest am Juvantis Medical Knowledge Graph.
Arbeitsverzeichnis: projects/Juvantis/website/knowledge-graph/

SCHRITT 1 — STATUS LESEN
Lies diese Dateien in genau dieser Reihenfolge:
- _config/STATUS.md (welcher Batch ist der nächste ohne ✅?)
- _config/RULES.md (Regeln R-KG-001 bis R-KG-010 beachten)
- _config/LUECKENANALYSE.md (Ergänzungen zu bestehenden Batches prüfen)
- medical-knowledge-graph.json (aktuellen Bestand laden)

SCHRITT 2 — NÄCHSTEN BATCH IDENTIFIZIEREN
Finde in STATUS.md den ersten Batch OHNE ✅ Markierung.
Das ist dein Arbeitsauftrag. Wenn der Batch Ergänzungen aus der
Lückenanalyse hat (Tabelle "Ergänzungen zu bestehenden Batches"),
nimm diese mit auf.

SCHRITT 3 — JSON ERWEITERN
Erweitere medical-knowledge-graph.json um ALLE Knoten und Kanten
des identifizierten Batches:
- Neue organs[] mit ALLEN Pflichtfeldern (id, label, system, icon, color, description)
- Neue labvalues[] mit ALLEN Pflichtfeldern (id, label, unit, normalRange, category, significance)
- Neue diseases[] mit ALLEN Pflichtfeldern (id, label, severity, icd10, category)
- Neue edges[] mit ALLEN Pflichtfeldern (from, to, type, detail)
- Bei lab_indicates_disease: IMMER direction-Feld (↑, ↓, ↑↓)
- IDs: snake_case, englisch, eindeutig
- Texte: deutsch
- Keine Duplikate zu bestehenden Einträgen

SCHRITT 4 — VALIDIEREN
Führe aus: python3 _config/validate_graph.py
Ergebnis MUSS sein: 0 Fehler, 0 Warnungen.
Bei Fehlern: sofort korrigieren und erneut validieren.

SCHRITT 5 — STATUS AKTUALISIEREN
In _config/STATUS.md:
- Den abgeschlossenen Batch mit ✅ markieren
- Die Zähltabelle oben aktualisieren (Organe, Laborwerte, Erkrankungen, Kanten)
- Das Datum der letzten Aktualisierung setzen

SCHRITT 6 — INDEX.HTML REGENERIEREN
Lies PROMPT_KNOWLEDGE_GRAPH.md für die visuellen Spezifikationen.
Regeneriere index.html als interaktiven D3.js Force-Directed Graph:
- ALLE Daten aus medical-knowledge-graph.json INLINE einbetten (kein fetch)
- Hintergrund: #0A0F1A (dunkles Navy)
- Organe: große Kreise mit individueller Farbe aus JSON
- Laborwerte: mittlere Kreise, Teal (#028090)
- Erkrankungen: Severity-farbcodiert (Rot→Orange→Amber→Grün)
- Drei Kantentypen visuell unterscheidbar
- Klick-Filter: Klick auf Knoten dimmt nicht-verbundene
- Suchfunktion oben links
- Legende oben rechts
- Info-Panel rechts bei Klick auf Organ
- Zoom + Pan + Drag
- Responsive (Desktop + iPad)
- Labels erst ab Zoom > 0.6 (außer Organ-Labels)
- Schrift: Inter (Google Fonts) oder sans-serif
- EINE einzige HTML-Datei, kein Multi-File-Setup

SCHRITT 7 — ZUSAMMENFASSUNG
Gib am Ende aus:
- Welcher Batch wurde umgesetzt
- Wie viele neue Knoten und Kanten
- Aktuelle Gesamtzählung
- Welcher Batch ist als nächstes dran
```

## Prompt für MEHRERE Batches auf einmal

```
Du arbeitest am Juvantis Medical Knowledge Graph.
Arbeitsverzeichnis: projects/Juvantis/website/knowledge-graph/

Lies zuerst:
- _config/STATUS.md
- _config/RULES.md
- _config/LUECKENANALYSE.md
- medical-knowledge-graph.json

Setze die nächsten 3 ausstehenden Batches um (die ersten 3 ohne ✅).
Für jeden Batch: Knoten + Kanten hinzufügen, nach jedem Batch validieren.
Nach dem letzten Batch: STATUS.md aktualisieren und index.html regenerieren.
Spezifikationen für index.html: siehe PROMPT_KNOWLEDGE_GRAPH.md.
```

## Prompt NUR für index.html Regeneration (ohne neue Daten)

```
Lies projects/Juvantis/website/knowledge-graph/medical-knowledge-graph.json
komplett ein und regeneriere index.html.
Spezifikationen: siehe PROMPT_KNOWLEDGE_GRAPH.md im gleichen Ordner.
Die JSON-Daten INLINE einbetten. EINE HTML-Datei.
```
