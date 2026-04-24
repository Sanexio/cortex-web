# S38 — Header-Menü Redesign

**Status:** Spec (Architekten-Modus Phase 1+2), wartet auf Dr.-Stracke-Freigabe für Phase 3 Umsetzung.
**Angelegt:** 2026-04-24 (Session 34-36 MVP-Sprint, Ende).
**Geplant für:** Session 38 als erster Task.

---

## 1. Auslöser

Dr. Stracke (2026-04-24) nach MVP-Rohling-Abnahme:
> „Das Header-Menü muss designtechnisch überarbeitet werden. Es ist zu klein. Ich lege viel Wert auf UX und ansprechendes Design auf allen Geräten."

## 2. IST-Analyse (2026-04-24, PXZ 2.7.26)

### 2.1 Dateien
- **HTML:** `template-parts/header-nav.php`
- **Daten:** `inc/nav-data.php` (7 Top-Items · 3 davon mit Submenus · 4 Sprachen)
- **CSS:** `assets/css/nav.css` (350 Zeilen)
- **JS:** `assets/js/nav.js` (Mobile-Drawer + Scroll-State)

### 2.2 Messbare Pain-Points

| # | Befund | Quelle / Messwert |
|---|---|---|
| **P-1** | Menü-Schrift **15 px** (`0.9375rem`) auf ALLEN Breakpoints | `nav.css:86` |
| **P-2** | Kein vertikales Padding an Links → Touch-Hit-Area nur ~22 px hoch | `nav.css:91` (kein padding auf `a`) |
| **P-3** | Submenu-Chevron dezent, keine Hover-Animation | `pxz-nav-chev` Span, minimal gestylt |
| **P-4** | Active-State nur rot unterstrichen — schwach bei Submenu-Parent | `aria-current="page"`, `.is-active`, `.is-active-parent` |
| **P-5** | Sub-Label „Dr. Stracke & Kollegen" in `--pxz-mist` (hell-grau) → geringe Lesbarkeit | `nav.css:64` |
| **P-6** | Logo 151/200/248 px — **größer als Menü-Leiste hoch**, optisch dominant | `nav.css:47,51,52` |
| **P-7** | Dropdown Hover-only → auf Touch-Geräten (iPad, Hybrid-Laptops) verliert man Submenu-Zugang | Kein Click-to-Toggle auf Desktop |
| **P-8** | Mobile-Breakpoint bei 1100 px ist **sehr früh** → iPad (1024 px) und viele Laptops (1280 px) bekommen Desktop-Menü, aber iPad-Portrait (820 px) bekommt Burger | `@media (min-width: 1100px)` |
| **P-9** | Zwei-Zeilen-Umbruch (4+3) wirkt unausgewogen, wenn die zweite Zeile nur 3 Items hat und links-bündig wirkt | `grid-template-columns: repeat(4, auto)` mit `justify-content: center` |
| **P-10** | Keine Microinteractions (Underline-Slide-In, Fade-Drop, Animated-Chevron-Rotate) | Nur `transition: color 0.2s` |

### 2.3 Was gut ist (NICHT anfassen)

- **Sticky Nav mit Scroll-Shadow** — funktioniert
- **3 Sprachen-Switcher oben rechts** — klarer CTA-Block
- **Rote Marke + Logo-Recognition** — Identität stark
- **ARIA-Attribute** (`aria-haspopup`, `aria-expanded`, `role="menu"`) — Accessibility solide

---

## 3. Design-Prinzipien für das Redesign

Abgeleitet aus DESIGN_GUIDELINES.md v3.1 + Dr.-Stracke-Konstante „UX & ansprechendes Design auf allen Geräten":

1. **Typografie-Hierarchie:** Menü-Schrift ≥ 16 px (Mobile) / 17–18 px (Desktop) — Body-parity
2. **Hit-Areas ≥ 44 × 44 px** (Apple HIG / WCAG 2.5.5)
3. **Farb-Kontrast ≥ 4.5:1** auf allen Textebenen (WCAG AA)
4. **Microinteractions subtil, nicht showy** — Apple/Stripe-Level, nicht Framer-Level
5. **Mobile-First:** Menü auf Smartphone muss premium wirken, nicht wie Hamburger-Fallback
6. **Brand-Continuity:** Rote Akzente, Serif-Headlines bleiben, Keine Fremdkörper

---

## 4. Design-Varianten (LL-034 — Sie wählen)

Vier gleichwertige Richtungen. Kein Favorit von mir.

### Variante A — „Apple klar & groß" (konservative Iteration)

**Kern-Idee:** Die aktuelle Struktur behalten, Größen/Abstände/Animationen auf Premium-Niveau heben.

- Menü-Schrift 17 px → 18 px (Desktop 1280+)
- Links mit `padding: 14px 16px` → Hit-Area 48 px
- Underline-Slide-In bei Hover (`::after` 2px rot, `transform-origin: left`, 180 ms ease-out)
- Submenu als weiche Shadow-Card (16 px radius, `shadow-xl` Token)
- Chevron rotiert 180° bei Open
- Active-Parent: Rot-Underline **permanent**, 3 px Dicke
- Sub-Label-Farbe: `--pxz-mist` → `--pxz-ink-muted` (besserer Kontrast)

**Vorteile:** Geringstes Risiko · Brand bleibt identisch · 1 Session Aufwand.
**Nachteile:** Kein Wow-Effekt · keine Struktur-Innovation · Submenu bleibt Hover-Only auf Desktop.
**Aufwand:** ~3–4 h (1 Session).

### Variante B — „Mega-Menu mit Teasern" (Healthcare-Premium-Pattern)

**Kern-Idee:** Die drei Submenus werden zu Mega-Panels mit Mini-Teasern. Industry-Referenz: Charité, Helios, Mayo Clinic.

- **Ärzte-Dropdown:** Grid mit 8 Ärzte-Avataren + Name + Fachrichtung · Link „Alle Fachrichtungen →" am Ende
- **Check-Ups-Dropdown:** 2-Spalten-Layout, links die 5 Check-Ups mit Icon + Kurz-Beschreibung, rechts ein Teaser „Basic-Check als Einstieg" mit CTA
- **Diagnostik-Dropdown:** Kategorien-Grid Sonographie/EKG/Lunge/Labor mit passenden Icons
- Full-Width (1400 px) Overlay-Panel statt schmaler Dropdown
- Mobile: klassischer Drawer mit Akkordeon (wie jetzt, nur gepolstert)

**Vorteile:** Höchster Wow-Effekt · Medizin-typisch („seriös-informativ") · fördert Entdecken.
**Nachteile:** 2–3 Sessions Aufwand · Mehr Pflege-Arbeit (Icons, Teaser-Texte) · Kann auf kleinen Laptops (13-Zoll) überladen wirken.
**Aufwand:** ~8–12 h (2–3 Sessions).

### Variante C — „Schlanke Off-Canvas Navigation" (Modernist)

**Kern-Idee:** Auch auf Desktop hat die Nav-Leiste nur Logo links + Burger rechts. Click öffnet Full-Height Off-Canvas mit großer Typo. Referenz: Stripe, Linear, modernes SaaS 2024–2026.

- Desktop-Bar enthält: Logo · Lang-Switcher · CTA „Termin buchen" · Burger-Icon
- Burger-Click öffnet Side-Panel (400 px) mit:
  - Menü-Items 28 px, großzügig gestapelt
  - Submenus als inline-expandierbare Akkordeons
  - Unten: Kontakt-Info + Sprechzeiten-Teaser + Notfall-Hinweis
- Mobile identisch, nur 100 % Breite
- Design-Sprache: viel Whitespace, minimale Linien, starke Typografie

**Vorteile:** Radikal modern · identisch auf allen Geräten · maximale Content-Fokus-Fläche · auch für große Menüs skalierbar.
**Nachteile:** Patientenzielgruppe (40+) kann überrascht sein · erfordert gute Microcopy-Arbeit · 1-Click-deeper zum Ziel.
**Aufwand:** ~6–8 h (1,5–2 Sessions).

### Variante D — „Hybrid A + sichtbarer Termin-CTA" (Conversion-Optimierung)

**Kern-Idee:** Variante A als Design-Basis, plus **permanent sichtbarer** CTA-Bereich rechts.

Zusätzlich zur Nav-Leiste:
- Prominenter Button **„Termin online buchen"** (Doctolib) — auf allen Breakpoints sichtbar
- Mobile: Zusätzliches **Anrufen-Icon** (click-to-call 069 247 574 523) direkt klickbar
- Active-Journey-Indikator: Auf Termin-Pfad-URLs (`/service/terminanfrage/`, `/kontakt/`) wechselt der Button-State zu „✓ Termin anfragen"
- Lang-Switcher bleibt, wird aber neben CTA nicht dominanter

**Vorteile:** Höchste Conversion-Wirkung für Praxis (Termin = Kern-Intent) · aufs Patienten-Verhalten zugeschnitten · Mobile-Click-to-Call ist UX-Gold.
**Nachteile:** Visuelle Dichte oben rechts steigt · braucht definiertes Verhalten auf Doctolib-down · 2 CTA-Styles zu pflegen (Primary rot + Secondary lang).
**Aufwand:** ~4–5 h (1 Session).

### Tabellarischer Vergleich

| Kriterium | A: Apple | B: Mega-Menu | C: Off-Canvas | D: Hybrid+CTA |
|---|:---:|:---:|:---:|:---:|
| Risiko (Brand/Patient) | niedrig | mittel | hoch | niedrig |
| Wow-Effekt | mittel | hoch | hoch | mittel |
| Conversion-Potenzial | mittel | mittel-hoch | mittel | **hoch** |
| Mobile-Qualität | gut | sehr gut | **exzellent** | sehr gut |
| Pflege-Aufwand | niedrig | **hoch** | niedrig | mittel |
| Aufwand Session(s) | 1 | 2–3 | 1,5–2 | 1 |
| Eigen-Identität | bleibt | stärker | neu | bleibt + stärker |

---

## 5. Verbindliches für ALLE Varianten

- Schriftgröße ≥ 16 px (Mobile) / 17 px (Desktop) — Body-parity
- Hit-Area ≥ 44 × 44 px auf Touch
- Submenu auf Desktop: Click **ODER** Hover (nicht nur Hover)
- Kontrast Sub-Label / Menü-Text ≥ 4.5:1
- Scroll-State (Shadow nach 40 px Scroll) bleibt
- Sprachen-Switcher behält Position oder wechselt in strukturell äquivalenten Ort
- Mobile-Drawer-Scroll-Lock (bereits implementiert) bleibt

---

## 6. Offene Entscheidungen für Dr. Stracke

Vor Session 38-Start:

1. **Welche Variante?** A / B / C / D (oder Kombination, z.B. „A-Basis + CTA aus D")
2. **Doctolib-URL:** Haben Sie eine feste Buchungs-URL? (Konstante `PXZ_DOCTOLIB_URL` ist im Code vorbereitet, aber aktuell nicht gesetzt.)
3. **Notfall-Hinweis im Menü** (nur relevant bei C/B): Soll z.B. „Bei medizinischen Notfällen: 112" integriert werden?
4. **Icons für Check-Ups/Diagnostik** (nur relevant bei B): Haben Sie Icon-Set-Präferenz? (Lucide, Heroicons, Custom?)
5. **Ärzte-Avatare im Mega-Menu** (nur relevant bei B): Platzhalter-Initialen auch dort, oder erst sobald Fotos da sind?

---

## 7. Erwartete Artefakte am Session-38-Ende

- Geänderte Dateien: `nav.css` (voll), `header-nav.php` (ggf. Struktur), `nav.js` (ggf. Click-Handler), `nav-data.php` (keine Änderung erwartet)
- PXZ-Version-Bump: 2.7.26 → **2.7.30** (Minor-Reserve für Iterationen)
- Screenshot-Evidence: Desktop (1440) · Tablet (820) · Mobile (390) · in `specs/sprint-2/S38_evidence/`
- 8–12 AKs (Akzeptanz-Kriterien) mit Puppeteer-Probe-Hooks
- Dr.-Stracke-Abnahme per visuellem Review (Local-Site)

---

## 8. Nicht-Scope (wird später)

- Footer-Redesign (bereits 2026-04-23 neu, bleibt)
- Homepage-Hero-Redesign (Dr.-Stracke-Wunsch „später")
- Design-Token-Feinschliff (Ppol-Block in Prio-Leiter)
- Mehrsprachigkeit-Fix (Block F nach M1)

---

*Spec bereit für Freigabe. Nach Wahl der Variante durch Dr. Stracke werden Phase 3 (Umsetzung) und Phase 4 (Selbstprüfung) durchgeführt.*
