#!/usr/bin/env bash
# Cortex-Web · Shopify OAuth Authorize Launcher
#
# Öffnet die OAuth-Authorize-URL im Default-Browser. Die URL wird lokal
# aus Konfigurationswerten zusammengebaut, damit keine Copy-Paste-Zeilen-
# umbrüche auftreten.

set -euo pipefail

CLIENT_ID="19fe6e2bd121da1592ac75d27b167e72"
SHOP="juvantis.myshopify.com"
SCOPES="read_products,write_products,read_files,write_files,read_content,write_content,read_themes,write_themes"
REDIRECT_URI="http://localhost:53682/callback"
STATE="cortexweb-$(date +%s)"

# URL-encode helper (Bash-Builtins only)
urlencode() {
  local s="$1" out="" c
  for ((i = 0; i < ${#s}; i++)); do
    c="${s:i:1}"
    case "$c" in
      [a-zA-Z0-9.~_-]) out+="$c" ;;
      *) out+=$(printf '%%%02X' "'$c") ;;
    esac
  done
  printf '%s' "$out"
}

URL="https://${SHOP}/admin/oauth/authorize"
URL+="?client_id=${CLIENT_ID}"
URL+="&scope=$(urlencode "$SCOPES")"
URL+="&redirect_uri=$(urlencode "$REDIRECT_URI")"
URL+="&state=${STATE}"

echo "Opening Shopify OAuth authorize URL:"
echo "  Shop    : $SHOP"
echo "  Scopes  : $SCOPES"
echo "  Redirect: $REDIRECT_URI"
echo ""
open "$URL"
echo "Browser should now show the Shopify consent page."
echo "Click 'Install app' to trigger the callback to the running catcher."
