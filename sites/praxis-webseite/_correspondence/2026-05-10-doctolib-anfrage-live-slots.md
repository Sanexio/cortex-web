# Anfrage an Doctolib — Live-Slot-Anbindung Praxis-Webseite

**Datum:** 2026-05-10
**Empfänger:** Doctolib Partner-/Integrations-Support
  - Allgemein: `support@doctolib.de`
  - Partner-Programm (falls bekannt): `partner@doctolib.de` /
    Account-Manager direkt
**Absender:** Dr. Siegbert Stracke, Westend-Hausarzt — Praxisgemeinschaft
  Dr. Stracke & Kollegen, Grüneburgweg 12, 60322 Frankfurt am Main
**Betreff:** Anfrage zur Anbindung Doctolib-Live-Verfügbarkeit auf
  unserer Praxis-Webseite (`westend-hausarzt.com`)

---

## E-Mail-Entwurf (Deutsch)

> Sehr geehrtes Doctolib-Team,
>
> wir betreiben die Praxis Dr. Stracke & Kollegen am Grüneburgweg in
> Frankfurt und sind seit mehreren Jahren über Doctolib für die
> Online-Terminbuchung erreichbar (Profil:
> `https://www.doctolib.de/gemeinschaftspraxis/frankfurt-am-main/praxis-dr-stracke-kollegen-frankfurt-am-main`).
>
> Aktuell überarbeiten wir unsere Praxis-Webseite und möchten dort pro
> Arzt den **nächsten frei verfügbaren Termin** in einem kompakten
> Element („Nächste freie Termine") anzeigen. Das Element verlinkt
> jeweils direkt in den Doctolib-Buchungsfluss des betreffenden Arztes.
>
> Ziel ist, den Patientinnen und Patienten ohne Umwege auf unserer
> Webseite zu zeigen, ob heute, in dieser oder in der nächsten Woche
> ein Slot frei ist. Die finale Buchung erfolgt selbstverständlich
> weiterhin in Doctolib.
>
> Wir würden uns freuen, von Ihnen folgende Punkte zu klären:
>
> 1. **Verfügbarkeit einer offiziellen API-Anbindung** für Praxen, die
>    den nächsten freien Slot pro Behandelnde/r abrufen möchten. Gibt es
>    ein Partner- oder Integrations-Programm, an dem wir teilnehmen
>    können? Welche Voraussetzungen (Vertrag, AVV, Mindest-Tarif) sind
>    nötig?
>
> 2. **Endpoint-Spezifikation und Authentifizierung.** Falls eine API
>    bereitsteht: bitte um die aktuelle Endpoint-URL (z. B.
>    `GET /availabilities?practitioner_id=…&start_date=today`), das
>    Authentifizierungsverfahren (Bearer-Token, OAuth) und das
>    Antwortschema (JSON-Felder für Slot-Zeitstempel, Praxis-Standort,
>    Versorgungsart).
>
> 3. **Mapping `Behandelnde/r → practitioner_id`.** Wo finden wir
>    in Doctolib die `practitioner_id` für unsere acht Ärztinnen und
>    Ärzte? Ist eine Self-Service-Übersicht vorhanden oder benötigen
>    wir eine Liste vom Support?
>
> 4. **Rate-Limits und Caching-Anforderungen.** Wie häufig dürfen wir
>    pollen? Wir würden gerne alle 5 Minuten pro Behandelnde/r anfragen
>    (8 Calls / 5 min, also 96 / Stunde) und das Ergebnis lokal cachen.
>    Ist das innerhalb der API-Policy zulässig? Falls nicht, welche
>    Frequenz und welches Caching-Modell empfehlen Sie?
>
> 5. **Webhook als Alternative.** Falls Polling nicht erwünscht ist:
>    bietet Doctolib einen Webhook-Mechanismus („slot frei geworden" /
>    „slot belegt") an, den wir abonnieren könnten?
>
> 6. **Empfohlenes Widget oder offizieller Snippet?** Falls eine
>    eigene API-Anbindung nicht vorgesehen ist: gibt es ein offizielles
>    Doctolib-Widget für die Praxis-Webseite, das die nächsten freien
>    Slots anzeigt? Wir kennen den klassischen „Termin online buchen"-
>    Button (rotes Floating-Element); diesen nutzen wir bereits. Hier
>    geht es uns um die **Anzeige der konkreten nächsten Slot-Zeit**
>    pro Arzt, ohne Klick.
>
> 7. **DSGVO / AVV.** Falls für die API ein gesonderter
>    Auftragsverarbeitungs-Vertrag nötig ist: bitte um Zusendung des
>    Vertragsentwurfs. Wir verarbeiten keine Patienten-Daten über
>    diese Schnittstelle, nur aggregierte Slot-Informationen.
>
> Technisch sind wir vorbereitet: Cron-Job mit Lock + Backoff,
> Health-Endpoint und Admin-UI für das `slug → practitioner_id`-Mapping
> sind bereits implementiert (Theme-Welle 8, 2026-05-10). Es fehlt
> ausschließlich der API-Zugang.
>
> Wir freuen uns auf Ihre Rückmeldung und stehen für ein kurzes
> Telefonat gerne bereit.
>
> Mit freundlichen Grüßen
> Dr. Siegbert Stracke
> Praxisgemeinschaft Dr. Stracke & Kollegen
> Grüneburgweg 12
> 60322 Frankfurt am Main
> Tel.: 069 247 574 523
> E-Mail: praxis@westend-hausarzt.de
> Web: westend-hausarzt.com

---

## Hintergrund (intern, nicht in die E-Mail)

- Theme-Welle 7 (Commit `78fe48e`, 2026-05-10) hat das
  Verfügbarkeits-Band scharf geschaltet, allerdings mit Mock-Daten
  (alle Behandelnden auf „today / this_week / next_week" gesetzt).
- Theme-Welle 8 (Commit `558e528`, 2026-05-10) hat den Provider-Stub
  fertiggestellt: Cron, Lock, Backoff, Health-Endpoint, WP-Admin-UI
  für das Mapping. Aktivierung erfordert nur `PXZ_DOCTOLIB_API_KEY`
  in `wp-config.php` plus Mapping-Pflege.
- Theme-Welle 11 (heute, 2026-05-10) hat das Frontend gedimmt: das
  Band rendert nur, wenn `pxz_doctolib_enabled()` true ist UND Daten
  frisch sind. Das vermeidet die irreführende Mock-Anzeige.
- Aktivierungspfad nach Doctolib-Antwort:
  1. Vertrag + API-Key beschaffen
  2. Key in `wp-config.php` als Konstante setzen
  3. WP-Admin → Online-Services → Doctolib-Mapping pflegen
  4. Endpoint-URL ggf. via Filter `pxz_doctolib_endpoint_url` an die
     real existierende API-Form anpassen
  5. Frontend wird automatisch sichtbar (Filter
     `pxz_availability_visible` greift dann implizit)

## Verwandte Dateien

- `theme/inc/online-services/availability.php` — Band-Render +
  Render-Gate `pxz_availability_visible()`
- `theme/inc/online-services/doctolib-provider.php` — Cron + Provider
- `theme/inc/online-services/doctor-cards.php` — Pillen pro Arzt-Karte
- `specs/sprint-online-services-2026/specs-external/doctolib-api.md` —
  technische Spec
