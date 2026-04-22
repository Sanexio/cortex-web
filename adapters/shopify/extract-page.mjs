#!/usr/bin/env bun
// Cortex-Web Shopify adapter — EXTRACT step for PAGES (site -> trunk).
// GET /admin/api/<v>/pages.json?handle=<handle> and emit a proto-trunk
// JSON on stdout. The operator decides how to curate this into a YAML.
//
// Usage:
//   bun adapters/shopify/extract-page.mjs <handle>
//
// Output (stdout): proto-trunk JSON (NOT schema-valid — human curation required)
//
// Exit codes:
//   0 success
//   1 usage / config error
//   2 REST error or handle not found
//
// cross-site-transfer Phase C2, 2026-04-22.

import { createClient } from "./lib/shopify-rest-client.mjs";

function die(code, msg) {
  process.stderr.write(`EXTRACT_ERROR: ${msg}\n`);
  process.exit(code);
}

function env(name) {
  const v = process.env[name];
  if (!v) die(1, `env ${name} missing`);
  return v;
}

const handle = process.argv[2];
if (!handle) die(1, "usage: bun extract-page.mjs <handle>");

const store = env("SHOPIFY_STORE");
const token = env("SHOPIFY_ADMIN_TOKEN");
const client = createClient({ store, token });

let lookup;
try {
  lookup = await client.get(`/pages.json?handle=${encodeURIComponent(handle)}`);
} catch (err) {
  die(2, `lookup failed: ${err.message}`);
}

const pages = lookup?.pages || [];
if (pages.length === 0) die(2, `no page found with handle="${handle}"`);
if (pages.length > 1) die(2, `ambiguous handle "${handle}" — ${pages.length} matches`);

const p = pages[0];

// Proto-trunk shape: what a human could translate into trunk YAML.
// Intentionally NOT schema-valid — this is the raw site state, not the trunk.
const proto = {
  _extracted_at: new Date().toISOString(),
  _source: `shopify.page@${store}`,
  _handle: p.handle,
  _shopify_id: p.id,

  // Fields that directly map to trunk page.schema.json
  id_hint: p.handle,
  slugs: { juvantis: p.handle },
  title: { de: p.title },
  status_juvantis_hint: p.published_at ? "active" : "draft",
  template_suffix: p.template_suffix,

  // Body HTML — needs to be split into sections if complex
  body_html_raw: p.body_html,
  body_html_length: (p.body_html || "").length,

  // Metadata useful for curation
  admin_metadata: {
    created_at: p.created_at,
    updated_at: p.updated_at,
    published_at: p.published_at,
    author: p.author,
    shop_id: p.shop_id
  },

  // Hints for the curator
  _curation_hints: {
    template_hint: p.template_suffix
      ? `Uses template 'page.${p.template_suffix}.json'. Consider extract-template.mjs.`
      : "Uses default page.json template — body_html is the full content.",
    next_step: "Use extract-template.mjs if you want the section-block structure; otherwise transform body_html into trunk sections[] manually.",
    target_yaml: `trunk/content/pages/_shared/${p.handle}.yaml (or /praxis/ or /juvantis/)`
  }
};

process.stdout.write(JSON.stringify(proto, null, 2) + "\n");
