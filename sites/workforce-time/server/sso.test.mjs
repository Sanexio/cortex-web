// Verifikation des Cortex-SSO-Cookies gegen echte itsdangerous-Tokens.
//
// Die Tokens unten wurden mit Python itsdangerous 2.2.0 erzeugt
// (URLSafeTimedSerializer, salt "cortex-sso") — derselben Bibliothek, mit der
// der Identitaetsdienst das Cookie ausstellt. Sie sind fest eingebettet, damit
// der Test ohne Python laeuft. Secret und Namen sind Wegwerfwerte.
//
// Ausfuehren: npm run test:sso
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { ssoEmailForHrUser, verifyCortexSso } from "./sso.js";

const SECRET = "test-secret-roundtrip-only";
const opts = { secret: SECRET };
const VALID = [{"label": "Admin", "token": ".eJyrViotTi3KS8xNVbJSSkzJzczTBQko6ShBxRxBYgqhELGi_JwcuEIgP7UgPzlDycpIRymxoKBYySo6thYAVAcaXQ.amUZzw.dX2cRaE4YDprd64X7c6ZXexg_sQ", "expect_username": "admin-user"}, {"label": "Mitarbeiter", "token": ".eJwtyEEKgCAQBdCrxF_roq3XiFbRYooRBc1BDYLo7mW1fO_EXjhvFBkGpZK1ugUU_hvadeN3OYXQMvpKeWFf32VJq4PpFUikwEzgg6IE1o8xXzeqAiGf.amUZzw.juEpK_OtOPjuxOS48sFyFrwjy5Y", "expect_username": "staff-user"}, {"label": "Umlaute", "token": ".eJyrViotTi3KS8xNVbJSKs3NSSwt0QWJKOkoQQWdDm_LyE1VONxSVFWSmQcUL8rPyQFJ5GaWJBYlpWaWgFWnFuQnZyhZGeooJRYUFCtZRcfWAgAH6SBl.amUZzw.H9snYEUj_XRW60FjQIsa-U5xIM8", "expect_username": "umlaut-user"}];
const COMPRESSED = {"token": ".eJyrViotTi3KS8xNVbJSykksSk_VLUiszMlPTNEFSSjpKEHlIkbBoALAmCnKz8kBRU1uZkliUVJqZgk4vlIL8pMzlKwMdZQSCwqKlayilRJJBkBjRjWNahrVNEI0xdYCAHEVKXY.amUZzw.rEKao_J-jsqFqdfXSOQZax6K8FI", "expect_username": "large-payload-user"};

test("akzeptiert echte Identitaetsdienst-Tokens und liefert die Claims", () => {
  for (const c of VALID) {
    const claims = verifyCortexSso(c.token, opts);
    assert.ok(claims, `Token ${c.label} wurde abgelehnt`);
    assert.equal(claims.username, c.expect_username);
  }
});

test("entpackt zlib-komprimierte Payloads (fuehrender Punkt)", () => {
  assert.ok(COMPRESSED.token.startsWith("."), "Fixture ist nicht komprimiert");
  assert.equal(verifyCortexSso(COMPRESSED.token, opts)?.username, COMPRESSED.expect_username);
});

test("lehnt falsches Secret ab", () => {
  assert.equal(verifyCortexSso(VALID[0].token, { secret: SECRET + "x" }), null);
});

test("lehnt manipulierte Signatur ab", () => {
  assert.equal(verifyCortexSso(".eJyrViotTi3KS8xNVbJSSkzJzczTBQko6ShBxRxBYgqhELGi_JwcuEIgP7UgPzlDycpIRymxoKBYySo6thYAVAcaXQ.amUZzw.dX2cRaE4YDprd64X7c6ZXexzzzz", opts), null);
});

test("lehnt manipulierten Payload ab", () => {
  assert.equal(verifyCortexSso("AeJyrViotTi3KS8xNVbJSSkzJzczTBQko6ShBxRxBYgqhELGi_JwcuEIgP7UgPzlDycpIRymxoKBYySo6thYAVAcaXQ.amUZzw.dX2cRaE4YDprd64X7c6ZXexg_sQ", opts), null);
});

test("lehnt abgelaufene Tokens ab (aelter als 12h)", () => {
  assert.equal(verifyCortexSso("eyJ1c2VybmFtZSI6Im9sZC11c2VyIiwicm9sbGUiOiJhZG1pbiJ9.amRi_w.cZiNFT5Scup9WgexH5_6VKEUPiU", opts), null);
});

test("lehnt Tokens aus der Zukunft ab", () => {
  assert.equal(verifyCortexSso("eyJ1c2VybmFtZSI6ImZ1dHVyZS11c2VyIiwicm9sbGUiOiJhZG1pbiJ9.amUcJw.mJ8kMKwYCsyz-ipV2QnSNVhw0UY", opts), null);
});

test("akzeptiert Tokens knapp innerhalb des Fensters", () => {
  assert.equal(verifyCortexSso("eyJ1c2VybmFtZSI6ImVkZ2UtdXNlciIsInJvbGxlIjoiYWRtaW4ifQ.amRxhw.S4WwNoi3DBcUrrYA3SlpGnIRMNo", opts)?.username, "edge-user");
});

test("faellt bei Muell und fehlendem Secret sauber auf null", () => {
  assert.equal(verifyCortexSso("", opts), null);
  assert.equal(verifyCortexSso("abc.def.ghi", opts), null);
  assert.equal(verifyCortexSso(null, opts), null);
  assert.equal(verifyCortexSso(VALID[0].token, { secret: "" }), null);
});

test("bildet Benutzernamen nur bei exaktem Eintrag ab", () => {
  const map = "admin-user=admin@example.org,staff-user=staff@example.org";
  assert.equal(ssoEmailForHrUser("admin-user", map), "admin@example.org");
  assert.equal(ssoEmailForHrUser("Admin-User", map), "admin@example.org");
  assert.equal(ssoEmailForHrUser("unknown", map), null);
  assert.equal(ssoEmailForHrUser("admin-user", ""), null);
  assert.equal(ssoEmailForHrUser("", map), null);
});
