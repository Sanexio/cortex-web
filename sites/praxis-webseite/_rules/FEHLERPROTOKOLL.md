# FEHLERPROTOKOLL — praxis-redesign

Dieses Protokoll dokumentiert jeden realen Design- oder Implementierungs-Fehler,
der in einer Session gemacht wurde, mitsamt Ursache, Regel-Ableitung und
Prüfpunkt. Es ist die Grundlage dafür, dass der gleiche Fehler **nie wieder**
passiert.

**Vor jeder Aufgabe:** Dieses Protokoll und `PRE_FLIGHT_CHECKLIST.md` lesen.
**Nach jeder Aufgabe:** Neue Fehler als Eintrag hinzufügen, Regel ableiten,
Pre-Flight-Check ergänzen, ggf. `DESIGN_GUIDELINES.md §15/§16` aktualisieren.

Format je Eintrag:
- **ID:** `PXZ-E-NNN` — fortlaufend.
- **Datum, Version:** wann entdeckt, welche PXZ_VERSION war live.
- **Beschreibung:** was war falsch, wie sah's aus, was erwartet.
- **Ursache:** technische Wurzel.
- **Regel:** abgeleitete Regel (auch in `PRE_FLIGHT_CHECKLIST.md` / `DESIGN_GUIDELINES.md`).
- **Prüfpunkt:** wie wird beim nächsten Deploy getestet.

---

## PXZ-E-001 — Split-Location-CSS: Reset-Regel existiert doppelt

- **Datum:** 2026-04-17, **beobachtet live in v2.3.0**, **behoben in v2.4.0**.
- **Beschreibung:** Das Card-Padding von `.pxz-loc-card` (Standort-Cards) wurde
  trotz `padding: 112px 96px 96px !important` in CSS nicht gerendert. Computed
  Style `padding: 0px`. Visuell: Eyebrow „STANDORT 1" klebte am Card-Border
  (Anti-Pattern §15.2).
- **Ursache:** Die Blocksy-Reset-Regel
  `body.page-template-template-homepage article { padding: 0 !important }`
  existierte an **zwei** Stellen:
  1. im Inline-`<style>` von `template-homepage.php` (dort bereits gescoped)
  2. in der externen `style.css` (dort **nicht** gescoped)
  Die externe Regel hatte höhere Spezifität (`body.page-template-template-homepage article` =
  0,1,2) als `.pxz-loc-card` (0,1,0) und hat alle inneren `<article>`-Karten
  mit `padding: 0 !important` überschrieben.
- **Regel:** **Jede Reset-/Override-Regel darf nur an EINER Stelle leben.**
  Vor jeder CSS-Änderung: `grep` über beide Dateien (`template-homepage.php`
  UND `style.css`), ob die Regel doppelt existiert.
- **Prüfpunkt (Pre-Flight):**
  - `tools/verify.sh` ruft `grep -rn "article" style.css template-homepage.php`
    und warnt, wenn dieselbe Selector-Liste mehrfach vorkommt.
  - Nach jedem Deploy: Computed-Style-Probe via
    `tools/probe-design.mjs` prüft `.pxz-loc-card--main` padding-top ≥ 112px
    auf 1440.

---

## PXZ-E-002 — Generischer `article`-Selektor im Reset trifft innere Cards

- **Datum:** 2026-04-17, **eingeführt in früherer Session**, **behoben in v2.4.0**.
- **Beschreibung:** Der Blocksy-Reset nutzte `body.page-template-template-homepage article`
  als Selector. Homepage-Cards wie `.pxz-loc-card` sind selbst `<article>`-Elemente
  und wurden versehentlich mit-gereset.
- **Ursache:** Zu breiter Selector. `article` als Tag ist generisch, matcht
  jedes Element mit diesem Tag — inklusive inneren Content-Cards.
- **Regel:** **Reset-Selektoren dürfen keine generischen Tags (`article`, `section`,
  `div`) ohne Kombinator enthalten.** Reset muss entweder auf Klassen (z. B.
  `.site-main`, `.entry-content`) oder auf direkte Kinder (`.entry-content > article:first-child`)
  beschränkt sein.
- **Prüfpunkt (Pre-Flight):**
  - `tools/design-audit.mjs` prüft per Regex alle CSS-Selektoren in `style.css`
    und `template-homepage.php` — warnt, wenn `article|section|div` alleinstehend
    mit `padding|margin: 0 !important` erscheint.

---

## PXZ-E-003 — Referenz-Bild-Interpretation: Final-CTA mit Card statt ohne

- **Datum:** 2026-04-17, **eingeführt in v2.3.0**, **behoben in v2.4.0**.
- **Beschreibung:** In SESSION_RESUME.md Task 1 stand „Final-CTA in neuen
  `.pxz-final-card` Container gehüllt (Border/Radius/Shadow wie Standort-Card
  = Bild-3-Referenz)". Dr. Stracke hatte aber in `screenshots/5.png` gezeigt:
  Final-CTA OHNE Card, frei auf Section-Background. Die vorherige Session hat
  Bild 5 ignoriert und stattdessen Bild 3 als Vorlage genommen.
- **Ursache:** Falsche Referenz-Zuordnung. Session-Notiz erwähnte „Bild-3",
  aber das war eine Interpretation, nicht die Vorgabe von Dr. Stracke. Die
  eigentliche Vorgabe (Bild 5) wurde nicht als verbindlich erkannt.
- **Regel:** **Jedes Referenz-Bild `screenshots/N.png` ist eine harte Vorgabe
  1:1.** Nicht interpretieren, nicht auf andere Cards verallgemeinern. Wenn
  Bild 5 CTA ohne Card zeigt → CTA ohne Card implementieren. Wenn unklar:
  zurückfragen, nicht raten.
- **Prüfpunkt (Pre-Flight):**
  - Jede Sektion, für die es ein Referenz-Bild gibt, wird vor Deploy als
    Chrome-Headless-Slice aufgenommen und **direkt neben die Referenz gelegt**
    (Side-by-Side per `tools/verify.sh --diff N`).
  - Keine Annahmen über Design-Intent ohne Rückfrage.

---

## PXZ-E-004 — Visuelle Verifikation ohne Computed-Style-Probe

- **Datum:** 2026-04-17.
- **Beschreibung:** In v2.3.0 wurden Fixes als erledigt gemeldet, obwohl sie
  in der Praxis nicht gewirkt haben (siehe PXZ-E-001). Der Screenshot wurde
  gemacht, aber nicht der Computed Style. Ohne Computed-Style-Messung blieb
  unklar, ob das CSS wirklich angewendet wurde oder durch eine andere Regel
  überschrieben wird.
- **Ursache:** Screenshots allein beweisen nicht, dass die gewollte Regel
  greift — sie zeigen nur das Endergebnis. Eine Regel kann durch Spezifität
  oder `!important` still überschrieben werden, und der Screenshot zeigt dann
  den alten Zustand.
- **Regel:** **Nach jeder CSS-Änderung an harten Werten (Padding, Margin, Position)
  MUSS die Computed-Style-Probe laufen.** Nicht nur Screenshot.
- **Prüfpunkt (Pre-Flight):**
  - `tools/probe-design.mjs` liest via Puppeteer CDP die angewandten CSS-Regeln
    aller Key-Selektoren (`.pxz-loc-card--main`, `.pxz-loc-badge`, `.pxz-final-card`,
    `.pxz-hero-sub`) und vergleicht mit den harten Werten aus DESIGN_GUIDELINES §13.
  - Bei Mismatch: Exit 1, Deploy blockiert.

---

## PXZ-E-005 — WPForms `gdpr-checkbox` rendert nicht im Frontend

- **Datum:** 2026-04-17, **eingeführt + behoben in v2.6.0**.
- **Beschreibung:** Das MFA-Bewerbungsformular wurde mit Feld-Typ `gdpr-checkbox`
  angelegt. Auf der Karriere-Seite fehlte die Pflicht-Einwilligung komplett —
  im DOM war kein Checkbox-Element zu finden, das Formular hätte in Prod ohne
  DSGVO-Einwilligung abgeschickt werden können.
- **Ursache:** Der `gdpr-checkbox`-Typ in WPForms Pro setzt zusätzliche
  Meta-Daten voraus, die beim programmatischen `wp_insert_post` nicht mit
  generiert werden. Ohne diese Meta rendert das Frontend das Feld still als
  "nicht vorhanden" — keine Fehlermeldung, kein HTML-Output.
- **Regel:** **Für programmatisch erzeugte WPForms-Formulare:**
  1. Statt `type: gdpr-checkbox` einen normalen `type: checkbox` mit
     einer einzigen Option und `required: '1'` verwenden — das rendert
     zuverlässig auch ohne Consent-Meta.
  2. Jedes neu generierte Formular MUSS per Headless-Screenshot verifiziert
     werden, nicht nur per Post-Meta-Dump. Ein „Post existiert" ≠ „Feld rendert".
  3. DSGVO-relevante Felder haben im Smoke-Test einen expliziten Check auf
     das Vorhandensein einer Checkbox mit `required`-Attribut.
- **Prüfpunkt (Pre-Flight):**
  - `tools/shoot_karriere.mjs` produziert Screenshots und verifiziert im
    gleichen Durchlauf, dass im HTML `wpforms-field-checkbox` + `required`
    vorhanden ist (zukünftig zu ergänzen, aktuell visuell).
  - Bei jeder Formular-Änderung: einmal die Seite live im Browser prüfen
    und einmal den HTML-Output per `curl | grep wpforms-field-checkbox`.

---

## PXZ-E-006 — Generische Sektions-Padding über §13.4 (Desk-Audit-Befund)

- **Datum:** 2026-04-18, **beobachtet in v2.6.0**, **behoben in v2.6.1**.
- **Beschreibung:** `.pxz-sect` (die generische Hülle um Fachrichtungen, Team,
  Service, Standorte) hatte vertikales Padding `96px / 128px / 160px`
  (Mobile/Tablet/Desktop). DESIGN_GUIDELINES §13.4 fordert für
  Standard-Sektionen `64 / 80 / 96 px`. Desktop-Abweichung: +67 %.
  Visuell wirkte die Seite aufgebläht (§15.4-Muster für Standard-Sektionen),
  obwohl §15.4 primär Dark-Sektionen meint.
- **Ursache:** `.pxz-sect` wurde in einer früheren Iteration an §3.3 (v2.0)
  orientiert (`144 px Standard Desktop`) und nicht mit der Nachfolge-Tabelle
  §13.4 (v2.1, `96 px Desktop`) abgeglichen. Fehlerklasse **FK-5 Kontextverlust**:
  die aktuellere Tabelle hatte Vorrang, wurde aber beim Code nicht nachgeführt.
- **Regel:** **§13.4 ist die verbindliche Tabelle für Sektions-Padding.** §3.3
  (aus v2.0) ist obsolet, solange §13.4 existiert. Beim Desk-Audit
  gegen DESIGN_GUIDELINES immer die höchstnummerierte Regel-Tabelle als
  Source-of-Truth verwenden — ältere Abschnitte sind dokumentarisch.
- **Weiterer Nebenbefund (gleicher Audit, selber Commit):**
  - `.pxz-mfa-sub max-width: 48rem` verstieß gegen §13.5 (Fließtext max 40rem)
    und §15.6 (Orphan-Words). Korrigiert auf 40rem + `text-wrap: balance`.
  - `.pxz-btn` Mobile-Padding war `14 × 26 px` statt §6.1-Minimum `14 × 28 px`.
    Korrigiert auf `0.875rem 1.75rem`.
- **Prüfpunkt (Pre-Flight):**
  - Ergänzung für `tools/probe-design.mjs` (Sprint 0 / S0.4): EXPECTED-Einträge
    für `.pxz-sect { paddingTop: 96/80/64 }` und `.pxz-mfa-sub { maxWidth: 640px }`.
  - Interim: ad-hoc-Probe in Session-Log 2026-04-18 v2.6.1 (grün).
  - **§13.4- und §13.5-Werte zukünftig in ACCEPTANCE.md als textuelle
    Akzeptanzkriterien aufnehmen** (geplant in Sprint 0).

---

## PXZ-E-007 — „fertig" gemeldet, ohne Dr. Stracke den Beweis zu liefern + FK-1-Missverständnis über Aufgaben-Scope

- **Datum:** 2026-04-18, **beobachtet in v2.6.1**.
- **Beschreibung:** Nach den v2.6.1-Fixes wurde „fertig" gemeldet. Dr. Stracke
  öffnete die Seite (inkl. Inkognito) und konnte keinen Unterschied erkennen.
  Claude hatte Cache-Hypothesen (Service Worker, Hard-Reload) vorgeschlagen,
  die Dr. Stracke manuell durchklicken musste — obwohl Puppeteer selbst im
  Headless-Inkognito-Modus einen A/B-Shot hätte liefern können.
- **Zweiter Teilbefund:** Die Aufgabe *„Designregeln durchgehen und Punkte
  korrigieren, die nicht korrigiert wurden"* wurde als *„Abweichungen gegen
  DESIGN_GUIDELINES finden"* interpretiert. Dr. Stracke meinte aber die
  konkreten visuellen Mängel, die ER auf der Seite sieht. Fehlerklasse FK-1.
- **Ursache:**
  1. Phase 1 aus `WORKING_MODE.md` (Verständnis-Sicherung) wurde nicht
     abgeschlossen. Keine Rückfrage „Welche konkreten Punkte meinen Sie?".
  2. Phase 4 (Selbstprüfung) wurde ohne Vorher/Nachher-Beweis abgeschlossen.
     Kein A/B-Shot für Dr. Stracke — stattdessen Aufforderung, DevTools zu
     öffnen.
- **Regel:**
  1. **AB-Diff ist Pflicht** nach jeder CSS-Änderung. `tools/ab-diff.mjs`
     erzeugt Before/After-Shots in Inkognito (cache-disabled), inkl.
     Höhen-Delta und Selector-Probe. Die beiden Shot-Pfade MÜSSEN in der
     „fertig"-Meldung genannt werden.
  2. **Keine Manual-Delegation** an Dr. Stracke für Cache-/DevTools-Schritte.
     Headless-Chrome-Inkognito, `setCacheEnabled(false)` und
     `?cb=<timestamp>` sind vollständig automatisierbar.
  3. **Aufgaben-Scope vor Code**: Bei Formulierungen wie „einige Punkte",
     „so passt das nicht" immer erst in 1 Satz paraphrasieren und
     bestätigen lassen. Kein Auto-Mapping auf Regel-Dokumente.
- **Prüfpunkt (Pre-Flight):**
  - `PRE_FLIGHT_CHECKLIST.md` §7a + §7b (neu 2026-04-18).
  - `tools/ab-diff.mjs` ist ab sofort fester Bestandteil der Verify-Sequenz.

---

## PXZ-E-008 — Globaler `.pxz-home p { margin: 0 }` Reset überschrieb seit Projekt-Start ALLE Klassen-Margin-Regeln auf `<p>`-Elementen

- **Datum:** 2026-04-18, **beobachtet in v2.6.2**, **behoben in v2.6.3**.
- **Beschreibung:** Der Hero-Subtitle rutschte seit Projekt-Start sichtbar
  links vom Zentrum weg, obwohl `.pxz-hero-sub { margin: 1.25rem auto 0 }`
  gesetzt war. Computed Style: `marginLeft: 0px, marginRight: 0px` statt
  `auto`. Identisches Problem bei `.pxz-final-priv` (Privatpatienten-Zeile
  klebte an Buttons), `.pxz-mfa-sub`, `.pxz-mfa-email-note`, `.pxz-loc-city` —
  alle p-Elemente mit Klassen-Margin.
- **Ursache:** Die Reset-Regel `.pxz-home p { margin: 0; color: var(--pxz-text); }`
  hat Spezifität **0,1,1** (1 Klasse + 1 Tag). Jede Klassen-Regel wie
  `.pxz-hero-sub { margin: ... }` hat nur **0,1,0** (1 Klasse). Der Reset
  gewann jedes Cascade-Duell und neutralisierte lautlos alle Margin-Regeln
  auf `<p>`. Bei `max-width + margin: auto` führte das zu `marginLeft: 0` —
  Element nimmt Full-Width-Box und sitzt links im Content-Bereich.
- **Fehlerklasse:** FK-5 Kontextverlust (die Reset-Regel war vor langer Zeit
  eingeführt worden, spätere Klassen-Regeln gingen davon aus, dass sie
  greifen).
- **Regel:**
  1. **Globale Element-Resets in Theme-Containern immer mit `:where()`
     spezifitätsneutral setzen.** Syntax:
     ```css
     .pxz-home :where(p, h1, h2, h3, h4, ul, ol) { margin: 0; }
     ```
     `:where()` liefert Spezifität 0. Damit gewinnt jede nachfolgende
     Klassen-Regel ohne Spezifitäts-Trick oder `!important`.
  2. **Nach jeder Margin-Änderung auf Klassen-Regeln einen Live-Probe-Check
     mit `getComputedStyle().marginLeft/marginTop` laufen lassen.** Stimmt
     der computed-Wert nicht mit dem CSS-Wert überein → Cascade-Konflikt.
     Ein in `ab-diff.mjs` ergänzter Alignment-Check könnte automatisch
     prüfen, ob zentrierte Elemente `(left+right)/2 ≈ viewport/2` erfüllen.
  3. **Visueller Anker: wenn Block-Element `max-width + margin: auto` hat
     und trotzdem links sitzt → IMMER Spezifität des Resets prüfen.**
- **Prüfpunkt (Pre-Flight):**
  - Ergänzung für `ab-diff.mjs`: Alignment-Probe über alle zentrierten
    Showpiece-Elemente. Wenn `|center - viewportCenter| > 5 px` → Fehler.
  - Regel wird in `DESIGN_GUIDELINES.md §16.5` aufgenommen (Code-Style).

---

## PXZ-E-009 — Code-Comment-Strings triggern WP Page-Template-Auto-Discovery

- **Datum:** 2026-04-19, **eingeführt + behoben in v2.7.7** (S2.2).
- **Beschreibung:** Nach Anlage von 8 neuen Page-Templates (S2.2) zeigte
  `wp eval 'print_r( wp_get_theme()->get_page_templates() );'` zwei Phantom-
  Einträge im WP-Admin-Page-Template-Dropdown:
  - `[404.php] => " header).`
  - `[functions.php] => "-Header automatisch.`
  Beide Dateien sind keine Page-Templates (404.php ist WP-Hierarchie-Fallback,
  functions.php ist Theme-Logik) — wären aber im WP-Admin als auswählbare
  Templates erschienen, was Editor-Verwirrung und Funktions-Bruch ausgelöst hätte.
- **Ursache:** WordPress' Page-Template-Auto-Discovery scannt **jede PHP-Datei**
  im Theme-Root (und Subordnern bis Tiefe 1) via Regex auf den literalen String
  `Template Name:` (mit Doppelpunkt). Mein Header-Comment in `404.php`
  (`* NOT a Page Template (no "Template Name:" header).`) und mein Filter-Comment
  in `functions.php` (`// Karriere registriert sich via "Template Name:"-Header
  automatisch.`) enthielten den Trigger-String — WP las jeweils den Reststring
  bis Zeilenende als Display-Namen.
- **Fehlerklasse:** **FK-3 Plausible Scheinlösung** — Code wirkt sauber
  (didaktische Comments), produziert aber unsichtbaren WP-Bug. Auch FK-5-Anteil
  (Kontextverlust über WP-Auto-Discovery-Verhalten).
- **Regel:**
  1. **Code-Comments dürfen den Trigger-String `Template Name:` (mit Doppelpunkt)
     nicht enthalten**, auch nicht als Beispiel oder Negation. Sichere Form:
     `Template-Name` (mit Bindestrich, ohne Doppelpunkt) oder umformulieren.
  2. **Gleiche Vorsicht bei anderen WP-File-Header-Strings**: `Plugin Name:`,
     `Theme Name:`, `Block Name:`, `Description:`, `Version:`. Faustregel: wenn
     ein String ein WP-Header-Feld definiert, darf er in Comments nur als
     `<Wort>-<Wort>` (kein Doppelpunkt) erscheinen.
  3. **Verifikations-Workflow nach jeder Theme-Änderung**: WP-CLI-Probe
     `wp eval 'print_r( wp_get_theme()->get_page_templates() );'` läuft und
     listet **exakt** die intendierten Templates — keine `404.php`,
     `functions.php`, `inc/*.php` oder `template-parts/*.php` darin.
- **Prüfpunkt (Pre-Flight):**
  - Künftige Theme-Sessions ergänzen `tools/verify.sh` um WP-CLI-Probe
    `get_page_templates()` mit Whitelist-Vergleich (Erwartung: 9 — Homepage +
    Karriere + 7 S2.2-Skelette). Bei Abweichung: Exit 1, Deploy blockiert.
  - Manueller Schnell-Check: `grep -rn "Template Name:" /pfad/zum/theme/*.php`
    — alle Treffer müssen echte File-Header sein (am Beginn eines Block-Comments
    direkt nach `<?php`), keine inline-Comments oder Code-Strings.

---

## Template für neue Einträge

```
## PXZ-E-XXX — kurze Überschrift

- **Datum:** YYYY-MM-DD, **beobachtet in v?.?.?**, **behoben in v?.?.?**.
- **Beschreibung:** …
- **Ursache:** …
- **Regel:** …
- **Prüfpunkt (Pre-Flight):** …
```
