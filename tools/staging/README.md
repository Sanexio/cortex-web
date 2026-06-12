# Cortex-Web — Lokale Staging-Umgebung

Reproduzierbare lokale Test-Umgebung, gegen die die Adapter-Pipelines
(Push / Diff / Review / Extract) **end-to-end** laufen — ohne Produktion
oder Hoster zu berühren. Erfüllt P1 #6 aus dem Sanexio-Cortex-Deep-Dive.

## WordPress (vollautomatisch, SQLite)

Wegwerfbare WP-Instanz via **Homebrew-PHP + SQLite + wp-cli** — kein Docker,
kein MySQL, keine GUI (Local.app), kein User-Schritt.

```bash
# Einrichten (idempotent; --force baut neu):
tools/staging/setup-local-wp.sh

# Server steuern:
tools/staging/wp-staging.sh start      # Hintergrund-Server :8920
tools/staging/wp-staging.sh status     # UP/DOWN + REST-Smoke
tools/staging/wp-staging.sh stop
tools/staging/wp-staging.sh wp <args>  # wp-cli gegen die Staging-WP

# End-to-End testen:
export CORTEX_TENANT_DIR=$HOME/Cortex/projects/Sanexio-Tenant
bash tools/sync-service-wp.sh          # Hub + 6 Service-Seiten via REST
bash tools/sync-wp.sh <produkt.yaml>   # Produkt → WP-Page
bun  adapters/wordpress/extract-page.mjs service   # WP → Trunk-JSON (Round-Trip)
```

**Was die Einrichtung tut:** WP-Core laden → SQLite-Drop-in → installieren →
mu-plugins (`cortex-dev-auth` = REST-Auth über HTTP; `cortex-staging-templates`
= registriert die Theme-Page-Templates, die der Content nutzt) → Admin +
Application-Password via wp-cli seeden → `Cortex-Web/.env.local` WP-Block füllen.

- WP-Install liegt unter `~/.cortex/cortex-web-staging/` (außerhalb der Repos, nicht versioniert).
- Das Staging liegt bewusst außerhalb von `~/Cortex`, weil es ein Laufzeit-Artefakt ist und nicht in einem sync-überwachten Quellbaum leben soll.
- Admin-Passwort: `~/.cortex/cortex-web-staging/.admin-pw`. App-Password: `~/.cortex/cortex-web-staging/.app-pw`.
- `.env.local` ist git-ignoriert.

### Hinweis PHP-Version
Getestet mit Homebrew-PHP 8.5 (WP 7.0). Der wp-cli-Wrapper unterdrückt
`E_DEPRECATED/E_STRICT`; `wp-config.php` unterdrückt Notice/Deprecation-Leaks
in REST-JSON. Bei echten Fatals: `brew install php@8.4` und `PHP_BIN=` setzen.

## Shopify (Dev-Store, braucht User-Inputs)

Shopify hat keinen lokalen Modus — Push/Diff/Drift laufen gegen einen
**Partner-Dev-Store** (kostenlos, kein Produktions-Impact):

1. In **partners.shopify.com** einen Development-Store anlegen.
2. `Cortex-Web/.env.local`: `SHOPIFY_STORE=<handle>.myshopify.com` und
   `SHOPIFY_CLIENT_SECRET=<aus dem App-Dashboard>` eintragen.
3. OAuth (einmalig, Browser):
   ```bash
   bash tools/shopify-authorize.sh --open     # öffnet Consent-URL
   bun  tools/shopify-oauth-catcher.mjs        # tauscht Code → shpat_-Token, schreibt .env.local
   ```
4. End-to-End: `bash tools/sync-shopify.sh <produkt.yaml>`, `tools/drift-sync/*`, `tools/review.sh`.

## Cleanup
```bash
tools/staging/wp-staging.sh stop
rm -rf ~/.cortex/cortex-web-staging        # komplette WP-Staging entfernen
```
