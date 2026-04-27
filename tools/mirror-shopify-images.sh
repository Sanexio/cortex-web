#!/usr/bin/env bash
# mirror-shopify-images.sh — Mirror Sanexio Shopify CDN images locally (CW-003)
#
# Usage: bash tools/mirror-shopify-images.sh
#
# Reads tools/mirror-shopify-images.map (TSV: scope<TAB>local_name<TAB>source_url)
# Downloads to _media-source/shopify-mirror/<scope>/<local_name>
# Verifies non-empty + writes per-scope _manifest.tsv with name|md5|size

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAP="$ROOT/tools/mirror-shopify-images.map"
DST_BASE="$ROOT/_media-source/shopify-mirror"

[ -f "$MAP" ] || { echo "ERROR: map missing: $MAP" >&2; exit 1; }

# Reset manifests
for d in "$DST_BASE"/*/; do
  [ -d "$d" ] || continue
  : > "$d/_manifest.tsv"
  printf "name\tmd5\tsize\n" > "$d/_manifest.tsv"
done

ok=0; fail=0; cached=0
while IFS=$'\t' read -r scope local_name url; do
  [[ -z "${scope:-}" || "${scope:0:1}" == "#" ]] && continue
  dst_dir="$DST_BASE/$scope"
  mkdir -p "$dst_dir"
  manifest="$dst_dir/_manifest.tsv"
  [ -f "$manifest" ] || printf "name\tmd5\tsize\n" > "$manifest"
  dst="$dst_dir/$local_name"

  if [ -s "$dst" ]; then
    md5=$(md5 -q "$dst")
    size=$(stat -f %z "$dst")
    printf "%s\t%s\t%s\n" "$local_name" "$md5" "$size" >> "$manifest"
    echo "  → $scope/$local_name (cached, ${size} B)"
    cached=$((cached+1))
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
