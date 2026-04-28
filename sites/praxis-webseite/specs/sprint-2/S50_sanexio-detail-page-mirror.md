# S50 — Sanexio-Produktseiten-Layout für Praxis-Detail-Pages

> **Status:** Phase 2 (Lösungsdesign) — wartet auf Freigabe Dr. Stracke
> **Erstellt:** 2026-04-28 Session 50 (Folge S49 Sanexio-Spiegel)
> **Architekten-Modus:** 4-Phasen (Verständnis → Lösungsdesign → Umsetzung → Selbstprüfung)
> **Auftrag:** „Einzelseiten übernehmen den Aufbau der Sanexio-Produktseiten —
> ohne Preise, mit Doctolib-CTA, mit Übersicht aller Untersuchungen unten."
> **Master-URL:** `https://sanexio.eu/products/ultraschall-schilddruse-krebsscreening`
> (aktuell passwortgeschützt, Layout aus Theme-Klon `Juvantis/juvantis-web/theme/` + S49-Backup rekonstruiert)

---

## §1 Auftrag (Phase 1 — Verständnis, von Dr. Stracke 2026-04-28 freigegeben)

Die 19 in S49 angelegten Detail-Pages der Praxis-Webseite (10 Untersuchungen +
9 Labor-Bluttests) bekommen das **Sanexio-Produktseiten-Layout** als verbindliche
Vorlage. Vorhandener Inhalt wird **vollständig ersetzt** (kein Mergen).

**8 Sektionen, top → bottom:**

1. **Hero / Bild-Galerie** — Bilder + Eyebrow + Title + Lead. Statt Preis und
   Buy-Button → „Termin vereinbaren"-CTA → Doctolib (Phase-3 generisch
   `/service/terminanfrage/`, später Doctolib-Direktlink pro Page).
2. **Description** — Long-Form-Text, Sie-Form, HWG-gefiltert.
3. **Indikationen** — „Wann ist das sinnvoll" (Liste).
4. **Ablauf** — 4 Schritte: Termin → Untersuchung → Analyse → Ergebnis.
5. **(entfällt)** Vergleich/Differenzierung — HWG-Vergleichswerbung.
6. **FAQ** — Akkordeon Frage/Antwort.
7. **CTA-Banner** — „Termin vereinbaren" → Doctolib.
8. **Untersuchungs-Übersicht** — alle 19 Pages exkl. die aktuelle, als Karten-Grid.

**Constraints:**
- HWG/Berufsordnung (CW-005) — keine Preise, keine Heilversprechen, keine
  Vergleiche, keine Superlative.
- Trunk-Master (CW-001), Schema-Validation (CW-002).
- Lokale Bilder pflichtig (CW-003) — 24 Sanexio-Bilder aus S49 schon gespiegelt
  in `_media-source/shopify-mirror/{diagnostik,labor,leistungen}/`. Für die 19
  Detail-Pages werden ggf. weitere Hero-Bilder gespiegelt.
- Theme-PHP-Code-Status-quo (S42) — kein WP-Admin-Block-Editor.
- Mid-Range-Header (S47) bleibt fluid ≤120 px @1100–1439 px.

**POC-Page (Phase 3):** `/sonographie/schilddruese/` (Page-ID 357,
Trunk-YAML `sonographie-schilddruese.yaml`) — direkt korrespondierend zur
Sanexio-Master-URL.

---

## §2 IST-Stand (was schon existiert)

| Komponente | Status | Datei |
|---|:---:|---|
| Schema mit 9 Section-Types (`hero`, `body`, `cta-banner`, `bento-grid`, `process-steps`, `usp-box`, `intro`, `team-grid`, `service-body`) | ✅ | `trunk/schema/page.schema.json` |
| Builder mit Auto-Discovery + HWG-Guard (`show_prices=false`) | ✅ | `adapters/wordpress/build-page-hub.mjs` |
| Universal-Template (lädt `inc/data/page-hub-<slug>.php`) | ✅ | `template-detail-page.php` |
| Renderer (5 Section-Types: hero/usp/bento/process/cta) | ⚠ teilweise | `template-parts/page-hub-renderer.php` |
| Trunk-YAMLs für alle 19 Detail-Pages (3-Sektion-Skelett: hero/body/cta) | ✅ | `trunk/content/pages/_shared/*.yaml` |
| 27 PHP-Datenfiles auto-generiert | ✅ | `inc/data/page-hub-*.php` |
| Sanexio-Bilder-Mirror | ✅ partiell | `_media-source/shopify-mirror/` (3 Hub-Pages, fehlt: Detail-Pages) |
| Cross-Brand-CTA-Snippet | ✅ | `inc/cross-brand-cta.php` |

**Was fehlt für das Sanexio-Layout:**
- 3 neue Section-Types in Schema + Builder + Renderer
- Auto-generierter Übersichts-Block (Pflege automatisch aus Page-Registry)
- Detail-Page-Bilder gespiegelt (10 Untersuchungen + 9 Bluttests)
- CSS für die neuen Sektionen
- HWG-Filter-Pass über die übernommenen Sanexio-Texte

---

## §3 Schema-Erweiterung (`page.schema.json`)

**Drei neue Section-Types** als `oneOf`-Branches:

### §3.1 `gallery` — Bild-Galerie für Hero
```yaml
- type: gallery
  images:
    - src: shopify-mirror://detail/sonographie-schilddruese/hero-1.jpg
      alt:
        de: Schilddrüsen-Sonographie — Ultraschallbild
    - src: shopify-mirror://detail/sonographie-schilddruese/hero-2.jpg
      alt:
        de: Schallkopf am Hals
```
Min 1, Max 6 Bilder. Erstes Bild ist Hero, weitere als Thumbnails (Lightbox).

### §3.2 `indications` — „Wann ist das sinnvoll"
```yaml
- type: indications
  heading:
    de: Wann eine Schilddrüsen-Sonographie sinnvoll ist
  items:
    - de: Knoten oder Vergrößerung tastbar
    - de: Auffällige TSH/T3/T4-Werte
    - de: Familiäre Vorbelastung Schilddrüsenerkrankungen
    - de: Verlaufskontrolle bekannter Befunde
```
Liste mit Bullet-Items, ein-sprachig pro Item (kein i18n-Objekt — kommt in P6).

### §3.3 `faq` — Akkordeon
```yaml
- type: faq
  heading:
    de: Häufige Fragen
  items:
    - q:
        de: Muss ich nüchtern kommen?
      a:
        de: Nein, eine Schilddrüsen-Sonographie erfordert keine Vorbereitung.
    - q:
        de: Wie lange dauert die Untersuchung?
      a:
        de: 10–15 Minuten.
```

**Übersichts-Block am Seitenende** (Sektion 8) wird **NICHT** als YAML-Section
angelegt — sondern automatisch vom Renderer angefügt. Begründung: Pflege-
Aufwand minimal (Page-Registry ändert sich, Block aktualisiert sich
automatisch). Schema bleibt also bei 3 neuen Types.

---

## §4 Trunk-YAML — Beispiel POC `sonographie-schilddruese.yaml`

**Reihenfolge der Sections:**
```yaml
sections:
  - type: gallery        # 1
  - type: hero           # 1 (überlappt mit gallery — gallery rendert Bilder, hero Text)
  - type: body           # 2 Description
  - type: indications    # 3
  - type: process-steps  # 4 Ablauf
  - type: faq            # 6
  - type: cta-banner     # 7
  # 8 Übersicht — nicht in YAML, vom Renderer angefügt
```

**Anmerkung zur Sektion 1+2-Trennung:** Sanexio rendert Galerie und
Hero-Text als ein 2-Spalten-Block. Im Praxis-Layout wird das im Renderer
zusammengeführt: wenn `gallery` direkt vor `hero` kommt, rendert der Renderer
einen kombinierten 2-Spalten-Block. Im Trunk-YAML bleiben sie zwei separate
Sektionen — saubere Datenstruktur, der Renderer macht die Visualisierung.

**`views.praxis.doctolib_url`** als optionales Feld (überschreibt `cta_url`):
```yaml
views:
  praxis:
    show_prices: false
    cta_url: /service/terminanfrage/      # Default
    doctolib_url: null                     # Phase 3a: null. Phase 3b: pro Page befüllen.
    cta_label:
      de: Termin vereinbaren
```
Builder picked `doctolib_url` falls gesetzt, sonst `cta_url`.

---

## §5 Builder-Erweiterung (`build-page-hub.mjs`)

**Drei neue `normalizeSection`-Branches** (analog bestehender 6).

**HWG-Strip aktiv:** Falls Sanexio-Quelltext Preise enthält, beim Re-Write
durch Dr. Stracke / Claude entfernen — Builder wirft Fehler bei
`show_prices=true`.

**Doctolib-Resolver:**
```js
const ctaUrl = data.views?.praxis?.doctolib_url
            || data.views?.praxis?.cta_url
            || "/service/terminanfrage/";
```

**Übersichts-Block-Generator:** Builder schreibt bei jeder Page eine
`related_overview`-Liste in `out` mit allen anderen 18 Pages (id, title, slug,
hero-image-thumb, kategorie). Renderer nutzt das.

---

## §6 Renderer-Erweiterung (`page-hub-renderer.php`)

**Drei neue `case`-Blocks** (gallery, indications, faq).

**Gallery-Hero-Kombination:** Vor der `foreach`-Schleife eine Pre-Pass-Erkennung:
wenn Sektion `i` Type `gallery` und Sektion `i+1` Type `hero` → beide werden
als 2-Spalten-Block gerendert (`pxz-hub-product-hero`), und die Schleife
überspringt Sektion `i+1`.

**Übersichts-Block** (immer am Ende):
```php
if ( ! empty( $page_hub_data['related_overview'] ) ) :
?>
  <section class="pxz-hub-related-overview">
    <h2>Weitere Untersuchungen</h2>
    <ul class="pxz-hub-overview-grid">
      <?php foreach ( $page_hub_data['related_overview'] as $item ) : ?>
        <li><a href="<?php echo esc_url( home_url( $item['slug'] ) ); ?>">
          <img src="<?php echo esc_url( $item['image'] ); ?>" alt="" loading="lazy">
          <span><?php echo esc_html( $item['title'] ); ?></span>
        </a></li>
      <?php endforeach; ?>
    </ul>
  </section>
<?php endif; ?>
```

---

## §7 CSS — neue Sektionen

Neue Datei `assets/css/page-hub-detail.css`, conditional enqueued nur auf
Detail-Pages (Template-Match `template-detail-page.php`).

Klassen:
- `.pxz-hub-product-hero` (2-Spalten-Block: Galerie + Text-Block, Mobile stacked)
- `.pxz-hub-gallery` + `.pxz-hub-gallery-thumb` (Lightbox via einfaches
  `<details>` oder JS-frei mit `:target`)
- `.pxz-hub-indications` (Bullet-List mit Custom-Bullet)
- `.pxz-hub-faq` + `<details>` Akkordeon (JS-frei, native HTML)
- `.pxz-hub-related-overview` (Card-Grid 4×, Mobile 2×)

Tokens aus `tokens.css` v2 (S40 Type-Scale, fluid clamp(), Praxis-Logo-Rot +
Teal — kein Apple-Blue).

---

## §8 Bilder-Pipeline (CW-003)

**Sanexio-Bilder-Quellen:** Storefront aktuell passwortgeschützt → Du gibst
mir entweder
- **Option α** ein **Cookie/Auth-Header** für `sanexio.eu`, dann mirror ich
  die Detail-Page-Bilder per Skript-Run
- **Option β** ein **lokales Verzeichnis** (z. B. Download aus dem Shopify-Admin
  als ZIP), das ich nach `_media-source/shopify-mirror/detail/<slug>/`
  importiere
- **Option γ** ich nutze die **24 schon gespiegelten** Sanexio-Bilder aus S49
  als Pool und mappe sie auf die Detail-Pages — Lücken bekommen
  Platzhalter-Bild + Memo „nachliefern"

→ **Phase-2-Freigabe-Punkt F-1** (siehe §13).

---

## §9 Phasen-Plan

### §9.1 Phase 3a — Schema + Builder + Renderer (Infrastruktur, 2–3 h)

| Task | Output |
|---|---|
| T-3a.1 | `page.schema.json` um 3 Section-Types (gallery, indications, faq) erweitern + AJV-Validation grün |
| T-3a.2 | `build-page-hub.mjs` um 3 normalizeSection-Branches + Doctolib-Resolver + related_overview-Generator |
| T-3a.3 | `page-hub-renderer.php` um 3 case-Blocks + Gallery-Hero-Pre-Pass + Übersichts-Block |
| T-3a.4 | `page-hub-detail.css` neu (5 Klassen-Gruppen) + conditional enqueue in `functions.php` |
| T-3a.5 | Adapter-Test: leere Demo-YAML mit allen 7 Sektionen → Build → Render → HTML stimmt |

### §9.2 Phase 3b — POC-Page Schilddrüsen-Sonographie (1–2 h)

| Task | Output |
|---|---|
| T-3b.1 | Sanexio-Page-Inhalt beschaffen (per F-1, siehe §13) |
| T-3b.2 | Bilder mirror nach `_media-source/shopify-mirror/detail/sonographie-schilddruese/` + WP-Upload |
| T-3b.3 | `trunk/content/pages/_shared/sonographie-schilddruese.yaml` umbauen: 7 Sektionen mit Sanexio-Inhalt, HWG-gefiltert |
| T-3b.4 | `bun build-page-hub.mjs` + `cw-transfer push` |
| T-3b.5 | Visual-Review mit Dr. Stracke im Browser auf `https://gpmedicalcenter…local/sonographie/schilddruese/` |
| T-3b.6 | Iterate bis Dr. Stracke „passt" — dies ist der Master-Vorlage-Stand für die anderen 18 |

### §9.3 Phase 3c — Roll-out auf 18 weitere Pages (4–6 h, ggf. 2 Sessions)

| Task | Output |
|---|---|
| T-3c.1 | Bilder mirror für 9 weitere Untersuchungen + 9 Bluttests |
| T-3c.2 | Trunk-YAML pro Page umbauen (Master-Vorlage als Template) |
| T-3c.3 | Pro Page: Sanexio-Texte einlesen, HWG-Filter (Claude), Sie-Form |
| T-3c.4 | Build + Push pro Batch (5er Batches, dazwischen Spot-Check) |
| T-3c.5 | HTTP-Sweep alle 19 Pages = 200 |

### §9.4 Phase 3d — Doctolib-Mapping (später, durch Dr. Stracke gepflegt)

| Task | Output |
|---|---|
| T-3d.1 | Du gibst mir je Page den Doctolib-Direktlink (oder „Sammeltermin" → bleibt `/service/terminanfrage/`) |
| T-3d.2 | YAMLs `views.praxis.doctolib_url` befüllen |
| T-3d.3 | Build + Push |

### §9.5 Phase 3e — Verify (30 min)

| Task | Output |
|---|---|
| T-3e.1 | `tools/verify.sh` §5 HWG-Probe Sweep über alle 19 Detail-Pages = 0 Treffer |
| T-3e.2 | `probe-mid-range.mjs` 5 Viewports × 19 Pages = 0 Overflow |
| T-3e.3 | `smoke-http.sh` 19/19 = 200 |

**Geschätzter Gesamt-Aufwand:** 8–13 Stunden, ~2–3 Sessions.

---

## §10 Acceptance-Kriterien (10 Stück)

| AK | Kriterium | Verifizierung |
|---|---|---|
| AK-1 | POC-Page rendert alle 7 Sektionen + Übersichts-Block | Browser + curl + grep |
| AK-2 | `verify.sh` §5 HWG-Probe = 0 Treffer auf POC-Page | Exit 0 |
| AK-3 | Trunk-Schema akzeptiert die 3 neuen Section-Types | `validate.sh` Exit 0 |
| AK-4 | Übersichts-Block zeigt 18 Karten (alle außer aktueller Page) | DOM-Count |
| AK-5 | Doctolib-Feld wirkt (mit/ohne `doctolib_url` rendert anderen Link) | Build-Diff-Test |
| AK-6 | Build idempotent (zweimal `bun build-page-hub.mjs` → keine Diffs) | git status |
| AK-7 | Mid-Range-Probe @ 1100/1280/1365/1440 px = 0 Overflow auf POC | `probe-mid-range.mjs` Exit 0 |
| AK-8 | Bilder lokal in `wp-content/uploads/` (nicht von sanexio.eu hot-linked) | `wp_postmeta._wp_attached_file` Check |
| AK-9 | Sie-Form durchgehend (kein „Du", kein „dein") | grep auf POC-Output |
| AK-10 | Roll-out auf 19 Pages: 19/19 HTTP 200, 0 HWG-Treffer | `smoke-http.sh` + `verify.sh` |

---

## §11 Risiken & Rollback

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Sanexio-Texte enthalten nicht-HWG-konforme Aussagen | hoch | Claude filtert pro Page, Dr. Stracke reviewed POC vor Roll-out |
| Bilder-Quelle nicht zugänglich (Passwort-Wall) | mittel | F-1 entscheidet, Fallback Option γ (Pool aus S49-Bildern) |
| Renderer-Bug rendert kaputtes HTML | mittel | T-3a.5 Adapter-Test vor POC-Push |
| Übersichts-Block bei i18n problematisch | niedrig | i18n-P6 in eigenem Sprint, vorher nur DE |
| Mid-Range-Layout bricht durch dichte Sektionen | mittel | `probe-mid-range.mjs` nach POC |

**Rollback:**
- Theme-Edits: `git revert` im Theme-Repo
- Trunk-YAMLs: `git revert` im Cortex-Web-Repo
- WP-Page-Content: `_backup/S49-detail-pages/page-<id>.html` zurückspielen

---

## §12 Wiederverwendbarer Workflow

Nach POC etabliert:
```
Pro Detail-Page:
  1. Sanexio-Inhalt + Bilder beschaffen (Du oder ich, je F-1)
  2. Mirror Bilder nach _media-source/shopify-mirror/detail/<slug>/
  3. Trunk-YAML pro Page anlegen (Master-Vorlage als Template)
  4. HWG-Filter-Pass (Claude) + Sie-Form
  5. bun build-page-hub.mjs
  6. tools/validate.sh
  7. cw-transfer push wp:page (oder direkter Build, da auto-discovery)
  8. Spot-Check Browser, dann nächste Page
```
30–45 Min pro Page nach POC.

---

## §13 Freigabe-Punkte

| ID | Frage | Optionen | Konsequenz |
|---|---|---|---|
| **F-1** | Bilder-Quelle | α) Auth-Header für sanexio.eu · β) lokales ZIP/Folder · γ) Pool aus S49-Bildern + Platzhalter | steuert T-3b.1/T-3b.2 |
| **F-2** | Sektion 5 „Vergleich" | a) raus (HWG-sicher) · b) als Praxis-eigene Differenzierung umbauen ohne Konkurrenten zu nennen · c) doch behalten mit Filter | aktuell als „raus" angenommen — Bestätigung |
| **F-3** | Sanexio-Texte 1:1 oder Re-Write | i) Claude filtert maschinell, Du reviewst pro Page · ii) Du gibst Re-Writes vor · iii) generative Erst-Version nur als Fundament | aktuell K5 = i. Bestätigung |
| **F-4** | Spec-Freigabe für Phase 3 | OK / Anpassung nötig | Start Phase 3a |

---

*S50 Spec V1.0 · 2026-04-28 · Phase 2 (Lösungsdesign) · F-1/F-2/F-3/F-4 offen*

---

## §14 Reduktion auf 4 Sektionen (2026-04-28, nach Live-Probe Sanexio)

**Trigger:** Storefront-Passwort `Medzpoint` erlaubt direktes Auth-Scraping.
Live-HTML der Master-URL `https://sanexio.eu/products/ultraschall-schilddruse-krebsscreening`
zeigt: Sanexio-Produkt-Pages haben **keine** separaten Indications-, FAQ- oder
Vergleichs-Sektionen. Custom-Sections wie `juvantis-faq.liquid` gehören zu
**anderen** Page-Typen (DHT, Body-Checks), nicht zur Untersuchungs-Produkt-Page.

**Reale Sanexio-Sektionen (Schilddrüse):**
1. Hero (1 Bild + Title + Variant-Picker + Preis + Buy-Button)
2. Description (1 Rich-Text-HTML-Block, H2-Sub-Headings inline)
3. Related Products („Untersuchungen")

**Reduzierte Praxis-Sektions-Reihenfolge:**
1. **Hero** — Bild + Eyebrow + Title + Lead + Doctolib-CTA (statt Preis/Buy)
2. **Body** — Long-Form-Description, HWG-gefiltert, Sie-Form, mit H2-Sub-Headings inline
3. **CTA-Banner** — „Termin vereinbaren" → Doctolib (ergänzend, da Sanexio den nicht separat hat)
4. **Übersicht aller Untersuchungen** — auto-generiert aus Page-Registry, alle 19 minus aktuelle

**Schema-Konsequenz:** Keine 3 neuen Section-Types nötig.
- `hero` bekommt **optionales** Feld `image` (string, lokaler image-key oder absoluter Pfad)
- `body` bekommt **optionales** Feld `body_html` (zusätzlich zu `body_md` — für 1:1-Übernahme von Sanexio-Rich-Text-HTML)
- Übersichts-Block ist **kein** Schema-Feld, sondern Builder-generiert + Renderer-rendert

**Builder-Konsequenz:**
- `normalizeSection('hero')` durchschleift `image` via `resolveImage`
- `normalizeSection('body')` bevorzugt `body_html`, fällt sonst auf `body_md → markdownToHtml(...)` zurück
- Top-Level: `related_overview` wird automatisch aus allen Page-YAMLs generiert (alle Pages außer der aktuellen)
- Doctolib-Resolver: `cta_url = views.praxis.doctolib_url || views.praxis.cta_url || "/service/terminanfrage/"`

**Renderer-Konsequenz:**
- `case 'hero'`: wenn `image` vorhanden → 2-Spalten-Layout, sonst 1-Spalten wie bisher
- `case 'body'` NEU: echo `$section['body_html']` (mit `wp_kses_post`-Sanitization)
- Nach `foreach`: Übersichts-Block aus `$page_hub_data['related_overview']`

**CSS-Konsequenz:** Nur 2 Klassen-Gruppen (`pxz-hub-product-hero`, `pxz-hub-related-overview`).

**Aufwand:** 4–6 h Phase 3 statt 8–13 h. ~1 Session.

**Tasks angepasst** in TaskTracker (#1/#3/#4 reduziert).

