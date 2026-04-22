// Cortex-Web — Shopify renderer registry.
// Central lookup table for all trunk -> shopify transforms. Extending the
// bridge = add one line here + one renderer module. Build-scripts may import
// this registry to dispatch instead of hardcoding switches.
//
// Lookup key convention: "<target>.<artifact-type>.<view-or-section-type>"
// cross-site-transfer Phase C (registry skeleton), 2026-04-22.

import { renderProductJuvantis } from "./renderers/product-juvantis.mjs";
import { renderPageJuvantis } from "./renderers/page-juvantis.mjs";
import { renderTemplateJuvantisUeberUns } from "./renderers/template-juvantis-ueber-uns.mjs";

export const RENDERER_REGISTRY = {
  "shopify.product.juvantis": {
    fn: renderProductJuvantis,
    tool: "tools/sync-shopify.sh",
    source_shape: "trunk/content/products/<cat>/<id>.yaml",
    target_shape: "Shopify Product (POST /products.json)",
    status: "stable"
  },
  "shopify.page.juvantis": {
    fn: renderPageJuvantis,
    tool: "tools/sync-page-shopify.sh",
    source_shape: "trunk/content/pages/**/<id>.yaml with sections[]",
    target_shape: "Shopify Page body_html (POST/PUT /pages.json)",
    status: "stable"
  },
  "shopify.template.juvantis-ueber-uns": {
    fn: renderTemplateJuvantisUeberUns,
    tool: "tools/sync-template-shopify.sh",
    source_shape: "trunk/content/pages/**/<id>.yaml with views.juvantis.{hero,mission,values,history,cta,team,padding}",
    target_shape: "Shopify Theme Asset templates/page.<slug>.json with juvantis-ueber-uns section blocks",
    status: "stable"
  }
};

export function getRenderer(key) {
  const entry = RENDERER_REGISTRY[key];
  if (!entry) throw new Error(`renderer-registry: unknown key "${key}"`);
  return entry;
}

export function listRenderers() {
  return Object.entries(RENDERER_REGISTRY).map(([key, val]) => ({
    key,
    status: val.status,
    tool: val.tool,
    source_shape: val.source_shape,
    target_shape: val.target_shape
  }));
}
