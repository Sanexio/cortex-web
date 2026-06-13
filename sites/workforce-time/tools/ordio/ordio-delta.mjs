#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import {
  extractAbsenceRowsFromPage,
  parseAbsencesByRowHtml,
  extractEmployeeRowsFromPage,
  extractPlanRowsFromPage,
  extractWorkHoursRowsFromPage,
  mapAbsenceRows,
  mapPlanRows,
  mapWorkHoursRows,
  parseAbsencesHtml,
  parseEmployeesHtml,
  parsePlanHtml,
  parseWorkHoursHtml
} from "./ordio-dom.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "../..");
const defaultFixturePath = resolve(here, "fixtures/ordio-delta.fixture.json");
const defaultSnapshotPath = resolve(projectRoot, "private/imports/import-snapshot.json");
const defaultSecretPath = resolve(homedir(), ".cortex/secrets/ordio.env");

function usage() {
  return `Usage: node tools/ordio/ordio-delta.mjs [--dry-run] [--fixture path] [--out path] [--post] [--live]

Options:
  --dry-run              Map and validate only. Does not write or POST.
  --fixture <path>       Read Ordio-like JSON or work-hours HTML from a local fixture/export.
  --out <path>           Snapshot file for POST /api/imports/delta-snapshot.
  --post                 POST the written snapshot path to the local API.
  --api-url <url>        API base URL. Default: http://127.0.0.1:5175.
  --from <YYYY-MM-DD>    Delta start. Default: 2026-05-25.
  --to <YYYY-MM-DD>      Delta end. Default: today.
  --live                 Capture read-only Ordio browser data via Playwright.
  --secrets-file <path>  Presence gate for live mode. Default: ~/.cortex/secrets/ordio.env.
`;
}

function requireValue(args, index, flag) {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} braucht einen Wert`);
  }
  return value;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    dryRun: false,
    fixture: null,
    out: defaultSnapshotPath,
    post: false,
    apiUrl: "http://127.0.0.1:5175",
    from: "2026-05-25",
    to: new Date().toISOString().slice(0, 10),
    live: false,
    secretsFile: defaultSecretPath
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return { ...options, help: true };
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--post") options.post = true;
    else if (arg === "--live") options.live = true;
    else if (arg === "--fixture") options.fixture = resolve(requireValue(argv, index++, arg));
    else if (arg === "--out") options.out = resolve(requireValue(argv, index++, arg));
    else if (arg === "--api-url") options.apiUrl = requireValue(argv, index++, arg).replace(/\/+$/, "");
    else if (arg === "--from") options.from = requireValue(argv, index++, arg);
    else if (arg === "--to") options.to = requireValue(argv, index++, arg);
    else if (arg === "--secrets-file") options.secretsFile = resolve(requireValue(argv, index++, arg));
    else throw new Error(`Unbekannte Option: ${arg}`);
  }

  if (!options.fixture && !options.live) {
    options.fixture = defaultFixturePath;
    options.dryRun = true;
  }
  if (options.post) options.dryRun = false;
  return options;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function sourceId(record, fallbackPrefix, index) {
  return text(record.sourceId ?? record.source_id ?? record.id ?? record.uuid ?? record.employeeId ?? record.employee_id, `${fallbackPrefix}-${index + 1}`);
}

function toDate(value) {
  const raw = text(value);
  const match = raw.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

function toTime(value) {
  const raw = text(value);
  const match = raw.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function normalizeEntityCollections(raw) {
  if (Array.isArray(raw?.responses)) {
    return raw.responses.reduce((merged, response) => {
      const body = response?.body ?? response?.json ?? response;
      for (const key of ["employees", "staff", "users", "shifts", "timeEntries", "times", "absences", "locations", "workAreas"]) {
        if (Array.isArray(body?.[key])) {
          merged[key] = [...asArray(merged[key]), ...body[key]];
        }
      }
      return merged;
    }, {});
  }
  return raw ?? {};
}

function tenantConfigPath() {
  if (process.env.CORTEX_TENANT_DIR) return join(process.env.CORTEX_TENANT_DIR, "tenant.config.json");
  const tenantFile = join(homedir(), ".cortex", "tenant-path");
  if (!existsSync(tenantFile)) return null;
  const tenantDir = readFileSync(tenantFile, "utf8").split("\n")[0]?.trim();
  return tenantDir ? join(tenantDir, "tenant.config.json") : null;
}

function loadTenantReconciliationConfig() {
  const path = tenantConfigPath();
  if (!path || !existsSync(path)) {
    return {};
  }
  try {
    const config = JSON.parse(readFileSync(path, "utf8"));
    const workforce = config.workforce ?? {};
    const categories = workforce.work_area_categories ?? {};
    const workAreaAliases = {};
    for (const [canonical, values] of Object.entries(categories)) {
      workAreaAliases[canonical] = Array.isArray(values) ? values : [values];
    }
    return {
      canonicalLocations: Array.isArray(workforce.locations) ? workforce.locations : [],
      canonicalWorkAreas: [
        ...Object.keys(categories),
        ...Object.values(categories).flatMap((value) => Array.isArray(value) ? value : [value])
      ],
      workAreaAliases,
      defaultLocation: workforce.default_location_name,
      defaultWorkArea: workforce.default_work_area_name
    };
  } catch (error) {
    if (process.env.ORDIO_DEBUG) console.error(`ORDIO_DEBUG tenant.config konnte nicht gelesen werden: ${error.message}`);
    return {};
  }
}

export function mapOrdioPayload(rawInput, options = {}) {
  const raw = normalizeEntityCollections(rawInput);
  const tenantReconciliation = raw.reconciliation ?? loadTenantReconciliationConfig();
  const capturedAt = text(raw.capturedAt ?? raw.exportedAt, new Date().toISOString());
  const sourceSystem = text(raw.sourceSystem, "ordio");
  const defaultLocation = text(raw.defaultLocation ?? tenantReconciliation.defaultLocation, "Ordio");
  const rawEmployees = asArray(raw.employees ?? raw.staff ?? raw.users);
  const commonResolverOptions = {
    capturedAt,
    defaultLocation,
    defaultWorkArea: tenantReconciliation.defaultWorkArea,
    from: options.from,
    to: options.to,
    employeeRows: asArray(raw.employeeRows),
    existingEmployees: rawEmployees,
    canonicalLocations: [
      ...asArray(raw.locations).map((record) => text(record.name)).filter(Boolean),
      ...asArray(tenantReconciliation.canonicalLocations)
    ],
    canonicalWorkAreas: [
      ...asArray(raw.workAreas ?? raw.areas).map((record) => text(record.name ?? record.area)).filter(Boolean),
      ...asArray(tenantReconciliation.canonicalWorkAreas)
    ],
    locationAliases: tenantReconciliation.locationAliases ?? {},
    workAreaAliases: tenantReconciliation.workAreaAliases ?? {}
  };
  const workHours = mapWorkHoursRows(asArray(raw.workHoursRows), {
    ...commonResolverOptions
  });
  const absencesFromDom = mapAbsenceRows(asArray(raw.absenceRows), commonResolverOptions);
  const plan = mapPlanRows(asArray(raw.planRows), commonResolverOptions);

  const employees = [
    ...rawEmployees.map((record, index) => ({
      sourceId: sourceId(record, "employee", index),
      displayName: text(record.displayName ?? record.display_name ?? record.name ?? record.fullName),
      aliases: asArray(record.aliases),
      roleTitle: text(record.roleTitle ?? record.role_title ?? record.role ?? record.position, "Mitarbeiter"),
      initials: text(record.initials),
      employmentStatus: text(record.status ?? record.employmentStatus ?? record.employment_status, "active"),
      employeeNumber: record.employeeNumber ?? record.employee_number ?? record.personnelNumber ?? record.personnel_number ?? null,
      updatedAt: record.updatedAt ?? record.updated_at ?? capturedAt
    })).filter((record) => record.displayName),
    ...workHours.employees,
    ...absencesFromDom.employees,
    ...plan.employees
  ].filter((record, index, records) => records.findIndex((item) => item.sourceId === record.sourceId) === index);

  const locations = [
    ...asArray(raw.locations).map((record, index) => ({
      sourceId: sourceId(record, "location", index),
      name: text(record.name, defaultLocation),
      updatedAt: record.updatedAt ?? capturedAt
    })).filter((record) => record.name),
    ...workHours.locations,
    ...plan.locations
  ].filter((record, index, records) => records.findIndex((item) => item.name === record.name) === index);

  const workAreas = [
    ...asArray(raw.workAreas ?? raw.areas).map((record, index) => ({
      sourceId: sourceId(record, "area", index),
      name: text(record.name ?? record.area, "Ohne Bereich"),
      updatedAt: record.updatedAt ?? capturedAt
    })).filter((record) => record.name),
    ...workHours.workAreas,
    ...plan.workAreas
  ].filter((record, index, records) => records.findIndex((item) => item.name === record.name) === index);

  const shifts = [
    ...asArray(raw.shifts),
    ...plan.shifts
  ].map((record, index) => {
    const startDate = toDate(record.startDate ?? record.date ?? record.startsAt);
    const startTime = toTime(record.startTime ?? record.startsAt);
    const endTime = toTime(record.endTime ?? record.endsAt);
    if (!startDate || !startTime || !endTime) return null;
    return {
      sourceId: sourceId(record, "shift", index),
      startDate,
      startTime,
      endDate: toDate(record.endDate ?? record.endsAt) ?? startDate,
      endTime,
      area: text(record.area ?? record.workArea, "Ohne Bereich"),
      location: text(record.location, defaultLocation),
      requiredStaff: Number(record.requiredStaff ?? asArray(record.assignments).length) || 1,
      note: text(record.note),
      assignmentSourceIds: asArray(record.assignmentSourceIds ?? record.assignments).map(String),
      assignmentNames: asArray(record.assignmentNames).map(String),
      updatedAt: record.updatedAt ?? capturedAt
    };
  }).filter(Boolean);

  const timeEntries = [
    ...asArray(raw.timeEntries ?? raw.times),
    ...workHours.timeEntries
  ].map((record, index) => {
    const startDate = toDate(record.startDate ?? record.date ?? record.startsAt);
    const startTime = toTime(record.startTime ?? record.startsAt);
    const endTime = toTime(record.endTime ?? record.endsAt);
    if (!startDate || !startTime || !endTime) return null;
    return {
      sourceId: sourceId(record, "time", index),
      employeeSourceId: text(record.employeeSourceId ?? record.employeeId ?? record.userId) || null,
      employeeName: text(record.employeeName ?? record.name),
      startDate,
      startTime,
      endDate: toDate(record.endDate ?? record.endsAt) ?? startDate,
      endTime,
      area: text(record.area ?? record.workArea, "Ohne Bereich"),
      location: text(record.location, defaultLocation),
      status: text(record.status, "erfasst"),
      paidBreakMinutes: Number(record.paidBreakMinutes ?? 0) || 0,
      unpaidBreakMinutes: Number(record.unpaidBreakMinutes ?? record.breakDuration ?? 0) || 0,
      note: text(record.note) || null,
      updatedAt: record.updatedAt ?? capturedAt
    };
  }).filter(Boolean);

  const absences = [
    ...asArray(raw.absences ?? raw.leaveRequests),
    ...absencesFromDom.absences
  ].map((record, index) => {
    const startsOn = toDate(record.startsOn ?? record.startDate ?? record.date);
    const endsOn = toDate(record.endsOn ?? record.endDate ?? record.startDate ?? record.date);
    if (!startsOn || !endsOn) return null;
    return {
      sourceId: sourceId(record, "absence", index),
      employeeSourceId: text(record.employeeSourceId ?? record.employeeId ?? record.userId) || null,
      employeeName: text(record.employeeName ?? record.name),
      type: text(record.type, "Abwesenheit"),
      startsOn,
      endsOn,
      status: text(record.status, "offen"),
      note: text(record.note) || null,
      updatedAt: record.updatedAt ?? capturedAt
    };
  }).filter(Boolean);

  return {
    sourceSystem,
    capturedAt,
    periodStart: toDate(options.from ?? raw.periodStart) ?? raw.periodStart ?? null,
    periodEnd: toDate(options.to ?? raw.periodEnd) ?? raw.periodEnd ?? null,
    defaultLocation,
    locations,
    workAreas,
    employees,
    shifts,
    timeEntries,
    absences,
    unresolvedEmployees: [
      ...workHours.unresolvedEmployees,
      ...absencesFromDom.unresolvedEmployees,
      ...plan.unresolvedEmployees
    ].filter((record, index, records) => records.findIndex((item) => item.initials === record.initials && item.reason === record.reason) === index),
    unresolvedAreas: [
      ...asArray(workHours.unresolvedAreas),
      ...asArray(plan.unresolvedAreas)
    ].filter((record, index, records) => records.findIndex((item) => item.name === record.name && item.reason === record.reason) === index),
    unresolvedLocations: [
      ...asArray(workHours.unresolvedLocations),
      ...asArray(plan.unresolvedLocations)
    ].filter((record, index, records) => records.findIndex((item) => item.name === record.name && item.reason === record.reason) === index),
    debugStats: {
      workHours: workHours.stats,
      absences: absencesFromDom.stats,
      plan: plan.stats
    },
    note: "Ordio-Delta-Snapshot read-only erfasst; Import erfolgt ueber /api/imports/delta-snapshot."
  };
}

export function snapshotSummary(snapshot) {
  return {
    sourceSystem: snapshot.sourceSystem,
    capturedAt: snapshot.capturedAt,
    periodStart: snapshot.periodStart,
    periodEnd: snapshot.periodEnd,
    counts: {
      locations: snapshot.locations.length,
      workAreas: snapshot.workAreas.length,
      employees: snapshot.employees.length,
      shifts: snapshot.shifts.length,
      timeEntries: snapshot.timeEntries.length,
      absences: snapshot.absences.length,
      unresolvedEmployees: asArray(snapshot.unresolvedEmployees).length,
      unresolvedAreas: asArray(snapshot.unresolvedAreas).length,
      unresolvedLocations: asArray(snapshot.unresolvedLocations).length
    }
  };
}

export function validateSnapshot(snapshot) {
  const errors = [];
  if (snapshot.sourceSystem !== "ordio") errors.push("sourceSystem muss 'ordio' sein");
  if (!snapshot.capturedAt) errors.push("capturedAt fehlt");
  if (snapshot.employees.length === 0) errors.push("keine Mitarbeiter im Snapshot");
  const unresolvedTimes = snapshot.timeEntries.filter((entry) => !entry.employeeSourceId && !entry.employeeName);
  const unresolvedAbsences = snapshot.absences.filter((entry) => !entry.employeeSourceId && !entry.employeeName);
  if (unresolvedTimes.length > 0) errors.push(`${unresolvedTimes.length} Zeitbuchungen ohne Mitarbeiterbezug`);
  if (unresolvedAbsences.length > 0) errors.push(`${unresolvedAbsences.length} Abwesenheiten ohne Mitarbeiterbezug`);
  return { ok: errors.length === 0, errors };
}

async function captureLiveOrdio(options) {
  if (!existsSync(options.secretsFile)) {
    throw new Error(`Ordio-Credentials nicht verfuegbar: ${options.secretsFile}`);
  }
  // Backwards-compat: the deposited ordio.env template (2026-06-04) uses
  // ORDIO_USER; newer docs say ORDIO_EMAIL. Accept both.
  const ordioEmail = process.env.ORDIO_EMAIL || process.env.ORDIO_USER || "";
  if (!process.env.ORDIO_BASE_URL) throw new Error("ORDIO_BASE_URL fehlt in der Laufzeitumgebung");
  if (!ordioEmail) throw new Error("ORDIO_EMAIL (oder ORDIO_USER) fehlt in der Laufzeitumgebung");
  if (!process.env.ORDIO_PASSWORD) throw new Error("ORDIO_PASSWORD fehlt in der Laufzeitumgebung");

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    // Wide viewport: at the default 1280px Ordio collapses /work-hours
    // into a responsive card layout without a <table> (verified 2026-06-05,
    // probe at 1680px renders the 14-column table with all rows).
    const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } });
    await page.goto(process.env.ORDIO_BASE_URL, { waitUntil: "domcontentloaded" });
    // Ordio defaults to magic-link mode (probe 2026-06-05): password login
    // sits behind the mode-switch button "Mit Benutzername & Passwort anmelden".
    const pwModeButton = page.getByRole("button", { name: /benutzername.*passwort|username.*password/i });
    if (await pwModeButton.count()) {
      await pwModeButton.first().click();
    }
    const userField = page
      .locator("#e-mail-oder-benutzername")
      .or(page.locator('input[autocomplete="username"]'))
      .or(page.getByLabel(/e-?mail|benutzer|user/i));
    await userField.first().fill(ordioEmail);
    const passwordField = page
      .locator("#passwort")
      .or(page.locator('input[type="password"]'))
      .or(page.getByLabel(/passwort|password/i));
    await passwordField.first().fill(process.env.ORDIO_PASSWORD);
    // Exact-anchored name: avoid matching "Mit Google anmelden" / mode-switch.
    await page.getByRole("button", { name: /^(anmelden|login|sign in)$/i }).first().click();
    await page.waitForLoadState("networkidle");

    await page.goto(new URL("/e", process.env.ORDIO_BASE_URL).href, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2500);
    // /e is a virtualized table: without scrolling only ~2 of N rows
    // render (verified live 2026-06-05, deep probe shows 9 after scroll).
    // Scroll the page + any inner scroll container to force all rows.
    for (let i = 0; i < 8; i += 1) {
      await page.mouse.wheel(0, 4000).catch(() => {});
      await page.evaluate(() => {
        for (const el of document.querySelectorAll("*")) {
          if (el.scrollHeight > el.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(el).overflowY)) {
            el.scrollTop = el.scrollHeight;
          }
        }
      });
      await page.waitForTimeout(600);
    }
    const employeeRows = await extractEmployeeRowsFromPage(page);

    const workHoursRows = [];
    for (const range of isoWeeksInRange(options.from, options.to)) {
      await page.goto(new URL("/work-hours", process.env.ORDIO_BASE_URL).href, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
      await page.waitForSelector("table tbody tr", { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(2000);
      const defaultRows = await extractWorkHoursRowsFromPage(page);
      const pickerSet = await applyWorkHoursPickerRange(page, range.start, range.end);
      const pickedRows = pickerSet ? await extractWorkHoursRowsFromPage(page) : [];
      if (process.env.ORDIO_DEBUG) {
        await logWorkHoursDiagnostics(page, `${range.label}:${range.start}-${range.end}`);
        console.error(`ORDIO_DEBUG Picker ${range.label}: default=${defaultRows.length}, picked=${pickedRows.length}, used=${pickedRows.length || defaultRows.length}`);
      }
      workHoursRows.push(...(pickedRows.length > 0 ? pickedRows : defaultRows));
    }
    const absenceRows = await captureAbsences(page, options);
    const planRows = await capturePlan(page, options);
    if (process.env.ORDIO_DEBUG) {
      console.error(`ORDIO_DEBUG Mitarbeiterzeilen: ${employeeRows.length}`);
      console.error(`ORDIO_DEBUG Arbeitszeitzeilen vor Dedupe: ${workHoursRows.length}`);
      console.error(`ORDIO_DEBUG Abwesenheitszeilen: ${absenceRows.length}`);
      console.error(`ORDIO_DEBUG Planzeilen: ${planRows.length}`);
    }
    return { sourceSystem: "ordio", capturedAt: new Date().toISOString(), employeeRows, workHoursRows, absenceRows, planRows };
  } finally {
    await browser.close();
  }
}

async function applyWorkHoursPickerRange(page, from, to) {
  const pickerButton = page
    .getByRole("button", { name: /zeitraum\s*w(?:ä|ae)hlen/i })
    .or(page.getByLabel(/zeitraum\s*w(?:ä|ae)hlen/i));
  if (!(await pickerButton.count())) {
    if (process.env.ORDIO_DEBUG) console.error("ORDIO_DEBUG Zeitraum-Picker nicht gefunden; Tabelle bleibt im Ordio-Default.");
    return false;
  }
  await pickerButton.first().click();
  await page.waitForTimeout(500);

  // Short, visible-only fill with hard timeout so a wrong guess fails
  // fast instead of hanging 30s on a hidden input.
  const fillVisible = async (locator, value) => {
    for (let index = 0; index < await locator.count(); index += 1) {
      const el = locator.nth(index);
      if (!await el.isVisible().catch(() => false)) continue;
      await el.fill(value, { timeout: 4000 });
      return true;
    }
    return false;
  };

  const dateInputs = page.locator('input[type="date"]');
  let filled = false;
  if (await dateInputs.count() >= 2) {
    filled = (await fillVisible(dateInputs.nth(0), from)) && (await fillVisible(dateInputs.nth(1), to));
  }
  if (!filled) {
    const textInputs = page.locator('input[type="text"], input[placeholder*="TT"], input[placeholder*="Datum"]');
    const fromDe = toGermanDate(from);
    const toDe = toGermanDate(to);
    if (await textInputs.count() >= 2) {
      filled = (await fillVisible(textInputs.nth(0), fromDe)) && (await fillVisible(textInputs.nth(1), toDe));
    }
  }
  if (!filled) {
    filled = await selectDateRangeInCalendarGrid(page, from, to);
    if (!filled) {
      if (process.env.ORDIO_DEBUG) console.error("ORDIO_DEBUG Zeitraum-Picker: Kalendernavigation gescheitert; Default-Ansicht wird gelesen.");
      await page.keyboard.press("Escape").catch(() => {});
      return false;
    }
  }

  const apply = page.getByRole("button", { name: /anwenden|übernehmen|uebernehmen|speichern|ok/i });
  if (await apply.count()) await apply.first().click();
  else await page.keyboard.press("Enter");
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1200);
  return true;
}

async function selectDateRangeInCalendarGrid(page, from, to) {
  const dialog = page.getByRole("dialog").last();
  const scope = await dialog.count() ? dialog : page.locator("body");
  for (const date of [from, to]) {
    if (!await navigateCalendarToMonth(page, scope, date)) return false;
    if (!await clickCalendarDay(scope, date)) return false;
    await page.waitForTimeout(300);
  }
  return true;
}

async function navigateCalendarToMonth(page, scope, dateString) {
  const target = monthIndex(dateString);
  for (let step = 0; step < 24; step += 1) {
    const current = monthIndexFromText(await scope.innerText({ timeout: 3000 }).catch(() => ""));
    if (current === target) return true;
    const buttons = await visibleButtonBoxes(scope);
    if (!buttons.length) return false;
    const sorted = buttons.sort((left, right) => left.x - right.x);
    const button = current === null || current < target ? sorted.at(-1) : sorted[0];
    await button.locator.click({ timeout: 4000 });
    await page.waitForTimeout(250);
  }
  return false;
}

async function clickCalendarDay(scope, dateString) {
  const day = String(Number(dateString.slice(8, 10)));
  const buttons = scope.getByRole("button", { name: new RegExp(`^${day}$`) });
  const count = await buttons.count();
  for (let index = 0; index < count; index += 1) {
    const button = buttons.nth(index);
    if (!await button.isVisible().catch(() => false)) continue;
    if (await button.isDisabled().catch(() => false)) continue;
    await button.click({ timeout: 4000 });
    return true;
  }
  return false;
}

async function visibleButtonBoxes(scope) {
  const buttons = scope.locator("button");
  const out = [];
  for (let index = 0; index < await buttons.count(); index += 1) {
    const locator = buttons.nth(index);
    if (!await locator.isVisible().catch(() => false)) continue;
    const text = (await locator.innerText().catch(() => "")).trim();
    const box = await locator.boundingBox().catch(() => null);
    if (!box) continue;
    if (text && /^\d{1,2}$/.test(text)) continue;
    out.push({ locator, x: box.x, y: box.y });
  }
  return out;
}

function monthIndex(dateString) {
  const [year, month] = dateString.split("-").map(Number);
  return year * 12 + month - 1;
}

function monthIndexFromText(value) {
  const textValue = String(value ?? "").toLowerCase();
  const months = [
    ["januar", "jan"],
    ["februar", "feb"],
    ["märz", "maerz", "mär", "mar"],
    ["april", "apr"],
    ["mai"],
    ["juni", "jun"],
    ["juli", "jul"],
    ["august", "aug"],
    ["september", "sep"],
    ["oktober", "okt", "oct"],
    ["november", "nov"],
    ["dezember", "dez", "dec"]
  ];
  const year = textValue.match(/\b(20\d{2})\b/)?.[1];
  if (!year) return null;
  const month = months.findIndex((names) => names.some((name) => textValue.includes(name)));
  return month >= 0 ? Number(year) * 12 + month : null;
}

function toGermanDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
}

async function captureAbsences(page, options) {
  // Ordio /absences zeigt immer nur den aktuellen Monat — für längere
  // Zeiträume iterieren wir per Monats-Picker (Klick auf den
  // Monatslabel-Button und Auswahl aus dem Popover). Wir sammeln 3
  // Monate rückwärts und 1 Monat vorwärts vom aktuellen Monat, dann
  // dedupen über sourceId.
  await page.goto(new URL("/absences", process.env.ORDIO_BASE_URL).href, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3500);

  const collected = [];
  const seen = new Set();
  const monthAbbrev = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

  async function collectCurrentMonth(label) {
    const content = await page.content();
    const rowBased = parseAbsencesByRowHtml(content);
    let added = 0;
    for (const row of rowBased) {
      if (seen.has(row.sourceId)) continue;
      seen.add(row.sourceId);
      collected.push(row);
      added += 1;
    }
    if (process.env.ORDIO_DEBUG) console.error(`ORDIO_DEBUG Absences ${label}: ${rowBased.length} Bars, ${added} neu`);
  }

  async function navigateToMonth(monthIndex) {
    const label = monthAbbrev[monthIndex];
    // Picker öffnen
    const pickerToggle = page.locator("button:visible", { hasText: new RegExp(`^(${monthAbbrev.join("|")})$`) });
    if (!(await pickerToggle.count())) return false;
    await pickerToggle.first().click();
    await page.waitForTimeout(800);
    // Monatswahl
    const target = page.locator("button:visible, [role=option]:visible, [role=menuitem]:visible", { hasText: new RegExp(`^${label}$`) });
    if (!(await target.count())) {
      await page.keyboard.press("Escape").catch(() => {});
      return false;
    }
    await target.first().click();
    await page.waitForTimeout(3500);
    return true;
  }

  const now = new Date();
  const currentMonthIdx = now.getMonth();
  // 3 zurück, current, 1 vorwärts
  const monthOffsets = [-3, -2, -1, 0, 1];

  // Erste Erfassung (aktueller Monat ist Default beim /absences-Aufruf)
  await collectCurrentMonth(monthAbbrev[currentMonthIdx]);

  for (const offset of monthOffsets) {
    if (offset === 0) continue;
    const targetIdx = (currentMonthIdx + offset + 12) % 12;
    const success = await navigateToMonth(targetIdx);
    if (!success) {
      if (process.env.ORDIO_DEBUG) console.error(`ORDIO_DEBUG Monatswechsel auf ${monthAbbrev[targetIdx]} fehlgeschlagen — überspringe`);
      continue;
    }
    await collectCurrentMonth(monthAbbrev[targetIdx]);
  }

  if (collected.length) return collected;
  return extractAbsenceRowsFromPage(page);
}

async function capturePlan(page, options) {
  const rows = [];
  for (const week of isoWeeksInRange(options.from, options.to)) {
    await page.goto(new URL(`/plan/9405/${week.label}`, process.env.ORDIO_BASE_URL).href, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3500);
    rows.push(...await extractPlanRowsFromPage(page, { label: week.label, days: isoWeekDays(week.label) }));
  }
  return rows;
}

async function logWorkHoursDiagnostics(page, week) {
  const diag = await page.evaluate(() => {
    const norm = (v) => String(v ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
    return {
      url: location.href,
      tableCount: document.querySelectorAll("table").length,
      tables: [...document.querySelectorAll("table")].map((t) => ({
        headers: [...t.querySelectorAll("thead th")].map((h) => norm(h.innerText)),
        tbodyRows: t.querySelectorAll("tbody tr").length
      }))
    };
  });
  console.error(`ORDIO_DEBUG week ${week}:`, JSON.stringify(diag, null, 2));
}

export function isoWeeksInRange(from, to) {
  const start = mondayOfIsoWeekContaining(from);
  const end = mondayOfIsoWeekContaining(to);
  const weeks = [];
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 7)) {
    weeks.push({
      label: isoWeekLabel(cursor),
      start: cursor < from ? from : cursor,
      end: addDays(cursor, 6) > to ? to : addDays(cursor, 6)
    });
  }
  return weeks;
}

function mondayOfIsoWeekContaining(dateString) {
  const date = new Date(`${dateString}T12:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isoWeekLabel(dateString) {
  const date = new Date(`${dateString}T12:00:00Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1, 12));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function isoWeekDays(label) {
  const match = String(label).match(/^(\d{4})-W(\d{2})$/);
  if (!match) return [];
  const year = Number(match[1]);
  const week = Number(match[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4, 12));
  const jan4Day = jan4.getUTCDay() || 7;
  jan4.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (week - 1) * 7);
  const monday = jan4.toISOString().slice(0, 10);
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

async function postImportSnapshot(options) {
  const cookieEnv = process.env.WORKFORCE_SESSION_COOKIE;
  const response = await fetch(`${options.apiUrl}/api/imports/delta-snapshot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookieEnv ? { Cookie: cookieEnv } : {})
    },
    body: JSON.stringify({ source: "ordio-snapshot", path: options.out })
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Import-API antwortet ${response.status}: ${body.slice(0, 200)}`);
  }
  return JSON.parse(body);
}

export async function run(options) {
  const raw = options.live
    ? await captureLiveOrdio(options)
    : readFixture(options.fixture);
  const snapshot = mapOrdioPayload(raw, options);
  const validation = validateSnapshot(snapshot);
  const summary = snapshotSummary(snapshot);
  if (process.env.ORDIO_DEBUG && snapshot.unresolvedEmployees?.length) {
    const initials = snapshot.unresolvedEmployees.map((entry) => entry.initials || "?").filter(Boolean);
    console.error(`ORDIO_DEBUG unaufgeloeste Mitarbeiter-Initialen: ${[...new Set(initials)].join(", ")}`);
  }
  if (process.env.ORDIO_DEBUG && snapshot.unresolvedAreas?.length) {
    const names = snapshot.unresolvedAreas.map((entry) => entry.name).filter(Boolean);
    console.error(`ORDIO_DEBUG unaufgeloeste Bereiche: ${[...new Set(names)].join(", ")}`);
  }
  if (process.env.ORDIO_DEBUG && snapshot.unresolvedLocations?.length) {
    const names = snapshot.unresolvedLocations.map((entry) => entry.name).filter(Boolean);
    console.error(`ORDIO_DEBUG unaufgeloeste Standorte: ${[...new Set(names)].join(", ")}`);
  }
  if (process.env.ORDIO_DEBUG && snapshot.debugStats) {
    console.error("ORDIO_DEBUG Mapping-Stats:", JSON.stringify(snapshot.debugStats, null, 2));
  }

  if (!validation.ok) {
    const error = new Error(`Snapshot-Validierung fehlgeschlagen: ${validation.errors.join("; ")}`);
    error.summary = summary;
    throw error;
  }

  if (!options.dryRun) {
    mkdirSync(dirname(options.out), { recursive: true });
    writeFileSync(options.out, `${JSON.stringify(snapshot, null, 2)}\n`);
  }

  const importResult = options.post ? await postImportSnapshot(options) : null;
  return { dryRun: options.dryRun, wrote: options.dryRun ? null : options.out, posted: Boolean(options.post), summary, importResult };
}

function readFixture(path) {
  const content = readFileSync(path, "utf8");
  if (/\.html?$/i.test(path) || /^\s*<!doctype html/i.test(content) || /^\s*<html[\s>]/i.test(content)) {
    return {
      sourceSystem: "ordio",
      capturedAt: new Date().toISOString(),
      employeeRows: parseEmployeesHtml(content),
      workHoursRows: parseWorkHoursHtml(content),
      absenceRows: parseAbsencesHtml(content),
      planRows: parsePlanHtml(content)
    };
  }
  return JSON.parse(content);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const options = parseArgs();
    if (options.help) {
      process.stdout.write(usage());
      process.exit(0);
    }
    const result = await run(options);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    if (error.summary) process.stderr.write(`${JSON.stringify(error.summary, null, 2)}\n`);
    process.exit(1);
  }
}
