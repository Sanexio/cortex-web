#!/usr/bin/env bun
// Cortex-Web WordPress adapter — DIFF step for WP-Theme template data files
// (Pattern B reverse, read-only). Builds the local payload from a renderer
// (reuses build-*.mjs as a sub-process), reads the current theme file from
// the local filesystem, and emits a field-by-field diff. NO writes to the
// theme filesystem, NO backup creation.
//
// Usage:
//   bun adapters/wordpress/diff-team.mjs <renderer-handle>
//   bun adapters/wordpress/diff-team.mjs team
//
// Env:
//   THEME_PATH   (optional) absolute path to theme root. Default = Local-WP
//                Praxis-Theme on Cluster-Mini-02 as documented in
//                sites/praxis-webseite/THEME_POINTER.md.
//   FORMAT       (optional) "json" for structured output; default "text".
//
// Read-only guarantee (CW-001/008): only readFileSync / existsSync / statSync
// are called. No writeFileSync / mkdirSync / unlinkSync / copyFileSync /
// renameSync anywhere in the code body. The build sub-process is also
// read-only (build-*.mjs writes only to stdout).
//
// Exit codes:
//   0 = no diff (live file matches local payload across compared fields)
//   1 = diff present (>=1 field differs, OR live file is absent)
//   2 = error (config, renderer unknown, build sub-process failed, JSON parse, ...)
//
// N-6.3, cross-site-transfer Phase F. 2026-04-23 Session 30.
// See specs/cross-site-transfer/N-6.3_cw-transfer-diff-wp-template.md for AKs.

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { existsSync, readFileSync, statSync } from "node:fs";

const REPO_ROOT = resolve(import.meta.dir, "../..");

// Default theme path — kept in sync with adapters/wordpress/team-to-wp.mjs.
// THEME_PATH env overrides on other devices / other WP installs.
const DEFAULT_THEME_PATH =
  "/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum";

// Registry of renderer handles that this diff tool knows about. Each handle
// points to the build-*.mjs sub-process whose stdout payload is compared
// against the live theme file. Adding a new handle (e.g. "services",
// "diagnostik") is a 1-line append — no breaking change to the CLI grammar.
const DIFF_RENDERERS = {
  team: {
    build_tool: "adapters/wordpress/build-team.mjs",
    source_desc: "trunk/content/team/*.yaml"
  }
};

function die(code, msg) {
  process.stderr.write(`DIFF_ERROR: ${msg}\n`);
  process.exit(code);
}

const handleArg = process.argv[2];
if (!handleArg) die(1, "usage: bun diff-team.mjs <renderer-handle> (known: " + Object.keys(DIFF_RENDERERS).join(", ") + ")");

const rendererCfg = DIFF_RENDERERS[handleArg];
if (!rendererCfg) die(1, `unknown renderer handle "${handleArg}" (known: ${Object.keys(DIFF_RENDERERS).join(", ")})`);

const formatJson = process.env.FORMAT === "json";

// --- Step A: spawn build-*.mjs sub-process to get the local payload ---

const buildRes = spawnSync(
  "bun",
  [rendererCfg.build_tool],
  { cwd: REPO_ROOT, stdio: ["ignore", "pipe", "inherit"], encoding: "utf8" }
);

if (buildRes.status !== 0) {
  die(2, `${rendererCfg.build_tool} failed (exit ${buildRes.status ?? "null"}) — see stderr above`);
}

let localPayload;
try {
  localPayload = JSON.parse(buildRes.stdout);
} catch (err) {
  die(2, `${rendererCfg.build_tool} stdout is not JSON: ${err.message}`);
}

if (!localPayload?.asset?.path || typeof localPayload.asset.value !== "string") {
  die(2, `build payload missing asset.{path,value}`);
}

// --- Step B: parse local asset.value as JSON (structured compare) ---

let localData;
try {
  localData = JSON.parse(localPayload.asset.value);
} catch (err) {
  die(2, `local asset.value is not valid JSON: ${err.message}`);
}

// --- Step C: resolve theme path ---

const themePath = process.env.THEME_PATH || DEFAULT_THEME_PATH;
if (!existsSync(themePath)) {
  die(2, `theme path not found: ${themePath} (set THEME_PATH to override)`);
}
try {
  if (!statSync(themePath).isDirectory()) die(2, `theme path is not a directory: ${themePath}`);
} catch (err) {
  die(2, `theme path stat failed: ${err.message}`);
}

// --- Step D: resolve target file path, with path-escape guard ---

const assetRel = localPayload.asset.path.replace(/^\/+/, "");
if (assetRel.includes("..") || assetRel.startsWith("/")) {
  die(2, `unsafe asset.path from build payload: ${localPayload.asset.path}`);
}
const targetPath = resolve(themePath, assetRel);
if (!targetPath.startsWith(resolve(themePath) + "/")) {
  die(2, `resolved target escapes theme root: ${targetPath}`);
}

// --- Step E: read live file (or ABSENT) ---

const result = {
  spec: "wp:template",
  renderer: handleArg,
  source: rendererCfg.source_desc,
  asset_path: localPayload.asset.path,
  theme_path: themePath,
  live: { exists: false },
  fields: {},
  result: "EQUAL",
  diff_count: 0
};

if (!existsSync(targetPath)) {
  result.result = "DIFF";
  result.diff_count = 1;
  result.fields.existence = {
    equal: false,
    note: "live file absent — push would CREATE"
  };
} else {
  // READ-ONLY: readFileSync + statSync, no write calls.
  let liveRaw;
  try {
    liveRaw = readFileSync(targetPath, "utf8");
  } catch (err) {
    die(2, `live file read failed: ${err.message}`);
  }

  let liveStat;
  try {
    liveStat = statSync(targetPath);
  } catch (err) {
    die(2, `live file stat failed: ${err.message}`);
  }

  result.live.exists = true;
  result.live.size = liveStat.size;
  result.live.mtime = liveStat.mtime.toISOString();

  let liveData;
  try {
    liveData = JSON.parse(liveRaw);
  } catch (err) {
    die(2, `live file is not valid JSON: ${err.message}`);
  }

  // --- Step F: canonical-JSON (sorted keys, recursive) ---

  const localCanon = canonicalString(localData);
  const liveCanon = canonicalString(liveData);

  // member_count
  {
    const localCount = Array.isArray(localData) ? localData.length : null;
    const liveCount = Array.isArray(liveData) ? liveData.length : null;
    const eq = localCount === liveCount;
    result.fields.member_count = { equal: eq, local: localCount, live: liveCount };
    if (!eq) result.diff_count += 1;
  }

  // member_slugs_sorted (multiset)
  {
    const localSlugs = slugsOf(localData);
    const liveSlugs = slugsOf(liveData);
    const localJson = JSON.stringify(localSlugs);
    const liveJson = JSON.stringify(liveSlugs);
    const eq = localJson === liveJson;
    result.fields.member_slugs_sorted = { equal: eq, local: localSlugs, live: liveSlugs };
    if (!eq) result.diff_count += 1;
  }

  // team_json (full canonical compare)
  {
    const off = firstDiffOffset(localCanon, liveCanon);
    const eq = off === -1;
    result.fields.team_json = {
      equal: eq,
      local_length: localCanon.length,
      live_length: liveCanon.length,
      first_diff_offset: eq ? null : off
    };
    if (!eq) result.diff_count += 1;
  }

  if (result.diff_count > 0) result.result = "DIFF";
}

// --- Step G: emit output ---

if (formatJson) {
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
} else {
  const out = [];
  out.push(`spec             : ${result.spec}`);
  out.push(`renderer         : ${result.renderer}`);
  out.push(`source           : ${result.source}`);
  out.push(`asset_path       : ${result.asset_path}`);
  out.push(`theme_path       : ${result.theme_path}`);
  if (!result.live.exists) {
    out.push(`live_file        : ABSENT (push would CREATE)`);
  } else {
    out.push(`live_file        : exists (size ${result.live.size} bytes, mtime ${result.live.mtime})`);

    const mc = result.fields.member_count;
    out.push(`member_count     : ${mc.equal ? "EQUAL" : "DIFFER"} (local=${mc.local}, live=${mc.live})`);

    const ms = result.fields.member_slugs_sorted;
    if (ms.equal) {
      out.push(`member_slugs     : EQUAL (${ms.local.length} slugs: ${JSON.stringify(ms.local)})`);
    } else {
      out.push(`member_slugs     : DIFFER (local=${JSON.stringify(ms.local)}, live=${JSON.stringify(ms.live)})`);
    }

    const tj = result.fields.team_json;
    if (tj.equal) {
      out.push(`team_json        : EQUAL (${tj.local_length} chars canonical)`);
    } else {
      out.push(`team_json        : DIFFER (local ${tj.local_length} chars, live ${tj.live_length} chars, first diff at offset ${tj.first_diff_offset})`);
    }
  }
  out.push(`RESULT           : ${result.result}${result.diff_count ? ` (${result.diff_count} field${result.diff_count === 1 ? "" : "s"})` : ""}`);
  process.stdout.write(out.join("\n") + "\n");
}

process.exit(result.result === "EQUAL" ? 0 : 1);

// --- helpers ---

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = canonicalize(value[key]);
    }
    return out;
  }
  return value;
}

function canonicalString(value) {
  return JSON.stringify(canonicalize(value));
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

// Handle-specific slug extractor. For the `team` handle the renderer output
// is a JSON array of member objects with `slug` keys (see N-1 team-praxis
// renderer). Other handles may ship alternative summary fields and their
// own extractor in the future; team_json canonical compare stays generic.
function slugsOf(data) {
  if (!Array.isArray(data)) return [];
  return data
    .map((m) => (m && typeof m === "object" ? m.slug : null))
    .filter((s) => typeof s === "string")
    .sort();
}
