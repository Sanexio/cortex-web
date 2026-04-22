#!/usr/bin/env bun
// Cortex-Web WordPress adapter — EXTRACT step for PAGES (site -> trunk).
// GET /wp/v2/pages?slug=<slug> (or /pages/<id>) and emit proto-trunk JSON.
//
// Usage:
//   bun adapters/wordpress/extract-page.mjs <slug-or-id>
//   e.g. bun adapters/wordpress/extract-page.mjs team
//        bun adapters/wordpress/extract-page.mjs 9670
//
// Env:
//   WP_REST_BASE, WP_USER, WP_APP_PASSWORD
//
// cross-site-transfer Phase C2, 2026-04-22.

import { createClient } from "./lib/rest-client.mjs";

function die(code, msg) {
  process.stderr.write(`EXTRACT_ERROR: ${msg}\n`);
  process.exit(code);
}

function env(name) {
  const v = process.env[name];
  if (!v) die(1, `env ${name} missing`);
  return v;
}

const ident = process.argv[2];
if (!ident) die(1, "usage: bun extract-page.mjs <slug-or-id>");

const baseUrl = env("WP_REST_BASE");
const user = env("WP_USER");
const password = env("WP_APP_PASSWORD");

const client = createClient({ baseUrl, user, password });

const isNumeric = /^\d+$/.test(ident);

let page;
try {
  if (isNumeric) {
    page = await client.get(`/wp/v2/pages/${ident}?context=edit`);
  } else {
    const list = await client.get(`/wp/v2/pages?slug=${encodeURIComponent(ident)}&context=edit&status=any`);
    if (!Array.isArray(list) || list.length === 0) die(2, `no page found with slug="${ident}"`);
    if (list.length > 1) die(2, `ambiguous slug "${ident}" — ${list.length} matches`);
    page = list[0];
  }
} catch (err) {
  die(2, `lookup failed: ${err.message}`);
}

const proto = {
  _extracted_at: new Date().toISOString(),
  _source: `wordpress.page@${baseUrl}`,
  _wp_id: page.id,
  _wp_slug: page.slug,

  id_hint: page.slug,
  slugs: { praxis: page.slug },
  title: { de: page.title?.rendered || page.title },
  status_praxis_hint: page.status,

  body_html_raw: page.content?.rendered || page.content?.raw || "",
  body_html_length: (page.content?.rendered || page.content?.raw || "").length,

  meta: page.meta || {},
  template: page.template || null,

  admin_metadata: {
    link: page.link,
    date_gmt: page.date_gmt,
    modified_gmt: page.modified_gmt,
    author: page.author,
    parent: page.parent
  },

  _curation_hints: {
    template_hint: page.template
      ? `Uses custom template '${page.template}'. Theme-logic may render far beyond body_html. Consider reading the PHP template file directly.`
      : "Uses default page template — body_html is likely the main content.",
    next_step: "Transform body_html into trunk sections[]. If the page relies on theme helpers (e.g. pxz_render_*), those produce runtime HTML that is NOT in body_html.",
    target_yaml: `trunk/content/pages/_shared/${page.slug}.yaml (or /praxis/ or /juvantis/)`
  }
};

process.stdout.write(JSON.stringify(proto, null, 2) + "\n");
