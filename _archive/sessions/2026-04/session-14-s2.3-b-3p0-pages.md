## §3-legacy (historisch) — Session 14, 2026-04-19 (Praxis-Sprint 2 / S2.3-B inkl. 3 Revisions)

### Ziel
3 P0-Pages aus Page-Inventar #2 (`/praxis/`), #3 (`/team/`), #8 (404) mit Echt-Content, SEO-Layer, semantischem Markup, HWG-konform. Content-Ton "moderne Praxis, am Puls der Zeit, Rundumversorgung". Primär-Keyword: Innere Medizin / Internist Frankfurt Westend.

### Durchgeführt — ursprünglich + 3 Revisions

**rev0 (Architekten-Modus Phase 1–4):** Spec `S2.3-B_praxis-team-404.md` (FREIGEGEBEN, Dr.-Stracke-Delegation). Neue Theme-Module `inc/seo-data.php` + `inc/seo-meta.php` unterdrücken AIOSEO auf überschriebenen Seiten (S2.3-B-LL-3). `template-standard.php` dynamisiert Hero aus post_meta. `tools/migrations/2026-04-19_s2.3-b_pages.php` legt Pages via mysqli an (inkl. WPML-Translations-Eintrag nach LL-2). CSS-Finals `standard.css` + `404.css` (Tokens-only). `tools/smoke-seo.sh` neu (21 Assertions, pipefail-frei nach LL-4). Theme-Commit `74a9512` (PXZ 2.7.9). Cortex-Web-Commits `68a0db1` (Spec) + `9d503fc` (Tools+Evidence+Self-Check).

**rev1 (Dr.-Stracke-Review Runde 1):** Branding (`blogname` → "Praxiszentrum Dr. Stracke und Kollegen"), H1-Klassen von `.pxz-display` auf `.pxz-title-2` (40–104 px → 28–48 px), Hero-Padding reduziert, Team pivotiert von narrativ zu **Ärzte-Grid** (`template-team.php` + `inc/team-data.php` mit 8 Ärzten, Avatar-Placeholder mit Initialen, 3 Accent-Varianten), 404-Rippenspreizer-SVG-Cartoon. DESIGN_GUIDELINES §18.1+§18.2 neu. Theme-Commit `81d3f62` (PXZ 2.7.10). Cortex-Web-Commit `41cf66e`.

**rev2 (Dr.-Stracke-Review Runde 2 — "der Header sieht auf anderen Seiten anders aus!"):** Diagnose: `.pxz-nav` war hartkodiert nur in `template-homepage.php`. Extraktion nach `template-parts/header-nav.php` + Include in allen Templates + neue `assets/css/nav.css` mit dupliziertem `.pxz-nav` Rule-Set und `#header.ct-header { display: none !important }` zum Site-weiten Ausblenden des Blocksy-Default. Home 3/3 MD5-Match bleibt erhalten (dupliziertes CSS via later-in-cascade). `inc/team-data.php` auf echte Arztnamen aus `pxz_team_members()` synchronisiert. Theme-Commit `e2bb7b1` (PXZ 2.7.11). Cortex-Web-Commit `81e98ff`.

**rev3 (Sanexio-Logo für /team/):** ZIP-Asset entpackt, sanexio-red.svg als `assets/logo-sanexio.svg` aktiviert, compact-Variante als Reserve. URL-basierter Brand-Switch in `header-nav.php` (`is_sanexio = preg_match('#^/team/?#', $uri)`). CSS-Overrides `.pxz-nav-logo-sanexio img { width: 200..400px; aspect-ratio: 800/270 }`. DESIGN_GUIDELINES §18.3 neu (verbindliche Logo-Marken-Zuordnung). Initials-Fix: `méd.` (mit Akzent) + Komma/Punkt-Stripping in `pxz_doctor_initials()` → Saul zeigt "SS" statt "MS". Theme-Commit `dd1de0f` (PXZ 2.7.12). Cortex-Web-Commit `ee76e1b`.

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| `verify.sh` §1 + §1b + §2 + §3 + §3b + §4 | VERIFY OK ✓ |
| `smoke-seo.sh` | 21/21 Assertions ✓ |
| `smoke-http.sh` | 5/5 URLs < 5xx ✓ |
| `validate.sh` (Cortex-Web) | OK ✓ |
| Home MD5-Null-Delta (3 Viewports) | **3/3 MATCH ✓** |
| Karriere MD5 (3 Viewports) | 3/3 DELTA (gewollt — Header-Fix) |
| `/praxis/`, `/team/`, `/` HTTP | 200 ✓ |
| 404-Fallback inkl. Rippenspreizer-Cartoon | ✓ |
| Theme + Cortex-Web Working Tree | beide clean ✓ |

### Lessons Learned (4 neue Patterns)

- **S2.3-B-LL-2** `wpml-translations-direct-sql.md` — Bei SQL-Page-Inserts mit aktivem WPML muss ein Eintrag in `wp_icl_translations` geschrieben werden, sonst 404 trotz publish. Idempotente `upsert_wpml_de()` im Migration-Skript.
- **S2.3-B-LL-3** `wp-plugin-head-override.md` — AIOSEO rendert auf zwei Kampfplätzen (`wp_head` prio 1 und `pre_get_document_title` prio 99999). Überschreibung braucht auf beiden einen expliziten `remove_action`/`remove_filter`, nicht nur höhere Priorität.
- **S2.3-B-LL-4** `bash-sigpipe-grep-trap.md` — `set -o pipefail` + `grep -q` + `curl` erzeugt false-negatives bei grossen Outputs (SIGPIPE). Fix: pipefail weglassen ODER curl-Output in Variable buffern.
- **S2.3-B-rev2/3** `wp-unified-site-header.md` — Nav in `template-parts/header-nav.php` extrahieren, Parent-Theme-Default-Header via CSS ausblenden, URL-basierter Brand-Switch für Multi-Brand-Setup. Mit MD5-Null-Delta-sicherer CSS-Duplication-Strategie.

### DESIGN_GUIDELINES §18 neu (v3.1)

- §18.1 Content-Page-Typografie: `.pxz-display` reserviert für Home-Hero; Content-Page-H1 verbindlich `.pxz-title-2`.
- §18.2 Header-Branding-Konsistenz: Site-weit einheitlicher Nav, `blogname` als Single-Source, URL-basierte Overrides dokumentationspflichtig.
- §18.3 Logo-Marken-Zuordnung: Praxis-URLs → Praxiszentrum-Roundel + Text-Wortmarke; `/team/` → Sanexio-Horizontal-Wortmarke (integrierter Text). Anti-Pattern: Logos mischen.

### Tutorial 15 (Nexus)

`Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/15-seo-und-header-branding-im-theme.md` — SEO-Layer theme-eigen, AIOSEO-Override, Multi-Brand-Header, URL-basierter blogname-Filter.

---
