import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual
} from "node:crypto";
import net from "node:net";
import { databasePath, db } from "./db.js";
import { tenantConfigGet, tenantIsDemo } from "./tenant.js";

const SESSION_COOKIE = "workforce_session";
const MAGIC_LINK_TTL_SECONDS = 15 * 60;
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const SESSION_HARD_TTL_SECONDS = 24 * 60 * 60;
const DEVICE_TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60;
const DEVICE_PAIRING_TTL_SECONDS = 5 * 60;
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_RECOVERY_CODES = 8;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function nowIso() {
  return new Date().toISOString();
}

function addSeconds(seconds) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function sha256Hex(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeRole(value) {
  const role = String(value ?? "").toLowerCase();
  if (["admin", "owner", "praxisleitung", "dienstplanung"].some((part) => role.includes(part))) {
    return "admin";
  }
  return "employee";
}

function authError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getClientMeta(request) {
  return {
    ip: request.headers["x-forwarded-for"]?.split(",")[0]?.trim() || request.socket.remoteAddress || null,
    userAgent: request.headers["user-agent"] || null
  };
}

function getOriginBaseUrl(request) {
  const configured =
    process.env.WORKFORCE_PUBLIC_BASE_URL ||
    tenantConfigGet("auth.public_base_url", "") ||
    tenantConfigGet("workforce.auth.public_base_url", "");
  if (configured) return String(configured).replace(/\/+$/, "");

  const proto = request.headers["x-forwarded-proto"] || "http";
  const host = request.headers.host || "127.0.0.1:5175";
  return `${proto}://${host}`;
}

function parseCookies(request) {
  const header = request.headers.cookie || "";
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        if (index === -1) return [part, ""];
        return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function sessionCookie(sessionId) {
  const secure = isDevelopment() ? "" : " Secure;";
  return `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS};${secure}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0;`;
}

function jsonOk(sendJson, response, data = {}, headers = {}) {
  sendJson(response, 200, { ok: true, data }, headers);
}

function jsonCreated(sendJson, response, data = {}, headers = {}) {
  sendJson(response, 201, { ok: true, data }, headers);
}

function jsonFailure(sendJson, response, status, code, message, headers = {}) {
  sendJson(response, status, { ok: false, error: { code, message } }, headers);
}

function ensureAuthSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      employee_id TEXT,
      display_name TEXT,
      role TEXT NOT NULL DEFAULT 'employee',
      tenant_slug TEXT NOT NULL,
      totp_enrolled_at TEXT,
      totp_secret_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT,
      disabled_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);

    CREATE TABLE IF NOT EXISTS auth_magic_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES auth_users(id),
      token_hash TEXT NOT NULL UNIQUE,
      requested_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      used_at TEXT,
      request_ip TEXT,
      request_ua TEXT,
      consumed_ip TEXT,
      consumed_ua TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_magic_links_user ON auth_magic_links(user_id, expires_at);

    CREATE TABLE IF NOT EXISTS auth_totp_secrets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES auth_users(id),
      secret_enc BLOB NOT NULL,
      algorithm TEXT NOT NULL DEFAULT 'SHA1',
      digits INTEGER NOT NULL DEFAULT 6,
      period_seconds INTEGER NOT NULL DEFAULT 30,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      retired_at TEXT,
      recovery_codes TEXT
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES auth_users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      last_used_at TEXT NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      revoked_at TEXT,
      totp_verified_at TEXT,
      hard_expires_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON auth_sessions(user_id, expires_at);

    CREATE TABLE IF NOT EXISTS auth_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_name TEXT NOT NULL,
      device_token_hash TEXT NOT NULL UNIQUE,
      paired_by_user INTEGER NOT NULL REFERENCES auth_users(id),
      paired_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_seen_at TEXT,
      revoked_at TEXT,
      scope TEXT NOT NULL DEFAULT 'terminal',
      rotation_due_at TEXT
    );

    CREATE TABLE IF NOT EXISTS auth_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
      event_type TEXT NOT NULL,
      user_id INTEGER REFERENCES auth_users(id),
      session_id TEXT REFERENCES auth_sessions(id),
      device_id INTEGER REFERENCES auth_devices(id),
      ip_address TEXT,
      user_agent TEXT,
      metadata TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_audit_occurred ON auth_audit_log(occurred_at);
    CREATE INDEX IF NOT EXISTS idx_audit_user ON auth_audit_log(user_id, occurred_at);
  `);

  const sessionColumns = new Set(
    db.prepare("PRAGMA table_info(auth_sessions)").all().map((column) => column.name)
  );
  if (!sessionColumns.has("totp_verified_at")) {
    db.exec("ALTER TABLE auth_sessions ADD COLUMN totp_verified_at TEXT");
  }
  if (!sessionColumns.has("hard_expires_at")) {
    db.exec("ALTER TABLE auth_sessions ADD COLUMN hard_expires_at TEXT");
  }
}

function tenantSlug() {
  return String(
    tenantConfigGet("workforce.slug", "") ||
      tenantConfigGet("slug", "") ||
      (tenantIsDemo() ? "demo" : "tenant")
  );
}

function configuredTeamMembers() {
  const raw = tenantConfigGet("workforce.team_members", []) ?? [];
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((member) => member && typeof member === "object")
    .map((member) => ({
      email: normalizeEmail(member.email),
      employeeId: String(member.employee_id ?? member.employeeId ?? "").trim() || null,
      displayName: String(member.display_name ?? member.displayName ?? member.name ?? "").trim(),
      role: normalizeRole(member.role)
    }))
    .filter((member) => isValidEmail(member.email));
}

function demoMemberForEmail(email) {
  if (!tenantIsDemo()) return null;
  if (!email.endsWith("@workforce.local") && !email.endsWith("@example.test")) return null;

  const localPart = email.split("@")[0];
  const employeeId = localPart === "admin" ? "mfa-a" : localPart;
  const employee = db
    .prepare("SELECT id, display_name FROM employees WHERE id = ? AND removed_from_source = 0")
    .get(employeeId);

  return {
    email,
    employeeId: employee?.id ?? null,
    displayName: employee?.display_name ?? (localPart === "admin" ? "Demo Admin" : localPart),
    role: localPart === "admin" ? "admin" : "employee"
  };
}

function legacyUserForEmail(email) {
  const user = db
    .prepare("SELECT id, display_name, email FROM users WHERE lower(email) = ? AND is_active = 1")
    .get(email);
  if (!user) return null;
  return {
    email,
    employeeId: null,
    displayName: user.display_name,
    role: "admin"
  };
}

function knownIdentityForEmail(email) {
  const configured = configuredTeamMembers().find((member) => member.email === email);
  return configured ?? legacyUserForEmail(email) ?? demoMemberForEmail(email);
}

function ensureAuthUser(email) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    throw authError("INVALID_EMAIL", "Bitte eine gueltige E-Mail-Adresse angeben.");
  }

  const identity = knownIdentityForEmail(normalized);
  if (!identity) {
    throw authError("EMAIL_NOT_ALLOWED", "Diese E-Mail ist fuer Workforce-Time nicht freigeschaltet.");
  }

  const existing = db.prepare("SELECT * FROM auth_users WHERE email = ?").get(normalized);
  if (existing) {
    if (existing.disabled_at) {
      throw authError("USER_DISABLED", "Dieser Zugang ist deaktiviert.");
    }
    db.prepare(`
      UPDATE auth_users
      SET employee_id = ?, display_name = ?, role = ?, tenant_slug = ?
      WHERE id = ?
    `).run(identity.employeeId, identity.displayName, identity.role, tenantSlug(), existing.id);
    return db.prepare("SELECT * FROM auth_users WHERE id = ?").get(existing.id);
  }

  const result = db.prepare(`
    INSERT INTO auth_users (email, employee_id, display_name, role, tenant_slug, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(normalized, identity.employeeId, identity.displayName, identity.role, tenantSlug(), nowIso());

  return db.prepare("SELECT * FROM auth_users WHERE id = ?").get(result.lastInsertRowid);
}

function insertAudit(eventType, { userId = null, sessionId = null, deviceId = null, request = null, metadata = {} } = {}) {
  const meta = request ? getClientMeta(request) : { ip: null, userAgent: null };
  db.prepare(`
    INSERT INTO auth_audit_log (
      occurred_at, event_type, user_id, session_id, device_id, ip_address, user_agent, metadata
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    nowIso(),
    eventType,
    userId,
    sessionId,
    deviceId,
    meta.ip,
    meta.userAgent,
    JSON.stringify(metadata)
  );
}

function assertMagicLinkRateLimit(userId) {
  const since = addSeconds(-60 * 60);
  const count = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM auth_magic_links
      WHERE user_id = ? AND requested_at >= ?
    `)
    .get(userId, since).count;
  if (count >= 5) {
    throw authError("RATE_LIMITED", "Zu viele Login-Link-Anfragen. Bitte spaeter erneut versuchen.");
  }
}

function smtpConfig() {
  const configured = tenantConfigGet("auth.smtp", null) ?? tenantConfigGet("workforce.auth.smtp", null);
  if (configured && typeof configured === "object") {
    return {
      host: configured.host ?? "127.0.0.1",
      port: Number(configured.port ?? 1025),
      secure: Boolean(configured.secure),
      user: configured.user ? String(configured.user) : "",
      passwordEnv: configured.password_env ? String(configured.password_env) : ""
    };
  }
  return { host: "127.0.0.1", port: 1025, secure: false, user: "", passwordEnv: "" };
}

function mailFrom() {
  return (
    tenantConfigGet("auth.mail_from", "") ||
    tenantConfigGet("workforce.auth.mail_from", "") ||
    "noreply@workforce.local"
  );
}

function escapeSmtpLine(value) {
  return String(value).replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

function sendSmtpMail({ from, to, subject, text }) {
  const config = smtpConfig();
  if (config.secure || config.user || config.passwordEnv) {
    if (isDevelopment()) {
      return Promise.resolve({ delivered: false, skipped: "smtp_auth_not_supported_in_dev" });
    }
    return Promise.reject(new Error("SMTP mit Auth/TLS ist in dieser lokalen O.4-Implementierung noch nicht verdrahtet."));
  }

  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    escapeSmtpLine(text)
  ].join("\r\n");

  const commands = [
    "EHLO workforce-time.local\r\n",
    `MAIL FROM:<${from}>\r\n`,
    `RCPT TO:<${to}>\r\n`,
    "DATA\r\n",
    `${message}\r\n.\r\n`,
    "QUIT\r\n"
  ];

  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: config.host, port: config.port });
    let commandIndex = 0;
    let settled = false;

    function finish(error, result) {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (error) reject(error);
      else resolve(result);
    }

    socket.setTimeout(2500);
    socket.on("timeout", () => finish(new Error("SMTP timeout")));
    socket.on("error", (error) => finish(error));
    socket.on("data", (chunk) => {
      const textChunk = chunk.toString("utf8");
      const code = Number(textChunk.slice(0, 3));
      if (!Number.isFinite(code)) return;
      if (code >= 400) {
        finish(new Error(`SMTP rejected command: ${textChunk.trim()}`));
        return;
      }
      if (commandIndex < commands.length) {
        socket.write(commands[commandIndex]);
        commandIndex += 1;
        return;
      }
      finish(null, { delivered: true, host: config.host, port: config.port });
    });
  });
}

async function sendMagicLinkMail(request, user, token) {
  const link = `${getOriginBaseUrl(request)}/login/verify?token=${encodeURIComponent(token)}`;
  const subject =
    tenantConfigGet("auth.magic_link_subject", "") ||
    tenantConfigGet("workforce.auth.magic_link_subject", "") ||
    "Login-Link fuer Workforce-Time";
  const text = [
    `Hallo ${user.display_name || user.email},`,
    "",
    "hier ist dein Login-Link fuer Workforce-Time:",
    link,
    "",
    "Der Link ist 15 Minuten gueltig und kann nur einmal verwendet werden."
  ].join("\n");

  if (isDevelopment()) {
    console.log(`[workforce-auth] Magic-Link fuer ${user.email}: ${link}`);
  }

  try {
    const result = await sendSmtpMail({ from: mailFrom(), to: user.email, subject, text });
    return isDevelopment() ? { ...result, stdout: true } : result;
  } catch (error) {
    if (!isDevelopment()) throw error;
    console.warn(`[workforce-auth] Mailpit nicht erreichbar, Link nur in stdout geloggt: ${error.message}`);
    return { delivered: false, stdout: true, error: error.message };
  }
}

function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(value) {
  const clean = String(value ?? "").replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let buffer = 0;
  const bytes = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw authError("INVALID_TOTP_SECRET", "TOTP-Secret ist ungueltig.");
    buffer = (buffer << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function encryptionKey() {
  const envName =
    tenantConfigGet("auth.totp_encryption_key_env", "") ||
    tenantConfigGet("workforce.auth.totp_encryption_key_env", "") ||
    "WORKFORCE_TOTP_KEY";
  const configured = process.env[envName];
  if (configured) return createHash("sha256").update(configured).digest();
  if (isDevelopment()) return createHash("sha256").update(`dev:${databasePath}`).digest();
  throw authError("TOTP_KEY_MISSING", `TOTP-Key fehlt: ${envName}`);
}

function encryptSecret(secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

function decryptSecret(value) {
  const [version, ivRaw, tagRaw, encryptedRaw] = String(value ?? "").split(":");
  if (version !== "v1") throw authError("INVALID_TOTP_SECRET", "TOTP-Secret-Version ist ungueltig.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final()
  ]).toString("utf8");
}

function hotp(secret, counter) {
  const key = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
}

function safeCompare(first, second) {
  const left = Buffer.from(String(first));
  const right = Buffer.from(String(second));
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function verifyTotpCode(secret, code) {
  const normalized = String(code ?? "").replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  const driftSteps = Number(tenantConfigGet("auth.totp_drift_steps", 1) ?? 1);
  const currentCounter = Math.floor(Date.now() / 1000 / TOTP_PERIOD_SECONDS);
  for (let drift = -driftSteps; drift <= driftSteps; drift += 1) {
    if (safeCompare(hotp(secret, currentCounter + drift), normalized)) {
      return true;
    }
  }
  return false;
}

function recoveryCode() {
  return `${randomBytes(3).toString("hex")}-${randomBytes(3).toString("hex")}`.toUpperCase();
}

function generateRecoveryCodes() {
  const codes = Array.from({ length: TOTP_RECOVERY_CODES }, () => recoveryCode());
  return {
    codes,
    hashes: codes.map((code) => sha256Hex(code.replace(/[^A-Z0-9]/g, "")))
  };
}

function currentTotpSecretRow(userId) {
  return db
    .prepare(`
      SELECT *
      FROM auth_totp_secrets
      WHERE user_id = ? AND retired_at IS NULL
      ORDER BY id DESC
      LIMIT 1
    `)
    .get(userId);
}

function createSession(userId, request, totpVerified) {
  const meta = getClientMeta(request);
  const sessionId = randomToken(32);
  const createdAt = nowIso();
  db.prepare(`
    INSERT INTO auth_sessions (
      id, user_id, created_at, expires_at, last_used_at, user_agent, ip_address,
      totp_verified_at, hard_expires_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    sessionId,
    userId,
    createdAt,
    addSeconds(SESSION_TTL_SECONDS),
    createdAt,
    meta.userAgent,
    meta.ip,
    totpVerified ? createdAt : null,
    addSeconds(SESSION_HARD_TTL_SECONDS)
  );
  return sessionId;
}

function sessionFromRequest(request) {
  const sessionId = parseCookies(request)[SESSION_COOKIE];
  if (!sessionId) return null;

  const row = db
    .prepare(`
      SELECT
        auth_sessions.*,
        auth_users.email,
        auth_users.display_name,
        auth_users.role,
        auth_users.employee_id,
        auth_users.totp_enrolled_at,
        auth_users.disabled_at
      FROM auth_sessions
      JOIN auth_users ON auth_users.id = auth_sessions.user_id
      WHERE auth_sessions.id = ?
        AND auth_sessions.revoked_at IS NULL
        AND auth_sessions.expires_at > ?
        AND (auth_sessions.hard_expires_at IS NULL OR auth_sessions.hard_expires_at > ?)
    `)
    .get(sessionId, nowIso(), nowIso());

  if (!row || row.disabled_at) return null;
  db.prepare("UPDATE auth_sessions SET last_used_at = ?, expires_at = ? WHERE id = ?")
    .run(nowIso(), addSeconds(SESSION_TTL_SECONDS), sessionId);
  return row;
}

function requireSession(request, { requireTotp = false, requireAdmin = false } = {}) {
  const session = sessionFromRequest(request);
  if (!session) throw authError("SESSION_REQUIRED", "Bitte erneut einloggen.");
  if (requireTotp && !session.totp_verified_at) {
    throw authError("TOTP_REQUIRED", "Bitte Zwei-Faktor-Anmeldung abschliessen.");
  }
  if (requireAdmin && session.role !== "admin") {
    throw authError("ADMIN_REQUIRED", "Diese Aktion erfordert Admin-Rechte.");
  }
  return session;
}

function publicUser(session) {
  return {
    id: session.user_id,
    email: session.email,
    displayName: session.display_name,
    employeeId: session.employee_id,
    role: session.role,
    totpEnrolled: Boolean(session.totp_enrolled_at),
    totpVerified: Boolean(session.totp_verified_at),
    permissions: session.role === "admin" ? ["admin", "employee"] : ["employee"]
  };
}

async function requestMagicLink(request, payload) {
  const email = normalizeEmail(payload.email);
  const user = ensureAuthUser(email);
  assertMagicLinkRateLimit(user.id);

  const token = randomToken(32);
  const meta = getClientMeta(request);
  db.prepare(`
    INSERT INTO auth_magic_links (
      user_id, token_hash, requested_at, expires_at, request_ip, request_ua
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(user.id, sha256Hex(token), nowIso(), addSeconds(MAGIC_LINK_TTL_SECONDS), meta.ip, meta.userAgent);
  insertAudit("magic_link_requested", { userId: user.id, request });

  const delivery = await sendMagicLinkMail(request, user, token);
  return { message: "Login-Link wurde verschickt.", delivery };
}

function consumeMagicLink(request, payload) {
  const token = String(payload.token ?? "").trim();
  if (!token) throw authError("TOKEN_REQUIRED", "Magic-Link-Token fehlt.");

  const row = db
    .prepare(`
      SELECT
        auth_magic_links.*,
        auth_users.email,
        auth_users.display_name,
        auth_users.role,
        auth_users.totp_enrolled_at,
        auth_users.disabled_at
      FROM auth_magic_links
      JOIN auth_users ON auth_users.id = auth_magic_links.user_id
      WHERE auth_magic_links.token_hash = ?
    `)
    .get(sha256Hex(token));

  if (!row || row.used_at || row.expires_at <= nowIso()) {
    throw authError("TOKEN_INVALID", "Login-Link ist ungueltig oder abgelaufen.");
  }
  if (row.disabled_at) {
    throw authError("USER_DISABLED", "Dieser Zugang ist deaktiviert.");
  }

  let totpVerified = false;
  if (row.totp_enrolled_at) {
    const secretRow = currentTotpSecretRow(row.user_id);
    if (!secretRow || !payload.totp || !verifyTotpCode(decryptSecret(secretRow.secret_enc), payload.totp)) {
      insertAudit("login_fail_totp", { userId: row.user_id, request });
      throw authError("TOTP_REQUIRED", "Gueltiger Zwei-Faktor-Code erforderlich.");
    }
    totpVerified = true;
  }

  const meta = getClientMeta(request);
  db.exec("BEGIN");
  try {
    db.prepare(`
      UPDATE auth_magic_links
      SET used_at = ?, consumed_ip = ?, consumed_ua = ?
      WHERE id = ?
    `).run(nowIso(), meta.ip, meta.userAgent, row.id);
    const sessionId = createSession(row.user_id, request, totpVerified);
    db.prepare("UPDATE auth_users SET last_login_at = ? WHERE id = ?").run(nowIso(), row.user_id);
    insertAudit(totpVerified ? "login_success" : "login_success_totp_pending", {
      userId: row.user_id,
      sessionId,
      request
    });
    db.exec("COMMIT");

    const session = sessionFromRequest({
      ...request,
      headers: { ...request.headers, cookie: `${SESSION_COOKIE}=${sessionId}` }
    });
    return {
      sessionId,
      data: {
        user: session ? publicUser(session) : null,
        enroll_totp: !row.totp_enrolled_at
      }
    };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function enrollTotp(request) {
  const session = requireSession(request);
  const secret = base32Encode(randomBytes(20));
  const recovery = generateRecoveryCodes();
  const createdAt = nowIso();

  db.exec("BEGIN");
  try {
    db.prepare("UPDATE auth_totp_secrets SET retired_at = ? WHERE user_id = ? AND retired_at IS NULL")
      .run(createdAt, session.user_id);
    const result = db.prepare(`
      INSERT INTO auth_totp_secrets (
        user_id, secret_enc, algorithm, digits, period_seconds, created_at, recovery_codes
      )
      VALUES (?, ?, 'SHA1', ?, ?, ?, ?)
    `).run(session.user_id, encryptSecret(secret), TOTP_DIGITS, TOTP_PERIOD_SECONDS, createdAt, JSON.stringify(recovery.hashes));
    db.prepare("UPDATE auth_users SET totp_secret_id = ? WHERE id = ?").run(result.lastInsertRowid, session.user_id);
    insertAudit("totp_enroll_started", { userId: session.user_id, sessionId: session.id, request });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  const label = encodeURIComponent(`Workforce-Time:${session.email}`);
  const issuer = encodeURIComponent("Workforce-Time");
  const uri = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD_SECONDS}`;
  return { secret, otpauth_uri: uri, qr_uri: uri, recovery_codes: recovery.codes };
}

function confirmTotp(request, payload) {
  const session = requireSession(request);
  const secretRow = currentTotpSecretRow(session.user_id);
  if (!secretRow) throw authError("TOTP_NOT_STARTED", "TOTP-Enrollment wurde noch nicht gestartet.");
  if (!verifyTotpCode(decryptSecret(secretRow.secret_enc), payload.code)) {
    insertAudit("totp_confirm_failed", { userId: session.user_id, sessionId: session.id, request });
    throw authError("TOTP_INVALID", "Der Zwei-Faktor-Code ist ungueltig.");
  }

  const verifiedAt = nowIso();
  db.exec("BEGIN");
  try {
    db.prepare("UPDATE auth_users SET totp_enrolled_at = ?, totp_secret_id = ? WHERE id = ?")
      .run(verifiedAt, secretRow.id, session.user_id);
    db.prepare("UPDATE auth_sessions SET totp_verified_at = ? WHERE id = ?").run(verifiedAt, session.id);
    insertAudit("totp_enrolled", { userId: session.user_id, sessionId: session.id, request });
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return { user: publicUser({ ...session, totp_enrolled_at: verifiedAt, totp_verified_at: verifiedAt }) };
}

function regenerateRecoveryCodes(request, payload) {
  const session = requireSession(request, { requireTotp: true });
  const secretRow = currentTotpSecretRow(session.user_id);
  if (!secretRow || !verifyTotpCode(decryptSecret(secretRow.secret_enc), payload.totp)) {
    insertAudit("recovery_regenerate_failed", { userId: session.user_id, sessionId: session.id, request });
    throw authError("TOTP_INVALID", "Der Zwei-Faktor-Code ist ungueltig.");
  }
  const recovery = generateRecoveryCodes();
  db.prepare("UPDATE auth_totp_secrets SET recovery_codes = ? WHERE id = ?")
    .run(JSON.stringify(recovery.hashes), secretRow.id);
  insertAudit("recovery_codes_rotated", { userId: session.user_id, sessionId: session.id, request });
  return { recovery_codes: recovery.codes };
}

function pairDevice(request, payload) {
  const session = requireSession(request, { requireTotp: true, requireAdmin: true });
  const deviceName = String(payload.device_name ?? payload.deviceName ?? "").trim();
  if (!deviceName) throw authError("DEVICE_NAME_REQUIRED", "Geraetename fehlt.");
  const scope = ["terminal", "admin-display"].includes(payload.scope) ? payload.scope : "terminal";
  const pairingToken = randomToken(24);

  const result = db.prepare(`
    INSERT INTO auth_devices (
      device_name, device_token_hash, paired_by_user, paired_at, scope, rotation_due_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(deviceName, sha256Hex(pairingToken), session.user_id, nowIso(), scope, addSeconds(DEVICE_PAIRING_TTL_SECONDS));
  insertAudit("device_pairing_created", {
    userId: session.user_id,
    sessionId: session.id,
    deviceId: result.lastInsertRowid,
    request,
    metadata: { scope }
  });

  return {
    device_id: result.lastInsertRowid,
    pairing_token: pairingToken,
    pairing_url: `${getOriginBaseUrl(request)}/device/redeem?t=${encodeURIComponent(pairingToken)}`,
    expires_in: DEVICE_PAIRING_TTL_SECONDS
  };
}

function redeemDevice(request, payload) {
  const pairingToken = String(payload.pairing_token ?? payload.token ?? "").trim();
  if (!pairingToken) throw authError("PAIRING_TOKEN_REQUIRED", "Pairing-Token fehlt.");

  const device = db
    .prepare(`
      SELECT *
      FROM auth_devices
      WHERE device_token_hash = ?
        AND revoked_at IS NULL
        AND last_seen_at IS NULL
        AND rotation_due_at > ?
    `)
    .get(sha256Hex(pairingToken), nowIso());
  if (!device) throw authError("PAIRING_TOKEN_INVALID", "Pairing-Token ist ungueltig oder abgelaufen.");

  const deviceToken = randomToken(32);
  db.prepare(`
    UPDATE auth_devices
    SET device_token_hash = ?, last_seen_at = ?, rotation_due_at = ?
    WHERE id = ?
  `).run(sha256Hex(deviceToken), nowIso(), addSeconds(DEVICE_TOKEN_TTL_SECONDS), device.id);
  insertAudit("device_paired", { userId: device.paired_by_user, deviceId: device.id, request });
  return { device_id: device.id, device_token: deviceToken, scope: device.scope, expires_in: DEVICE_TOKEN_TTL_SECONDS };
}

function revokeDevice(request, payload) {
  const session = requireSession(request, { requireTotp: true, requireAdmin: true });
  const deviceId = Number(payload.device_id ?? payload.deviceId);
  if (!Number.isInteger(deviceId)) throw authError("DEVICE_ID_REQUIRED", "Geraete-ID fehlt.");
  db.prepare("UPDATE auth_devices SET revoked_at = ? WHERE id = ?").run(nowIso(), deviceId);
  insertAudit("device_revoked", { userId: session.user_id, sessionId: session.id, deviceId, request });
  return { device_id: deviceId, revoked: true };
}

function auditLog(request, url) {
  requireSession(request, { requireTotp: true, requireAdmin: true });
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);
  const rows = db
    .prepare(`
      SELECT
        auth_audit_log.id,
        auth_audit_log.occurred_at AS occurredAt,
        auth_audit_log.event_type AS eventType,
        auth_users.email,
        auth_audit_log.session_id AS sessionId,
        auth_audit_log.device_id AS deviceId,
        auth_audit_log.ip_address AS ipAddress,
        auth_audit_log.user_agent AS userAgent,
        auth_audit_log.metadata
      FROM auth_audit_log
      LEFT JOIN auth_users ON auth_users.id = auth_audit_log.user_id
      ORDER BY auth_audit_log.occurred_at DESC, auth_audit_log.id DESC
      LIMIT ?
    `)
    .all(limit);

  return {
    events: rows.map((row) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }))
  };
}

export async function handleAuthRoute({ request, response, url, readJson, sendJson }) {
  if (!url.pathname.startsWith("/api/auth/")) return false;

  try {
    if (request.method === "POST" && url.pathname === "/api/auth/magic-link") {
      const data = await requestMagicLink(request, await readJson(request));
      jsonOk(sendJson, response, data);
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/magic-link/verify") {
      const result = consumeMagicLink(request, await readJson(request));
      jsonOk(sendJson, response, result.data, { "Set-Cookie": sessionCookie(result.sessionId) });
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/totp/enroll") {
      jsonCreated(sendJson, response, enrollTotp(request));
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/totp/confirm") {
      jsonOk(sendJson, response, confirmTotp(request, await readJson(request)));
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/totp/recovery") {
      jsonOk(sendJson, response, regenerateRecoveryCodes(request, await readJson(request)));
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/session/refresh") {
      const session = requireSession(request);
      jsonOk(sendJson, response, { user: publicUser(session) }, { "Set-Cookie": sessionCookie(session.id) });
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      const session = sessionFromRequest(request);
      if (session) {
        db.prepare("UPDATE auth_sessions SET revoked_at = ? WHERE id = ?").run(nowIso(), session.id);
        insertAudit("session_revoked", { userId: session.user_id, sessionId: session.id, request });
      }
      jsonOk(sendJson, response, { logged_out: true }, { "Set-Cookie": clearSessionCookie() });
      return true;
    }

    if (request.method === "GET" && url.pathname === "/api/auth/me") {
      const session = sessionFromRequest(request);
      jsonOk(sendJson, response, { authenticated: Boolean(session), user: session ? publicUser(session) : null });
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/device/pair") {
      jsonCreated(sendJson, response, pairDevice(request, await readJson(request)));
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/device/redeem") {
      jsonCreated(sendJson, response, redeemDevice(request, await readJson(request)));
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/device/revoke") {
      jsonOk(sendJson, response, revokeDevice(request, await readJson(request)));
      return true;
    }

    if (request.method === "GET" && url.pathname === "/api/auth/audit") {
      jsonOk(sendJson, response, auditLog(request, url));
      return true;
    }

    jsonFailure(sendJson, response, 404, "NOT_FOUND", "Auth-Endpoint nicht gefunden.");
    return true;
  } catch (error) {
    const code = error?.code || "AUTH_ERROR";
    const status =
      code === "SESSION_REQUIRED" || code === "TOTP_REQUIRED"
        ? 401
        : code === "ADMIN_REQUIRED"
          ? 403
          : code === "RATE_LIMITED"
            ? 429
            : 400;
    jsonFailure(sendJson, response, status, code, error instanceof Error ? error.message : "Auth-Fehler");
    return true;
  }
}

export function requireWorkforceApiSession(request) {
  const enforce = process.env.NODE_ENV === "production" || process.env.WORKFORCE_AUTH_ENFORCE === "1";
  if (!enforce) return { ok: true, session: null };

  try {
    return { ok: true, session: requireSession(request, { requireTotp: true }) };
  } catch (error) {
    return {
      ok: false,
      status: error?.code === "ADMIN_REQUIRED" ? 403 : 401,
      error: {
        code: error?.code || "SESSION_REQUIRED",
        message: error instanceof Error ? error.message : "Bitte erneut einloggen."
      }
    };
  }
}

ensureAuthSchema();
