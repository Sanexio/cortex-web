#!/usr/bin/env bun
// drift-sync / sync.mjs
// Auto-Curate + Push für NEW/UPDATED Drift-Einträge.
//
// Usage:
//   bun tools/drift-sync/sync.mjs [--scope=<name>] [--auto-publish] [--dry-run]
//
// Flow (Spec §5):
//   1. Drift detektieren
//   2. Pro NEW: Trunk-YAML neu schreiben + push wp:page (status=draft)
//   3. Pro UPDATED (local_edits=false): Trunk-YAML aktualisieren + push
//   4. Pro UPDATED (local_edits=true) → LOCAL_DRIFT: STOPP, Diff anzeigen
//   5. Pro REMOVED: Trunk in _archive verschieben, WP-Page auf draft
//
// Spec: specs/drift-sync/SPEC.md §5

import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { resolve, dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import yaml from "js-yaml";

import { createClient } from "../../adapters/shopify/lib/shopify-rest-client.mjs";
import { tenantPath, tenantIsExamples, tenantDescribe } from "../lib/tenant-path.mjs";
import { listProductsInCollection, getProductById } from "./lib/shopify-collection.mjs";
import { getPagesByHandles } from "./lib/shopify-page.mjs";
import { walkTrunkDir, findByResourceId } from "./lib/trunk-walker.mjs";
import {
  canonicalizeProduct,
  canonicalizePage,
  computeHash,
  compareDrift,
  buildProvenanceBlock
} from "./lib/provenance.mjs";
import {
  curateProductForPraxis,
  curatePageForPraxis
} from "./lib/hwg-curate.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TENANT_ROOT = tenantIsExamples() ? REPO_ROOT : tenantPath();
const TRUNK_ROOT = tenantIsExamples() ? resolve(REPO_ROOT, "trunk") : tenantPath("trunk");

function die(code, msg) {
  process.stderr.write(`drift-sync: ${msg}\n`);
  process.exit(code);
}

function log(msg) {
  process.stderr.write(`drift-sync: ${msg}\n`);
}

function parseArgs(argv) {
  const args = { scope: null, autoPublish: false, dryRun: false };
  for (const a of argv.slice(2)) {
    if (a === "--auto-publish") args.autoPublish = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a.startsWith("--scope=")) args.scope = a.slice("--scope=".length);
    else if (a === "--help" || a === "-h") {
      process.stdout.write("Usage: drift-sync [--scope=<name>] [--auto-publish] [--dry-run]\n");
      process.exit(0);
    } else die(1, `unknown arg: ${a}`);
  }
  return args;
}

async function loadConfig() {
  const path = process.env.DRIFT_SYNC_CONFIG
    ? resolve(process.env.DRIFT_SYNC_CONFIG)
    : join(REPO_ROOT, "tools", "drift-sync", "config.json");
  return JSON.parse(await readFile(path, "utf8"));
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
  if (!v) die(1, `env ${name} fehlt`);
  return v;
}

function dumpYaml(obj) {
  return yaml.dump(obj, { lineWidth: 100, noRefs: true, sortKeys: false });
}

async function backupTrunkYaml(trunkPath) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const relPath = displayPath(trunkPath);
  const safeRel = relPath.replace(/\//g, "__");
  const backupDir = resolve(TENANT_ROOT, "_archive", "drift-sync");
  await mkdir(backupDir, { recursive: true });
  const backupPath = join(backupDir, `${ts}__${safeRel}`);
  const content = await readFile(trunkPath, "utf8");
  await writeFile(backupPath, content);
  return displayPath(backupPath);
}

async function pushToWp(yamlPath, repoRoot, status, dryRun, sourceType) {
  // Spec-Mapping: Products → wp:product (sync-wp.sh + build.mjs Pipeline);
  // Pages → wp:page (noch nicht in PUSH_TOOLS — fällt für jetzt auf Manual-Push zurück).
  const pushSpec = sourceType === "product" ? "wp:product" : "wp:page";

  if (dryRun) {
    log(`  [dry-run] würde push ${pushSpec} ${displayPath(yamlPath)} (status=${status})`);
    return { ok: true, dryRun: true };
  }

  if (pushSpec === "wp:page") {
    // wp:page ist noch nicht in cw-transfer PUSH_TOOLS registriert.
    // Trunk-YAML ist geschrieben, manueller Push pflichtig in dieser Phase.
    log(`  ⏸  wp:page Push noch nicht implementiert — Trunk geschrieben, manuell nachpflegen: ${displayPath(yamlPath)}`);
    return { ok: true, deferred: true, reason: "wp_page_push_not_implemented" };
  }

  const args = [join(repoRoot, "tools", "cw-transfer"), "push", pushSpec, yamlPath];
  const env = { ...process.env, WP_PAGE_STATUS: status };
  const result = spawnSync("bun", args, { encoding: "utf8", env });
  if (result.status !== 0) {
    return { ok: false, error: result.stderr || result.stdout };
  }
  return { ok: true, stdout: result.stdout };
}

async function handleNewOrUpdated({
  drift,
  source,
  scopeName,
  scopeConfig,
  config,
  args,
  repoRoot
}) {
  const sourceType = drift.source_type;

  // Curation-Pipeline aufrufen
  const curate = sourceType === "product"
    ? await curateProductForPraxis({ product: source, scope: scopeName, scopeConfig })
    : await curatePageForPraxis({ page: source, scope: scopeName, scopeConfig });

  if (curate.reason === "HWG_HALT") {
    log(`  ⚠️  HWG_HALT für ${drift.handle}: ${curate.halts.join(", ")} — übersprungen, manuelle Auflösung`);
    return { handle: drift.handle, status: "SKIPPED_HWG", halts: curate.halts, warnings: curate.warnings };
  }

  // Hash berechnen
  const canonical = sourceType === "product"
    ? canonicalizeProduct(source)
    : canonicalizePage(source);
  const currentHash = computeHash(canonical);

  // Provenance-Block bauen
  const provenance = buildProvenanceBlock({
    type: sourceType,
    handle: source.handle,
    resourceId: source.id,
    collection: scopeConfig.type === "collection" ? scopeConfig.collection_handle : undefined,
    scope: scopeName,
    currentHash,
    driftStrategy: "auto-curate"
  });

  // Bei UPDATED: Existierendes Trunk laden, nur Sanexio-Felder + upstream_source ersetzen,
  // Lokale Praxis-Felder erhalten.
  let finalTrunk;
  if (drift.status === "UPDATED" && drift.trunk_path) {
    const existingPath = resolve(TENANT_ROOT, drift.trunk_path);
    const existingContent = await readFile(existingPath, "utf8");
    const existing = yaml.load(existingContent);

    // Backup vor Modifikation
    const backupRel = await backupTrunkYaml(existingPath);
    log(`  💾 Backup: ${backupRel}`);

    // Merge: neue Curation als Basis, Praxis-Lokal-Felder aus existing übernehmen
    finalTrunk = {
      ...curate.trunkObject,
      // Lokal: views.practice bleibt aus existing (Schutz lokaler Edits)
      views: {
        ...(curate.trunkObject.views || {}),
        praxis: existing.views?.practice || curate.trunkObject.views?.practice,
        juvantis: curate.trunkObject.views?.shop || existing.views?.shop
      }
    };
    // Wenn existing zusätzliche sections über die ersten 2 hinaus hat → behalten als „lokal hinzugefügt"
    if (Array.isArray(existing.sections) && existing.sections.length > 2 && Array.isArray(finalTrunk.sections)) {
      // Ersetze nur die ersten 2 Sections (Hero + Body von Sanexio), Rest erhalten
      const localExtras = existing.sections.slice(2);
      finalTrunk.sections = [...finalTrunk.sections, ...localExtras];
    }
    // wp-Block aus existing erhalten (Praxis-Specifika)
    if (existing.wp) finalTrunk.wp = existing.wp;
  } else {
    finalTrunk = curate.trunkObject;
  }

  finalTrunk.upstream_source = provenance;

  // Trunk-Pfad bestimmen
  const trunkDir = trunkPath(scopeConfig.praxis_target.trunk_dir);
  const filename = `${source.handle}.yaml`;
  const targetPath = resolve(trunkDir, filename);

  // Schreiben
  if (args.dryRun) {
    log(`  [dry-run] würde schreiben: ${displayPath(targetPath)}`);
  } else {
    await mkdir(trunkDir, { recursive: true });
    const yamlString = dumpYaml(finalTrunk);
    await writeFile(targetPath, yamlString);
    log(`  💾 ${displayPath(targetPath)}`);
  }

  // Push to WP
  const status = (args.autoPublish && scopeConfig.auto_publish_allowed)
    ? "publish"
    : (scopeConfig.praxis_target.page_status_default || "draft");

  const pushResult = await pushToWp(targetPath, repoRoot, status, args.dryRun, sourceType);
  if (!pushResult.ok) {
    log(`  ❌ WP-Push fehlgeschlagen: ${pushResult.error}`);
    return {
      handle: drift.handle,
      status: drift.status === "NEW" ? "NEW_PUSH_FAILED" : "UPDATED_PUSH_FAILED",
      warnings: curate.warnings,
      error: pushResult.error
    };
  }

  return {
    handle: drift.handle,
    status: drift.status === "NEW" ? "NEW_DONE" : "UPDATED_DONE",
    warnings: curate.warnings,
    push_status: status,
    trunk_path: displayPath(targetPath)
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const config = await loadConfig();
  log(tenantDescribe());

  const store = getEnv(config.shopify_store_env);
  const token = getEnv(config.shopify_token_env);
  const client = createClient({ store, token });

  const scopeNames = args.scope ? [args.scope] : Object.keys(config.scopes);
  if (args.scope && !config.scopes[args.scope]) {
    die(1, `unknown scope: ${args.scope}`);
  }

  const summary = { processed: 0, new: 0, updated: 0, local_drift: 0, removed: 0, skipped_hwg: 0, errors: 0 };
  const actions = [];

  for (const scopeName of scopeNames) {
    const scopeConfig = config.scopes[scopeName];
    log(`Scope [${scopeName}] ...`);

    // Sources frisch holen
    let sources = [];
    let sourceType;
    if (scopeConfig.type === "collection") {
      sourceType = "product";
      sources = await listProductsInCollection(client, scopeConfig.collection_handle);
    } else if (scopeConfig.type === "pages") {
      sourceType = "page";
      sources = await getPagesByHandles(client, scopeConfig.page_handles);
    }

    const sourceById = new Map(sources.map((s) => [s.id, s]));

    // Trunk walken
    const trunkDir = trunkPath(scopeConfig.praxis_target.trunk_dir);
    const walkedTrunk = await walkTrunkDir(trunkDir);
    const trunkInScope = walkedTrunk.filter((f) => f.upstream_source?.scope === scopeName);

    // Pro Source: Drift-Status ermitteln + Aktion
    for (const src of sources) {
      const trunkMatch = findByResourceId(trunkInScope, src.id);
      const cmp = compareDrift({
        trunkYaml: trunkMatch?.parsed,
        currentSource: src,
        sourceType
      });

      const drift = {
        status: cmp.status,
        source_type: sourceType,
        resource_id: src.id,
        handle: src.handle,
        trunk_path: trunkMatch?.filePath
          ? displayPath(trunkMatch.filePath)
          : null
      };

      if (cmp.status === "CLEAN" || cmp.status === "FROZEN" || cmp.status === "LOCAL_ONLY") continue;

      if (cmp.status === "LOCAL_DRIFT") {
        log(`  ⚠️  LOCAL_DRIFT: ${src.handle} — local_edits=true, Sanexio hat sich geändert. STOPP für manuelle Auflösung.`);
        summary.local_drift++;
        actions.push({ ...drift, action: "STOPPED_LOCAL_DRIFT" });
        continue;
      }

      if (cmp.status === "NEW" || cmp.status === "UPDATED") {
        const result = await handleNewOrUpdated({
          drift,
          source: src,
          scopeName,
          scopeConfig,
          config,
          args,
          repoRoot: REPO_ROOT
        });
        actions.push({ ...drift, ...result });
        summary.processed++;
        if (cmp.status === "NEW") summary.new++;
        else summary.updated++;
        if (result.status === "SKIPPED_HWG") summary.skipped_hwg++;
        if (result.status?.endsWith("_FAILED")) summary.errors++;
      }
    }

    // REMOVED: Trunk-YAMLs in _archive/drift-sync/removed/ schieben
    for (const t of trunkInScope) {
      const provId = t.upstream_source.resource_id;
      if (sourceById.has(provId)) continue;
      // REMOVED
      log(`  🗑  REMOVED: ${t.upstream_source.handle} — Sanexio nicht mehr da`);
      summary.removed++;
      if (!args.dryRun) {
        const removedDir = resolve(TENANT_ROOT, "_archive", "drift-sync", "removed");
        await mkdir(removedDir, { recursive: true });
        const targetPath = join(removedDir, basename(t.filePath));
        await rename(t.filePath, targetPath);
        log(`     → ${displayPath(targetPath)}`);
      }
      actions.push({
        handle: t.upstream_source.handle,
        resource_id: provId,
        action: "REMOVED_ARCHIVED",
        trunk_path: displayPath(t.filePath)
      });
    }
  }

  // Zusammenfassung
  process.stdout.write("\n=== Sync-Summary ===\n");
  process.stdout.write(`processed: ${summary.processed}, new: ${summary.new}, updated: ${summary.updated}\n`);
  process.stdout.write(`local_drift (STOPP): ${summary.local_drift}, removed: ${summary.removed}\n`);
  process.stdout.write(`skipped_hwg: ${summary.skipped_hwg}, errors: ${summary.errors}\n`);
  process.stdout.write(`mode: ${args.dryRun ? "DRY-RUN" : "LIVE"}, auto-publish: ${args.autoPublish ? "yes" : "no (draft)"}\n\n`);

  if (summary.local_drift > 0) {
    process.stdout.write(`⚠️  ${summary.local_drift} LOCAL_DRIFT-Einträge — manuell auflösen:\n`);
    for (const a of actions.filter((a) => a.action === "STOPPED_LOCAL_DRIFT")) {
      process.stdout.write(`   - ${a.handle} (Trunk: ${a.trunk_path})\n`);
    }
  }

  if (summary.errors > 0) process.exit(2);
  process.exit(0);
}

main().catch((err) => die(1, err.stack || err.message));
