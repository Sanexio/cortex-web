#!/usr/bin/env bun
// Cortex-Web Phase 3 Review — orchestrator.
// Sequences: preflight → content-parity → hwg-scan → commerce-check →
// idempotency → roundtrip → screenshots. Each module returns { ok, details },
// writes its own evidence JSON/PNG, and never throws unless infrastructure fails.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";

import { createClient as createWpClient } from "../../adapters/wordpress/lib/rest-client.mjs";
import { createClient as createShopifyClient } from "../../adapters/shopify/lib/shopify-rest-client.mjs";

import { runContentParity } from "./content-parity.mjs";
import { runHwgScan } from "./hwg-scan.mjs";
import { runCommerceCheck } from "./commerce-check.mjs";
import { runIdempotency } from "./idempotency.mjs";
import { runRoundtrip } from "./roundtrip.mjs";
import { runScreenshots } from "./screenshots.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../..");

function die(code, msg) {
  process.stderr.write(`REVIEW_ERROR: ${msg}\n`);
  process.exit(code);
}

const contentArg = process.argv[2];
if (!contentArg) die(1, "usage: bun run.mjs <path-to-product.yaml>");

const contentPath = resolve(contentArg);
let trunk;
try {
  trunk = yaml.load(readFileSync(contentPath, "utf8"));
} catch (err) {
  die(1, `cannot load trunk YAML: ${err.message}`);
}

const evidenceDir = resolve(REPO_ROOT, "specs/phase-3/evidence");
mkdirSync(evidenceDir, { recursive: true });

const wpClient = createWpClient({
  baseUrl: process.env.WP_REST_BASE,
  user: process.env.WP_USER,
  password: process.env.WP_APP_PASSWORD
});
const shopifyClient = createShopifyClient({
  store: process.env.SHOPIFY_STORE,
  token: process.env.SHOPIFY_ADMIN_TOKEN
});

const ctx = {
  repoRoot: REPO_ROOT,
  contentPath,
  trunk,
  wpClient,
  shopifyClient,
  wpRestBase: process.env.WP_REST_BASE,
  shopifyStore: process.env.SHOPIFY_STORE,
  evidenceDir,
  // Well-known artefacts from Phase 1 + 2 (looked up by slug/handle at runtime)
  wpSlug: trunk.id,
  shopifyHandle: trunk.id,
  now: new Date().toISOString()
};

const results = [];

function record(ak, name, outcome) {
  const ok = !!outcome.ok;
  results.push({ ak, name, ok, details: outcome.details ?? outcome });
  const status = ok ? "✅" : "❌";
  console.log(`  AK-${ak} ${name.padEnd(32, " ")} ${status}`);
}

async function step(label, fn) {
  console.log(`\n▶  ${label}`);
  try {
    return await fn();
  } catch (err) {
    console.log(`   ${label} THREW: ${err.message}`);
    return { ok: false, details: { error: err.message } };
  }
}

// AK-1: Pre-Flight — we re-run validate.sh via child process.
async function preflight() {
  const { spawnSync } = await import("node:child_process");
  const basic = spawnSync("bash", ["tools/validate.sh"], { cwd: REPO_ROOT, encoding: "utf8" });
  const withShop = spawnSync("bash", ["tools/validate.sh"], {
    cwd: REPO_ROOT, encoding: "utf8",
    env: { ...process.env, CHECK_SHOPIFY: "1" }
  });
  const ok = basic.status === 0 && withShop.status === 0;
  return {
    ok,
    details: {
      validate_exit: basic.status,
      validate_shopify_exit: withShop.status,
      validate_tail: basic.stdout.trim().split("\n").slice(-2),
      validate_shopify_tail: withShop.stdout.trim().split("\n").slice(-2)
    }
  };
}

await step("AK-1  Pre-Flight (validate + CHECK_SHOPIFY)", async () => {
  const r = await preflight();
  record(1, "Pre-Flight", r);
  return r;
});

const parityResult = await step("AK-2+3  Content-Parität (Trunk ↔ WP ↔ Shopify)", async () => {
  return await runContentParity(ctx);
});
record(2, "WP-Content-Parität", parityResult.wp);
record(3, "Shopify-Content-Parität", parityResult.shopify);

// Hand through ids looked up by parity step
ctx.wpPageId = parityResult.wp.details?.page_id ?? null;
ctx.shopifyProductId = parityResult.shopify.details?.product_id ?? null;
ctx.wpPageLink = parityResult.wp.details?.link ?? null;
ctx.shopifyProduct = parityResult.shopify.details?.product ?? null;

await step("AK-4  HWG-Compliance (Praxis-Seite Token-Scan)", async () => {
  const r = await runHwgScan(ctx);
  record(4, "HWG-Compliance", r);
});

await step("AK-5  Juvantis-Commerce-Tauglichkeit", async () => {
  const r = await runCommerceCheck(ctx);
  record(5, "Juvantis-Commerce", r);
});

const idemp = await step("AK-6+7  Idempotenz (WP + Shopify Re-Run)", async () => {
  return await runIdempotency(ctx);
});
record(6, "WP-Idempotenz", idemp.wp);
record(7, "Shopify-Idempotenz", idemp.shopify);

await step("AK-8  Trunk-Master-Roundtrip (CW-001)", async () => {
  const r = await runRoundtrip(ctx);
  record(8, "Trunk-Master-Roundtrip", r);
});

const shots = await step("AK-9+10+11  Screenshots (WP + Shopify + Side-by-Side)", async () => {
  return await runScreenshots(ctx);
});
record(9, "WP-Screenshot", shots.wp);
record(10, "Shopify-Preview-Screenshot", shots.shopify);
record(11, "Side-by-Side (HTML+PNG)", shots.side);

// Summary
const passed = results.filter((r) => r.ok).length;
const total = results.length;
console.log(`\n======== SUMMARY ========`);
console.log(`AK automatisch: ${passed}/${total} grün  (AK-12 Self-Check manuell)`);

const summary = {
  timestamp: ctx.now,
  trunk_source: contentArg,
  wp_page_id: ctx.wpPageId,
  shopify_product_id: ctx.shopifyProductId,
  score: `${passed}/${total}`,
  all_green: passed === total,
  results
};
writeFileSync(resolve(evidenceDir, "summary.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(`Summary:  specs/phase-3/evidence/summary.json`);

process.exit(passed === total ? 0 : 2);
