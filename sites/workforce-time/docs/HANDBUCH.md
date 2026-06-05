# Workforce-Time — Handbuch

> Generiert aus `src/help/content/` (identisch mit der In-App-Hilfe).
> Nicht direkt editieren — Kapitel ändern und `node tools/build-handbuch.mjs` ausführen.

## Inhalt

1. [Einführung](#1-einfuhrung)
2. [Anmeldung & Sicherheit](#2-anmeldung-sicherheit)
3. [Übersicht](#3-ubersicht)
4. [Kalenderwoche & Tausch](#4-kalenderwoche-tausch)
5. [Arbeitszeiten & Korrekturen](#5-arbeitszeiten-korrekturen)
6. [Urlaub & Abwesenheit](#6-urlaub-abwesenheit)
7. [Stempeluhr](#7-stempeluhr)
8. [Freigaben](#8-freigaben) *(Admin)*
9. [Mitarbeiter-Stammdaten](#9-mitarbeiter-stammdaten) *(Admin)*
10. [Lohnabrechnung & Export](#10-lohnabrechnung-export) *(Admin)*
11. [Auswertung](#11-auswertung) *(Admin)*
12. [Import & Sync](#12-import-sync) *(Admin)*
13. [Benutzer, Rollen & Einstellungen](#13-benutzer-rollen-einstellungen) *(Admin)*
14. [Häufige Fragen](#14-haufige-fragen)

---

## 1. Einführung

Willkommen zur Arbeitszeiterfassung Ihrer Praxis. Diese Anwendung bündelt Schichtplanung, Zeiterfassung, Urlaubsverwaltung und Lohnabrechnungs-Vorbereitung an einem Ort.

### Die zwei Rollen

| Rolle | Typische Nutzer | Was sie kann |
|---|---|---|
| **Mitarbeiter** | Praxisteam (z. B. MFA) | Eigene Zeiten einsehen, Schichtplan lesen, Tausch anfragen, Urlaub beantragen, Korrekturen anfragen |
| **Admin** | Praxisleitung | Alles davon, plus: Schichten planen, Freigaben erteilen, Mitarbeiter verwalten, Lohnexport, Auswertungen |

Welche Rolle Sie haben, sehen Sie oben rechts neben Ihrem Namen. Einige Kapitel dieser Hilfe betreffen nur Admins und sind entsprechend gekennzeichnet.

### Aufbau der Anwendung

- **Seitenleiste links** — die Bereiche der Anwendung (Übersicht, Kalenderwoche, Arbeitszeiten, …). Der aktive Bereich ist farblich hervorgehoben.
- **Kopfzeile oben** — Titel des aktuellen Bereichs, Ihr Benutzerkonto, der Abmelde-Knopf, die Verbindungsanzeige und bereichsspezifische Aktionen (z. B. „Aktualisieren").
- **Schnellaktionen** — über das Suchfeld in der Seitenleiste (Tastenkürzel **⌘K** bzw. **Strg+K**) erreichen Sie die wichtigsten Aktionen direkt.
- **Hilfe** — das **?**-Symbol in der Kopfzeile öffnet diese Hilfe passend zum aktuellen Bereich.

### Statusfarben verstehen

Die gesamte Anwendung nutzt ein einheitliches Farbsystem:

| Farbe | Bedeutung | Beispiele |
|---|---|---|
| **Grün (Teal)** | In Ordnung / freigegeben | Freigegebene Zeiten, voll besetzte Schichten |
| **Gelb (Amber)** | Offen / Warnung | Offene Anträge, teilbesetzte Schichten, Pausen-Warnungen |
| **Rot (Rose)** | Fehler / Konflikt | Zeitkonflikte, unbesetzte Schichten, fehlende Stempel |
| **Grau** | Entwurf / inaktiv | Entwürfe, Tage ohne Plan |

### Verbindungsanzeige

Rechts in der Kopfzeile zeigt ein Punkt den Verbindungsstatus zum Server. Ist die Verbindung gestört, werden Daten möglicherweise nicht gespeichert — versuchen Sie es später erneut oder wenden Sie sich an Ihre Praxisleitung.

---

## 2. Anmeldung & Sicherheit

Die Anmeldung funktioniert **ohne Passwort** — stattdessen mit einem Login-Link per E-Mail (Magic-Link) und einem Einmalcode aus einer Authenticator-App (TOTP). Das ist sicherer als ein Passwort, das vergessen, erraten oder weitergegeben werden kann.

### Erste Anmeldung Schritt für Schritt

1. Geben Sie Ihre **dienstliche E-Mail-Adresse** ein und klicken Sie auf **„Login-Link"**.
2. Sie erhalten eine E-Mail mit einem Login-Link. Klicken Sie ihn an — oder kopieren Sie den enthaltenen Token in das Feld **„Magic-Link-Token"** und klicken Sie **„Einlösen"**.
3. Beim allerersten Login richten Sie die **Zwei-Faktor-Bestätigung** ein (siehe unten).

> Der Login-Link ist **15 Minuten gültig** und kann **nur einmal** verwendet werden. Kommt keine E-Mail an: Posteingang und Spam-Ordner prüfen, Schreibweise der Adresse kontrollieren — und sonst die Praxisleitung ansprechen.

### Zwei-Faktor-Bestätigung einrichten (einmalig)

Nach dem ersten Einlösen zeigt die Anwendung Ihnen:

- ein **Geheimnis (Secret)** bzw. einen QR-Code für Ihre Authenticator-App,
- eine Liste von **Recovery-Codes**.

So gehen Sie vor:

1. Öffnen Sie eine Authenticator-App auf Ihrem Telefon (z. B. Apple-Passwörter, Google Authenticator, Microsoft Authenticator).
2. Scannen Sie den QR-Code oder tragen Sie das Secret manuell ein.
3. Geben Sie den angezeigten **6-stelligen Code** in das Bestätigungsfeld ein und klicken Sie **„Bestätigen"**.
4. **Wichtig:** Speichern Sie die Recovery-Codes an einem sicheren Ort (ausdrucken oder Passwort-Manager). Mit ihnen kommen Sie wieder in Ihr Konto, falls das Telefon verloren geht.

### Spätere Anmeldungen

Ab dann gilt bei jeder Anmeldung: Login-Link anfordern → einlösen → 6-stelligen Code aus der Authenticator-App eingeben. Fertig.

### Telefon verloren?

Nutzen Sie einen Ihrer **Recovery-Codes** anstelle des 6-stelligen Codes. Jeder Recovery-Code funktioniert nur einmal. Sind alle aufgebraucht oder verloren, kann die Praxisleitung Ihren Zugang zurücksetzen.

### Abmelden

Klicken Sie auf das **Abmelde-Symbol** oben rechts in der Kopfzeile. An gemeinsam genutzten Geräten (z. B. Anmeldetresen) sollten Sie sich immer abmelden.

---

## 3. Übersicht

Die **Übersicht** ist Ihre Startseite: Sie zeigt auf einen Blick, ob alles rund läuft — und wo etwas Ihre Aufmerksamkeit braucht.

### Kennzahlen (KPI-Kacheln)

Oben sehen Sie die wichtigsten Zahlen der aktuellen Woche: Schichtgruppen, erfasste Arbeitszeiten (Std:Min), Pausen-Differenzen und den Deckungsgrad der Schichtbesetzung.

### Warnungen und offene Punkte

Darunter listet die Übersicht auf, was offen ist — farblich nach Dringlichkeit:

| Anzeige | Bedeutung | Was tun |
|---|---|---|
| **Fehlende Stempel** (rot) | Geplante Schichten ohne erfasste Arbeitszeit | Zeiten nacherfassen oder korrigieren lassen |
| **Pausen-Warnungen** (rot) | Erfasste Zeiten verletzen Pausenregeln | Pausen prüfen und korrigieren |
| **Urlaubsanträge offen** (gelb) | Anträge warten auf Entscheidung | Admin: unter „Freigaben" entscheiden |
| **Zeit-Änderungsanträge** (gelb) | Korrekturwünsche warten auf Entscheidung | Admin: unter „Freigaben" entscheiden |
| **Offene Schicht-Slots** (gelb) | Geplante Schichten sind unterbesetzt | Admin: Besetzung in der Kalenderwoche ergänzen |

**Tipp:** Ein Klick auf eine Warnung springt direkt in den passenden Bereich.

### Kohärenz-Check

Der Kohärenz-Check vergleicht Schichtplan und erfasste Zeiten Tag für Tag und meldet Unstimmigkeiten (z. B. Arbeitszeit ohne Schicht oder umgekehrt). Grün heißt: Plan und Realität passen zusammen.

### Schnellanlage

Mit den Knöpfen **„Schicht"**, **„Arbeitszeit"** und **„Urlaub"** legen Sie direkt aus der Übersicht neue Einträge an. **„Aktualisieren"** lädt alle Daten neu vom Server.

---

## 4. Kalenderwoche & Tausch

Die **Kalenderwoche** zeigt den Schichtplan der Praxis — wer wann in welchem Bereich arbeitet.

### Die Wochenansicht lesen

- Navigieren Sie mit den **Pfeil-Knöpfen** zwischen den Kalenderwochen; die aktuelle KW mit Datumsbereich steht in der Mitte.
- Auf schmalen Bildschirmen wechseln Sie über **Tag-Reiter** zwischen den Wochentagen; das Wochenende lässt sich ein- und ausblenden.
- Die Zeitfenster sind farblich unterschieden (z. B. Frühdienst grün-, Spätdienst gelb-getönt).

### Besetzungsstatus der Schicht-Karten

| Rahmenfarbe | Status | Bedeutung |
|---|---|---|
| **Grün** | Vollständig | Alle Plätze der Schicht sind besetzt |
| **Gelb** | Teilweise | Es fehlen noch Zuweisungen |
| **Rot** | Unbesetzt | Noch niemand zugewiesen |
| **Grau** | Kein Plan | Für diesen Tag ist nichts geplant |

### Schichten planen (Admin)

- **„Schicht"** legt eine neue Schicht an: Tag, Zeitfenster, Arbeitsbereich, Standort und zugewiesene Mitarbeiter.
- Beim Speichern prüft die Anwendung automatisch auf **Konflikte** (z. B. Doppelbelegung einer Person oder Überschneidung mit genehmigtem Urlaub) und warnt vor dem Anlegen.
- Bestehende Schichten können bearbeitet oder gelöscht werden — Änderungen sind sofort für alle sichtbar.

### Schichttausch anfragen

Wenn Sie eine Schicht nicht übernehmen können:

1. Klicken Sie auf **„Tausch anfragen"** und wählen Sie die betroffene Schicht sowie die Kollegin/den Kollegen, mit der/dem Sie tauschen möchten.
2. Die angefragte Person sieht die Anfrage und kann sie **annehmen** oder **ablehnen**.
3. Je nach Praxisregelung bestätigt die Praxisleitung den Tausch abschließend unter **„Freigaben"**.

Eine eigene, noch offene Anfrage können Sie jederzeit **zurückziehen**.

---

## 5. Arbeitszeiten & Korrekturen

Der Bereich **Arbeitszeiten** ist das Herzstück der Zeiterfassung: Hier sehen Sie alle erfassten Zeiten als Tabelle — filterbar, sortierbar und mit anpassbaren Spalten.

### Die Tabelle bedienen

- **Reiter „Alle" / „Nur Änderungsanträge"** — schaltet zwischen sämtlichen Einträgen und den Einträgen mit offenem Korrekturwunsch um.
- **Filter** — grenzen Sie die Liste nach Standort, Arbeitsbereich, Status und Typ ein.
- **Spalten** — über den Spalten-Schalter blenden Sie Spalten ein und aus (Mitarbeiter, Start, Ende, Bereich, Standort, Status, Typ, Zeit, Pausen bezahlt/unbezahlt).
- Beim Öffnen springt die Ansicht automatisch zur **letzten Woche mit Einträgen**.

### Status eines Zeiteintrags

| Status | Farbe | Bedeutung |
|---|---|---|
| **Freigegeben** | Grün | Geprüft und bestätigt — zählt für die Abrechnung |
| **Änderungsantrag** | Gelb | Eine Korrektur wurde angefragt und wartet auf Entscheidung |
| **Konflikt** | Rot | Der Eintrag widerspricht anderen Daten (z. B. Überschneidung) und muss geklärt werden |
| **Entwurf** | Grau | Noch nicht zur Prüfung eingereicht |

### Neue Arbeitszeit erfassen

Klicken Sie auf **„Neue Arbeitszeit"** und tragen Sie Datum, Start- und Endzeit, Arbeitsbereich und Standort ein. Pausen werden getrennt nach **bezahlt** und **unbezahlt** erfasst.

### Pausen-Warnungen

Die Anwendung prüft erfasste Zeiten gegen die hinterlegten Pausenregeln (z. B. Mindestpause ab einer bestimmten Arbeitsdauer). Verstöße erscheinen als Warnung in der Übersicht und am Eintrag selbst. Prüfen Sie in dem Fall, ob die Pause vergessen wurde — und reichen Sie ggf. eine Korrektur ein.

### Korrektur anfragen

Stimmt ein Eintrag nicht (falsche Zeit, vergessene Pause, falscher Bereich)?

1. Öffnen Sie den Eintrag und klicken Sie **„Korrektur anfragen"**.
2. Tragen Sie die gewünschten neuen Werte und eine kurze Begründung ein.
3. Der Eintrag erhält den Status **Änderungsantrag**; die Praxisleitung entscheidet unter **„Freigaben"**.
4. Nach der Entscheidung sehen Sie das Ergebnis direkt am Eintrag (genehmigt → neue Werte, abgelehnt → alte Werte bleiben).

---

## 6. Urlaub & Abwesenheit

Im Bereich **Urlaub & Abwesenheit** beantragen Sie freie Tage und behalten den Überblick über Ihr Urlaubskonto.

### Antrag stellen

1. Klicken Sie auf **„Urlaub"** (auch direkt aus der Übersicht möglich).
2. Wählen Sie Zeitraum und Abwesenheitsart.
3. Der Antrag erscheint mit Status **offen** (gelb) und geht an die Praxisleitung.

### Status Ihres Antrags

| Status | Farbe | Bedeutung |
|---|---|---|
| **Offen** | Gelb | Wartet auf Entscheidung der Praxisleitung |
| **Genehmigt** | Grün | Bestätigt — die Tage sind im Kalender geblockt |
| **Abgelehnt** | Rot | Nicht bewilligt (Rückfrage bei der Praxisleitung) |

### Kalender und Überschneidungen

Der Abwesenheits-Kalender zeigt alle genehmigten und offenen Abwesenheiten des Teams. Beim Beantragen prüft die Anwendung auf **Überschneidungen** — so sehen Sie sofort, ob im Wunschzeitraum bereits Kolleginnen oder Kollegen fehlen.

### Urlaubskonto (Quota)

Die Quota-Anzeige zeigt pro Person die **verfügbaren** und **bereits beanspruchten** Tage. Genehmigte Anträge werden automatisch abgezogen.

> Genehmigter Urlaub fließt in die Schichtplanung ein: Beim Anlegen einer Schicht warnt die Anwendung, wenn die zugewiesene Person im Urlaub ist.

---

## 7. Stempeluhr

Die **Stempeluhr** ist der Kiosk-Modus für die tägliche Zeitmeldung — gedacht für ein fest installiertes Gerät (z. B. Tablet am Personaleingang).

### So stempeln Sie

1. Identifizieren Sie sich am Kiosk-Gerät (per QR-Code oder Auswahl Ihrer Mitarbeiter-Kennung).
2. Wählen Sie die passende Aktion:

| Knopf | Wirkung |
|---|---|
| **Start** | Arbeitsbeginn — die Uhr läuft |
| **Pause Start** | Beginn der Pause |
| **Pause Ende** | Ende der Pause — Arbeitszeit läuft weiter |
| **Ende** | Arbeitsende — der Eintrag wird abgeschlossen |

Die Anzeige zeigt jederzeit Ihren aktuellen Zustand (**nicht gestartet / im Gang / Pause / beendet**) und die laufende Zeit.

### Stempeln vergessen?

Kein Problem: Die fehlende oder falsche Zeit lässt sich nachträglich über den Bereich **Arbeitszeiten** klären — entweder erfassen Sie die Zeit neu, oder Sie stellen eine **Korrekturanfrage** zum bestehenden Eintrag. Vergessene Stempel erscheinen außerdem als Warnung „Fehlende Stempel" in der Übersicht.

---

## 8. Freigaben

> **Admin-Bereich** — dieser Bereich richtet sich an die Praxisleitung.

Der Bereich **Freigaben** sammelt alles, was auf eine Entscheidung wartet — an einer Stelle, statt verstreut über die Anwendung.

### Die drei Kategorien

| Kategorie | Was zur Entscheidung ansteht | Herkunft |
|---|---|---|
| **Zeit-Korrekturen** | Korrekturanfragen zu Zeiteinträgen (alte → neue Werte mit Begründung) | Bereich „Arbeitszeiten" |
| **Schichttausch** | Tauschanfragen, die beide Mitarbeiter vereinbart haben | Bereich „Kalenderwoche" |
| **Urlaub** | Offene Abwesenheitsanträge mit Zeitraum | Bereich „Urlaub & Abwesenheit" |

### Entscheiden

Jede Zeile zeigt die Beteiligten und die Details. Mit **„Genehmigen"** oder **„Ablehnen"** entscheiden Sie direkt:

- **Zeit-Korrektur genehmigt** → der Zeiteintrag erhält die neuen Werte und den Status „Freigegeben".
- **Tausch genehmigt** → die Schichtzuweisungen werden getauscht und sind sofort im Plan sichtbar.
- **Urlaub genehmigt** → die Tage sind im Kalender geblockt und fließen in die Schichtplanungs-Warnungen ein.
- **Abgelehnt** → der ursprüngliche Zustand bleibt; die antragstellende Person sieht das Ergebnis.

### Empfehlung für den Alltag

Werfen Sie **einmal täglich** einen Blick auf die Freigaben — die Übersicht zeigt die Zahl der offenen Punkte als gelbe Warnung. Vor dem Monatsabschluss (Lohnabrechnung) sollte die Liste **leer** sein, damit alle Zeiten final sind.

---

## 9. Mitarbeiter-Stammdaten

> **Admin-Bereich** — dieser Bereich richtet sich an die Praxisleitung.

Im Bereich **Mitarbeiter** pflegen Sie die Stammdaten des Teams. Jede Person erscheint als Karte mit Name, Rolle, Status (aktiv/pausiert), Wochenstunden und E-Mail-Adresse.

### Mitarbeiter anlegen und bearbeiten

Über das Stift-Symbol öffnen Sie das Bearbeitungsfenster:

| Feld | Pflicht | Hinweis |
|---|---|---|
| **Name** | Ja | Anzeigename in Plan, Zeiten und Auswertungen |
| **Rolle** | Ja | Funktionsbezeichnung (z. B. MFA, Auszubildende) |
| **Wochenstunden** | Nein | Leer = der in der Praxis-Konfiguration hinterlegte Standard gilt; Grundlage der Soll-Berechnung |
| **E-Mail** | Nein | Wird für die Zuordnung zum Login-Konto genutzt |

### Löschen — mit Bedacht

Das Papierkorb-Symbol entfernt eine Person. **Vorsicht:** Mit der Person verknüpfte Schichten, Zeiten und Auswertungen verlieren ihren Bezug. Für ausgeschiedene Mitarbeiter ist es meist besser, den Status auf **pausiert** zu setzen — so bleibt die Historie für Auswertungen und Abrechnungen erhalten.

### Zusammenhang mit dem Login

Stammdaten und Login-Konten sind getrennt: Ein neuer Eintrag hier erzeugt **kein** Login automatisch. Die Zugänge verwaltet die Praxisleitung im Bereich **Benutzer & Rollen** (siehe dortiges Kapitel); die Zuordnung läuft über die E-Mail-Adresse.

---

## 10. Lohnabrechnung & Export

> **Admin-Bereich** — dieser Bereich richtet sich an die Praxisleitung.

Der Bereich **Lohnabrechnung** bereitet die Monatsdaten für das Lohnbüro bzw. den Steuerberater auf.

### Monatsansicht

Mit den **Pfeil-Knöpfen** wechseln Sie den Monat. Die Tabelle zeigt pro Mitarbeiter die Brutto- und Netto-Minuten sowie die Pausen-Aufteilung (bezahlt/unbezahlt); unten steht die Summe der Netto-Stunden.

### Personalnummern pflegen

Für den DATEV-Export braucht jede Person ihre **Personalnummer** aus dem Lohnsystem. Fehlende Nummern meldet die Ansicht als Warnung — tragen Sie sie direkt in der Tabelle nach. Die Nummern bleiben dauerhaft gespeichert.

### Export

| Format | Verwendung |
|---|---|
| **DATEV (LODAS)** | Direkte Übergabe an das Lohnbüro / den Steuerberater |
| **CSV** | Eigene Weiterverarbeitung, z. B. in Excel/Numbers |

### Empfohlener Monatsabschluss

1. **Freigaben leeren** — keine offenen Korrekturen, Tausche oder Urlaubsanträge mehr.
2. **Übersicht prüfen** — keine fehlenden Stempel oder Pausen-Warnungen im Abrechnungsmonat.
3. **Personalnummern vollständig?** — Warnungen in der Lohnansicht beheben.
4. **Exportieren** und an das Lohnbüro übergeben.

So ist sichergestellt, dass nur geprüfte, freigegebene Zeiten in die Abrechnung fließen.

---

## 11. Auswertung

> **Admin-Bereich** — dieser Bereich richtet sich an die Praxisleitung.

Der Bereich **Auswertung** stellt Soll- und Ist-Zeiten gegenüber — für das ganze Team und für einzelne Mitarbeiter.

### Team-Monatsbericht

Pro Mitarbeiter sehen Sie die Soll-Stunden (aus den hinterlegten Wochenstunden berechnet), die tatsächlich erfassten Ist-Stunden und die Differenz. So erkennen Sie Über- und Unterstunden auf einen Blick.

### Mitarbeiter-Detailbericht

Für eine einzelne Person zeigt der Detailbericht den Monat in **Tageszeilen**: Datum, geplante Schicht, erfasste Zeiten, Pausen und Tagessaldo. Das ist die richtige Ansicht für Personalgespräche oder die Klärung einzelner Tage.

### Export

Beide Berichte lassen sich als **CSV** exportieren und z. B. in Excel/Numbers weiterverarbeiten oder ablegen.

### Woher kommt das Soll?

Das Monatssoll wird aus den **Wochenstunden** der Person berechnet (Bereich „Mitarbeiter"; ohne eigenen Wert gilt der Praxis-Standard). Stimmen Soll-Werte nicht, prüfen Sie zuerst die dort hinterlegten Wochenstunden.

---

## 12. Import & Sync

> **Admin-Bereich** — dieser Bereich richtet sich an die Praxisleitung (bzw. die technische Betreuung).

Der Bereich **Import & Sync** dient der Datenübernahme aus Altsystemen und dem Abgleich zwischen Systemen. Im Praxisalltag werden Sie ihn selten brauchen.

### Import-Arten

| Aktion | Zweck |
|---|---|
| **Delta-Snapshot importieren** | Übernimmt einen Datenbestand aus einem Altsystem/Export; bereits vorhandene Einträge werden erkannt und nicht doppelt angelegt |
| **Demo-Import** | Spielt Beispieldaten zum Ausprobieren ein — nicht in einer produktiven Umgebung verwenden |

Jeder Lauf erscheint in der **Batch-Historie** mit Zeitstempel, Status und Anzahl der übernommenen Datensätze.

### Sync-Konflikte lösen

Weichen Quelldaten und lokaler Stand voneinander ab, entsteht ein **Sync-Konflikt**. Die Konflikt-Tabelle zeigt beide Versionen nebeneinander (Quelle vs. lokal); Sie entscheiden pro Eintrag, welche Version gilt. Gelöste Konflikte wechseln den Status von **offen** zu **gelöst**.

> **Vorsicht:** Importe verändern den Datenbestand dauerhaft. Im Zweifel vorher die technische Betreuung einbeziehen — und niemals einen Import „einfach ausprobieren".

---

## 13. Benutzer, Rollen & Einstellungen

> **Admin-Bereich** — dieser Bereich richtet sich an die Praxisleitung.

### Benutzer & Rollen

Hier verwalten Sie die **Login-Konten** der Anwendung. Die Tabelle zeigt pro Konto E-Mail, Anzeigename und die aktuelle Rolle; über die Auswahlliste ändern Sie die Rolle direkt.

| Rolle | Rechte |
|---|---|
| **Admin** | Voller Zugriff: planen, freigeben, verwalten, exportieren |
| **Mitarbeiter (Employee)** | Eigene Zeiten, Plan lesen, Anträge stellen |

> Vergeben Sie die Admin-Rolle sparsam — in den meisten Praxen genügen ein bis zwei Admin-Konten.

**Abgrenzung:** Login-Konten (hier) und Mitarbeiter-Stammdaten (Bereich „Mitarbeiter") sind getrennte Dinge. Die Verknüpfung läuft über die E-Mail-Adresse; so weiß die Anwendung, welche erfassten Zeiten zu welchem Login gehören.

### Einstellungen

Der Bereich **Einstellungen** zeigt die zentrale Konfiguration Ihrer Praxis-Installation:

- **Schichtschema** — die definierten Zeitfenster (z. B. Früh-/Spätdienst) mit ihren Zeiten,
- **Standard-Wochenstunden** — der Soll-Wert, der gilt, wenn bei einer Person nichts Eigenes hinterlegt ist,
- Standorte, Arbeitsbereiche und Toleranzen.

Diese Werte werden in der **Praxis-Konfiguration** gepflegt (Konfigurationsdatei der Installation) und sind in der Anwendung bewusst nur lesbar. Änderungswünsche richten Sie an Ihre technische Betreuung.

---

## 14. Häufige Fragen

### Anmeldung

**Der Login-Link kommt nicht an.**
Spam-Ordner prüfen, Schreibweise der E-Mail-Adresse kontrollieren. Der Link ist nur 15 Minuten gültig — fordern Sie ggf. einen neuen an. Kommt weiterhin nichts an, die Praxisleitung ansprechen (Ihre Adresse muss für die Anwendung freigeschaltet sein).

**Ich habe mein Telefon (Authenticator) verloren.**
Verwenden Sie einen Ihrer Recovery-Codes anstelle des 6-stelligen Codes. Ohne Recovery-Codes kann die Praxisleitung den Zugang zurücksetzen.

**Der Login-Link wurde schon benutzt.**
Jeder Link funktioniert nur einmal. Einfach einen neuen anfordern.

### Zeiten & Plan

**Ich habe falsch oder gar nicht gestempelt.**
Im Bereich „Arbeitszeiten" den Eintrag öffnen und **„Korrektur anfragen"** — oder die fehlende Zeit neu erfassen. Die Praxisleitung bestätigt die Änderung.

**Warum steht mein Eintrag auf „Konflikt"?**
Der Eintrag widerspricht anderen Daten — meist eine zeitliche Überschneidung mit einem anderen Eintrag oder einer Schicht. Den Eintrag prüfen und ggf. eine Korrektur anfragen.

**Ich bekomme eine Pausen-Warnung, obwohl ich Pause gemacht habe.**
Vermutlich wurde die Pause nicht gestempelt oder zu kurz erfasst. Den Eintrag prüfen und die Pausenzeiten korrigieren (lassen).

**Kann ich einen Schichttausch zurückziehen?**
Ja — die eigene, noch offene Anfrage können Sie jederzeit stornieren.

### Bedienung

**Der Zurück-Knopf des Browsers führt aus der Anwendung heraus.**
Die Anwendung wechselt ihre Bereiche intern — nutzen Sie die Seitenleiste statt des Browser-Zurück-Knopfs.

**Es werden keine oder alte Daten angezeigt.**
Verbindungsanzeige oben rechts prüfen, dann **„Aktualisieren"** klicken. Hilft das nicht, einmal ab- und wieder anmelden.

**Wer kann meine Zeiten sehen?**
Die Praxisleitung (Admin-Rolle) sieht alle Daten; Kolleginnen und Kollegen sehen den gemeinsamen Schichtplan, aber nicht Ihre Zeitdetails-Auswertungen.
