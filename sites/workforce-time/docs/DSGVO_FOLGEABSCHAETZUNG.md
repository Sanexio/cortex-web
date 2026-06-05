# DSGVO-Folgenabschaetzung — Workforce-Time (Draft)

Status: Projekt-Draft fuer Review. Keine Rechtsberatung, keine
Nexus-Freigabe. Dieses Dokument beschreibt die technische Sicht der
Workforce-Time-App und die noch vom Betreiber zu bestaetigenden Punkte.

## 1. Verarbeitung

Workforce-Time verarbeitet Arbeitszeit-, Schicht-, Abwesenheits- und
Login-Daten fuer eine kleine Organisation. Zweck ist die Erfuellung von
Arbeitszeitdokumentation, Dienstplanung, Freigabeprozessen und
Lohnvorbereitung.

| Kategorie | Beispiele | Zweck |
|---|---|---|
| Identitaet | E-Mail, Anzeigename, Rolle, Mitarbeiter-ID | Login, Rollensteuerung, Zuordnung |
| Arbeitszeit | Start/Ende, Pausen, Status, Korrekturen | ArbZG-Dokumentation, Freigabe, Payroll |
| Planung | Schichten, Arbeitsbereiche, Standort | Dienstplanung, Konflikterkennung |
| Abwesenheit | Zeitraum, Typ, Status | Urlaubs-/Abwesenheitsplanung |
| Auth-Sicherheit | Magic-Link-Events, TOTP-Status, Sessions, Device-Pairing | Zugriffsschutz, Missbrauchserkennung |
| Audit | Zeit, Eventtyp, Benutzerbezug, IP/User-Agent, technische Metadaten | Nachvollziehbarkeit sicherheitsrelevanter Aktionen |

Nicht vorgesehen: Gesundheitsdaten, Diagnosen, Patientendaten,
Leistungsdaten zur medizinischen Behandlung, Preise oder
Marketingprofile.

## 2. Rechtsgrundlagen und Rollen

Betreiberentscheidung erforderlich:

- Verantwortlicher: jeweiliger Tenant/Arbeitgeber.
- Auftragsverarbeiter: Hosting-, SMTP-, Backup- und ggf.
  Administrationsdienstleister.
- Rechtsgrundlagen voraussichtlich:
  - Art. 6 Abs. 1 lit. b DSGVO fuer Arbeitsverhaeltnis-nahe
    Organisation.
  - Art. 6 Abs. 1 lit. c DSGVO fuer gesetzliche Dokumentationspflichten.
  - Art. 6 Abs. 1 lit. f DSGVO fuer Sicherheits-Audit und
    Missbrauchserkennung.

Externe Dienstleister muessen mit AVV, Speicherort und Loeschkonzept
dokumentiert werden.

## 3. Datenfluss

1. Benutzer beantragt Magic-Link.
2. API prueft E-Mail gegen Tenant-Konfiguration.
3. Magic-Link wird per SMTP versendet oder in Dev lokal ausgegeben.
4. Session wird erst nach Magic-Link und TOTP freigegeben.
5. Arbeitszeit-/Planungsdaten werden in SQLite gespeichert.
6. Backups werden lokal erzeugt und optional per Pull offsite kopiert.
7. Ordio-Import liest Quellsystem read-only und schreibt gepruefte
   Snapshots in Workforce-Time.

## 4. Risiken

| Risiko | Bewertung | Massnahmen |
|---|---|---|
| Unbefugter Zugriff auf Arbeitszeitdaten | hoch | Auth fail-closed, Magic-Link, TOTP, Admin-Gates, Secure-Cookies in Produktion |
| Datenverlust | hoch | SQLite Online-Backup, Restore-Skript, Retention, Restore-Probe |
| Uebermittlung an falschen SMTP-Empfaenger | mittel | E-Mail-Allowlist aus Tenant-Konfiguration, Mailpit fuer lokale Tests |
| Zu weitreichende Audit-Daten | mittel | Metadaten minimieren, keine Payloads mit Fachinhalten loggen |
| Ordio-Import erzeugt falsche Zuordnungen | mittel | Dry-Run, Snapshot-Review, Backup vor Import, Fehlerzaehler |
| Offsite-Backup kompromittiert | hoch | Pull-Prinzip, verschluesseltes Ziel, keine Server-Credentials fuer Backup-Ziel |
| Mandantenverwechslung | hoch | Tenant-Slug und erlaubte Hosts im Login/API-Kontext pruefen |

## 5. Technische und organisatorische Massnahmen

- Authentifizierung: Magic-Link plus TOTP; Produktion fail-closed.
- Rollen: Admin/Employee, serverseitig geprueft.
- Transport: Reverse-Proxy mit HTTPS in Produktion.
- Speicher: SQLite-Datei unter Tenant-/Deploy-Pfad, nicht im Git.
- Secrets: nur Umgebung/Passwortmanager, keine Repo-Dateien.
- Backup: `tools/backup-db.sh`, `tools/restore-db.sh`,
  systemd-Timer, Restore-Probe.
- Audit: separate Auth-Audit-Tabelle, Eventtypen statt Vollpayloads.
- Import: Ordio-Pipeline read-only, Dry-Run-fähig, keine Screenshots mit
  Echtdaten.

## 6. Loeschung und Aufbewahrung

Betreiberentscheidung erforderlich:

- Arbeitszeitnachweise mindestens gemaess anwendbaren gesetzlichen
  Fristen aufbewahren.
- Auth-Sessions kurzlebig; Magic-Links nach Ablauf/Verwendung unbrauchbar.
- Audit-Events nur so lange, wie fuer Sicherheit und Nachweis erforderlich.
- Backups mit definierter Retention; Offsite-Kopien muessen dieselbe
  Loeschlogik abbilden.

## 7. Betroffenenrechte

Erforderliche Betreiberprozesse:

- Auskunft: Export pro Mitarbeiter aus DB/Reports.
- Berichtigung: Korrekturworkflow fuer Zeiten, Admin-Freigabe.
- Loeschung/Einschraenkung: nach arbeitsrechtlicher Aufbewahrung nur
  innerhalb rechtlicher Grenzen.
- Protokollauskunft: nur soweit Sicherheitsinteressen und Rechte Dritter
  nicht entgegenstehen.

## 8. Vorlaeufiges Ergebnis

Die Verarbeitung ist fuer den Zweck erforderlich und mit den vorhandenen
Massnahmen technisch kontrollierbar. Vor Produktivbetrieb offen:

- Verantwortlichen-/AVV-Liste finalisieren.
- SMTP-Provider und Offsite-Backup-Ziel datenschutzrechtlich pruefen.
- Aufbewahrungsfristen verbindlich festlegen.
- Restore-Probe dokumentieren.
- Ordio-Live-Import erst nach Dry-Run-Review freigeben.
