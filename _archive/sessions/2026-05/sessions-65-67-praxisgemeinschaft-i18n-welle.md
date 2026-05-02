# Sessions 65–67 (2026-05-02) — Praxisgemeinschaft i18n-Welle (EN+FR+ES)

> **Cold-Archive** — ausgelagert am 2026-05-02 (S68-Session-Ende) per LL-053a
> Sliding-Window-Rotation. Ursprünglich detailliert in
> `sites/praxis-webseite/SESSION_RESUME.md` §1.
>
> **Zusammenhängender Sprint:** 12 Pages des Clusters „Praxisgemeinschaft"
> sequentiell in EN (S65), FR (S66), ES (S67) übersetzt — gleicher Tag,
> gleiches Pattern (single-language Bridge), Pattern-Reife stieg von 1-fach
> auf 3-fach validiert (Voraussetzung für S68 Pattern-Generation 2).
>
> **Anchors:** [#s65](#s65) · [#s66](#s66) · [#s67](#s67)

---

<a id="s67"></a>
### S67 (2026-05-02) — ES-Cluster „Praxisgemeinschaft" (12 Pages)

**Auslöser:** Wiederaufnahme nach S66. Nach Lungenfunktion-Drift-Befund (FR-Page
4869 von 2021 mit `translatedWithWPMLTM`-Marker, drift gegen aktuelle DE)
delegierte Dr. Stracke die Wahl an Claude. Entscheidung: **ES-Welle (Option a)
vor Cluster-Untersuchungen-Sweep (Option b)**, um Pattern dreifach zu
stabilisieren bevor Update-Mode-Erweiterung kommt.

**Phase-3-Umsetzung:**

`sites/praxis-webseite/tools/s67-es-cluster-praxisgemeinschaft.php` (Klon von
S66, ~270 Z, ES-Sprach-Code + ES-Strings, idempotent, Dry-Run + `--commit`).
DB-Backup: `_backups/s67/pre-s67-20260502-224053.sql` (17 MB, gitignored).

**12 ES-Pages angelegt (IDs 9960–9971):**

| trid | DE-Slug | ES-ID | Übersetzungstiefe |
|---:|---|---:|---|
| 1123 | praxis | 9960 | Title „Comunidad de consulta médica" (Glossar `pxz_g('praxisgemeinschaft','es')`); Self-Render |
| 1124 | team | 9961 | Title „Nuestro equipo"; Self-Render |
| 14749 | unsere-partner | 9962 | Title „Nuestros socios" (Glossar `partner:es=Socios`); Self-Render |
| 1127–1133 | 7 Doctor-Pages | 9963–9969 | Titles invariant; Self-Render |
| 1138 | standorte | 9970 | Title „Nuestros centros" + 3 Postmeta („Nuestros centros" / „Dos direcciones. Una sola filosofía." / leer) + 6965 Z post_content vollständig übersetzt |
| 1139 | zweigpraxis-bockenheimer | 9971 | Title „Consulta secundaria Bockenheimer Landstraße" + 2 Postmeta + 2151 Z post_content vollständig übersetzt |

**Phase-4-Smoke-Tests (alle ✅):**
- 12 ES-Pages publish + WPML-Trid-Bridge sauber
- Inventar: DE 64 / EN 51 / FR 50 / ES 48 (+12)
- Idempotenz: Re-Run 12× EXISTS
- Doctor-Slug-Identität 7/7 OK (template-arzt.php-Lookup intakt)
- Postmeta-Override (eyebrow „Nuestros centros", H1 „Dos direcciones. Una sola filosofía.") korrekt
- 0 PHP-Errors, PHP-Lint clean
- Glossar-Compliance: „Praxisgemeinschaft" → „comunidad de consulta médica" (NICHT „consulta de grupo")

**S67 — Files NEU / MOD:**
- **NEU:** `sites/praxis-webseite/tools/s67-es-cluster-praxisgemeinschaft.php`
- **NEU:** `sites/praxis-webseite/_backups/s67/pre-s67-20260502-224053.sql` (gitignored)
- **MOD:** keine Theme-Code-Änderung
- **WP-DB:** 12 neue Pages (9960–9971), 12 neue `wp_icl_translations`, ~80 neue Postmeta

**Pattern-Reife nach S67:** Skript-Pattern in 3 Sprachen identisch durchgelaufen
(EN, FR, ES). Dreifach-Validierung erlaubt jetzt Pattern-Doku ω in
`Nexus/_memory/patterns/wpml-bridge-cluster-import.md` mit hoher Sicherheit
(weniger spekulative Generalisierung). Nächster logischer Schritt: Pattern um
**Update-Mode** erweitern (für Drift-Fix der 2021-Pages mit
`translatedWithWPMLTM`-Marker, siehe Verbindliche Arbeitsregel S66).

**Nächste Front bei Wiederaufnahme S68:**
- (a) **EN-Welle Cluster „Untersuchungen"** (~13 Pages) **mit Skript-Update-Mode** — neue Pages anlegen + bestehende FR/ES-Drift (z. B. Lungenfunktion FR 4869) **gleich mit-fixen**. Konsolidierter Cluster-Sweep.
- (b) Pattern-Doku ω schreiben (jetzt reif nach 3-facher Validierung)
- (c) Templates IT/pt-PT erweitern (Folge-Punkt ψ)
- (d) Diagnose χ (lokales Routing-Bug)
- (e) Native-Quality-Review der bisherigen S65–S67-Pages durch Dr. Stracke

---

<a id="s66"></a>

### S66 (2026-05-02) — FR-Cluster „Praxisgemeinschaft" (12 Pages)

**Auslöser:** Wiederaufnahme nach S65. Aus dem 6-Optionen-Architekten-Statement
(A=FR-Welle / B=ES-Welle / C=EN-nächster-Cluster / D=Diagnose χ / E=Templates IT/pt-PT / F=Pattern-Doku) wählte Dr. Stracke **Option A** (FR-Welle Cluster
Praxisgemeinschaft). Spec-Freigabe nach Phase-2-Review der FR-Title-/Eyebrow-/H1-
Vorschläge.

**Phase-2-Spec-Konsens:**
- Skript-Pattern aus S65 1:1 wiederverwendet, nur Sprach-Code `en→fr` und FR-Strings.
- Glossar-Compliance: „Praxisgemeinschaft" → **„cabinet médical en communauté
  de pratique"** (NICHT „cabinet de groupe"; Rechtsform-Begriff).
- Doctor-Titles invariant (Slugs bereits FR; team-data.php-Lookup unabhängig vom Title).
- 2 Standard-Template-Pages (`standorte`, `zweigpraxis-bockenheimer`) bekamen
  Volltext-Übersetzung post_content + Postmeta.

**Phase-3-Umsetzung:**

`sites/praxis-webseite/tools/s66-fr-cluster-praxisgemeinschaft.php` (Klon von
S65, ~270 Z, idempotent, Dry-Run + `--commit`). DB-Backup vor Insert:
`_backups/s66/pre-s66-20260502-222041.sql` (17 MB, gitignored via `sites/*/_backups/`).

**12 FR-Pages angelegt (IDs 9948–9959):**

| trid | DE-Slug | FR-ID | Template | Übersetzungstiefe |
|---:|---|---:|---|---|
| 1123 | praxis | 9948 | template-praxisgemeinschaft.php | nur Title („Cabinet médical en communauté de pratique"); Content via Self-Render |
| 1124 | team | 9949 | template-team.php | nur Title („Notre équipe"); Self-Render |
| 14749 | unsere-partner | 9950 | template-partner.php | nur Title („Nos partenaires"); Self-Render |
| 1127 | docteur-saul | 9951 | template-arzt.php | Title invariant (Person bereits FR-betitelt) |
| 1133 | dr-arbitmann | 9952 | template-arzt.php | Title invariant |
| 1128 | dr-barcsay | 9953 | template-arzt.php | Title invariant |
| 1130 | dr-jawich | 9954 | template-arzt.php | Title invariant |
| 1132 | dr-landeberg | 9955 | template-arzt.php | Title invariant |
| 1129 | dr-seelig | 9956 | template-arzt.php | Title invariant |
| 1131 | dr-shahin | 9957 | template-arzt.php | Title invariant |
| 1138 | standorte | 9958 | template-standard.php | Title („Nos cabinets") + 3 Postmeta („Nos cabinets" / „Deux adresses. Une seule philosophie." / leer) + 6992 Z post_content komplett übersetzt |
| 1139 | zweigpraxis-bockenheimer | 9959 | template-standard.php | Title („Cabinet annexe Bockenheimer Landstraße") + 2 Postmeta + 2158 Z post_content komplett übersetzt |

**Phase-4-Smoke-Tests:**

| Test | Resultat |
|---|---|
| 12 FR-Pages publish + WPML-Trid-Bridge | ✅ DB-Query bestätigt |
| Inventar publish: DE 64 / EN 51 / FR 50 (+12) / ES 36 | ✅ |
| Idempotenz (Skript-Re-Run) | ✅ alle 12 melden „EXISTS" |
| Doctor-Slug-Identität (template-arzt.php Lookup) | ✅ 7/7 FR-Slug = DE-Slug |
| Postmeta-Spotcheck standorte FR (`pxz_standard_h1`/`pxz_standard_eyebrow`) | ✅ FR-Strings korrekt |
| PHP-Errors beim Insert | 0 |
| PHP-Lint Skript | clean |
| Browser-Smoke `?lang=fr` | ⏳ analog S65 — lokales Routing-Bug χ noch offen |

**S66 — Files NEU / MOD:**

- **NEU:** `sites/praxis-webseite/tools/s66-fr-cluster-praxisgemeinschaft.php`
  (Cortex-Web-Repo, ~270 LOC, FR-Variant des S65-Skripts; Re-runnable)
- **NEU:** `sites/praxis-webseite/_backups/s66/pre-s66-20260502-222041.sql`
  (Rollback-Point, 17 MB, gitignored)
- **MOD:** Theme-Code keine Änderung — Theme-HEAD bleibt `aba9982`
- **WP-DB:** 12 neue Pages (9948–9959), 12 neue `wp_icl_translations`-Einträge,
  ~80 neue `wp_postmeta`-Einträge

**Cross-Cutting (LL-058) für Folge-Wellen:**

- **ES-Welle für gleichen Cluster (Option B aus S66-Statement)** ist nun
  doppelt validiertes Pattern (S65 EN, S66 FR). ES-Skript wäre `s67-es-...`,
  identische Mechanik. Skript-Pattern hat sich als Tier-1-Asset erwiesen.
- **Pattern-Reife (Folge-Punkt ω):** Nach S66 reicht eine 3. Welle (ES) für
  Pattern-Doku-Stabilisierung in `Nexus/_memory/patterns/wpml-bridge-cluster-import.md`.
- **IT/pt-PT bleiben blockiert (Folge-Punkt ψ):** Templates `praxisgemeinschaft`/
  `team`/`partner`/`arzt` haben hardcoded `$pxz_pg_copy` nur in DE/EN/FR/ES.
  Vor IT/pt-PT-Welle: Sprach-Schichten erweitern (analog S63-Stammdaten-Pattern).

**S66 — Open Items / Folge-Punkte:**

- **χ unverändert:** Lokales `?lang=fr|en`-Routing kapotterer als Live (AIOSEO-
  Canonical-Override-Verdacht). Live nicht betroffen, Browser-Smoke FR via
  Cookie-Switch oder nach Live-Deploy.
- **ψ unverändert:** Templates IT/pt-PT-Schicht erweitern.
- **ω hochgestuft:** Nach S67 ES-Welle ist Pattern-Doku reif zum Schreiben.
- **Folge-Wellen verbleibend:** ES (28) für Cluster Praxisgemeinschaft;
  EN-Wellen für 4 weitere Cluster (Untersuchungen ~13 / Labor+CheckUps ~17 /
  Service ~6 / Legal+Karriere ~3); IT+pt-PT je 78 Pages (blockiert durch ψ);
  Native-Quality-Review.
- **Carry-over S62 unverändert:** π Browser-Smoke-Test, ρ SMTP-Brücke Live,
  σ Datenschutz-Slug Live verifizieren, τ Tutorial WP-Theme-AJAX.

**Nächste Front bei Wiederaufnahme S67:** Empfehlungs-Set unverändert zur
S66-Wahl, mit Pattern jetzt zweifach validiert:
- (a) **ES-Welle Cluster Praxisgemeinschaft** (12 Pages, ½–1 Session, identisches Pattern)
- (b) EN-Welle nächster Cluster „Untersuchungen" (~13 Pages, 1 Session)
- (c) Templates IT/pt-PT erweitern (Folge-Punkt ψ)
- (d) Diagnose χ (lokales Routing-Bug)
- (e) Pattern-Doku ω (nach c oder gleich vor c als Voraussetzung für IT/pt-PT-Welle)

**Verbindliche Arbeitsregel (S66-Befund Lungenfunktion 2026-05-02):**
Bei jedem Cluster-Sweep (Untersuchungen, Labor, Service, Legal/Karriere)
werden die bestehenden FR/ES-Drift-Pages dieses Clusters mit
`translatedWithWPMLTM`-Marker (WPML-AT Auto-Übersetzungen aus 2021,
~23 historische Pages) **automatisch mit-korrigiert** — Skript-Pattern
muss um Update-Mode erweitert werden: bei vorhandener Target-Page mit
WPML-AT-Marker → Content + `_thumbnail_id` + Postmeta auf aktuellen
DE-Stand überschreiben statt EXISTS-skip. Drift-Beispiel Lungenfunktion:
DE-ID 292 (2 320 Z, Image 4128) vs FR-ID 4869 (6 596 Z, Image 4177,
WPML-AT 2021-02-27). Damit ist Open Item #9 (Native-Review) ohne
Extra-Sprint erledigt — pro Cluster-Welle ein Cluster gleichzeitig
neu-angelegt + drift-gefixt.

---

<a id="s65"></a>

### S65 (2026-05-02) — EN-Cluster „Praxisgemeinschaft" (12 Pages)

**Auslöser:** Wiederaufnahme nach S64. Aus dem 4-Optionen-Architekten-Statement
(B/C/D/E) wählte Dr. Stracke **Option B** (Page-Cluster-Welle EN starten),
mit Direktive „sicherste Umsetzung". Sub-Scope-Wahl an Claude delegiert →
B-Komplett (12 Pages) statt B-Pilot, weil das Risiko nach Template-Inspektion
deutlich kleiner war als angenommen.

**Befunde aus Phase-1-Verständnis (kritisch):**

1. **Self-Render-Templates entdeckt (LL-058 Cross-Cutting):**
   Die Templates `template-praxisgemeinschaft.php`, `template-team.php`,
   `template-arzt.php`, `template-partner.php` rendern **alle Inhalte aus
   internen PHP-Arrays** (`$pxz_pg_copy`, hartkodiert in DE/EN/FR/ES seit S59)
   und ignorieren `post_content` komplett. Konsequenz: für 10 von 12 Pages
   gab es **nichts inhaltlich zu übersetzen** — nur die WPML-Brücke war zu
   schließen. Risiko deutlich geringer als geplant.
2. **Standard-Template-Pages (2 Pages):** `standorte` und `zweigpraxis-bockenheimer`
   nutzen `template-standard.php`, das Postmeta + `the_content()` rendert.
   Diese 2 Pages benötigten echte Übersetzung (post_content + Postmeta).
3. **WPML-URL-Strategie (lokal kaputt, Live OK):** `language_negotiation_type=3`
   (URL-Parameter `?lang=en`). Live-Site reagiert korrekt (`?lang=en` → 200),
   **lokal redirected `?lang=en` zu DE** (vermutlich AIOSEO-Canonical-Override
   oder Local-by-Flywheel-Cache). Lokales Routing-Problem ist isoliert,
   blockiert nicht die DB-Inserts. Folge-Punkt χ (siehe unten).
4. **Doctor-Page-Slug-Match:** `template-arzt.php` identifiziert Doctor via
   `$current_slug = get_post()->post_name`. Daher müssen EN-Pages **identische
   Slugs** wie DE-Pages haben (Direct-DB-Insert umgeht `wp_unique_post_slug()`).

**Phase-3-Umsetzung — neues Tool:**

`sites/praxis-webseite/tools/s65-en-cluster-praxisgemeinschaft.php` (~250 Z)
— Idempotentes WPML-Bridge-Skript. Modus: Dry-Run (default) + `--commit`.
Pro Page:
- `wp_posts`-Insert (direkt, behält DE-Slug; status=publish)
- `wp_postmeta`-Copy von DE + Overrides für EN-Strings
- `wp_icl_translations`-Insert (gleiche trid, language_code=en, source=de)

DB-Backup vor Insert: `_backups/s65/pre-s65-pilot-20260502-212404.sql` (17 MB,
wp_posts + wp_postmeta + wp_icl_translations).

**12 EN-Pages angelegt (IDs 9936–9947):**

| trid | DE-Slug | EN-ID | Template | Übersetzungstiefe |
|---:|---|---:|---|---|
| 1123 | praxis | 9936 | template-praxisgemeinschaft.php | nur Title („Shared medical practice"); Content via Self-Render |
| 1124 | team | 9937 | template-team.php | nur Title; Content via Self-Render |
| 14749 | unsere-partner | 9938 | template-partner.php | nur Title; Content via Self-Render |
| 1127 | docteur-saul | 9939 | template-arzt.php | Title invariant; Bio aus team-data.php |
| 1133 | dr-arbitmann | 9940 | template-arzt.php | dito |
| 1128 | dr-barcsay | 9941 | template-arzt.php | dito |
| 1130 | dr-jawich | 9942 | template-arzt.php | dito |
| 1132 | dr-landeberg | 9943 | template-arzt.php | dito |
| 1129 | dr-seelig | 9944 | template-arzt.php | dito |
| 1131 | dr-shahin | 9945 | template-arzt.php | dito |
| 1138 | standorte | 9946 | template-standard.php | Title + 3 Postmeta + 6644 Z post_content komplett übersetzt |
| 1139 | zweigpraxis-bockenheimer | 9947 | template-standard.php | Title + 2 Postmeta + 2101 Z post_content komplett übersetzt |

**Glossar-Compliance:** `pxz_g()`-Begriffe wurden für die Übersetzungen
herangezogen — wichtigste Anwendung: „Praxisgemeinschaft" → **„shared
medical practice"** (NICHT „joint practice"; siehe Memory
`project_praxis_rechtsform_praxisgemeinschaft.md`).

**Smoke-Tests (Phase 4):**

| Test | Resultat |
|---|---|
| 12 EN-Pages publish + WPML-Trid-Bridge | ✅ DB-Query bestätigt |
| Inventar publish: DE 64 / EN 51 (+12) / FR 38 / ES 36 | ✅ |
| Idempotenz (Skript-Re-Run) | ✅ alle 12 melden „EXISTS" |
| Doctor-Slug-Identität (template-arzt.php Doctor-Lookup) | ✅ EN-Slugs = DE-Slugs |
| PHP-Errors beim Insert | 0 |
| Browser-Smoke `?lang=en` | ⏳ blockiert durch lokalen Routing-Bug χ |

**S65 — Files NEU / MOD:**

- **NEU:** `sites/praxis-webseite/tools/s65-en-cluster-praxisgemeinschaft.php`
  (Cortex-Web-Repo, ~250 LOC, Re-runnable für künftige Cluster)
- **NEU:** `sites/praxis-webseite/_backups/s65/pre-s65-pilot-20260502-212404.sql`
  (Rollback-Point, 17 MB, gitignored empfohlen)
- **MOD:** keine Theme-Code-Änderungen — Theme-HEAD bleibt `aba9982`
- **WP-DB:** 12 neue Pages (9936–9947), 12 neue `wp_icl_translations`-Einträge,
  ~80 neue `wp_postmeta`-Einträge

**Cross-Cutting (LL-058) für Folge-Wellen:**

- **FR/ES-Welle für gleichen Cluster** kann mit identischem Skript-Pattern
  (Sprach-Code austauschen, EN-Übersetzungen für Postmeta/Content durch FR/ES
  ersetzen). Vorlage steht.
- **IT/pt-PT-Welle benötigt Vorarbeit:** Templates `praxisgemeinschaft`,
  `team`, `partner`, `arzt` haben nur DE/EN/FR/ES in `$pxz_pg_copy` —
  müssen um IT/pt-PT-Schicht erweitert werden, BEVOR IT/pt-PT-Pages
  Sinn ergeben (siehe Folge-Punkt ψ).
- **Skript-Pattern** ist Tier-1-Asset, gehört in `Nexus/_memory/patterns/`
  als „wpml-bridge-cluster-import.md" (siehe Folge-Punkt ω).

**S65 — Open Items / Folge-Punkte:**

- **χ NEU:** Lokales `?lang=en`-Routing kapotterer als Live. Diagnose-Ansatz:
  AIOSEO-Canonical-Settings prüfen, ggf. `wp_redirect`-Filter im Theme
  testen. Live ist nicht betroffen (curl `?lang=en` → 200), Browser-Smoke
  durch Dr. Stracke daher entweder lokal mit Workaround (Cookie-Switch)
  oder nach Live-Deploy.
- **ψ NEU:** Templates `template-praxisgemeinschaft.php`, `template-team.php`,
  `template-partner.php`, `template-arzt.php` haben hardcoded `$pxz_pg_copy`
  nur in DE/EN/FR/ES. Für IT/pt-PT-Welle müssen die Sprach-Schichten
  erweitert werden (analog zu S63-Stammdaten-Pattern).
- **ω NEU:** Pattern `wpml-bridge-cluster-import.md` in
  `Nexus/_memory/patterns/` schreiben (S65 als Vorlage).
- **Carry-over Wellen 2–5:** FR (26 fehlend), ES (28 fehlend), IT (78 neu),
  pt-PT (78 neu) für gesamten Cluster Praxisgemeinschaft + nachfolgende
  Cluster (Untersuchungen, Labor, Service, Legal/Karriere).
- **Carry-over S62 unverändert:** π Browser-Smoke-Test, ρ SMTP-Brücke Live,
  σ Datenschutz-Slug Live verifizieren, τ Tutorial WP-Theme-AJAX.

**Nächste Front bei Wiederaufnahme S66:** Either (a) FR/ES-Welle für
Cluster Praxisgemeinschaft (gleiches Skript-Pattern, ½–1 Session), (b)
nächster Cluster „Untersuchungen" in EN starten, (c) Templates für IT/pt-PT
erweitern (Folge-Punkt ψ), (d) lokales Routing-Problem χ diagnostizieren.

---
