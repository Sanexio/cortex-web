# Sessions 38–42 — Polish-Arc Header → Type-Scale → Re-Prio → Content-Stubs

> **Zeitraum:** 2026-04-23 (S38) → 2026-04-25 (S42)
> **Theme-Versionen:** 2.7.27 → 2.7.36 (5 Sprünge)
> **Charakter:** Polish + Strategische Re-Priorisierung. Brücke zwischen MVP-Sprint (S34–S36) und Sonntags-Sprint (S43–S46).
> **Status bei Schreibung:** Catch-Up am 2026-04-28 in Session 51 (LL-053-Sweep, Roll-Out-Plan §5 Schritt 6).

Cold-Archive für `Cortex-Web/SESSION_RESUME.md` §3-legacy-38..42 + §3-legacy-42-detail. Diese Blöcke wurden in Session 51 aus dem Hot-Layer ausgelagert.

---

<a id="s38"></a>
## §S38 — Header-Variante-A + Footer-Doppelung-Fix (PXZ 2.7.29)

**Theme-Commits:** `bca1521` (Theme) · Cortex-Web `61fd5db`
**Datum:** 2026-04-23

S38 Header-Variante-A + 2 Iterationen (Schrift 21 px bold, Homepage 4+3-Bug-Fix). Footer-Doppelung gefixt.

**Pattern entstanden:** `Nexus/_memory/patterns/single-source-ui-region.md` — Single-Source-Konsequenz für UI-Regionen, die sonst in mehreren Templates parallel leben.

**Tutorial:** `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/24-doppelte-render-quellen-aufspueren.md` — Diagnose-Methodik für stille Doppel-Render.

---

<a id="s39"></a>
## §S39 — Home-Polish + Font-Rollback (PXZ 2.7.29 → 2.7.31)

**Datum:** 2026-04-24
**Theme-Commits:** uncommitted, später in S40-Bundle `cc2a0e2` integriert

Home-Polish:
- Hero-Bild `grueneburgweg-empfang.jpg`
- Sprachen-Stack unter CTA
- Content-Bereich +25 % (1600/1500/1750 px je Breakpoint)
- Hero-Img 1600 px

Font-Verdopplungs-Rollback (mechanische Regel ohne Type-Scale erkannt als FK-3 = plausible Scheinlösung).

**Meta-Erkenntnis:** Claude hat kein visuelles Urteil — Session 40 bekommt eine Referenz-Seite mit gemessenem Type-Scale.

---

<a id="s40"></a>
## §S40 — DS-Block Apple Type-Scale (PXZ 2.7.32 → 2.7.34)

**Theme-Commits:** `cc2a0e2` (S40-Hauptcommit, integriert S39+S40) + Cortex-Web `a4898ba` + Sammel-Commit `7265c70` am S41-Anfang
**Datum:** 2026-04-25

**Phase A — DS-1 bis DS-6:**
- Referenz `apple.com/de` mit Puppeteer Scale-Probe gemessen
- T1–T8 Tokens neu definiert + Pill-Buttons + Body ×1.5 (Option B) + Mobile-Stufen-Shift
- 116 font-size-Deklarationen im Theme auf T-Tokens gemappt

**Phase B — 11 Polish-Requests:**
- Footer ×2 / full-width / Flex
- Homepage 1987 → 2019 px / Hero-Sub `<br>` / Final ×2 / MFA ×1.5
- Loc-Badges ×3 + Zweitstandort-Hours + Anfahrt-Button
- Footer-Logo ×4 auf Header-SVG

**Patterns entstanden:**
- `Nexus/_memory/patterns/reference-driven-type-scale.md`
- `Nexus/_memory/patterns/button-text-disambiguation.md`

**Tutorial:** Tutorial 10 (Type-Scale-Methodik).

---

<a id="s41"></a>
## §S41 — Re-Prio „DE-Content vor i18n" + Polish (PXZ 2.7.34 → 2.7.35)

**Theme-Commit:** `5e9bb22` PXZ 2.7.35
**Datum:** 2026-04-25

**Re-Priorisierung Dr. Stracke:** „DE-Content komplett → Menüführung → DE-Funktionalität → DE-SEO → dann i18n-Transfer" — Block B (P3) bleibt formal grün, aber DE-Content ist real noch lückenhaft. Wird neuer P3a-Block.

**Konkrete Arbeit:**
- S37-Header-Rollback (Flex statt 4+3-Grid)
- 9 DE-Slug-Stubs (DB-Migration IDs 9701–9709, WPML-DE-Zuweisung in trid 14701–14709, FAQ in trid=602 verschmolzen)
- 8 Slug-Mismatch-Redirects in `inc/redirects.php`
- Reading-Width 1,5× (`standard.css` + `page.css`)
- Doctolib-Floating-Button mittig rechts (`components.css` §7)
- Footer-Single-Source-Fix Homepage (chalk-Override aus `homepage.css` entfernt → Pattern `single-source-ui-region` Footer-Variante)
- Doctolib-CTA → Col 1 Adresse · Footer-Nav-Links weiß
- Homepage-Texte mit `<br>`-Struktur (mfa_subtitle 3 Zeilen, spec_intro 2 Zeilen, spec/team/loc-Title 1 Zeile)
- Container-Cap-Fixes (`.pxz-mfa-hero max-width: none`)

**HTTP-Sweep:** 21/21 = 200.

---

<a id="s42"></a>
## §S42 — P3a Phase 1+2: Content-Stubs + Header-Nav 7-Top-Level (PXZ 2.7.36)

**Theme-Commits:** `1760546` (Hauptcommit, +76/-23 LoC) + `b2d805f` (PXZ-Bump 2.7.36)
**Datum:** 2026-04-25
**Gerät:** Cluster-Mini-02 (home-Mac M2)

### Auftrag

Klare Tagesdirektive Dr. Stracke nach S41 Re-Prio: „Setze Projekt Redesign Webpage um — heute müssen der komplette deutsche Content und die Menüs mit funktionierender Weiterleitung stehen!"

Klärungsfragen beantwortet: Stub-Quelle = Variante A (`_content-archive/`), Datenschutz-Page = neue ID 4223, Bio-Stubs trotz leerem Inhalt ins Menü, „funktionierende Weiterleitung" = alle gezogenen Pages über Menü erreichbar.

### Verlauf in drei Phasen

**Phase 1 — 9 Stub-Pages mit Volltext (DB):**
- Inventar: 62 DE-Pages, 39 unverlinkt; alle 9 Quell-Dateien im `_content-archive/` lokalisiert.
- Python-Build-Skript (`/tmp/build_stubs.py`): Frontmatter parsen, Body extrahieren, WPForms-Shortcodes durch Mailto/Tel-Fallback ersetzen, Local-Embed-URL relativieren.
- Mojibake-Quellen (rund-ums-impfen 472, rund-ums-labor 475 — `?` statt Umlaute) frisch von Prod (`westend-hausarzt.com`) via curl gezogen, `entry-content`-Block extrahiert, Class-Attribute weggekürzt.
- Cookie-Richtlinie 9709: Original-Quelle war nur `wp:complianz/document`-Plugin-Block → eigenen Standard-DSGVO-Cookie-Hinweistext geschrieben (5 H3-Sektionen, 2010 Zeichen).
- Import via WP-CLI `post update` mit `--post_content` aus File. Verification: alle 9 Pages clean 800–7100 Bytes.
- FAQ-Slug-Konflikt: 3 anderssprachige Pages (4553/4567/4571) hatten gleichen Slug; meine Page 9705 wurde auf `frequently-asked-questions-2` ge-suffixt → direktem `UPDATE wp_posts SET post_name='frequently-asked-questions'` korrigiert.
- HTTP-Sweep aller 9 Stub-Slugs nach `wp rewrite flush`: **9/9 = 200**.

**Phase 2 — Header-Nav 7-Top-Level-Hierarchie + Architektur-Pivot:**
- **Erster Versuch (falsch):** WP-DB-Menü via WP-CLI aufgebaut. 53 Items unter `term_id=5` (Main Menu) angelegt mit Parent-Hierarchie via direktem SQL-UPDATE. HTTP-Sweep aller 49 Menü-Targets nach Redirect: 49/49 = 200.
- **Live-Probe Dr. Stracke:** „ich sehe weder Phase 1 noch Phase 2 umgesetzt". Diagnose: Theme rendert das Header-Nav **nicht** über `wp_nav_menu()`, sondern über `template-parts/header-nav.php` aus `inc/nav-data.php` (PHP-Array, S2.4 Decision F1b). Das ganze WP-Menü-System ist tote Infrastruktur im Praxis-Theme.
- **Architektur-Entscheidung Dr. Stracke:** „Status quo — das ist für mich ok." Trade-off-Diskussion (Optionen A/B/C: WP-Menü-Umstellung / Custom-Admin-Page / Hybrid) → Entscheidung pro PHP-Code, NICHT auf WP-Admin umstellen. Memory: `feedback_praxis_nav_via_code.md`. Pattern: `Nexus/_memory/patterns/theme-rendering-source-check.md`.
- **Zweite Umsetzung (richtig):** `inc/nav-data.php` DE-Block überschrieben mit 7 Top-Level + 49 Sub-Items + `match_prefix` für Active-States.
- **WP-DB-Cleanup:** Alle 53 angelegten Menü-Items aus term_id=5 via SQL gelöscht (Datenmüll, Theme nutzt sie nicht).
- HTTP-Sweep der gerenderten Menü-Hrefs (mit Redirect-Follow `-L`): **54/54 = 200** (49 Header + 3 Footer-Legal + Doctolib + Sono-Sub-URLs).

**Phase 3 — Footer-Legal-Block (Cookie-Richtlinie ergänzt):**
- `inc/footer-data.php` `legal_nav` für alle 4 Sprachen (de/en/fr/es): Cookie-Richtlinie als 3. Legal-Item ergänzt.
- Datenschutz-Href umgestellt: `/datenschutz/` (zeigte auf alte ID 3) → `/datenschutzerklaerung-2/` (neue ID 4223 mit Volltext-Inhalt).
- Live-Probe Footer: 3/3 Legal-Links 200 OK.

### Pre-Flight-Metriken am Session-Ende 42

- `validate.sh` — OK · `verify.sh` — VERIFY OK (10 Showpieces delta=0 auf 1440 + 430)
- Sanitizer `--probe`: alle 5 Dateien im Budget (MEMORY 19.5 k / Nexus-CLAUDE 27 k / GLOBAL_RULES 42 k / cortex-agent-RESUME 6.9 k / Cortex-Web-RESUME 31.9 k)
- HTTP-Sweep S42: 54/54 = 200
- Pending-Queues leer

### Patterns + Memory neu in S42

- **Pattern:** `Nexus/_memory/patterns/theme-rendering-source-check.md` — Vor jeder DB-Schreibaktion auf einem Custom-Theme prüfen, ob das Theme tatsächlich `wp_nav_menu()`/Standard-WP-System nutzt oder eine eigene Render-Quelle (PHP-Array, ACF, Block-Pattern) hat. Anti-Pattern aus S42 dokumentiert (53 unnötige Menü-DB-Items).
- **Memory:** `feedback_praxis_nav_via_code.md` — Status-quo-Entscheidung: Nav/Footer/Stammdaten bleiben PHP-Code, NICHT WP-Admin-bearbeitbar.

### Nicht erledigt am S42-Ende (kommt in Folge-Sessions)

- DB-Migrations-Skript für Prod-Push (9 Stub-Inhalte + WP-DB-Cleanup-Statements) — Pflicht-Punkt vor M1, aber kann erst sinnvoll erstellt werden, wenn S43 Content-Review abgeschlossen ist.
- Page-by-Page-Content-Review mit Dr. Stracke — Auftrag für Session 43.
- i18n (Übersetzungen aller Pages in EN/FR/ES) — nach Content-Review.
- Funktionalität (Forms, Doctolib, Cookie-Banner-Plugin, Kontaktformular) — nach i18n.
- Externe Blocker unverändert (L-1/L-2 Legal-Review, C-1 DF-Support, A-2 Foto-Shooting).

### Konsistenz-Auffälligkeiten S42 (KON-001)

- `sites/praxis-webseite/SESSION_RESUME.md` mit ~35 k Tokens (Stand Session 19) **stark veraltet** und überholt. Sanitizer überwacht es nicht. LL-044-Kandidat für Rotation in S43 (TODO).
- Tutorial „WP-CLI mit Local-by-Flywheel auf Mac (Sock-Pfad-Workaround)" weiterhin offen.

---

## Bezüge

- **S43–S46** — Folge-Sprint, 7 Stunden an einem Sonntag. Cold-Archiv: [`sessions-43-46-catch-up.md`](sessions-43-46-catch-up.md)
- **S34–S36** — Vor-Sprint, 24h-MVP. Cold-Archiv: [`sessions-34-36-mvp-sprint.md`](sessions-34-36-mvp-sprint.md)
- **S47** — Mid-Range-Reality-Check, rollte u. a. die S46-Header-Sizing-Bumps wieder ins fluid-clamp(). HOT-Block in `SESSION_RESUME.md` §3.

---

*Erstellt 2026-04-28 in Session 51 als LL-053-Sweep (Roll-Out §5 Schritt 6). Quelle: `SESSION_RESUME.md` §3-legacy-38..42 + §3-legacy-42-detail.*
