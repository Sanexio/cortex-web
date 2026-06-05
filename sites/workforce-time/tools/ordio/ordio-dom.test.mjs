import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildEmployeeResolver,
  buildNameResolver,
  mapAbsenceRows,
  mapPlanRows,
  mapWorkHoursRows,
  parseAbsencesHtml,
  parseEmployeesHtml,
  parsePlanHtml,
  parseWorkHoursHtml
} from "./ordio-dom.mjs";
import { isoWeeksInRange, mapOrdioPayload, snapshotSummary, validateSnapshot } from "./ordio-delta.mjs";

const here = dirname(fileURLToPath(import.meta.url));

test("parseWorkHoursHtml extracts synthetic Ordio table rows without real data", async () => {
  const html = await readFile(join(here, "fixtures/work-hours.fixture.html"), "utf8");
  const rows = parseWorkHoursHtml(html);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].name, "Alpha, Ada");
  assert.equal(rows[0].datum, "25.05.2026");
  assert.equal(rows[0].status, "Genehmigt");
});

test("work-hours DOM rows map to snapshot time_entries with stable source ids", async () => {
  const html = await readFile(join(here, "fixtures/work-hours.fixture.html"), "utf8");
  const rows = parseWorkHoursHtml(html);
  const employeeRows = parseEmployeesHtml(html);
  const mapped = mapWorkHoursRows(rows, { capturedAt: "2026-06-05T12:00:00.000Z", employeeRows });

  assert.equal(mapped.employees.length, 2);
  assert.equal(mapped.timeEntries.length, 2);
  assert.equal(mapped.timeEntries[0].sourceId, "row-alpha-2026-05-25");
  assert.equal(mapped.timeEntries[0].employeeSourceId, "employee-number-101");
  assert.equal(mapped.timeEntries[1].employeeSourceId, "employee-number-102");
  assert.match(mapped.timeEntries[1].sourceId, /^time_[a-f0-9]{16}$/);
  assert.equal(mapped.timeEntries[0].employeeName, "Ada Alpha");
  assert.equal(mapped.timeEntries[0].startDate, "2026-05-25");
  assert.equal(mapped.timeEntries[0].unpaidBreakMinutes, 15);
  assert.equal(mapped.timeEntries[1].unpaidBreakMinutes, 30);
  assert.equal(mapped.timeEntries[1].note, "Ordio-Verstoss: Pausenregel");
});

test("unresolved employees are marked without creating synthetic employee records", async () => {
  const html = await readFile(join(here, "fixtures/work-hours.fixture.html"), "utf8");
  const rows = parseWorkHoursHtml(html);
  const mapped = mapWorkHoursRows(rows, { capturedAt: "2026-06-05T12:00:00.000Z" });

  assert.equal(mapped.employees.length, 0);
  assert.equal(mapped.unresolvedEmployees.length, 2);
  assert.equal(mapped.timeEntries[0].employeeSourceId, null);
  assert.match(mapped.timeEntries[0].note, /UNRESOLVED_EMPLOYEE/);
});

test("employee resolver prefers employee number and falls back to name match", () => {
  const resolver = buildEmployeeResolver({
    employeeRows: [{ displayName: "Ada Alpha", employeeNumber: "101", sourceId: "employee-number-101" }],
    existingEmployees: [{ displayName: "Ben Beta", sourceId: "employee-number-102" }]
  });

  assert.equal(resolver.resolve({ name: "Alpha, Ada", personalnummer: "101", __cells: [] }).sourceId, "employee-number-101");
  assert.equal(resolver.resolve({ name: "Beta, Ben", __cells: [] }).sourceId, "employee-number-102");
  assert.equal(resolver.resolve({ name: "Ada von Alpha", __cells: [] }).sourceId, "employee-number-101");
  assert.equal(resolver.resolve({ name: "Gamma, Gia", __cells: [] }).match, "unresolved");
});

test("area and location resolver maps aliases to canonical names", async () => {
  const html = await readFile(join(here, "fixtures/work-hours.fixture.html"), "utf8");
  const mapped = mapWorkHoursRows(parseWorkHoursHtml(html), {
    capturedAt: "2026-06-05T12:00:00.000Z",
    employeeRows: parseEmployeesHtml(html),
    canonicalWorkAreas: ["Rezeption", "Labor"],
    workAreaAliases: { Rezeption: ["Empfang"] },
    canonicalLocations: ["Standort Alpha"],
    locationAliases: { "Standort Alpha": ["Standort A"] },
    defaultLocation: "Standort Alpha"
  });

  assert.equal(mapped.timeEntries[0].area, "Rezeption");
  assert.equal(mapped.timeEntries[0].location, "Standort Alpha");
  assert.equal(mapped.unresolvedAreas.length, 0);
  assert.equal(mapped.unresolvedLocations.length, 1);
  assert.equal(mapped.unresolvedLocations[0].name, "Standort B");

  const resolver = buildNameResolver({ knownNames: ["Rezeption"], aliases: { Rezeption: ["Empfang"] } });
  assert.deepEqual(resolver.resolve("Empfang"), { name: "Rezeption", resolved: true, raw: "Empfang" });
});

test("absences DOM rows map through employee reconciliation", async () => {
  const html = await readFile(join(here, "fixtures/work-hours.fixture.html"), "utf8");
  const employeeRows = parseEmployeesHtml(html);
  const mapped = mapAbsenceRows(parseAbsencesHtml(html), { capturedAt: "2026-06-05T12:00:00.000Z", employeeRows });

  assert.equal(mapped.absences.length, 1);
  assert.equal(mapped.absences[0].employeeSourceId, "employee-number-101");
  assert.equal(mapped.absences[0].startsOn, "2026-05-27");
  assert.equal(mapped.absences[0].endsOn, "2026-05-28");
  assert.equal(mapped.absences[0].sourceId, "absence-bar-fixture-1");
  assert.equal(mapped.absences[0].type, "Urlaub");
});

test("plan DOM rows map to shifts with assignments", async () => {
  const html = await readFile(join(here, "fixtures/work-hours.fixture.html"), "utf8");
  const employeeRows = parseEmployeesHtml(html);
  const mapped = mapPlanRows(parsePlanHtml(html), { capturedAt: "2026-06-05T12:00:00.000Z", employeeRows });

  assert.equal(mapped.shifts.length, 1);
  assert.equal(mapped.shifts[0].assignmentSourceIds[0], "employee-number-101");
  assert.equal(mapped.shifts[0].sourceId, "shift-fixture-1");
  assert.equal(mapped.shifts[0].startDate, "2026-05-28");
  assert.equal(mapped.shifts[0].area, "Empfang");
});

test("HTML fixture can flow through existing ordio snapshot mapper", async () => {
  const html = await readFile(join(here, "fixtures/work-hours.fixture.html"), "utf8");
  const rows = parseWorkHoursHtml(html);
  const snapshot = mapOrdioPayload(
    {
      sourceSystem: "ordio",
      capturedAt: "2026-06-05T12:00:00.000Z",
      employeeRows: parseEmployeesHtml(html),
      workHoursRows: rows,
      absenceRows: parseAbsencesHtml(html),
      planRows: parsePlanHtml(html)
    },
    { from: "2026-05-25", to: "2026-06-05" }
  );

  assert.equal(validateSnapshot(snapshot).ok, true);
  assert.deepEqual(snapshotSummary(snapshot).counts, {
    locations: 2,
    workAreas: 2,
    employees: 2,
    shifts: 1,
    timeEntries: 2,
    absences: 1,
    unresolvedEmployees: 0,
    unresolvedAreas: 0,
    unresolvedLocations: 0
  });
});

test("isoWeeksInRange covers every week touched by from/to", () => {
  assert.deepEqual(isoWeeksInRange("2026-05-25", "2026-06-05"), [
    { label: "2026-W22", start: "2026-05-25", end: "2026-05-31" },
    { label: "2026-W23", start: "2026-06-01", end: "2026-06-05" }
  ]);
  assert.deepEqual(isoWeeksInRange("2026-06-05", "2026-06-05"), [
    { label: "2026-W23", start: "2026-06-05", end: "2026-06-05" }
  ]);
});
