# Claude Code Prompt — Juvantis Medical Knowledge Graph

## Prompt (Copy & Paste in Claude Code Terminal)

```
Erstelle einen interaktiven medizinischen Knowledge Graph als einzelne HTML-Datei
mit D3.js (Force-Directed Graph). Die komplette Datenbasis liegt bereits als JSON in:

projects/Juvantis/website/knowledge-graph/medical-knowledge-graph.json

## Ziel
Ein visuell beeindruckendes, interaktives Node-Link-Diagramm für die Juvantis-Website
(Digital Health Twin Startup), das die Zusammenhänge zwischen menschlichen Organen,
Laborwerten und Erkrankungen zeigt. Es soll Patienten und Interessierte ansprechen
und den Wert eines "digitalen Gesundheitszwillings" verdeutlichen.

## Technische Anforderungen

### Stack
- EINE einzige HTML-Datei (kein Build-System)
- D3.js v7 (CDN: https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js)
- Inline CSS + Inline JS
- Responsive Design (funktioniert auf Desktop und iPad)
- Output-Pfad: projects/Juvantis/website/knowledge-graph/index.html

### Drei Knotentypen mit visueller Unterscheidung
1. **Organe** (große Kreise, 35-45px Radius)
   - Farbe: Individuelle Organfarbe aus dem JSON ("color"-Feld)
   - Weißer Text-Label, leichter Drop-Shadow
   - Pulsierender Glow-Effekt beim Hover (CSS-Animation)

2. **Laborwerte** (mittlere Kreise, 18-22px Radius)
   - Farbe: #028090 (Juvantis Teal) mit 80% Opazität
   - Hellerer Text, kleinere Schrift

3. **Erkrankungen** (Hexagone ODER Rauten, 20-25px)
   - Farbe: Severity-basiert:
     - akut-lebensbedrohlich → #E63946 (Rot)
     - akut-schwer / chronisch-schwer → #FF6B35 (Orange)
     - chronisch-mittel → #FFB400 (Amber)
     - chronisch-leicht → #7DCE82 (Grün)
     - variabel → #A8A8A8 (Grau)

### Drei Kantentypen
1. **organ_produces_lab** → Durchgezogene Linie, Teal (#02C39A), 2px, Pfeil zum Lab
2. **lab_indicates_disease** → Gestrichelte Linie, Orange (#FF6B35), 1.5px, Pfeil zur Krankheit
3. **disease_affects_organ** → Gepunktete Linie, Rot (#E63946), 1px, Pfeil zum Organ

### Interaktion
- **Hover auf Knoten:** Tooltip mit Details (Name, Normwert bei Labs, ICD-10 bei Erkrankungen)
- **Klick auf Knoten:** Alle NICHT-verbundenen Knoten auf 10% Opazität dimmen.
  Nur der geklickte Knoten + direkte Nachbarn + deren Kanten bleiben hell.
  Zweiter Klick oder Klick in leeren Bereich hebt Dimming auf.
- **Klick auf Organ:** Zeigt rechts ein Info-Panel mit:
  - Organname und System
  - Alle zugehörigen Laborwerte (als klickbare Chips)
  - Alle Erkrankungen die dieses Organ betreffen (farbig nach Severity)
- **Zoom + Pan:** Standard D3 zoom behavior (Mausrad + Drag)
- **Drag:** Knoten können per Drag repositioniert werden

### Layout-Strategie
- Force-Simulation mit folgenden Kräften:
  - charge: -400 (Abstoßung)
  - link distance: 120 für organ→lab, 90 für lab→disease, 150 für disease→organ
  - center: Mitte des Viewports
  - collision: radius + 15px Padding
- Organe als "Gravitationszentren": forceRadial mit stärkerem Pull (0.3)
  in einem mittleren Ring (radius: 250px vom Zentrum)
- Laborwerte: schwächerer radial Pull (0.1) auf inneren Ring
- Erkrankungen: schwächster Pull (0.05) auf äußeren Ring
- Initial-Alpha: 0.8 mit alphaDecay 0.01 für langsames Einpendeln

### Suchfunktion
- Input-Feld oben links: "Suche nach Organ, Laborwert oder Erkrankung..."
- Echtzeit-Filter: Matching-Knoten + deren Nachbarn bleiben sichtbar,
  Rest wird gedimmt
- Bei leerem Suchfeld: alles wieder sichtbar

### Legende
- Oben rechts: Legende mit den drei Knotentypen + drei Kantentypen
- Klick auf Legendeneintrag filtert nach diesem Typ (Toggle)

### Header-Bereich
- Titel: "Juvantis Health Graph"
- Subtitle: "Wie Organe, Laborwerte und Erkrankungen zusammenhängen"
- Juvantis Teal Gradient als Hintergrundakzent

### Farbschema & Ästhetik
- Hintergrund: #0A0F1A (Dunkles Navy, fast Schwarz) mit subtilen radialen
  Gradient-Circles (wie ein Sternenhimmel / medizinischer Kosmos)
- Kanten: semi-transparent, leuchten auf bei Hover (Glow-Effekt)
- Schrift: 'Inter' (Google Fonts CDN) oder sans-serif Fallback
- Allgemeiner Stil: Futuristisch, clean, medizinisch — wie eine
  Kommandozentrale für Gesundheitsdaten
- Info-Panel rechts: Semi-transparenter Container (#0A0F1A, 85% Opazität)
  mit Glasmorphism-Effekt (backdrop-blur)

### Performance-Optimierungen
- Canvas-Rendering für die Kanten (>160 Kanten)
- SVG nur für die Knoten (Interaktion nötig)
- Oder: Alles SVG, aber mit requestAnimationFrame für Simulation
- Labels erst ab Zoom-Level > 0.6 anzeigen (bei rausgezoomter Ansicht
  nur die Organ-Labels)

### Responsiveness
- Unter 768px Breite: Info-Panel wird zum Bottom-Sheet
- Touch-Events für Mobile (Tap = Klick)
- Minimale Knotengröße auf Mobile: 12px

## Qualitätskriterien
1. Graph muss SOFORT visuell beeindrucken (Wow-Faktor)
2. Medizinisch korrekt — keine erfundenen Verbindungen
3. Performant — 60fps bei Pan/Zoom trotz ~105 Knoten und ~160 Kanten
4. Verständlich — auch ohne medizinisches Vorwissen navigierbar
5. On-Brand — Juvantis Teal-Farbwelt durchgängig erkennbar

## WICHTIG
- Lies die JSON-Datei KOMPLETT ein und verwende ALLE Knoten und Kanten
- Schreibe EINE einzige HTML-Datei, kein Multi-File-Setup
- Teste mental ob alle 15 Organe, 50 Laborwerte und 40 Erkrankungen
  im Graph erscheinen
- Die JSON-Daten sollen INLINE in die HTML-Datei eingebettet werden
  (kein fetch() nötig — die Datei muss standalone funktionieren)
```

## Verwendung

1. Terminal öffnen (Claude Code in Cursor oder CLI)
2. In das Claude-OS Verzeichnis navigieren
3. Den Prompt oben kopieren und einfügen
4. Claude Code erstellt `projects/Juvantis/website/knowledge-graph/index.html`
5. HTML-Datei im Browser öffnen — fertig

## Dateien in diesem Ordner

| Datei | Zweck |
|-------|-------|
| `medical-knowledge-graph.json` | Komplette Datenbasis (15 Organe, 50 Labs, 40 Erkrankungen, 160+ Kanten) |
| `PROMPT_KNOWLEDGE_GRAPH.md` | Diese Datei — Prompt + Dokumentation |
| `index.html` | (wird von Claude Code erstellt) — Der fertige Knowledge Graph |

## Datenstruktur-Übersicht

### Organsysteme (15)
Herz, Leber, Niere, Lunge, Schilddrüse, Pankreas, Knochenmark,
Magen-Darm, Prostata, Gehirn, Nebenniere, Knochen/Skelett, Milz,
Muskulatur, Blutgefäße

### Laborwert-Kategorien (50 Werte)
Herzmarker, Leberenzyme, Nierenfunktion, Elektrolyte, Schilddrüse,
Glukosestoffwechsel, Pankreas, Blutbild, Entzündung, Eisenstoffwechsel,
Vitamine, Lipide, Gerinnung, Tumormarker, Nebenniere, Blutgasanalyse,
Muskelmarker

### Erkrankungs-Kategorien (40 Erkrankungen)
Kardiovaskulär, Hepatobiliär, Nephrologie, Endokrinologie, Stoffwechsel,
Gastrointestinal, Hämatologie, Pulmologie, Muskuloskeletal, Onkologie,
Infektiologie, Autoimmun

### Kantentypen (160+ Verbindungen)
- organ_produces_lab: Organ → welche Laborwerte es beeinflusst
- lab_indicates_disease: Laborwert-Abweichung → welche Erkrankung sie anzeigt
- disease_affects_organ: Erkrankung → welche Organe sie schädigt
