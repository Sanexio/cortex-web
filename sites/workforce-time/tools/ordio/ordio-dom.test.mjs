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
    existingEmployees: [{ display_name: "Ben Beta", source_id: "employee-number-102" }]
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

test("location resolver matches und/ampersand spelling variants", () => {
  const resolver = buildNameResolver({ knownNames: ["Praxis Beispiel und Partner"] });

  assert.deepEqual(resolver.resolve("Praxis Beispiel & Partner"), {
    name: "Praxis Beispiel und Partner",
    resolved: true,
    raw: "Praxis Beispiel & Partner"
  });
});

test("absences DOM rows map through employee reconciliation", async () => {
  const html = await readFile(join(here, "fixtures/work-hours.fixture.html"), "utf8");
  const employeeRows = parseEmployeesHtml(html);
  const absenceRows = parseAbsencesHtml(html);
  const mapped = mapAbsenceRows(absenceRows, { capturedAt: "2026-06-05T12:00:00.000Z", employeeRows });

  assert.equal(absenceRows[0].rowEmployee, "Ada Alpha");
  assert.notEqual(absenceRows[0].employeeName, "Tag");
  assert.equal(mapped.absences.length, 1);
  assert.equal(mapped.absences[0].employeeSourceId, "employee-number-101");
  assert.equal(mapped.absences[0].employeeName, "Ada Alpha");
  assert.equal(mapped.absences[0].startsOn, "2026-05-27");
  assert.equal(mapped.absences[0].endsOn, "2026-05-28");
  assert.equal(mapped.absences[0].sourceId, "absence-bar-fixture-1");
  assert.equal(mapped.absences[0].type, "Urlaub");
});

test("absences resolve employees from snake_case existing seed records", () => {
  const rows = [{
    __rowId: "absence-bar-fixture-2",
    ariaLabel: "Krankheit\n03.06.2026 - 03.06.2026\n1 Tag",
    rowEmployee: "Ada Alpha",
    rawText: "Krankheit"
  }];
  const mapped = mapAbsenceRows(rows, {
    capturedAt: "2026-06-05T12:00:00.000Z",
    from: "2026-06-01",
    to: "2026-06-05",
    existingEmployees: [{ display_name: "Ada Alpha", source_id: "employee-number-101" }]
  });

  assert.equal(mapped.stats.afterDateFilter, 1);
  assert.equal(mapped.stats.afterResolve, 1);
  assert.equal(mapped.absences[0].employeeSourceId, "employee-number-101");
  assert.equal(mapped.absences[0].employeeName, "Ada Alpha");
  assert.equal(mapped.unresolvedEmployees.length, 0);
});

test("absence duration labels are not treated as employees", () => {
  const mapped = mapAbsenceRows([{
    __rowId: "absence-bar-duration-only",
    ariaLabel: "Krankheit\n03.06.2026 - 03.06.2026\n1 Tag",
    rawText: "Krankheit"
  }], {
    capturedAt: "2026-06-05T12:00:00.000Z",
    existingEmployees: [{ display_name: "Ada Alpha", source_id: "employee-number-101" }]
  });

  assert.equal(mapped.stats.afterDateFilter, 0);
  assert.equal(mapped.absences.length, 0);
  assert.equal(mapped.unresolvedEmployees.length, 0);
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

test("plan mapper does not import resolvable employee names as work areas", () => {
  const mapped = mapPlanRows([{
    sourceId: "shift-fixture-employee-area",
    date: "2026-05-28",
    startTime: "09:00",
    endTime: "12:00",
    area: "Ada Alpha",
    location: "Praxis Beispiel & Partner",
    assignmentNames: []
  }], {
    capturedAt: "2026-06-05T12:00:00.000Z",
    existingEmployees: [{ display_name: "Ada Alpha", source_id: "employee-number-101" }],
    canonicalLocations: ["Praxis Beispiel und Partner"],
    defaultWorkArea: "Ohne Bereich"
  });

  assert.equal(mapped.stats.afterResolve, 1);
  assert.equal(mapped.shifts[0].assignmentSourceIds[0], "employee-number-101");
  assert.equal(mapped.shifts[0].area, "Ohne Bereich");
  assert.equal(mapped.unresolvedAreas.length, 0);
  assert.equal(mapped.shifts[0].location, "Praxis Beispiel und Partner");
  assert.equal(mapped.unresolvedLocations.length, 0);
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
