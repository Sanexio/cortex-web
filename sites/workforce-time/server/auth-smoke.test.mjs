import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(value) {
  const clean = String(value ?? "").replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let buffer = 0;
  const bytes = [];

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error(`Invalid base32 char: ${char}`);
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function totp(secret) {
  const counter = Math.floor(Date.now() / 1000 / 30);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", base32Decode(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

function mockRequest(method, path, { cookie, body } = {}) {
  return {
    method,
    url: path,
    body,
    headers: {
      "user-agent": "auth-smoke",
      ...(cookie ? { cookie } : {})
    },
    socket: {
      remoteAddress: "127.0.0.1"
    }
  };
}

async function callAuthRoute(handleAuthRoute, method, path, { cookie, body } = {}) {
  const request = mockRequest(method, path, { cookie, body });
  const response = {};
  const handled = await handleAuthRoute({
    request,
    response,
    url: new URL(path, "http://127.0.0.1:5175"),
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

test("magic-link + TOTP enrollment unlocks protected bootstrap", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-auth-"));
  process.env.NODE_ENV = "test";
  process.env.WORKFORCE_AUTH_ENFORCE = "1";
  process.env.WORKFORCE_TOTP_KEY = "auth-smoke-test-key";
  process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");

  try {
    const { handleAuthRoute, requireWorkforceApiSession } = await import("./auth.js");
    const { getBootstrap } = await import("./db.js");

    const blocked = requireWorkforceApiSession(mockRequest("GET", "/api/bootstrap"));
    assert.equal(blocked.ok, false);
    assert.equal(blocked.error.code, "SESSION_REQUIRED");

    const logs = [];
    const originalLog = console.log;
    let requested;
    try {
      console.log = (...args) => {
        logs.push(args.join(" "));
      };
      requested = await callAuthRoute(handleAuthRoute, "POST", "/api/auth/magic-link", {
        body: { email: "admin@workforce.local" }
      });
    } finally {
      console.log = originalLog;
    }

    assert.equal(requested.status, 200);
    const magicLinkLine = logs.find((line) => line.includes("Magic-Link fuer admin@workforce.local"));
    assert.ok(magicLinkLine);
    const magicLink = magicLinkLine.match(/(http:\/\/[^\s]+)/)?.[1];
    assert.ok(magicLink);
    const token = new URL(magicLink).searchParams.get("token");
    assert.ok(token);

    const verified = await callAuthRoute(handleAuthRoute, "POST", "/api/auth/magic-link/verify", {
      body: { token }
    });
    assert.equal(verified.status, 200);
    assert.equal(verified.payload.data.enroll_totp, true);
    const cookie = verified.headers["Set-Cookie"]?.split(";")[0];
    assert.ok(cookie);

    const stillBlocked = requireWorkforceApiSession(mockRequest("GET", "/api/bootstrap", { cookie }));
    assert.equal(stillBlocked.ok, false);
    assert.equal(stillBlocked.error.code, "TOTP_REQUIRED");

    const enrolled = await callAuthRoute(handleAuthRoute, "POST", "/api/auth/totp/enroll", {
      cookie
    });
    assert.equal(enrolled.status, 201);
    assert.ok(enrolled.payload.data.secret);
    assert.equal(enrolled.payload.data.recovery_codes.length, 8);

    const confirmed = await callAuthRoute(handleAuthRoute, "POST", "/api/auth/totp/confirm", {
      cookie,
      body: { code: totp(enrolled.payload.data.secret) }
    });
    assert.equal(confirmed.status, 200);
    assert.equal(confirmed.payload.data.user.totpVerified, true);

    const gate = requireWorkforceApiSession(mockRequest("GET", "/api/bootstrap", { cookie }));
    assert.equal(gate.ok, true);
    assert.ok(Array.isArray(getBootstrap().employees));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
