# S38 Variante A — Selbstprüfung (Phase 4)

**Datum:** 2026-04-24, Session 38
**Spec:** `specs/sprint-2/S38_header-menu-redesign.md`
**Variante:** A „Apple klar & groß" (konservative Iteration)
**Theme:** PXZ 2.7.26 → **2.7.27** (Patch-Bump)

---

## Geänderte Dateien

| Datei | Δ | Inhalt |
|---|---|---|
| `assets/css/nav.css` | 5 Edit-Hunks | Schrift 17/18px, Hit-Area-Padding, Underline-Slide-In via `::after`, Submenu-Card 16px-Radius + `--pxz-shadow-card-hi`, Active-Parent über `::after` (3px), Sub-Label `--pxz-mist` → `--pxz-text-muted` |
| `assets/js/nav.js` | +30 Z. | Touch-Click-Toggle für Submenu-Parents (`window.matchMedia('(hover: none)')`), zentrales `closeAllSubmenus()`, Click-outside-to-close, Keyboard-Pfad behält Space-Toggle |
| `functions.php` | 1 Z. | `PXZ_VERSION` 2.7.26 → 2.7.27 (Cache-Bust) |
| `template-parts/header-nav.php` | 0 | unverändert (`aria-expanded="false"` war bereits gesetzt) |
| `inc/nav-data.php` | 0 | unverändert |

---

## Akzeptanz-Kriterien (probe.mjs Exit 0)

Probe-URL: `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/aerzte/`

| AK | Soll | Ist | Status |
|---|---|---|---|
| **AK-1** Desktop font-size ≥17px | ≥17px | 18px (auf 1440px wegen `@media min-width: 1280px`) | ✅ |
| **AK-2** Hit-Area Desktop ≥44×44px | ≥44×44 | 78×59 px (`.pxz-nav-list a` mit padding 16/14) | ✅ |
| **AK-3** Underline-Slide-In | CSS-Definition | `.pxz-nav-list a::after` + `transform: scaleX()` + `transform-origin: left` + 180ms ease-out → manueller Hover-Test im Browser sichtbar | ✅ |
| **AK-4** Submenu-Touch-Click-Toggle | aria-expanded toggle | Initial `aria-expanded='false'`, JS-Listener `(hover: none)` registriert | ✅ |
| **AK-5** Active-Parent ::after height 3px | 3px | `getComputedStyle('::after').height === "3px"` | ✅ |
| **AK-6** `tools/verify.sh` grün | OK | `VERIFY OK — alle Showpiece-Elemente zentriert` | ✅ |
| **AK-Sub** Sub-Label Kontrast | dunkler als `--pxz-mist` | `rgb(134, 134, 139)` (`--pxz-text-muted` = `--pxz-graphite`) | ✅ |

**Probe-Befehl:**
```bash
cd ~/Cortex/projects/Cortex-Web && bun run sites/praxis-webseite/specs/sprint-2/S38_evidence/probe.mjs
```

**Cross-Probe Sub-Label** (mit Praxis-Logo statt Sanexio-Brand-Switch):
```bash
PXZ_URL="https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/" \
  bun run sites/praxis-webseite/specs/sprint-2/S38_evidence/probe.mjs
```
Liefert `AK-Sub … color=rgb(134, 134, 139)` (vorher `rgb(207, 207, 215)` mist).

---

## Screenshots

`screenshots/desktop-1440.png` (1440×600 viewport-clip)
`screenshots/tablet-820.png` (820×600)
`screenshots/mobile-390.png` (390×600)

Erste 600px in Y, weil das Header-Subjekt komplett sichtbar ist und Folge-Sektionen für diese Probe nicht relevant.

---

## Was Variante A verändert (Vorher → Nachher)

| Pain-Point | Vorher | Nachher |
|---|---|---|
| **P-1** Schriftgröße | 15 px (alle Breakpoints) | 17 px ab 1100, 18 px ab 1280 |
| **P-2** Hit-Area Link | ~22 px hoch (kein padding) | 59 px hoch (padding 14/16) |
| **P-3** Chevron-Animation | Hover-only Rotation | Hover + `[aria-expanded="true"]` Rotation |
| **P-4** Active-State | 2 px border-bottom (kollidierte mit Hover) | 3 px `::after` (harmoniert mit Hover-Slide-In) |
| **P-5** Sub-Label Kontrast | `--pxz-mist` (low) | `--pxz-text-muted` (`--pxz-graphite`) |
| **P-7** Touch-Submenu | nur Hover (verloren auf Touch) | Tap öffnet, zweiter Tap folgt Link |
| **P-10** Microinteractions | nur color 0.2s | Underline-Slide-In `scaleX` 180 ms ease-out + Submenu fade+lift 180 ms |

---

## Was Variante A NICHT geändert hat (bewusst)

- **P-6 Logo-Größe:** Bleibt 151/200/248 px (Brand-Recognition-Konstante)
- **P-8 Mobile-Breakpoint 1100 px:** Bleibt (wäre Struktur-Eingriff für iPad-Pro-12.9")
- **P-9 4+3 Zeilenumbruch:** Bleibt (Dr.-Stracke-Direktive S36, max 4 pro Reihe)
- **Mega-Menu, Off-Canvas auf Desktop, permanenter Termin-CTA:** Varianten B/C/D
- **Doctolib-URL-Konstante:** Nicht gesetzt (offene Spec-Frage §6.2 bleibt offen)

---

## Visuelle Abnahme durch Dr. Stracke

1. Browser → `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/`
2. Hard-Refresh (`⌘+Shift+R`) — wegen PXZ_VERSION-Bump zwingt Browser frisches CSS
3. Header-Begutachtung Desktop:
   - Menü-Schrift sollte deutlich größer wirken
   - Maus über Menü-Item: dünne rote Linie wischt von links nach rechts ein
   - Ärzte-Submenu sollte beim Hovern als weiche Card mit großem Radius + sanftem Schatten erscheinen
   - Aktive Seite (z. B. `/praxis/`) sollte dauerhaft mit 3 px roter Unterstreichung markiert sein
4. iPad-/Touch-Test (falls verfügbar): Tap auf Ärzte-Item öffnet Submenu, zweiter Tap navigiert
5. Mobile (Browser-Devtools 390 px): Burger-Menü öffnet wie gehabt (Drawer unverändert)

Bei Akzeptanz: Theme-Commit `feat(s38-a): header polish (PXZ 2.7.27)`.

---

## Bekannte Limits dieser Probe

- Sub-Label-Cross-Probe nicht in Standard-Run integriert (Sanexio-Brand-Switch auf `/aerzte/` versteckt `.sub`)
- Hover-Visualität nur in CSS-Definition geprüft (kein synthetisches Hover-Event in Puppeteer); manueller Browser-Hover-Test in Akzeptanz oben
- Touch-Toggle nur auf Listener-Existenz geprüft (kein synthetisches `pointermove`-Coarse); manueller Test auf realem iPad in Akzeptanz oben
- A11y-Audit (Lighthouse, axe) **nicht** Teil dieser Probe (steht im Ppol-Block)

---

*Phase 4 abgeschlossen. Wartet auf Dr.-Stracke-Abnahme oder Re-Iteration.*
