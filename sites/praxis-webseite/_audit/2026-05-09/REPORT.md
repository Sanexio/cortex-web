# Audit-Report — Responsive Design + Performance

**Datum:** 2026-05-09
**Target:** westend-hausarzt.de (.de Staging, Basic-Auth)
**Scope:** alle 363 URLs aus page-sitemap.xml (DE 60 / EN 62 / FR 61 / ES 60 / IT 60 / PT-PT 60).
**Theme-HEAD:** PXZ 2.7.182 (Live)

---

## 1 — Responsive Design

**Tool:** `tools/responsive-audit.mjs` (Puppeteer + Chrome, 5 Viewports × 12 Pages = 60 Probes).

| Viewport | Probes | Defekte (horizontal-overflow) |
|----------|--------|-------------------------------|
| 375 px (iPhone Mini)   | 12 | 0 |
| 768 px (iPad portrait) | 12 | 0 |
| 1024 px (iPad land/SL) | 12 | 0 |
| 1440 px (Desktop)      | 12 | 0 |
| 1920 px (Full-HD)      | 12 | 0 |

**Resultat:** **60/60 PASS**. Layout korrekt responsive über alle gemessenen Pages und Viewports.

Edge-Findings (kein Defekt, dokumentiert):
- `#pxz-nav-drawer` (off-canvas Mobile-Menü) zeigt `overflow=330–380px` in der Probe — erwartet (drawer ist ausserhalb Viewport positioniert, slide-in via CSS).
- `.pxz-hub-overview-card` zeigt overflow auf `body-check`/`labor-status-baseline` — erwartet (Hub-Overview-Cards in horizontal-Scroll-Carousel).

**Theme-CSS:** 44 `@media`-Rules in `blocksy/main.min.css` (Breakpoints 600/690/783/1000 px). Viewport-Meta korrekt: `width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover` (Notch-tauglich, Zoom erlaubt = Accessibility-konform).

**→ Keine Code-Anpassung an Responsive-Layout nötig.**

---

## 2 — Ladezeit-Audit (vor dem Patch)

**Tool:** `_audit/2026-05-09/scan.sh` — parallel curl gegen alle 363 URLs.

| Metrik (HTTP 200) | Wert |
|-------------------|------|
| TTFB Median       | 0.997 s |
| TTFB p90          | 1.157 s |
| TTFB p95          | 1.243 s |
| TTFB max          | 2.209 s |
| HTML-Größe Median | 19.8 KB (gzip) |
| HTML-Größe max    | 35.2 KB (Homepage, gzip) |

**Status-Verteilung:** 362 × 200 + 1 × 301 (Sprach-Pretty-URL-Redirect). Keine Errors.

### 2.1 Befunde

| Befund | Schwere | Lösbar von hier? |
|--------|---------|------------------|
| **Kein Browser-Caching auf Assets** (kein `Cache-Control` Header auf CSS/JS/Bilder/Fonts/SVG) | 🔴 hoch | ✅ ja (.htaccess) |
| Bilder ohne `srcset` (24/24 auf Service-Page; 32/42 Homepage) → mobile lädt Desktop-Auflösung | 🟡 mittel | ❌ nein (Theme-Code) |
| Bilder ohne explizite `width`/`height` (24/42 Homepage; 6/24 Service) → CLS-Layout-Shift | 🟡 mittel | ❌ nein (Theme-Code) |
| Hero-JPEGs unkomprimiert (365 KB + 449 KB für 2 Räume) | 🟡 mittel | ❌ nein (Asset-Pipeline) |
| 19 separate CSS-Files Render-blocking; 6 inline-style-Blöcke (37 KB inline) | 🟢 niedrig | ❌ nein (Theme-Code) |
| TTFB 1.0 s Median — kein Page-/Object-Cache erkennbar | 🟢 niedrig | ❌ nein (WP-Plugin) |
| Lazy-loading auf allen Bildern ✅ | — | — |
| HTTP/2 + gzip-Compression aktiv ✅ | — | — |
| Alt-Texts gesetzt ✅ | — | — |

### 2.2 Asset-Payload Homepage

```
HTML (gzip)        : 34.5 KB
CSS (19 files, gz) : 74.9 KB
JS  (7 files, gz)  : 22.4 KB
Top-15 Images      : 900 KB+ (zwei Hero-JPEGs allein 800 KB)
```

---

## 3 — Live-Patch: Browser-Caching (umgesetzt)

**Datei:** `_deploy/welle-polish-perf/htaccess-public_html`
**Live-Backup:** `public_html/.htaccess.before-polish-perf-2026-05-09` (auf Server)

**Hinzugefügt:** `<IfModule mod_expires>` + `<IfModule mod_headers>` Block vor `mod_rewrite`-Block.

**Cache-Politik:**

| Ressource | max-age | Cache-Control |
|-----------|---------|---------------|
| Bilder (jpg/png/webp/avif/svg/ico) | 1 Jahr | `public, max-age=31536000, immutable` |
| Webfonts (woff/woff2/ttf/otf/eot)  | 1 Jahr | `public, max-age=31536000, immutable` |
| CSS/JS/Map                          | 30 Tage | `public, max-age=2592000` |
| HTML/JSON/XML                       | 0 s     | `no-cache, must-revalidate, max-age=0` |

`immutable` ist sicher, weil Theme-Assets cache-busted sind via `?ver=2.7.182…` (WP-Standard).

### 3.1 Verify nach Deploy

```
HTML (Homepage)              cache-control: max-age=0                              ✅
CSS  (components.css)        cache-control: public, max-age=2592000                ✅
CSS  (alle 19 stylesheets)   cache-control: public, max-age=2592000                ✅
JS   (blocksy/main.js)       cache-control: public, max-age=2592000                ✅
JS   (praxiszentrum/nav.js)  cache-control: public, max-age=2592000                ✅
JPEG (uploads/2023/08/Raum)  cache-control: public, max-age=31536000, immutable    ✅
JPEG (uploads/2026/04/…)     cache-control: public, max-age=31536000, immutable    ✅
SVG  (theme/assets/flags/)   cache-control: public, max-age=31536000, immutable    ✅

Pre-launch-verify (Welle-J Security-Block): 21/21 PASS                             ✅
Re-Scan 363 URLs:               361 × 200 + 1 × 301 + 1 × Timeout-Fluke (Retry=200) ✅
```

### 3.2 Erwarteter Effekt

- **Repeat-Visit-LCP**: −800–900 KB Transfer (Hero-Images aus Browser-Cache).
- **Repeat-Visit-FCP**: ≪ 200 ms (alle CSS aus Browser-Cache, kein Server-Roundtrip).
- **Lighthouse-Audit „Serve static assets with an efficient cache policy"**: rot → grün.
- **First-Visit-Performance**: unverändert (Cache-Header wirken erst beim 2. Besuch).

### 3.3 Rollback

```bash
# Auf cPanel-FTPS:
cd public_html
mv .htaccess .htaccess.polish-perf-failed
mv .htaccess.before-polish-perf-2026-05-09 .htaccess
```

---

## 4 — Offen für SSMD-MacBookPro (praxis-redesign Theme-Repo)

Konkrete Theme-Side-Fixes, die signifikant Performance bringen würden:

1. **Image-srcset aktivieren.** WP setzt `srcset` automatisch für Featured-Images via `the_post_thumbnail()`, aber Theme-Templates mit hardcoded `<img>`-Tags (Hero, Cards) verlieren das. Audit der Templates: wo steht `<img src=` ohne `wp_get_attachment_image()` drumherum?
2. **`width`/`height` auf alle `<img>`** — verhindert CLS. Auch hardcoded Templates betreffen.
3. **WebP-/AVIF-Conversion der Hero-Bilder.** 365 KB JPEG → ~80 KB WebP / ~60 KB AVIF. Plugin (Cavalcade, Imagify, ShortPixel) oder manuell via `cwebp` + `<picture>`.
4. **Critical-CSS inlinen, restliche CSS defer.** 19 Render-blocking Stylesheets mit nur 75 KB Total — Critical-CSS-Plugin wäre Overkill; aber zumindest non-critical (room-slider.css, reviews-carousel.css, cookie-consent.css, footer.css) mit `media="print" onload="this.media='all'"` Pattern asynchron laden.
5. **Server-Side-Cache.** TTFB 1.0 s Median ist hoch. WP Super Cache / W3 Total Cache / LiteSpeed Cache mit Page-Cache auf Disk → TTFB <100 ms erreichbar.

Diese Fixes brauchen Theme-Repo-Zugriff (auf SSMD-MacBookPro). **Local-First-Workflow gilt** (LL: keine direkten WP-Admin-Edits).

---

## 5 — Files in dieser Welle

```
_audit/2026-05-09/
├── REPORT.md                           ← dieser Report
├── all-urls.txt                        ← 363 URLs aus page-sitemap.xml
├── page-sitemap.xml                    ← Snapshot
├── scan-results.csv                    ← Ladezeit-Scan vor Patch
├── scan-results.after.csv              ← Ladezeit-Scan nach Patch
├── scan.sh                             ← Scan-Skript
├── homepage-headers.txt                ← Header-Snapshot Homepage
├── headers-home.txt                    ← Header-Snapshot Homepage (GET)
└── htaccess.live.before                ← Backup Live-htaccess vor Patch (Welle-J-Stand)

_deploy/welle-polish-perf/
└── htaccess-public_html                ← deployte Version (Welle-J + Polish-Perf-Block)

screenshots/responsive-audit-2026-05-09/
├── report.json                         ← 60/60 PASS
└── *_*.png                             ← Per-Page-Per-Viewport Screenshots
```
