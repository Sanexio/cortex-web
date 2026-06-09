#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import yaml from "js-yaml";
import { tenantDescribe, tenantPath } from "./tenant-path.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const schemaRoot = path.join(repoRoot, "trunk/schema");

const ajv = new Ajv({
  allErrors: true,
  strict: false
});

// ajv-formats is intentionally not a dependency yet. Registering these formats
// as ignored is explicit and suppresses AJV's unknown-format warnings.
ajv.addFormat("date", true);
ajv.addFormat("date-time", true);
ajv.addFormat("uri", true);

function loadSchema(name) {
  return JSON.parse(fs.readFileSync(path.join(schemaRoot, name), "utf8"));
}

function walkYaml(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkYaml(absolute));
    } else if (entry.isFile() && /\.ya?ml$/i.test(entry.name)) {
      files.push(absolute);
    }
  }
  return files.sort();
}

function printErrors(type, file, errors) {
  const rel = path.relative(tenantPath(), file);
  console.error(`validate: ${type}: FAIL ${rel}`);
  for (const error of errors) {
    const at = error.instancePath || "/";
    let detail = `${at} ${error.message}`;
    if (error.params?.missingProperty) detail += ` (${error.params.missingProperty})`;
    if (error.params?.additionalProperty) detail += ` (${error.params.additionalProperty})`;
    console.error(`validate:   ${detail}`);
  }
}

const specs = [
  {
    type: "products",
    schema: "product.schema.json",
    files: () => walkYaml(tenantPath("trunk/content/products"))
  },
  {
    type: "team",
    schema: "team-member.schema.json",
    files: () => walkYaml(tenantPath("trunk/content/team"))
  },
  {
    type: "pages",
    schema: "page.schema.json",
    files: () => walkYaml(tenantPath("trunk/content/pages"))
  },
  {
    type: "media",
    schema: "media.schema.json",
    files: () => {
      const registry = tenantPath("trunk/media/registry.yaml");
      return fs.existsSync(registry) ? [registry] : [];
    }
  },
  {
    type: "legal",
    schema: "legal.schema.json",
    files: () => walkYaml(tenantPath("trunk/content/legal")),
    optional: true
  }
];

console.log(`validate: ${tenantDescribe()}`);

let total = 0;
let failed = 0;
let setupFailed = false;

for (const spec of specs) {
  const schemaFile = path.join(schemaRoot, spec.schema);
  const files = spec.files();

  if (!fs.existsSync(schemaFile)) {
    if (spec.optional && files.length === 0) continue;
    console.error(`validate: ${spec.type}: schema missing at ${schemaFile}`);
    setupFailed = true;
    continue;
  }

  if (files.length === 0) {
    if (spec.optional) continue;
    console.error(`validate: ${spec.type}: no YAML files found`);
    setupFailed = true;
    continue;
  }

  const validate = ajv.compile(loadSchema(spec.schema));
  let typeFailed = 0;

  for (const file of files) {
    total += 1;
    const data = yaml.load(fs.readFileSync(file, "utf8"));
    if (!validate(data)) {
      typeFailed += 1;
      failed += 1;
      printErrors(spec.type, file, validate.errors || []);
    }
  }

  if (typeFailed > 0) {
    console.log(`validate: ${spec.type}: ${typeFailed} FAIL (${files.length})`);
  } else {
    console.log(`validate: ${spec.type}: OK (${files.length})`);
  }
}

if (setupFailed) process.exit(1);
if (failed > 0) {
  console.error(`validate: FAILED (${failed} of ${total} objects invalid)`);
  process.exit(2);
}

console.log(`validate: OK (${total} object(s))`);
