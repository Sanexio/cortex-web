# Native-Quality-Review — Juristische Pflichttexte

**Erstellt:** 2026-05-04 vor Live-Push der Praxis-Webseite
**Auftraggeber:** Dr. med. Siegbert Stracke, Praxiszentrum Frankfurt Westend
**Empfänger:** Native-Speaker-Reviewer pro Zielsprache (EN, FR, ES, IT, pt-PT)

---

## Zweck dieses Dokuments

Die Praxis-Webseite `westend-hausarzt.com` erscheint in 6 Sprachen
(DE/EN/FR/ES/IT/pt-PT). Drei Texte sind juristisch verpflichtend und
unterliegen DSGVO / TMG / RStV / ärztlichem Berufsrecht in Deutschland:

1. **Datenschutzerklärung**
2. **Impressum** (im IT/pt-PT als „Note legali" / „Aviso legal" gerendert)
3. **Cookie-Richtlinie**

Die Übersetzungen wurden mit KI-Assistenz erstellt und intern auf
sprachliche Korrektheit geprüft, **nicht** durch einen muttersprachlichen
Juristen oder Native-Speaker. Vor dem Live-Push bitte ich um Ihre Prüfung
auf:

- juristische Begriffs-Korrektheit in Ihrer Sprache (DSGVO-Vokabular)
- idiomatisch-natürliche Formulierung (kein Machine-Translation-Stil)
- formelle Ansprache (Sie / vous / usted / Lei / o senhor) konsistent
- länderspezifische Erwartungen an Datenschutz-Texte

---

## Worauf NICHT reviewt werden muss (sprach-invariant)

Folgende Inhalte sollen **bewusst auf Deutsch** stehen, weil sie nach
deutschem Recht in der Originalsprache erscheinen müssen:

- **Paragrafen-Verweise:** „§ 5 TMG", „§ 55 RStV"
- **Aufsichtsbehörde:** „Landesärztekammer Hessen", „Approbiert in der
  Bundesrepublik Deutschland"
- **Rechtsform:** „Praxisgemeinschaft" (deutscher Rechtsbegriff,
  international nicht 1:1 übersetzbar)
- **Adresse:** Grüneburgweg 12, 60322 Frankfurt am Main / Bockenheimer
  Landstraße 33, 60325 Frankfurt am Main
- **Kontakt:** Telefon, Email, Praxisname „Praxiszentrum Dr. Stracke
  & Kollegen"

Bitte korrigieren Sie diese Stellen **nicht**, auch wenn sie sprachlich
auffällig wirken.

---

## Zugriffs-URLs auf Staging

**Hostname:** `gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local`
(via Tailscale, Setup-Anleitung separat)

Sobald Sie auf der Site sind, erreichen Sie die Texte:

### Datenschutzerklärung

| Sprache | URL |
|---|---|
| DE | `/datenschutzerklaerung/` |
| EN | `/privacy-policy/` |
| FR | `/politique-de-confidentialite/` |
| ES | `/politica-de-privacidad/` |
| IT | `/informativa-privacy/` |
| pt-PT | `/politica-de-privacidade-pt/` |

### Impressum

| Sprache | URL |
|---|---|
| DE | `/impressum/` |
| EN | `/impressum/?lang=en` |
| FR | `/impressum/?lang=fr` |
| ES | `/impressum/?lang=es` |
| IT | `/note-legali/` |
| pt-PT | `/aviso-legal/` |

**Hinweis EN/FR/ES:** Die URL bleibt `/impressum/` in allen vier
Sprachen — es gibt im englischen/französischen/spanischen Raum kein
direktes Äquivalent zum deutschen Impressum (in UK heißt das „Legal
Notice", in FR „Mentions légales"). Die URL behält den deutschen Slug
bewusst bei, weil ein Sprachwechsel auf englisches Vokabular erst recht
verwirrt. Inhaltlich erscheint der Text in der Zielsprache.

### Cookie-Richtlinie

| Sprache | URL |
|---|---|
| DE | `/cookie-richtlinie-eu/` |
| EN | `/cookie-policy/` |
| FR | `/politique-cookies/` |
| ES | `/politica-de-cookies/` |
| IT | `/informativa-cookie/` |
| pt-PT | `/politica-de-cookies-pt/` |

---

## Konkrete Review-Fragen pro Sprache

Bitte gehen Sie alle drei Texte in Ihrer Sprache durch und beantworten
Sie diese Fragen. Antworten gerne als Liste neben dieser Tabelle, oder
als kommentierter PDF-Export.

### Allgemeine Sprachqualität

| # | Frage | Ihre Antwort |
|---|---|---|
| 1 | Wirkt der Text in Ihrer Sprache **idiomatisch und natürlich** — oder erkennt man maschinelle Übersetzung an Wortwahl, Satzbau, Wortstellung? | |
| 2 | Ist die **formelle Ansprache** durchgängig korrekt (Sie / vous / usted / Lei / o senhor) und konsistent? | |
| 3 | Werden **medizinische Fachbegriffe** in der Praxisnehmer-passenden Form verwendet (Patient:in, Patient/Patientin, Patient·e·s …)? | |
| 4 | Stimmen **Zahlen-, Datum- und Währungsformate** mit der Konvention Ihrer Region (z. B. „1.000" vs. „1,000")? | |

### DSGVO-Fachvokabular (Datenschutzerklärung)

Bitte prüfen Sie die folgenden DSGVO-Schlüsselbegriffe auf juristische
Korrektheit in Ihrer Sprache:

| DE-Begriff | Ihre Sprache (sollte sein) | Prüfung |
|---|---|---|
| Verantwortlicher | EN: Controller / FR: Responsable du traitement / ES: Responsable del tratamiento / IT: Titolare del trattamento / PT: Responsável pelo tratamento | |
| Auftragsverarbeiter | EN: Processor / FR: Sous-traitant / ES: Encargado / IT: Responsabile / PT: Subcontratante | |
| Betroffene Person | EN: Data subject / FR: Personne concernée / ES: Interesado / IT: Interessato / PT: Titular dos dados | |
| Einwilligung | EN: Consent / FR: Consentement / ES: Consentimiento / IT: Consenso / PT: Consentimento | |
| Auskunftsrecht | EN: Right of access / FR: Droit d'accès / ES: Derecho de acceso / IT: Diritto di accesso / PT: Direito de acesso | |
| Datenschutzbeauftragter | EN: Data Protection Officer (DPO) / FR: Délégué à la protection des données / ES: Delegado de protección de datos / IT: Responsabile della protezione dei dati / PT: Encarregado da Proteção de Dados | |
| Rechtsgrundlage | EN: Legal basis / FR: Base légale / ES: Base jurídica / IT: Base giuridica / PT: Base jurídica | |
| Aufsichtsbehörde | EN: Supervisory authority / FR: Autorité de contrôle / ES: Autoridad de control / IT: Autorità di controllo / PT: Autoridade de controlo | |
| Recht auf Löschung („Recht auf Vergessenwerden") | EN: Right to erasure / FR: Droit à l'effacement / ES: Derecho de supresión / IT: Diritto alla cancellazione / PT: Direito ao apagamento | |

### Cookie-Richtlinie (technische Genauigkeit)

| # | Frage | Ihre Antwort |
|---|---|---|
| 5 | Ist die Unterscheidung **technisch notwendige Cookies** vs. **Tracking-Cookies** korrekt benannt? | |
| 6 | Werden **Drittanbieter** (Google Analytics, Doctolib, etc.) mit korrekten Firmen-Namen + Sitz-Land genannt? | |
| 7 | Ist die **Speicherdauer** (z. B. „24 Monate", „Session-Cookie") sprachlich präzise und nicht maschinell holprig? | |

### Impressum / Legal Notice

| # | Frage | Ihre Antwort |
|---|---|---|
| 8 | Werden die **deutschen Pflichtangaben** (§ 5 TMG, § 55 RStV) klar als deutsches Recht gekennzeichnet — sodass dem Leser bewusst ist, dass das ein deutsches Dokument einer deutschen Praxis ist? | |
| 9 | Ist der Begriff **„Praxisgemeinschaft"** in Ihrer Sprache angemessen erklärt (z. B. EN: „shared medical practice", FR: „cabinet de groupe", ES: „consulta compartida")? | |
| 10 | Sind **berufsrechtliche Aussagen** („Approbiert in der Bundesrepublik Deutschland", „Mitglied der Landesärztekammer Hessen") so übersetzt, dass sie für einen ausländischen Patienten verständlich werden, ohne die deutsche juristische Realität zu verfälschen? | |

### Länderspezifisches

| Sprache | Spezifische Frage |
|---|---|
| EN | Sind UK-spezifische Datenschutz-Begriffe verwendet (PECR, ICO) — oder sollten allgemeine EU-DSGVO-Begriffe stehen, weil die Praxis sich an internationale Patienten in Deutschland richtet? |
| FR | Verwendet der Text das Vokabular der CNIL (französische Datenschutzbehörde) — oder bleibt er bewusst auf EU-DSGVO-Niveau? Ist die geschlechter-inklusive Schreibweise („patient·e·s") konsistent? |
| ES | Stilebene formell-iberisch (España) — und nicht lateinamerikanisch? Begriffe wie „cita previa" / „medicina general" korrekt? |
| IT | Verwendet der Text die formelle Anrede „Lei" durchgängig (statt „tu" / „voi")? GDPR-Begriffe nach italienischer Garante-Privacy-Konvention? |
| pt-PT | Stilebene **europäisches** Portugiesisch (nicht brasilianisch): „autocarro" statt „ônibus", „casa de banho" statt „banheiro", durchgängige Verwendung des kontinentalen Akzents. CNPD-konforme Datenschutz-Vokabular? |

---

## Rückmelde-Format

Bitte senden Sie Ihre Anmerkungen an `stracke.md@me.com` zurück, gerne in
einem dieser Formate:

- **PDF mit Kommentaren** (am einfachsten — markieren Sie Stellen direkt im Text)
- **Tabelle** mit Zeilennummer, Original-Wortlaut, Vorschlag-Wortlaut, Begründung
- **Markdown-Datei** mit denselben Spalten

Wichtig: Bei jeder Korrektur eine kurze **Begründung** — damit ich
zwischen "Stilfrage" und "juristisch falsch" unterscheiden kann.

**Frist:** Möglichst bis **2026-05-XX** (eintragen) — Live-Push danach.

---

## Hintergrund (für Reviewer optional)

Die Praxis ist eine internistische Schwerpunktpraxis im Frankfurter
Westend mit Fokus auf internationale Patient:innen. Die Mehrsprachigkeit
ist ein zentrales Versprechen — daher die Sorgfalt bei der Qualität der
Übersetzungen. Englisch und Französisch werden täglich in der Praxis
gesprochen, Spanisch häufig, Italienisch und Portugiesisch gelegentlich.

Bei Rückfragen erreichen Sie mich unter `stracke.md@me.com`.

— Dr. med. Siegbert Stracke
