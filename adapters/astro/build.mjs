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
//   bun adapters/astro/build.mjs [--dry-run] [--out <path>]

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const REPO_ROOT = resolve(import.meta.dir, "../..");

function usage() {
  process.stdout.write(`Usage: bun adapters/astro/build.mjs [--dry-run] [--out <path>]

Options:
  --help       Show this help and exit.
  --dry-run    Validate/render adapter output without writing files.
  --out <path> Write the generated team data file to this path.
`);
}

const forwardArgs = [];
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (arg === "--dry-run") {
    forwardArgs.push(arg);
  } else if (arg === "--out") {
    const value = args[++i];
    if (!value) {
      process.stderr.write("ASTRO_ADAPTER_ERROR: --out requires a path\n");
      process.exit(1);
    }
    forwardArgs.push("--out", value);
  } else if (arg.startsWith("--out=")) {
    forwardArgs.push(arg);
  } else {
    process.stderr.write(`ASTRO_ADAPTER_ERROR: unexpected argument: ${arg}\n`);
    process.exit(1);
  }
}

const STEPS = [
  { name: "team", script: "adapters/astro/team-to-astro.mjs" },
  // Phase 3+: append pages/legal/products sync scripts here.
];

let allOk = true;
const summary = [];

for (const step of STEPS) {
  process.stdout.write(`\n→ ${step.name} (${step.script})\n`);
  const result = spawnSync("bun", [step.script, ...forwardArgs], {
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
