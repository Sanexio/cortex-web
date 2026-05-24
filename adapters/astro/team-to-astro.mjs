#!/usr/bin/env bun
// Cortex-Web Astro-Adapter — Team-Sync.
// Liest alle trunk/content/team/*.yaml-Files, validiert gegen
// trunk/schema/team-member.schema.json und schreibt eine konsolidierte
// TypeScript-Data-Datei in sites/sanexio-github-io/repo/src/data/team.ts.
//
// Verwendung:
//   bun adapters/astro/team-to-astro.mjs
//
// Exit codes:
//   0  success, team.ts geschrieben
//   1  IO / Usage error
//   2  Schema validation failed

import { readFileSync, readdirSync } from "node:fs";
import { resolve, basename } from "node:path";
import yaml from "js-yaml";
import Ajv from "ajv";

import { sanexioPath, writeWithBackup, tsHeader, tsExportConst } from "./lib/astro-writer.mjs";
// CW-009/Plattform-Split: Tenant-Pfad via Helper auflösen statt hartcodieren.
import { tenantPath, tenantDescribe } from "../../tools/lib/tenant-path.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../..");
const TEAM_DIR = tenantPath("trunk/content/team");
const SCHEMA_PATH = resolve(REPO_ROOT, "trunk/schema/team-member.schema.json");
const TARGET = sanexioPath("src/data/team.ts");

process.stderr.write(`[astro/team-to-astro] ${tenantDescribe()}\n`);
process.stderr.write(`[astro/team-to-astro] TEAM_DIR=${TEAM_DIR}\n`);

function die(code, msg) {
  process.stderr.write(`ASTRO_ADAPTER_ERROR: ${msg}\n`);
  process.exit(code);
}

let schema;
try {
  schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
} catch (err) {
  die(1, `cannot read team-member schema: ${err.message}`);
}

const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

let files;
try {
  files = readdirSync(TEAM_DIR).filter((f) => f.endsWith(".yaml")).sort();
} catch (err) {
  die(1, `cannot read team dir ${TEAM_DIR}: ${err.message}`);
}

if (!files.length) die(1, `no team yaml files in ${TEAM_DIR}`);

const members = [];
const errors = [];
const sources = [];

for (const f of files) {
  const full = resolve(TEAM_DIR, f);
  sources.push(`trunk/content/team/${f}`);
  let raw;
  try { raw = readFileSync(full, "utf8"); }
  catch (err) { errors.push(`${f}: read failed (${err.message})`); continue; }
  let doc;
  try { doc = yaml.load(raw); }
  catch (err) { errors.push(`${f}: yaml parse (${err.message})`); continue; }

  if (!validate(doc)) {
    const summary = validate.errors.map((e) => `${e.instancePath || "/"} ${e.message}`).join("; ");
    errors.push(`${f}: schema invalid — ${summary}`);
    continue;
  }
  members.push(projectMember(doc));
}

if (errors.length) {
  for (const e of errors) process.stderr.write(`SCHEMA_ERROR: ${e}\n`);
  die(2, `${errors.length} team member(s) failed validation`);
}

members.sort((a, b) => a.order - b.order);

const ts =
  tsHeader(sources) +
  "\n" +
  `export interface TeamMember {\n` +
  `  id: string;\n` +
  `  slug: string;\n` +
  `  order: number;\n` +
  `  name: string;\n` +
  `  role: { de: string; en?: string };\n` +
  `  languages: readonly string[];\n` +
  `  intro: { de: string; en?: string };\n` +
  `  accent: string;\n` +
  `  qualifications: readonly string[];\n` +
  `  profile_urls?: { praxis?: string | null; juvantis?: string | null; sanexio?: string | null };\n` +
  `}\n\n` +
  tsExportConst("TEAM", members, "readonly TeamMember[]");

try {
  writeWithBackup(TARGET, ts);
} catch (err) {
  die(1, `write failed: ${err.message}`);
}

process.stdout.write(JSON.stringify({
  ok: true,
  wrote: TARGET.replace(REPO_ROOT + "/", ""),
  members: members.length,
}, null, 2) + "\n");

function projectMember(doc) {
  // Reduziert das Trunk-Schema auf das, was Sanexio aktuell konsumiert.
  // bio/image* werden absichtlich nicht exportiert — Sanexio rendert nur
  // Kurzprofile als „klinischer Validator". Bei Bedarf später erweitern.
  return {
    id: doc.id,
    slug: doc.slug,
    order: doc.order,
    name: doc.name,
    role: pickI18n(doc.role),
    languages: doc.languages,
    intro: pickI18n(doc.intro),
    accent: doc.accent,
    qualifications: Array.isArray(doc.qualifications) ? doc.qualifications : [],
    profile_urls: doc.profile_urls ?? null,
  };
}

function pickI18n(obj) {
  if (!obj || typeof obj !== "object") return { de: "" };
  const out = { de: obj.de || "" };
  if (obj.en) out.en = obj.en;
  return out;
}
