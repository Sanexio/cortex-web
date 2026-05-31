#!/usr/bin/env node
// ============================================================
// tools/extract-tenant-seed.mjs
// ------------------------------------------------------------
// Liest eine bestehende Workforce-SQLite read-only aus und
// schreibt eine seed.json fuer den Tenant. Default-Eingang:
// private/arbeitszeiten.sqlite des Prototyps. Default-Ausgang:
// <CORTEX_TENANT_DIR>/<workforce.paths.seed_file>.
//
// Aufruf (Standard):
//   node tools/extract-tenant-seed.mjs
//
// Optionen:
//   --db <path>     Eingang-SQLite (default: private/arbeitszeiten.sqlite)
//   --out <path>    Ausgang-seed.json (default: Tenant-Pfad aus tenant.config.json)
//   --limit <n>     pro Tabelle nur die letzten n Records
//                   (default: alle)
//   --dry-run       gibt die seed.json nach stdout statt zu schreiben
//
// Garantien:
//   - DB wird nur lesend geoeffnet.
//   - Idempotent: Mehrfach-Aufruf erzeugt identische seed.json,
//     solange die Quell-DB unveraendert ist.
//   - Nichts wird gepusht oder versendet.
// ============================================================

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

import { tenantConfigGet, tenantIsDemo, tenantPath } from "../server/tenant.js";

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === "--dry-run") args.dryRun = true;
    else if (flag === "--db") args.db = argv[++i];
    else if (flag === "--out") args.out = argv[++i];
    else if (flag === "--limit") args.limit = Number(argv[++i]) || undefined;
    else {
      console.error(`Unbekannte Option: ${flag}`);
      process.exit(2);
    }
  }
  return args;
}

function resolvePath(p) {
  return isAbsolute(p) ? p : resolve(PROJECT_ROOT, p);
}

const args = parseArgs(process.argv);

const inputDbPath = resolvePath(
  args.db ?? "private/arbeitszeiten.sqlite"
);

if (!existsSync(inputDbPath)) {
  console.error(`SQLite nicht gefunden: ${inputDbPath}`);
  process.exit(1);
}

let outputPath;
if (args.out) {
  outputPath = resolvePath(args.out);
} else if (tenantIsDemo()) {
  console.error(
    "Kein Tenant-Pfad gesetzt (CORTEX_TENANT_DIR). Bitte --out angeben oder Tenant exportieren."
  );
  process.exit(1);
} else {
  outputPath = tenantPath(
    tenantConfigGet("workforce.paths.seed_file", "trunk/workforce/seed.json")
  );
}

const db = new DatabaseSync(inputDbPath, { readOnly: true });

function maybeLimit(query) {
  return args.limit ? `${query} LIMIT ${args.limit}` : query;
}

const employees = db
  .prepare(
    maybeLimit(`
      SELECT id, display_name, role_title, initials, employment_status, source_id, source_system
      FROM employees
      WHERE removed_from_source = 0
      ORDER BY display_name COLLATE NOCASE
    `)
  )
  .all()
  .map((row) => ({
    source_id: row.source_id || row.id,
    display_name: row.display_name,
    role_title: row.role_title,
    initials: row.initials,
    employment_status: row.employment_status
  }));

const locations = db
  .prepare(
    maybeLimit(`
      SELECT id, name, source_id
      FROM locations
      WHERE removed_from_source = 0
      ORDER BY name COLLATE NOCASE
    `)
  )
  .all()
  .map((row) => ({
    source_id: row.source_id || row.name,
    name: row.name
  }));

const workAreas = db
  .prepare(
    maybeLimit(`
      SELECT id, name, source_id
      FROM work_areas
      WHERE removed_from_source = 0
      ORDER BY name COLLATE NOCASE
    `)
  )
  .all()
  .map((row) => ({
    source_id: row.source_id || row.name,
    name: row.name
  }));

const employeeIdToSourceId = new Map(
  db
    .prepare(`SELECT id, COALESCE(source_id, id) AS source_id FROM employees`)
    .all()
    .map((row) => [row.id, row.source_id])
);
const locationIdToName = new Map(
  db.prepare(`SELECT id, name FROM locations`).all().map((row) => [row.id, row.name])
);
const workAreaIdToName = new Map(
  db.prepare(`SELECT id, name FROM work_areas`).all().map((row) => [row.id, row.name])
);

const shiftRows = db
  .prepare(
    maybeLimit(`
      SELECT id, work_area_id, location_id, starts_at, ends_at, required_staff, note, source_id
      FROM shifts
      WHERE removed_from_source = 0
      ORDER BY starts_at, id
    `)
  )
  .all();
const assignmentsByShift = new Map();
for (const row of db.prepare(`SELECT shift_id, employee_id FROM shift_assignments`).all()) {
  const bucket = assignmentsByShift.get(row.shift_id) ?? [];
  bucket.push(employeeIdToSourceId.get(row.employee_id) ?? row.employee_id);
  assignmentsByShift.set(row.shift_id, bucket);
}
const shifts = shiftRows.map((row) => ({
  source_id: row.source_id || row.id,
  area: workAreaIdToName.get(row.work_area_id) ?? null,
  location: locationIdToName.get(row.location_id) ?? null,
  starts_at: row.starts_at,
  ends_at: row.ends_at,
  required_staff: row.required_staff,
  note: row.note,
  assignments: assignmentsByShift.get(row.id) ?? []
}));

const absences = db
  .prepare(
    maybeLimit(`
      SELECT id, employee_id, absence_type, starts_on, ends_on, status, note, source_id
      FROM absence_requests
      WHERE removed_from_source = 0
      ORDER BY starts_on, id
    `)
  )
  .all()
  .map((row) => ({
    source_id: row.source_id || row.id,
    employee_source_id: employeeIdToSourceId.get(row.employee_id) ?? row.employee_id,
    type: row.absence_type,
    starts_on: row.starts_on,
    ends_on: row.ends_on,
    status: row.status,
    note: row.note
  }));

const timeEntries = db
  .prepare(
    maybeLimit(`
      SELECT id, employee_id, starts_at, ends_at, work_area_id, location_id,
             status, entry_type, paid_break_minutes, unpaid_break_minutes, note, source_id
      FROM time_entries
      WHERE removed_from_source = 0
      ORDER BY starts_at, id
    `)
  )
  .all()
  .map((row) => ({
    source_id: row.source_id || row.id,
    employee_source_id: employeeIdToSourceId.get(row.employee_id) ?? row.employee_id,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    area: workAreaIdToName.get(row.work_area_id) ?? null,
    location: locationIdToName.get(row.location_id) ?? null,
    status: row.status,
    entry_type: row.entry_type,
    paid_break_minutes: row.paid_break_minutes,
    unpaid_break_minutes: row.unpaid_break_minutes,
    note: row.note
  }));

const seed = {
  _note:
    "Tenant-Seed fuer die Workforce-Time-App. Erzeugt von tools/extract-tenant-seed.mjs. Idempotent ueber source_id. Bei Wiederholung werden vorhandene Eintraege nicht ueberschrieben.",
  _generated_at: new Date().toISOString(),
  _generated_from: inputDbPath,
  _schema_version: 1,
  source_system: "local_tenant_seed",
  batch_id_prefix: "tenant_seed",
  employees,
  locations,
  work_areas: workAreas,
  shifts,
  absences,
  time_entries: timeEntries
};

const summary = {
  inputDb: inputDbPath,
  outputPath,
  counts: {
    employees: employees.length,
    locations: locations.length,
    work_areas: workAreas.length,
    shifts: shifts.length,
    absences: absences.length,
    time_entries: timeEntries.length
  }
};

if (args.dryRun) {
  process.stdout.write(JSON.stringify(seed, null, 2));
  console.error(JSON.stringify({ ...summary, dryRun: true }, null, 2));
  process.exit(0);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(seed, null, 2) + "\n", "utf8");
console.error(JSON.stringify(summary, null, 2));
