# Workforce-Time — Produktiv-Deployment

Vorbedingungen und verifizierbare Schritte für den Gang von Staging auf die
produktive Subdomain. Diese Liste fasst die Befunde der adversarialen
Pre-Deploy-Review (2026-06-05) zusammen; die mit ✅ markierten Punkte sind im
Code/in den Unit-Files bereits adressiert, die übrigen sind Deploy-Zeit-Pflicht.

## 1. Laufzeit

- **Node ≥ 24** (`package.json` `engines`). Grund: der Server nutzt das
  eingebaute `node:sqlite` (`DatabaseSync`), das erst ab Node 24 ohne
  `--experimental-sqlite`-Flag verfügbar ist. Ältere LTS (18/20/22) starten
  nicht. Node als gepinntes Binary bereitstellen, nicht „was der Hoster hat".
- Keine Runtime-NPM-Abhängigkeiten im Server (nur `node:`-Builtins) — `dist/`
  ist vorgebaut, `server/` läuft ohne `node_modules`.

## 2. Pflicht-Umgebungsvariablen (`/etc/workforce-time.env`)

| Variable | Zweck | Fehlt sie → |
|---|---|---|
| `NODE_ENV=production` | aktiviert Auth-Enforcement, `Secure`-Cookie, prod-SMTP-Default | ✅ in der Unit gesetzt |
| `WORKFORCE_AUTH_ENFORCE=1` | Defense-in-Depth (Gate ist ohnehin fail-closed) | ✅ in der Unit gesetzt |
| `WORKFORCE_TOTP_KEY` | entschlüsselt die TOTP-Secrets | **Boot bricht hart ab** (fail-fast, H10) |
| `CORTEX_TENANT_DIR` | Tenant-Config (read-only ok) | Tenant-Daten/Auth-User-Liste fehlen |
| `ARBEITSZEITEN_DB` | DB unter dem schreibbaren Pfad | ✅ in der Unit auf `/var/lib/workforce-time/db/...` gepinnt (C4) |
| `WORKFORCE_PUBLIC_BASE_URL` | Domain in Magic-Link-Mails | Links zeigen auf falschen Host |
| `DATEV_BERATERNUMMER`, `DATEV_MANDANTENNUMMER` | LODAS-Kopf | Platzhalter-Nullen im Lohn-Export |

> `WORKFORCE_TOTP_KEY` zusätzlich im Passwort-Manager **und** in der
> Offsite-Backup-Doku hinterlegen — ohne ihn sind Backups der TOTP-Secrets
> wertlos (alle MA müssten 2FA neu einrichten).

## 3. SMTP (Login funktioniert nur mit Mailversand!)

Der Login ist passwortlos per Magic-Link — **ohne funktionierenden Mailversand
kann sich niemand einloggen.** Zwei unterstützte Wege:

- **Lokaler Relay (einfachster Weg):** Postfix/sendmail auf `127.0.0.1:25`.
  Default in Produktion ist genau `127.0.0.1:25`, ohne weitere Config.
- **Externer Provider:** Tenant-`auth.smtp`-Block mit
  `{ host, port, secure, user, password_env, require_tls }`. Der Client kann
  implizites TLS (:465), opportunistisches STARTTLS und AUTH LOGIN.
  `password_env` benennt die Env-Var mit dem Passwort (nie im Klartext in die
  Config). `require_tls: true` erzwingt STARTTLS. Externer Versand von
  Mitarbeiter-Mailadressen ⇒ **AVV nach Art. 28 DSGVO** mit dem Anbieter.

**Pflicht-Smoke:** mit `NODE_ENV=production` einen echten Magic-Link an eine
Test-Adresse zustellen **und** TOTP-Enroll/Verify durchspielen — nicht nur
`/api/health`.

## 4. Datenbank

- **WAL aktiv** ✅ (`db.js` setzt `journal_mode=WAL`, `busy_timeout=10000`).
  Erlaubt gleichzeitige Leser/Schreiber (8 MA + Kiosk) ohne `SQLITE_BUSY`.
- WAL legt `arbeitszeiten.sqlite-wal` und `-shm` neben die DB. Beide liegen
  unter `ReadWritePaths=/var/lib/workforce-time` ✅ und gehören beim Restore
  mitgedacht (das `.backup` aus `tools/backup-db.sh` erfasst sie konsistent).
- Verifikation nach Start: `sqlite3 <db> "PRAGMA journal_mode;"` ⇒ `wal`.

## 5. Reverse-Proxy

- HTTP→HTTPS-Redirect aktiv, Zertifikat ausgestellt.
- `/api/*` → `127.0.0.1:5175`, sonst SPA-Fallback aus `dist/`.
- Probe, dass DB/`server/` **nicht** über den Proxy erreichbar sind
  (404 auf `/server/api.js` und auf die `.sqlite`).
- API bindet nur an `127.0.0.1` ✅ (`ARBEITSZEITEN_API_HOST` nicht auf
  `0.0.0.0` setzen).

## 6. Backup & Rollback

- Tägliches lokales Backup via `workforce-time-backup.timer` ✅; **Offsite-Pull
  einrichten** (nicht nur dokumentiert) und einen Restore einmal real
  durchspielen (siehe `docs/BACKUP.md`).
- Vor jedem Deploy `dist/` + `server/` serverseitig nach `*.prev` sichern und
  den deployten Git-Commit notieren, damit ein Rollback möglich ist.

## 7. Verifizierter Boot-Smoke (in dieser Reihenfolge)

1. `systemctl start workforce-time` → `systemctl status` ist `active`.
2. `PRAGMA journal_mode` = `wal`.
3. Ohne Cookie: `GET /api/bootstrap` ⇒ **401** (Gate fail-closed).
4. Magic-Link real zugestellt, TOTP-Login bis ins Dashboard.
5. Ein Schreibvorgang (Stempeln) persistiert (prüft den DB-Schreibpfad/C4).
6. Mitarbeiter-Login ⇒ Admin-Routen (Payroll/Admin) ⇒ **403**.
