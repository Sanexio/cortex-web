import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { parseSetupArgs, planSetup, runSetup } from "./setup-workforce-tenant.mjs";

test("setup wizard validates and plans tenant workforce files", () => {
  const options = parseSetupArgs([
    "--tenant-dir", "/tmp/tenant",
    "--slug", "demo-praxis",
    "--tenant-name", "Demo Praxis",
    "--host", "arbeitszeiten.localhost",
    "--admin-email", "admin@example.test",
    "--dry-run"
  ]);
  const plan = planSetup(options);
  assert.equal(options.dryRun, true);
  assert.equal(plan.mergedConfig.workforce.slug, "demo-praxis");
  assert.deepEqual(plan.mergedConfig.workforce.tenant.allowed_hosts, ["arbeitszeiten.localhost"]);
});

test("setup wizard writes tenant config, directories and seed without secrets", async () => {
  const tenantDir = await mkdtemp(join(tmpdir(), "workforce-tenant-"));
  try {
    const result = await runSetup(parseSetupArgs([
      "--tenant-dir", tenantDir,
      "--slug", "demo-praxis",
      "--tenant-name", "Demo Praxis",
      "--host", "arbeitszeiten.localhost",
      "--admin-email", "admin@example.test"
    ]));

    assert.equal(result.dryRun, false);
    assert.ok(existsSync(join(tenantDir, "trunk/workforce/db")));
    assert.ok(existsSync(join(tenantDir, "trunk/workforce/imports")));
    const config = JSON.parse(await readFile(join(tenantDir, "tenant.config.json"), "utf8"));
    assert.equal(config.workforce.auth.users[0].email, "admin@example.test");
    assert.equal(JSON.stringify(config).includes("WORKFORCE_TOTP_KEY"), false);
  } finally {
    await rm(tenantDir, { recursive: true, force: true });
  }
});
