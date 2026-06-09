#!/usr/bin/env bun
// drift-sync / detect.mjs
// Drift-Detector — Read-Only, vergleicht Sanexio-Live-State mit Trunk.
//
// Usage:
//   bun tools/drift-sync/detect.mjs [--scope=<name>] [--json]
//
// Exit:
//   0 — Bericht erstellt (auch wenn Drift gefunden)
//   1 — Konfigurations-/API-Fehler
//
// Spec: specs/drift-sync/SPEC.md §5 (Detection-Pipeline)

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "../../adapters/shopify/lib/shopify-rest-client.mjs";
import { tenantPath, tenantIsExamples, tenantDescribe } from "../lib/tenant-path.mjs";
import { listProductsInCollection } from "./lib/shopify-collection.mjs";
import { getPagesByHandles } from "./lib/shopify-page.mjs";
import { walkTrunkDir, findByResourceId } from "./lib/trunk-walker.mjs";
import {
  canonicalizeProduct,
  canonicalizePage,
  computeHash,
  compareDrift
} from "./lib/provenance.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TENANT_ROOT = tenantIsExamples() ? REPO_ROOT : tenantPath();
const TRUNK_ROOT = tenantIsExamples() ? resolve(REPO_ROOT, "trunk") : tenantPath("trunk");

function die(code, msg) {
  process.stderr.write(`drift-detect: ${msg}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const args = { scope: null, json: false };
  for (const a of argv.slice(2)) {
    if (a === "--json") args.json = true;
    else if (a.startsWith("--scope=")) args.scope = a.slice("--scope=".length);
    else if (a === "--help" || a === "-h") {
      process.stdout.write("Usage: drift-detect [--scope=<name>] [--json]\n");
      process.exit(0);
    } else die(1, `unknown arg: ${a}`);
  }
  return args;
}

async function loadConfig() {
  const configPath = process.env.DRIFT_SYNC_CONFIG
    ? resolve(process.env.DRIFT_SYNC_CONFIG)
    : join(REPO_ROOT, "tools", "drift-sync", "config.json");
  try {
    const content = await readFile(configPath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    die(1, `config laden fehlgeschlagen (${configPath}): ${err.message}`);
  }
}

function trunkPath(relPath) {
  if (relPath.startsWith("trunk/")) {
    return resolve(TRUNK_ROOT, relPath.slice("trunk/".length));
  }
  return resolve(TENANT_ROOT, relPath);
}

function displayPath(absPath) {
  const normalized = absPath.replace(/\\/g, "/");
  for (const root of [TENANT_ROOT, REPO_ROOT]) {
    const prefix = root.replace(/\\/g, "/") + "/";
    if (normalized.startsWith(prefix)) return normalized.slice(prefix.length);
  }
  return absPath;
}

function getEnv(name) {
  const v = process.env[name];
  if (!v) die(1, `env ${name} fehlt — siehe .env.local`);
  return v;
}

async function detectScope({ client, scopeName, scopeConfig, repoRoot }) {
  const trunkDir = trunkPath(scopeConfig.praxis_target.trunk_dir);
  const walkedTrunk = await walkTrunkDir(trunkDir);

  // Sanexio-Sources abrufen
  let sources = [];
  let sourceType;

  if (scopeConfig.type === "collection") {
    sourceType = "product";
    try {
      sources = await listProductsInCollection(client, scopeConfig.collection_handle);
    } catch (err) {
      return { scope: scopeName, error: err.message, drifts: [] };
    }
  } else if (scopeConfig.type === "pages") {
    sourceType = "page";
    try {
      sources = await getPagesByHandles(client, scopeConfig.page_handles);
    } catch (err) {
      return { scope: scopeName, error: err.message, drifts: [] };
    }
  } else {
    return { scope: scopeName, error: `unknown scope type: ${scopeConfig.type}`, drifts: [] };
  }

  // Index Sanexio-Sources nach resource_id für REMOVED-Detection
  const sourceById = new Map();
  for (const src of sources) {
    sourceById.set(src.id, src);
  }

  // Index Trunk nach scope
  const trunkInScope = walkedTrunk.filter(
    (f) => f.upstream_source?.scope === scopeName
  );

  const drifts = [];

  // 1. Pro Sanexio-Source: NEW oder UPDATED oder CLEAN ermitteln
  for (const src of sources) {
    const trunkMatch = findByResourceId(trunkInScope, src.id);
    const result = compareDrift({
      trunkYaml: trunkMatch?.parsed,
      currentSource: src,
      sourceType
    });

    drifts.push({
      status: result.status,
      source_type: sourceType,
      resource_id: src.id,
      handle: src.handle,
      title: src.title,
      trunk_path: trunkMatch?.filePath ? displayPath(trunkMatch.filePath) : null,
      current_hash: result.current_hash,
      last_synced_hash: result.last_synced_hash,
      drift_strategy: result.drift_strategy,
      local_edits: result.local_edits === true
    });
  }

  // 2. Pro Trunk-YAML mit upstream_source: REMOVED ermitteln
  for (const t of trunkInScope) {
    const provId = t.upstream_source.resource_id;
    if (!sourceById.has(provId)) {
      drifts.push({
        status: "REMOVED",
        source_type: t.upstream_source.type,
        resource_id: provId,
        handle: t.upstream_source.handle,
        title: null,
        trunk_path: displayPath(t.filePath),
        last_synced_hash: t.upstream_source.last_synced_hash,
        drift_strategy: t.upstream_source.drift_strategy
      });
    }
  }

  return {
    scope: scopeName,
    type: scopeConfig.type,
    source_count: sources.length,
    trunk_in_scope_count: trunkInScope.length,
    drifts
  };
}

function summarize(scopeReports) {
  const counts = {
    NEW: 0, UPDATED: 0, CLEAN: 0, LOCAL_DRIFT: 0, REMOVED: 0, FROZEN: 0, LOCAL_ONLY: 0
  };
  let total = 0;
  for (const r of scopeReports) {
    for (const d of r.drifts || []) {
      if (counts[d.status] !== undefined) counts[d.status]++;
      total++;
    }
  }
  return { total, counts };
}

function renderHumanReport(scopeReports) {
  const lines = [];
  lines.push("");
  lines.push("=== Drift-Sync Status (Sanexio → Praxis) ===");
  lines.push("");

  for (const report of scopeReports) {
    if (report.error) {
      lines.push(`SCOPE [${report.scope}] — FEHLER: ${report.error}`);
      lines.push("");
      continue;
    }

    lines.push(`SCOPE [${report.scope}] — type=${report.type}, sources=${report.source_count}, trunk=${report.trunk_in_scope_count}`);

    const drifts = report.drifts || [];
    if (drifts.length === 0) {
      lines.push("  (keine Drift-Einträge)");
      lines.push("");
      continue;
    }

    const byStatus = {};
    for (const d of drifts) {
      (byStatus[d.status] ||= []).push(d);
    }

    for (const status of ["NEW", "UPDATED", "LOCAL_DRIFT", "REMOVED", "CLEAN", "FROZEN", "LOCAL_ONLY"]) {
      const entries = byStatus[status];
      if (!entries || entries.length === 0) continue;
      const icon = {
        NEW: "🆕",
        UPDATED: "🔄",
        LOCAL_DRIFT: "⚠️",
        REMOVED: "🗑",
        CLEAN: "✓",
        FROZEN: "❄",
        LOCAL_ONLY: "·"
      }[status];
      lines.push(`  ${icon} ${status} (${entries.length}):`);
      for (const e of entries) {
        const tail = e.trunk_path ? ` → ${e.trunk_path}` : "";
        lines.push(`    - ${e.handle}${e.title ? ` "${e.title}"` : ""}${tail}`);
      }
    }
    lines.push("");
  }

  const sum = summarize(scopeReports);
  lines.push(`SUMME: ${sum.total} Einträge — NEW=${sum.counts.NEW} UPDATED=${sum.counts.UPDATED} LOCAL_DRIFT=${sum.counts.LOCAL_DRIFT} REMOVED=${sum.counts.REMOVED} CLEAN=${sum.counts.CLEAN} FROZEN=${sum.counts.FROZEN}`);
  lines.push("");

  if (sum.counts.NEW + sum.counts.UPDATED > 0) {
    lines.push(`👉 Vorschlag: cw-transfer drift sync${sum.counts.LOCAL_DRIFT > 0 ? " (NACH Auflösung von LOCAL_DRIFT)" : ""}`);
  }
  if (sum.counts.LOCAL_DRIFT > 0) {
    lines.push(`⚠️  ${sum.counts.LOCAL_DRIFT} LOCAL_DRIFT-Einträge erfordern manuelle Auflösung vor Sync.`);
  }
  if (sum.counts.NEW + sum.counts.UPDATED + sum.counts.LOCAL_DRIFT + sum.counts.REMOVED === 0) {
    lines.push("✅ Alles synchron. Nichts zu tun.");
  }
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv);
  const config = await loadConfig();
  process.stderr.write(`drift-detect: ${tenantDescribe()}\n`);

  const store = getEnv(config.shopify_store_env);
  const token = getEnv(config.shopify_token_env);
  const client = createClient({ store, token });

  const scopeNames = args.scope
    ? [args.scope]
    : Object.keys(config.scopes);

  if (args.scope && !config.scopes[args.scope]) {
    die(1, `unknown scope: ${args.scope}. Available: ${Object.keys(config.scopes).join(", ")}`);
  }

  const reports = [];
  for (const scopeName of scopeNames) {
    process.stderr.write(`drift-detect: Scope [${scopeName}] ...\n`);
    const r = await detectScope({
      client,
      scopeName,
      scopeConfig: config.scopes[scopeName],
      repoRoot: REPO_ROOT
    });
    reports.push(r);
  }

  const reportObj = {
    timestamp: new Date().toISOString(),
    repo_root: REPO_ROOT,
    tenant_root: TENANT_ROOT,
    trunk_root: TRUNK_ROOT,
    scopes_requested: scopeNames,
    scopes: reports,
    summary: summarize(reports)
  };

  // Persistiere als JSON
  const reportDir = resolve(REPO_ROOT, config.report_dir || "tools/drift-sync/reports");
  await mkdir(reportDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(reportDir, `drift-${ts}.json`);
  await writeFile(reportPath, JSON.stringify(reportObj, null, 2));

  // Output
  if (args.json) {
    process.stdout.write(JSON.stringify(reportObj, null, 2) + "\n");
  } else {
    process.stdout.write(renderHumanReport(reports));
    process.stdout.write(`Bericht: ${reportPath.replace(REPO_ROOT + "/", "")}\n\n`);
  }
}

main().catch((err) => die(1, err.stack || err.message));
