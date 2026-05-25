# PHASE_3_REVIEW — Common-Trunk Go/No-Go

> **Status:** Lösungsdesign (Architekten-Modus Phase 2), wartet auf Freigabe.
> **Vorgänger-Evidenz:** `specs/phase-1/POC_WP_ADAPTER.md` (10/10 AK), `specs/phase-2/POC_SHOPIFY_ADAPTER.md` (12/12 AK), `specs/phase-2/evidence/2026-04-19_self-check.md`.
> **Phase:** 3 von 5 (ARCHITECTURE.md §3)
> **Erstellt:** 2026-04-19, Session 5
> **Scope:** Strukturierter, automatisierter Review beider Plattform-Renderings desselben Trunk-Produkts `basic-check`. Keine Code-Änderung an Trunk oder Adaptern. Output: Evidenzpaket + klare Go/No-Go-Entscheidungsgrundlage für Dr. Stracke.

---

## 1. Verständnis-Sicherung (WORKING_MODE §Phase 1)

### 1.1 Zielzustand — was ist am Ende wahr?

- `bash tools/review.sh` führt einen **reinen Lese-Review** durch (plus ein kontrolliertes Trunk-Master-Roundtrip-Experiment) und schreibt ein Evidenzpaket nach `specs/phase-3/evidence/`.
- Für jedes der 12 Akzeptanzkriterien liegt am Ende **entweder** eine grüne Evidenz (JSON-Report, Screenshot, Diff-Ausgabe) **oder** ein strukturierter Fehlerbefund im Self-Check.
- Dr. Stracke kann auf Basis des Self-Checks **Go** (→ Phase 4 Subsumierung) oder **No-Go** (→ Refactor) entscheiden. Ein Teil-Go (Phase 2b Medien vorziehen) bleibt explizit möglich.
- Weder Trunk-Content noch Adapter-Code wird verändert. Der einzige geschriebene Output sind Dateien unter `specs/phase-3/evidence/` und neue Tool-Dateien unter `tools/review/`.

### 1.2 Constraints — was darf nicht passieren?

| ID | Constraint | Herkunft |
|---|---|---|
| C-1 | Kein Löschen des Test-Produkts `10940942844171` | SESSION_RESUME §7 |
| C-2 | Shopify-Produkt bleibt `status: "draft"` nach Abschluss — Roundtrip-Test stellt Draft wieder her | CW-005, SESSION_RESUME §7 |
| C-3 | Kein Push zu Prod-Shopify als `active`, kein Touch am `juvantis-web/theme/` | SESSION_RESUME §7 |
| C-4 | Kein WP-Theme-Edit, kein Page-Löschen (Page 9668 bleibt) | Phase-1-Invariant |
| C-5 | Keine Credentials in Logs/Repo — Token/Passwort nur aus `.env.local`, gemaskt `***` | global secrets-Rule |
| C-6 | Kein Eingriff in Trunk-YAML oder Schema-Dateien | WORKING_MODE Phase 3 (no scope creep) |
| C-7 | Akzeptanzschwelle = **100 %** (alles grün), keine Teil-Abnahme | Dr. Stracke explizit 2026-04-19 |
| C-8 | Review ist **deterministisch reproduzierbar** — selber Input, selber Report | WORKING_MODE §Rollen |
| C-9 | Puppeteer nutzt vorhandenes Chrome.app, keine neuen Binaries ins Repo | minimal invasiv |

### 1.3 Implizite Annahmen (müssen vor Umsetzung geprüft werden)

| ID | Annahme | Prüfweg |
|---|---|---|
| A-1 | WP-Page 9668 ist weiterhin via REST erreichbar und Adapter-belegt | `GET {WP_REST_BASE}/pages/9668` → 200 + Content enthält Trunk-Daten |
| A-2 | Shopify-Produkt `10940942844171` existiert weiterhin im Store | `GET /products/10940942844171.json` → 200 |
| A-3 | Adapter-Scripts `sync-wp.sh`/`sync-shopify.sh` sind idempotent (Phase 1+2 bewiesen) | Re-Run im Review bestätigt; bei Abweichung FK-4 |
| A-4 | Chrome-Executable unter `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` startet headless | Puppeteer-launch erfolgreich |
| A-5 | Shopify `body_html` ist Trunk-getrieben und enthält die gleichen Kernfelder wie WP-Page | Content-Parity-Report AK-3 |
| A-6 | HWG-Compliance der Practice-View ist schema-erzwungen (`views.practice.show_price: const false`) | Phase-1-Spec; wird empirisch durch Token-Scan bestätigt |

---

## 2. Lösungsdesign (WORKING_MODE §Phase 2)

### 2.1 Review-Dimensionen (von Dr. Stracke freigegeben)

| ID | Dimension | Methode |
|---|---|---|
| a | **Content-Parität** | Trunk-YAML laden, WP-Page-HTML via REST, Shopify-Product via Admin-API; pro Feld (Titel, Beschreibung, Tagline, CTA, Parameter-Codes) gegen beide Renderings diffen |
| b | **HWG-Compliance (Praxis)** | WP-Page-HTML auf **verbotene Tokens** scannen: `€`, ` EUR`, `Kaufen`, `Warenkorb`, `Bestellen`, `Jetzt buchen`; erlaubter CTA: `Mehr erfahren auf sanexio.eu` + Ziel-URL. Numerische Preiszahl bewusst ausgeschlossen (False-Positive-Risiko mit Labor-Codes); `€`/`EUR` reichen als Preis-Indikator |
| c | **Juvantis-Commerce-Tauglichkeit** | Shopify-Product: `variants[0].price > 0`, `sku` gesetzt, `product_type`, `tags` nicht leer, `vendor` gesetzt |
| d | **Idempotenz** | `sync-wp.sh` und `sync-shopify.sh` jeweils 2x laufen lassen; Erwartung: Page-ID / Product-ID unverändert, kein zweites Artefakt, content-diff leer |
| e | **Visuelles Rendering** | Puppeteer-Screenshots: WP-Page live (HTTP Basic gegen Local-WP), Shopify-`body_html` in minimalem HTML-Shell gerendert (Storefront-Draft-Produkt ist passwort-geschützt und nicht öffentlich, daher indirekte Visualisierung) |
| f | **Trunk-Master-Roundtrip (CW-001)** | Shopify-Admin-Edit simulieren (z. B. `status=active` via Admin-API), `sync-shopify.sh` laufen lassen, verifizieren dass Draft-Status wiederhergestellt ist |

### 2.2 Datei-Struktur (wird durch Umsetzung angelegt)

```
projects/Cortex-Web/
├── tools/
│   ├── review.sh                          [neu — Orchestrator-Wrapper]
│   └── review/
│       ├── run.mjs                        [neu — Haupt-Review-Runner]
│       ├── content-parity.mjs             [neu — Trunk ↔ WP ↔ Shopify Diff]
│       ├── hwg-scan.mjs                   [neu — verbotene-Token-Scan auf WP-HTML]
│       ├── commerce-check.mjs             [neu — Shopify-Commerce-Felder]
│       ├── idempotency.mjs                [neu — Re-Run-Vergleich]
│       ├── roundtrip.mjs                  [neu — Trunk-Master-Test]
│       └── screenshots.mjs                [neu — Puppeteer WP + Shopify-Preview]
│
└── specs/phase-3/
    ├── REVIEW.md                          [diese Datei]
    └── evidence/
        ├── YYYY-MM-DD_self-check.md       [Phase-4-Output]
        ├── content-parity.json            [AK-2, AK-3]
        ├── hwg-scan.json                  [AK-4]
        ├── commerce-check.json            [AK-5]
        ├── idempotency-wp.json            [AK-6]
        ├── idempotency-shopify.json       [AK-7]
        ├── roundtrip.json                 [AK-8]
        ├── wp-page-9668.png               [AK-9]
        ├── shopify-body-preview.png       [AK-10]
        ├── side-by-side.html              [AK-11a — statische Montage, lokal öffnen]
        └── side-by-side.png               [AK-11b — Puppeteer-Render der Montage]
```

### 2.3 Entscheidungen E-1 … E-7

| ID | Entscheidung | Alternative(n) | Begründung |
|---|---|---|---|
| **E-1** | **Bun** als Runtime (analog Phase 2) | Node.js | Konsistenz zu `package.json engines.bun >=1.0.0`; keine zusätzliche Runtime-Dep |
| **E-2** | **puppeteer-core + Systemchrome** (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) | `puppeteer` (bundelt Chromium, ~300MB) | `package.json` hat bereits `puppeteer-core`; Mac hat Chrome installiert; minimaler Footprint |
| **E-3** | **Shopify Preview = body_html in HTML-Shell** (nicht Storefront-Login) | Storefront-Password-Auth via Puppeteer / Admin-Preview-Login | Draft-Produkte sind auch mit Storefront-Password NICHT öffentlich (Shopify-Constraint); Admin-Preview braucht User-Session (nicht Token). Body-HTML-Shell isoliert das Content-Rendering und ist für Content-Review ausreichend. Plattform-Chrome (Header/Footer) ist nicht Teil der Common-Trunk-Hypothese |
| **E-4** | **Roundtrip-Mutation: `status=active`** via Admin-API, dann `sync-shopify.sh`, dann Erwartung: `status=draft` | Titel-Mutation, Tag-Mutation | `status` ist der härteste CW-005-Constraint. Wenn Adapter das zurücksetzt, ist CW-001 funktional bewiesen |
| **E-5** | **Verbotene-Token-Liste** statisch in Spec verankert (nach Dr.-Stracke-Feedback Option (i): robuste Doppel-Sicherung ohne fragiles numerisches Token) | dynamisch aus Schema ableiten / nur schema-seitige Prüfung | Schema-Introspection braucht eigenes Tooling; statische Liste ist auditierbar und erweiterbar. Finale Tokens: `€`, ` EUR`, `Kaufen`, `Warenkorb`, `Bestellen`, `Jetzt buchen` (letzter ist juvantis-only CTA — prüft Adapter-Cross-Contamination). Numerische Preiszahl `99` bewusst NICHT in Liste (False-Positive-Risiko mit Labor-Codes, Preis-Indikatoren `€`/`EUR` decken ab). Unicode-Normalisierung NFC vor Match, Word-Boundary-Matching |
| **E-6** | **Akzeptanzschwelle 100 %** — any fail ≙ No-Go | Threshold z.B. 80% | Dr. Stracke explizit 2026-04-19: „alles grün" |
| **E-7** | **Keine automatische Go/No-Go-Entscheidung im Script** | Exit-Code 0 = Go, 1 = No-Go | Entscheidung liegt bei Dr. Stracke (LL-034). Script liefert nur strukturierte Evidenz |

### 2.4 Datenfluss

```
trunk/content/products/bluttests/basic-check.yaml
        │
        ├──→ [content-parity.mjs] ──→ GET WP /pages/9668 ──┐
        │                         ──→ GET Shopify /products/10940942844171.json ──┐
        │                                                                         │
        │                                         ──→ content-parity.json (AK-2,3)
        │
        ├──→ [hwg-scan.mjs]  WP-HTML ──→ hwg-scan.json (AK-4)
        │
        ├──→ [commerce-check.mjs] Shopify-JSON ──→ commerce-check.json (AK-5)
        │
        ├──→ [idempotency.mjs] sync-wp.sh (2x) ──→ idempotency-wp.json (AK-6)
        │                     sync-shopify.sh (2x) ──→ idempotency-shopify.json (AK-7)
        │
        ├──→ [roundtrip.mjs] PUT status=active → sync-shopify.sh → GET status
        │                    ──→ roundtrip.json (AK-8)
        │
        └──→ [screenshots.mjs] WP live + Shopify body_html shell
                             ──→ wp-page-9668.png (AK-9)
                             ──→ shopify-body-preview.png (AK-10)
                             ──→ side-by-side.html (AK-11)
```

`run.mjs` orchestriert alle Module sequenziell, aggregiert Exit-Codes, druckt Zusammenfassungstabelle, schreibt Evidenz-Dateien.

---

## 3. Akzeptanzkriterien (alle müssen grün sein — C-7)

| ID | Kriterium | Evidenz |
|----|-----------|---------|
| **AK-1** | Pre-Flight `validate.sh` grün; `CHECK_SHOPIFY=1` grün | Konsolen-Output |
| **AK-2** | **WP-Content-Parität:** WP-Page 9668 enthält: Trunk-`headline_override.de`, Trunk-`beschreibung.de`, Trunk-`tagline.de`, Trunk-`views.practice.cta_label.de`, Trunk-`views.practice.cta_url`, alle 15 Parameter-Codes | `content-parity.json` |
| **AK-3** | **Shopify-Content-Parität:** Shopify-Product `10940942844171` enthält: Trunk-`title.de`, Trunk-`tagline.de`, Trunk-`beschreibung.de`, Trunk-`price_eur` als `variants[0].price`, Trunk-`sku`, alle 15 Parameter-Codes im `body_html` | `content-parity.json` |
| **AK-4** | **HWG-Compliance (Praxis):** WP-Page-HTML enthält KEINE der verbotenen Tokens (`€`, ` EUR`, `Kaufen`, `Warenkorb`, `Bestellen`, `Jetzt buchen`). Erlaubter Praxis-CTA (`Mehr erfahren auf sanexio.eu` + Ziel-URL) ist präsent | `hwg-scan.json` |
| **AK-5** | **Juvantis-Commerce:** Shopify-Product hat `variants[0].price >= 1`, non-empty `sku`, non-empty `product_type`, non-empty `tags[]`, non-empty `vendor` | `commerce-check.json` |
| **AK-6** | **WP-Idempotenz:** 2. Lauf `sync-wp.sh` → gleiche Page-ID 9668, kein zweites Artefakt, `content.rendered`-Diff leer (bis auf `modified` Timestamp) | `idempotency-wp.json` |
| **AK-7** | **Shopify-Idempotenz:** 2. Lauf `sync-shopify.sh` → `action: "update"`, gleiche Product-ID 10940942844171, gleiche handle `basic-check` | `idempotency-shopify.json` |
| **AK-8** | **Trunk-Master-Roundtrip (CW-001):** nach `PUT status=active` → `sync-shopify.sh` → `GET` zeigt `status: "draft"` wiederhergestellt | `roundtrip.json` |
| **AK-9** | **WP-Screenshot:** Puppeteer-Shot der WP-Page 9668 (1440×900, full page) existiert, > 10 KB | `wp-page-9668.png` |
| **AK-10** | **Shopify-Preview-Screenshot:** Puppeteer-Shot der body_html in HTML-Shell existiert, > 10 KB | `shopify-body-preview.png` |
| **AK-11** | **Side-by-Side:** `side-by-side.html` rendert beide Screenshots nebeneinander (einfache `<img>`-Montage + Meta-Daten) **und** zusätzlich `side-by-side.png` als Puppeteer-Render der HTML-Datei (für einfachen Versand/Screenshot-Viewer) | Datei-Existenz beider |
| **AK-12** | **Self-Check:** `YYYY-MM-DD_self-check.md` existiert mit AK-Tabelle, Score 12/12, Lessons Learned | Datei-Existenz + Inhalt |

---

## 4. Tool-Design (nur Skizze — Details in Phase 3)

### 4.1 `tools/review.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env.local; set +a
exec bun tools/review/run.mjs "$@"
```

### 4.2 `tools/review/run.mjs` — Orchestrator

```
1. ENV prüfen (WP_REST_BASE, WP_USER, WP_APP_PASSWORD, SHOPIFY_STORE, SHOPIFY_ADMIN_TOKEN)
2. Trunk-YAML laden + validieren (js-yaml, minimale Pflichtfelder)
3. Sequenziell: parity → hwg → commerce → idempotency → roundtrip → screenshots
4. Aggregieren: {ak1..ak11: bool, summary: "12/12" | "N/12", fails: [...]}
5. Exit 0 falls alles grün, sonst Exit 1
```

### 4.3 Env-Variablen (nur lesend, schon vorhanden)

| Var | Nutzung | Masking |
|---|---|---|
| `WP_REST_BASE` | WP REST Root | Domain loggen, Pfad maskieren ab Auth |
| `WP_USER`/`WP_APP_PASSWORD` | WP Basic Auth | Passwort `***` |
| `SHOPIFY_STORE` | `juvantis.myshopify.com` | ok loggen |
| `SHOPIFY_ADMIN_TOKEN` | Admin-API Header | `shpat_***` |

Alle Log-Ausgaben durchlaufen eine `mask()`-Funktion (identisch zu Phase-2-Pattern).

---

## 5. Risiken / Alternativen

### 5.1 Risiken

| ID | Risiko | Mitigation |
|---|---|---|
| R-1 | Local-WP ist nicht gestartet → AK-1/2 rot | Pre-Check: Ping `WP_REST_BASE`; bei 000 Fehlermeldung mit Hinweis "Local WP starten" |
| R-2 | Shopify-Rate-Limits beim Roundtrip (mehrere API-Calls) | 500ms delay zwischen writes, Retry-Backoff |
| R-3 | Puppeteer findet Chrome nicht | Executable-Path explizit setzen, Fehlermeldung mit Installations-Hinweis |
| R-4 | Trunk-Master-Roundtrip lässt Produkt `active` falls sync-shopify abbricht | Mitigation: `finally`-Block setzt status zurück auf draft via direktem Admin-PUT als Safety-Net |
| R-5 | HWG-Token-Scan hat False Positives (z.B. "99" in Parameter-Code "P99") | Tokens sind Wort-gebunden (regex `\b`), Test-Case in Review-Script |
| R-6 | WP-Page-HTML enthält nicht den gerenderten, sondern Gutenberg-Block-JSON | Request `?context=view` und `content.rendered` statt `content.raw` verwenden |

### 5.2 Nicht in Scope (explizit)

- Keine Medien-Validierung (`images.*` werden in Phase 2b abgedeckt)
- Keine i18n-Validierung über `de` hinaus (MVP-Trunk nutzt nur `de`)
- Keine Performance-/SEO-Messung (nicht Go/No-Go-relevant)
- Keine Theme-/Plattform-Chrome-Bewertung (Common-Trunk-Hypothese gilt für Content, nicht für Chrome)

---

## 6. Architekten-Modus Phase 3+4 Vorgehen

Nach Freigabe dieser Spec:

- **Phase 3 (Umsetzung):** Tools exakt nach §2.2 anlegen. Kein Scope-Creep. Ein Commit pro logischem Brocken (Orchestrator, parity, hwg, commerce, idempotency, roundtrip, screenshots).
- **Phase 4 (Selbstprüfung):** `tools/review.sh` laufen lassen, AK-Tabelle befüllen, Score, Lessons Learned, ggf. FK-Klassifizierung bei Fehlschlägen. Self-Check-Datei unter `specs/phase-3/evidence/YYYY-MM-DD_self-check.md`.
- Bei einem roten AK: **FK-Klasse zuordnen, fixen, dokumentieren, neu laufen lassen**. Kein Beschönigen.

---

## 7. Klärungen Dr. Stracke (2026-04-19 Session 5)

1. ✅ **Verbotene-Token-Liste:** Option (i) — robuste Doppel-Sicherung, aber ohne fragiles `99 ` (False-Positive-Risiko mit Labor-Codes). Finale Liste: `€`, ` EUR`, `Kaufen`, `Warenkorb`, `Bestellen`, `Jetzt buchen`.
2. ✅ **Roundtrip-Mutation `status=active`** akzeptabel, Safety-Net (`finally`-Reset) Pflicht.
3. ✅ **Side-by-Side-Output:** beides — statische `side-by-side.html` UND gerenderter `side-by-side.png` (AK-11a + AK-11b).

**Spec freigegeben 2026-04-19, Phase 3 startet.**

---

*Stand: 2026-04-19 Session 5. Nach Freigabe: Phase 3 (Umsetzung) → Phase 4 (Selbstprüfung).*
