# Sprint 2 — Kernseiten-Ausbau + Design-System (vorgezogen)

**Status:** Grobskizze 2026-04-18. Detaillierte Teilschritt-Specs (S2.x) werden in der nächsten Session vor Umsetzung geschrieben, gemäß `_rules/WORKING_MODE.md` Architekten-Modus.

**Warum vorgezogen:** Sprint 1 ist seit 2026-04-18 pausiert (DF-Support angefragt, SFTP-Credentials fehlen). Design + Content kann parallel vollständig auf Local entstehen, ohne DF-Abhängigkeit.

---

## Ziel des Sprints

Nach Sprint 2 existiert auf Local eine reviewfähige, im neuen Design konsistente Kernwebsite (mindestens 8 Seiten), aufgebaut auf zentralem Design-Token-System, zur Browser-Abnahme durch Dr. Stracke bereit.

## Globale Constraints

- Keine Live-Änderung auf Prod (`.com`).
- `tools/verify.sh` erweitert sich um jede neue Page-Registry-Entry, bleibt grün.
- Kein Abhängigkeits-Breaking bei Homepage v2.7.4 und Karriere v2.6.0 (beide bleiben funktional + optisch identisch).
- Alle neuen Seiten verwenden zentrale Design-Tokens, nicht hart-codierte Werte.
- Sprachen: vorerst nur DE; Mehrsprachigkeit kommt in Sprint 3.

## Geplante Teilschritte

### S2.0 — Design-Token-SSoT (Vorbedingung, ehem. Sprint 0 / S0.3)

**Warum zuerst:** Jede neue Seite würde sonst eigene Farb-, Abstands- und Typo-Werte redeklarieren — Sprint-2-Seitenzahl multipliziert die Aufräumschuld.

**Geplant:**
- Neue Datei `assets/css/tokens.css` mit allen `--pxz-*` Custom Properties auf `:root`
- Neue Datei `assets/css/components.css` mit wiederverwendbaren Komponenten (`.pxz-card--dark`, `.pxz-section`, `.pxz-eyebrow`, `.pxz-btn`)
- `homepage.css` + `karriere.css` lesen die Tokens (nur Referenz, keine Redeklaration)
- Kein Breaking-Refactor der bestehenden Klassen — nur Token-Umleitung

**Akzeptanzkriterien:** Computed-Style-Probe für Home + Karriere zeigt identische Werte wie vor S2.0. Neue Seiten können Tokens durch reine Referenz `var(--pxz-…)` nutzen.

### S2.1 — Seiten-Inventar & Content-Audit

**Geplant:**
- Liste der Muss-Seiten (Legal + Content) mit Referenz auf Prod `.com`
- Pro Seite: Content-Quelle (bestehend bei `.com` / neu von Dr. Stracke) + Priorität
- Dokumentation in `specs/sprint-2/page-inventory.md`

**Kandidaten (vorläufig):**
- Praxis (Über uns, Vision, Werte)
- Team (Übersicht + Einzelseiten für 8 Ärzte)
- Sprechstunden (Öffnungszeiten, Kassen-Info, Terminbuchung)
- Fachrichtungen (Landing + Einzelseiten pro Fachrichtung, 8 Stück)
- Kontakt (Formular + Standorte-Details)
- Datenschutz (Pflicht DSGVO)
- Impressum (Pflicht TMG)
- 404-Fallback

### S2.2 — Template-Typologie

**Geplant:** Für wiederkehrende Seitentypen je ein PHP-Template:
- `template-standard.php` — generische Textseite (Praxis, Datenschutz, Impressum, 404)
- `template-fachrichtung.php` — Single-Fachrichtung mit Einleitung, Leistungen, Team-Block
- `template-team.php` — Ärzte-Übersicht
- `template-arzt.php` — Einzel-Arzt-Profil
- `template-kontakt.php` — Standorte + Formular

### S2.3 — Implementierung Kernseiten

**Strategie:** Batches à 2–3 Seiten mit Verify-Lauf zwischen Batches.

Reihenfolge (vorläufig):
1. Batch A: Datenschutz + Impressum (Legal-Pflicht, reine Textseiten, geringes Design-Risiko)
2. Batch B: Praxis + Kontakt
3. Batch C: Team-Übersicht + 2 Arzt-Einzelseiten (Muster)
4. Batch D: Restliche 6 Arzt-Einzelseiten
5. Batch E: Fachrichtungen-Landing + 2 Einzel-Fachrichtungen (Muster)
6. Batch F: Restliche Fachrichtungen
7. Batch G: Sprechstunden + 404

### S2.4 — Menü „Hauptnavigation" befüllen

WP-Admin: Alle neuen Seiten in die Hauptnavigation aufnehmen. Dropdown-Strukturen für Team + Fachrichtungen.

### S2.5 — QA-Audit

Gegen `DESIGN_GUIDELINES.md` §13–§16 und Anti-Patterns §15. Nur reine Designregel-Befolgung — keine Inhalts-Änderungen in diesem Schritt.

---

## Abhängigkeiten und offene Entscheidungen (für die nächste Session)

| Nr. | Frage | Blockt Schritt |
|---|---|---|
| 1 | Welche Content-Quellen nutzen wir? (Prod-Texte übernehmen? Neu texten? Mix?) | S2.1 |
| 2 | Wer schreibt Datenschutz + Impressum rechtssicher? (Anwalt / Generator / Prod-Version übernehmen) | S2.3 Batch A |
| 3 | Sollen die echten Fotos der 6 offenen Ärzte vorher besorgt werden, oder mit Platzhaltern starten? | S2.3 Batch D |
| 4 | Wird Terminbuchung (Doctolib o.ä.) in Sprechstunden-Seite eingebettet? | S2.3 Batch G |

Diese werden in der nächsten Session vor Beginn von S2.1 geklärt.

---

## Welle-Specs in diesem Sprint (parallel zu S2.x)

Während Sprint 2 lief, sind übergreifende Wellen entstanden, die ihre eigenen Spec-Dokumente in diesem Verzeichnis haben. Index zur Übersicht:

| Welle | Datei | Status | Inhalt |
|---|---|---|---|
| **F** | [`F_phase-B_live-deploy.md`](F_phase-B_live-deploy.md) | ✅ abgeschlossen 2026-05-06 | WP-Live-Migration auf `westend-hausarzt.de` (Staging mit Basic-Auth) |
| **γ (gamma)** | [`gamma_trunk-first-i18n-migration.md`](gamma_trunk-first-i18n-migration.md) | 📋 geshelved bis nach Welle F | WPML-Ablösung durch Trunk-i18n (315 Übersetzungen) |
| **H** | [`H_cleanup-vor-deploy.md`](H_cleanup-vor-deploy.md) | ✅ abgeschlossen 2026-05-05 | DB-/Plugin-/Theme-/Page-Cleanup vor Live-Deploy |
| **J** | [`J_pre-launch-security-hardening.md`](J_pre-launch-security-hardening.md) | ✅ abgeschlossen 2026-05-07 | Pre-Launch-Hardening (`.git/`, `error_log`, `.htaccess` schließen) — Verify-Suite 21/21 grün |
| **K** | [`K_com-go-live.md`](K_com-go-live.md) | 🟡 spec-only (kein Datum) | `.com`-Go-Live als Local→`.com`-Push (Modell A, Local=Master). Eigener `.com`-DocRoot, kein DNS-Switch nötig. Blocker: Polish-Phase + `SFTP_COM_*`-Credentials + L-1/L-2. Verify-Suite via `tools/pre-launch-verify.sh --target=com`. |

**Page-Inventar:** [`page-inventory.md`](page-inventory.md) — Source-of-Truth für Page-Bestand und Sprache-Map.

**Reihenfolge der Wellen (zeitlich):** H (Cleanup) → F-1/F-2/F-Phase-A/F-Phase-B (Live-Migration) → I (PXZ-E-010-Polish, ohne Spec, nur in Commits) → J (Hardening, jetzt) → K (Go-Live). γ läuft erst nach K als eigene Welle.
