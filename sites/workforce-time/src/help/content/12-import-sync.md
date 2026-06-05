> **Admin-Bereich** — dieser Bereich richtet sich an die Praxisleitung (bzw. die technische Betreuung).

Der Bereich **Import & Sync** dient der Datenübernahme aus Altsystemen und dem Abgleich zwischen Systemen. Im Praxisalltag werden Sie ihn selten brauchen.

## Import-Arten

| Aktion | Zweck |
|---|---|
| **Delta-Snapshot importieren** | Übernimmt einen Datenbestand aus einem Altsystem/Export; bereits vorhandene Einträge werden erkannt und nicht doppelt angelegt |
| **Demo-Import** | Spielt Beispieldaten zum Ausprobieren ein — nicht in einer produktiven Umgebung verwenden |

Jeder Lauf erscheint in der **Batch-Historie** mit Zeitstempel, Status und Anzahl der übernommenen Datensätze.

## Sync-Konflikte lösen

Weichen Quelldaten und lokaler Stand voneinander ab, entsteht ein **Sync-Konflikt**. Die Konflikt-Tabelle zeigt beide Versionen nebeneinander (Quelle vs. lokal); Sie entscheiden pro Eintrag, welche Version gilt. Gelöste Konflikte wechseln den Status von **offen** zu **gelöst**.

> **Vorsicht:** Importe verändern den Datenbestand dauerhaft. Im Zweifel vorher die technische Betreuung einbeziehen — und niemals einen Import „einfach ausprobieren".
