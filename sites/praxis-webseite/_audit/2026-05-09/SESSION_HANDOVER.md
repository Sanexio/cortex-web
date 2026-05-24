# Session-Handover 2026-05-09 → nächste Session

## Wo wir stehen

**Local (Cluster-Mini-02):**
- Theme-HEAD: `59fad6c` (committet + auf GitHub `Sanexio/praxiszentrum-theme:main` gepusht)
- 62 WebP-Files in `~/Local Sites/.../wp-content/uploads/2026/04/` (auch in `sanexio-imports/`)
- Lighthouse Mobile lokal: Homepage **94/100**, /labor/ **92/100**
- Auch erreichbar von MBP M5 via `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/` (siehe /etc/hosts-Eintrag)

**Live (westend-hausarzt.de):**
- htaccess-Stand: **Polish-Perf-B** (5973 B) — Browser-Caching + WebP-Negotiation funktional
- Theme-Stand auf Live: `b1e5da8` (vor Polish-Perf-D-Theme-Edits)
- WebP-Files auf Live: nur die 14 von gestern (Doctor + Räume) — die 62 neuen fehlen noch

**IP-Block (cPanel-LFD):**
- Cluster-Mini-02 Heim-IP `92.208.79.185` ist von DF-Server gesperrt (alle Ports 21/80/443).
- Cool-Down: typisch 1–3h, max 24h.
- Beschleunigung: DF-Kundencenter-Ticket / Hotline → IP-Unblock anfordern.

## Was als nächstes zu tun ist (sobald LFD-Block weg)

1. `cd ~/Cortex/projects/Cortex-Web/sites/praxis-webseite`
2. `bash tools/sync-local-to-de.sh --theme` → Theme-Push (Polish-Perf-D)
3. lftp-mput aller `*.webp`-Files aus `~/Local Sites/.../uploads/2026/04/` nach `public_html/wp-content/uploads/2026/04/`
4. `bash tools/pre-launch-verify.sh` → muss 21/21 grün liefern
5. Lighthouse-Mobile-Re-Run gegen Live → erwarteter Score: **94/100** (= lokal)

## Was NICHT angefasst werden darf

- **htaccess auf Live**: Polish-Perf-B-Stand bleibt. KEIN mod_deflate-Patch mehr (siehe `feedback_htaccess_lftp_safety_rules.md` Regel 1+4).
- **Heim-IP nochmal lftp-hammern**: KEINE Connection-Storms (Regel 2+3).

## Backup-Files auf Live-Server (für Rollback)

- `.htaccess` = Polish-Perf-B (aktuell live)
- `.htaccess.before-polish-perf-c-2026-05-09` = identisch zum Live-Stand (5973 B)
- `.htaccess.before-polish-perf-b-2026-05-09` = Polish-Perf-A Stand (5072 B)
- `.htaccess.before-polish-perf-2026-05-09` = Welle-J Original (2169 B)
- `.htaccess.broken-polish-perf-c-v2-2026-05-09` = der broken Polish-Perf-C-Versuch (kann gelöscht werden)

## Lessons-Memory für künftige Sessions

`~/.claude/projects/.../memory/feedback_htaccess_lftp_safety_rules.md` enthält 6 harte Regeln. Vor jedem htaccess-/lftp-Op konsultieren.
