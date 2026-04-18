#!/usr/bin/env bun
// Cortex-Web WordPress adapter — REST push step.
// Reads a payload JSON from stdin (output of build.mjs), creates or updates
// a WordPress Page via the REST API using Application-Password Basic-Auth.
//
// Idempotency: GET /wp/v2/pages?slug=<slug>
//   0 results -> POST /wp/v2/pages        (create)
//   1 result  -> PUT  /wp/v2/pages/:id    (update)
//  >1 results -> abort (ambiguous)
//
// Env:
//   WP_REST_BASE       (required) e.g. http://site.local/wp-json
//   WP_USER            (required)
//   WP_APP_PASSWORD    (required) spaces allowed as WP emits them
//   WP_PAGE_STATUS     (optional) default: value from payload.status or "publish"
//
// Exit codes:
//   0 success, final page-info JSON on stdout
//   1 config / input error
//   2 REST error (4xx/5xx or ambiguous slug)

import { createClient } from "./lib/rest-client.mjs";

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

const wpBody = {
  slug: payload.slug,
  title: payload.title,
  content: payload.content,
  status: effectiveStatus
};
if (payload.meta) wpBody.meta = payload.meta;

let existing;
try {
  existing = await client.get(`/wp/v2/pages?slug=${encodeURIComponent(payload.slug)}&status=any&per_page=10`);
} catch (err) {
  die(2, `lookup failed: ${err.message}`);
}

if (!Array.isArray(existing)) {
  die(2, `unexpected lookup response (not an array): ${JSON.stringify(existing).slice(0, 200)}`);
}

let result;
let action;
try {
  if (existing.length === 0) {
    action = "create";
    result = await client.post("/wp/v2/pages", wpBody);
  } else if (existing.length === 1) {
    action = "update";
    const pageId = existing[0].id;
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
  modified_gmt: result.modified_gmt
};
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
