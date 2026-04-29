// drift-sync / lib / trunk-walker.mjs
// Trunk-YAML-Discovery für Drift-Sync.

import { readdir, readFile } from "node:fs/promises";
import { resolve, join, extname } from "node:path";
import yaml from "js-yaml";

/**
 * Walke alle YAML-Files unter einem Trunk-Verzeichnis. Skip _archive/, _backup/.
 * Returns: Array<{ filePath, parsed, sanexio_source | null }>
 */
export async function walkTrunkDir(absDir) {
  const results = [];
  await walkRecursive(absDir, results);
  return results;
}

async function walkRecursive(dir, results) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip Archive-/Backup-Verzeichnisse
      if (entry.name.startsWith("_") || entry.name === "node_modules") continue;
      await walkRecursive(fullPath, results);
      continue;
    }

    if (extname(entry.name) !== ".yaml" && extname(entry.name) !== ".yml") continue;

    try {
      const content = await readFile(fullPath, "utf8");
      const parsed = yaml.load(content);
      if (parsed && typeof parsed === "object") {
        results.push({
          filePath: fullPath,
          parsed,
          sanexio_source: parsed.sanexio_source || null
        });
      }
    } catch (err) {
      // YAML-Parse-Fehler nicht fatal — überspringen mit Warnung
      process.stderr.write(`trunk-walker: skip ${fullPath} (${err.message})\n`);
    }
  }
}

/**
 * Findet ein Trunk-YAML anhand der sanexio_source.resource_id.
 * Returns: { filePath, parsed, sanexio_source } | null
 */
export function findByResourceId(walkedFiles, resourceId) {
  for (const f of walkedFiles) {
    if (f.sanexio_source?.resource_id === resourceId) return f;
  }
  return null;
}

/**
 * Findet alle Trunk-YAMLs mit einem bestimmten scope.
 */
export function findByScope(walkedFiles, scope) {
  return walkedFiles.filter((f) => f.sanexio_source?.scope === scope);
}
