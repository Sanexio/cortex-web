// ============================================================
// tenant.js — Tenant-Aufloesung fuer die Workforce-Time-App im Trunk.
// ============================================================
//
// Im Trunk-Kontext re-exportiert dieser Wrapper die Cortex-Web-
// Framework-Helper aus tools/lib/, sodass server/db.js
// und tools/extract-tenant-seed.mjs ihre bestehende API
// (tenantPath, tenantConfigGet, tenantIsDemo, tenantSource, …)
// unveraendert weiter benutzen koennen.
//
// Aufloesungs-Reihenfolge (identisch zur Sandbox-Variante):
//   1. CORTEX_TENANT_DIR (env)
//   2. ~/.cortex/tenant-path (eine Zeile = Tenant-Root)
//   3. Demo-Fallback: trunk/_examples/ im Cortex-Web-Repo
//
// Die Sandbox-Variante (Prototyp) hatte einen eigenen Demo-Fallback
// auf <project>/private/tenant-examples/. Im Trunk faellt das auf
// den Cortex-Web-Examples-Pfad zurueck (via tenant-path.mjs).
// ============================================================

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import {
  tenantPath,
  tenantIsExamples,
  tenantDescribe
} from "../../../tools/lib/tenant-path.mjs";

import {
  tenantConfig,
  tenantConfigGet
} from "../../../tools/lib/tenant-config.mjs";

export { tenantPath, tenantDescribe, tenantConfig, tenantConfigGet };

// API-Bruecke: Prototyp nutzte tenantIsDemo()/tenantSource(), die
// es in der Cortex-Web-API so nicht gibt. Wir bilden sie hier nach.
export function tenantIsDemo() {
  return tenantIsExamples();
}

const DEFAULT_FILE = join(homedir(), ".cortex", "tenant-path");

export function tenantSource() {
  if (process.env.CORTEX_TENANT_DIR) return "env:CORTEX_TENANT_DIR";
  if (existsSync(DEFAULT_FILE)) {
    try {
      const line = readFileSync(DEFAULT_FILE, "utf8").split("\n")[0].trim();
      if (line) return `file:${DEFAULT_FILE}`;
    } catch {
      /* ignore */
    }
  }
  return "demo-fallback";
}

// Reset-Hook nur fuer Tests. Die Cortex-Web-Helper cachen intern,
// bieten aber keine Reset-API; wir lassen die Funktion no-op, damit
// bestehender Aufrufer-Code nicht bricht.
export function _resetTenantCache() {
  /* no-op im Trunk-Wrapper */
}
