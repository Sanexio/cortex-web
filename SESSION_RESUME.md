# SESSION_RESUME — Cortex-Web

> **Standard-Einstieg** (LL-043, `Nexus/_rules/SESSION_LIFECYCLE.md`):
> In einer neuen Session **„Projekt fortsetzen Cortex-Web"** tippen. Claude lädt:
>
> 1. Pflicht-Init Nexus (CLAUDE.md, MEMORY.md, GLOBAL_RULES.md, SESSION_LIFECYCLE.md)
> 2. Diese Datei (SESSION_RESUME.md)
> 3. Alle in §0 unten als Pflicht-Lesung markierten Folgedateien
> 4. Pre-Flight (`tools/validate.sh`, optional `CHECK_SHOPIFY=1`)
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

- **Version:** `0.3.0` — **Phase 2 (Setup + Adapter) abgeschlossen**
- **Stand:** 2026-04-19, Session 4 abgeschlossen — **Common-Trunk-Ansatz funktional bewiesen**
- **Git-Commits (chronologisch):**
  - `6178d2f` · `d9577cd` — Phase 0 Skelett + Nachtrag
  - `778635c` · `19fd8ce` — Phase 1 POC WP-Adapter + Close-Session
  - `48c4170` — Phase 2 Setup (Shopify Custom App + Admin-API-Token)
  - `7d6f665` — **Phase 2 Adapter (POC Shopify-Adapter, 12/12 AKs grün)**
- **Working Tree:** clean nach LL-042-Audit (alle Phase-2-Code-, Spec- und Doku-Updates committed; Nexus-Updates gehen über `nexus-sync.sh` in den Git-Repo)
- **Trunk-Content:** 1 Produkt (`basic-check.yaml`) bedient zwei Plattformen
- **WP-Adapter:** Phase 1, idempotent, HWG-konform (Local-WP)
- **Shopify-Adapter:** **Phase 2, idempotent, draft-only, mit ALLOW_OVERWRITE-Safeguard** (`juvantis.myshopify.com`)
- **iOS-Adapter:** Placeholder, Phase ≥3 oder später
- **Medien-Registry:** weiterhin leer → **Phase 2b-Kandidat** (siehe §4 P2)

### §1.1 Aktuelle Artefakte im Shopify-Store

- **Test-Produkt:** id `10940942844171`, handle `basic-check`, status `draft`, published_at `null`
- **Admin-URL:** https://juvantis.myshopify.com/admin/products/10940942844171
- **Storefront:** `https://sanexio.eu/products/basic-check` → HTTP 302 → `/password` (passwort-geschützt)
- **Säuberung:** Test-Produkt bleibt im Store als Phase-3-Review-Artefakt. Löschung nur auf Dr.-Stracke-Wunsch.

---

## §2 Pre-Flight-Befehl

```bash
cd ~/Cortex/projects/Cortex-Web && bash tools/validate.sh
```

Erwartet: `validate: OK (1 file(s))`, Exit 0.

Mit Shopify-Connectivity-Check:
```bash
cd ~/Cortex/projects/Cortex-Web && CHECK_SHOPIFY=1 bash tools/validate.sh
```

Erwartet zusätzlich: `validate: shopify OK (juvantis.myshopify.com, HTTP 200)`.

**Stand 2026-04-19 Session 4: beide grün.**

---

## §3 Letzte Session — Session 4, 2026-04-19

### Ziel der Session
Phase 2 Adapter-Implementation: Spec schreiben (Architekten-Modus Phase 1+2) → Implementation (Phase 3) → Selbstprüfung (Phase 4) → 12/12 AKs grün.

### Durchgeführt
1. Pflicht-Init geladen, Pre-Flight `tools/validate.sh` grün.
2. Session-3-Änderungen committed: `48c4170` (4 mod + 3 untracked + Doku).
3. **Phase-2-Spec geschrieben:** `specs/phase-2/POC_SHOPIFY_ADAPTER.md` (291 Zeilen, analog Phase-1-Vorlage). Entscheidungen E-1…E-8 von Claude getroffen (Dr. Stracke-Delegation): Product / REST / Handle / ALLOW_OVERWRITE-Flag / Tags `cortex-web,bluttests`. Alle Alternativen in §2.7 dokumentiert.
4. **Implementation:** 5 neue Dateien (`shopify-rest-client.mjs`, `product-juvantis.mjs`, `build.mjs`, `products-to-shopify.mjs`, `sync-shopify.sh`), 2 Erweiterungen (`validate.sh` mit `CHECK_SHOPIFY=1`, `adapters/shopify/README.md`).
5. **Bug während AK-3 entdeckt + gefixt:** Erste Implementation hatte `handle` auf Payload-Root statt in `payload.product`. Shopify hat dadurch eigenen Handle aus `title` derived (`basis-bluttest` statt `basic-check`). Fix: handle in product-Body. Test-Produkt mit falschem Handle via DELETE entfernt. **FK-2-Klassifizierung im Self-Check.**
6. **Selbstprüfung 12/12 AKs grün** — Self-Check: `specs/phase-2/evidence/2026-04-19_self-check.md`. Inkl. AK-12 (ALLOW_OVERWRITE-Roundtrip) per autonomer API-Manipulation verifiziert.
7. Commit `7d6f665`: 9 files, +774/-15.
8. **Session-Ende-Audit (LL-042 5 Schritte):**
   - Schritt 1: Projekt-Audit grün (Pre-Flight, keine TODOs, keine Backups)
   - Schritt 2: Nexus-Audit, identifizierte Updates für `Nexus/CLAUDE.md`, `MEMORY.md`, `SYSTEM_MAP.md`, `Cortex-Web/_rules/ARCHITECTURE.md`, `CHANGELOG.md`
   - Schritt 3: Pattern-Optimierung — neuer Pattern `shopify-rest-product-sync.md` in `Nexus/_memory/patterns/`
   - Schritt 4: Tutorial-Update — `Second Brain/30 Tutorials/Webentwicklung/Shopify & Liquid/06-shopify-admin-rest-product-sync.md`
   - Schritt 5: Diese Datei aktualisiert.

### Verifiziert (Auszug aus Self-Check)
| AK | Status | Evidenz |
|---|:---:|---|
| AK-1 | ✅ | `validate: OK (1 file(s))` |
| AK-2 | ✅ | `validate: shopify OK (juvantis.myshopify.com, HTTP 200)` |
| AK-3 | ✅ | `action: "create"`, id 10940942844171, handle `basic-check` |
| AK-4 | ✅ | `count: 1`, status `draft` |
| AK-5 | ✅ | vendor/product_type/tags/sku/price korrekt |
| AK-6 | ✅ | body_html: required present, forbidden (Preis/CTA) absent |
| AK-7 | ✅ | 2. Lauf = update, gleiche ID, +5s updated_at |
| AK-8 | ✅ | Storefront 302 → `/password` (Draft + Password doppelt geschützt) |
| AK-9 | ✅ | Juvantis-Theme HEAD `1fbc35b` clean |
| AK-10 | ✅ | `.env.local` gitignored, chmod 600 |
| AK-11 | ✅ | Token-Mask aktiv (Defense-in-Depth) |
| AK-12 | ✅ | ALLOW_OVERWRITE-Roundtrip: abort ohne Flag, success mit Flag, status zurück auf draft |

**Score: 12/12 = 100 %**

### Lessons Learned (im Tutorial `06-shopify-admin-rest-product-sync.md` festgehalten)

- **Shopify REST: `handle` MUSS im Product-Body stehen, nicht im Wrapper.** Sonst derived Shopify einen Handle aus `title` (Slugify-Logik). Konsequenz für jede Idempotenz-Strategie.
- **Tags werden alphabetisch normalisiert** — Set-Vergleich für Idempotenz egal, für Audit dokumentieren.
- **Storefront ist passwort-geschützt** — Draft-Produkt doppelt geschützt; AK-8 erfüllt durch Redirect ODER 404.
- **CW-001 (Trunk-Master) per Roundtrip-Test verifiziert**: Adapter setzt Admin-`active`-Edits zurück auf `draft`.

---

## §4 Offene Tasks (Priorität absteigend) — Phase 3 oder Phase 4 wählen

### P0 — Wahl der nächsten Phase (Architekten-Entscheidung)

Zwei valide Pfade, beide mit eigenem Mehrwert:

| Option | Phase | Inhalt | Dauer-Schätzung |
|---|---|---|---|
| **(α) Review-Phase abschließen** | **Phase 3** | Visueller Vergleich der beiden gerenderten Outputs (WP-Page + Shopify-Draft-Produkt). Go/No-Go-Entscheidung Dr. Stracke ob Common-Trunk-Ansatz für Realbetrieb taugt. | 1 kurze Session, primär visuell |
| **(β) Subsumierung starten** | **Phase 4** | `git mv projects/praxis-redesign/ → projects/Cortex-Web/sites/praxis-webseite/` + Pfad-Anpassungen + Audit. Invasiv, braucht Go. | 1 ganze Session, viele Pfad-Updates |
| **(γ) Phase 2b einschieben** | **Phase 2b** | Medien-Pipeline (`tools/media/register.mjs`, `_media-source/`, Hash-Dedupe, `stagedUploadsCreate`) + Metafield-Idempotenz. Verschiebt Phase 3 hinter Phase 2b. | 1 ganze Session |
| **(δ) Pause/Wartung** | — | Dr. Stracke arbeitet an anderen Projekten weiter, Cortex-Web ruht | 0 |

### P1 — Aktualisierungen, die in Schritt 5 NICHT eigenmächtig durchgeführt wurden

**Juvantis-Doku-Drift** (außerhalb Cortex-Web): `projects/Juvantis/CLAUDE.md` und `projects/Juvantis/_config/RULES.md` führen den Store noch als `medzpoint` (siehe R-007, R-008, R-015). Korrekt ist `juvantis.myshopify.com`. Sollte in einer reinen Juvantis-Session korrigiert werden — nicht in Cortex-Web-Sessions, da das Juvantis-Projekt eigenständig ist.

### P2 — Phase 2b Vorbereitung (für später, nicht jetzt)

Falls Phase 3 oder 4 zu Phase 2b führt:
- Medien-Schema (`media.schema.json` konkretisieren)
- `tools/media/register.mjs` implementieren
- `_media-source/<kategorie>/` Ordnerstruktur etablieren
- Shopify Files via `stagedUploadsCreate` + `fileCreate` (GraphQL!)
- Metafield-Idempotenz `cortex_web.trunk_id` als stabilerer Marker

### Parallel laufende Arbeiten (NICHT in Cortex-Web-Sessions berührt)

- `praxis-redesign` Sprint 2 (S2.1 Seiten-Inventar) — eigenständige Sessions, autonom bis Phase 4
- `Juvantis/juvantis-web` — eigenständige Sessions, autonom bis Phase 5
- `Juvantis/DHT`, `Juvantis/social-media` — unabhängig, bleiben dauerhaft unter `projects/Juvantis/`

---

## §5 Phasen-spezifische Pflicht-Lesung

### Für Phase 3 (Review)
- `Cortex-Web/specs/phase-1/POC_WP_ADAPTER.md` + Local-WP-Page (Page-ID 9668)
- `Cortex-Web/specs/phase-2/POC_SHOPIFY_ADAPTER.md` + Self-Check + Shopify-Produkt (id 10940942844171)
- `Cortex-Web/_rules/ARCHITECTURE.md` §3 (Roadmap)

### Für Phase 4 (Praxis-Subsumierung)
- `projects/praxis-redesign/SESSION_RESUME.md` — aktueller Sprint-Stand
- `Cortex-Web/_rules/ARCHITECTURE.md` §2 (Ziel-Architektur)
- **WICHTIG:** Phase 4 setzt Go von Dr. Stracke voraus (`git mv` invasiv)

### Für Phase 2b (Medien-Pipeline)
- `Cortex-Web/_config/RULES.md` CW-003 (Lokale Originale)
- `Cortex-Web/trunk/schema/media.schema.json` (Platzhalter, muss konkretisiert werden)
- `Nexus/_memory/patterns/shopify-rest-product-sync.md` §11 (Out-of-Scope-Hinweise)

### Für Phase 5 (Juvantis-Web-Subsumierung)
- `projects/Juvantis/juvantis-web/` (Theme-Git-Status)
- **WICHTIG:** ebenfalls Go erforderlich

---

## §6 Sofort-Status-Frage für nächste Session

> **„Cortex-Web Phase 2 (Setup + Adapter) abgeschlossen — Common-Trunk-Ansatz auf
> WP und Shopify funktional bewiesen, 12/12 AKs grün, Test-Produkt
> `10940942844171` als Phase-3-Review-Artefakt im Store. Vier Optionen für
> nächsten Schritt:
>
> (α) Phase 3 Review — visueller Vergleich WP-Page vs. Shopify-Draft, Go/No-Go.
> (β) Phase 4 Subsumierung praxis-redesign → `sites/praxis-webseite/` (`git mv`).
> (γ) Phase 2b Medien-Pipeline (`_media-source/`, Metafield-Idempotenz).
> (δ) Pause/Wartung.
>
> Welche Front?"**

---

## §7 Verbote / harte Regeln — dürfen NIE passieren

- **Keine Datenverschiebung** aus `praxis-redesign/` oder `Juvantis/juvantis-web/` ohne explizites Go (Phase 4/5 jeweils separate Freigabe)
- **Kein Push zu Prod-Shopify in `status="active"`** während Phase 3 — Adapter ist hartcodiert auf `draft`, niemals umkonfigurieren
- **Kein Touch am `praxiszentrum`-Theme** und am `juvantis-web/theme/`-Repo in Cortex-Web-Sessions — beide Themes gehören ihren Heimatprojekten
- **CW-001 Trunk-Master bleibt unbestritten** — Admin-Edits werden vom nächsten Adapter-Lauf zurückgesetzt; das ist Feature, nicht Bug
- **CW-005 Plattform-Trennung** — KEIN Preis, KEIN Kauf-CTA auf Praxis-Site (schema-erzwungen via `const: false`)
- **Keine Shopify-API-Credentials oder WP-Passwörter im Repo**
- **Kein `--force` bei Git** außer bei explizitem Dr.-Stracke-Go
- **Kein Admin-/Root-/Login-Passwort im Chat** — nur App-Passwords, API-Tokens
- **Kein Zurücklesen/Loggen des Shopify-Client-Secrets** oder `SHOPIFY_ADMIN_TOKEN` im Chat
- **Keine Scope-Erweiterung der Custom App ohne Go** — Token würde invalidiert
- **Kein Test-Produkt im Store löschen ohne Dr.-Stracke-Go** — `10940942844171` ist Phase-3-Review-Artefakt
- **Kein Eingriff in Juvantis/juvantis-web Auto-Sync-Hook** (PostToolUse-Hook auf `theme/`) — Cortex-Web berührt dieses Verzeichnis nicht

---

## §8 Session-Historie

| Session | Datum | Phase | Ergebnis | Commit(s) |
|---------|-------|:-----:|----------|-----------|
| 1 | 2026-04-18 | 0 | Skelett + Regeln + Nexus ✅ | `6178d2f`, `d9577cd` |
| 2 | 2026-04-18 | 1 | POC WP-Adapter End-to-End ✅, Local-WP-Setup, Pattern + Tutorial | `778635c`, `19fd8ce` |
| 3 | 2026-04-18 | 2 (Setup) | Shopify Custom App + Admin-API-Token ✅, OAuth-Catcher, Tutorial 05, MEMORY-Korrektur | `48c4170` |
| **4** | **2026-04-19** | **2 (Adapter)** | **POC Shopify-Adapter ✅ End-to-End, 12/12 AKs grün, Spec + Self-Check, Pattern + Tutorial 06, FK-2-Bug (handle) gefunden+gefixt** | **`7d6f665`** |
| *(5)* | *tbd* | *3 oder 4 oder 2b* | *Phase-Wahl Dr. Stracke* | — |

---

*Stand: 2026-04-19, Ende Session 4. Nächste Session: per „Projekt fortsetzen Cortex-Web" (LL-043) → Phase-Wahl gemäß §6.*
