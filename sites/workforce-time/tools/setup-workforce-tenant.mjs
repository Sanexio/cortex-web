#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

function usage() {
  return `Usage:
  node tools/setup-workforce-tenant.mjs --tenant-dir <path> --slug <slug> --tenant-name <name> --host <host> --admin-email <email> [--dry-run]

Creates/merges a tenant.config.json workforce block and prepares trunk/workforce directories.
No secrets are read or written.
`;
}

function value(args, index, flag) {
  const next = args[index + 1];
  if (!next || next.startsWith("--")) throw new Error(`${flag} braucht einen Wert`);
  return next;
}

export function parseSetupArgs(argv = process.argv.slice(2)) {
  const options = { dryRun: false, tenantDir: "", slug: "", tenantName: "", host: "", adminEmail: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return { ...options, help: true };
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--tenant-dir") options.tenantDir = resolve(value(argv, index++, arg));
    else if (arg === "--slug") options.slug = value(argv, index++, arg);
    else if (arg === "--tenant-name") options.tenantName = value(argv, index++, arg);
    else if (arg === "--host") options.host = value(argv, index++, arg).replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    else if (arg === "--admin-email") options.adminEmail = value(argv, index++, arg).trim().toLowerCase();
    else throw new Error(`Unbekannte Option: ${arg}`);
  }
  return options;
}

function assertValid(options) {
  if (!options.tenantDir) throw new Error("--tenant-dir fehlt");
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(options.slug)) throw new Error("--slug muss ein stabiler DNS-aehnlicher Slug sein");
  if (!options.tenantName.trim()) throw new Error("--tenant-name fehlt");
  if (!/^[a-z0-9.-]+(?::\d+)?$/i.test(options.host)) throw new Error("--host ist ungueltig");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.adminEmail)) throw new Error("--admin-email ist ungueltig");
}

export function buildWorkforceConfig(options) {
  return {
    slug: options.slug,
    tenant: {
      display_name: options.tenantName,
      allowed_hosts: [options.host]
    },
    paths: {
      db_dir: "trunk/workforce/db",
      imports_dir: "trunk/workforce/imports",
      seed_file: "trunk/workforce/seed.json",
      migration_baseline_file: "trunk/workforce/migration-baseline.json"
    },
    auth: {
      public_base_url: `http://${options.host}`,
      users: [
        {
          email: options.adminEmail,
          display_name: "Workforce Admin",
          role: "admin"
        }
      ],
      smtp: {
        host: "127.0.0.1",
        port: 1025,
        secure: false,
        require_tls: false
      }
    },
    locations: [],
    work_area_categories: {},
    default_weekly_hours: { default: 40, by_name_tokens: [] },
    sprechstunde_defaults: [],
    display_name_overrides: [],
    work_area_overrides: [],
    short_area_overrides: [],
    aggregation_groups: [],
    tolerances: { monthly_over_soll_warn_percent: 5 },
    shift_schema: []
  };
}

function readJsonIfExists(path) {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, "utf8"));
}

function mergeConfig(existing, workforceConfig) {
  return {
    ...existing,
    workforce: {
      ...(existing.workforce ?? {}),
      ...workforceConfig,
      auth: {
        ...(existing.workforce?.auth ?? {}),
        ...workforceConfig.auth
      },
      paths: {
        ...(existing.workforce?.paths ?? {}),
        ...workforceConfig.paths
      },
      tenant: {
        ...(existing.workforce?.tenant ?? {}),
        ...workforceConfig.tenant
      }
    }
  };
}

export function planSetup(options) {
  assertValid(options);
  const tenantConfigPath = resolve(options.tenantDir, "tenant.config.json");
  const workforceConfig = buildWorkforceConfig(options);
  const mergedConfig = mergeConfig(readJsonIfExists(tenantConfigPath), workforceConfig);
  return {
    tenantDir: options.tenantDir,
    tenantConfigPath,
    directories: [
      resolve(options.tenantDir, "trunk/workforce/db"),
      resolve(options.tenantDir, "trunk/workforce/imports")
    ],
    seedPath: resolve(options.tenantDir, "trunk/workforce/seed.json"),
    mergedConfig
  };
}

export function applySetup(plan) {
  mkdirSync(dirname(plan.tenantConfigPath), { recursive: true });
  for (const directory of plan.directories) mkdirSync(directory, { recursive: true });
  if (!existsSync(plan.seedPath)) {
    mkdirSync(dirname(plan.seedPath), { recursive: true });
    writeFileSync(plan.seedPath, `${JSON.stringify({ employees: [], locations: [], workAreas: [], shifts: [] }, null, 2)}\n`);
  }
  writeFileSync(plan.tenantConfigPath, `${JSON.stringify(plan.mergedConfig, null, 2)}\n`);
}

export async function runSetup(options) {
  const plan = planSetup(options);
  if (!options.dryRun) applySetup(plan);
  return {
    dryRun: options.dryRun,
    tenantConfigPath: plan.tenantConfigPath,
    directories: plan.directories,
    seedPath: plan.seedPath,
    workforce: plan.mergedConfig.workforce
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const options = parseSetupArgs();
    if (options.help) {
      process.stdout.write(usage());
      process.exit(0);
    }
    const result = await runSetup(options);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
