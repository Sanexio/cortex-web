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
import { resolveThemeId } from "./lib/theme-id.mjs";

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

const payload = await readStdinJson();
if (!payload.asset?.key || typeof payload.asset.value !== "string") {
  die(1, `payload.asset.{key,value} missing or invalid`);
}

const client = createClient({ store, token });

async function themeWriteAccessHint() {
  try {
    const res = await fetch(`https://${store}/admin/oauth/access_scopes.json`, {
      headers: {
        "X-Shopify-Access-Token": token,
        "Accept": "application/json"
      }
    });
    if (!res.ok) return "";
    const scopesRes = await res.json();
    const scopes = (scopesRes?.access_scopes || []).map((s) => s.handle);
    if (scopes.includes("write_themes")) {
      return " Token has write_themes, so this 404 likely means the app lacks Shopify's additional theme-file write exemption.";
    }
    return ` Token scopes do not include write_themes (scopes: ${scopes.join(", ")}).`;
  } catch {
    return "";
  }
}

// 1. Resolve theme id: ENV override, optional tenant config fallback, then live theme.
let themeId;
let themeIdSource;
try {
  ({ themeId, source: themeIdSource } = await resolveThemeId(client));
} catch (err) {
  const code = /must be numeric/.test(err.message || "") ? 1 : 2;
  die(code, `theme id resolve failed: ${err.message}`);
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
  const hint = /\b404\b/.test(err.message || "") ? await themeWriteAccessHint() : "";
  die(2, `asset PUT failed: ${err.message}${hint}`);
}

const summary = {
  theme_id: themeId,
  theme_id_source: themeIdSource,
  asset_key: result?.key || payload.asset.key,
  size_bytes: result?.size ?? payload.asset.value.length,
  public_url: result?.public_url ?? null,
  updated_at: result?.updated_at ?? null,
  backup_path: backupPath ? backupPath.replace(REPO_ROOT + "/", "") : null,
  action: existingAsset ? "update" : "create"
};
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
