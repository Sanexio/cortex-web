// T-004a Stempeluhr + T-007a Approvals-Aggregator + T-010a Rollen-Admin — Smoke-Tests.

import assert from "node:assert/strict";
import { test } from "node:test";

const {
  stampStart,
  stampEnd,
  stampBreakStart,
  stampBreakEnd,
  getStampState,
  listAllPendingApprovals,
  listAuthUsersWithRoles,
  updateAuthUserRole
} = await import("./db.js");

test("stampStart wirft bei fehlender employeeId", () => {
  assert.throws(() => stampStart(null), /Pflicht|nicht gefunden/i);
});

test("stampStart wirft bei unbekanntem employee", () => {
  assert.throws(() => stampStart("definitiv-nicht-da"), /nicht gefunden/);
});

test("stampEnd wirft wenn keine laufende Session existiert", () => {
  assert.throws(() => stampEnd("definitiv-nicht-da"), /Keine laufende/);
});

test("stampBreakStart wirft ohne laufende Session", () => {
  assert.throws(() => stampBreakStart("definitiv-nicht-da"), /Keine laufende/);
});

test("stampBreakEnd wirft ohne laufende Session", () => {
  assert.throws(() => stampBreakEnd("definitiv-nicht-da"), /Keine laufende/);
});

test("getStampState liefert active:false bei unbekanntem employee", () => {
  const result = getStampState("definitiv-nicht-da");
  assert.equal(result.active, false);
});

test("listAllPendingApprovals liefert Struktur mit items + total + breakdown", () => {
  const result = listAllPendingApprovals();
  assert.equal(typeof result.total, "number");
  assert.ok(Array.isArray(result.items));
  assert.equal(result.total, result.items.length);
  assert.equal(typeof result.breakdown.corrections, "number");
  assert.equal(typeof result.breakdown.swap_requests, "number");
  assert.equal(typeof result.breakdown.absences, "number");
  for (const item of result.items) {
    assert.ok(["correction", "swap_request", "absence"].includes(item.type));
    assert.equal(typeof item.id, "string");
    assert.ok(item.payload);
  }
});

test("listAuthUsersWithRoles liefert ein Array", () => {
  const result = listAuthUsersWithRoles();
  assert.ok(Array.isArray(result));
});

test("updateAuthUserRole wirft bei ungültiger Rolle", () => {
  assert.throws(() => updateAuthUserRole(1, "superuser", 99, "test"), /Rolle ungültig/);
});

test("updateAuthUserRole wirft bei unbekanntem User", () => {
  let caught = null;
  try {
    updateAuthUserRole(99999999, "employee", 1, "test");
  } catch (err) {
    caught = err;
  }
  assert.ok(caught, "Erwarteter Fehler");
  assert.ok(
    /nicht gefunden/i.test(caught.message),
    `Unerwartete Fehlermeldung: ${caught.message}`
  );
});
