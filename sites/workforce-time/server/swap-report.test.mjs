// T-003a Schichttausch + T-009a Reporting — Smoke-Tests.

import assert from "node:assert/strict";
import { test } from "node:test";

const {
  createSwapRequest,
  listOpenSwapRequests,
  cancelSwapRequest,
  acceptSwapRequest,
  declineSwapRequest,
  buildEmployeeMonthlySollIst,
  buildTeamSollIstSummary,
  renderTeamSollIstCsv
} = await import("./db.js");

test("createSwapRequest wirft bei fehlenden Pflichtfeldern", () => {
  assert.throws(() => createSwapRequest({}), /Pflicht/);
  assert.throws(() => createSwapRequest({ requesterEmployeeId: "x" }), /Pflicht/);
});

test("createSwapRequest wirft wenn Mitarbeiter nicht zugewiesen", () => {
  let caught = null;
  try {
    createSwapRequest({ requesterEmployeeId: "fake-emp", requesterShiftId: "fake-shift" });
  } catch (err) {
    caught = err;
  }
  assert.ok(caught, "Erwarteter Fehler trat nicht auf");
  assert.ok(
    /zugewiesen|FOREIGN KEY|nicht gefunden/i.test(caught.message),
    `Unerwartete Fehlermeldung: ${caught.message}`
  );
});

test("listOpenSwapRequests liefert Array", () => {
  const result = listOpenSwapRequests();
  assert.ok(Array.isArray(result));
});

test("listOpenSwapRequests mit targetEmployeeId Filter liefert Array", () => {
  const result = listOpenSwapRequests({ targetEmployeeId: "irgendwer" });
  assert.ok(Array.isArray(result));
});

test("acceptSwapRequest wirft bei unbekannter Anfrage", () => {
  assert.throws(() => acceptSwapRequest("nicht-da", "fremder-emp", "ok"), /nicht gefunden/);
});

test("declineSwapRequest wirft bei unbekannter Anfrage", () => {
  assert.throws(() => declineSwapRequest("nicht-da", "fremder-emp", "nein"), /nicht gefunden/);
});

test("cancelSwapRequest wirft bei unbekannter Anfrage", () => {
  assert.throws(() => cancelSwapRequest("nicht-da", "fremder-emp", "weg"), /nicht gefunden/);
});

test("buildEmployeeMonthlySollIst wirft bei kaputtem Jahr", () => {
  assert.throws(() => buildEmployeeMonthlySollIst("x", "kaputt", 6), /year/);
});

test("buildEmployeeMonthlySollIst wirft bei kaputtem Monat", () => {
  assert.throws(() => buildEmployeeMonthlySollIst("x", 2026, 13), /month/);
});

test("buildEmployeeMonthlySollIst wirft bei unbekanntem Mitarbeitenden", () => {
  assert.throws(() => buildEmployeeMonthlySollIst("definitiv-nicht-da", 2026, 6), /nicht gefunden/);
});

test("buildTeamSollIstSummary liefert ein Array von Reports", () => {
  const result = buildTeamSollIstSummary(new Date().getFullYear(), new Date().getMonth() + 1);
  assert.ok(Array.isArray(result));
  for (const r of result) {
    assert.equal(typeof r.employeeId, "string");
    assert.equal(typeof r.sollMinutes, "number");
    assert.equal(typeof r.istMinutes, "number");
    assert.equal(typeof r.differenceMinutes, "number");
    assert.equal(typeof r.workingDaysInMonth, "number");
    assert.ok(r.workingDaysInMonth >= 0);
    assert.ok(Array.isArray(r.overlongDays));
  }
});

test("renderTeamSollIstCsv liefert valides CSV mit Headern", () => {
  const report = buildTeamSollIstSummary(new Date().getFullYear(), new Date().getMonth() + 1);
  const csv = renderTeamSollIstCsv(report);
  assert.ok(csv.startsWith("employeeId;employeeName;weeklyTargetHours"), `CSV-Header fehlt: ${csv.slice(0, 80)}`);
  const lines = csv.split("\n");
  assert.equal(lines.length, report.length + 1);
});
