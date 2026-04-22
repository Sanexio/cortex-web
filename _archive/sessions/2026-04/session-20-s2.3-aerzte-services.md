## §3-legacy-session20 (historisch) — Session 20, 2026-04-22 (Praxis-Sprint 2 / S2.3-aerzte-services Block B1)

### Ziel
Cluster `aerzte` (2 Pages aus Content-Archive) + Cluster `services` (4 Pages) gebündelt als „nächster großer sinnvoller Block" abarbeiten. **Harter Constraint von Dr. Stracke:** *„Bei den Ärzten müssen immer auch alle anderen Kollegen aus der Praxisgemeinschaft mitauftauchen. Platzhalter für Fotos und Content sind OK, aber alle Ärzte müssen wählbar sein."*

### Durchgeführt (Architekten-Modus 4 Phasen, Dr.-Stracke-Delegation „du kannst entscheiden")

1. **Phase 1 Verständnis-Sicherung** — Inventar-Befund: 6 Content-Archive-Pages haben 3 Architektur-Probleme (a) `arzt-team-368` redundant zu `/team/`-Grid aus S2.3-B (b) `261 Unsere Leistungen` Kreuz-Referenz mit `/praxis/` aus S2.3-B (c) `299 Impfungen` und `472 Rund ums Impfen` ~60 % redundant + `5709 Corona` Pandemie-2022 obsolet. **Dr.-Stracke-Constraint** umgewertet F1c → **F1b-mit-Stub** (alle 8 Arzt-Profile). 6 Architektur-Fragen (F1–F6) formuliert + delegiert.

2. **Phase 2 Lösungsdesign** — Spec `S2.3-aerzte-services.md` (FREIGEGEBEN, Cortex-Web Commit A `5cfd012`). 12 AK, 8 Risiken, 15 T-Tasks. Architekten-Wahl: F1b-mit-Stub / F2c (Label-Swap statt /aerzte/-Doppel) / F3b (Impf-Merge in /impfungen/) / F4a (Corona archivieren) / F5a (/leistungen/ neu) / F6a (kein neues Submenu).

3. **Phase 3 Umsetzung (T1–T15) mit In-Session-Bug-Fix:**
   - **T1 Baseline:** Home/Karriere/Team-MD5 festgehalten.
   - **T2 `inc/team-data.php`:** 5 neue Helper (`profile_url` derivativ, `pxz_doctor_slugs()`, `pxz_doctor_by_slug()`, `pxz_is_sanexio_uri()`, `pxz_render_other_doctors($exclude)`). Slugs `landeberg`/`arbitmann` → `dr-landeberg`/`dr-arbitmann` (R-1 Slug-Kollisions-Vermeidung).
   - **T3 `template-team.php`:** Cards bekommen `<a class="pxz-team-card-link">`-Wrapper + `.pxz-team-card-cta`-Indikator („Profil ansehen →").
   - **T4 `template-arzt.php` produktiv:** Hero (Avatar/Name/Sub/Sprachen) + Vita (`the_content()` ODER Stub-Block) + Other-Doctors-Sektion + CTA (Doctolib + /sprechstunden/ + /contact-us/).
   - **T5 `assets/css/arzt.css` produktiv:** ~360 Zeilen, Hero / Vita-Typo / Other-Doctors-Mini-Grid (`grid auto-fill minmax(260px, 1fr)`) / CTA / Responsive 1024+720 px Breakpoints. Tokens-only.
   - **T6 NEU `template-leistungen.php` + `assets/css/leistungen.css`:** Services-Hub mit 3 Sektionen × {3, 1, 3} Cards. Hartkodierte Card-Daten in Template (kein eigenes Daten-File für 7 Cards).
   - **T7 `inc/nav-data.php`:** Label-Swap „Team" → „Ärzte" (DE/EN/FR/ES, jeweils sprachspezifisch übersetzt: Doctors/Médecins/Médicos).
   - **T8 `inc/seo-data.php`:** 3 neue Funktionen (`pxz_seo_data_leistungen`, `pxz_seo_data_impfungen`, generische `pxz_seo_data_doctor($slug)` für 8 Personen via Slug-Loop). schema.org/Physician mit knowsLanguage + memberOf MedicalOrganization.
   - **T9 Brand-Switch via Helper:** `header-nav.php` `$is_sanexio = pxz_is_sanexio_uri($uri)` statt fest verdrahteter Regex. `pxz_site_name` + `pxz_override_blogname_for_team` analog. **In-Session-Bug entdeckt:** `pxz_is_sanexio_uri()` in `pre_option_blogname`-Filter aufgerufen, aber Helper aus `inc/team-data.php` noch nicht geladen — Lade-Reihenfolge gefixt: `require_once .../inc/team-data.php` früh in functions.php. PXZ_VERSION 2.7.16 → 2.7.17. `template-leistungen.php` registriert (`theme_page_templates` Display-Name + Enqueue `pxz-leistungen`).
   - **T10 Migration `2026-04-22_s2.3-aerzte-services_pages.php`:** 6 Updates + 7 Inserts + 7 WPML-DE-Einträge, alle idempotent (Hash-Vergleich vor INSERT/UPDATE, MAX(trid)+1 für WPML).
   - **T11 Migration Lauf 1:** `created=7 updated=18 skipped=6` ✓. Lauf 2: `created=0 updated=0 skipped=24` ✓ (Idempotenz).
   - **T12 URL-Matrix:** 8 Arzt-Slugs HTTP 200, /leistungen/ + /impfungen/ HTTP 200, 5 obsolete URLs HTTP 404. **In-Session-Lehre LL-4:** `grep -c` zählt Zeilen, nicht Vorkommen — `grep -oE … | wc -l` für AK-3 Other-Doctors-Cards-Zählung.
   - **T13 HTML-Assertions:** Brand-Switch 9× `logo-sanexio.svg` (1× /team/ + 8× Arzt). Other-Doctors 7× pro Page (current ausgeschlossen, sanity-checked Stracke und Saul). Stracke-Vita 0× `?`-Mojibake, alle deutschen Marker korrekt (Gießen, Gesundheitsökonom, Geschäftsführender, Lösungen, Universität, für, Gasthörer). Impfungen 0× Mojibake, alle 5 H2-Sektionen.
   - **T14 Self-Check:** `evidence/2026-04-22_s2.3-aerzte-services_self-check.md` (12/12 AK, 5 LL, FK-Check 0/5).
   - **T15 Theme-Commit `c090173`** (12 Files, +1107/-96). **Cortex-Web-Commit B `c88de56`** (5 Files: Migration + Evidence + Self-Check + Pointer 2.7.17 + Mysqldump-Pre).

4. **Phase 4 Selbstprüfung** — 12/12 AK = 100 %. FK-Check 0/5 eingetreten.

### Verifiziert

| Check | Ergebnis |
|---|:---:|
| `verify.sh` §1 + §1b + §2 + §3 + §3b + §4 | VERIFY OK ✓ |
| `smoke-http.sh` (5 URLs) | 5/5 HTTP 200 ✓ |
| 8 Arzt-URLs (curl-Matrix) | 8/8 HTTP 200 ✓ |
| /leistungen/ + /impfungen/ + /team/ | 3/3 HTTP 200 ✓ |
| 5 obsolete URLs (rund-ums-impfen, corona-impfung, arzt-team, dr-siegbert-stracke-mba, internistische-…) | 5/5 HTTP 404 ✓ |
| `validate.sh` (Cortex-Web) | OK ✓ |
| Theme HEAD | `c090173` (PXZ 2.7.17) ✓ |
| Working Trees (beide) | clean ✓ |
| Brand-Switch Sanexio (9 Pages) | 9× `logo-sanexio.svg` ✓ |
| Other-Doctors-Cards pro Arzt-Page | 7/7 (current ausgeschlossen) ✓ |
| Stracke-Profil Mojibake | 0× `?` im Vita-Body ✓ |
| Migration Idempotenz (Lauf 2) | 0 Mutationen ✓ |
| Self-Check AK | **12/12 = 100 %** ✓ |

### Lessons Learned (5 neue Pattern-Kandidaten — S2.3-aerzte-services-LL-1…5)

- **LL-1** `entity-roster-ssot.md` — Eine zentrale `pxz_team_doctors()`-SSoT mit derivativen Helpers (`pxz_doctor_slugs`, `pxz_doctor_by_slug`, `pxz_is_sanexio_uri`, `pxz_render_other_doctors`) treibt 5 Konsumenten (Grid, Detail, Brand-Switch, SEO-Schema, Cross-Nav). Ein neuer Eintrag = alles passt.
- **LL-2** `cross-link-no-isolation-pattern.md` — UX-Pattern: jede Detail-Page einer geschlossenen Menge zeigt am Ende ALLE Geschwister als klickbare Mini-Cards. Verhindert Sackgassen + verbessert SEO + spiegelt das „Team"-Mental-Model.
- **LL-3** Stub-Pages mit echtem Hero + funktionierender Cross-Navigation + ehrlicher Kommunikation („Vorstellung folgt") sind keine Karteileichen. Besser als 404 oder fehlende Pages.
- **LL-4** `grep -c` zählt Zeilen, `grep -oE … | wc -l` zählt Vorkommen. WordPress rendert HTML oft als single-line — bei Counts gegen Markup IMMER `-oE`.
- **LL-5** WP-Filter-Hooks (z. B. `pre_option_blogname`) brauchen ihre Helper-Functions vor der Filter-Registrierung. `function_exists()`-Guard ist Sicherheitsnetz, kein Ersatz für korrektes `require_once` in functions.php.

### Drei Wissens-Artefakte für Folge-Sessions

- Pattern `Nexus/_memory/patterns/entity-roster-ssot.md` (plattform-agnostisch)
- Pattern `Nexus/_memory/patterns/cross-link-no-isolation-pattern.md` (UX-Pattern)
- Tutorial `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/21-detail-pages-mit-cross-navigation.md` (didaktisch, beide Patterns + 5 Lehrsätze + praktischer Workflow)

---
