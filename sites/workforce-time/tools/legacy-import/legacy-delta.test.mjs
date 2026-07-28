import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  loadTenantReconciliationConfig,
  mapImportPayload,
  parseArgs,
  planCaptureEnd,
  run,
  snapshotSummary,
  validateSnapshot
} from "./legacy-delta.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(here, "fixtures/legacy-delta.fixture.json");
const htmlFixturePath = join(here, "fixtures/work-hours.fixture.html");

test("parseArgs defaults to dry-run fixture mode without credentials", () => {
  const options = parseArgs([]);
  assert.equal(options.dryRun, true);
  assert.match(options.fixture, /legacy-delta\.fixture\.json$/);
  assert.equal(options.live, false);
  assert.equal(options.planWeeksAhead, 6);
});

test("parseArgs defaults to full import mode", () => {
  const options = parseArgs([]);
  assert.equal(options.planOnly, false);
});

test("parseArgs accepts plan-only flag", () => {
  const options = parseArgs(["--plan-only"]);
  assert.equal(options.planOnly, true);
});

test("CLI rejects raw-out without live mode", () => {
  const result = spawnSync(process.execPath, [
    join(here, "legacy-delta.mjs"),
    "--raw-out",
    join(tmpdir(), "legacy-import-raw-out.json")
  ], { encoding: "utf8" });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Fehler: --raw-out ist nur zusammen mit --live sinnvoll\./);
});

test("parseArgs accepts plan scrape horizon", () => {
  const options = parseArgs(["--plan-weeks-ahead", "8"]);
  assert.equal(options.planWeeksAhead, 8);
});

test("parseArgs rejects invalid plan scrape horizon", () => {
  assert.throws(() => parseArgs(["--plan-weeks-ahead", "-1"]), /--plan-weeks-ahead braucht eine ganze Zahl >= 0/);
  assert.throws(() => parseArgs(["--plan-weeks-ahead", "abc"]), /--plan-weeks-ahead braucht eine ganze Zahl >= 0/);
});

test("planCaptureEnd extends to configured future horizon", () => {
  assert.equal(planCaptureEnd({ to: "2026-07-26", planWeeksAhead: 6 }, "2026-07-26"), "2026-09-06");
  assert.equal(planCaptureEnd({ to: "2026-12-31", planWeeksAhead: 6 }, "2026-07-26"), "2026-12-31");
  assert.equal(planCaptureEnd({ to: "2026-07-26", planWeeksAhead: 0 }, "2026-07-26"), "2026-07-26");
});

test("tenant reconciliation keeps category keys as practices and leaves as work areas", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "legacy-import-tenant-"));
  const previousTenantDir = process.env.CORTEX_TENANT_DIR;
  try {
    await writeFile(join(tempDir, "tenant.config.json"), JSON.stringify({
      workforce: {
        locations: ["Location One"],
        work_area_categories: {
          "Practice Alpha": ["Desk Alpha", "Desk Beta"],
          "Practice Beta": ["Desk Gamma"]
        },
        work_area_aliases: {
          "Desk Alpha": ["Front Counter"]
        },
        work_area_overrides: [
          { match_tokens: ["shared", "counter"], canonical: "Desk Beta" }
        ]
      }
    }));
    process.env.CORTEX_TENANT_DIR = tempDir;

    const config = loadTenantReconciliationConfig();

    assert.deepEqual(config.canonicalPractices, ["Practice Alpha", "Practice Beta"]);
    assert.deepEqual(config.canonicalWorkAreas, ["Desk Alpha", "Desk Beta", "Desk Gamma"]);
    assert.equal(config.practiceByWorkArea["Desk Alpha"], "Practice Alpha");
    assert.equal(config.practiceByWorkArea["Desk Gamma"], "Practice Beta");
    assert.deepEqual(config.workAreaAliases, { "Desk Alpha": ["Front Counter"] });
    assert.deepEqual(config.workAreaOverrides, [
      { match_tokens: ["shared", "counter"], canonical: "Desk Beta" }
    ]);
    assert.equal(config.canonicalWorkAreas.includes("Practice Alpha"), false);
  } finally {
    if (previousTenantDir === undefined) delete process.env.CORTEX_TENANT_DIR;
    else process.env.CORTEX_TENANT_DIR = previousTenantDir;
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("mapImportPayload creates import snapshot shape expected by db import", () => {
  const snapshot = mapImportPayload({
    sourceSystem: "legacy_import",
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

test("mapImportPayload adds practices and preserves override match metadata", () => {
  const snapshot = mapImportPayload({
    sourceSystem: "legacy_import",
    capturedAt: "2026-06-05T10:00:00.000Z",
    employeeRows: [{ displayName: "Ada Alpha", employeeNumber: "101", sourceId: "employee-number-101" }],
    workHoursRows: [{
      __rowId: "row-practice-override",
      name: "Alpha, Ada",
      datum: "01.06.2026",
      start: "08:00",
      ende: "12:00",
      arbeitszeit: "4:00",
      pause: "0",
      status: "Erfasst",
      bereich: "Shared counter duty",
      standort: "Location One"
    }],
    reconciliation: {
      canonicalLocations: ["Location One"],
      canonicalWorkAreas: ["Desk Beta", "Desk Gamma"],
      canonicalPractices: ["Practice Alpha"],
      practiceByWorkArea: { "Desk Beta": "Practice Alpha" },
      workAreaOverrides: [{ match_tokens: ["shared", "counter"], canonical: "Desk Beta" }]
    }
  }, { from: "2026-06-01", to: "2026-06-01" });

  assert.deepEqual(snapshot.practices.map((practice) => practice.name), ["Practice Alpha"]);
  assert.deepEqual(snapshot.unassignedPractices, ["Desk Gamma"]);
  assert.equal(snapshot.timeEntries[0].area, "Desk Beta");
  assert.equal(snapshot.timeEntries[0].sourceArea, "Shared counter duty");
  assert.equal(snapshot.timeEntries[0].areaMatch, "override");
  assert.equal(snapshot.timeEntries[0].practice, "Practice Alpha");
});

test("run writes snapshot only outside dry-run", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "legacy-import-delta-"));
  const out = join(tempDir, "import-snapshot.json");
  try {
    const dry = await run(parseArgs(["--dry-run", "--out", out]));
    assert.equal(dry.wrote, null);

    const written = await run(parseArgs(["--fixture", fixturePath, "--out", out]));
    assert.equal(written.wrote, out);
    const snapshot = JSON.parse(await readFile(out, "utf8"));
    assert.equal(snapshot.sourceSystem, "legacy_import");
    assert.ok(snapshot.employees.length > 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("raw live export can be reused as fixture without changing mapped snapshot", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "legacy-import-roundtrip-"));
  const rawOut = join(tempDir, "missing-parent", "raw-export.json");
  const liveOut = join(tempDir, "live-snapshot.json");
  const fixtureOut = join(tempDir, "fixture-snapshot.json");
  const rawCapture = {
    sourceSystem: "legacy_import",
    capturedAt: "2026-06-05T10:00:00.000Z",
    employeeRows: [{ displayName: "Ada Alpha", employeeNumber: "101", sourceId: "employee-number-101" }],
    workHoursRows: [{
      __rowId: "row-roundtrip-1",
      name: "Alpha, Ada",
      datum: "01.06.2026",
      start: "08:00",
      ende: "12:00",
      arbeitszeit: "4:00",
      pause: "0",
      status: "Erfasst",
      bereich: "Practice Source",
      standort: "Location One"
    }],
    reconciliation: {
      canonicalLocations: ["Location One"],
      canonicalWorkAreas: ["Desk Known"],
      canonicalPractices: ["Practice Source"],
      practiceByWorkArea: {},
      defaultWorkArea: "No Area"
    }
  };
  try {
    await run({
      ...parseArgs([
        "--live",
        "--raw-out", rawOut,
        "--out", liveOut,
        "--from", "2026-06-01",
        "--to", "2026-06-01"
      ]),
      captureLiveImport: async () => rawCapture
    });
    await run(parseArgs([
      "--fixture", rawOut,
      "--out", fixtureOut,
      "--from", "2026-06-01",
      "--to", "2026-06-01"
    ]));

    assert.deepEqual(JSON.parse(await readFile(rawOut, "utf8")), rawCapture);
    const liveSnapshot = JSON.parse(await readFile(liveOut, "utf8"));
    const fixtureSnapshot = JSON.parse(await readFile(fixtureOut, "utf8"));
    assert.deepEqual(fixtureSnapshot, liveSnapshot);
    assert.equal(fixtureSnapshot.timeEntries[0].practice, "Practice Source");
    assert.equal(fixtureSnapshot.timeEntries[0].practiceMatch, "source");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("JSON fixture ingestion deduplicates plan rows by row id and keeps fallback rows", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "legacy-import-plan-dedupe-"));
  const fixture = join(tempDir, "raw-plan-export.json");
  const out = join(tempDir, "snapshot.json");
  const rawExport = {
    sourceSystem: "legacy_import",
    capturedAt: "2026-06-05T10:00:00.000Z",
    employeeRows: [{ displayName: "Employee Alpha", sourceId: "employee-alpha" }],
    planRows: [
      {
        __rowId: "shift-card-alpha",
        sourceId: "",
        date: "2026-06-15",
        startTime: "08:00",
        endTime: "12:00",
        area: "Desk Alpha",
        location: "Location One",
        assignmentNames: ["Employee Alpha"]
      },
      {
        __rowId: "shift-card-alpha",
        sourceId: "shift-source-alpha",
        date: "2026-06-15",
        startTime: "08:00",
        endTime: "12:00",
        area: "Desk Alpha",
        location: "Location One",
        assignmentNames: ["Employee Alpha"]
      },
      {
        __rowId: "shift-card-beta",
        sourceId: "",
        date: "2026-06-16",
        startTime: "09:00",
        endTime: "11:00",
        area: "Desk Beta",
        location: "Location One",
        assignmentNames: ["Employee Alpha"]
      },
      {
        __rowId: "",
        sourceId: "shift-source-gamma",
        date: "2026-06-17",
        startTime: "10:00",
        endTime: "14:00",
        area: "Desk Gamma",
        location: "Location One",
        assignmentNames: ["Employee Alpha"]
      }
    ],
    reconciliation: {
      canonicalLocations: ["Location One"],
      canonicalWorkAreas: ["Desk Alpha", "Desk Beta", "Desk Gamma"]
    }
  };

  try {
    await writeFile(fixture, JSON.stringify(rawExport));
    await run(parseArgs([
      "--fixture", fixture,
      "--out", out,
      "--from", "2026-06-15",
      "--to", "2026-06-17",
      "--plan-weeks-ahead", "0"
    ]));

    const snapshot = JSON.parse(await readFile(out, "utf8"));
    assert.equal(snapshot.shifts.length, 3);
    assert.equal(snapshot.shifts.filter((shift) => shift.sourceId === "shift-source-alpha").length, 1);
    assert.equal(snapshot.shifts.some((shift) => shift.sourceId === "shift-source-gamma"), true);
    assert.equal(snapshot.shifts.filter((shift) => /^shift_[a-f0-9]{16}$/.test(shift.sourceId)).length, 1);
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
