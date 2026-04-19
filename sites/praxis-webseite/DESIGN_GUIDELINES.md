# Design-Richtlinien — Praxiszentrum Dr. Stracke & Kollegen

**Version:** 3.0 · konsolidiert 2026-04-19 (Sprint 2 / S2.0c)
**Verbindlich für:** alle Sektionen, alle Sprachen (DE/EN/FR/ES)
**Rechts-Grundlage:** Apple Human Interface Guidelines (Kern-Prinzipien)
**Backstop-Referenz:** Cortex Design System v1.0 (siehe §0)

---

## §0 Meta-Regel — Dokumenten-Autorität und Entscheidungs-Backstop

### Dieses Dokument ist die **alleinige** Design-Autorität

Bei jedem Design-Zweifel gilt:

1. **Zuerst hier nachschlagen.** Jede Regel hat eine §-Nummer. Wenn die Regel
   hier steht, wird sie angewandt — ohne Diskussion.
2. **Konflikt mit `assets/css/tokens.css`?** Dieses Dokument gewinnt.
   `tokens.css` wird im nächsten Commit an dieses Dokument angepasst.
3. **Keine ad-hoc-Entscheidungen.** Auch nicht „nur dieses eine Mal". Wenn
   eine Regel fehlt, wird sie hier ergänzt, nicht im Einzelfall erfunden.

### Wenn eine Regel hier **nicht** geregelt ist (Backstop)

1. **Nicht raten.** Nicht ad-hoc festlegen. Kein „das wird schon passen".
2. Stattdessen den **Cortex-Design-System-Default** anwenden.
   - **Primärquelle (portabel im Repo):**
     `design-system/Cortex-Design-System.html` (Claude-Artifact, V1.0,
     React-Bundle, Apple-nah, Inter Tight, `--c-*`-Namensraum).
   - **Sekundärquelle (Original):**
     `~/Library/CloudStorage/GoogleDrive-team@sanexio.de/Meine Ablage/Cortex-Design-System.html`
3. **Die angewandte Default-Regel wird in denselben Commit in dieses
   Dokument eingepflegt** — mit einem Verweis auf Cortex-DS und einer
   §-Nummer. Beim nächsten Mal ist sie nicht mehr „unklar".

### Rangfolge bei Widersprüchen

```
Dr. Stracke (explizite Entscheidung)
        ↓
DESIGN_GUIDELINES.md  (dieses Dokument, §0 … §19)
        ↓
tokens.css  (Schicht 1 Primitives + Schicht 2 Semantic)
        ↓
components.css  (ab S2.0b)
        ↓
page-CSS  (homepage.css, karriere.css, …)
        ↓
Cortex Design System v1.0  (Backstop bei Lücke)
```

### Geltungsbereich

- **Praxis-Webseite:** Alle `.pxz-*`-Klassen, `template-*.php`, `assets/css/*`.
- **NICHT:** Juvantis-Shopify-Theme (`projects/Juvantis/juvantis-web/theme/`).
  Dort gilt ein eigenes Regelwerk (Cortex-DS direkt, ohne pxz-Präfix).

---

## §1 Apple HIG — Kern-Prinzipien (Clarity / Deference / Depth)

Diese Richtlinien basieren auf den öffentlichen Apple Human Interface
Guidelines (https://developer.apple.com/design/human-interface-guidelines).

| Apple-Prinzip | Übersetzung für diese Webseite |
|---------------|-------------------------------|
| **Clarity** | Text ist immer lesbar. Klarer Kontrast. Kein visuelles Geraune. |
| **Deference** | Inhalt steht im Vordergrund. UI ist zurückhaltend. Viel Weißraum. |
| **Depth** | Subtile Schatten, dezente Hover-Effekte. Nie überladen. |

Alle Detailregeln ab §3 folgen diesen drei Prinzipien.

### §1.1 Absolute Verbotsregeln (HART, keine Ausnahmen)

- ❌ **NIE** Textfarbe identisch oder sehr ähnlich zur Hintergrundfarbe — weder Ruhezustand noch Hover/Focus
- ❌ **NIE** Schwarzer Text auf dunklem Hintergrund (unabhängig von Hover)
- ❌ **NIE** Text, der erst bei Hover sichtbar wird
- ❌ **NIE** `opacity` < `0.95` auf primärem Fließtext
- ❌ **NIE** `color: inherit` in kontrastwechselnden Sektionen ohne Fallback-Farbe

### §1.2 Kontrast-Mindestwerte (WCAG 2.1 + Apple HIG)

| Text-Typ | Minimum Kontrast | Apple-HIG-Entsprechung |
|----------|-----------------|------------------------|
| Body < 18px | **7:1 (AAA)** | label (primary) |
| Body ≥ 18px | 4.5:1 (AA) | label (primary) |
| Sekundärtext | 4.5:1 | label (secondary) |
| Disabled/Tertiär | 3:1 | label (tertiary) |
| Interaktive UI | 3:1 | systemBlue etc. |

---

## §2 4-Schichten-Token-Modell (Architektur)

Die **zentrale Architektur-Entscheidung** dieses Projekts: Design-Werte
leben in vier getrennten Schichten. Jede Schicht liest **nur aus der
Schicht darüber**.

```
┌──────────────────────────────────────────────────────────────┐
│  SCHICHT 1 — PRIMITIVES                                      │
│  Datei: assets/css/tokens.css → :root (oberer Block)         │
│  Inhalt: --color-*, --space-1..17, --font-*, --radius-*,     │
│          --shadow-*                                          │
│  Charakter: stackabhängig, harte Werte (Hex, px, Schriftname)│
│  Bei Design-Stack-Wechsel (z. B. Font-Test): NUR diese Schicht│
└──────────────────────────────────────────────────────────────┘
                      │ var()-Referenz
                      ▼
┌──────────────────────────────────────────────────────────────┐
│  SCHICHT 2 — SEMANTIC                                        │
│  Datei: assets/css/tokens.css → :root (unterer Block)        │
│  Inhalt: --pxz-c-*, --pxz-space-*, --pxz-radius-*,           │
│          --pxz-shadow-*, --pxz-font-*                        │
│  Charakter: stackunabhängig, bedeutungstragend               │
│  Einzige API für Komponenten und neue Pages                  │
└──────────────────────────────────────────────────────────────┘
                      │ var()-Referenz
                      ▼
┌──────────────────────────────────────────────────────────────┐
│  SCHICHT 3 — COMPONENTS                                      │
│  Datei: assets/css/components.css (ab S2.0b)                 │
│  Inhalt: .pxz-card, .pxz-btn, .pxz-section, .pxz-eyebrow     │
│  Regel: KEINE Hex-Werte, KEINE hartcodierten px-Zahlen       │
└──────────────────────────────────────────────────────────────┘
                      │ Klassen-Referenz
                      ▼
┌──────────────────────────────────────────────────────────────┐
│  SCHICHT 4 — PAGES                                           │
│  Dateien: assets/css/homepage.css, karriere.css, …           │
│  Inhalt: Kompositionen von Komponenten + Page-Layouts        │
│  Regel: KEINE direkten Primitives-Zugriffe (kein --color-*)  │
└──────────────────────────────────────────────────────────────┘
```

### §2.1 Legacy-Alias-Block (Übergang)

Bis S2.0b (Component-Refactor) leben in `tokens.css` zusätzliche
`--pxz-*`-Aliase (`--pxz-red`, `--pxz-ink` etc.), damit
`homepage.css` + `karriere.css` + `style.css` **byteidentisch**
weiterlaufen. Diese Aliase sind formal Schicht-2-Einträge, folgen aber
altem Namens-Schema. Sie werden in S2.0b durch die neuen Semantic-Namen
ersetzt.

### §2.2 Warum dieses Modell

- **Design-Austauschbarkeit** — Stack-Test (z. B. Inter Tight statt SF Pro)
  erfordert nur Schicht-1-Edit. Rest bleibt.
- **Regel-Robustheit** — Padding kann nicht mehr ad-hoc verschieden sein,
  weil es nur einen Schicht-2-Token `--pxz-space-section-y-desktop` gibt.
  Siehe PXZ-E-006.
- **Single-Source-of-Truth** — `tokens.css` ist maschinell, dieses Dokument
  ist menschlich. Keine dritte Quelle.

### §2.3 Der eine zentrale Test

Ob das Modell eingehalten ist, misst ein grep:
```bash
grep -E "#[0-9A-Fa-f]{3,6}|[0-9]+px" assets/css/homepage.css assets/css/karriere.css
```
Idealzustand: **keine Treffer**. Jedes Vorkommen ist ein Verstoß gegen §2
und wird in den nächsten Refactor-Commit übernommen.

---

## §3 Schicht 1 — Primitives (harte Werte)

Alle Werte leben in `assets/css/tokens.css` unter `SCHICHT 1 — PRIMITIVES`.

### §3.1 Color Primitives

| Token | Hex | Verwendung (indirekt via §4) |
|-------|-----|----------------------------|
| `--color-white` | `#FFFFFF` | Page-Background |
| `--color-snow` | `#FBFBFD` | Off-White-Flächen |
| `--color-chalk` | `#F5F5F7` | Sekundär-Flächen |
| `--color-line` | `#D2D2D7` | Trennlinien, Input-Borders |
| `--color-mist` | `#86868B` | Tertiär-Text |
| `--color-graphite` | `#424245` | Sekundär-Text |
| `--color-ink-900` | `#1D1D1F` | Primär-Text, Dark-Sektions-BG |
| `--color-red-600` | `#C8161D` | Primärakzent auf hell |
| `--color-red-500` | `#E8484F` | Soft-Akzent (Reserve) |
| `--color-red-800` | `#8B0F14` | Hover-Zustand Rot |
| `--color-amber-500` | `#F5B800` | Akzent auf dunkel |
| `--color-amber-400` | `#FFD700` | Hover-Amber |

### §3.2 Space Scale (4pt-Grid)

Vielfache von 4 px, Cortex-DS-kompatibel.

| Token | Wert | Beispiel-Einsatz (via §4) |
|-------|------|----------------------------|
| `--space-1` | 4 px | Mikro-Gaps |
| `--space-2` | 8 px | Icon-Abstand |
| `--space-3` | 12 px | Input-Padding vertikal |
| `--space-4` | 16 px | Standard-Gap |
| `--space-5` | 20 px | Heading → Sub |
| `--space-6` | 24 px | Container-X Mobile |
| `--space-7` | 32 px | Body-Bottom |
| `--space-8` | 40 px | Card-X Mobile |
| `--space-9` | 48 px | Container-X Tablet |
| `--space-10` | 56 px | — |
| `--space-11` | 64 px | Container-X Desktop, Section-Y Mobile |
| `--space-12` | 72 px | Card-Y Mobile |
| `--space-13` | 80 px | Section-Y Tablet |
| `--space-14` | 96 px | Section-Y Desktop, Card-X Desktop |
| `--space-15` | 112 px | Card-Y Desktop |
| `--space-16` | 128 px | Hero-Section-Y Desktop |
| `--space-17` | 160 px | Extra-Large Breathing-Room |

### §3.3 Typography Primitives

- `--font-display-family` · `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Inter", "Helvetica Neue", sans-serif`
- `--font-body-family` · analog mit SF Pro Text vor Display
- Weights: `--font-weight-regular` (400), `--font-weight-medium` (500),
  `--font-weight-semibold` (600), `--font-weight-bold` (700)

### §3.4 Radii

| Token | Wert | Einsatz |
|-------|------|---------|
| `--radius-sm` | 8 px | Kleine UI-Elemente |
| `--radius-md` | 12 px | Input-Fields |
| `--radius-lg` | 22 px | Standard-Cards |
| `--radius-xl` | 28 px | Hero-Cards |
| `--radius-pill` | 9999 px | Buttons |

### §3.5 Shadows (Apple HIG elevation scale)

- `--shadow-1` — Elevation 1 (Cards im Ruhezustand)
- `--shadow-2` — Elevation 2 (prominente Cards)
- `--shadow-3` — Elevation 3 (Hero, Hauptstandort)
- `--shadow-4` — Elevation 4 (Akzent-Shadow mit rotem Schimmer)

---

## §4 Schicht 2 — Semantic (die Komponenten-API)

Alle Komponenten (Schicht 3) und neue Pages (Schicht 4) lesen **nur** aus
Schicht 2. Siehe `tokens.css` unter `SCHICHT 2 — SEMANTIC`.

### §4.1 Color semantic

| Alias | Primitiv | Bedeutung |
|-------|----------|-----------|
| `--pxz-c-bg` | `--color-white` | Page-Background |
| `--pxz-c-surface` | `--color-white` | Card-Background |
| `--pxz-c-surface-alt` | `--color-chalk` | Alternative Sektion |
| `--pxz-c-line` | `--color-line` | Borders, Trennlinien |
| `--pxz-c-ink` | `--color-ink-900` | Primär-Text |
| `--pxz-c-ink-muted` | `--color-graphite` | Sekundär-Text |
| `--pxz-c-ink-subtle` | `--color-mist` | Tertiär-Text |
| `--pxz-c-accent` | `--color-red-600` | Akzent hell |
| `--pxz-c-accent-hover` | `--color-red-800` | Hover hell |
| `--pxz-c-accent-dark` | `--color-amber-500` | Akzent dunkel (nur `.pxz-mfa`) |
| `--pxz-c-accent-dark-hover` | `--color-amber-400` | Hover dunkel |

### §4.2 Space semantic

| Alias | Primitiv | Bedeutung |
|-------|----------|-----------|
| `--pxz-space-section-y-desktop` | `--space-14` (96 px) | Standard-Sektion Desktop |
| `--pxz-space-section-y-tablet` | `--space-13` (80 px) | Standard-Sektion Tablet |
| `--pxz-space-section-y-mobile` | `--space-11` (64 px) | Standard-Sektion Mobile |
| `--pxz-space-card-y-lg-desktop` | `--space-15` (112 px) | Large-Card Top/Bot Desktop |
| `--pxz-space-card-x-lg-desktop` | `--space-14` (96 px) | Large-Card Side Desktop |
| `--pxz-space-card-y-lg-tablet` | `--space-14` (96 px) | Large-Card Top/Bot Tablet |
| `--pxz-space-card-x-lg-tablet` | `--space-12` (72 px) | Large-Card Side Tablet |
| `--pxz-space-card-y-lg-mobile` | `--space-12` (72 px) | Large-Card Top/Bot Mobile |
| `--pxz-space-card-x-lg-mobile` | `--space-8` (40 px) | Large-Card Side Mobile |
| `--pxz-space-container-x-desktop` | `--space-11` (64 px) | Container Desktop |
| `--pxz-space-container-x-tablet` | `--space-9` (48 px) | Container Tablet |
| `--pxz-space-container-x-mobile` | `--space-6` (24 px) | Container Mobile |

### §4.3 Typo / Radius / Shadow semantic

- Typo: `--pxz-font-display`, `--pxz-font-body`
- Radius: `--pxz-radius-card` (22 px), `--pxz-radius-card-hero` (28 px),
  `--pxz-radius-btn` (pill), `--pxz-radius-input` (12 px)
- Shadow: `--pxz-shadow-card` (Elev 1), `--pxz-shadow-card-hi` (Elev 3),
  `--pxz-shadow-accent` (Elev 4 Rot)

---

## §5 Typografie (Apple HIG-Type-System)

### §5.1 Font-Stack

Siehe §3.3. SF Pro priorisiert; auf Non-Apple-Systemen fällt Inter ein,
dann Helvetica Neue.

### §5.2 Type-Scale

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

**Minimum Body:** 17 px Desktop / 16 px Mobile. Darunter geht nichts.

### §5.3 Line-Heights

- Display/Titles: 1.05–1.15
- Body: 1.5–1.6
- UI: 1.2–1.4

---

## §6 Farbsystem

### §6.1 Palette

Siehe §3.1 Primitives und §4.1 Semantic Aliases.

### §6.2 Sektions-Farbmodi

| Modus | Background | Primary-Text | Secondary-Text | Accent |
|-------|-----------|--------------|----------------|--------|
| Light | `--pxz-c-bg` oder `--pxz-c-surface-alt` | `--pxz-c-ink` | `--pxz-c-ink-muted` | `--pxz-c-accent` |
| Dark | `--color-ink-900` | `#FFFFFF` | `rgba(255,255,255,0.85)` | `--pxz-c-accent-dark` |

### §6.3 Mix-Verbot (hart)

**Auf dunkel NIE Rot, auf hell NIE Amber.**
- Rot (`--pxz-c-accent`) ist ausschließlich Hell-Akzent (aus Logo)
- Amber (`--pxz-c-accent-dark`) ist ausschließlich Dunkel-Akzent (nur im `.pxz-mfa`-Scope)

---

## §7 Spacing-System — HARTE Werte (verbindlich)

**Diese Werte sind verpflichtend.** Abweichen nur mit expliziter Freigabe
Dr. Stracke UND Ergänzung hier in §7.

> **Hinweis:** Die in früheren v2.x-Versionen parallel existierende
> Sektions-Padding-Tabelle (§3.3 in v2.0, später §13.4 in v2.1–v2.3)
> ist **obsolet**. Einziger Ort ist jetzt §7.1. PXZ-E-006 war der
> konkrete Fehler, der zu dieser Konsolidierung führte.

### §7.1 Sektions-Padding (vertikal, Außenhülle)

| Sektions-Typ | Mobile | Tablet | Desktop | Semantic Token |
|--------------|--------|--------|---------|----------------|
| **Standard-Sektion** | **64** | **80** | **96** | `--pxz-space-section-y-*` |
| Hero | 80 / 40 (top/bot) | 104 / 56 | 128 / 72 | (page-spezifisch) |
| Strip (Stats) | 56 | 64 | 80 | (page-spezifisch) |
| Dark-Sektion (MFA, CTA) | 64 | 80 | 96 | wie Standard |

**Harte Obergrenze:**
- MFA-Dark und Final-CTA: max **85 vh** pro Sektion
- Standard-Sektionen: keine harte Grenze, organisch vom Content

### §7.2 Container-Padding (Außen-Abstand zum Viewport)

| Viewport | Padding links/rechts | Semantic Token |
|----------|---------------------|----------------|
| < 768 px (Mobile) | **24 px** | `--pxz-space-container-x-mobile` |
| 768–1279 px (Tablet) | **48 px** | `--pxz-space-container-x-tablet` |
| ≥ 1280 px (Desktop) | **64 px** | `--pxz-space-container-x-desktop` |

### §7.3 Card-Innenpadding

**Harte Untergrenze: Text darf NIE näher als diese Werte am Card-Border sein.**

| Card-Typ | Mobile (top/side) | Tablet (top/side) | Desktop (top/side) |
|----------|-------------------|-------------------|---------------------|
| Standard-Card (Service, Benefit) | 40 / 32 | 56 / 48 | 64 / 56 |
| **Große Card (Standorte, CTA)** | **72 / 40** | **96 / 72** | **112 / 96** |
| Hero-Image-Card | 0 | 0 | 0 |

Semantic Tokens für große Card: `--pxz-space-card-{y,x}-lg-{desktop,tablet,mobile}`.

**Eyebrow-Mindestabstand zum Card-Top = Card-Padding-Top.** Wenn das nicht
reicht (Eyebrow berührt optisch den Border), Padding-Top erhöhen — niemals
Eyebrow näher ranziehen.

### §7.4 Vertikale Text-Abstände innerhalb einer Card/Sektion

| Zwischen | Abstand |
|----------|---------|
| Eyebrow → Headline (H2/H3) | 16–20 px |
| Headline → Subtitle | 8–12 px |
| Subtitle → Fließtext | 24 px |
| Fließtext → Primary CTA | 32–40 px |
| CTA → Fußnote (Priv.-Tel, E-Mail-Hint) | 16–20 px |

### §7.5 Max-Width für Fließtext

Fließtext-Spalte **max 40 rem** (≈ 640 px). Länger ergibt „Orphan Words".
`text-wrap: balance` zusätzlich setzen.

### §7.6 8pt-Grid

Alle Abstände sind Vielfache von 4 px: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56,
64, 72, 80, 96, 112, 128, 160. Siehe §3.2 für die Token-Skala.

---

## §8 Komponenten

### §8.1 Buttons (Apple-Style Pill)

| Variante | Use | Background | Text | Hover |
|----------|-----|-----------|------|-------|
| Primary | Haupt-CTA | `--pxz-c-ink` | `#FFF` | `--pxz-c-ink-muted` |
| Accent (Hell) | Call-to-Action | `--pxz-c-accent` | `#FFF` | `--pxz-c-accent-hover` |
| Accent (Dunkel) | CTA auf Dark | `--pxz-c-accent-dark` | `--pxz-c-ink` | `--pxz-c-accent-dark-hover` |
| Ghost (Hell) | Sekundär | `#FFF` + Line | `--pxz-c-ink` | Chalk-BG |
| Ghost (Dunkel) | Sekundär auf Dark | transparent + weiße Border | `#FFF` | weiße Border voll |

Mindestgröße: **44 × 44 px Tap-Target** (Apple HIG), Padding min. `14 × 28 px`.
Radius: `--pxz-radius-btn` (pill).

### §8.2 Navigation

- Sticky Top-Header, initial solid weiß mit Line-Border
- Bei Scroll > 8 px: leichter Shadow (`--pxz-shadow-card`)
- Höhe: min **96 px Desktop**, **80 px Mobile** — damit Logo atmen kann
- Logo IMMER sichtbar, kein Shrinking

### §8.3 Cards

- Standard-Radius: `--pxz-radius-card` (22 px)
- Hero/Prominent-Radius: `--pxz-radius-card-hero` (28 px)
- Immer Content mit min. 24 px Abstand zu allen Rändern
- Nie Cards in Cards stapeln (max. 1 Ebene)

### §8.4 Forms (Apple HIG-Input-Style)

- Input-Höhe: 48 px
- Radius: `--pxz-radius-input` (12 px)
- Border: 1 px `--pxz-c-line`, Focus: 2 px `--pxz-c-accent`
- Label immer oberhalb, 13 px

---

## §9 Layout-Prinzipien

### §9.1 Container

- Max-Breite: **1280 px**
- Außen-Padding: siehe §7.2

### §9.2 Depth (Schatten & Hover)

- **Hover = Enhancement**, nie neue Information aufdecken
- Erlaubt: leichter Shadow-Lift, sanfter Farb-Accent auf Border, `translateY(-2px)`
- Verboten: Farbwechsel des Haupttexts, Content-Reveal-Only-On-Hover
- Transition: 200–300 ms, `ease` oder `ease-out`, kein Bounce

### §9.3 Focus (Keyboard-Nutzer)

- Sichtbarer Focus-Ring (2 px, `outline-offset: 3px`, Farbe: `--pxz-c-accent`)
- Never `outline: none` ohne Ersatz

---

## §10 Logo & Branding

### §10.1 Größen (harte Untergrenze)

| Kontext | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Header | 64 px | 88 px | **96 px** (aktuell v2.7.2: 151/200/248 px nach Logo+35 %) |
| Footer | 56 px | 56 px | 64 px |

### §10.2 Text neben Logo

- Zeile 1: „Praxiszentrum" — **Title 3** (28–32 px Desktop), Semibold
- Zeile 2: „Dr. Stracke & Kollegen" — **Body** (17 px), Regular, `--pxz-c-ink-subtle`
- Mobile < 480 px: Zeile 2 verschwindet, Zeile 1 auf 18 px

### §10.3 Dunkle Sektionen

Logo nicht direkt auf dunkel — stattdessen reiner Text „Praxiszentrum
Dr. Stracke & Kollegen" in Weiß, optional mit einer kleinen weißen
Markierung.

---

## §11 Bilder

### §11.1 Team

- Aspect **1:1 (quadratisch)**
- Mindestens 1200×1200 Source → 2× Retina
- Object-fit cover, zentriert

### §11.2 Placeholder (bis echte Fotos da)

- Initialen-Avatare auf farbigem Kreis (Palette aus 8 ruhigen Farben)
- Selbe Maße wie echte Fotos

### §11.3 Hero / Standorte

- Aspect 16:9 oder 3:2
- Mindestens 2000 px Breite Source
- Lazy-loading außer Hero (eager)

---

## §12 Inhalts- & Navigations-Regeln

### §12.1 Was auf die Homepage gehört

1. Hero (Headline + CTA + Bild)
2. MFA-Stellenanzeige (Dark Accent)
3. Kennzahlen-Strip
4. Fachrichtungen (8 Karten)
5. Ärzteteam (8 Karten)
6. Patienten-Service
7. Standorte
8. Final CTA
9. Footer

### §12.2 Was NICHT auf die Homepage

- Sono-Atlas (nur im Menü, Fachpublikum)
- Blog-Vorschau (nur in V2)
- Testimonials (nur in V2)

### §12.3 Navigation

- 5–6 Hauptpunkte max (Apple HIG: cognitive load)
- Sticky Header, Language Switcher sichtbar

---

## §13 Tonalität & Sprache

### §13.1 Standardsektionen (Patienten-Ansprache)

- Sie-Form
- Sachlich, kompetent, kurz
- Keine Marketing-Floskeln

### §13.2 MFA-Stellenanzeige — Ausnahme

- **Du-Form**
- Locker, selbstbewusst, aber nicht anbiedernd
- Keine Slang-Wörter (krass, mega, geil)
- Keine Floskeln (Praxisfamilie, Helden, wachsen Sie über sich hinaus)

---

## §14 Multilingual

- 4 Sprachen: DE (lead), EN, FR, ES
- Übersetzung IMMER manuell geprüft (kein Google-Translate-Feel)
- Kürzungen im Layout per Sprache tolerieren (`text-wrap: balance`)
- Language Switcher sichtbar im Header + Footer

---

## §15 Anti-Patterns — Visuell (NIE wieder)

### §15.1 Badge überlappt Eyebrow-Text

**Falsch:** Badge mit `top: -16px; left: 48px` verdeckt Eyebrow.
**Richtig:** Badge oben-rechts innerhalb der Card (`top: 48/64 px; right: 48/64 px`),
Header bekommt `padding-right`. Mobile: Badge als Inline-Pill oberhalb
des Eyebrows (static, `margin-bottom: 1.25rem`).

### §15.2 Eyebrow klebt am Card-Border

**Ursache:** Card-Padding-Top zu klein.
**Regel:** Card-Padding-Top **mindestens 72 px Mobile / 112 px Desktop**
bei großen Cards mit Eyebrow (siehe §7.3).

### §15.3 Sektion ohne Container-Wrapper

**Falsch:** Freistehender Text (z. B. Final-CTA) direkt auf Sektions-Background.
**Richtig:** Card-Wrapper mit Border + Padding + Radius. PFLICHT-Fälle:
- Standort-Cards (Main: rote Border, Sek: Chalk-BG)
- Final-CTA „Sie haben Fragen?"
- Service-Cards, Benefit-Cards
Ausnahmen (kein Wrapper): Hero, MFA-Dark — dort IST die Sektion der Container.

### §15.4 Zu viel Vertikalraum in Dark-Sektionen

**Falsch:** MFA-Sektion mit 160 px Sektions-Padding → wirkt aufgebläht.
**Regel:** Dark-Sektionen max **96 px** top/bot auf Desktop (§7.1).

### §15.5 Ungleichmäßige Abstände

**Falsch:** Ad-hoc Werte (1.75 rem, 3 rem, 48 px) ohne System.
**Richtig:** Werte aus §7 (Space-Tokens).

### §15.6 Fließtext ohne Max-Width → Orphan-Words

**Falsch:** Hero-Subtitle auf 44 rem mit „Eine / Philosophie"-Umbruch.
**Richtig:** Max 40 rem (§7.5) + `text-wrap: balance` + ggf. Content kürzen.

---

## §16 Anti-Patterns — Implementierung (NIE wieder)

### §16.1 Split-Location-CSS (PXZ-E-001)

**Falsch:** Dieselbe Reset-Regel in `style.css` UND in Inline-`<style>`
von `template-homepage.php`. Änderung wird still überschrieben.
**Richtig:** Jede Regel an **einer** Stelle. `tools/verify.sh --grep-split`
prüft automatisch. Seit S0.2 (v2.7.4) leben Page-CSS in `assets/css/`.

### §16.2 Generischer Tag-Selektor im Reset (PXZ-E-002)

**Falsch:** `body.page-template-template-homepage article { padding: 0 !important }`.
**Richtig:** Reset auf Klassen oder direkte Kinder beschränken.

### §16.3 Referenz-Bild-Interpretation (PXZ-E-003)

**Falsch:** Referenz `screenshots/N.png` „sinngemäß" übersetzt.
**Richtig:** Jedes Referenz-Bild ist harte 1:1-Vorgabe. Bei Unklarheit:
Rückfrage statt Annahme.

### §16.4 Screenshot ohne Computed-Style-Probe (PXZ-E-004)

**Falsch:** CSS geändert → Screenshot → „sieht gut aus" → fertig.
**Richtig:** Nach jeder Änderung `tools/probe-design.mjs` laufen lassen.
Computed-Style zeigt, welche Regel tatsächlich greift.

### §16.5 Spezifitäts-Konflikt bei globalen Resets (PXZ-E-008)

**Falsch:** `.pxz-home p { margin: 0 }` (Spezifität 0,1,1) schlägt alle
Klassen-Regeln wie `.pxz-hero-sub { margin: 1rem auto 0 }` (0,1,0).
**Richtig:** `.pxz-home :where(p) { margin: 0 }` (Spezifität 0,1,0) —
nachfolgende Klassen gewinnen.

### §16.6 Obsolet-Kennzeichnung alter Tabellen (PXZ-E-006)

Wenn eine Tabelle/Werteliste durch eine neuere ersetzt wird: **entweder
komplett entfernen** (bevorzugt) **oder mit ⚠️-Hinweis auf den
aktuellen Abschnitt** verweisen. In v3.0 wurden alle veralteten Tabellen
entfernt — es existiert jetzt pro Thema genau ein Ort.

### §16.7 Hartcodierte Werte in Page-/Component-CSS

**Falsch:** `.pxz-hero { padding: 96px 64px; }`
**Richtig:** `.pxz-hero { padding: var(--pxz-space-section-y-desktop) var(--pxz-space-container-x-desktop); }`
Siehe §2 und §2.3 Grep-Test.

---

## §17 Design-Austausch-Protokoll

Ein Design-Wechsel (z. B. „Wir probieren Inter Tight statt SF Pro") läuft
in **vier** Schritten:

1. **Nur Schicht 1 (Primitives) anfassen** — `tokens.css` `SCHICHT 1` Block.
2. **Niemals Schicht 2/3/4** anfassen, außer es ist expliziter Teil des Tests.
3. **`tools/verify.sh` muss grün bleiben** — Computed-Style-Probe prüft
   Padding/Margin, die sind stack-unabhängig.
4. **Screenshots verändern sich erwartungsgemäß** — MD5-Divergenz ist
   erwünscht; sie beweist, dass die Schicht-1-Änderung wirkt.

**Wenn der Austausch scheitert:** `git revert` der `tokens.css`-Änderung.
Kein Komponenten-Rollback nötig. Fertig.

**Wenn der Austausch gefällt:** Neue `tokens.css` committen, PXZ_VERSION
patch-bumpen, CHANGELOG-Eintrag, Abschnitt in §3.3 (oder entsprechend)
aktualisieren.

### §17.1 Beispiel-Szenario Font-Test

```diff
- --font-display-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", …
+ --font-display-family: "Inter Tight", -apple-system, BlinkMacSystemFont, …
```
Alles andere bleibt. Screenshot-Diff ist **gewünscht**. Wenn Dr. Stracke
ablehnt: ein `git revert`, Schleife endet.

### §17.2 Beispiel-Szenario Akzent-Test

```diff
- --color-red-600: #C8161D;
+ --color-red-600: #D82C2C;
```
Logo, Buttons, Links, Hover — alle übernehmen ohne Edit. Das ist der
Stresstest des Modells.

---

## §18 Prüf-Checkliste — vor jedem Entwurf

**Kontrast & Lesbarkeit (Clarity)**
- [ ] Kein Text-Farbe = Background-Farbe, auch nicht im Ruhezustand
- [ ] Kein Content erst bei Hover
- [ ] Opacity auf Text ≥ 0.95
- [ ] WCAG AA (4.5:1 Body, 3:1 Large Text)
- [ ] Dark-Sektion: Text `#FFF` oder `rgba(255,255,255,0.85)`, Akzent Amber
- [ ] Helle Sektion: Text `--pxz-c-ink`, Akzent `--pxz-c-accent`

**Typografie**
- [ ] Body-Min 17 px Desktop / 16 px Mobile
- [ ] Micro-Labels min 13 px
- [ ] `--pxz-font-display` / `--pxz-font-body` korrekt referenziert

**Layout (§7)**
- [ ] 8pt-Grid eingehalten (Werte aus §3.2)
- [ ] Container-Padding 24/48/64 (`--pxz-space-container-x-*`)
- [ ] Card-Padding (§7.3) ≥ 32 px Mobile, ≥ 48 px Desktop für Standard-Cards
- [ ] Sektionsrhythmus: hell dominant, dunkel als Akzent

**Logo (§10)**
- [ ] Header-Logo ≥ 96 px Desktop, ≥ 64 px Mobile
- [ ] Logo-Text zweizeilig, prominent
- [ ] Footer-Logo sichtbar

**Bilder (§11)**
- [ ] Team 1:1 Aspect
- [ ] Hero 16:9 Aspect
- [ ] Placeholder-Avatare konsistent

**Content (§12, §13, §14)**
- [ ] Sono-Atlas NICHT auf Homepage
- [ ] MFA du-Form, Rest Sie-Form
- [ ] Alle 4 Sprachen geprüft

**Technik (§2, §16)**
- [ ] PXZ_VERSION gebumpt
- [ ] Keine Hex-Werte oder px-Zahlen in `homepage.css`/`karriere.css` (§2.3-Test)
- [ ] Reset-Regeln mit `:where()` (§16.5)
- [ ] Semantisches HTML (h1→h2→h3)
- [ ] `:focus-visible` sichtbar

---

## §19 Changelog

- **v3.0** (2026-04-19, Sprint 2 / S2.0c) — **Konsolidierung:**
  - §0 Meta-Regel + Cortex-DS als Backstop neu
  - §2 4-Schichten-Token-Modell neu
  - §3 + §4 Primitives/Semantic-Tabellen neu
  - §7 Spacing-Tabelle konsolidiert (alte §3.3 entfernt, einziger Ort)
  - §16.6 Obsolet-Kennzeichnung erweitert
  - §16.7 Hartcodierte-Werte-Verbot neu
  - §17 Design-Austausch-Protokoll neu
  - v2.3 wird als `DESIGN_GUIDELINES.v2.3.md` als Historie erhalten.
- **v2.3** (2026-04-18) — §3.3 als obsolet markiert; §16.5 Spezifitäts-Regel
  neu (PXZ-E-008); §16.6 Obsolet-Kennzeichnung (PXZ-E-006).
- **v2.2** (2026-04-17) — §16 Anti-Patterns auf Implementierungs-Ebene
  (PXZ-E-001 bis PXZ-E-004).
- **v2.1** (2026-04-17) — §13 Spacing-System hart definiert; §14
  Card-Referenz-Pattern; §15 Anti-Patterns aus Session dokumentiert.
- **v2.0** (2026-04-17) — Komplette Neufassung nach Apple HIG.
- **v1.x** (2026-04-17) — Initialfassung.
