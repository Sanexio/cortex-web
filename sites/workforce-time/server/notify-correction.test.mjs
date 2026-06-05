// T-005c — Smoke-Tests für notify-correction.

import assert from "node:assert/strict";
import { test } from "node:test";

const { notifyCorrectionRequested, notifyCorrectionDecided } = await import("./notify-correction.mjs");
const { listAdminEmails, getEmailForEmployeeId } = await import("./db.js");

test("listAdminEmails liefert ein Array", () => {
  const result = listAdminEmails();
  assert.ok(Array.isArray(result));
});

test("getEmailForEmployeeId liefert null bei unbekanntem Mitarbeiter", () => {
  const result = getEmailForEmployeeId("definitiv-nicht-da");
  assert.equal(result, null);
});

test("getEmailForEmployeeId liefert null bei leerer ID", () => {
  assert.equal(getEmailForEmployeeId(null), null);
  assert.equal(getEmailForEmployeeId(""), null);
});

test("notifyCorrectionRequested mit null wirft nicht und liefert leeres Array", async () => {
  const result = await notifyCorrectionRequested(null);
  assert.deepEqual(result, []);
});

test("notifyCorrectionDecided mit null liefert null", async () => {
  const result = await notifyCorrectionDecided(null, "approve");
  assert.equal(result, null);
});

test("notifyCorrectionDecided gibt skipped no_applicant_email zurück bei unbekanntem employeeId", async () => {
  const correction = {
    id: "corr-x",
    timeEntryId: "te-x",
    employeeId: "definitiv-nicht-da",
    status: "approved",
    reviewedAt: "2026-06-05T00:00:00Z",
    reviewerId: "reviewer-x",
    reviewNote: null
  };
  const result = await notifyCorrectionDecided(correction, "approve");
  assert.equal(result?.delivered, false);
  assert.equal(result?.skipped, "no_applicant_email");
});
