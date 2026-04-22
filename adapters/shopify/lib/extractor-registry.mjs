// Cortex-Web — Shopify extractor registry (site -> proto-trunk).
// cross-site-transfer Phase C2 (skeleton), 2026-04-22.

export const EXTRACTOR_REGISTRY = {
  "shopify.page": {
    tool: "adapters/shopify/extract-page.mjs",
    input: "page handle (string)",
    output: "proto-trunk JSON on stdout (not schema-valid)",
    status: "skeleton"
  },
  "shopify.template": {
    tool: "adapters/shopify/extract-template.mjs",
    input: "template name without .json (e.g. page.uber-uns)",
    output: "proto-trunk JSON with parsed template + block summary",
    status: "skeleton"
  },
  "shopify.product": {
    tool: "adapters/shopify/extract-product.mjs",
    input: "product handle",
    output: "(not built)",
    status: "planned"
  }
};

export function listExtractors() {
  return Object.entries(EXTRACTOR_REGISTRY).map(([key, val]) => ({ key, ...val }));
}
