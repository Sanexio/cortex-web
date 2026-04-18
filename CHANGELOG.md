# CHANGELOG — Cortex-Web

Alle nennenswerten Änderungen an diesem Projekt. Format: [Keep a Changelog](https://keepachangelog.com/de/1.1.0/). Versionierung: SemVer.

## [0.2.0] — 2026-04-18

### Phase 1 abgeschlossen — POC WordPress-Adapter End-to-End

#### Hinzugefügt
- `specs/phase-1/POC_WP_ADAPTER.md` — Architekten-Modus-Spec (Verständnis + Lösungsdesign + 10 Akzeptanzkriterien + Selbstprüfungs-Plan)
- `trunk/schema/product.schema.json` — konkretisiert (I-2 hybrid, HWG-Gate via `const: false`, cta_url-Regex)
- `trunk/content/products/bluttests/basic-check.yaml` — Beispielprodukt mit 15 Laborparametern und 4 Locales
- `adapters/wordpress/build.mjs` — CLI: YAML → AJV-Validation → Renderer → Payload-JSON auf stdout
- `adapters/wordpress/content-to-wp-pages.mjs` — CLI: REST-Push mit slug-basierter Idempotenz (GET → POST/PUT)
- `adapters/wordpress/lib/rest-client.mjs` — Fetch-Wrapper mit Basic-Auth + Password-Masking
- `adapters/wordpress/lib/renderers/product-praxis.mjs` — Gutenberg-HTML-Renderer (paragraph / heading / table / buttons)
- `tools/validate.sh` — AJV-Build-Gate (CW-002), find-basiert für macOS-Bash-3.2-Kompatibilität
- `tools/sync-wp.sh` — Pipeline validate → build → push mit `.env.local`-Loading
- `tools/local-wp-setup/cortex-dev-auth.php` — mu-plugin-Quelle für lokale Setups (PHP_AUTH_*-Rebuild + App-Passwords-HTTP-Override)
- `tools/local-wp-setup/README.md` — Setup-Anleitung für Local-by-Flywheel-WP-Sites
- `.env.local.template` — Schema für `.env.local` (git-ignoriert)

#### Verifiziert (End-to-End, 10/10 Akzeptanzkriterien)
- Validate grün, Sync-Pipeline grün, Page `basic-check` live auf Local-WP
- HWG-konform: kein Preis, kein Kauf-CTA, nur Partnerinfo-CTA zu sanexio.eu
- Idempotenz bewiesen durch wiederholte Läufe (gleiche Page-ID, neuer `modified_gmt`)
- `wp-config.php` mtime unverändert
- `praxis-redesign`-Theme-Repo (`praxiszentrum`) working tree clean (HEAD 257304e)
- `.env.local` außerhalb von Git

#### Nexus-Updates (außerhalb des Projekt-Repos, LL-042 Schritt 2–4)
- `Nexus/_memory/MEMORY.md`: Cortex-Web-Status auf Phase 0 + 1, Local-WP-Setup-Pfad-Referenz, Pattern-Katalog-Ergänzung
- `Nexus/CLAUDE.md`: Phasen-Plan 1 ⏳ → ✅, Phase-2-Einstieg
- `Nexus/SYSTEM_MAP.md`: Cortex-Web-Zeile auf Phase 0 + 1 aktualisiert
- `Nexus/_memory/patterns/local-wp-rest-auth-bootstrap.md`: **neues Pattern** (3-Layer-Auth-Bootstrap für Local-WP-Adapter)
- Tutorial `Second Brain/30 Tutorials/Webentwicklung/WordPress & CSS/06-wp-rest-api-adapter-mit-application-passwords.md`

#### Lokale Setup-Änderungen an Dr. Strackes Local-WP-Site (außerhalb Repo)
- `conf/nginx/site.conf.hbs`: +1 Zeile `fastcgi_param HTTP_AUTHORIZATION $http_authorization;`
- `wp-content/mu-plugins/cortex-dev-auth.php`: Kopie aus `tools/local-wp-setup/`
- 1 Application-Password `cortex-web-adapter` für User `sstracke`

#### Commits
- `778635c — feat(phase-1): POC WP adapter — schema, content, adapter, tooling`

---

## [0.1.0] — 2026-04-18

### Phase 0 abgeschlossen — Skelett

#### Hinzugefügt
- Projekt-Ordnerstruktur (`trunk/`, `adapters/`, `tools/`, `sites/`, `_config/`, `_rules/`, `_media-source/`)
- `PROJECT.md` (Container-Manifest nach Nexus-Standard)
- `CLAUDE.md` (Projekt-Kontext, Pflicht-Lesung)
- `README.md` (Kurzbeschreibung)
- `SESSION_RESUME.md` (LL-043-Format, Phase-0-Abschluss-Stand)
- `_config/RULES.md` (CW-001 bis CW-005 definiert)
- `_config/FEHLERPROTOKOLL.md` (leer, wartet auf erste CW-E-Einträge)
- `_config/WORKFLOW_CHECKLIST.md`
- `_rules/ARCHITECTURE.md` (Phasen-Roadmap 0–5 + Sprint-Anschluss)
- `_rules/WORKING_MODE.md` (Referenz auf praxis-redesign Architekten-Modus)
- `_rules/PRE_FLIGHT_CHECKLIST.md` (Platzhalter, wächst mit Adaptern)
- `_rules/FEHLERPROTOKOLL.md`
- `trunk/schema/*.schema.json` (leere Schema-Gerüste: page, product, team-member, component, media)
- `trunk/media/registry.yaml` (leer)
- `adapters/{wordpress,shopify,ios}/README.md` (Platzhalter)
- `tools/README.md`
- `.gitignore` (ignoriert `_media-source/`, `node_modules/`, `bun.lock`-Konflikte)
- `package.json` (Bun, puppeteer-core)

#### Nexus-Updates (außerhalb des Projekt-Repos)
- `Nexus/_memory/MEMORY.md`: Cortex-Web als aktives Projekt ergänzt
- `Nexus/CLAUDE.md`: Cortex-Web-Abschnitt hinzugefügt
- `Nexus/.config/devices.json`: Cortex-Web unter Cluster-Mini-02 ergänzt
- `projects/praxis-redesign/_rules/ARCHITECTURE.md`: Sprint T0–T5 + Parallelität dokumentiert
- `projects/Juvantis/PROJECT.md`: Vermerk über spätere Subsumierung

#### Initial-Commit
- Git-Repo initialisiert
- Erster Commit: `6178d2f — chore: phase 0 – skeleton, rules, nexus integration`
