# POC_SHOPIFY_ADAPTER — Phase 2 Spec

> **Status:** Lösungsdesign (Architekten-Modus Phase 2), wartet auf Freigabe.
> **Vorgänger-Entscheidungen:** `projects/praxis-redesign/specs/bridge-strategy/02_ENTSCHEIDUNGEN_FINAL.md`, `Cortex-Web/specs/phase-1/POC_WP_ADAPTER.md`, Session-3-Setup (Custom App `Cortex-Web Adapter`, Admin-API-Token in `.env.local`).
> **Phase:** 2 von 5 (ARCHITECTURE.md §3)
> **Erstellt:** 2026-04-19
> **Scope:** Dasselbe Trunk-Produkt `basic-check` → 1 Shopify-Produkt im Store `juvantis.myshopify.com`, Status `draft`, idempotent. Kein Theme-Touch, kein Live-Push.

---

## 1. Verständnis-Sicherung (WORKING_MODE §Phase 1)

### 1.1 Zielzustand — was ist am Ende wahr?

- `bash tools/sync-shopify.sh` rendert `trunk/content/products/bluttests/basic-check.yaml` in der **`views.juvantis`-Sicht** und legt im Store `juvantis.myshopify.com` ein Produkt an oder aktualisiert es per **Admin REST API** (`/admin/api/2026-04/products.json`).
- Das Produkt hat **`status: "draft"`** (Constraint §7), Default-Single-Variant mit `price = price_eur`, `sku = JVT-BLD-001`, Tags `cortex-web,bluttests`, Vendor `Sanexio`.
- `bash tools/validate.sh` validiert weiterhin grün und erhält einen optionalen **Shopify-Connectivity-Check** (`/shop.json` mit Token), aktivierbar per ENV-Flag `CHECK_SHOPIFY=1`.
- Ein zweiter Lauf von `sync-shopify.sh` erzeugt **kein** zweites Produkt, sondern aktualisiert das bestehende (Idempotenz über `handle=basic-check`).
- Kein Byte am Theme `Juvantis/juvantis-web/theme/`. Kein `status=active`. Kein Push zu `published_scope=global`. Keine Berührung von Bildern/Files (Medien = Phase 2b).

### 1.2 Constraints — was darf nicht passieren?

| ID | Constraint | Herkunft |
|---|---|---|
| C-1 | **`status: "draft"` Pflicht** — Adapter darf niemals `active` setzen | SESSION_RESUME §7 |
| C-2 | Keine Berührung von `Juvantis/juvantis-web/theme/` (Auto-Sync-Hook!) | CW-Verbote, R-007/R-008 |
| C-3 | Keine Credentials im Repo (Token nur in `.env.local`, gitignored) | SESSION_RESUME §7, secrets-Rule |
| C-4 | CW-001 Trunk-Master — keine direkten Shopify-Admin-Edits an Adapter-Produkten | CW-001 |
| C-5 | Idempotenz: Re-Run erzeugt keine Duplikate (`handle`-Lookup, max 1 Treffer) | Architekten-Modus deterministisch |
| C-6 | CW-002 Schema-Validation als Build-Gate (AJV identisch zu Phase 1) | CW-002 |
| C-7 | Adapter rendert **nur** `views.juvantis` — `views.praxis` wird ignoriert (HWG-getrennt) | CW-005 |
| C-8 | Keine Scope-Erweiterung der Custom App ohne Go (würde Token invalidieren) | SESSION_RESUME §7 |
| C-9 | Token + Client-Secret nie in Logs/Stderr — Mask-Pattern wie Phase 1 (`***`) | secrets-Rule |
| C-10 | Keine Berührung von `images.*` aus Trunk in Phase 2 (Medien = Phase 2b) | SESSION_RESUME §4 P1 |

### 1.3 Implizite Annahmen

| ID | Annahme | Prüfweg vor Umsetzung |
|---|---|---|
| A-1 | API-Version `2026-04` gilt weiter | bereits durch Session-3-`/shop.json` HTTP 200 verifiziert |
| A-2 | Im Store gibt es noch kein Produkt mit `handle=basic-check` | `GET /products.json?handle=basic-check` → leeres Array |
| A-3 | Basic-Plan erlaubt das Anlegen (100-Produkt-Limit ungebrochen) | Store-Metadata zeigte Plan `basic` und ausreichend Headroom |
| A-4 | Theme-Sections rendern Standard-Produkte korrekt (Adapter liefert nur Daten, kein Custom Liquid) | Storefront-Preview im Admin (Draft-Preview-URL) nach erstem Run |
| A-5 | Token-Scopes `write_products` decken Anlage + Update + Tag/Vendor/Status | Shopify-Doku: alles unter `products.json`-Endpoint enthalten |
| A-6 | Default-Variante reicht — kein Variant-Setup nötig | Trunk hat keine Variant-Definition; Shopify legt Default-Variant automatisch an |

---

## 2. Lösungsdesign (WORKING_MODE §Phase 2)

### 2.1 Datei-Struktur (wird durch Umsetzung angelegt)

```
projects/Cortex-Web/
├── adapters/shopify/
│   ├── README.md                              [aktualisiert — bisher Platzhalter]
│   ├── build.mjs                              [neu — YAML → Shopify-Product-Payload]
│   ├── products-to-shopify.mjs                [neu — REST-Idempotent-Sync]
│   └── lib/
│       ├── shopify-rest-client.mjs            [neu — Token-Header-Wrapper, Mask, Rate-Limit-Awareness]
│       └── renderers/product-juvantis.mjs     [neu — View-Renderer Juvantis]
│
├── tools/
│   ├── sync-shopify.sh                        [neu — analog sync-wp.sh, lädt .env.local, Pipeline validate→build→push]
│   └── validate.sh                            [erweitert — optionaler Shopify-Connectivity-Check via CHECK_SHOPIFY=1]
│
├── .env.local.template                        [bereits gepflegt in Session 3 — keine Änderung]
└── specs/phase-2/
    ├── POC_SHOPIFY_ADAPTER.md                 [diese Spec]
    └── evidence/                              [neu — Screenshots, curl-Logs, Diff-Reports nach Selbstprüfung]
```

**Keine Berührung** von: `sites/`, `adapters/wordpress/`, `adapters/ios/`, `trunk/`, `Juvantis/juvantis-web/theme/`, Praxis-Theme.

### 2.2 Schema — kein Schema-Change

`trunk/schema/product.schema.json` bleibt unverändert (bereits in Phase 1 finalisiert). `views.juvantis` ist im Schema bereits Pflicht und enthält `show_price`, `cta_label`, `cta_url`. Phase 2 ist reiner Adapter-Build, kein Schema-Eingriff.

### 2.3 Adapter-Mechanik

```
sync-shopify.sh
 └─▶ validate.sh                              (AJV über trunk/schema/*.json + optional CHECK_SHOPIFY=1 → /shop.json)
       └─▶ bun adapters/shopify/build.mjs <content-file>
             ├─ YAML parse (js-yaml)
             ├─ Schema-Validation defensiv (AJV)
             ├─ Renderer product-juvantis.mjs:
             │   ├─ handle:           id  (= "basic-check")
             │   ├─ title:            title.de
             │   ├─ body_html:        Renderer-Output (siehe §2.4)
             │   ├─ vendor:           "Sanexio"
             │   ├─ product_type:     category  (= "bluttests")
             │   ├─ tags:             "cortex-web, bluttests"
             │   ├─ status:           "draft"      ← C-1 hartcodiert, nicht ENV-konfigurierbar
             │   ├─ published_scope:  "web"        (Default; nicht "global")
             │   └─ variants[0]:
             │       ├─ option1: "Default"
             │       ├─ sku:     sku  (= "JVT-BLD-001")
             │       ├─ price:   String(price_eur)  (Shopify erwartet String)
             │       ├─ inventory_management: null
             │       └─ requires_shipping:    false  (Bluttest = Dienstleistung)
             └─ Payload-JSON an stdout (Debug) + an Sync-Stage
       └─▶ bun adapters/shopify/products-to-shopify.mjs
             ├─ GET /admin/api/2026-04/products.json?handle=basic-check&fields=id,handle,status,updated_at
             ├─ wenn 0 Treffer  → POST /products.json   {"product": {...}}            (Create)
             │  wenn 1 Treffer  → PUT  /products/:id.json {"product": {id, ...}}      (Update — id MUSS im Body stehen)
             │  wenn ≥2 Treffer → ERROR „handle ambiguous", Exit 1                    (deterministisch, kein implizites Merge)
             ├─ Wenn ALLOW_OVERWRITE!=1 und vorhandenes Produkt hat status=active oder published_at!=null:
             │       ERROR „target product is published — set ALLOW_OVERWRITE=1 to proceed", Exit 1
             ├─ HTTP-Check (2xx) → Exit 0 + Ausgabe `OK product_id=<id> handle=<handle> updated_at=<ts>`
             └─ Sonst: Exit 1 + maskierte Fehlermeldung
```

### 2.4 Renderer `product-juvantis.mjs` — `body_html`

Knapp, themeneutral, kein eigenes Layout (Theme rendert Preis/Variante/Bilder eigenständig — R-018-Designsystem bleibt unangetastet):

```
1. <p class="cw-tagline">{tagline.de}</p>            (nur wenn vorhanden)
2. <p class="cw-beschreibung">{beschreibung.de}</p>  (Block-zu-<br/>-Konvertierung erhalten)
3. <h3>Laborparameter</h3>
4. <table class="cw-laborparameter">
     <thead><tr><th>Code</th><th>Einheit</th></tr></thead>
     <tbody>{ parameters.map → <tr><td>code</td><td>einheit</td></tr> }</tbody>
   </table>
```

`cta_label` und `cta_url` aus `views.juvantis` werden **nicht** in `body_html` gerendert — auf Shopify übernimmt der Theme-Kauf-Button diese Funktion. (Phase-2b-Hook: Falls später ein zusätzlicher Sekundär-CTA gewünscht ist, kann das Template ergänzt werden.)

### 2.5 Credentials — Wiederverwendung Session-3-Setup

- `.env.local` enthält bereits (verifiziert):
  ```
  SHOPIFY_CLIENT_ID=19fe6e2bd121da1592ac75d27b167e72
  SHOPIFY_CLIENT_SECRET=<gesetzt>
  SHOPIFY_STORE=juvantis.myshopify.com
  SHOPIFY_ADMIN_TOKEN=shpat_…
  ```
- `sync-shopify.sh` lädt analog Phase 1: `set -a; source .env.local; set +a`
- `shopify-rest-client.mjs` nutzt Header `X-Shopify-Access-Token: $SHOPIFY_ADMIN_TOKEN` und `Content-Type: application/json`. Basis-URL: `https://${SHOPIFY_STORE}/admin/api/2026-04`.
- **Token-Maskierung:** Stderr-Ausgaben ersetzen den vollständigen Token-String durch `***` (analog `maskPassword` in `wordpress/lib/rest-client.mjs`).
- **Client-Secret** wird in Phase 2 gar nicht gebraucht (nur Admin-Token nötig); bleibt in `.env.local` für eventuelle Re-Authorize-Läufe.

### 2.6 Rate-Limit-Awareness

Shopify REST: leaky bucket 40 Calls, Leak 2 Calls/s. Pro Sync-Lauf benötigt der Adapter genau **2 Requests** (1× GET, 1× POST/PUT) — weit unter dem Limit. Keine spezielle Throttling-Logik nötig. Bei `429 Too Many Requests` bricht der Adapter ab (Exit 1 mit Hinweis), keine automatische Retry-Schleife (Architekten-Modus: deterministisch, kein verstecktes Verhalten).

### 2.7 Alternativen-Abwägung (zur Nachvollziehbarkeit der Wahl)

| Alternative | Warum verworfen |
|---|---|
| **Shopify Page** statt Product | Kein Preis/Variant-Slot, CTA `/products/basic-check` aus Trunk wäre semantisch falsch, kein Storefront-Kauf-Flow. Phase 4/5-Subsumierung ginge an realer Site-Struktur vorbei. |
| **GraphQL Admin API** | Cost-basiertes Limit und Mutation-Bündelung sind für 1 Produkt überdimensioniert. Eigener Query-Builder = mehr Code. REST liefert Symmetrie zu Phase 1 (`lib/rest-client.mjs`-Vorbild). |
| **SKU-basierte Idempotenz** | Sitzt auf Variant; REST-Lookup über Variant-SKU verlangt Iteration über Produkte oder Variant-Endpoint mit Filter — mehr Code, weniger atomar. Handle-Lookup ist 1 Call. |
| **Metafield-basierte Idempotenz** (`cortex_web.trunk_id`) | Stabilster Marker, aber separater POST `/metafields.json` pro Produkt nötig + Lookup-Endpoint umständlicher. **Phase-2b-Upgrade-Pfad explizit vorgesehen** (siehe §6). |
| **Smart-Collection automatisch anlegen** | Setzt Admin-UX-Schritt voraus, ist Theme/UX-Frage, nicht Adapter-Frage. Tags als Marker reichen für Phase 2. |
| **Status `active` mit `published_scope=none`** | Risiko, dass Theme-Storefront-Logik Produkt versehentlich anzeigt. `status=draft` ist die sauberste Constraint-Erfüllung (C-1). |
| **Bilder direkt in Phase 2 hochladen** | Medien-Pipeline ist explizit Phase-2b-Scope (SESSION_RESUME §4 P1) — separater Cycle für Registry, lokale Originale (CW-003), Hash-Dedupe. |

### 2.8 Offene Detail-Entscheidungen (im Code festgeschrieben, kein Blocker)

- **`requires_shipping: false`** — Bluttest ist Praxis-Termin, kein Versand-Artikel. Hardcodiert in Renderer; falls künftige Produkte (Body-Check-Set zum Mitnehmen) Versand brauchen, wird das schemaseitig ergänzt.
- **`inventory_management: null`** — keine Bestandsverwaltung (Dienstleistung).
- **`vendor: "Sanexio"`** — hardcodiert. Ggf. später aus Trunk-Feld ableiten, falls Multi-Vendor.
- **API-Version-Pin:** `2026-04` als Konstante in `shopify-rest-client.mjs`. Update-Pfad bewusst manuell (Shopify-Quartals-Releases).
- **Error-Handling:** `sync-shopify.sh` mit `set -euo pipefail`. Adapter-Fehler → Exit ≠ 0 + nackte Stderr-Zeile `ADAPTER_ERROR: <stage>: <message>` (Token maskiert).

---

## 3. Akzeptanzkriterien (Selbstprüfung Phase 4 messbar)

| # | Kriterium | Nachweis |
|---|---|---|
| AK-1 | `bash tools/validate.sh` läuft grün (Exit 0) | Terminal-Output |
| AK-2 | `CHECK_SHOPIFY=1 bash tools/validate.sh` läuft grün (Token-Check inkl.) | Terminal-Output |
| AK-3 | `bash tools/sync-shopify.sh` läuft grün (Exit 0), Erstanlage | Terminal-Output |
| AK-4 | `GET /admin/api/2026-04/products.json?handle=basic-check` liefert genau 1 Treffer mit `status="draft"` | `curl`-Response |
| AK-5 | Erzeugtes Produkt hat `vendor="Sanexio"`, `product_type="bluttests"`, Tags enthalten `cortex-web` und `bluttests`, Default-Variante mit `sku="JVT-BLD-001"` und `price="99.00"` | JSON-Response des Produkts |
| AK-6 | `body_html` enthält Tagline-, Beschreibung- und 15-zeilige Laborparameter-Tabelle; **keine** Preis-Strings, **keine** CTA-URL aus `views.juvantis.cta_url` (Theme-Sache) | `jq -r '.product.body_html'` + grep |
| AK-7 | Zweiter Lauf von `sync-shopify.sh` lässt Produkt-Anzahl bei `handle=basic-check` unverändert auf 1; `updated_at` aktualisiert sich | vorher/nachher `?handle=basic-check` |
| AK-8 | `published_at` bleibt `null`, Storefront-Aufruf des Produkt-Slugs ohne Preview-Token liefert 404 (Draft-Schutz) | `curl -i https://sanexio.eu/products/basic-check` → `HTTP 404` |
| AK-9 | `Juvantis/juvantis-web/theme/` hat `git status` „working tree clean", keine neuen Theme-Dateien | `git -C juvantis-web/theme status --short` leer |
| AK-10 | `.env.local` ist nicht im Git-Status, `chmod 600` unverändert | `git status` + `ls -la .env.local` |
| AK-11 | Adapter-Stderr bei provoziertem Fehler (Token leer) enthält `***` statt Token-Substring | manueller Negativ-Test |
| AK-12 | Bei zweitem Lauf mit existierendem `published_at!=null` (manuell auf active gesetzt) bricht Adapter mit `ALLOW_OVERWRITE=1`-Hinweis ab; mit gesetztem Flag läuft er durch | manueller Test |

**Umsetzung gilt als 100 %**, wenn AK-1 … AK-12 alle erfüllt sind.

---

## 4. Selbstprüfungs-Plan (Phase 4)

Nach der Umsetzung läuft Claude diese Checks **vor** der Abschlussmeldung:

1. Pflichtfelder `views.juvantis` → Renderer-Output gegen §2.3 abgleichen.
2. Fehlerklassen-Scan (WORKING_MODE §Fehlerklassen):
   - **FK-1 Missverständnis** — Spec-§2.3-Felder vs. Code-Pfad-Diff?
   - **FK-2 Scheinverständnis** — `status=draft` wirklich gesetzt (nicht nur Default-Annahme)?
   - **FK-3 Plausible Scheinlösung** — `body_html` enthält wirklich keine versteckten Preise/CTAs?
   - **FK-4 Iteration** — wurde dieselbe Datei >3× wegen desselben Themas editiert?
   - **FK-5 Kontextverlust** — `.env.local`-Pfad in allen Skripten konsistent? Token-Mask in allen Stderr-Pfaden?
3. AK-1 … AK-12 durchlaufen, Ergebnisse in `specs/phase-2/evidence/<datum>_self-check.md` protokollieren.
4. Score 0–100 % ermitteln. Abweichungen explizit auflisten.

---

## 5. Out-of-Scope (Phase 2)

Wird **nicht** in Phase 2 gebaut:

- Bilder/Medien-Upload (Hero, Gallery) — Phase 2b (Registry, `_media-source/`, Hash-Dedupe, CW-003)
- Mehrere Produkte / Bulk-Sync — Phase 3+
- Variant-Setup (Größen, Pakete) — derzeit nicht im Trunk-Schema
- Kollektions-/Smart-Collection-Pflege — Theme-/UX-Frage
- Preview-/Publish-Workflow (Draft → Active) — bewusst manuell durch Dr. Stracke im Admin
- i18n-Rendering im `body_html` (nur `.de` gerendert; `.en/.fr/.es` warten auf Shopify-Markets-Entscheidung)
- Webhook-basierter Reverse-Sync (Shopify → Trunk) — explizit gegen CW-001 (Trunk-Master)
- Migration zu GraphQL Admin API
- Anbindung an Praxis-Adapter / WP-Side (läuft separat, Phase 1 abgeschlossen)

---

## 6. Phase-2b-Hooks (sichtbar machen, nicht bauen)

Wird in der Folge-Phase aufgesetzt, sobald Phase 2 abgenommen ist:

- **Medien-Pipeline:** `tools/media/register.mjs` (CW-003), Hash-Dedupe, Shopify-Files-Upload, lokale `_media-source/`-Spiegelung.
- **Metafield-Idempotenz** (`namespace=cortex_web`, `key=trunk_id`): stabilerer Marker als Handle, erlaubt parallele Existenz mit Hand-gepflegten Produkten gleicher Slugs.
- **Smart-Collection** „Cortex-Web" (Auto-Filter `tag:cortex-web`) für Admin-Übersichtlichkeit.
- **Sekundär-CTA** im `body_html` (z.B. Link auf Praxis-Erklärseite), falls Dr. Stracke das Pflege-Pattern wünscht.

---

## 7. Out-of-Scope für die Spec selbst (organisatorisch)

- Diese Spec verändert NICHT Juvantis-Theme, NICHT die `medzpoint`-Inkonsistenz in `Juvantis/_config/RULES.md` (das wird in einer reinen Juvantis-Session korrigiert).
- Diese Spec verändert NICHT die Cortex-Web-Phasen-Roadmap (Phase 3 = Review bleibt unverändert).

---

## 8. Freigabe-Erwartung

Bei **„Go"**:
- Claude startet Phase 3 Umsetzung deterministisch in Reihenfolge §2.1
  (Shopify-REST-Client → Renderer → build.mjs → products-to-shopify.mjs → sync-shopify.sh → validate.sh-Erweiterung → README aktualisieren).
- Der Token-Smoke-Test (`CHECK_SHOPIFY=1 bash tools/validate.sh`) wird vor dem ersten echten Push einmal manuell ausgeführt.
- Abschluss mit Selbstprüfung §4 + Ergebnis-Report + Empfehlung „Session beenden" (LL-042).

Bei **„Stop"** oder Rückfragen:
- Spec wird überarbeitet. Kein Code.

---

*Erstellt: 2026-04-19, Architekten-Modus Phase 2, wartet auf Freigabe.*
