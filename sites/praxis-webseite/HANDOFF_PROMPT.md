# Handoff-Prompt für neue Claude Code Session

> Kopiere den folgenden Text komplett in die neue Session.

---

## KONTEXT

Ich bin Dr. Stracke, Internist und Inhaber des **Praxiszentrum Dr. Stracke & Kollegen** in Frankfurt Westend. Wir arbeiten seit Stunden am kompletten Redesign meiner Praxis-Website (WordPress, 4 Sprachen DE/EN/FR/ES, 172 Seiten) und die vorherige Session ist ausgelaufen.

**Vor Beginn jeder Arbeit MUSS gelesen werden (LL-023):**
1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`

**Projekt-Arbeitsordner:** `~/Cortex/projects/praxis-redesign/`
Lies dort insbesondere:
- `DESIGN_GUIDELINES.md` (v2.0 Apple HIG — absolut verbindlich)
- `PHASE1_AUDIT.md` (5-Phasen-Plan, Content-Inventar, Stakeholder-Antworten)

---

## AKTUELLER STAND

**WordPress-Instanz (Local by Flywheel):**
- Site-Root: `/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/`
- URL: http://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local
- Child-Theme: `wp-content/themes/praxiszentrum/` (Version 2.2.0, Parent = Blocksy)
- WP-CLI: `/Applications/Local.app/Contents/Resources/extraResources/bin/wp-cli/wp`
- PHP-Socket: `/Users/cluster-mini-02/Library/Application Support/Local/run/.../php-fpm.sock` (siehe Local GUI)
- MySQL: Socket-basiert via Local

**Erledigt:**
- Mojibake-Encoding (Hausärztliche etc.) via wp-cli search-replace repariert
- Widgets aus Duplicator-Dump wiederhergestellt
- Complianz-Plugin-Fehler durch Deaktivierung beseitigt (`wp-content/plugins/complianz-gdpr.DISABLED`)
- Videos (Teaser.mp4 etc.) von Live-Site nachgeladen
- Custom Child-Theme mit 4 Sprachen erstellt
- Homepage v2.2.0 funktioniert: Header mit CSS-Grid, Logo 72–104px korrekt, Buttons mit `!important` gegen Blocksy-Spezifität, Doctolib-Widget versteckt
- 8 Ärzte mit Daten angelegt (Fotos: Stracke+Saul echte Fotos, 6 Platzhalter-Avatare)
- MFA-Stellenanzeigen-Sektion mit Du-Form, Amber-Akzent auf dunklem Grund

**Relevante Theme-Dateien:**
- `functions.php` (Konstanten PXZ_PHONE_MAIN, PXZ_EMAIL etc., Theme-Support, WPML-Helpers)
- `inc/homepage-data.php` (pxz_team_members, pxz_homepage_content — 4 Sprachen)
- `template-homepage.php` (komplette Homepage mit Inline-CSS)
- `style.css` (Base-Styles, pxz-Utilities, CSS-Variablen)
- `assets/` (logo.svg, logo.png, logo-icon.png)

**Kontaktdaten (verbindlich):**
- Hauptstandort: Grüneburgweg 12, 60322 Frankfurt am Main
- Zweitstandort: Bockenheimer Landstraße, 60323 Frankfurt am Main
- Kasse: 069 247 574 523 · Privat: 069 247 574 526
- E-Mail: praxis@westend-hausarzt.de

---

## OFFENE AUFGABEN (Priorität absteigend)

1. **Mikro-Fix Standorte:** HAUPTSTANDORT-Badge überlappt optisch mit Eyebrow "STANDORT 1 · HAUPTSTANDORT" → Badge entfernen oder Eyebrow umbenennen zu nur "STANDORT 1".
2. **MFA-Bewerbungsformular** in WPForms: Felder (Name, E-Mail, Telefon, Nachricht, PDF-Upload Lebenslauf/Zeugnisse, DSGVO-Checkbox), Mail-Versand an praxis@westend-hausarzt.de, Einbindung auf Homepage-CTA.
3. **WPML-Homepage-Duplikate:** Seite "Homepage" für EN/FR/ES als Übersetzung anlegen und mit dem DE-Original verknüpfen (Content liegt in `pxz_homepage_content()` bereits in allen 4 Sprachen).
4. **Menü "Hauptnavigation"** in WP-Admin befüllen (ist leer).
5. **Phase 4 — Rollout:** Design-System auf die restlichen 172 Seiten ausrollen (Template-Struktur, Sub-Seiten Fachrichtungen, Team-Einzelseiten, Kontakt, Impressum, Datenschutz).
6. **Phase 5 — Go-Live:** QA (Responsive + Lighthouse), SEO (Titles, Meta, Schema.org MedicalBusiness, Sitemap), Formulare testen, Rollout-Plan Staging → Live.
7. **Blogposts (11 vorhanden):** Inhaltlich überarbeiten, Pipeline für zukünftige Erstellung skizzieren.
8. **Echte Fotos** für 6 weitere Ärzte (Barcsay, Seelig, Jawich, Shahin, Landeberg, Arbitmann) — fehlen noch.

**Deadline:** Go-Live innerhalb 48 Stunden ab jetzt.

---

## ARBEITSWEISE — NICHT VERHANDELBAR

Aus der letzten Session habe ich wörtlich gesagt:

> "Ich befürchte, dass wir in einer grenzdebilen KI-Schleife gefangen sind, in dem jede weitere Iteration nur alles verschlechtert. Du bekommst jetzt eine letzte Chance das Design ansprechend anzupassen."

Daraus abgeleitete Regeln für die neue Session:

- **KEINE Iterationen ins Blaue.** Erst Problem analysieren, dann Lösung, dann Änderung. Nicht hoffen, sondern wissen.
- **Verifizierung mit Chrome Headless Screenshot ist PFLICHT** nach jeder sichtbaren Änderung. Nicht nur Code ändern und behaupten, es sei besser.
- **DESIGN_GUIDELINES.md §1.1 "Absolute Verbotsregeln" gelten ohne Ausnahme:**
  - NIE schwarzer Text auf dunklem Hintergrund
  - NIE Text der erst bei Hover sichtbar wird
  - NIE opacity < 0.95 auf Fließtext
- **Apple HIG als Referenz** (apple.com/de) — Typografie, Spacing, Farbigkeit, ruhige Komposition.
- **Transparenzpflicht (LL-024):** Jeden Schritt im Chat erklären — WAS, WARUM, WAS BEDEUTET DAS für mich.
- **Entscheidungspflicht (LL-034):** Bei Optionen IMMER alle auflisten mit Vor-/Nachteilen. Ich wähle selbst.
- **Deutsch im Chat**, Code-Kommentare englisch.
- **"Fertig" heißt funktionstüchtig** (LL-021), nicht Dateien abgelegt.

---

## ERSTER SCHRITT IN DER NEUEN SESSION

1. Bestätige, dass du die drei Pflicht-Dateien gelesen hast.
2. Lies `~/Cortex/projects/praxis-redesign/DESIGN_GUIDELINES.md` und `PHASE1_AUDIT.md`.
3. Öffne die Homepage per Chrome Headless und nimm einen Full-Page-Screenshot, um den aktuellen Zustand festzustellen.
4. Schlage vor, welche der offenen Aufgaben wir als erstes angehen — mit Zeitschätzung und Risiken.
5. Warte auf meine Freigabe, bevor du irgendetwas am Code änderst.
