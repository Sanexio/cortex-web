#!/usr/bin/env bun
// Cortex-Web WordPress adapter — BUILD step for Praxis-Theme team data.
// Loads all trunk/content/team/*.yaml, validates against team-member schema,
// renders them through the team-praxis renderer, and emits a Payload-JSON
// that `team-to-wp.mjs` writes as inc/data/team.json into the theme.
//
// Usage:
//   bun adapters/wordpress/build-team.mjs
//
// Output (stdout, JSON):
//   {
//     "asset": { "path": "inc/data/team.json", "value": "<serialized-array>\n" },
//     "meta":  { "source_count": 8, "generated_at": "<iso>", "schema_version": "..." }
//   }
//
// Exit codes:
//   0 success
//   1 IO / YAML parse error
//   2 schema validation error
//   3 render error
//
// N-1 WP-Template-Adapter (Pattern B reverse), Session 29, 2026-04-23.
// Companion spec: specs/cross-site-transfer/N-1_wp-template-adapter.md

import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import yaml from "js-yaml";
import Ajv from "ajv";

import { renderTeamPraxis, RENDERER_META } from "./lib/renderers/team-praxis.mjs";
// CW-009/Plattform-Split: Tenant-Pfad via Helper auflösen statt hartcodieren.
// Mit gesetztem CORTEX_TENANT_DIR liest aus dem konfigurierten Tenant-Repo.
// Ohne ENV: Demo-Fallback trunk/_examples/trunk/content/team.
import { tenantPath, tenantDescribe } from "../../tools/lib/tenant-path.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../..");
const TEAM_DIR = tenantPath("trunk/content/team");
const SCHEMA_PATH = resolve(REPO_ROOT, "trunk/schema/team-member.schema.json");

// Diagnose auf stderr — stdout bleibt das Payload-JSON
process.stderr.write(`[build-team] ${tenantDescribe()}\n`);
process.stderr.write(`[build-team] TEAM_DIR=${TEAM_DIR}\n`);

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

function loadSchema() {
  try {
    return JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
  } catch (err) {
    die(1, `cannot read schema at ${SCHEMA_PATH}: ${err.message}`);
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

function listYamlFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (err) {
    die(1, `cannot read team dir ${dir}: ${err.message}`);
  }
  return entries.filter((f) => f.endsWith(".yaml")).sort();
}

// --- main ---

const files = listYamlFiles(TEAM_DIR);
if (files.length === 0) {
  die(1, `no *.yaml files in ${TEAM_DIR}`);
}

const validator = compileValidator(loadSchema());
const members = files.map((f) => {
  const absPath = join(TEAM_DIR, f);
  const data = loadYaml(absPath);
  enforceValid(validator, data, `trunk/content/team/${f}`);
  return data;
});

let praxisArray;
try {
  praxisArray = renderTeamPraxis(members);
} catch (err) {
  die(3, `render failed: ${err.message}`);
}

if (!Array.isArray(praxisArray) || praxisArray.length !== members.length) {
  die(3, `render returned unexpected shape (len=${praxisArray?.length}, expected=${members.length})`);
}

// Stable JSON serialization: pretty-printed (2 spaces), trailing newline.
// This is what the PHP side will `json_decode()`. Readable for diffing.
const assetValue = JSON.stringify(praxisArray, null, 2) + "\n";

const payload = {
  asset: {
    path: "inc/data/team.json",
    value: assetValue
  },
  meta: {
    source_count: members.length,
    generated_at: new Date().toISOString(),
    schema_version: "trunk/schema/team-member.schema.json",
    renderer: RENDERER_META.id
  }
};

process.stdout.write(JSON.stringify(payload, null, 2) + "\n");
