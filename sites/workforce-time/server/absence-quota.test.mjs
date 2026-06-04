// T-006 Urlaubsrest-Kontingent — Smoke-Test.
// Erzeugt einen In-Memory-Test indem es db.js initialisiert und prüft,
// dass calculateAbsenceQuota mit dem aktuellen Tenant-Datensatz sinnvolle
// Werte liefert.

import assert from "node:assert/strict";
import { test } from "node:test";

const {
  calculateAbsenceQuota,
  calculateAbsenceQuotasForAll,
  getAbsenceQuotaConfig
} = await import("./db.js");

test("getAbsenceQuotaConfig liefert Default-Werte", () => {
  const cfg = getAbsenceQuotaConfig();
  assert.equal(typeof cfg.defaultDays, "number");
  assert.ok(cfg.defaultDays > 0, `defaultDays sollte > 0 sein, ist ${cfg.defaultDays}`);
  assert.equal(typeof cfg.byEmployee, "object");
});

test("calculateAbsenceQuotasForAll liefert pro Mitarbeitendem ein Quota-Objekt", () => {
  const year = new Date().getFullYear();
  const all = calculateAbsenceQuotasForAll(year);
  assert.ok(Array.isArray(all));
  if (all.length === 0) return; // leere DB, kein Test
  for (const q of all) {
    assert.equal(typeof q.employeeId, "string");
    assert.equal(typeof q.employeeName, "string");
    assert.equal(q.year, year);
    assert.equal(typeof q.allocated, "number");
    assert.equal(typeof q.used, "number");
    assert.equal(typeof q.pending, "number");
    assert.equal(typeof q.remaining, "number");
    assert.ok(q.allocated >= 0);
    assert.ok(q.used >= 0);
    assert.ok(q.pending >= 0);
    assert.ok(q.remaining >= 0);
    assert.ok(q.remaining <= q.allocated, `remaining ${q.remaining} > allocated ${q.allocated}`);
  }
});

test("calculateAbsenceQuota wirft bei unbekannter Employee-ID", () => {
  assert.throws(() => calculateAbsenceQuota("definitiv-nicht-vorhanden-id", 2026), /nicht gefunden/);
});

test("calculateAbsenceQuota wirft bei kaputtem Jahr", () => {
  const first = calculateAbsenceQuotasForAll(2026)[0];
  if (!first) return;
  assert.throws(() => calculateAbsenceQuota(first.employeeId, "kaputt"), /Ungültiges Jahr/);
});
