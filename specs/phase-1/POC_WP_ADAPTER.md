# POC_WP_ADAPTER — Phase 1 Spec

> **Status:** Lösungsdesign (Architekten-Modus Phase 2), wartet auf Freigabe.
> **Vorgänger-Entscheidungen:** `projects/praxis-redesign/specs/bridge-strategy/02_ENTSCHEIDUNGEN_FINAL.md`
> **Phase:** 1 von 5 (ARCHITECTURE.md §3)
> **Erstellt:** 2026-04-18
> **Scope:** 1 Produkt aus Trunk → 1 WP-Page auf Local-WP, HWG-konform, idempotent.

---

## 1. Verständnis-Sicherung (WORKING_MODE §Phase 1)

### 1.1 Zielzustand — was ist am Ende wahr?

- Es existiert genau **ein** Beispielprodukt `trunk/content/products/bluttests/basic-check.yaml` nach Schema `trunk/schema/product.schema.json`.
- `bash tools/validate.sh` validiert den Trunk mit AJV und läuft grün.
- `bash tools/sync-wp.sh` rendert das Produkt in der `views.praxis`-Sicht und erstellt / aktualisiert eine WordPress-Page auf Local-WP (`http://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/`) via **REST-API + Application-Password**.
- Die erzeugte WP-Page enthält Titel, Tagline, Beschreibung, Laborparameter-Tabelle und einen Partnerinfo-CTA nach Juvantis. Sie enthält **keinen Preis** und **keinen Kauf-CTA** (CW-005 / HWG).
- Ein zweiter Lauf von `sync-wp.sh` erzeugt keine zweite Page, sondern aktualisiert die bestehende (Idempotenz).
- Kein Byte wurde im praxis-redesign-Theme (`wp-content/themes/praxiszentrum/`) geändert. Keine DB-Migration. Kein Touch von `wp-config.php`.

### 1.2 Constraints — was darf nicht passieren?

| ID | Constraint | Herkunft |
|---|---|---|
| C-1 | Kein Preis, kein Kauf-CTA auf Praxis-View | CW-005, HWG §11 |
| C-2 | Keine Änderung an `wp-config.php` oder `themes/praxiszentrum/` | User-Safety, Sprint-2-Schutz |
| C-3 | Keine Credentials im Git-Repo (nicht in `.env.template`, nirgends) | SESSION_RESUME §7 |
| C-4 | Kein Push zu Prod-WP oder Prod-Shopify | SESSION_RESUME §7 |
| C-5 | Idempotenz: Re-Run erzeugt keine Duplikate | Architekten-Modus: deterministisch |
| C-6 | AJV-Validation ist Build-Gate — schlägt sie fehl, läuft der Adapter nicht | CW-002 |

### 1.3 Implizite Annahmen — was gehe ich stillschweigend an?

| ID | Annahme | Wie prüfe ich sie vor Umsetzung? |
|---|---|---|
| A-1 | Local-WP läuft und REST-API ist erreichbar unter `/wp-json/wp/v2/` | `curl -s http://…local/wp-json/` gibt HTTP 200 + JSON-Root |
| A-2 | Dr. Stracke legt vor dem Adapter-Run 1 Application-Password für einen Admin-User im Local-WP an | siehe §2.5 „Pre-Step" |
| A-3 | Der Page-Slug `basic-check` kollidiert nicht mit einer existierenden Page | vor dem ersten Run `GET /pages?slug=basic-check` — wenn Treffer: Config-Flag `ALLOW_OVERWRITE=1` setzen |
| A-4 | Blocksy-Child-Theme `praxiszentrum` rendert normale WP-Pages korrekt (Adapter liefert Standard-Content, keine Custom-Blocks) | manueller Browser-Test der erzeugten Page |
| A-5 | Die erzeugte Page ist ein unabhängiger `post_type=page`-Eintrag, **kein** Custom Post Type. Keine Plugin-Abhängigkeit | Adapter-Code nutzt nur `/wp/v2/pages` Standard-Endpoint |

---

## 2. Lösungsdesign (WORKING_MODE §Phase 2)

### 2.1 Datei-Struktur (wird durch Umsetzung angelegt)

```
projects/Cortex-Web/
├── trunk/
│   ├── schema/product.schema.json          [konkretisiert aus Platzhalter]
│   └── content/products/bluttests/
│       └── basic-check.yaml                [neu, nach 02_ENTSCHEIDUNGEN §3.1]
│
├── adapters/wordpress/
│   ├── build.mjs                           [neu — YAML → Page-Payload (Gutenberg-HTML)]
│   ├── content-to-wp-pages.mjs             [neu — REST-Client mit Basic-Auth]
│   └── lib/
│       ├── renderers/product-praxis.mjs    [neu — View-Renderer Praxis]
│       └── rest-client.mjs                 [neu — dünner fetch-Wrapper + Auth]
│       (deps ajv + js-yaml kommen aus Root-package.json, kein separates package.json)
│
├── tools/
│   ├── validate.sh                         [neu — AJV-Validation]
│   ├── sync-wp.sh                          [neu — build + push, liest .env.local]
│   └── README.md                           [aktualisiert]
│
├── .env.local.template                     [neu — WP_REST_BASE, WP_USER, WP_APP_PASSWORD]
├── .env.local                              [nicht im Git — Dr. Stracke trägt sein App-PW ein]
└── .gitignore                              [ergänzt um .env.local]
```

**Keine Berührung** von: `sites/`, `adapters/shopify/`, `adapters/ios/`, `trunk/content/pages/`, `trunk/design/`, `trunk/media/`.

### 2.2 Schema — `trunk/schema/product.schema.json`

Konkretisiert aus dem Platzhalter, strikt gegen die Vorlage `02_ENTSCHEIDUNGEN_FINAL.md §3.1`:

- **Pflichtfelder Top-Level (sprach-invariant):** `id`, `sku`, `category`, `status`, `parameters[]`, `title` (mit `.de`), `views.juvantis`, `views.praxis`.
- **Pflichtfelder pro View:** `show_price` (bool), `cta_label` (mit `.de`), `cta_url` (string).
- **Optionale Felder:** `price_eur`, `images.hero`, `images.gallery`, `tagline`, `beschreibung`, weitere Sprachen (`en`, `fr`, `es`).
- **Validierungsregeln (I-2 hybrid, CW-004):**
  - Jedes mehrsprachige Objekt MUSS `.de` enthalten (AJV `required: ["de"]`).
  - `status ∈ {active, draft, archived}`.
  - `views.praxis.show_price` MUSS `false` sein (JSON-Schema `const: false`) → statische HWG-Absicherung.
  - `views.praxis.cta_url` MUSS entweder intern (`/`-prefix) **oder** `https://sanexio.eu/…` sein (regex).
- Schema-Version im File: `"$id": "https://cortex-web.local/schemas/product-v1.json"`.

### 2.3 Beispiel-Inhalt — `basic-check.yaml`

Inhalt 1:1 wie `02_ENTSCHEIDUNGEN_FINAL.md §3.1 basic-check.yaml`. Keine eigenen Ergänzungen, keine Interpretationen.

### 2.4 Adapter-Mechanik

```
sync-wp.sh
 └─▶ validate.sh               (AJV über alle trunk/schema/*.json)
       └─▶ bun adapters/wordpress/build.mjs <content-file>
             ├─ YAML parse (js-yaml)
             ├─ Schema-Validation erneut (defensive)
             ├─ Renderer product-praxis.mjs
             │   ├─ Titel:   headline_override.de || title.de
             │   ├─ Body (Gutenberg-Blocks, HTML):
             │   │   1. Paragraph „tagline.de"  (wenn gesetzt)
             │   │   2. Paragraph „beschreibung.de"
             │   │   3. Heading „Laborparameter"
             │   │   4. Table 2-spaltig (code | einheit)
             │   │   5. Button-Block CTA → cta_url, label = cta_label.de
             │   ├─ slug:    id  (z.B. „basic-check")
             │   ├─ status:  publish
             │   └─ meta:    _cortex_web_source = <Pfad im Trunk>
             └─ Payload-JSON an stdout (für Debugging) + an Client
       └─▶ bun adapters/wordpress/content-to-wp-pages.mjs
             ├─ GET /wp-json/wp/v2/pages?slug=basic-check
             ├─ wenn leer → POST /pages       (Create)
             │  wenn 1   → PUT  /pages/:id    (Update)
             │  wenn >1 → ERROR (mehrdeutig, abbrechen)
             └─ HTTP-Check (2xx) → Exit 0, sonst Exit 1 + Fehler in stderr
```

### 2.5 Credentials — non-secret-Handling

- **Pre-Step (einmalig, Dr. Stracke):**
  1. Local-WP aufrufen: `http://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/wp-admin/`
  2. *Benutzer → Profil → Anwendungspasswörter → Neuen Namen: `cortex-web-adapter` → Hinzufügen*
  3. Generiertes Passwort in `projects/Cortex-Web/.env.local` eintragen (siehe Template).

- **`.env.local.template` (im Git, leere Werte):**
  ```
  WP_REST_BASE=http://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/wp-json
  WP_USER=
  WP_APP_PASSWORD=
  ```
- **`.env.local`** (nicht im Git, `.gitignore`-Eintrag): wird von Dr. Stracke manuell gefüllt, von `sync-wp.sh` via `set -a; source .env.local; set +a` geladen.
- REST-Client sendet `Authorization: Basic base64(WP_USER:WP_APP_PASSWORD)`.
- Niemals Secrets loggen. Fehler-Output maskiert Password (`***`).

### 2.6 Alternativen-Abwägung (dokumentiert, um die Wahl nachvollziehbar zu machen)

| Alternative | Warum verworfen |
|---|---|
| WP-CLI direkt (ursprüngliche Option A) | Local bindet MySQL auf Port 10004, `wp-config.php`-Konstante `DB_HOST='localhost'` findet den Socket nicht, WP-CLI-`--require`-Override greift zu spät (wp-config lädt zuerst). Saubere Umsetzung erfordert Patch an einer aktiv genutzten Dev-Site → C-2-Verletzung. |
| Separate Local-Site für POC | Zusätzlicher manueller GUI-Schritt in Local, keine DB-Ersparnis, identische Auth-Frage käme erneut. |
| File-basiert (PHP-Partial ins Theme) | Keine echte WP-Page-Entity → weiter entfernt vom Phase-4-Zielbild, bricht Verify-Mechanismen (Page-ID, Slug, Permalink). |
| REST-API ohne App-Password (Cookie-Auth) | Erfordert Browser-Session-Nonce, nicht sauber automatisierbar. |
| **REST-API + Application-Password (gewählt)** | Standard-WP-Feature seit 5.6, kein Plugin nötig, nicht-invasiv, idempotent, läuft identisch gegen Staging/Prod (Phase 4+). |

### 2.7 Offene Detail-Entscheidungen (werden im Code festgeschrieben, kein Blocker)

- **Slug-Quelle:** `id`-Feld (stabil, wie 02-Dok vorsieht) — nicht `title.de` (kann sich ändern).
- **Page-Status bei Erstanlage:** `publish` (POC soll sichtbar sein). Override via ENV `WP_PAGE_STATUS=draft` optional.
- **Idempotenz-Identifikator:** `slug`. Alternative `meta._cortex_web_source` ist stabiler, aber Such-Endpoint benötigt dafür Query-Extender. → In Phase 1 Slug-Basis, in Phase 2/3 ggf. Meta-Basis upgraden.
- **Error-Handling:** `sync-wp.sh` setzt `set -euo pipefail`. Adapter-Fehler → non-zero Exit + nackte Stderr-Zeile `ADAPTER_ERROR: <key>: <message>`.

---

## 3. Akzeptanzkriterien (Selbstprüfung Phase 4 messbar)

Ein Kriterium gilt als erfüllt, wenn es manuell oder automatisiert nachweisbar ist.

| # | Kriterium | Nachweis |
|---|---|---|
| AK-1 | `bash tools/validate.sh` läuft grün (Exit 0) | Terminal-Output |
| AK-2 | `bash tools/sync-wp.sh` läuft grün (Exit 0) | Terminal-Output |
| AK-3 | `GET /wp-json/wp/v2/pages?slug=basic-check` liefert genau 1 Treffer | `curl`-Response JSON |
| AK-4 | Browser-Aufruf der Page zeigt Titel, Tagline, Beschreibung, 15-zeilige Laborparameter-Tabelle, Partnerinfo-CTA | Screenshot in `specs/phase-1/evidence/` |
| AK-5 | Auf der Page steht **kein** Preis, **kein** Kauf-CTA (Text-Suche nach „€", „99", „buchen", „kaufen" — alle 0 Treffer) | `curl http://…local/basic-check/ \| grep -c` (alle = 0) |
| AK-6 | Zweiter Lauf von `sync-wp.sh` lässt Page-Anzahl unverändert; `modified_gmt` der Page wird aktualisiert | `GET /pages?slug=…` vor/nach — Count identisch, `modified` neu |
| AK-7 | `wp-config.php` im Local-WP hat identisches mtime wie vor dem Adapter-Lauf | `stat -f %m wp-config.php` vor/nach |
| AK-8 | Das praxis-redesign-Theme-Verzeichnis hat identischen Stand (`git status` im Theme-Repo zeigt „working tree clean") | `git status` Output |
| AK-9 | Keine Preise, Kauf-CTAs oder `views.juvantis`-Strings im HTML der Page | HTML-Grep |
| AK-10 | `.env.local` ist **nicht** im Git-Status (`git status` listet es nicht als untracked) | `git status` Output |

**Umsetzung gilt als 100 %**, wenn AK-1 … AK-10 alle erfüllt sind.

---

## 4. Selbstprüfungs-Plan (Phase 4)

Nach der Umsetzung läuft Claude diese Checks **vor** der Abschlussmeldung an Dr. Stracke:

1. Alle Pflichtfelder in `basic-check.yaml` gegen `§1.1 Zielzustand` abgehakt.
2. Adapter-Code auf FK-1 … FK-5-Symptome (WORKING_MODE §Fehlerklassen) durchgehen:
   - FK-1 Missverständnis — Spec vs. Code-Pfad Diff?
   - FK-2 Scheinverständnis — ist der Symptom-Fix (Page erscheint) auch der Ursachen-Fix (korrektes View-Rendering)?
   - FK-3 Plausible Scheinlösung — Preis wirklich abwesend (nicht nur versteckt)?
   - FK-4 Iteration — wurde dieselbe Datei >3× editiert wegen desselben Themas?
   - FK-5 Kontextverlust — stimmt `.env.local`-Pfad in allen Skripten?
3. AK-1 … AK-10 durchlaufen, Ergebnisse protokollieren.
4. Score 0–100 % ermitteln. Abweichungen explizit auflisten.

---

## 5. Out-of-Scope (Phase 1)

Wird **nicht** in Phase 1 gebaut:

- Medien-Upload (Registry, Shopify-Files, lokaler `_media-source/`) → Phase 2
- Shopify-Adapter → Phase 2
- Mehrere Produkte / Produkt-Listen → Phase 3
- Page-Hierarchie, Menü-Integration in WP → separat, nicht POC
- i18n-Rendering auf der WP-Seite (nur `.de` gerendert, andere Locales erst mit Plugin-Entscheidung)
- Cache-Buster, Permalink-Struktur-Check, WP-SEO-Plugin-Interaktion

---

## 6. Freigabe-Erwartung

Bei **„Go"**:
- Claude startet Phase 3 Umsetzung deterministisch in der Reihenfolge §2.1 (Schema → Content → Adapter → Tools → ENV-Template → .gitignore).
- Dr. Stracke legt parallel (oder vorher) das Application-Password an (§2.5).
- Abschluss mit Selbstprüfung §4 + Ergebnis-Report.

Bei **„Stop"** oder Rückfragen:
- Spec wird überarbeitet. Kein Code.

---

*Erstellt: 2026-04-18, Architekten-Modus Phase 2, wartet auf Freigabe.*
