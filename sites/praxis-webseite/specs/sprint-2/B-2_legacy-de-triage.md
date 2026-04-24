# B-2 Legacy/DE Triage — Sichtung Content-Archive `legacy/de/` (23 Pages)

- **Datum:** 2026-04-24 (Session 33)
- **Sprint-Block:** B-2 (Praxis-Launch-Fokus, CW-PRIO-001 → P3)
- **Quelle:** `_content-archive/legacy/de/*.md` + Spalten `cluster=legacy` in `specs/sprint-2/S2.3-D/page-inventory-full.csv`
- **Zusätzlich gesichtet:** `_content-archive/_status/private/` (2 legacy-Einträge)
- **Ziel:** Jede Page klassifizieren — **PFLEGEN** (Content übernehmen) · **ARCHIV-ONLY** (im Archiv belassen, nicht live) · **MERGEN** (Content-Bestandteile gehören in andere Cluster) · **LÖSCHEN** (leere Dubletten)
- **Ergebnis:** Input für Dr.-Stracke-Freigabe, danach Kurations-Arbeit in Folge-Sessions

---

## 1. Methodik

Jede Page wurde in vier Dimensionen bewertet:

| Dimension | Frage |
|---|---|
| **Content-Substanz** | Hat die Page echten Text (nicht nur Shortcode-Stub oder leer)? |
| **Redundanz** | Wird der Content schon von einer Sprint-2-Target-Page (`kern/`, `services/`, `checkups/`, `diagnostik/`) abgedeckt? |
| **Cluster-Fehler** | Ist die Page faktisch i18n-Dublette (EN/FR/ES), die falsch in `legacy/` klassifiziert wurde? |
| **Launch-Relevanz** | Trägt der Content zum M1-Launch bei (Patient-Service, Praxis-Info, Rechtsquelle)? |

Pro Page eine von 4 Empfehlungen:
- **PFLEGEN** → Inhalt in neue Trunk-YAML oder Template-Render extrahieren
- **MERGEN** → Inhalt in bestehende Target-Page (siehe Spalte `ziel`) übernehmen
- **ARCHIV-ONLY** → bleibt als historisches Archiv erhalten, nicht in Launch-Content
- **LÖSCHEN** → leerer Stub, Dublette, oder obsoleter Cluster-Fehler (Archive-Datei bleibt, aber **keine** Neuanlage im Trunk)

---

## 2. Triage-Tabelle (23 Published + 2 Private = 25 Einträge)

### 2.1 Patient-Self-Service (WPForms-Flows) — **PFLEGEN als Service-Section**

| # | slug (id) | chars | Inhalt | Empfehlung | Ziel |
|---:|---|---:|---|---|---|
| 1 | `terminanfrage` (4011) | 327 | Einleitungstext + `[wpforms id="4010"]` | **PFLEGEN** | neue `/kontakt/` oder `/service/terminanfrage/` — Form-ID 4010 behalten |
| 2 | `rezeptbestellung` (4014) | 863 | Patient-Info-Text + Form-Felder erklärt + `[wpforms id="…"]` | **PFLEGEN** | neue `/service/rezeptbestellung/` |
| 3 | `ueberweisung` (4017) | 371 | Kurztext + `[wpforms id="4016"]` | **PFLEGEN** | neue `/service/ueberweisung/` |
| 4 | `fragebogen-bauchschmerzen` (4024) | 71 | nur `[wpforms id="4007"]` | **MERGEN** | Form 4007 behält Funktion, aber in Service-Index verlinken — separate Page unnötig |
| 5 | `beschwerden-beim-wasserlassen` (4026) | 144 | nur `[wpforms id="4006"]` | **MERGEN** | wie oben, Form 4006 |
| 6 | `covid-19-risikofragebogen` (4028) | 1288 | Corona-Fragebogen + `[wpforms]` | **ARCHIV-ONLY** | Corona-Pandemie vorbei, aus Patient-Flow entfernen (Evergreen-Pflicht HWG) |
| 7 | `fragebogen-personalisierte-medizin` (8922) | 1869 | Juvantis-Projekt-Fragebogen (DHT/Longevity) | **MERGEN → Juvantis** | gehört NICHT auf Praxis-Site (HWG!), ist Juvantis-Content → `sites/juvantis-webseite` oder Archive |

### 2.2 Patient-Info-Pages (echte Service-Erklärungen) — **PFLEGEN**

| # | slug (id) | chars | Inhalt | Empfehlung | Ziel |
|---:|---|---:|---|---|---|
| 8 | `arbeitsunfaehigkeit` (466) | 3062 | Erklärung AU-Regeln (Persönl. Kontakt, Rückwirkung, planbar) — HWG-neutral, Patient-Info | **PFLEGEN** | neue `/service/arbeitsunfaehigkeit/` oder Unter-Abschnitt in `/sprechstunden/` |
| 9 | `ein-und-ueberweisungen` (469) | 3904 | Krankenhaus-Einweisung + Voruntersuchung + Fach-Überweisungen (ausführlich) | **PFLEGEN** | neue `/service/einweisungen-ueberweisungen/` |
| 10 | `neupatienten-new-patient-enrollment` (9498) | 2029 | Neupatienten-Aufnahme-Regel + bilingual (DE/EN) + Warteliste | **PFLEGEN** | neue `/neupatienten/` (Top-Level, eigene Page) — **WICHTIG für Scheine-Steuerung** |
| 11 | `frequently-asked-questions` (398) | 878 | FAQ-Einleitung (sehr knapp, keine echten Q&As) | **MERGEN** | als FAQ-Accordion in `/praxis/` oder `/sprechstunden/` — separate Stub-Page überflüssig |

### 2.3 Sprechzeiten & Standorte — **MERGEN** in Kern-Cluster

| # | slug (id) | chars | Inhalt | Empfehlung | Ziel |
|---:|---|---:|---|---|---|
| 12 | `unsere-sprechzeiten` (405) | 7048 | Vollständige Sprechzeiten-Tabelle (Termin / Akut / Sa / Abend) + Regeln | **MERGEN** | `/sprechstunden/` Page #4 (S2.1-Inventar) — dieser Content **ist** die neue Page-Basis |
| 13 | `standort-alte-oper` (9430) | 2054 | Zweitstandort Bockenheimer Landstraße (Eterno Windows Gebäude) | **⚠ DR.-STRACKE-FRAGE** | Trunk hat 3 Standorte (`bockenheimer`, `grueneburgweg`, `leerbachstrasse`) — ist Bockenheimer = Alte Oper? Ist Standort noch aktiv? → **offene Entscheidung vor Kuration** |

### 2.4 Diagnostik/Leistungen (einzel-Page-Fragmente) — **MERGEN**

| # | slug (id) | chars | Inhalt | Empfehlung | Ziel |
|---:|---|---:|---|---|---|
| 14 | `carotis-duplex` (354) | 1896 | Sonographie der Halsschlagadern (Leistungs-Beschreibung) | **MERGEN** | `/diagnostik/ultraschall/` oder Unter-Sektion — separate Page unnötig (Diagnostik-Cluster hat eigenen Flow) |

### 2.5 Historische / Projekt-Pages — **ARCHIV-ONLY**

| # | slug (id) | chars | Inhalt | Empfehlung | Begründung |
|---:|---|---:|---|---|---|
| 15 | `projekt-docvocat` (302) | 6113 | „Digitale Patientenakte" (DocVocat-Projekt) | **ARCHIV-ONLY** | Projekt-Beschreibung, nicht Patient-Service. Falls Projekt noch aktiv: separate Projekt-Page-Klasse (nicht Teil des M1-Launch-Scope) |
| 16 | `docteur-en-med-s-saul` (375) | 6586 | Docteur-Saul-Biographie (ausführlich, DE-Text trotz FR-Slug) | **MERGEN → B-1** | **Goldstück**: enthält Bio-Rohmaterial für B-1 Arzt-Bios. In S34 B-1 als Bio-Quelle für `docteur-saul.yaml` nutzen statt neu formulieren |
| 17 | `weihnachtskalender` (8199) | 317 | Adventskalender-Gimmick + `[santapress]`-Shortcode | **ARCHIV-ONLY** | saisonal, nicht M1-relevant. Santapress-Entscheidung bleibt eigener Track (ewige externer Blocker, SESSION_RESUME §4) |
| 18 | `under-construction` (5703) | 300 | Platzhalter-Page (leer im Body) | **LÖSCHEN** | reiner Stub, kein Content |

### 2.6 Leere i18n-Dubletten (falsch in `legacy/` klassifiziert) — **LÖSCHEN**

| # | slug (id) | chars | Inhalt | Empfehlung | Begründung |
|---:|---|---:|---|---|---|
| 19 | `cookie-richtlinie-eu` (4238) | 104 | leer | **LÖSCHEN** | Cookie-Text gehört in `/datenschutz/` (B-4), kein eigener Eintrag |
| 20 | `dificultades-molestias-al-orinar` (4320) | 172 | nur `[wpforms id="4006"]` (ES) | **LÖSCHEN** | ES-i18n-Stub, Form 4006 schon in #5 registriert |
| 21 | `depistaje-de-enfermedades-tumorales` (4703) | 0 | komplett leer | **LÖSCHEN** | ES-Leerstub, Mojibake-Rest |
| 22 | `echocardiographie` (4753) | 0 | komplett leer | **LÖSCHEN** | FR-Leerstub |
| 23 | `ultrasound-diagnostics` (4903) | 0 | komplett leer | **LÖSCHEN** | EN-Leerstub |

### 2.7 Private Pages (Zusatz-Funde aus `_status/private/`)

| # | slug (id) | chars | Inhalt | Empfehlung | Begründung |
|---:|---|---:|---|---|---|
| 24 | `fragebogen-brustschmerzen` (4022) | 507 | privater Patient-Fragebogen | **ARCHIV-ONLY** | war bewusst `private` → kein Launch-Scope |
| 25 | `jobs` (5081) | 4569 | Stellenausschreibungen-Page | **ARCHIV-ONLY** | `/karriere/` (bereits live) deckt das Thema ab — jobs-Page ist obsolete Vorstufe |

---

## 3. Zusammenfassung der Empfehlungen

| Kategorie | Anzahl | Pages |
|---|:-:|---|
| **PFLEGEN** (in Trunk übernehmen) | 6 | Terminanfrage · Rezeptbestellung · Überweisung · Arbeitsunfähigkeit · Ein-/Überweisungen · Neupatienten |
| **MERGEN** (Bestandteile in Target-Page) | 6 | Bauchschmerz-Form · Wasserlass-Form · DHT-Fragebogen → Juvantis · FAQ-Stub · Sprechzeiten → `/sprechstunden/` · Carotis-Duplex · Docteur-Saul-Bio → B-1 |
| **ARCHIV-ONLY** | 5 | Corona-Fragebogen · DocVocat · Weihnachtskalender · Fragebogen-Brustschmerzen (private) · Jobs (private) |
| **⚠ DR.-STRACKE-FRAGE** | 1 | `standort-alte-oper` — noch aktiv? Mapping zu `bockenheimer`? |
| **LÖSCHEN** (Stub-Keine-Neuanlage) | 6 | Under-Construction · Cookie-Richtlinie · 3× leere ES/FR/EN-Dubletten · ES-Wasserlass-Dublette |

**Launch-Impact:** 6 neue Service-Pages aus dem Legacy-Cluster (`arbeitsunfaehigkeit`, `ein-und-ueberweisungen`, `neupatienten`, `terminanfrage`, `rezeptbestellung`, `ueberweisung`) — alle bestehender, HWG-neutraler Praxis-Content, **kein Schreibaufwand von Null**, nur Umzug + Template-Integration.

**B-1-Boost:** `docteur-en-med-s-saul` liefert 6586 chars Bio-Rohmaterial für `trunk/content/team/docteur-saul.yaml` → einer der 7 fehlenden Bios ist **nicht** auf Dr.-Stracke-Input angewiesen.

---

## 4. Offene Entscheidungen für Dr. Stracke

Vor Kuration in Folge-Sessions beantworten:

1. **Standort Alte Oper (Bockenheimer Landstraße 33, Eterno Windows Gebäude) — noch aktiv?**
   - Trunk-Registry: `_media-source/praxis/standorte/bockenheimer/`
   - Falls aktiv: Content (2054 chars) nach `trunk/content/pages/standorte/bockenheimer.yaml`
   - Falls inaktiv: ARCHIV-ONLY + Media-Slot aus Trunk entfernen

2. **DocVocat-Projekt — noch aktiv?** (6113 chars Content vorhanden)
   - Falls aktiv: eigene Projekt-Page außerhalb des P0/P1-Launch-Scope, später entscheiden
   - Falls inaktiv: ARCHIV-ONLY final

3. **Service-Pages-Slugs:** Flache Struktur (`/rezeptbestellung/`, `/terminanfrage/`, …) oder Unter-Bereich (`/service/rezeptbestellung/`)?
   - Flat = kürzere URLs, besser für SEO + Patient-Merk-Fähigkeit
   - Unter-Bereich = sauberere IA, Service-Index als eigene Landing-Page
   - **Default-Empfehlung Claude:** flat, weil Bestandspatienten die Legacy-URLs kennen und SEO-Equity nicht verloren gehen soll (falls Redirects gesetzt werden)

4. **FAQ:** Accordion in `/praxis/` oder eigene Page `/faq/`?
   - Content-Substanz aktuell sehr dünn (878 chars Einleitung, keine Q&As) → Akkordeon in `/praxis/` reicht, separate Page erst wenn Content wächst

---

## 5. Anti-Pattern-Vermerk

- ❌ Diese Triage ist **keine Kuration**. Keine Trunk-YAML wird in dieser Session geschrieben.
- ❌ Keine Archive-Datei wird gelöscht oder verschoben (Goldene Regel: Content-Archive ist unveränderlich, siehe `_content-archive/README.md`).
- ✅ Nur Klassifikation + Empfehlung + offene Fragen.

---

## 6. Folge-Arbeit (Kurations-Backlog für B-2-Unterblöcke)

Nach Dr.-Stracke-Freigabe der Triage:

| Unterblock | Inhalt | Aufwand |
|---|---|:-:|
| **B-2a** | 6 PFLEGEN-Pages nach Trunk + Templates (Service-Cluster) | 1 Session |
| **B-2b** | 6 MERGE-Operationen (Sprechzeiten/Carotis/FAQ-Accordion/DocteurSaul-Bio) | ½–1 Session |
| **B-2c** | Standort-Alte-Oper-Entscheidung umsetzen (je nach Dr.-Stracke-Answer) | ½ Session |
| **B-2d** | Redirect-Map für Legacy-URLs (SEO-Equity-Schutz) | ½ Session |

**Total B-2 nach Triage:** ca. 2–3 Sessions Kurations-Arbeit bis `/service/`-Cluster launch-fähig.
