# S46 — Homepage-Slider + Fullbleed-Layout + Hochkant-Cleanup + Nav-Aktuelles raus

**Sprint:** 2 (Kernseiten-Ausbau)
**Session:** 27 (2026-04-26)
**Theme-Ziel:** PXZ 2.7.54
**Vorgänger:** S45 (Room-Slider auf Standort-Pages, PXZ 2.7.53)

---

## Verständnis

**Anforderung Dr. Stracke (Originalwortlaut):**

> Slider-Container anpassen. Zunächst alle Slider mit Hochkantbildern entfernen.
> Slider sollen so aufgebaut sein wie der erste Bildcontainer auf der Praxisseite —
> Bilder nehmen die komplette Containerfläche ein. Texte sollen sich vom
> Bildhintergrund abheben (lesbar). Auf der Startseite soll der Bildcontainer
> auch die Sliderfunktion bekommen, mit zufälliger Reihenfolge aller Slides aus
> Hauptpraxis + Zweigpraxis. Erstes Slide auf Startseite zeigt „Aktuelles" mit
> Wartelisten-Hinweis (Verlinkung zu Neupatienten-Anmeldung). Menüpunkt
> „Aktuelles" im Header dann löschen.

**Zielzustand (in 5 Punkten):**

1. **Hochkant-Slides raus** aus den 2 Standort-Pages (Hauptpraxis + Zweigpraxis).
2. **Bestehende Slides** rendern als **fullbleed** statt media-text-50/50: Bild füllt Slide-Fläche, Text als Caption-Kapsel darüber.
3. **Homepage** bekommt einen Slider in der bisherigen Hero-Bild-Spalte. Quelle: gemischte Slides aus beiden Standort-Pages, plus erstes „Aktuelles"-Slide.
4. **„Aktuelles"-Slide** ist visuell anders: kein Hintergrundbild, sondern farblich abgesetzter Inner-Container mit Wartelisten-Text + Link.
5. **Menüpunkt „Aktuelles"** in `inc/nav-data.php` aus allen 4 Sprachen entfernen.

**Constraints:**
- Editor-UX bleibt 1:1 (media-text-Block-Workflow unverändert)
- Bestehende Slider-JS-Engine wird wiederverwendet (keine Duplikation)
- Keine Regression auf Standort-Pages (Slider muss dort weiter funktionieren, nur Layout-Modus wechselt)
- Homepage-Headline + CTAs bleiben unverändert (linke Spalte)
- ARIA, Reduced-Motion, Keyboard-Navigation bleiben erhalten

---

## Lösung

### Architektur-Entscheidungen (begründet)

| # | Entscheidung | Begründung |
|---|---|---|
| **1** | **Slider-Engine erweitern**, nicht duplizieren | Ein Layout-Mode-Toggle (`data-layout="fullbleed"` vs. Default `media-text`) genügt. JS-Mechanik (Swipe, Keyboard, Dynamic-Height, ARIA) wird 1:1 wiederverwendet. Jede Code-Duplikation würde später zu Drift führen. |
| **2** | **16:9 Aspect-Ratio** für fullbleed-Modus | Konsistent mit Homepage-Hero (`template-homepage.php` nutzt 16:9). Universell etabliert, weder zu cinematic (21:9) noch zu klassisch (3:2). Hochkant-Bilder werden durch `object-fit: cover` automatisch auf 16:9 gecroppt. |
| **3** | **Caption-Kapsel mit Tönungs-Switch (T4)** für Lesbarkeit | Default: weiße Box mit dunklem Text (wie Homepage-Hero, garantiert lesbar). Optional pro Slide: dunkle Box mit weißem Text via Block-Attribut `data-caption-tone="dark"`. Vorteil: Box-Schutz garantiert Lesbarkeit auf jedem Bild; Tönungs-Switch erlaubt Anpassung wenn Default nicht passt. Decken Dr. Strackes beide Vorschläge (schwarz auf hell / weiß auf dunkel) ab. |
| **4** | **Homepage-Slides: server-side, fix-shuffled per Tag (Q2)** | Reihenfolge mit Seed = aktuelles Datum (`date('Ymd')`). Pro Tag stabil → cachebar, SEO-stabil. Trotzdem jeden Tag eine andere Reihenfolge → Wiederbesucher sehen Variation. Alternative Q1 (per Page-Load) wäre browser-cache-feindlich. |
| **5** | **Aktuelles-Link-Ziel: `/service/neupatienten/`** | Bestätigt im Nav (Z. 82 in `inc/nav-data.php`). Existierende Page, eindeutig. |
| **6** | **Hochkant-Slides aus DB entfernen (H1)** | Dr. Strackes Wortlaut: „entfernen". Nicht durch Crop überdecken — wirklich raus. Nach Identifikation der Hochkant-Bilder werden die zugehörigen `core/media-text`-Blöcke aus `post_content` der 2 Standort-Pages entfernt. |
| **7** | **Aktuelles-Slide ohne Hintergrundbild (A1)** | Hebt sich visuell vom Foto-Stream ab → Aufmerksamkeitslenkung auf wichtige Info. Inner-Container mit `var(--pxz-chalk)`-Background + Teal-Akzent (`--pxz-teal-light`). |
| **8** | **Homepage-Layout-Treue: Zweispalter beibehalten** | Headline+CTAs links bleiben unverändert. Bisherige rechte Bild-Spalte wird Slider-Spalte. Minimal-invasiv. Wenn Aktuelles-Slide breite Aufmerksamkeit braucht, ist es trotzdem prominent als erstes Slide. |

### Architektur-Diagramm

```
template-homepage.php (NEU mit Slider)
├── Hero
│   ├── Links: Headline + Lead + 2× CTAs (UNVERÄNDERT)
│   └── Rechts: pxz-room-slider[data-layout=fullbleed]  ← NEU statt einzelnes Bild
│       ├── Slide 1: AKTUELLES (Inner-Container, kein Bild)
│       ├── Slide 2..N: gemischte fullbleed-Slides aus Hauptpraxis + Zweigpraxis
│       └── Controls: Pfeile + Dots + Swipe + Keyboard

template-standard.php (UNVERÄNDERT, aber Slider rendert anders)
└── pxz_use_room_slider=1 + neuer Postmeta pxz_slider_layout="fullbleed"
    └── room-slider.php (template-part, ERWEITERT)
        ├── Modus media-text (Default, S45-Verhalten) ← ältere Pages bleiben kompatibel
        └── Modus fullbleed ← NEU
```

### Implementierung

| # | Komponente | Datei | Aktion |
|---|---|---|---|
| 1 | Splitter-Logik | `template-parts/room-slider.php` | Erweitern um `data-layout`-Attribut auf root-Element. Pro Slide Caption-Kapsel rendern (anstelle media-text 50/50). Block-Attribut `caption-tone` lesen. |
| 2 | Styles | `assets/css/room-slider.css` | Neue Selektoren `.pxz-room-slider[data-layout=fullbleed]`: `aspect-ratio: 16/9`, `position: relative`, Bild absolute, Caption absolute bottom-left. Tönungs-Switch via `.caption-dark`. |
| 3 | Logik | `assets/js/room-slider.js` | **Keine Änderung** — Engine ist layout-agnostisch. Nur eine kleine Anpassung im Dynamic-Height-Pfad: bei `fullbleed` ist Höhe durch Aspect-Ratio fixiert, JS überspringt `setHeight()`. |
| 4 | Homepage-Template | `template-homepage.php` | Bisherige `.pxz-hero-img-wrap` ersetzen durch Slider-Render. Aufruf neue Helper-Funktion `pxz_render_homepage_slider()`. |
| 5 | Slider-Aggregator | `inc/homepage-slider-data.php` (NEU) | Funktion `pxz_get_homepage_slides()`: liest media-text-Blöcke aus Page 9691 + 9693, mischt mit Seed=`date('Ymd')`, prepended Aktuelles-Slide. |
| 6 | Aktuelles-Slide | `template-parts/homepage-slide-aktuelles.php` (NEU) | Rendert die Wartelisten-Info als eigenständiges Slide-Markup (kein media-text, sondern eigener Inner-Container). |
| 7 | Hochkant-Cleanup | DB via wp-cli | `core/media-text`-Blöcke aus Pages 9691 + 9693 entfernen, deren Bild Hochformat ist. Vorher: Image-Dimensionen abfragen, Liste der zu entfernenden Slides erstellen. |
| 8 | Nav-Cleanup | `inc/nav-data.php` | „Aktuelles"-Item aus DE/EN/FR/ES-Primary-Nav entfernen. `match_prefix` auf `Praxis`-Parent entsprechend anpassen (`/aktuelles/` raus). |
| 9 | Enqueue | `functions.php` | Slider-CSS+JS jetzt auch auf Homepage enqueuen (zusätzlich zu Standard-Template-Pages). Theme-Version → 2.7.54. |
| 10 | Postmeta-Setup | DB via wp-cli | Pages 9691 + 9693 bekommen `pxz_slider_layout = 'fullbleed'`. (`pxz_use_room_slider = 1` bleibt.) |

### Aktuelles-Slide — Inhalt (Dr. Strackes Wortlaut)

```
[Eyebrow]: Aktuelles
[Headline]: Aufgrund der hohen Nachfrage führen wir eine Warteliste für Neupatienten.
[Body]: Die aktuellen Regeln zur Aufnahme finden Sie unter
        [Link: Neupatienten-Anmeldung → /service/neupatienten/]
```

Visuell:
- Inner-Container mit `var(--pxz-chalk)`-Hintergrund
- 1px Border in `var(--pxz-teal)` für Akzent
- Padding 32–48 px responsive
- Border-radius 28 px (Konsistenz mit Slider-Container)
- Headline in `--pxz-ink`, Body in `--pxz-graphite`, Link mit Teal-Underline

### Hochkant-Identifikation

Vor Cleanup wird mit wp-cli für Pages 9691 + 9693 ermittelt:
- Liste aller `core/media-text`-Blöcke
- Pro Block: Attachment-ID des Bildes, Bild-Dimensionen (`wp_get_attachment_metadata`)
- Klassifikation: `width >= height` → Querformat (bleibt), `width < height` → Hochformat (raus)

Ergebnis-Tabelle wird **vor** dem Cleanup im Chat gezeigt — Dr. Stracke hat Veto-Recht für einzelne Slides, falls Crop-Ergebnis akzeptabel wäre.

---

## Acceptance-Kriterien (10)

| # | Kriterium |
|---|---|
| AK-01 | Hochkant-Slides aus Pages 9691 + 9693 entfernt — Smoke-Test zeigt nur Querformat-Slides |
| AK-02 | Standort-Pages rendern Slider im neuen `fullbleed`-Modus: Bild füllt Slide-Fläche, Caption-Kapsel bottom-left |
| AK-03 | Homepage rendert Slider statt einzelnem Hero-Bild — Headline+CTAs links unverändert |
| AK-04 | Homepage-Slider zeigt als erste Slide das Aktuelles-Slide (Inner-Container, kein Bild, mit Wartelisten-Text + Link auf `/service/neupatienten/`) |
| AK-05 | Homepage-Slider mischt Slides aus 9691 + 9693, Reihenfolge stabil pro Tag (`date('Ymd')`-Seed) |
| AK-06 | Caption-Tönungs-Switch funktioniert: Default weiße Box mit dunklem Text; mit `caption-tone="dark"` → dunkle Box mit weißem Text |
| AK-07 | Menüpunkt „Aktuelles" in DE/EN/FR/ES aus Header entfernt — keine Lücke im Nav, `match_prefix` korrigiert |
| AK-08 | Slider-JS funktioniert in fullbleed-Modus: Swipe + Pfeile + Dots + Keyboard + ARIA + Reduced-Motion |
| AK-09 | Smoke-Test (5/5 HTTP 200): `/`, `/standorte/`, `/standorte/zweigpraxis-bockenheimer/`, `/service/neupatienten/`, `/praxis/` |
| AK-10 | Theme-Version auf 2.7.54 erhöht; `verify.sh` grün |

---

## Sicherheitsnetz

- **Vor jeder DB-Operation:** Backup der `post_content`-Felder von Pages 9691 + 9693 in lokale Datei `_backup/S46-pre-cleanup-9691.txt` und `_backup/S46-pre-cleanup-9693.txt`
- **Reversibilität:** Falls Cleanup falsch klassifiziert: aus Backup wieder einspielen
- **Theme-Git:** vor Beginn `git status` prüfen, alle S45-Änderungen müssen committet sein
- **Live-Push:** NICHT in dieser Session. Nur lokal in Local Sites. Live-Push separat nach Freigabe (Local-First-Workflow, LL-051)

---

## Out-of-Scope (für S46 explizit nicht enthalten)

- Page `/aktuelles/` selbst löschen (lasse stehen, ggf. Direktlinks/SEO)
- WPML-i18n-Anpassungen über Nav-Items hinaus
- Bessere Bilder hochladen (Hochformat-Lücken bleiben Lücken — Folgesession)
- Aktuelles-Slide als „echtes" Custom-Block mit Editor-UX (aktuell nur PHP-Render)

---

## Folge-Sessions (potenziell)

- **S47:** Querformat-Räume-Bilder nachschießen (falls Cleanup zu viele Slides entfernt)
- **S48:** Aktuelles-Slide mit Editor-UX (Custom-Block oder ACF-Feld) — wenn Wartelisten-Info häufiger wechselt
- **WV-002:** Sync-Hardening (parallel, eigenständig)
