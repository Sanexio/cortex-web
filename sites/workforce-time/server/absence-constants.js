// Single Source of Truth für absence_requests-Strings.
//
// Hintergrund (2026-06-14): Die App war ursprünglich mit englischen
// Status- und Type-Strings entwickelt ('vacation', 'approved', 'open').
// Beim späteren Integrationsschritt mit Ordio kamen deutsche Strings
// ('Bezahlter Urlaub', 'genehmigt', 'offen') in die DB. SQL-Filter
// wurden nur teilweise nachgezogen — Folge: calculateAbsenceQuota
// matched nie, alle Mitarbeitenden sahen 28 d Resturlaub trotz
// genehmigter Urlaubsanträge.
//
// Lehre: Status- und Type-Vergleiche dürfen nicht mehr als Inline-
// String-Literal im Code stehen. Stattdessen importiere die Konstanten
// aus diesem Modul. Wenn die DB-Strings sich jemals ändern, ist
// genau eine Datei zu pflegen, und ein DB-Trigger (siehe migrate())
// hält die Schreibseite konsistent.

/**
 * Erlaubte Werte für absence_requests.status.
 * Strikt enforced via DB-Trigger.
 */
export const ABSENCE_STATUS = Object.freeze({
  OPEN: "offen",
  APPROVED: "genehmigt",
  REJECTED: "abgelehnt"
});

export const ABSENCE_STATUS_VALUES = Object.freeze(Object.values(ABSENCE_STATUS));

/**
 * Whitelist der absence_type-Strings, die auf das gesetzliche/
 * tarifliche Urlaubskontingent (Resturlaub-Quota) angerechnet werden.
 * Krankheit, Berufsschule und Feiertagsausgleich zählen explizit
 * NICHT — sie sind eigene Absenz-Typen mit eigener Logik.
 */
export const VACATION_ABSENCE_TYPES = Object.freeze([
  "Bezahlter Urlaub",
  "Unbezahlter Urlaub",
  "Sonderurlaub"
]);

/**
 * Vollständige Whitelist aller bekannten absence_type-Strings aus
 * Ordio. Wird zur Validierung neuer Einträge im App-Formular benutzt
 * (createAbsenceRequest). Wenn Ordio einen neuen Typ einführt, muss
 * er hier ergänzt werden, sonst wird der Import abgelehnt.
 */
export const KNOWN_ABSENCE_TYPES = Object.freeze([
  ...VACATION_ABSENCE_TYPES,
  "Krankheit",
  "Berufsschule",
  "Feiertagsausgleich",
  "Überstundenabbau",
  "Fortbildung",
  "Dienstgang",
  "Mutterschutz",
  "Elternzeit"
]);
