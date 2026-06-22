// Single Source of Truth für shift_assignments und
// shift_swap_requests Status-Strings.
//
// Hintergrund (2026-06-14): shifts hat keine status-Spalte (nur
// removed_from_source). shift_assignments + shift_swap_requests
// nutzen englische Strings sowohl in der DB als auch im Code — anders
// als absence_requests / time_entries, wo der Legacy-Import-Pfad
// deutsche Strings reinbringt. Dieser Audit hat KEINEN Drift in der
// Swap-Logik gefunden; das Modul existiert als Single Source of Truth,
// damit der Konsistenz-Pattern über alle Domänen einheitlich ist
// und damit DB-Trigger als Schutzschicht installiert werden können.

/**
 * Erlaubte Werte für shift_assignments.status.
 *
 * - `ASSIGNED`: Mitarbeitender ist der Schicht zugewiesen.
 * - `CANCELLED`: Zuweisung wurde storniert (z.B. nach Tausch
 *   storniert).
 *
 * Bisher nur `ASSIGNED` in Verwendung; `CANCELLED` reserviert für
 * Plan-Tausch-Workflow.
 */
export const SHIFT_ASSIGNMENT_STATUS = Object.freeze({
  ASSIGNED: "assigned",
  CANCELLED: "cancelled"
});

export const SHIFT_ASSIGNMENT_STATUS_VALUES = Object.freeze(
  Object.values(SHIFT_ASSIGNMENT_STATUS)
);

/**
 * Erlaubte Werte für shift_swap_requests.status — Tausch-Workflow.
 *
 * State-Machine:
 *
 *     [request created] -> OPEN
 *                          |
 *           ┌─────────────┼─────────────┐
 *           │             │             │
 *           v             v             v
 *        ACCEPTED      DECLINED     CANCELLED
 *        (target       (target       (requester
 *         übernimmt)   lehnt ab)     storniert)
 *
 * Übergänge:
 * - OPEN -> ACCEPTED: über acceptSwapRequest(). Löst zugleich
 *   shift_assignments-Update aus (alter Assignee raus, neuer rein).
 * - OPEN -> DECLINED: über declineSwapRequest(). Schicht bleibt
 *   beim ursprünglichen Antragsteller.
 * - OPEN -> CANCELLED: über cancelSwapRequest(). Nur Antragsteller
 *   selbst darf stornieren.
 *
 * ACCEPTED / DECLINED / CANCELLED sind Endzustände — kein
 * Re-Open mehr möglich.
 */
export const SWAP_REQUEST_STATUS = Object.freeze({
  OPEN: "open",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  CANCELLED: "cancelled"
});

export const SWAP_REQUEST_STATUS_VALUES = Object.freeze(
  Object.values(SWAP_REQUEST_STATUS)
);
