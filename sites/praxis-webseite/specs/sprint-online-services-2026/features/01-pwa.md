# Feature #1 — PWA-Scaffold

**Status:** ✅ in `inc/online-services/pwa.php` gebaut (2026-05-09)
**Code-Footprint:** 1 PHP-Datei, ~150 LOC. Keine externen Abhängigkeiten.

## FK-1 Verständnis
Praxis-Site soll auf iOS/Android als „App" installierbar sein („Zur Startseite hinzufügen") — sichtbar als Praxis-Icon, eigener Splashscreen, Offline-Fallback für Notruf-/Standort-Page. Kein Native-App-Store nötig.

## FK-2 Lösung
- Virtuelle Endpoints via `template_redirect`: `/manifest.webmanifest`, `/sw.js`, `/offline/`. Kein Rewrite-Flush, kein Plugin.
- `<link rel="manifest">` + Apple-Touch-Meta in `wp_head`.
- Service-Worker registriert sich aus `wp_footer`. HTTPS-Pflicht (lokale `.local`-Hosts erlaubt).
- Service-Worker-Strategie: Network-first für HTML (Offline-Fallback), Cache-first für Assets (CSS/JS/SVG/Bilder/Fonts).
- App-Shortcuts: Termin · Rezept · Standorte · Sprechstunden.

## FK-3 Umsetzung
Dateien:
- `inc/online-services/pwa.php` ✅
- `assets/icons/icon-192.png` · `icon-512.png` · `icon-maskable-512.png` · `apple-touch-icon.png` — TODO Bilder generieren (z. B. aus Logo via ImageMagick oder Sketch).

## FK-4 Verifikation (lokal)
- `curl -sk https://...local/manifest.webmanifest | jq` → JSON.
- `curl -sk https://...local/sw.js | head -5` → JS.
- Chrome DevTools → Application → Manifest → keine Fehler (sobald Icons existieren).
- iOS Safari → „Zur Startseite hinzufügen" zeigt Praxis-Icon.

## FK-5 Selbstprüfung
- Performance: SW lädt asynchron in `wp_footer`. Cache wird auf max. ~10 statische Seiten beschränkt.
- A11y: Offline-Page hat `prefers-color-scheme: dark` Fallback.
- Privacy: keine externen Requests im SW.
- Reversibel: 1 `require_once` aus functions.php auskommentieren = aus.

## Welle 2 (später)
- Push-Notifications für Recall (Grippeimpfung, Vorsorge) — braucht VAPID-Keys (Tier-3).
- Background-Sync für Service-Forms (Form-Submit funktioniert offline).
