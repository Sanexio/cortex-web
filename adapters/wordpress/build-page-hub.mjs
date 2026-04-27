#!/usr/bin/env bun
// build-page-hub.mjs — Render Trunk page YAMLs to PHP arrays for the
// praxiszentrum theme (template-{diagnostik-hub,labor,leistungen}.php).
//
// S49 — Pattern B (Trunk → Theme PHP Data) variant for hub pages.
//
// Input:  trunk/content/pages/_shared/{diagnostik,labor,leistungen}.yaml
// Output: <theme>/inc/data/page-hub-<slug>.php  (return [...] PHP array)
//
// Usage:  bun adapters/wordpress/build-page-hub.mjs
//
// HWG-Strip: views.praxis.show_prices=false → Adapter zieht KEINE Preis-/
// Money-Felder aus YAML in Praxis-Output. (Trunk-YAMLs enthalten keine Preise
// — diese Regel hier ist primär ein Sicherheits-Guard für später.)

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const ROOT = path.resolve(import.meta.dir, "..", "..");
const SRC_DIR = path.join(ROOT, "trunk", "content", "pages", "_shared");
const THEME = "/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum";
const DEST_DIR = path.join(THEME, "inc", "data");

// Auto-discover all page-YAMLs in trunk/content/pages/_shared/.
// Excludes ueber-uns (uses different render path via content-bridge-v1).
const SKIP = new Set(["ueber-uns"]);
const PAGES = fs
  .readdirSync(SRC_DIR)
  .filter((f) => f.endsWith(".yaml"))
  .map((f) => f.replace(/\.yaml$/, ""))
  .filter((s) => !SKIP.has(s));
const UPLOAD_BASE = "/wp-content/uploads/2026/04/sanexio-imports";

fs.mkdirSync(DEST_DIR, { recursive: true });

// Resolve image refs (shopify-mirror://scope/file.ext → /wp-content/.../file.ext)
function resolveImage(ref) {
  if (!ref) return null;
  const m = ref.match(/^shopify-mirror:\/\/[^/]+\/(.+)$/);
  if (m) return `${UPLOAD_BASE}/${m[1]}`;
  return ref; // fallback: use as-is
}

// Pick the localized field — defaults to DE (HWG-relevant for Praxis).
function pickLang(field, lang = "de") {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[lang] || field.de || "";
}

// Render PHP value (string, array, scalar) — minimal var_export-like output.
function phpExport(v, indent = 0) {
  const pad = "  ".repeat(indent);
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") {
    // PHP single-quoted string escaping
    return "'" + v.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return "[]";
    const items = v.map((x) => `${pad}  ${phpExport(x, indent + 1)}`);
    return `[\n${items.join(",\n")},\n${pad}]`;
  }
  if (typeof v === "object") {
    const keys = Object.keys(v);
    if (keys.length === 0) return "[]";
    const items = keys.map(
      (k) => `${pad}  ${phpExport(k)} => ${phpExport(v[k], indent + 1)}`
    );
    return `[\n${items.join(",\n")},\n${pad}]`;
  }
  return "null";
}

// Normalize a section into a flat structure suitable for PHP rendering.
function normalizeSection(sec) {
  const t = sec.type;
  if (t === "hero") {
    return {
      type: "hero",
      eyebrow: pickLang(sec.eyebrow),
      heading: pickLang(sec.heading),
      lead: pickLang(sec.lead),
    };
  }
  if (t === "usp-box") {
    return {
      type: "usp-box",
      variant: sec.variant || "dark",
      heading: pickLang(sec.heading),
      text: pickLang(sec.text),
    };
  }
  if (t === "bento-grid") {
    return {
      type: "bento-grid",
      heading: pickLang(sec.heading),
      items: (sec.items || []).map((it) => ({
        id: it.id,
        title: pickLang(it.title),
        teaser: pickLang(it.teaser),
        image: resolveImage(it.image),
        href: it.href,
        external: !!it.external,
      })),
    };
  }
  if (t === "process-steps") {
    return {
      type: "process-steps",
      heading: pickLang(sec.heading),
      steps: (sec.steps || []).map((s) => ({
        num: s.num,
        title: pickLang(s.title),
        text: pickLang(s.text),
      })),
    };
  }
  if (t === "cta-banner") {
    return {
      type: "cta-banner",
      heading: pickLang(sec.heading),
      sub: pickLang(sec.sub),
      cta_label: pickLang(sec.cta_label),
      cta_url: sec.cta_url,
    };
  }
  if (t === "body") {
    return {
      type: "body",
      heading: pickLang(sec.heading),
      body_md: pickLang(sec.body_md),
    };
  }
  // Pass-through for legacy types — won't be rendered by hub-renderer.
  return { type: t, _raw: sec };
}

let count = 0;
for (const slug of PAGES) {
  const src = path.join(SRC_DIR, `${slug}.yaml`);
  if (!fs.existsSync(src)) {
    console.error(`  ✗ missing: ${src}`);
    process.exit(1);
  }
  const data = yaml.load(fs.readFileSync(src, "utf8"));

  // HWG-Guard: Praxis-View darf show_prices=true nicht erlauben
  if (data?.views?.praxis?.show_prices === true) {
    console.error(`  ✗ HWG-Verstoß: ${slug}.yaml hat views.praxis.show_prices=true`);
    process.exit(2);
  }

  const out = {
    id: data.id,
    slug: data.slugs?.praxis || slug,
    title: pickLang(data.title),
    page_template: data.wp?.page_template || `template-${slug}.php`,
    eyebrow: pickLang(data.wp?.eyebrow),
    cta_url: data.views?.praxis?.cta_url || "/service/terminanfrage/",
    cta_label: pickLang(data.views?.praxis?.cta_label) || "Termin vereinbaren",
    sections: (data.sections || []).map(normalizeSection),
  };

  const dest = path.join(DEST_DIR, `page-hub-${slug}.php`);
  const phpHeader = `<?php
/**
 * Auto-generated page-hub data for: ${slug}
 * Source:    trunk/content/pages/_shared/${slug}.yaml
 * Generated: ${new Date().toISOString()}
 * Builder:   Cortex-Web/adapters/wordpress/build-page-hub.mjs (S49)
 *
 * DO NOT EDIT BY HAND. Edit the source YAML and re-run the builder:
 *   cd ~/Cortex/projects/Cortex-Web && bun adapters/wordpress/build-page-hub.mjs
 */

if ( ! defined( 'ABSPATH' ) ) exit;

return ${phpExport(out, 0)};
`;
  fs.writeFileSync(dest, phpHeader);
  count++;
  console.log(`  ✓ ${slug} → ${path.relative(THEME, dest)}`);
}

console.log(`\n==> Built ${count} page-hub PHP data file(s)`);
