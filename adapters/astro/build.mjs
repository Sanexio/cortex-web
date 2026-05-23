#!/usr/bin/env bun
// Cortex-Web Astro-Adapter — Master-Orchestrator.
//
// Phase 1+2 (2026-05-23): ruft die einzelnen Trunk→Astro-Sync-Schritte
// in deterministischer Reihenfolge auf. Wenn ein Schritt fehlschlägt,
// bricht der gesamte Build ab — keine Teil-Outputs.
//
// Aktuell ausgeführt:
//   1. team-to-astro.mjs  → src/data/team.ts
//
// Geplant (Phase 3+):
//   2. pages-to-astro.mjs   → src/pages/<slug>.astro (sanexio + shared)
//   3. legal-to-astro.mjs   → src/pages/impressum,datenschutz.astro
//   4. products-to-astro.mjs → src/data/products.ts (DHT-Timeline-Daten)
//
// Verwendung:
//   bun adapters/astro/build.mjs

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "../..");

const STEPS = [
  { name: "team", script: "adapters/astro/team-to-astro.mjs" },
  // Phase 3+: append pages/legal/products sync scripts here.
];

let allOk = true;
const summary = [];

for (const step of STEPS) {
  process.stdout.write(`\n→ ${step.name} (${step.script})\n`);
  const result = spawnSync("bun", [step.script], {
    cwd: REPO_ROOT,
    stdio: ["ignore", "pipe", "inherit"],
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(`✗ ${step.name} failed (exit ${result.status})\n`);
    allOk = false;
    summary.push({ step: step.name, ok: false, exit: result.status });
    break;
  }
  let body = null;
  try { body = JSON.parse(result.stdout); } catch { body = { raw: result.stdout.trim() }; }
  summary.push({ step: step.name, ok: true, ...body });
}

process.stdout.write("\n=== Astro-Adapter Build Summary ===\n");
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
process.exit(allOk ? 0 : 1);
