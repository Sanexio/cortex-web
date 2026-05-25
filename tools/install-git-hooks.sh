#!/usr/bin/env bash
# ============================================================
# tools/install-git-hooks.sh — idempotenter Installer für Cortex-Web Git-Hooks
# ============================================================
# Pro Mac einmal laufen lassen (`.git/config` ist lokal-only,
# also nicht über GitHub synchronisiert):
#
#   bash tools/install-git-hooks.sh
#
# Setzt `core.hooksPath = tools/git-hooks`, sodass Git die versionierten
# Hooks aus dem Repo benutzt statt der Sample-Hooks unter `.git/hooks/`.
#
# Aktive Hooks: tools/git-hooks/pre-commit (lint-no-tenant-leaks --strict).
# ============================================================

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
    echo "install-git-hooks: nicht in einem Git-Repo." >&2
    exit 1
}
cd "$REPO_ROOT"

HOOKS_DIR="tools/git-hooks"
if [ ! -d "$HOOKS_DIR" ]; then
    echo "install-git-hooks: $HOOKS_DIR fehlt im Repo." >&2
    exit 1
fi

current="$(git config --get core.hooksPath || true)"
if [ "$current" = "$HOOKS_DIR" ]; then
    echo "install-git-hooks: core.hooksPath bereits = $HOOKS_DIR (no-op)."
else
    git config core.hooksPath "$HOOKS_DIR"
    echo "install-git-hooks: core.hooksPath gesetzt auf $HOOKS_DIR."
    [ -n "$current" ] && echo "install-git-hooks: vorheriger Wert war '$current'."
fi

# Sanity: ausführbare Bit auf allen Hook-Dateien.
for f in "$HOOKS_DIR"/*; do
    [ -f "$f" ] || continue
    [ -x "$f" ] && continue
    chmod +x "$f"
    echo "install-git-hooks: chmod +x $f"
done

echo "install-git-hooks: aktive Hooks:"
ls -1 "$HOOKS_DIR" | sed 's/^/  - /'

echo "install-git-hooks: fertig."
