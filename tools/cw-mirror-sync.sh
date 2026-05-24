#!/bin/bash
# ============================================================
# Cortex-Web Mirror-Sync — Pull-only, schlank
# ============================================================
# Zweck: Cortex-Web auf allen Nexus-Macs als aktueller Mirror halten,
# damit jederzeit von jedem Mac aus ein neues Sub-Projekt in den
# Cortex-Web-Trunk aufgenommen werden kann (Promotion-Pipeline).
#
# Unterschied zu nexus-sync.sh:
#   - PULL-ONLY: niemals Auto-Commits, niemals Auto-Push.
#   - Bei lokalen Änderungen oder Divergenz: STOP + Marker + Log.
#   - Kein Multi-Writer-Schutz: Cortex-Web wird per Konvention nur von
#     einem Mac gleichzeitig bearbeitet (siehe CW-009).
#
# Installation auf einem Mac:
#   cp tools/cw-mirror-sync.sh.plist \
#      ~/Library/LaunchAgents/com.cortex.cw-mirror.plist
#   launchctl load ~/Library/LaunchAgents/com.cortex.cw-mirror.plist
#
# Deaktivieren:
#   launchctl unload ~/Library/LaunchAgents/com.cortex.cw-mirror.plist
# ============================================================

set -uo pipefail

CW_DIR="$HOME/Cortex/projects/Cortex-Web"
LOG_DIR="$CW_DIR/_archive/_mirror-logs"
LOG_FILE="$LOG_DIR/cw-mirror-sync.log"
STATE_FILE="$CW_DIR/.cw-mirror-state"
DIVERGENCE_MARKER="$CW_DIR/.cw-mirror-divergence"

mkdir -p "$LOG_DIR"

ts() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
log() { printf "[%s] %s\n" "$(ts)" "$*" >> "$LOG_FILE"; }
host() { hostname -s 2>/dev/null || hostname; }

if ! cd "$CW_DIR" 2>/dev/null; then
    log "FAIL: $CW_DIR existiert nicht — Mirror nicht aktiv"
    exit 1
fi

if [ ! -d ".git" ]; then
    log "FAIL: $CW_DIR ist kein Git-Repo"
    exit 1
fi

# --- Schicht 1: Lokale Modifikationen? ---
DIRTY=$(git status --porcelain 2>/dev/null | head -1)
if [ -n "$DIRTY" ]; then
    # Lokale Edits = aktive Bearbeitung. Mirror-Sync skippt.
    log "SKIP: lokale Modifikationen vorhanden — Mirror-Sync inaktiv (vermutlich der aktive Bearbeitungs-Mac)"
    echo "active-edit" > "$STATE_FILE"
    exit 0
fi

# --- Schicht 2: Fetch + Divergenz-Check ---
if ! git fetch --quiet origin main 2>>"$LOG_FILE"; then
    log "WARN: git fetch fehlgeschlagen — Netzwerk?"
    exit 0
fi

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
BASE=$(git merge-base HEAD origin/main 2>/dev/null || echo "")

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "in-sync $(ts)" > "$STATE_FILE"
    [ -f "$DIVERGENCE_MARKER" ] && rm -f "$DIVERGENCE_MARKER"
    exit 0
fi

if [ "$LOCAL" = "$BASE" ]; then
    # Fast-forward möglich
    if git merge --ff-only origin/main >>"$LOG_FILE" 2>&1; then
        log "OK: fast-forward auf $REMOTE"
        echo "in-sync $(ts)" > "$STATE_FILE"
        [ -f "$DIVERGENCE_MARKER" ] && rm -f "$DIVERGENCE_MARKER"
    else
        log "FAIL: ff-merge fehlgeschlagen — manuell prüfen"
        touch "$DIVERGENCE_MARKER"
    fi
    exit 0
fi

if [ "$REMOTE" = "$BASE" ]; then
    # Lokale Commits, die nicht auf origin sind = aktiver Bearbeitungs-Mac
    log "SKIP: lokale Commits ahead — Mirror-Sync inaktiv (vermutlich der aktive Bearbeitungs-Mac, Push erforderlich)"
    echo "local-ahead $(ts)" > "$STATE_FILE"
    exit 0
fi

# Echte Divergenz: lokale UND Remote-Commits divergieren
log "DIVERGENCE: lokale Commits + Remote-Commits divergieren. Manuell mergen. local=$LOCAL remote=$REMOTE base=$BASE"
echo "divergence $(ts)" > "$STATE_FILE"
touch "$DIVERGENCE_MARKER"
exit 1
