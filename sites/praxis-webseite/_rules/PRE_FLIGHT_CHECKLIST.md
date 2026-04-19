# PRE-FLIGHT-CHECKLIST — praxis-redesign

**Verbindlich vor JEDEM Deploy.** Wenn ein Punkt rot ist, nicht deployen.
Die Checkliste ist teilautomatisiert durch `tools/verify.sh` (siehe unten),
aber jeder Punkt darf manuell nachgeprüft werden.

---

## 1. Code-Split-Check (PXZ-E-001)

**Ziel:** Keine doppelten CSS-Regeln zwischen `style.css` und `template-homepage.php`.

- [ ] `tools/verify.sh --grep-split` läuft ohne Warnung.
- [ ] Manuell: wenn eine Regel geändert wurde, prüfen mit
  ```bash
  grep -nE "body\.page-template-template-homepage" \
    "wp-content/themes/praxiszentrum/style.css" \
    "wp-content/themes/praxiszentrum/template-homepage.php"
  ```
  Die Regel darf nur an **einer** Stelle leben.

## 2. Reset-Scope-Check (PXZ-E-002)

**Ziel:** Kein generischer `article`/`section`/`div`-Selektor im Reset.

- [ ] `tools/design-audit.mjs --check=reset-scope` exit 0.
- [ ] Reset-Regeln verwenden nur Klassen oder direkte Kinder-Kombinatoren.

## 3. Computed-Style-Probe (PXZ-E-004)

**Ziel:** Die harten Werte aus DESIGN_GUIDELINES §13 müssen im Browser tatsächlich
greifen — nicht nur im CSS-Quelltext stehen.

- [ ] `tools/probe-design.mjs` exit 0 auf allen 3 Viewports (1440 / 768 / 430).
- [ ] Abgleich mit Tabelle:

| Element | VP 1440 | VP 768 | VP 430 |
|---------|---------|--------|--------|
| `.pxz-loc-card--main` padding-top | 112px | 96px | 72px |
| `.pxz-loc-card--main` padding-left | 96px | 72px | 40px |
| `.pxz-loc-badge` top (desktop only) | 64px | 48px | static |
| `.pxz-loc-badge` right (desktop only) | 64px | 48px | static |
| `.pxz-final-card` background | transparent | transparent | transparent |
| `.pxz-final-card` border | none | none | none |
| `.pxz-final-card` box-shadow | none | none | none |
| `.pxz-hero-sub` max-width | 640px (40rem) | 640px | viewport-limit |

## 4. Screenshot-Verifikation (PXZ-E-003)

**Ziel:** Jede Sektion mit Referenz-Bild wird Side-by-Side mit der Referenz verglichen.

- [ ] `tools/verify.sh --screenshots` produziert frische Desktop- & Mobile-Shots.
- [ ] Für jede Referenz `screenshots/N.png` existiert ein Diff-Shot in
      `screenshots/claude/YYYY-MM-DD_vX.Y.Z_diff_N.png` (Side-by-Side).
- [ ] Pixel-Divergenzen sind bewusst (Content) und nicht zufällig (Styling).

## 5. Anti-Pattern-Check (DESIGN_GUIDELINES §15 + §16)

- [ ] §15.1 Badge überlappt Eyebrow — visuell geprüft.
- [ ] §15.2 Eyebrow klebt am Card-Border — durch §3 Computed-Style-Probe ausgeschlossen.
- [ ] §15.3 Sektion ohne Container-Wrapper — Layout geprüft.
- [ ] §15.4 Zu viel Vertikalraum in Dark-Sektionen — Section-Padding ≤ 96px Desktop.
- [ ] §15.5 Ungleichmäßige Abstände — stichprobenartig geprüft.
- [ ] §15.6 Fließtext ohne Max-Width → Orphan-Words — `.pxz-hero-sub` max-width 40rem.
- [ ] §16.1 Split-Location-CSS — durch §1 ausgeschlossen.
- [ ] §16.2 Generischer Tag-Selektor im Reset — durch §2 ausgeschlossen.
- [ ] §16.3 Referenz-Bild-Interpretation — Bild N:1 beachtet.

## 6. Cache-Buster

- [ ] `functions.php` `PXZ_VERSION` wurde bei CSS-Änderung hochgezählt.
- [ ] Der HTML-Output zeigt den neuen Version-String im `<style id="pxz-home-v?-?-?">`.

## 7a. Vorher/Nachher-Beleg (PXZ-E-007, 2026-04-18) — PFLICHT

**Ziel:** Dr. Stracke sieht die Auswirkung einer CSS-Änderung aus den Shots,
ohne selbst DevTools, Inkognito oder Cache-Klicks durchzuführen. Der Beweis
wird **mit** der „fertig"-Meldung geliefert, nicht erst auf Nachfrage.

- [ ] Nach jeder sichtbaren CSS-Änderung `bun run tools/ab-diff.mjs --baseline=<css>`
      bzw. `--override='<css>'` mit dem rekonstruierten Vorher-Zustand ausführen.
- [ ] Ausgabe enthält: Vorher-Shot + Nachher-Shot (Desktop 1440 + Mobile 430) +
      Höhen-Delta + Selector-Probe für die Ziel-Werte.
- [ ] In der „fertig"-Meldung an Dr. Stracke werden die Delta-Zeile und
      die Dateinamen der beiden Shots explizit genannt.
- [ ] Wenn das Delta < 20 px oder die Proben identisch sind → Änderung wirkt
      nicht wie beabsichtigt. **Nicht** als fertig melden, Ursache suchen.

## 7b. Aufgaben-Interpretation (PXZ-E-007 FK-1) — PFLICHT

**Ziel:** Phase 1 (Verständnis) aus `_rules/WORKING_MODE.md` wirklich abschließen.

- [ ] Bei unspezifischen Formulierungen („einige Punkte", „das passt nicht",
      „sieht nicht gut aus") MUSS eine konkrete Frage zurückgehen — **mit
      Screenshot-Markierung, wenn möglich**. Kein Auto-Mapping auf
      DESIGN_GUIDELINES.
- [ ] Vor dem ersten Edit: 1 Satz „Ich verstehe die Aufgabe so: …". Wenn das
      nicht bestätigt wird, nicht weiterarbeiten.

## 7c. Spezifitäts-Probe nach Typo-/Reset-Änderungen (PXZ-E-008) — PFLICHT

**Ziel:** Verhindern, dass globale Element-Resets (`p`, `h1`–`h4`, `ul`)
still Klassen-Margins überschreiben und Alignments brechen.

- [ ] Wenn die Änderung ein `<p>`, `<h*>`, `<ul>`, `<ol>`-Element betrifft oder
      eine Reset-Regel im `.pxz-home`/`.pxz-kar`-Scope ergänzt wird:
      `bun run tools/ab-diff.mjs` ausführen. Der Alignment-Check am Ende MUSS
      alle Showpiece-Selektoren mit `✓` bestätigen (`|center − viewportCenter| < 5 px`).
- [ ] Neue globale Resets NIEMALS als `.pxz-home p { … }` schreiben — immer
      `.pxz-home :where(p) { … }`. Andernfalls wird der Reset spezifitätsstärker
      als jede Klassen-Regel und bricht Margins lautlos.
- [ ] Bei Hinweis auf verrutschtes Element (z. B. Block mit `max-width + margin: auto`
      sitzt links): zuerst `getComputedStyle(el).marginLeft/marginRight` prüfen.
      Wenn `0px` statt `auto-kalkulierter Wert`: Spezifitäts-Konflikt, nicht Layout.

## 7. Content-Sanity

- [ ] Alle 4 Sprachen DE/EN/FR/ES im Homepage-Data vorhanden.
- [ ] Kontaktdaten stimmen (Tel/E-Mail/Adresse).
- [ ] Keine Lorem-Ipsum-Reste.

---

## Delivery — erst Dr. Stracke benachrichtigen wenn alle Punkte grün.

„Fertig" = alle Haken gesetzt UND Screenshot-Slices bereitgestellt UND
Computed-Style-Probe grün. (LL-021)
