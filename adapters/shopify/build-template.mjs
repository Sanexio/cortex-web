#!/usr/bin/env bun
// Cortex-Web Shopify adapter — build step for THEME TEMPLATES (templates/*.json).
// Loads the trunk page YAML + all team members, validates both schemas, then
// dispatches to the correct template renderer based on page.views.shop.renderer
// (defaults to "juvantis-ueber-uns" for the uber-uns page).
//
// Usage:
//   bun adapters/shopify/build-template.mjs trunk/content/pages/_shared/ueber-uns.yaml
//
// Exit codes:
//   0 = success, payload on stdout
//   1 = usage / IO error
//   2 = schema validation failed
//   3 = render error
//
// content-bridge-v1 Option B, 2026-04-22.

import { readFileSync, readdirSync } from "node:fs";
import { resolve, relative, join } from "node:path";
import yaml from "js-yaml";
import { createAdapterAjv } from "../../tools/lib/ajv-adapter.mjs";

// Dispatch über die Renderer-Registry (SSOT) statt hartcodiertem switch.
import { RENDERER_REGISTRY } from "./lib/renderer-registry.mjs";
// CW-009/Plattform-Split: Tenant-Pfad via Helper auflösen statt hartcodieren.
import { tenantPath, tenantDescribe } from "../../tools/lib/tenant-path.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../..");

process.stderr.write(`[shopify/build-template] ${tenantDescribe()}\n`);

function die(code, msg) {
  process.stderr.write(`ADAPTER_ERROR: ${msg}\n`);
  process.exit(code);
}

function loadYaml(absPath) {
  try {
    return yaml.load(readFileSync(absPath, "utf8"));
  } catch (err) {
    die(1, `yaml/io error in ${absPath}: ${err.message}`);
  }
}

function loadSchema(relPath) {
  const absPath = resolve(REPO_ROOT, relPath);
  try {
    return JSON.parse(readFileSync(absPath, "utf8"));
  } catch (err) {
    die(1, `cannot read schema at ${absPath}: ${err.message}`);
  }
}

function compileValidator(schema) {
  return createAdapterAjv().compile(schema);
}

function enforceValid(validator, data, label) {
  if (!validator(data)) {
    const details = validator.errors
      .map((e) => `  - ${e.instancePath || "(root)"} ${e.message}${e.params ? " " + JSON.stringify(e.params) : ""}`)
      .join("\n");
    process.stderr.write(`ADAPTER_ERROR: schema validation failed for ${label}:\n${details}\n`);
    process.exit(2);
  }
}

function loadAllTeamMembers() {
  const dir = tenantPath("trunk/content/team");
  const entries = readdirSync(dir).filter((f) => f.endsWith(".yaml"));
  const validator = compileValidator(loadSchema("trunk/schema/team-member.schema.json"));
  const members = entries.map((f) => {
    const data = loadYaml(join(dir, f));
    enforceValid(validator, data, `trunk/content/team/${f}`);
    return data;
  });
  return members.sort((a, b) => a.order - b.order);
}

// ---------- main ----------

const contentArg = process.argv[2];
if (!contentArg) die(1, "usage: bun build-template.mjs <path-to-page.yaml>");

const contentPath = resolve(contentArg);
const page = loadYaml(contentPath);

enforceValid(compileValidator(loadSchema("trunk/schema/page.schema.json")), page, contentArg);

const teamMembers = loadAllTeamMembers();
const sourcePath = relative(REPO_ROOT, contentPath);

// Dispatch über die Renderer-Registry. Pages dürfen `views.shop.renderer`
// explizit setzen; sonst nutzt die ueber-uns-Page ihren Template-Renderer.
// Akzeptiert sowohl den voll-qualifizierten Registry-Key
// ("shopify.template.shop-ueber-uns") als auch die Kurzform ("shop-ueber-uns").
let rendererKey =
  page.views?.shop?.renderer ||
  (page.id === "ueber-uns" ? "shopify.template.shop-ueber-uns" : null);
if (!rendererKey) {
  die(3, `no shop template renderer configured for page id=${page.id} (set views.shop.renderer)`);
}
// Kurzform -> voll-qualifizierten Template-Key normalisieren.
if (!RENDERER_REGISTRY[rendererKey] && RENDERER_REGISTRY[`shopify.template.${rendererKey}`]) {
  rendererKey = `shopify.template.${rendererKey}`;
}
const entry = RENDERER_REGISTRY[rendererKey];
if (!entry || !rendererKey.startsWith("shopify.template.")) {
  const known = Object.keys(RENDERER_REGISTRY)
    .filter((k) => k.startsWith("shopify.template."))
    .join(", ");
  die(3, `unknown template renderer key: ${rendererKey} (known: ${known})`);
}

let payload;
try {
  payload = entry.fn(page, teamMembers, { sourcePath });
} catch (err) {
  die(3, `render failed: ${err.message}`);
}

process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
