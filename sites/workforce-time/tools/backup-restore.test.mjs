import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { test } from "node:test";

const exec = promisify(execFile);
const root = resolve(import.meta.dirname, "..");

async function sqlite(dbPath, sql) {
  return exec("sqlite3", [dbPath, sql]);
}

test("backup + restore scripts produce and apply verified SQLite snapshots", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-backup-"));
  const db = join(tempDir, "arbeitszeiten.sqlite");
  const backupDir = join(tempDir, "backups");
  const restored = join(tempDir, "restored.sqlite");

  try {
    await sqlite(db, `
      CREATE TABLE employees (id TEXT PRIMARY KEY);
      CREATE TABLE shifts (id TEXT PRIMARY KEY);
      CREATE TABLE time_entries (id TEXT PRIMARY KEY);
      CREATE TABLE auth_users (id INTEGER PRIMARY KEY);
      INSERT INTO employees VALUES ('e1');
      INSERT INTO shifts VALUES ('s1');
      INSERT INTO time_entries VALUES ('t1');
      INSERT INTO auth_users VALUES (1);
    `);

    const backup = await exec("bash", ["tools/backup-db.sh"], {
      cwd: root,
      env: { ...process.env, ARBEITSZEITEN_DB: db, WORKFORCE_BACKUP_DIR: backupDir, WORKFORCE_BACKUP_KEEP: "3" }
    });
    assert.match(backup.stdout, /Backup OK/);

    const files = (await exec("find", [backupDir, "-name", "arbeitszeiten-*.sqlite.gz"])).stdout.trim().split("\n").filter(Boolean);
    assert.equal(files.length, 1);

    const dryRun = await exec("bash", ["tools/restore-db.sh", "--backup", files[0], "--db", restored], { cwd: root });
    assert.match(dryRun.stdout, /Dry-Run OK/);

    await exec("bash", ["tools/restore-db.sh", "--backup", files[0], "--db", restored, "--apply"], { cwd: root });
    const restoredCount = (await sqlite(restored, "SELECT COUNT(*) FROM time_entries;")).stdout.trim();
    assert.equal(restoredCount, "1");

    const restoredSchema = await readFile(restored);
    assert.ok(restoredSchema.byteLength > 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
