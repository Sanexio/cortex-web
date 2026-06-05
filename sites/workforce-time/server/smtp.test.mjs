import assert from "node:assert/strict";
import net from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

// Minimal mock SMTP server. Advertises a multiline EHLO (to exercise the
// reply reader's continuation handling) and AUTH LOGIN. Records the dialogue.
function startMockSmtp({ requireAuth = false } = {}) {
  const received = { lines: [], data: [] };
  const server = net.createServer((socket) => {
    let inData = false;
    socket.setEncoding("utf8");
    socket.write("220 mock ESMTP\r\n");
    let buf = "";
    socket.on("data", (chunk) => {
      buf += chunk;
      let nl;
      while ((nl = buf.indexOf("\r\n")) >= 0) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 2);
        if (inData) {
          if (line === ".") {
            inData = false;
            socket.write("250 OK queued\r\n");
          } else {
            received.data.push(line);
          }
          continue;
        }
        received.lines.push(line);
        if (/^EHLO/i.test(line)) socket.write("250-mock greets you\r\n250 AUTH LOGIN\r\n");
        else if (/^AUTH LOGIN/i.test(line)) socket.write("334 VXNlcm5hbWU6\r\n");
        else if (/^MAIL FROM/i.test(line)) socket.write("250 OK\r\n");
        else if (/^RCPT TO/i.test(line)) socket.write("250 OK\r\n");
        else if (/^DATA/i.test(line)) { inData = true; socket.write("354 End data with <CR><LF>.<CR><LF>\r\n"); }
        else if (/^QUIT/i.test(line)) { socket.write("221 Bye\r\n"); socket.end(); }
        else {
          // base64 lines during AUTH LOGIN: first is username -> ask password,
          // second is password -> accept.
          if (received.lines.filter((l) => /^[A-Za-z0-9+/=]+$/.test(l)).length === 1) {
            socket.write("334 UGFzc3dvcmQ6\r\n");
          } else {
            socket.write("235 Authentication succeeded\r\n");
          }
        }
      }
    });
    socket.on("error", () => {});
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port, received }));
  });
}

test("deliverViaSmtp: plain relay, kein Auth (Mailpit-artig)", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-smtp-"));
  process.env.NODE_ENV = "test";
  process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");
  const mock = await startMockSmtp();
  try {
    const { deliverViaSmtp } = await import("./auth.js");
    const result = await deliverViaSmtp(
      { host: "127.0.0.1", port: mock.port, secure: false, requireTls: false, user: "", passwordEnv: "" },
      { from: "noreply@praxis.test", to: "mfa@praxis.test", subject: "Login", text: "Dein Link" }
    );
    assert.equal(result.delivered, true);
    assert.ok(mock.received.lines.some((l) => l === "MAIL FROM:<noreply@praxis.test>"));
    assert.ok(mock.received.lines.some((l) => l === "RCPT TO:<mfa@praxis.test>"));
    assert.ok(mock.received.data.some((l) => l.includes("Dein Link")));
    // Ohne Credentials darf KEIN AUTH gesendet worden sein.
    assert.ok(!mock.received.lines.some((l) => /^AUTH/i.test(l)));
  } finally {
    mock.server.close();
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("deliverViaSmtp: AUTH LOGIN mit Credentials (mehrzeiliges EHLO)", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-smtp-auth-"));
  process.env.NODE_ENV = "test";
  process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");
  process.env.SMTP_TEST_PASS = "geheim123";
  const mock = await startMockSmtp({ requireAuth: true });
  try {
    const { deliverViaSmtp } = await import("./auth.js");
    const result = await deliverViaSmtp(
      { host: "127.0.0.1", port: mock.port, secure: false, requireTls: false, user: "praxis@provider.test", passwordEnv: "SMTP_TEST_PASS" },
      { from: "noreply@praxis.test", to: "mfa@praxis.test", subject: "Login", text: "Link" }
    );
    assert.equal(result.delivered, true);
    assert.ok(mock.received.lines.some((l) => l === "AUTH LOGIN"));
    assert.ok(mock.received.lines.includes(Buffer.from("praxis@provider.test").toString("base64")));
    assert.ok(mock.received.lines.includes(Buffer.from("geheim123").toString("base64")));
  } finally {
    mock.server.close();
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("deliverViaSmtp: fehlendes Passwort wird hart abgewiesen", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "workforce-smtp-nopass-"));
  process.env.NODE_ENV = "test";
  process.env.ARBEITSZEITEN_DB = join(tempDir, "arbeitszeiten.sqlite");
  delete process.env.SMTP_MISSING_PASS;
  try {
    const { deliverViaSmtp } = await import("./auth.js");
    await assert.rejects(
      () => deliverViaSmtp(
        { host: "127.0.0.1", port: 2, secure: false, requireTls: false, user: "x@y.test", passwordEnv: "SMTP_MISSING_PASS" },
        { from: "a@test", to: "b@test", subject: "s", text: "t" }
      ),
      /Passwort fehlt|SMTP_MISSING_PASS/
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
