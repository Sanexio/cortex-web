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

## §1 Stand & Version (gültig: 2026-05-03 Ende Session 69 — Cluster „Labor" 4-sprachig komplett + Pattern-Generation 2.1 mit Cleanup-Phase + LL-059 Hard-Delete-Direktive)

- **PXZ_VERSION:** **2.7.121** (Theme-Repo HEAD `aba9982`, unverändert seit S64 — S65–S69 sind reine DB-Operationen).
- **Cortex-Web HEAD:** S69 pending (Commit am Session-Ende).
- **WPML-Status:** 6 aktive Sprachen (DE/EN/FR/ES/IT/pt-PT) — unverändert.
- **Page-Inventar publish:** **DE 64 / EN 71 (+9 netto) / FR 70 (+9 netto) / ES 68 (+9 netto) / IT 0 / pt-PT 0**.
- **Skript-Pattern-Reife:** **5-fach validiert + Generation 2.1 etabliert** (S69 erweitert Pattern-Gen-2 um optionale Cleanup-Phase mit Hard-Delete).
- **Neue Memory-Regel:** Hard-Delete statt Trash bei DB-/Page-Cleanups (`feedback_no_legacy_ballast_hard_delete.md`, cross-projekt).
- **Wiederaufnahme-Marker:** Auto-Memory `project_praxis_redesign_s63_resume.md` auf S69-Stand aktualisiert.

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

### S68 (2026-05-02) — Cluster „Untersuchungen" Konsolidierter Sweep EN+FR+ES (51 Operationen)

**Auslöser:** Wiederaufnahme nach S67. Aus dem 5-Optionen-Statement (α=EN-Welle Untersuchungen mit Update-Mode / β=Pattern-Doku ω / γ=Templates IT/pt-PT / δ=Diagnose χ / ε=Native-Quality-Review) Direktive Dr. Stracke: „setze selbstständig fort" → Front α (EN-Welle Untersuchungen + Update-Mode-Skript-Erweiterung) gewählt mit Eskalation zum konsolidierten EN+FR+ES-Sweep, weil Pattern-Generation 2 das in einer Session erlaubt und die verbindliche Arbeitsregel S66 „pro Cluster-Sweep auch FR/ES-Drift mit-fixen" damit umfassender umgesetzt wird.

**Phase-1-Verständnis (Klassifikations-Audit):**
17 DE-Pages des Clusters (gemäß `nav-data.php` `$unt_match_prefix`): Hub `untersuchungen` (1) + Ultraschall-Gruppe (8: echokardiographie, carotis-duplex, schilddruese, sonographie, bauchspeicheldruese, nieren, prostata, leber) + Funktion-Gruppe (3: belastungs-ekg, lungenfunktion, eye-check) + Check-Up-Gruppe (5: body-check, sono-check, komplett-check, kardio-check, fit-for-diving). WPML-Lage zeigt klare 2-Klassen-Trennung:
- **Klasse A (UPDATE, 6 Pages, alle 2021er):** sonographie, belastungs-ekg, lungenfunktion, echokardiographie, carotis-duplex, schilddruese — DE existiert als 2021er-Original, EN/FR/ES als WPML-AT-Bestand mit Drift (z. B. Lungenfunktion FR 6596 Z vs DE 2320 Z).
- **Klasse B (BRIDGE, 11 Pages, alle 2026er):** Hub + 4 Sonographie-Sub (DE-IDs 9840–9843, alle template-detail-page.php mit `clen=0`) + 5 Check-Ups (9844–9848, dito) + eye-check (9849, dito). Hub 9682 hat 283 Z DE-Inhalt (template-untersuchungen-hub.php).

**Phase-2-Spec-Konsens:**
Konsolidiertes Skript `tools/s68-cluster-untersuchungen.php` (Pattern-Generation 2, Multi-Lang + Multi-Mode in einem Skript). Klasse A bekommt `wp_update_post`-basierten UPDATE (Slug erhalten für SEO, post_content + post_title überschrieben). Klasse B bekommt Direct-DB-Insert (Slug invariant zu DE, content leer ausser Hub). Beide Modes idempotent. Glossar-Compliance aus `nav-data.php` für Titles. Volltext-Übersetzungen für 6 Klasse-A + Hub × 3 Sprachen = 21 Volltexte.

**Phase-3-Umsetzung:**

`sites/praxis-webseite/tools/s68-cluster-untersuchungen.php` (1160 LOC, idempotent, `--commit` + `--lang=en|fr|es` Filter). DB-Backup: `_backups/s68/pre-s68-20260502-233038.sql` (51 MB, gitignored). Dry-Run-Plan zeigt 51 PLAN-Operationen (33 BRIDGE + 18 UPDATE), Commit-Run ergibt 33 CREATED + 18 UPDATED.

**51 Operationen — neue Page-IDs (Klasse B BRIDGE):**

| trid | DE-Slug | DE-ID | EN-ID | FR-ID | ES-ID | Übersetzungstiefe |
|---:|---|---:|---:|---:|---:|---|
| 1134 | untersuchungen (Hub) | 9682 | 9972 | 9973 | 9974 | Title + 273-315 Z Inhalt je Sprache |
| 14721 | bauchspeicheldruese | 9840 | 9975 | 9976 | 9977 | Title only (Pancreas/Pancréas/Páncreas), `clen=0` |
| 14722 | nieren | 9841 | 9978 | 9979 | 9980 | Title only |
| 14723 | prostata | 9842 | 9981 | 9982 | 9983 | Title only |
| 14724 | leber | 9843 | 9984 | 9985 | 9986 | Title only |
| 14725 | body-check | 9844 | 9987 | 9988 | 9989 | Title invariant „Body Check" |
| 14726 | sono-check | 9845 | 9990 | 9991 | 9992 | Title invariant „Sono Check" |
| 14727 | komplett-check | 9846 | 9993 | 9994 | 9995 | Complete Check / Examen complet / Examen completo |
| 14728 | kardio-check | 9847 | 9996 | 9997 | 9998 | Cardio Check (alle 3 invariant) |
| 14729 | fit-for-diving | 9848 | 9999 | 10000 | 10001 | Fit for Diving (alle 3 invariant) |
| 14730 | eye-check | 9849 | 10002 | 10003 | 10004 | Eye Check (alle 3 invariant) |

**18 UPDATEs (Klasse A Drift-Fix):**

| trid | DE-Slug | DE-ID | EN-ID | FR-ID | ES-ID | Drift-Befund (alt → neu, Bytes) |
|---:|---|---:|---:|---:|---:|---|
| 540 | sonographie | 277 | 4904 | 4899 | 4895 | EN 5129→2393 / FR 5692→2739 / ES 5332→2639 |
| 545 | belastungs-ekg | 289 | 4887 | 4883 | 4879 | EN 1449→1949 / FR 1618→2235 / ES 1619→2089 |
| 548 | lungenfunktion | 292 | 4875 | 4869 | 4863 | EN 5882→2195 / FR **6596→2345** / ES 6410→2326 |
| 575 | echokardiographie | 351 | 4761 | 4754 | 4701 | EN 3119→2462 / FR 3632→2770 / ES 3470→2654 |
| 578 | carotis-duplex | 354 | 4749 | 4745 | 4695 | EN 1991→965 / FR 2115→1072 / ES 2101→1060 |
| 581 | schilddruese | 357 | 4741 | 4737 | 4691 | EN 2851→1586 / FR 3313→1784 / ES 3182→1743 |

**Thumbnail-Sync (Folge-Op nach Skript):** `_thumbnail_id` für 3 Klasse-A-Trids mit Bild gesynct auf DE-Wert: Sonographie EN/FR/ES alle auf 4001, Belastungs-EKG auf 4120, Lungenfunktion auf 4128. Echokardiographie/Carotis/Schilddrüse haben keine Thumbnails (NULL → keine Op nötig).

**Phase-4-Smoke-Tests (alle ✅):**
- 51 ops Aggregate: 33 CREATED + 18 UPDATED, 0 ERROR / 0 WARN
- Inventar publish: DE 64 / EN 62 / FR 61 / ES 59 (+11 pro EN/FR/ES bestätigt)
- Idempotenz Re-Run: 33 EXISTS (Bridge skip) + 18 UPDATED (Update byte-identical re-write) — Inventar stabil
- Cluster-Trid-Lage: alle 17 trids haben jetzt 4 Sprachen (DE+EN+FR+ES)
- Klasse-B-Slug-Identität: alle 11 BRIDGE-Pages haben DE-Slug ✅
- Klasse-A-Slug-Erhalt: alle 6 UPDATE-Pages behalten lokalisierte 2021er-Slugs ✅
- Drift-Befund Lungenfunktion FR-ID 4869 verifiziert: vorher 6596 Z + Thumbnail 4130, jetzt 2345 Z + Thumbnail 4128 (DE-konsistent)
- PHP-Lint: clean (keine Syntax-Errors)
- 0 PHP-Errors beim Insert/Update

**S68 — Files NEU / MOD:**

- **NEU:** `sites/praxis-webseite/tools/s68-cluster-untersuchungen.php` (Cortex-Web-Repo, 1160 LOC, Pattern-Gen-2)
- **NEU:** `sites/praxis-webseite/_backups/s68/pre-s68-20260502-233038.sql` (Rollback-Point, 51 MB, gitignored)
- **MOD:** `Nexus/_memory/patterns/wpml-bridge-cluster-import.md` (Pattern ω erweitert: Generation-2-Doku, Update-Mode, Klassifikations-Audit)
- **MOD:** Theme-Code keine Änderung — Theme-HEAD bleibt `aba9982`
- **WP-DB:** 33 neue Pages (9972–10004), 33 neue `wp_icl_translations`-Einträge, ~250 neue/aktualisierte `wp_postmeta`-Einträge

**Cross-Cutting (LL-058) für Folge-Wellen:**

- **Pattern-Generation 2 ist die neue Standardform für Cluster-Sweeps:** ein Skript für alle Sprachen + Update-Mode für Drift-Fix. Generation 1 (single-lang) bleibt für isolierte Sprach-Wellen verfügbar.
- **Verbindliche Arbeitsregel S66 voll umgesetzt:** Drift-Fix der historischen 2021-Pages erfolgt automatisch im selben Sweep wie die neuen Pages. Native-Review der gefixten Pages bleibt als optionaler Folge-Punkt offen (kein Sprint nötig — Translations sind glossar-compliant und DE-getreu).
- **Klasse-B-Inhalts-Folge-Punkt:** 11 Klasse-B-Pages haben Bridge mit `clen=0`. Die zugehörigen Renderer (`template-detail-page.php`) ziehen Inhalt aus Trunk (`inc/data/page-hub-*.php`). Trunk ist noch DE-only — i18n des Trunks ist Punkt #9 im Memory-Plan.

**S68 — Open Items / Folge-Punkte:**

- **χ unverändert:** Lokales `?lang=*`-Routing-Bug.
- **ψ unverändert:** Templates IT/pt-PT-Schicht erweitern (Voraussetzung für IT/pt-PT-Wellen).
- **ω abgeschlossen:** Pattern-Doku 4-fach validiert + Generation 2 dokumentiert.
- **NEU κ:** Trunk-i18n für `inc/data/page-hub-*.php` (für Klasse-B-Render-Konsistenz EN/FR/ES). Aktuell zeigen die Klasse-B-Detail-Pages den DE-Trunk-Inhalt.
- **Folge-Wellen verbleibend:** Cluster-Sweep „Labor + Check-Ups" (~17 × 3 = 51 ops); Cluster-Sweep „Service" (~6 × 3 = 18 ops); Cluster-Sweep „Legal/Karriere" (~3 × 3 = 9 ops); IT+pt-PT je 78 Pages (blockiert durch ψ).
- **Carry-over S62 unverändert:** π/ρ/σ/τ.

**Nächste Front bei Wiederaufnahme S69:**
- (a) **Cluster-Sweep „Labor + Check-Ups"** (~17 Pages × 3 = 51 ops) via Generation-2-Skript-Klon `s69-cluster-labor.php`
- (b) Cluster-Sweep „Service" (kleiner, ~6 × 3 = 18 ops, ½ Session)
- (c) Cluster-Sweep „Legal/Karriere" (kleinster, ~3 × 3 = 9 ops, ½ Session)
- (d) Templates IT/pt-PT erweitern (Folge-Punkt ψ) — Voraussetzung für IT/pt-PT-Wellen
- (e) Trunk-i18n `inc/data/page-hub-*.php` (Folge-Punkt κ) — für Render-Konsistenz Klasse-B-Pages
- (f) Diagnose χ (lokales Routing-Bug)
- (g) Native-Quality-Review der 18 Klasse-A-Updates aus S68

---

### S65–S67 (2026-05-02) — Praxisgemeinschaft i18n-Welle (EN+FR+ES) — Cold-Archiv

> Detailliert in [`_archive/sessions/2026-05/sessions-65-67-praxisgemeinschaft-i18n-welle.md`](../../_archive/sessions/2026-05/sessions-65-67-praxisgemeinschaft-i18n-welle.md). Anchors: [#s65](../../_archive/sessions/2026-05/sessions-65-67-praxisgemeinschaft-i18n-welle.md#s65), [#s66](../../_archive/sessions/2026-05/sessions-65-67-praxisgemeinschaft-i18n-welle.md#s66), [#s67](../../_archive/sessions/2026-05/sessions-65-67-praxisgemeinschaft-i18n-welle.md#s67).

12 Pages je Sprache (IDs 9936–9971), single-language Bridge-Skript pro Sprache (`tools/s65-en-…`, `tools/s66-fr-…`, `tools/s67-es-…`). Pattern-Reife: 3-fach validiert nach S67. Verbindliche Arbeitsregel S66: Drift-Fix historischer 2021-Pages ist im Cluster-Sweep mit-zu-erledigen — voll umgesetzt in S68.


### S64 (2026-05-02) — i18n-Stammdaten Reste auf 6 Sprachen

**Auslöser:** Wiederaufnahme nach S63. Front A der drei Front-Optionen aus dem
Architekten-Statement: Stammdaten-Reste komplett abschließen, bevor Page-Cluster-
Übersetzungen oder Native-Review kommen.

**Phase-2-Spec freigegeben** (Architekten-Modus):
- Pattern wiederverwendet: `pxz_<file>_strings($lang)` returnt `[lang => …]`,
  Render liest `pxz_current_lang()` (DE-Fallback). Bestätigt durch S63-Files.
- AJAX-Sprach-Tracking: Hidden-Field `<input name="lang">` snapshot-tet
  Patient-Sprache; Whitelist `[de,en,fr,es,it,pt-pt]` im Handler.
- Mail-Strategie: Praxis-Mail bleibt deutsch (mit Sprach-Marker im Header),
  Patient-Bestätigung in Patient-Sprache.
- Canonical-URLs: `apply_filters('wpml_permalink', ...)` für nicht-DE; DE
  bleibt hardkodiert. JSON-LD-`name`-Felder bleiben deutsch (Praxisname ist
  sprach-invariant).
- Bewusst aus Scope: Page-Hub-Daten (`inc/data/page-hub-*.php`) bleiben DE —
  gehören zur Page-Cluster-Welle.

**Erreicht in dieser Session:**

1. **`inc/seo-data.php`** — neuer Helper `pxz_seo_localize($de_data, $i18n)`
   legt eine Title/Description-Schicht über die DE-Defaults. Alle 25 Page-
   Lookups liefern jetzt 6-sprachig: praxis, team, 6 Check-Up-Pages,
   leistungen, impfungen, 8 Diagnostik-Pages, doctor (Template-basiert),
   404. Canonical via `wpml_permalink`-Filter. JSON-LD-`availableLanguage`
   auf `['de','en','fr','es','it','pt']` erweitert.
2. **`inc/service-forms.php`** — vier-schichtige Lookup-Architektur:
   `pxz_service_forms_strings()` (Form-Level), `_field_strings()` (Field-Level),
   `_ui_strings()` (Errors/UI/Mail), `_field_schema()` (sprach-invariantes
   Field-Schema mit Type/Required/Min/Max). `pxz_service_forms_definitions($lang)`
   setzt zusammen. Renderer mit `lang`-Hidden-Field, AJAX-Handler validiert
   gegen Whitelist, sendet Praxis-Mail DE und Patient-Confirmation in
   Patient-Sprache.
3. **`inc/termin-anfrage.php`** — `pxz_termin_strings($lang)` mit ~60
   Schlüsseln/Sprache (Trigger-Label, Modal-Header, IGeL-Hinweis,
   Form-Labels, Versicherungs-/Anrede-Optionen, Datenschutz-Text,
   Submit-Buttons, Erfolgs-Block, Validation-Errors, Confirmation-Mail-
   Text inkl. IGeL/GKV/PKV-Klausel-Übersetzung). Modal komplett aus
   String-Tabelle gerendert. Honeypot-Label und Doctolib-Label
   sprachvariant.
4. **`functions.php`** — `PXZ_VERSION` 2.7.120 → **2.7.121**.
5. **`CHANGELOG.md`** — Eintrag `[2.7.121] — S64 — i18n-Stammdaten Reste`.

**Smoke-Tests grün** (Phase-4-Selbstprüfung):
- PHP-Lint clean auf 5 geänderten Files.
- 6 Sprachen × 6 Service-Forms × 2 Assertions = **72 PASS / 0 FAIL**.
- 6 Sprachen × 8 SEO-Pages × 2 Assertions = **96 PASS / 0 FAIL**.
- 6 Sprachen × 8 Termin-Modal-Schlüssel = **48 PASS / 0 FAIL**.
- Kein PHP-Error im CLI-Stub-Run.

**S64 — Files NEU / MOD:**
- **MOD:** `inc/seo-data.php` (490 → 800+ Z), `inc/service-forms.php`
  (499 → 1500+ Z), `inc/termin-anfrage.php` (516 → 1050+ Z),
  `functions.php` (Version-Bump), `CHANGELOG.md` (S64-Eintrag).
- **Theme-Commit:** `aba9982` „feat(s64): i18n stammdaten — seo-data +
  service-forms + termin-anfrage on 6 languages (PXZ 2.7.120 → 2.7.121)".

**Nächste Front bei Wiederaufnahme:** Page-Cluster-Übersetzungen.
- Option B (priorisiert in S63-Resume): EN-Welle 25 Pages, Cluster-weise
  (Praxisgemeinschaft → Untersuchungen → Labor → Service → Legal/Karriere).
- Option C: Native-Quality-Review der 23 bestehenden EN/FR/ES-Pages —
  Glossar-Konsistenz prüfen.
- Option D: WPML-String-Translation für hartkodierte Theme-Strings in
  Templates.
- **Carry-over aus S62:** π Browser-Smoke-Test, ρ SMTP-Brücke Live,
  σ Datenschutz-Slug-Verifikation, τ Tutorial WP-Theme-AJAX.

---

### S63 (2026-05-02) — i18n-Redesign auf 6 Sprachen (DE/EN/FR/ES/IT/pt-PT)

**Auslöser (Dr.-Stracke-Direktive):** Komplette Webseite in alle Sprachen übersetzen — patientengetrieben (portugiesische + italienische Bestandspatienten in Frankfurt-Westend).

**Strategische Entscheidungen** (Phase 2):
- E1: Engine = **Claude direkt**, kein DeepL Pro (medizinischer Kontext + HWG-Konformität + Sie-Form-Konsistenz schlagen DeepLs Wort-für-Wort-Ansatz; spart 25–50 €/Monat WPML-AT-Subscription)
- E2: Tooling = **WPML als reiner Strukturträger** (Sprach-Switcher + Page-Duplizierung), keine WPML-AT-Subscription
- E3: Reihenfolge = **sequentiell pro Sprache** EN→FR→ES→IT→PT, Cluster-weise innerhalb einer Sprache
- E4: PT-Variante = **pt-PT** (europäisches Portugiesisch); pt-BR optional als spätere 7. Sprache

**Erreicht in dieser Session:**

1. **Nexus-Sync-Divergenz gelöst** — 4 lokale Commits + 1 Remote-Commit gemerged ohne Konflikt, Backup-Tag `pre-merge-2026-05-02-cm02` gesetzt
2. **`inc/i18n-glossary.php` (NEU)** — Single Source of Truth für 92 medizinisch-juristische Begriffe × 6 Sprachen mit Helper `pxz_g($key, $lang)`. Sektionen: Praxis-Identität, Personal & Rollen, Versicherung & Abrechnung, Termine, Untersuchungen, Sonographie-Organe, Check-Ups, Labor, Befund/Dokumente, Vorsorge, Service, Legal, Karriere, Geographie, UI/CTAs, Form-Felder. **Wichtig:** „Praxisgemeinschaft" → EN „shared medical practice" (NICHT „joint practice" — andere Rechtsform).
3. **WPML auf 6 Sprachen erweitert** — IT + pt-PT in `wp_icl_languages` aktiviert + `icl_sitepress_settings.active_languages` umgestellt + Cache geflusht. `$sitepress->get_active_languages()` liefert jetzt 6 Einträge.
4. **8 Stammdaten-Dateien auf 6 Sprachen erweitert:**
   - `inc/nav-data.php` (Top-Nav 4 Items + 3 Mega-Menus mit jeweils 3 Gruppen)
   - `inc/footer-data.php` (Tagline, Claim, Col-Labels, Legal-Nav, Copyright, Appointment-CTA)
   - `inc/practice-data.php` (Adressen, Sprechzeiten, Telefon-Labels, U-Bahn-Codes, Open-Clinic-Section)
   - `inc/homepage-data.php` (Hero, MFA-Block, Stats, 8 Specialties, Team-Roles, Service-Tiers, Reviews, Footer-Cols, Anchor-Nav)
   - `inc/team-data.php` (`pxz_render_other_doctors()` Renderer mit Sprach-String-Tabelle)
   - `inc/diagnostik-data.php` (Refactor von DE-only auf 6-Sprachen-Tabelle für 4 Categories + 3 Sono-Children)
   - `inc/cookie-consent.php` (Refactor mit `pxz_cookie_consent_strings()` + Render-Funktion liest Sprache pro Request)
5. **2 Files geprüft → kein Edit nötig:** `inc/specialty-icons.php` (nur Icon-Mapping), `inc/homepage-slider-data.php` (Block-Aggregation aus WPML-Pages)
6. **`functions.php`** — PXZ_VERSION 2.7.119 → 2.7.120 + Glossar-Include vor allen anderen `inc/`-Datendateien
7. **Naming-Decision:** Bestehende `pxz_t($key, $default)` ist WPML-`icl_t()`-Wrapper. Glossar-Helper heißt **`pxz_g()`** (kein Konflikt). Architektur dokumentiert im Glossar-File.

**Lücken-Inventar (für Folge-Sessions):**
- Stammdaten verbleibend: `seo-data.php` (~490 Z, 25+ Pages), `service-forms.php` (~499 Z, 4+ Forms), `termin-anfrage.php` (~516 Z, Modal+Mailing)
- Page-Übersetzungen: 25 EN + 26 FR + 28 ES + 78 IT + 78 pt-PT = **235 Page-Übersetzungen**
- Native-Quality-Review der 23 bestehenden EN/FR/ES-Pages
- WPML-String-Translation für hartkodierte Theme-Strings in Templates

**Smoke-Test grün:** PHP-Syntax aller 8 Files clean, Cross-File-Test über alle 6 Sprachen (Top-Nav + Footer-Tagline + Hero + Practice-Phone + Cookie-Button) zeigt korrekte Lookups.

**Nächste Front bei Wiederaufnahme:** Either (a) Stammdaten-Reste seo-data + service-forms + termin-anfrage → vollständiges Theme-i18n; oder (b) direkt zu Page-Cluster-Übersetzungen EN-Welle (Cluster Praxisgemeinschaft).



### S62 (2026-05-01) — Termin-Anfrage CTA + Mail-Modal mit IGeL-Hinweis

**Auslöser (Dr.-Stracke-Direktive):** Termin-Buttons auf Untersuchungs- und
Labor-Seiten prominenter machen, Corporate-Rot statt Schwarz, nach Klick
individualisierte Mail-Anfrage mit Telefonnummer-Eingabe + Untersuchungs-
Zusammenfassung + GKV/PKV-Erstattungs-Hinweis.

**Spec-Achsen freigegeben** (Phase 2):
- A2 Hubs + alle Detail-Pages (Untersuchungen, Labor, Diagnostik,
  Sonographie, Check-Ups, Bridge)
- B2 neue Klasse `.pxz-btn-cta-termin` (rot, größer, Pfeil-Icon, Pulse-Glow)
- C1 eigenes Theme-Form (PHP + AJAX + `wp_mail()`) — kein Plugin-Lock-in
- D1 Modal-Overlay statt Sub-Page
- E1 IGeL-Bestätigung als Pflicht-Checkbox
- F2 Mail-CTA + Doctolib + Telefon koexistieren
- Wunschtermin als freies Textfeld

**Umsetzung in 5 Bausteinen:**

1. **`inc/termin-anfrage.php`** (NEU) — Helper `pxz_termin_cta_pair($slug)`
   rendert Trigger-Button + Companions, `pxz_termin_get_untersuchung_data()`
   holt Title/Eyebrow/Lead aus `inc/data/page-hub-<slug>.php` mit WP-Postmeta-
   Fallback, `pxz_termin_render_modal()` hängt das Modal-HTML via
   `wp_footer`-Hook nur dort an, wo der CTA tatsächlich rendert (Static-Flag).
   AJAX-Handler `wp_ajax_pxz_termin_submit` (+ `nopriv`-Variante) validiert
   serverseitig, prüft Honeypot + Nonce, sendet Plain-Text-Mail an
   `PXZ_EMAIL` mit individualisiertem Betreff `[Terminanfrage] <Untersuchung>
   — <Patient>` und strukturiertem Body (Untersuchung · Patient · Bestätigungen
   · GKV/PKV-Hinweis je nach Versicherungsart). Reply-To = Patient. Zusätzliche
   Bestätigungsmail an Patient mit Untersuchungs-Zusammenfassung + IGeL-
   Hinweis.
2. **`assets/css/termin-anfrage.css`** (NEU) — `.pxz-btn-cta-termin`:
   Corporate-Rot `#C8161D`, 52 px Mindesthöhe, 1.05/2 rem Padding,
   `border-radius: 9999px`, Box-Shadow-Stack 6/18 + 2/6 px in 45/25 % Logo-Rot,
   Pfeil-Icon mit `translateX(3px)` on hover, Pulse-Glow-Animation 2.6 s
   Cycle (Box-Shadow 0 → 8 px Spread, deaktiviert bei Hover/Focus und bei
   `prefers-reduced-motion: reduce`). Modal-Stack: Overlay (rgba 0,0,0,0.55
   + backdrop-blur 4 px), Dialog (max 640 px, border-radius 22 px, Slide-up-
   In-Animation), Form-Grid (2 Spalten ab 521 px).
3. **`assets/js/termin-anfrage.js`** (NEU) — vanilla, kein jQuery. Liest
   `data-pxz-termin-*` Attribute beim Trigger-Click, befüllt Vorschau-Block
   + Hidden-Inputs, öffnet Modal mit Focus-Trap und Escape-Key-Handler,
   sendet Form per `fetch()` an `admin-ajax.php`. HTML5-Validity-Check vor
   Submit. Erfolgs-Block ersetzt das Form, Fehler erscheint inline.
4. **`functions.php`** — `PXZ_VERSION` 2.7.102 → **2.7.103**, neue
   Enqueue-Bedingung für sechs Templates (`template-untersuchungen-hub`,
   `-labor`, `-diagnostik-hub`, `-checkup-hub`, `-bridge-product`,
   `-detail-page`), `wp_localize_script` für `pxzTermin.ajaxUrl`,
   `require_once inc/termin-anfrage.php`.
5. **CTAs umgestellt:**
   - `template-parts/page-hub-renderer.php`: Hero-CTA + `cta-banner`-Section
     rufen `pxz_termin_cta_pair($page_hub_data['slug'])` (vorher
     `.pxz-btn-primary` schwarz + Doctolib-URL). Hero-CTA erscheint jetzt
     auch auf Hubs ohne Image (vorher unterdrückt).
   - `template-checkup-hub.php`: Bottom-CTA-Block.
   - `template-diagnostik-hub.php` (Sub-Hub `/sonographie/`): Bottom-CTA-Block.
   - `template-bridge-product.php`: zusätzliche Sektion „Lieber direkt in
     der Praxis?" mit Termin-Pair (Cross-Brand-CTA zu Sanexio bleibt).

**Form-Felder:** Anrede (optional), Vorname *, Nachname *, Telefon * (wird
explizit als Rückruf-Feld kommuniziert), E-Mail *, Versicherung *
(GKV / PKV / Selbstzahler), Wunschtermin (freies Textfeld), Anmerkung,
IGeL-Bestätigung *, Datenschutz-Einwilligung *. Honeypot `company_url`
+ WP-Nonce gegen Bot/CSRF.

### S62 — Files NEU / MOD

- **NEU:** `inc/termin-anfrage.php`, `assets/css/termin-anfrage.css`,
  `assets/js/termin-anfrage.js`, `Nexus/_memory/patterns/wp-modal-mail-cta-individualized.md`.
- **MOD:** `functions.php` (Version-Bump + Enqueue + Require),
  `template-parts/page-hub-renderer.php` (Hero + Banner CTAs),
  `template-checkup-hub.php`, `template-diagnostik-hub.php`,
  `template-bridge-product.php`, `CHANGELOG.md`.
- **Lokal-Datenschutz-Slug:** `/datenschutzerklaerung/` verwendet
  (lokal verifiziert via `wp post list`). Falls Live-URL anders ist
  (z. B. `/datenschutz/` oder `/privacy-policy/`), in `inc/termin-anfrage.php`
  ändern.

### S62 — Smoke-Test grün

| Page | Trigger | Modal | PHP-Errors |
|------|---------|-------|-----------|
| `/untersuchungen/` | 2 | 1 | 0 |
| `/labor/` | 2 | 1 | 0 |
| `/sonographie/` | 2 | 1 | 0 |
| `/belastungs-ekg/` | 2 | 1 | 0 |
| `/lungenfunktion/` | 2 | 1 | 0 |
| `/echokardiographie/` | 2 | 1 | 0 |
| `/labor/status-baseline/` | 2 | 1 | 0 |
| `/basic-check/` | 1 | 1 | 0 |

PHP-Lint clean auf allen 6 geänderten/neuen PHP-Files. Alte
`.pxz-btn-primary` für Termin-Zwecke nirgends mehr in den
betroffenen Untersuchungs-Templates.

### S62 — Bestands-Befunde (NICHT durch S62 verursacht)

- `/diagnostik/` macht 301 → `/untersuchungen/` (S49d-Restruktur, vorbestehend).
- `/check-ups/` (Page-ID 461) liegt im **Trash**. Template-Code ist bereit;
  Wiederherstellung der Page entscheidet Dr. Stracke. Falls die Page-Hub-
  Funktion gewollt ist: `wp post status 461 publish` reicht.

### S62 — Open Items / Folge-Punkte

- **π NEU:** Browser-Smoke-Test durch Dr. Stracke (Modal öffnen, Form
  abschicken, Pulse-Animation visuell prüfen, Mobile-Responsive).
- **ρ NEU:** **SMTP-Brücke auf Live** prüfen. `wp_mail()` ohne SMTP-Plugin
  geht auf Domainfactory typisch ins Leere. Empfehlung: WP Mail SMTP
  installieren + via App-Password gegen `praxis@westend-hausarzt.de`
  konfigurieren. Lokal genügt MailHog/Mailpit (LBF eingebaut).
- **σ NEU:** Datenschutz-Slug Live verifizieren (`wp_remote_get` oder
  Browser auf `https://westend-hausarzt.com/datenschutzerklaerung/`).
- **τ NEU:** Tutorial-Eintrag „WordPress Theme-AJAX + wp_localize_script"
  in `Second Brain/30 Tutorials/WordPress/WordPress Grundlagen.md`
  ergänzen (LL-022). Pattern-File ist da, Tutorial-Eintrag offen.
- **µ erweitert:** Sammel-Commit-Empfehlung jetzt für **S60a–l + S61 + S62**.
  Theme-Repo-`git status` zeigt ~50 Files (40 vorher + 8 S62). Plus
  3 NEW-Files für S62. Plus `pattern wp-modal-mail-cta-individualized.md`
  in Nexus (Tier-1, separat).
- **ο, α–δ, ν, ξ unverändert** (Logo /praxis/-Hero, Doctolib-Direktlinks,
  Page-Review/Sie-Form, eye-check Praxis-eigenes Bild, Detail-Hero-Bilder
  vs. Sanexio-Original, EN/FR/ES-Native-Review).
- **θ unverändert:** GLOBAL_RULES.md HARD-WARN (14 k / 12 k Tokens).

### S61 (2026-05-01) — /praxis/ Lead schmaler + /karriere/ Container-Padding + Logo-Asset-Cleanup

- **/praxis/ Hero-Lead:** in 4 Sprachen inhaltlich von ~322 auf ~165 Zeichen gekürzt (Kernaussage: Hausarztpraxis Stracke + 8 Fachbereiche + Spezialist im selben Flur). Zusätzlich `.pxz-pg-lead { max-width: none }` (S60c) → `max-width: 75ch` (= `.pxz-sect-intro`-Pattern), damit der Lead optisch zu den restlichen Section-Intros passt. **Reverse von S60c-Entscheidung** — Dr. Stracke wollte Lead schmaler statt voll-bleed.
- **/karriere/ Form-Container:** `.pxz-kar-form-wrap` hatte `padding-top: 0`, Card klebte am Hero. Neu: `32 / 40 / 48 px` (Mobile/Tab/Desktop) — analog zur Skala der bestehenden Hero-Bottom-Padding-Werte.
- **Logo-Cleanup im Theme:** `assets/logo.png`, `assets/logo-icon.png`, `assets/logo-sanexio-compact.svg` via `git rm` entfernt. Grep-verifiziert: 0 Refs in PHP/CSS/JS/JSON/HTML/MD. Übrig: `logo.svg` (Praxis-Stempel, Header/Footer/`/praxis/`-Hero) + `logo-sanexio.svg` (Sanexio-Wordmark, Header-Sanexio-Slot/Cross-Brand-CTA). Auslöser: Dr. Stracke wies auf falsches Logo im `/praxis/`-Hero hin → Asset-Inventur ergab 3 ungenutzte Datei-Karteileichen.

### S61 — Files NEU / MOD / DEL

- **MOD:** `template-praxisgemeinschaft.php` (4 Lead-Strings DE/EN/FR/ES), `assets/css/praxisgemeinschaft.css` (`.pxz-pg-lead` max-width), `assets/css/karriere.css` (`.pxz-kar-form-wrap` padding-top 3 Breakpoints).
- **DEL:** `assets/logo.png`, `assets/logo-icon.png`, `assets/logo-sanexio-compact.svg` (alle git-getrackt → revertierbar).
- **WP-DB / Uploads:** unverändert.

### S61 — Open Items / Folge-Punkte

- **ο NEU:** Korrektes Logo für `/praxis/`-Hero noch ungeklärt — aktuell weiter `logo.svg` (Stracke-Stempel). Dr. Stracke wollte das Logo wechseln, hat aber „erstmal egal" gesagt und stattdessen den Asset-Cleanup priorisiert. Frage offen: Soll im Hero `logo-sanexio.svg`, eine neue Praxisgemeinschafts-Datei oder gar kein Logo? Bei nächster Session ansprechen.
- **µ verändert:** Sammel-Commit-Empfehlung jetzt für **S60a–l + S61** (statt nur S60). 4 Files MOD + 3 DEL aus S61 oben drauf.
- **α–δ, ν, ξ unverändert** (Doctolib · Page-Review · eye-check Praxis-eigenes Bild · S52-Builder-Output · andere Detail-Hero-Bilder · EN/FR/ES-Native-Review).
- **θ unverändert:** GLOBAL_RULES.md HARD-WARN (14 k / 12 k Tokens, vorbestehend seit S56).

### S61 — Smoke-Tests

Lokale Edits, kein Browser-Test in dieser Session. Erwartetes Verhalten: `/praxis/`-Lead jetzt zentrierter Block (75ch ≈ 56 rem), `/karriere/`-Card mit sichtbarem Abstand zum Hero, gelöschte Logos nirgends 404 (waren ungenutzt). **Verifikation bei nächstem Browser-Reload mit Hard-Refresh (Cmd+Shift+R).**



### S60 (2026-05-01) — Sammel-Sprint /praxis/ + Menü + /team/ + Detail-Pages

**S60a–c — /praxis/ Content-Aufbau + Container-Rhythm:**
- Lead/Story komplett neu, patientenzentriert (alle gewerblichen Begriffe raus: Kostengemeinschaft, BGB, Fixkosten, Outsourcing, Klinik-Niveau).
- Lead + Story-Body von `max-width: 75ch` → `max-width: none` (= Homepage `.pxz-hero-sub`-Pattern, voll-bleed).

**S60d — /praxis/ Logo + 8 Vorteile + Menü-Restruktur:**
- Hero-Logo der Praxisgemeinschaft (`assets/logo.svg`, CSS-Background-Crop wie nav.css, 96/120/160 px responsive).
- Story auf 2 Sätze: Schwerpunkte (Innere Medizin · Notfallmedizin · hausärztlich) + Tech-Liste (Sonographie, Spiroergometrie, Schlafapnoe, Lungenfunktion, Langzeit-EKG/-RR, Labor) + Internat. Patienten.
- Spec-Intro auf 2 Sätze (Wortlaut Dr. Stracke).
- Vorteile 6 → **8** (Symmetrie 2×4 auf XL): + Offene Sprechstunde 11–12, + Termine online buchen, + International Patients.
- SEO via `inc/seo-data.php → pxz_seo_data_praxis()` neu + `wp_aioseo_posts`-DB-Eintrag.
- **Menü-Restruktur** (`inc/nav-data.php`): Submenu „Praxisgemeinschaft" raus, Top-Level „Kontakt" → unter Praxis-Spalte 1, „Sprechzeiten"-Submenu raus, neuer Top-Level **FAQ** (`/faq/` ID 9888 neu, mit Einweisungen + Arbeitsunfähigkeit). Neue Top-Nav: **Praxis · Untersuchungen · Labor · FAQ**.

**S60e — /team/ neu + Hub-Card-Bilder Shopify-Format:**
- /team/ Hero-Meta drastisch gekürzt: Eyebrow „Team", H1 „Unser Team.", Sub „Neun Ärzt:innen, fünf MFAs — im Frankfurter Westend."
- /team/ Post-Content ~70 % kürzer, 4 H2-Sektionen → 1 H2 „Was uns verbindet" mit 4 Bullets. Floskeln raus („Medizin ist Teamarbeit", „Kompetenz auf Facharztniveau", „nicht als Einzelkämpfer").
- /team/ SEO via `pxz_seo_data_team()` + AIOSEO-DB neu.
- Hub-Card-Bilder (`/untersuchungen/`, `/labor/`): `object-fit: contain` → `cover`, kein Background-Padding (= Sanexio `card_image_padding: 0`).

**S60f–g — Aspect-Ratio-Fix + Hero/Overview-Media quadratisch:**
- Padding-Top-Hack für `.pxz-hub-card-media`, `.pxz-hub-hero-media`, `.pxz-hub-overview-media` (`aspect-ratio: 1/1` allein griff in Flex-Cells nicht durch — siehe Pattern `aspect-ratio-padding-top-hack.md`).
- Detail-Page Hero-Media von 4/3 → 1/1.

**S60h — Detail-Page Hero-Schrift Token-basiert:**
- `.pxz-hub-hero-eyebrow`/`-heading`/`-lead` an Theme-Tokens (`--pxz-t7-size`, `--pxz-t3-size`, `--pxz-t5-size`) angeglichen — identisch mit `.pxz-eyebrow`/`.pxz-title-2`/`.pxz-lead` aus components.css. Vorher eigene clamp()-Werte (Heading bis 72 px) inkonsistent zum Rest des Themes.

**S60i–j — Body-Container + Schriftgröße:**
- `.pxz-hub-body { max-width: 720px → none }` (= volle `.pxz-hub-container` 1600 px wie Hero darüber).
- Body-Content-Größe `--pxz-t6-size` → `--pxz-t5-size` (= Hero-Lead).
- Body-H2/H3 Theme-Tokens (statt Browser-Default). Listen-Margins/Paddings.
- Legacy-Content gleich.

**S60k — Hero-Bild 30 % schmaler:**
- Grid-Spalten-Verhältnis `1fr 1fr` → `0.7fr 1fr` (Bild-Spalte ~41 % statt 50 %). Erste Variante via `max-width: 70%` ließ Bild kollabieren (Container-Width-Anchor weg in Padding-Top-Hack); Grid-Verhältnis ist sauber.

**S60l — Eye-Check Hero-Bild = Sanexio-Original:**
- `eye-check-hero.jpg` war nicht das Sanexio-Original. Über `tools/mirror-shopify-images.map` URL geholt (`Auge1080x1080.jpg`) und überschrieben. MD5 jetzt identisch mit `diag-eye-check.jpg`. Backups: `*.bak-pre-s60l`.

### S60 — Files NEU / MOD / DEL

- **NEU:** Pattern-Files `Nexus/_memory/patterns/aspect-ratio-padding-top-hack.md` + `seo-override-aioseo-direct-db.md`.
- **MOD:** `template-praxisgemeinschaft.php`, `inc/nav-data.php`, `inc/seo-data.php`, `assets/css/praxisgemeinschaft.css`, `assets/css/page-hub.css`, `functions.php` (PXZ 2.7.99 → 2.7.102), `CHANGELOG.md`.
- **WP-DB:** post 9671 meta+aioseo, post 9672 meta+content+aioseo, post 9888 (FAQ) NEU.
- **Uploads:** `eye-check-hero.jpg` ersetzt; 2 `.bak-pre-s60l`-Files.

### S60 — Smoke-Tests grün

`/praxis/`, `/team/`, `/faq/`, `/labor/`, `/untersuchungen/`, `/labor/biohack/`, `/labor/system-immune/`, `/eye-check/`, `/contact-us/` — alle HTTP 200. PHP-Lint clean auf 4 geänderten PHP-Files. Top-Nav rendert: Praxis · Untersuchungen · Labor · FAQ.

### S60 — Open Items

- **α–δ unverändert** (Doctolib, Page-Review, eye-check Praxis-eigenes Bild, S52-Builder-Output 27+ uncommitted Files).
- **µ NEU:** S60a–l selbst uncommitted im Theme-Repo. Sammel-Commit empfohlen vor neuer Session. Plus 2 `.bak`-Files in uploads aufräumen.
- **ν NEU:** Andere Detail-Page-Hero-Bilder (außer eye-check) auf Sanexio-Identität prüfen — Sweep-Skript möglich (`md5 hero-bild` vs. `md5 diag-bild` aus mirror-map).
- **ξ NEU:** EN/FR/ES-Übersetzungen der neuen /praxis/-Texte (Story, 8 Vorteile) ohne Native-Speaker-Review.
- **θ unverändert:** GLOBAL_RULES.md HARD-WARN (14 k/12 k Tokens, vorbestehend).

### S59a (2026-05-01) — Praxis-Restruktur PXZ 2.7.95

**Top-Nav 3-Spalten-Mega-Menu** statt 2-Spalten:
- Top-Item zurück auf „Praxis"/„Practice"/„Cabinet"/„Consulta" (S58 hatte „Praxisgemeinschaft").
- Spalte 1 „Praxis": Praxisgemeinschaft (= /praxis/, Submenu-Label-Rename von „Über uns") · Unser Team · Standorte · Karriere.
- Spalte 2 „Patientenservice" (unverändert): 7 Items.
- Spalte 3 „Partner:innen" (NEU): klickbare Group-Label `/unsere-partner/` + 8 Partner-Profile direkt.
- Renderer (`template-parts/header-nav.php`) um optionales `group_label_href` erweitert (`<h3>` wird `<a>` wenn href gesetzt). Rückwärtskompatibel.

**Standorte-Page** (`/standorte/`, ID 9691):
- Page-Title „Hauptpraxis Grüneburgweg" → „Standorte".
- Hero: Eyebrow „Standorte" + H1 „Zwei Adressen. Ein Gedanke." (Stil Homepage-Hero, via post_meta `pxz_standard_eyebrow`/`pxz_standard_h1`).

**Praxisgemeinschaft-Page** (`/praxis/`, ID 9671):
- Page-Title „Unsere Praxis" → „Praxisgemeinschaft".
- Neues `template-praxisgemeinschaft.php`. Page-Template umgestellt von `template-standard.php`.
- Inhalt komplett neu: Hero („Acht Disziplinen. Ein Team."), Intro über interdisziplinäre Zusammenarbeit, 8-Card-Grid Fachbereiche (Eterno-Stil, HWG-konform, 4 langs), 2-Card-Grid Kooperationspraxen (Kardiologie → ccb.de, Ophthalmologie → schmidt-augenarzt.de).
- Icons aus `assets/icons/specialties/*.svg` in Corporate-Rot via `currentColor`-Trick (`pxz_specialty_icon_svg()`).

**Partner-Übersicht** (`/unsere-partner/`, ID 9887, neu angelegt):
- Eigenes `template-partner.php`. Card-Grid mit allen 8 Partner:innen aus `pxz_team_doctors()`. Foto/Initialen + Name + Title + Profile-Link.

### S59b (2026-05-01) — Cobrand-Logo CSS-Crop PXZ 2.7.96

**Auslöser:** Mein in S59a angelegtes `logo-icon.svg` (roter Kreis + weißes Plus) war **nicht** das echte Praxis-Logo. Dr.-Stracke-Korrektur: das ECHTE `logo.svg` verwenden, kein Ersatz, und den roten Bereich darin auf die Größe des Plus-Symbols bringen.

**Erkenntnis (qlmanage + PIL):** `logo.svg` ist ein rundes medizinisches Siegel (Caduceus + Schriftring „Praxiszentrum · Dr. Stracke · & Kollegen") in 1600×1600 viewBox mit ~50 % Whitespace. Roter Stempel-Bbox: x=[369,1230], y=[361,1238] → ~862×878 px.

**Lösung:** CSS-Background-Crop. `<img>` ersetzt durch `<span class="pxz-nav-cobrand-icon" style="background-image:…">`. `background-size = container × 1600/900` (mit 22 px Sicherheits-Padding um die 878-Bbox). Container-`overflow` clipt Whitespace automatisch.

Background-Sizes pro Breakpoint: 67 → 119, 81 → 144, 108 → 192, 135 → 240 px.

**Files DEL:** `assets/logo-icon.svg` (Plus-Substitut).

### S59c (2026-05-01) — Logo-Crop auf alle Header + Footer PXZ 2.7.97

Dasselbe Pattern auf:
- **Praxis-Header** (header-nav.php else-Branch, alle non-Sanexio Pages): `<img>` → `<span class="pxz-nav-logo-icon">`. Background-Sizes 114/142/171/213 (= Container 64/80/96/120 × 1600/900).
- **Footer-Brand-Mark** (site-footer.php + footer.css): `<img>` → `<span class="pxz-footer-brand-icon">`. CSS nutzt prozentbasiertes `background-size: 177.78% 177.78%` (= 1600/900) — automatisch korrekt für 288 px / 352 px Breakpoints.

LL-058 (Cross-Page-Konsistenz): synchron mitgezogen — derselbe Whitespace-Bug existierte überall.

### S59d (2026-05-01) — /praxis/ Container-Breiten = Homepage PXZ 2.7.98

**Vorher:** `.pxz-pg-hero-inner` 880 px · `.pxz-pg-lead` 70ch · `.pxz-pg-spec/coop .pxz-sect-head` 760 px → enger als Homepage.

**Nachher (Homepage-Pattern):**
- `.pxz-pg-hero` voll-bleed (`max-width: none`), Padding wie `.pxz-hero-top`: 80/104/128 px oben, 40/56/72 unten, horizontal `clamp(1rem, 4vw, 3rem)`.
- `.pxz-pg-hero-inner` max-width: none.
- `.pxz-pg-lead` max-width: 75 ch (= `.pxz-home .pxz-sect-intro`).
- Section-Heads max-width: none. Section-Intros max-width: 75 ch, `margin: 1.75rem auto 0`.
- Outer-Container `.pxz-container { max-width: 1600px }` bleibt unverändert (war schon korrekt).

### S59 — Files NEU / MOD / DEL

- **NEU:** `template-praxisgemeinschaft.php`, `template-partner.php`, `assets/css/praxisgemeinschaft.css`.
- **MOD:** `inc/nav-data.php`, `template-parts/header-nav.php`, `template-parts/site-footer.php`, `assets/css/nav.css`, `assets/css/footer.css`, `functions.php`, `CHANGELOG.md`.
- **DEL:** `assets/logo-icon.svg` (S59b-Korrektur).
- **WP-DB:** post 9671 title+template, post 9691 title+post_meta, post 9887 (NEU) inkl. _wp_page_template.

### S59 — Smoke-Tests grün

`/praxis/` (HTTP 200, 8 Fachbereich-Cards + 2 Kooperations-Cards, Container 1600 px) · `/unsere-partner/` (HTTP 200, 8 Partner-Cards) · `/standorte/` (HTTP 200, neuer Hero) · `/` (Top-Nav „Praxis", Praxis-Logo gecroppt) · `/team/` (Cobrand-Order praxis→sanexio, Logo gecroppt). PHP-Lint clean auf allen 5 geänderten Files.

### S59 — Theme-Repo-Status (Ende-Session)

- **HEAD vor S59:** `6045cda` (S58f).
- **S59 als Sammel-Commit gepusht** mit Pathspec-Add (nur S59-Files) — die uncommitted S52-Builder-Output-Files (page-hub-*.php + arzt.css + room-slider.*) bleiben weiter unangetastet (Open-Item seit Tagen).
- **Theme-Repo hat kein Remote** — lokal-only seit S0.1.

### S59 — Open Items / Folge-Punkte

- **α) Doctolib-Direktlinks pro Page** (Phase 3d, Sanexio-Mirror) — unverändert offen.
- **β) Page-Review / Sie-Form-Walkthrough** (25 Sanexio-Mirror-Pages) — unverändert offen.
- **γ) eye-check + labor-biohack** Praxis-eigenes Bild + Text — unverändert offen.
- **δ) S52-Builder-Output-Commits + room-slider-Änderungen** (33 uncommitted Files seit Tagen) — Dr.-Stracke-Entscheidung über Commit weiter offen.
- **ε) EN/FR/ES-Übersetzungen** der Klappentexte auf /praxis/ + /unsere-partner/ ohne native-speaker-Review — Zweitkorrektur empfohlen, kein Blocker.
- **ζ) Logo-Crop visueller Feinschliff** — falls bei großem Header (Desktop ≥1440 px, 120 px Logo) zu groß/zu eng wirkt: `background-size`-Faktor in nav.css/`.pxz-nav-logo-icon` anpassen (aktuell 213 px = 120 × 1600/900). Pattern: `Nexus/_memory/patterns/svg-background-crop.md`.
- **η) /praxis/ post_content Legacy** in WP-DB bleibt — vom neuen Template nicht gerendert, aber DB-Eintrag liegt da. Optional Cleanup.
- **θ) Sanitizer GLOBAL_RULES.md HARD-WARN** (14111/12k Tokens, vorbestehend seit S56) — manuelle Verdichtung anstehend.

### S59 — Architektur-Erweiterungen

- **Renderer-Pattern `group_label_href`** für Mega-Menu (header-nav.php) — optional, rückwärts-kompatibel. Nutzbar auch für andere Top-Items wenn deren Spalten-Header eine Übersichtsseite haben sollen.
- **CSS-Background-Crop-Pattern** für Whitespace-padded SVGs — neues Pattern `Nexus/_memory/patterns/svg-background-crop.md` mit qlmanage+PIL-Bbox-Skript.

---

## §1-Sliding-Window — N-1 (S58, 2026-05-01 vormittags) — kompakt

S58 (PXZ 2.7.94, Theme `6045cda`): Praxisgemeinschaft-Refresh (heute morgen, vor S59) — 6 Doctor-Fotos importiert (IDs 9878–9883), Trunk-Drift-Cleanup, „Weitere Partner der Praxisgemeinschaft" als Section-Title, Container-Standard `_rules/CONTAINER_STANDARD.md`, Top-Nav 5→4 Items mit Praxisgemeinschaft + Patientenservice als Mega-Menu-Spalten (in S59 weiter restrukturiert), Header-CTA auf `mailto:`, Reviews-Karussell mit Endlos-Modus + Click-to-Expand. LL-057 (Fachtermini erklären), LL-058 (Cross-Page-Konsistenz). Detail siehe Cold-Archive bzw. CHANGELOG-Eintrag 2.7.94 / S58a–f.

---

## §1-Legacy (vorheriger Stand vor S59 — gültig bis 2026-05-01 vormittags)

- **PXZ_VERSION:** **2.7.94** Theme-HEAD `6045cda` (S58f). Reihe: `6045cda` (S58f) → `c04ec4c` (S58e) → `b56f6a0` (S58d) → `0aeccd3` (S58c) → `6ecdfcf` (S58b) → `8491ed6` (S58) → `e1e3ed6` (S57) → `9d257cf` (S56).
- **Cortex-Web HEAD:** `5f8177b` (Page-Content-Snapshot /team/) → `6de121f` (Trunk-Container-Standard + Jawich) → `4c6d8da` (Trunk Doctor-Bios Backfill).
- **Nexus-Architektur:** LL-057 (Fachtermini im Chat erklären) + LL-058 (Cross-Page-Konsistenz) eingeführt.

### S58 (2026-05-01 später am Tag) — Praxisgemeinschaft-Refresh + Reviews-Karussell

**Block 1: Co-Brand-Logo Sanexio-Header** (`6045cda` Reihe Anfang) — Praxiszentrum-Cobrand-Logo neben Sanexio-Wordmark vergrößert: 36→56 px Mobile, 44→72 Tablet, 52→**88 px** Desktop, plus Text-Stufen 13/15/16 → 15/18/20 px. War vorher visuell ~8:1 dominiert vom Sanexio-Wordmark.

**Block 2: 6 Doctor-Fotos** — Bilder lagen physisch in `/wp-content/uploads/2026/04/` (Dr-Barcsay, Dr-Seelig, Dr-Jawich, Dr-Shahin, Landeberg, Arbitmann), waren aber **keine WP-Attachments**. Per `wp media import` registriert (IDs 9878–9883) und in Trunk-YAMLs + `inc/data/team.json` verknüpft. Gleichzeitig **Trunk-Drift-Aufräumung**: Trunk-YAMLs hatten Stub-Bios („Schwerpunkt Innere Medizin"), team.json die ausführlichen S2.3-Bios — Trunk auf JSON-Volltexte nachgepflegt, Adapter-Roundtrip idempotent (Cortex-Web `4c6d8da`). Sektions-Titel auf jeder Arzt-Page „Weitere Ärztinnen und Ärzte" → **„Weitere Partner der Praxisgemeinschaft"** (Landeberg/Arbitmann sind keine Ärzte). Linnea-Tippfehler („Linne"→„Linnea") gefixt.

**Block 3: Container-Standard** — `_rules/CONTAINER_STANDARD.md` neu (Trunk-Doc): outer 1600 px (`.pxz-container` aus components.css), innen 75ch Lese-Kanal (`.pxz-prose`). Migriert: `team.css` (intro 760→1600, grid 1500→1600), `page-hub.css` (1200→1600, plus Schriftgrößen lead 22→26, card-teaser 15→19, usp 19→22). object-fit cover→**contain** für `.pxz-hub-card-media img`, damit Shopify-Mirror-Texte nicht beschnitten werden. Page-Content `/team/` (post_id 9672) inhaltlich überarbeitet (real Personalstruktur + Urologie/Gyn ergänzt) — Snapshot in `_content-archive/kern/de/team-9672_s58_2026-05-01.md` (Frozen + supersedes-Markup).

**Block 4: Header-Restrukturierung** (`6ecdfcf`) — Top-Nav 5→**4 Items**: „Praxis"→**„Praxisgemeinschaft"**, „Patientenservice" entfällt als Top-Item, ist jetzt 2. Spalte des Mega-Menüs unter „Praxisgemeinschaft" (analog Untersuchungen-grouped-Pattern). 4 Sprachen synchron (DE/EN/FR/ES).

**Block 5: CTA-Wechsel** — Header-CTA + Mobile-Sticky-CTA von `#service`/`/sprechstunden/`-Anker auf `mailto:praxis@westend-hausarzt.de` (PXZ_EMAIL-Konstante wieder verwendet). Wording in 4 Sprachen: „Anfrage senden" / „Send inquiry" / „Envoyer une demande" / „Enviar consulta" (long) + „Anfrage / Inquiry / Demande / Consulta" (short).

**Block 6: Reviews-Karussell** (Reihe `0aeccd3` → `b56f6a0` → `c04ec4c` → `6045cda`) — Standorte-Section auf Homepage entfernt, durch Patientenstimmen ersetzt. 19 Google-5-Sterne-Reviews per Helper `pxz_homepage_reviews()` (Single-Source, gleich für alle 4 Sprach-Blöcke), sortiert nach Textlänge, Originalsprache erhalten (`<blockquote lang="…">`), Datum weg, Maps-Link `cid=7619231455121296052`. Karussell mit 1/2/3 Cards je Viewport (CSS-Variable `--pxz-rcr-cards`, JS liest sie via getComputedStyle), Default-Höhe `clamp(420px, 50vw, 520px)` ≈ MFA-Section. **Click-to-Expand** mit `-webkit-line-clamp: 9` und Track-Höhen-Transition. **Endlos-Modus** mit nahtlosem **Instant-Snap-Trick**: Klone der ersten/letzten cardsPerView Cards an Track-Rand, Wrap animiert in Klon-Slot, transitionend snappt instant zur echten Position (Fallback-Timer 600 ms für reduced-motion).

**Block 7: Nexus-Architektur-Erweiterung** — Zwei neue LL-Regeln + Auto-Memory:
- **LL-057** (Fachtermini im Chat erklären, Cortex/Nexus-Scope): jede technische Begrifflichkeit bei Erstverwendung in 1 Satz erklären, bis Dr. Stracke pro Bereich aufhebt. Konkretisiert LL-024 für Fachvokabular. Spec: `Nexus/_rules/GLOBAL_RULES.md` §33. Auslöser: Adapter-Begriffsschwall (Trunk/Drift/Stub/YAML).
- **LL-058** (Cross-Page-Konsistenz): bei Content-/Design-Änderungen Pflicht-Audit auf gleichen Kontext anderswo + synchrones Mitziehen in derselben Session. Spec: `Nexus/_rules/GLOBAL_RULES.md` §34. Architektur-Companion: praxis-webseite/_rules/CONTAINER_STANDARD.md. Auslöser: Container-Wildwuchs (760/840/1080/1140/1200/1260/1500/1600 px).
- Auto-Memory: `feedback_explain_terms_in_chat.md`, `feedback_cross_page_consistency.md`, plus `feedback_no_obvious_questions.md` (User-Tadel: keine offensichtlichen Rückfragen, wenn Antwort aus etablierten Memorys folgt).

### S58 Open Items / Nicht angefasst

- Reviews-Avatare: aktuell Initialen-Disc. Echte Google-Reviewer-Fotos liegen hinter Consent-Wall — `web-pilot`-Lauf möglich, von Dr. Stracke noch nicht beauftragt.
- Container-Migration: 8 weitere Templates (`template-arzt`, `template-standard`, page.css, sprechstunden.css, kontakt.css, page-hub.css ✅, bridge-product.css, checkup-hub.css) — Migrationsregel via CONTAINER_STANDARD.md: bei nächstem Edit jeweils mitziehen. Kein Big-Bang nötig.
- Praxis-/team/ post_content lokal-only — Beim Live-Push in DB übernehmen (Snapshot in `_content-archive/kern/de/team-9672_s58_2026-05-01.md`).

---

## §1.5 Vorgänger Session 56 (2026-05-01 vormittags) — Homepage-Container + 5 Arzt-SEO + Co-Brand + LL-056

(N-1, Sliding-Window-Pattern. Detail-Block siehe `_archive/sessions/2026-05/session-56.md` falls archiviert; ansonsten unverändert unten verfügbar.)

### S56 (2026-05-01) — Homepage-Container + 5 Arzt-SEO + Sanexio-Co-Brand + LL-056

**Block 1: Homepage MFA-Container „Wir suchen dich"** (Dr.-Stracke-Direktive):
- DE-Subtitle aktualisiert: „… mit eigener klarer Verantwortung und echtem Einfluss." (vorher „mit eigenen Patient:innen, klarer …").
- 2. Button („Mehr über die Stelle") → **Mail-Button** mit `mailto:praxis@westend-hausarzt.de` (Subject vorbelegt). DE/EN/FR/ES Labels gepflegt.
- „Lieber klassisch per E-Mail?"-Note + zugehöriges CSS entfernt.
- Card-Padding bottom 56/80/96 → 40/56/64 px (an kürzeren Inhalt angepasst).

**Block 2: Klappentexte unter Fachrichtungen** (`team_roles.bio` DE, 7 von 8 Ärzten):
- saul: „Hausärztliche Versorgung." · stracke: „Notfallmedizin. Schwerpunkt Kardiologie." · seelig: „Operative Gynäkologie." · barcsay: „Vasektomie." (+ medikamentöse Tumortherapie) · shahin: „Neurologie und Psychiatrie." · arbitmann: „Physiotherapie und Naturheilpraxis." · landeberg: „Verhaltenstherapie."
- jawich/HNO **unverändert** — keine User-Vorgabe.

**Block 3: 5 Arzt-Profile SEO-optimiert** (`inc/data/team.json` bio + qualifications):
- barcsay (offenbacherurologen.de) · seelig (praxis-seelig.de) · landeberg (psychotherapeutikum.net) · arbitmann (naturheilpraxis-arbitmann.com).
- **shahin:** auf reine Praxis-Tätigkeit fokussiert (kein Klinik-Werdegang Saarbrücken/Marburg/Gießen) — Dr.-Stracke-Direktive.
- Stracke und Saul **unangetastet**.

**Block 4: Sanexio-Logo + Co-Branding** (alle 8 Sanexio-Seiten: /team/ + 7 Arzt-Slugs):
- SVG `assets/logo-sanexio.svg`: „PRAXISGEMEINSCHAFT" Untertext **14 → 28 px** (letter-spacing 12 → 7), klar lesbar.
- Header neu: Sanexio-Wordmark + Trennlinie + **Praxis-Co-Brand** (Logo + „Praxiszentrum / Dr. Stracke & Kollegen"). Mobile: nur Logo-Icon.
- Neue CSS-Komponente `.pxz-nav-logo-cluster` + `.pxz-nav-cobrand` in `assets/css/nav.css`.

**Block 5: LL-056 Drift-Mitigation (Architektur-Erweiterung Nexus)** — gepusht auf origin:
- `_skripte/sync-second-brain.py` Idempotenz-Helper `write_idempotent_dates()` (5 Call-Sites umgestellt). 4 Smoke-Tests grün.
- `nexus-sync.sh` AUTO_ADD_WHITELIST Backstop um 3 Globs erweitert (Projekt-MDs + 2 MOCs).
- `check-nexus-drift.sh` 3-Klassen-Klassifikation (auto-content / cron-output / manual-content).
- `_rules/GLOBAL_RULES.md` §32 + INDEX.md-Pointer + Memory `feedback_vault_edit_in_session.md`.

### Theme-Repo-Status (S56-Ende)

- **HEAD:** `9d257cf` (S56-Changelog) → `2f485b7` (S56-Code) → `e49b187` (S54).
- **Uncommitted (vorbestehend, S52-Builder-Output):** `assets/css/arzt.css`, `assets/css/room-slider.css`, `assets/js/room-slider.js`, alle 27 `inc/data/page-hub-*.php`, `inc/nav-data.php`, `inc/slider-render.php`. Dr.-Stracke-Entscheidung über Commit weiter offen.
- **Theme-Repo hat kein Remote** — lokal-only seit S0.1.

### Nexus-Repo-Status (S56-Ende)

- **HEAD:** `6d151a9` (LL-056) — push OK auf `origin/main`.
- Nur Heartbeat dirty (nexus-sync räumt im 5-Min-Cron).
- Sanitizer-Probe: alle Watch-Files im Budget. SOFT-WARN auf GLOBAL_RULES.md (12839 Tokens) — durch §32-Erweiterung um ~640 Tokens erhöht, vorbestehend.

### Offene Punkte für Folge-Session (S57)

- **α) Doctolib-Direktlinks pro Page** (Phase 3d, Sanexio-Mirror)
- **β) Page-Review / Sie-Form-Walkthrough** mit Dr. Stracke (25 Sanexio-Mirror-Pages)
- **γ) eye-check + labor-biohack** — Praxis-eigenes Bild + Text
- **δ) 30+ uncommitted Theme-Files aus S52** (page-hub-output + arzt.css + slider) — Commit-Entscheidung Dr. Stracke
- **ε) EN/FR/ES-Übersetzung** für MFA-Subtitle + 7 Klappentexte + 5 Arzt-Bios (heute nur DE)
- **ζ) HNO/Jawich:** Klappentext fehlte in der S56-Liste — entfernen oder neu setzen?
- **η) Browser-Cache-Verifikation** der 5 neuen Arzt-Seiten durch Dr. Stracke (Cmd+Shift+R)
- **θ) Theme-Repo ohne Remote** — strategische Frage ob GitHub-Remote sinnvoll
- **ι) `~/Cortex/.claude/hooks/` nicht versioniert** — sollte ggf. ins Nexus-Repo ziehen

### LL-056 Erfolgsindikator (ab S57 messbar)

Nach 24h ohne inhaltliche Vault-Edits sollten **0 Datums-Bump-Drifts** im `git status` von `~/Cortex/Nexus/` erscheinen. Falls doch welche auftauchen → Idempotenz-Helper hat eine Stelle übersehen, dort patchen.

---

## §1-Legacy (vorheriger Stand, historisch)

### Vorheriger Stand — 2026-04-30 Ende Session 55 — Slider-Halbierung + Labor-Begriffe + Untersuchungen-Sweep, PXZ 2.7.85

- **PXZ_VERSION:** **2.7.85** uncommitted (Theme-Repo). Vorgänger committed: `e49b187` (S54, PXZ 2.7.78).
- **Versionsfolge S55:** 2.7.78 → 79 (Slider-Pair v1) → 80 (Glassmorphism-Strip) → 81 (Single-Container) → 82 (Spezifitäts-Fix) → 83 (Labor-Begriffe DE) → 84 (Labor-Mega-Menu) → **85 (Untersuchungen-Sweep)**.

### S55 (2026-04-30) — Slider-Halbierung + Labor-Begriffe + Untersuchungen-Sweep

**Block 1: Homepage-Slider auf halbe Höhe (4 Iterationen S55a/b/c/c-fix):**
- Container 32:9-Strip mit 2 Bildern à 16:9 nebeneinander (kein Crop), Captions hidden, ein einziger Card-Container.
- 4 Versuche nötig (Pair-Layout falsch verstanden, dann zu komplex mit Glassmorphism, dann CSS-Spezifitäts-Bug — 0,1,0 verlor gegen 0,2,1 vom Default-Fullbleed).
- Final-Fix in 2.7.82: Selektoren auf `.pxz-room-slider[data-pair="true"] …` hochgezogen (0,3,1).
- **Files:** `inc/slider-render.php` (`pxz_render_homepage_slider` paart Slides via `array_chunk`, neuer Helper `pxz_render_fullbleed_pair_cell`), `assets/css/room-slider.css` (PAIR-LAYOUT-Block).
- **JS unverändert.**

**Block 2: Labor-Menü deutsche Kurz-Begriffe (PXZ 2.7.83, 9 Pages):**
- Status Baseline → **Basis-Check**, Status Advanced → **Erweiterter Check**, Status Prevent → **Vorsorge-Check**, System Immune → **Immunsystem**, System Renal → **Nieren**, System Liver → **Leber**, BioHack — Genetische Beratung → **Genetik-Beratung**. Stoffwechsel + Risikoprofil bleiben.
- Pro YAML: title.de + hero.heading + lead + body_html + cta-banner.heading durchgängig ersetzt (perl-Bulk).
- **Schutz-Block** `sanexio_source.local_edits: true` an jedes der 9 YAMLs angehängt — verhindert Drift-Sync-Rollback. `original_label` als Provenance.
- WP-DB `wp_posts.post_title` für IDs 9850–9855 + 9857 via Local-MySQL aktualisiert.

**Block 3: Labor-Submenu in 3 Gruppen (Mega-Menu, PXZ 2.7.84):**
- **Check-Up** (Basis-Check, Erweiterter Check, Vorsorge-Check) · **Organe** (Immunsystem, Nieren, Leber, Stoffwechsel) · **Risikoprofile** (Risikoprofil, Genetik-Beratung).
- 4 Sprachen-Gruppen-Labels gepflegt (DE/EN/FR/ES).
- Helper `$build_unt_groups` (S52) wiederverwendet — keine Duplikation.

**Block 4: Untersuchungen-Sweep (PXZ 2.7.85, 10 Pages):**
- Bindestrich-Fixes: Body Check → **Body-Check**, Kardio Check → **Kardio-Check**, Sono Check → **Sono-Check**, Carotis Duplex → **Carotis-Duplex**.
- Eindeutschungen: Eye Check → **Augen-Check**, Fit for Diving → **Tauchtauglichkeit**.
- Menü-konsistente Kürzungen (4 Sonographie-Pages): „Sonographie der Bauchspeicheldrüse" → **Bauchspeicheldrüse** etc. — bei diesen 4 nur title.de + hero.heading.de gekürzt; lead, body, cta behalten ausführliche sprachlich korrekte Form („führen wir die Sonographie der Leber durch").
- 6 simple Pages: Replacement durchgängig.
- 10× `sanexio_source`-Block mit `local_edits: true` angehängt.
- WP-DB `post_title` für IDs 354 + 9840–9849 aktualisiert (10 Pages).
- nav-data.php `$u_funktion_de` + `$u_checkup_de` (DE-Untersuchungs-Submenu) gepflegt.

**Builder-Run:** `bun adapters/wordpress/build-page-hub.mjs` → 27 PHP-Data-Files. Schema-Validation OK.

**HTTP-Verify** auf 4 Beispielen: 0× alte Begriffe, 13–18× neue Begriffe, Browser-Tab-Title kurz.

### Theme-Repo-Status (S55-Ende)

- **HEAD:** `e49b187` (S54). **Uncommitted:** 32 Files (Theme-Sources + 27 page-hub-PHP + functions.php + CHANGELOG + nav-data + slider-render + room-slider.css).
- **Cortex-Web-Repo:** 19 Trunk-YAMLs modified + SESSION_RESUME (Praxis + Cortex-Web).

### Offene Punkte für Folge-Session (S56)

- **α) Doctolib-Direktlinks pro Page** (Phase 3d, Sanexio-Mirror)
- **β) Page-Review / Sie-Form-Korrekturen** auf den 25 Sanexio-Mirror-Pages
- **γ) eye-check + labor-biohack** — Praxis-eigenes Bild + Text
- **δ) S52-Builder-Output-Commits + heutige S55-Commits konsolidieren** (Theme-Repo + Cortex-Web)
- **ε) Blocksy-Backup-Menü konsolidieren** (optional)
- **ζ) 88 stale refs** aus Sanitizer-Learn aufräumen
- **η) GLOBAL_RULES.md über Cap** (Nexus-Side, nicht durch heutige Arbeit verursacht — manuell verdichten)
- **θ) `arzt.css` + S52 page-hub-output-Files** im Theme-Repo committen (offen seit Tagen)

### S54 (2026-04-29) — FINAL CTA entfernt (Dr.-Stracke-Direktive)

- **Final-CTA-Section auf Homepage komplett raus** ("Sie haben Fragen? Wir sind da." + "Termin anfragen"-Button + Telefon + Privatpatienten-Hinweis).
- Mobile-CTA-Sticky-Bar (`.pxz-mobile-cta`) bleibt als einziger CTA-Anker auf der Homepage. Privat-Telefon weiterhin im Combined-Standorte-Container sichtbar.
- Daten `cta_title_a` + `cta_title_b` aus `inc/homepage-data.php` raus (4 Sprachen).
- CSS `.pxz-final*` aus `assets/css/homepage.css` raus.
- **Hunk-Aufräumung mit-committed:** S47-Stats-Refactor + S53-template-homepage-Hunk lagen seit Tagen uncommitted; in `e49b187` mit-genommen.
- **Tools-Drift behoben** (verify.sh war FAILED nach S54): `alignment-probe.mjs` + `ab-diff.mjs` + `page-registry.mjs` referenzieren jetzt `.pxz-loc-card--combined` statt `.pxz-loc-card--main`/`.pxz-final-card`.

### S53 (2026-04-29) — Standorte-Container vereint (Layout A, Padding +20%)

- **Hauptstandort + Zweitstandort in 1 Card** auf Homepage Standort-Section + `/standorte/` + `/standorte/zweigpraxis-bockenheimer/`.
- **Layout A:** 2 Spalten oben (je Standort: Adresse · Sprechzeiten · Maps-Link) + gemeinsamer Footer-Block (Tel allgemein/privat · E-Mail · Offene-Sprechstunde-Hinweis · Termine-zentral-Hinweis). Redundante Felder (Tel-allg, E-Mail, Hours-Label) jetzt nur 1×.
- **Padding +20%:** Mobile 87/67, Tablet 115/96, Desktop 134/115 (vs. Single-Card 72/56, 96/80, 112/96).
- **Menü-Konsoldierung Praxis-Submenu (4 Sprachen):** 2 Items „Hauptpraxis Grüneburgweg" + „Zweigpraxis Bockenheimer" → 1 Item „Standorte" / „Locations" / „Sites" / „Sedes" → `/standorte/`.
- **Detail-Pages bleiben** (URL-Stabilität, Room-Slider als Wert) — zeigen jetzt denselben Combined-Container im Hero-Bereich + ihren jeweiligen Room-Slider darunter.
- **Files NEU:** `template-parts/loc-combined.php`. **Files DEL:** `template-parts/loc-main.php`, `loc-secondary.php` (Dead Code, Git-History).
- **Files EDIT:** `inc/practice-data.php` (1 neuer Key `loc_combined_badge` × 4 langs), `assets/css/loc-cards.css` (`.pxz-loc-card--combined` ~70 Z. neu), `template-homepage.php`, `template-standard.php`, `inc/nav-data.php`, `functions.php`, `CHANGELOG.md`.
- **Blocksy-Backup-Menü (`ct-menu`) nicht angerührt** — ist via `nav.css:16` `#header.ct-header { display:none !important }` versteckt, im DOM für Crawler. Memory `feedback_praxis_nav_via_code.md` sagt explizit „NICHT auf WP-Admin-Menü umstellen". Aufräumen wäre Folge-Aufgabe ohne User-sichtbaren Effekt.

### Verify Session-Ende S54

- **verify.sh ✅** alle §-Checks grün (nach Tools-Drift-Behebung).
- **HTTP-Sweep:** 3 URLs (Homepage + /standorte/ + /standorte/zweigpraxis-bockenheimer/) je HTTP 200, Combined-Container-Marker auf allen 3 vorhanden, 0 PHP-Fehler.
- **Sanitizer-Probe:** 7/7 Watchset-Files im Budget. SOFT-WARN auf `Nexus/_rules/GLOBAL_RULES.md` (12180 von 12k Tokens) — nicht durch S53/S54, vorbestehend.
- **Sanitizer-Learn:** 0 Duplikate · 0 Cross-Project-Leaks · 88 stale refs (vorbestehend, gleicher Trend wie Session 49).

### Theme-Repo-Status

- HEAD: `e49b187` (S54)
- Vorgänger: `f014ef2` (S53), `fb88c41` (S52-it), `a4ecf5c` (S52), `cbd6470` (S52 Doctolib-Button), `52cc942` (S50)
- **Uncommitted:** 27 Files aus S52-Iteration (alle `inc/data/page-hub-*.php` + `assets/css/arzt.css`). Nicht von S53/S54-Sprint, gehören zu S52-Builder-Output. Dr.-Stracke-Entscheidung über Commit offen.

### Offene Punkte für Folge-Session (S55)

- **α) Doctolib-Direktlinks pro Page** (Phase 3d, Sanexio-Mirror) — Dr. Stracke gibt im Verlauf rein
- **β) Page-Review / Sie-Form-Korrekturen** auf den 25 Sanexio-Mirror-Pages — Dr.-Stracke-Walkthrough
- **γ) eye-check + labor-biohack** — Praxis-eigenes Bild + Text (Stub)
- **δ) S52-Builder-Output-Commits klären** (27 uncommitted Files: `inc/data/page-hub-*.php` + `arzt.css`)
- **ε) Blocksy-Backup-Menü konsolidieren** (optional, nicht User-sichtbar)
- **ζ) 88 stale refs** aus Sanitizer-Learn — bei Gelegenheit aufräumen

---

## §1-Legacy (vorheriger Stand, historisch)

### Vorheriger Stand — 2026-04-27 Ende Session 49 (Radikaler Sanexio-Spiegel-Umbau, PXZ 2.7.72)

- **PXZ_VERSION:** **2.7.72** committed `90fc4db`. Cortex-Web-Repo: Trunk + Spec + Tools + Backups committed.

- **Radikal-Umbau S49 (Dr.-Stracke-Direktive 2026-04-27 — strategische Wende):**
  - **Top-Nav reduziert auf 5:** Praxis · Untersuchungen · Labor · Service · Kontakt. Leistungen + 7 Submenu-Pages komplett gelöscht (Papierkorb).
  - **„Diagnostik" → „Untersuchungen":** Slug-Wechsel `/diagnostik/` → `/untersuchungen/` mit automatischem 301-Redirect (`_wp_old_slug`), Label-Wechsel im Menü, Template-Wechsel auf neues `template-untersuchungen-hub.php`.
  - **19 NEUE Detail-Pages angelegt** (10 Untersuchungen + 9 Labor) als **interne** Sanexio-Spiegel. Sanexio-Texte 1:1 kuratiert: Sie-Form, keine Werbung, keine Preise.
  - **Untersuchungen-Hub:** 16 Bento-Karten (Echo, Carotis, Schilddrüse, Bauchorgane, Pankreas, Nieren, Prostata, Leber, Belastungs-EKG, Lungenfunktion, Body Check, Sono Check, Komplett-Check, Kardio Check, Fit for Diving, Eye Check) — alle intern verlinkt.
  - **Labor-Hub:** 9 Bento-Karten (Status Baseline/Advanced/Prevent · System Immune/Renal/Liver · Stoffwechsel · BioHack · Risikoprofil) — alle intern verlinkt.
  - **Untersuchungen-Submenu** = die 16 Detail-Pages (kein „Übersicht"-Item, Top-Klick = Hub-Page).
  - **Labor-Submenu** = die 9 Detail-Pages (analog).
  - **10 Pages getrasht:** Leistungen-Hub + 7 Submenu-Pages (check-ups, gesundheits-/cardio-/angio-check-up, impfungen, rund-ums-impfen, corona-impfung) + sonographie/beingefaesse + tumorscreening.
  - **4 Trunk-YAMLs ins `_archive/`** (diagnostik, leistungen, sonographie-beingefaesse, tumorscreening).

- **Architektur-Erweiterungen:**
  - **Schema:** neue Section-Type `body` (Markdown-Long-Text mit **fett**, *kursiv*, [Links](url)).
  - **Builder:** `adapters/wordpress/build-page-hub.mjs` auto-discovery aller `_shared/*.yaml` (27 PHP-Datenfiles generiert).
  - **Theme:** `template-untersuchungen-hub.php` neu, `template-detail-page.php` universell für alle Detail-Pages, `template-parts/page-hub-renderer.php` rendert 6 Section-Types.
  - **Mirror-Tool:** `tools/mirror-shopify-images.{sh,map}` — 24 Sanexio-Bilder gespiegelt nach `wp-content/uploads/2026/04/sanexio-imports/` (CW-003 erfüllt, MD5-Verify).
  - **HWG-Probe:** `verify.sh --hwg` neu (§5), 14 URLs gechecked, 0 Preise sichtbar.

- **Verify Session-Ende S49:** verify.sh ✅ · 28/28 HTTP 200 · HWG 14/14 grün · Mid-Range 0 Overflow @ 1024–1920 · Sanitizer-Probe alle 5 Dateien im Budget · Sanitizer-Learn: 0 Duplikate · 0 Leaks · 103 stale refs (beobachten).

- **Künftiger Workflow Sanexio→Praxis (S49-Pipeline produktiv):** Trunk-YAML in `~/Cortex/projects/Cortex-Web/trunk/content/pages/_shared/<slug>.yaml` editieren oder via `cw-transfer pull shopify:product` ziehen → `bun adapters/wordpress/build-page-hub.mjs` → Pages aktualisieren sich. Bei neuem Sanexio-Produkt: zusätzlich `nav-data.php` erweitern + WP-Page über `wp_insert_post` anlegen (PHP-Snippet im S49-Spec dokumentiert).

- **Spec:** `sites/praxis-webseite/specs/sprint-2/S49_shopify-content-bridge.md` (V1.1, Phase 3 abgeschlossen).

- **Backups vor Trash/Slug-Change:** `sites/praxis-webseite/_backup/S49-pre-pages/` (3 Hubs) + `_backup/S49-detail-pages/` (8 alte Detail-Pages). Jederzeit rückspielbar.

- **Offene Punkte für nächste Session:**
  - **Visuelle Sichtung der 22 Pages durch Dr. Stracke** (Iteration über YAML + Re-Build).
  - Cleanup-Kandidaten: `template-leistungen.php` (Page weg), `_archive/leistungen.yaml` ggf. dauerhaft löschen.
  - Submenu „Untersuchungen" mit 16 Items: bei Bedarf gruppieren mit Section-Headern.
  - Ungestaged Theme-Files aus S43–S47 (`assets/css/arzt.css`, `inc/homepage-data.php`, `template-homepage.php`) — Dr.-Stracke-Entscheidung über Commit.
  - 103 stale refs aus Sanitizer-Learn — bei Gelegenheit aufräumen.

---

**[Vorheriger Stand, historisch — Session 28 (S47 Stats-Hero-Move + Mitarbeiter-PDF)]:** PXZ_VERSION 2.7.68 live auf Local by Flywheel (Cluster-Mini-02). Theme-Edits S28 ungestaged: `assets/css/homepage.css`, `assets/css/arzt.css`, `inc/homepage-data.php`, `template-homepage.php`, `functions.php`. Local-First-Workflow (Memory `feedback_praxis_local_first_workflow.md`) — kein Theme-Commit gemacht.

- **Content-Migration „wesentlich abgeschlossen":** Nach Inventur am 2026-04-26 (alle 25 Legacy/DE-Slugs in WP-DB direkt geprüft + HTTP-Probe) ist der wesentliche Content der alten Seite migriert. **22/25** sauber: 7/7 PFLEGEN ✅ (alle 6 Service-Pages + Bockenheimer-Standort), 4/7 MERGEN ✅ (Sprechzeiten, Bauchschmerz, Wasserlass, DHT-Form), 5/5 ARCHIV-ONLY ✅, 5/6 LÖSCHEN ✅. **Bonus-Befund:** Redirect-Map B-2d ist bereits aktiv (alle alten Legacy-Slugs liefern HTTP 301). **3 harte Restlücken** (kein Launch-Blocker, im P3-Backlog): L1 carotis-duplex (1896 chars, lebt noch als eigene Page — soll in Diagnostik-Cluster gemergt werden), L2 docteur-en-med-s-saul Dublette (alte Page lebt parallel zur neuen Profile-Page, sollte 301-redirect bekommen), L3 cookie-richtlinie-eu (publish, sollte gelöscht werden). **2 Verifikationen:** V1 FAQ-Accordion in /praxis/, V2 fragebogen-personalisierte-medizin → Juvantis. **i18n-Dubletten (134 EN/FR/ES) bewusst zurückgestellt** für Sprint 3 / WPML. **Bonus:** Slug-Drift dokumentiert (Triage sagte `/service/einweisungen-ueberweisungen/`, live ist `/service/einweisungen/`). Auto-Memory `project_praxis_full_content_migration.md` komplett überarbeitet.

- **S47 Stats-Hero-Move (PXZ 2.7.63 → 2.7.67, 5 Iterationen):** Stats-Block (4 Kacheln) aus eigener Section in den Hero verschoben — sitzt jetzt zwischen `pxz-hero-top` und `pxz-hero-img-wrap`, vor dem Slider. Alte Section nach MFA hatte 56–112 px Padding + Gradient chalk → #E8E8EC; neu im Hero kompakt mit Trennlinien oben+unten. **Iterationen:** it1 Inline-Layout (Number+Label nebeneinander) → it2 mehr Padding asymmetrisch zugunsten unten + dezente Trennlinien (rgba 0.07) → it3 Linien prominenter (rgba 0.15) + Stack-Layout (Zahl oben, Label in 2. Zeile). Subtitle gekürzt (4 Sprachen): „Acht Fachrichtungen…" weg, nur noch „Eine Philosophie…". Stats-Label „Patienten in der Datenbank" → „Patienten" (DE). Container-max-width 1280 px (statt 1600), padding mobile 24/40, desktop 32/56.

- **Mitarbeiter-Beurteilungs-PDF:** Neues Tool `tools/make-staff-presentation.mjs` (Bun + puppeteer-core). **Output:** `/Users/cluster-mini-02/Downloads/Praxis-Webseite-Homepage-Beurteilung-2026-04-26.pdf` (2,8 MB, 8 Seiten DIN A4: Cover + Desktop-Ansicht paginiert, Mobile entfernt auf Wunsch). Cover enthält 5 Beurteilungsfragen für Mitarbeiter. **2 Lessons Learned als Patterns:** `chrome-pdf-base64-image-shrink.md` (Chromes PDF-Renderer staucht große inline base64-Bilder auf 14×16 px → split+merge via pdfunite) + `puppeteer-pdf-lazy-load-fix.md` (lazy-loaded Images werden nicht gerendert → force-eager + scroll-through + image-await). Tutorial 26 in `Webentwicklung/Webdesign/`.

- **S48 Ärzte-Container-Width (PXZ 2.7.67 → 2.7.68):** Auf Hinweis Dr. Stracke (Screenshot Saul-Profile) zwei schmalere Container an Hero-Container-Breite angeglichen — `.pxz-arzt-vita-inner` und `.pxz-arzt-cta-inner` von 760 → 1080 px. Gilt für alle 8 Ärzte-Pages (gleiches Template). Tradeoff dokumentiert: Lesbarkeit bei langen Bios (~90 statt ~65 Zeichen pro Zeile), bei Bedarf Mittelweg 900 px möglich.

- **Pre-Flight S28-Ende:** verify.sh ✅ alle 4 §-Checks grün, smoke-http.sh ✅ 5/5 HTTP 200, Sanitizer-Probe ✅ alle Nexus-Dateien im Budget. **Achtung:** Diese SESSION_RESUME.md ist mit 81 KB / ~20.250 Tokens **an der Hard-Warn-Schwelle** (LL-044.21.2) — Rotation der historischen §1-Blöcke nach `_archive/sessions/2026-04/` ist **erste Aufgabe der Folgesession**.

- **2 offene Vault-Anweisungen** in `Nexus/_memory/pending-instructions.md` — wurden in dieser Session nicht angesprochen, sollten zu Folge-Session-Start gesichtet werden (LL-045).

**[Vorheriger Stand, historisch — Session 27 (S46 Slider-Redesign + Mobile-Audit)]:** PXZ_VERSION 2.7.63 live auf Local by Flywheel (Cluster-Mini-02). Theme-Commits `2927f37` (S46 Mobile + EN/FR/ES Nav-Parity) + `7653efa` (S46 Fullbleed-Slider + Homepage-Carousel + Aktuelles-Banner) + alle Vorgänger.
- **Slider-Redesign (S46):** Bestehender Room-Slider erweitert um zweiten Layout-Modus `data-layout="fullbleed"` (Postmeta `pxz_slider_layout`). Bild oben (16:9) + Caption darunter (chalk-bg) als Geschwister im Slide-flex-column. Pfeile auf Bild-Mitte via aspect-ratio-Anchor-Trick (Controls-Block bekommt 16/9-Aspect → top:50% = Bild-Mitte ohne JS-Math). Auto-Play 5s mit Wrap-Around, Pause auf Hover/Focus/visibilitychange, prefers-reduced-motion-respektiert.
- **Standort-Pages auf fullbleed:** 9691 (Hauptpraxis) + 9693 (Zweigpraxis) mit Postmeta `pxz_slider_layout=fullbleed`. Aus 9691 wurden 2 Hochkant-Slides entfernt (Flur-Eingangsbereich 9806 + Flur-Behandlungstrakt 9834) — bleibt bei 8 Querformat-Slides. Backup `_backup/S46-pre-cleanup-{9691,9693}.txt`.
- **Homepage-Slider:** `inc/homepage-slider-data.php` aggregiert media-text-Blöcke aus 9691+9693 mit Datum-stabilem Fisher-Yates-Shuffle (Seed = `date('Ymd')`). `inc/slider-render.php` enthält `pxz_render_homepage_slider()`, `pxz_render_fullbleed_slide()` und `pxz_render_aktuelles_banner()`. Hero-Bild-Spalte in `template-homepage.php` zeigt jetzt Slider + Aktuelles-Banner darunter.
- **Aktuelles-Banner (Logo-Rot):** Ersetzt den ursprünglich geplanten Aktuelles-Slide in der Carousel. Steht permanent unter dem Slider, drei-zeilig (Heading „Aktuelles: Warteliste für Neupatienten" in Logo-Rot, Body, Link auf `/service/neupatienten/`). 1px roter Border + 4px linker roter Akzent.
- **Hero-Komponenten umgestaltet:** Hero-CTAs entfernt (waren `Termin anfragen` + `Leistungen ansehen →`). Header-CTA prominent vergrößert (font 34px desktop / 17px mobile, padding 18×60 / 8×18, fett 700) als Ersatz. Header-CTA-Label gekürzt: `Termin` (DE) / `Appointment` (EN) / `Rendez-vous` (FR) / `Cita` (ES) via neues Feld `cta_appointment_short` — lange Variante bleibt für Final-CTA + Mobile-Sticky.
- **Header-Skalierung gestaffelt:** Logo 110/150/240/296 px, Wordmark „Praxiszentrum" 1.4/2/2.5/3.25rem, Hauptmenü 1.75/1.85rem (Desktop S/L), Submenü 1.25rem, Sprachen-Switcher fills CTA-width via `space-between`.
- **EN/FR/ES Header-Nav-Parität:** Alle drei Sprachen jetzt strukturidentisch mit DE — 5 Top-Items (Practice/Cabinet/Consulta · Diagnostics/Diagnostic/Diagnóstico · Services/Prestations/Servicios · Service/Service/Servicio · Contact/Contact/Contacto) mit übersetzten Sub-Items. Hrefs auf DE-Slugs (WPML-Routing in Sprint 3).
- **Nav-Aktuelles raus:** Item „Aktuelles" aus DE-Praxis-Sub entfernt + match_prefix-Liste aktualisiert. EN/FR/ES hatten keinen Aktuelles-Eintrag.
- **filemtime-Cache-Busting:** `pxz_asset_ver()`-Helper in `functions.php`, used für Slider-CSS+JS. Bei jeder Datei-Änderung wechselt automatisch die `?ver=`-URL. Andere Assets nutzen weiter `PXZ_VERSION` manuell.
- **Mobile-Audit-Fixes:** Logo + CTA + Wordmark + Caption-Schrift auf Mobile (< 768px) defensiv reduziert, damit Logo+Burger+CTA auf 320–375px-Phones passen. Caption-Body 16px statt globale 26px (--pxz-t6-size). Tablet-Tier 768–1099px bekommt intermediate CTA-Größe (font 22 / 12×32 / 56). Desktop ≥1100px bleibt prominent.
- **Spec:** `specs/sprint-2/S46_homepage-slider-fullbleed.md` (Verständnis, Lösung mit 8 Architektur-Entscheidungen, 10 Acceptance-Kriterien). Umsetzung mit Abweichungen: Aktuelles-Slide → Aktuelles-Banner (extracted from carousel), Aspect-Ratio 21:9 → 16:9 (besseres Bild-Cropping bei 4:3-Quellbildern).
- **3 neue Patterns:** `wp-asset-filemtime-versioning.md`, `css-rule-duplication-cascade-trap.md`, `figure-and-caption-as-siblings-not-nested.md` (alle in `Nexus/_memory/patterns/`).
- **Offene Folge-Aufgaben:** Responsive-Audit Vollkomplett (Dr. Strackes Wahl: ans Projektende verschoben). CSS-Duplikation in nav.css ↔ homepage.css beseitigen (Refactor in Sprint-3). Tablet-Range 768–1099px nochmal prüfen (Header bei 1100px-Übergang).

**[Vorheriger Stand, historisch — Session 26 (S45 Room-Slider)]:** PXZ_VERSION 2.7.53. Theme-Commits `901b602` (S45 Dynamic-Height) + `ff3720a` (S45 Room-Slider) + `6214b33` (S43-Pending) + `e3e0631` (S44 Submenu-Rename) + `9907b7f` (S44 SSoT+Nav).
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
