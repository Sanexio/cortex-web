# Phase 1 — Audit & Strategie

**Projekt:** Komplett-Redesign praxis-stracke.de (westend-hausarzt.com)
**Stand:** 2026-04-17 (Update nach Antworten Dr. Stracke)
**Ziel:** Modernes UX-fokussiertes Design, 4 Sprachen, keine Info-Verluste, MFA-Stellenanzeige auf Homepage

---

## 0. Updates nach Abnahme (2026-04-17)

| Punkt | Korrektur gegenüber Ursprungs-Audit |
|-------|------------------------------------|
| Design-Richtung | **Apple-Stil** (hell, minimalistisch, Weißraum, SF-Pro-Typo, dezente Akzente) — nicht "warm-erdig" |
| Standorte | **2 Standorte:** Grüneburgweg + Bockenheimer Landstraße (Westend) — nicht "Alte Oper" |
| Fachrichtungen | **8:** Allgemeinmedizin, Innere Medizin, HNO, Gynäkologie, Urologie, Neurologie, Physiotherapie, Psychotherapie |
| Team | 8 Ärzt:innen · 5 MFAs · 17 Behandlungsräume · ~3.000 Scheine/Quartal |
| Positionierung | Interdisziplinäres Praxiszentrum (nicht reine Hausarztpraxis) |
| Logo | Gefunden: Praxiszentrum (rot/weiß, Caduceus, Kreis) — SVG/PNG/PDF in `assets/logo/` |
| MFA-Stelle | E-Mail: `praxis@westend-hausarzt.de` · Vollzeit · ab sofort · Text vom Kunden geliefert |
| Blog-Posts | überarbeiten + Pipeline für automatisierte Posts (Phase 5 als Zusatz) |
| Sono-Atlas | öffentlich bleiben |
| **Go-Live-Termin** | **innerhalb 48h** |
| Übersetzungen | vollständig von mir erstellt (keine DeepL+Review-Runde) |
| Stack | Blocksy + GenerateBlocks (bestätigt) |

---

## 1. Bestandsaufnahme

### 1.1 Sprachen (WPML aktiv)
| Code | Sprache | Pages publish | Status |
|------|---------|---------------|--------|
| de | Deutsch | 51 | Leitsprache |
| en | English | 43 | ~84% übersetzt |
| fr | Français | 41 | ~80% übersetzt |
| es | Español | 39 | ~76% übersetzt |

**Gap:** EN fehlen 8 Seiten, FR 10, ES 12 gegenüber DE. Im Redesign schließen.

### 1.2 Content-Typen (published)
- **172 Pages** (Standard + Services + Formulare + Rechtstexte)
- **11 Posts** (News/Blog — selten aktualisiert, vermutlich Altlast)
- **25 "door" CPT** = Adventskalender 2023/2024 — saisonal, nicht Teil der permanenten IA
- **6 WPForms aktiv** (Terminanfrage, Rezeptbestellung, Überweisung, Neupatient, Corona, Marktforschung)

### 1.3 IA-Struktur (Kernseiten DE)
```
Home
├── Leistungen
│   ├── Check Ups (Gesundheits / Cardio / Angio)
│   ├── Ultraschall-Diagnostik (Echo / Carotis / Schilddrüse / Beingefäße)
│   ├── Belastungs-EKG, Lungenfunktion, Labordiagnostik
│   ├── Impfungen, Tumorscreening
│   └── Digitale Patientenakte (DocVocat)
├── Ärzte-Team (S. Saul, S. Stracke, MFAs)
├── Sprechzeiten
├── Standort Alte Oper
├── Patienten-Service
│   ├── Terminanfrage, Rezeptbestellung, Überweisung, AU
│   ├── Neupatient Enrollment
│   └── Fragebögen (Bauch, Wasserlassen, Corona, Personalisierte Medizin)
├── Sono-Atlas (Fachpublikum)
├── FAQ
└── Rechtstexte (Impressum, Datenschutz, Cookies)
```

### 1.4 Bestehende Forms (wiederverwendbar)
- `Terminanfrage` (ID 4010) — Kontakt zur Praxis
- `Rezeptbestellung` (ID 4013)
- `Überweisung` (ID 4016)
- `Neupatient` (ID 9486)
- **Fehlt:** MFA-Bewerbungsformular — wird in Phase 3 neu angelegt

### 1.5 Stack (Ist)
- **WP-Theme:** Freesia Empire Plus (Multi-Purpose, 2019-Architektur, Legacy-Widgets, kein FSE)
- **Page-Builder:** Gemischt — teils Legacy-Widgets, teils Gutenberg Blocks
- **Plugins-Landschaft** (36 aktiv): WPML Core + Media + String Translation + Import, WPForms Pro, AIOSEO, MonsterInsights (GA4), WP Mail SMTP Pro, Post SMTP, OptinMonster, Rapidmail Newsletter, Akeeba Backup, Complianz (DSGVO, derzeit deaktiviert wegen Bug), Types, SantaPress (Kalender), Better Search Replace, Disable Remove Google Fonts, Header Footer, Freesia Demo Import
- **Theme-Widgets (Legacy):** freesia_empire_plus_featured/display_team/about_us/our_client_logo, freesiaempire_parallax/testimonial/portfolio/post/contact — **alle im Redesign ersetzbar durch native Gutenberg Block Patterns**

### 1.6 Schwachstellen im Ist-Zustand
| Problem | Auswirkung |
|---------|------------|
| Theme veraltet (Freesia, 2019) | Träge, schlechte Core Web Vitals, kein FSE |
| Legacy-Widget-Zoo | Redaktion fragil, Mojibake-Anfälligkeit bei Migrationen |
| Inkonsistente Übersetzungen | ES/FR unvollständig, Nutzer sieht 404 o. Sprachwechsel ohne Zielseite |
| Kein einheitliches Design-System | Farben, Typo, Spacing ad-hoc |
| Mobile-UX: OK, aber nicht modern (kein Sticky-CTA, kein One-Tap-Contact) |
| Complianz broken | Kein DSGVO-Cookie-Banner aktiv |
| Schema.org minimal | Google-Sichtbarkeit unter Potenzial (kein LocalBusiness/Physician) |

---

## 2. Strategische Empfehlungen

### 2.1 Design-Richtung (Tonalität für Hausarztpraxis)

**Positionierung:** *Moderne Internistische Schwerpunktpraxis mit Hausärztlicher Versorgung — Alte Oper Frankfurt.* Zielgruppe: Gebildetes urbanes Klientel + internationale Patienten (4 Sprachen).

**Design-Prinzipien:**
- **Warm, nicht kalt:** kein dunkles Krankenhaus-Blau. Erdigere Palette (Sand/Olive + Akzent-Teal o. Kupfer).
- **Klar, nicht überladen:** viel Whitespace, große Typo (18-20px Basis).
- **Vertrauen durch Gesicht:** echte Team-Fotos prominenter als Icons.
- **Schnell handlungsfähig:** Sticky "Termin anfragen"-CTA auf Mobile; Sprechzeiten + Telefon in 1 Swipe erreichbar.
- **Mehrsprachigkeit sichtbar, nicht versteckt:** Language Switcher prominent, nicht in Header-Ecke.
- **Accessibility:** WCAG 2.1 AA (Kontrast ≥4.5, Tab-Navigation, aria-labels, Screen-Reader-First-Check auf Hauptpfaden)

### 2.2 Technischer Stack (Soll)

**Vorschlag A (empfohlen): Custom FSE Theme auf Blocksy-Basis**
- Blocksy als Child-Theme-Grundlage (Free, modern, performant, FSE-kompatibel)
- Stackable oder GenerateBlocks Pro für erweiterte Block-Patterns
- Alle Inhalte in Gutenberg Blocks → keine Legacy-Widget-Abhängigkeit mehr
- WPML bleibt
- Complianz durch **Borlabs Cookie** ersetzen (aktueller, DSGVO-robust)

**Vorschlag B (alternativ, mehr Aufwand): vollständig Custom FSE-Theme**
- Tailwind-basiert, theme.json native
- Höchste Design-Kontrolle, aber Wartungsaufwand höher

**Meine Empfehlung: Vorschlag A.** Blocksy + GenerateBlocks gibt 90% der Design-Freiheit bei 30% des Aufwands gegenüber Custom.

### 2.3 Informationsarchitektur (Soll)

Flachere Hierarchie, weniger Klicks, CTAs immer sichtbar:

```
Home ─── (Hero + Service-Überblick + Team + MFA-Stellenanzeige + Kontakt-CTA)
│
├── Leistungen ──────── (3 Cluster statt flacher Liste)
│   ├── Vorsorge & Check-Ups
│   ├── Diagnostik (Ultraschall + EKG + Labor)
│   └── Akute Versorgung (Hausärztlich, Impfungen, AU)
│
├── Team ────── (Ärzte + MFAs, mit Lebenslauf-Popup)
│
├── Service ──────── (alle Formulare zentral, statt verteilt)
│   ├── Termin buchen (Haupt-CTA)
│   ├── Rezept bestellen / Überweisung / AU
│   └── Neupatient-Anmeldung
│
├── Praxis & Kontakt
│   ├── Sprechzeiten
│   ├── Standort Alte Oper (Karte + Anfahrt)
│   └── Kontaktformular
│
├── Karriere ──────── (NEU — zentral für MFA-Stellenanzeige + weitere Jobs)
│
├── Sono-Atlas (weiterhin für Fachpublikum, eigener Bereich)
│
└── Rechtstexte im Footer
```

### 2.4 MFA-Stellenanzeige auf Homepage

**Anforderung umgesetzt als:**
1. **Homepage-Sektion** "Wir suchen Verstärkung" mit:
   - Kurz-Pitch (2 Sätze + USPs: Team, Lage Alte Oper, modernes Arbeiten)
   - Foto (Team-Bild oder Praxis-Ambiente)
   - Primärer CTA: "Direkt bewerben" → öffnet Bewerbungsformular in Modal
2. **Karriere-Unterseite** (Deep-Link aus Homepage) mit ausführlicher Stellenausschreibung:
   - Aufgabenbereich, Profil, Benefits, Arbeitszeit, Gehalt (optional)
   - Eingebettetes Bewerbungsformular (WPForms)
3. **Bewerbungsformular (WPForms):**
   - Pflichtfelder: Name, Email, Telefon, Lebenslauf-Upload (PDF)
   - Optional: Anschreiben, Verfügbarkeits-Datum, Gehaltsvorstellung
   - DSGVO-Checkbox (nach Datenschutz)
   - Confirmation: "Vielen Dank, wir melden uns binnen 48h"
   - Recipient: praxis-E-Mail-Alias (mit dir festzulegen)
4. **Alle 4 Sprachen:** DE-Leitfassung, EN/FR/ES-Übersetzungen via WPML String Translation

### 2.5 SEO & Migration

- **URL-Preservation:** Alle aktuellen `/leistung-xy/`-Slugs behalten → keine SEO-Verluste
- **Schema.org:** `MedicalBusiness` + `Physician` + `MedicalProcedure` pro Leistungsseite → Rich Results bei Google
- **Core Web Vitals:** Zielwerte — LCP <2.5s, CLS <0.1, INP <200ms
- **Hreflang:** korrekt gesetzt für de/en/fr/es via WPML
- **Sitemap:** AIOSEO regeneriert
- **Redirect-Tabelle** für gelöschte/zusammengelegte Seiten

### 2.6 Umgang mit Alt-Inhalten
| Inhalt | Behandlung |
|--------|-----------|
| 11 Blog-Posts | Prüfen: aktuell relevant? → migrieren oder Redirect auf Leistungsseite |
| 25 Adventskalender-Doors | Archivieren, Jahresende 2026 neu aktivieren |
| `UNDER CONSTRUCTION!`-Page (5703) | Löschen |
| `Weihnachtskalender`-Page (8199) | Draft, saisonal aktivieren |
| Alte Fragebögen | Konsolidieren in zentrales "Fragebögen"-Menü unter Service |
| Sono-Atlas | Eigener Bereich (Fachpublikum, nicht für Laien sichtbar prominent) |

### 2.7 Risiken

| Risiko | Mitigation |
|--------|-----------|
| Live bleibt parallel online, muss bei Go-Live 1:1 schwenken | Duplicator/All-in-One-Migration final, klarer Cutover-Plan |
| SEO-Einbruch durch URL-Änderungen | URL-Preservation + 301-Redirects + Sitemap-Ping |
| Übersetzungs-Drift | DE-Master, automatisierter Check ob alle Blöcke in allen 4 Sprachen existieren |
| Ästhetik nicht nach Geschmack | Phase 2 Style-Tile = Korrekturpunkt VOR Homepage-Bau |
| Upload-Lücken (wie Teaser.mp4) | Vor Go-Live: Live-vs-Staging-Diff für /uploads/ |

---

## 3. Arbeitsumgebung

- **Arbeits-Repo:** `/Users/cluster-mini-02/Cortex/projects/praxis-redesign/`
- **Staging-Site:** `gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local` (Local)
- **Live:** bleibt bis Go-Live unangetastet
- **Backup-Rotation:** Pro Phase-Abschluss ein DB-Dump in `~/.claude/backups/`

---

## 4. Phasen-Plan (Detail)

| # | Phase | Deliverable | Abnahme durch dich |
|---|-------|-------------|---------------------|
| 1 | **Audit** (dieses Dokument) | Strategie-Doc | Du okst oder gibst Korrekturen |
| 2 | **Style-Tile + Homepage-Wireframe** | Screenshots Farben/Typo/Komponenten + Homepage-Mockup (DE) | Visuelle Abnahme |
| 3 | **Homepage + MFA-Stellenanzeige** | Live in Staging, DE voll, EN/FR/ES parallel mit Übersetzungen | Du klickst durch |
| 4 | **Rollout** auf Leistungen, Team, Sprechzeiten, Service, Karriere, Kontakt | Staging komplett | Du klickst durch |
| 5 | **QA, SEO, Forms, Rechtstexte, Go-Live-Plan** | Checkliste + Cutover-Datum | Freigabe für Live |

---

## 5. Offene Fragen an dich (BLOCKER für Phase 2)

Bitte beantworten — ohne diese starte ich Phase 2 nicht:

1. **Design-Ton:** Bestätigst du die Richtung "warm, erdig, Vertrauen, modern ohne Edgy"? Oder willst du eher *klinisch-reduziert* (Weiß + Grau + Akzent-Blau) oder *premium-dark* (Schwarz + Gold)?
Antwort zu 1: Ich möchte ein helles Design, dass sich im wesentlichen an dem Design der Apple Webpage orientiert: https://www.apple.com/de/

2. **Logo & Corporate Identity:** Gibt es ein existierendes Logo/CI-Manual, das zwingend beibehalten werden muss? Oder freie Hand?
Antwort zu 2) Es gibt ein Logo, du findest es unter den Assets bei Logos und Praxiszentrum (schaue Dir bei der Gelegenheit auch den kompletten Ordner an und versuche die Dateien zu verstehen, diese kannst Du auch verwenden) 

3. **MFA-Stellenanzeige — Inhalt:**
   - An welche E-Mail-Adresse sollen Bewerbungen gehen?
   - Vollzeit/Teilzeit? Ab wann?
   - Stichworte zum Aufgabenbereich (z.B. "Terminmanagement, Blutentnahme, Assistenz bei Sono, Labor-Vorbereitung")?
   - Benefits konkret (Fortbildung, Urlaubstage, Jobticket, Lage, etc.)?
   - Soll Gehalt/Range genannt werden?
Antwort zu 3) Formuliere es aber lockerer: Die Praxis Dr. Stracke und Kollegen ist ein interdisziplinäres Praxiszentrum im Herzen Frankfurts mit einem breiten Leistungsspektrum aus Allgemeinmedizin, Innerer Medizin, HNO, Gynäkologie, Urologie, Physiotherapie, Psychotherapie und Neurologie – alles unter einem Dach. Mit zwei Standorten im Frankfurter Westend (Grüneburgweg und Bockenheimer Landstraße) bieten wir unseren Patientinnen und Patienten eine umfassende medizinische Versorgung auf höchstem Niveau, inklusive Videosprechstunde, täglicher Akutsprechstunde sowie Terminen nach Vereinbarung. Unser Anspruch ist es, Medizin effizient, patientenzentriert und mit echter Herzlichkeit zu verbinden – für internationale wie lokale Patientinnen und Patienten gleichermaßen.
Zur Verstärkung unseres Teams suchen wir zum nächstmöglichen Zeitpunkt eine Medizinische Fachangestellte (m/w/d) für den Bereich Allgemeinmedizin und Innere Medizin in Vollzeit.
Als Teil unseres engagierten Praxisteams sind Sie eine wichtige Stütze im täglichen Praxisbetrieb und tragen maßgeblich dazu bei, dass sich unsere Patientinnen und Patienten gut aufgehoben fühlen. Sie arbeiten in einem interdisziplinären Umfeld, in dem kurze Wege und eine enge Zusammenarbeit zwischen den verschiedenen Fachbereichen selbstverständlich sind. Ihre Arbeit macht einen echten Unterschied – jeden Tag.
Ihre Aufgaben
Bei uns erwartet Sie ein abwechslungsreicher Praxisalltag mit medizinischen und organisatorischen Tätigkeiten:
Patientenempfang und -betreuung: Begrüßung, Aufnahme und Begleitung der Patientinnen und Patienten sowie erste Ansprechperson für alle Praxisanliegen
Medizinische Assistenz: Durchführung von Blutentnahmen, Impfungen, EKG, Lungenfunktionsmessungen, Langzeit-EKG und Langzeit-Blutdruckmessungen und viele weitere
Terminmanagement und Sprechstundenorganisation: Koordination von Terminen, Verwaltung des Praxiskalenders sowie Organisation der täglichen Akutsprechstunde
Dokumentation und Abrechnung: Pflege der Patientenakten im Praxisverwaltungssystem sowie Unterstützung bei der Abrechnung nach EBM und GOÄ
Kommunikation: Korrespondenz mit Krankenkassen, Überweisern, Laboren und weiteren Fachkolleginnen und -kollegen innerhalb des Praxiszentrums
Qualitätsmanagement: Mitwirkung bei der stetigen Optimierung unserer Praxisabläufe und Prozesse
Was wir Ihnen bieten
Als Teil unseres Praxiszentrums profitieren Sie von einem attraktiven Arbeitsumfeld und zahlreichen Vorteilen:
Attraktive Vergütung über Tarifniveau
Unbefristeter Arbeitsvertrag in Vollzeit mit langfristiger und sicherer Perspektive
Strukturierte Einarbeitung durch erfahrene Kolleginnen und Kollegen, damit Sie schnell sicher und eigenständig arbeiten können
Fort- und Weiterbildungen werden individuell gefördert und finanziert – für Ihre berufliche Entwicklung
Planbare Arbeitszeiten mit festen Sprechstundenzeiten für eine gute Work-Life-Balance
Abwechslungsreiches Arbeitsumfeld in einem interdisziplinären Praxiszentrum mit verschiedenen Fachbereichen unter einem Dach
Kollegiales Miteinander in einem engagierten, wertschätzenden Team mit flachen Hierarchien und kurzen Entscheidungswegen
Zentrale Lage im Frankfurter Westend mit sehr guter Anbindung an den öffentlichen Nahverkehr
Ihr Profil
Abgeschlossene Ausbildung als Medizinische Fachangestellte (m/w/d) oder vergleichbare medizinische Qualifikation
Erfahrung in der hausärztlichen oder internistischen Praxis ist von Vorteil – Berufseinsteiger:innen sind ebenfalls herzlich willkommen
Freude am Umgang mit Menschen und ein einfühlsamer, professioneller Umgang mit Patientinnen und Patienten unterschiedlichster Herkunft
Organisationstalent, Zuverlässigkeit und eine sorgfältige, selbstständige Arbeitsweise
Teamfähigkeit und die Bereitschaft, sich aktiv in ein interdisziplinäres Praxisteam einzubringen
Sicherer Umgang mit gängigen Praxisverwaltungssystemen und digitalen Tools wünschenswert
Gute Englischkenntnisse sind von Vorteil, da wir viele internationale Patientinnen und Patienten betreue
Sie möchten Teil eines engagierten Teams in einem der vielfältigsten Praxiszentren Frankfurts werden? Dann freuen wir uns sehr auf Ihre Bewerbung! Senden Sie uns gerne eine Kurzbewerbung mit Lebenslauf per E-Mail an praxis@westend-hausarzt.de – ein ausführliches Anschreiben ist nicht zwingend erforderlich. Nach Eingang Ihrer Unterlagen melden wir uns zeitnah für ein erstes, unverbindliches Kennenlerngespräch bei Ihnen.

4. **Blog-Posts (11 Stück):** löschen, archivieren oder inhaltlich überarbeiten?
Antwort zu 4) Inhaltlich überarbeiten und überlegen, wie wir automatisiert immer neue Blogposts erstellen können

5. **Sono-Atlas:** weiterhin prominent oder nur intern verlinkt (Fachpublikum)?
Antwort zu 5) kann öffentlich bleiben

6. **Go-Live-Zeitpunkt:** gibt es einen Wunschtermin oder Deadline?
Antwort zu 6) innerhalb der nächsten 48h 

7. **Übersetzungen EN/FR/ES:** maschinell (DeepL) vorübersetzen und du korrigierst, oder willst du vollständige manuelle Revision?
Antwort zu 7) Nein, du überarbeitest es selbst alles selbstständig

8. **Tech-Stack:** Blocksy + GenerateBlocks (mein Vorschlag) oder Custom FSE?
Antwort zu 8) Ich folge Deinem Vorschlag

---

*Ende Phase-1-Dokument. Warte auf deine Freigabe + Antworten auf Block 5.*
