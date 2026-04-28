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

// Minimal Markdown → HTML converter for body_md fallback.
// Supports: ## heading, ### heading, **bold**, *italic*, [text](url),
// blank-line paragraphs, single line breaks, - ul lists, 1. ol lists.
function markdownToHtml(md) {
  if (!md) return "";
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let html = [];
  let listType = null;          // 'ul' | 'ol' | null
  let paraBuf = [];
  const flushPara = () => {
    if (paraBuf.length === 0) return;
    let s = paraBuf.join(" ").trim();
    if (s) html.push("<p>" + s + "</p>");
    paraBuf = [];
  };
  const flushList = () => {
    if (listType) { html.push(`</${listType}>`); listType = null; }
  };
  const inline = (s) =>
    s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
     .replace(/\*([^*\s][^*]*)\*/g, "<em>$1</em>")
     .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") { flushPara(); flushList(); continue; }
    let m;
    if ((m = line.match(/^###\s+(.+)$/))) {
      flushPara(); flushList();
      html.push("<h3>" + inline(m[1]) + "</h3>");
    } else if ((m = line.match(/^##\s+(.+)$/))) {
      flushPara(); flushList();
      html.push("<h2>" + inline(m[1]) + "</h2>");
    } else if ((m = line.match(/^[-*]\s+(.+)$/))) {
      flushPara();
      if (listType !== "ul") { flushList(); html.push("<ul>"); listType = "ul"; }
      html.push("<li>" + inline(m[1]) + "</li>");
    } else if ((m = line.match(/^\d+\.\s+(.+)$/))) {
      flushPara();
      if (listType !== "ol") { flushList(); html.push("<ol>"); listType = "ol"; }
      html.push("<li>" + inline(m[1]) + "</li>");
    } else {
      flushList();
      paraBuf.push(inline(line));
    }
  }
  flushPara(); flushList();
  return html.join("\n");
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
      image: resolveImage(sec.image),
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
    // Prefer body_html (e.g. mirrored Sanexio rich-text);
    // fall back to converting body_md → HTML.
    const html = pickLang(sec.body_html);
    const md = pickLang(sec.body_md);
    const body_html = html ? html : markdownToHtml(md);
    return {
      type: "body",
      heading: pickLang(sec.heading),
      body_html,
    };
  }
  // Pass-through for legacy types — won't be rendered by hub-renderer.
  return { type: t, _raw: sec };
}

// Pre-Pass: load all page YAMLs once, compute related-overview cards
// for the detail-page set (template-detail-page.php).
const ALL = {};
for (const slug of PAGES) {
  const src = path.join(SRC_DIR, `${slug}.yaml`);
  if (!fs.existsSync(src)) continue;
  ALL[slug] = yaml.load(fs.readFileSync(src, "utf8"));
}
function heroImageOf(d) {
  const hero = (d?.sections || []).find((s) => s.type === "hero");
  return hero?.image ? resolveImage(hero.image) : null;
}
const DETAIL_TPL = "template-detail-page.php";
const overviewCards = [];
for (const [slug, data] of Object.entries(ALL)) {
  if (data?.wp?.page_template !== DETAIL_TPL) continue;
  const id = data.id || slug;
  // Category split (S50 v2): labor-* → 'lab', everything else → 'examination'
  const category = id.startsWith("labor-") ? "lab" : "examination";
  overviewCards.push({
    id,
    category,
    slug: "/" + (data.slugs?.praxis || slug) + "/",
    title: pickLang(data.title),
    image: heroImageOf(data),
  });
}

let count = 0;
for (const slug of PAGES) {
  const data = ALL[slug];
  if (!data) {
    console.error(`  ✗ missing: ${slug}`);
    process.exit(1);
  }

  // HWG-Guard: Praxis-View darf show_prices=true nicht erlauben
  if (data?.views?.praxis?.show_prices === true) {
    console.error(`  ✗ HWG-Verstoß: ${slug}.yaml hat views.praxis.show_prices=true`);
    process.exit(2);
  }

  // Doctolib-Resolver: per-page Doctolib URL overrides cta_url, falls leer
  // Default-Fallback. Phase-3-Setup.
  const ctaUrl =
    data.views?.praxis?.doctolib_url ||
    data.views?.praxis?.cta_url ||
    "/service/terminanfrage/";

  // Related-Overview: alle Detail-Pages außer der aktuellen
  const isDetail = data?.wp?.page_template === DETAIL_TPL;
  const related = isDetail
    ? overviewCards.filter((c) => c.id !== (data.id || slug))
    : [];

  const out = {
    id: data.id,
    slug: data.slugs?.praxis || slug,
    title: pickLang(data.title),
    page_template: data.wp?.page_template || `template-${slug}.php`,
    eyebrow: pickLang(data.wp?.eyebrow),
    cta_url: ctaUrl,
    cta_label: pickLang(data.views?.praxis?.cta_label) || "Termin vereinbaren",
    sections: (data.sections || []).map(normalizeSection),
    related_overview: related,
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
