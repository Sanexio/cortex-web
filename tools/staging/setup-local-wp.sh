#!/usr/bin/env bash
# ============================================================
# setup-local-wp.sh — reproduzierbare lokale WP-Staging-Site
# ============================================================
# Zieht eine wegwerfbare WordPress-Instanz hoch (Homebrew-PHP + SQLite,
# KEIN Docker/MySQL nötig), gegen die die Cortex-Web-Adapter ihre
# Push/Diff/Review/Extract-Pipelines end-to-end testen können — ohne
# Produktion oder Hoster zu berühren.
#
# Idempotent: erneuter Lauf erkennt vorhandene Installation und ist NOOP
# (außer --force erzwingt Neuaufbau).
#
# Ergebnis:
#   - WP unter $STAGING_DIR/wp  (SQLite-DB, git-ignoriert, außerhalb der Repos)
#   - wp-cli unter $STAGING_DIR/bin/wp
#   - mu-plugins: cortex-dev-auth (REST-Auth über HTTP) + cortex-staging-templates
#   - Admin + Application-Password via wp-cli geseedet
#   - Cortex-Web/.env.local WP-Block automatisch befüllt
#
# Danach Server starten:  tools/staging/wp-staging.sh start
#
# Voraussetzungen: /opt/homebrew/bin/php (mit pdo_sqlite), curl, unzip,
#                  Netzwerk für WP-Core + wp-cli-Download.
# ============================================================
set -euo pipefail

PHP_BIN="${PHP_BIN:-/opt/homebrew/bin/php}"
STAGING_DIR="${STAGING_DIR:-$HOME/.cortex/cortex-web-staging}"
WP_PORT="${WP_PORT:-8920}"
WP_HOST="${WP_HOST:-127.0.0.1}"
ADMIN_USER="${ADMIN_USER:-cortex}"
FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WP_DIR="$STAGING_DIR/wp"
WP="$STAGING_DIR/bin/wp"
SQLITE_OK=$("$PHP_BIN" -m 2>/dev/null | grep -c pdo_sqlite || true)

say() { printf "[staging-setup] %s\n" "$*"; }
die() { printf "[staging-setup] FEHLER: %s\n" "$*" >&2; exit 1; }

[ -x "$PHP_BIN" ] || die "PHP nicht gefunden unter $PHP_BIN (PHP_BIN= überschreiben)"
[ "$SQLITE_OK" -ge 1 ] || die "PHP ohne pdo_sqlite — SQLite-WP nicht möglich"

mkdir -p "$STAGING_DIR/bin" "$WP_DIR"

# --- wp-cli ---
if [ ! -f "$STAGING_DIR/bin/wp-cli.phar" ]; then
  say "wp-cli laden …"
  curl -sSL -o "$STAGING_DIR/bin/wp-cli.phar" \
    https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
fi
# Wrapper: Memory hoch, Deprecations/Strict aus (PHP 8.5 + WP), Fehler nach stderr
cat > "$WP" <<WRAP
#!/bin/bash
exec "$PHP_BIN" \\
  -d memory_limit=-1 \\
  -d error_reporting='E_ALL & ~E_DEPRECATED & ~E_STRICT' \\
  -d display_errors=stderr \\
  "$STAGING_DIR/bin/wp-cli.phar" "\$@"
WRAP
chmod +x "$WP"

# --- vorhandene Installation? ---
if [ "$FORCE" -eq 1 ]; then
  say "--force: bestehende Installation entfernen"
  rm -rf "$WP_DIR"; mkdir -p "$WP_DIR"
fi
if "$WP" core is-installed --path="$WP_DIR" >/dev/null 2>&1; then
  say "WP bereits installiert ($("$WP" option get siteurl --path="$WP_DIR" 2>/dev/null)) — NOOP. (--force für Neuaufbau)"
else
  say "WP-Core laden …"
  "$WP" core download --path="$WP_DIR" --force >/dev/null 2>&1 || die "core download fehlgeschlagen"

  say "SQLite-Integration installieren …"
  curl -sSL -o /tmp/cortex-sqlite-di.zip https://downloads.wordpress.org/plugin/sqlite-database-integration.zip
  unzip -q -o /tmp/cortex-sqlite-di.zip -d "$WP_DIR/wp-content/plugins/"
  PLUGDIR="$WP_DIR/wp-content/plugins/sqlite-database-integration"
  sed -e "s#{SQLITE_IMPLEMENTATION_FOLDER_PATH}#$PLUGDIR#g" \
      -e "s#{SQLITE_PLUGIN}#sqlite-database-integration/load.php#g" \
      "$PLUGDIR/db.copy" > "$WP_DIR/wp-content/db.php"

  say "wp-config + Installation …"
  "$WP" config create --path="$WP_DIR" --dbname=cortexstaging --dbuser=root \
    --dbpass='' --dbhost=localhost --skip-check --force >/dev/null 2>&1
  # Härtung: kein Notice/Deprecation-Leak in REST-JSON
  if ! grep -q "cortex-staging-error-suppress" "$WP_DIR/wp-config.php"; then
    perl -0pi -e 's/(<\?php\n)/$1\n\/\/ cortex-staging-error-suppress\n\@ini_set("display_errors","0");\nerror_reporting(E_ALL \& ~E_DEPRECATED \& ~E_NOTICE \& ~E_STRICT \& ~E_WARNING);\n\n/' "$WP_DIR/wp-config.php"
  fi
  ADMIN_PW=$(openssl rand -hex 12)
  "$WP" core install --path="$WP_DIR" \
    --url="http://$WP_HOST:$WP_PORT" --title="Cortex-Web Staging" \
    --admin_user="$ADMIN_USER" --admin_password="$ADMIN_PW" \
    --admin_email="staging@cortex.local" --skip-email >/dev/null 2>&1 || die "core install fehlgeschlagen"
  "$WP" rewrite structure '/%postname%/' --path="$WP_DIR" >/dev/null 2>&1
  "$WP" rewrite flush --path="$WP_DIR" >/dev/null 2>&1
  printf '%s' "$ADMIN_PW" > "$STAGING_DIR/.admin-pw"
fi

# --- mu-plugins (immer aktualisieren) ---
say "mu-plugins installieren …"
mkdir -p "$WP_DIR/wp-content/mu-plugins"
# mu-plugins sind tenant-spezifisch (REST-Auth-Helper + Page-Template-Slugs)
# und leben daher im Tenant-Repo, nicht im OSS-Framework.
TENANT_DIR="${CORTEX_TENANT_DIR:-$HOME/Cortex/projects/Sanexio-Tenant}"
for mu in cortex-dev-auth.php cortex-staging-templates.php; do
  src="$TENANT_DIR/tools/local-wp-setup/$mu"
  if [ -f "$src" ]; then
    cp "$src" "$WP_DIR/wp-content/mu-plugins/$mu"
  else
    say "WARN: mu-plugin $mu im Tenant nicht gefunden ($src) — übersprungen"
  fi
done

# --- Application-Password (idempotent: vorhandenes löschen, neu minten) ---
say "Application-Password minten …"
"$WP" user application-password delete "$ADMIN_USER" --all --path="$WP_DIR" >/dev/null 2>&1 || true
APP_PW=$("$WP" user application-password create "$ADMIN_USER" cortex-web-adapter --porcelain --path="$WP_DIR" 2>/dev/null | tail -1)
[ "${#APP_PW}" -ge 20 ] || die "Application-Password-Erstellung fehlgeschlagen"
printf '%s' "$APP_PW" > "$STAGING_DIR/.app-pw"

# --- .env.local WP-Block schreiben (Shopify-Block erhalten falls vorhanden) ---
ENV_FILE="$REPO_ROOT/.env.local"
say ".env.local WP-Block schreiben …"
{
  echo "# Cortex-Web — lokale Staging-Credentials (git-ignoriert, auto-generiert)"
  echo "# WP-Server: tools/staging/wp-staging.sh start"
  echo ""
  echo "WP_REST_BASE=http://$WP_HOST:$WP_PORT/wp-json"
  echo "WP_USER=$ADMIN_USER"
  echo "WP_APP_PASSWORD=\"$APP_PW\""
  echo "WP_PAGE_STATUS=publish"
  echo ""
  echo "# ─── Shopify (Dev-Store) — via tools/shopify-authorize.sh + oauth-catcher ──"
  if [ -f "$ENV_FILE" ] && grep -q "SHOPIFY_CLIENT_ID" "$ENV_FILE"; then
    grep -E "^SHOPIFY_" "$ENV_FILE"
  else
    echo "SHOPIFY_CLIENT_ID=19fe6e2bd121da1592ac75d27b167e72"
    echo "SHOPIFY_CLIENT_SECRET="
    echo "SHOPIFY_STORE="
    echo "SHOPIFY_ADMIN_TOKEN="
  fi
} > "$ENV_FILE.tmp"
mv "$ENV_FILE.tmp" "$ENV_FILE"

say "FERTIG. WP-Staging bereit:"
say "  URL:   http://$WP_HOST:$WP_PORT   (Admin: $ADMIN_USER / siehe $STAGING_DIR/.admin-pw)"
say "  Start: tools/staging/wp-staging.sh start"
say "  Test:  CORTEX_TENANT_DIR=\$HOME/Cortex/projects/Sanexio-Tenant bash tools/sync-service-wp.sh"
