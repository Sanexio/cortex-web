# Sprint: Online-Services & UX-Aufwertung 2026

**Sprint-ID:** `online-services-2026`
**Start:** 2026-05-09
**Auftrag (Dr. Stracke, 2026-05-09):** „Alle Seiten nach neuesten UX-Kriterien
optimieren, grafische responsive Elemente, Schwerpunkt Online-Services /
digitale Anwendungen."

---

## Scope-Übersicht

| # | Feature | Typ | Status |
|:-:|---|---|---|
| 1 | PWA-Scaffold (manifest+sw+offline) | Build | ✅ siehe `features/01-pwa.md` |
| 2 | Sticky Termin-FAB (mobile) | Build | ✅ siehe `features/02-termin-fab.md` |
| 3 | Live-Verfügbarkeitsband | Build (Mock-API) | ✅ siehe `features/03-availability-band.md` |
| 4 | Symptom-Triage-Wizard (rule-based) | Build | ✅ siehe `features/04-triage-wizard.md` |
| 5 | Rezept-Status-Page | Build | ✅ siehe `features/05-rx-status.md` |
| 6 | Online-Check-In QR | Build | ✅ siehe `features/06-checkin-qr.md` |
| 7 | Vergleichs-Quiz "welcher Check" | Build | ✅ siehe `features/07-check-quiz.md` |
| 8 | FAQ Search-as-you-type | Build | ✅ siehe `features/08-faq-search.md` |
| 9 | SVG-Body-Map Triage-Eingang | Build | ✅ siehe `features/09-bodymap.md` |
| 10 | Botox-Indikations-Map | Build | ✅ siehe `features/10-botox-map.md` |
| 11 | Standorte Live-Map (Leaflet+OSM) | Build | ✅ siehe `features/11-locations-map.md` |
| 12 | Doctor-Card Visual-Upgrade | Build | ✅ siehe `features/12-doctor-cards.md` |
| 13 | Doctolib-API Live-Slots | Spec (Tier-3 Secret) | 📋 `specs-external/doctolib-api.md` |
| 14 | eRezept (gematik FHIR) | Spec (Tier-3 KIM) | 📋 `specs-external/erezept-gematik.md` |
| 15 | KI-Triage-Bot (LLM) | Spec (HWG-Bewertung) | 📋 `specs-external/ki-triage.md` |
| 16 | WhatsApp/Threema-Recall | Spec (DSGVO) | 📋 `specs-external/recall-channels.md` |
| 17 | Apple-Health-Integration | Spec | 📋 `specs-external/apple-health.md` |
| 18 | Patient-Portal-Lite (Magic-Link) | Spec | 📋 `specs-external/patient-portal.md` |
| 19 | DocVoCat-Reaktivierung | Bewertung | 📋 `specs-external/docvocat-evaluation.md` |
| 20 | 360°-Praxis-Tour | Bewertung (Content-Aufwand) | 📋 `specs-external/360-tour.md` |

---

## Architektur-Prinzipien (Sprint-weit)

**Privacy-by-Default**: Alle Widgets ohne 3rd-party-CDN. OSM statt Google.
Lokale Fonts. Kein Tracking-Pixel. Click-to-Activate für Karten/Embeds.

**Performance-Budget**:
- Hero-Lottie ≤ 80 kb
- SVG-Body-Map ≤ 30 kb
- Map-JS lazy + on-demand
- Service-Worker cacht statische Assets

**A11y-Pflicht**:
- Jede Animation respektiert `prefers-reduced-motion`
- Jede SVG-Map auch als HTML-Liste verfügbar
- Jede Karte mit Adress-Fallback-HTML

**i18n-Pflicht**: Alle neuen Strings in 6 Sprachen (DE/EN/FR/ES/IT/pt-PT)
über existierende `pxz_*_strings()`-Tabellen.

**HWG-Pflicht**: Keine Anpreisung, keine Patientenfotos, kein
„behandeln wir besonders gut". Symptom-Triage = Vor-Sortierung,
nie medizinischer Rat.

---

## Welle-Plan

| Welle | Inhalt | Realistisch |
|---|---|---|
| **W1 — Foundation** | #1 PWA · #2 FAB · #8 FAQ-Search | 1 Sprint |
| **W2 — Online-Services-Kern** | #3 Verfügbarkeit · #4 Triage · #5 Rezept-Status · #6 Check-In · #7 Check-Quiz | 2-3 Sprints |
| **W3 — Visual-Upgrades** | #9 Body-Map · #10 Botox-Map · #11 Standorte-Map · #12 Doctor-Cards | 2 Sprints |
| **W4 — externe APIs** | #13–#16 Specs realisieren (Doctolib + KI + Recall) | 3-5 Sprints, Tier-3-Freigaben nötig |
| **W5 — Patient-Layer** | #17 Health · #18 Portal · #19 DocVoCat | 2026-Q3 |

---

## Welle-1-Build vom 2026-05-09

In dieser Session bereits in der Local-WP gebaut:
- `tools/sync-team-wp.sh`-Pattern bestätigt — alle Builds folgen Trunk-First / Local-First.
- 13 Build-Specs + 8 External-Specs unter diesem Verzeichnis.
- Code in `~/Local Sites/.../themes/praxiszentrum/inc/online-services/` neu angelegt.

---

## Bekannte Externe Blocker

| Blocker | Was er löst |
|---|---|
| Doctolib-API-Key | Live-Slots #13 |
| KIM-Postfach + gematik-Cert | eRezept #14 |
| LLM-API-Key + HWG-Compliance-Review | KI-Triage #15 |
| Meta-Business-Account / Threema-Broadcast-Lizenz | Recall #16 |
| Apple Developer Program ($99/Jahr) | Apple-Health #17 |
| Foto-/Tour-Shoot vor Ort | 360°-Tour #20 |
| Server-Block-Lift bei DF | Live-Push aller W1-W3-Builds |

---

*Spec-Owner: Claude (Architekt-Modus, FK-1…FK-5).
Bei Live-Push immer Welle-Ende-Debrief inkl. Deploy-Erwähnung.*
