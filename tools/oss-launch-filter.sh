#!/usr/bin/env bash
# ============================================================
# oss-launch-filter.sh — git-filter-repo Recipe für OSS-Launch
# ============================================================
# Scrubbt die Cortex-Web-Git-History von allen Pfaden, die in
# Welle 1.x in das Sanexio-Tenant-Repo ausgegliedert wurden, plus
# legacy projects/-Pfade aus der Pre-Cortex-Web-Zeit.
#
# WAS RAUSGEHT:
#   trunk/content/             (Tenant-Trunk-YAMLs, jetzt in Sanexio-Tenant)
#   trunk/media/               (Tenant-Medien, jetzt in Sanexio-Tenant)
#   sites/praxis-webseite/     (WP-Theme + Tenant-Site, jetzt eigenes Repo)
#   sites/juvantis-webseite/   (Shopify-Tenant-Site)
#   projects/                  (legacy pre-Cortex-Web Tree)
#   sites/*.local              (lokale Working-Copies)
#   sites/*.local.json
#
# WAS BLEIBT in der gescrubbten History:
#   adapters/, tools/, _config/, _rules/, specs/, trunk/schema/,
#   trunk/_examples/, sites/sanexio-github-io/ (= public Astro-Site),
#   docs/, _integration-slots/.
#
# WARUM:
#   Cortex-Web wird als Open-Source-Layer veröffentlicht
#   (project_sanexio_cortex_business_model.md). Tenant-Daten dürfen
#   weder in HEAD noch in History auftauchen. HEAD ist seit Welle 15
#   linter-strict-clean. Diese Welle macht die History clean.
#
# WAS DAS SKRIPT NICHT TUT:
#   - Kein Force-Push. User pushed manuell wenn alle 5 Macs
#     bereit sind für Re-Clone.
#   - Kein Re-Clone der 5 Tenant-Macs.
#   - Kein Tag-Cleanup (live-de-2026-05-08-01 bleibt; manuell entscheiden).
#
# REVERSIBILITÄT bis Force-Push:
#   Backup-Branch pre-tenant-split-2026-05-24 existiert auf origin
#   und ist hier ebenfalls (gescrubbt) erhalten. Vor Force-Push
#   zusätzlich Bundle-Backup nach ~/Cortex/_archive/cortex-web-pre-oss/
#   ablegen — siehe RUNBOOK-Schritt 3.
#
# Nutzung:
#   bash tools/oss-launch-filter.sh dry          # nur Mirror-Scrub + Report
#   bash tools/oss-launch-filter.sh prepare      # dry + Bundle-Backup
#   bash tools/oss-launch-filter.sh push         # prepare + force-push (NUR mit User-Go)
# ============================================================

set -euo pipefail

MODE="${1:-dry}"
REPO_URL="git@github.com:Sanexio/cortex-web.git"
WORK="/tmp/cortex-web-scrub-$(date +%s)"
BUNDLE_DIR="$HOME/Cortex/_archive/cortex-web-pre-oss"

case "$MODE" in
  dry|prepare|push) ;;
  *) echo "Usage: $0 [dry|prepare|push]" >&2; exit 2 ;;
esac

command -v git-filter-repo >/dev/null || {
  echo "ERROR: git-filter-repo nicht installiert. Auf macOS: brew install git-filter-repo" >&2
  exit 1
}

echo "=== 1/4 Mirror-Clone nach $WORK ==="
git clone --mirror "$REPO_URL" "$WORK"

echo ""
echo "=== 2/4 Größe vor Scrub ==="
du -sh "$WORK" | head -1

echo ""
echo "=== 3/4 git-filter-repo Scrub ==="
cd "$WORK"
git filter-repo \
  --invert-paths \
  --path trunk/content \
  --path trunk/media \
  --path sites/praxis-webseite \
  --path sites/juvantis-webseite \
  --path projects \
  --path 'sites/*.local' \
  --path 'sites/*.local.json' \
  --force

echo ""
echo "=== 4/4 Verifikation ==="
echo "Größe nach Scrub:  $(du -sh "$WORK" | cut -f1)"
echo ""
echo "Tenant-Pfade in gescrubbter History (alle müssen 0 sein):"
for p in trunk/content trunk/media sites/praxis-webseite sites/juvantis-webseite projects; do
  n=$(git rev-list --all --objects 2>/dev/null | grep -c "^[a-f0-9]\{40\} $p/")
  printf "  %-35s %s blobs\n" "$p" "$n"
done

if [ "$MODE" = "dry" ]; then
  echo ""
  echo "DRY-MODE ENDE."
  echo "Mirror liegt unter:  $WORK"
  echo "Nächster Schritt:    bash $0 prepare"
  exit 0
fi

echo ""
echo "=== Bundle-Backup nach $BUNDLE_DIR ==="
mkdir -p "$BUNDLE_DIR"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
BUNDLE="$BUNDLE_DIR/cortex-web-pre-oss-${STAMP}.bundle"
# Bundle aus dem ORIGINAL-Origin, NICHT aus dem Scrub-Mirror,
# damit der Backup tatsächlich die pre-scrub-History enthält.
git clone --mirror "$REPO_URL" "$WORK.orig-for-bundle"
git -C "$WORK.orig-for-bundle" bundle create "$BUNDLE" --all
rm -rf "$WORK.orig-for-bundle"
echo "Bundle: $BUNDLE ($(du -sh "$BUNDLE" | cut -f1))"

if [ "$MODE" = "prepare" ]; then
  echo ""
  echo "PREPARE-MODE ENDE."
  echo ""
  echo "Bereit für Force-Push. Bevor du 'push' ausführst:"
  echo "  1. Alle 5 Tenant-Macs sollten aktuell idle sein (kein laufender pull/push)."
  echo "  2. Stelle sicher dass Sanexio/sanexio-tenant.git die Tenant-Daten enthält"
  echo "     (Sanexio-Tenant-Repo wurde in Welle 1.x ausgegliedert)."
  echo "  3. Bundle-Backup liegt unter: $BUNDLE"
  echo ""
  echo "Dann: bash $0 push"
  exit 0
fi

# MODE = push
echo ""
echo "=== Force-Push nach origin ==="
echo "WARNUNG: Diese Aktion schreibt origin/main + origin/pre-tenant-split-2026-05-24 um."
echo "         Alle 5 Tenant-Macs MÜSSEN danach re-clonen."
echo ""
read -r -p "Wirklich force-push? Tippe genau JA-ICH-WILL-OSS-LAUNCH: " confirm
if [ "$confirm" != "JA-ICH-WILL-OSS-LAUNCH" ]; then
  echo "Abgebrochen. Mirror bleibt unter $WORK liegen."
  exit 1
fi

git -C "$WORK" push --mirror --force "$REPO_URL"
echo ""
echo "=== Force-Push fertig. ==="
echo "Mirror: $WORK"
echo "Bundle: $BUNDLE"
echo ""
echo "Nächste Schritte für die 5 Tenant-Macs:"
echo "  cd ~/Cortex/projects && mv Cortex-Web Cortex-Web.pre-oss"
echo "  git clone $REPO_URL Cortex-Web"
echo "  bash Cortex-Web/tools/install-git-hooks.sh"
echo "  bash Cortex-Web/tools/validate.sh"
echo "  rm -rf Cortex-Web.pre-oss     # erst wenn validate grün"
