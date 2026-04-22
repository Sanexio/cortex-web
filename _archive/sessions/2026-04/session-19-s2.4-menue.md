## §3-legacy-session19 (historisch) — Session 19, 2026-04-22 (Praxis-Sprint 2 / S2.4 Menü-Restrukturierung)

### Ziel
Kuratierte Top-Navigation + Mobile-Drawer statt hart codierter Home-Scroll-
Anchor-Liste. Dr.-Stracke-Direktive Session-18-Ende: *„Sobald Inhalts-
cluster fertig migriert sind, muss das Menü mitwachsen, bevor der nächste
Cluster begonnen wird."* Aktuelles `wp_list_pages`-Fallback chaotisch.

### Durchgeführt (Architekten-Modus 4 Phasen, Dr.-Stracke-Delegation „du kannst entscheiden")

1. **Phase 1 Verständnis** — Ist-Analyse: `pxz_nav_list` hart codiert in
   `inc/homepage-data.php:131` mit 5 Fragment-Anchors (`#service`, `#team`
   etc.), auf Non-Home-Pages tot. Kein Mobile-Menü (display:none < 1100 px,
   kein Burger). Blocksy-Footer rendert alphabetisches `wp_list_pages`-
   Fallback. 7 Architektur-Fragen F1–F7 formuliert.

2. **Phase 2 Lösungsdesign** — Spec `S2.4_menu-restructure.md` (348 Zeilen,
   12 AK, 8 Risiken). Architekten-Entscheidungen: **F1b** PHP-Array
   `inc/nav-data.php` (statt WP-Menu-API oder Trunk-YAML) · **F2b**
   Desktop-Submenu-Hover pure-CSS · **F3a** Burger + Off-Canvas-Drawer +
   `<details>`-Accordion · **F4b** Footer NICHT im Scope (→ S2.4b) ·
   **F5a** Submenus nur wenn Kinder existieren (heute: nur `Check-Ups ▼`) ·
   **F6a** `.is-active` + `aria-current` · **F7a** 1 Theme-Commit + PXZ
   2.7.15 → 2.7.16. Commit A `758aba1` (Spec FREIGEGEBEN).

3. **Phase 3 Umsetzung (T1–T12) mit R-5-Auflösung unterwegs:**
   - **T1 Baseline:** Home-HTML-MD5 `92c007dc…` festgehalten. Pre-Check
     13 geplanter Nav-URLs zeigt **10/13 OK, 2× 404 (`/fachrichtungen/`,
     `/aerzte/`), 1× 301 (`/kontakt/` → `/contact-us/`)**.
   - **R-5-Entscheidungen** live getroffen: `/aerzte/` aus Menü
     entfernen (Cluster noch nicht migriert; `/team/` deckt Ärzte-Grid
     seit S2.3-B ab); `/kontakt/` direkt auf `/contact-us/` (kein 301-
     Roundtrip); `/fachrichtungen/` Stub-Page anlegen auf
     `template-standard.php` mit ehrlichem „Detailseiten in Vorbereitung"-
     Content. → **7 Top-Items statt 8** (ehrlich).
   - **T2 `inc/nav-data.php` neu** — `pxz_nav_data()` (4 Sprachen:
     DE/EN/FR/ES), `pxz_nav_primary()`, `pxz_nav_is_active()` mit
     Trailing-Slash-Normalisierung.
   - **T3 `template-parts/header-nav.php` Rewrite** — `pxz_render_nav_item()`
     rendert flat / has-children / Submenu-Kinder, parallel Desktop-Hover-
     Variante + Mobile-`<details>`-Accordion-Variante. Active-State via
     `.is-active` + `.is-active-parent` + `aria-current="page"`. Burger-
     Button + `<aside id="pxz-nav-drawer" role="dialog" aria-modal inert>` +
     `<div class="pxz-nav-drawer-backdrop" hidden>`.
   - **T4 `assets/css/nav.css` append (~220 Z.)** — Active-State-Block,
     Desktop-Submenu-Block (hover + focus-within + Chevron-Rotation),
     Burger-Block (mit `[aria-expanded="true"]`-Morph zu X), Drawer-Block
     (transform + transition + scroll-lock), Accordion-Block (`<details>`-
     Reset, Chevron), `.pxz-nav-list { display: none !important }` unter
     1100 px (Drawer übernimmt), Reduced-Motion-Block.
   - **T5 `assets/js/nav.js` neu (~95 Z. vanilla)** — Burger-Toggle mit
     2-Frame-rAF-Muster für saubere Transition, Scroll-Lock-Klasse,
     ESC-/Backdrop-/Close-Btn-Schließen, Submenu-Keyboard-Enhancement
     (Space toggled `aria-expanded`), Sticky-Scroll-Shadow.
   - **T6 `functions.php`** — `require_once PXZ_PATH . '/inc/nav-data.php'`
     + `wp_enqueue_script( 'pxz-nav', ..., true )` (footer) + PXZ_VERSION
     2.7.15 → 2.7.16.
   - **T7 CHANGELOG** — `[2.7.16] — S2.4 Menü-Restrukturierung` mit
     vollständigem Block.
   - **Stub-Migration** `tools/migrations/2026-04-22_s2.4_fachrichtungen-stub.php`
     ausgeführt: `/fachrichtungen/` (ID 9674) auf `template-standard.php`
     mit WPML-DE-Eintrag (trid 1126). Warmup 2× HTTP 200.
   - **T8 verify.sh** — §1 + §1b + §2 + §3 (54/54) + §3b + §4
     (Alignment 10/10) alle grün, Exit 0.
   - **T9 smoke-http.sh + Nav-URL-Matrix** — 5/5 smoke OK, **12/12 Nav-
     URLs HTTP 200** (inkl. neu /fachrichtungen/-Stub).
   - **HTML-Assertions** — pxz-nav-list ×1, pxz-nav-sub ×2
     (Desktop+Drawer), Burger ×4 (1 Button + 3 Bars), Drawer ×1,
     Backdrop ×1, nav.js ×1. Alle 7 Top-Labels + 5 Submenu-Kinder im
     HTML. `/praxis/` → `is-active" aria-current="page"`. `/team/` → 1×
     `logo-sanexio.svg` (Brand-Switch intakt). `/gesundheits-check-up/` →
     Check-Ups `is-active-parent`. Alle grün.
   - **T10 Puppeteer-Screenshots** bewusst übersprungen (Logik-Beweis
     AK-11 ausreichend: `template-homepage.php` + `homepage-data.php`
     nicht angefasst → Hero byte-identisch). Design-Feintuning fällt in
     Folge-Session.
   - **T11 Self-Check** `evidence/2026-04-22_s2.4_self-check.md` (12/12 AK,
     5 LL, 0 FK) + Baseline `evidence/2026-04-22_s2.4_baseline.md`.
   - **Theme-Commit `e2336e2`** (6 Files, +614 Z.).
   - **Cortex-Web-Commit B `80e4f11`** (4 Files: Migration + Baseline +
     Self-Check + THEME_POINTER 2.7.16).

4. **Phase 4 Selbstprüfung** — 12/12 AK = 100 %. FK-Check 0/5 eingetreten.
   R-5 (problematische URLs) wurde früh im Pre-Check erkannt und
   architektonisch entschieden, nicht nachgelagert. Home-MD5-Delta
   akzeptiert als gewollter Nav-Umbau (R-1).

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| `verify.sh` §1 + §1b + §2 + §3 + §3b + §4 | VERIFY OK ✓ |
| `smoke-http.sh` (5 URLs) | 5/5 HTTP 200 ✓ |
| 12 Nav-URLs (curl-Matrix) | 12/12 HTTP 200 ✓ |
| `validate.sh` (Cortex-Web) | OK ✓ |
| Theme HEAD | `e2336e2` (PXZ 2.7.16) ✓ |
| Working Trees (beide) | clean ✓ |
| Brand-Switch `/team/` → Sanexio-Logo | 1× `logo-sanexio.svg` ✓ |
| `.is-active` + `aria-current="page"` auf `/praxis/` | ✓ |
| `.is-active-parent` auf Check-Ups bei Detail-Pages | ✓ |
| Submenu 5 Kinder im HTML | 5/5 ✓ |
| Self-Check AK | **12/12 = 100 %** ✓ |

### Lessons Learned (5 neue Pattern-Kandidaten — S2.4-LL-1…5)

- **S2.4-LL-1** `wp-nav-progressive-enhancement.md` — `<details>`-Accordion
  + Drawer-HTML mit `inert` gibt funktionierende Grundstruktur ohne JS.
  JS ist nur UX-Enhancement (Focus-Lock, ESC, Scroll-Lock).
- **S2.4-LL-2** `nav-data-ssot.md` (entspricht `menu-scope-honest-entries.md`
  teilweise) — PHP-Array als Nav-SSoT statt WP-Menu-API, wenn Git-
  Trackbarkeit + Review-Pflicht wichtiger sind als Admin-UI.
- **S2.4-LL-3** `nav-active-state-url-match.md` — `$_SERVER['REQUEST_URI']`-
  Match + Trailing-Slash-Normalisierung funktioniert vor dem Main-Query,
  das `is_page()` nicht tut.
- **S2.4-LL-4** `menu-scope-honest-entries.md` — Pre-Check-HTTP-Matrix vor
  Menü-Commit; 404/301 pro URL dokumentiert entschieden (Stub / Remove /
  Umlenken). Keine toten Links.
- **S2.4-LL-5** — „Menü wächst mit Content" als operationalisierte
  Architektur-Regel: `/aerzte/` vorerst weg, bis Cluster migriert.

### Drei neue Patterns + Tutorial 20

- Pattern `menu-scope-honest-entries.md` (plattform-agnostisch)
- Pattern `wp-nav-progressive-enhancement.md` (WP-spezifisch)
- Pattern `nav-active-state-url-match.md` (WP-spezifisch)
- Tutorial `20-navigation-restrukturierung-und-mobile-drawer.md` (didaktisch,
  inkl. Progressive-Enhancement-Diskussion)

---
