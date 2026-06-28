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

## Welle-3-Plan: Cyber-Overlay auf Sub-Containern

Stracke-Vision: Cyber-Look auch auf `/dashboard/`, Second-Brain,
Workforce-Time, PG-Kalkulation. Hindernis: cortex-harness und die
anderen Apps sind Vendor-/Eigen-Code, dürfen nicht angefasst werden
(Direktive 2026-06-28).

Lösungs-Pfad (Welle 3):

1. **xcaddy auf VPS installieren** + Custom-Caddy mit Modul
   `github.com/caddyserver/replace-response`.
2. **`cyber-overlay.css`** schreiben — generisches Token-Layer:
   - `body { background: #0c0c0c; color: #fff; }`
   - Font-Stack auf Barlow Condensed + Rajdhani + JetBrains Mono
   - Color-Vars (`--neon-yellow`, `--neon-cyan`, `--neon-magenta`)
   - Generische Komponenten (Cards, Buttons, Inputs) per generischen
     Selectors (geht nur soweit die App nicht eigene Specificity hat)
3. **Caddy `replace_response`** auf den Sub-Routes:
   ```
   replace_response {
       stream
       "</head>" "<link rel=stylesheet href=/cyber-overlay.css></head>"
   }
   ```
4. **Welle-3-Verify-Plan:** pro Sub-Container CDP-Screenshot vor +
   nach Overlay. Layout-Regressionen identifizieren.

## Files

| File | Zweck |
|---|---|
| `index.html` | Hero + Service-Cards (4 produktive Services) |
| `landing.css` | Eigenständige Cyber-Tokens + Komponenten (kein React) |
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
