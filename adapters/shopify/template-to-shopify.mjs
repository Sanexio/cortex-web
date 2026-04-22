#!/usr/bin/env bun
// Cortex-Web Shopify adapter — REST push step for THEME TEMPLATES.
// Reads a payload JSON from stdin (output of build-template.mjs) and writes
// the template into the live (main) theme via the Admin Theme-Assets API.
//
// Pre-check: backs up the existing asset (if any) into .backups/<timestamp>-<key>.
//
// Env:
//   SHOPIFY_STORE         (required) <handle>.myshopify.com
//   SHOPIFY_ADMIN_TOKEN   (required) shpat_… with read_themes + write_themes
//   SHOPIFY_THEME_ID      (optional) pin a specific theme; default = live (role=main)
//
// Exit codes:
//   0 success, summary JSON on stdout
//   1 config / input error
//   2 REST error
//
// content-bridge-v1 Option B, 2026-04-22.

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "./lib/shopify-rest-client.mjs";

const REPO_ROOT = resolve(import.meta.dir, "../..");

function die(code, msg) {
  process.stderr.write(`ADAPTER_ERROR: ${msg}\n`);
  process.exit(code);
}

function env(name, required = true) {
  const v = process.env[name];
  if (required && (!v || v.length === 0)) {
    die(1, `env ${name} missing`);
  }
  return v;
}

async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) die(1, "no payload on stdin — pipe output of build-template.mjs");
  try { return JSON.parse(text); } catch (err) { die(1, `invalid JSON on stdin: ${err.message}`); }
}

const store = env("SHOPIFY_STORE");
const token = env("SHOPIFY_ADMIN_TOKEN");
const themeIdOverride = process.env.SHOPIFY_THEME_ID;

const payload = await readStdinJson();
if (!payload.asset?.key || typeof payload.asset.value !== "string") {
  die(1, `payload.asset.{key,value} missing or invalid`);
}

const client = createClient({ store, token });

// 1. Resolve theme id (live unless overridden).
let themeId;
if (themeIdOverride) {
  themeId = Number(themeIdOverride);
  if (!Number.isFinite(themeId)) die(1, `SHOPIFY_THEME_ID must be numeric, got "${themeIdOverride}"`);
} else {
  let themesRes;
  try {
    themesRes = await client.get(`/themes.json`);
  } catch (err) {
    die(2, `themes lookup failed (need read_themes scope): ${err.message}`);
  }
  const themes = themesRes?.themes || [];
  const live = themes.find((t) => t.role === "main");
  if (!live) die(2, `no theme with role=main found among ${themes.length} themes`);
  themeId = live.id;
}

// 2. Read existing asset (for backup).
const assetKeyEncoded = encodeURIComponent(payload.asset.key);
let existingAsset = null;
try {
  const existingRes = await client.get(`/themes/${themeId}/assets.json?asset[key]=${assetKeyEncoded}`);
  existingAsset = existingRes?.asset || null;
} catch (err) {
  // 404 is expected on first-run; only abort on other errors.
  if (!/\b404\b/.test(err.message || "")) {
    die(2, `existing-asset check failed: ${err.message}`);
  }
}

// 3. Backup if there was something.
let backupPath = null;
if (existingAsset && typeof existingAsset.value === "string") {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const safeKey = payload.asset.key.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const dir = resolve(REPO_ROOT, "adapters/shopify/.backups");
  mkdirSync(dir, { recursive: true });
  backupPath = resolve(dir, `${ts}_theme${themeId}_${safeKey}`);
  writeFileSync(backupPath, existingAsset.value);
}

// 4. PUT new asset.
let result;
try {
  const resp = await client.put(`/themes/${themeId}/assets.json`, {
    asset: { key: payload.asset.key, value: payload.asset.value }
  });
  result = resp?.asset || null;
} catch (err) {
  die(2, `asset PUT failed: ${err.message}`);
}

const summary = {
  theme_id: themeId,
  asset_key: result?.key || payload.asset.key,
  size_bytes: result?.size ?? payload.asset.value.length,
  public_url: result?.public_url ?? null,
  updated_at: result?.updated_at ?? null,
  backup_path: backupPath ? backupPath.replace(REPO_ROOT + "/", "") : null,
  action: existingAsset ? "update" : "create"
};
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
