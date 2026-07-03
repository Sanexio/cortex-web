# cortex-sanexio-landing

Statische Cyber-Landing-Page für `https://cortex-sanexio.tech/`.

## Architektur

- `/` → diese Landing-Page (Cyber-Look, Tokens aus `sanexio-portal/cyber.css`)
- `/dashboard/` → cortex-harness Dashboard via Caddy `handle_path` + `X-Forwarded-Prefix`
- alle anderen Routes (`/assets`, `/api`, `/second-brain`, ...) → cortex-harness unverändert

## Theme-Switcher (Welle 2)

Footer-Toggle „DEFAULT: CYBER · WECHSELN →" setzt Cookie
`cortex_theme=dashboard|cyber` (1 Jahr, SameSite=Lax). Caddy matched
beim nächsten Request auf `/`:

- Cookie `cortex_theme=dashboard` → HTTP 302 → `/dashboard/`
- kein Cookie oder `cortex_theme=cyber` → Cyber-Landing

Rück-Wechsel: im Dashboard zu `/?` navigieren (löst Cookie-Match aus
auf Apex), bzw. Cookie über DevTools löschen. Künftig: Toggle auch im
Dashboard-Header (Welle 3).

## Welle 3: Cyber-Overlay auf Sub-Containern — LIVE (2026-07-03)

Cyber-Look liegt auf allen HTML-Sub-Routen des Apex (`/dashboard/`,
`/second-brain`, `/chat`, …) — ohne den Vendor-Code von cortex-harness
anzufassen (Direktive 2026-06-28). Mechanik:

1. **Custom-Caddy** v2.11.4 mit Modul
   `github.com/caddyserver/replace-response` vom offiziellen
   Caddy-Build-Server (kein Build auf dem VPS). APT-Original via
   `dpkg-divert` auf `/usr/bin/caddy.default` gesichert — apt-Upgrades
   überschreiben den Custom-Build nicht. Idempotent nachziehbar über
   `Nexus/tools/hostinger-bootstrap/02_runtime.sh` (Schritt 3b).
2. **`cyber-overlay.css`** — reines Token-Layer: die Harness-SPA ist
   über `:root`-Custom-Properties themebar (`--background`,
   `--midground`, `--theme-accent-*`, `--theme-font-*`, `--radius`).
   Das Overlay wird als letztes Stylesheet injiziert und gewinnt per
   Quellreihenfolge. Zusätzlich: Grid+Bloom als `body`-Hintergrundbild
   (bewusst KEINE fixed Layer/Stacking-Contexts, keine
   `--component-backdrop-*` — Killzone-Vorfall 2026-06-23),
   Cyber-Scrollbars, Google-Fonts-Import (Barlow Condensed, Rajdhani,
   JetBrains Mono).
3. **Caddy `replace`-Direktive** auf beiden Proxy-Routen
   (`handle_path /dashboard/*` + Catch-all), gescoped auf
   `Content-Type: text/html*`; Upstream bekommt
   `Accept-Encoding: identity`, damit der Marker im Klartext ankommt:
   ```
   replace {
       match {
           header Content-Type text/html*
       }
       "</head>" "<link rel=stylesheet href=/cyber-overlay.css></head>"
   }
   ```
   Global in `/etc/caddy/Caddyfile`: `order replace after encode`.
4. **Verify 2026-07-03:** alle Vhosts 200 (pg-kalkulation 401 =
   Login, unverändert), Injection auf `/dashboard/` + `/second-brain`
   nachgewiesen, Headless-Chrome-Screenshots ohne Layout-Regression.

## Files

| File | Zweck |
|---|---|
| `index.html` | Hero + Service-Cards (4 produktive Services) |
| `landing.css` | Eigenständige Cyber-Tokens + Komponenten (kein React) |
| `cyber-overlay.css` | Token-Overlay für Sub-Container (Caddy-Injection, Welle 3) |
| `favicon.svg` | aus `sanexio-portal/public/` übernommen |
| `deploy/w6-cortex-apex.caddyfile` | Caddy-Vhost-Snapshot für VPS |

## Deploy-Pfad auf VPS

```
/srv/sanexio/apps/cortex-sanexio-landing/
├── index.html
├── landing.css
└── favicon.svg
```

Caddy-Konfig liegt unter `/etc/caddy/conf.d/w6-cortex-apex.caddyfile`.

## Verify

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://cortex-sanexio.tech/             # 200 (landing)
curl -sS -o /dev/null -w "%{http_code}\n" https://cortex-sanexio.tech/landing.css  # 200
curl -sS -o /dev/null -w "%{http_code}\n" https://cortex-sanexio.tech/dashboard/   # 200 (cortex-harness SPA)
```
