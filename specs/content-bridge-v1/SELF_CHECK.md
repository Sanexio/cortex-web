# content-bridge-v1 — Self-Check

> **Datum:** 2026-04-22
> **Spec:** `SPEC.md`
> **Session-Ziel:** Gerichtete Content-Übertragung WP `/team/` → Shopify `/pages/uber-uns` via Trunk.
> **Status:** 12/12 AKs grün.

---

## Akzeptanzkriterien

| # | Kriterium | Ergebnis | Beweis |
|---|-----------|:--------:|--------|
| **AK-1** | 8 `team/*.yaml` existieren, schema-valide | ✅ | `ls trunk/content/team/*.yaml \| wc -l` = 8; `bun build-page.mjs …` lädt alle 8 ohne AJV-Fehler |
| **AK-2** | `ueber-uns.yaml` existiert, schema-valide | ✅ | `trunk/content/pages/_shared/ueber-uns.yaml` lädt ohne AJV-Fehler |
| **AK-3** | `team-member.schema.json` konkretisiert | ✅ | required-Felder: id, slug, name, role, languages, intro, accent, order (+ optional image, profile_urls) |
| **AK-4** | `page.schema.json` mit `sections[]`-Support | ✅ | `sections` mit `oneOf` Intro / team-grid definiert |
| **AK-5** | `build-page.mjs` liest YAML → validiert → stdout-JSON | ✅ | `bun adapters/shopify/build-page.mjs trunk/content/pages/_shared/ueber-uns.yaml \| jq .` gibt valide JSON |
| **AK-6** | `pages-to-shopify.mjs` idempotent via handle | ✅ | Lauf 1: action=update auf existierendem id=157742137611; Lauf 2: action=update, keine Drift |
| **AK-7** | `sync-page-shopify.sh` orchestriert | ✅ | Exit 0; Ausgabe enthält sync-page-shopify: OK |
| **AK-8** | Shopify-Page existiert, 1 Treffer bei API-Lookup | ✅ | GET `/pages.json?handle=uber-uns` liefert 1 Page, id=157742137611 |
| **AK-9** | body_html enthält alle 8 Ärzte + Intro | ✅ | Grep auf API-Response: 8 Arzt-Namen in korrekter Reihenfolge, Intro-String „Acht Ärztinnen und Ärzte" present |
| **AK-10** | Page auf `published_at: null` (Draft, CW-001) | ✅ | API-Response: `"published_at": null` |
| **AK-11** | Idempotenz: zwei Läufe gleiche body-md5 | ✅ | md5(body_html) vor/nach Lauf 2: `af08f37654b5fe21a68087a2a145ab48` identisch; `updated_at` sogar unverändert (Shopify-diff-aware) |
| **AK-12** | Self-Check dokumentiert | ✅ | Diese Datei |

---

## Konkrete Messwerte (Lauf 2026-04-22 19:36)

| Metrik | Wert |
|--------|------|
| Shopify-Page-ID | 157742137611 |
| Handle | `uber-uns` |
| Title | Ärzte & Team |
| body_html Länge | 5865 Bytes |
| body_html MD5 | af08f37654b5fe21a68087a2a145ab48 |
| Status | Draft (published_at: null) |
| Team-Member-Count im body | 8 |
| updated_at | 2026-04-22T19:36:59+02:00 |
| Admin-URL | https://juvantis.myshopify.com/admin/pages/157742137611 |

---

## Lessons Learned

### CB1-LL-1 — Shopify-App-Scopes für Pages

Die Cortex-Web-Custom-App war in Session 3 nur mit Product/Files-Scopes
autorisiert. Der erste Page-Push lief in `403 — merchant approval for
read_content scope`. **Lösung:** `tools/shopify-authorize.sh` um
`read_content,write_content` erweitert; OAuth-Re-Auth durch Dr. Stracke im
Browser. Der Catcher schreibt den neuen Token automatisch in `.env.local`.

**Konsequenz:** Jeder neue Adapter-Ressourcentyp (Collections, Blogs,
Redirects…) braucht potenziell einen weiteren OAuth-Re-Auth. Authorize-Skript
ist die Einstell-Single-Source.

### CB1-LL-2 — Shopify-Pages: `published` statt `status`

Shopify-Products nutzen `status: "draft"|"active"`, Shopify-Pages dagegen
`published: true|false`. Der Page-Adapter hardcoded `published: false` als
CW-001-Safeguard (analog zum Product-Adapter `status: draft`).

**Konsequenz:** Nach einem Sync ist die Page unpublished. Dr. Stracke muss
nach Prüfung im Shopify-Admin auf „Veröffentlichen" klicken. Kann perspektivisch
durch ein explizites `tools/shopify-publish-page.sh` automatisiert werden
(N-5 in cross-site-transfer.md).

### CB1-LL-3 — Shopify diff-aware Updates

Bei Idempotenz-Test: Wenn `body_html` unverändert bleibt, ändert Shopify das
`updated_at`-Feld NICHT. Das ist stärker als in der Spec gefordert (AK-11 ließ
`updated_at`-Drift zu). Bedeutet: Echte Content-Drift ist am `updated_at`
erkennbar.

### CB1-LL-4 — Explizites `order`-Feld schlägt Filesystem-Sortierung

Erste Implementation sortierte Team-Member alphabetisch nach slug — das
hätte Dr. Stracke an Position 7 (von 8) gesetzt. Explizites `order: 1..8`
in jedem YAML spiegelt die PHP-Array-Reihenfolge aus `team-data.php` und
macht Reihenfolge schemaseitig zur Pflicht.

### CB1-LL-5 — Bridge-Architektur skaliert über Content hinaus

Die Skelette für Pages-Sync sind strukturell identisch zu Products-Sync
(`build.mjs` → `*-to-shopify.mjs` → REST-Push). Derselbe Weg wird künftig für
Design-Tokens und Komponenten funktionieren — siehe `docs/cross-site-transfer.md`.

---

## Nicht-Ziele dieser Session (bewusst ausgelassen)

| Thema | Warum vertagt |
|-------|---------------|
| WP `/team/` auf Trunk-Rendering umstellen | Eigene Session, Template-Logik im Theme ist funktional, keine Doppel-Baustelle |
| Shopify-Storefront-Passwort entfernen | Dr.-Stracke-Entscheidung, Sanexio-Go-Live |
| Arzt-Porträts in Media-Registry | Kein Foto-Material im Projekt, alle `image_id=0` |
| Styling auf Shopify anpassen | Testlauf-Feedback abwarten |
| Extraktions-Tools Site→Trunk | Für diesen Sprint manuell aus PHP transkribiert |

---

## Reproduktion

```bash
cd ~/Cortex/projects/Cortex-Web

# Build allein (kein Netz):
bun adapters/shopify/build-page.mjs trunk/content/pages/_shared/ueber-uns.yaml | jq .

# Build + Push (ALLOW_OVERWRITE=1 weil Seite bereits vor 2026-04-22 existierte):
ALLOW_OVERWRITE=1 bash tools/sync-page-shopify.sh

# Verify:
set -a; . ./.env.local; set +a
curl -s -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_TOKEN" \
  "https://${SHOPIFY_STORE}/admin/api/2026-04/pages.json?handle=uber-uns" | jq '.pages[0] | {id,handle,title,published_at,updated_at}'
```
