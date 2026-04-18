# SESSION_RESUME — Cortex-Web

> **Standard-Einstieg** (LL-043, `Nexus/_rules/SESSION_LIFECYCLE.md`):
> In einer neuen Session **„Projekt fortsetzen Cortex-Web"** tippen. Claude lädt:
>
> 1. Pflicht-Init Nexus (CLAUDE.md, MEMORY.md, GLOBAL_RULES.md, SESSION_LIFECYCLE.md)
> 2. Diese Datei (SESSION_RESUME.md)
> 3. Alle in §0 unten als Pflicht-Lesung markierten Folgedateien
> 4. Pre-Flight (`tools/validate.sh`)
> 5. Status-Statement im Architekten-Stil → wartet auf Wahl der Front

---

## §0 EINSTIEG „Projekt fortsetzen Cortex-Web" — Pflicht-Lesung

1. `~/Cortex/Nexus/CLAUDE.md`
2. `~/Cortex/Nexus/_memory/MEMORY.md`
3. `~/Cortex/Nexus/_rules/GLOBAL_RULES.md`
4. `~/Cortex/Nexus/_rules/SESSION_LIFECYCLE.md`
5. `~/Cortex/projects/Cortex-Web/CLAUDE.md`
6. Diese Datei (`SESSION_RESUME.md`)
7. `~/Cortex/projects/Cortex-Web/_rules/ARCHITECTURE.md`
8. `~/Cortex/projects/Cortex-Web/_config/RULES.md`
9. `~/Cortex/projects/praxis-redesign/_rules/WORKING_MODE.md` (Architekten-Modus)
10. Phasen-spezifisch (siehe §5 unten)

---

## §1 Stand & Version

- **Version:** 0.2.0 (Phase 1 abgeschlossen)
- **Stand:** 2026-04-18, Session 2 abgeschlossen (Phase 1 End-to-End grün)
- **Git-Commits:**
  - `6178d2f` — Phase 0 Skelett
  - `d9577cd` — Phase 0 Doku-Nachtrag
  - `778635c` — Phase 1 POC WP Adapter (Schema, Content, Adapter, Tooling, Local-Setup)
- **Working Tree:** clean (nach LL-042 Schritt 5 mit Audit-Updates in Nexus)
- **Trunk-Content:** 1 Produkt (`basic-check.yaml`) vollständig nach 02_ENTSCHEIDUNGEN §3.1
- **WP-Adapter:** implementiert, End-to-End grün gegen Local-WP (Page-ID 9668, HWG-konform, idempotent)
- **Shopify-Adapter:** Placeholder-README, nicht implementiert → Phase 2
- **iOS-Adapter:** Placeholder-README, nicht implementiert → später
- **Medien-Registry:** leer → Phase 2

### Local-WP-Setup (persistierte Änderungen an der Local-Site)

Für den Adapter-Betrieb wurde Dr. Strackes Local-by-Flywheel-Site `gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local` einmalig angepasst:

- `conf/nginx/site.conf.hbs` + laufende Run-Config — 1 Zeile `fastcgi_param HTTP_AUTHORIZATION $http_authorization;` (kommentiert)
- `wp-content/mu-plugins/cortex-dev-auth.php` — rebuilds PHP_AUTH_USER/PW, forciert App-Passwords auf HTTP
- 1 Application-Password `cortex-web-adapter` für User `sstracke`
- **Kein Eingriff** an `wp-config.php` oder Theme `praxiszentrum` — Theme-Repo clean, PXZ_VERSION unverändert

Bei Site-Reset oder Gerätewechsel: Setup-Anleitung in `tools/local-wp-setup/README.md`.

---

## §2 Pre-Flight-Befehl

```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
```

Erwartet: `validate: OK (N file(s))`, Exit 0.

Ab Phase 2 wird zusätzlich ein Shopify-Connectivity-Check ergänzt.

---

## §3 Letzte Session — Phase 1, 2026-04-18

### Durchgeführt

1. Spec angelegt: `specs/phase-1/POC_WP_ADAPTER.md` (Architekten-Modus Phase 2 Lösungsdesign, freigegeben von Dr. Stracke)
2. Schema konkretisiert: `trunk/schema/product.schema.json` (I-2 hybrid, HWG-Gate via `const: false`, cta_url-Regex)
3. Content: `trunk/content/products/bluttests/basic-check.yaml` (15 Laborparameter, 4 Locales, getrennte juvantis/praxis-Views)
4. Adapter: `adapters/wordpress/build.mjs` + `content-to-wp-pages.mjs` + `lib/rest-client.mjs` + `lib/renderers/product-praxis.mjs`
5. Tools: `tools/validate.sh` (AJV-Gate, find-basiert macOS-Bash-kompatibel) + `tools/sync-wp.sh` (Pipeline: validate → build → push, lädt `.env.local`)
6. Secrets-Handling: `.env.local.template` im Repo, `.env.local` git-ignoriert
7. Local-Setup: `tools/local-wp-setup/cortex-dev-auth.php` + README.md
8. nginx-Fix an Local-Site: `fastcgi_param HTTP_AUTHORIZATION $http_authorization;` in `site.conf.hbs`
9. mu-plugin an Local-Site: PHP_AUTH_USER/PW-Rebuild + App-Passwords-HTTPS-Override
10. End-to-End-Test: 3× `sync-wp.sh` → Page-ID 9668 stabil, `modified_gmt` inkrementiert korrekt
11. Commit `778635c` (12 Dateien, +934/-27 Zeilen)

### Verifiziert (Akzeptanzkriterien aus Spec §3)

| AK | Status | Nachweis |
|---|:---:|---|
| AK-1 validate.sh grün | ✅ | OK (1 file(s)) |
| AK-2 sync-wp.sh grün | ✅ | 3× Exit 0 |
| AK-3 GET /pages?slug = 1 | ✅ | count=1 |
| AK-4 Page zeigt Titel/Tabelle/CTA | ✅ | HTML inspiziert |
| AK-5 kein Preis/Kauf auf Page | ✅ | HWG-Grep 0 |
| AK-6 Idempotent | ✅ | Page-ID 9668 stabil, modified_gmt +1s |
| AK-7 wp-config.php unverändert | ✅ | mtime 1776364622 identisch |
| AK-8 praxiszentrum-Theme clean | ✅ | HEAD 257304e, 0 uncommitted |
| AK-9 HTML ohne Preis/Juvantis | ✅ | Grep 0 |
| AK-10 .env.local nicht im Git | ✅ | .gitignore:24 matched |

**Score: 10/10 — 100 % Akzeptanz.**

### Nexus-Updates (LL-042 Schritt 2+3)

- `Nexus/_memory/MEMORY.md` — Cortex-Web-Zeile auf Phase-1-Abschluss aktualisiert, Local-WP-Setup-Pfad ergänzt, Pattern-Katalog-Referenz ergänzt
- `Nexus/CLAUDE.md` — Phasen-Plan aktualisiert (Phase 1 ⏳ → ✅)
- `Nexus/SYSTEM_MAP.md` — Cortex-Web-Zeile auf Phase-0+1 gesetzt
- `Nexus/_memory/patterns/local-wp-rest-auth-bootstrap.md` — **neues Pattern** für künftige REST-Adapter gegen Local-WP
- Tutorial `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/06-wp-rest-api-adapter-mit-application-passwords.md` angelegt

---

## §4 Offene Tasks (Priorität absteigend) — Phase 2 startet mit Session 3

### Phase 2 — POC Shopify-Adapter (nächste Session)

**Ziel:** Dasselbe Produkt `basic-check` aus dem Trunk wird als Produkt (oder Page) auf Dr. Strackes Shopify-Store `sanexio.eu` (Dev-/Draft-Stand, KEIN Live-Push!) gerendert. Beweist: ein Trunk kann beide Plattformen parallel bedienen.

**Schritte** (werden in der nächsten Session als Spec ausgearbeitet):

1. Entscheidung Adapter-Mechanik: Shopify Admin GraphQL vs. REST, Rate-Limits, Auth via Private-App-Token vs. Partner-App
2. `adapters/shopify/build.mjs` — YAML → Shopify-Payload (juvantis-View)
3. `adapters/shopify/products-to-shopify.mjs` — Idempotenter Create/Update per SKU (`views.juvantis`)
4. `tools/sync-shopify.sh` — Pipeline analog zu sync-wp
5. Medien-Registry `trunk/media/registry.yaml` + mindestens 1 Test-Asset (Phase-2-Scope)
6. End-to-End-Test: Produkt erscheint im Shopify-Admin (Draft-Status, nicht Published), Preis sichtbar (juvantis-View erlaubt), CTA `/products/basic-check`

### Parallel laufende Arbeiten (werden NICHT in Cortex-Web-Sessions berührt)

- `praxis-redesign` Sprint 2 (S2.1 Seiten-Inventar) — läuft in eigenen Sessions weiter, Theme-Repo bleibt autonom bis Phase 4
- `Juvantis/juvantis-web` — läuft in eigenen Sessions weiter, Theme-Repo bleibt autonom bis Phase 5
- `Juvantis/DHT`, `Juvantis/social-media` — unabhängig, bleiben dauerhaft unter `projects/Juvantis/`

### Nach Phase 2: Phase 3 (Review)

Vergleich WP-Rendering vs. Shopify-Rendering desselben Produkts. Go/No-Go-Entscheidung Dr. Stracke, ob der Common-Trunk-Ansatz den Pflegeaufwand rechtfertigt.

---

## §5 Phasen-spezifische Pflicht-Lesung

### Für Phase 2 (POC Shopify-Adapter)

- `~/Cortex/projects/Juvantis/CLAUDE.md` — Shopify-Theme-Regeln, Theme-ID, medzpoint-Store
- `~/Cortex/projects/Juvantis/juvantis-web/theme/` — Target-Theme-Struktur
- `~/Cortex/projects/Juvantis/_config/RULES.md` — R-001…R-018 (Shopify-Konventionen)
- Shopify Admin API-Token für medzpoint (aus `~/.wp-local-credentials` o. ä., wird in `.env.local` ergänzt)
- `~/Cortex/Nexus/_memory/patterns/shopify-workflow.md` — bestehendes Pattern

### Für Phase 3 (Review)

- Outputs aus Phase 1 + 2 (Screenshots, Diff-Report)
- Visual Comparison der beiden gerenderten Seiten

### Für Phase 4 (Praxis-Subsumierung)

- `projects/praxis-redesign/SESSION_RESUME.md` — aktueller Sprint-Stand zum Zeitpunkt von Phase 4
- **WICHTIG:** Phase 4 setzt Go von Dr. Stracke voraus (`git mv`-Operation ist invasiv)

### Für Phase 5 (Juvantis-Web-Subsumierung)

- `projects/Juvantis/juvantis-web/` (Theme-Git-Status)
- **WICHTIG:** ebenfalls Go erforderlich

---

## §6 Sofort-Status-Frage für nächste Session

> **„Cortex-Web Phase 1 abgeschlossen (Commit 778635c, 10/10 AKs grün, WP-Page
> `basic-check` HWG-konform live auf Local). Soll ich Phase 2 (POC
> Shopify-Adapter) starten? Dann brauche ich von Ihnen: ein Shopify Admin-API-
> Access-Token für den Store `medzpoint` (private Custom App in Shopify Admin
> anlegen, Scopes mindestens `write_products`, `write_files`). Kein Push in
> Produktion. Alle Produkte im Draft-Status. Freigabe?"**

---

## §7 Verbote / harte Regeln — dürfen NIE passieren

- **Keine Datenverschiebung** aus `praxis-redesign/` oder `Juvantis/juvantis-web/` in Phase 2–3 (erst Phase 4/5, jeweils mit separatem Go)
- **Kein Push zu Prod-Shopify oder Prod-WP** während POC-Phasen — Shopify-Adapter arbeitet immer mit `status: draft`
- **CW-001 Trunk-ist-Master** — keine direkten Shopify-Admin-Edits für Trunk-gepflegten Content
- **CW-005 Plattform-Trennung** — KEIN Preis, KEIN Kauf-CTA auf Praxis-Site (schema-erzwungen via `const: false`)
- **Keine Shopify-API-Credentials oder WP-Passwörter im Repo** (nicht in `.env.*.template`, nirgends)
- **Kein `--force` bei Git** außer bei explizitem Dr.-Stracke-Go
- **Kein Touch am `praxiszentrum`-Theme** in Cortex-Web-Sessions — das Theme gehört `praxis-redesign`, wird erst in Phase 4 subsumiert
- **Kein Admin-/Root-/Login-Passwort im Chat** — nur App-Passwords, API-Tokens (`feedback_secrets_handling.md`)

---

## §8 Session-Historie

| Session | Datum | Phase | Ergebnis | Commit(s) |
|---------|-------|:-----:|----------|-----------|
| 1 | 2026-04-18 | 0 | Skelett + Regeln + Nexus ✅ | `6178d2f`, `d9577cd` |
| 2 | 2026-04-18 | 1 | POC WP-Adapter End-to-End ✅, Local-WP-Setup dokumentiert, Pattern + Tutorial | `778635c` |
| *(3)* | *tbd* | *2* | *POC Shopify-Adapter* | — |

---

*Stand: 2026-04-18, Ende Phase 1. Nächste Session: Phase 2 per „Projekt fortsetzen Cortex-Web".*
