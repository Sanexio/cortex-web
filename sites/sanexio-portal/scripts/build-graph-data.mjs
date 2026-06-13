#!/usr/bin/env node
/**
 * build-graph-data.mjs — Second-Brain-Visual-Graph für Sanexio-Portal.
 *
 * Crawls all *.md under ~/Cortex/Nexus/Second Brain/, extracts [[Wiki-Links]],
 * builds a force-directed graph (nodes = files, edges = links). Top-level
 * folders are cluster groups with deterministic colors.
 *
 * Output: public/graph.json — consumed by SecondBrainGraph.tsx via fetch.
 *
 * Read-only: never writes to the Nexus vault.
 *
 * Usage:
 *   node scripts/build-graph-data.mjs            (verbose)
 *   node scripts/build-graph-data.mjs --quiet    (silence non-error output)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

const VAULT = path.join(os.homedir(), "Cortex", "Nexus", "Second Brain");
const OUT = path.join(process.cwd(), "public", "graph.json");
const QUIET = process.argv.includes("--quiet");

const CLUSTER_COLORS = [
  "#00f0ff", // cyan
  "#ff00aa", // magenta
  "#ffea00", // yellow
  "#5dff9c", // green
  "#ff7a00", // orange
  "#9d6dff", // purple
  "#ff5570", // pink-red
  "#4cc9f0", // light cyan
  "#f9c74f", // amber
  "#90be6d", // sage
  "#577590", // slate
];

const FALLBACK_COLOR = "#5e6166";
const MAX_NODES = 320;
const MAX_LABEL_LEN = 36;

async function walk(dir, acc = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.startsWith(".")) continue;
      await walk(full, acc);
    } else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) {
      acc.push(full);
    }
  }
  return acc;
}

function clusterOf(rel) {
  const parts = rel.split(path.sep);
  if (parts.length === 1) return "ROOT";
  return parts[0];
}

function noteIdOf(rel) {
  const base = rel.replace(/\.md$/i, "");
  return base.replace(/\\/g, "/");
}

function labelOf(rel) {
  const base = path.basename(rel, ".md");
  if (base.length <= MAX_LABEL_LEN) return base;
  return base.slice(0, MAX_LABEL_LEN - 1) + "…";
}

function extractLinks(text) {
  const out = new Set();
  const re = /\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const target = m[1].trim();
    if (target) out.add(target);
  }
  return [...out];
}

function resolveLink(target, byBasename, byNoteId) {
  if (byNoteId.has(target)) return target;
  const norm = target.toLowerCase();
  const baseHit = byBasename.get(norm);
  if (baseHit && baseHit.length === 1) return baseHit[0];
  return null;
}

async function main() {
  const files = await walk(VAULT);
  if (!QUIET) console.log(`[graph] scanned ${files.length} markdown files under ${VAULT}`);

  const notes = [];
  const byBasename = new Map();
  const byNoteId = new Map();

  for (const f of files) {
    const rel = path.relative(VAULT, f);
    const noteId = noteIdOf(rel);
    const base = path.basename(rel, ".md").toLowerCase();
    notes.push({ rel, noteId, file: f });
    byNoteId.set(noteId, true);
    const arr = byBasename.get(base) ?? [];
    arr.push(noteId);
    byBasename.set(base, arr);
  }

  const rawEdges = [];
  for (const n of notes) {
    let text = "";
    try {
      text = await fs.readFile(n.file, "utf-8");
    } catch {
      continue;
    }
    const links = extractLinks(text);
    for (const l of links) {
      const resolved = resolveLink(l, byBasename, byNoteId);
      if (resolved && resolved !== n.noteId) {
        rawEdges.push({ source: n.noteId, target: resolved });
      }
    }
  }

  const degree = new Map();
  for (const e of rawEdges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }

  // Trim to top MAX_NODES by degree, ensure connected-ish core.
  const ranked = notes
    .map((n) => ({ ...n, degree: degree.get(n.noteId) ?? 0 }))
    .sort((a, b) => b.degree - a.degree);

  const keptSet = new Set();
  for (const n of ranked.slice(0, MAX_NODES)) keptSet.add(n.noteId);

  // Assign cluster colors based on top-level folder seen first.
  const clusterCounts = new Map();
  for (const n of ranked) {
    if (!keptSet.has(n.noteId)) continue;
    const c = clusterOf(n.rel);
    clusterCounts.set(c, (clusterCounts.get(c) ?? 0) + 1);
  }
  const clustersSorted = [...clusterCounts.entries()].sort(
    (a, b) => b[1] - a[1]
  );
  const clusterColor = new Map();
  clustersSorted.forEach(([id], i) => {
    clusterColor.set(id, CLUSTER_COLORS[i] ?? FALLBACK_COLOR);
  });

  const outNodes = ranked
    .filter((n) => keptSet.has(n.noteId))
    .map((n) => ({
      id: n.noteId,
      label: labelOf(n.rel),
      cluster: clusterOf(n.rel),
      degree: n.degree,
    }));

  const outEdges = [];
  const seen = new Set();
  for (const e of rawEdges) {
    if (!keptSet.has(e.source) || !keptSet.has(e.target)) continue;
    const k = e.source + "→" + e.target;
    if (seen.has(k)) continue;
    seen.add(k);
    outEdges.push(e);
  }

  const payload = {
    generated_at: new Date().toISOString(),
    stats: {
      nodes: outNodes.length,
      edges: outEdges.length,
      files_scanned: files.length,
    },
    clusters: clustersSorted.map(([id]) => ({
      id,
      color: clusterColor.get(id) ?? FALLBACK_COLOR,
    })),
    nodes: outNodes,
    edges: outEdges,
  };

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(payload, null, 2));
  if (!QUIET) {
    console.log(
      `[graph] wrote ${OUT}: ${outNodes.length} nodes, ${outEdges.length} edges, ${clustersSorted.length} clusters`
    );
  }
}

main().catch((err) => {
  console.error("[graph] FAILED:", err);
  process.exit(1);
});
