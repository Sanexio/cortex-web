# ARCHITECTURE — praxis-redesign

> Lebendes Dokument. Stand: 2026-04-18 nach v2.7.2 (Homepage-Look abgenommen; Task 2
> Karriere weiter freigabepflichtig). Bei jeder Architekturentscheidung pflegen.

---

## 1. IST-Architektur

### 1.1 Projekt-Arbeitsordner (Prozess-Docs, aktuell kein Git)

```
~/Cortex/projects/praxis-redesign/
├── SESSION_START.md           — Einstieg für jede neue Claude-Session
├── SESSION_RESUME.md          — aktueller Stand, wird je Session fortgeschrieben
├── HANDOFF_PROMPT.md          — Projekt-Kontext + 8 Aufgaben
├── DESIGN_GUIDELINES.md       — v2.2, §13–§16 verbindlich
├── PHASE1_AUDIT.md            — 5-Phasen-Plan (Phase 1 abgeschlossen)
├── _rules/
│   ├── WORKING_MODE.md        — Architekten-Modus (ab 2026-04-18 verbindlich)
│   ├── ARCHITECTURE.md        — diese Datei
│   ├── FEHLERPROTOKOLL.md     — PXZ-E-001 … 005
│   └── PRE_FLIGHT_CHECKLIST.md
├── specs/
│   └── sprint-0/              — Verständnis + Lösungsdesign je Teilschritt
├── tools/
│   ├── verify.sh              — §1 Split/§2 Reset/§3 Probe/§4 Alignment/Shot (via Page-Registry, Home + Karriere)
│   ├── page-registry.mjs      — zentrale Page-Liste (slug/url/viewports/expected/exists) — NEU Sprint 0 / S0.4
│   ├── probe-design.mjs       — Puppeteer Computed-Style + Existenz-Checks über Registry (refactored S0.4)
│   ├── shoot.mjs              — generischer Screenshot-Runner über Registry (ersetzt shoot_karriere.mjs) — NEU S0.4
│   ├── ab-diff.mjs            — Vorher/Nachher-Shots + Delta + Alignment (2026-04-18, §7a)
│   ├── alignment-probe.mjs    — Standalone Spezifitäts-/Alignment-Check (2026-04-18)
│   ├── create_mfa_form.php    — WPForms-Generator, idempotent
│   └── create_karriere_page.php — WP-Page-Generator, idempotent
├── screenshots/
│   ├── {1,2,3}.png            — harte Design-Referenzen von Dr. Stracke
│   └── claude/                — Verifikations-Shots
├── assets/
│   ├── logo/, praxis/, team/
├── phase2/                    — Legacy-Arbeitsordner
├── package.json               — nur puppeteer-core
└── bun.lock
```

### 1.2 WordPress-Site (Local by Flywheel, Cluster-Mini-02)

```
/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/
├── wp-content/themes/praxiszentrum/        ← Custom Child Theme (Parent: Blocksy)
│   ├── style.css                           80 Zeilen Base-/Utility-CSS
│   ├── functions.php                       PXZ_VERSION=2.7.3, Konstanten, Enqueue, Helper
│   ├── template-homepage.php               ~1200 Z., ALLES inline (CSS + Content + HTML)
│   └── template-karriere.php               ~260 Z., ALLES inline, NEU in v2.6.0
├── wp-content/mu-plugins/
│   ├── akeeba-backup-coreupdate.php        (AkeebaBackup)
│   └── 000-local-mail-redirect.php         DEV-ONLY, leitet .local-Mail nach Mailpit
├── wp-content/plugins/ (30 aktive)         WPForms Pro, WP Mail SMTP Pro, WPML, AIOSEO, …
└── wp-config.php                           DB_NAME=local, Host=localhost
```

### 1.3 Infrastruktur (Local)

| Dienst | Port | Konfig |
|--------|------|--------|
| MySQL | 10004 (TCP) + Socket `/Users/…/run/VFEzUQg6g/mysql/mysqld.sock` | DB=local, User=root, Pass=root |
| Mailpit SMTP | 10001 | fängt alle `.local`-Mails ab |
| Mailpit UI/API | 10000 | `http://localhost:10000/api/v1/messages` |
| nginx | (router) | HTTPS self-signed |
| PHP | 8.2.29 | `/Applications/Local.app/Contents/Resources/extraResources/lightning-services/php-8.2.29+0/bin/darwin-arm64/bin/php` |
| WP-CLI | v2.x | `/Applications/Local.app/Contents/Resources/extraResources/bin/wp-cli/wp-cli.phar` |

**WP-CLI-Aufrufmuster (erforderlich, sonst DB-Verbindung scheitert):**
```bash
PHP=".../php-8.2.29+0/bin/darwin-arm64/bin/php"
PHAR=".../wp-cli/wp-cli.phar"
SITE="/Users/cluster-mini-02/Local Sites/.../app/public"
SOCK="/Users/.../run/VFEzUQg6g/mysql/mysqld.sock"
"$PHP" -d memory_limit=512M \
       -d mysqli.default_socket="$SOCK" \
       -d pdo_mysql.default_socket="$SOCK" \
       "$PHAR" --path="$SITE" <command>
```

### 1.4 Content-Quellen (aktuell inkonsistent)

| Quelle | Einsatz | Bemerkung |
|--------|---------|-----------|
| `pxz_homepage_content()` (PHP-Array in `functions.php`) | Homepage-Texte DE/EN/FR/ES | strukturierte Mehrsprachigkeit, aber schwer editierbar |
| `PXZ_*`-Konstanten | Telefon, E-Mail, Adressen | Single Source of Truth |
| Gutenberg-Blocks (`wp_posts.post_content`) | Karriere-Seite angelegt, **wird vom Template ignoriert** | Template rendert statisch; Editor-Inhalt erscheint nicht |
| Hardcoded im Template | Karriere-Hero-Titel, Intro, Card-Text | Content vermischt mit Layout |

---

## 2. Zielarchitektur (SOLL — für Go-Live-Fähigkeit)

| Dimension | IST | SOLL |
|-----------|-----|------|
| Seiten im neuen Design | 2 (Home, Karriere) | Home + Karriere + 172 Bestandsseiten |
| Design-System | Ad-hoc, dreimal dupliziert | Komponentenbibliothek, 1 Token-Quelle |
| CSS-Distribution | 80 Z. `style.css` + 2× >500 Z. inline | Modulare CSS-Dateien, Templates nur Markup |
| Versionskontrolle | **Git lokal, 2 Repos (Theme + Docs) seit Sprint 0 / S0.1** | Git lokal, optional Remote |
| Verifikation | **Page-Registry (Home + Karriere) seit Sprint 0 / S0.4** | Page-Registry, jede Page mit EXPECTED |
| Staging | Keines | Local → Staging → Prod |
| WPML | Installiert, ungenutzt | DE/EN/FR/ES je Seite |
| SEO | AIOSEO aktiv, ungeprüft | Schema.org MedicalBusiness, OG, Sitemap |
| Backup/Rollback | Plugins aktiv, kein Plan | Pre-Deploy-Snapshot, 1-Klick-Rollback |
| Onboarding | Tribal Knowledge | 1 README mit reproducible Setup |

---

## 3. Schwachstellen-Register

### Kategorie A — Architekturdefekte

| ID | Defekt | Wurzel | Adressiert in |
|----|--------|--------|--------------|
| A1 | ~~Inline-CSS in Page-Templates~~ → **erledigt 2026-04-18 v2.7.4** (Sprint 0 / S0.2): Home + Karriere-CSS leben jetzt in `assets/css/{homepage,karriere}.css`, conditional enqueue via `is_page_template()` | Keine CSS-Modularisierung | ~~Sprint 0 / S0.2~~ ✅ |
| A2 | Kein Komponenten-System — `.pxz-*-card` dreimal dupliziert | DRY-Verletzung, Token-Redeklaration | Sprint 0 / S0.3 |
| A3 | Content-Quellen uneinheitlich — Gutenberg-Inhalt wird auf Karriere ignoriert | Kein Content-Contract | Sprint 2 |
| A4 | Kein Git | Nie eingerichtet (Cortex selbst auch nicht) | Sprint 0 / S0.1 |

### Kategorie B — Prozess-Defekte

| ID | Defekt | Wurzel | Adressiert in |
|----|--------|--------|--------------|
| B1 | Verify-Pipeline homepage-only → PXZ-E-005 (DSGVO) blieb unentdeckt | `probe-design.mjs` kennt nur Homepage | Sprint 0 / S0.4 |
| B2 | Keine Verständnis-Sicherung vor Umsetzung | Arbeitsprozess war fluide | WORKING_MODE.md |
| B3 | Screenshots als alleiniges Design-Gate (PXZ-E-003) | Keine textuellen Akzeptanzkriterien | `_rules/ACCEPTANCE.md` geplant |
| B4 | `PXZ_VERSION` monolithisch | Alles über einen Cache-Buster | Sprint 1 (CHANGELOG, Semver-Policy) |

### Kategorie C — Betriebs-Risiken für Go-Live

| ID | Defekt | Wurzel | Adressiert in |
|----|--------|--------|--------------|
| C1 | Mail-Versand in Prod nicht geprüft (Outlook + Anhang) | Local lenkt nach Mailpit | Sprint 1 |
| C2 | 172 Legacy-Seiten ohne Migrationsplan | PHASE1_AUDIT deckt es nicht ab | Sprint 2 |
| C3 | MU-Plugin nicht in Repo | Kein Dev-Bootstrap | Sprint 0 / S0.1 |
| C4 | Kein Staging | Toolchain noch nicht aufgesetzt | Sprint 1 |

---

## 4. Sprint-Roadmap

### Sprint 0 — Foundation (2026-04-18, minimal-Scope abgeschlossen)

Entscheidung Dr. Stracke: b=1 (Git lokal), c=2 (zwei Repos: Theme + Docs),
d=1 (Deadline 48 h halten → Sprint 0 minimal: S0.1 + S0.4; S0.2 + S0.3
ins Backlog).

- ✅ S0.1 Git-Repo für Theme (Baseline v2.7.3) + separates Repo für Docs/Tools
- ✅ S0.2 CSS-Extraktion (Inline → `assets/css/{homepage,karriere}.css`) — **abgeschlossen 2026-04-18 v2.7.4** (nachgezogen in separater Session). 1:1-Transfer, conditional enqueue via `is_page_template()` mit Dep `praxiszentrum`. Verify + Probe grün.
- ⏸ S0.3 Design-Token-SSoT + Komponenten-Abstraktion — **Backlog** (Sprint 2 Kandidat)
- ✅ S0.4 Verify-Pipeline auf Page-Registry (Home + Karriere) umgestellt

Detail: `specs/sprint-0/README.md` + `specs/sprint-0/OPEN_DECISIONS.md`.

### Sprint 1 — Rollout-Infrastruktur (⏸ PAUSIERT 2026-04-18)

**Pause-Grund:** SFTP-Credentials im Domainfactory-Panel nicht auffindbar. DF-Support angeschrieben. Spec (`specs/sprint-1/README.md`) bleibt freigegeben, wartet auf Credentials-Lieferung.

- S1.1 Staging auf Root-Domain `westend-hausarzt.de` (Weiterleitung aufheben)
- S1.2 Backup/Rollback-SOP (AkeebaBackup) + Pre-Deploy-Snapshot
- S1.3 End-to-End-Mail-Test auf Staging (Outlook-SMTP, 1 PDF-Anhang an `stracke.md@me.com`)

### Sprint 2 — Kernseiten-Ausbau + Design-System (vorgezogen 2026-04-18)

**Kontext:** Während Sprint 1 pausiert ist, wird auf Local weitergebaut — Design + Content der Kernseiten (Praxis, Team, Sprechstunden, Fachrichtungen, Kontakt, Datenschutz, Impressum, 404). Keine DF-Credentials nötig.

- S2.0 Design-Token-SSoT nachziehen (ehem. S0.3) — **Vorbedingung**, damit neue Seiten nicht erneut Token redeklarieren ✅
- S2.1 Seiten-Inventar & Content-Audit (welche Seiten braucht die neue Site mindestens?) ✅
- S2.2 Template-Typologie (Standard-Textseite, Fachrichtung, Team-Einzelseite) ✅
- S2.3 Implementierung Kernseiten in Batches à 2–3 Seiten — **TEILWEISE** (B + D + kern + checkups ✅; aerzte/services/diagnostik/legacy offen)
- **S2.4 Menü-Restrukturierung — `Hauptnavigation` mit kuratierten Submenus (Fachrichtungen, Ärzte, Check-Ups, Sprechstunden, Kontakt, Karriere). PRIORITÄT-NEU 2026-04-22 (Dr.-Stracke-Direktive Session 18 Ende): vor weiteren S2.3-Cluster-Migrationen umsetzen, damit ALLE bisherigen Inhalte (kern + checkups) sofort über das Menü erreichbar sind.**
- S2.3 (Rest) Kernseiten-Cluster `aerzte` (2), `services` (4), `diagnostik` (10), `legacy/de` (23) — **NACH S2.4**, damit jede neue Seite sofort ihren Menü-Eintrag erhält
- S2.5 QA-Audit gegen `DESIGN_GUIDELINES.md` §13–§16

### Sprint 2b — Legacy-Content-Migration (verschoben nach Sprint 4 oder separat)
- Audit der 172 Legacy-Seiten → `phase4_audit.json`
- Migrations-Batches ≤20 Seiten mit Visual-Diff
- Komponenten-Migration der 3 Card-Varianten auf `.pxz-card--dark`

### Sprint 3 — Mehrsprachigkeit
- S3.1 WPML-Homepage-Duplikate DE → EN/FR/ES (entspricht Task 3 aus HANDOFF_PROMPT)
- S3.2 Formulare mehrsprachig

### Sprint 4 — Go-Live (Phase 5 aus PHASE1_AUDIT)
- S4.1 SEO/Schema/Sitemap
- S4.2 QA-Matrix (Browser × Sprache × Page-Typ)
- S4.3 Cut-Over-Plan + DNS-Switch + Rollback-Übung

---

## 4b. Cortex-Web — Dach-Projekt (parallel, ab 2026-04-18)

Seit 2026-04-18 existiert das Dach-Projekt **Cortex-Web** (`projects/Cortex-Web/`),
das praxis-redesign perspektivisch subsumiert. Der Common Trunk hält Content,
Design-Tokens, UI-Komponenten-Specs und Medien zentral; plattform-spezifische
Adapter rendern WP-Pages (für praxis-redesign) und Shopify-Sections (für Juvantis).

### Phasen-Plan Cortex-Web (eigene Sessions)

| Phase | Ziel | Wirkung auf praxis-redesign |
|:---:|------|:----------------------------|
| T0 | Skelett + Regeln + Nexus | Keine (2026-04-18 ✅) |
| T1 | POC WP-Adapter: 1 Produkt → WP-Page (neu, neben bestehendem Theme) | Keine (additive Tests in Local WP) |
| T2 | POC Shopify-Adapter | Keine |
| T3 | Review & Go/No-Go | Keine |
| T4 | **Subsumierung praxis-redesign** via `git mv` → `Cortex-Web/sites/praxis-webseite/` | ~30 Min Pause (Pfad-Umzug), Sprint 2 danach dort weiter |
| T5 | Subsumierung Juvantis-Web | Keine |

### Parallelität in Phasen 0–3

- **Sprint 2 praxis-redesign läuft UNGESTÖRT weiter.** Neue Kernseiten-Arbeiten
  passieren direkt im Theme `praxiszentrum/`, nicht im Trunk.
- Nach Phase 3 (Cortex-Web POC erfolgreich): neue Kernseiten werden direkt im
  Cortex-Web-Trunk erstellt, der WP-Adapter rendert sie.
- **Sprint 1 bleibt pausiert** bis SFTP-Credentials da sind.

### Nach Phase 4 (Subsumierung)

- Theme-Repo (`praxiszentrum/`) bleibt intakt, nur Docs-Repo wandert via `git mv`
- Pfad-Referenzen in MEMORY.md, CLAUDE.md, SYSTEM_MAP.md werden aktualisiert
- Sprint-Nummerierung Sprint 0–4 wird nahtlos in
  `Cortex-Web/sites/praxis-webseite/_rules/ARCHITECTURE.md` fortgeführt

### Entscheidungshistorie

- `specs/bridge-strategy/00_BRAINSTORMING_KONZEPT.md` — Phase-1-Verständnis (Plattform-Optionen)
- `specs/bridge-strategy/01_COMMON_TRUNK_LOKALE_ENTWICKLUNG.md` — Phase-2-Lösungsdesign
- `specs/bridge-strategy/02_ENTSCHEIDUNGEN_FINAL.md` — finale Festlegungen (Name, Struktur, Medien, I18n, Trunk-Tiefe)

Diese drei Dokumente wandern bei Phase 4 mit dem Docs-Repo nach
`Cortex-Web/sites/praxis-webseite/specs/bridge-strategy/` oder werden hoch-
promoted nach `Cortex-Web/specs/bridge-strategy/` (Entscheidung bei Phase 4).

---

## 5. Noch einzuführende Prozess-Artefakte

| Artefakt | Zweck | Status |
|----------|-------|--------|
| `_rules/WORKING_MODE.md` | Architekten-Modus, Arbeitsprozess | ✅ angelegt 2026-04-18 |
| `_rules/ARCHITECTURE.md` | diese Datei | ✅ angelegt 2026-04-18 |
| `_rules/ACCEPTANCE.md` | textuelle Akzeptanzkriterien je Task | ⏳ Backlog (aus Sprint 0 verschoben) |
| `specs/<sprint>/<task>.md` | pro Task: Verständnis + Design + Prüfung | ✅ begonnen mit `specs/sprint-0/` |
| `tools/page-registry.mjs` | zentrale Page-Liste | ✅ Sprint 0 / S0.4 |
| `tools/bootstrap.sh` | reproducible Setup | ⏳ Backlog |
| `CHANGELOG.md` (am Theme) | Semver-Bumps | ✅ Sprint 0 / S0.1 |
