#!/usr/bin/env bun
// Cortex-Web WordPress adapter — PUSH step for Praxis-Theme team data.
// Reads a Payload-JSON from stdin (from build-team.mjs) and writes it to
// <theme>/inc/data/team.json on the local filesystem, with CW-008-compliant
// backup of the prior contents (if any) before overwriting.
//
// Env:
//   THEME_PATH (optional) — absolute path to the theme root. Defaults to the
//                           Local-WP theme on Cluster-Mini-02 as documented in
//                           sites/praxis-webseite/THEME_POINTER.md.
//
// Exit codes:
//   0 success, summary JSON on stdout
//   1 config / input error
//   2 backup write failed
//   3 target write failed
//
// N-1 WP-Template-Adapter (Pattern B reverse), Session 29, 2026-04-23.
// Symmetric to adapters/shopify/template-to-shopify.mjs (CW-008 backup pattern).

import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "../..");

// Default theme path is documented in sites/praxis-webseite/THEME_POINTER.md.
// Kept as a constant here so THEME_PATH env can override it on other devices.
const DEFAULT_THEME_PATH =
  "/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum";

function die(code, msg) {
  process.stderr.write(`ADAPTER_ERROR: ${msg}\n`);
  process.exit(code);
}

async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) die(1, "no payload on stdin — pipe output of build-team.mjs");
  try {
    return JSON.parse(text);
  } catch (err) {
    die(1, `invalid JSON on stdin: ${err.message}`);
  }
}

// --- main ---

const themePath = process.env.THEME_PATH || DEFAULT_THEME_PATH;
if (!existsSync(themePath)) {
  die(1, `theme path not found: ${themePath} (set THEME_PATH to override)`);
}
try {
  if (!statSync(themePath).isDirectory()) die(1, `theme path is not a directory: ${themePath}`);
} catch (err) {
  die(1, `theme path stat failed: ${err.message}`);
}

const payload = await readStdinJson();
if (!payload?.asset?.path || typeof payload.asset.value !== "string") {
  die(1, `payload.asset.{path,value} missing or invalid`);
}

// Safety: the asset.path is theme-relative and must NOT escape the theme root.
const assetRel = payload.asset.path.replace(/^\/+/, "");
if (assetRel.includes("..") || assetRel.startsWith("/")) {
  die(1, `unsafe asset.path: ${payload.asset.path}`);
}

const targetPath = resolve(themePath, assetRel);
if (!targetPath.startsWith(resolve(themePath) + "/")) {
  die(1, `resolved target escapes theme root: ${targetPath}`);
}

// Ensure target directory exists (creates inc/data/ on first run).
mkdirSync(dirname(targetPath), { recursive: true });

// CW-008: back up existing content before overwriting.
let backupPath = null;
let action = "create";
if (existsSync(targetPath)) {
  action = "update";
  const prior = readFileSync(targetPath, "utf8");
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const safeKey = assetRel.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const backupDir = resolve(REPO_ROOT, "adapters/wordpress/.backups");
  try {
    mkdirSync(backupDir, { recursive: true });
    backupPath = resolve(backupDir, `${ts}_${safeKey}`);
    writeFileSync(backupPath, prior);
  } catch (err) {
    die(2, `backup write failed: ${err.message}`);
  }
}

// Write new asset.
try {
  writeFileSync(targetPath, payload.asset.value);
} catch (err) {
  die(3, `target write failed: ${err.message}`);
}

const summary = {
  theme_path: themePath,
  target_path: targetPath,
  action,
  size_bytes: Buffer.byteLength(payload.asset.value, "utf8"),
  backup_path: backupPath ? backupPath.replace(REPO_ROOT + "/", "") : null,
  source_count: payload.meta?.source_count ?? null,
  generated_at: payload.meta?.generated_at ?? null
};
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
