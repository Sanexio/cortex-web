#!/usr/bin/env bash
# Bau wp-config.php-Live aus Original + Salts + DB-Credentials.
# Liest DB-Pass aus interaktivem Read (kein Secret-Logging).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-config.php"
OUT="$HERE/wp-config-live.php"

DB_NAME="${DB_NAME:-e88c2b3jxfrg_westend_de}"
DB_USER="${DB_USER:-e88c2b3jxfrg_westend_de}"
DB_HOST="${DB_HOST:-localhost}"
DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD env required}"

cp "$SRC" "$OUT"

# DB-Block ersetzen
perl -i -pe "s|^define\(\s*'DB_NAME'.*|define( 'DB_NAME', '$DB_NAME' );|" "$OUT"
perl -i -pe "s|^define\(\s*'DB_USER'.*|define( 'DB_USER', '$DB_USER' );|" "$OUT"
perl -i -pe "s|^define\(\s*'DB_PASSWORD'.*|define( 'DB_PASSWORD', '$DB_PASSWORD' );|" "$OUT"
perl -i -pe "s|^define\(\s*'DB_HOST'.*|define( 'DB_HOST', '$DB_HOST' );|" "$OUT"

# Salts ersetzen — die 8 Default-Local-Salts durch frische API-Salts
SALTS_BLOCK="$(cat "$HERE/wp-salts.txt")"
# Markierung suchen: AUTH_KEY ... NONCE_SALT — alle 8 Lines
python3 - <<PYEOF
import re
out_path = "$OUT"
salts_path = "$HERE/wp-salts.txt"
with open(out_path) as f: src = f.read()
with open(salts_path) as f: salts = f.read().strip()
# Match block: starting at first "define('AUTH_KEY'..." up to last "...NONCE_SALT...);"
pattern = re.compile(r"define\(\s*'AUTH_KEY'.*?define\(\s*'NONCE_SALT'.*?\);", re.DOTALL)
new = pattern.sub(salts, src, count=1)
with open(out_path, "w") as f: f.write(new)
print("Salts replaced:", new != src)
PYEOF

# Environment + Live-Settings
perl -i -pe "s|'WP_ENVIRONMENT_TYPE',\s*'local'|'WP_ENVIRONMENT_TYPE', 'production'|" "$OUT"

# Live-Flags vor "/* That's all" einfügen
python3 - <<PYEOF
out_path = "$OUT"
with open(out_path) as f: src = f.read()
inject = """
/* === LIVE-DEPLOY-FLAGS (Welle F Phase B, 2026-05-06) === */
define( 'WP_HOME', 'https://westend-hausarzt.de' );
define( 'WP_SITEURL', 'https://westend-hausarzt.de' );
define( 'FORCE_SSL_ADMIN', true );
define( 'AUTOMATIC_UPDATER_DISABLED', true );
define( 'DISALLOW_FILE_EDIT', true );
define( 'WP_AUTO_UPDATE_CORE', false );
define( 'DISABLE_WP_CRON', false );
if ( isset(\$_SERVER['HTTP_X_FORWARDED_PROTO']) && \$_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https' ) {
    \$_SERVER['HTTPS'] = 'on';
}
/* === END LIVE FLAGS === */

"""
marker = "/* That's all"
if marker in src:
    src = src.replace(marker, inject + marker, 1)
with open(out_path, "w") as f: f.write(src)
PYEOF

echo "✓ wp-config-live.php geschrieben: $(wc -c < "$OUT") Bytes"
