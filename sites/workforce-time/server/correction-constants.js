// Single Source of Truth für time_entry_corrections Status-Strings.
//
// Hintergrund (2026-06-14): time_entry_corrections ist die Tabelle
// für Mitarbeiter-Korrekturanträge an bereits angelegten time_entries
// ("Pause war 30 statt 60 Min", "Endzeit war 18:00 nicht 17:30").
// Vier-Augen-Prinzip: Reviewer != Antragsteller; Approval übernimmt
// die requested_changes_json-Felder in den time_entries-Datensatz.
//
// DB und Code nutzen englische Strings konsistent ('open',
// 'approved', 'rejected'). Anders als absence_requests / time_entries
// gibt es hier keinen Ordio-Importpfad — Korrekturen entstehen
// ausschließlich im App-Workflow. Trotzdem als Konstanten gekapselt
// und mit DB-Trigger abgesichert, damit das Konsistenz-Pattern über
// alle Domänen einheitlich bleibt.

/**
 * Erlaubte Werte für time_entry_corrections.status.
 *
 * State-Machine:
 *
 *     [Mitarbeiter beantragt] -> OPEN
 *                                  |
 *                  ┌──────────────┴──────────────┐
 *                  v                             v
 *               APPROVED                      REJECTED
 *               (Reviewer genehmigt;          (Reviewer
 *                requested_changes wird       lehnt ab)
 *                auf time_entries angewandt)
 *
 * Übergänge:
 * - OPEN -> APPROVED: über approveTimeEntryCorrection().
 *   Whitelist-Felder (startsAt, endsAt, paidBreakMinutes,
 *   unpaidBreakMinutes, note) werden auf time_entries übertragen.
 *   4-Augen-Prinzip: Reviewer != Antragsteller.
 * - OPEN -> REJECTED: über rejectTimeEntryCorrection().
 *   time_entries bleibt unverändert; review_note dokumentiert Grund.
 *
 * APPROVED / REJECTED sind Endzustände.
 */
export const CORRECTION_STATUS = Object.freeze({
  OPEN: "open",
  APPROVED: "approved",
  REJECTED: "rejected"
});

export const CORRECTION_STATUS_VALUES = Object.freeze(
  Object.values(CORRECTION_STATUS)
);
