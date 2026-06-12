#!/usr/bin/env bash
# ============================================================
# wp-staging.sh — Control für die lokale WP-Staging-Site
# ============================================================
# Usage:
#   tools/staging/wp-staging.sh start    # Server starten (Hintergrund)
#   tools/staging/wp-staging.sh stop     # Server stoppen
#   tools/staging/wp-staging.sh status   # läuft er? + REST-Smoke
#   tools/staging/wp-staging.sh restart
#   tools/staging/wp-staging.sh url      # Basis-URL ausgeben
#   tools/staging/wp-staging.sh wp ...   # wp-cli gegen die Staging-WP
# ============================================================
set -euo pipefail

STAGING_DIR="${STAGING_DIR:-$HOME/.cortex/cortex-web-staging}"
WP_PORT="${WP_PORT:-8920}"
WP_HOST="${WP_HOST:-127.0.0.1}"
WP_DIR="$STAGING_DIR/wp"
WP="$STAGING_DIR/bin/wp"
PIDFILE="$STAGING_DIR/server.pid"
LOG="$STAGING_DIR/server.log"
BASE="http://$WP_HOST:$WP_PORT"

is_up() { curl -s -o /dev/null --max-time 3 "$BASE/wp-json" 2>/dev/null; }

cmd="${1:-status}"; shift || true
case "$cmd" in
  start)
    if is_up; then echo "wp-staging: läuft bereits ($BASE)"; exit 0; fi
    [ -x "$WP" ] || { echo "wp-staging: nicht eingerichtet — erst tools/staging/setup-local-wp.sh" >&2; exit 1; }
    nohup "$WP" server --path="$WP_DIR" --host="$WP_HOST" --port="$WP_PORT" > "$LOG" 2>&1 &
    echo $! > "$PIDFILE"
    for i in $(seq 1 20); do is_up && break; sleep 1; done
    if is_up; then echo "wp-staging: gestartet → $BASE (PID $(cat "$PIDFILE"))"; else
      echo "wp-staging: Start fehlgeschlagen — siehe $LOG" >&2; tail -5 "$LOG" >&2; exit 1; fi
    ;;
  stop)
    pkill -f "wp-cli.phar server --path=$WP_DIR" 2>/dev/null || true
    pkill -f "php -S $WP_HOST:$WP_PORT" 2>/dev/null || true
    rm -f "$PIDFILE"
    echo "wp-staging: gestoppt"
    ;;
  restart)
    "$0" stop; sleep 1; "$0" start
    ;;
  status)
    if is_up; then
      echo "wp-staging: UP → $BASE"
      curl -s --max-time 3 "$BASE/wp-json/" | head -c 120; echo
    else
      echo "wp-staging: DOWN"
    fi
    ;;
  url) echo "$BASE" ;;
  wp) exec "$WP" --path="$WP_DIR" "$@" ;;
  *) echo "Usage: $0 {start|stop|restart|status|url|wp ...}" >&2; exit 2 ;;
esac
