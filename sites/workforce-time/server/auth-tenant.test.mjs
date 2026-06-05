import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

function mockRequest(method, path, { host = "arbeitszeiten.localhost", body } = {}) {
  return {
    method,
    url: path,
    body,
    headers: {
      host,
      "user-agent": "auth-tenant-test"
    },
    socket: { remoteAddress: "127.0.0.1" }
  };
}

async function callAuthRoute(handleAuthRoute, method, path, { host, body } = {}) {
  const request = mockRequest(method, path, { host, body });
  const response = {};
  const handled = await handleAuthRoute({
    request,
    response,
    url: new URL(path, `http://${host ?? "arbeitszeiten.localhost"}`),
    readJson: async () => body ?? {},
    sendJson(target, status, payload, headers = {}) {
      target.status = status;
      target.payload = payload;
      target.headers = headers;
    }
  });
  assert.equal(handled, true);
  return response;
}

test("auth tenant endpoint exposes tenant metadata and magic-link enforces allowed host", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-auth-tenant-"));
  process.env.NODE_ENV = "test";
  process.env.WORKFORCE_AUTH_ENFORCE = "1";
  process.env.CORTEX_TENANT_DIR = tempDir;
  process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");

  await writeFile(join(tempDir, "tenant.config.json"), JSON.stringify({
    workforce: {
      slug: "demo-praxis",
      tenant: {
        display_name: "Demo Praxis",
        allowed_hosts: ["arbeitszeiten.localhost"]
      },
      auth: {
        public_base_url: "http://arbeitszeiten.localhost",
        users: [
          {
            email: "admin@example.test",
            display_name: "Demo Admin",
            role: "admin"
          }
        ]
      }
    }
  }, null, 2));

  try {
    const { handleAuthRoute } = await import("./auth.js");

    const tenant = await callAuthRoute(handleAuthRoute, "GET", "/api/auth/tenant", {
      host: "arbeitszeiten.localhost"
    });
    assert.equal(tenant.status, 200);
    assert.equal(tenant.payload.data.tenant.slug, "demo-praxis");
    assert.equal(tenant.payload.data.tenant.displayName, "Demo Praxis");
    assert.equal(tenant.payload.data.tenant.hostAccepted, true);

    const rejected = await callAuthRoute(handleAuthRoute, "POST", "/api/auth/magic-link", {
      host: "falsch.localhost",
      body: { email: "admin@example.test" }
    });
    assert.equal(rejected.status, 400);
    assert.equal(rejected.payload.error.code, "TENANT_HOST_MISMATCH");

    const accepted = await callAuthRoute(handleAuthRoute, "POST", "/api/auth/magic-link", {
      host: "arbeitszeiten.localhost",
      body: { email: "admin@example.test" }
    });
    assert.equal(accepted.status, 200);
    assert.equal(accepted.payload.data.tenant.slug, "demo-praxis");
  } finally {
    delete process.env.CORTEX_TENANT_DIR;
    await rm(tempDir, { recursive: true, force: true });
  }
});
