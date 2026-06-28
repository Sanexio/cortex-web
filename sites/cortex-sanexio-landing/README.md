# cortex-sanexio-landing

Statische Cyber-Landing-Page für `https://cortex-sanexio.tech/`.

## Architektur

- `/` → diese Landing-Page (Cyber-Look, Tokens aus `sanexio-portal/cyber.css`)
- `/dashboard/` → cortex-harness Dashboard via Caddy `handle_path` + `X-Forwarded-Prefix`
- alle anderen Routes (`/assets`, `/api`, `/second-brain`, ...) → cortex-harness unverändert

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
