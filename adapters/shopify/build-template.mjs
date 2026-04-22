#!/usr/bin/env bun
// Cortex-Web Shopify adapter — build step for THEME TEMPLATES (templates/*.json).
// Loads the trunk page YAML + all team members, validates both schemas, then
// dispatches to the correct template renderer based on page.views.juvantis.renderer
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
import Ajv from "ajv";

import { renderTemplateJuvantisUeberUns } from "./lib/renderers/template-juvantis-ueber-uns.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../..");

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
  return new Ajv({ allErrors: true, strict: false }).compile(schema);
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
  const dir = resolve(REPO_ROOT, "trunk/content/team");
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

// Dispatch: for now only the ueber-uns page has a juvantis-template renderer.
// Future pages can declare `views.juvantis.renderer` explicitly.
const rendererKey = page.views?.juvantis?.renderer || (page.id === "ueber-uns" ? "juvantis-ueber-uns" : null);
if (!rendererKey) {
  die(3, `no juvantis template renderer configured for page id=${page.id} (set views.juvantis.renderer)`);
}

let payload;
try {
  switch (rendererKey) {
    case "juvantis-ueber-uns":
      payload = renderTemplateJuvantisUeberUns(page, teamMembers, { sourcePath });
      break;
    default:
      die(3, `unknown renderer key: ${rendererKey}`);
  }
} catch (err) {
  die(3, `render failed: ${err.message}`);
}

process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
