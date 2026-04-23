#!/usr/bin/env bun
// Cortex-Web Shopify adapter — REST push step for PAGES.
// Reads a payload JSON from stdin (output of build-page.mjs), creates or updates
// a Shopify Page via the Admin REST API.
//
// Idempotency: GET /admin/api/<v>/pages.json?handle=<handle>
//   0 results -> POST /pages.json              (create)
//   1 result  -> PUT  /pages/<id>.json         (update)
//  >1 results -> abort (ambiguous handle)
//
// Safety: if the existing page is published (published_at != null),
// require ALLOW_OVERWRITE=1 to proceed.
//
// Env:
//   SHOPIFY_STORE         (required) <handle>.myshopify.com
//   SHOPIFY_ADMIN_TOKEN   (required) shpat_…
//   ALLOW_OVERWRITE       (optional) "1" to overwrite an already-published page
//   PUBLISH               (optional) "1" to flip published=true at write time
//                                    (Trunk stays draft-by-default per CW-001;
//                                    this is an adapter-runtime flag, not a
//                                    content-state in the trunk)
//
// Backup (CW-008): before any update, the existing Shopify page is saved as
//   adapters/shopify/.backups/<ISO-ts>_page<id>_<handle>.json. If the backup
//   write fails, the update aborts without touching Shopify.
//
// Exit codes:
//   0 success, summary JSON on stdout
//   1 config / input error
//   2 REST error (4xx/5xx, ambiguous handle, refused overwrite, or backup fail)
//
// content-bridge-v1, 2026-04-22. N-5+N-7 extension 2026-04-22 Session 24.

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
    die(1, `env ${name} missing — copy .env.local.template to .env.local and fill in`);
  }
  return v;
}

async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) die(1, "no payload on stdin — pipe output of build-page.mjs");
  try {
    return JSON.parse(text);
  } catch (err) {
    die(1, `invalid JSON on stdin: ${err.message}`);
  }
}

const store = env("SHOPIFY_STORE");
const token = env("SHOPIFY_ADMIN_TOKEN");
const allowOverwrite = process.env.ALLOW_OVERWRITE === "1";
const publishFlag = process.env.PUBLISH === "1";

const payload = await readStdinJson();

if (!payload.page) die(1, `payload missing field: page`);
if (!payload.page.handle) die(1, `payload.page.handle missing`);
if (payload.page.published !== false) {
  // C-1 for pages: draft-by-default unless explicitly flipped.
  die(1, `payload.page.published must be false (got ${JSON.stringify(payload.page.published)}) — CW-001 violation`);
}

const client = createClient({ store, token });

const handle = encodeURIComponent(payload.page.handle);

let lookup;
try {
  lookup = await client.get(`/pages.json?handle=${handle}&fields=id,handle,published_at,title,updated_at`);
} catch (err) {
  die(2, `lookup failed: ${err.message}`);
}

const pages = (lookup && Array.isArray(lookup.pages)) ? lookup.pages : null;
if (!pages) {
  die(2, `unexpected lookup response: ${JSON.stringify(lookup).slice(0, 200)}`);
}

// Effective write body — Trunk stays draft, adapter-layer may flip.
const effectivePage = { ...payload.page };
if (publishFlag) effectivePage.published = true;

let result;
let action;
let backupPath = null;
try {
  if (pages.length === 0) {
    action = "create";
    const created = await client.post(`/pages.json`, { page: effectivePage });
    result = created.page;
  } else if (pages.length === 1) {
    const existing = pages[0];
    const isPublished = existing.published_at !== null;
    if (isPublished && !allowOverwrite) {
      die(2, `target page handle="${payload.page.handle}" id=${existing.id} is published (published_at=${existing.published_at}) — set ALLOW_OVERWRITE=1 to proceed`);
    }
    action = "update";

    // CW-008 — backup full existing page before destructive write.
    let fullExisting;
    try {
      const fullRes = await client.get(`/pages/${existing.id}.json`);
      fullExisting = fullRes?.page || null;
    } catch (err) {
      die(2, `pre-update page fetch failed: ${err.message}`);
    }
    if (!fullExisting) die(2, `pre-update page fetch returned empty for id=${existing.id}`);

    try {
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const safeHandle = (fullExisting.handle || payload.page.handle).replace(/[^a-zA-Z0-9._-]+/g, "_");
      const dir = resolve(REPO_ROOT, "adapters/shopify/.backups");
      mkdirSync(dir, { recursive: true });
      const absBackup = resolve(dir, `${ts}_page${existing.id}_${safeHandle}.json`);
      writeFileSync(absBackup, JSON.stringify(fullExisting, null, 2));
      backupPath = absBackup.replace(REPO_ROOT + "/", "");
    } catch (err) {
      die(2, `backup write failed (CW-008 aborts update): ${err.message}`);
    }

    const updateBody = {
      page: {
        id: existing.id,
        ...effectivePage
      }
    };
    const updated = await client.put(`/pages/${existing.id}.json`, updateBody);
    result = updated.page;
  } else {
    die(2, `ambiguous handle "${payload.page.handle}" — ${pages.length} pages match, aborting`);
  }
} catch (err) {
  if (err && err.message) die(2, `${action || "lookup-decision"} failed: ${err.message}`);
  throw err;
}

const summary = {
  action,
  id: result.id,
  handle: result.handle,
  title: result.title,
  published_at: result.published_at,
  updated_at: result.updated_at,
  body_html_length: (result.body_html || "").length,
  publish_flag: publishFlag,
  backup_path: backupPath,
  admin_url: `https://${store.replace(/\.myshopify\.com$/, "")}.myshopify.com/admin/pages/${result.id}`
};
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
