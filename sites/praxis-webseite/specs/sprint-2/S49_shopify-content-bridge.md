# S49 — Shopify-Content-Bridge: Diagnostik · Labor · Leistungen

> **Status:** Phase 2 (Lösungsdesign) — wartet auf Freigabe Dr. Stracke
> **Erstellt:** 2026-04-27 Session 49 (Folge von S47 Mid-Range-Reality-Check)
> **Architekten-Modus:** 4-Phasen (Verständnis → Lösungsdesign → Umsetzung → Selbstprüfung)
> **Verwandt:** `specs/cross-site-transfer/ARCHITECTURE.md`, `PATTERNS.md`,
> `specs/sprint-2/S2.3-checkups` (Bridge-Pattern E produktiv)

---

## §1 Auftrag (Phase 1 — Verständnis)

Dr. Stracke (2026-04-27, Session-49-Start):

> „Setze Projekt Redesign Webpage fort und füge bitte auf den Seiten Diagnostik
> und Leistungen die Texte und Grafiken der Shopify Seite ein. Rücke den
> aktuellen Content der bestehenden Seiten bitte einfach nach unten, ich denke,
> dass er meistens entfallen wird. […] für die Blutentnahmen eine ähnliche
> Übersicht wie auf der Shopify Seite […] Labor sollte auch ein eigener
> Menüpunkt sein. In Zukunft werden wir häufiger den Content von Shopify auf
> die Webpage übertragen. Finde hier eine gangbare und schnelle Lösung [...].
> Auf Praxiswebseite dürfen allerdings keine Preise angeboten werden."

**Kern-Ziele:**
1. **Inhaltlich:** Shopify-Texte/Grafiken aus drei Quell-Sections (`juvantis-bluttests`, `juvantis-body-checks`, `juvantis-biomarker-hub`) auf drei Praxis-Pages übernehmen.
2. **Strukturell:** „Labor" als Top-Level-Menüpunkt etablieren.
3. **Visuell:** Bento-Grid-Übersicht für Bluttests analog Shopify.
4. **HWG-Konformität:** Keine Preise auf der Praxis-Webseite (CW-005).
5. **Strategisch:** Wiederverwendbarer Transfer-Workflow für künftige Shopify→Praxis-Übernahmen.

**Pflicht-Constraints:**
- CW-001 Trunk-Master (kein Direkt-Site-zu-Site-Kopieren).
- CW-005 Plattform-Trennung schema-erzwungen via `views.praxis.show_price=false`.
- LL-024 transparente Erklärung jedes Schritts.
- S47 Mid-Range-Header bleibt fluid (≤120 px @1100–1439 px Viewport).

---

## §2 Architektur-Entscheidungen (Phase 2 — Freigabe-Punkte)

Dr. Stracke hat in Session-49-Pre-Spec gewählt:

| Achse | Entscheidung |
|---|---|
| **E1 Pages-Mapping** | Achse-1-Variante (Diagnostik=Body-Checks · Labor=Bluttests+Biomarker · Leistungen=Mix) |
| **E2 Transfer-Workflow** | **W2 Goldstandard** — Pattern B (Trunk-YAML + Theme-Section + Renderer) |
| **E3 Menü-Umbau** | **M1b** — 6 Top-Level: Praxis · Leistungen · Diagnostik · Labor · Service · Kontakt (Patient-Logik) |

---

## §3 Pages-Mapping (final)

### §3.1 Diagnostik (`/diagnostik/`, Page-ID 9682)

**Quell-Section:** `sections/juvantis-body-checks.liquid` (Apple-Style, schwarz/weiß-Modus)

**Trunk-YAML:** `trunk/content/pages/_shared/diagnostik.yaml`

**Inhalts-Bausteine (top → bottom):**

| Slot | Quelle Shopify | Praxis-Anpassung |
|---|---|---|
| Eyebrow | „Apparative Diagnostik" | unverändert |
| Hero-Heading | „Du bist mehr als die Summe deiner Teile." | „Sie sind mehr als die Summe Ihrer Teile." (Sie-Form) |
| Hero-Intro | (Shopify-Default) | leicht umformulieren auf Praxis-Sprache |
| USP-Box (dark) | „Was uns unterscheidet" + Text | übernommen |
| Bento-Grid | Shopify lädt Collection `ultraschalluntersuchungen` (Featured-Images + Titel) | **Praxis-Variante:** Karten zu den 9 Diagnostik-Detail-Pages (Sono, Echo, Carotis, Schilddrüse, Beingefäße, EKG, Lufu, Tumor-Screening + Verweis-Karte „Labor →"). Bilder aus WP-Media-Library oder neu von Sanexio gespiegelt. |
| Timeline | „So läuft dein Body Check ab" (4 Schritte) | „So läuft Ihre Untersuchung ab" |
| CTA | „Jetzt Body Check buchen" | „Termin vereinbaren" → `/service/terminanfrage/` |
| Bestehender Content | Der bisherige (kurze) Hub-Content | rückt unter Bento-Grid; ersatzlos entbehrlich (nur 283 Zeichen) |

### §3.2 Labor (`/labor/`, Page-ID 296 — bereits vorhanden, wird umgewidmet)

**Quell-Sections:** `sections/juvantis-bluttests.liquid` + Sekundär `juvantis-biomarker-hub.liquid`

**Trunk-YAML:** `trunk/content/pages/_shared/labor.yaml`

**Inhalts-Bausteine:**

| Slot | Quelle Shopify | Praxis-Anpassung |
|---|---|---|
| Eyebrow | „Labordiagnostik" | unverändert |
| Hero-Heading | „Dein Blut weiß mehr, als du denkst." | „Ihr Blut weiß mehr, als Sie denken." |
| Hero-Intro | Shopify-Default | gekürzt auf Praxis-Sprache |
| Bento-Grid | Shopify-Collection `laboruntersuchung` mit ~10 Bluttest-Produkten (mit Preisen) | **Praxis-Variante:** Karten zu Bluttest-Kategorien aus kuratiertem Trunk-Set (initial 4–6 Karten: Basis, Cardio, Hormone, Vitamine/Mineralien, Schilddrüse, Tumormarker — Inhalts-Auswahl in §3.4 unten). **Keine Preise.** Karten linken auf `/labor/<kategorie>/` (Detail-Pages folgen später) oder cross-brand auf `sanexio.eu/pages/<...>` (mit ext-Hint). |
| Process-Steps | „So funktioniert dein Bloody Check" (4 Schritte: Termin · Abnahme · Analyse · Ergebnis) | „So läuft Ihre Blutentnahme ab" |
| Biomarker-Hub-Verweis | (eigenständig in Shopify) | Card-Verweis im unteren Bereich: „Was Ihre Werte bedeuten" → cross-brand-cta auf `sanexio.eu/pages/biomarker` |
| CTA | „Jetzt Bloody Check buchen" + Preis-Teaser | Preis-Teaser **entfernt**. CTA „Termin vereinbaren" → `/service/terminanfrage/` |

### §3.3 Leistungen (`/leistungen/`, Page-ID 261)

**Quell-Sections:** Mix aus `juvantis-body-checks` (Hero-Pattern) + Eigen-Komposition

**Trunk-YAML:** `trunk/content/pages/_shared/leistungen.yaml`

**Inhalts-Bausteine:**

| Slot | Quelle | Praxis-Anpassung |
|---|---|---|
| Eyebrow | NEU | „Leistungsspektrum" |
| Hero-Heading | NEU | „Was wir für Sie tun." |
| Hero-Intro | NEU | „Hausärztliche Versorgung mit acht Fachrichtungen unter einem Dach. Vorsorge, Behandlung, Begleitung — abgestimmt auf Sie." |
| Bento-Grid | NEU (kein direkter Shopify-Quell-Hub, weil Praxis-Leistungen nicht 1:1 mit Sanexio-Produkten matchen) | Karten zu: Check-Up-Programme · Impfungen · Reisemedizin · IGeL-Leistungen · Fragebögen · Rund ums Labor · Bridge: „Laborcheck Basis (Selbstzahler)" → `/basic-check/` |
| Cross-Brand-Banner | aus `inc/cross-brand-cta.php` (existiert) | „Auf der Suche nach Bluttest-Selbstzahlerleistung? Sanexio.eu" |
| CTA | NEU | „Termin vereinbaren" |
| Bestehender Content | quasi leer (119 Zeichen) | ersatzlos entfallen |

### §3.4 Bluttest-Karten-Liste (offene Detail-Frage)

Bento-Grid auf `/labor/` braucht eine Liste. Drei Optionen:

| Option | Inhalt | Trunk-Effort |
|---|---|---|
| **L-A** Praxis-Eigen-Liste | 4–6 Bluttest-Kategorien aus Praxis-Selbstzahler-Katalog (Basis, Cardio, Hormone, Vitamine, Schilddrüse, Tumor) | Initial-Inhalt schreibt Dr. Stracke / Claude aus Praxis-Wissen, kein Shopify-Sync nötig |
| **L-B** Sanexio-Spiegel | Alle 10–12 Sanexio-Bluttest-Produkte (ohne Preise, „auf Anfrage") | Trunk-YAMLs aus Shopify extrahieren (cw-transfer pull shopify:product), `views.praxis.show_price=false` setzen |
| **L-C** Hybrid | 4 Praxis-Eigen-Karten + 4 Sanexio-Selbstzahler-Karten als Cross-Brand-Bridge | Beide Schritte; klarere Trennung „was wir hier tun" vs. „was Sanexio anbietet" |

**Vorschlag im Spec:** L-A für Phase 3 (schnell live), L-B optional in Folge-Session als Trunk-Migration der Bluttest-Produkte. L-C als Endzustand.

→ **Offen für Dr.-Stracke-Wahl bei Spec-Freigabe.**

---

## §4 Trunk-Schema-Erweiterung

`trunk/schema/page.schema.json` hat aktuell nur 3 Section-Types (`intro`, `team-grid`, `service-body`). Wir brauchen 5 neue Section-Types für Hub-Pages:

```yaml
sections:
  - type: hero               # NEU: Eyebrow + H1 + Lead
  - type: usp-box            # NEU: Dark-Box mit Heading + Text
  - type: bento-grid         # NEU: items[] mit Card-Daten
  - type: process-steps      # NEU: numbered steps
  - type: cta-banner         # NEU: Heading + Sub + CTA
```

**Schema-Erweiterung in §3 hinzugefügt** (siehe Implementation-Notes Phase 3).

**Beispiel-Skelett `trunk/content/pages/_shared/labor.yaml`:**

```yaml
id: labor
site: shared
slugs:
  praxis: labor
  juvantis: bluttests

title:
  de: Labor
  en: Laboratory
  fr: Laboratoire
  es: Laboratorio

views:
  praxis:
    show_prices: false
    cta_url: /service/terminanfrage/
    cta_label:
      de: Termin vereinbaren
  juvantis:
    show_prices: true
    cta_url: /pages/bluttests
    cta_label:
      de: Jetzt Bloody Check buchen

wp:
  page_template: template-labor.php
  legacy_ids: [296]

sections:
  - type: hero
    eyebrow:
      de: Labordiagnostik
    heading:
      de: Ihr Blut weiß mehr, als Sie denken.
    lead:
      de: |
        Eine Blutuntersuchung in unserer Praxis liefert Ihnen
        einen fundierten Einblick in Ihre Gesundheit. Sprechen
        Sie uns an — wir beraten Sie individuell.

  - type: bento-grid
    heading:
      de: Unsere Untersuchungen
    items:
      - id: basis-blutbild
        title:
          de: Großes Blutbild
        teaser:
          de: 15 Standard-Parameter — Eisenwerte, Entzündung, Leber, Niere.
        image: media://labor-blutbild
        href: /labor/grosses-blutbild/
      - id: hormone
        title:
          de: Hormon-Status
        teaser:
          de: Schilddrüse, Geschlechtshormone, Stress.
        image: media://labor-hormone
        href: /labor/hormone/
      # ... weitere

  - type: process-steps
    heading:
      de: So läuft Ihre Blutentnahme ab
    steps:
      - num: "1"
        title:
          de: Termin
        text:
          de: Termin vereinbaren — telefonisch oder online.
      - num: "2"
        title:
          de: Abnahme
        text:
          de: Blutabnahme in unserer Praxis (~5 Min., nüchtern).
      # ... 3 + 4

  - type: cta-banner
    heading:
      de: Bereit für Ihre Untersuchung?
    cta_label_ref: views.praxis.cta_label   # resolves nach View
    cta_url_ref: views.praxis.cta_url
```

---

## §5 Renderer-Strategie (WP-Adapter)

### §5.1 Erweiterung `adapters/wordpress/content-to-wp-pages.mjs`

Aktuell rendert dieser Adapter Trunk-`product.yaml` → WP-Page (für `/basic-check/` Bridge). Neu zu unterstützen:

- Section-Type `hero` → `<section class="pxz-hero pxz-hero--page-hub">…`
- Section-Type `usp-box` → `<section class="pxz-usp-dark">…`
- Section-Type `bento-grid` → `<section class="pxz-bento"><div class="pxz-bento-grid">…</div></section>`
- Section-Type `process-steps` → `<section class="pxz-process"><div class="pxz-process-steps">…</div></section>`
- Section-Type `cta-banner` → `<section class="pxz-cta-banner">…</section>`

Markup-Klassen folgen `praxiszentrum`-Theme-Konvention (`.pxz-*`). Inline-styles werden vermieden — Styles kommen aus drei neuen CSS-Modulen.

### §5.2 Theme-Templates

**Vorhanden:**
- `template-diagnostik-hub.php` (existiert) — wird angepasst, um die 5 neuen Section-Types zu rendern
- `template-leistungen.php` (existiert) — wird angepasst (gleiche Section-Types)

**Neu:**
- `template-labor.php` — analog `template-diagnostik-hub.php`

**Drei Templates rendern dieselben Section-Types** über einen gemeinsamen Helper `template-parts/page-section-renderer.php` (Single-Source-of-Truth-Prinzip aus S47-Pattern).

### §5.3 CSS

Drei neue Section-CSS-Dateien, conditional enqueued:

- `assets/css/page-hub.css` — gemeinsame Bento-Grid + Hero + USP-Box + Process + CTA-Banner-Styles
- (kein separates Page-CSS pro Hub — alle drei nutzen `page-hub.css`)

Tokens aus `tokens.css` v2 (S40 Apple Type-Scale + Praxis-Farben). KEIN Apple-Blue (`#0071e3`) — Praxis-Akzente bleiben Logo-Rot + Teal.

---

## §6 Bilder-Pipeline (CW-003)

Shopify-Quell-Bilder werden lokal gespiegelt:

```
~/Cortex/projects/Cortex-Web/_media-source/shopify-mirror/<page-slug>/
  ├── hero.jpg                  # Hero-Bild aus Shopify
  ├── card-<id>.jpg             # Bento-Grid-Karten
  └── ...
```

Workflow:
1. `tools/mirror-shopify-images.sh <page-slug>` (NEU) — zieht Featured-Images aus Shopify-API der referenzierten Collection
2. MD5-Verify nach Download
3. Resize auf max. 1200×1200 px (Praxis-Performance) via `sips`
4. Upload nach WP via `wp media import` ODER manuelles Hochladen via WP-Admin (Dr. Stracke-Wahl)
5. Trunk-YAML referenziert via `image: media://<key>` mit Eintrag in `trunk/media/registry.yaml`

→ Detail-Implementierung in Phase 3.

---

## §7 Menü-Umbau (M1b — Patient-Logik)

`inc/nav-data.php` Änderungen für DE/EN/FR/ES synchron:

**Top-Level neu:** `Praxis · Leistungen · Diagnostik · Labor · Service · Kontakt`

**Diagnostik-Submenu (entrümpelt — Labor + Labor-Detail-Pages raus):**
```
- Übersicht                        /diagnostik/
- Sonographie                       /sonographie/
- Echokardiographie                 /echokardiographie/
- Carotis Duplex                    /carotis-duplex/
- Schilddrüsen-Sonographie          /sonographie/schilddruese/
- Gefäß-Sonographie der Beine       /sonographie/beingefaesse/
- Belastungs-EKG                    /belastungs-ekg/
- Lungenfunktion                    /lungenfunktion/
- Tumor-Screening                   /tumorscreening/
```

**Labor-Submenu (NEU):**
```
- Übersicht                         /labor/
- (später) Großes Blutbild          /labor/grosses-blutbild/
- (später) Hormonstatus              /labor/hormone/
- (später) Vitamine & Mineralien    /labor/vitamine/
- (später) Tumormarker               /labor/tumormarker/
- Rund ums Labor                    /rund-ums-labor/
- Laborcheck Basis (Selbstzahler)   /basic-check/
```

**Leistungen-Submenu unverändert** (Check-Ups, Impfungen, etc.).

`match_prefix`-Listen werden synchron mitgepflegt für Active-State-Highlighting.

---

## §8 HWG-Probe (verify.sh §5 NEU)

In `tools/verify.sh` neuer §5-Block:

```bash
# §5 HWG-Konformität (CW-005) — keine Preise auf Praxis-Pages
PROBE_PAGES=("/" "/leistungen/" "/diagnostik/" "/labor/")
HWG_PATTERNS="EUR|€|[0-9]+,[0-9]{2} ?€|Preis:|ab [0-9]+|kostet"

for url in "${PROBE_PAGES[@]}"; do
  body=$(curl -sk "$BASE_URL$url")
  hits=$(echo "$body" | grep -oE "$HWG_PATTERNS" | wc -l)
  if [ "$hits" -gt 0 ]; then
    echo "  ✗ HWG-Verstoß auf $url: $hits Treffer"
    echo "$body" | grep -E "$HWG_PATTERNS" | head -3
    exit 1
  else
    echo "  ✓ $url HWG-konform"
  fi
done
```

**Ausnahme:** Cross-Brand-CTAs auf `sanexio.eu/...` mit `external`-Hint sind erlaubt — die Probe checkt nur die Page-Body-Inhalte, nicht externe Links.

---

## §9 Phasen-Plan & Tasks

### §9.1 Phase 3a — Bilder-Mirror (1–2 h)

| Task | Output |
|---|---|
| T-3a.1 | `tools/mirror-shopify-images.sh` erstellt |
| T-3a.2 | Featured-Images aus 3 Collections gezogen + MD5-Verify |
| T-3a.3 | Resize + WP-Upload |
| T-3a.4 | `trunk/media/registry.yaml` aktualisiert |

### §9.2 Phase 3b — Schema + Renderer (2–3 h)

| Task | Output |
|---|---|
| T-3b.1 | `page.schema.json` um 5 Section-Types erweitert + AJV-Validierung grün |
| T-3b.2 | `adapters/wordpress/content-to-wp-pages.mjs` um 5 Renderer-Funktionen erweitert |
| T-3b.3 | `adapters/wordpress/lib/renderer-registry.mjs` Eintrag `wordpress.page.praxis-hub` |
| T-3b.4 | Adapter-Test mit Beispiel-YAML grün |

### §9.3 Phase 3c — CSS + Templates (2–3 h)

| Task | Output |
|---|---|
| T-3c.1 | `assets/css/page-hub.css` mit Hero, USP, Bento, Process, CTA-Banner |
| T-3c.2 | `template-diagnostik-hub.php` angepasst auf neue Section-Types |
| T-3c.3 | `template-leistungen.php` angepasst |
| T-3c.4 | `template-labor.php` neu erstellt (analog Diagnostik) |
| T-3c.5 | `template-parts/page-section-renderer.php` (Single-Source-Helper) |
| T-3c.6 | Conditional enqueue `pxz_enqueue_page_hub_css()` in `functions.php` |

### §9.4 Phase 3d — Menü + Trunk-YAMLs + Push (1–2 h)

| Task | Output |
|---|---|
| T-3d.1 | `inc/nav-data.php` M1b-Reihenfolge in DE/EN/FR/ES |
| T-3d.2 | `trunk/content/pages/_shared/diagnostik.yaml` |
| T-3d.3 | `trunk/content/pages/_shared/labor.yaml` |
| T-3d.4 | `trunk/content/pages/_shared/leistungen.yaml` |
| T-3d.5 | `cw-transfer push wp:page <yaml>` für alle 3 Pages |
| T-3d.6 | Bestehender Page-Content rückt unter den neuen (post_content append) |

### §9.5 Phase 3e — Verify (30 min)

| Task | Output |
|---|---|
| T-3e.1 | `tools/verify.sh` §5 HWG-Probe ergänzt + grün |
| T-3e.2 | `tools/probe-mid-range.mjs` re-run (M1b mit 6 Top-Level) — 0 Overflow ≥1100 px |
| T-3e.3 | `smoke-http.sh` 5/5 HTTP 200 |
| T-3e.4 | Visueller Sanity-Check (Screenshots Diagnostik · Labor · Leistungen @ 1440 px + 1100 px + 430 px) |

### §9.6 Phase 4 — Selbstprüfung & Acceptance

→ §10 unten.

**Geschätzter Gesamt-Aufwand:** 6–10 Stunden Arbeitszeit, ~2 Sessions (Phase 3a+3b in einer Session, Phase 3c+3d+3e in der nächsten — abhängig von Wartezeiten und Dr.-Stracke-Wahl bei §3.4).

---

## §10 Acceptance-Kriterien (10 Stück)

| AK | Kriterium | Verifizierung |
|---|---|---|
| AK-1 | `/diagnostik/`, `/labor/`, `/leistungen/` rendern Hero + Bento-Grid + CTA | Manueller Browser-Check + curl + grep |
| AK-2 | `verify.sh` §5 HWG-Probe meldet 0 Treffer auf `/`, `/diagnostik/`, `/labor/`, `/leistungen/` | `verify.sh` Exit 0 |
| AK-3 | Header-Nav DE zeigt M1b-Reihenfolge | `curl /` + grep auf `<nav class="pxz-nav">` |
| AK-4 | Mid-Range-Probe @ 1100 + 1280 + 1365 + 1440 px: kein Header-Overflow | `probe-mid-range.mjs` Exit 0 |
| AK-5 | EN/FR/ES Header-Nav-Parität (gleiche 6 Top-Level) | `nav-data.php` Inspektion |
| AK-6 | `cw-transfer push wp:page trunk/.../labor.yaml` ist idempotent (zweimal aufrufen → Diff = 0) | Manueller Roundtrip-Test |
| AK-7 | Trunk-Schema akzeptiert die 3 neuen YAMLs (AJV-Validierung grün) | `tools/validate.sh` Exit 0 |
| AK-8 | Bilder lokal in `wp-content/uploads/` (nicht hot-linked von Shopify) | DB-Check `wp_postmeta._wp_attached_file` |
| AK-9 | Smoke-HTTP grün (5/5 HTTP 200, inkl. neue `/labor/` Top-Level-Erreichbarkeit über Nav) | `smoke-http.sh` |
| AK-10 | Sanitizer-Probe grün (alle Nexus-/Spec-Dateien im Token-Budget) | `rotate.sh --probe` Exit 0 |

---

## §11 Risiken & Rollback

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Mid-Range-Header bricht mit 6 Top-Level | mittel | `probe-mid-range.mjs` nach Umbau, Item-Spacing-Tuning bei Bedarf |
| HWG-Verstoß durch Auto-Sync von Sanexio-Texten | hoch | `views.praxis`-Schema mit `show_prices=false`, AJV-Validierung VOR Push, `verify.sh` §5 nach Push |
| Bilder-Lizenz (Shopify-Bilder gehören Sanexio GmbH) | gering | beide gehören Dr. Stracke; intern unproblematisch, dokumentiert in `trunk/media/registry.yaml` |
| Renderer-Bug rendert kaputtes HTML | mittel | Adapter-Test mit Beispiel-YAML in Phase 3b vor Push |
| Bestehender Page-Content geht verloren | mittel | Append statt Replace in T-3d.6, Backup `wp_posts.post_content` vor Push als `_backup/S49-pre-page-<id>.txt` |

**Rollback-Strategie:**
- Theme-Edits: `git revert <commit>` im Theme-Repo
- WP-Page-Content: `_backup/S49-pre-page-<id>.txt` zurückspielen via `wp post update` oder direkter DB-Update
- Trunk-YAML: `git revert` im Cortex-Web-Repo
- Menü-Umbau: `nav-data.php` git-revert

---

## §12 Wiederverwendbarer Workflow (für künftige Shopify→Praxis-Übernahmen)

Nach Abschluss S49 etabliert ist:

```
1. Shopify-Section/Page identifizieren
2. Manuell oder via cw-transfer pull shopify:page <handle> > /tmp/proto.json
3. Trunk-YAML kuratieren in trunk/content/pages/_shared/<id>.yaml
   (HWG-Cleanup: views.praxis.show_prices=false, Sie-Form, CTA-Override)
4. Bilder mirror via tools/mirror-shopify-images.sh <handle>
5. tools/validate.sh
6. cw-transfer push wp:page trunk/content/pages/_shared/<id>.yaml
7. (optional) cw-transfer push shopify:page <id>.yaml
8. tools/verify.sh inkl. §5 HWG-Probe
```

→ Künftige Pages: 30–60 Min pro Page, kein Renderer-Neubau mehr (alle Section-Types existieren).

→ **Dies erfüllt Dr. Strackes Anforderung „gangbare und schnelle Lösung für künftige Übertragungen".**

---

## §13 Freigabe-Punkte (Dr.-Stracke-Antworten 2026-04-27)

| ID | Frage | Antwort | Konsequenz |
|---|---|---|---|
| **F-1** | Bluttest-Karten-Inhalt | **L-B** (alle Sanexio-Bluttest-Produkte spiegeln, ohne Preise; erweiterbar in Folge-Sessions) | T-3a um „Shopify-Produktliste extrahieren" erweitert; Trunk-YAMLs pro Bluttest in `trunk/content/products/bluttests/` mit `views.praxis.show_price=false` |
| **F-2** | Initial-Kategorien | **entfällt** (L-B nimmt alle Sanexio-Produkte 1:1) | — |
| **F-3** | Bilder-Quelle | **Shopify-Bilder spiegeln** (CW-003) | `tools/mirror-shopify-images.sh` zieht Featured-Images aus Sanexio-Storefront, MD5-Verify, Resize, WP-Upload |
| **F-4** | Bestehender Page-Content | **Nicht erhaltenswerten Content entfallen lassen** (Claude entscheidet pro Page) | `/diagnostik/` (283 chars) + `/leistungen/` (119 chars): vollständig ersetzen. `/labor/` (3525 chars): Inhalt sichten und ggf. als Sub-Block einarbeiten oder ersetzen — Backup bleibt in `_backup/` |
| **F-5** | Spec-Freigabe für Phase 3 | **offen — wartet auf finale Bestätigung** | — |

---

*S49 Spec V1.1 · 2026-04-27 · Phase 2 (Lösungsdesign) · F-1/F-3/F-4 entschieden, F-5 offen*
