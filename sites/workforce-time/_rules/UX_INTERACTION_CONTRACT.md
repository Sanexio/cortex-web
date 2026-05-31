# UX Interaction Contract

Stand: 2026-05-25

## PM-UX-001 - Keine toten Planungsflaechen

Jede sichtbar gerahmte oder kartenartige Flaeche in Kalender, Schichtplanung,
Arbeitszeiten-, Pausen- und Urlaubsplanung muss eine eindeutige Funktion haben.
Wenn eine Flaeche keine Funktion hat, wird sie als reine Typografie/Trennlinie
gerendert oder entfernt.

## PM-UX-002 - Uebersicht zuerst

UX ist fuer dieses Projekt eine Produktregel. Die wichtigsten Informationen
muessen auf einen Blick erfassbar sein: Status, offene Entscheidungen,
Besetzung, Urlaub und naechste Aktion. Redundante Tagesdetails im Kalender
werden verdichtet, wenn Zeile, Spalte oder Schichtschema dieselbe Information
bereits erklaeren. Lesbarkeit, Hierarchie und schnelle Orientierung gehen vor
vollstaendiger Wiederholung jeder Einzelinformation.

## PM-UX-003 - Wochenmatrix ist Kern der Schichtplanung

Der Schichtplaner beginnt mit der Kalender-Wochenmatrix: Wochentage stehen in
den Spalten, Schicht-/Planfelder in den Zeilen. Separate KPI-Container ueber
dem Kalender und ein zweites Karten-Dashboard werden vermieden. Die Matrix
selbst muss alle wichtigen Signale kompakt tragen: Frueh/Spaet-Marker,
Initialen, Besetzungsstatus, Abwesenheitshinweise, freie Slots und klare
Klickziele.

## Klickvertrag fuer den Wochenplaner

- Geplante Schicht: oeffnet direkt den Bearbeitungsdialog dieser Schicht.
- Freier Slot oder leere Zelle: oeffnet den Anlegen-Dialog mit Datum, Schicht
  und Dienst vorausgefuellt.
- Tageskopf: oeffnet die erste geplante Schicht des Tages oder legt eine
  Standardschicht fuer diesen Tag an.
- Schichtzeile: oeffnet die erste geplante Schicht dieser Zeile oder legt die
  erste passende Schicht der Woche an.
- Kategoriezeile: oeffnet die erste geplante Schicht der Kategorie oder legt
  die erste passende Schicht der Woche an.
- Wochen-Pill: springt zur aktuellen Kalenderwoche.
- Kalender-Kennzahl, falls sichtbar: fuehrt zum passenden Bereich, z. B.
  Schichtplan, Arbeitszeiten oder Urlaub. Stoerende Kennzahl-Container oberhalb
  der Wochenmatrix werden vermieden.
- Mitarbeiter-Wochenmatrix: fuehrt je Zelle zur konkreten Schicht, zu
  Arbeitszeiten, Urlaub oder zum Anlegen einer neuen Standardschicht.

## Verifikation vor `done`

Nach Kalender-/Planer-Aenderungen muss ein Browser-Klickaudit laufen:

1. Geplante Schicht anklicken und Bearbeitungsdialog pruefen.
2. Freien Slot und leere Zellflaeche anklicken und Anlegen-Dialog pruefen.
3. Tageskopf, Schichtzeile, Kategoriezeile und Wochen-Pill anklicken.
4. Matrixzellen und sichtbare Kennzahlen anklicken, falls Kennzahlen vorhanden
   sind.
5. Browser-Console auf Fehler pruefen.

Diese Regel ergaenzt die Nexus-Regel `Fertig = funktionstuechtig` und die
Cortex-Web-Regel, dass Validierung/Verifikation vor Abschluss dokumentiert wird.
