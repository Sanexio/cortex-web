// ============================================================
// tenant-config.mjs — Tenant-spezifische Konstanten (Domain, OAuth-IDs, …)
// ============================================================
// Bisher waren Werte wie Shop-Domain, Public-Domain, OAuth-Client-ID in
// einzelnen Tools hartcodiert. Dieser Helper zentralisiert sie: Adapter
// laden `tenant.config.json` aus dem aktiven Tenant-Root (via tenant-path).
//
// Auflösung:
//   <tenant-root>/tenant.config.json   — wo tenant-root von tenantPath() kommt
//   Im Demo-Fallback liest aus trunk/_examples/tenant.config.json.
//
// Verwendung als Modul:
//   import { tenantConfig, tenantConfigGet } from "../../tools/lib/tenant-config.mjs";
//   const cfg = tenantConfig();
//   const shop = tenantConfigGet("shop.myshopify_domain");
//
// Verwendung als CLI (für Bash-Skripte):
//   bun tools/lib/tenant-config.mjs shop.myshopify_domain
//   → schreibt den Wert nach stdout, exit 0
//   bun tools/lib/tenant-config.mjs                    # ganze Config als JSON
//   bun tools/lib/tenant-config.mjs --keys             # alle bekannten Top-Level-Keys
// ============================================================

import { existsSync, readFileSync } from "node:fs";
import { tenantPath, tenantDescribe } from "./tenant-path.mjs";

let _cache = null;
let _cachePath = null;

export function tenantConfig() {
  const path = tenantPath("tenant.config.json");
  if (_cache && _cachePath === path) return _cache;
  if (!existsSync(path)) {
    _cache = {};
    _cachePath = path;
    return _cache;
  }
  try {
    _cache = JSON.parse(readFileSync(path, "utf8"));
    _cachePath = path;
  } catch (err) {
    throw new Error(`tenant.config.json parse error at ${path}: ${err.message}`);
  }
  return _cache;
}

/**
 * Lookup über Dotted-Key (z.B. "shop.myshopify_domain").
 * Wirft Error, wenn Key fehlt und kein Default gesetzt ist.
 */
export function tenantConfigGet(dottedKey, fallback = undefined) {
  const cfg = tenantConfig();
  const parts = dottedKey.split(".");
  let cur = cfg;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = cur[p];
    } else {
      if (fallback !== undefined) return fallback;
      throw new Error(
        `tenant.config.json: key "${dottedKey}" fehlt. ` +
        `Aktiver Pfad: ${_cachePath}. Setze ihn dort oder übergib einen Fallback.`
      );
    }
  }
  return cur;
}

export function tenantConfigDescribe() {
  return `${tenantDescribe()} | tenant.config.json: ${_cachePath ?? "(noch nicht geladen)"}`;
}

// --- CLI-Modus (bun tools/lib/tenant-config.mjs <dotted.key>) ---
// import.meta.main ist Bun-spezifisch; in Node-imports false, also no-op.
if (import.meta.main) {
  const arg = process.argv[2];
  if (!arg) {
    process.stdout.write(JSON.stringify(tenantConfig(), null, 2) + "\n");
    process.exit(0);
  }
  if (arg === "--keys") {
    process.stdout.write(Object.keys(tenantConfig()).join("\n") + "\n");
    process.exit(0);
  }
  try {
    const value = tenantConfigGet(arg);
    if (value === null || value === undefined) {
      process.exit(2);
    }
    if (typeof value === "object") {
      process.stdout.write(JSON.stringify(value) + "\n");
    } else {
      process.stdout.write(String(value) + "\n");
    }
  } catch (err) {
    process.stderr.write(`tenant-config: ${err.message}\n`);
    process.exit(1);
  }
}
