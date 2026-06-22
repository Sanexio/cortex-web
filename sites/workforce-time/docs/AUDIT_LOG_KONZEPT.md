# Audit-Log-Konzept — Workforce-Time (Draft)

Status: Projekt-Draft fuer Review. Ziel ist Nachvollziehbarkeit
sicherheits- und compliance-relevanter Aktionen ohne unnoetige
Fachpayloads im Log.

## 1. Ziele

- Nachweisen, wer sicherheitsrelevante Aktionen ausgefuehrt hat.
- Missbrauch und Fehlkonfiguration erkennen.
- Admin-Aktionen und Auth-Vorgaenge nachvollziehbar machen.
- Keine parallele Schattenkopie sensibler Fachinhalte erzeugen.

## 2. Bestehende technische Basis

Die API legt `auth_audit_log` in SQLite an:

| Feld | Zweck |
|---|---|
| `occurred_at` | Zeitpunkt |
| `event_type` | kanonischer Eventtyp |
| `user_id` | Bezug auf `auth_users`, wenn bekannt |
| `session_id` | Session-Bezug |
| `device_id` | Terminal-/Device-Bezug |
| `ip_address` | Sicherheitsdiagnose |
| `user_agent` | Sicherheitsdiagnose |
| `metadata` | minimierte JSON-Metadaten |

Abruf: `GET /api/auth/audit` ist Admin- und TOTP-geschuetzt.

## 3. Eventklassen

| Klasse | Beispiele | Muss ins Audit |
|---|---|---|
| Auth | Magic-Link angefordert, Login erfolgreich/fehlgeschlagen, Logout | ja |
| TOTP | Enrollment gestartet/bestaetigt, Recovery-Codes rotiert | ja |
| Device | Pairing erstellt, Device gekoppelt, Device widerrufen | ja |
| Rollen | Auth-User-Rolle geaendert | ja |
| Import | Dry-Run, Snapshot geschrieben, Import gestartet/abgeschlossen/fehlgeschlagen | ja |
| Datenkorrektur | Korrektur angefordert, genehmigt, abgelehnt | ja |
| Payroll | Export erzeugt, fehlende Personalnummern blockieren Export | ja |
| Lesen normaler App-Views | Dashboard, Plan, Mitarbeiterliste | nein |

## 4. Metadaten-Regeln

Erlaubt:

- technische IDs (`batchId`, `deviceId`, `employeeId`, `entryId`)
- Zaehler (`recordCount`, `errorCount`)
- Statuswerte (`approved`, `rejected`, `completed`)
- Zeitraum (`periodStart`, `periodEnd`)

Nicht loggen:

- Magic-Link-Token, TOTP-Secret, Recovery-Codes
- SMTP-Passwoerter oder andere Secrets
- komplette Import-Snapshots
- Notiztexte mit personenbezogenem Inhalt
- Arbeitszeit-Vollpayloads, wenn eine technische ID reicht

## 5. Retention

Vorschlag fuer Betreiberentscheidung:

- Auth-/Security-Events: 12 Monate.
- Import-/Payroll-/Korrektur-Events: analog fachlicher Nachweisfrist,
  mindestens solange die zugehoerigen Fachdatensaetze aufbewahrt werden.
- Debug-Events: nicht in Produktion oder maximal 30 Tage.

SQLite-Retention kann spaeter als Maintenance-Job umgesetzt werden:

```sql
DELETE FROM auth_audit_log
WHERE occurred_at < datetime('now', '-12 months')
  AND event_type IN ('magic_link_requested', 'login_fail_totp', 'session_revoked');
```

Die konkrete Frist muss vor Aktivierung mit dem Betreiber abgestimmt
werden.

## 6. Erweiterungsbedarf im Code

Kurzfristig:

- bestehende Auth-Events beibehalten.
- Rollenwechsel mit altem/neuem Wert auditieren.
- Legacy-Import-CLI bei `--post` und Import-API mit Batch-Zusammenfassung
  auditieren.

Mittelfristig:

- Admin-UI fuer Audit-Filter nach Zeitraum/Eventtyp.
- Export fuer interne Pruefung.
- Retention-Job mit Dry-Run.

## 7. Zugriffsschutz

- Audit-Anzeige nur fuer Admins mit verifizierter TOTP-Session.
- Kein Audit-Export in anonymen Dev-Dumps.
- Logs aus systemd/PM2 duerfen keine fachlichen Payloads enthalten.
- Bei Support-Faellen nur pseudonymisierte Auszuege weitergeben.

## 8. Abnahmekriterien

- Auth-Smoke erzeugt Audit-Events.
- Admin kann Audit-Events abrufen, Employee nicht.
- Secrets erscheinen weder in DB-Audit noch in stdout/stderr.
- Import- und Restore-Dokumentation verweist auf Audit-/Backup-Pflicht
  vor produktiven Migrationen.
