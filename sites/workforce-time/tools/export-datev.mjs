#!/usr/bin/env node
// T-008 — DATEV-LODAS-Export-CLI (claude-chat, 2026-06-05).
// Erzeugt einen Monats-Export als DATEV-LODAS-CSV oder als generisches CSV
// auf STDOUT bzw. in eine Datei. Backend-Quelle: server/db.js
// buildPayrollExport + renderPayrollExportDatevLodas/renderPayrollExportCsv.
//
// Aufruf:
//   node tools/export-datev.mjs --year=2026 --month=5 [--format=datev_lodas|csv|json]
//                                [--employee=<id>] [--out=path]
//
// Validation: prüft Plausibilität gegen Sollstunden-Summen aus
// buildPayrollExport (Warnings auf STDERR).

import { writeFileSync } from "node:fs";
import { buildPayrollExport, renderPayrollExportCsv, renderPayrollExportDatevLodas } from "../server/db.js";

function parseArgs(argv) {
  const args = {};
  for (const raw of argv.slice(2)) {
    const match = raw.match(/^--([^=]+)(?:=(.*))?$/);
    if (!match) continue;
    args[match[1]] = match[2] ?? "true";
  }
  return args;
}

const args = parseArgs(process.argv);
const today = new Date();
const year = Number(args.year ?? today.getFullYear());
const month = Number(args.month ?? today.getMonth() + 1);
const format = (args.format ?? "datev_lodas").toLowerCase();
const employeeFilter = args.employee ?? null;
const outPath = args.out ?? null;

if (!Number.isInteger(year) || year < 2000 || year > 2100) {
  console.error(`Ungültiges Jahr: ${args.year}`);
  process.exit(2);
}
if (!Number.isInteger(month) || month < 1 || month > 12) {
  console.error(`Ungültiger Monat: ${args.month}`);
  process.exit(2);
}

const report = buildPayrollExport({ year, month });

if (employeeFilter) {
  report.employees = report.employees.filter((row) => row.employeeId === employeeFilter);
  if (report.employees.length === 0) {
    console.error(`Mitarbeitender "${employeeFilter}" nicht im Export-Zeitraum gefunden.`);
    process.exit(3);
  }
  // Recompute the missing-personnel-number list against the filtered set, so a
  // single-employee export of someone WITH a number is not blocked by others.
  report.warnings.missingPersonnelNumbers = report.employees
    .filter((e) => e.totals.netMinutes > 0 && !e.personnelNumber)
    .map((e) => ({ employeeId: e.employeeId, employeeName: e.employeeName }));
}

if (report.warnings?.missingPersonnelNumbers?.length) {
  console.error(`WARNUNG: ${report.warnings.missingPersonnelNumbers.length} Mitarbeitende ohne Personalnummer`);
  for (const w of report.warnings.missingPersonnelNumbers) {
    console.error(`  · ${w.employeeName} (${w.employeeId})`);
  }
}

const sumIst = report.totals?.netHours ?? 0;
if (sumIst <= 0) {
  console.error(`WARNUNG: Summe netHours = ${sumIst} — keine freigegebenen Einträge im ${year}-${String(month).padStart(2, "0")}?`);
}

let body;
try {
  if (format === "json") {
    body = JSON.stringify(report, null, 2);
  } else if (format === "csv") {
    body = renderPayrollExportCsv(report);
  } else if (format === "datev_lodas") {
    body = renderPayrollExportDatevLodas(report);
  } else {
    console.error(`Unbekanntes Format: ${format}. Erlaubt: datev_lodas, csv, json.`);
    process.exit(2);
  }
} catch (err) {
  // C3: a blocked LODAS export (missing personnel numbers) must fail loudly
  // with a non-zero exit, never write a partial file.
  console.error(`FEHLER: ${err.message}`);
  process.exit(4);
}

if (outPath) {
  writeFileSync(outPath, body, "utf8");
  console.error(`OK → ${outPath} (${body.length} Bytes, ${report.employees.length} Mitarbeitende)`);
} else {
  process.stdout.write(body);
  if (!body.endsWith("\n")) process.stdout.write("\n");
}
