# Greenfield-Reset — Konzept

> Spec angelegt: 2026-05-05 nach Strategie-Entscheidung Dr. Stracke
> ("Option A jetzt — parallel Greenfield-Aufbau planen").
> Status: Konzept (Phase Verständnis + Lösungsdesign abgeschlossen).
> Abhängigkeit: Welle H (Cleanup vor Live-Deploy) muss vorher abgeschlossen sein,
> damit die aktuelle Instanz als Übergangs-Live geht und nicht unter Zeitdruck steht.

---

## 1. Leitidee — Trunk-Prinzip ist die Antwort

Die strategische Frage „neue Seite oder gereinigte Seite?" hat in einer Trunk-Architektur
eine dritte Antwort: **Beides.**

Der Trunk (`Cortex-Web/trunk/`) ist seit Phase 0 als Single Source of Truth definiert
(CW-001). Eine WP-Instanz ist in dieser Architektur kein Original, sondern ein
**Render-Target** — austauschbar wie ein Drucker, der dieselbe PDF zweimal druckt.

Das bedeutet konkret: Eine zweite, jungfräuliche WP-Instanz ist nicht „eine neue
Webseite bauen", sondern „den Trunk auf ein zweites Render-Target ausrollen".
Inhalte, Struktur, Design entstehen nicht neu — sie werden aus dem Trunk
reproduziert. Was neu entsteht, ist nur die **Hülle** (Plugins, DB, WP-Core).

### Konsequenz für die Strategie-Entscheidung

| Schritt | Was passiert | Plattform |
|---------|--------------|-----------|
| **Welle H** (jetzt) | Cleanup der aktuellen Instanz | bestehende WP |
| **Welle F** (nach H) | Übergangs-Seite geht live (Domainfactory) | bestehende WP, bereinigt |
| **GR-Phase** (parallel) | Greenfield-Bootstrap + POC-Validierung | zweite WP (Local + später Live) |
| **GR-Cutover** (später) | DNS-Schwenk: Live-Domain auf Greenfield-Instanz | Greenfield wird produktiv |

Der Cutover (GR-Cutover) ist im Greenfield-Pfad ein einziger Adapter-Run gegen eine
neue Live-Instanz plus DNS-Wechsel — kein Re-Aufbau, kein Re-Übersetzen, kein
Re-Design. Die Substanz lebt im Trunk.

---

## 2. Architektur — was bereits existiert, was fehlt

### Bereits etabliert (S70 + sA + sB + sC + sD + G3-Voll)

- **Trunk-Inhalte:** 27 Untersuchungs-/Labor-YAMLs auf 6 Sprachen (DE/EN/FR/ES/IT/pt-PT) plus Doctor-Bios in `inc/team-strings.php`, Glossar, Trunk-Renderer.
- **Theme-Repo:** `praxiszentrum` PXZ 2.7.170 mit page-hub-Renderer, sprach-aware Templates, i18n-Helper.
- **Content-Adapter:** `adapters/wordpress/content-to-wp-pages.mjs`, `team-to-wp.mjs`, plus die 9 Pattern-Gen-2.3-Skripte (`sA-luecken-bulk.php`, `sB-it-bulk.php`, `sC-pt-bulk.php`, etc.). Idempotent, 0-Error-validiert.
- **WPML-Pattern:** Klasse-A-Volltext / Klasse-B-Bridge mit DE-Content embedded, Trid-Resolution-Helper, Cleanup-Logik für Doubletten und WPML-Auto-Hook-Bug-Workaround.

### Was für Greenfield zusätzlich gebaut werden muss

Ein **Bootstrap-Layer** vor dem Content-Adapter. Aktuell setzt der Content-Adapter
voraus, dass die WP-Instanz bereits steht (Plugins aktiv, WPML konfiguriert, Theme
aktiviert, Sprachen angelegt). Auf einer leeren WP-Instanz funktioniert das nicht.

Bootstrap-Layer = ein Skript, das aus einem deklarativen **Bootstrap-Manifest** eine
leere WP-Instanz auf den Stand bringt, an dem der Content-Adapter ansetzen kann.

---

## 3. Bootstrap-Manifest — Inhalt

Pfad: `sites/praxis-webseite/_bootstrap/manifest.json` (anzulegen in GR-1)

| Block | Inhalt | Implementierung |
|-------|--------|-----------------|
| **wp-core** | Version, Locale (de_DE), Site-Title, Tagline, Permalink-Struktur (`/%postname%/`), Timezone (Europe/Berlin) | `wp core install` + `wp option update` |
| **plugins** | Whitelist + Versions-Pins. Pflicht: WPML-Bundle (sitepress-multilingual-cms, wpml-string-translation, wpml-media-translation, otgs-installer-plugin), wpforms-lite, safe-svg, wp-mail-smtp. Optional: akismet | `wp plugin install --version=X` + `wp plugin activate` |
| **theme** | `praxiszentrum` aktivieren (Parent `blocksy` muss vorhanden sein) | `wp theme activate praxiszentrum` |
| **wpml** | 6 Sprachen aktivieren (de=Default, en, fr, es, it, pt-pt), Language-URL-Format (Lokal: Mode 3 Verzeichnis / Live: Mode 1 Sprach-Subdomain je nach Hosting), String-Translation-Setup, Media-Translation-Setup | `wp wpml language activate ...` + DB-Direkt-Schreiben für Edge-Cases |
| **menus** | Header-Menü + Footer-Menü — kommen automatisch über bestehenden PHP-Code (`inc/nav-data.php`, `footer-data.php`). Kein Manifest-Eintrag nötig | aus Theme automatisch |
| **users** | Admin-Account (Username, Passwort via Env-Variable, niemals im Manifest). Editor-Account optional | `wp user create` |
| **options** | Reading-Settings nach Content-Sync (Frontpage-ID auf `home`-Page setzen) | nach Content-Adapter-Run |

---

## 4. Adapter-Erweiterung

Neuer Eintrittspunkt: `adapters/wordpress/bootstrap.mjs`

```
bootstrap.mjs <target-instance>
  ↓
  1. wp-cli verbindet sich mit Ziel-Instanz
  2. Lese manifest.json
  3. Validate Schema (CW-002)
  4. Apply wp-core Settings
  5. Install + Activate Plugins (mit Versionspin)
  6. Activate Theme
  7. WPML-Bootstrap (Sprachen, Mode, Translation-Setup)
  8. Create Users
  9. Smoke-Test: wp-Admin erreichbar, Sprachen aktiv
  ↓
  → Übergabe an content-to-wp-pages.mjs (bestehender Adapter)
  → Übergabe an team-to-wp.mjs
  → Übergabe an Pattern-Gen-2.3-Bulk-Skripte für Übersetzungen
  ↓
  10. Visual-Diff-Probe (Puppeteer) gegen Referenz-Instanz
```

Die Punkte 1–9 sind neu (Welle GR-1). Punkte ab Übergabe sind bereits vorhanden und
9× validiert. Punkt 10 ist Erweiterung des bestehenden `tools/verify.sh` /
`probe-design.mjs`-Patterns.

---

## 5. POC-Plan (Welle GR-2)

**Ziel:** Reproduzierbarkeit beweisen. Eine zweite Local-by-Flywheel-Instanz wird
ausschließlich per Bootstrap + Adapter aufgesetzt; Ergebnis muss visuell und
strukturell deckungsgleich mit aktueller Instanz sein.

**Schritte:**

1. Neue leere Local-Site `gpmedicalcenterwestend-greenfield-poc` anlegen.
2. `bootstrap.mjs` laufen lassen, Logs erfassen.
3. Content-Adapter laufen lassen (`content-to-wp-pages.mjs` + `team-to-wp.mjs` + alle Pattern-Gen-2.3-Skripte).
4. Smoke-HTTP (`tools/smoke-http.sh`) gegen 63 Pages × 6 Sprachen = 378 URLs.
5. Visual-Diff (Puppeteer) Stichprobe: 10 Pages × 6 Sprachen = 60 Screenshots, Vergleich gegen aktuelle Instanz mit Pixel-Threshold.
6. WPML-Trid-Vergleich: identische Trid-Struktur für alle Familien?

**Erfolgs-Kriterium:** Visual-Diff < 0.5 % Pixel-Abweichung (kleine Cache-Header-
Unterschiede sind normal). Trid-Struktur identisch oder semantisch äquivalent
(Trid-Werte selbst dürfen variieren, Familien-Gruppierung muss gleich sein).

**Erwarteter Aufwand:** ~1 Welle (3–4 Std) für Skript-Bau, ~1 Stunde für POC-Lauf
und Diff-Auswertung.

---

## 6. Risiken

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|:-:|------|
| WPML-Lizenz-Aktivierung auf neuer Instanz scheitert (Token, Domain-Limit) | mittel | Im Bootstrap-Manifest Lizenz-Token via Env-Variable, OTGS-Account-Limit prüfen (idR 1 Live + N Dev erlaubt) |
| WPML-Sprach-Mode lokal (Mode 3) ≠ live (Mode 1) führt zu unterschiedlichen URLs | klein | Bootstrap-Manifest hat Per-Environment-Override (`local.json` + `live.json` Layer) |
| Plugin-Version-Drift (WPML-Updates ändern DB-Schema zwischen Bootstrap und Live-Cutover) | mittel | Versions-Pin im Manifest, manuelle Freigabe für Plugin-Updates, Pre-Cutover-Re-Validation Pflicht |
| Customizer/Theme-Settings unvollständig im Manifest | mittel | Im Rahmen GR-1 explizites Audit der `wp_options`-Keys mit Prefix `theme_mods_praxiszentrum`, Übernahme ins Manifest |
| Visual-Diff-Threshold zu strikt → false positives durch Cache/Asset-Versionen | klein | Threshold empirisch bei POC kalibrieren, statt vorgegebenem festen Wert |
| Domain-Cutover-Fehler (DNS-TTL, SSL-Zertifikat-Re-Issue) | mittel | Cutover-Plan separat dokumentieren (außerhalb dieser Spec, Tier-3 mit expliziter Freigabe) |

---

## 7. Beziehung zu CW-001 (Trunk ist Master)

Greenfield-Reset ist **die ultimative Validierung von CW-001**. Wenn der Trunk
wirklich Master ist, muss eine jungfräuliche WP-Instanz aus Trunk + Theme + Bootstrap
vollständig rekonstruierbar sein. Solange das nicht bewiesen ist, ist CW-001 eine
Behauptung. Nach dem POC ist es eine validierte Architektur-Eigenschaft.

Der Bootstrap-Layer fügt CW-001 nichts hinzu, was nicht implizit schon dort gefordert
wäre — er macht nur explizit, was bisher als Restwissen in der Live-WP-Instanz lebt
(Plugin-Liste, WPML-Setup, etc.) und überführt es in versioniertes, deklaratives
Manifest-Format.

---

## 8. Phasen-Plan (Wellen-Tabelle)

| Welle | Inhalt | Plattform | Tier | Abhängig von |
|-------|--------|-----------|:-:|--------------|
| **H** | Cleanup bestehende Instanz (Plugins, Themes, Legacy-Pages) | aktuelle WP | 1 | — |
| **F** | Live-Deploy bereinigte Instanz | DF/cPanel | 3 | H |
| **GR-1** | Bootstrap-Manifest + Bootstrap-Adapter schreiben | Trunk-Repo | 1 | — (parallel zu H) |
| **GR-2** | POC auf zweiter Local-Instanz, Visual-Diff | Local | 1 | GR-1 |
| **E** | Native-Quality-Review extern | extern | 3 | unabhängig |
| **GR-3** | Greenfield-Live-Bootstrap auf neuer Test-Subdomain | DF/cPanel | 3 | GR-2 + E |
| **GR-Cutover** | DNS-Schwenk Live-Domain auf Greenfield-Instanz | DNS-Provider | 3 | GR-3 + Smoke-OK |

Welle E und GR-Phase laufen parallel zu H/F. Sobald Übergangsseite (nach F) live
und stabil läuft, gibt es keinen Zeitdruck mehr für Greenfield — er kann in Ruhe
validiert und abgenommen werden, bevor der Cutover gemacht wird.

---

## 9. Was bedeutet das für Dr. Stracke (LL-024)

**WAS:** Eine zweite WP-Instanz wird parallel zur aktuellen aufgebaut, ausschließlich
über den Trunk und ein neues Bootstrap-Skript. Die aktuelle Instanz geht nach Cleanup
als Übergangsseite live, damit kein Wartezeit-Frust entsteht.

**WARUM:** Eine in-place gereinigte WP ist sauber genug für eine Praxis-Webseite,
aber nicht jungfräulich. Die Greenfield-Instanz ist die akademisch saubere Lösung.
Da der Trunk ohnehin Master ist (CW-001), kostet Greenfield uns hauptsächlich das
Schreiben des Bootstrap-Skripts (~1 Welle), nicht das erneute Aufsetzen von Inhalten,
Design oder Übersetzungen.

**WAS BEDEUTET DAS:** Du bekommst zwei Mal Wert. Erst geht die bereinigte Seite live
und die Wartezeit ist beendet. Dann, ohne Druck, wird die Greenfield-Variante
validiert und mit einem DNS-Wechsel produktiv geschaltet. Beim Cutover ändert sich
für Besucher und Suchmaschinen praktisch nichts — gleicher Content, gleiches Design,
gleiche URLs. Nur die DB darunter ist eine andere.

---

*Konzept-Stand 2026-05-05. Nächster Schritt: Welle H starten (Cleanup-Plan
detaillieren), Bootstrap-Manifest in eigener Welle GR-1 spezifizieren.*
