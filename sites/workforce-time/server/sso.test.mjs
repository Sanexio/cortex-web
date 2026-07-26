// Verifikation des Cortex-SSO-Cookies gegen echte itsdangerous-Tokens.
//
// Die Tokens wurden mit Python itsdangerous 2.2.0 erzeugt
// (URLSafeTimedSerializer, salt "cortex-sso") — derselben Bibliothek, mit der der
// Identitaetsdienst das Cookie ausstellt. Sie sind fest eingebettet, damit der Test
// ohne Python laeuft. Secret und Namen sind Wegwerfwerte.
//
// WICHTIG: Jeder Aufruf bekommt `now: BASE_TIME` mitgegeben. Ohne festen
// Bezugszeitpunkt waeren die Tokens nach 12 Stunden abgelaufen — die Positivtests
// wuerden rot, und die Negativtests waeren aus dem falschen Grund gruen.
// Python bestaetigt mit demselben Bezugszeitpunkt: gueltig=true, abgelaufen=false,
// Zukunft=false, Randfall=true.
//
// Ausfuehren: npm run test:sso
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { ssoEmailForHrUser, verifyCortexSso } from "./sso.js";

const SECRET = "test-secret-roundtrip-only";
const BASE_TIME = 1700000000;
const opts = { secret: SECRET, now: BASE_TIME };
const VALID = [{"label": "Admin", "token": ".eJyrViotTi3KS8xNVbJSSkzJzczTBQko6ShBxRxBYgqhELGi_JwcuEIgP7UgPzlDycpIRymxoKBYySo6thYAVAcaXQ.ZVPxAA.AaOxMOynnBkqnyncgUN-4413NEw", "expect_username": "admin-user"}, {"label": "Mitarbeiter", "token": ".eJwtyEEKgCAQBdCrxF_roq3XiFbRYooRBc1BDYLo7mW1fO_EXjhvFBkGpZK1ugUU_hvadeN3OYXQMvpKeWFf32VJq4PpFUikwEzgg6IE1o8xXzeqAiGf.ZVPxAA.Dynmi2IMOCkn2Q98JL0KFbX24Uk", "expect_username": "staff-user"}, {"label": "Umlaute", "token": ".eJyrViotTi3KS8xNVbJSKs3NSSwt0QWJKOkoQQWdDm_LyE1VONxSVFWSmQcUL8rPyQFJ5GaWJBYlpWaWgFWnFuQnZyhZGeooJRYUFCtZRcfWAgAH6SBl.ZVPxAA.QpTYtE1fKR-GWySsfkPMkbnHlPM", "expect_username": "umlaut-user"}];
const COMPRESSED = {"token": ".eJyrViotTi3KS8xNVbJSykksSk_VLUiszMlPTNEFSSjpKEHlIkbBoALAmCnKz8kBRU1uZkliUVJqZgk4vlIL8pMzlKwMdZQSCwqKlayilRJJBkBjRjWNahrVNEI0xdYCAHEVKXY.ZVPxAA.IiG8fimjMKXrcByfClbMv1PjV2o", "expect_username": "large-payload-user"};

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
  assert.equal(verifyCortexSso(VALID[0].token, { secret: SECRET + "x", now: BASE_TIME }), null);
});

test("lehnt manipulierte Signatur ab", () => {
  assert.equal(verifyCortexSso(".eJyrViotTi3KS8xNVbJSSkzJzczTBQko6ShBxRxBYgqhELGi_JwcuEIgP7UgPzlDycpIRymxoKBYySo6thYAVAcaXQ.ZVPxAA.AaOxMOynnBkqnyncgUN-441zzzz", opts), null);
});

test("lehnt manipulierten Payload ab", () => {
  assert.equal(verifyCortexSso("AeJyrViotTi3KS8xNVbJSSkzJzczTBQko6ShBxRxBYgqhELGi_JwcuEIgP7UgPzlDycpIRymxoKBYySo6thYAVAcaXQ.ZVPxAA.AaOxMOynnBkqnyncgUN-4413NEw", opts), null);
});

test("lehnt abgelaufene Tokens ab (aelter als 12h)", () => {
  assert.equal(verifyCortexSso("eyJ1c2VybmFtZSI6Im9sZC11c2VyIiwicm9sbGUiOiJhZG1pbiJ9.ZVM6MA.owcy6AReuHSOulAvzR4065RBtf8", opts), null);
});

test("lehnt Tokens aus der Zukunft ab", () => {
  assert.equal(verifyCortexSso("eyJ1c2VybmFtZSI6ImZ1dHVyZS11c2VyIiwicm9sbGUiOiJhZG1pbiJ9.ZVPzWA.u-MzlQ60n9wk5epx2xDoGi8CDX4", opts), null);
});

test("akzeptiert Tokens knapp innerhalb des Fensters", () => {
  assert.equal(verifyCortexSso("eyJ1c2VybmFtZSI6ImVkZ2UtdXNlciIsInJvbGxlIjoiYWRtaW4ifQ.ZVNIuA.7cEh8kym0uUkwoJCnS5t2ggtZJY", opts)?.username, "edge-user");
});

test("das Zeitfenster wirkt wirklich — dasselbe Token spaeter abgelehnt", () => {
  const knapp = "eyJ1c2VybmFtZSI6ImVkZ2UtdXNlciIsInJvbGxlIjoiYWRtaW4ifQ.ZVNIuA.7cEh8kym0uUkwoJCnS5t2ggtZJY";
  assert.ok(verifyCortexSso(knapp, { secret: SECRET, now: BASE_TIME }), "sollte jetzt gueltig sein");
  assert.equal(verifyCortexSso(knapp, { secret: SECRET, now: BASE_TIME + 300 }), null, "5 Minuten spaeter abgelaufen");
});

test("faellt bei Muell und fehlendem Secret sauber auf null", () => {
  assert.equal(verifyCortexSso("", opts), null);
  assert.equal(verifyCortexSso("abc.def.ghi", opts), null);
  assert.equal(verifyCortexSso(null, opts), null);
  assert.equal(verifyCortexSso(VALID[0].token, { secret: "", now: BASE_TIME }), null);
});

test("bildet Benutzernamen nur bei exaktem Eintrag ab", () => {
  const map = "admin-user=admin@example.org,staff-user=staff@example.org";
  assert.equal(ssoEmailForHrUser("admin-user", map), "admin@example.org");
  assert.equal(ssoEmailForHrUser("Admin-User", map), "admin@example.org");
  assert.equal(ssoEmailForHrUser("unknown", map), null);
  assert.equal(ssoEmailForHrUser("admin-user", ""), null);
  assert.equal(ssoEmailForHrUser("", map), null);
});
