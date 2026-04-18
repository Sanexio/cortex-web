#!/usr/bin/env bun
// Cortex-Web Shopify adapter — REST push step.
// Reads a payload JSON from stdin (output of build.mjs), creates or updates
// a Shopify product via the Admin REST API using an Admin-API access token.
//
// Idempotency: GET /admin/api/<v>/products.json?handle=<handle>
//   0 results -> POST /products.json                (create)
//   1 result  -> PUT  /products/:id.json            (update, id in body)
//  >1 results -> abort (ambiguous handle)
//
// Safety: if the existing product has status=active or published_at != null,
// require ALLOW_OVERWRITE=1 to proceed. Otherwise abort with a hint.
//
// Env:
//   SHOPIFY_STORE         (required) <handle>.myshopify.com
//   SHOPIFY_ADMIN_TOKEN   (required) shpat_…
//   ALLOW_OVERWRITE       (optional) "1" to overwrite a published product
//
// Exit codes:
//   0 success, summary JSON on stdout
//   1 config / input error
//   2 REST error (4xx/5xx, ambiguous handle, or refused overwrite)

import { createClient } from "./lib/shopify-rest-client.mjs";

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
  if (!text) die(1, "no payload on stdin — pipe output of build.mjs");
  try {
    return JSON.parse(text);
  } catch (err) {
    die(1, `invalid JSON on stdin: ${err.message}`);
  }
}

const store = env("SHOPIFY_STORE");
const token = env("SHOPIFY_ADMIN_TOKEN");
const allowOverwrite = process.env.ALLOW_OVERWRITE === "1";

const payload = await readStdinJson();

if (!payload.product) die(1, `payload missing field: product`);
if (!payload.product.handle) die(1, `payload.product.handle missing — renderer must set it explicitly`);
if (payload.product.status !== "draft") {
  die(1, `payload.product.status must be "draft" (got "${payload.product.status}") — C-1 violation`);
}

const client = createClient({ store, token });

const handle = encodeURIComponent(payload.product.handle);

let lookup;
try {
  lookup = await client.get(`/products.json?handle=${handle}&fields=id,handle,status,published_at,updated_at`);
} catch (err) {
  die(2, `lookup failed: ${err.message}`);
}

const products = (lookup && Array.isArray(lookup.products)) ? lookup.products : null;
if (!products) {
  die(2, `unexpected lookup response: ${JSON.stringify(lookup).slice(0, 200)}`);
}

let result;
let action;
try {
  if (products.length === 0) {
    action = "create";
    const created = await client.post(`/products.json`, { product: payload.product });
    result = created.product;
  } else if (products.length === 1) {
    const existing = products[0];
    const isPublished = existing.status === "active" || existing.published_at !== null;
    if (isPublished && !allowOverwrite) {
      die(2, `target product handle="${payload.product.handle}" id=${existing.id} is published (status=${existing.status}, published_at=${existing.published_at}) — set ALLOW_OVERWRITE=1 to proceed`);
    }
    action = "update";
    const updateBody = {
      product: {
        id: existing.id,
        ...payload.product
      }
    };
    const updated = await client.put(`/products/${existing.id}.json`, updateBody);
    result = updated.product;
  } else {
    die(2, `ambiguous handle "${payload.product.handle}" — ${products.length} products match, aborting`);
  }
} catch (err) {
  // err may already be from die(); but keep guard for unexpected throws
  if (err && err.message) die(2, `${action || "lookup-decision"} failed: ${err.message}`);
  throw err;
}

const summary = {
  action,
  id: result.id,
  handle: result.handle,
  status: result.status,
  published_at: result.published_at,
  updated_at: result.updated_at,
  admin_url: `https://${store.replace(/\.myshopify\.com$/, "")}.myshopify.com/admin/products/${result.id}`
};
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
