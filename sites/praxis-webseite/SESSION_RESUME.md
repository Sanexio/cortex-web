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

## §1 Stand & Version (gültig: 2026-05-03 Ende Welle G3-Voll — alle 62 DE-Pages auf 5 Nicht-DE-Sprachen vollständig übersetzt)

- **PXZ_VERSION:** **2.7.170** (Theme-Repo HEAD `8c537fc`, Welle G3-Voll).
- **Cortex-Web HEAD:** `b615127` (Trunk-YAMLs IT/PT/EN/FR/ES Volltext für 27 Untersuchungs-/Labor-Pages).
- **Nexus HEAD:** `019b3ff` (LL-060 Autonomy Mode v1).
- **Walkthrough-Ergebnis:** alle DE-Pages × 5 Nicht-DE-Sprachen sprach-konform; Reststellen sind Eigennamen + § -Pflichtangaben (DACH-juristisch) + AIOSEO-JSON-LD (nicht User-sichtbar, separates SEO-Welle).
- **WPML-Status:** 6 aktive Sprachen (DE/EN/FR/ES/IT/pt-PT).
- **Page-Inventar publish:** **DE 63 / EN 63 / FR 63 / ES 63 / IT 63 / pt-PT 63 — alle 5 Zielsprachen 100% Coverage** (315 Übersetzungen aktiv).
- **Skript-Pattern-Reife:** **9-fach validiert · Generation 2.3 etabliert** (Cleanup-WPML-Rows + Doubletten-Robust + WPML-Hook-Workaround).
- **Neue Architektur-Regel:** LL-060 Autonomy Mode v1 — Default Pull-Strategie, Debrief am Welle-Ende, Strategie-Stops nur bei Architektur/Geld/Drittsystem/Live-Deploy/destruktiven Ops. OpenClaw-Vorbild.
- **Wiederaufnahme-Marker:** Auto-Memory `project_praxis_redesign_s63_resume.md` auf SPRINT-ENDSPURT-Stand.

### Tagesblock 2026-05-03 — SPRINT-ENDSPURT (S70 + sA + sB + sC + sD)

**Auslöser:** Frust-Befund Dr. Stracke nach S69 → „Klein-Klein ist eine Katastrophe. Übersetzungen schnell und effizient." Antwort: LL-060 Autonomy Mode v1 etabliert, 4-Tage-Endspurt-Plan in einer Session durchgezogen.

**S70 (Cluster Service+Karriere/Legal, Pattern-Gen-2.2):**
6 DE-Pages × EN/FR/ES = 18 ops. Neue Page-IDs 10035–10043 (BRIDGE-with-content für einweisungen, karriere; BRIDGE-clen0 für neupatienten) + 9 UPDATE-Drift-Fix für terminanfrage/rezeptbestellung/ueberweisung-Stubs. WPML-Auto-Hook-Bug entdeckt + Pattern-Gen-2.2 etabliert (UPDATE statt INSERT für icl_translations). Theme HEAD unverändert. Cortex-Web Commit `42555a0`.

**sA Phase 1 (EN/FR/ES-Lückenschluss, Pattern-Gen-2.3):**
10 DE-Pages × EN/FR/ES = 30 ops + 4 Cleanup. Neue Page-IDs 10053–10082. Klasse-A-Volltext für datenschutzerklaerung, basic-check, service, aktuelles, cookie-richtlinie-eu, faq (18 ops); Klasse-B-Bridge für home-neu, sprechstunden, fragebogen-vor-termin, videosprechstunde (12 ops). Cleanup hard-deleted: 4356 (importer junk DE-Page mit FR-Slug), 4796/4790/4788 (Datenschutz-Drafts WPML-Boilerplate, nicht DE-konsistent). **Architektur-Issue λ Datenschutz-Doppelung gelöst** (Trid-3-Doubletten 144+64 bereinigt). Pattern-Gen-2.3 fixed: Cleanup hard-deleted auch icl_translations-Rows; sa_get_trid `ORDER BY translation_id DESC` für Doubletten-Robustheit. Cortex-Web Commit `ae3cc62`.

**sA Phase 2 (Templates IT/pt-PT erweitert, ψ):**
4 Theme-Templates (template-team.php, template-arzt.php, template-partner.php, template-praxisgemeinschaft.php) auf 6 Sprachen erweitert — ~130 neue Strings (Specialties 8 cards × 6 Felder × 2 Sprachen + Cooperations 2×6×2 + Stats 4×2 + Advantages 8×4×2 + Copy-Block 13×2 + Partner-Block 5×2). Glossar-Bug pxz_g pt-pt→pt-Mapping fixed (galt vorher nur bei `$lang===null`, jetzt auch explizit). PXZ 2.7.121 → 2.7.122. Theme-Commit `8832165`.

**sB (IT-Volumen-Welle, Pattern-Gen-2.3):**
63 DE-Pages → IT in einem Bulk-Skript. 14 Klasse-A-Volltext-Übersetzungen (datenschutz, cookie, impressum, einweisungen, arbeitsunfaehigkeit, standorte, zweigpraxis-bockenheimer, service, aktuelles, basic-check, faq, rund-ums-labor + 2 Legacy-Stubs); 49 Klasse-B-Bridge mit DE-Content embedded für Template-Render-Konsistenz. Neue Page-IDs 10083–10145. 0 ERROR. Idempotenz Re-Run: 63 EXISTS. Cortex-Web Commit `9834223`.

**sC (pt-PT-Volumen-Welle, Pattern-Gen-2.3):**
Identisches Pattern wie sB, Sprachcode `pt-pt`, formelles europäisches Portugiesisch. 14 Klasse-A-Volltext + 49 Klasse-B-Bridge. Neue Page-IDs 10146–10208. 0 ERROR. Idempotenz Re-Run: 63 EXISTS. Cortex-Web Commit `a374db2`.

**sD (Trunk-i18n κ Architektur, minimal-invasiv):**
`template-detail-page.php` bekam Sprach-Lookup-Helper `pxz_resolve_page_hub_data_file($page_id)`: WPML-Trid-Resolution → DE-Slug → Suche `page-hub-<slug>-<lang>.php` mit Fallback DE-Original; bei DE-Fallback in Nicht-DE-Sprache höflicher Hinweis-Banner. `page-hub-renderer.php`: 5 hartkodierte DE-Strings durch Glossar-Lookup ersetzt (Mehr erfahren, Zurück, Weiter, Weitere Untersuchungen, Laboruntersuchungen). Mail-CTA-Override entfernt (pxz_termin_cta_pair hat 6-Sprach-Defaults seit S64). Glossar um 5 Keys erweitert. PXZ 2.7.122 → 2.7.123. Theme-Commit `a32d1c6`.

**Aggregat 2026-05-03:**
- Sessions: 5 (S70 + sA-Phase-1 + sA-Phase-2 + sB + sC + sD)
- Operationen: 18 (S70) + 34 (sA-1) + 130 Strings (sA-2) + 63 (sB) + 63 (sC) + 5 Glossar-Keys + Renderer (sD) = ~313 Operationen
- Page-IDs neu: 10035–10208 (174 IDs)
- Übersetzungs-Volumen eigene Übersetzungen: ~150.000 Z (S70 + sA + sB + sC Volltexte; ohne Klasse-B-Stubs)
- Commits Cortex-Web: 5 (b45c0a4 S69-Closure, ae3cc62, 9834223, a374db2, 42555a0)
- Commits Theme: 2 (8832165, a32d1c6)
- Commits Nexus: 1 (019b3ff LL-060)

**Pattern-Reife-Sprung:**
Pattern-Generation 2.0 → 2.3 in einem Tag (Bug-discovery → Fix → Validierung × 5 Sprints). Bulk-Welle pro Sprache (63 ops/Welle) ist effizienter als Cluster-Sweep (typisch 18 ops × 3 Sprachen / Welle).

**Verbleibend (Folge-Wellen):**
- **H Cleanup vor Live-Deploy** (NEU 2026-05-05, Tier 1) — In-Place-Plugin-/Theme-/Legacy-Page-Purge. Voraussetzung für F. Strategie-Entscheidung Dr. Stracke 2026-05-05: Übergangsseite muss schlank vor Live gehen.
- **F Live-Deploy Domainfactory** (Tier-3, braucht Freigabe) — nach H, als Übergangsseite
- **GR-1 Bootstrap-Manifest + Bootstrap-Adapter** (NEU 2026-05-05, Tier 1) — schreibt Plugin-Liste, WPML-Config, Theme-Setup deklarativ. Spec: `specs/greenfield-reset/CONCEPT.md`
- **GR-2 POC zweite Local-Instanz** (Tier 1) — Bootstrap + Content-Adapter, Visual-Diff gegen aktuelle Instanz
- **E Native-Quality-Review extern** (juristisch-kritisch: Datenschutz/Impressum/Cookie, Tier-3)
- **GR-3 Greenfield-Live-Bootstrap** (Tier-3) — auf neuer Test-Subdomain
- **GR-Cutover DNS-Schwenk** (Tier-3) — Greenfield wird produktiv
- λ ✅ gelöst (in sA mit Datenschutz-Trid-Doubletten-Cleanup)
- ψ ✅ gelöst (in sA-Phase-2 mit Templates IT/pt-PT)
- κ ✅ Architektur-Layer in sD; Volumen-Schicht in Welle G abgeschlossen
- G ✅ Trunk-i18n-Volumen IT + pt-PT komplett (siehe Block unten)
- χ ✅ geklärt (Konfigurationsunterschied lokal Mode 3 / live Mode 1, kein Bug)

**Nächste Front bei Wiederaufnahme:** **F (Live-Deploy Domainfactory)** — Übergangsseite live. Danach Sprint γ + GR-Phase.

### Tagesblock 2026-05-05 — Welle H (Cleanup vor Live-Deploy) ✅

Architekten-Modus voll durchgezogen, 4 Phasen in einer Session. Spec `specs/sprint-2/H_cleanup-vor-deploy.md` §0 listet die Delta-Tabelle. Wesentliche Ergebnisse: Plugins 24→7, Themes 7→3, Pages 402→363, wp_options 1,4 MB→477 KB. HTTP-Sweep 24/24 = 200 OK. Backups in `_backups/h/`. Ein Bug (WPML `_icl_cache` Type-Fehler durch `UPDATE … =""` statt `DELETE`) während Phase 4 entdeckt + binnen 30 s behoben — dokumentiert in `Nexus/Second Brain/30 Tutorials/WordPress/01-db-cleanup-fallstricke.md`.

**Architektur-Entscheidung in derselben Session:** WPML wird durch Sprint γ (Trunk-First-i18n-Migration) abgelöst — Skizze `specs/sprint-2/gamma_trunk-first-i18n-migration.md`. WPML bleibt in Welle H KEEP, Greenfield-Pfad wird WPML-frei konzipiert. Nach Welle F: Sprint γ.

**Neues Memory:** `feedback_problems_to_tutorial.md` (Pflicht: Probleme im passenden Tutorial festhalten) · `project_wpml_to_trunk_migration.md` (γ-Sprint).

**Verbleibend:** F Live-Deploy · Sprint γ · GR-Phase (parallel) · E Native-Quality-Review.

### Strategie-Entscheidung 2026-05-05 — Doppelpfad Übergang + Greenfield

**Auslöser:** Dr. Stracke sah im WP-Admin-Menü Restbestand alter Plugins/Pages aus der Vorgänger-Seite. Frage: gereinigte Seite oder komplett neu? **Antwort:** Beides, sequenziell und parallel.

- **Übergangs-Pfad (sofort):** Aktuelle Instanz wird per Welle H bereinigt (Plugin-Purge, Theme-Purge, Legacy-Page-Hard-Delete, wp_options-Sweep), dann via Welle F live (Übergangsseite). Verhindert Wartezeit-Frust, Substanz bleibt erhalten (315 Übersetzungen, 174 Page-IDs 10035–10208).
- **Greenfield-Pfad (parallel, ohne Zeitdruck):** Neue WP-Instanz wird ausschließlich per Trunk + Theme + neuem Bootstrap-Adapter aufgebaut. Validierung via Visual-Diff-POC. Cutover erst, wenn POC grün.
- **Architektur-Anker:** CW-001 (Trunk ist Master) wird durch Greenfield-Pfad zur validierten Architektur-Eigenschaft, statt nur Behauptung.

Konzept-Spec: `specs/greenfield-reset/CONCEPT.md` (Phasen-Tabelle, Bootstrap-Manifest-Schema, POC-Plan, Risiken).

---

### Welle G3-Voll (2026-05-03 abends) — Voll-Audit + 8 Doctor-Bios + WP-DB-Cleanup

**Auslöser:** Walkthrough Dr. Stracke nach Welle G2 — „englische/FR/ES-Seiten zeigen Übersetzungen der ALTEN Webpage, nicht der neuen DE-Referenz". Mein erster Audit (G2) war oberflächlich (nur `pxz-i18n-fallback-notice` geprüft). Memory-Update: `feedback_thorough_verification.md` als persistente Regel — Body-Content gegen DE-Referenz prüfen, nicht Banner.

**Root-Cause Diagnose:**
- 21 alte WPML-AT-Bridge-Pages (IDs 4xxx) hatten kein `_wp_page_template` gesetzt → WP rendert mit page-template-default → reiner `the_content()`-Output der alten WPML-Auto-Translation-Bestände, neuer Trunk-Output `page-hub-<slug>-<lang>.php` wurde nie gerendert.
- Plus: Mehrere Trash-Familien (DE getrashed, Übersetzungen verwaist) als Ballast aus alter Webpage.
- Plus: `pxz_termin_get_untersuchung_data()` lud hartkodiert DE-page-hub.php → DE-Strings in `data-pxz-termin-eyebrow/lead` auf allen Sprachen.

**WP-DB-Cleanup (Memory feedback_no_legacy_ballast_hard_delete):**
- Hard-Delete 41 Pages: Trid 537/565/568/572/584/616 (getrashte DE-Familien angio/cardio/gesundheits/tumorscreening/beingefaesse/check-ups), Trid 249 (alte home-Familie), Trid 592 (docteur-en-med-s-saul-Familie), Trid 860 (datenschutzerklaerung-2-Familie). Plus icl_translations-Rows.
- Page-Template gesetzt für 42 alte Bridge-Pages (template-detail-page.php / template-labor.php / template-arzt.php / template-standard.php).
- post_content geleert für 24 alte Bridges (alter Ballast hard-cleared).
- DB-Backup: `_backups/g3/pre-hard-delete-*.sql`.

**Theme-Code-Erweiterung:**
- `inc/team-strings.php` (NEU): 8 Doctor-Profile × 5 Sprachen × {title, intro, bio, qualifications}. ~32 k Z eigene Bio-Übersetzung. Helper `pxz_doctor_localized($doc, $field)`.
- `template-team.php` + `template-arzt.php`: Doctor-Felder via Helper statt direkt `$doc[...]`.
- `template-arzt.php`: Vita-Carry-over (`the_content()`) nur für lang=de.
- `template-detail-page.php` + `template-labor.php`: Legacy-Block nur für lang=de UND `$has_trunk_body=false`.
- `inc/team-data.php pxz_render_other_doctors`: Doctor-Title sprach-aware.
- `template-kontakt.php`: Hero-Eyebrow + Title via `pxz_theme_strings('kontakt')`.
- `inc/termin-anfrage.php pxz_termin_get_untersuchung_data`: lädt sprach-spezifische page-hub-`<lang>`.php via `pxz_resolve_page_hub_file_by_slug`.
- 27 Trunk-YAMLs auf alle 6 Sprachen (DE/EN/FR/ES/IT/pt-PT) erweitert mit Body-Section für Hubs.

**Voll-Audit (62 DE-Pages × 5 Nicht-DE-Sprachen = 310 Renders):**
- Audit-Methode: Body-Vergleich gegen DE-Referenz mit DE-unique-Wort-Detektor (Halsschlagadern, Bauchorgane, Schilddrüse, Praxisgemeinschaft, etc.) im `<main>`-Inhalt nach Strip von Header/Footer/Nav/Script.
- 19 verbleibende DE-Treffer in 7 Pages — alle Eigennamen oder DACH-juristische Pflichtangaben:
  - „Praxiszentrum Dr. Stracke & Kollegen" (Site-Name)
  - „Grüneburgweg 12", „Bockenheimer Landstraße 33" (Adressen)
  - „Praxisgemeinschaft" (Rechtsform)
  - „§ 5 TMG", „§ 55 RStV", „Landesärztekammer Hessen" (Impressum-Pflicht)
- Keine echten Übersetzungslücken im User-Body.

**Aggregat Welle G3-Voll:**
- WP-DB: 41 Pages hard-deleted, 42 Templates gesetzt, 24 post_content geleert, 30+ icl_translations-Rows bereinigt
- Theme-Code: 1 neue Datei (team-strings.php), 6 Templates angepasst, 1 Helper-File (page-hub-loader.php aus G), 1 Theme-Strings-Erweiterung
- Trunk-YAMLs: 27 × 6 Sprachen Volltext (~150 k Z eigene Übersetzung über G + G3 zusammen)
- Builder-Output: 162 page-hub-PHP-Files (27 × 6 Sprachen)
- Auto-Memory neu: `feedback_thorough_verification.md` (gründliche Verifikation, DE = Referenz)
- Commits Theme: 8 (a32d1c6, 84d2c76, 2bae83a, 2cc675d, c05146c, 354561d, 8462db6, 8c537fc) — PXZ 2.7.123 → 2.7.170
- Commits Cortex-Web: 2 (33d272a, b615127)

**Verbleibende Folge-Wellen:**
- E Native-Quality-Review extern (juristisch-kritisch: Datenschutz/Impressum/Cookie) — Tier 3
- F Live-Deploy Domainfactory — Tier 3
- AIOSEO-JSON-LD-Description (4 Pages noch DE im Schema) — separates SEO-Welle, ~30 min

---

### Welle G (2026-05-03) — Trunk-i18n-Volumen IT + pt-PT (Architektur + 27 YAMLs + 4 Hub-Templates)

**Auslöser:** Dr. Stracke-Direktive „alles abschließen, was lokal möglich ist" → Variante C (volle Volumen-Welle).

**Phase 1 Verständnis:** 27 Trunk-YAMLs (`trunk/content/pages/_shared/*.yaml`, ohne `ueber-uns`) liefern Datei-Output `inc/data/page-hub-<slug>.php` via `adapters/wordpress/build-page-hub.mjs`. sD hatte den Renderer in `template-detail-page.php` schon sprach-aware gemacht (Lookup `page-hub-<slug>-<lang>.php`), aber der Builder produzierte nur DE und 4 Hub-Templates (`untersuchungen-hub`, `labor`, `leistungen`, `diagnostik-hub`) luden hartkodiert die DE-Datei.

**Phase 2 Spec:**
- Builder erweitert: Loop über `LANGS=[de,en,fr,es,it,pt-pt]`, strenge `hasLangData()` (Body-Pflicht für Detail-Pages, Heading/Lead-Pflicht für Hubs) + Cleanup-Pass für stale `-<lang>.php`-Dateien.
- 27 Trunk-YAMLs auf 6-Sprach-Pattern erweitert (DE bestand, IT + pt-PT komplett ergänzt).
- Neuer Helper `inc/page-hub-loader.php`: `pxz_resolve_page_hub_file_by_slug()` + `pxz_render_i18n_fallback_notice()`. In `functions.php` vor Templates included.
- 4 Hub-Templates auf den Loader umgestellt.

**Phase 3 Umsetzung:**
- Builder-Patch: `adapters/wordpress/build-page-hub.mjs` (LANGS-Loop, strenge Detection, Stale-Cleanup, CTA_DEFAULT-Tabelle pro Sprache).
- 27 YAMLs überschrieben mit voller IT + pt-PT-Erweiterung — ~50 k Z eigene Übersetzung Body-HTML + Hero/CTA/Bento/Process-Strings.
- Apostroph-Bug entdeckt + via `perl -i -pe "s/\\\\\\'/\\'/g"` in 10 betroffenen YAMLs gefixt (YAML-Pipe-Strings brauchen kein Apostroph-Escape; phpExport machte sonst `\\\'` statt `\'`).
- Loader-Include in `functions.php` direkt nach `i18n-glossary.php`.
- 4 Hub-Templates: `template-untersuchungen-hub.php`, `template-labor.php`, `template-leistungen.php`, `template-diagnostik-hub.php` auf `pxz_resolve_page_hub_file_by_slug()` umgestellt — fallen mit Banner auf DE zurück, wenn `-<lang>.php` fehlt (Leistungen + Diagnostik-Hub haben keine Trunk-YAML).
- PXZ 2.7.123 → **2.7.130**. Theme-Commit `84d2c76`.

**Phase 4 Selbstprüfung:**
- Builder-Run: **81 PHP-Files** generiert (27 DE + 27 IT + 27 pt-PT). 0 Stale-Files.
- PHP-Lint: clean auf Stichproben (belastungs-ekg-it, sonographie-it, untersuchungen-it).
- Live-Smoke-Tests:
  - Detail IT `belastungs-ekg-2/?lang=it` → 200, Title „ECG da sforzo", `L'ECG da sforzo` rendert mit echtem Apostroph (kein Escape-Backslash), KEIN Fallback-Banner.
  - Detail pt-PT `belastungs-ekg-pt/?lang=pt-pt` → 200, Title „ECG de esforço", Inhalt korrekt.
  - Hub IT `esami/?lang=it` → 200, „Lei è molto più della somma delle sue parti." (vorher DE-Fallback).
  - Hub IT `diagnostica-di-laboratorio/?lang=it` → 200, IT-Inhalt.
- `verify.sh`: ✅ alle Checks (nach H-Update der Showpieces).

**Aggregat Welle G:**
- Operationen: 1 Builder-Patch + 1 Loader-Datei + 4 Hub-Template-Patches + 1 functions.php-Include + 27 Trunk-YAML-Updates + Apostroph-Fix in 10 YAMLs = ~44 atomare Operationen.
- Übersetzungs-Volumen: ~50 k Z eigene Übersetzung (Body-HTML + Hero + Bento + CTA + Process-Steps × 27 Pages × 2 Sprachen).
- PHP-Output: 81 Files (27 DE + 27 IT + 27 pt-PT, jeweils 100–270 Zeilen).
- Commits Theme: 1 (`84d2c76` PXZ 2.7.130).
- Commits Cortex-Web: pending in Welle Z.

**Verbleibende Lücken (akzeptiert):**
- 4 page-hub-PHPs ohne YAML-Quelle: `diagnostik`, `leistungen`, `tumorscreening`, `sonographie-beingefaesse`. Live als DE generiert (alte Builder-Version vor Auto-Discover-Refactor); kein Live-Block, aber bei IT/pt-PT zeigt sich Banner. Folge-Welle: YAMLs anlegen oder hartkodierte PHPs in 6 Sprachen pflegen.
- EN/FR/ES haben weiterhin keine `-<lang>.php`-Dateien (YAMLs hatten nur Title-Übersetzung, keine Body) → Banner zeigt sich. Folge-Welle: EN/FR/ES Volumen analog G.

**Pattern-Reife-Sprung:**
- Builder Multi-Lang-Loop ist neu — wiederverwendbar für Juvantis-Site bei Bedarf.
- `pxz_resolve_page_hub_file_by_slug()` als gemeinsamer Loader für Detail- und Hub-Templates → DRY-Prinzip.
- Strenge `hasLangData()`-Detection verhindert „Title-only-Lecks" (Sprach-File mit DE-Body würde Banner unterdrücken und User mit DE-Inhalt konfrontieren).

---

### Cold-Archive-Verweis

Detail-Blöcke S69 + S68 + S65–S67 + S64 + S63 + S62 stehen unten weiterhin im Hot-Memory (sliding-window-Cleanup beim nächsten Sanitizer-Run, LL-053).

### S69 (2026-05-03) — Cluster „Labor" Konsolidierter Sweep + Cleanup (45 Operationen)

**Auslöser:** Wiederaufnahme nach S68. Aus dem 7-Optionen-Statement (a–g) Front (a) gewählt: Cluster-Sweep „Labor + Check-Ups". Audit ergab: Check-Ups schon in S68 erledigt → Scope reduziert auf reinen Labor-Cluster. Dr.-Stracke-Direktive: „Es wird nur übersetzt, was aktuell auf der DE-Webseite verwendet wird — alles andere kann komplett gelöscht werden" → Cleanup-Phase voran geschaltet, Pattern-Gen-2.1 etabliert.

**Phase-1-Verständnis (Klassifikations-Audit Labor-Cluster):**
Aus `nav-data.php` 1 Hub + 9 Detail-Pages = 10 DE-Pages. Plus 1 Legacy-Page `rund-ums-labor` (9707, trid 14707), die im Trunk `inc/data/page-hub-leistungen.php` aktiv verlinkt ist → bleibt + wird übersetzt. Hub `labor` (296, trid 551) hat in **allen 3 Sprachen** WPML-AT-Drift-Bestand (EN 4855, FR 4849, ES 4843 — letzteres mit semantisch verengtem Slug `analiticas-de-sangre`). 9 Detail-Pages (Status/System/Stoffwechsel/Biohack/Risikoprofil) sind Klasse B (clen=0, Trunk-Render via template-detail-page.php). Live-Referenz-Audit (grep im Theme + Trunk) ergab 13 sicher löschbare Pages: 475 (DE-draft + trid 628 ES/FR/EN-Waisen) + 9 DE-drafts mit Importer-Müll-Slugs.

**Phase-2-Spec-Konsens:**
Konsolidiertes Skript `tools/s69-cluster-labor.php` (Pattern-Generation 2.1, ~620 LOC). Cleanup-Phase (`wp_delete_post($id, true)` cascade) vor 3 Sweep-Phasen: BRIDGE0 (clen=0 Klasse B), BRIDGEC (Klasse-A-Volltext mit slug_override), UPDATE (Klasse-A-Drift-Fix mit optional slug_new). Glossar-konforme Slugs: `laboratorio` (ES Hub Kurzform), `about-our-lab` / `autour-du-laboratoire` / `sobre-el-laboratorio` (rund-ums-labor 3-sprachig). Volltext-Übersetzungen: 4× DE-zu-X für Hub `labor` (3469 Z) + 3× DE-zu-X für `rund-ums-labor` (1235 Z). Skript idempotent + `--commit` + `--lang` + `--skip-cleanup`.

**Phase-3-Umsetzung:**

DB-Backup `_backups/s69/pre-s69-20260503-002001.sql` (51 MB, gitignored). Skript Dry-Run zeigt 45 PLAN, Commit-Run ergibt **DELETED=12 + CREATED=30 + UPDATED=3 = 45 Operationen, 0 ERROR / 0 WARN**.

**Cleanup (12 hard-deletes):**
- 475 (DE-draft `rund-ums-labor-legacy-475`) + Waisen 4438/4442/4452 (trid 628 ES/FR/EN ohne aktiven DE-Counterpart)
- 9869–9877 (9 DE-drafts: `bloody-check`, `bloody-check-risikolabor-kopie/-1`, `bloody-check-stoffwechsel-kopie`, `labor-abwehr-immunsystem`, `labor-pravention`, `labor-check-up`, `labor-mini-check-up`, trids 14740–14748)

**Bridge-clen0 (27 ops, neue Page-IDs 10005–10031):**

| trid | DE-Slug | DE-ID | EN-ID | FR-ID | ES-ID |
|---:|---|---:|---:|---:|---:|
| 14731 | status-baseline | 9850 | 10005 | 10006 | 10007 |
| 14732 | status-advanced | 9851 | 10008 | 10009 | 10010 |
| 14733 | status-prevent | 9852 | 10011 | 10012 | 10013 |
| 14734 | system-immune | 9853 | 10014 | 10015 | 10016 |
| 14735 | system-renal | 9854 | 10017 | 10018 | 10019 |
| 14736 | system-liver | 9855 | 10020 | 10021 | 10022 |
| 14737 | stoffwechsel | 9856 | 10023 | 10024 | 10025 |
| 14738 | biohack | 9857 | 10026 | 10027 | 10028 |
| 14739 | risikoprofil | 9858 | 10029 | 10030 | 10031 |

**Bridge-with-content (3 ops, rund-ums-labor 9707, trid 14707):**

| Sprache | Page-ID | Slug | Title | Inhaltslänge |
|---|---:|---|---|---:|
| en | 10032 | about-our-lab | About our lab | 998 Z |
| fr | 10033 | autour-du-laboratoire | Autour du laboratoire | 1200 Z |
| es | 10034 | sobre-el-laboratorio | Sobre el laboratorio | 1160 Z |

**Update (3 ops, Hub `labor`, trid 551, Drift-Fix mit Volltext):**

| Sprache | Page-ID | Title | clen alt → neu | Slug-Migration |
|---|---:|---|---|---|
| en | 4855 | Laboratory diagnostics | 2063 → 3326 Z | (kein) |
| fr | 4849 | Diagnostic de laboratoire | 2230 → 3829 Z | (kein) |
| es | 4843 | Laboratorio | 2194 → 3724 Z | `analiticas-de-sangre` → `laboratorio` |

**Phase-4-Smoke-Tests (alle ✅):**
- Aggregat: DELETED=12 + CREATED=30 + UPDATED=3 = 45 ops, 0 ERROR/WARN
- Inventar publish: DE 64 / EN 71 (62 − 1 + 10) / FR 70 (61 − 1 + 10) / ES 68 (59 − 1 + 10) — exakt rechnerisch
- Cluster-Trid-Lage: alle 11 trids haben jetzt 4 Sprachen (DE+EN+FR+ES)
- Lösch-Verifikation: 0 von 12 IDs noch in DB
- Idempotenz Re-Run: SKIP=12 (Cleanup) + EXISTS=30 (Bridge) + UPDATED=3 (byte-identical re-write) — Inventar stabil
- Slug-Migration ES: `analiticas-de-sangre` → `laboratorio`, 0 Theme-Refs auf alten Slug (LL-058 Audit)
- PHP-Lint clean, 0 PHP-Errors beim Run

**S69 — Files NEU / MOD:**

- **NEU:** `sites/praxis-webseite/tools/s69-cluster-labor.php` (Cortex-Web-Repo, ~620 LOC, Pattern-Gen-2.1)
- **NEU:** `sites/praxis-webseite/_backups/s69/pre-s69-20260503-002001.sql` (Rollback-Point, 51 MB, gitignored)
- **NEU:** Auto-Memory `feedback_no_legacy_ballast_hard_delete.md` (cross-projekt Hard-Delete-Direktive)
- **MOD:** Auto-Memory `project_praxis_redesign_s63_resume.md` (S69-Stand)
- **MOD:** Theme-Code keine Änderung — Theme-HEAD bleibt `aba9982`
- **WP-DB:** 12 Pages gelöscht (inkl. WPML-Cascade trid 628 + 14740–14748), 30 neue Pages (10005–10034), 3 UPDATE auf 4843/4849/4855

**Cross-Cutting (LL-058) für Folge-Wellen:**

- **Pattern-Generation 2.1 ist die neue Standardform** für Cluster-Sweeps mit Cleanup-Anteil. Generation 2 (ohne Cleanup) bleibt für saubere Greenfield-Cluster.
- **Cleanup-Pflicht-Audit ist neuer Phase-1-Bestandteil:** vor jedem Cluster-Sweep verwaiste DE-Pages, Drafts, Importer-Müll, WPML-Waisen identifizieren. Live-Referenz-Audit pflichtig (grep + DB-Joins gegen Trunk-Daten).
- **Klasse-A-Hub-Update kann Slug-Migration enthalten:** wenn Bestand-Slug glossar-non-compliant ist (Beispiel ES `analiticas-de-sangre`), wird im UPDATE-Mode `slug_new` gesetzt — SEO-Risiko niedrig bei nicht-aktiven WPML-AT-Pages, Konsistenz-Gewinn hoch.
- **Verbindliche Arbeitsregel S66 voll umgesetzt:** Drift-Fix der historischen 2021-Pages erfolgt automatisch im selben Sweep wie die neuen Pages.

**S69 — Open Items / Folge-Punkte:**

- **χ unverändert:** Lokales `?lang=*`-Routing-Bug.
- **ψ unverändert:** Templates IT/pt-PT-Schicht erweitern.
- **κ verstärkt:** Trunk-i18n für `inc/data/page-hub-*.php` jetzt für **beide** Hubs Pflicht (`page-hub-labor.php` + `page-hub-untersuchungen.php`), weil Klasse-B-Detail-Pages aus Trunk rendern und der Trunk DE-only ist.
- **Folge-Wellen verbleibend:** Cluster-Sweep „Service" (~6 × 3 = 18 ops, ½ Session); Cluster-Sweep „Legal/Karriere" (~3 × 3 = 9 ops, ½ Session); IT+pt-PT je 78 Pages (blockiert durch ψ).
- **Native-Quality-Review** der 3 Hub-Updates (EN/FR/ES Volltexte zu `labor`, je ~3700 Z) optional vor Live-Deploy.
- **Carry-over S62 unverändert:** π/ρ/σ/τ.

**Nächste Front bei Wiederaufnahme S70:**
- (a) **Cluster-Sweep „Service"** (~6 Pages × 3 = 18 ops) — kleinster verbleibender Cluster, Pattern-Gen-2.1 wiederverwenden
- (b) Cluster-Sweep „Legal/Karriere" (~3 × 3 = 9 ops, ½ Session)
- (c) Templates IT/pt-PT erweitern (Folge-Punkt ψ) — Voraussetzung für IT/pt-PT-Wellen
- (d) Trunk-i18n `inc/data/page-hub-*.php` (Folge-Punkt κ) — für Render-Konsistenz Klasse-B-Pages aus S68 + S69
- (e) Diagnose χ (lokales Routing-Bug)
- (f) Native-Quality-Review der 3 Hub-Updates aus S69 (en/fr/es `labor`)

---


### Cold-Archiv — Sessions S53–S68 (Sliding-Window verlagert 2026-05-03)

| Session | Datum | Slug | Cold-Archiv |
|:---:|:---:|---|---|
| S68 | 2026-05-02 | Cluster „Untersuchungen" konsolidierter Sweep EN+FR+ES (51 Operationen) | [`_archive/sessions/2026-05/sessions-S53-S68-cold.md`](_archive/sessions/2026-05/sessions-S53-S68-cold.md) |
| S65–S67 | 2026-05-02 | Praxisgemeinschaft i18n-Welle EN+FR+ES | dito |
| S64 | 2026-05-02 | i18n-Stammdaten Reste auf 6 Sprachen | dito |
| S63 | 2026-05-02 | i18n-Redesign auf 6 Sprachen DE/EN/FR/ES/IT/pt-PT | dito |
| S62 | 2026-05-01 | Termin-Anfrage CTA + Mail-Modal mit IGeL-Hinweis | dito |
| S61 | 2026-05-01 | /praxis/ Lead schmaler + /karriere/ Container-Padding + Logo-Asset-Cleanup | dito |
| S60 | 2026-05-01 | Sammel-Sprint /praxis/ + Menü + /team/ + Detail-Pages | dito |
| S59a–d | 2026-05-01 | Praxis-Restruktur + Cobrand-Logo + Container-Breiten (PXZ 2.7.95–98) | dito |
| S58 | 2026-05-01 | Praxisgemeinschaft-Refresh + Reviews-Karussell | dito |
| S56 | 2026-05-01 | Homepage-Container + 5 Arzt-SEO + Sanexio-Co-Brand + LL-056 | dito |
| S55 | 2026-04-30 | Slider-Halbierung + Labor-Begriffe + Untersuchungen-Sweep | dito |
| S54 | 2026-04-29 | FINAL CTA entfernt | dito |
| S53 | 2026-04-29 | Standorte-Container vereint (Layout A, Padding +20%) | dito |

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

> **Stand Session-29-Einstieg (2026-04-27 oder später):** PXZ 2.7.68 läuft. Content-Migration **wesentlich abgeschlossen**. Heute (S28) drei Themen abgearbeitet: Stats-Hero-Move + Mitarbeiter-PDF + Ärzte-Container-Width.
>
> **PFLICHT vor allem anderen — SESSION_RESUME-Rotation (LL-044.21.2):**
> Diese Datei ist mit 81 KB an der Hard-Warn-Schwelle. Erste Aufgabe der Folgesession ist, die historischen §1-Blöcke (Session 26 + 25 + 24 + 19 + 18 + 17 + alles davor) nach `_archive/sessions/2026-04/SESSION_RESUME-snapshot-vor-rotation.md` zu schieben und §1 auf Session 27 + 28 zu reduzieren. Erst danach Content-Arbeit.
>
> Welche Front nach Rotation?
>
> **A.** **Page-by-Page Content-Review fortsetzen** — Dr. Stracke nennt eine Page (Praxis? Sprechstunden? eine Service-Page? Diagnostik-Hub?), gemeinsamer Durchgang. **Bei Beurteilungs-PDF-Feedback der Mitarbeiter:** entweder direkt einarbeiten oder Sammeln und in einem Block einarbeiten.
> **B.** **Restlücken (L1-L3 + V1-V2) zuerst schließen** — Cleanup-Block aus Legacy-Inventur (~45 Min): carotis-duplex mergen, Saul-Dublette redirecten, cookie-richtlinie-eu löschen, FAQ-Accordion + Juvantis-Übernahme verifizieren.
> **C.** **2 offene Vault-Anweisungen** in `Nexus/_memory/pending-instructions.md` abarbeiten — vor dem Sessionstart sichten.
> **D.** **Andere Front** — z. B. Notfall-Footer, Responsive-Audit aus S46-Backlog, Sprint-1 SFTP-Push, Telefax-Entscheidung im Impressum.

Keine Code-Änderung vor expliziter Wahl. Memory-Regeln aktiv: Local-First-Workflow, Glossar-Pflicht in Tutorials (LL-051), Praxis-Content-Migration **wesentlich abgeschlossen** (Memory `project_praxis_full_content_migration.md`).

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
