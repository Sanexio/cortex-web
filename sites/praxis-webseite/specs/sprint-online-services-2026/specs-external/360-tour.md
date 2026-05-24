# Spec — 360°-Praxis-Tour (#20)

**Status:** 📋 Bewertung
**Blocker:** Foto-/Tour-Shoot vor Ort + Hosting-Kosten.

## Ziel
Vertrauensaufbau für Erstpatienten. Vor Termin sehen, wie die Praxis aussieht.

## Optionen

### A) Matterport (kommerziell, 200–600 € einmalig)
- Profi-Anbieter mit Specialist-Kamera.
- Sehr hochwertig, eingebettet als iframe.
- Hosting via Matterport-Cloud (~10 €/Monat).
- DSGVO: Daten auf US-Servern, AVV nötig.

### B) Apple-Vision-Pro / iPhone Pro (eigene Aufnahme)
- iPhone 15 Pro hat Räume-Erkennung („Spatial Photos").
- Insta360-Kamera (350 € Hardware) + freie Tour-Software (Marzipano, Pano2VR).
- Self-Hosted, keine Drittanbieter.
- Aufwand: 1 Nachmittag Foto + 1 Sprint Setup.

### C) Statische Galerie mit gestaltvoller Foto-Auswahl
- 8–12 Profi-Fotos der Praxis (Empfang, Wartezimmer, Behandlungsräume).
- Lightbox-Galerie.
- Niedrigster Aufwand, höchste Reliability.

## Empfehlung
**Variante C** (Galerie) zuerst — geringer Aufwand, hoher Quality-Sprung
gegenüber „nichts". Variante B (eigene 360°-Tour) als Phase 2.

## DSGVO
- Vor Aufnahme: alle Mitarbeitenden informieren, Einverständnis dokumentieren.
- Keine Patienten in Fotos.
- Praxisräume erkennbar, aber keine Patientenakten / Schilder mit Namen.

## TODO
- [ ] Foto-Termin mit lokalem Praxis-Fotografen (z. B. Frankfurter Spezialisten für Praxis-Fotografie).
- [ ] Bildauswahl (8–12) durch Dr. Stracke + Team.
- [ ] Galerie-Implementation: existierender Slider erweitern oder neue Page `/praxis/einblicke/`.
