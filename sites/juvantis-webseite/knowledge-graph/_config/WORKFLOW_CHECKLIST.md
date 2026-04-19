# Knowledge Graph — Workflow-Checkliste

## Vor jeder Erweiterung (Batch)

1. [ ] `_config/STATUS.md` lesen — welcher Batch ist dran?
2. [ ] `_config/RULES.md` lesen — Regeln kennen (R-KG-001 bis R-KG-010)
3. [ ] Aktuelle `medical-knowledge-graph.json` laden und Bestand prüfen
4. [ ] Bestehende IDs auflisten (keine Duplikate!)

## Während der Erweiterung

5. [ ] Neue Knoten (Organe/Labs/Erkrankungen) mit ALLEN Pflichtfeldern anlegen
6. [ ] Kanten mit `detail`-Feld anlegen
7. [ ] Bei `lab_indicates_disease`: `direction`-Feld setzen (↑, ↓, ↑↓)
8. [ ] Medizinische Korrektheit sicherstellen (R-KG-010)

## Nach der Erweiterung

9. [ ] Validierungsskript ausführen:
   ```bash
   cd projects/Juvantis/website/knowledge-graph
   python3 _config/validate_graph.py
   ```
10. [ ] Ergebnis: 0 Fehler, 0 Warnungen?
11. [ ] `_config/STATUS.md` aktualisieren:
    - Batch als ✅ markieren
    - Zählung aktualisieren
    - Nächsten Batch benennen
12. [ ] index.html neu generieren (Claude Code Prompt verwenden)

## Claude Code Prompt für Batch-Erweiterung

```
Lies die Dateien in projects/Juvantis/website/knowledge-graph/_config/:
- STATUS.md (welcher Batch ist der nächste?)
- RULES.md (Regeln beachten)

Dann lies medical-knowledge-graph.json und erweitere sie um den nächsten
ausstehenden Batch laut STATUS.md.

Nach der Erweiterung:
1. python3 _config/validate_graph.py ausführen
2. STATUS.md aktualisieren (Batch als erledigt markieren, Zahlen anpassen)
3. index.html neu generieren mit dem Prompt aus PROMPT_KNOWLEDGE_GRAPH.md
```

## Claude Code Prompt für index.html Regeneration

```
Lies projects/Juvantis/website/knowledge-graph/medical-knowledge-graph.json
komplett ein und regeneriere die index.html als interaktiven D3.js Force Graph.
Alle Spezifikationen stehen in PROMPT_KNOWLEDGE_GRAPH.md.
Die JSON-Daten müssen INLINE in die HTML-Datei eingebettet werden.
```
