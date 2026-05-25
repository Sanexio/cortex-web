#!/usr/bin/env bun
// Cortex-Web Shopify adapter — EXTRACT step for THEME TEMPLATES (site -> trunk).
// GET /admin/api/<v>/themes/<id>/assets.json?asset[key]=templates/<name>.json
// and emit the parsed template JSON as proto-trunk on stdout.
//
// Usage:
//   bun adapters/shopify/extract-template.mjs <template-name>
//   e.g. bun adapters/shopify/extract-template.mjs page.uber-uns
//
// Exit codes:
//   0 success
//   1 usage / config error
//   2 REST error / asset not found
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

const tmplArg = process.argv[2];
if (!tmplArg) die(1, "usage: bun extract-template.mjs <template-name-without-.json>");

const store = env("SHOPIFY_STORE");
const token = env("SHOPIFY_ADMIN_TOKEN");
const themeIdOverride = process.env.SHOPIFY_THEME_ID;

const client = createClient({ store, token });

// 1. Resolve theme id.
let themeId;
if (themeIdOverride) {
  themeId = Number(themeIdOverride);
} else {
  const themesRes = await client.get(`/themes.json`).catch((e) => die(2, `themes lookup failed: ${e.message}`));
  const live = (themesRes?.themes || []).find((t) => t.role === "main");
  if (!live) die(2, "no theme with role=main");
  themeId = live.id;
}

// 2. Fetch asset.
const assetKey = `templates/${tmplArg}.json`;
const assetKeyEncoded = encodeURIComponent(assetKey);
let assetRes;
try {
  assetRes = await client.get(`/themes/${themeId}/assets.json?asset[key]=${assetKeyEncoded}`);
} catch (err) {
  if (/\b404\b/.test(err.message || "")) die(2, `asset not found: ${assetKey}`);
  die(2, `asset fetch failed: ${err.message}`);
}

const asset = assetRes?.asset;
if (!asset || typeof asset.value !== "string") die(2, `unexpected asset response for ${assetKey}`);

// 3. Strip the auto-generated comment header if present, then parse JSON.
let jsonText = asset.value;
jsonText = jsonText.replace(/^\/\*[\s\S]*?\*\/\s*/m, "");
let parsed;
try {
  parsed = JSON.parse(jsonText);
} catch (err) {
  die(2, `template JSON parse failed: ${err.message}`);
}

// 4. Emit proto-trunk structure with analysis.
const sections = Object.values(parsed.sections || {});
const sectionTypes = sections.map((s) => s.type);
const blockSummary = {};
for (const s of sections) {
  if (s.blocks && typeof s.blocks === "object") {
    for (const b of Object.values(s.blocks)) {
      blockSummary[b.type] = (blockSummary[b.type] || 0) + 1;
    }
  }
}

const proto = {
  _extracted_at: new Date().toISOString(),
  _source: `shopify.template@${store}`,
  _theme_id: themeId,
  _asset_key: assetKey,
  _asset_size: asset.size,
  _asset_updated_at: asset.updated_at,

  template_json: parsed,

  _summary: {
    section_count: sections.length,
    section_types: sectionTypes,
    block_counts: blockSummary,
    order: parsed.order || []
  },

  _curation_hints: {
    next_step: "Identify the primary section (usually non-'main-page'). Its settings + blocks map to trunk views.shop.* in the page YAML.",
    renderer_hint: "If a matching renderer exists in lib/renderers/, use it; otherwise create template-<section-type>-<view>.mjs.",
    target_yaml: `trunk/content/pages/_shared/${tmplArg.replace(/^page\./, "")}.yaml`
  }
};

process.stdout.write(JSON.stringify(proto, null, 2) + "\n");
