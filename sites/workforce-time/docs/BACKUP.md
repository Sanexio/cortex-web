# Workforce-Time — Backup-Konzept

Die gesamte Fachlichkeit (Zeiten, Schichten, Urlaube, Auth-Konten,
Personalnummern) liegt in **einer SQLite-Datei**:
`$CORTEX_TENANT_DIR/trunk/workforce/db/arbeitszeiten.sqlite`.
Diese Datei ist bewusst **gitignored** (personenbezogene Daten gehören
nicht in ein Repo) — ohne eigenes Backup wäre sie ein Single Point of
Failure. Arbeitszeitnachweise unterliegen gesetzlichen
Aufbewahrungsfristen (§ 16 Abs. 2 ArbZG: mindestens 2 Jahre; steuerlich
relevante Lohnunterlagen länger) — Datenverlust ist hier nicht nur
ärgerlich, sondern ein Compliance-Problem.

## Die drei Schichten

| Schicht | Was | Wogegen schützt sie |
|---|---|---|
| 1. Tägliches lokales Backup | `tools/backup-db.sh` via systemd-Timer (02:30) | Defekte DB, Fehlbedienung, fehlgeschlagene Migration/Import |
| 2. Offsite-Kopie | Backup-Verzeichnis regelmäßig vom Server wegkopieren (SFTP/rsync/rclone von einem anderen Rechner aus) | Serververlust, Hoster-Ausfall, Ransomware |
| 3. Restore-Probe | Quartalsweise einen Restore in eine Wegwerf-Umgebung durchspielen | „Backup existiert, lässt sich aber nicht einspielen" |

## Schicht 1 — Tägliches Backup (automatisch)

`tools/backup-db.sh` nutzt SQLites Online-Backup (`.backup`):
**konsistenter Snapshot ohne Downtime**, auch während die API läuft.
Jeder Snapshot wird vor dem Erfolg mit `PRAGMA integrity_check`
verifiziert, dann gzip-komprimiert. Retention: die neuesten 30 Stände
(per `WORKFORCE_BACKUP_KEEP` änderbar).

Produktion (systemd):

```bash
cp deploy/systemd/workforce-time-backup.{service,timer} /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now workforce-time-backup.timer
systemctl start workforce-time-backup.service   # sofortiger Testlauf
journalctl -u workforce-backup -n 5
```

Entwicklungs-/Einzelrechner (ohne systemd): denselben Befehl per cron
oder launchd täglich ausführen:

```bash
CORTEX_TENANT_DIR=~/Cortex/projects/Sanexio-Tenant tools/backup-db.sh
```

## Schicht 2 — Offsite

Das Backup-Verzeichnis (`/var/lib/workforce-time/backups/` bzw.
`<db-dir>/backups/`) von **einem anderen Rechner aus** regelmäßig
abholen, z. B.:

```bash
rsync -av --delete server:/var/lib/workforce-time/backups/ ~/workforce-backups/
```

Wichtig: Pull statt Push (der Server braucht keine Zugangsdaten zum
Backup-Ziel — Ransomware auf dem Server kann die Offsite-Kopie dann
nicht löschen). Die Kopien enthalten personenbezogene Daten: Ziel
verschlüsselt halten (FileVault/verschlüsseltes Volume genügt).

## Schicht 3 — Restore

```bash
# 1. API anhalten
systemctl stop workforce-time

# 2. Backup prüfen (geht auch jederzeit ohne Stopp):
tools/backup-db.sh --verify-only backups/arbeitszeiten-YYYYMMDD-HHMMSS.sqlite.gz

# 3. Einspielen
gunzip -k backups/arbeitszeiten-YYYYMMDD-HHMMSS.sqlite.gz
mv $DB $DB.broken-$(date +%s)
mv backups/arbeitszeiten-YYYYMMDD-HHMMSS.sqlite $DB

# 4. Verifizieren + starten
sqlite3 $DB "PRAGMA integrity_check;"
systemctl start workforce-time
```

**Restore-Probe quartalsweise:** Schritt 2–4 gegen eine Kopie in einem
Temp-Verzeichnis durchspielen und einmal die App dagegen starten
(`ARBEITSZEITEN_DB=<temp-pfad> node server/api.js`). Ein Backup gilt
erst als Backup, wenn ein Restore daraus bewiesen wurde.

## Was NICHT über dieses Konzept gesichert wird

- **Anwendungscode** — liegt in Git (GitHub ist das Backup).
- **tenant.config.json** — liegt im (privaten) Tenant-Repo in Git.
- **`.env` / Secrets** (`WORKFORCE_TOTP_KEY`, SMTP-, DATEV-Nummern) —
  bewusst nirgends im Repo; separat im Passwort-Manager hinterlegen.
  Ohne `WORKFORCE_TOTP_KEY` sind die TOTP-Secrets im Restore wertlos
  (alle Mitarbeiter müssten 2FA neu einrichten — verkraftbar, aber
  vermeidbar).
