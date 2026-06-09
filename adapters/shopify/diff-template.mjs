#!/usr/bin/env bun
// Cortex-Web Shopify adapter — DIFF step for THEME TEMPLATES (read-only).
// Build the local template payload from a trunk YAML, fetch the live theme
// asset state via Shopify Admin REST, and emit a field-by-field diff. NO
// writes to Shopify.
//
// Usage:
//   bun adapters/shopify/diff-template.mjs <path-to-trunk-yaml>
//
// Env:
//   SHOPIFY_STORE         (required) <handle>.myshopify.com
//   SHOPIFY_ADMIN_TOKEN   (required) shpat_… with read_themes (write_themes NOT needed)
//   SHOPIFY_THEME_ID      (optional) pin a specific theme; default = live (role=main)
//   FORMAT                (optional) "json" for structured output;
//                                    default "text" (human-readable)
//
// Read-only guarantee (CW-001/CW-008): only client.get() is called. There is
// no client.post/put/delete code path in this file. The build sub-process
// is also read-only (build-template.mjs writes only to stdout).
//
// Exit codes:
//   0 = no diff (live asset matches local payload across compared fields)
//   1 = diff present (≥ 1 field differs, OR live asset is absent)
//   2 = error (config, network, build sub-process failed, schema invalid, …)
//
// N-6.2, cross-site-transfer Phase F. 2026-04-23 Session 28.
//
// See specs/cross-site-transfer/N-6.2_cw-transfer-diff-template.md for AKs and design.

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { createClient } from "./lib/shopify-rest-client.mjs";
import { resolveThemeId } from "./lib/theme-id.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../..");

function die(code, msg) {
  process.stderr.write(`DIFF_ERROR: ${msg}\n`);
  process.exit(code);
}

function env(name) {
  const v = process.env[name];
  if (!v || v.length === 0) {
    die(1, `env ${name} missing — copy .env.local.template to .env.local and fill in`);
  }
  return v;
}

const yamlArg = process.argv[2];
if (!yamlArg) die(1, "usage: bun diff-template.mjs <path-to-trunk-yaml>");

const yamlPath = resolve(yamlArg);

// --- Step A: spawn build-template.mjs to get the local payload ---

const buildRes = spawnSync(
  "bun",
  ["adapters/shopify/build-template.mjs", yamlPath],
  { cwd: REPO_ROOT, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" }
);

if (buildRes.status !== 0) {
  die(2, `build-template.mjs failed (exit ${buildRes.status ?? "null"}) — see stderr above`);
}

let localPayload;
try {
  localPayload = JSON.parse(buildRes.stdout);
} catch (err) {
  die(2, `build-template.mjs stdout is not JSON: ${err.message}`);
}

if (!localPayload?.asset?.key || typeof localPayload.asset.value !== "string") {
  die(2, `build-template.mjs payload missing asset.{key,value}`);
}

// Both local (from build-template.mjs renderer) and live (from Shopify) have
// an auto-generated "/* … */" header comment. Strip it on BOTH sides with
// the same regex as extract-template.mjs, otherwise every diff is trivially
// positive (local has no header when reparsed vs. live that still has one —
// or vice versa). The regex matches either side safely: no-op if absent.
const HEADER_STRIP_RE = /^\/\*[\s\S]*?\*\/\s*/m;

let localTemplate;
try {
  localTemplate = JSON.parse(localPayload.asset.value.replace(HEADER_STRIP_RE, ""));
} catch (err) {
  die(2, `local asset.value is not valid JSON after header strip: ${err.message}`);
}

// --- Step B: resolve theme id ---

const store = env("SHOPIFY_STORE");
const token = env("SHOPIFY_ADMIN_TOKEN");
const formatJson = process.env.FORMAT === "json";

const client = createClient({ store, token });

let themeId;
let themeIdSource;
try {
  ({ themeId, source: themeIdSource } = await resolveThemeId(client));
} catch (err) {
  const code = /must be numeric/.test(err.message || "") ? 1 : 2;
  die(code, `theme id resolve failed: ${err.message}`);
}

// --- Step C: fetch the live asset ---

const assetKey = localPayload.asset.key;
const assetKeyEncoded = encodeURIComponent(assetKey);
let liveAsset = null;
try {
  const assetRes = await client.get(`/themes/${themeId}/assets.json?asset[key]=${assetKeyEncoded}`);
  liveAsset = assetRes?.asset || null;
} catch (err) {
  // 404 is expected when asset doesn't exist yet; treat as ABSENT.
  // Everything else is a real error.
  if (!/\b404\b/.test(err.message || "")) {
    die(2, `live-asset fetch failed: ${err.message}`);
  }
}

// --- Step D: parse live asset value (strip auto-generated header comment) ---

let liveTemplate = null;
if (liveAsset && typeof liveAsset.value === "string") {
  // Shopify prepends an auto-generated /* comment ... */ to template JSON
  // when served via the Theme-Assets API. Strip it with the same regex used
  // on the local side above, otherwise the canonical-JSON comparison would
  // be trivially positive. See also extract-template.mjs.
  try {
    liveTemplate = JSON.parse(liveAsset.value.replace(HEADER_STRIP_RE, ""));
  } catch (err) {
    die(2, `live asset.value is not valid JSON after header strip: ${err.message}`);
  }
}

// --- Step E: canonical-JSON (sorted keys, recursive) ---

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = canonicalize(value[key]);
    }
    return out;
  }
  return value;
}

function canonicalString(value) {
  return JSON.stringify(canonicalize(value));
}

function firstDiffOffset(a, b) {
  const aS = a ?? "";
  const bS = b ?? "";
  const min = Math.min(aS.length, bS.length);
  for (let i = 0; i < min; i++) {
    if (aS.charCodeAt(i) !== bS.charCodeAt(i)) return i;
  }
  if (aS.length !== bS.length) return min;
  return -1;
}

function sectionSummary(tmpl) {
  const sections = tmpl?.sections && typeof tmpl.sections === "object" ? tmpl.sections : {};
  const types = Object.values(sections).map((s) => s?.type ?? null).filter((t) => t !== null);
  return {
    count: Object.keys(sections).length,
    types_sorted: [...types].sort()
  };
}

// --- Step F: field-by-field comparison ---

const result = {
  spec: "shopify:template",
  source: yamlArg,
  asset_key: assetKey,
  live: { exists: liveAsset !== null },
  fields: {},
  result: "EQUAL",
  diff_count: 0
};

if (!liveAsset) {
  result.result = "DIFF";
  result.diff_count = 1;
  result.fields.existence = {
    equal: false,
    note: "live asset absent — push would CREATE"
  };
} else {
  result.live.theme_id = themeId;
  result.live.theme_id_source = themeIdSource;
  result.live.size = liveAsset.size ?? null;
  result.live.updated_at = liveAsset.updated_at ?? null;

  const localSum = sectionSummary(localTemplate);
  const liveSum = sectionSummary(liveTemplate);

  // section_count
  {
    const eq = localSum.count === liveSum.count;
    result.fields.section_count = { equal: eq, local: localSum.count, live: liveSum.count };
    if (!eq) result.diff_count += 1;
  }

  // section_types (sorted multiset)
  {
    const localJson = JSON.stringify(localSum.types_sorted);
    const liveJson = JSON.stringify(liveSum.types_sorted);
    const eq = localJson === liveJson;
    result.fields.section_types = {
      equal: eq,
      local: localSum.types_sorted,
      live: liveSum.types_sorted
    };
    if (!eq) result.diff_count += 1;
  }

  // order (positional)
  {
    const localOrder = Array.isArray(localTemplate?.order) ? localTemplate.order : [];
    const liveOrder = Array.isArray(liveTemplate?.order) ? liveTemplate.order : [];
    const eq = JSON.stringify(localOrder) === JSON.stringify(liveOrder);
    result.fields.order = {
      equal: eq,
      local_length: localOrder.length,
      live_length: liveOrder.length
    };
    if (!eq) result.diff_count += 1;
  }

  // template_json (full canonical compare)
  {
    const localCanon = canonicalString(localTemplate);
    const liveCanon = canonicalString(liveTemplate);
    const off = firstDiffOffset(localCanon, liveCanon);
    const eq = off === -1;
    result.fields.template_json = {
      equal: eq,
      local_length: localCanon.length,
      live_length: liveCanon.length,
      first_diff_offset: eq ? null : off
    };
    if (!eq) result.diff_count += 1;
  }

  if (result.diff_count > 0) result.result = "DIFF";
}

// --- Step G: emit output ---

if (formatJson) {
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
} else {
  const out = [];
  out.push(`spec             : ${result.spec}`);
  out.push(`source           : ${result.source}`);
  out.push(`asset_key        : ${result.asset_key}`);
  if (!result.live.exists) {
    out.push(`live_asset       : ABSENT (push would CREATE)`);
  } else {
    out.push(`live_theme_id    : ${result.live.theme_id}`);
    out.push(`theme_id_source  : ${result.live.theme_id_source}`);
    out.push(`live_asset       : exists (size ${result.live.size} bytes, updated ${result.live.updated_at})`);

    const sc = result.fields.section_count;
    out.push(`section_count    : ${sc.equal ? "EQUAL" : "DIFFER"} (local=${sc.local}, live=${sc.live})`);

    const st = result.fields.section_types;
    if (st.equal) {
      out.push(`section_types    : EQUAL (${JSON.stringify(st.local)})`);
    } else {
      out.push(`section_types    : DIFFER (local=${JSON.stringify(st.local)}, live=${JSON.stringify(st.live)})`);
    }

    const ord = result.fields.order;
    if (ord.equal) {
      out.push(`order            : EQUAL (${ord.local_length} items)`);
    } else {
      out.push(`order            : DIFFER (local ${ord.local_length} items, live ${ord.live_length} items)`);
    }

    const tj = result.fields.template_json;
    if (tj.equal) {
      out.push(`template_json    : EQUAL (${tj.local_length} chars canonical)`);
    } else {
      out.push(`template_json    : DIFFER (local ${tj.local_length} chars, live ${tj.live_length} chars, first diff at offset ${tj.first_diff_offset})`);
    }
  }
  out.push(`RESULT           : ${result.result}${result.diff_count ? ` (${result.diff_count} field${result.diff_count === 1 ? "" : "s"})` : ""}`);
  process.stdout.write(out.join("\n") + "\n");
}

process.exit(result.result === "EQUAL" ? 0 : 1);
