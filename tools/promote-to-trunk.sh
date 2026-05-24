#!/bin/bash
# ============================================================
# Cortex-Web Tool-Promotion — Sandbox → Trunk
# ============================================================
# Promotet ein Sandbox-Tool aus einem anderen Projekt (oder einem
# Sandbox-Pfad im Cortex-Web) in den definierten Trunk-Slot.
#
# Workflow:
#   1. Slot-Vertrag prüfen (`_integration-slots/<slot>/SLOT.md` muss
#      Status HARDENED haben).
#   2. Quellpfad prüfen (muss existieren, kein leeres Verzeichnis).
#   3. Trunk-Ziel prüfen (darf noch nicht existieren — oder mit
#      --force-overwrite erzwingen).
#   4. Dry-run: zeigt, was wäre.
#   5. Mit --commit: führt `git mv`/`cp -R` aus, updated SLOT.md auf
#      PROMOTED, committed (aber pusht NICHT — explizit nach Verify).
#
# Usage:
#   tools/promote-to-trunk.sh <slot-name>                # dry-run
#   tools/promote-to-trunk.sh <slot-name> --commit       # echt
#   tools/promote-to-trunk.sh --list                     # alle Slots
#   tools/promote-to-trunk.sh --help
# ============================================================

set -uo pipefail

CW_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLOTS_DIR="$CW_ROOT/_integration-slots"
DRY_RUN=1
SLOT_NAME=""

die()  { printf "FAIL: %s\n" "$*" >&2; exit 1; }
info() { printf "%s\n" "$*"; }
step() { printf "→ %s\n" "$*"; }

usage() {
    cat <<'EOF'
Cortex-Web Tool-Promotion

Usage:
  tools/promote-to-trunk.sh <slot-name>           # dry-run (Default)
  tools/promote-to-trunk.sh <slot-name> --commit  # echt promoten
  tools/promote-to-trunk.sh --list                # Slots auflisten
  tools/promote-to-trunk.sh --help

Slot-Vertrag muss Status HARDENED haben. Quelle:
  _integration-slots/<slot-name>/SLOT.md
EOF
}

list_slots() {
    printf "%-32s  %-12s  %s\n" "SLOT" "STATUS" "TRUNK-ZIEL"
    printf "%-32s  %-12s  %s\n" "----" "------" "----------"
    for d in "$SLOTS_DIR"/*/; do
        [ -d "$d" ] || continue
        name="$(basename "$d")"
        [ "$name" = "_template" ] && continue
        slot="$d/SLOT.md"
        [ -f "$slot" ] || continue
        status=$(grep -m1 '^status:' "$slot" | awk '{print $2}')
        target=$(grep -m1 '^trunk_target:' "$slot" | awk '{print $2}')
        printf "%-32s  %-12s  %s\n" "$name" "$status" "$target"
    done
}

# --- Args parsen ---
[ $# -eq 0 ] && { usage; exit 0; }
case "$1" in
    --help|-h) usage; exit 0 ;;
    --list)    list_slots; exit 0 ;;
    -*)        die "Unbekannter Flag '$1'. --help für Hilfe." ;;
    *)         SLOT_NAME="$1"; shift ;;
esac

while [ $# -gt 0 ]; do
    case "$1" in
        --commit) DRY_RUN=0; shift ;;
        --help|-h) usage; exit 0 ;;
        *) die "Unbekannter Flag '$1'." ;;
    esac
done

SLOT_DIR="$SLOTS_DIR/$SLOT_NAME"
SLOT_FILE="$SLOT_DIR/SLOT.md"
[ -d "$SLOT_DIR" ] || die "Slot '$SLOT_NAME' nicht gefunden in $SLOTS_DIR/"
[ -f "$SLOT_FILE" ] || die "$SLOT_FILE existiert nicht."

# --- Slot-Vertrag parsen (YAML-Frontmatter) ---
status=$(grep -m1 '^status:'           "$SLOT_FILE" | awk '{print $2}')
sandbox=$(grep -m1 '^sandbox_location:' "$SLOT_FILE" | awk '{print $2}')
target=$( grep -m1 '^trunk_target:'    "$SLOT_FILE" | awk '{print $2}')
owner=$(  grep -m1 '^owner_mac:'       "$SLOT_FILE" | awk '{print $2}')

[ -n "$status" ]  || die "SLOT.md hat kein 'status:'-Feld."
[ -n "$sandbox" ] || die "SLOT.md hat kein 'sandbox_location:'-Feld."
[ -n "$target" ]  || die "SLOT.md hat kein 'trunk_target:'-Feld."

info "Slot:           $SLOT_NAME"
info "Status:         $status"
info "Sandbox:        $sandbox"
info "Trunk-Ziel:     $target"
info "Owner-Mac:      $owner"
info "Modus:          $([ $DRY_RUN -eq 1 ] && echo 'DRY-RUN' || echo 'COMMIT')"
echo

# --- Pre-Flight ---
case "$status" in
    HARDENED) ;;
    PROMOTED) die "Slot bereits PROMOTED. Nichts zu tun." ;;
    *)        die "Slot-Status ist '$status', erwartet HARDENED. Promotion abgebrochen." ;;
esac

CORTEX_ROOT="$(cd "$HOME/Cortex" && pwd)"
SANDBOX_ABS="$CORTEX_ROOT/$sandbox"
TARGET_ABS="$CW_ROOT/$target"

[ -d "$SANDBOX_ABS" ] || die "Sandbox-Pfad existiert nicht: $SANDBOX_ABS"
[ "$(ls -A "$SANDBOX_ABS" 2>/dev/null)" ] || die "Sandbox ist leer: $SANDBOX_ABS"

if [ -e "$TARGET_ABS" ]; then
    die "Trunk-Ziel existiert bereits: $TARGET_ABS  (Slot zuerst aufräumen)"
fi

# Working tree muss clean sein (kein Promotion mit dreckigem Arbeitsverzeichnis)
if ! cd "$CW_ROOT"; then die "kann nicht ins CW-Root wechseln: $CW_ROOT"; fi
if [ -n "$(git status --porcelain)" ]; then
    die "Cortex-Web hat uncommittete Änderungen. Erst aufräumen, dann promoten."
fi

# --- Plan ---
step "Würde kopieren: $SANDBOX_ABS  →  $TARGET_ABS"
step "Würde SLOT.md auf PROMOTED setzen (mit Datum + Commit-Hash)"
step "Würde Commit anlegen: 'cw: promote $SLOT_NAME to trunk ($target)'"
step "WÜRDE NICHT PUSHEN — User entscheidet nach Verify."

if [ $DRY_RUN -eq 1 ]; then
    echo
    info "(Dry-run — nichts geändert. Mit --commit echt promoten.)"
    exit 0
fi

# --- Echte Promotion ---
echo
step "Kopiere Sandbox in Trunk-Ziel..."
mkdir -p "$(dirname "$TARGET_ABS")"
cp -R "$SANDBOX_ABS" "$TARGET_ABS"

step "Update SLOT.md: status → PROMOTED"
today=$(date -u +"%Y-%m-%d")
# Status updaten
sed -i.bak \
    -e "s/^status:.*/status: PROMOTED/" \
    -e "s/^promoted_at:.*/promoted_at: $today/" \
    "$SLOT_FILE"
rm -f "$SLOT_FILE.bak"

step "git add + commit"
git add "$target" "$SLOT_FILE"
commit_msg="cw: promote $SLOT_NAME to trunk ($target)

Sandbox: $sandbox
Slot-Vertrag: _integration-slots/$SLOT_NAME/SLOT.md
Owner-Mac: $owner"
git commit -m "$commit_msg"

new_hash=$(git rev-parse HEAD)
sed -i.bak "s/^promotion_commit:.*/promotion_commit: $new_hash/" "$SLOT_FILE"
rm -f "$SLOT_FILE.bak"
git add "$SLOT_FILE"
git commit --amend --no-edit >/dev/null

echo
info "✓ Promotion abgeschlossen."
info "  Slot:   $SLOT_NAME"
info "  Trunk:  $target"
info "  Commit: $(git rev-parse --short HEAD)"
info ""
info "Nächste Schritte:"
info "  1. Tool im Trunk testen (validate.sh + manueller Lauf)"
info "  2. Sandbox-Endzustand klären (read-only / löschen / Pointer-README)"
info "  3. git push  (wenn alles grün)"
