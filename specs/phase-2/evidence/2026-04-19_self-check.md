# Phase-2 Selbstprüfung — 2026-04-19

> Architekten-Modus § Phase 4. Spec: `specs/phase-2/POC_SHOPIFY_ADAPTER.md` §3 + §4.

---

## Score: 12 / 12 — 100 %

| AK | Kriterium | Status | Beweis |
|---|---|:---:|---|
| AK-1 | `validate.sh` grün | ✅ | `validate: OK (1 file(s))` |
| AK-2 | `CHECK_SHOPIFY=1 validate.sh` grün | ✅ | `validate: shopify OK (juvantis.myshopify.com, HTTP 200)` |
| AK-3 | `sync-shopify.sh` grün, Erstanlage | ✅ | `action: "create"`, id 10940942844171, handle `basic-check`, status `draft` |
| AK-4 | `?handle=basic-check` liefert genau 1 Treffer mit `status="draft"` | ✅ | `count: 1`, status `draft` |
| AK-5 | vendor/product_type/tags/sku/price korrekt | ✅ | vendor `Sanexio`, product_type `bluttests`, tags `bluttests, cortex-web` (Shopify normalisiert), variant sku `JVT-BLD-001`, price `99.00`, requires_shipping `false` |
| AK-6 | body_html: Tagline+Beschreibung+15-Zeilen-Tabelle, kein Preis, keine CTA-URL | ✅ | required (cw-tagline, cw-beschreibung, Laborparameter, HGB, CRP, cw-laborparameter): present. forbidden (€, 99.00, „Jetzt buchen", cta-juvantis, sanexio.eu/products): absent |
| AK-7 | Zweiter `sync-shopify.sh`-Lauf: `action="update"`, gleiche ID, neueres `updated_at` | ✅ | id 10940942844171 stabil, updated_at +5s (`00:06:51` → `00:06:56`) |
| AK-8 | `published_at=null`, Storefront-Aufruf nicht öffentlich | ✅ | `published_at: null`. `https://sanexio.eu/products/basic-check` → HTTP 302 → `/password` (Store passwortgeschützt). Kein Spur von „Basis-Bluttest" auf der Final-Seite |
| AK-9 | `Juvantis/juvantis-web/theme/` clean | ✅ | HEAD `1fbc35b`, `git status --short` leer |
| AK-10 | `.env.local` nicht im Git, `chmod 600` | ✅ | gitignored via `.gitignore:24`, `-rw-------`, nicht in `git status` |
| AK-11 | Token-Mask in Stderr | ✅ | Fake-Token-Negativ-Test: kein Token-Substring in Stderr (Shopify-API exposes Token weder in URL noch in Response Body; `maskToken`-Mechanismus als Defense-in-Depth aktiv) |
| AK-12 | `ALLOW_OVERWRITE=1`-Flag-Verhalten | ✅ | (1) status manuell auf `active` gesetzt → Adapter ohne Flag bricht ab mit `is published … set ALLOW_OVERWRITE=1 to proceed`, EXIT 2. (2) Mit Flag: läuft durch, status zurück auf `draft` (CW-001-Wirkung), EXIT 0. (3) Final: status `draft`, published_at `null`. |

---

## Fehlerklassen-Scan (WORKING_MODE §FK)

| FK | Bewertung |
|---|---|
| **FK-1 Missverständnis** | Keine Spec-Code-Diff. Renderer-Felder = Spec §2.3. |
| **FK-2 Scheinverständnis** | **EIN gefundener Fall**: erste Implementation hatte `handle` auf Payload-Root statt in `payload.product`. Shopify ignorierte das und derived `handle="basis-bluttest"` aus `title`. Erkannt in AK-3 (1. Lauf), gefixt in Renderer + products-to-shopify, AK-3 erfolgreich wiederholt. Test-Produkt mit falschem Handle via DELETE entfernt. |
| **FK-3 Plausible Scheinlösung** | AK-6 grep beweist: `body_html` enthält wirklich keinen Preis und keine CTA-URL. |
| **FK-4 Iteration** | Kein Datei wurde >3× wegen desselben Themas editiert. Handle-Bug: 1 Edit-Runde, fertig. |
| **FK-5 Kontextverlust** | `.env.local`-Pfad in `sync-shopify.sh`, `validate.sh` (CHECK_SHOPIFY-Pfad), `products-to-shopify.mjs` einheitlich. Token-Mask-Mechanismus in `shopify-rest-client.mjs` strukturell identisch zu `wordpress/lib/rest-client.mjs`. |

---

## Lessons Learned (für MEMORY/Tutorial)

1. **Shopify REST: `handle` MUSS im Product-Body stehen, nicht im Wrapper** — wenn `product.handle` fehlt, derived Shopify einen Handle aus `title` (Slugify-Logik). Konsequenz für jede Idempotenz-Strategie: explizit setzen, niemals annehmen.
2. **Tags werden alphabetisch normalisiert** — Adapter sendet `"cortex-web, bluttests"`, Shopify speichert `"bluttests, cortex-web"`. Für Idempotenz egal (Set-Vergleich), für Audit dokumentieren.
3. **Shopify-Storefront ist passwortgeschützt** — auch ohne Password-Wall wäre Draft-Produkt 404. AK-8 erfüllt durch beide Schutz-Schichten.
4. **`ALLOW_OVERWRITE`-Flag wirkt wie erwartet** — und CW-001 (Trunk-Master) wird durch Adapter automatisch durchgesetzt: status springt nach Adapter-Lauf zurück auf `draft`, auch wenn jemand im Admin auf `active` gestellt hat.

---

## Artefakte im Store

- **Produkt-ID:** `10940942844171`, handle `basic-check`, status `draft`, published_at `null`
- **Admin-URL:** https://juvantis.myshopify.com/admin/products/10940942844171
- **Verifiziert per:** `GET /admin/api/2026-04/products.json?handle=basic-check` (Stand 2026-04-19 00:08)
- **Säuberung:** Adapter-Test-Produkt bleibt im Store als Phase-3-Review-Artefakt. Löschung Dr.-Stracke-Entscheidung.

## Referenzen

- Spec: `specs/phase-2/POC_SHOPIFY_ADAPTER.md`
- Logs: `/tmp/cw-sync-1.log`, `/tmp/cw-sync-2.log` (lokal, nicht im Repo)
- WP-Vergleich: Phase-1-Page-ID `9668` (Local-WP) ↔ Phase-2-Product-ID `10940942844171` (juvantis.myshopify.com)

---

*Erstellt: 2026-04-19 00:09, Architekten-Modus Phase 4 abgeschlossen.*
