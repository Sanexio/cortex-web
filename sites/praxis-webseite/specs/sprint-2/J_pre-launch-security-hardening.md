---
sprint: J
phase: 4 (Selbstprüfung) abgeschlossen
status: ✅ erfolgreich 2026-05-07
created: 2026-05-07
trigger: Diskrepanz-Scan 2026-05-07 (Local vs. westend-hausarzt.de) — Side-Findings zu exponierten Pfaden bei Wegfall der Basic-Auth
blocker_for: Go-Live `westend-hausarzt.com`
verify: `tools/pre-launch-verify.sh` — 21/21 pass auf .de mit Basic-Auth
---

## §0 Ergebnis (2026-05-07 Welle J abgeschlossen)

| Block | Inhalt | Status |
|---|---|---|
| J0 | `.htaccess`-Backup nach `_backups/j/j2-pre-htaccess-public_html` | ✅ |
| J1 | `.git/`-Verzeichnis aus Theme-DocRoot entfernt | ✅ 404 |
| J2 | `error_log` gelöscht + per `.htaccess` geblockt | ✅ 404 |
| J3 | mod_rewrite-`[F]`-Block für Recon-Targets | ✅ |
| J4 | wp-config + xmlrpc explizit denied | ✅ 404 |
| J5 | Pattern-Doku + `tools/pre-launch-verify.sh` | ✅ |

**Verify-Suite:** `tools/pre-launch-verify.sh` — 21/21 pass (10 EXPECT_DENY, 11 EXPECT_OK).

**Patterns angelegt:**
- `Nexus/_memory/patterns/php-tar-extract-permission-fix.md` (aus Pre-Diskrepanz-Scan)
- `Nexus/_memory/patterns/htaccess-rewrite-deny-trumps-auth.md` (aus J3-Iteration)

**Bug während Welle J entdeckt + behoben:**
1. **`<DirectoryMatch>` in .htaccess wirft Apache-500.** Erste Iteration v1
   nutzte `<DirectoryMatch>` für `.git/`-Block — sofortige 500-Cascade über alle
   URLs. Revert via Backup, Fix: `RewriteRule [F]` statt DirectoryMatch.
2. **`<FilesMatch>` + `Require all denied` wird durch `<If>` + `Require valid-user`
   neutralisiert** (Apache 2.4 Authz-Merge implizit RequireAny). v2 deployte
   ohne 500, aber alle Recon-Targets weiterhin 200. Fix: mod_rewrite `[F]`-Flag
   überschreibt Auth-State absolut (v3).

**Live-Deploy-Datei:** `_deploy/welle-J/htaccess-public_html` (final v3).

---

# Welle J — Pre-Launch-Security-Hardening (vor `.com`-Go-Live)

> Spec angelegt 2026-05-07 als Folge des Diskrepanz-Scans nach Welle F Phase B
> (Logo-404-Fix). Beim Asset-Probing auf `westend-hausarzt.de` (Staging) wurden
> mehrere sensible Pfade als HTTP 200 entdeckt. Aktuell durch Basic-Auth
> (`praxis:Sanexio`) abgeschirmt — sobald die Auth zum Go-Live `.com` fällt,
> wären diese Pfade öffentlich erreichbar.

---

## §1 Auftrag

Vor dem Live-Push der Übergangs-Seite auf `westend-hausarzt.com` (Welle K, noch
nicht datiert) müssen die im Diskrepanz-Scan 2026-05-07 entdeckten
Security-Findings geschlossen sein. **Welle J ist Blocker für Welle K
(`.com`-Go-Live).**

---

## §2 Inventur-Befund (Phase 1, abgeschlossen)

Alle nachfolgenden Probes erfolgten am 2026-05-07 mit Basic-Auth-Credentials
gegen `https://westend-hausarzt.de/`. Auf `.com` würde dieselbe Datei-Struktur
ohne Basic-Auth ausgeliefert.

### F-1: Theme-Git-Verzeichnis exponiert (HOCH)

| Pfad | Aktueller Status |
|---|---|
| `/wp-content/themes/praxiszentrum/.git/config` | **HTTP 200** |
| `/wp-content/themes/praxiszentrum/.git/HEAD` | **HTTP 200** |

**Risiko:** Komplette Git-History des Themes clonebar (`git-dumper` o. ä. ist
ein Standard-Recon-Tool). Inhalte: Commit-History, ggf. Author-E-Mails,
ältere Theme-Versionen mit potenziell anderen Bugs.

**Ursache:** Beim Bauen von `wp-content-code.tar.gz` (Welle F Phase B) wurde
das `.git/`-Verzeichnis des Theme-Repos mit eingepackt. Beim Server-Extract
landete es im DocRoot.

### F-2: Server-Logs exponiert (MITTEL)

| Pfad | Aktueller Status |
|---|---|
| `/error_log` | **HTTP 200** |

**Risiko:** PHP-Error-Log enthält absolute Server-Pfade (`/home/e88c2b3jxfrg/…`),
ggf. Stack-Traces mit Variableninhalten, fehlgeschlagene DB-Queries (mit
Tabellen-/Spaltennamen). Hilft Angreifern bei Ziel-Aufklärung.

### F-3: `.htaccess` exponiert (MITTEL)

| Pfad | Aktueller Status |
|---|---|
| `/.htaccess` | **HTTP 200** |

**Risiko:** Apache-Standard ist `.htaccess` zu blockieren — auf diesem Server
nicht. Inhalt zeigt: Auth-Konfiguration, Rewrite-Regeln, ggf. interne Pfade
(`AuthUserFile /home/e88c2b3jxfrg/.htpasswds/…`). Verrät interne Struktur.

### F-4: Theme-Doku exponiert (NIEDRIG)

| Pfad | Aktueller Status |
|---|---|
| `/wp-content/themes/praxiszentrum/CHANGELOG.md` | HTTP 200 |
| `/wp-content/themes/praxiszentrum/README.md` | HTTP 200 |

**Risiko:** Theme-Versionsdetails + interne Notizen, Customizing-Hinweise
sichtbar. Niedrig (keine Credentials), aber unnötig.

### F-5: Bereits korrekt geschützt (Stand 2026-05-07)

| Pfad | Status |
|---|---|
| `/wp-config.php` | 404 ✅ |
| `/.env` | 404 ✅ |
| `/wp-content/debug.log` | 404 ✅ |

---

## §3 Lösungsdesign (Phase 2, in Review)

### Block J1 — `.git`-Verzeichnis aus DocRoot entfernen

**Risiko:** keins (`.git/` wird im Frontend-Render nicht gebraucht).

**Schritt:**
```bash
lftp -u "$SFTP_DE_USERNAME","$SFTP_DE_PASSWORD" "ftp://$SFTP_DE_HOST" <<'EOF'
set ftp:ssl-force true
set ssl:verify-certificate no
rm -r public_html/wp-content/themes/praxiszentrum/.git
EOF
```

**Defensiv ergänzen:** Build-Skript für künftige Tarballs muss `.git/`
ausschließen. In `_deploy/welle-F-phase-B/2026-05-06/`-Bauschritt ergänzen:
```bash
tar --exclude='.git' --exclude='node_modules' -czf wp-content-code.tar.gz wp-content/
```
Pattern dokumentieren in `Nexus/_memory/patterns/deploy-tarball-exclusions.md`
(noch nicht angelegt — TODO Block J5).

**Verify:** `curl -u praxis:Sanexio https://westend-hausarzt.de/wp-content/themes/praxiszentrum/.git/HEAD` → 404.

### Block J2 — `error_log` löschen + per `.htaccess` blocken

**Schritt 1 — Datei löschen:**
```bash
lftp ... <<'EOF'
rm public_html/error_log
EOF
```

**Schritt 2 — Re-Erzeugung blocken:** In Apache-`.htaccess` (Domain-Scope, nicht
Account-Level) folgenden Block direkt nach den bestehenden Hostname-Scope-
Bedingungen einfügen:
```apache
<FilesMatch "^(error_log|debug\.log|\.htaccess|\.htpasswd)$">
    Require all denied
</FilesMatch>
```

**Verify:** `curl -u praxis:Sanexio https://westend-hausarzt.de/error_log` →
403 Forbidden.

### Block J3 — Sensible Files via `<FilesMatch>` allgemein blocken

**Schritt:** In derselben `.htaccess` einen breiteren Block ergänzen:
```apache
# Blockiere Standard-Recon-Targets
<FilesMatch "(^\.|\.log$|\.md$|\.bak$|\.swp$|\.sql$|\.tar\.gz$|composer\.(json|lock)|package(-lock)?\.json|\.gitignore|\.gitattributes|\.editorconfig)$">
    Require all denied
</FilesMatch>

# Blockiere .git/, .svn/, node_modules/ als Verzeichnis-Pfade
<DirectoryMatch "^.*/(\.git|\.svn|node_modules)/">
    Require all denied
</DirectoryMatch>
```

**Risiko:** Mittel — falsch konfigurierte Pattern können legitime Routes
brechen. Pre-Deploy-Verify: Top-15-URLs aus §HTTP-Probe-Set bleiben 200.

**Verify:**
- `curl …/wp-content/themes/praxiszentrum/CHANGELOG.md` → 403
- `curl …/wp-content/themes/praxiszentrum/.git/config` → 403
- `curl …/wp-content/themes/praxiszentrum/style.css` → 200 (style.css ist nicht im Pattern)

### Block J4 — wp-config.php / sensible WP-Files defensive sichern

**Schritt:** Zusätzlich zu den bereits 404-blockierten Files Apache-Block
ergänzen (defense-in-depth):
```apache
<FilesMatch "^wp-config\.php$">
    Require all denied
</FilesMatch>
<FilesMatch "^xmlrpc\.php$">
    Require all denied
</FilesMatch>
```

**Hintergrund:** `wp-config.php` ist aktuell 404, aber das ist nur, weil PHP es
ausführt und die `<?php`-Datei ohne Output beendet (es gibt kein „echte" 404).
Ein expliziter Deny ist robuster gegen Misconfigs.

`xmlrpc.php` ist Standard-Brute-Force-Target und wird vom Theme/Site nicht
benötigt.

### Block J5 — Pattern-Doku + Deploy-Skript-Hardening

**Pattern anlegen:** `Nexus/_memory/patterns/deploy-tarball-exclusions.md`
- Inhalt: `.git/`, `node_modules/`, `*.log`, `_archive/`, `screenshots/`
  immer aus Deploy-Tarballs ausschließen. Mit `tar --exclude=`-Flags.
- Verlinkt mit `php-tar-extract-permission-fix.md` (2026-05-07 angelegt).

**Build-Skript für nächste Welle:** Ein wiederverwendbares
`_deploy/_template/build-deploy-bundle.sh` anlegen, das die Tarball-Exclusions
zentral hat.

---

## §4 Akzeptanzkriterien (Phase 4 — Selbstprüfung vor Welle K)

Pre-Launch-Verify-Suite (auf `.de` mit Basic-Auth, später auf `.com` ohne):

```bash
EXPECT_403=(
  /.htaccess
  /error_log
  /wp-content/themes/praxiszentrum/.git/config
  /wp-content/themes/praxiszentrum/.git/HEAD
  /wp-content/themes/praxiszentrum/CHANGELOG.md
  /wp-content/themes/praxiszentrum/README.md
  /xmlrpc.php
)

EXPECT_200=(
  /
  /team/
  /labor/
  /untersuchungen/
  /karriere/
  /sprechstunden/
  /standorte/
  /wp-content/themes/praxiszentrum/style.css
  /wp-content/themes/praxiszentrum/assets/logo.svg
  /wp-content/themes/praxiszentrum/assets/logo-sanexio.svg
)
```

Beide Sets müssen vollständig ihren Erwartungs-Code liefern. Das Verify-Skript
gehört in `tools/pre-launch-verify.sh` (anlegen in Block J5 oder als
J5b-Subblock).

---

## §5 Backups vor Block-Ausführung

- **Vor J1 (rm `.git`):** Tarball `_backups/j/j1-pre-git-removal.tar.gz` der
  `.git/`-Files zur Sicherheit (falls Theme-Re-Push nötig wird).
- **Vor J2/J3/J4 (`.htaccess`-Edits):** Original-`.htaccess` nach
  `_backups/j/j2-pre-htaccess.htaccess` ziehen.

---

## §6 Reihenfolge + Geschätzte Dauer

| Block | Inhalt | Dauer | Reihenfolge |
|---|---|---|---|
| J0 | Backups | 5 min | Pflicht zuerst |
| J1 | `.git/` rm + Verify | 5 min | parallel zu J2 möglich |
| J2 | `error_log` rm + `.htaccess`-Block (Files) | 10 min | nach J0 |
| J3 | `.htaccess`-Block (FilesMatch + DirectoryMatch) | 15 min | nach J2 |
| J4 | wp-config + xmlrpc deny | 5 min | nach J3 |
| J5 | Pattern-Doku + `tools/pre-launch-verify.sh` | 30 min | parallelisierbar |
| J5b | Verify-Suite-Run + Eintrag in `_archive/sessions/` | 10 min | nach J1–J4 |

**Gesamt:** ca. 1h20min in einer Welle, parallelisierbar auf ~50 min.

---

## §7 Outscoping

**Nicht in Welle J:**
- Security-Header (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) —
  separater Block nach Go-Live, sobald `.com`-SSL-Zertifikat steht.
- WAF / Rate-Limiting (Sanexio-Firewall, Wordfence, etc.) — separater
  Sprint, nicht Pre-Launch-kritisch.
- Brute-Force-Protection für `/wp-login.php` — separater Sprint, niedriger
  Initial-Traffic erwartet.
- Komplette Penetration-Tests / OWASP-Audit — auf Wunsch nach Go-Live als
  externer Auftrag.

**Begründung:** Welle J = nur die im 2026-05-07-Scan tatsächlich entdeckten
File-Exposure-Findings. Weitergehende Hardening-Arbeit eigener Sprint, sobald
Live-Traffic-Verhalten beobachtbar ist.

---

## §8 Referenzen

- Diskrepanz-Scan-Output: Chat-Session 2026-05-07 (post-Welle-F-Phase-B-Logo-Fix).
- Welle F Phase B: `specs/sprint-2/F_phase-B_live-deploy.md`.
- Permission-Pattern: `Nexus/_memory/patterns/php-tar-extract-permission-fix.md`
  (angelegt 2026-05-07).
- Welle K (`.com`-Go-Live): noch nicht spezifiziert. Welle J ist
  Blocker.
