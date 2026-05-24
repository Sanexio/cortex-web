# Spec — Recall-Channels: WhatsApp Business / Threema Broadcast / Email (#16)

**Status:** 📋 Spec
**Blocker:** Meta-Business-Account (WhatsApp) ODER Threema-Broadcast-Lizenz, plus DSGVO-Opt-in-Flow.

## Ziel
Saisonale Recall-Kampagnen (Grippeimpfung, Vorsorge) und individuelle
Erinnerungen (Termin morgen, Befund liegt vor) niedrigschwellig versenden.

## Empfohlene Reihenfolge

### 1. E-Mail-Recall (Sprint 1, ohne externe Vertragspartner)
- WP-CPT `pxz_recall_campaign`.
- Patient-Opt-in im Service-Form (`pxz_service_forms`-Erweiterung).
- Cron-Versand per `wp_mail` über bestehenden SMTP.
- A/B-Tracking via Open-Pixel (datensparsam, eigener Server).

### 2. WhatsApp Business (Sprint 2)
- Meta WhatsApp-Business-API via Provider (360dialog, MessageBird).
- Template-Approval bei Meta für Recall-Texte (Pflicht).
- Opt-in via Doppel-Opt-in: Form-Submit → Meta-template-Bestätigung.
- Versand-Code in `inc/online-services/recall-whatsapp.php`.

### 3. Threema Broadcast (Sprint 2 alternativ)
- DSGVO-konformer als WhatsApp (Schweiz, kein PII zu Meta).
- Threema-Work-Lizenz (~3 €/User/Monat) + Broadcast-Lizenz.
- Ein-Wege-Channel, Patient abonniert per QR.

## DSGVO
- Doppel-Opt-in pflicht.
- Widerspruch jederzeit (Footer-Link „Recall abbestellen").
- Datenminimierung: nur Patient-Hash (kein PII) im Versand-Log.

## Aufwand
- E-Mail-Recall: 1 Sprint, kein externer Blocker.
- WhatsApp: 2 Sprints + Meta-Approval (~ 2 Wochen).
- Threema: 1 Sprint + Lizenz.

## TODO
- [ ] Mit Praxis-Verwaltung klären: welche Recall-Kampagnen sind realistisch?
- [ ] DSGVO-Folgenabschätzung für Channel.
- [ ] Texte in 6 Sprachen vorbereiten (Glossar nutzen).
