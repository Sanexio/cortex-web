// Cortex-SSO — Verifikation des von Cortex-HR ausgestellten Cookies `cortex_sso`.
//
// Gegenstueck zu hr_client.py (Python/itsdangerous 2.2.0). Bewusst ohne
// Abhaengigkeiten, damit workforce-time keine neue Lieferkette bekommt.
//
// Token-Aufbau (URLSafeTimedSerializer, salt "cortex-sso"):
//   <payload_b64url> "." <timestamp_b64url> "." <signatur_b64url>
//   key       = sha1("cortex-sso" + "signer" + secret)        (django-concat)
//   signatur  = HMAC-SHA1(key, "<payload_b64url>.<timestamp_b64url>")
//   timestamp = Unix-Sekunden, big-endian, fuehrende Nullbytes entfernt
//   payload   = compact-JSON; fuehrender "." markiert zlib-Kompression
//
// Fuer den Trenner gilt: IMMER von rechts trennen — der Payload selbst kann
// mit "." beginnen.
import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { inflateSync } from "node:zlib";

export const SSO_COOKIE = "cortex_sso";
const SSO_SALT = "cortex-sso";
const SSO_MAX_AGE_SECONDS = 12 * 60 * 60;

function b64urlDecode(value) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(padded, "base64url");
}

function deriveKey(secret) {
  return createHash("sha1")
    .update(Buffer.concat([
      Buffer.from(SSO_SALT, "utf8"),
      Buffer.from("signer", "utf8"),
      Buffer.from(secret, "utf8")
    ]))
    .digest();
}

function signatureMatches(secret, signedValue, signatureB64) {
  let provided;
  try {
    provided = b64urlDecode(signatureB64);
  } catch {
    return false;
  }
  const expected = createHmac("sha1", deriveKey(secret))
    .update(Buffer.from(signedValue, "utf8"))
    .digest();
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

function timestampSeconds(tsB64) {
  const raw = b64urlDecode(tsB64);
  if (raw.length === 0 || raw.length > 8) return null;
  // itsdangerous entfernt fuehrende Nullbytes -> vor dem Lesen wieder auffuellen
  return Number(Buffer.concat([Buffer.alloc(8 - raw.length), raw]).readBigUInt64BE(0));
}

function decodePayload(payloadB64) {
  if (payloadB64.startsWith(".")) {
    return inflateSync(b64urlDecode(payloadB64.slice(1)));
  }
  return b64urlDecode(payloadB64);
}

/**
 * Prueft das cortex_sso-Cookie und liefert die Claims {username, name, rolle, epoch, apps}
 * oder null. Jeder Fehler — fehlendes Secret, kaputte Signatur, abgelaufen — ergibt null,
 * damit der Aufrufer auf den lokalen Login zurueckfaellt (fail closed).
 */
export function verifyCortexSso(token, { secret = process.env.HR_SSO_SECRET, maxAgeSeconds = SSO_MAX_AGE_SECONDS, now = null } = {}) {
  if (!token || !secret) return null;
  try {
    const firstSep = token.lastIndexOf(".");
    if (firstSep <= 0) return null;
    const signedValue = token.slice(0, firstSep);
    const signatureB64 = token.slice(firstSep + 1);

    const secondSep = signedValue.lastIndexOf(".");
    if (secondSep <= 0) return null;
    const payloadB64 = signedValue.slice(0, secondSep);
    const tsB64 = signedValue.slice(secondSep + 1);

    if (!signatureMatches(secret, signedValue, signatureB64)) return null;

    const issuedAt = timestampSeconds(tsB64);
    if (issuedAt === null) return null;
    const nowSeconds = now ?? Math.floor(Date.now() / 1000);
    const age = nowSeconds - issuedAt;
    // age < 0: Token aus der Zukunft — itsdangerous lehnt das ebenfalls ab
    if (age > maxAgeSeconds || age < 0) return null;

    const claims = JSON.parse(decodePayload(payloadB64).toString("utf8"));
    if (!claims || typeof claims !== "object" || !claims.username) return null;
    return claims;
  } catch {
    return null;
  }
}

/**
 * Abbildung HR-Benutzername -> workforce-time-E-Mail.
 * Quelle: Env WORKFORCE_SSO_USER_MAP, Format "hrname=mail@example.org,hrname2=..."
 * Bewusst explizit: HR kennt keine E-Mail-Adressen, und ein geratener Join
 * wuerde im schlimmsten Fall fremde Arbeitszeiten oeffnen.
 */
export function ssoEmailForHrUser(username, rawMap = process.env.WORKFORCE_SSO_USER_MAP) {
  if (!username || !rawMap) return null;
  const wanted = String(username).trim().toLowerCase();
  for (const entry of String(rawMap).split(",")) {
    const sep = entry.indexOf("=");
    if (sep <= 0) continue;
    const hrName = entry.slice(0, sep).trim().toLowerCase();
    const email = entry.slice(sep + 1).trim().toLowerCase();
    if (hrName && email && hrName === wanted) return email;
  }
  return null;
}
