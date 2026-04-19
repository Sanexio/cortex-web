# Seiten-Inventar — Sprint 2 (S2.1)

- **Datum:** 2026-04-19
- **Sprint:** 2 / S2.1
- **Spec:** `specs/sprint-2/S2.1_page-inventory.md` (FREIGEGEBEN)
- **Entscheidungen:** E1-Hybrid+SEO · E2a · E3a · E4c
- **Stand der Sitemap-Quelle:** `https://westend-hausarzt.com/page-sitemap.xml` gelesen am 2026-04-19
- **Sprache:** nur DE (EN/FR/ES = Sprint 3)
- **Append-safe:** neue Seiten kommen unten dran; bestehende Zeilen ändern nur `status` / `anmerkungen`

---

## Inventar-Tabelle

| # | slug | titel_de | url_prod | template_typ | content_quelle | prio | status | anmerkungen |
|---:|---|---|---|---|---|:---:|:---:|---|
| 1 | `` | Startseite | `/` | `homepage` | `prod-seo` | P0 | done | Live auf Local WP v2.7.6, `template-homepage.php`. Visuelle Abnahme v2.7.5 gültig (S2.0c null-delta). |
| 2 | `praxis` | Unsere Praxis | `/internistische-schwerpunktpraxis-hausaerztliche-grundversorgung/` | `standard` | `prod-seo` | P0 | todo | Prod-Slug ist lang — Neu-Slug `/praxis/`. Leitbild / Selbstverständnis. Rewrite-Pflicht: §2.4 E1-Hybrid+SEO Stil entspannen + Meta-Title/Description. |
| 3 | `team` | Unser Team | — | `standard` | `neu` | P0 | todo | Narrative Praxiskultur-Seite (Werte, Teamkultur, MFA/Ärzte gemeinsam). NICHT identisch mit Ärzte-Übersicht (#18). Prod hat nur `/arzt-team/` (Grid) — diese Seite ist neu. |
| 4 | `sprechstunden` | Sprechstunden | `/unsere-sprechzeiten/` | `sprechstunden` | `prod-seo` | P0 | todo | Öffnungszeiten + Terminbuchung. Doctolib-Einbettung offen (S2.3 Batch G, offene Folgeentscheidung Nr. 3 aus Spec §5). |
| 5 | `kontakt` | Kontakt | `/kontakt/` | `kontakt` | `prod-seo` | P0 | todo | Standort + Kontakt-Formular. Prod-URL existiert (Sitemap enthält zwar nur `?lang=es`-Variante, deutsche Seite ist als Fallback über WPML aktiv). |
| 6 | `datenschutz` | Datenschutzerklärung | `/datenschutzerklaerung/` | `standard` | `legal-extern` | P0 | todo | Offene Folgeentscheidung Nr. 1 (Anwalt / e-recht24 / Prod-Übernahme) — blockiert S2.3 Batch A. Prod hat zusätzlich `/datenschutzerklaerung-2/` (Legacy-Dublette) — in Sprint 2b klären. |
| 7 | `impressum` | Impressum | `/impressum/` | `standard` | `legal-extern` | P0 | todo | DDG/TMG §5 Pflicht. Offene Folgeentscheidung Nr. 1 (siehe #6). |
| 8 | `404` | Seite nicht gefunden | — | `404` | `neu` | P0 | todo | WP-Fallback-Template. Ohne `404.php` greift Blocksy-Default (unästhetisch). Ziel: konsistent mit Homepage-Design, CTA zurück zur Startseite. |
| 9 | `fachrichtungen` | Fachrichtungen | — | `fachrichtung-landing` | `neu` | P0 | todo | Übersichtsseite (Grid über die 8 Einzel-Fachrichtungen). Prod-Site hat KEINE Fachrichtungen-Struktur (nutzt Check-ups + Diagnostik-Unterseiten) — Architektur-Unterschied, Content-Neu in S2.3 Batch B. |
| 10 | `fachrichtung-innere-medizin` | Innere Medizin | — | `fachrichtung` | `neu` | P1 | todo | Kernfach (P1 vor Nischen, §2.5). |
| 11 | `fachrichtung-allgemeinmedizin` | Allgemeinmedizin | — | `fachrichtung` | `neu` | P1 | todo | Kernfach (P1 vor Nischen). Hausärztliche Grundversorgung. |
| 12 | `fachrichtung-hno` | HNO | — | `fachrichtung` | `neu` | P1 | todo | Nischenfach. |
| 13 | `fachrichtung-neurologie` | Neurologie | — | `fachrichtung` | `neu` | P1 | todo | Nischenfach. |
| 14 | `fachrichtung-psychologie` | Psychologie | — | `fachrichtung` | `neu` | P1 | todo | Nischenfach. |
| 15 | `fachrichtung-physiotherapie` | Physiotherapie | — | `fachrichtung` | `neu` | P1 | todo | Nischenfach. Kein Kassenarztsitz → HWG-Abgrenzung zu Gewerbe-Physio im Haus in S2.3 prüfen. |
| 16 | `fachrichtung-gynaekologie` | Gynäkologie | — | `fachrichtung` | `neu` | P1 | todo | Nischenfach. |
| 17 | `fachrichtung-urologie` | Urologie | — | `fachrichtung` | `neu` | P1 | todo | Nischenfach. |
| 18 | `aerzte` | Ärzte | `/arzt-team/` | `team` | `prod-seo` | P0 | todo | Ärzte-Grid als Einstieg zu den 8 Einzelprofilen. Prod-Slug `/arzt-team/` → Neu-Slug `/aerzte/` (konsistent mit `fachrichtungen/`-Plural). |
| 19 | `dr-barcsay` | Dr. Barcsay | — | `arzt` | `neu` | P1 | todo | Foto offen (HANDOFF Task 8). Platzhalter-Foto bei Go-Live zulässig (§2.5 P1). |
| 20 | `dr-seelig` | Dr. Seelig | — | `arzt` | `neu` | P1 | todo | Foto offen (HANDOFF Task 8). |
| 21 | `dr-jawich` | Dr. Jawich | — | `arzt` | `neu` | P1 | todo | Foto offen (HANDOFF Task 8). |
| 22 | `dr-shahin` | Dr. Shahin | — | `arzt` | `neu` | P1 | todo | Foto offen (HANDOFF Task 8). |
| 23 | `dr-landeberg` | Dr. Landeberg | — | `arzt` | `neu` | P1 | todo | Foto offen (HANDOFF Task 8). |
| 24 | `dr-arbitmann` | Dr. Arbitmann | — | `arzt` | `neu` | P1 | todo | Foto offen (HANDOFF Task 8). |
| 25 | `arzt-7` | Arzt 7 (TBD) | `/dr-siegbert-stracke-mba/` | `arzt` | `prod-seo` | P1 | todo | **Vermutlich Dr. Siegbert Stracke, MBA (Praxisinhaber)** — Prod-URL existiert als einziges Arzt-Profil in der Live-Sitemap. In S2.3 Batch D durch Dr. Stracke bestätigen (Spec §8 Frage 2 + §5 Folgeentscheidung Nr. 5). |
| 26 | `arzt-8` | Arzt 8 (TBD) | — | `arzt` | `neu` | P1 | todo | Name von Dr. Stracke zu bestätigen (Spec §8 Frage 2 + §5 Folgeentscheidung Nr. 5). |
| 27 | `karriere` | Karriere | — | `karriere` | `prod-seo` | P0 | done | Live auf Local WP seit v2.6.0, `template-karriere.php`. Visuelle Abnahme bestätigt, keine Content-Arbeit in Sprint 2 nötig. |

---

## Ableitungen für Folge-Sprints

### S2.2 — Template-Typologie (Häufigkeiten aus obiger Tabelle)

| Template-Typ | Anzahl | Seiten |
|---|:-:|---|
| `homepage` | 1 | #1 |
| `standard` | 4 | #2 Praxis, #3 Team, #6 Datenschutz, #7 Impressum |
| `sprechstunden` | 1 | #4 |
| `kontakt` | 1 | #5 |
| `404` | 1 | #8 |
| `fachrichtung-landing` | 1 | #9 |
| `fachrichtung` | 8 | #10–#17 |
| `team` | 1 | #18 |
| `arzt` | 8 | #19–#26 |
| `karriere` | 1 | #27 |
| **Summe** | **27** | — |

**Neue PHP-Templates, die S2.2 anlegt:** `template-standard.php` (falls nicht vorhanden), `template-sprechstunden.php`, `template-kontakt.php`, `template-fachrichtung-landing.php`, `template-fachrichtung.php`, `template-team.php`, `template-arzt.php`, `404.php`. `template-homepage.php` und `template-karriere.php` sind bereits live.

### S2.3 — Batch-Vorschlag (Prio-absteigend)

Die Prio-Verteilung erlaubt diese Batch-Reihenfolge (wird in S2.3-Batch-Specs finalisiert):

| Batch | Inhalt | Prio | Offene Folge-Entscheidungen |
|:-:|---|:-:|---|
| A | Datenschutz + Impressum (#6, #7) | P0 | Folge-Entscheidung Nr. 1 (Rechtssicherheits-Quelle) |
| B | Praxis + Team + 404 (#2, #3, #8) | P0 | — |
| C | Fachrichtungen-Landing + Ärzte-Übersicht (#9, #18) | P0 | — |
| D | Einzel-Arzt-Profile (#19–#26) | P1 | Nr. 2 (Fotos), Nr. 5 (arzt-7/arzt-8-Namen) |
| E | Innere + Allgemein (#10, #11) — Kernfächer | P1 | Nr. 4 (SEO-Keyword-Tool) |
| F | 6 Nischen-Fachrichtungen (#12–#17) | P1 | — |
| G | Sprechstunden + Kontakt (#4, #5) | P0 | Nr. 3 (Doctolib-Einbettung), Nr. 1 falls Legal-Passagen |

P0-Gesamt-Abdeckung ist über Batches A+B+C+G gegeben.

### S2.4 — Menü-Struktur (Vorschlag)

Top-Level-Navigation aus P0-Seiten ableitbar:

```
Home — Praxis — Fachrichtungen — Ärzte — Sprechstunden — Kontakt — Karriere
                    ↓                ↓
              (8 Einzelseiten)  (8 Einzelprofile)
```

Footer-Legal: Datenschutz · Impressum · 404 (404 ist nicht verlinkt, sondern Fallback).

### S2.5 — QA-Audit (gegen dieses Inventar)

Der QA-Audit prüft vor Go-Live jede P0-Zeile auf `status=done`. P1-Zeilen dürfen mit Platzhalter (Foto) oder Stub-Text (Fachrichtung) live gehen, wenn im Inventar dokumentiert.

---

## Offene Folge-Entscheidungen (Spec §5)

Übernommen aus `S2.1_page-inventory.md §5`. Blockieren S2.1 nicht; sind pro
Batch vor der jeweiligen S2.3-Spec zu klären:

| Nr. | Frage | Blockt | Referenziert in |
|---|---|:-:|---|
| 1 | Datenschutz + Impressum: Anwalt / e-recht24 / Prod-Übernahme? | S2.3 Batch A | Zeilen #6, #7 |
| 2 | Fotos der 6 offenen Ärzte: Stock-Platzhalter oder Shooting abwarten? | S2.3 Batch D | Zeilen #19–#24 |
| 3 | Doctolib-Einbettung in Sprechstunden? | S2.3 Batch G | Zeile #4 |
| 4 | SEO-Keyword-Tool (GSC / Ahrefs / Semrush / KI-basiert)? | S2.3 je Batch | alle `prod-seo`-Zeilen |
| 5 | Namen der 2 noch unbenannten Ärzte (arzt-7, arzt-8) | S2.3 Batch D | Zeilen #25, #26 |
| 6 *(neu)* | Datenschutzerklaerung-Dublette (`/datenschutzerklaerung-2/`) in Sprint 2b auflösen | Sprint 2b | Zeile #6 |

---

## Abgleich gegen Spec §8 Freigabe-Fragen

1. **Seitenliste vollständig?** 27 Einträge laut Spec §2.6 erreicht (8 Kern + 9 Fachrichtungen + 9 Ärzte + 1 Karriere). Interpretation „Team" (Kern, narrativ, Zeile #3) ≠ „Ärzte" (Grid, Zeile #18) — liefert saubere 27er-Summe.
2. **arzt-7 / arzt-8 als TBD-Flag?** Ja — Zeilen #25, #26. arzt-7 vorgefüllt mit Prod-URL Dr. Stracke (vermutungsbasiert, Bestätigung in S2.3 Batch D).
3. **Fehlende Seite entdeckt?** Die Sitemap-Prüfung (`page-sitemap.xml`, 2026-04-19) zeigt zwei potenzielle Kandidaten, die NICHT ins Sprint-2-Go-Live-Inventar aufgenommen werden (sondern Sprint 2b / Aktionsseiten):
   - `/neupatienten-new-patient-enrollment/` — Neupatienten-Formular. Kandidat für Sprint 2b (als Unterseite von Praxis oder Kontakt).
   - `/terminanfrage/` — Terminanfrage-Formular. Kandidat für Sprint 2b oder in S2.3 Batch G als Section von Sprechstunden.
   - `/arbeitsunfaehigkeit/`, `/rezeptbestellung/`, `/ein-und-ueberweisungen/`, `/corona-impfung/` etc. — alle Service-/Aktions-Seiten gehören in die 172 Legacy-Seiten (Sprint 2b). Kein Go-Live-Blocker.

Diese Auswahl folgt strikt dem Spec-Constraint §1.2 („Keine neuen WP-Pages in S2.1") und §1.2 E4c („kein Content-Crawl"). Alle Seiten aus der Sitemap, die nicht zu den §2.6-Kandidaten gehören, landen im Sprint-2b-Scope.
