import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildEmployeeResolver,
  buildNameResolver,
  dateFromPlanCellTestid,
  deduplicateShiftCardElements,
  extractPlanRowsFromPage,
  mapAbsenceRows,
  mapPlanRows,
  mapWorkHoursRows,
  parseAbsencePayloadHtml,
  parseAbsencesByRowHtml,
  parseAbsencesHtml,
  parseEmployeesHtml,
  parsePlanHtml,
  parseWorkHoursHtml,
  resolvePlanSwimlaneAreas
} from "./legacy-dom.mjs";
import { isoWeeksInRange, mapImportPayload, snapshotSummary, validateSnapshot } from "./legacy-delta.mjs";

const here = dirname(fileURLToPath(import.meta.url));

function testElement(attrs = {}, options = {}) {
  return {
    parentElement: options.parentElement ?? null,
    tagName: options.tagName ?? "DIV",
    innerText: options.innerText ?? "",
    textContent: options.textContent ?? options.innerText ?? "",
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(attrs, name) ? attrs[name] : null;
    },
    getBoundingClientRect() {
      return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };
    },
    closest() {
      return null;
    }
  };
}

function fakePlanPage(elements) {
  return {
    async evaluate(callback, arg) {
      const previousDocument = globalThis.document;
      globalThis.document = {
        querySelectorAll(selector) {
          if (selector === "[data-testid], [data-plan-cell-key]") {
            return elements.filter((element) =>
              element.getAttribute("data-testid") || element.getAttribute("data-plan-cell-key")
            );
          }
          if (selector === '[data-testid^="shift-card-"], [data-shift-id]') {
            return elements.filter((element) =>
              String(element.getAttribute("data-testid") ?? "").startsWith("shift-card-")
              || element.getAttribute("data-shift-id")
            );
          }
          if (selector === "[role='columnheader'], [data-date], [data-testid^='plan-day-header-']") {
            return [];
          }
          return [];
        }
      };
      try {
        return callback(arg);
      } finally {
        if (previousDocument === undefined) delete globalThis.document;
        else globalThis.document = previousDocument;
      }
    }
  };
}

test("dateFromPlanCellTestid extracts dates from plan cell test ids only", () => {
  assert.equal(dateFromPlanCellTestid("plan-cell-container-alpha-2026-07-20"), "2026-07-20");
  assert.equal(dateFromPlanCellTestid("plan-cell-content-container-alpha-2026-07-20"), "2026-07-20");
  assert.equal(dateFromPlanCellTestid("plan-day-header-2026-07-20"), "");
  assert.equal(dateFromPlanCellTestid("garbage input"), "");
});

test("deduplicateShiftCardElements prefers sourced outer cards and preserves source-only cards", () => {
  const sourcedOuter = testElement({
    "data-testid": "shift-card-alpha",
    "data-shift-id": "shift-source-alpha"
  });
  const nestedWithoutSource = testElement({ "data-testid": "shift-card-alpha" }, { parentElement: sourcedOuter });
  const testidOnly = testElement({ "data-testid": "shift-card-beta" });
  const sourceOnly = testElement({ "data-shift-id": "shift-source-gamma" });

  const deduped = deduplicateShiftCardElements([
    nestedWithoutSource,
    sourcedOuter,
    testidOnly,
    sourceOnly
  ]);

  assert.equal(deduped.length, 3);
  assert.equal(deduped[0], sourcedOuter);
  assert.equal(deduped[1], testidOnly);
  assert.equal(deduped[2], sourceOnly);
});

test("extractPlanRowsFromPage deduplicates nested shift-card matches without dropping fallback cards", async () => {
  const outer = testElement({
    "data-testid": "shift-card-alpha",
    "data-shift-id": "shift-source-alpha",
    "data-date": "2026-06-15",
    "data-start": "08:00",
    "data-end": "12:00",
    "data-area": "Desk Alpha",
    "data-location": "Location One",
    "data-employee": "Employee Alpha"
  }, { innerText: "08:00 12:00 Desk Alpha Location One Employee Alpha" });
  const nested = testElement({
    "data-testid": "shift-card-alpha"
  }, { parentElement: outer, innerText: "08:00 12:00" });
  const testidOnly = testElement({
    "data-testid": "shift-card-beta",
    "data-date": "2026-06-16",
    "data-start": "09:00",
    "data-end": "11:00",
    "data-area": "Desk Beta",
    "data-location": "Location One"
  }, { innerText: "09:00 11:00 Desk Beta Location One" });
  const sourceOnly = testElement({
    "data-shift-id": "shift-source-gamma",
    "data-date": "2026-06-17",
    "data-start": "10:00",
    "data-end": "14:00",
    "data-area": "Desk Gamma",
    "data-location": "Location One"
  }, { innerText: "10:00 14:00 Desk Gamma Location One" });

  const rows = await extractPlanRowsFromPage(fakePlanPage([outer, nested, testidOnly, sourceOnly]));

  assert.equal(rows.length, 3);
  assert.equal(rows[0].__rowId, "shift-card-alpha");
  assert.equal(rows[0].sourceId, "shift-source-alpha");
  assert.equal(rows[0].date, "2026-06-15");
  assert.equal(rows[1].__rowId, "shift-card-beta");
  assert.equal(rows[1].sourceId, "");
  assert.equal(rows[2].__rowId, "");
  assert.equal(rows[2].sourceId, "shift-source-gamma");
});

test("plan swimlane resolver maps multiple swimlanes in document order", () => {
  const resolved = resolvePlanSwimlaneAreas({
    elements: [
      { testid: "plan-area-header-area-alpha", text: "Area Alpha Gruppieren nach Zeit..." },
      { testid: "plan-cell-container-alpha-2026-07-20" },
      { testid: "plan-cell-container-alpha-2026-07-21" },
      { testid: "plan-area-header-area-beta", text: "Area Beta" },
      { testid: "plan-cell-container-beta-2026-07-20" },
      { testid: "plan-cell-container-beta-2026-07-21" }
    ],
    cards: [
      { sourceId: "shift-alpha", ancestorTestids: ["shift-card-alpha", "plan-cell-container-alpha-2026-07-20"] },
      { sourceId: "shift-beta", ancestorTestids: ["shift-card-beta", "plan-cell-container-beta-2026-07-21"] }
    ]
  });

  assert.deepEqual(resolved.areaByContainer, {
    "container-alpha": "Area Alpha",
    "container-beta": "Area Beta"
  });
  assert.equal(resolved.cards[0].areaFromSwimlane, "Area Alpha");
  assert.equal(resolved.cards[0].dateFromCell, "2026-07-20");
  assert.equal(resolved.cards[0].areaSource, "swimlane");
  assert.equal(resolved.cards[1].areaFromSwimlane, "Area Beta");
});

test("plan swimlane resolver marks cards without matching container as none", () => {
  const resolved = resolvePlanSwimlaneAreas({
    elements: [
      { testid: "plan-area-header-area-alpha", text: "Area Alpha" },
      { testid: "plan-cell-container-alpha-2026-07-20" }
    ],
    cards: [
      { sourceId: "shift-without-cell", ancestorTestids: ["shift-card-without-cell"] }
    ]
  });

  assert.equal(resolved.cards[0].planCellContainerId, "");
  assert.equal(resolved.cards[0].areaFromSwimlane, "");
  assert.equal(resolved.cards[0].areaSource, "none");
});

test("plan swimlane resolver supports plan-cell-content variant", () => {
  const resolved = resolvePlanSwimlaneAreas({
    elements: [
      { testid: "plan-area-header-area-gamma", text: "Area Gamma" },
      { testid: "plan-cell-content-container-gamma-2026-07-22" }
    ],
    cards: [
      { sourceId: "shift-gamma", ancestorTestids: ["shift-card-gamma", "plan-cell-content-container-gamma-2026-07-22"] }
    ]
  });

  assert.equal(resolved.areaByContainer["container-gamma"], "Area Gamma");
  assert.equal(resolved.cards[0].planCellContainerId, "container-gamma");
  assert.equal(resolved.cards[0].dateFromCell, "2026-07-22");
  assert.equal(resolved.cards[0].areaSource, "swimlane");
});

test("plan swimlane resolver ignores shift container attribute as row id", () => {
  const resolved = resolvePlanSwimlaneAreas({
    elements: [
      { testid: "plan-area-header-area-alpha", text: "Area Alpha" },
      { testid: "plan-cell-container-alpha-2026-07-20" },
      { testid: "plan-area-header-area-beta", text: "Area Beta" },
      { testid: "plan-cell-container-beta-2026-07-20" }
    ],
    cards: [
      {
        sourceId: "shift-alpha",
        dataShiftContainerId: "container-beta",
        shiftContainerId: "container-beta",
        ancestorTestids: ["shift-card-alpha", "plan-cell-container-alpha-2026-07-20"]
      }
    ]
  });

  assert.equal(resolved.cards[0].planCellContainerId, "container-alpha");
  assert.equal(resolved.cards[0].areaFromSwimlane, "Area Alpha");
  assert.notEqual(resolved.cards[0].areaFromSwimlane, "Area Beta");
});

test("parseWorkHoursHtml extracts synthetic Legacy-Import table rows without real data", async () => {
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
  assert.equal(mapped.timeEntries[1].note, "Plan-Verstoss: Pausenregel");
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
  assert.deepEqual(resolver.resolve("Empfang"), { name: "Rezeption", resolved: true, raw: "Empfang", areaMatch: "alias" });
});

test("location resolver matches und/ampersand spelling variants", () => {
  const resolver = buildNameResolver({ knownNames: ["Praxis Beispiel und Partner"] });

  assert.deepEqual(resolver.resolve("Praxis Beispiel & Partner"), {
    name: "Praxis Beispiel und Partner",
    resolved: true,
    raw: "Praxis Beispiel & Partner",
    areaMatch: "exact"
  });
});

test("work-hours mapper resolves work area via token override and preserves source metadata", () => {
  const mapped = mapWorkHoursRows([{
    __rowId: "row-area-override",
    name: "Alpha, Ada",
    datum: "01.06.2026",
    start: "08:00",
    ende: "12:00",
    arbeitszeit: "4:00",
    pause: "0",
    status: "Erfasst",
    bereich: "Shared counter duty",
    standort: "Location One"
  }], {
    capturedAt: "2026-06-05T12:00:00.000Z",
    employeeRows: [{ displayName: "Ada Alpha", employeeNumber: "101", sourceId: "employee-number-101" }],
    canonicalWorkAreas: ["Desk Beta"],
    workAreaOverrides: [{ match_tokens: ["shared", "counter"], canonical: "Desk Beta" }],
    practiceByWorkArea: { "Desk Beta": "Practice Alpha" },
    canonicalLocations: ["Location One"]
  });

  assert.equal(mapped.timeEntries[0].area, "Desk Beta");
  assert.equal(mapped.timeEntries[0].sourceArea, "Shared counter duty");
  assert.equal(mapped.timeEntries[0].areaMatch, "override");
  assert.equal(mapped.timeEntries[0].practice, "Practice Alpha");
  assert.equal(mapped.timeEntries[0].practiceMatch, "area");
  assert.equal(mapped.timeEntries[0].location, "Location One");
  assert.equal(mapped.timeEntries[0].sourceLocation, "Location One");
  assert.equal(mapped.timeEntries[0].locationMatch, "exact");
});

test("work-hours mapper resolves practice from fallback source area without changing work area", () => {
  const mapped = mapWorkHoursRows([{
    __rowId: "row-practice-source",
    name: "Alpha, Ada",
    datum: "01.06.2026",
    start: "08:00",
    ende: "12:00",
    arbeitszeit: "4:00",
    pause: "0",
    status: "Erfasst",
    bereich: "Practice Source",
    standort: "Location One"
  }], {
    capturedAt: "2026-06-05T12:00:00.000Z",
    employeeRows: [{ displayName: "Ada Alpha", employeeNumber: "101", sourceId: "employee-number-101" }],
    canonicalWorkAreas: ["Desk Known"],
    defaultWorkArea: "No Area",
    canonicalPractices: ["Practice Source"],
    practiceByWorkArea: {},
    canonicalLocations: ["Location One"]
  });

  assert.equal(mapped.timeEntries[0].area, "No Area");
  assert.equal(mapped.timeEntries[0].sourceArea, "Practice Source");
  assert.equal(mapped.timeEntries[0].areaMatch, "fallback");
  assert.equal(mapped.timeEntries[0].practice, "Practice Source");
  assert.equal(mapped.timeEntries[0].practiceMatch, "source");
});

test("work-hours mapper keeps source area when work area falls back", () => {
  const mapped = mapWorkHoursRows([{
    __rowId: "row-area-fallback",
    name: "Alpha, Ada",
    datum: "01.06.2026",
    start: "08:00",
    ende: "12:00",
    arbeitszeit: "4:00",
    pause: "0",
    status: "Erfasst",
    bereich: "Unlisted station",
    standort: "Location One"
  }], {
    capturedAt: "2026-06-05T12:00:00.000Z",
    employeeRows: [{ displayName: "Ada Alpha", employeeNumber: "101", sourceId: "employee-number-101" }],
    canonicalWorkAreas: ["Desk Known"],
    defaultWorkArea: "No Area",
    canonicalLocations: ["Location One"]
  });

  assert.equal(mapped.timeEntries[0].area, "No Area");
  assert.equal(mapped.timeEntries[0].sourceArea, "Unlisted station");
  assert.equal(mapped.timeEntries[0].areaMatch, "fallback");
  assert.equal(mapped.timeEntries[0].practice, null);
  assert.equal(mapped.timeEntries[0].practiceMatch, null);
  assert.equal(mapped.unresolvedAreas[0].name, "Unlisted station");
});

test("plan mapper does not guess practice from unknown fallback source area", () => {
  const mapped = mapPlanRows([{
    sourceId: "shift-unknown-practice-source",
    date: "2026-06-02",
    startTime: "09:00",
    endTime: "13:00",
    area: "Unknown station",
    location: "Location One",
    assignmentNames: []
  }], {
    capturedAt: "2026-06-05T12:00:00.000Z",
    canonicalWorkAreas: ["Desk Known"],
    defaultWorkArea: "No Area",
    canonicalPractices: ["Practice Source"],
    canonicalLocations: ["Location One"],
    practiceByWorkArea: {}
  });

  assert.equal(mapped.shifts[0].area, "No Area");
  assert.equal(mapped.shifts[0].sourceArea, "Unknown station");
  assert.equal(mapped.shifts[0].areaMatch, "fallback");
  assert.equal(mapped.shifts[0].practice, null);
  assert.equal(mapped.shifts[0].practiceMatch, null);
});

test("plan mapper leaves practice null when canonical area is unassigned", () => {
  const mapped = mapPlanRows([{
    sourceId: "shift-unassigned-practice",
    date: "2026-06-02",
    startTime: "09:00",
    endTime: "13:00",
    area: "Desk Known",
    location: "Location One",
    assignmentNames: []
  }], {
    capturedAt: "2026-06-05T12:00:00.000Z",
    canonicalWorkAreas: ["Desk Known"],
    canonicalLocations: ["Location One"],
    practiceByWorkArea: {}
  });

  assert.equal(mapped.shifts[0].area, "Desk Known");
  assert.equal(mapped.shifts[0].sourceArea, "Desk Known");
  assert.equal(mapped.shifts[0].areaMatch, "exact");
  assert.equal(mapped.shifts[0].practice, null);
  assert.equal(mapped.shifts[0].practiceMatch, null);
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

test("embedded absences payload maps bars through employee group and api map", () => {
  const html = `<!doctype html>
    <script type="application/json" id="legacy-import-fixture">
      {
        "employees": [
          {
            "id": "api-employee-101",
            "rows": [
              {
                "bars": [
                  {
                    "id": "1576057",
                    "label": "Krankheit",
                    "startDayIndex": 146,
                    "endDayIndex": 146,
                    "tooltip": "Krankheit\\n03.06.2026 - 03.06.2026\\n1 Tag\\nGenehmigt",
                    "isPending": false,
                    "lane": 0
                  }
                ]
              }
            ]
          }
        ]
      }
    </script>`;
  const rows = parseAbsencePayloadHtml(html, {
    employees: [{ id: "api-employee-101", label: "Ada Alpha" }]
  });
  const mapped = mapAbsenceRows(rows, {
    capturedAt: "2026-06-06T12:00:00.000Z",
    from: "2026-06-01",
    to: "2026-06-05",
    existingEmployees: [{ display_name: "Ada Alpha", source_id: "employee-number-101" }]
  });

  assert.equal(rows.length, 1);
  assert.equal(rows[0].sourceId, "absence-bar-1576057");
  assert.equal(rows[0].rowEmployee, "Ada Alpha");
  assert.equal(rows[0].type, "Krankheit");
  assert.equal(rows[0].status, "Genehmigt");
  assert.equal(mapped.stats.afterDateFilter, 1);
  assert.equal(mapped.stats.afterResolve, 1);
  assert.equal(mapped.absences[0].sourceId, "absence-bar-1576057");
  assert.equal(mapped.absences[0].employeeSourceId, "employee-number-101");
});

test("embedded absences payload treats employee label as name, not type", () => {
  const html = `<!doctype html>
    <script type="application/json">
      {
        "employees": [
          {
            "id": "api-employee-101",
            "bars": [
              {
                "id": "1576058",
                "label": "Ada Alpha",
                "startDayIndex": 147,
                "endDayIndex": 147,
                "tooltip": "Krankheit\\n04.06.2026 - 04.06.2026\\n1 Tag\\nBeantragt",
                "isPending": true,
                "lane": 0
              }
            ]
          }
        ]
      }
    </script>`;
  const rows = parseAbsencePayloadHtml(html, {
    employees: [{ id: "api-employee-101", label: "Ada Alpha" }]
  });

  assert.equal(rows[0].employeeName, "Ada Alpha");
  assert.equal(rows[0].type, "Krankheit");
  assert.equal(rows[0].status, "Beantragt");
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

  assert.equal(mapped.stats.afterDateFilter, 1);
  assert.equal(mapped.stats.afterResolve, 0);
  assert.equal(mapped.stats.droppedWorkHoursRows, 1);
  assert.equal(mapped.stats.mapped, 0);
  assert.equal(mapped.shifts.length, 0);
  assert.equal(mapped.workAreas.length, 0);
  assert.equal(mapped.unresolvedAreas.length, 0);
  assert.equal(mapped.unresolvedLocations.length, 0);
});

test("plan mapper keeps empty work area rows on the default work area", () => {
  const mapped = mapPlanRows([{
    sourceId: "shift-fixture-empty-area",
    date: "2026-05-28",
    startTime: "09:00",
    endTime: "12:00",
    area: "",
    location: "Praxis Beispiel & Partner",
    assignmentNames: ["Ada Alpha"]
  }], {
    capturedAt: "2026-06-05T12:00:00.000Z",
    existingEmployees: [{ display_name: "Ada Alpha", source_id: "employee-number-101" }],
    canonicalLocations: ["Praxis Beispiel und Partner"],
    defaultWorkArea: "Ohne Bereich"
  });

  assert.equal(mapped.stats.afterDateFilter, 1);
  assert.equal(mapped.stats.afterResolve, 1);
  assert.equal(mapped.stats.droppedWorkHoursRows, 0);
  assert.equal(mapped.stats.mapped, 1);
  assert.equal(mapped.shifts.length, 1);
  assert.equal(mapped.shifts[0].assignmentSourceIds[0], "employee-number-101");
  assert.equal(mapped.shifts[0].area, "Ohne Bereich");
  assert.equal(mapped.shifts[0].sourceArea, "Ohne Bereich");
  assert.equal(mapped.shifts[0].location, "Praxis Beispiel und Partner");
  assert.equal(mapped.unresolvedAreas.length, 0);
  assert.equal(mapped.unresolvedLocations.length, 0);
});

test("plan mapper keeps rows beyond import to date when planTo covers them", () => {
  const row = {
    sourceId: "shift-plan-horizon",
    date: "2026-07-27",
    startTime: "08:00",
    endTime: "12:00",
    area: "Empfang",
    location: "Standort Alpha",
    employeeName: "Alpha, Beta"
  };
  const baseOptions = {
    capturedAt: "2026-07-26T12:00:00.000Z",
    from: "2026-07-20",
    to: "2026-07-26",
    existingEmployees: [{ display_name: "Beta Alpha", source_id: "employee-beta-alpha" }]
  };

  const kept = mapPlanRows([row], { ...baseOptions, planTo: "2026-08-02" });
  const dropped = mapPlanRows([row], baseOptions);

  assert.equal(kept.shifts.length, 1);
  assert.equal(kept.shifts[0].startDate, "2026-07-27");
  assert.equal(dropped.shifts.length, 0);
});

test("HTML fixture can flow through existing legacy-import snapshot mapper", async () => {
  const html = await readFile(join(here, "fixtures/work-hours.fixture.html"), "utf8");
  const rows = parseWorkHoursHtml(html);
  const snapshot = mapImportPayload(
    {
      sourceSystem: "legacy_import",
      capturedAt: "2026-06-05T12:00:00.000Z",
      employeeRows: parseEmployeesHtml(html),
      workHoursRows: rows,
      absenceRows: parseAbsencesHtml(html),
      planRows: parsePlanHtml(html),
      reconciliation: {}
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

test("parseAbsencesByRowHtml attributes bars to the preceding employee row header", () => {
  const html = `<div><p class="text-x truncate font-medium">Ada Alpha</p></div>`
    + `<div data-testid="absence-bar-9001" aria-label="Krankheit&#10;03.06.2026 - 03.06.2026&#10;1 Tag&#10;Genehmigt"></div>`
    + `<div data-testid="absence-bar-9002" aria-label="Feiertagsausgleich&#10;04.06.2026 - 04.06.2026&#10;1 Tag&#10;Genehmigt"></div>`
    + `<div><p class="font-medium">Ben Beta</p></div>`
    + `<div data-testid="absence-bar-9003" aria-label="Bezahlter Urlaub&#10;05.06.2026 - 06.06.2026&#10;2 Tage&#10;Beantragt"></div>`;
  const rows = parseAbsencesByRowHtml(html);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].employeeName, "Ada Alpha");
  assert.equal(rows[0].type, "Krankheit");
  assert.equal(rows[1].employeeName, "Ada Alpha");
  assert.equal(rows[1].type, "Feiertagsausgleich");
  assert.equal(rows[2].employeeName, "Ben Beta");
  assert.equal(rows[2].startsOn, "2026-06-05");
  assert.equal(rows[2].endsOn, "2026-06-06");
});
