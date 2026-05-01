# Container-Standard (Praxis-Webseite)

> Verbindlicher Architektur-Standard seit S58 (2026-05-01, Dr. Stracke).
> Vorher: jedes Template hatte eigene `max-width`-Werte (760, 840, 1080,
> 1140, 1200, 1260, 1500, 1560, 1680 …). Folge: Mehrarbeit + visuelle
> Inkonsistenz. Diese Regel beendet das.

## Regel

**Outer-Container (Page-Wrapper):** `max-width: 1600px` einheitlich auf
allen Praxis-Seiten. Klasse: `.pxz-container` (definiert in
`assets/css/components.css`).

**Inner-Lese-Kanal (Fließtext):** `max-width: 75ch` (~720 px). Wird
genutzt, damit Zeilen auf großen Monitoren angenehm lesbar bleiben.
Klasse: `.pxz-prose`.

**Sondersektionen** (Hero zentriert, CTA-Card schmal): dürfen kleiner
sein, müssen aber im CSS-Kommentar dokumentieren *warum* (z. B.
"Hero-Headline zentriert auf 840 px für Lesefluss"). Beliebige
Eigen-Breiten ohne Begründung sind verboten.

## Layout-Pattern

```html
<section class="pxz-section">
  <div class="pxz-container">              <!-- 1600 px outer -->
    <div class="pxz-prose">                <!-- 75ch reading lane -->
      <h2>…</h2>
      <p>…</p>
    </div>
  </div>
</section>
```

Card-Grids, Hero-Bilder, Slider etc. dürfen die volle 1600-px-Breite
nutzen. Reiner Fließtext (Klappentexte, Bios, "Über uns") gehört in
den 75ch-Kanal.

## Migrationsstand (2026-05-01)

| Template | Outer | Status |
|---|---|---|
| Homepage (`template-homepage.php` / `homepage.css`) | 1600 (`.pxz-mfa-inner`, `.pxz-hero-img-wrap`) | ✅ Referenz |
| Team-Übersicht (`template-team.php` / `team.css`) | 1600 (S58) | ✅ migriert |
| Arzt-Detail (`template-arzt.php` / `arzt.css`) | gemischt | ⏳ TODO |
| Standard (`template-standard.php` / `standard.css`) | 1260 / 1140 / 1680 | ⏳ TODO (Werte aus S41) |
| Page (`page.css`) | 1260 | ⏳ TODO |
| Sprechstunden | 880 | ⏳ TODO |
| Kontakt | 1080 | ⏳ TODO |
| Page-Hub | 1200 | ⏳ TODO |
| Bridge-Product | 840–1120 | ⏳ TODO |
| Checkup-Hub | 840–1120 | ⏳ TODO |

**Migrationsregel:** Bei jedem nächsten Edit eines noch nicht
migrierten Templates Container-Wert auf 1600 anheben + Lese-Kanal
einziehen. Keine Big-Bang-Migration nötig (Aufwand vs. Nutzen), aber
*kein* neuer Code mit alten Werten.

## Verstoß-Erkennung

- **Manuell:** Bei jedem Code-Review CSS-Diff auf `max-width: <Wert>px`
  prüfen — wenn ≠ 1600 oder 75ch und keine Begründung im Kommentar →
  zurückweisen.
- **Optional automatisiert:** Sanitizer-Regel
  `assets/css/*.css` → grep `max-width: \d+(px|rem)` außerhalb der
  Allowlist (Hero/CTA-Sondergrößen) → Warning bei `--probe`.

## Bezug zu LL-058

LL-058 (Cross-Page-Konsistenz) verlangt, dass Content-Änderungen, die
einen Kontext betreffen, der auf mehreren Seiten existiert, überall
synchron umgesetzt werden. Container-Architektur ist ein klassischer
Cross-Cutting-Aspekt — der globale Standard hier ist die strukturelle
Antwort darauf.
