# Adapter — Shopify

Bun-basiert, rendert Trunk-Content zu Shopify-Produkten via Admin REST API.

## Ziel-Store

Shopify-Store des konfigurierten Tenants (Store-Domain + öffentliche Domain
werden über die Custom-App-Credentials des Tenants aufgelöst). Custom App
`Cortex-Web Adapter`, Token in `.env.local` als `SHOPIFY_ADMIN_TOKEN`
(siehe Setup-Tutorial `Second Brain/30 Tutorials/Webentwicklung/Shopify & Liquid/05-admin-api-token-custom-app.md`).

## Pipeline (Phase 2 POC)

```
sync-shopify.sh
 ├─ validate.sh  (AJV + CHECK_SHOPIFY=1 → /shop.json)
 ├─ build.mjs    (YAML → Shopify-Product-Payload, status=draft hardcoded)
 └─ products-to-shopify.mjs  (GET /products?handle=... → POST oder PUT)
```

Idempotenz: `handle` (= `id` aus Trunk). Bei mehreren Treffern → Abbruch.
Bei `status=active` oder `published_at != null` → Abbruch, außer `ALLOW_OVERWRITE=1`.

## Aufruf

```bash
bash tools/sync-shopify.sh
# oder spezifisches Produkt:
bash tools/sync-shopify.sh trunk/content/products/bluttests/basic-check.yaml
```

## Views-Logik (CW-005)

Shopify-Adapter rendert `views.juvantis` (Preis erlaubt, Kauf-CTA erlaubt).
`views.praxis` wird ignoriert (HWG-Trennung).

## Constraints (Spec §1.2)

- C-1 `status: "draft"` hartcodiert, nicht überschreibbar
- C-7 nur `views.juvantis` wird gelesen
- C-9 Token-Mask in allen Stderr-Pfaden
- C-10 keine Bilder in Phase 2 (Medien-Pipeline = Phase 2b)

## Out-of-Scope

- Bilder/Medien, Variant-Sets, Kollektionen, GraphQL — siehe Spec §5/§6.

## Status

Phase 2 POC implementiert. Selbstprüfung gegen AK-1 … AK-12 (Spec §3).
