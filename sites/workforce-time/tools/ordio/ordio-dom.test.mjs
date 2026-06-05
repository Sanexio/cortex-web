import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { mapWorkHoursRows, parseWorkHoursHtml } from "./ordio-dom.mjs";
import { mapOrdioPayload, snapshotSummary, validateSnapshot } from "./ordio-delta.mjs";

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
  const mapped = mapWorkHoursRows(rows, { capturedAt: "2026-06-05T12:00:00.000Z" });

  assert.equal(mapped.employees.length, 2);
  assert.equal(mapped.timeEntries.length, 2);
  assert.equal(mapped.timeEntries[0].sourceId, "row-alpha-2026-05-25");
  assert.match(mapped.timeEntries[1].sourceId, /^time_[a-f0-9]{16}$/);
  assert.equal(mapped.timeEntries[0].employeeName, "Ada Alpha");
  assert.equal(mapped.timeEntries[0].startDate, "2026-05-25");
  assert.equal(mapped.timeEntries[0].unpaidBreakMinutes, 15);
  assert.equal(mapped.timeEntries[1].unpaidBreakMinutes, 30);
  assert.equal(mapped.timeEntries[1].note, "Ordio-Verstoss: Pausenregel");
});

test("HTML fixture can flow through existing ordio snapshot mapper", async () => {
  const html = await readFile(join(here, "fixtures/work-hours.fixture.html"), "utf8");
  const rows = parseWorkHoursHtml(html);
  const snapshot = mapOrdioPayload(
    {
      sourceSystem: "ordio",
      capturedAt: "2026-06-05T12:00:00.000Z",
      workHoursRows: rows
    },
    { from: "2026-05-25", to: "2026-06-05" }
  );

  assert.equal(validateSnapshot(snapshot).ok, true);
  assert.deepEqual(snapshotSummary(snapshot).counts, {
    locations: 2,
    workAreas: 2,
    employees: 2,
    shifts: 0,
    timeEntries: 2,
    absences: 0
  });
});
