# MVP-Rohling westend-hausarzt.com — Handoff

> **Status 2026-04-24 (Session 34–36 kompakt):** MVP-Rohling auf Local-WP vollständig. 29/29 Kern-URLs liefern HTTP 200, `tools/verify.sh` grün. Site ist lokal als Staging-Preview begehbar und wartet auf Content-Feinschliff durch Dr. Stracke.

---

## 1. Was fertig ist (Launch-fähig, bis auf Feinschliff)

### Content-Cluster (alle live)

| Cluster | URLs | Quelle | Notes |
|---|---|---|---|
| **Home** | `/` | `template-homepage.php` + `inc/homepage-data.php` | unverändert (Dr.-Stracke-Design-Wunsch für später) |
| **Praxis** | `/praxis/` | `template-standard.php` | FAQ-Accordion als Folge-Schritt (Content fehlt) |
| **Team** | `/team/` + 8× `/<arzt-slug>/` | Trunk `team/*.yaml` → `inc/data/team.json` | Foto-Platzhalter (Initialen) für 6/8 Ärzte |
| **Fachrichtungen** | `/fachrichtungen/` | `template-fachrichtung-landing.php` | 1-Page-Landing (Detail-Pages folgen nach Launch) |
| **Check-Ups** | `/check-ups/` + 4 Detail-Pages | `template-checkup-hub.php` + `template-standard.php` | Basic-Check bridge-product-rendered |
| **Diagnostik** | `/diagnostik/` + Unterpages | `template-diagnostik-hub.php` | Carotis-Duplex (ID 354) steht noch separat, kein Blocker |
| **Sprechstunden** | `/sprechstunden/` | `template-sprechstunden.php` | Volltext aus Legacy `/unsere-sprechzeiten/` |
| **Kontakt** | `/contact-us/` | `template-kontakt.php` | Google-Maps iframe bereits da; kein separates WPForms (Dr. Stracke kann via Admin ergänzen) |
| **Karriere** | `/karriere/` | `template-karriere.php` | unverändert |
| **Service (NEU S34)** | `/service/` + 6 Detail-Pages | Trunk `pages/praxis/service/*.yaml` → `template-standard.php` | Terminanfrage, Rezeptbestellung, Überweisung, AU, Einweisungen, Neupatienten |
| **Standorte (NEU S34)** | `/standorte/` + `/standorte/zweigpraxis-bockenheimer/` | Trunk `pages/praxis/standorte*.yaml` | Google-Maps Embed im Hub |
| **Aktuelles (NEU S36)** | `/aktuelles/` | Trunk `pages/praxis/aktuelles.yaml` | Platzhalter-Struktur, echte News werden redaktionell eingepflegt |
| **Legal** | `/impressum/`, `/datenschutzerklaerung/` | bestehende WP-Pages | ~4–6k chars Content, **rechtlicher Review vor Live-Gang nötig** |

### Infrastruktur-Bausteine (alle live, alle getestet)

- **Bio-Renderer** (`team-praxis.mjs`) rendert `bio.de` + `qualifications` ins Praxis-Theme (`inc/data/team.json`)
- **`template-arzt.php`** zeigt Bio + Qualifikations-Chips, Fallback-Kaskade: WP-Content → Trunk-Bio → Intro+Stub
- **Bio-Stubs** für alle 8 Ärzte (Dr. Stracke + Docteur Saul mit Voll-Content, 6 weitere mit Platzhalter-Marker)
- **301-Redirect-Map** `inc/redirects.php` mit 15 Legacy→Neu-Pfaden
- **Orphan-Page-Bereinigung** 14 Pages (5 trashed MERGEN, 6 trashed LÖSCHEN, 3 auf private gesetzt ARCHIV-ONLY)
- **Theme-Version** PXZ 2.7.25

---

## 2. Was Platzhalter ist (braucht Ihren Input)

| Platzhalter | Was konkret | Wer liefert |
|---|---|---|
| **Bio-Volltexte 6 Ärzte** | `trunk/content/team/dr-{barcsay,seelig,jawich,shahin,landeberg,arbitmann}.yaml` · `bio.de` enthält Marker `[Platzhalter — …]` | CV-Stichworte von Dr. Stracke, dann ich extrahiere + formuliere wie für Saul |
| **Arzt-Fotos 6 Ärzte** | Derzeit Initialen-Kacheln für 6/8 | externer Foto-Shoot (A-2-Block) |
| **Aktuelles-Content** | `/aktuelles/` Gerüst steht, erste 3 Platzhalter-Themen | Redaktionsteam / Dr. Stracke |
| **Kontakt-Formular** | Kein separates WPForms auf `/contact-us/` (Karte + Kontakt-Text vorhanden) | Optional — via `[wpforms id="…"]` im WP-Admin |
| **Google-Maps Detail-Ausschnitt** | Aktuell generischer Frankfurt-Embed auf `/standorte/` | Konkrete Lat/Lng Leerbachstr. 14 + Bockenheimer Landstr. 33 |
| **FAQ-Accordion auf `/praxis/`** | Struktur-Vorarbeit, aber **kein Content** — Legacy-Page hatte nur 878 chars Einleitung | Q&A-Paare von Dr. Stracke |

---

## 3. Was vor Live-Gang nötig ist (harte Blocker)

| # | Was | Verantwortlich |
|---|---|---|
| **L-1** | Impressum rechtlich prüfen (aktueller Inhalt: 3847 chars, unklar ob HWG-/DSGVO-konform) | Anwalt / Dr. Stracke |
| **L-2** | Datenschutzerklärung rechtlich prüfen (aktueller Inhalt: 5658 chars) | Anwalt / Dr. Stracke |
| **L-3** | Cookie-Banner-Lösung (Borlabs, Complianz, o.ä.) | Dr. Stracke |
| **C-1** | DF-Support reaktivieren für SFTP-Staging-Zugang | Dr. Stracke |
| **C-2** | Prod-Deploy-Skript (SFTP-basiert) | Folge-Session nach C-1 |
| **D-1** | Erster Prod-Push westend-hausarzt.com | nach L-1…L-3 + C-2 |
| **D-2** | DNS-Cut-Over + Verify auf Prod | nach D-1 |

---

## 4. Review-Anleitung für Dr. Stracke

1. **Alle 29 Kern-URLs durchklicken** in der Local-Site: `https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/`
2. **Was aus inhaltlicher Sicht fehlt / falsch ist** direkt in Obsidian-Vault als `[!anweisung]`-Callout hinterlegen (LL-045), z.B.:
   - Arzt-Bios: CV-Stichworte pro Kollege
   - Aktuelles: 3 erste echte Meldungen
   - FAQ: 5–10 typische Patient-Fragen
3. **Design-Wünsche** wie „Home-Hero anpassen" in einer separaten Liste sammeln — die sind Folge-Block „Design-Polish" (Ppol in der holistischen Prio-Leiter, nach P4 M1 Launch).

---

## 5. Session-Mapping (24h-Sprint)

Alle ursprünglich für S34–S37 (~5–7 Sessions) geplante B-Arbeit komprimiert in einer Arbeits-Einheit:

| ursprünglich geplant | Status |
|---|:---:|
| S34 B-2a 6 Service-Pages + template | ✅ (war vor Session-Start schon committed als `0ee4e96`) |
| S34 B-2c Zweigpraxis Bockenheimer | ✅ neu |
| S34 B-2d Redirect-Map (15 Einträge) + Orphan-Trash (14 Pages) | ✅ neu |
| S35 B-1-template Renderer + `template-arzt.php` Bio-Render | ✅ neu |
| S35 B-1-6rest 6 Arzt-Bio-Stubs mit Qualifikationen | ✅ neu |
| S35 B-2b 6 Merge-Ops (Sprechzeiten, FAQ-Link, DHT-Form, Forms-Stubs) | ✅ neu (via Redirect-Map + Orphan-Trash) |
| S36 B-3 Aktuelles-Page + Google-Map auf /standorte/ | ✅ neu |
| S36 B-4 Impressum/Datenschutz | ✅ (Content war bereits da, Legal-Review als L-1/L-2 ausgelagert) |
| S37 QA + Handoff | ✅ diese Datei |

---

## 6. Was NICHT angefasst wurde (bewusst, gefrierend per CW-PRIO-001)

- Media-Registry-Framework (`tools/media/register.mjs`)
- Shopify-Media-Upload-Pfad
- N-6.4/6.5 Adapter-Symmetrie
- N-3 Design-Token-Adapter / iOS-Adapter
- `_inbox/media-root/` kategorisieren
- Design-Polish (Home-Hero, Typography-Feinschliff, A11y-Audit)
- Mehrsprachigkeit (WPML/Polylang — Block F)

Diese kommen nach M1 Prod-Launch.

---

*Verfasst 2026-04-24 als Abschluss des 24h-MVP-Sprints (Session 34+35+36+37 komprimiert).*
