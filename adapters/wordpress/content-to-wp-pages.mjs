#!/usr/bin/env bun
// Cortex-Web WordPress adapter — REST push step.
// Reads a payload JSON from stdin (output of build.mjs / build-service.mjs),
// creates or updates a WordPress Page via the REST API using Application-
// Password Basic-Auth.
//
// Idempotency: GET /wp/v2/pages?slug=<slug>
//   0 results -> POST /wp/v2/pages        (create)
//   1 result  -> PUT  /wp/v2/pages/:id    (update)
//  >1 results -> abort (ambiguous)
//
// Supported payload top-level fields: slug, title, content, status, meta,
//   parent (int, optional), template (string, optional, WP page-template filename).
// The meta key `_wp_page_template` is auto-converted to top-level `template`
// because WP-REST expects it there, not in meta. Any `_parent_slug_hint`
// field is stripped before the write (it is a build-time hint only).
//
// CW-008 (backup-before-destructive-push, S34 B-2a 2026-04-24): On UPDATE we
// GET the live page *before* the PUT and persist it to
//   adapters/wordpress/.backups/<ISO-utc>_<slug>_<id>.json
// The backup path is surfaced in the summary as `backup_path`.
//
// Env:
//   WP_REST_BASE       (required) e.g. http://site.local/wp-json
//   WP_USER            (required)
//   WP_APP_PASSWORD    (required) spaces allowed as WP emits them
//   WP_PAGE_STATUS     (optional) default: value from payload.status or "publish"
//   WP_BACKUP_DIR      (optional) override backup dir; default: adapters/wordpress/.backups
//
// Exit codes:
//   0 success, final page-info JSON on stdout
//   1 config / input error
//   2 REST error (4xx/5xx or ambiguous slug)

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "./lib/rest-client.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_BACKUP_DIR = resolve(SCRIPT_DIR, ".backups");

function die(code, msg) {
  process.stderr.write(`ADAPTER_ERROR: ${msg}\n`);
  process.exit(code);
}

function env(name, required = true) {
  const v = process.env[name];
  if (required && (!v || v.length === 0)) die(1, `env ${name} missing — copy .env.local.template to .env.local and fill in`);
  return v;
}

async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8").trim();
  if (!text) die(1, "no payload on stdin — pipe output of build.mjs");
  try {
    return JSON.parse(text);
  } catch (err) {
    die(1, `invalid JSON on stdin: ${err.message}`);
  }
}

const baseUrl = env("WP_REST_BASE");
const user = env("WP_USER");
const password = env("WP_APP_PASSWORD");
const statusOverride = process.env.WP_PAGE_STATUS;

const payload = await readStdinJson();

for (const field of ["slug", "title", "content"]) {
  if (!payload[field]) die(1, `payload missing field: ${field}`);
}

const client = createClient({ baseUrl, user, password });

const effectiveStatus = statusOverride || payload.status || "publish";

// Strip build-time hints. Mutate a shallow copy so the input is not touched.
const effectiveMeta = payload.meta ? { ...payload.meta } : null;
let templateField = payload.template;
if (effectiveMeta && effectiveMeta._wp_page_template) {
  templateField = templateField || effectiveMeta._wp_page_template;
  delete effectiveMeta._wp_page_template;
}

const wpBody = {
  slug: payload.slug,
  title: payload.title,
  content: payload.content,
  status: effectiveStatus
};
if (effectiveMeta && Object.keys(effectiveMeta).length > 0) wpBody.meta = effectiveMeta;
if (payload.parent !== undefined && payload.parent !== null) wpBody.parent = Number(payload.parent);
if (templateField) wpBody.template = templateField;

let existing;
try {
  existing = await client.get(`/wp/v2/pages?slug=${encodeURIComponent(payload.slug)}&status=any&per_page=10`);
} catch (err) {
  die(2, `lookup failed: ${err.message}`);
}

if (!Array.isArray(existing)) {
  die(2, `unexpected lookup response (not an array): ${JSON.stringify(existing).slice(0, 200)}`);
}

function isoStampUtc() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function persistBackup(pageObj) {
  const dir = process.env.WP_BACKUP_DIR || DEFAULT_BACKUP_DIR;
  try { mkdirSync(dir, { recursive: true }); } catch (err) {
    throw new Error(`cannot create backup dir ${dir}: ${err.message}`);
  }
  const fname = `${isoStampUtc()}_${pageObj.slug}_${pageObj.id}.json`;
  const fpath = resolve(dir, fname);
  writeFileSync(fpath, JSON.stringify(pageObj, null, 2) + "\n");
  return fpath;
}

let result;
let action;
let backupPath = null;
try {
  if (existing.length === 0) {
    action = "create";
    result = await client.post("/wp/v2/pages", wpBody);
  } else if (existing.length === 1) {
    action = "update";
    const pageId = existing[0].id;
    // CW-008: backup the live page *before* we overwrite it. We fetch the
    // full page (context=edit) so that raw content + meta are captured.
    let pre;
    try {
      pre = await client.get(`/wp/v2/pages/${pageId}?context=edit`);
    } catch (err) {
      die(2, `pre-update GET failed (CW-008): ${err.message}`);
    }
    try {
      backupPath = persistBackup(pre);
    } catch (err) {
      die(2, `CW-008 backup failed (refusing destructive push): ${err.message}`);
    }
    result = await client.put(`/wp/v2/pages/${pageId}`, wpBody);
  } else {
    die(2, `ambiguous slug "${payload.slug}" — ${existing.length} pages match, aborting`);
  }
} catch (err) {
  die(2, `${action} failed: ${err.message}`);
}

const summary = {
  action,
  id: result.id,
  slug: result.slug,
  status: result.status,
  link: result.link,
  parent: result.parent ?? 0,
  template: result.template ?? "",
  modified_gmt: result.modified_gmt,
  backup_path: backupPath
};
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
