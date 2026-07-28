import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const dbModuleUrl = new URL("./db.js", import.meta.url);
let importSequence = 0;

function restoreEnv(previousEnv) {
  for (const [key, value] of Object.entries(previousEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

async function importFreshDb() {
  importSequence += 1;
  return import(`${dbModuleUrl.href}?work-area-practices=${Date.now()}-${importSequence}`);
}

test("practice migration is idempotent and tenant backfill maps work areas", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-practices-"));
  const previousEnv = {
    NODE_ENV: process.env.NODE_ENV,
    CORTEX_TENANT_DIR: process.env.CORTEX_TENANT_DIR,
    ARBEITSZEITEN_DB: process.env.ARBEITSZEITEN_DB
  };

  process.env.NODE_ENV = "test";
  process.env.CORTEX_TENANT_DIR = tempDir;
  process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");

  await writeFile(join(tempDir, "tenant.config.json"), JSON.stringify({
    workforce: {
      locations: ["Location One"],
      paths: {
        seed_file: "seed.json"
      },
      work_area_categories: {
        "Practice Alpha": ["Desk Beta"]
      }
    }
  }));
  await writeFile(join(tempDir, "seed.json"), JSON.stringify({
    source_system: "neutral_seed",
    employees: [
      {
        source_id: "employee-alpha",
        display_name: "Employee Alpha",
        role_title: "Role Alpha",
        initials: "EA"
      }
    ],
    work_areas: [
      { source_id: "desk-beta", name: "Desk Beta" },
      { source_id: "desk-gamma", name: "Desk Gamma" }
    ]
  }));

  let firstModule;
  let secondModule;
  try {
    firstModule = await importFreshDb();
    firstModule.db.close?.();

    secondModule = await importFreshDb();
    const columns = secondModule.db
      .prepare("SELECT name FROM pragma_table_info('work_areas')")
      .all()
      .map((column) => column.name);
    assert.ok(columns.includes("practice_id"));

    const practice = secondModule.db
      .prepare("SELECT id, name FROM practices WHERE name = ?")
      .get("Practice Alpha");
    assert.ok(practice);

    const rows = secondModule.db.prepare(`
      SELECT work_areas.name, work_areas.practice_id, practices.name AS practice
      FROM work_areas
      LEFT JOIN practices ON practices.id = work_areas.practice_id
      WHERE work_areas.name IN ('Desk Beta', 'Desk Gamma')
      ORDER BY work_areas.name
    `).all();
    const beta = rows.find((row) => row.name === "Desk Beta");
    const gamma = rows.find((row) => row.name === "Desk Gamma");

    assert.equal(beta?.practice_id, practice.id);
    assert.equal(beta?.practice, "Practice Alpha");
    assert.equal(gamma?.practice_id, null);
    assert.equal(gamma?.practice, null);

    const bootstrap = secondModule.getBootstrap();
    assert.deepEqual(bootstrap.workAreas, ["Desk Beta", "Desk Gamma"]);
    assert.deepEqual(bootstrap.workAreaDetails, [
      { name: "Desk Beta", practice: "Practice Alpha" },
      { name: "Desk Gamma", practice: null }
    ]);
  } finally {
    secondModule?.db.close?.();
    restoreEnv(previousEnv);
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("snapshot import stores practices on work areas without defaults", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-practice-import-"));
  const previousEnv = {
    NODE_ENV: process.env.NODE_ENV,
    CORTEX_TENANT_DIR: process.env.CORTEX_TENANT_DIR,
    ARBEITSZEITEN_DB: process.env.ARBEITSZEITEN_DB
  };

  process.env.NODE_ENV = "test";
  process.env.CORTEX_TENANT_DIR = tempDir;
  process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");

  await writeFile(join(tempDir, "tenant.config.json"), JSON.stringify({
    workforce: {
      locations: ["Location One"]
    }
  }));
  const snapshotPath = join(tempDir, "snapshot.json");
  await writeFile(snapshotPath, JSON.stringify({
    sourceSystem: "legacy_import_test",
    capturedAt: "2026-06-05T10:00:00.000Z",
    locations: [{ sourceId: "location-one", name: "Location One" }],
    practices: [{ sourceId: "practice-alpha", name: "Practice Alpha" }],
    workAreas: [
      { sourceId: "desk-beta", name: "Desk Beta", practice: "Practice Alpha" },
      { sourceId: "desk-gamma", name: "Desk Gamma", practice: null }
    ],
    employees: [
      {
        sourceId: "employee-alpha",
        displayName: "Employee Alpha",
        roleTitle: "Role Alpha",
        initials: "EA"
      }
    ],
    shifts: [],
    timeEntries: [],
    absences: []
  }));

  let module;
  try {
    module = await importFreshDb();
    module.runExternalSnapshotImport(snapshotPath);

    const rows = module.db.prepare(`
      SELECT work_areas.name, practices.name AS practice
      FROM work_areas
      LEFT JOIN practices ON practices.id = work_areas.practice_id
      WHERE work_areas.name IN ('Desk Beta', 'Desk Gamma')
      ORDER BY work_areas.name
    `).all().map((row) => ({ name: row.name, practice: row.practice }));

    assert.deepEqual(rows, [
      { name: "Desk Beta", practice: "Practice Alpha" },
      { name: "Desk Gamma", practice: null }
    ]);
  } finally {
    module?.db.close?.();
    restoreEnv(previousEnv);
    await rm(tempDir, { recursive: true, force: true });
  }
});
