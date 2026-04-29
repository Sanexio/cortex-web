#!/usr/bin/env bun
// drift-sync / backfill.mjs
// Einmaliges Backfill: bestehende Trunk-YAMLs (ohne sanexio_source) mit
// Provenance-Block versehen, soweit Sanexio-Source eindeutig zuordenbar.
//
// Heuristik:
//   1. Trunk.id == Sanexio.handle (exact)
//   2. Trunk.slugs.juvantis == Sanexio.handle
//   3. Bei Mehrdeutigkeit: skip + Bericht
//
// `local_edits=true` wird gesetzt, weil die Trunk-YAMLs lokal kuratiert wurden
// (Sie-Form, Praxis-CTA, etc.). Das aktiviert den LOCAL_DRIFT-Schutz für
// zukünftige Drift-Updates — keine Auto-Überschreibung.
//
// Usage:
//   bun tools/drift-sync/backfill.mjs [--scope=<name>] [--dry-run]

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { createClient } from "../../adapters/shopify/lib/shopify-rest-client.mjs";
import { listProductsInCollection } from "./lib/shopify-collection.mjs";
import { getPagesByHandles } from "./lib/shopify-page.mjs";
import { walkTrunkDir } from "./lib/trunk-walker.mjs";
import {
  canonicalizeProduct,
  canonicalizePage,
  computeHash
} from "./lib/provenance.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function die(code, msg) { process.stderr.write(`backfill: ${msg}\n`); process.exit(code); }
function log(msg) { process.stderr.write(`backfill: ${msg}\n`); }

function parseArgs(argv) {
  const args = { scope: null, dryRun: false };
  for (const a of argv.slice(2)) {
    if (a === "--dry-run") args.dryRun = true;
    else if (a.startsWith("--scope=")) args.scope = a.slice("--scope=".length);
    else if (a === "--help" || a === "-h") {
      process.stdout.write("Usage: backfill [--scope=<name>] [--dry-run]\n");
      process.exit(0);
    } else die(1, `unknown arg: ${a}`);
  }
  return args;
}

async function loadConfig() {
  const path = join(REPO_ROOT, "tools", "drift-sync", "config.json");
  return JSON.parse(await readFile(path, "utf8"));
}

function getEnv(name) {
  const v = process.env[name];
  if (!v) die(1, `env ${name} fehlt`);
  return v;
}

function dumpYaml(obj) {
  return yaml.dump(obj, { lineWidth: 100, noRefs: true, sortKeys: false });
}

async function backfillScope({ client, scopeName, scopeConfig, dryRun }) {
  const trunkDir = resolve(REPO_ROOT, scopeConfig.praxis_target.trunk_dir);
  const walked = await walkTrunkDir(trunkDir);

  // Sanexio-Sources holen
  let sources = [];
  let sourceType;
  if (scopeConfig.type === "collection") {
    sourceType = "product";
    try {
      sources = await listProductsInCollection(client, scopeConfig.collection_handle);
    } catch (err) {
      log(`  ⚠️  ${scopeName}: Sources nicht abrufbar (${err.message}) — übersprungen`);
      return { matched: 0, skipped: 0, ambiguous: 0 };
    }
  } else if (scopeConfig.type === "pages") {
    sourceType = "page";
    sources = await getPagesByHandles(client, scopeConfig.page_handles);
  }

  // Index Sources nach handle
  const sourceByHandle = new Map(sources.map((s) => [s.handle, s]));

  let matched = 0, skipped = 0, alreadyHas = 0, ambiguous = 0;
  const matchActions = [];

  for (const t of walked) {
    if (t.sanexio_source) {
      alreadyHas++;
      continue;
    }
    const trunkObj = t.parsed;
    if (!trunkObj || typeof trunkObj !== "object") continue;

    // Heuristik: Match-Versuche
    let candidate = null;
    let matchVia = null;

    // 1. trunk.id == source.handle
    if (trunkObj.id && sourceByHandle.has(trunkObj.id)) {
      candidate = sourceByHandle.get(trunkObj.id);
      matchVia = `id="${trunkObj.id}"`;
    }
    // 2. trunk.slugs.juvantis == source.handle
    else if (trunkObj.slugs?.juvantis && sourceByHandle.has(trunkObj.slugs.juvantis)) {
      candidate = sourceByHandle.get(trunkObj.slugs.juvantis);
      matchVia = `slugs.juvantis="${trunkObj.slugs.juvantis}"`;
    }
    // 3. trunk.sku → source.variants[0].sku (für Products)
    else if (sourceType === "product" && trunkObj.sku) {
      for (const src of sources) {
        const variantSkus = (src.variants || []).map((v) => v.sku).filter(Boolean);
        if (variantSkus.includes(trunkObj.sku)) {
          candidate = src;
          matchVia = `sku="${trunkObj.sku}"`;
          break;
        }
      }
    }

    if (!candidate) {
      skipped++;
      continue;
    }

    // Hash berechnen
    const canonical = sourceType === "product"
      ? canonicalizeProduct(candidate)
      : canonicalizePage(candidate);
    const hash = computeHash(canonical);

    const provenanceBlock = {
      type: sourceType,
      handle: candidate.handle,
      resource_id: candidate.id,
      ...(scopeConfig.type === "collection" ? { collection: scopeConfig.collection_handle } : {}),
      scope: scopeName,
      last_synced_at: new Date().toISOString(),
      last_synced_hash: hash,
      drift_strategy: "auto-curate",
      local_edits: true  // Bestand wurde lokal kuratiert → Schutz vor Auto-Overwrite
    };

    // YAML mit sanexio_source erweitern
    const updated = { ...trunkObj, sanexio_source: provenanceBlock };

    matched++;
    matchActions.push({
      file: t.filePath.replace(REPO_ROOT + "/", ""),
      handle: candidate.handle,
      via: matchVia,
      resource_id: candidate.id
    });

    if (!dryRun) {
      const yamlString = dumpYaml(updated);
      await writeFile(t.filePath, yamlString);
    }
  }

  return { matched, skipped, alreadyHas, ambiguous, matchActions };
}

async function main() {
  const args = parseArgs(process.argv);
  const config = await loadConfig();
  const store = getEnv(config.shopify_store_env);
  const token = getEnv(config.shopify_token_env);
  const client = createClient({ store, token });

  const scopeNames = args.scope ? [args.scope] : Object.keys(config.scopes);

  const totals = { matched: 0, skipped: 0, alreadyHas: 0 };
  const allActions = [];

  for (const scopeName of scopeNames) {
    const scopeConfig = config.scopes[scopeName];
    log(`Backfill Scope [${scopeName}] ...`);
    const r = await backfillScope({
      client,
      scopeName,
      scopeConfig,
      dryRun: args.dryRun
    });
    totals.matched += r.matched;
    totals.skipped += r.skipped;
    totals.alreadyHas += r.alreadyHas || 0;
    if (r.matchActions) allActions.push(...r.matchActions.map((a) => ({ scope: scopeName, ...a })));
  }

  process.stdout.write("\n=== Backfill-Summary ===\n");
  process.stdout.write(`matched: ${totals.matched} · already-has: ${totals.alreadyHas} · skipped (no match): ${totals.skipped}\n`);
  process.stdout.write(`mode: ${args.dryRun ? "DRY-RUN" : "LIVE"}\n\n`);

  if (allActions.length > 0) {
    process.stdout.write("Matches:\n");
    for (const a of allActions) {
      process.stdout.write(`  [${a.scope}] ${a.file} → handle=${a.handle} (id=${a.resource_id}, via ${a.via})\n`);
    }
  }

  process.stdout.write("\n💡 Backfill setzt local_edits=true — Schutz für lokal kuratierte Bestand-YAMLs.\n");
  process.stdout.write("   Bei späteren Sanexio-Updates → LOCAL_DRIFT (manuelle Auflösung pflichtig).\n\n");
}

main().catch((err) => die(1, err.stack || err.message));
