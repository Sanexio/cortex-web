#!/usr/bin/env bash
# mirror-shopify-images.sh — Mirror Sanexio Shopify CDN images locally (CW-003)
#
# Usage: bash tools/mirror-shopify-images.sh [--dry-run] [--out <path>]
#
# Reads tools/mirror-shopify-images.map (TSV: scope<TAB>local_name<TAB>source_url)
# Downloads to _media-source/shopify-mirror/<scope>/<local_name>
# Verifies non-empty + writes per-scope _manifest.tsv with name|md5|size

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAP="$ROOT/tools/mirror-shopify-images.map"
DST_BASE="$ROOT/_media-source/shopify-mirror"
DRY_RUN=0

usage() {
  cat <<'EOF'
Usage: bash tools/mirror-shopify-images.sh [--dry-run] [--out <path>]

Options:
  --help       Show this help and exit.
  --dry-run    Print planned downloads/cache hits without writing files.
  --out <path> Mirror files under this directory instead of _media-source/shopify-mirror.

No browser is opened by this tool.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --out)
      [ "${2:-}" ] || { echo "ERROR: --out requires a path" >&2; exit 2; }
      DST_BASE="$2"
      shift 2
      ;;
    --out=*)
      DST_BASE="${1#--out=}"
      shift
      ;;
    *)
      echo "ERROR: unexpected argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

[ -f "$MAP" ] || { echo "ERROR: map missing: $MAP" >&2; exit 1; }

# Reset manifests
if [ "$DRY_RUN" -eq 0 ]; then
  for d in "$DST_BASE"/*/; do
    [ -d "$d" ] || continue
    : > "$d/_manifest.tsv"
    printf "name\tmd5\tsize\n" > "$d/_manifest.tsv"
  done
fi

ok=0; fail=0; cached=0
while IFS=$'\t' read -r scope local_name url; do
  [[ -z "${scope:-}" || "${scope:0:1}" == "#" ]] && continue
  dst_dir="$DST_BASE/$scope"
  if [ "$DRY_RUN" -eq 0 ]; then mkdir -p "$dst_dir"; fi
  manifest="$dst_dir/_manifest.tsv"
  if [ "$DRY_RUN" -eq 0 ]; then
    [ -f "$manifest" ] || printf "name\tmd5\tsize\n" > "$manifest"
  fi
  dst="$dst_dir/$local_name"

  if [ -s "$dst" ]; then
    md5=$(md5 -q "$dst")
    size=$(stat -f %z "$dst")
    if [ "$DRY_RUN" -eq 0 ]; then printf "%s\t%s\t%s\n" "$local_name" "$md5" "$size" >> "$manifest"; fi
    echo "  → $scope/$local_name (cached, ${size} B)"
    cached=$((cached+1))
    continue
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    echo "  DRY-RUN: would download $scope/$local_name <- $url"
    ok=$((ok+1))
    continue
  fi

  if curl -sf -o "$dst" "$url"; then
    if [ -s "$dst" ]; then
      md5=$(md5 -q "$dst")
      size=$(stat -f %z "$dst")
      printf "%s\t%s\t%s\n" "$local_name" "$md5" "$size" >> "$manifest"
      echo "  ✓ $scope/$local_name (${size} B)"
      ok=$((ok+1))
    else
      echo "    ✗ EMPTY: $url" >&2
      rm -f "$dst"
      fail=$((fail+1))
    fi
  else
    echo "    ✗ FAIL ($?): $url" >&2
    fail=$((fail+1))
  fi
done < "$MAP"

echo
echo "==> SUMMARY: $ok new, $cached cached, $fail failed"
[ "$fail" -gt 0 ] && exit 1
exit 0
