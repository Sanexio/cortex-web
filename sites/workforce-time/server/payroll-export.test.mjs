import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

test("buildPayrollExport aggregates freigegebene Eintraege pro Tag und Mitarbeiter", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-payroll-"));
  process.env.NODE_ENV = "test";
  process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");

  try {
    const {
      buildPayrollExport,
      renderPayrollExportCsv,
      renderPayrollExportDatevLodas,
      setPayrollPersonnelNumber
    } = await import("./db.js");

    const report = buildPayrollExport({ year: 2026, month: 5 });
    assert.equal(report.period.year, 2026);
    assert.equal(report.period.month, 5);
    assert.equal(report.period.startDate, "2026-05-01");
    assert.ok(Array.isArray(report.employees));
    assert.ok(report.employees.length > 0, "Demo-Seed soll Mitarbeiter mit freigegebenen Eintraegen liefern");

    const mfaA = report.employees.find((employee) => employee.employeeId === "mfa-a");
    assert.ok(mfaA, "Demo-Mitarbeiter mfa-a soll im Mai-Report vorkommen");
    assert.ok(mfaA.totals.netMinutes > 0);
    assert.equal(mfaA.personnelNumber, null);

    assert.deepEqual(report.warnings.missingPersonnelNumbers.map((entry) => entry.employeeId).sort(),
      report.employees.filter((employee) => employee.totals.netMinutes > 0).map((employee) => employee.employeeId).sort());

    const totalNet = report.employees.reduce((sum, employee) => sum + employee.totals.netMinutes, 0);
    assert.equal(totalNet, report.totals.netMinutes);

    setPayrollPersonnelNumber("mfa-a", "1001");
    const reportAfter = buildPayrollExport({ year: 2026, month: 5 });
    const mfaAfter = reportAfter.employees.find((employee) => employee.employeeId === "mfa-a");
    assert.equal(mfaAfter.personnelNumber, "1001");

    const csv = renderPayrollExportCsv(reportAfter);
    assert.match(csv, /Personalnummer;Mitarbeitername/);
    assert.match(csv, /1001;/);

    const lodas = renderPayrollExportDatevLodas(reportAfter);
    assert.match(lodas, /\[Bewegungsdaten\]/);
    assert.match(lodas, /^1001;05\.2026;100;/m);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("buildPayrollExport validates year and month", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-payroll-v-"));
  process.env.NODE_ENV = "test";
  process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");

  try {
    const { buildPayrollExport } = await import("./db.js");
    assert.throws(() => buildPayrollExport({ year: 1999, month: 5 }), /year/);
    assert.throws(() => buildPayrollExport({ year: 2026, month: 13 }), /month/);
    assert.throws(() => buildPayrollExport({ year: "abc", month: 5 }), /year/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("setPayrollPersonnelNumber rejects unknown employee", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-payroll-pn-"));
  process.env.NODE_ENV = "test";
  process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");

  try {
    const { setPayrollPersonnelNumber } = await import("./db.js");
    assert.throws(() => setPayrollPersonnelNumber("does-not-exist", "9999"), /nicht gefunden/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("renderPayrollExportCsv schreibt Brutto- und Netto-Stunden getrennt", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-payroll-csv-"));
  process.env.NODE_ENV = "test";
  process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");

  try {
    const { renderPayrollExportCsv } = await import("./db.js");
    // Synthetic report: 30 min unpaid break => gross 9.55h, net 9.05h.
    const report = {
      period: { year: 2026, month: 4 },
      employees: [
        {
          personnelNumber: "1001",
          employeeName: "Test Person",
          roleTitle: "MFA",
          days: [
            {
              date: "2026-04-14",
              grossHours: 9.55,
              netHours: 9.05,
              unpaidBreakMinutes: 30,
              paidBreakMinutes: 0,
              entryCount: 1
            }
          ]
        }
      ]
    };
    const csv = renderPayrollExportCsv(report);
    const dataLine = csv.split("\r\n")[1];
    const fields = dataLine.split(";");
    assert.equal(fields[4], '"9,55"', "Brutto-Spalte muss grossHours enthalten");
    assert.equal(fields[7], '"9,05"', "Netto-Spalte muss netHours enthalten");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
