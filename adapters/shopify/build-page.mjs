#!/usr/bin/env bun
// Cortex-Web Shopify adapter — build step for PAGES (not products).
// Reads one page YAML, validates against page schema, collects referenced
// team members (if any team-grid section exists), validates each against
// the team-member schema, then renders the juvantis view and writes the
// Shopify-ready payload as JSON to stdout.
//
// Usage:
//   bun adapters/shopify/build-page.mjs trunk/content/pages/_shared/ueber-uns.yaml
//
// Exit codes:
//   0 = success, payload on stdout
//   1 = usage / IO error
//   2 = schema validation failed
//   3 = render error
//
// content-bridge-v1, 2026-04-22.

import { readFileSync, readdirSync } from "node:fs";
import { resolve, relative, join } from "node:path";
import yaml from "js-yaml";
import Ajv from "ajv";

import { renderPageJuvantis } from "./lib/renderers/page-juvantis.mjs";
// CW-009/Plattform-Split: Tenant-Pfad via Helper auflösen statt hartcodieren.
import { tenantPath, tenantDescribe } from "../../tools/lib/tenant-path.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../..");

process.stderr.write(`[shopify/build-page] ${tenantDescribe()}\n`);

function die(code, msg) {
  process.stderr.write(`ADAPTER_ERROR: ${msg}\n`);
  process.exit(code);
}

function loadYaml(absPath) {
  let raw;
  try {
    raw = readFileSync(absPath, "utf8");
  } catch (err) {
    die(1, `cannot read ${absPath}: ${err.message}`);
  }
  try {
    return yaml.load(raw);
  } catch (err) {
    die(1, `yaml parse error in ${absPath}: ${err.message}`);
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
  const ajv = new Ajv({ allErrors: true, strict: false });
  return ajv.compile(schema);
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
  let entries;
  try {
    entries = readdirSync(dir).filter((f) => f.endsWith(".yaml"));
  } catch (err) {
    die(1, `cannot read team dir ${dir}: ${err.message}`);
  }
  const schema = loadSchema("trunk/schema/team-member.schema.json");
  const validator = compileValidator(schema);

  const members = entries.map((f) => {
    const path = join(dir, f);
    const data = loadYaml(path);
    enforceValid(validator, data, `trunk/content/team/${f}`);
    return data;
  });

  // Explicit display order via the `order` field (mirrors WP team-data.php array order).
  return members.sort((a, b) => a.order - b.order);
}

// ---------- main ----------

const contentArg = process.argv[2];
if (!contentArg) {
  die(1, "usage: bun build-page.mjs <path-to-page.yaml>");
}

const contentPath = resolve(contentArg);
const page = loadYaml(contentPath);

const pageSchema = loadSchema("trunk/schema/page.schema.json");
const pageValidator = compileValidator(pageSchema);
enforceValid(pageValidator, page, contentArg);

// If any section needs team members, load and validate them.
const needsTeam = page.sections.some((s) => s.type === "team-grid");
const teamMembers = needsTeam ? loadAllTeamMembers() : [];

const sourcePath = relative(REPO_ROOT, contentPath);

let payload;
try {
  payload = renderPageJuvantis(page, teamMembers, { sourcePath });
} catch (err) {
  die(3, `render failed: ${err.message}`);
}

process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
