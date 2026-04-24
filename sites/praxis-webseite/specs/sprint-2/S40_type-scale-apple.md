# S40 — Type-Scale Apple (DS-Block)

**Status:** Spec (Architekten-Modus Phase 1+2), wartet auf Dr.-Stracke-Freigabe für Phase 3 Umsetzung.
**Angelegt:** 2026-04-24 (Session 40, Start).
**Vorbedingung:** S39 Home-Polish technisch durch, Working-Tree uncommitted. Commit erfolgt erst nach DS-5 Abnahme (DS-6) gebündelt.

---

## 1. Auslöser

Dr. Stracke (2026-04-24, Ende Session 39):
> „Claude hat kein visuelles Urteil — mechanische Regel ohne Type-Scale = FK-3. Lass uns ein verbindliches Type-Scale-System anhand einer Referenz-Seite bauen."

Dr. Stracke (2026-04-24, Start Session 40 / DS-1):
> „Orientiere dich für Content-Sektion (Buttons, Schrift, Größe) an `https://www.apple.com/de/`. Header und Footer machen wir separat."

**Kern-Problem:** Die 30+ Font-Size-Deklarationen in `homepage.css` und den anderen Content-CSS-Dateien sind über die Sprints organisch gewachsen. Keine durchgängige Skala, keine referenzierbaren Stufen, daher keine stabile visuelle Hierarchie. Jede Iteration ist Pixel-Schubserei.

## 2. Scope (DS-1 final)

### 2.1 Dimensionen
1. **Type-Scale** (8 Stufen T1–T8) — übernimmt Größen-**Verhältnisse** aus Apple-Referenz
2. **Button-Geometrie** — Pill-Form (`border-radius: 980px` Apple-Konvention), Padding, Font-Size
3. **Line-Height + Letter-Spacing** pro Stufe (fällt bei Probe mit ab, kein Zusatzaufwand)

### 2.2 Pages (Q1=B)
**Alle Content-Pages der MVP-Liste (29 URLs):**
Homepage · Kontakt · Sprechstunden · Team · Karriere · Leistungen-Hub · 8 Arzt-Detail-Pages · 4 Fachrichtungs-Landings · Leistungen (Diagnostik / Checkup / Labor / Vorsorge) · Standorte · Aktuelles · 404.
→ Gleiche CSS-Dateien wirken über Templates: `homepage.css`, `components.css`, `arzt.css`, `team.css`, `karriere.css`, `leistungen.css` (+ mögliche neu erkannte `kontakt.css`, `aktuelles.css` falls vorhanden).

### 2.3 Ausgenommen (Q1 Dr. Stracke ausdrücklich)
- **Header / Nav** (`nav.css`) — separates Thema, bleibt PXZ 2.7.29 Stand
- **Footer** (`footer.css`) — separates Thema
- **Farbtokens** — PXZ-Ink/Snow/Chalk sind bereits Apple-kompatibel
- **Bridge-Product-Template** (Juvantis-Adapter) — gehört zu Juvantis-Site
- **Spacings-System** (`--space-*`) — bereits 4 pt-Grid, unberührt

### 2.4 Viewports (Q3 Claude: Standard übernommen)
- **Desktop-groß:** 1920 px
- **Desktop-mid:** 1440 px (Phase-4-Default)
- **Mobile:** 430 px (iPhone Pro Max)

---

## 3. IST-Analyse (2026-04-24, PXZ 2.7.31 uncommitted)

### 3.1 Font-Stack (überraschender Befund)

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
             "SF Pro Text", "Inter", "Helvetica Neue", Helvetica,
             Arial, sans-serif;
```

→ **Auf macOS/iOS/iPadOS identisch zu Apple.** Auf Windows/Android Fallback Inter → Helvetica. Der Schrift-Charakter (Schnitte, Laufweite, x-Höhe) ist bereits die Referenz. Reine Größen-/Rhythmus-Übernahme genügt.

### 3.2 Font-Size-Deklarationen pro Datei

| Datei | `font-size`-Zeilen | Bemerkung |
|---|---:|---|
| `homepage.css` | 57 | Haupt-Target (Hero, MFA-Karte, Stat, Spec-Cards, Final-CTA) |
| `karriere.css` | 17 | Team-Karriere-Landingpage |
| `arzt.css` | 14 | Arzt-Detail-Template (Bio, Chips) |
| `components.css` | 12 | Buttons, Eyebrows, Shared |
| `team.css` | 11 | Team-Grid |
| `leistungen.css` | 5 | Leistungen-Hub |
| **Summe** | **116** | Zielmenge für Mapping DS-4 |

### 3.3 IST-Stufen-Spanne (Auszug homepage.css)

| PXZ-Klasse | Größe (Desktop) | Zweck |
|---|---|---|
| `.pxz-mfa-title` | clamp(40, 6.5vw, 88px) | Hero-Mega-Display |
| `.pxz-stat-n` | clamp(40, 4.5vw, 64px) | Statistik-Zahl |
| `.pxz-mfa-sub` | clamp(19, 2vw, 26px) | Lead-Text |
| `.pxz-spec-title` | 18 px | Card-Title |
| `.pxz-home` (body) | 17 px / 16 px Mobile | Body-Base |
| `.pxz-nav-link` | 15 px | (Nav — nicht Target) |
| `.pxz-mfa-eyebrow` | 15 px | Overline, uppercase |
| `.pxz-spec-more` | 14 px | Link-Footer |
| `.pxz-hero-img-caption .eb` | 13 px | Bild-Overlay-Caption |

Keine arithmetische Progression, keine benannten Stufen, freie px/rem-Werte.

### 3.4 Button-IST (`components.css`)

- Padding: `0.875rem 1.75rem` Mobile, wahrscheinlich Desktop ähnlich (muss bei DS-2 ausgelesen werden)
- Font-Size: `1rem` (16 px) Mobile
- Border-Radius: nicht in Extract → vermutlich Theme-Default (small), muss Probe klären
- Varianten: `.pxz-btn-primary` / `.pxz-btn-accent` / `.pxz-btn-ghost` / `.pxz-btn-amber` / `.pxz-btn-dark-ghost`

---

## 4. SOLL-Design (Phase 2)

### 4.1 Mapping-Logik

**Prinzip:** Apple-Content-Sektion als **Größen-Vorlage**. Semantische Rollen werden erhalten (Hero-Display bleibt größtes Element), nur die Zahl wird aus der Apple-Probe übernommen.

Beispiel-Mapping (Hypothese, DS-2 misst final):

| PXZ-Rolle | Apple-Äquivalent (erwartet, zu belegen) | Stufe |
|---|---|:---:|
| `.pxz-mfa-title` (Hero) | Hero-Display Apple Produkt-Pages | **T1** |
| `.pxz-stat-n` | Large Metric | T2 |
| H2 Section-Title | Medium Headline | T3 |
| H3 Card-Title | Sub-Headline | T4 |
| `.pxz-mfa-sub` | Lead / Intro | T5 |
| Body | Body-17 | **T6 (Base)** |
| `.pxz-spec-more` / Small-Link | Small | T7 |
| `.pxz-mfa-eyebrow` / Caption | Caption / Eyebrow | T8 |

Die **genauen px** pro Stufe kommen aus DS-2. Typisch-Apple: ~96 / 56 / 40 / 28 / 22 / 17 / 14 / 12.

### 4.2 Token-Struktur (DS-3)

Neue SCHICHT-2-Variablen in `tokens.css`:

```css
:root {
  /* --- Type-Scale (S40, Referenz apple.com/de) ----------------------- */
  --pxz-font-t1-size:   96px;  /* Hero-Display */
  --pxz-font-t1-line:   1.05;
  --pxz-font-t1-track: -0.025em;

  --pxz-font-t2-size:   56px;  /* Large Metric / Section-Hero */
  /* … T3 … T8 */

  --pxz-font-t-body-size:    17px;  /* Alias für T6 */
  --pxz-font-t-caption-size: 12px;  /* Alias für T8 */

  /* --- Button-Pill (S40, Q2=B) --------------------------------------- */
  --pxz-btn-radius:          980px;   /* Apple-Pill */
  --pxz-btn-padding-y:       12px;
  --pxz-btn-padding-x:       22px;
  --pxz-btn-padding-y-lg:    17px;
  --pxz-btn-padding-x-lg:    28px;
  --pxz-btn-font-size:       17px;    /* Apple-Body, hochgesetzt */
  --pxz-btn-font-weight:     400;
}

@media (max-width: 767px) {
  :root {
    --pxz-font-t1-size: 48px;  /* Mobile-Stufe */
    /* … responsive Overrides … */
  }
}
```

**Fallback-Strategie:** clamp() zwischen Mobile- und Desktop-Wert, damit fließende Skalierung zwischen Breakpoints möglich ist. Default-Formel: `clamp(<mobile>, <mobile> + (<desktop> - <mobile>) * ((100vw - 430px) / (1920 - 430)), <desktop>)`. Konkret pro Stufe in DS-3.

### 4.3 Mapping-Regel für Content-CSS (DS-4)

1. **Jede `font-size`-Deklaration** in den 6 Content-CSS-Dateien wird auf die am nächsten passende Stufe gemappt. Wenn keine Stufe passt (z. B. `18 px` zwischen T5/T6): Rolle kritisch hinterfragen und auf die **semantisch passende** Stufe anheben/absenken.
2. **Keine freien px-Werte mehr** in Content-CSS. Ausnahme: Nav/Footer (nicht Target) und Icon-/Border-Werte (nicht Typographie).
3. **Button-Overrides** in `components.css` setzen Pill-Radius + Padding + Font-Size über die neuen Tokens. Alle 5 Varianten betroffen (Farbe bleibt).
4. **Line-Height + Letter-Spacing** werden als zusätzliche Token-Attribute (`-line`, `-track`) pro Stufe mitgeführt, weil Apple bewusst mit enger Spur (-0.022 bis -0.025em) in großen Headlines arbeitet. Pixel-Rhythmus allein reicht nicht.

### 4.4 Was sich visuell ändert (erwartet)

- Headlines werden etwas größer, aber mit Apple-typisch **engerem Letter-Spacing** → wirken „eleganter/kompakter"
- Body bleibt 17 px (wenig Änderung auf Homepage, aber vereinheitlicht Karriere/Arzt/Team, die teilweise 16 px sind)
- Buttons werden rund (Pill), etwas höher, Text potenziell 17 px statt 16 px → **mehr Präsenz**, besseres Touch-Target
- Eyebrows + Captions werden kleiner (12 px statt 13/15 px), mit Tracking → klassischer Apple-Tech-Spec-Look
- Hierarchie-Sprünge werden **sichtbar regelmäßiger** → das ist genau das, was in S39-it2 fehlte

### 4.5 Was bewusst NICHT geändert wird

- Farbpalette (ink / snow / chalk — bereits Apple-Hex-Nah)
- Spacings (4 pt-Grid unberührt)
- Grid-/Container-Breiten (S39 Stand)
- Nav + Footer (separat, Dr.-Stracke-Vorgabe)
- Schrift-Stack (bereits Apple-System-kompatibel)

---

## 5. Umsetzung (Phase 3, NACH Freigabe)

### DS-2 — Puppeteer-Probe apple.com/de

**Script:** `sites/praxis-webseite/specs/sprint-2/S40_evidence/probe-apple.mjs`

**Messpunkte pro Viewport (1920 / 1440 / 430):**
1. Hero-Headline (`.hero h2` oder äquivalent) → px + line-height + letter-spacing + weight
2. Sub-Headline / Lead
3. Body-Fließtext (erster Absatz im Content-Flow)
4. Eyebrow (falls vorhanden, z. B. „NEU")
5. Button (erster CTA im Hero) → padding, font-size, border-radius, height, background
6. Link-Text
7. Caption / Fußnote

**Output:**
- `S40_evidence/apple-scale.json` — alle Messwerte pro Viewport, JSON
- `S40_evidence/apple-<vp>.png` — Screenshot pro Viewport für visuellen Backstop

**Randbedingung:** User-Agent + Sprache DE, `page.waitForLoadState('networkidle')`, Cookie-Banner via `click('button[type="button"]:has-text("Alle Cookies akzeptieren")')` wegklicken damit Viewport nicht verdeckt.

### DS-3 — Token-Einbau

- Neuer Block `/* SCHICHT 2 — TYPE-SCALE (S40) */` in `tokens.css`
- T1–T8 mit `clamp()` zwischen Mobile- und Desktop-Wert
- Button-Pill-Tokens
- **Legacy-Aliase** erhalten (`--pxz-font-body`, `--pxz-font-display`) — zeigen jetzt auf T-Stufen, nicht auf px

### DS-4 — Selektor-Mapping

Reihenfolge (CSS Cascade wirkt):
1. `homepage.css` (57 Stellen) — höchste Sichtbarkeit, erster Abnahme-Blick
2. `components.css` (12 Stellen, inkl. Buttons — Pill hier!)
3. `arzt.css`, `team.css`, `karriere.css`, `leistungen.css` in dieser Reihenfolge

Git-Branch-Hygiene: eine commitbare Einheit pro Datei oder als Gesamt-Block? → **Gesamt-Block**, weil DS-6 sowieso gebündelt committet.

### DS-5 — Phase-4-Probe

**Evidence-Script:** `S40_evidence/probe-compare.mjs`
- Screenshots PXZ-Homepage + 3 weitere Pages (Arzt-Detail, Karriere, Leistungen-Hub) auf 1920 / 1440 / 430
- Side-by-Side-HTML `S40_evidence/compare.html`: links Apple-Referenz, rechts PXZ neu
- Assertions in `verify.sh`:
  - Body-Font-Size == `--pxz-font-t-body-size`
  - Button-Border-Radius >= 100 px (Pill-Heuristik)
  - Hero-Font-Size > 80 px auf 1920

**Abnahme-Kriterien (Dr. Stracke):**
1. Visuelle Harmonie — Hierarchie wirkt regelmäßig, nichts kippt
2. Keine Sichtbarkeits-Regression (Kontrast, Lesbarkeit)
3. Mobile 430 px: kein Text-Überlauf, Buttons bleiben gut tappable (>= 44 px Hit-Target)
4. Alignment-Delta bleibt 0 (Showpieces zentriert) — verify.sh grün

### DS-6 — Gebündelter Commit

**Theme-Repo** (Branch `main`):
```
feat(s39+s40): home-polish + apple type-scale
 - S39 Hero-Bild Empfang (1600 px), Sprachen-Stack, Content +25 %
 - S40 T1-T8 Type-Scale (Referenz apple.com/de), Button-Pill
 - 116 font-size auf Token-Referenzen gemappt
 - PXZ 2.7.31 → 2.7.32
```

**Cortex-Web-Repo:**
```
docs(s40): SESSION_RESUME + verify.sh Assertion + Spec + Evidence
```

**Nexus:** Auto-Sync ohnehin laufend (devices.json + MEMORY.md).

---

## 6. Risiken + Mitigation

| # | Risiko | Mitigation |
|---|---|---|
| **R-1** | Apple-Cookie-Banner verdeckt Probe-Target | Banner wegklicken vor Messung (siehe DS-2 Randbedingung) |
| **R-2** | Apple erkennt Bot → liefert abweichende Variante | Headless=false probieren, User-Agent setzen, sonst manuell Screenshots ergänzen |
| **R-3** | Pill-Buttons brechen auf Ghost-/Dark-Ghost-Varianten (Border-Verhalten) | Alle 5 Varianten in Phase-4-Probe prüfen, vor Abnahme |
| **R-4** | Line-Height-Änderung bricht Grid-Höhen (z. B. Stat-Karten) | Stat-Karten in DS-5 explizit screenshot-vergleichen, fallback `min-height` |
| **R-5** | Mobile 430 px: T1 zu groß → Umbruch | clamp()-Kurve in DS-3 so wählen, dass Mobile sicher < Container-Breite |
| **R-6** | Apple.com ändert Design während Probe | apple-scale.json ist Snapshot mit Timestamp — spätere Änderungen kein Problem |
| **R-7** | Karriere/Arzt/Team-Pages haben Eigen-Typografie, die Homepage-Mapping widerspricht | Mapping pro Datei getrennt reviewen, Home zuerst abnehmen |
| **R-8** | Bridge-Product-Template teilt components.css → Juvantis-Page ändert sich unbeabsichtigt | Juvantis-Bridge-Template extra screenshot-probieren in DS-5, vor Abnahme |

---

## 7. Abhängigkeiten

- S39 Working-Tree bleibt uncommitted bis DS-6 (wie geplant)
- Keine externen Blocker für S40 selbst
- Nav/Footer-Überarbeitung folgt separat (nicht S40-Scope)

---

## 8. Definition of Done

- [ ] DS-2 apple-scale.json + Screenshots existieren
- [ ] DS-3 tokens.css T1–T8 + Button-Pill-Tokens eingetragen
- [ ] DS-4 alle 116 font-size auf T-Tokens gemappt (Content-CSS), Buttons Pill
- [ ] DS-5 Phase-4-Probe grün, Dr.-Stracke-Abnahme erteilt
- [ ] DS-6 Bundle-Commit S39+S40 auf Theme + Cortex-Web
- [ ] SESSION_RESUME auf Session 41 Einstieg nachgezogen
- [ ] Pattern `type-scale-reference-driven` in `Nexus/_memory/patterns/` (Session-Ende)
- [ ] Tutorial-Eintrag in `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/` zu Referenz-getriebenem Type-Scale (Session-Ende)

---

*Phase 1+2 Ende. Umsetzung (DS-2…DS-6) erst nach Dr.-Stracke-Freigabe.*
