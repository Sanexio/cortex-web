// ============================================================
// theme-path.mjs — Schwester-Helper zu tenant-path.mjs
// ============================================================
// Resolviert den aktiven Theme-Pfad (Local-WP-Praxis-Theme) für Adapter,
// die in WordPress-Theme-Files schreiben oder vergleichen.
//
// Auflösungs-Reihenfolge:
//   1. ENV-Variable CORTEX_THEME_PATH (explizit gesetzt)     — höchste Priorität
//   2. ENV-Variable THEME_PATH (Legacy, mit stderr-Hinweis)  — Backward-Compat
//   3. Default-File ~/.cortex/theme-path (Pfad in erster Zeile)
//   4. Demo-Fallback: <repo>/.demo-theme (wird bei Bedarf vom Adapter angelegt)
//
// Konvention: CORTEX_THEME_PATH zeigt auf die Theme-Root (z.B.
//   .../themes/praxiszentrum), nicht auf inc/data. Sub-Pfade über themePath('inc/data').
// ============================================================

import { existsSync, readFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, "../..");

const DEFAULT_FILE = join(homedir(), ".cortex", "theme-path");
const DEMO_FALLBACK = resolve(REPO_ROOT, ".demo-theme");

let legacyWarningShown = false;
function warnLegacyOnce() {
  if (legacyWarningShown) return;
  legacyWarningShown = true;
  process.stderr.write(
    "[theme-path] WARN: THEME_PATH-env ist veraltet. " +
    "Bitte auf CORTEX_THEME_PATH umstellen.\n"
  );
}

function resolveBase() {
  if (process.env.CORTEX_THEME_PATH) return process.env.CORTEX_THEME_PATH;
  if (process.env.THEME_PATH) {
    warnLegacyOnce();
    return process.env.THEME_PATH;
  }
  if (existsSync(DEFAULT_FILE)) {
    try {
      return readFileSync(DEFAULT_FILE, "utf8").split("\n")[0].trim();
    } catch {
      /* ignore */
    }
  }
  return DEMO_FALLBACK;
}

let demoMkdirDone = false;

/**
 * Gibt den aktiven Theme-Pfad zurück. Sub-Pfad optional.
 * Anders als tenantPath: keine Existenz-Prüfung für reale Pfade — der Adapter
 * ist verantwortlich, weil Theme-Pfade dynamisch existieren (Local-WP an/aus).
 * Ausnahme: im Demo-Fallback wird das Verzeichnis bei Bedarf angelegt, damit
 * OSS-Demo-Runs out-of-the-box funktionieren (gitignored via .demo-theme/).
 * @param {string} [subpath]
 * @returns {string} absoluter Pfad
 */
export function themePath(subpath = "") {
  const base = resolveBase();
  if (base === DEMO_FALLBACK && !demoMkdirDone) {
    try {
      mkdirSync(DEMO_FALLBACK, { recursive: true });
      demoMkdirDone = true;
    } catch {
      /* adapter wird beim Existenz-Check passend reagieren */
    }
  }
  return subpath ? resolve(base, subpath) : base;
}

/**
 * @returns {boolean} true wenn aktiver Pfad = Demo-Fallback (kein Theme gesetzt)
 */
export function themeIsDemo() {
  return themePath() === DEMO_FALLBACK;
}

/**
 * Diagnose-String für Adapter-Logs.
 * @returns {string}
 */
export function themeDescribe() {
  if (process.env.CORTEX_THEME_PATH) {
    return `Theme: ${process.env.CORTEX_THEME_PATH} (via CORTEX_THEME_PATH)`;
  }
  if (process.env.THEME_PATH) {
    return `Theme: ${process.env.THEME_PATH} (via THEME_PATH — veraltet)`;
  }
  if (existsSync(DEFAULT_FILE)) {
    try {
      const path = readFileSync(DEFAULT_FILE, "utf8").split("\n")[0].trim();
      return `Theme: ${path} (via ${DEFAULT_FILE})`;
    } catch {
      /* ignore */
    }
  }
  return `Theme: ${DEMO_FALLBACK} (Demo-Fallback — wird bei Bedarf angelegt)`;
}
