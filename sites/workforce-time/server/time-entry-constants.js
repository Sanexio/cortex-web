// Single Source of Truth für time_entries-Strings.
//
// Hintergrund (2026-06-14): Analog zum absence_requests-Drift hatte
// der Stempeluhr-Pfad (T-004a) englische Status- und Type-Strings
// hartcodiert ('running', 'completed', 'regular'), während alle
// anderen Code-Wege und die DB deutsche Werte erwarten/enthalten
// ('entwurf', 'aenderungsantrag', 'freigegeben', 'konflikt',
// 'Arbeitszeit', 'Schichtunabhaengig'). Folge: gestempelte Zeiten
// wären in keiner Liste, keinem Dashboard und keiner Auswertung
// sichtbar — weil alle Filter auf deutsche Werte filtern.
//
// Lehre: Status- und Type-Vergleiche dürfen nicht mehr als Inline-
// String-Literal im Code stehen. Stattdessen importiere die
// Konstanten aus diesem Modul. DB-Trigger (siehe migrate())
// blocken ungültige Schreiboperationen.

/**
 * Erlaubte Werte für time_entries.status.
 *
 * - `LAUFEND`: Stempel-Session ist aktiv (stamp_start ohne stamp_end).
 *   Nur für die Stempeluhr-Pipeline.
 * - `ENTWURF`: Neuer Eintrag, wartet auf Freigabe durch Leitung.
 *   Default-Status nach stamp_end und für manuell angelegte Einträge.
 * - `AENDERUNGSANTRAG`: Mitarbeitender hat eine Korrektur beantragt.
 * - `FREIGEGEBEN`: Von Leitung genehmigt, geht in Lohnabrechnung.
 * - `KONFLIKT`: Sync- oder Plan-Konflikt erkannt, manuelle Prüfung
 *   nötig.
 */
export const TIME_ENTRY_STATUS = Object.freeze({
  LAUFEND: "laufend",
  ENTWURF: "entwurf",
  AENDERUNGSANTRAG: "aenderungsantrag",
  FREIGEGEBEN: "freigegeben",
  KONFLIKT: "konflikt"
});

export const TIME_ENTRY_STATUS_VALUES = Object.freeze(Object.values(TIME_ENTRY_STATUS));

/**
 * Erlaubte Werte für time_entries.entry_type.
 *
 * - `ARBEITSZEIT`: Reguläre Arbeitszeit innerhalb einer geplanten
 *   Schicht.
 * - `SCHICHTUNABHAENGIG`: Stempelung ohne hinterlegte Schicht
 *   (z.B. Dienstgang, Homeoffice).
 */
export const TIME_ENTRY_TYPE = Object.freeze({
  ARBEITSZEIT: "Arbeitszeit",
  SCHICHTUNABHAENGIG: "Schichtunabhaengig"
});

export const TIME_ENTRY_TYPE_VALUES = Object.freeze(Object.values(TIME_ENTRY_TYPE));
