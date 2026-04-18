#!/usr/bin/env bash
# Cortex-Web — Schema-Validation (CW-002).
# Läuft AJV gegen alle Content-Dateien im Trunk. Für Phase 1: nur products.
# Exit 0 = alle Dateien valide, 1 = Setup-Problem, 2 = Validation-Fehler.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if [ ! -d node_modules ]; then
  echo "validate: node_modules missing — run 'bun install' in $REPO_ROOT" >&2
  exit 1
fi

fail=0
count=0

while IFS= read -r -d '' file; do
  count=$((count + 1))
  echo "validate: ${file}"
  if ! bun adapters/wordpress/build.mjs "$file" > /dev/null; then
    fail=$((fail + 1))
  fi
done < <(find trunk/content/products -type f -name '*.yaml' -print0)

if [ $count -eq 0 ]; then
  echo "validate: no product YAML files found (trunk/content/products/**/*.yaml)" >&2
  exit 1
fi

if [ $fail -gt 0 ]; then
  echo "validate: FAILED ($fail of $count files invalid)" >&2
  exit 2
fi

echo "validate: OK ($count file(s))"
