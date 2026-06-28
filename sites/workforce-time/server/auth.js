import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "node:crypto";
import { databasePath, db } from "./db.js";
import { tenantConfigGet, tenantDescribe, tenantIsDemo } from "./tenant.js";

const SESSION_COOKIE = "workforce_session";
const PASSWORD_SCRYPT_N = 16384;
const PASSWORD_SCRYPT_R = 8;
const PASSWORD_SCRYPT_P = 1;
const PASSWORD_HASH_LEN = 64;
const PASSWORD_SALT_BYTES = 16;
const MIN_PASSWORD_LENGTH = 10;
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

function requestHost(request) {
  return String(request.headers["x-forwarded-host"] || request.headers.host || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
}

function hostFromUrl(value) {
  try {
    return new URL(String(value)).host.toLowerCase();
  } catch {
    return "";
  }
}

function tenantDisplayName() {
  return String(
    tenantConfigGet("workforce.tenant.display_name", "") ||
      tenantConfigGet("workforce.display_name", "") ||
      tenantConfigGet("display_name", "") ||
      (tenantIsDemo() ? "Workforce-Time Demo" : "Workforce-Time")
  );
}

function tenantAllowedHosts() {
  const configured =
    tenantConfigGet("workforce.tenant.allowed_hosts", null) ??
    tenantConfigGet("workforce.auth.allowed_hosts", null) ??
    tenantConfigGet("auth.allowed_hosts", null) ??
    [];
  const publicHost = hostFromUrl(
    process.env.WORKFORCE_PUBLIC_BASE_URL ||
      tenantConfigGet("workforce.auth.public_base_url", "") ||
      tenantConfigGet("auth.public_base_url", "")
  );
  return [
    ...(Array.isArray(configured) ? configured : []),
    publicHost
  ]
    .map((host) => String(host ?? "").trim().toLowerCase())
    .filter(Boolean)
    .filter((host, index, hosts) => hosts.indexOf(host) === index);
}

// Der Dev-Bypass für das Host-Gate (T-203) gilt nur, solange Enforcement
// nicht explizit verlangt wird. WORKFORCE_AUTH_ENFORCE=1 (Prod-Härtung / Tests)
// schaltet das Gate auch im Nicht-Prod-Modus scharf, damit es testbar ist und
// in produktionsnahen Setups nicht still umgangen wird.
function hostGateBypassed() {
  return isDevelopment() && process.env.WORKFORCE_AUTH_ENFORCE !== "1";
}

function tenantAuthContext(request = null) {
  const host = request ? requestHost(request) : "";
  const allowedHosts = tenantAllowedHosts();
  return {
    slug: tenantSlug(),
    displayName: tenantDisplayName(),
    isDemo: tenantIsDemo(),
    source: tenantDescribe(),
    host: host || null,
    allowedHosts,
    // Das Tenant-Host-Gate (T-203) ist eine Produktions-Sicherung gegen
    // fremde Login-Domains. Im Dev-Modus (lokales Testen, vite-Proxy mit
    // wechselnden 127.0.0.1-Ports) wird es übersprungen — außer Enforcement
    // ist explizit aktiv (siehe hostGateBypassed()).
    hostAccepted: hostGateBypassed() || !host || allowedHosts.length === 0 || allowedHosts.includes(host)
  };
}

function assertTenantHost(request) {
  const context = tenantAuthContext(request);
  if (!context.hostAccepted) {
    throw authError(
      "TENANT_HOST_MISMATCH",
      "Diese Login-Domain ist fuer diesen Workforce-Time-Tenant nicht freigeschaltet."
    );
  }
  return context;
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

  const userColumns = new Set(
    db.prepare("PRAGMA table_info(auth_users)").all().map((column) => column.name)
  );
  if (!userColumns.has("password_hash")) {
    db.exec("ALTER TABLE auth_users ADD COLUMN password_hash TEXT");
  }
  if (!userColumns.has("password_set_at")) {
    db.exec("ALTER TABLE auth_users ADD COLUMN password_set_at TEXT");
  }
  if (!userColumns.has("password_must_change")) {
    db.exec("ALTER TABLE auth_users ADD COLUMN password_must_change INTEGER NOT NULL DEFAULT 0");
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
  // task-3100b6ea5164: bevorzugte Quelle ist workforce.auth.users (kanonischer
  // Auth-Seed), Legacy-Quelle workforce.team_members bleibt als Fallback.
  // Beide Listen werden gemergt; bei E-Mail-Duplikaten gewinnt der Eintrag
  // aus workforce.auth.users.
  const authUsers = tenantConfigGet("workforce.auth.users", []) ?? [];
  const legacy = tenantConfigGet("workforce.team_members", []) ?? [];
  const combined = [
    ...(Array.isArray(authUsers) ? authUsers : []),
    ...(Array.isArray(legacy) ? legacy : [])
  ];
  const seen = new Set();
  const result = [];
  for (const member of combined) {
    if (!member || typeof member !== "object") continue;
    const email = normalizeEmail(member.email);
    if (!isValidEmail(email)) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    result.push({
      email,
      employeeId: String(member.employee_id ?? member.employeeId ?? "").trim() || null,
      displayName: String(member.display_name ?? member.displayName ?? member.name ?? "").trim(),
      role: normalizeRole(member.role)
    });
  }
  return result;
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

function assertLoginRateLimit(userId) {
  // Throttle failed password attempts per user. Dev-mode skips to keep test
  // loops snappy. In production: 10 failures per 15 min -> RATE_LIMITED.
  if (isDevelopment()) return;
  const since = addSeconds(-15 * 60);
  const count = db
    .prepare(`
      SELECT COUNT(*) AS count
      FROM auth_audit_log
      WHERE user_id = ?
        AND event_type IN ('login_fail_password', 'login_fail_totp')
        AND occurred_at >= ?
    `)
    .get(userId, since).count;
  if (count >= 10) {
    throw authError("RATE_LIMITED", "Zu viele fehlgeschlagene Login-Versuche. Bitte 15 Minuten warten.");
  }
}

function assertMagicLinkRateLimit(userId) {
  if (isDevelopment()) return;
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

// Password storage: scrypt with random per-user salt. Format stored in
// auth_users.password_hash is "scrypt$N$r$p$<base64-salt>$<base64-hash>"
// so we can rotate parameters later without a schema change.
function hashPassword(plain) {
  if (typeof plain !== "string" || plain.length < MIN_PASSWORD_LENGTH) {
    throw authError(
      "PASSWORD_TOO_SHORT",
      `Passwort zu kurz (mindestens ${MIN_PASSWORD_LENGTH} Zeichen).`
    );
  }
  const salt = randomBytes(PASSWORD_SALT_BYTES);
  const derived = scryptSync(plain, salt, PASSWORD_HASH_LEN, {
    N: PASSWORD_SCRYPT_N,
    r: PASSWORD_SCRYPT_R,
    p: PASSWORD_SCRYPT_P
  });
  return [
    "scrypt",
    PASSWORD_SCRYPT_N,
    PASSWORD_SCRYPT_R,
    PASSWORD_SCRYPT_P,
    salt.toString("base64"),
    derived.toString("base64")
  ].join("$");
}

function verifyPassword(plain, stored) {
  if (typeof plain !== "string" || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  let salt;
  let expected;
  try {
    salt = Buffer.from(parts[4], "base64");
    expected = Buffer.from(parts[5], "base64");
  } catch {
    return false;
  }
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;
  const derived = scryptSync(plain, salt, expected.length, { N, r, p });
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

function generateInitialPassword() {
  // 16 chars from a URL-safe alphabet; sufficient entropy (~95 bits) and
  // easy to dictate verbally. Excludes look-alikes 0/O and 1/l/I.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const buf = randomBytes(16);
  let out = "";
  for (let i = 0; i < buf.length; i += 1) {
    out += alphabet[buf[i] % alphabet.length];
  }
  return out;
}

// mailFrom() retained as no-op for callers (notify-correction.mjs is being
// refactored to in-app notifications in the same phase). Returning "" lets
// any leftover caller silently no-op instead of crashing.
export function mailFrom() {
  return "";
}

// SMTP/Magic-Link layer fully removed as of phase-b-auth-refactor 2026-06-28.
// Server-Authority architecture: workforce-time runs on the central VPS and
// staff authenticate with username + password inside the app. Magic-Link
// delivery (which depended on a tenant SMTP block + outbound MTA) is gone.

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

function invalidCredentials() {
  return authError("INVALID_CREDENTIALS", "E-Mail oder Passwort ist ungueltig.");
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
        auth_users.tenant_slug,
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
    tenantSlug: session.tenant_slug ?? tenantSlug(),
    totpEnrolled: Boolean(session.totp_enrolled_at),
    totpVerified: Boolean(session.totp_verified_at),
    permissions: session.role === "admin" ? ["admin", "employee"] : ["employee"]
  };
}

function loginWithCredentials(request, payload) {
  const tenant = assertTenantHost(request);
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";

  if (!isValidEmail(email) || !password) {
    throw invalidCredentials();
  }

  let user;
  try {
    user = ensureAuthUser(email);
  } catch (error) {
    if (error?.code === "EMAIL_NOT_ALLOWED" || error?.code === "INVALID_EMAIL") {
      throw invalidCredentials();
    }
    throw error;
  }

  assertLoginRateLimit(user.id);

  if (!user.password_hash || !verifyPassword(password, user.password_hash)) {
    insertAudit("login_fail_password", { userId: user.id, request });
    throw invalidCredentials();
  }

  if (user.totp_enrolled_at) {
    const secretRow = currentTotpSecretRow(user.id);
    if (!secretRow || !payload.totp || !verifyTotpCode(decryptSecret(secretRow.secret_enc), payload.totp)) {
      insertAudit("login_fail_totp", { userId: user.id, request });
      const error = authError("TOTP_REQUIRED", "Gueltiger Zwei-Faktor-Code erforderlich.");
      error.mfaRequired = true;
      throw error;
    }
  }

  const sessionId = createSession(user.id, request, true);
  db.prepare("UPDATE auth_users SET last_login_at = ? WHERE id = ?").run(nowIso(), user.id);
  insertAudit("login_success_password", { userId: user.id, sessionId, request });

  const session = sessionFromRequest({
    ...request,
    headers: { ...request.headers, cookie: `${SESSION_COOKIE}=${sessionId}` }
  });

  return {
    sessionToken: sessionId,
    user: session ? publicUser(session) : null,
    tenant
  };
}

export function setAuthUserPassword(authUserId, { password, request = null, actorUserId = null } = {}) {
  const id = Number(authUserId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Auth-User-ID ist ungueltig.");
  }

  const user = db.prepare("SELECT id, email FROM auth_users WHERE id = ?").get(id);
  if (!user) {
    throw new Error(`Auth-User nicht gefunden: ${authUserId}`);
  }

  const generatedPassword = typeof password === "string" && password.length > 0
    ? null
    : generateInitialPassword();
  const plainPassword = generatedPassword ?? password;
  const passwordHash = hashPassword(plainPassword);
  const passwordSetAt = nowIso();

  db.prepare(`
    UPDATE auth_users
    SET password_hash = ?, password_set_at = ?, password_must_change = 0
    WHERE id = ?
  `).run(passwordHash, passwordSetAt, id);

  insertAudit("password_set", {
    userId: id,
    request,
    metadata: {
      actorUserId,
      mode: generatedPassword ? "generated" : "explicit"
    }
  });

  return generatedPassword ? { generatedPassword } : {};
}

function loginWithPassword(request, payload) {
  const tenant = assertTenantHost(request);
  const email = normalizeEmail(payload?.email);
  if (!isValidEmail(email)) throw authError("EMAIL_INVALID", "E-Mail-Adresse ungueltig.");

  const password = String(payload?.password ?? "");
  if (!password) throw authError("PASSWORD_REQUIRED", "Passwort fehlt.");

  // Reveal as little as possible to outsiders, but rate-limit per-user so a
  // single compromised account cannot be brute-forced indefinitely.
  const user = db
    .prepare(`
      SELECT id, email, display_name, role, tenant_slug, password_hash,
             password_must_change, totp_enrolled_at, disabled_at
      FROM auth_users WHERE email = ?
    `)
    .get(email);
  if (!user || user.disabled_at) {
    throw authError("LOGIN_FAILED", "E-Mail oder Passwort falsch.");
  }
  assertLoginRateLimit(user.id);

  if (!user.password_hash) {
    insertAudit("login_fail_no_password", { userId: user.id, request });
    throw authError(
      "PASSWORD_NOT_SET",
      "Fuer diesen Account ist kein Passwort gesetzt. Bitte Admin um Initial-Passwort bitten."
    );
  }
  if (!verifyPassword(password, user.password_hash)) {
    insertAudit("login_fail_password", { userId: user.id, request });
    throw authError("LOGIN_FAILED", "E-Mail oder Passwort falsch.");
  }

  // TOTP is opt-in (tenant config workforce.auth.require_admin_totp). When
  // not required, password alone logs the admin in and no enrollment wizard
  // is suggested. When required and already enrolled, the TOTP code must be
  // supplied. Default off — tenant flips the flag when they want enforcement.
  const isAdmin = normalizeRole(user.role) === "admin";
  const totpEnrolled = Boolean(user.totp_enrolled_at);
  const requireAdminTotp = Boolean(
    tenantConfigGet("workforce.auth.require_admin_totp", false) ??
      tenantConfigGet("auth.require_admin_totp", false)
  );

  if (isAdmin && requireAdminTotp && totpEnrolled) {
    const totp = String(payload?.totp ?? "").trim();
    if (!totp) {
      throw authError("TOTP_REQUIRED", "Bitte den Zwei-Faktor-Code eingeben.");
    }
    const secretRow = currentTotpSecretRow(user.id);
    if (!secretRow || !verifyTotpCode(decryptSecret(secretRow.secret_enc), totp)) {
      insertAudit("login_fail_totp", { userId: user.id, request });
      throw authError("TOTP_INVALID", "Zwei-Faktor-Code ungueltig.");
    }
  }

  const totpVerified = totpEnrolled && (!requireAdminTotp || true);

  db.exec("BEGIN");
  try {
    const sessionId = createSession(user.id, request, totpVerified);
    db.prepare("UPDATE auth_users SET last_login_at = ? WHERE id = ?").run(nowIso(), user.id);
    insertAudit("login_success_password", { userId: user.id, sessionId, request });
    db.exec("COMMIT");

    const session = sessionFromRequest({
      ...request,
      headers: { ...request.headers, cookie: `${SESSION_COOKIE}=${sessionId}` }
    });
    return {
      sessionId,
      data: {
        user: session ? publicUser(session) : null,
        tenant,
        enroll_totp: isAdmin && requireAdminTotp && !totpEnrolled,
        password_must_change: Boolean(user.password_must_change)
      }
    };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function setOwnPassword(request, payload) {
  const session = requireSession(request);
  const current = String(payload?.current_password ?? "");
  const next = String(payload?.new_password ?? "");
  if (!next) throw authError("PASSWORD_REQUIRED", "Neues Passwort fehlt.");

  const row = db
    .prepare("SELECT password_hash FROM auth_users WHERE id = ?")
    .get(session.user_id);
  if (row?.password_hash) {
    if (!current || !verifyPassword(current, row.password_hash)) {
      insertAudit("password_change_fail", { userId: session.user_id, sessionId: session.id, request });
      throw authError("CURRENT_PASSWORD_INVALID", "Aktuelles Passwort falsch.");
    }
  }
  const hash = hashPassword(next);
  db.prepare(`
    UPDATE auth_users
    SET password_hash = ?, password_set_at = ?, password_must_change = 0
    WHERE id = ?
  `).run(hash, nowIso(), session.user_id);
  insertAudit("password_changed_self", { userId: session.user_id, sessionId: session.id, request });
  return { ok: true };
}

function adminSetUserPassword(request, params, payload) {
  const session = requireSession(request, { requireAdmin: true });
  const targetId = Number(params?.userId);
  if (!Number.isFinite(targetId) || targetId <= 0) {
    throw authError("USER_ID_INVALID", "Ziel-User-ID ungueltig.");
  }
  const target = db
    .prepare("SELECT id, email, disabled_at FROM auth_users WHERE id = ?")
    .get(targetId);
  if (!target) throw authError("USER_NOT_FOUND", "User nicht gefunden.");
  if (target.disabled_at) throw authError("USER_DISABLED", "Dieser Zugang ist deaktiviert.");

  // Two modes: admin supplies plaintext (length-validated here), or admin
  // asks the server to generate a random initial password and return it.
  const supplied = typeof payload?.password === "string" ? payload.password : "";
  const generated = supplied ? null : generateInitialPassword();
  const effective = supplied || generated;
  const hash = hashPassword(effective);
  // password_must_change=1 forces a self-change on next login when the admin
  // generated a one-time password. When the admin set the password directly
  // we leave the flag alone so they can choose whether to require rotation.
  const mustChange = generated ? 1 : 0;
  db.prepare(`
    UPDATE auth_users
    SET password_hash = ?, password_set_at = ?, password_must_change = ?
    WHERE id = ?
  `).run(hash, nowIso(), mustChange, targetId);
  insertAudit("password_set_by_admin", {
    userId: target.id,
    sessionId: session.id,
    request,
    metadata: { admin_user_id: session.user_id, generated: Boolean(generated) }
  });
  return generated ? { ok: true, generatedPassword: generated } : { ok: true };
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
  const isAuthPath = url.pathname.startsWith("/api/auth/");
  const isAdminUserPasswordPath = /^\/api\/admin\/users\/\d+\/set-password$/.test(url.pathname);
  if (!isAuthPath && !isAdminUserPasswordPath) return false;

  try {
    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const result = loginWithPassword(request, await readJson(request));
      jsonOk(sendJson, response, result.data, { "Set-Cookie": sessionCookie(result.sessionId) });
      return true;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/password/change") {
      jsonOk(sendJson, response, setOwnPassword(request, await readJson(request)));
      return true;
    }

    if (request.method === "POST" && isAdminUserPasswordPath) {
      const match = url.pathname.match(/^\/api\/admin\/users\/(\d+)\/set-password$/);
      const userId = match ? match[1] : null;
      jsonOk(sendJson, response, adminSetUserPassword(request, { userId }, await readJson(request)));
      return true;
    }

    if (request.method === "GET" && url.pathname === "/api/auth/tenant") {
      jsonOk(sendJson, response, { tenant: tenantAuthContext(request) });
      return true;
    }

    // Magic-Link endpoints retired in phase-b-auth-refactor 2026-06-28.
    // Tell old clients to upgrade rather than silently 404ing.
    if (
      request.method === "POST" &&
      (url.pathname === "/api/auth/magic-link" || url.pathname === "/api/auth/magic-link/verify")
    ) {
      jsonFailure(
        sendJson,
        response,
        410,
        "MAGIC_LINK_RETIRED",
        "Magic-Link-Login wurde entfernt. Bitte mit E-Mail + Passwort anmelden."
      );
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
      // T-LIVE-001 — Im Dev-Bypass (WORKFORCE_AUTH_DISABLE=1, nie production)
      // gibt der me-Endpoint einen Synthetic-Admin zurueck. Sonst rendert der
      // SPA-Client AuthShell, obwohl alle anderen Endpoints offen sind, und
      // das Dashboard ist unsichtbar — Dev-Friction ohne Sicherheitsgewinn.
      if (!session && !authEnforcementEnabled()) {
        jsonOk(sendJson, response, {
          authenticated: true,
          user: {
            id: 0,
            email: "dev@local",
            displayName: "Dev-Bypass",
            employeeId: null,
            role: "admin",
            totpVerified: true,
            tenantSlug: null,
            lastLoginAt: new Date().toISOString()
          },
          tenant: tenantAuthContext(request)
        });
        return true;
      }
      jsonOk(sendJson, response, {
        authenticated: Boolean(session),
        user: session ? publicUser(session) : null,
        tenant: tenantAuthContext(request)
      });
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
    let status = 400;
    if (
      code === "SESSION_REQUIRED" ||
      code === "TOTP_REQUIRED" ||
      code === "TOTP_INVALID" ||
      code === "LOGIN_FAILED" ||
      code === "CURRENT_PASSWORD_INVALID"
    ) {
      status = 401;
    } else if (code === "ADMIN_REQUIRED") {
      status = 403;
    } else if (code === "RATE_LIMITED") {
      status = 429;
    } else if (code === "USER_NOT_FOUND") {
      status = 404;
    }
    jsonFailure(sendJson, response, status, code, error instanceof Error ? error.message : "Auth-Fehler");
    return true;
  }
}

// Fail-closed by default (C2). Enforcement is ON unless a NON-production
// process explicitly opts out with WORKFORCE_AUTH_DISABLE=1 (local dev). In
// production the gate can never be disabled — a forgotten/typo'd env var must
// not silently expose the whole database. The legacy WORKFORCE_AUTH_ENFORCE=1
// still force-enables (redundant now, kept for compatibility).
export function authEnforcementEnabled() {
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.WORKFORCE_AUTH_ENFORCE === "1") return true;
  if (process.env.WORKFORCE_AUTH_DISABLE === "1") return false;
  return true;
}

export function requireWorkforceApiSession(request) {
  if (!authEnforcementEnabled()) return { ok: true, session: null, enforced: false };

  const requireAdminTotp = Boolean(
    tenantConfigGet("workforce.auth.require_admin_totp", false) ??
      tenantConfigGet("auth.require_admin_totp", false)
  );
  try {
    return { ok: true, session: requireSession(request, { requireTotp: requireAdminTotp }), enforced: true };
  } catch (error) {
    return {
      ok: false,
      enforced: true,
      status: error?.code === "ADMIN_REQUIRED" ? 403 : 401,
      error: {
        code: error?.code || "SESSION_REQUIRED",
        message: error instanceof Error ? error.message : "Bitte erneut einloggen."
      }
    };
  }
}

ensureAuthSchema();

// H10: fail-fast in production. The TOTP encryption key is otherwise only read
// lazily during enroll/verify — a missing key would let the API boot "green"
// and silently break the first 2FA login. Crash loudly at startup instead so
// systemd (Restart=on-failure) makes it visible immediately.
if (process.env.NODE_ENV === "production") {
  try {
    encryptionKey();
  } catch (error) {
    console.error(`[workforce-auth] FATALER START-FEHLER: ${error.message}`);
    console.error(
      "WORKFORCE_TOTP_KEY (bzw. der in auth.totp_encryption_key_env konfigurierte Name) muss gesetzt sein — sonst ist kein 2FA-Login moeglich."
    );
    process.exit(1);
  }
}
