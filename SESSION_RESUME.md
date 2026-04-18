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

- **Version:** 0.2.1-setup (Phase-2-Infrastruktur abgeschlossen, Phase-2-Adapter offen)
- **Stand:** 2026-04-18, Session 3 abgeschlossen — **Shopify Admin-API-Token produktiv**
- **Git-Commits:**
  - `6178d2f` · `d9577cd` — Phase 0 Skelett + Nachtrag
  - `778635c` · `19fd8ce` — Phase 1 POC WP-Adapter + Close-Session
  - *(Session 3 Änderungen: bisher uncommitted; Commit-Empfehlung siehe §4 unten)*
- **Working Tree:** 1 modifiziert (`.env.local.template`), 3 untracked (Shopify-Tooling + CLI-Config), Trunk unverändert

### §1.1 Shopify Adapter-Credentials (Phase 2 Setup)

Einmaliger Setup-Akt in Session 3 durchgeführt, muss nicht wiederholt werden:

- **Custom App im Dev Dashboard:** `Cortex-Web Adapter` (Version `cortex-web-adapter-3` aktiv)
  - Client-ID: `19fe6e2bd121da1592ac75d27b167e72` (öffentlich)
  - Scopes: `read_products, write_products, read_files, write_files`
  - `use_legacy_install_flow = true`, `embedded = false`
  - `application_url` und `redirect_urls` auf `http://localhost:53682/callback`
- **Admin-API-Token:** in `.env.local` als `SHOPIFY_ADMIN_TOKEN` (beginnt mit `shpat_…`)
- **Store:** `juvantis.myshopify.com` (öffentliche Domain `sanexio.eu`, Plan `basic`, Owner Dr. Stracke)
- **Verifiziert:** `GET /admin/api/2026-04/shop.json` → `HTTP 200`, Shop-Metadaten korrekt

### §1.2 Neue Tools dieser Session

- `tools/shopify-oauth-catcher.mjs` — Node-HTTP-Server auf `localhost:53682/callback`, tauscht OAuth-Code gegen Admin-API-Token, schreibt in `.env.local` (chmod 600). Wiederverwendbar bei Scope-Erweiterung oder Token-Rotation.
- `tools/shopify-authorize.sh` — Bash-Script, das die OAuth-Authorize-URL sauber (ohne Copy-Paste-Zeilenumbrüche) zusammenbaut und per `open` im Default-Browser startet.
- `shopify.app.cortex-web-adapter.toml` — CLI-Konfig (via `shopify app config link`), enthält öffentliche App-Metadaten. Wird mit `shopify app deploy` ins Dev Dashboard gepusht.

### §1.3 Nexus-Updates (LL-042 Schritt 2+3)

- `Nexus/_memory/MEMORY.md` — Cortex-Web-Zeile auf Phase-2-Setup ✅, neue Pfad-Referenzen für Shopify-OAuth-Tooling, Pattern-Katalog erweitert, Store-Name `medzpoint` korrigiert zu `juvantis.myshopify.com`
- `Nexus/_memory/patterns/shopify-custom-app-token.md` — **neues Pattern** (Custom-App-Token via manuellem OAuth-Authorize)
- `Second Brain/30 Tutorials/Webentwicklung/Shopify & Liquid/05-admin-api-token-custom-app.md` — **neues Tutorial** mit vollständiger Schritt-für-Schritt-Anleitung und Fallstricke-Liste

---

## §2 Pre-Flight-Befehl

```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
```

Erwartet: `validate: OK (N file(s))`, Exit 0. **Stand 2026-04-18 Session 3: grün.**

Zusätzlicher Shopify-Connectivity-Check (einmal manuell verifiziert, für automatisierte Pre-Flights in Phase 2 als Teil von `tools/validate.sh` vorgesehen):

```bash
set -a; source .env.local; set +a
curl -sS -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_TOKEN" \
  "https://$SHOPIFY_STORE/admin/api/2026-04/shop.json" | jq '.shop.myshopify_domain'
```

---

## §3 Letzte Session — Session 3, 2026-04-18 Abend

### Ziel der Session
Vorbereitung Phase 2: Einmalige Einrichtung der Shopify-Infrastruktur (Custom App, Admin-API-Token), damit Session 4 direkt mit Adapter-Spec und Implementierung starten kann.

### Durchgeführt

1. Shopify CLI installiert (`npm install -g @shopify/cli@latest`, v3.93.2)
2. Custom App im Dev Dashboard erstellt: `Cortex-Web Adapter`, Version `cortex-web-adapter-1` → `-2` → `-3`
3. Lokal verlinkt: `shopify app config link --client-id=…` erzeugt `shopify.app.cortex-web-adapter.toml`
4. Erkennung: „App installieren" im neuen Dev Dashboard triggert **keinen** OAuth-Authorize (nur App-Open, keine `code`-Callback)
5. Fallback-Strategie: manuellen OAuth-Authorize via `https://juvantis.myshopify.com/admin/oauth/authorize?…` auslösen
6. Implementiert: `tools/shopify-oauth-catcher.mjs` (Node-HTTP-Server) + `tools/shopify-authorize.sh` (URL-Builder)
7. `.env.local.template` um Shopify-Variablen erweitert
8. App-URL und `redirect_urls` auf `http://localhost:53682/callback` gesetzt, per `shopify app deploy` als Version `-3` veröffentlicht
9. Catcher gestartet, Authorize-Link via Shell-Script geöffnet, Dr. Stracke hat den Scopes zugestimmt
10. Shopify redirectet zu Catcher mit `code` → Token-Exchange → `SHOPIFY_STORE` + `SHOPIFY_ADMIN_TOKEN` in `.env.local`
11. Verifizierung: `HTTP 200` auf `/shop.json`, Shop-Identität korrekt

### Nicht durchgeführt (bewusst, Architekten-Modus)

- **Kein Phase-2-Adapter-Code geschrieben.** Spec fehlt noch. WORKING_MODE.md Phase 1 (Verständnis) + Phase 2 (Lösungsdesign) müssen in Session 4 vor jedem Schreiben passieren.

### Lessons Learned (detailliert)

- Store-Handle war in MEMORY.md falsch hinterlegt als `medzpoint`, tatsächlich `juvantis`. Aus Base64-Decode des `host=…` OAuth-Parameters rekonstruiert (`YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvanV2YW50aXM` → `admin.shopify.com/store/juvantis`).
- `shopify app dev --store=<production>.myshopify.com` ist **nicht** nutzbar — verlangt Dev-Store oder Plus-Sandbox.
- URL-Copy-Paste aus Chat zerschießt lange URLs durch Zeilenumbrüche (`redirect_ur%0A%20i` statt `redirect_uri`). Immer via Shell-Script mit `open` öffnen.
- Shopify antwortet im `access_token`-Response nur mit den **effektiven** Scopes: `read_*` wird zu `write_*` kollabiert, wenn beide beantragt sind (Antwort: `"scope": "write_products,write_files"` — Lesezugriff ist implizit enthalten).

---

## §4 Offene Tasks (Priorität absteigend) — Phase 2 startet mit Session 4

### P0 — Git-Commit für Session 3 (optional, sobald Dr. Stracke gibt OK)

Nicht-committed aktuell:
- modifiziert: `.env.local.template` (Shopify-Felder hinzugefügt)
- untracked: `tools/shopify-oauth-catcher.mjs`, `tools/shopify-authorize.sh`, `shopify.app.cortex-web-adapter.toml`

**NICHT** committen: `.env.local` (git-ignoriert, enthält Secrets)

Vorschlag-Nachricht:
```
feat(phase-2-setup): Shopify Admin-API-Token Provisioning-Tooling

- tools/shopify-oauth-catcher.mjs: OAuth-Code → Admin-API-Token Exchange (localhost:53682)
- tools/shopify-authorize.sh: URL-Builder für manuellen OAuth-Authorize
- shopify.app.cortex-web-adapter.toml: Shopify CLI App-Konfiguration (public)
- .env.local.template: erweitert um SHOPIFY_{CLIENT_ID,CLIENT_SECRET,STORE,ADMIN_TOKEN}

Store juvantis.myshopify.com (sanexio.eu), Scopes write_products + write_files.
Token verifiziert gegen /admin/api/2026-04/shop.json (HTTP 200).
```

### P1 — Phase 2 Spec schreiben (nächste Session)

Ziel-Dokument: `specs/phase-2/POC_SHOPIFY_ADAPTER.md`

Analog zu `specs/phase-1/POC_WP_ADAPTER.md`. Inhalt muss enthalten:

1. **Verständnis (WORKING_MODE Phase 1):** Zielzustand, Constraints (CW-001 Trunk-Master, CW-003 lokale Medien-Originale, CW-005 Plattform-Trennung → juvantis-View mit Preis & Kauf-CTA erlaubt, Draft-Status Pflicht), implizite Annahmen.
2. **Lösungsdesign (Phase 2):** REST vs. GraphQL Admin API, Rate-Limits, Idempotenz-Strategie (SKU als Identifier), Draft/Published-Toggle, Medien-Pipeline (Phase-2-Scope = Produkt-Daten only, Medien-Registry optional ab Phase 2b).
3. **Akzeptanzkriterien (AK-1…AK-N):** analog Phase 1.

### P2 — Phase 2 Implementation (nach Spec-Freigabe)

- `adapters/shopify/build.mjs` — Trunk-YAML → Shopify-Admin-API-Payload (juvantis-View)
- `adapters/shopify/products-to-shopify.mjs` — Idempotenter Create/Update per SKU oder `handle`
- `adapters/shopify/lib/` — REST-Client + Renderer (analog `adapters/wordpress/lib/`)
- `tools/sync-shopify.sh` — Pipeline: validate → build → push, lädt `.env.local`
- `tools/validate.sh` erweitern um Shopify-Connectivity-Check (`/shop.json` mit Token)

### P3 — Nach Phase 2: Phase 3 (Review)

Visueller Vergleich WP-Rendering vs. Shopify-Rendering desselben Produkts `basic-check`. Go/No-Go-Entscheidung Dr. Stracke, ob der Common-Trunk-Ansatz den Pflegeaufwand rechtfertigt.

### Parallel laufende Arbeiten (werden NICHT in Cortex-Web-Sessions berührt)

- `praxis-redesign` Sprint 2 (S2.1 Seiten-Inventar) — läuft in eigenen Sessions weiter, Theme-Repo bleibt autonom bis Phase 4
- `Juvantis/juvantis-web` — läuft in eigenen Sessions weiter, Theme-Repo bleibt autonom bis Phase 5
- `Juvantis/DHT`, `Juvantis/social-media` — unabhängig, bleiben dauerhaft unter `projects/Juvantis/`

---

## §5 Phasen-spezifische Pflicht-Lesung

### Für Phase 2 (POC Shopify-Adapter) — nächste Session

- `~/Cortex/projects/Juvantis/CLAUDE.md` — Shopify-Theme-Regeln (`medzpoint`-Bezeichnung war falsch, korrekter Store-Handle ist `juvantis.myshopify.com`, public Domain `sanexio.eu`)
- `~/Cortex/projects/Juvantis/juvantis-web/theme/` — Target-Theme-Struktur (falls Adapter als Page oder Product rendert; Phase-2-Entscheidung)
- `~/Cortex/projects/Juvantis/_config/RULES.md` — R-001…R-018 (Shopify-Konventionen)
- `~/Cortex/Nexus/_memory/patterns/shopify-workflow.md` — bestehendes Pattern
- `~/Cortex/Nexus/_memory/patterns/shopify-custom-app-token.md` — **neu in Session 3**
- `~/Cortex/Nexus/Second Brain/30 Tutorials/Webentwicklung/Shopify & Liquid/05-admin-api-token-custom-app.md` — **neu in Session 3**
- `.env.local` (lokal, nicht im Git) enthält Admin-API-Token, Store-Domain

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

> **„Cortex-Web Phase-2-Setup abgeschlossen (Custom App `Cortex-Web Adapter`,
> Admin-API-Token für `juvantis.myshopify.com` in `.env.local`, verifiziert
> HTTP 200). Session-3-Dateien sind uncommitted.
>
> Soll ich (a) erst die Session-3-Änderungen committen (Commit-Vorschlag in
> §4 P0 der SESSION_RESUME.md), oder (b) direkt mit Phase-2-Spec beginnen
> (`specs/phase-2/POC_SHOPIFY_ADAPTER.md` nach Architekten-Modus Phase 1
> Verständnis-Sicherung)? Oder (c) beides nacheinander?"**

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
- **Kein Zurücklesen/Loggen des Shopify-Client-Secrets** oder `SHOPIFY_ADMIN_TOKEN` im Chat — auch nicht in Tool-Results oder Debug-Ausgaben
- **Keine Scope-Erweiterung ohne Go** — Scope-Änderung erfordert App-Neuinstallation, alter Token wird ungültig, `sync-shopify.sh`-Läufe unterbrechen

---

## §8 Session-Historie

| Session | Datum | Phase | Ergebnis | Commit(s) |
|---------|-------|:-----:|----------|-----------|
| 1 | 2026-04-18 | 0 | Skelett + Regeln + Nexus ✅ | `6178d2f`, `d9577cd` |
| 2 | 2026-04-18 | 1 | POC WP-Adapter End-to-End ✅, Local-WP-Setup dokumentiert, Pattern + Tutorial | `778635c`, `19fd8ce` |
| 3 | 2026-04-18 | 2 (Setup) | Shopify Custom App + Admin-API-Token ✅, OAuth-Catcher-Pattern + Tutorial, MEMORY-Update (`medzpoint` → `juvantis.myshopify.com`) | *(uncommitted — siehe §4 P0)* |
| *(4)* | *tbd* | *2 (Spec+Adapter)* | *POC Shopify-Adapter — Spec + Implementation* | — |

---

*Stand: 2026-04-18, Ende Session 3. Nächste Session: Phase-2-Spec + Adapter per „Projekt fortsetzen Cortex-Web".*
