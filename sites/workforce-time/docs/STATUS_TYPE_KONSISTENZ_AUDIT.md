# Merkblatt — Audit „Englisch-Deutsch-Drift" (workforce-time)

**Zeitraum**: 2026-06-14
**Commits**: `fe63f8b` → `93ba547` → `e752957` → `62ae4c2`
**Pfad**: `sites/workforce-time/server/`

---

## 1. Was war das Ursprungsproblem

Im Tenant-Betrieb fiel auf: Resturlaub für alle Mitarbeitenden stand
auf **28 Tage** — unabhängig davon, dass einige nachweislich bereits
zweistellige Urlaubstage genommen hatten.

**Wurzel**: Der Code stammte aus einer Phase, in der die App
ausschließlich englische Status-/Type-Strings nutzte (`'vacation'`,
`'approved'`, `'open'`, `'running'`, `'regular'`). Mit dem späteren
Anschluss an den **Legacy-Import** kamen deutsche Strings (`'genehmigt'`,
`'offen'`, `'Bezahlter Urlaub'`, `'Arbeitszeit'`) in die DB. Die
SQL-Filter im Code wurden nur teilweise mit umgestellt — drei Stellen
wurden vergessen, eine sehr brisant.

---

## 2. Die vier behobenen Bugs (Commit-Reihenfolge)

### `fe63f8b` — absence_requests

- **Quota-Bug** (User-sichtbar): `calculateAbsenceQuota` filterte SQL
  nach `'vacation'`/`'approved'`, DB hatte deutsche Werte → kein
  Match → `used=0` bei allen → 28 d Default.
- **Brutto-Berechnung**: Tagedifferenz inklusive Wochenenden.
- **Versteckter Bug Z. 3926**: Approvals-Liste filterte `status='open'`
  → alle offenen Urlaubsanträge waren in der Genehmigungs-Liste
  unsichtbar.
- **Versteckter Bug Z. 4341**: Konflikt-Check „MA stempelt, ist aber
  im Urlaub" filterte `status='approved'` → nie erkannt.

### `93ba547` — time_entries (Stempeluhr)

- **Latenter Bug**: `stampStart`/`stampEnd` schrieben
  `status='running'`/`'completed'` und `entry_type='regular'` — alle
  drei englisch, DB-Domäne ist deutsch.
- **Folge** (wäre eingetreten beim ersten echten Stempelvorgang):
  Stempelzeiten unsichtbar in UI, Dashboard, Reports und
  Lohnabrechnung.
- **Glück**: Bisher hat noch kein MA real gestempelt, kein
  Datenschaden.

### `e752957` — shift_assignments + Tausch-Logik

- **Kein Drift gefunden** — Swap-Logik ist sauber englisch in
  Code+DB.
- Trotzdem auf Konstanten migriert + Trigger drauf, damit das
  Konsistenz-Pattern flächendeckend ist.

### `62ae4c2` — time_entry_corrections

- **Kein Drift gefunden** — konsistent englisch.
- Analog zu Commit 3: Konsolidierung + Trigger zum Abschluss des
  Audits.

---

## 3. Strukturelle Maßnahmen (Drei-Schichten-Verteidigung)

| Schicht | Wo lebt sie | Was sie blockt |
|---|---|---|
| **1. Konstanten-Module** | `server/*-constants.js` | Magic Strings im Code-Review-Diff sichtbar; IDE-Autocomplete; Typo-Schutz |
| **2. App-Validierung** | `createAbsenceRequest` (Whitelist) | Tippfehler oder falsche Sprache aus dem UI-Formular |
| **3. DB-Trigger** | `BEFORE INSERT`/`BEFORE UPDATE OF` per `installStatusGuard(...)` | Jeder ungültige Wert aus beliebiger Quelle: App, Sync, manuelles SQL, Migration |

**Wichtig**: Jede Schicht greift unabhängig. Wenn eine versagt, fängt
die nächste.

---

## 4. Bestand nach Audit

### 5 Konstanten-Module (Single Source of Truth)

- `server/absence-constants.js` — `ABSENCE_STATUS`,
  `VACATION_ABSENCE_TYPES`, `KNOWN_ABSENCE_TYPES`
- `server/time-entry-constants.js` — `TIME_ENTRY_STATUS` (inkl. neuem
  `LAUFEND`), `TIME_ENTRY_TYPE`
- `server/shift-constants.js` — `SHIFT_ASSIGNMENT_STATUS`,
  `SWAP_REQUEST_STATUS`
- `server/correction-constants.js` — `CORRECTION_STATUS`

Alle nutzen `Object.freeze` (immutable) + State-Machine-Doku im
Header.

### 12 aktive DB-Trigger über 5 Tabellen + 5 Spalten

| Tabelle | Spalte | Erlaubte Werte |
|---|---|---|
| `absence_requests` | `status` | offen \| genehmigt \| abgelehnt |
| `time_entries` | `status` | laufend \| entwurf \| aenderungsantrag \| freigegeben \| konflikt |
| `time_entries` | `entry_type` | Arbeitszeit \| Schichtunabhaengig |
| `shift_assignments` | `status` | assigned \| cancelled |
| `shift_swap_requests` | `status` | open \| accepted \| declined \| cancelled |
| `time_entry_corrections` | `status` | open \| approved \| rejected |

Pro Spalte ein INSERT- und ein UPDATE-Trigger → 12 Stück.

### 1 generischer Helper

`installStatusGuard(table, column, values)` — schreibt die
Trigger-DDL idempotent (DROP + CREATE) beim Service-Boot. Neue
Tabellen brauchen nur 3 Zeilen Boilerplate.

---

## 5. Verifikation nach Fix

`/api/absences/quota?year=YYYY` liefert pro Mitarbeitendem das
korrekte Tripel `(allocated, used, remaining)`:

- `allocated` aus `tenant.config.workforce.absence_quotas.default_days`
  oder `by_employee.<id>`.
- `used` = Summe der genehmigten Urlaubstage (Mo-Fr) im Jahr.
- `remaining` = `allocated - used - pending`, geklammert auf `>= 0`.

Vorher: alle MA zeigten `used=0` und `remaining=allocated`. Nach
Fix: `used` reflektiert die tatsächlich genehmigten Urlaubstage,
Wochenenden zählen nicht mit.

---

## 6. Lehren für künftige Code-Pfade

- **Status-/Type-Strings nie inline schreiben.** Immer aus dem
  zentralen Konstanten-Modul importieren. Wenn eine neue Tabelle
  Status braucht, eigenes Modul anlegen + `installStatusGuard`
  registrieren.
- **Sprachen-Konvention dokumentieren**: Welche Tabelle hat welche
  Sprache? Aktuell: `absence_requests` + `time_entries` deutsch
  (Legacy-Import-Pfad), `shift_assignments` + `shift_swap_requests` +
  `time_entry_corrections` englisch (interner Workflow).
- **`Object.freeze` ist Pflicht** für Konstanten-Module — verhindert
  versehentliche Mutation.
- **DB-Trigger statt `CHECK`-Constraint**: SQLite kann `CHECK` nicht
  nachträglich auf bestehende Tabellen setzen. Trigger sind idempotent
  ersetzbar und liefern bessere Fehlermeldungen via `RAISE(ABORT,
  '<msg>')`.
- **Bestandsdaten nicht migriert**: Die 1133 time_entries und 254
  absence_requests bleiben unverändert. Trigger gelten nur für **neue**
  Schreiboperationen.

---

## 7. Nicht im Audit (bewusst draußen)

- `sync_conflicts.status` — interne Sync-Infrastruktur, kein
  User-Touchpoint.
- **Feiertage in Quota-Berechnung** — tenant-spezifisch (Bundesland),
  braucht eigene Welle.

---

## 8. Wenn der Audit erweitert werden soll

Bei neuen Tabellen mit Enum-Spalten:

1. Neues Modul `server/<domain>-constants.js` mit `Object.freeze` +
   State-Machine-Doku.
2. Im `db.js`: Import, `ensureXxxGuard()`-Wrapper als 3-Zeilen-Funktion,
   Aufruf nach `migrate()`.
3. Bestehende Inline-Strings im Code durch Konstanten ersetzen.
4. Smoke-Test: `INSERT … status='<bad>' …` muss mit `RAISE(ABORT,
   …)`-Fehlermeldung scheitern.

---

**Audit komplett geschlossen am 2026-06-14.** Die
Drei-Schichten-Verteidigung deckt alle relevanten status/type-Spalten
der workforce-time-App ab. Sprachen-Drift kann nicht mehr stillschweigend
passieren — jeder Versuch knallt sofort und sichtbar.
