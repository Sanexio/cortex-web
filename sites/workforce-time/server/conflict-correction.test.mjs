// T-002 + T-005a Smoke-Tests: Shift-Konflikt-Detection und Korrektur-Workflow.

import assert from "node:assert/strict";
import { test } from "node:test";

const {
  detectShiftConflicts,
  requestTimeEntryCorrection,
  listPendingCorrections,
  approveCorrection,
  rejectCorrection,
  getCorrection
} = await import("./db.js");

test("detectShiftConflicts wirft bei fehlenden Pflichtfeldern", () => {
  assert.throws(() => detectShiftConflicts({}), /Pflicht/);
  assert.throws(() => detectShiftConflicts({ startsAt: "2026-06-10T08:00:00Z" }), /Pflicht/);
});

test("detectShiftConflicts liefert invalid_range bei umgekehrter Zeit", () => {
  const result = detectShiftConflicts({
    startsAt: "2026-06-10T16:00:00Z",
    endsAt: "2026-06-10T08:00:00Z",
    employeeIds: []
  });
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].type, "invalid_range");
});

test("detectShiftConflicts liefert leere Konfliktliste bei keinem Mitarbeitenden", () => {
  const result = detectShiftConflicts({
    startsAt: "2026-06-10T08:00:00Z",
    endsAt: "2026-06-10T16:00:00Z",
    employeeIds: []
  });
  assert.equal(result.conflicts.length, 0);
});

test("detectShiftConflicts ist schemamäßig stabil für unbekannte Mitarbeitende", () => {
  const result = detectShiftConflicts({
    startsAt: "2026-06-10T08:00:00Z",
    endsAt: "2026-06-10T16:00:00Z",
    employeeIds: ["definitiv-nicht-vorhanden"]
  });
  assert.ok(Array.isArray(result.conflicts));
});

test("requestTimeEntryCorrection wirft bei unbekannter Time-Entry", () => {
  assert.throws(
    () => requestTimeEntryCorrection("nicht-da", { requestedChanges: { note: "x" }, reason: "Tippfehler" }),
    /nicht gefunden/
  );
});

test("requestTimeEntryCorrection wirft bei fehlendem requestedChanges", async () => {
  const all = await import("./db.js");
  const someEntry = all && typeof all.listTimeEntries === "function" ? all.listTimeEntries()[0] : null;
  if (!someEntry) return;
  assert.throws(
    () => requestTimeEntryCorrection(someEntry.id, { reason: "fehlt requestedChanges" }),
    /requestedChanges/
  );
});

test("requestTimeEntryCorrection wirft bei fehlendem reason", async () => {
  const all = await import("./db.js");
  const someEntry = all && typeof all.listTimeEntries === "function" ? all.listTimeEntries()[0] : null;
  if (!someEntry) return;
  assert.throws(
    () => requestTimeEntryCorrection(someEntry.id, { requestedChanges: { note: "x" } }),
    /reason/
  );
});

test("listPendingCorrections liefert ein Array", () => {
  const result = listPendingCorrections();
  assert.ok(Array.isArray(result));
});

test("approveCorrection wirft bei unbekannter Korrektur", () => {
  assert.throws(() => approveCorrection("nicht-da", "reviewer-id", "ok"), /nicht gefunden/);
});

test("rejectCorrection wirft bei unbekannter Korrektur", () => {
  assert.throws(() => rejectCorrection("nicht-da", "reviewer-id", "nein"), /nicht gefunden/);
});

test("4-Augen-Prinzip: approve mit gleichem reviewer wie Antragsteller wirft", async () => {
  const all = await import("./db.js");
  const entries = typeof all.listTimeEntries === "function" ? all.listTimeEntries() : [];
  if (entries.length === 0) return;
  const someEntry = entries[0];
  // Suche einen anderen Mitarbeitenden als Reviewer (FK auf employees).
  const otherEntry = entries.find((e) => e.employeeId !== someEntry.employeeId);
  if (!otherEntry) return; // nur ein Mitarbeitender → Test überspringen
  const created = requestTimeEntryCorrection(someEntry.id, {
    requestedChanges: { note: "Selbst-Approval-Test" },
    reason: "Test 4-Augen"
  });
  assert.equal(created.status, "open");
  assert.throws(() => approveCorrection(created.id, someEntry.employeeId, "self"), /4-Augen/);
  // Aufräumen: ablehnen mit fremdem Reviewer
  const rejected = rejectCorrection(created.id, otherEntry.employeeId, "Test-Cleanup");
  assert.equal(rejected.status, "rejected");
});
