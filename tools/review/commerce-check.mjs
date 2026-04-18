// Juvantis-Commerce-Tauglichkeit (AK-5) — asserts that the Shopify product has
// all commerce fields that Juvantis needs for B2C distribution:
//   - variants[0].price > 0
//   - sku non-empty
//   - product_type non-empty
//   - tags non-empty (array or comma-separated string)
//   - vendor non-empty
//   - status === "draft"  (Phase 2 invariant, CW-001 safeguard)
//
// Output: specs/phase-3/evidence/commerce-check.json

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

function tagsNonEmpty(tags) {
  if (Array.isArray(tags)) return tags.length > 0;
  if (typeof tags === "string") return tags.trim().length > 0;
  return false;
}

export async function runCommerceCheck(ctx) {
  const { shopifyProduct, evidenceDir } = ctx;
  if (!shopifyProduct) {
    return { ok: false, details: { error: "shopifyProduct not available from parity step" } };
  }

  const variant = shopifyProduct.variants?.[0] ?? null;
  const priceNum = Number(variant?.price);
  const checks = {
    has_variant: !!variant,
    price_positive: Number.isFinite(priceNum) && priceNum > 0,
    sku_present: !!variant?.sku && String(variant.sku).trim().length > 0,
    product_type_present: !!shopifyProduct.product_type && shopifyProduct.product_type.trim().length > 0,
    tags_present: tagsNonEmpty(shopifyProduct.tags),
    vendor_present: !!shopifyProduct.vendor && shopifyProduct.vendor.trim().length > 0,
    status_draft: shopifyProduct.status === "draft"
  };

  const ok = Object.values(checks).every(Boolean);
  const details = {
    product_id: shopifyProduct.id,
    handle: shopifyProduct.handle,
    title: shopifyProduct.title,
    variant_count: shopifyProduct.variants?.length ?? 0,
    price: variant?.price ?? null,
    sku: variant?.sku ?? null,
    product_type: shopifyProduct.product_type,
    tags: shopifyProduct.tags,
    vendor: shopifyProduct.vendor,
    status: shopifyProduct.status,
    checks
  };

  writeFileSync(resolve(evidenceDir, "commerce-check.json"), JSON.stringify({ ok, ...details, timestamp: ctx.now }, null, 2) + "\n");
  return { ok, details };
}
