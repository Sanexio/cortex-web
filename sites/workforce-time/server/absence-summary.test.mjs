import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";

const tempDir = await mkdtemp(join(tmpdir(), "workforce-absence-summary-"));
process.env.NODE_ENV = "test";
process.env.CORTEX_TENANT_DIR = join(process.cwd(), "../..", "trunk/_examples");
process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");

const { db, summarizeAbsencesByYear } = await import("./db.js");
const { ABSENCE_STATUS } = await import("./absence-constants.js");

after(async () => {
  db.close?.();
  delete process.env.CORTEX_TENANT_DIR;
  delete process.env.ARBEITSZEITEN_DB;
  await rm(tempDir, { recursive: true, force: true });
});

test("summarizeAbsencesByYear aggregates generic fixture data by year", () => {
  db.prepare(`
    INSERT INTO employees (id, display_name, role_title, initials)
    VALUES (?, ?, ?, ?)
  `).run("employee-a", "Employee A", "Role A", "EA");

  const insertAbsence = db.prepare(`
    INSERT INTO absence_requests
      (id, employee_id, absence_type, starts_on, ends_on, status, removed_from_source)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAbsence.run(
    "absence-vacation-approved",
    "employee-a",
    "Bezahlter Urlaub",
    "2025-12-29",
    "2026-01-02",
    ABSENCE_STATUS.APPROVED,
    0
  );
  insertAbsence.run(
    "absence-vacation-pending",
    "employee-a",
    "Bezahlter Urlaub",
    "2026-01-05",
    "2026-01-05",
    ABSENCE_STATUS.OPEN,
    0
  );
  insertAbsence.run(
    "absence-sick-approved",
    "employee-a",
    "Krankheit",
    "2026-01-12",
    "2026-01-14",
    ABSENCE_STATUS.APPROVED,
    0
  );
  insertAbsence.run(
    "absence-comp-pending",
    "employee-a",
    "Feiertagsausgleich",
    "2025-12-31",
    "2026-01-02",
    ABSENCE_STATUS.OPEN,
    0
  );
  insertAbsence.run(
    "absence-sick-removed",
    "employee-a",
    "Krankheit",
    "2026-01-15",
    "2026-01-15",
    ABSENCE_STATUS.APPROVED,
    1
  );
  insertAbsence.run(
    "absence-sick-rejected",
    "employee-a",
    "Krankheit",
    "2026-01-16",
    "2026-01-16",
    ABSENCE_STATUS.REJECTED,
    0
  );

  const summary = summarizeAbsencesByYear("employee-a");
  const expectedYears = Array.from(new Set([2025, 2026, new Date().getFullYear()]))
    .sort((first, second) => first - second);

  assert.equal(summary.employeeId, "employee-a");
  assert.equal(summary.employeeName, "Employee A");
  assert.deepEqual(summary.years.map((year) => year.year), expectedYears);

  const year2025 = summary.years.find((year) => year.year === 2025);
  const year2026 = summary.years.find((year) => year.year === 2026);

  assert.ok(year2025);
  assert.ok(year2026);
  assert.equal(year2025.vacation.used, 3);
  assert.equal(year2025.vacation.pending, 0);
  assert.equal(year2025.byType.Feiertagsausgleich.pending, 1);

  assert.equal(year2026.vacation.allocated, 28);
  assert.equal(year2026.vacation.used, 2);
  assert.equal(year2026.vacation.pending, 1);
  assert.equal(year2026.vacation.remaining, 25);
  assert.equal(year2026.byType.Krankheit.approved, 3);
  assert.equal(year2026.byType.Krankheit.pending, 0);
  assert.equal(year2026.byType.Feiertagsausgleich.pending, 2);
  assert.equal(year2026.byType["Bezahlter Urlaub"], undefined);
});
