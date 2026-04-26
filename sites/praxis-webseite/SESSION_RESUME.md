# Session-Resume — Einstieg via Befehl „Projekt fortsetzen"

> **Standard-Einstieg seit 2026-04-18 (LL-043, `Nexus/_rules/SESSION_LIFECYCLE.md`):**
> In neuer Claude-Code-Session schreibst Dr. Stracke einfach
> **„Projekt fortsetzen"** (optional „… praxis-redesign"). Claude lädt dann
> automatisch:
>
> 1. Pflicht-Init Nexus (CLAUDE.md, MEMORY.md, GLOBAL_RULES.md, SESSION_LIFECYCLE.md)
> 2. Diese Datei (SESSION_RESUME.md)
> 3. Alle in §0 unten als Pflicht-Lesung markierten Folgedateien
> 4. Pre-Flight (`tools/verify.sh`)
> 5. Status-Statement im Architekten-Stil → wartet auf Wahl der Front

---

## §0 EINSTIEG „Projekt fortsetzen" — Pflicht-Lesung in dieser Reihenfolge

1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`
4. `~/Cortex/Nexus/_rules/SESSION_LIFECYCLE.md` (LL-042/043)
5. `~/Cortex/projects/praxis-redesign/_rules/WORKING_MODE.md` (Architekten-Modus)
6. `~/Cortex/projects/praxis-redesign/_rules/ARCHITECTURE.md` (Sprint-Roadmap)
7. `~/Cortex/projects/praxis-redesign/_rules/FEHLERPROTOKOLL.md` (PXZ-E-001…008)
8. `~/Cortex/projects/praxis-redesign/_rules/PRE_FLIGHT_CHECKLIST.md` (§7a/7b/7c)
9. `~/Cortex/projects/praxis-redesign/DESIGN_GUIDELINES.md` (v2.3, §13–§16.6)
10. `~/Cortex/projects/praxis-redesign/specs/sprint-0/README.md` + `OPEN_DECISIONS.md`
11. Diese Datei (SESSION_RESUME.md)
12. `cd ~/Cortex/projects/praxis-redesign && tools/verify.sh` (muss grün sein)

---

## §1 Stand & Version (gültig: 2026-04-26 Ende Session 26 nach S45 Room-Slider auf beiden Standorten)

- **PXZ_VERSION:** **2.7.53** live auf Local by Flywheel (Cluster-Mini-02). Theme-Commits `901b602` (S45 Dynamic-Height) + `ff3720a` (S45 Room-Slider) + `6214b33` (S43-Pending) + `e3e0631` (S44 Submenu-Rename) + `9907b7f` (S44 SSoT+Nav).
- **Room-Slider live auf BEIDEN Standort-Pages:**
  - `/standorte/zweigpraxis-bockenheimer/` (ID 9693): 2 Slides aus den 2 vorhandenen `core/media-text`-Blöcken (Behandlungsraum + Empfangsbereich Eterno) — Testlauf, ohne Content-Restruktur.
  - `/standorte/` (ID 9691, Hauptpraxis): 10 Slides aus 10 neu uploadeten Räume-Bildern (IDs 9798–9834): Empfang · Wartebereich · Flur Eingang · Sprechzimmer · Behandlungszimmer · Sonographie 1+2 · Spezial-Untersuchung · Untersuchungsraum · Flur Behandlungstrakt. Bildquelle `Cortex-Web/_media-source/praxis/standorte/grueneburgweg/` (14 Originale, 10 selektiert + sprechend benannt). 4 ungenutzte Originale (2/6/8/12) bleiben für später.
- **Slider-Architektur:** Eigene Section `pxz-standard-rooms` mit `.pxz-container` (1600 px) → matches address container width. Container V1 (chalk-bg + 1px line + soft shadow) optisch differenziert vom Adress-Container ohne Bruch. Tail-Content (Anfahrt-H2 + Maps) max 1140 px Lesebreite.
- **Slider-Mechanik:** Vanilla-JS, ~150 Zeilen. Pfeile ◀ ▶ + Dot-Indikator + Pointer-Swipe (Threshold 50 px, Mouse/Touch/Pen) + Keyboard ←/→/Home/End. ARIA `role=region`, `aria-current` auf Dots, `aria-hidden` auf nicht-aktiven Slides.
- **Dynamic Height (PXZ 2.7.53):** Container atmet — Höhe folgt aktivem Slide mit weicher Transition (0.4s, gleiches Easing wie horizontale Bewegung). Hochformat (Flur) und Querformat (Räume) beanspruchen jeweils ihre natürliche Höhe, kein toter Leerraum mehr. Image-Load-Hook recomputed initial sobald Bild-Maße bekannt (WP gibt keine `width/height`-Attribute aus → ohne Hook wäre initial 0).
- **Wiederverwendbarkeit:** Postmeta-Toggle `pxz_use_room_slider = 1` aktiviert auf jeder Standard-Template-Page. Fallback bei 0 media-text-Blöcken: unverändertes `the_content()`-Rendering.
- **Editor-UX null Bruch:** Dr. Stracke editiert Räume weiter im Block-Editor → media-text-Block einfügen = neue Slide, Drag&Drop = Reihenfolge ändern, Block löschen = Slide raus.
- **Spec + Self-Check:** `specs/sprint-2/S45_room-slider.md` (Verständnis, Lösung, Daten-Tabelle, 10/10 AKs, 3 Lessons).
- **2 neue Patterns:** `wp-media-text-blocks-as-carousel.md` + `dynamic-height-flex-carousel.md` (beide in `Nexus/_memory/patterns/`).
- **Pre-Flight:** verify.sh OK · smoke-http 5/5 HTTP 200 · curl-Probe beide Standort-Pages HTTP 200.
- **Backup-Datei:** `/tmp/pxz-page-9691-backup-20260426-120010.html` (Original-Content der Hauptpraxis-Page vor Slider-Restruktur).

**[Vorheriger Stand, historisch — Session 25 (S44 Standorte-SSoT + Leerbach-Cleanup)]:** PXZ_VERSION 2.7.51. Theme-Commits `9907b7f` (S44 SSoT+Nav) + `e3e0631` (Submenu-Rename) + `6214b33` (S43-Pending-Commit, war bisher uncommittet).
- **Header neu (DE):** 5 Top-Items statt 7 — `Praxis · Diagnostik · Leistungen · Service · Kontakt`. „Ärzte" entfernt (Duplikat von Praxis>Unser Team), „Standorte" entfernt (jetzt Sub von Praxis).
- **Praxis-Submenu neu:** `Über uns · Unser Team · Hauptpraxis Grüneburgweg · Zweigpraxis Bockenheimer · Aktuelles · Karriere`.
- **Standort-Container = Single Source of Truth:** `inc/practice-data.php` (SSoT) + `template-parts/loc-{main,secondary}.php` (Markup) + `assets/css/loc-cards.css` (Style, geteilt). Konsumenten: Home-Section + `/standorte/` (loc-main) + `/standorte/zweigpraxis-bockenheimer/` (loc-secondary). Eine Adress-/Telefon-/Sprechzeiten-Änderung in `practice-data.php` propagiert auf alle 3 Pages.
- **Page-Trim:** `/standorte/` (ID 9691) — Page-Titel + H1 jetzt „Hauptpraxis Grüneburgweg", H2-Adress-Block raus (kommt aus Container), Anfahrt + Maps bleiben. `/standorte/zweigpraxis-bockenheimer/` (ID 9693) — Adress-Hinweis im Fließtext gekürzt, Eterno-Erklärung + Bilder + Termin-Hinweise bleiben.
- **Leerbach-Cleanup (alle Live-relevanten Stellen):**
  - 2 Standort-Pages (DB) — Adresse Leerbachstraße 14 → Grüneburgweg 12, Telefon `069 920205960` → `069 247 574 523`.
  - 4 Impressum-Pages (DE/EN/FR/ES) — Adresse Leerbachstraße 62 → Grüneburgweg 12, Telefon `069 727819` → `069 247 574 523`. **DE komplett neu** (Mojibake-`?` war destruktiv → Volltext-Rewrite mit Boilerplate + sauberen Umlauten + saubere `mailto:praxis@westend-hausarzt.de`-Verlinkung). EN/FR/ES Mojibake-Sequenzen `Áº/Á§/Á /Á¹` etc. via Mapped Replace bereinigt. Telefax `069 97206408` **bewusst belassen** (Dr. Stracke entscheidet später).
  - 3 Kontakt-Pages (DE/EN/FR) — Maps-iframe-Place-ID auf Leerbach 62 → generische Embed-URL für Grüneburgweg 12. `mailto:`-Link auf `praxis@westend-hausarzt.de` korrigiert (vorher gmx.de-Inkonsistenz).
  - Cookie-Banner-Plugin (Complianz `wp_options`) — `address_company`-String mit Leerbach via WP-Bootstrap + `update_option()` korrigiert (PHP-Serialisierung muss sauber re-serialisiert werden, sonst Plugin-Crash).
  - **Verifikation:** 0 Leerbach-Treffer in `wp_posts.publish` + `wp_postmeta`-Inhaltsfeldern + `wp_options`. Reste in `wp_posts.revision` (Historie) + `wp_postmeta` E-Mail-Plugin-Logs (historische Mails) — risikolos, ignoriert.
- **CSS-Refactor:** `.pxz-loc-*` Block (126 Zeilen) aus `homepage.css` extrahiert in eigenes `loc-cards.css`. Bedingt enqueued auf Home + beiden Detail-Pages. `homepage.css` als dependency davorgeschaltet (Cascade-Reihenfolge bleibt deterministisch).
- **3 neue Patterns:** `wp-shared-component-via-template-part.md`, `wp-mojibake-double-encoding-fix.md`, `wp-option-via-bootstrap-not-sql.md` (alle in `Nexus/_memory/patterns/`).
- **WordPress-Tutorial Glossar** um 3 Begriffe ergänzt: Template-Part, Mojibake, PHP-Serialisierung.
- **Pre-Flight:** `tools/verify.sh` grün (alle 4 §-Checks). Smoke-Test: 5/5 URLs HTTP 200 (`/`, `/team/`, `/standorte/`, `/standorte/zweigpraxis-bockenheimer/`, `/impressum/`).
- **Sanitizer-Probe:** Exit 0, alle Dateien im Budget. Sanitizer-Learn: 0 Duplikate · 0 Cross-Project-Leaks · **102 stale Refs** (zu beobachten, V5 warn-only). Reports unter `Nexus/tools/cortex-sanitizer/logs/reports/2026-04-26-*.md`.
- **Offene Punkte (P-Backlog):**
  - **P1**: Telefax 069 97206408 im Impressum entscheiden (behalten/korrigieren/entfernen).
  - **P2**: Doppelte/inkonsistente Maps-iframe-Suche auf Kontakt-Pages — Page-Content wird vom `template-kontakt.php` überschrieben, daher rein kosmetisch in DB (Place-ID jetzt generisch).
  - **P2**: 4 Impressum-Pages — generischer `laekh.de`-Link statt `läkh.de` gesetzt (Umlaut-Domain ist gültig, aber unzuverlässig in Browsern). Dr. Stracke prüfen.
  - **P2**: Sanitizer-Learn 102 stale-refs — bei Gelegenheit Bereinigung des Memory-/Patterns-Pfade.
  - **P3**: Sprint-1 SFTP-Push (Code-Live-Push) immer noch pausiert — Memory `feedback_praxis_local_first_workflow.md` aktiv, kein Live-Push gemacht.

**[Vorheriger Stand, historisch — Session 24 (S43 Home-Refactor)]:** PXZ_VERSION 2.7.50 (war bisher uncommittet, jetzt als `6214b33` gebündelt im S44-Lauf committed). Stats-Block + MFA + Fachrichtungen+Team-Section komplett überarbeitet, **Fachrichtungs- und Team-Section auf Home zu einer kombinierten Section verschmolzen**, Eterno-Style Custom-Icons als rote 56×56-Tiles in jeder Card, alle 8 Mediziner:innen mit echten Fotos (800×800 quadratisch top-cropped, außer Jawich 400×400) und korrekten Titeln:
  - **Stats-Block** (4 Kacheln): 2 Standorte · 8 Fachdisziplinen · 500 m² Praxisfläche · 23.000 Patienten in der Datenbank. Jetzt **vor** MFA-Block (statt danach), mit Gradient-Tint chalk → #E8E8EC zum dunklen MFA.
  - **Hero-Subtitle**: „Acht Fachrichtungen. Zwei Standorte im Herzen Frankfurts." (zurück von „Acht Ärzte" — Landeberg/Arbitmann sind keine Ärztinnen).
  - **MFA-Subtitle**: „MFA bei uns heißt nicht Orga machen — sondern Teil der Medizin sein. Du bist Teil der Behandlung — mit eigenen Patient:innen, klarer Verantwortung und echtem Einfluss." (4 Sprachen, fortlaufender Text mit 1× `<br>`).
  - **Spec-Intro**: „Kurze Wege, enge Abstimmung, eine gemeinsame Patientenakte. Wenn der Befund Ihrer Gynäkologin für die internistische Abklärung relevant ist, erfolgt die Abstimmung bei uns noch am selben Tag — direkt im selben Haus." (DE; analog EN/FR/ES).
  - **Fachrichtungen + Team kombiniert**: 8 Cards (2-Spalten mobile, 4-Spalten desktop) mit Foto · 56×56 rotes Icon-Tile + Spec-Eyebrow · Name · Bio (harmonisiert ~64–71 Zeichen) · „Mehr erfahren →". Jede Card linkt auf Profile-Page der zuständigen Person. min-heights für Symmetrie.
  - **Eterno-Style Icons**: 8 SVGs (`internal/kardiology/ear/gynecology/urology/optometrist/osteopathy/psychotherapy.svg`) in `assets/icons/specialties/` (Brand-Assets, rechtlich freigegeben durch Dr. Stracke). Helper `pxz_specialty_icon_svg()` in `inc/specialty-icons.php` swap `fill="white"` → `fill="currentColor"`.
  - **Service-Karten** (5 Cards) verlinkt auf Service-Pages: `/terminanfrage/`, `/rezeptbestellung/`, `/ueberweisung/`, `/neupatienten/`, `/arbeitsunfaehigkeit/`, `/fragebogen-vor-termin/` (neue Page von Dr. Stracke selbst angelegt).
  - **Team-Page `/team/`**: Slug→Foto-Mapping in `template-team.php` — alle 8 Mitglieder zeigen Fotos statt Initialen.
  - **Personen-Daten korrigiert**: Linne → **Linnea** (4 Theme-Files + DB-Page-Title). Landeberg = **Psychotherapeutin** statt „Ärztin"-Stub. Arbitmann = **Physiotherapeutin** statt „Ärztin"-Stub. Barcsay (Urologie F.E.B.U.), Seelig (Gyn), Jawich (HNO), Shahin (Neuro) statt „Innere Medizin"-Boilerplate. Bios harmonisiert in 4 Sprachen mit Schema „[Facharzt-Titel]. [3 Schwerpunkte]".
  - **Fotos**: 6 neue Arzt-Fotos heruntergeladen (Eterno-CDN für Barcsay; praxis-seelig.de für Seelig; Doctolib für Shahin; Telegram-Foto vom User für Jawich; psychotherapeutikum.net für Landeberg; naturheilpraxis-arbitmann.com Bio-Subpage für Arbitmann). Alle 800×800 quadratisch top-cropped (Jawich 400×400 wegen 200×200-Original). Originale-Backup in `wp-content/uploads/2026/04/_originals/`.
  - **DB-Cleanup**: 6 Pages gelöscht inkl. Revisions+Postmeta — `/beschwerden-beim-wasserlassen/`, `/covid-19-risikofragebogen/`, `/fragebogen-bauchschmerzen/`, `/fragebogen-personalisierte-medizin/`, `/frequently-asked-questions/` (4 Duplikat-IDs!), `/fachrichtungen/`. Nav-Items in DE/EN/FR/ES bereinigt. Rewrite-Rules geflusht.
  - **Smoke-Test grün**: 5/5 HTTP 200 (`/`, `/karriere/`, `/wp-login.php`, `/feed/`, `/?s=test`). Sanitizer-Probe: alle Dateien im Budget.
  - **Globale Regel LL-051** in `Nexus/_rules/GLOBAL_RULES.md`: Glossar-Pflicht in jedem Tutorial. WordPress-Tutorial Glossar mit 50+ Begriffen in 9 Themenfeldern erweitert.
  - **Memory-Eintrag** `feedback_praxis_local_first_workflow.md`: Praxis-Webseiten-Änderungen immer Local-First, dann selektiver Push auf Live. Niemals direkt im Live-WP-Admin editieren.
  - **WP-Workflow-Lessons**: WordPress-Page-Anlagen über WP-Admin (oder WP-CLI), nicht über DB-Direct-Insert — DB-Insert umgeht WP-internen Save-Workflow (Hooks, Postmeta-Setup), Plugin-Filter-Konflikte führen zu 404 trotz korrektem DB-Eintrag (Saul-Page-Anlage gescheitert, dann von Dr. Stracke selbst über WP-Admin als `/fragebogen-vor-termin/` erfolgreich angelegt).

**[Vorheriger Stand, historisch — Session 19, 2026-04-22]:** PXZ_VERSION 2.7.16 nach S2.4 Menü-Restrukturierung abgeschlossen:
  - **Top-Nav kuratiert:** 7 Items (Praxis · Team · Fachrichtungen · Check-Ups ▼ · Sprechstunden · Kontakt · Karriere) + Submenu `Check-Ups ▼` mit 5 Kindern (Gesundheits/Cardio/Angio/Tumor/Basic).
  - **Mobile-Burger + Off-Canvas-Drawer** mit `<details>`-Accordion (Progressive Enhancement). Scroll-Lock, ESC-/Backdrop-Close, Focus-Management.
  - **Active-State** `.is-active` + `.is-active-parent` + `aria-current="page"` auf aktueller Seite und Submenu-Parent bei Kind-Page.
  - **Neue Daten-Quelle `inc/nav-data.php`** (F1b: PHP-Array, DE/EN/FR/ES) mit Helpers `pxz_nav_primary()` + `pxz_nav_is_active()`.
  - **R-5-Auflösung:** `/aerzte/` aus Menü entfernt (Cluster nicht migriert, `/team/` deckt Ärzte-Grid); `/kontakt/` zeigt direkt auf `/contact-us/` (kein 301); `/fachrichtungen/` Stub-Page angelegt (ID 9674, `template-standard.php`) mit ehrlichem „Detailseiten in Vorbereitung"-Content.
  - **Brand-Switch `/team/`** → Sanexio-Logo weiterhin funktional (DG §18.3).
  - **Home-Hero** visuell unverändert (`template-homepage.php` + `homepage-data.php` nicht angefasst). Home-HTML-MD5-Delta gewollt wegen Nav-Umbau (dokumentiert R-1).
  - **12/12 Nav-URLs HTTP 200** (keine toten Links).
  - Theme-Commit `e2336e2`. Cortex-Web-Commits `758aba1` (Spec) + `80e4f11` (Migration + Evidence + Self-Check + Pointer 2.7.16).
  - **12/12 AK = 100 %.** 5 Lessons S2.4-LL-1…5. 3 neue Patterns (`menu-scope-honest-entries`, `wp-nav-progressive-enhancement`, `nav-active-state-url-match`) + Tutorial 20 (`20-navigation-restrukturierung-und-mobile-drawer.md`).
  - **Dr.-Stracke-Kommentar:** „Das Design müssen wir anpassen, machen wir aber beim Feintuning." → P1-Folgearbeit, nicht blockierend.

**[Vorheriger Stand, historisch — Session 18]:** PXZ_VERSION 2.7.15 nach S2.3-checkups (Theme-HEAD `c7acaf7`). Cluster-`checkups`-Content-Migration abgeschlossen: 6 Pages.
  - `/check-ups/` NEU `template-checkup-hub.php` mit 5-Card-Grid (Hub).
  - `/gesundheits-check-up/` + `/cardio-check-up/` + `/angio-check-up/` auf `template-standard.php` mit Hero-Image + modernisiertem Content (Tippfehler raus, Großschreibung normalisiert, Doppeltext in Gesundheits-Check-Up durch Verlinkungen ersetzt).
  - `/tumorscreening/` auf `template-standard.php` (kein Hero).
  - **`/basic-check/` NEU `template-bridge-product.php` — vom WP-Adapter aus `trunk/content/products/bluttests/basic-check.yaml` (views.praxis) gerendert. CW-001 Roundtrip-Beweis erneuert. Bridge Praxis ↔ Juvantis erstmals produktiv.**
  - NEU: `inc/cross-brand-cta.php` (`pxz_cross_brand_cta`, registry-basiert, Card-/Inline-Variante).
  - 6 SEO-Funktionen in `inc/seo-data.php` (MedicalProcedure / MedicalClinic). AIOSEO unterdrückt.
  - 3 Detail-Pages verlinken auf `/basic-check/` als Selbstzahler-Alternative; Bridge verlinkt auf `sanexio.eu`.
  - Theme-Commit `c7acaf7`. Cortex-Web-Commits `606676f` (Spec) + `ebe9acf` (Migration + Evidence + Self-Check + Pointer).
  - **12/12 AK = 100 %.** Home + Karriere unverändert (CSS-Audit + 0 neue Klassen). 5 Lessons S2.3-checkups-LL-1…5.

- **NEUE PRIORITÄT 2026-04-22 (Dr.-Stracke-Direktive Session-18-Ende):** S2.4 Menü-Restrukturierung kommt **vor** weiteren Cluster-Migrationen. Patient muss alle Inhalte über Menü erreichen können.

**[Vorheriger Stand, historisch — Session 17]:** PXZ_VERSION 2.7.14 nach S2.3-kern (Theme-HEAD `058b062`). 4 Pages: Karriere MD5-MATCH, Kontakt-Template-Wechsel, Sprechstunden NEU (ID 9673), Home-Refactor mit `inc/practice-data.php` SSoT. Cortex-Web-Commit `2000c03`. 12/13 AK grün. 3 Patterns + Tutorial 18.

**[Vorheriger Stand, historisch:]** PXZ_VERSION 2.7.8 nach S2.0f / Theme-HEAD `8f596f7`. Stand des Themes wie nach S2.0b: Schicht 3 (Components) per `assets/css/components.css` mit 6 Blöcken eingezogen, globaler Enqueue zwischen `praxiszentrum` und page-CSS, Home MD5-Null-Delta verifiziert, Karriere −9 px WCAG-Accessibility-Gewinn (dokumentiert). Theme-Commits: `08f40ff` (feat components) + `8f596f7` (refactor specificity-fix).
- **S2.0f-Abschluss (Session 13):** Santapress-Plugin aus Local-WP entfernt (`wp_options.active_plugins` 26 → 25, Rewrite-Rules 13085 → 10979 Bytes, `wp_posts`-Count identisch vor/nach = 2860). Plugin archiviert in `_archive/santapress-2026-04-19/` mit Verfallsdatum **2026-05-19**. Neues Tool `tools/smoke-http.sh` (5 URLs × HTTP 200, 5xx-Fail-Regel). 6/6 AKs grün. Cortex-Web-Commits: `e036328` (Spec) + `a6cc6f3` (Tool+Evidenz+Self-Check) + `ced4e0a` (.gitignore-Hygiene).
- **Design-Autorität:** `DESIGN_GUIDELINES.md` v3.0 (§0 Cortex-DS-Backstop, §2 4-Schichten, §7 Spacing konsolidiert, §17 Austausch-Protokoll). Ältere Versionen in `DESIGN_GUIDELINES.v2.3.md` archiviert.
- **Cortex-DS-Backstop-Artifact:** `design-system/Cortex-Design-System.html` (git-trackbar, MD5 `c36b8cac63c2de3538a94ee74412e269`).
- **Site-Root:** `/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/`
- **URL:** `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local`
- **Child-Theme:** `wp-content/themes/praxiszentrum/`
- **Homepage + Karriere** weiter abgenommen; S2.0c ist Architektur-Infra ohne Optik-Änderung, visuelle v2.7.5-Abnahme bleibt gültig.

### Sprint-Status (Stand 2026-04-19 Ende Session 13)

| Sprint | Status | Kommentar |
|---|---|---|
| Sprint 0 — Foundation | ✅ abgeschlossen | |
| **Sprint 1 — Rollout-Infrastruktur** | ⏸ **PAUSIERT (bewusst)** | SFTP-Credentials liegen vor (`.env.sprint1.local` gefüllt, 2026-04-19 09:24). Dr. Stracke hat explizit entschieden: **„zuerst Design und Content"** (Cortex-Web SESSION_RESUME §4 P0). Sprint 1 erst nach Kernseiten. |
| **Sprint 2 — Kernseiten-Ausbau + Design-System** | 🟢 **aktiv, S2.0 ✅ + S2.0c ✅ + S2.1 ✅ + S2.2 ✅ + S2.0b ✅ + S2.0e ✅ + S2.0f ✅** | S2.0 + S2.0c (Design-System) + S2.1 (Inventar) + S2.2 (Skelett-Templates) + **S2.0b (Komponenten-Bibliothek v2.7.8, 12/12 AKs nach S2.0e-Nachtrag)** + **S2.0e (Verify-Hardening: tools/verify.sh §1b+§3b, 8/8 AKs, Cortex-Web `88290b0`+`6352b1e`)** + **S2.0f (Santapress-Plugin-Entfernung, 6/6 AKs, Cortex-Web `e036328`+`a6cc6f3`+`ced4e0a`, Archive bis 2026-05-19) abgeschlossen 2026-04-19.** Offen: **S2.3 Content-Batches** (Batch B/C/G frei verfügbar, alle Vorbedingungen da; Batch A blockiert durch Rechtssicherheitsquelle), S2.0d Mini (`kar`→`karriere`-Rename), S2.4 Menü, S2.5 QA-Audit. |
| Sprint 2b — Legacy-Content-Migration | ⏳ nach Sprint 2 | 172 Legacy-Seiten. |
| Sprint 3 — Mehrsprachigkeit (WPML) | ⏳ geplant | |
| Sprint 4 — Go-Live (SEO/Schema/Cut-Over) | ⏳ geplant | |

- **`tools/verify.sh`:** alle 4 Checks grün (Split, Reset, Computed-Style 54/54, Alignment 10/10) — zuletzt 2026-04-19 nach S2.0c-Commit.

### Theme-Repo (`praxiszentrum/`) Commit-Stand

```
8f596f7  refactor(s2.0b): extract promoted classes from homepage.css + add specificity fix
08f40ff  feat(s2.0b): add components.css Schicht 3 + pxz-components enqueue + PXZ_VERSION 2.7.8
dd3e4e1  fix(s2.2): comment strings triggering WP page-template auto-discovery
6c02cb4  feat(s2.2): 8 skelett-templates + functions.php enqueue + PXZ_VERSION 2.7.7
c4f18ba  feat(s2.0c): tokens.css v2 with 4-layer model; bump PXZ_VERSION 2.7.5 → 2.7.6
257304e  feat(s2.0): design-token SSoT; bump PXZ_VERSION 2.7.4 → 2.7.5
914af8d  feat(s0.2): extract karriere CSS; bump PXZ_VERSION 2.7.3 → 2.7.4
c3f7db7  feat(s0.2): extract homepage CSS from inline to assets/css/homepage.css
8c9d0fa  chore: baseline v2.7.3 (homepage + karriere + mfa-formular)
```

### Cortex-Web-Repo — Praxis-spezifische Commits (seit Subsumierung)

```
df50333  docs(sprint-2/s2.0b): self-check 10/12 green + theme-pointer 2.7.8 + md5 evidence
2056e3e  docs(sprint-2/s2.0b): component-library spec freigegeben
6e51fa2  docs(session-10): close S2.2 session — SESSION_RESUME finalize (dach + praxis) + PXZ-E-009
5a2a247  docs(sprint-2/s2.2): self-check 12/12 + theme-pointer 2.7.7 + verify shots
de4f580  docs(sprint-2/s2.2): template typology spec freigegeben (8 skeletons + S2.0b einschub)
d7f797d  docs(sprint-2/s2.1): page-inventory.md mit 27 Einträgen + self-check 8/8
```

---

## §2 Pre-Flight-Befehl

```bash
cd ~/Cortex/projects/Cortex-Web/sites/praxis-webseite && bash tools/verify.sh
```

Erwartet: Exit 0. Prüft §1 Split + §1b Split-Paar-Check (S2.0e) + §2 Reset + §3 Computed-Style 54/54 + §3b Component-Probe 8+2 (S2.0e) + §4 Alignment 10/10 (PXZ-E-008).

**Zusätzlich nach Infrastruktur-Eingriff (Plugin-Entfernung, Rewrite-Rules):**
```bash
cd ~/Cortex/projects/Cortex-Web/sites/praxis-webseite && bash tools/smoke-http.sh
```
Erwartet: Exit 0, keine 5xx, 5 URLs gecheckt (Home, Karriere, wp-login, feed, search).

Nach jeder CSS-Änderung **zusätzlich**:
```bash
bun run tools/ab-diff.mjs                          # nur Nachher
bun run tools/ab-diff.mjs --override='<vorher-css>' # mit Vorher-Vergleich
```

---

---

## §3 Sofort-Status-Frage an Dr. Stracke (Architekten-Stil)

> „Home-Refactor S43 ist ✅ abgeschlossen — Stats umgebaut, MFA neu getextet, Fachrichtungen+Team zu einer Section verschmolzen, alle 8 Mediziner:innen mit echten Fotos + korrekten Titeln + Eterno-Icons, 5 Service-Karten verlinkt, 6 Pages gelöscht, `/team/`-Page mit Fotos. PXZ_VERSION 2.7.50. Welche Front?
>
> **A.** **Andere Pages auf der Home-Story aufräumen** — Hero-Image-Caption, Final-CTA, Service-Tier-Struktur (siehe Redundanz-Audit aus S43): Punkt 2 (Final-CTA-Section streichen oder umfunktionieren) hat den größten Effekt mit kleinem Aufwand.
> B.** **Sprint 1 SFTP-Push aktivieren** — Theme + DB nach Live (westend-hausarzt.com) deployen. Voraussetzung: SFTP-Credentials liegen in `.env.sprint1.local` vor (Stand Session 13 abends). Workflow: Local-First (Memory `feedback_praxis_local_first_workflow.md`) mit selektivem DB-Push.
> C. **Andere Cluster** — `aerzte` (2 P0), `services`-Hub fülmen (4 P1), `diagnostik` (10 P1), `legacy/de` (23 Triage).
> D. **Notfall-Footer-Block** — Theme-weiter Umbau („116 117 / 112 / Bereitschaftsdienst").
> E. **i18n WPML S44+** — EN/FR/ES-Routing aktivieren.
> F. **S2.3-A Datenschutz + Impressum** — weiterhin blockiert durch Rechtsquelle.
> G. **Andere konkrete Änderung** — Sie nennen."

Keine Code-Änderung vor expliziter Wahl. Memory-Regeln aktiv: Local-First-Workflow, Glossar-Pflicht in Tutorials (LL-051).

---

## §4 Verbote / harte Regeln für die nächste Session

- Niemals Status „fertig", ohne dass `tools/verify.sh` grün ist.
- Niemals CSS-Änderung an zwei Stellen (PXZ-E-001).
- Niemals Annahme über Design-Intent ohne Referenz-Bild (PXZ-E-003).
- Niemals Screenshot ohne Computed-Style-Probe (PXZ-E-004).
- Niemals globaler `.pxz-home p { … }`-Reset — immer `.pxz-home :where(p) { … }` (PXZ-E-008).
- Niemals Cache-/DevTools-Delegation an Dr. Stracke (PXZ-E-007 §7a).
- Bei „einige Punkte"/„passt nicht"-Formulierungen: Paraphrase in 1 Satz vor jedem Edit (§7b).
- Bei Hauptask-Abschluss: proaktiv „Session beenden" anbieten (LL-042).

---

## §5 Letzte Session — Was wurde erledigt

### Session 24 — 2026-04-26 — S43 Home-Refactor + Team-Page-Fotos + DB-Cleanup

**Auftrag Dr. Stracke (mehrere konsekutive Anweisungen über die Session verteilt):** Stats umbauen, MFA neu texten, Fachrichtungen-Cards mit Profile-Page-Verlinkung, Team-Cards verlinken, Fachrichtungs- und Team-Section zusammenführen (Redundanz!), Bios harmonisieren, Fotos symmetrisieren, Service-Karten mit Pages verlinken, 6 Pages löschen (Fragebögen + FAQ + Fachrichtungen-Stub), Team-Page Fotos einfügen, Glossar-Pflicht als globale Regel, Local-First-Workflow als Memory.

**Theme-Edits (PXZ_VERSION 2.7.36 → 2.7.50, 15 Bumps):**
- `inc/homepage-data.php` (4 Sprachen synchron): Stats neu (4 Kacheln), Hero-Subtitle, Spec-Intro, MFA-Subtitle, team_roles Bios harmonisiert, alle Service-Tiers
- `template-homepage.php`: Stats vor MFA verschoben, Fachrichtung+Team-Sections zu einer kombinierten Section verschmolzen, Service-URL-Mapping inline, neue Combined-Card-Struktur mit Eterno-Icon-Tile
- `template-team.php`: Slug→Foto-Mapping mit Upload-Pfad-Render
- `inc/specialty-icons.php` (NEU): Helper `pxz_specialty_icon_svg()` mit File-Cache, swap `fill="white"` → `fill="currentColor"`, aria-hidden
- `inc/team-data.php` + `inc/data/team.json`: Title/Intro/Bio/Qualifications korrekte Fachrichtungen statt „Innere Medizin"-Stub für Barcsay/Seelig/Jawich/Shahin/Landeberg/Arbitmann + Linne→Linnea
- `inc/nav-data.php`: 4 Fragebogen-Items + FAQ-Item + Fachrichtungen-Items in DE/EN/FR/ES entfernt
- `assets/css/homepage.css`: Stats-Gradient-Tint, neue `.pxz-team-spec/icon/more`-Klassen mit min-height für Symmetrie
- `assets/icons/specialties/`: 9 Eterno-SVGs heruntergeladen (8 aktiv + orthopedy als Backup)

**Foto-Pipeline:**
- 6 Fotos heruntergeladen (Eterno-CDN, praxis-seelig.de, Doctolib, Telegram, psychotherapeutikum.net, naturheilpraxis-arbitmann Bio-Subpage)
- Alle 800×800 quadratisch top-cropped via `sips` (Jawich 400×400 wegen Original-Auflösung)
- Originale-Backup in `wp-content/uploads/2026/04/_originals/`

**DB-Operationen:**
- 6 Pages gelöscht (4 Fragebogen-Pages + 4× FAQ-Duplikate + Fachrichtungen-Stub + 5 Page-Revisions + Postmeta)
- Linne→Linnea Page-Title-Update (ID 9680)
- Saul-Page-Anlage gescheitert (`/dr-saul/` 404 trotz korrektem DB-Insert) — `/docteur-saul/` (ID 9675) nutzbar
- `/fragebogen-vor-termin/` von Dr. Stracke selbst über WP-Admin angelegt nach gescheitertem DB-Insert-Versuch (Plugin-Filter blockiert direkt eingefügte Pages — Lesson Learned)

**Nexus-Edits:**
- `Nexus/_rules/GLOBAL_RULES.md` §28 LL-051: Glossar-Pflicht in Tutorials
- `Nexus/Second Brain/30 Tutorials/WordPress/WordPress Grundlagen.md` §13: Glossar mit 50+ Begriffen in 9 Themenfeldern
- `~/.claude/projects/.../memory/feedback_praxis_local_first_workflow.md` (NEU) + Index-Update

**Verify:**
- `tools/smoke-http.sh`: 5/5 HTTP 200 ✅
- Sanitizer-Probe: alle Dateien im Budget (LL-044) ✅
- 8 Profile-Page-URLs: HTTP 200 ✅
- 6 gelöschte URLs: HTTP 404 ✅

**Lessons Learned:**
- WordPress-Page-Anlagen über WP-Admin oder WP-CLI, **nicht** über Direct-MySQL-INSERT (Plugin-Hooks-Konflikt → 404)
- Bei Foto-Crops für Headshot-Look: `sips --cropOffset 0 X -c H W` mit X = horizontal-zentriert, Y=0 für Top-Crop (Hochformat-Portraits behalten Gesicht)
- Fachrichtungen+Team auf einer Home redundant wenn 1:1-Mapping → kombinieren spart Section-Höhe und vereinheitlicht UX
- Direct-DB-Inserts ohne `_wp_page_template`-Postmeta können von `pre_get_posts`-Filtern (Plugins) ignoriert werden trotz korrekter `wp_posts`-Zeile

**Theme-Repo unberührt:** keine git commits am `praxiszentrum`-Theme heute (alle Änderungen ungestaged). Kommt mit Sprint 1 (SFTP-Push) oder beim nächsten manuellen Commit.

---

### Session 13 — 2026-04-19 — Sprint 2 / S2.0f Santapress-Plugin-Entfernung

**Auftrag Dr. Stracke:** „Projekt fortsetzen Cortex-Web" → „Wir starten so, wie es für dich am sinnvollsten erscheint" → Claude-Wahl: Option D (Santapress-Entfernung vor S2.3 Batch B).

**Phase-1-Wahl (F1–F4):** F1a (S2.0f in Sprint 2), F2c (Archive-Then-Delete statt Hard-Delete — Gegenvorschlag von Claude, Dr. Stracke zugestimmt), F3b (verify.sh + HTTP-Smoke), F4a (volle Spec).

**Phase-2-Wahl (F5–F7):** an Claude delegiert. Entscheidungen: F5b-modifiziert (5xx-Fail-Regel, 5 URLs), F6b (Verfallsdatum 2026-05-19), F7b (wp_posts-Paranoia-Snapshot).

**Phase 3 Umsetzung (T1–T8):** Pre-Condition-Snapshot → Hook-Dependency-Audit (0 externe Referenzen) → `active_plugins` via mysqli-prepared (26 → 25) → Plugin-Ordner nach `_archive/santapress-2026-04-19/` → Rewrite-Rules DELETE + Warmup (13085 → 10979 Bytes) → `smoke-http.sh` neu angelegt + verify.sh Komplett-Lauf beide grün → Self-Check 6/6 → Cortex-Web-Commits `e036328` + `a6cc6f3` + `ced4e0a`.

**Phase 4 Selbstprüfung:** 6/6 AKs grün. F7b-Paranoia bestätigt: `wp_posts`-Count vor/nach identisch (2860, Delta=0 je post_status) → kein `deactivation_hook`-Schaden. 5 Lessons Learned S2.0f-LL-1…5 (in Pattern `wp-plugin-safe-removal.md` + Tutorial 14).

**Theme unberührt:** HEAD `8f596f7`, PXZ_VERSION `2.7.8` unverändert. S2.0f war reiner Local-WP-Infrastruktur-Eingriff, kein CSS/PHP-Touch am Theme.

### Session 12 — 2026-04-19 — Sprint 2 / S2.0e Verify-Hardening (Kurz)

`tools/verify.sh` um §1b `grep_split_css()` + §3b `component_probe()` (zweistufige Bash-Probe) erweitert. Architektur-Pivot während Umsetzung: ursprüngliche DOM-Probe auf Draft-Page scheiterte an WP-Rewrite-Rule-Grenze (Santapress-Interferenz) → Bash-Probe architektonisch sauberer (Code-Korrektheit vs. Integrations-Korrektheit). S2.0b-Self-Check rückwirkend auf 12/12 angehoben. 8/8 AKs. Cortex-Web `88290b0`+`6352b1e`. Tutorial 13, Pattern `verify-probe-code-vs-integration.md`.

### Session 11 — 2026-04-19 — Sprint 2 / S2.0b Komponenten-Bibliothek (v2.7.8)

**Auftrag Dr. Stracke:** „Projekt fortsetzen Cortex-Web" → „du entscheidest"
→ Claude-Wahl: Front A (S2.0b). F1–F7 + F-1…F-5 alle delegiert.

**Architekten-Modus 4-Phasen-Durchlauf:**

- **Phase 1 Verständnis:** 7 Rückfragen F1–F7 mit Trade-off-Tabellen. Entscheidungen
  F1a (zwei Ebenen), F2a (`.pxz-eyebrow` heraufziehen), F3b (kar-Rename verschoben
  auf S2.0d), F4b (erweiterter Scope inkl. Buttons + Typografie), F5a (eigenes
  Stylesheet), F6a (Patch-Bump 2.7.8), F7b (verify.sh-Erweiterung auf Draft-Testseite).
- **Phase 2 Lösungsdesign:** Spec `specs/sprint-2/S2.0b_component-library.md`
  mit 14 Constraints, 12 AKs, 7 Risiken. 5 weitere Freigabe-Fragen F-1…F-5 alle
  delegiert (24 px hartkodiert in `.pxz-card`; Testseite dauerhaft; 3 atomare
  Commits; `.pxz-sect*` + `.pxz-section*` parallel).
- **Phase 3 Umsetzung (T1–T13):**
  - `components.css` angelegt (128 Zeilen, byteidentisch aus homepage.css gehoben)
  - `homepage.css` getrimmt (5 Blöcke entfernt: Container + Typografie + Buttons
    + Hero-Base + Section)
  - `functions.php`: `pxz-components` enqueued, 10 Deps umgestellt, PXZ_VERSION
    2.7.7 → 2.7.8
  - WP-Testseite `s2-0b-probe` (ID 9670) via direktem MySQL-Client (wp-cli
    scheiterte an Local-by-Flywheel-Socket → neues Pattern).
  - **In-Session-Bug-Jagd:** erste Post-Refactor-Shots zeigten 6/6 MD5-Delta.
    Root-Cause via Puppeteer `offsetHeight` pro Sub-Element: `.pxz-eyebrow` und
    `.pxz-sect-intro` verloren margins durch Spezifitäts-Kollision mit
    `.pxz-home :where(p)`-Reset (beide Spez 0,1,0; homepage.css lädt jetzt
    später als components.css → Reset gewinnt).
  - **Fix S2.0b-LL-1:** page-scope Overrides `.pxz-home .pxz-eyebrow` +
    `.pxz-home .pxz-sect-intro` in homepage.css (Spez 0,2,0).
  - Post-Fix: Home MD5 3/3 MATCH ✓. Karriere −9 px am `.wpforms-submit` durch
    WCAG-`min-height: 44px` + `line-height: 1` aus `.pxz-btn` (dokumentierter
    Accessibility-Gewinn).
  - 2 atomare Theme-Commits `08f40ff`+`8f596f7`. Commit C (verify.sh-Erweiterung)
    auf Mini-Sprint S2.0e verschoben.
  - Cortex-Web-Commit `df50333`: Spec + Self-Check + Baseline-Evidenz + MD5-Diff
    + 12 Shots + THEME_POINTER → 2.7.8.
- **Phase 4 Selbstprüfung:** AK-Tabelle 10/12 grün (AK-8 + AK-10 verschoben auf
  S2.0e). 5 Lessons Learned S2.0b-LL-1…5.

**Verifiziert (AK-Tabelle aus Self-Check):**
AK-1…7, AK-9, AK-11, AK-12 grün. AK-8 + AK-10 dokumentiert verschoben.
**Score: 10/12 = 83 %** (2/12 auf S2.0e).

**Lessons Learned (S2.0b-LL-1…5):**
- LL-1 `:where()`-Resets schützen nur innerhalb derselben Datei
- LL-2 Puppeteer-Tablet-Shots jittern (SSIM 0.988) — MD5 ist nicht allein Wahrheit
- LL-3 Globale Komponenten-Regeln bringen Accessibility-Props auf alle Pages
- LL-4 Class-Promotion erfordert Kaskaden-Analyse gegen nicht-promotierte Resets
- LL-5 WP-CLI scheitert bei Local-by-Flywheel; Socket-Umweg via Lightning-mysql

**Session-Ende-Workflow LL-042 (5 Schritte durchlaufen):**
- Schritt 1 Projekt-Audit grün (beide Repos clean, verify+validate grün)
- Schritt 2 Nexus-Audit → MEMORY/CLAUDE/SYSTEM_MAP auf v2.7.8 aktualisiert
- Schritt 3 Pattern-Optimierung → 2 neue Patterns (`css-layer3-promotion.md`,
  `local-wp-mysql-socket.md`)
- Schritt 4 Tutorial-Update → Tutorial 12 (`12-css-spezifitaet-und-komponenten-schichten.md`)
- Schritt 5 SESSION_RESUME.md (dach + praxis) finalisiert

---

### Session 10 — 2026-04-19 — Sprint 2 / S2.2 Template-Typologie (v2.7.7)

Nachgetragen für Vollständigkeit. Details in Cortex-Web `SESSION_RESUME.md §3a`
und in `evidence/2026-04-19_s2.2_self-check.md` (12/12 AKs grün). 8 Skelett-
Page-Templates + 8 CSS-Skelette + functions.php-Erweiterung. In-Session-Bug
PXZ-E-009 (Code-Comment-Strings `Template Name:` triggerten WP-Auto-Discovery);
Hotfix via Bindestrich-Schreibweise. Theme-Commits `6c02cb4`+`dd3e4e1`,
Cortex-Web-Commits `de4f580`+`5a2a247`+`6e51fa2`.

---

### Session 9 — 2026-04-19 — Sprint 2 / S2.1 Seiten-Inventar

**Auftrag Dr. Stracke:** „Projekt fortsetzen Cortex-Web" → „ich überlasse dir die
entscheidung" (nach Status-Statement). Claude-Wahl: Option A (S2.1 Seiten-Inventar)
— Spec freigegeben, Entscheidungen E1–E4 getroffen, empfohlener Default.

**Architekten-Modus 4-Phasen-Durchlauf:**

- **Phase 1 Verständnis:** Zielzustand (27-Zeilen-Tabelle mit 9 Pflicht-
  Spalten), Constraints (keine Theme-Änderung, kein Content-Crawl, keine
  YAML-Migration, verify.sh grün am Ende), §8-Freigabe-Fragen in der Spec
  geklärt: Frage 2 ist durch §1.3 schon gelöst (arzt-7/8 mit TBD-Flag),
  Fragen 1+3 werden durch Sitemap-Abgleich in Phase 3 beantwortet.
- **Phase 2 Lösungsdesign:** Spec war bereits in Session 8 freigegeben,
  keine neue Spec-Runde.
- **Phase 3 Umsetzung:**
  - Sitemap-Abgleich: `curl -s https://westend-hausarzt.com/sitemap.xml` →
    `page-sitemap.xml` mit ~150 URLs, primär mehrsprachig (EN/FR/ES +
    WPML-Legacy). **Kritischer Befund**: Prod-Site hat KEINE Fachrichtungen-
    Struktur, nutzt stattdessen Check-ups + einzelne Diagnostik-Unterseiten.
    Dr. Strackes Arzt-Profil `/dr-siegbert-stracke-mba/` ist das einzige live
    Arzt-Profil in der Sitemap.
  - `specs/sprint-2/page-inventory.md` geschrieben (9826 B, 27 Zeilen ×
    9 Pflicht-Spalten, 10× P0 / 17× P1). Aufbau: 8 Kern (#1–#8) + 9
    Fachrichtungen (#9–#17) + 9 Ärzte (#18–#26) + 1 Karriere (#27).
    Zähl-Mehrdeutigkeit „Team vs. Ärzte-Übersicht" explizit aufgelöst:
    #3 Team (narrativ, `standard`, P0) ≠ #18 Ärzte-Grid (`team`, P0).
    arzt-7 (#25) vorgefüllt mit Prod-URL `/dr-siegbert-stracke-mba/` +
    Vermutungs-Flag für S2.3-Batch-D-Bestätigung.
  - Ableitungs-Abschnitte im Inventar: **Template-Häufigkeitstabelle**
    (8 benötigte PHP-Skeletons), **Batch-Vorschlag A–G für S2.3**,
    **Menü-Skizze** (Top-Level aus P0-Zeilen), **QA-Pflichtliste** (P0-
    Zeilen mit `status=done` als Go-Live-Gate).
  - 6 offene Folgeentscheidungen dokumentiert (5 aus Spec §5 + 1 neu:
    Datenschutz-Dublette `/datenschutzerklaerung-2/` auf Prod → Sprint 2b).
- **Phase 4 Selbstprüfung:** `evidence/2026-04-19_s2.1_self-check.md` —
  **8/8 AKs grün**. AK-1 Datei existiert, AK-2 27 Zeilen, AK-3 alle §2.6-
  Pflicht-Seiten, AK-4 keine leeren Pflichtspalten, AK-5 Theme-Repo
  unverändert (`git status --short` leer), AK-6 `verify.sh` Exit 0 (§1
  Split + §2 Reset + §3 Computed-Style 54/54 + §4 Alignment 10/10),
  AK-7 Home/Impressum/Datenschutz/Kontakt/404 alle P0, AK-8 alle offenen
  Folgeentscheidungen + TBD-Flags dokumentiert.
- **Fehlerklassen-Abgleich:** FK-1 (Missverständnis) geschlossen durch
  Phase-1-Klärung + Spec-Entscheidung-Referenz; FK-2 (Scheinverständnis)
  adressiert über Architektur-Unterschied-Dokumentation auf Inventar-
  Zeile #9; FK-3 (Plausible Scheinlösung) strukturell ausgeschlossen
  durch Pflichtspalten-Kontrakt; FK-5 (Kontextverlust) adressiert durch
  Inventar als persistenten Kontext-Anker für S2.2–S2.5.

**Verifikation:**
- `tools/verify.sh` grün: Exit 0, 4 Checks (Split/Reset/54-Computed/10-Alignment).
- `git status --short`: clean nach Commit.
- AK-Score: **8/8 = 100 %**.

**Commits (Cortex-Web-Repo):**
- `d7f797d docs(sprint-2/s2.1): page-inventory.md mit 27 Einträgen + self-check 8/8`
  (+200 Zeilen, 6 Dateien: Inventar, Self-Check, 4 verify-Shots).
- Kein Push (b=1 aus Sprint 0 gilt unverändert).

**Nexus-Architektur-Updates (Session-Ende LL-042 Schritte 2+3):**
- `Nexus/_memory/MEMORY.md` — praxis-webseite-Zeile auf S2.1 ✅ aktualisiert,
  neuer Pfad-Referenz-Eintrag für Seiten-Inventar, Pattern-Katalog um
  `page-inventory.md` ergänzt, Tutorial-Referenz auf Tutorial 10, Letzte-
  Aktualisierung-Zeile auf Session 9.
- `Nexus/SYSTEM_MAP.md` — Stand-Zeile auf PXZ_VERSION 2.7.6 + S2.1 ✅ aktualisiert.
- `Nexus/CLAUDE.md` — Sessions 7 + 8 + 9 im Cortex-Web-Abschnitt ergänzt.
- `Nexus/_memory/patterns/page-inventory.md` — neues Pattern angelegt
  (7-Schritte-Ablauf, Pflicht-Spalten, 4 Ableitungs-Abschnitte, Lessons
  S2.1-LL-1…5, Anti-Pattern-Liste, Transferbarkeit auf Juvantis-Webseite
  und Sprint 2b Legacy-Migration).

**Tutorial-Update (Schritt 4):**
- `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/10-seiten-inventar-website-relaunch.md`
  neu (didaktische Erklärung für Dr. Stracke: Was ist ein Inventar? Warum?
  Wie aufgebaut? Welche Fallen? Anwendung im Praxis-Projekt).

**Lessons Learned (S2.1-LL-1…5):**

- **S2.1-LL-1** — Sitemap (`page-sitemap.xml`) als Pre-Check statt
  Content-Crawl ermöglicht Architektur-Diagnose ohne Scope-Verletzung.
- **S2.1-LL-2** — Spec-Zähl-Mehrdeutigkeiten (Team vs. Ärzte-Übersicht)
  müssen explizit aufgelöst und im Self-Check begründet werden.
- **S2.1-LL-3** — TBD-Zeilen dürfen Vermutungs-Vorbefüllungen aus
  Sitemap-Analyse bekommen, aber nur mit explizitem Vermutungs-Flag.
- **S2.1-LL-4** — Ableitungs-Abschnitte im Inventar-File sparen dem
  Folge-Sprint die Phase-1-Arbeit.
- **S2.1-LL-5** — Architektur-Diskrepanzen gehören auf die betroffene
  Inventar-Zeile, nicht nur in die Spec.

**Offene Punkte für nächste Session:**

- **S2.2 Template-Typologie** (empfohlen, direkt anschlussfähig) — Spec
  `specs/sprint-2/S2.2_templates.md` neu schreiben, 8 PHP-Skeletons anlegen.
- **S2.3 Batch A Legal** — blockiert durch Dr.-Stracke-Entscheidung zur
  Rechtssicherheits-Quelle (Anwalt / e-recht24 / Prod-Text).
- **S2.0b Komponenten-Bibliothek** — parallel zu S2.2 möglich, eliminiert
  Legacy-Alias-Block.
- **Strukturhygiene:** `SESSION_START.md` hat 5 Legacy-Pfade auf
  `projects/praxis-redesign/`. Empfehlung analog NEXT_SESSION_PROMPT-Regel:
  1-Zeilen-Pointer auf SESSION_RESUME.md. Keine eigenmächtige Durchführung.
- **Sprint 1 reanimieren** — SFTP-Credentials liegen vor, aber Design+Content-
  Vorrang unverändert.

---

### Session 8 — 2026-04-19 — Sprint 2 / S2.0c Design-System-Konsolidierung (v2.7.6)

**Auftrag Dr. Stracke:** Praxis-Sprint 2 / S2.1 starten. Beim Einstieg Verweis
auf `~/Library/CloudStorage/.../Cortex-Design-System.html` als Design-
Referenz. Nach Klärung: S2.1 pausiert, S2.0c (Design-System-Konsolidierung)
vorgezogen als blockierendes Fundament.

**Entscheidungs-Kette:**
1. **E1-Hybrid+SEO, E2a, E3a, E4c** — Content-Strategie für S2.1 festgelegt
   (Prod-Texte übernehmen + lockerer + SEO-opt., alle ~24 Kandidaten inventarisieren,
   reine Markdown-Tabelle, Content-Extrakt pro S2.3-Batch).
2. **γ-prime (Konsolidierung)** — Cortex-DS NICHT als visueller Stack,
   sondern als Meta-Regel + Entscheidungs-Backstop. Apple HIG / SF Pro bleibt.
3. **S2.0c vor S2.1 einschieben**.
4. **Tutorial 09 einpflegen** + **Cortex-DS ins Repo kopieren** (AK-9 der Spec).

**Architekten-Modus 4-Phasen-Durchlauf:**

- **Phase 1 Verständnis:** Ziel Null-Delta, Constraints (kein Touch an
  homepage.css/karriere.css), Annahmen (SF Pro bleibt, Rot+Amber bleiben),
  FK-Bezug (FK-4 Iteration, FK-5 Kontextverlust).
- **Phase 2 Lösungsdesign:** Spec `specs/sprint-2/S2.0c_design-system-consolidation.md`
  mit 4-Schichten-Modell (Primitives/Semantic/Components/Pages),
  `tokens.css` v2 Struktur, `DESIGN_GUIDELINES.md` v3.0 Umbau-Plan (§0
  Cortex-DS-Backstop + §2 4-Schichten-Modell + §17 Austausch-Protokoll),
  12 Akzeptanzkriterien, Rollback.
- **Phase 3 Umsetzung:**
  - Theme `praxiszentrum/`: `tokens.css` v2 (180 Zeilen, Schicht 1 +
    Schicht 2 + Legacy-Alias-Block mit 18 Aliasen für byteidentischen
    Output), `functions.php` `PXZ_VERSION` 2.7.5 → 2.7.6, `CHANGELOG.md`
    v2.7.6-Eintrag. Commit `c4f18ba`.
  - Cortex-Web `sites/praxis-webseite/`: `DESIGN_GUIDELINES.md` v3.0
    (20 §-Abschnitte, 608 Zeilen, §7 Spacing konsolidiert — alte §3.3-Tabelle
    gestrichen statt nur als obsolet markiert), `DESIGN_GUIDELINES.v2.3.md`
    als Historien-Backup, `design-system/Cortex-Design-System.html` (2 MB,
    MD5-identisch zum GDrive-Original) + `design-system/README.md`,
    `specs/sprint-2/S2.0c_*.md` + `S2.1_*.md` + `evidence/*_self-check.md`.
    Commits `560e3d6` + `0edab20`.
  - Nexus: Tutorial 09 `vier-schichten-design-tokens.md` (TUT-001,
    8-Abschnitte-Aufbau, MD5-Null-Delta-Erklärung), Auto-Sync-Commit `8054be7`.
    Pattern `design-token-ssot.md` um §8 4-Schichten-Modell + S2.0c-Lessons
    erweitert.
- **Phase 4 Selbstprüfung:** `evidence/2026-04-19_s2.0c_self-check.md` —
  **12/12 AKs grün**.

**Null-Delta-3-Weg-Beweis:**

| Vergleich | Desktop | Tablet | Mobile |
|-----------|:-:|:-:|:-:|
| v2.7.6 ↔ v2.7.5 (Vortags-Baseline, home) | ✅ | ⚠️ (externe Drift) | ✅ |
| v2.7.6 ↔ v2.7.5 (Vortags-Baseline, karriere) | ✅ | ✅ | ✅ |
| v2.7.5-rebaseline ↔ v2.7.5 (A/A-Drift-Kontrolle home) | ✅ | ⚠️ | ✅ |
| **v2.7.6 ↔ v2.7.5-rebaseline (gleich-Tag, home)** | **✅** | **✅** | **✅** |

Der 4. Vergleich (beide Shots heute aufgenommen, nur CSS-Stand anders) ist
byteidentisch auf allen Home-Viewports. Die MD5-Divergenz zur Vortags-Baseline
auf Home-Tablet ist **externe Drift** (vermutlich WP/Blocksy-Auto-Update
zwischen 2026-04-18 und 2026-04-19), **nicht** S2.0c.

**Lessons Learned (S2.0c-LL-1 … 3):**

- **S2.0c-LL-1** — MD5-Null-Delta braucht **gleich-Tag-Baseline-Check**
  als Kontrollgruppe. Ohne das werden externe Drifts fälschlich als eigener
  Fehler interpretiert.
- **S2.0c-LL-2** — Legacy-Alias-Block entkoppelt Token-Refactor sauber
  von Component-Refactor. Additives Pattern, kein Breaking-Risk.
- **S2.0c-LL-3** — Cortex-DS-Repo-Kopie (git-trackbar, MD5-verifiziert)
  robuster als GDrive-Pfad — portabel zwischen Geräten, nicht von
  CloudStorage-Sync abhängig.

**Nexus-Architektur-Updates (Session-Ende LL-042 Schritte 2+3):**

- `Nexus/_memory/MEMORY.md` — praxis-webseite-Zeile auf S2.0c ✅ v2.7.6
  aktualisiert, Theme-Commit-Hash `c4f18ba` eingetragen, neuer Pfad-Eintrag
  für Design-System (`DESIGN_GUIDELINES.md` v3.0, `tokens.css` v2,
  `design-system/Cortex-Design-System.html` mit MD5-Integrity-Hash,
  Tutorial 09). Letzte-Aktualisierung-Zeile auf 2026-04-19 Session 8.
- `Nexus/_memory/patterns/design-token-ssot.md` — neue §8 „Erweiterung —
  4-Schichten-Modell (S2.0c, 2026-04-19)" mit Austausch-Protokoll, Grep-Test,
  Lessons; Querverweise um v3.0 + Tutorial 09 ergänzt.

**Offene Punkte für nächste Session:**

- **S2.1 Phase 3 Umsetzung** — Tabelle `page-inventory.md` ausfüllen
  (~27 Einträge). Spec freigegeben, Entscheidungen getroffen.
- **Sprint 1 SFTP/Staging** — Credentials liegen vor (2026-04-19 09:24),
  Reanimation zurückgestellt per Dr.-Stracke-Entscheidung „Design zuerst".
- **Backlog unverändert:** CTA-Anschnitt @ 1440 px · PHP-Deprecation
  `theme-freesia-demo-import` · Mobile-Eyebrow MFA.

---

### Session 2026-04-18 (Abend) — Sprint 2 / S2.0 Design-Token-SSoT (v2.7.5)

**Auftrag Dr. Stracke:** Front A — S2.0 Design-Token-SSoT starten. Entscheidungen 1a (nur tokens.css, kein components.css), 2a (Duplikate löschen, echte SSoT), 3a (karriere.css auf `var()`-Referenzen), 4a (PXZ_VERSION 2.7.4 → 2.7.5 als patch-bump).

**Architekten-Modus-Durchlauf:**

1. **Phase 1 (Verständnis):** IST-Bestandsaufnahme — 171 `var(--pxz-*)`-Zugriffe in 4 Dateien, Primitives 3-fach dupliziert (style.css, homepage.css, karriere.css), semantische Tokens nur seiten-lokal.
2. **Phase 2 (Lösungsdesign):** Spec `specs/sprint-2/S2.0_tokens.md` mit 4 Entscheidungspunkten, explizit gemachten Annahmen, Akzeptanzkriterien-Tabelle, Rollback-Plan. Dr. Stracke freigegeben → Umsetzung.
3. **Phase 3 (Umsetzung):**
   - `assets/css/tokens.css` neu — 12 Primitives + 6 semantische Light-Defaults auf `:root`, zwei-Schicht-Aufbau mit `var()`-Referenz zwischen Schichten.
   - `functions.php` — Enqueue-Dependency-Kette umgestellt: `pxz-tokens` → `blocksy-parent` → `praxiszentrum` → `pxz-homepage`/`pxz-karriere`. PXZ_VERSION 2.7.4 → 2.7.5.
   - `style.css` — `:root`-Block mit 9 Primitives entfernt, Kommentar-Verweis auf `tokens.css`.
   - `assets/css/homepage.css` — Primitive-Block in `.pxz-home` (11 Primitives + 6 semantische Defaults) entfernt; Dark-Mode-Override `.pxz-mfa { --pxz-bg: var(--pxz-ink) … }` bleibt unverändert (Custom Properties vererben durch Subtree).
   - `assets/css/karriere.css` — 4 Primitive-Duplikate entfernt, Amber über `var(--pxz-amber)` referenziert, Karriere-spezifisches `#0E0E10` lokal im Scope mit Kommentar-Begründung.
   - `CHANGELOG.md` — v2.7.5-Block mit Detail-Eintrag.
4. **Phase 4 (Selbstprüfung):** 100 % — alle 13 Akzeptanzkriterien erfüllt.

**Verifikation:**
- `tools/verify.sh` grün: §1 Split-Check, §2 Reset-Scope, §3 Computed-Style-Probe **54/54** auf Home + Karriere × 3 Viewports, §4 Alignment-Probe **10/10** Showpiece-Zentrierungen.
- Neue versionsbenannte Shots: `screenshots/claude/2026-04-18_v2.7.5_{home,karriere}_{desktop1440,tablet768,mobile430}_full.png` (6 Shots).
- **MD5-Byte-Vergleich:** alle 6 v2.7.5-Shots md5-identisch zu ihren Baseline-Pendants (Home v2.7.3, Karriere v2.6.0). Stärkster möglicher Null-Delta-Beweis.
- **Visuelle Abnahme Dr. Stracke:** 2026-04-18 im Browser bestätigt („Das sieht gut aus").

**Commits:**
- Theme-Repo: `257304e feat(s2.0): design-token SSoT; bump PXZ_VERSION 2.7.4 → 2.7.5` (6 Dateien, +87/−46).
- Docs-Repo: `29383cd docs(sprint-2): S2.0 design-token SSoT spec` + `6dbd214 chore: v2.7.5 verify shots`. Kein Remote-Push (b=1 aus Sprint 0).

**Nexus-Architektur-Updates (Session-Ende Schritt 3):**
- `Nexus/_memory/MEMORY.md` — Projekt-Status-Zeile auf „Sprint 2 aktiv, S2.0 ✅ v2.7.5", Theme-Repo-Pfad auf Commit `257304e`, Tutorial-Referenz auf `05-design-tokens-und-cascade.md` erweitert, Pattern-Katalog um `design-token-ssot.md` ergänzt.
- `Nexus/_memory/patterns/design-token-ssot.md` neu — wiederverwendbares Pattern (Zwei-Schicht-Tokens + Dependency-Kette + MD5-Byte-Beweis).
- `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/05-design-tokens-und-cascade.md` neu — Erklär-Tutorial für Dr. Stracke (CSS Custom Properties, zwei-Schicht-Aufbau, Cascade-Ordnung in WP, MD5-Null-Delta-Beweis).

**Cleanup:** 6 Zwischenstand-verify-Shots (`2026-04-18_{1636,1656,1703}_verify_*`) nach `screenshots/claude/_archive/` verschoben (gitignored).

**Offene Punkte für nächste Session:**
- **S2.0b Komponenten-Abstraktion** — optional, additiv (siehe Front B in §3).
- **S2.1 Seiten-Inventar** — Vorbedingung für S2.3 Kernseiten-Batches (siehe Front A).
- **DF-Support-Antwort** — Sprint 1 reaktivierbar sobald `.env.sprint1.local` gefüllt.
- **Backlog unverändert:** CTA-Anschnitt @ 1440 px, PHP-Deprecation `theme-freesia-demo-import`, Mobile-Eyebrow MFA.

---

### Session 2026-04-18 (Abend, vorher) — Sprint-1-Design, DF-Blocker, Roadmap-Umstellung

**Auftrag Dr. Stracke:** Front A (Sprint 1 starten — Staging + Backup + Mail-Test).

**Durchgeführt:**

1. **Architekten-Modus Phase 1/2 für Sprint 1** — Verständnis + Lösungsdesign mit blockierenden Entscheidungen (a)/(b)/(c)/(d) + Test-Empfänger.
2. **Entscheidungen freigegeben 2026-04-18 durch Dr. Stracke:**
   - (a) = 2 → Root-Domain `westend-hausarzt.de` als Staging (Weiterleitung zu `.com` wird aufgehoben)
   - (b) = 1 → AkeebaBackup für Full-Backup + Restore
   - (c) = 2 → Mail-Test mit Text + 1 PDF-Anhang (~2 MB)
   - (d) = offen, ASAP
   - Test-Empfänger: `stracke.md@me.com`
   - Credentials-Lieferweg: Option B (`.env.sprint1.local`, gitignore-geschützt)
3. **Spec-Artefakte neu angelegt:**
   - `specs/sprint-1/README.md` — detaillierte Sprint-1-Spec mit Akzeptanzkriterien für S1.1/S1.2/S1.3
   - `specs/sprint-1/OPEN_DECISIONS.md` — Credentials-Checkliste
   - `.env.sprint1.local.template` — ausfüllbares Template mit allen Feldern
   - `.gitignore` erweitert um `.env*` + Negation `!.env.*.template`
4. **Blocker:** Dr. Stracke fand SFTP-Zugangsdaten im DF-Kundencenter (ManagedHosting 24) nicht, Support am 2026-04-18 angeschrieben. Sprint 1 pausiert.
5. **Roadmap umdisponiert 2026-04-18 (Dr.-Stracke-Auftrag):**
   - Sprint 1 ⏸ bis DF-Support antwortet
   - Sprint 2 (neu: „Kernseiten-Ausbau + Design-System") vorgezogen, weil vollständig auf Local machbar
   - Ursprüngliches Sprint-2-Scope (Legacy-Migration 172 Seiten) → als Sprint 2b verschoben
   - `_rules/ARCHITECTURE.md` §4 aktualisiert
6. **Sprint-2-Grobskizze erstellt:** `specs/sprint-2/README.md` mit S2.0 (Token-SSoT, vorgezogen aus Sprint 0) bis S2.5 (QA-Audit). Detail-Specs kommen in der nächsten Session vor Umsetzung.

**Verifikation:**
- `tools/verify.sh` grün (vor Session-Ende, unverändert seit Nachmittag — keine Theme-Änderung diese Session).
- Keine Live-Änderung an `.com` oder `.de`.
- Keine Credentials im Repo (überprüft: `.env.sprint1.local` matched `.gitignore:12`, Template matched Negation `:13`).

**Nexus-Architektur-Update:**
- `Nexus/_memory/MEMORY.md` — Status-Zeile `praxis-redesign` aktualisiert auf neuen Sprint-Status.
- Ergänzendes Tutorial: `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/04-credentials-und-env-dateien.md` (Credentials-Hygiene, `.gitignore`-Negation, Lieferoptionen A/B/C).

**Offene Punkte für nächste Session:**
- DF-Support-Antwort abwarten → sobald da, `.env.sprint1.local` füllen und Sprint 1 reaktivieren
- Entscheidung in nächster Session: Front A (S2.0 Token-SSoT) oder Front D (Legal-Seiten vorziehen)?
- Sprint-2-Details: Offene Fragen in `specs/sprint-2/README.md` unten (Content-Quellen, Datenschutz-Text, Fotos, Doctolib-Einbettung)

---

### 0. ARBEITSWEISE AB 2026-04-18 — ARCHITEKTEN-MODUS (VERBINDLICH)

Dr. Stracke hat am 2026-04-18 die Arbeitsweise umgestellt. Du agierst ab
sofort als **strukturierter Software-Architekt und technischer Projektpartner**,
nicht als reaktiver Assistent. Deterministisch, nachvollziehbar, reproduzierbar.

**Pflicht-Lesung vor jeder Aufgabe (zusätzlich zu den Nexus-Dateien):**
`_rules/WORKING_MODE.md` — enthält:
- 4-Phasen-Prozess: Verständnis-Sicherung → Lösungsdesign → Umsetzung → Selbstprüfung
- Fehlerklassen FK-1 bis FK-5
- Verbotene Muster + Kommunikationsstandard

**Regel in 1 Zeile:** Keine Umsetzung ohne Spec. Keine Spec ohne Freigabe.

---

## 1. PFLICHT-INITIALISIERUNG (LL-023, KON-001 + 2026-04-18 Update)

Lies in dieser Reihenfolge, **bevor** irgendetwas getan wird:

1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`
4. `~/Cortex/projects/praxis-redesign/_rules/WORKING_MODE.md` (**neu 2026-04-18 — Architekten-Modus**)
5. `~/Cortex/projects/praxis-redesign/_rules/ARCHITECTURE.md` (**neu 2026-04-18 — IST/SOLL, Sprint-Plan**)
6. `~/Cortex/projects/praxis-redesign/_rules/FEHLERPROTOKOLL.md`
7. `~/Cortex/projects/praxis-redesign/_rules/PRE_FLIGHT_CHECKLIST.md`
8. `~/Cortex/projects/praxis-redesign/DESIGN_GUIDELINES.md` (v2.3 — verbindlich, inkl. §13–§16.6)
9. `~/Cortex/projects/praxis-redesign/HANDOFF_PROMPT.md` (Projekt-Kontext, 8 Aufgaben)
10. `~/Cortex/projects/praxis-redesign/PHASE1_AUDIT.md` (5-Phasen-Plan)
11. `~/Cortex/projects/praxis-redesign/specs/sprint-0/README.md` (**aktueller Arbeitsspec**)
12. `~/Cortex/projects/praxis-redesign/specs/sprint-0/OPEN_DECISIONS.md` (**offene Freigaben**)
13. Pre-Flight ausführen: `cd ~/Cortex/projects/praxis-redesign && tools/verify.sh`

---

## 2. NUTZER & ARBEITSWEISE

- **Nutzer:** Dr. Stracke — Internist, Praxisinhaber, kein IT-Experte
- **Sprache Chat:** Deutsch · **Code-Kommentare:** Englisch
- **Transparenz (LL-024):** jeder Schritt mit WAS / WARUM / WAS BEDEUTET DAS
- **Entscheidungen (LL-034):** alle Optionen mit Vor-/Nachteilen, Dr. Stracke wählt
- **Fertig (LL-021):** funktionstüchtig, nicht „Datei existiert"
- **Tempo:** Dr. Stracke hat ausdrücklich gefordert: *„Wir sind zu langsam."* →
  KEINE Zwischenfragen bei klaren Aufgaben. Batches statt Einzelschritten.
- **Design-Verifizierung ist PFLICHT** nach jeder sichtbaren Änderung via
  Chrome Headless Screenshot. Nicht nur Code ändern und behaupten es sei besser.

---

## 3. AKTUELLER STAND (Stand: 2026-04-18)

**WordPress-Instanz (Local by Flywheel):**
- Site-Root: `/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/`
- URL: `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local` (HTTPS via self-signed cert)
- Child-Theme: `wp-content/themes/praxiszentrum/` (Parent = Blocksy)
- **PXZ_VERSION: 2.7.2** (Logo +35 % final, Dr. Stracke abgenommen — „Das passt jetzt erst mal")
- WP-CLI (Cluster-Mini-02): `PHP=/Applications/Local.app/Contents/Resources/extraResources/lightning-services/php-8.2.29+0/bin/darwin-arm64/bin/php`
  + `PHAR=/Applications/Local.app/Contents/Resources/extraResources/bin/wp-cli/wp-cli.phar`
  + `SOCK=/Users/cluster-mini-02/Library/Application Support/Local/run/VFEzUQg6g/mysql/mysqld.sock`
  + Aufruf: `"$PHP" -d memory_limit=512M -d mysqli.default_socket="$SOCK" -d pdo_mysql.default_socket="$SOCK" "$PHAR" --path="$SITE" <cmd>`

**Letzte Session (2026-04-18 v2.6.0) — Task 2: MFA-Bewerbungsformular live**

Dr. Stracke hat Task 1 (v2.5.0: Hero/Standorte/MFA) freigegeben. Task 2 umgesetzt:

1. **Karriere-Seite angelegt** — `/karriere/` (WP-Page-ID 9666) mit
   `template-karriere.php` als Page-Template. Dark-Theme mit Amber-Glow,
   eigener Hero „Werden Sie Teil unseres Teams." + Formular-Card mit
   Anker `#bewerben` (Scroll-Target für den MFA-CTA auf der Homepage).
2. **WPForms-Formular „Bewerbung MFA" programmatisch erzeugt** — Form-ID 9664.
   Felder: Name (Vor/Nachname), E-Mail, Telefon, Nachricht (optional),
   File-Upload (PDF/DOC/JPG, max. 5 Dateien × 10 MB, required), Datenschutz-
   Checkbox mit Link auf `/datenschutz/`. Benachrichtigung an
   `praxis@westend-hausarzt.de`, Reply-To = Bewerber-Mail, File-Upload
   als Anhang. Idempotentes Skript: `tools/create_mfa_form.php`.
3. **Karriere-Page-Inhalt idempotent erstellbar** via
   `tools/create_karriere_page.php` (findet Formular per Marker).
4. **WPForms im Dark-Mode gestylt** — Inputs, Dropzone, Submit-Button
   (Amber-Pill), Checkbox (Amber-Accent), Validation-Messages — alles
   scoped auf `.pxz-kar` (kein Bleed auf andere Seiten, §16.2 respektiert).
5. **Mail-Pipeline in Local bestätigt** — MU-Plugin
   `wp-content/mu-plugins/000-local-mail-redirect.php` leitet auf `.local`-
   Hosts WP-Mail-SMTP an Mailpit (SMTP 10001) um; Production (Outlook) bleibt
   unangetastet. Testmail in Mailpit angekommen: From
   `dev@westend-hausarzt.local` → To `praxis@westend-hausarzt.de`.
6. **Neuer Fehlereintrag PXZ-E-005** — `gdpr-checkbox`-Typ rendert
   programmatisch nicht, wurde durch normalen `checkbox`-Typ mit
   Pflicht-Option ersetzt. Regel: jedes neue Formular visuell verifizieren.

**Verifikation v2.6.0:**
- `tools/verify.sh` grün (Homepage-Regression ausgeschlossen).
- `tools/shoot_karriere.mjs` produziert Desktop/Tablet/Mobile-Shots unter
  `screenshots/claude/2026-04-17_v2.6.0_karriere_*.png`.
- Formular-HTML vorhanden: `wpforms-field-name/email/phone/textarea/file-upload/checkbox`,
  Anker `#bewerben` rendert, Shortcode `[wpforms id="9664"]` eingebettet.

**Status v2.6.0:** ✅ Freigegeben durch Dr. Stracke am 2026-04-18.

---

## Session 2026-04-18 (nachm.) — Sprint 0 / S0.2 CSS-Extraktion (v2.7.4)

**Auftrag Dr. Stracke:** „Erst F (offene Commits abräumen) dann B (Sprint-0-Backlog) dann Session beenden."
Für B wurde die Wahl zwischen S0.2 und S0.3 an Claude delegiert (Effektivität/Effizienz).
Claude entschied sich für **S0.2**, weil es Vorbedingung für S0.3 ist und einen konkreten
Tech-Debt entschuldet (Inline-CSS-Bloat).

### Durchgeführt

**F — Offene Commits:**
- Befund: die in §5 gelisteten „offenen Commits" (s0.4 feat + docs reflect) waren
  bereits erledigt. Nur 2 Verify-Screenshots aus dem Pre-Flight 12:46 untracked.
- Commit Docs-Repo: `67dca8d chore: verify-shots post-v2.7.3 (2026-04-18 12:46 pre-flight)`.

**B — Sprint 0 / S0.2 CSS-Extraktion:**

Theme-Repo (`praxiszentrum/`):
1. `assets/css/homepage.css` neu — 563 Zeilen aus Inline `<style>`-Block von
   `template-homepage.php` 1:1 extrahiert (PHP-Echo im Kommentar durch statischen
   Text ersetzt, CSS-Body unverändert).
2. `assets/css/karriere.css` neu — 291 Zeilen analog aus `template-karriere.php`.
3. `template-homepage.php` — Inline-Block (Zeilen 27–591) entfernt; `$v`-Variable
   für Logo-Cache-Buster bleibt erhalten (wird noch für `logo.svg?v=` verwendet).
4. `template-karriere.php` — Inline-Block + tote `$v`-Zuweisung entfernt.
5. `functions.php` — `wp_enqueue_scripts`-Action erweitert um zwei conditional
   enqueues (`is_page_template()`), Dep auf `'praxiszentrum'` → Cascade-Position
   bleibt identisch zum ehemaligen Inline-Block im Body.
6. `functions.php` — `PXZ_VERSION` 2.7.3 → 2.7.4 (semver-patch, Architektur-
   Infra-Change, keine Optik-Änderung).
7. `CHANGELOG.md` — neuer v2.7.4-Eintrag mit 1:1-Transfer-Vermerk.

Commits Theme-Repo:
- `c3f7db7 feat(s0.2): extract homepage CSS from inline to assets/css/homepage.css`
- `914af8d feat(s0.2): extract karriere CSS; bump PXZ_VERSION 2.7.3 → 2.7.4`

Commit Docs-Repo:
- `7de7ee0 chore: verify-shots from S0.2 extraction (2026-04-18 v2.7.4)`

### Verifikation

| Check | Ergebnis |
|---|---|
| `tools/verify.sh` §1 Split | ✅ keine Dupes `style.css` ↔ `template-homepage.php` (siehe unten, Split-Check kennt noch nicht die neuen `assets/css/*.css` — Nachzügler-Task) |
| `tools/verify.sh` §2 Reset-Scope | ✅ keine generischen Tag-Selektoren mit `!important padding:0` |
| `tools/verify.sh` §3 Computed-Style-Probe | ✅ 54/54 Assertions grün auf Home + Karriere × 3 Viewports |
| `tools/verify.sh` §4 Alignment | ✅ delta = 0px auf allen Showpiece-Elementen |
| `bun run tools/probe-design.mjs` | ✅ 54/54 grün |

### Nexus-Architektur-Update

- `Nexus/_memory/MEMORY.md` — Projektzeile `praxis-redesign` auf v2.7.4 aktualisiert;
  Pfad-Referenz Theme-Repo auf Stand v2.7.4 (914af8d) ergänzt; Pattern-Katalog-Eintrag
  `wp-inline-css-to-external.md` verlinkt.
- `Nexus/_memory/patterns/wp-inline-css-to-external.md` neu — wiederverwendbares
  Pattern für Inline→Extern-CSS-Extraktion in WordPress mit Conditional Enqueue.
- `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/03-inline-css-zu-externer-datei.md`
  neu — Tutorial für Dr. Stracke (Enqueue-System, Cascade-Disziplin, 1:1-Transfer,
  Beweis über Computed-Style-Probe statt Screenshots).
- `_rules/ARCHITECTURE.md` — Kategorie A1 gestrichen (erledigt), Sprint-0-Status
  aktualisiert (S0.2 ✅).

### Offener Nachzügler (nicht blockierend)

**Split-Check-Ausweitung:** `tools/verify.sh` §1 vergleicht aktuell nur `style.css`
gegen `template-homepage.php`. Nach S0.2 könnten sich Selektor-Duplikate in
`assets/css/{homepage,karriere}.css` unbemerkt einschleichen. → in §3 als Front C
gelistet.

---

## Session 2026-04-18 — MFA-Sektion halbiert + Conversion-Text (v2.7.3)

**Auftrag Dr. Stracke:** „Wir suchen Dich"-Container auf ≈ 50 % Höhe der Hero-Sektion bringen UND verkaufsstärkeren Text mit hoher CTA-Conversion. Wahl: **L1** (schlanker CTA-Block, Grid raus) + **T-C** (persönlich, Versprechen, kurz).

**Änderungen v2.7.3:**
- `template-homepage.php` — MFA-Block: `.pxz-mfa-rule` + `.pxz-mfa-grid` (Benefits + Tasks) entfernt. Bleibt: Eyebrow, Titel, Sub, 2 CTAs, Mail-Note.
- `template-homepage.php` Inline-CSS: verwaiste Selektoren `.pxz-mfa-rule`, `.pxz-mfa-grid`, `.pxz-mfa-col-title`, `.pxz-mfa-benefits`, `.pxz-mfa-benefit-h/d`, `.pxz-mfa-tasks`, `.pxz-mfa-task` aufgeräumt.
- `inc/homepage-data.php` — DE/EN/FR/ES Texte auf T-C: Eyebrow „Wir suchen dich · MFA m/w/d", Titel „Hier wirst du **gesehen.**", Subtitle Pull-Faktor mit `„interdisziplinär"`-Highlight, Sekundär-CTA „Mehr über die Stelle". `mfa_benefits[]` und `mfa_tasks[]` bleiben im Daten-Array (nicht gelöscht — verwendbar für spätere Karriere-Seite-Erweiterung).
- `functions.php` — PXZ_VERSION 2.7.2 → 2.7.3.

**Höhen-Beweis (Headless Chrome, Inkognito, cache-disabled):**

| Sektion | v2.7.2 (vorher) | v2.7.3 (nachher) | Delta |
|---|---|---|---|
| MFA Desktop 1440 | 1658 px (113 % Hero) | **864 px (59 % Hero)** | **−794 px (−48 %)** |
| MFA Mobile 430   | 2161 px (272 % Hero) | **884 px (111 % Hero)** | **−1277 px (−59 %)** |

Hero (1474 / 796 px) unverändert.

**Verifikation:**
- `tools/verify.sh` grün (§1 Split + §2 Reset + §3 Computed-Style + §4 Alignment alle ✓).
- AB-Diff via `tools/ab-diff.mjs` (Nachher-Shot + Probe + Alignment grün auf 1440 + 430).
- MFA-Section-Crop: `screenshots/claude/2026-04-18_v2.7.3_mfa_only_{1440,430}.png`.
- Volle After-Shots: `screenshots/claude/2026-04-18_v2.7.3_AB_after_{1440,430}.png`.

**Ziel-Abweichung (transparent):** 50 % wurde nicht exakt getroffen (59 % Desktop). 50 % würde zusätzlich Card-Padding kürzen erfordern (z. B. 112→80 Desktop, ~60 px Gewinn) — als optionale Feinjustage offen.

**Mobile-Hinweis:** Eyebrow „WIR SUCHEN DICH · MFA M/W/D" bricht durch Uppercase + 0.2em letter-spacing in 430 px-Card auf 2 Zeilen um. Nicht fatal, aber kürzbar (z. B. nur „Wir suchen dich" auf Mobile). Klarstellen: Soll nachgeregelt werden?

**Status v2.7.3:** Umsetzung abgeschlossen, Probe grün, wartet auf Browser-Freigabe.

---

## Session 2026-04-18 — Designregeln + visuelle Fixes (v2.6.1 → v2.7.2)

**Dr. Stracke-Abnahme:** v2.7.2 „passt jetzt erst mal". Homepage ist bis
hierhin freigegeben (Hero/MFA/Stats/Fachrichtungen/Team/Service/Standorte/
Final-CTA/Footer + Nav mit großem Logo). Task 2 (Karriere v2.6.0) ist
separat unberührt freigabepflichtig.

### Versionskette dieser Session

| Version | Änderung | Abnahme |
|--------|----------|---------|
| v2.6.0 | Baseline (Karriere + MFA-Formular, Sprint-0-Lösungsdesign) | pending |
| v2.6.1 | Desk-Audit: `.pxz-sect` 160→96 Desktop, `.pxz-mfa-sub` 48→40rem, `.pxz-btn` Mobile-Padding — PXZ-E-006 | zwischen |
| v2.6.2 | Hero+Final-CTA Abstände größer, Standort 2 roter Rahmen + Badge | zwischen |
| v2.6.3 | **Root-Cause-Fix** `.pxz-home :where(p)` statt `.pxz-home p` — Hero-Subtitle + CTAs zentrieren jetzt wirklich — PXZ-E-008 | ✅ |
| v2.7.0 | Logo +54 % (96/128/160 px), Text proportional mit skaliert | zwischen |
| v2.7.1 | Logo max in Nav-Höhe (112/148/184 px), Padding reduziert auf 8/10/12 | zwischen |
| v2.7.2 | **Logo +35 % final** (151/200/248 px), Nav-Höhe wächst proportional | ✅ „passt jetzt" |

### Neue Fehlerkategorien, die NIE mehr passieren dürfen

- **PXZ-E-006 (FK-5)**: alte `DESIGN_GUIDELINES` §3.3 vs. aktuelle §13.4 —
  §3.3 ist ab sofort mit ⚠️ markiert. Regel §16.6: alte Tabellen explizit
  als obsolet kennzeichnen.
- **PXZ-E-007 (FK-1 + Prozess)**: „einige Punkte, die nicht korrigiert
  wurden" wurde als DESIGN_GUIDELINES-Abweichung fehlinterpretiert. Regel:
  PRE_FLIGHT §7b — Aufgaben-Scope in 1 Satz paraphrasieren vor Edit.
  Zusatz: AB-Diff-Beweis mit „fertig"-Meldung mitliefern, keine DevTools-
  Delegation an Dr. Stracke.
- **PXZ-E-008 (FK-5)**: `.pxz-home p { margin: 0 }` hatte Spezifität 0,1,1
  und überschrieb seit Projekt-Start still alle p-Klassen-Margins
  (Hero-Sub, Final-Priv, MFA-Sub, Loc-City, MFA-Email-Note). Fix:
  `:where(p)` macht den Reset spezifitätsneutral. Regel §16.5
  (DESIGN_GUIDELINES).

### Neue/geänderte Tools

- `tools/ab-diff.mjs` — Vorher/Nachher-Shots + Höhen-Delta + Selector-Probe
  + Alignment-Check (Inkognito-Headless, cache-disabled). **Nach jeder
  CSS-Änderung Pflicht.**
- `tools/alignment-probe.mjs` — standalone Spezifitäts-/Alignment-Check für
  Showpiece-Elemente. Lässt sich von `verify.sh --alignment` aufrufen, ist
  Teil von `verify.sh` --all.
- `tools/verify.sh` — erweitert um §4 Alignment-Probe.
- `tools/shoot_karriere.mjs` — zugunsten von `ab-diff.mjs` **deprecated**
  (siehe Datei-Kopf).

### Screenshot-Archivierung

`screenshots/claude/_archive/` enthält alle Test-Shots dieser Session (112
Dateien, ca. 65 MB). Als **aktuelle Baseline** bleiben in `claude/`:
`2026-04-18_v2.7.2_nav_*` + `2026-04-18_v2.7.1_nav_*` + letzter
`verify_desktop/mobile`.

### Offene Backlog-Punkte aus dieser Session

- **CTA-Anschnitt bei exakt 1440 px Viewport:** Logo-Block (248 px) + Nav-Items +
  Right-Block laufen bei genau 1440 px an. Auf ≥ 1500 px unauffällig. Entscheidung
  noch offen, ob Nav-Items-Abstand gekürzt oder Logo-Text leicht kleiner wird.
- **PHP-Deprecation-Warnung:** Plugin `theme-freesia-demo-import` wirft bei
  PHP 8.2 eine Warning (`__wakeup()` public visibility). In Dev sichtbar
  (WP_DEBUG=true), in Prod nicht. Vor Go-Live: Plugin updaten oder entfernen.
- **Sprint-0 `OPEN_DECISIONS.md`** (b)/(c)/(d) weiter offen — durch
  visuelle Detailarbeit diese Session überlagert, keine Antworten.
- **probe-design.mjs EXPECTED-Werte** reflektieren noch v2.5.0-Zeitpunkt —
  ok für Regressionsschutz, könnte Ergänzung um Hero-Sub/Final-CTA-Werte
  vertragen (Sprint 0 / S0.4).

---

**Historie: Session 2026-04-18 v2.6.1 — Desk-Audit Homepage gegen DESIGN_GUIDELINES**

Dr. Stracke-Auftrag: eigenständig die Designregeln durchgehen und offene
Abweichungen auf der Homepage korrigieren. 3 harte Befunde (4-Phasen-Prozess
gemäß WORKING_MODE.md):

1. **`.pxz-sect` Sektions-Padding** (Fachrichtungen/Team/Service/Standorte):
   `96/128/160 px` → **`64/80/96 px`** (§13.4 Standard-Sektion). Desktop war
   +67 % über Soll — Grund für aufgebläht-Eindruck. Neuer
   FEHLERPROTOKOLL-Eintrag `PXZ-E-006` (FK-5 Kontextverlust zwischen §3.3 v2.0
   und §13.4 v2.1).
2. **`.pxz-mfa-sub max-width`**: `48rem` → **`40rem`** (§13.5) +
   `text-wrap: balance` (§15.6 Orphan-Words).
3. **`.pxz-btn` Mobile-Padding**: `14 × 26 px` → **`14 × 28 px`** (§6.1
   Tap-Target-Minimum).

**Verifikation v2.6.1:**
- `tools/verify.sh` grün (Split/Reset/Probe/Shots).
- Ad-hoc-Probe der neuen Werte: `.pxz-sect { paddingTop: 96px }` auf
  Fachrichtungen/Team/Service/Standorte grün; `.pxz-mfa-sub { maxWidth: 640px }`
  grün; `style#pxz-home-v2-6-1` im DOM.
- Screenshots: `screenshots/claude/2026-04-18_v2.6.1_desktop_{full,mfa,fachrichtungen,team,service,standorte}.png`
  + `_mobile_full.png`.

**Status v2.6.1:** Umsetzung abgeschlossen, Probe grün, wartet auf
Browser-Freigabe durch Dr. Stracke. Task 2 (v2.6.0 Karriere) bleibt
freigabe-pflichtig und wird durch v2.6.1 nicht berührt (Karriere-Template
unverändert).

---

**Historie: Session 2026-04-17 v2.5.0 — Hero + Standorte + MFA-Card korrigiert:**

Dr. Stracke-Feedback zu v2.4.0: *„Die Texte in 1 und 3 sind nicht gut positioniert,
Abstände stimmen immer noch nicht, wirkt nicht symmetrisch. Entweder zentral
positionieren oder linksbündig. Bei 2 möchte ich den Container genauso haben wie
bei dem ersten Standort."*

Drei konsistente Batch-Fixes in `template-homepage.php`:

1. **Hero (`.pxz-hero-sub`):** Vollständig zentriert — `text-align: center !important;
   max-width: 36rem; text-wrap: balance/pretty;`.
2. **Standorte (`.pxz-loc-card--main`):** Konsequent linksbündig. Badge
   (`.pxz-loc-badge`) vom `position: absolute` auf Inline-Pill umgestellt
   (auf ALLEN Viewports `position: static`, `display: inline-block`, `margin-bottom: 1.25rem`).
   Header-`padding-right` entfernt, damit der Inhalt nicht mehr asymmetrisch wirkt.
3. **MFA (`.pxz-mfa-card`):** Neue Wrapper-Klasse mit demselben Padding-Scale wie
   Standort-1 (72/96/112 px). Amber-Border + sanftes Shadow + `border-radius: 28px`.
   Zwischen Hero und Grid wurde ein `.pxz-mfa-rule` Trenner (1 px amber) eingefügt.
   HTML: `.pxz-mfa-hero` + `.pxz-mfa-grid` liegen jetzt in einem gemeinsamen
   `<div class="pxz-mfa-card">`.

**Verifikation (alle 3 Viewports grün):**
- `bun run tools/probe-design.mjs` — alle erwarteten Computed-Styles (1440/768/430)
  gematcht: Hero-Sub `textAlign: center`, Standort-Badge `position: static`,
  MFA-Card padding `112/96/72`, Final-Card plain.
- `tools/verify.sh` — Split-Check, Reset-Scope-Check, Screenshots und Probe GREEN.
- Desktop-Slices (Hero/MFA/Standorte/Final) liegen in `screenshots/claude/`.

**Selbstlernendes System (aus v2.4.0, weiterhin aktiv):**
- `_rules/FEHLERPROTOKOLL.md` — PXZ-E-001 bis PXZ-E-004.
- `_rules/PRE_FLIGHT_CHECKLIST.md` — verbindliche Checks vor jedem Deploy.
- `tools/verify.sh` — Split-Check + Reset-Scope-Check + Screenshots + Probe.
- `tools/probe-design.mjs` — Puppeteer-Computed-Style-Probe gegen §13 (v2.5.0 EXPECTED).
- `SESSION_START.md` — 7-Schritt-Einstieg für jede neue Claude-Session.
- `DESIGN_GUIDELINES.md v2.2` — §16 Anti-Patterns auf Implementierungs-Ebene.

**Status v2.5.0:** Umsetzung abgeschlossen, Probe grün, wartet auf Browser-
Freigabe durch Dr. Stracke. KEINE weiteren Code-Änderungen bis zur Freigabe.

**Bekannter, nicht blockierender Minor:** Mobile 430 px — „Bockenheimer Landstraße"
läuft rechts aus dem Container; kein Blocker für Task-1-Freigabe.

---

## 4. OFFENE AUFGABEN (Priorität absteigend)

**Architektur-Ebene (übergeordnet, Stand 2026-04-18 nachm.):**

- **Sprint 0 — Foundation** — bis auf S0.3 abgeschlossen:
  - Entscheidungen freigegeben: b=1 (lokal), c=2 (zwei Repos), d=1 (Deadline halten).
  - ✅ S0.1 Git-Repos (Theme-Repo + Docs-Repo), Baseline-Commits.
  - ✅ **S0.2 CSS-Extraktion (Home + Karriere inline → `assets/css/`) — NEU 2026-04-18 v2.7.4.**
  - ⏸ S0.3 Design-Token-SSoT — Backlog (Sprint-2-Kandidat, Risiko niedrig, additiv).
  - ✅ S0.4 Page-Registry (Home + Karriere), generischer `shoot.mjs`.
  - ⏸ **Nachzügler:** Split-Check in `tools/verify.sh` auf `assets/css/*.css` ausweiten.
- **Sprint 1 — Rollout-Infrastruktur** — noch nicht begonnen.
  - S1.1 Staging (Subdomain Domainfactory oder lokal)
  - S1.2 Backup/Rollback-SOP + Pre-Deploy-Snapshot
  - S1.3 End-to-End-Mail-Test (echte Outlook-SMTP + Anhang)

**Produkt-Ebene (aus HANDOFF_PROMPT.md):**

1. **v2.7.2 Homepage (Logo +35 %)** — ✅ freigegeben 2026-04-18 „passt jetzt erst mal".
2. **Task 2 — v2.6.0 Karriere + MFA-Formular** — ✅ freigegeben 2026-04-18.
3. **Task 1 — v2.5.0** (Hero/Standorte/MFA-Card) ✅ am 2026-04-18 freigegeben.
3. **Task 3 — WPML-Homepage-Duplikate** für EN/FR/ES → läuft als **Sprint 3 / S3.1**
   (siehe `_rules/ARCHITECTURE.md` §4). Nicht vor Sprint 0 beginnen.
4. **Task 4 — Menü „Hauptnavigation"** befüllen.
5. **Task 5 — Phase 4 Rollout** Design-System auf 172 Seiten.
6. **Task 6 — Phase 5 Go-Live** QA / SEO / Schema / Formulare / Staging→Live.
7. **Task 7 — 11 Blogposts** überarbeiten + Content-Pipeline.
8. **Task 8 — Echte Fotos** für 6 Ärzte (Barcsay, Seelig, Jawich, Shahin, Landeberg, Arbitmann).

**Deadline:** Go-Live innerhalb 48 h (ursprünglich ab Session-Start).

---

## Session 2026-04-18 — Sprint 0 Minimal-Scope umgesetzt (S0.1 + S0.4)

**Auftrag Dr. Stracke:** Front A mit b=1 (Git lokal), c=2 (zwei Repos), d=1 (Deadline halten).

### S0.1 — Zwei lokale Git-Repos

**Repo A — Theme** (`wp-content/themes/praxiszentrum/`)
- Neu: `.gitignore`, `CHANGELOG.md` (Pre-Git-Historie v2.5.0…v2.7.3 + PXZ_VERSION-Bump-Policy), `README.md` (Setup + WP-CLI-Aufrufmuster + Struktur).
- `git init -b main`, Baseline-Commit `8c9d0fa`: `chore: baseline v2.7.3 (homepage + karriere + mfa-formular)`.
- 10 Dateien im Commit, `git status` sauber.

**Repo B — Docs/Tools** (`~/Cortex/projects/praxis-redesign/`)
- Neu: `.gitignore` (`node_modules/`, `.DS_Store`, `*.log`, `screenshots/_archive/`, `screenshots/claude/_archive/`).
- `git init -b main`, Baseline-Commit `2f288a3`: `chore: baseline Sprint-0 start (docs + verify tools, post-v2.7.3)`.
- 87 Dateien im Commit, 28 MB komprimiert, `git status` sauber.
- Kein Remote (b=1).

### S0.4 — Verify-Pipeline auf Page-Registry

**Neue Dateien in `tools/`:**
- `page-registry.mjs` — Export `pages = [{slug, url, viewports, expected, exists}]`. Initial: Home + Karriere, 3 Viewports.
- `shoot.mjs` — Generischer Screenshot-Runner mit `--slug=` / `--ver=` Flags.

**Refactor:**
- `probe-design.mjs` — liest Registry statt hartkodierte Home-Map. Neu: `exists`-Liste pro Page (DOM-Existenz-Check). `--slug=` Flag zum Isolieren einer Page.

**Gelöscht:** `shoot_karriere.mjs` (ersetzt durch `shoot.mjs`).

**Karriere-EXPECTED ad-hoc vermessen:**
- `.pxz-kar-card` padding-top 112/96/72, padding-left/right 96/72/40
- `.pxz-kar-eyebrow` color `rgb(245, 184, 0)` auf allen Viewports
- DOM-Existenz: `.pxz-kar-hero`, `.pxz-kar-card`, `form[id^='wpforms-form-']`, alle 6 WPForms-Felder inkl. DSGVO-Checkbox mit `required` (PXZ-E-005-Schutz)

### Verifikation

- `bun run tools/probe-design.mjs` — **54 Assertions grün** auf 2 Pages × 3 Viewports.
- `bun run tools/shoot.mjs --slug=home --ver=2.7.3` — 3 Shots gespeichert.
- `bun run tools/shoot.mjs --slug=karriere --ver=2.6.0` — 3 Shots gespeichert.
- `tools/verify.sh` — alle 4 Checks grün (Split, Reset, Computed-Style, Alignment).

### Docs-Pflege

- `_rules/ARCHITECTURE.md` — tools-Tree + SOLL/IST-Tabelle + Sprint-0-Status + Artefakte-Tabelle auf neuen Stand.
- `SESSION_RESUME.md` — §1 Stand, §3 Fronten-Liste, §5 Session-Block (diese), §4 Tasks-Block aktualisiert.
- `Nexus/_memory/MEMORY.md` — Projekt-Status-Zeile praxis-redesign.

### Offene Commits (nach S0.4)

Die Docs-Änderungen + S0.4-Tool-Dateien liegen in Repo B und brauchen noch ihre Commits:
- `feat(s0.4): page registry + generic probe/shoot; remove shoot_karriere`
- `docs: reflect sprint-0 minimal-scope completion`

---

## 5. SESSION-EFFIZIENZ-KONZEPT (vom Nutzer gefordert)

Dr. Stracke hat verlangt, ein Konzept zu entwickeln, damit redundante Sessions
endlich effektiv werden. Grundregeln:

1. **Rules-First-Prinzip:** Jede Kritik wird sofort als Regel in
   DESIGN_GUIDELINES.md §15 „Anti-Patterns" dokumentiert. Keine Kritik darf
   zweimal geäußert werden müssen.
2. **Batch-Fixes statt Einzelfixes:** Wenn ein Problem auftritt, systematisch
   alle verwandten Stellen gleichzeitig korrigieren.
3. **Pflicht-Verifizierung:** Nach jeder sichtbaren Änderung Chrome-Headless-
   Screenshot. Desktop 1440 + Mobile 390, in Sektions-Slices.
4. **Screenshot-Ordnung:**
   - Dr. Stracke legt Referenzbilder als `1.png, 2.png…` in `screenshots/` ab.
   - Claude legt Verifikationen in `screenshots/claude/` mit Schema
     `YYYY-MM-DD_vX.X.X_device_NN_section.png` ab.
   - Alles Alte wandert in `_archive/`.
5. **Keine Zwischenfragen bei klaren Aufgaben.** Dr. Stracke trifft strategische
   Entscheidungen; Claude arbeitet autonom durch die Umsetzung.
6. **Abschlussbericht pro Batch** mit WAS geändert / WARUM / Vorher-Nachher-
   Screenshots — dann warten auf Freigabe.

---

## 6. ERSTER SCHRITT IN DER NEUEN SESSION (Stand 2026-04-18)

Kurzform:

1. **Alle Pflicht-Dateien aus Abschnitt 1 dieses Dokuments lesen** — insbesondere
   die neuen `WORKING_MODE.md` + `ARCHITECTURE.md`, sowie
   `specs/sprint-0/README.md` und `specs/sprint-0/OPEN_DECISIONS.md`.
2. `screenshots/` prüfen: neue Referenzbilder von Dr. Stracke?
3. **`tools/verify.sh` ausführen (nur lesend)** — muss OK sein (v2.6.0 ist grün).
4. Status-Statement an Dr. Stracke im **Architekten-Stil** (präzise, strukturiert,
   keine Fülltexte):
   - Aktuelle Version: **v2.6.0** (Karriere-Seite + MFA-Formular live).
   - Task 2 wartet auf Browser-Freigabe durch Dr. Stracke.
   - Sprint 0 (Architektur-Foundation) wartet auf Antworten zu
     `specs/sprint-0/OPEN_DECISIONS.md` (b), (c), (d).
5. **KEINE Code-Änderungen, bis:**
   - Task 2 freigegeben **und**
   - Sprint-0-Entscheidungen (b)(c)(d) beantwortet.
6. Nach Freigabe beider: Sprint 0 gemäß `specs/sprint-0/README.md` starten,
   streng nach `WORKING_MODE.md` (4-Phasen-Prozess).
7. Ende der Session: `SESSION_RESUME.md` aktualisieren, ggf. neue Specs unter
   `specs/<sprint>/<task>.md` anlegen.

---

## 7. KRITISCHE KONTAKTDATEN

- Hauptstandort: Grüneburgweg 12, 60322 Frankfurt am Main
- Zweitstandort: Bockenheimer Landstraße, 60323 Frankfurt am Main
- Kasse: 069 247 574 523 · Privat: 069 247 574 526
- E-Mail: praxis@westend-hausarzt.de

---

## 8. ABSOLUTE VERBOTE (DESIGN_GUIDELINES §1.1 + §15)

- NIE schwarzer Text auf dunklem Hintergrund
- NIE Text, der erst bei Hover sichtbar wird
- NIE opacity < 0.95 auf Fließtext
- NIE Text, der am Card-Border klebt (mind. 72px Mobile / 96px Tablet / 112px Desktop)
- NIE Eyebrows direkt gegen den oberen Card-Rand
- NIE Sektionen-Padding > 96px Desktop bei CTA/Formular-Bereichen
