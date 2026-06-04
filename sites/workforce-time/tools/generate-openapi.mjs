#!/usr/bin/env node
// generate-openapi.mjs — Validiert docs/openapi.yaml gegen die in
// server/api.js aktiv vorhandenen Routes. Hilfsmittel für Welle
// O.5 / O.9 (External-Tenants).
//
// Heute: das Schema wird manuell in docs/openapi.yaml gepflegt; dieses
// Skript prüft Drift zwischen api.js-Routes (mit method+path) und dem
// YAML, damit niemand einen Endpoint vergisst zu dokumentieren.
//
// Usage:
//   node tools/generate-openapi.mjs           # prüft, exit 0/1
//   node tools/generate-openapi.mjs --json    # JSON-Report

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");
const API_FILE = resolve(ROOT, "server/api.js");
const OPENAPI_FILE = resolve(ROOT, "docs/openapi.yaml");

function extractRoutesFromApiJs() {
  const src = readFileSync(API_FILE, "utf-8");
  const routes = new Set();
  // Pattern 1: literale Pfade
  const literalRx = /method === "(GET|POST|PATCH|DELETE|PUT)".*?url\.pathname === "(\/api\/[^"]+)"/g;
  let m;
  while ((m = literalRx.exec(src)) !== null) {
    routes.add(`${m[1]} ${m[2]}`);
  }
  // Pattern 2: parametrisierte Routes via Regex-Match-Variablen.
  // Heuristik: such nach `const xMatch = url.pathname.match(/^\/api\/.../)` und
  // bestimme aus dem nächsten `request.method === "X"` Block den Pfad-Stub.
  const regexRx = /const\s+(\w+Match)\s*=\s*url\.pathname\.match\(\/\^(\\\/api\\\/[^/]+(?:\\\/[^/]+)*)/g;
  while ((m = regexRx.exec(src)) !== null) {
    // Match-Pfad rohweise; wir tragen ihn als <ROUTE-FAMILY> ein.
    const cleaned = m[2].replace(/\\\//g, "/").replace(/\([^)]+\)/g, "{id}");
    routes.add(`MATCH ${cleaned}`);
  }
  return routes;
}

function extractRoutesFromOpenapi() {
  const src = readFileSync(OPENAPI_FILE, "utf-8");
  const routes = new Set();
  // einfaches YAML-Pfad-Parsing — keine externe Lib nötig.
  const lines = src.split("\n");
  let currentPath = null;
  for (const line of lines) {
    const pathMatch = line.match(/^  (\/api\/[^:]+):\s*$/);
    if (pathMatch) {
      currentPath = pathMatch[1];
      continue;
    }
    if (currentPath) {
      const verbMatch = line.match(/^    (get|post|patch|put|delete):\s*$/);
      if (verbMatch) {
        routes.add(`${verbMatch[1].toUpperCase()} ${currentPath}`);
      }
    }
  }
  return routes;
}

const apiRoutes = extractRoutesFromApiJs();
const yamlRoutes = extractRoutesFromOpenapi();

const apiLiterals = new Set([...apiRoutes].filter((r) => !r.startsWith("MATCH ")));
const missingInYaml = [...apiLiterals].filter((r) => !yamlRoutes.has(r));
const extraInYaml = [...yamlRoutes].filter((r) => !apiLiterals.has(r));

const report = {
  apiRoutesFound: apiLiterals.size,
  yamlRoutesFound: yamlRoutes.size,
  patternMatchesFromApi: [...apiRoutes].filter((r) => r.startsWith("MATCH ")),
  missingInYaml,
  extraInYaml,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`api.js literal-routes: ${apiLiterals.size}`);
  console.log(`api.js pattern-routes: ${report.patternMatchesFromApi.length}`);
  console.log(`openapi.yaml routes: ${yamlRoutes.size}`);
  if (missingInYaml.length) {
    console.log("\nFehlend in openapi.yaml:");
    for (const r of missingInYaml) console.log(`  - ${r}`);
  }
  if (extraInYaml.length) {
    console.log("\nNur in openapi.yaml (parametrisiert oder geplant):");
    for (const r of extraInYaml) console.log(`  - ${r}`);
  }
  if (!missingInYaml.length && !extraInYaml.length) {
    console.log("\nAlle literalen Routes sind dokumentiert. ✓");
  }
}

process.exit(missingInYaml.length > 0 ? 1 : 0);
