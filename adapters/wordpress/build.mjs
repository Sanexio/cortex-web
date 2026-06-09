#!/usr/bin/env bun
// Cortex-Web WordPress adapter — build step.
// Reads one product YAML, validates against product schema, renders the praxis view,
// writes the WP-ready payload as JSON to stdout.
//
// Usage:
//   bun adapters/wordpress/build.mjs trunk/content/products/bluttests/basic-check.yaml
//
// Exit codes:
//   0 = success, payload on stdout
//   1 = usage / IO error
//   2 = schema validation failed
//   3 = render error
//   4 = tenant policy violation (external cta_url domain not in whitelist)

import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import yaml from "js-yaml";
import { createAdapterAjv } from "../../tools/lib/ajv-adapter.mjs";

import { renderProductPractice } from "./lib/renderers/product-practice.mjs";
import { tenantConfigGet } from "../../tools/lib/tenant-config.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../..");

function die(code, msg) {
  process.stderr.write(`ADAPTER_ERROR: ${msg}\n`);
  process.exit(code);
}

const contentArg = process.argv[2];
if (!contentArg) {
  die(1, "usage: bun build.mjs <path-to-product.yaml>");
}

const contentPath = resolve(contentArg);
let raw, product;
try {
  raw = readFileSync(contentPath, "utf8");
} catch (err) {
  die(1, `cannot read ${contentArg}: ${err.message}`);
}
try {
  product = yaml.load(raw);
} catch (err) {
  die(1, `yaml parse error in ${contentArg}: ${err.message}`);
}

const schemaPath = resolve(REPO_ROOT, "trunk/schema/product.schema.json");
let schema;
try {
  schema = JSON.parse(readFileSync(schemaPath, "utf8"));
} catch (err) {
  die(1, `cannot read product schema at ${schemaPath}: ${err.message}`);
}

const ajv = createAdapterAjv();
const validate = ajv.compile(schema);
if (!validate(product)) {
  const details = validate.errors
    .map((e) => `  - ${e.instancePath || "(root)"} ${e.message}${e.params ? " " + JSON.stringify(e.params) : ""}`)
    .join("\n");
  process.stderr.write(`ADAPTER_ERROR: schema validation failed for ${contentArg}:\n${details}\n`);
  process.exit(2);
}

// Tenant-Policy: views.practice.cta_url darf nur intern (/) oder auf eine whitelisted Domain zeigen.
// Whitelist kommt aus tenant.config.json (cta.allowed_external_cta_domains). Internal-CTAs sind immer ok.
const praxisCta = product?.views?.practice?.cta_url;
if (typeof praxisCta === "string" && praxisCta.startsWith("https://")) {
  let host;
  try {
    host = new URL(praxisCta).host;
  } catch (err) {
    die(4, `views.practice.cta_url is not a valid URL: ${praxisCta} (${err.message})`);
  }
  const allowed = tenantConfigGet("cta.allowed_external_cta_domains", []);
  if (!Array.isArray(allowed) || allowed.length === 0) {
    die(4, `views.practice.cta_url is external (${host}) but tenant.config.json defines no cta.allowed_external_cta_domains whitelist`);
  }
  if (!allowed.includes(host)) {
    die(4, `views.practice.cta_url host "${host}" is not in tenant.config.json cta.allowed_external_cta_domains (${allowed.join(", ")})`);
  }
}

const sourcePath = relative(REPO_ROOT, contentPath);

let payload;
try {
  payload = renderProductPractice(product, { sourcePath });
} catch (err) {
  die(3, `render failed: ${err.message}`);
}

process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
