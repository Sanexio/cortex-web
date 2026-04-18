#!/usr/bin/env bun
// Cortex-Web Shopify adapter — build step.
// Reads one product YAML, validates against product schema, renders the juvantis view,
// writes the Shopify-ready payload as JSON to stdout.
//
// Usage:
//   bun adapters/shopify/build.mjs trunk/content/products/bluttests/basic-check.yaml
//
// Exit codes:
//   0 = success, payload on stdout
//   1 = usage / IO error
//   2 = schema validation failed
//   3 = render error

import { readFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import yaml from "js-yaml";
import Ajv from "ajv";

import { renderProductJuvantis } from "./lib/renderers/product-juvantis.mjs";

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

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
if (!validate(product)) {
  const details = validate.errors
    .map((e) => `  - ${e.instancePath || "(root)"} ${e.message}${e.params ? " " + JSON.stringify(e.params) : ""}`)
    .join("\n");
  process.stderr.write(`ADAPTER_ERROR: schema validation failed for ${contentArg}:\n${details}\n`);
  process.exit(2);
}

const sourcePath = relative(REPO_ROOT, contentPath);

let payload;
try {
  payload = renderProductJuvantis(product, { sourcePath });
} catch (err) {
  die(3, `render failed: ${err.message}`);
}

process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
