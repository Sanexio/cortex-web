import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { mapOrdioPayload, parseArgs, run, snapshotSummary, validateSnapshot } from "./ordio-delta.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(here, "fixtures/ordio-delta.fixture.json");
const htmlFixturePath = join(here, "fixtures/work-hours.fixture.html");

test("parseArgs defaults to dry-run fixture mode without credentials", () => {
  const options = parseArgs([]);
  assert.equal(options.dryRun, true);
  assert.match(options.fixture, /ordio-delta\.fixture\.json$/);
  assert.equal(options.live, false);
});

test("mapOrdioPayload creates import snapshot shape expected by db import", () => {
  const snapshot = mapOrdioPayload({
    sourceSystem: "ordio",
    capturedAt: "2026-06-05T10:00:00.000Z",
    employees: [{ id: "e1", displayName: "Fixture Person", roleTitle: "MFA" }],
    shifts: [{ id: "s1", date: "2026-05-25", startTime: "08:00", endTime: "12:00", assignments: ["e1"] }],
    timeEntries: [{ id: "t1", employeeId: "e1", date: "2026-05-25", startTime: "08:01", endTime: "12:02" }],
    absences: [{ id: "a1", employeeId: "e1", startDate: "2026-05-26", endDate: "2026-05-26", type: "Urlaub" }]
  }, { from: "2026-05-25", to: "2026-06-05" });

  assert.equal(validateSnapshot(snapshot).ok, true);
  assert.deepEqual(snapshotSummary(snapshot).counts, {
    locations: 0,
    workAreas: 0,
    employees: 1,
    shifts: 1,
    timeEntries: 1,
    absences: 1,
    unresolvedEmployees: 0,
    unresolvedAreas: 0,
    unresolvedLocations: 0
  });
  assert.equal(snapshot.timeEntries[0].employeeSourceId, "e1");
  assert.equal(snapshot.periodStart, "2026-05-25");
});

test("run writes snapshot only outside dry-run", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "ordio-delta-"));
  const out = join(tempDir, "import-snapshot.json");
  try {
    const dry = await run(parseArgs(["--dry-run", "--out", out]));
    assert.equal(dry.wrote, null);

    const written = await run(parseArgs(["--fixture", fixturePath, "--out", out]));
    assert.equal(written.wrote, out);
    const snapshot = JSON.parse(await readFile(out, "utf8"));
    assert.equal(snapshot.sourceSystem, "ordio");
    assert.ok(snapshot.employees.length > 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("run accepts anonymized work-hours HTML fixture", async () => {
  const result = await run(parseArgs(["--dry-run", "--fixture", htmlFixturePath, "--from", "2026-05-25", "--to", "2026-06-05"]));
  assert.equal(result.summary.counts.timeEntries, 2);
  assert.equal(result.summary.counts.employees, 2);
  assert.equal(result.wrote, null);
});
