#!/usr/bin/env bun
// Cortex-Web WordPress adapter — PUSH step for Praxis-Theme team data.
// Reads a Payload-JSON from stdin (from build-team.mjs) and writes it to
// <theme>/inc/data/team.json on the local filesystem, with CW-008-compliant
// backup of the prior contents (if any) before overwriting.
//
// Env / Helper:
//   Theme-Pfad wird über tools/lib/theme-path.mjs aufgelöst:
//     1. CORTEX_THEME_PATH (env)         — explizit gesetzt
//     2. THEME_PATH (env, Legacy)        — Backward-Compat, mit stderr-Hinweis
//     3. ~/.cortex/theme-path (Mac-lokal) — Default-File mit Pfad in 1. Zeile
//     4. <repo>/.demo-theme              — Demo-Fallback (gitignored)
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

// CW-009/Plattform-Split: Theme-Pfad via Helper auflösen statt hartcodieren.
import { themePath, themeDescribe } from "../../tools/lib/theme-path.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../..");

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

const themeRoot = themePath();
process.stderr.write(`[team-to-wp] ${themeDescribe()}\n`);
if (!existsSync(themeRoot)) {
  die(1, `theme path not found: ${themeRoot} (set CORTEX_THEME_PATH or ~/.cortex/theme-path)`);
}
try {
  if (!statSync(themeRoot).isDirectory()) die(1, `theme path is not a directory: ${themeRoot}`);
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

const targetPath = resolve(themeRoot, assetRel);
if (!targetPath.startsWith(resolve(themeRoot) + "/")) {
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
  theme_path: themeRoot,
  target_path: targetPath,
  action,
  size_bytes: Buffer.byteLength(payload.asset.value, "utf8"),
  backup_path: backupPath ? backupPath.replace(REPO_ROOT + "/", "") : null,
  source_count: payload.meta?.source_count ?? null,
  generated_at: payload.meta?.generated_at ?? null
};
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
