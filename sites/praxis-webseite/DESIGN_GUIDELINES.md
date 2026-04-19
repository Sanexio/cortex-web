# Design-Richtlinien — Praxiszentrum Dr. Stracke & Kollegen

**Version:** 2.0 · Apple HIG-basiert
**Verbindlich für:** alle Sektionen, alle Sprachen (DE/EN/FR/ES)
**Regel:** Vor JEDEM Entwurf die §12-Checkliste durchgehen. Keine Ausnahmen.

---

## 0. Grundlage: Apple Human Interface Guidelines

Diese Richtlinien basieren auf den öffentlichen Apple HIG (https://developer.apple.com/design/human-interface-guidelines). Die drei Kernprinzipien und ihre Übertragung auf diese Webseite:

| Apple-Prinzip | Übersetzung für uns |
|---------------|---------------------|
| **Clarity** | Text ist immer lesbar. Klarer Kontrast. Kein visuelles Geraune. |
| **Deference** | Inhalt steht im Vordergrund. UI ist zurückhaltend. Viel Weißraum. |
| **Depth** | Subtile Schatten, dezente Hover-Effekte. Nie überladen. |

Alle Detailregeln unten folgen diesen drei Prinzipien.

---

## 1. Clarity — Lesbarkeit & Kontrast

### 1.1 Absolute Verbotsregeln (HART, keine Ausnahmen)

- ❌ **NIE:** Textfarbe identisch oder sehr ähnlich zur Hintergrundfarbe — weder im Ruhezustand noch bei Hover/Focus
- ❌ **NIE:** Schwarzer Text auf dunklem Hintergrund (unabhängig von Hover)
- ❌ **NIE:** Text, der erst bei Hover sichtbar wird — Inhalt muss bei erstem Rendern lesbar sein
- ❌ **NIE:** `opacity` unter `0.95` auf primärem Fließtext
- ❌ **NIE:** `color: inherit` an Elementen innerhalb kontrastwechselnder Sektionen ohne explizite Fallback-Farbe

### 1.2 Kontrast-Mindestwerte (WCAG 2.1 + Apple HIG)

| Text-Typ | Minimum Kontrast | Apple HIG-Entsprechung |
|----------|-----------------|-------------------------|
| Body < 18px | **7:1 (AAA)** | label (primary) |
| Body ≥ 18px | 4.5:1 (AA) | label (primary) |
| Sekundärtext (Meta) | **4.5:1** | label (secondary) |
| Disabled/Tertiär | 3:1 | label (tertiary) |
| Interaktive UI-Elemente | 3:1 | systemBlue etc. |

### 1.3 Semantische Farb-Tokens

Wir verwenden **immer** Tokens, nie direkte Hex-Werte im Template:

```
--pxz-text-primary    = #1D1D1F    (auf hell) / #FFFFFF   (auf dunkel)
--pxz-text-secondary  = #424245    (auf hell) / #D2D2D7   (auf dunkel)
--pxz-text-tertiary   = #86868B    (auf hell) / #A1A1A6   (auf dunkel)
--pxz-text-accent     = #C8161D    (auf hell) / #F5B800   (auf dunkel)
```

Jede Sektion setzt diese Tokens **lokal** neu, damit inherited colors automatisch passen. Das verhindert Schwarz-auf-Schwarz per Konstruktion.

---

## 2. Typografie (Apple HIG-Type-System)

### 2.1 Font-Stack
```css
-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", sans-serif
```

### 2.2 Type-Scale (angelehnt an Apple Dynamic Type)

| Rolle | Apple-Äquivalent | Desktop | Mobile | Gewicht | Tracking |
|-------|------------------|---------|--------|---------|----------|
| Large Title | largeTitle | 96–104px | 48px | 600 | -0.025em |
| Title 1 | title1 | 64–80px | 40px | 600 | -0.02em |
| Title 2 | title2 | 40–48px | 32px | 600 | -0.015em |
| Title 3 | title3 | 28–32px | 24px | 600 | -0.01em |
| Headline | headline | 22px | 20px | 600 | -0.005em |
| Body | body | 17–20px | 17px | 400 | 0 |
| Callout | callout | 17px | 16px | 400 | 0 |
| Subheadline | subheadline | 15px | 15px | 400 | 0.01em |
| Footnote | footnote | 13px | 13px | 500 | 0.02em |
| Caption | caption1 | 12px | 12px | 500 | 0.03em |

**Minimum Body:** 17px Desktop / 16px Mobile. Darunter geht nichts.

### 2.3 Line-Heights

- Display/Titles: 1.05–1.15
- Body: 1.5–1.6
- UI: 1.2–1.4

---

## 3. Deference — Weißraum & Layout

### 3.1 8pt-Grid

Alle Abstände sind Vielfache von 4px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96, 128, 160.

### 3.2 Container

- Max-Breite: **1280px**
- Außen-Padding: **24px Mobile**, **48px Tablet**, **64px Desktop**

### 3.3 Section-Padding (vertikal) — ⚠️ OBSOLET (v2.0)

> **Diese Tabelle ist ab v2.1 durch §13.4 ersetzt.** Die Werte unten sind
> nur noch dokumentarisch. Bei Implementierung IMMER §13.4 nutzen, sonst
> Fehler PXZ-E-006 (v2.0-Werte zu groß, Seite wirkt aufgebläht). §13.4 ist
> die verbindliche Tabelle, diese hier wird nicht mehr gepflegt.

| Typ | Mobile | Tablet | Desktop |
|-----|--------|--------|---------|
| Standard | ~~80px~~ | ~~112px~~ | ~~144px~~ |
| Hero | ~~96px top / 64px bottom~~ | ~~128px / 80px~~ | ~~160px / 96px~~ |
| Strip (Stats) | ~~56px~~ | ~~64px~~ | ~~80px~~ |

### 3.4 Card-Padding (innen)

Karten-Typen und deren Mindest-Padding:

| Card-Typ | Mobile | Desktop |
|----------|--------|---------|
| Kleine Card (Spec, Service-Tertiary) | 32px | 40px |
| Mittlere Card (Service Main) | 40px | 48px |
| Große Card (Standorte, Hero-Card) | 48px | **80–96px** |

**Regel:** Nie Inhalt näher als 24px am Kartenrand.

### 3.5 Corner-Radii (Apple-Signature)

- Kleine UI-Elemente: 8px
- Buttons (Pill): 9999px
- Standard Cards: **22px**
- Hero Cards: **28px**
- Input Fields: 12px

---

## 4. Depth — Schatten & Tiefe

### 4.1 Shadow-Scale

```css
/* Elevation 0 — Flat */
box-shadow: none;

/* Elevation 1 — Soft (Cards im Ruhezustand) */
box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03);

/* Elevation 2 — Medium (Hero, prominente Cards) */
box-shadow: 0 8px 24px -8px rgba(0,0,0,0.08);

/* Elevation 3 — Lift (Hero-Images, Hauptstandort) */
box-shadow: 0 24px 48px -16px rgba(0,0,0,0.12);

/* Elevation 4 — Accent (Hauptstandort mit Akzent-Schatten) */
box-shadow: 0 24px 48px -16px rgba(200,22,29,0.12);
```

### 4.2 Hover-Verhalten

- Hover = **Enhancement**, nie neue Information aufdecken
- Erlaubt: leichter Shadow-Lift, sanfter Farb-Accent auf Border, kleiner `translateY(-2px)`
- Verboten: Farbwechsel des Haupttexts (Text muss IMMER vollständig sichtbar sein)
- Transition: 200-300ms, `ease` oder `ease-out`, kein Bounce

### 4.3 Focus (Keyboard-Nutzer)

- Sichtbarer Focus-Ring (2px, `outline-offset: 3px`, Farbe: Akzent)
- Never `outline: none` ohne Ersatz

---

## 5. Farbsystem

### 5.1 Palette

| Token | Hex | Einsatz |
|-------|-----|---------|
| `--pxz-white` | #FFFFFF | Primäre Canvas |
| `--pxz-snow` | #FBFBFD | Ultra-Light Off-White |
| `--pxz-chalk` | #F5F5F7 | Sekundär-Fläche (Cards, Alt-Sektion) |
| `--pxz-line` | #D2D2D7 | Trennlinien, Borders |
| `--pxz-mist` | #86868B | Tertiärtext |
| `--pxz-graphite` | #424245 | Sekundärtext |
| `--pxz-ink` | #1D1D1F | Primärtext, dunkle Blöcke |
| `--pxz-red` | #C8161D | Primärakzent (Logo), Buttons, Links auf Hell |
| `--pxz-red-dark` | #8B0F14 | Hover-Rot |
| `--pxz-amber` | #F5B800 | Akzent auf dunkel (Text, Buttons) |
| `--pxz-amber-bright` | #FFD700 | Hover-Amber |

### 5.2 Sektions-Farbmodi

| Modus | Background | Primary-Text | Secondary-Text | Accent |
|-------|-----------|--------------|----------------|--------|
| Light | `--pxz-white` oder `--pxz-chalk` | `--pxz-ink` | `--pxz-graphite` | `--pxz-red` |
| Dark | `--pxz-ink` | `#FFFFFF` | `rgba(255,255,255,0.85)` | `--pxz-amber` |

### 5.3 Mix-Verbot

**Auf dunkel NIE Rot, auf hell NIE Amber.** Rot ist ausschließlich Hell-Akzent (aus Logo), Amber ausschließlich Dunkel-Akzent.

---

## 6. Komponenten

### 6.1 Buttons (Apple-Style Pill)

| Variante | Use | Background | Text | Hover |
|----------|-----|-----------|------|-------|
| Primary | Haupt-CTA | `--pxz-ink` | `#FFF` | Graphite |
| Accent (Hell) | Call-to-Action | `--pxz-red` | `#FFF` | Red-dark |
| Accent (Dunkel) | CTA auf Dark-Sektion | `--pxz-amber` | `--pxz-ink` | Amber-bright |
| Ghost (Hell) | Sekundär | `#FFF` + Line-Border | `--pxz-ink` | Chalk-BG |
| Ghost (Dunkel) | Sekundär auf Dark | transparent + weiße Border | `#FFF` | weiße Border voll |

Mindestgröße: **44×44px Tap-Target** (Apple HIG), Padding min. `14px 28px`.

### 6.2 Navigation

- Sticky Top-Header, initial solid weiß mit Line-Border
- Bei Scroll > 8px: leichter Shadow (Elevation 1)
- Höhe: **min 96px Desktop, 80px Mobile** — damit Logo atmen kann
- Logo IMMER sichtbar, kein Shrinking

### 6.3 Cards

- Standard-Radius: 22px
- Hero/Prominent-Radius: 28px
- Immer Content mit min. 24px Abstand zu allen Rändern
- Nie Cards in Cards stapeln (max. 1 Ebene)

### 6.4 Forms (Apple HIG-Input-Style)

- Input-Höhe: 48px
- Radius: 12px
- Border: 1px `--pxz-line`, Focus: 2px `--pxz-red`
- Label immer oberhalb, 13px

---

## 7. Logo & Branding — Kern-Markenelement

### 7.1 Größen (harte Untergrenze)

| Kontext | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Header | 64px | 88px | **96px** |
| Footer | 56px | 56px | 64px |

Der Logo-Text rechts davon (zweizeilig) ist so groß, dass er die Logo-Höhe optisch "ausbalanciert".

### 7.2 Text neben Logo

- Zeile 1: "Praxiszentrum" — **Title 3** (28–32px Desktop), Semibold
- Zeile 2: "Dr. Stracke & Kollegen" — **Body** (17px), Regular, Mist-Color
- Mobile < 480px: Zeile 2 verschwindet, Zeile 1 auf 18px

### 7.3 Dunkle Sektionen

Logo nicht direkt auf dunkel — stattdessen reiner Text "Praxiszentrum Dr. Stracke & Kollegen" in Weiß, optional mit einer kleinen weißen Markierung.

---

## 8. Bilder

### 8.1 Team

- Aspect **1:1 (quadratisch)**
- Mindestens 1200×1200 Source → 2× Retina
- Object-fit cover, zentriert

### 8.2 Placeholder (bis echte Fotos da)

- Initialen-Avatare auf farbigem Kreis (Palette aus 8 ruhigen Farben)
- Selbe Maße wie echte Fotos

### 8.3 Hero / Standorte

- Aspect 16:9 oder 3:2
- Mindestens 2000px Breite Source
- Lazy-loading außer Hero (eager)

---

## 9. Inhalts- & Navigations-Regeln

### 9.1 Was auf die Homepage gehört

1. Hero (Headline + CTA + Bild)
2. MFA-Stellenanzeige (Dark Accent)
3. Kennzahlen-Strip
4. Fachrichtungen (8 Karten)
5. Ärzteteam (8 Karten)
6. Patienten-Service
7. Standorte
8. Final CTA
9. Footer

### 9.2 Was NICHT auf die Homepage

- Sono-Atlas (nur im Menü, Fachpublikum)
- Blog-Vorschau (nur in V2)
- Testimonials (nur in V2)

### 9.3 Navigation

- 5–6 Hauptpunkte max (Apple HIG: cognitive load)
- Sticky Header, Language Switcher sichtbar

---

## 10. Tonalität & Sprache

### 10.1 Standardsektionen (Patienten-Ansprache)

- Sie-Form
- Sachlich, kompetent, kurz
- Keine Marketing-Floskeln

### 10.2 MFA-Stellenanzeige — Ausnahme

- **Du-Form**
- Locker, selbstbewusst, aber nicht anbiedernd
- Keine Slang-Wörter (krass, mega, geil)
- Keine Floskeln (Praxisfamilie, Helden, wachsen Sie über sich hinaus)

---

## 11. Multilingual

- 4 Sprachen: DE (lead), EN, FR, ES
- Übersetzung IMMER manuell geprüft (kein Google-Translate-Feel)
- Kürzungen im Layout per Sprache tolerieren (`text-wrap: balance`)
- Language Switcher sichtbar im Header + Footer

---

## 12. Prüf-Checkliste — vor jedem Entwurf durchgehen

**Kontrast & Lesbarkeit (Clarity)**
- [ ] Kein Text mit Farbe = Background-Farbe, auch nicht im Ruhezustand
- [ ] Kein Content erscheint erst bei Hover
- [ ] Opacity auf Text ≥ 0.95
- [ ] WCAG AA (4.5:1 für Body, 3:1 für Large Text)
- [ ] In dunkler Sektion: Text `#FFF` oder `rgba(255,255,255,0.85)`, Akzent Amber
- [ ] In heller Sektion: Text Ink, Akzent Red

**Typografie**
- [ ] Body-Min 17px Desktop / 16px Mobile
- [ ] Micro-Labels min 13px
- [ ] SF Pro Font-Stack korrekt

**Layout**
- [ ] 8pt-Grid eingehalten
- [ ] Container-Padding 24/48/64
- [ ] Card-Padding ≥ 32px Mobile, ≥ 48px Desktop für große Cards
- [ ] Symmetrische Grids, gleiche Zeilenhöhen
- [ ] Sektionsrhythmus: hell dominant, dunkel als Akzent

**Logo**
- [ ] Header-Logo ≥ 96px Desktop, ≥ 64px Mobile
- [ ] Logo-Text zweizeilig, prominent
- [ ] Footer-Logo sichtbar

**Bilder**
- [ ] Team 1:1 Aspect
- [ ] Hero 16:9 Aspect
- [ ] Placeholder-Avatare konsistent

**Content**
- [ ] Sono-Atlas NICHT auf Homepage
- [ ] MFA du-Form, Rest Sie-Form
- [ ] Alle 4 Sprachen geprüft

**Technik**
- [ ] CSS-Version gebumpt
- [ ] Keine inline `color: inherit` ohne Fallback
- [ ] Semantisches HTML (h1→h2→h3 Hierarchie)
- [ ] `:focus-visible` sichtbar

---

---

## 13. Spacing-System — HARTE Werte (v2.1, 2026-04-17)

Diese Werte sind **verpflichtend**. Abweichen nur mit expliziter Freigabe Dr. Stracke.

### 13.1 Container-Padding (Außen-Abstand zum Viewport)

| Viewport | Padding links/rechts |
|----------|---------------------|
| < 768 px (Mobile) | **24 px** |
| 768–1279 px (Tablet) | **48 px** |
| ≥ 1280 px (Desktop) | **64 px** |

### 13.2 Card-Innenpadding (in ALLEN Card-Typen)

**Harte Untergrenze: Text darf NIE näher als die angegebenen Werte am Card-Border sein.**

| Card-Typ | Mobile (top/side) | Tablet (top/side) | Desktop (top/side) |
|----------|-------------------|-------------------|---------------------|
| Standard-Card (Service, Benefit) | 40 / 32 | 56 / 48 | 64 / 56 |
| Große Card (Standorte, CTA) | **72 / 40** | **96 / 72** | **112 / 96** |
| Hero-Image-Card | 0 (Bild-Card) | 0 | 0 |

**Eyebrow-Mindestabstand zum Card-Top = Card-Padding-Top.** Wenn das nicht reicht (Eyebrow berührt optisch den Border), Padding-Top erhöhen — niemals Eyebrow näher ranziehen.

### 13.3 Vertikale Text-Abstände innerhalb einer Card/Sektion

| Zwischen | Abstand |
|----------|--------|
| Eyebrow → Headline (H2/H3) | **16–20 px** |
| Headline → Subtitle | **8–12 px** |
| Subtitle → Fließtext | **24 px** |
| Fließtext → Primary CTA | **32–40 px** |
| CTA → Fußnote (Priv.-Tel, E-Mail-Hint) | **16–20 px** |

### 13.4 Sektions-Padding (vertikal, Außenhülle)

| Sektions-Typ | Mobile | Tablet | Desktop |
|--------------|--------|--------|---------|
| Hero | **80 / 40** top/bot | 104 / 56 | 128 / 72 |
| Standard-Sektion | 64 | 80 | 96 |
| Strip (Stats) | 56 | 64 | 80 |
| Dark-Sektion (MFA, CTA) | **64** | **80** | **96** |

**Harte Obergrenze für Sektions-Höhe:**
- Hero: keine (wird vom Content bestimmt)
- MFA-Dark und Final-CTA: **max 85 vh pro Sektion**
- Standard-Sektionen: keine harte Grenze, aber organisch vom Content

### 13.5 Max-Width für Fließtext

Fließtext-Spalte **max 40 rem** (~640 px) auf großen Viewports. Länger ergibt ungleichmäßige Umbrüche („Orphan-Words"). `text-wrap: balance` zusätzlich setzen.

---

## 14. Card-Referenz-Pattern (Goldstandard)

Die Standort-1-Card (Grüneburgweg 12) ist das **kanonische Referenz-Pattern** für alle Full-Width-Inhalts-Karten.

### 14.1 Struktur (immer in dieser Reihenfolge)

```
[optional: Corner-Badge, absolute top-right]
[eyebrow — caption-size, uppercase, letter-spacing 0.12–0.18em]
[h2/h3 — title-size, semibold]
[subtitle — body-size, mist]
[divider — 1 px line, margin 40/48 px]
[content-grid — 1/2/3 Spalten je nach Viewport]
```

### 14.2 Wann eine Card-Hülle verwenden (PFLICHT-Fälle)

- **Standort-Cards:** Ja (Main: mit roter Border, Sek: Chalk-BG)
- **Final-CTA „Sie haben Fragen?":** Ja (ruhiger Rahmen, Shadow, max 960 px Breite)
- **Service-Cards, Benefit-Cards:** Ja
- **Hero, MFA-Dark:** Nein (vollflächige Sektion ohne Card-Hülle — die Sektion IST der Container)

### 14.3 Card-Signature

- Radius: 28 px (Hero) / 22 px (Standard)
- Shadow: Elevation 1–3 je nach Kontext
- Hintergrund: `--pxz-white` (Haupt) oder `--pxz-chalk` (Neben)

---

## 15. Anti-Patterns — NIE wieder (aus Sessions 2026-04-17)

Diese Fehler wurden in realen Iterationen gemacht. Sie dürfen nicht wiederholt werden.

### 15.1 Badge überlappt Eyebrow-Text

**Falsch:** Badge mit `top: -16px; left: 48px` klebt am Card-Oberrand und verdeckt Eyebrow.
**Richtig:** Badge oben-rechts innerhalb der Card (`top: 48/64 px; right: 48/64 px`), Header bekommt `padding-right` damit Titel nicht unterläuft. Mobile: Badge als Inline-Pill oberhalb des Eyebrows (static, margin-bottom 1.25 rem).

### 15.2 Eyebrow klebt am Card-Border

**Ursache:** Card-Padding-Top zu klein oder Card hat Border, der den Text visuell durchschneidet.
**Regel:** Card-Padding-Top **mindestens 72 px Mobile / 112 px Desktop** bei großen Cards mit Eyebrow.

### 15.3 Sektion ohne Container-Wrapper

**Falsch:** Freistehender Text (z. B. Final-CTA) direkt auf Sektions-Background ohne Card-Hülle.
**Richtig:** Card-Wrapper mit Border + Padding + Radius. Siehe §14.2 für PFLICHT-Fälle.

### 15.4 Zu viel Vertikalraum in Dark-Sektionen

**Falsch:** MFA-Sektion mit 160 px Sektions-Padding → wirkt aufgebläht, Eyebrow schwebt im Leeren.
**Regel:** Dark-Sektionen max **96 px** top/bot auf Desktop, max **80 px** Tablet, max **64 px** Mobile.

### 15.5 Ungleichmäßige Abstände zwischen Text-Elementen

**Falsch:** Ad-hoc margin-Werte (1.75 rem, 3 rem, 48 px) ohne System.
**Richtig:** Werte aus §13.3 verwenden. Keine Ausreißer.

### 15.6 Fließtext ohne Max-Width → Orphan-Words

**Falsch:** Hero-Subtitle auf 44 rem mit schlechten Umbrüchen („Eine / Philosophie").
**Richtig:** Max 40 rem + `text-wrap: balance` + Content ggf. um 1–2 Wörter kürzen.

---

## 16. Anti-Patterns — Implementierungs-Ebene (v2.2, 2026-04-17)

Diese Anti-Patterns sind nicht visueller, sondern **technischer** Natur. Sie
sind die häufigste Ursache dafür, dass visuelle Regeln (§13–§15) nicht greifen,
obwohl der CSS-Quelltext korrekt aussieht. Siehe `_rules/FEHLERPROTOKOLL.md`
für die originären Befunde.

### 16.1 Split-Location-CSS (PXZ-E-001)

**Falsch:** Dieselbe Reset- oder Override-Regel existiert parallel in
`style.css` UND im Inline-`<style>` von `template-homepage.php`. Die
Änderung an einer Stelle wird durch die andere still überschrieben.
**Richtig:** Jede Regel lebt an genau **einer** Stelle. Vor jeder CSS-Änderung
grep über beide Dateien. `tools/verify.sh --grep-split` prüft dies automatisch.

### 16.2 Generischer Tag-Selektor im Reset (PXZ-E-002)

**Falsch:** `body.page-template-template-homepage article { padding: 0 !important }`
— trifft alle inneren `<article>`-Cards wie `.pxz-loc-card`.
**Richtig:** Reset-Selektoren auf Klassen oder direkte Kinder-Kombinatoren
beschränken, z. B. `body.xxx main.site-main > article:first-child` oder
`.entry-content`. `tools/verify.sh --reset-scope` prüft dies.

### 16.3 Referenz-Bild-Interpretation (PXZ-E-003)

**Falsch:** Dr. Strackes Referenz `screenshots/N.png` wird „sinngemäß"
übersetzt oder mit einem anderen Bild verwechselt.
**Richtig:** Jedes Referenz-Bild ist eine **harte 1:1-Vorgabe**. Wenn unklar:
Rückfrage statt Annahme. Side-by-Side-Diff im Verify-Lauf.

### 16.4 Screenshot ohne Computed-Style-Probe (PXZ-E-004)

**Falsch:** CSS geändert → Screenshot → „sieht gut aus" → fertig. Der
Screenshot zeigt nur das Endergebnis, nicht welche Regel tatsächlich greift.
Bei Spezifitäts-Konflikt bleibt die Änderung wirkungslos, ohne dass man
es auf dem Screenshot erkennt.
**Richtig:** Nach jeder Änderung an harten Werten die Computed-Style-Probe
laufen lassen (`tools/verify.sh --probe`). Erst wenn alle Selektoren die
erwarteten Werte im Browser zeigen, ist die Änderung wirksam.

---

### 16.5 Spezifitäts-Konflikt bei globalen Element-Resets (PXZ-E-008)

**Falsch:**
```css
.pxz-home p { margin: 0; color: inherit; }   /* Spezifität 0,1,1 */
.pxz-hero-sub { margin: 1.25rem auto 0; }    /* Spezifität 0,1,0 — verliert lautlos! */
```
Alle `<p>`-Elemente bekommen `margin: 0`, obwohl eine nachfolgende Klassen-Regel
Margins setzen will. Bei `max-width + margin: auto` wird das Element dann **nicht
zentriert** — es sitzt links im Container.

**Richtig:**
```css
.pxz-home :where(p) { margin: 0; }   /* Spezifität 0,1,0 (Tag trägt 0 bei) */
.pxz-home p { color: var(--pxz-text); }
.pxz-hero-sub { margin: 1.5rem auto 0; }   /* gewinnt jetzt */
```

**Regel:**
1. Globale Element-Resets in Theme-Containern IMMER mit `:where()` spezifitätsneutral setzen.
2. Nach jeder Margin/Alignment-Änderung per Probe prüfen: `getComputedStyle(el).marginLeft`
   muss dem CSS-Wert entsprechen. `tools/ab-diff.mjs` enthält einen Alignment-Check.
3. Wenn ein zentriertes Block-Element trotz `margin: auto` nicht mittig sitzt:
   IMMER zuerst Spezifität des globalen Resets prüfen, nicht das Layout.

*Siehe `_rules/FEHLERPROTOKOLL.md` PXZ-E-008 für den konkreten Fall
(v2.6.2 → v2.6.3, Hero-Subtitle, Final-Privatpatienten-Zeile, MFA-Sub).*

### 16.6 Version-Archäologie — alte Tabellen explizit als obsolet markieren (PXZ-E-006)

Wenn eine Tabelle/Werteliste durch eine neuere ersetzt wird: **IMMER im alten Abschnitt
einen ⚠️-Hinweis einfügen mit Zeiger auf den aktuellen Abschnitt und die PXZ-E-ID des
Fehlers, der bei Verwendung der alten Werte entsteht.** Nie stillschweigend neue Werte
anhängen — der Code-Leser findet sonst die veraltete Tabelle zuerst und folgt ihr.

---

*Changelog:*
- v2.3 (2026-04-18): §3.3 als obsolet markiert (wird durch §13.4 ersetzt).
  §16.5 neu: Spezifitäts-Regel für globale Element-Resets (PXZ-E-008).
  §16.6 neu: Obsolet-Kennzeichnung von alten Regeltabellen (PXZ-E-006).
- v2.2 (2026-04-17): §16 Anti-Patterns auf Implementierungs-Ebene (Split-Location,
  generischer Tag-Selektor, Referenz-Interpretation, Computed-Style-Probe).
  Flankiert durch `_rules/FEHLERPROTOKOLL.md` + `_rules/PRE_FLIGHT_CHECKLIST.md`
  + `tools/verify.sh`.
- v2.1 (2026-04-17): §13 Spacing-System hart definiert. §14 Card-Referenz-Pattern. §15 Anti-Patterns aus Session dokumentiert.
- v2.0 (2026-04-17): Komplette Neufassung nach Apple HIG. §1.1 Verbotsregeln hinzugefügt (Schwarz-auf-Schwarz explizit). §5 Semantic-Token-System. §10 Tonalität.
- v1.2 (2026-04-17): Logo-Größen hochgezogen auf 96px.
- v1.0 (2026-04-17): Initialfassung.
