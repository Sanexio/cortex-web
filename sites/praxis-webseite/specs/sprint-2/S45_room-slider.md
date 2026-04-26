# S45 — Room Slider auf Standort-Pages (Hauptpraxis + Zweigpraxis)

**Sprint:** 2 (Kernseiten-Ausbau)
**Session:** 26 (2026-04-26)
**Theme-Commits:** `ff3720a` (PXZ 2.7.52, Slider) + `901b602` (PXZ 2.7.53, Dynamic-Height)

---

## Verständnis

**Anforderung:** Auf den beiden Standort-Pages soll der Content unterhalb des Adress-Containers in einen ähnlichen Container gepackt werden, der per Pfeil-Navigation oder Swipe-Geste durchblätterbar ist. Hintergrund: Dr. Stracke möchte einzelne Räume mit Bildern + Erklärung darstellen. Testlauf zuerst auf Zweigpraxis mit den 2 vorhandenen Inhalten, dann Ausrollen auf Hauptpraxis.

**Zielzustand:**
- Karussell mit Pfeilen + Swipe + Dot-Indikator + Keyboard
- Container optisch differenziert vom Adress-Container, aber gleiche Architektur
- Wiederverwendbar für andere Pages via Toggle
- Container-Höhe folgt aktivem Slide (Dynamic Height) — Hochformat-Bilder werden nicht von Querformat-Bildern auf Mindesthöhe gestreckt und umgekehrt

**Constraints:**
- Editor-UX bleibt 1:1 — Dr. Stracke editiert Räume im Block-Editor
- Keine externe Slider-Library (Vanilla-JS)
- Adress-Container darüber unverändert
- Andere Pages dürfen nicht regression-affected sein

---

## Lösung

### Architektur

```
template-standard.php (auf Pages mit Postmeta pxz_use_room_slider=1)
├── Adress-Container (loc-secondary.php / loc-main.php) — unverändert
├── NEU: pxz-standard-rooms (eigene Section, .pxz-container 1600px)
│   └── room-slider.php (template-part)
│       ├── HEAD: Blöcke vor erstem media-text (max 1140px Lesebreite)
│       ├── SLIDER: jeder core/media-text → eine Slide
│       │   ├── Pfeile (◀ ▶), Disabled-State an Enden
│       │   ├── Dot-Indikator (●○○), klickbar, aktive Position
│       │   ├── Swipe via Pointer Events (Mouse/Touch/Pen, Threshold 50px)
│       │   └── Keyboard: ←/→/Home/End wenn Slider fokussiert
│       └── TAIL: Blöcke nach letztem media-text (max 1140px Lesebreite)
```

### Implementierung

| Komponente | Datei | Zweck |
|---|---|---|
| Splitter | `template-parts/room-slider.php` (neu) | `parse_blocks($post_content)` → media-text → Slide; übrige Blöcke → head/tail |
| Styles | `assets/css/room-slider.css` (neu) | Container V1 (chalk-bg + 1px line + soft shadow), 50/50 Desktop, Pfeile/Dots, dynamic-height transition |
| Logik | `assets/js/room-slider.js` (neu) | Vanilla-Slider, ~150 Zeilen, A11y, Pointer-Swipe, dynamic height |
| Hook | `template-standard.php` | Bedingte Render-Verzweigung via Postmeta-Toggle |
| Enqueue | `functions.php` | CSS+JS nur auf Standard-Template-Pages mit Toggle = 1 |

### Daten

**Page 9693 (Zweigpraxis Bockenheimer):** 2 vorhandene `core/media-text`-Blöcke aus dem Bestand → 2 Slides ohne Restruktur.

**Page 9691 (Hauptpraxis Grüneburgweg):** 10 neue media-text-Blöcke aus 10 ausgewählten Räume-Bildern (von 14 verfügbaren, Redundanz reduziert):

| # | Slug | Media-ID | Motiv |
|---|---|---|---|
| 1 | empfang | 9798 | Empfangsbereich |
| 2 | wartebereich | 9802 | Wartebereich |
| 3 | flur-eingangsbereich | 9806 | Flur Eingangsbereich |
| 4 | sprechzimmer | 9810 | Sprechzimmer |
| 5 | behandlungszimmer | 9814 | Großes Behandlungszimmer |
| 6 | sonographie-1 | 9818 | Sonographie-Raum |
| 7 | sonographie-2 | 9822 | Zweiter Sonographie-Raum |
| 8 | spezial-untersuchung | 9826 | Spezial-Untersuchungsraum |
| 9 | untersuchungsraum | 9830 | Untersuchungsraum |
| 10 | flur-behandlungstrakt | 9834 | Flur Behandlungstrakt |

Bildquelle: `Cortex-Web/_media-source/praxis/standorte/grueneburgweg/` (14 Originale, 10 selektiert + sprechend benannt + uploaded). 4 ungenutzte Originale bleiben für spätere Erweiterung verfügbar (2, 6, 8, 12).

Texte sind Erstentwürfe von Claude — Dr. Stracke passt im Block-Editor an.

### Container-Variation V1 (gewählt)

- Background: `var(--pxz-chalk)` (warmes Hellbeige) statt `#fff`
- Border: 1 px Linie (`--pxz-line`) statt 2 px Rot
- Shadow: weich (`0 12px 32px -16px rgba(0,0,0,0.08)`) statt Rot-getöntem
- Border-Radius + Padding-Größenordnung identisch zur Adress-Karte
- → visuelle Differenzierung ohne Bruch der Architektur

### Wiederverwendbarkeit

Postmeta-Toggle `pxz_use_room_slider = 1` aktiviert auf jeder Standard-Template-Page. Andere Pages: weiterhin unverändertes `the_content()`-Rendering. Aktivierung auf neue Page: ein Befehl `wp post meta update <id> pxz_use_room_slider 1`.

---

## Akzeptanzkriterien (10/10 grün)

| AK | Kriterium | Beweis |
|---|---|---|
| 1 | Beide Slider rendern korrekt | curl: Zweigpraxis 2 Slides, Hauptpraxis 10 Slides |
| 2 | Adress-Container unverändert | grep `pxz-loc-card--main` + `--sec` weiter im HTML |
| 3 | Pfeile mit Disabled-State | HTML zeigt `disabled` initial auf is-prev |
| 4 | Swipe via Pointer Events | JS bindet pointerdown/move/up/cancel |
| 5 | Keyboard ←/→/Home/End | JS keydown-Handler |
| 6 | Dots klickbar + aria-current | HTML + JS update() |
| 7 | Dynamic Height folgt aktivem Slide | JS setHeight() bei jedem update + image load + resize |
| 8 | Beide Container gleiche Breite (1600 px) | beide in `.pxz-container` |
| 9 | Tail-Text auf Lesebreite (1140 px) | CSS `.pxz-room-slider-tail max-width: 1140px` |
| 10 | Keine Regression auf anderen Pages | smoke-http 5/5 HTTP 200, verify.sh OK |

---

## Lessons (S45-LL-1 … 3)

### S45-LL-1 — `wp media import --porcelain` schreibt ID auf STDOUT, aber Deprecated-Warnings auch

Im Bash-Loop `ID=$(wp media import ... --porcelain 2>/dev/null)` müssen alle Warnings **inkl. PHP-Deprecated-Hinweise** unterdrückt werden, damit `$ID` nur die Zahl enthält. Sicherer Weg: zusätzlich `| tail -1 | tr -d '[:space:]'` filtert die letzte Zeile auf ID.

### S45-LL-2 — Bash-Variable mit Funktions-Definition `WP="php -d ... wp"` schlägt fehl

`$WP cmd args` wird nicht korrekt expandiert wenn `$WP` mit Sub-Shell-Substitution (`$(which wp)`) befüllt war. Lösung: Bash-Funktion `WP() { php -d ... $(which wp) "$@" 2>/dev/null; }` ist robust.

### S45-LL-3 — Slider mit `display:flex; align-items:stretch` zwingt alle Slides auf die maximale Höhe

Standard-Verhalten von Flexbox stretcht die Items auf die Container-Höhe. In einem Karussell mit unterschiedlich hohen Slides bedeutet das: Container-Höhe = höchster Slide für ALLE. Dynamic-Height braucht: `align-items:flex-start` UND JS-`setHeight()` auf den Track. Image-Load-Hook ist Pflicht, weil WP keine `width/height`-Attribute ausgibt → initiale Messung wäre 0.

---

## Selbstprüfung 100 %

Spec entspricht Umsetzung. Alle 10 AKs grün. Verify + Smoke + curl-Probe alle ok. Keine Spec-Abweichungen.
