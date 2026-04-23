#!/usr/bin/env bun
// Cortex-Web Shopify adapter — DIFF step for PAGES (read-only).
// Build the local payload from a trunk YAML, fetch the live page state via
// Shopify Admin REST, and emit a field-by-field diff. NO writes to Shopify.
//
// Usage:
//   bun adapters/shopify/diff-page.mjs <path-to-trunk-yaml>
//
// Env:
//   SHOPIFY_STORE         (required) <handle>.myshopify.com
//   SHOPIFY_ADMIN_TOKEN   (required) shpat_…
//   PUBLISH               (optional) "1" to include the published flag in
//                                    the comparison. Without it, published
//                                    is skipped (Trunk stays draft per
//                                    CW-001; the live page being published
//                                    is an expected, non-actionable diff).
//   FORMAT                (optional) "json" for structured output;
//                                    default "text" (human-readable)
//
// Read-only guarantee (CW-001/CW-008): only client.get() is called. There is
// no client.post/put/delete code path in this file. The build sub-process
// is also read-only (build-page.mjs writes only to stdout).
//
// Exit codes:
//   0 = no diff (live state matches local payload across compared fields)
//   1 = diff present (≥ 1 field differs, OR live page is absent)
//   2 = error (config, network, build sub-process failed, schema invalid, …)
//
// N-6, content-bridge-v1, cross-site-transfer Phase F. 2026-04-23 Session 26.
//
// See specs/cross-site-transfer/N-6_cw-transfer-diff.md for AKs and design.

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { createClient } from "./lib/shopify-rest-client.mjs";

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
if (!yamlArg) die(1, "usage: bun diff-page.mjs <path-to-trunk-yaml>");

const yamlPath = resolve(yamlArg);

// --- Step A: spawn build-page.mjs to get the local payload ---

const buildRes = spawnSync(
  "bun",
  ["adapters/shopify/build-page.mjs", yamlPath],
  { cwd: REPO_ROOT, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" }
);

if (buildRes.status !== 0) {
  die(2, `build-page.mjs failed (exit ${buildRes.status ?? "null"}) — see stderr above`);
}

let local;
try {
  local = JSON.parse(buildRes.stdout);
} catch (err) {
  die(2, `build-page.mjs stdout is not JSON: ${err.message}`);
}

if (!local || !local.page || !local.page.handle) {
  die(2, `build-page.mjs payload missing page.handle`);
}

// --- Step B: fetch the live page state ---

const store = env("SHOPIFY_STORE");
const token = env("SHOPIFY_ADMIN_TOKEN");
const publishFlag = process.env.PUBLISH === "1";
const formatJson = process.env.FORMAT === "json";

const client = createClient({ store, token });

const handle = encodeURIComponent(local.page.handle);
let lookup;
try {
  lookup = await client.get(
    `/pages.json?handle=${handle}&fields=id,handle,title,body_html,published_at,template_suffix,updated_at`
  );
} catch (err) {
  die(2, `lookup failed: ${err.message}`);
}

const pages = lookup?.pages || [];
if (pages.length > 1) {
  die(2, `ambiguous handle "${local.page.handle}" — ${pages.length} pages match`);
}

// --- Step C: field-by-field comparison ---

function normTemplateSuffix(v) {
  // Shopify treats empty string / null interchangeably for template_suffix.
  if (v === undefined || v === null || v === "") return null;
  return v;
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

const result = {
  spec: "shopify:page",
  source: yamlArg,
  handle: local.page.handle,
  live: { exists: pages.length === 1 },
  fields: {},
  result: "EQUAL",
  diff_count: 0
};

if (pages.length === 0) {
  result.live.exists = false;
  result.result = "DIFF";
  result.diff_count = 1;
  result.fields.existence = {
    equal: false,
    note: "live page absent — push would CREATE"
  };
} else {
  const live = pages[0];
  result.live.id = live.id;
  result.live.updated_at = live.updated_at;

  // title
  {
    const eq = local.page.title === live.title;
    result.fields.title = { equal: eq, local: local.page.title, live: live.title };
    if (!eq) result.diff_count += 1;
  }

  // template_suffix
  {
    const lv = normTemplateSuffix(local.page.template_suffix);
    const rv = normTemplateSuffix(live.template_suffix);
    const eq = lv === rv;
    result.fields.template_suffix = { equal: eq, local: lv, live: rv };
    if (!eq) result.diff_count += 1;
  }

  // body_html
  {
    const lv = local.page.body_html ?? "";
    const rv = live.body_html ?? "";
    const off = firstDiffOffset(lv, rv);
    const eq = off === -1;
    result.fields.body_html = {
      equal: eq,
      local_length: lv.length,
      live_length: rv.length,
      first_diff_offset: eq ? null : off
    };
    if (!eq) result.diff_count += 1;
  }

  // published — only when PUBLISH=1
  {
    if (publishFlag) {
      const localPublished = local.page.published === true;
      const livePublished = live.published_at !== null;
      const eq = localPublished === livePublished;
      result.fields.published = {
        equal: eq,
        local: localPublished,
        live: livePublished,
        live_published_at: live.published_at
      };
      if (!eq) result.diff_count += 1;
    } else {
      result.fields.published = {
        skipped: true,
        reason: "PUBLISH env not set — Trunk-draft vs. Site-published is expected (CW-001)"
      };
    }
  }

  if (result.diff_count > 0) result.result = "DIFF";
}

// --- Step D: emit output ---

if (formatJson) {
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
} else {
  const out = [];
  out.push(`spec             : ${result.spec}`);
  out.push(`source           : ${result.source}`);
  out.push(`handle           : ${result.handle}`);
  if (!result.live.exists) {
    out.push(`live_page        : ABSENT (push would CREATE)`);
  } else {
    out.push(`live_page_id     : ${result.live.id}`);
    out.push(`live_updated_at  : ${result.live.updated_at}`);

    const t = result.fields.title;
    out.push(`title            : ${t.equal ? "EQUAL" : "DIFFER"} (local="${t.local}", live="${t.live}")`);

    const ts = result.fields.template_suffix;
    out.push(`template_suffix  : ${ts.equal ? "EQUAL" : "DIFFER"} (local=${JSON.stringify(ts.local)}, live=${JSON.stringify(ts.live)})`);

    const bh = result.fields.body_html;
    if (bh.equal) {
      out.push(`body_html        : EQUAL (${bh.local_length} chars)`);
    } else {
      out.push(`body_html        : DIFFER (local ${bh.local_length} chars, live ${bh.live_length} chars, first diff at offset ${bh.first_diff_offset})`);
    }

    const pub = result.fields.published;
    if (pub.skipped) {
      out.push(`published        : SKIPPED (${pub.reason})`);
    } else {
      out.push(`published        : ${pub.equal ? "EQUAL" : "DIFFER"} (local=${pub.local}, live=${pub.live})`);
    }
  }
  out.push(`RESULT           : ${result.result}${result.diff_count ? ` (${result.diff_count} field${result.diff_count === 1 ? "" : "s"})` : ""}`);
  process.stdout.write(out.join("\n") + "\n");
}

process.exit(result.result === "EQUAL" ? 0 : 1);
