# Sanexio-Portal Live-Deployment — Architektur-Spec

Status: **READY-FOR-CPANEL-ACTION** (2026-06-25 23:18).
Blocker: cPanel-Subdomain `portal.sanexio.de` muss angelegt werden.

## Ziel

Sanexio-Portal-Build (`dist/` aus `npm run build`) auf eine
öffentliche Subdomain ausrollen mit HTTPS und ohne IP-Block-Risiko.

## Stand heute (2026-06-25)

- Local-only Vite-Dev auf `127.0.0.1:5176` (via launchAgent
  `de.sanexio.portal.plist`, PID 4507).
- Build erzeugt statisches `dist/` (~1 MB: index.html + JS/CSS +
  graph.json) — kein PHP, kein Server-Backend nötig.
- `cortex.sanexio.de` und `portal.sanexio.de` DNS-A-Record →
  `92.204.31.125` (GoDaddy/DF-cPanel), aktuell statisches Apache-
  Splash (3844 Bytes, last-modified 2026-05-06, self-signed TLS).

## Open Questions (BLOCKEN)

### Q1: Welche Subdomain?

Konflikt-Lage:

| Subdomain | Belegung |
|-----------|----------|
| `cortex.sanexio.de` | **Reserviert** für Cortex-CLI Bundle-Hosting (`install.sh`, Welle 3.6d, siehe `~/Cortex/projects/cortex-cli/OSS_PREP.md`) |
| `portal.sanexio.de` | Frei (gleicher Splash, kein dedizierter Zweck) |
| `hub.sanexio.de` | Frei (DNS müsste in cPanel angelegt werden) |
| `app.sanexio.de` | Frei |

**Empfehlung:** `portal.sanexio.de` — Name matched zum Code (`Sanexio
Portal`), keine Kollision mit cortex-cli-Distribution, DNS schon
geroutet.

### Q2: Hosting-Account und FTP-Credentials?

In `~/Cortex/projects/Sanexio-Tenant/sites/praxis-webseite/.env.sprint1.local`
sind nur FTP-Credentials für `westend-hausarzt.de` und
`westend-hausarzt.com` hinterlegt — **keine** für `sanexio.de`.

Mögliche Konstellationen:

| Variante | Setup | Aktion nötig |
|----------|-------|--------------|
| A | sanexio.de teilt cPanel-Account mit westend-hausarzt.com (gleiche `92.204.31.125`) → bestehender FTP-User hat ggf. Zugriff auf sanexio.de-DocRoot | FTP-Connect testen mit `claude-backup@westend-hausarzt.com`, lftp `cd /sanexio.de/` oder analog |
| B | sanexio.de hat eigenen cPanel-Account | neue FTP-Credentials von Stracke (cPanel → FTP-Accounts) |
| C | sanexio.de läuft auf anderem Hoster | komplette Infrastruktur-Klärung |

**Empfehlung:** Variante A bevorzugt (cPanel-Multi-Domain häufig). Test
zuerst, aber kein Recon-Pattern auslösen (Memory: Recon-Throttle 2×
Pflicht).

### Q3: HTTPS-Cert?

`cortex.sanexio.de`/`portal.sanexio.de` haben aktuell **self-signed
Certs**. Browser wird Warnungen zeigen.

**Fix:** In cPanel → SSL/TLS → "AutoSSL/Let's Encrypt" für die
Subdomain aktivieren. Das ist Stracke-Job (cPanel-UI).

## Migrations-Architektur (wenn Q1-Q3 geklärt)

### Pipeline

```
1. npm run build          → dist/ (lokal verifizieren)
2. SHA256 + Größen-Check  → Sanity (Bundle nicht leer, kein 0-Byte)
3. lftp FTPS upload       → DocRoot des Hosting-Accounts
4. Cache-Headers warmup   → curl -A "Cortex-Verify" /
5. Verify                 → HTTP 200 + Title-Match + Hash-Stamp
```

### lftp-Pattern (sicher gegen IP-Block, GoDaddy/DF-cPanel-Limit 8)

```bash
lftp -p 21 "ftp://$SFTP_HOST" <<EOF
user "$SFTP_USERNAME" "$SFTP_PASSWORD"
set ftp:ssl-force true
set ssl:verify-certificate no
set net:max-retries 3
set mirror:parallel-transfer-count 2
mirror -R \
  --only-newer \
  --delete \
  --exclude-glob '.git/' \
  --exclude-glob 'node_modules/' \
  --exclude-glob 'src/' \
  --exclude-glob 'scripts/' \
  --exclude-glob '*.log' \
  --exclude-glob '.DS_Store' \
  $DRY_FLAG \
  "$LOCAL_DIST" \
  "$REMOTE_PATH"
quit
EOF
sleep 4  # Hoster-Cache settle vor Verify
```

### Anti-IP-Block-Maßnahmen

- `mirror:parallel-transfer-count 2` (cPanel-Limit 8, 4 reserved)
- KEIN Triple-Sync in einer Welle (Memory: 12-48h IP-Block bei
  `sync-local-to-*` × 3)
- KEIN Recon-Pattern (OK→DENY-Sequenz Throttle 2× Pflicht)
- Credentials via stdin, nicht `-u`-Argument (ps-Sichtbarkeit)
- sleep 4 vor Verify (Hoster-Cache settle)
- User-Agent `Mozilla/5.0 Cortex-Verify` für curl-Verify

### Tier-3-Klausel

cortex.sanexio.de für cortex-cli ist **strategisch wichtig** —
Überschreiben wäre Tier-2/3-nahe. Deshalb `portal.sanexio.de` als
Default empfohlen, nicht cortex.sanexio.de.

## Skript-Skelett

Geplant: `tools/deploy-to-cortex-hub.sh` analog zu
`Sanexio-Tenant/sites/praxis-webseite/tools/sync-local-to-com.sh`,
mit:

- `--dry-run` (Default), `--commit` für realen Upload
- `--skip-build` falls dist/ frisch
- Pflicht-Env via `.env.deploy.local`:
  - `SFTP_HOST`, `SFTP_USERNAME`, `SFTP_PASSWORD`, `SFTP_PORT=21`
  - `REMOTE_PATH` (DocRoot auf cPanel)
  - `LIVE_URL` (für Verify-Step)

## Wellen-Plan

| Welle | Voraussetzung | Inhalt |
|-------|---------------|--------|
| **P.2a** | Q1-Q3 geklärt | Skript `tools/deploy-to-cortex-hub.sh` + `.env.deploy.template` schreiben |
| **P.2b** | P.2a + Credentials in `.env.deploy.local` | `--dry-run` Lauf, Pfad-Plausi-Check |
| **P.2c** | P.2b OK, Stracke-Go | `--commit` Upload + Verify |
| **P.2d** | nach Live | HTTPS-Cert via AutoSSL (cPanel-UI) — Stracke-Job |

## Stand nach FTP-Inventur (2026-06-25 23:14)

westend-hausarzt.com cPanel-Account (FTP-User
`claude-backup@westend-hausarzt.com`) gepingt mit single `ls /`:

- `/public_html/` = westend-hausarzt.com WP-Site (DocRoot)
- `/public_html/staging.westend-hausarzt.com/` = Staging-Subdomain
- `/westend-hausarzt.de/` = .de Splash-Site (3606 Bytes index.html)
- **KEIN `/public_html/portal.sanexio.de/`, KEIN `/sanexio.de/`,
  KEIN `/portal/`** sichtbar.

Konsequenz: Subdomain `portal.sanexio.de` ist im cPanel-Account **noch
nicht angelegt**. Die Splash-Page (3844 Bytes), die Apache aktuell
ausliefert, kommt vermutlich von einem Default-VHost oder einem
anderen Account auf derselben Server-IP.

## Was BEREITS geliefert (Welle 2026-06-25)

- ✅ `specs/DEPLOY_LIVE.md` (dieses File)
- ✅ `tools/deploy-to-portal-sanexio-de.sh` (executable, IP-Block-sicher)
- ✅ `.env.deploy.template` (Doku der Pflicht-Vars)
- ✅ `.env.deploy.local` (chmod 600, gitignored via `.env.*`,
  Credentials aus westend-hausarzt.com Account)
- ✅ Build verifiziert: `dist/` = 1.012 KB (index.html + 26.5 KB CSS +
  735 KB JS + 240 KB graph.json + favicon)

## Stracke-Aktion erforderlich (in cPanel-UI)

1. **Subdomain anlegen:**
   cPanel → "Subdomains" → Neue Subdomain
   - Subdomain: `portal`
   - Domain: `sanexio.de`
   - DocumentRoot: `public_html/portal.sanexio.de` (Default akzeptieren)
2. **AutoSSL/Let's Encrypt aktivieren:**
   cPanel → "SSL/TLS" → AutoSSL → Run AutoSSL for User
   - Wartet ~5min bis Cert ausgestellt
3. **Trigger Deploy:**
   ```bash
   ~/Cortex/projects/Cortex-Web/sites/sanexio-portal/tools/deploy-to-portal-sanexio-de.sh --commit
   ```

Wenn Subdomain `portal.sanexio.de` schon irgendwo in cPanel existiert,
aber mit anderem DocRoot: Pfad in `.env.deploy.local` (`REMOTE_PATH=`)
anpassen.

## Wenn sanexio.de tatsächlich in anderem cPanel-Account liegt

Dann gibt der Pre-Check des Skripts `PATH_MISSING` zurück und das
Skript stoppt vor Upload (Exit-Code 5). Lösung: separater FTP-Account
für sanexio.de von Stracke, dann `SFTP_HOST`/`SFTP_USERNAME` in
`.env.deploy.local` anpassen.

## Bewusst NICHT geliefert (in dieser Welle)

- Realer Upload: braucht cPanel-Subdomain-Anlegung
- Cert-Aktivierung: nur cPanel-UI, kein FTP-Pfad
- Site-Title-Verify-Pattern in Skript ist optimistic; falls Default-
  Splash bestehen bleibt nach cPanel-Anlegung muss Verify ggf.
  toleranter werden
