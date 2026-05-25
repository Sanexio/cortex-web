#!/usr/bin/env bun
// Cortex-Web WP adapter — build step for praxis service pages (S34 B-2a).
// Reads one page YAML, validates against page.schema, renders the praxis view,
// emits WP-ready payload JSON on stdout.
//
// Usage:
//   bun adapters/wordpress/build-service.mjs <path-to-page.yaml> [--parent-id=<int>]
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

import { renderServicePractice } from "./lib/renderers/service-practice.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../..");

function die(code, msg) {
  process.stderr.write(`ADAPTER_ERROR: ${msg}\n`);
  process.exit(code);
}

const args = process.argv.slice(2);
let contentArg = null;
let parentId = null;
for (const a of args) {
  if (a.startsWith("--parent-id=")) {
    const v = a.slice("--parent-id=".length);
    if (!/^[0-9]+$/.test(v)) die(1, `invalid --parent-id "${v}"`);
    parentId = Number(v);
  } else if (!contentArg) {
    contentArg = a;
  } else {
    die(1, `unexpected argument: ${a}`);
  }
}
if (!contentArg) {
  die(1, "usage: bun build-service.mjs <path-to-page.yaml> [--parent-id=<int>]");
}

const contentPath = resolve(contentArg);
let raw, page;
try {
  raw = readFileSync(contentPath, "utf8");
} catch (err) {
  die(1, `cannot read ${contentArg}: ${err.message}`);
}
try {
  page = yaml.load(raw);
} catch (err) {
  die(1, `yaml parse error in ${contentArg}: ${err.message}`);
}

const schemaPath = resolve(REPO_ROOT, "trunk/schema/page.schema.json");
let schema;
try {
  schema = JSON.parse(readFileSync(schemaPath, "utf8"));
} catch (err) {
  die(1, `cannot read page schema at ${schemaPath}: ${err.message}`);
}

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
if (!validate(page)) {
  const details = validate.errors
    .map((e) => `  - ${e.instancePath || "(root)"} ${e.message}${e.params ? " " + JSON.stringify(e.params) : ""}`)
    .join("\n");
  process.stderr.write(`ADAPTER_ERROR: schema validation failed for ${contentArg}:\n${details}\n`);
  process.exit(2);
}

const sourcePath = relative(REPO_ROOT, contentPath);

let payload;
try {
  payload = renderServicePractice(page, { sourcePath, parentId });
} catch (err) {
  die(3, `render failed: ${err.message}`);
}

process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
