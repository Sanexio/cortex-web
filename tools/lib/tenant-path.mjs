// ============================================================
// tenant-path.mjs — JS-Pendant zu tools/lib/tenant-path.sh
// ============================================================
// Resolviert den aktiven Tenant-Daten-Pfad für Adapter (Bun/Node).
//
// Auflösungs-Reihenfolge:
//   1. ENV-Variable CORTEX_TENANT_DIR (explizit gesetzt) — höchste Priorität
//   2. Default-File ~/.cortex/tenant-path (Pfad als erste Zeile)
//   3. Fallback: <repo>/trunk/_examples (Demo-Modus)
//
// Konvention: CORTEX_TENANT_DIR zeigt auf Repo-Root, nicht auf trunk/.
// Sub-Pfade werden über tenantPath('trunk/content/team') angehängt.
//
// Nutzung in Adaptern:
//   import { tenantPath, tenantIsExamples, tenantDescribe } from
//     "../../tools/lib/tenant-path.mjs";
//   const TEAM_DIR = tenantPath('trunk/content/team');
// ============================================================

import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

// Repo-Root: zwei Verzeichnisse über tools/lib/
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "../..");

const DEFAULT_FILE = join(homedir(), ".cortex", "tenant-path");

/**
 * Gibt den aktiven Tenant-Pfad zurück. Sub-Pfad optional.
 * @param {string} [subpath] — relativ zum Tenant-Root (z.B. "trunk/content/team")
 * @returns {string} absoluter Pfad
 */
export function tenantPath(subpath = "") {
  let base = "";

  if (process.env.CORTEX_TENANT_DIR) {
    base = process.env.CORTEX_TENANT_DIR;
  } else if (existsSync(DEFAULT_FILE)) {
    try {
      base = readFileSync(DEFAULT_FILE, "utf8").split("\n")[0].trim();
    } catch {
      /* ignore */
    }
  }

  if (!base || !existsSync(base)) {
    // Fallback: Demo-Examples im Repo selbst
    base = resolve(REPO_ROOT, "trunk/_examples");
  }

  return subpath ? resolve(base, subpath) : base;
}

/**
 * @returns {boolean} true, wenn aktiver Pfad = Demo-Fallback (kein Tenant gesetzt)
 */
export function tenantIsExamples() {
  return tenantPath() === resolve(REPO_ROOT, "trunk/_examples");
}

/**
 * Diagnose-String für Adapter-Logs.
 * @returns {string}
 */
export function tenantDescribe() {
  if (process.env.CORTEX_TENANT_DIR) {
    return `Tenant: ${process.env.CORTEX_TENANT_DIR} (via CORTEX_TENANT_DIR)`;
  }
  if (existsSync(DEFAULT_FILE)) {
    try {
      const path = readFileSync(DEFAULT_FILE, "utf8").split("\n")[0].trim();
      return `Tenant: ${path} (via ${DEFAULT_FILE})`;
    } catch {
      /* ignore */
    }
  }
  return "Tenant: trunk/_examples (Demo-Fallback)";
}
