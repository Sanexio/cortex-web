# Praxis-Chatbot — DSGVO-konformes Konzept

> Stand 2026-05-19 · Autor: Claude Opus 4.7 für Dr. Stracke
> Status: Konzept-Entwurf zur Diskussion (kein Code, keine Umsetzung)

---

## 1. Zweckbestimmung

Der Praxis-Chatbot ist ein **Assistenz-System für Patientenanfragen**, das
folgende Aufgaben unterstützt:

1. **Orientierung** — typische Fragen zur Praxis beantworten (Sprechzeiten,
   Standorte, Versorgungsangebot, Versicherungsstatus, Akut- vs. Routine-
   Termine).
2. **Triage-Vor-Sortierung** — Beschwerden grob einordnen und passende
   Sprechstunde / Notfall-Empfehlung vorschlagen (NICHT als Diagnose, mit
   verpflichtendem Disclaimer).
3. **Workflow-Routing** — Patient zur passenden Service-Page leiten
   (Termin, Rezept, Überweisung, Neupatienten-Anmeldung, Impfung).
4. **Mehrsprachigkeit** — DE/EN/FR/ES/IT/pt-PT analog zum Praxis-Web.

**Was der Chatbot ausdrücklich NICHT macht:**
- Keine Diagnose, keine Therapieempfehlung, keine Medikations-Beratung.
- Keine Verarbeitung von Befunden, Laborwerten, Bildgebung.
- Keine Speicherung von Patientenkontakten oder Identifikationsdaten
  über die einzelne Konversation hinaus.
- Keine Auto-Antworten an Patienten via E-Mail oder SMS.

---

## 2. Rechtsgrundlagen (DSGVO + nationales Recht)

| Aspekt                     | Norm                                     | Anwendung |
|----------------------------|------------------------------------------|-----------|
| Gesundheitsdaten           | DSGVO Art. 9 Abs. 1                      | Besondere Kategorie → grundsätzlich verboten, Ausnahmen nötig |
| Einwilligung               | DSGVO Art. 6 Abs. 1 lit. a + Art. 9 Abs. 2 lit. a | Explizite Opt-in vor Erstem Chat-Turn |
| Behandlungs-Vertrag        | Art. 9 Abs. 2 lit. h                     | Nur sobald Patient identifiziert ist (z. B. nach Login) |
| Patientenrechte            | DSGVO Art. 12–22                         | Auskunft, Löschung, Widerspruch jederzeit möglich machen |
| Datenminimierung           | DSGVO Art. 5 Abs. 1 lit. c               | Kein Name, kein Geburtsdatum, keine VersicherungsNr. im Chat |
| Speicherbegrenzung         | DSGVO Art. 5 Abs. 1 lit. e               | Default: keine Speicherung; opt-in für Verlauf max. 30 Tage |
| Auftragsverarbeitung       | DSGVO Art. 28                            | AVV mit jedem LLM-/Cloud-Anbieter Pflicht |
| Drittstaaten-Transfer      | DSGVO Art. 44–49                         | US-Cloud-LLMs nur mit SCC + zusätzliche Maßnahmen oder EU-Hosting |
| ePrivacy-Cookies           | TTDSG § 25                               | Chatbot-Session-Cookie braucht Einwilligung, falls nicht strictly necessary |
| Berufsrecht                | HBO-Hessen § 9, MBO-Ärzte                | Werbeverbot, kein Heilversprechen, keine Fern-Diagnose |
| Heilmittelwerbegesetz      | HWG § 9                                  | Keine Fern-Diagnose, kein Erkennungs-Auftrag im Chat |

---

## 3. Architektur-Optionen

Drei Varianten, vom konservativsten zur leistungsstärksten:

### Variante A — Regel-Bot (kein LLM)
**Aufbau:** Decision-Tree mit ~150 typischen Fragen → vordefinierten
Antworten + Links auf Service-Pages.

| Pro | Contra |
|-----|--------|
| Kein LLM → keine AVV-Komplexität | Sehr begrenzte Sprachverarbeitung |
| Komplett on-prem hostbar | Skaliert schlecht bei Mehrsprachigkeit |
| Keine Halluzinationen | UX wirkt mechanisch |
| Datenfluss vollständig auditierbar | Hoher Pflegeaufwand bei FAQ-Änderungen |

**Empfehlung:** als **Fallback-Layer** für Variante B oder C.

### Variante B — EU-gehostetes LLM (empfohlen)
**Aufbau:** Mistral Large (Mistral AI, Paris) oder Aleph Alpha Pharia
(Heidelberg) via REST-API; AVV mit EU-Standort.

| Pro | Contra |
|-----|--------|
| Solide Mehrsprachigkeit | Höhere Kosten als Regel-Bot |
| AVV mit DE/EU-Sitz möglich | Modell-Updates können Verhalten ändern |
| Kein Drittstaaten-Transfer | LLM-Output muss gefiltert werden (Halluzinationen) |
| Bewährt im DACH-Health-Sektor | Anbieter-Lock-in |

**Empfehlung:** Erste Implementierung.

### Variante C — On-Premise-LLM (mittelfristig)
**Aufbau:** Llama 3.x oder Mistral 7B/22B auf Praxis-eigenem GPU-Server
(z. B. Mac Studio M2 Ultra oder dedizierter Linux-Server in einer
DE-Rechenzentrum-Colocation).

| Pro | Contra |
|-----|--------|
| Maximale Datenhoheit | Hohe Investitionskosten (~10–20 k €) |
| Kein externer Datenfluss | Hoher Wartungsaufwand |
| Keine AVV nötig | Modell-Qualität hinter Frontier-Cloud-LLMs |
| Auch in Audit-Szenarien einfach zu erklären | Latenz höher ohne dedizierten GPU |

**Empfehlung:** Ziel-Architektur 2027+, wenn Nutzungs-Volumen es rechtfertigt.

---

## 4. Datenfluss (Variante B als Referenz)

```
[Browser]                  [Webserver westend-hausarzt.com]      [LLM-EU-API]
   |                                  |                                |
   | 1. Patient klickt Chat-Widget    |                                |
   |--------------------------------->|                                |
   | 2. Consent-Banner (DSGVO 9/2/a)  |                                |
   |<---------------------------------|                                |
   | 3. Patient klickt "Einwilligen"  |                                |
   |--------------------------------->|                                |
   |    Session-Token (HTTPOnly,      |                                |
   |    SameSite=Strict, 30 Min TTL)  |                                |
   |                                  | 4. System-Prompt + erste Frage |
   |                                  |------------------------------->|
   |                                  | 5. LLM-Antwort + Filter        |
   |                                  |<-------------------------------|
   | 6. Antwort im UI                 |                                |
   |<---------------------------------|                                |
```

**Schlüsseleigenschaften:**

- Frontend speichert keine Patientendaten in LocalStorage / Cookies
  (außer dem Session-Token).
- Webserver leitet Anfragen NUR mit aggregiertem Session-Kontext an LLM
  weiter; **kein Patient-Identifier, keine IP** geht an den LLM-Provider.
- Server-Logs: nur Hash der Session-ID, Zeitstempel, Token-Count;
  **kein Prompt-Inhalt, keine Antwort**.
- Opt-in für Verlaufsspeicherung (z. B. „Konversation auf späteren
  Termin verlinken"): Patient muss aktiv zustimmen, Speicherung max.
  30 Tage, dann Hard-Delete.

---

## 5. PII-Schutz / Datenminimierung

**Pre-Submit-Filter (Frontend + Backend, doppelt):**

| Pattern                             | Action |
|-------------------------------------|--------|
| Telefonnummer (DE/INTL Regex)       | Maskieren („[Telefon]") + Hinweis im UI |
| E-Mail-Adresse                      | Maskieren + Hinweis |
| Geburtsdatum (DD.MM.YYYY etc.)      | Maskieren + Hinweis |
| Versicherten-/Kassen-Nummer         | Maskieren + Hinweis |
| Vor-/Nachname (statistisch)         | Maskieren bei hoher Wahrscheinlichkeit |
| Adresse (Straße + Hausnummer)       | Maskieren |
| ICD-10, ATC, IBAN, PESEL, etc.      | Maskieren |

**Bei Match:** Chat blockiert Submit, zeigt im UI:
> „Bitte teilen Sie hier keine persönlichen Daten mit. Für persönliche
> Anfragen nutzen Sie das verschlüsselte Formular oder rufen Sie uns
> an."

**Post-Response-Filter:** LLM-Output wird auf das gleiche Pattern-Set
geprüft; falls der Bot versucht Klar-PII zu reproduzieren (durch
Prompt-Injection), wird die Antwort verworfen + neu gerendert.

---

## 6. System-Prompt-Design (Variante B)

Kernregeln, die in jedem Turn mitgegeben werden:

```
Du bist der Online-Assistent der Praxisgemeinschaft Sanexio im Frankfurter
Westend (Dr. Stracke & Kollegen). Du beantwortest organisatorische Fragen
zur Praxis (Sprechzeiten, Standorte, Versorgungsangebot, Service-Pfade).

VERBOTEN:
- Diagnose oder Therapieempfehlung
- Medikamenten-Dosierungs-Beratung
- Aussagen zu konkreten Werten (Labor, Befund, Bildgebung)
- Versprechen über Heilung oder Behandlungserfolg (HWG § 3)
- Politische, religiöse, weltanschauliche Stellungnahmen

PFLICHT:
- Bei medizinischer Beschwerde-Frage: empfehle persönlichen Termin
  oder bei Notfall die 116 117 / 112.
- Bei jeder Antwort, die organisatorisch ist: füge passenden Link auf
  praktische Service-Page bei (Terminanfrage, Rezept, Überweisung, …).
- Bei Unsicherheit: sage ehrlich "Das kann ich nicht zuverlässig
  beantworten — bitte rufen Sie unsere Rezeption an: +49 …".
- Sprache automatisch der Patientensprache anpassen (DE/EN/FR/ES/IT/PT).
- Tonalität: professionell, empathisch, Sie-Form, nicht-überfürsorglich.

FAKTEN (für jeden Turn als Kontext):
- Sprechzeiten: …
- Standorte: …
- Fachdisziplinen: …
- Notfall-Nummern: 116 117 (Ärztlicher Bereitschaftsdienst), 112 (Notruf)
```

System-Prompt wird zentral gepflegt (versioniert in Git) und nicht
patient-modifizierbar. Prompt-Injection-Hardening via:
- Klartrennung System / User per LLM-API
- Output-Filter (siehe §5)
- Regex-Blockade für „Vergiss alle vorherigen Anweisungen…"-Muster

---

## 7. UX-Integration

| Element                | Spec |
|------------------------|------|
| Trigger                | Kleines „Chat"-Icon unten rechts (analog Doctolib-FAB), Z-Index oberhalb FAB-Bar |
| Erste Aktion           | Consent-Modal mit 3 Bullet-Points + Link auf vollständige Datenschutzerklärung |
| Eingabe                | Single-Line + Multi-Line Toggle; Max. 500 Zeichen pro Turn |
| Antwort-Rendering      | Markdown unterstützt (Links + Listen); reCAPTCHA für ersten Turn |
| Sprache                | Auto-Detect via Browser-Lang, manuelles Override-Dropdown |
| Notfall-Banner         | Persistent oben: „Bei lebensbedrohlichem Notfall sofort 112 anrufen." |
| Verlauf                | Nur in-Session; Patient kann manuell „Verlauf löschen" auslösen |
| Eskalation             | Button „An Praxis weiterleiten" → öffnet Service-Form (mit vor-gefülltem Kontext, NICHT Chat-Verlauf) |
| Barrierefreiheit       | WCAG 2.1 AA: Screen-Reader-tauglich, Tastatur-Navigation, hoher Kontrast |

---

## 8. Stufenweise Einführung (Roadmap-Vorschlag)

| Stufe | Inhalt | Effort | Realistische Frist |
|-------|--------|--------|--------------------|
| **0** | Konzept-Freigabe Dr. Stracke + ggf. Datenschutz-Beauftragter | 1 Woche | 2026-05 |
| **1** | Variante A (Regel-Bot) als MVP — 50 typische FAQ + Service-Links | 3–5 Tage | 2026-06 |
| **2** | DSGVO-Dokumentation: Verarbeitungsverzeichnis-Update, Patient-Info-Blatt, ggf. DSFA | 1–2 Wochen | 2026-06 |
| **3** | Variante B (Mistral EU) Anbindung mit aggressiven Filtern + Pilot-Phase 30 Tage, Logging only zur Qualitäts-Sicherung | 2–3 Wochen | 2026-07/08 |
| **4** | Auswertung Pilot + Anpassung System-Prompt + Aufweichung Filter wo sicher | 1 Woche | 2026-09 |
| **5** | Patient-Account-Integration: Authentifizierte Chats (Art. 9/2/h) — erst sobald separate Patient-Login-Strecke existiert | 4–6 Wochen | 2027 Q1 |

---

## 9. Verarbeitungsverzeichnis (Skizze nach Art. 30 DSGVO)

| Feld                     | Wert |
|--------------------------|------|
| Verantwortlicher         | Dr. Siegbert Stracke / Praxisgemeinschaft Sanexio, Grüneburgweg 12, 60322 Frankfurt |
| Zweck                    | Patient-Orientierung über die Web-Site; keine Behandlung, keine Diagnose |
| Rechtsgrundlage          | DSGVO Art. 6 Abs. 1 lit. a (Einwilligung) |
| Datenkategorien          | Free-Text-Eingaben Patient + LLM-Antworten + Session-ID-Hash |
| Empfänger                | LLM-Anbieter (Variante B: Mistral AI, AVV gemäß Art. 28) |
| Drittland-Übermittlung   | NEIN (Mistral EU-Hosted) |
| Speicherdauer            | Standard: keine Speicherung; Opt-in: 30 Tage, dann Auto-Delete |
| Technisch-organisatorische Maßnahmen | TLS 1.3, HTTPOnly-Cookies, Pre/Post-PII-Filter, Audit-Log ohne Inhalt, Rate-Limit, reCAPTCHA |
| Löschkonzept             | Pro Session: Server-Memory wird nach 30 Min Inaktivität geleert; Logs nach 30 Tagen rotiert |

---

## 10. Risiken + Mitigation

| Risiko                                       | Mitigation |
|----------------------------------------------|------------|
| LLM halluziniert Fakten zur Praxis           | System-Prompt mit fest verankertem Fact-Sheet; Output-Filter auf bekannte Praxis-Begriffe; Retrieval-Augmented Generation (RAG) gegen kuratierten FAQ-Korpus |
| LLM gibt medizinische Empfehlung             | Pre-Output-Filter (Regex auf „nehmen Sie", „empfehle ich", „Diagnose", …); System-Prompt-Hardening |
| Prompt-Injection (Patient versucht System-Prompt zu kapern) | Klartrennung; Regex-Blockade Standard-Injection-Patterns; Output-Sanitization |
| PII-Leak (Patient gibt Daten ein, LLM-Anbieter loggt) | Pre-Submit-Filter; AVV schließt LLM-seitige Speicherung aus; Audit-Log praxis-seitig |
| Heilmittelwerbe-Vorwurf                      | Disclaimer im Consent + Footer; kein Therapieversprechen; Werbeverbots-Audit vor Go-Live |
| Datenschutz-Aufsichtsbehörde-Anfrage         | Verarbeitungsverzeichnis + DSFA bereithalten; Konzept-Dokument als Bestandteil der Akte |
| Patient erwartet 24/7-Antwort vom „Bot"      | Klare Kommunikation im UI: „Online-Assistent für Orientierung; keine Notfall-Funktion." |
| Mehrkosten LLM-API skaliert mit Traffic      | Rate-Limit pro Session + Tag; Token-Budget pro Praxis-Monat; Reporting an Praxisleitung |

---

## 11. Offene Punkte für Dr. Stracke

1. **Datenschutz-Beauftragter** der Praxis: ist eine externe DSFA gewünscht
   vor Variante-B-Go-Live? Empfehlung: ja, da Gesundheitskontext.
2. **Hosting der Persistenz-Schicht** (Sessions, Audit-Log): auf cPanel
   der Praxis-Domain oder separates EU-Hosting? Empfehlung: cPanel reicht
   für Pilot, EU-Cloud für >100 Sessions/Tag.
3. **LLM-Anbieter-Auswahl** Variante B: Mistral AI (Paris) vs. Aleph
   Alpha (Heidelberg) vs. OpenAI mit EU-AVV. Empfehlung: Mistral AI
   (etabliert + bezahlbar + Sprachenbreite stark).
4. **Eskalations-Pfad zur Praxis-Rezeption**: nur Service-Form-Vorbefüllung
   oder zusätzlich ein „Live-Chat während Sprechzeiten"-Slot über
   Praxis-MFA-Personal? Letzteres bedeutet zusätzlichen Personalaufwand.
5. **Integration mit dem geplanten Arzt-Portal** (S76): soll der Chatbot
   im eingeloggten Arzt-Bereich freigeschaltet werden mit erweiterten
   Themen (Fortbildungs-Übersicht, Kooperations-Anfragen)? Erfordert
   separater System-Prompt-Branch.

---

## 12. Vergleich mit Wettbewerbsumfeld

Kurzer Überblick existierender Praxis-Chatbots im DACH-Raum:

- **Doctolib „Doctobot"** — Termin-Bot, kein medizinischer Chat. DSGVO-konform,
  aber funktional begrenzt.
- **Ada Health** — Allgemeiner Symptom-Checker; eigenständig, nicht
  praxis-spezifisch. Erfolgreich, aber nicht für Praxis-Branding nutzbar.
- **Klara / Doctolib Messenger** — Patient-Praxis-Chat (asynchron); kein
  KI-Bot, sondern Personal-Vermittlung.
- **Symptoma-Assist** — wird in einigen Berliner Praxen pilotiert,
  Variante-B-Architektur ähnlich diesem Konzept.

Differenzierungs-Chance für Sanexio: **mehrsprachiger Bot + nahtlose
Integration ins Praxis-Web + DGSVO-First-Architektur** ist im
deutschen Markt selten.

---

*Ende Konzept-Entwurf · Folge-Schritt: Diskussion mit Dr. Stracke,
ggf. Anpassung, dann Stufe-1-Umsetzung (Variante A Regel-Bot als MVP).*
