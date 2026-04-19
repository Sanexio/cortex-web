#!/usr/bin/env bash
# wp_test.sh — Testet die REST-API-Verbindung zur WordPress-Installation.
# Nutzung:  ./wp_test.sh [live|staging]
# Default: live

set -euo pipefail

TARGET="${1:-live}"
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/_config/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "FEHLER: $ENV_FILE nicht gefunden."
  echo "Kopiere _config/.env.example zu _config/.env und fuelle Werte aus."
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

if [[ "$TARGET" == "staging" ]]; then
  URL="$WP_STAGING_URL"
  USER="$WP_STAGING_USER"
  PW="$WP_STAGING_APP_PASSWORD"
else
  URL="$WP_URL"
  USER="$WP_USER"
  PW="$WP_APP_PASSWORD"
fi

if [[ -z "${USER:-}" || -z "${PW:-}" ]]; then
  echo "FEHLER: WP_USER oder WP_APP_PASSWORD fehlt in .env (Target: $TARGET)."
  exit 1
fi

echo "=== Test 1: REST-API erreichbar ==="
curl -sf "$URL/wp-json/" >/dev/null && echo "OK — REST-API antwortet" || { echo "FEHLSCHLAG"; exit 2; }

echo ""
echo "=== Test 2: Authentifizierung (GET /wp/v2/users/me) ==="
RESP=$(curl -sf -u "$USER:$PW" "$URL/wp-json/wp/v2/users/me")
NAME=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('name','?'))")
ROLE=$(echo "$RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('roles',['?']); print(r[0] if r else '?')")
echo "OK — eingeloggt als: $NAME (Rolle: $ROLE)"

echo ""
echo "=== Test 3: Seiten auflisten (erste 5) ==="
curl -sf -u "$USER:$PW" "$URL/wp-json/wp/v2/pages?per_page=5&_fields=id,title,status,link" | \
  python3 -c "
import sys, json
pages = json.load(sys.stdin)
for p in pages:
    print(f\"  [{p['id']}] {p['title']['rendered']} ({p['status']}) — {p['link']}\")
"

echo ""
echo "=== Test 4: Themes erkennen ==="
curl -sf -u "$USER:$PW" "$URL/wp-json/wp/v2/themes?status=active&_fields=stylesheet,name,version" | \
  python3 -c "
import sys, json
themes = json.load(sys.stdin)
for t in themes:
    n = t.get('name', {})
    n_txt = n.get('rendered', n) if isinstance(n, dict) else n
    print(f\"  Aktiv: {n_txt} (stylesheet: {t.get('stylesheet','?')}, v{t.get('version','?')})\")
" || echo "  (Themes-Endpoint nicht freigegeben — kein Fehler, nur Info)"

echo ""
echo "Fertig. Verbindung zu $URL funktioniert."
