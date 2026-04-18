# praxis-web — Workflow-Checklisten

Standard-Ablaeufe fuer wiederkehrende Aufgaben. Jede Checkliste ist vollstaendig durchzuarbeiten.

---

## WF-1: Neue Seite anlegen

- [ ] Content-Briefing in `praxis-web/Input/` ablegen (Titel, Text, Bilder, SEO-Ziel)
- [ ] Slug und Menue-Position festlegen
- [ ] Seite via REST-API erstellen (Draft-Status zuerst)
- [ ] Bilder aus `_shared/media/` in WP-Mediathek hochladen
- [ ] SEO-Meta (Yoast/RankMath) setzen
- [ ] Mobile-View pruefen (Chrome-DevTools)
- [ ] Von Draft auf Publish wechseln
- [ ] In `CHANGELOG.md` dokumentieren

## WF-2: Bestehende Seite umbauen

- [ ] URL der Zielseite notieren
- [ ] Aktuellen Zustand via REST-API als Backup-JSON in `praxis-web/exports/` sichern
- [ ] Aenderung in Staging oder als Draft-Revision auf Live
- [ ] Cross-Browser-Check (Chrome, Safari, Firefox Mobile)
- [ ] Live-Deploy
- [ ] In `CHANGELOG.md` dokumentieren

## WF-3: Theme-Reparatur

- [ ] Problem beschreiben (Screenshot, Browser, Reproduktions-Schritte)
- [ ] Lokales Staging aktuell (letzter Pull von Live < 7 Tage)
- [ ] Betroffene Theme-Datei identifizieren
- [ ] Git-Commit vor Edit ("Pre-fix: <Problem>")
- [ ] Fix implementieren, lokal testen
- [ ] Git-Commit nach Fix ("Fix: <Problem>")
- [ ] Diff zu Live-Version vor Deploy pruefen
- [ ] Deploy auf Live via SFTP
- [ ] Live-Verifizierung in 3+ Browsern
- [ ] `FEHLERPROTOKOLL.md` ergaenzen, falls wiederverwendbare Erkenntnis

## WF-4: Plugin-Update

- [ ] Staging: Plugin-Update durchfuehren
- [ ] Funktionsregression pruefen (Forms, Kontakt, Termine etc.)
- [ ] Bei Fehler: Rollback via Git-State der Staging-Site
- [ ] Bei Erfolg: Domainfactory-Backup ausloesen
- [ ] Plugin-Update auf Live
- [ ] Sofortige Live-Verifizierung

## WF-5: Live → Staging resync

- [ ] Duplicator auf Live: Archive erzeugen
- [ ] Archive + Installer lokal downloaden
- [ ] Local by Flywheel: Site zuruecksetzen, Duplicator importieren
- [ ] URL-Search-Replace (westend-hausarzt.com → .local)
- [ ] Login-Check
- [ ] Git-State im Theme-Ordner commiten ("Sync from Live YYYY-MM-DD")
