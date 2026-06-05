#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "../..");
const defaultFixturePath = resolve(here, "fixtures/ordio-delta.fixture.json");
const defaultSnapshotPath = resolve(projectRoot, "private/imports/import-snapshot.json");
const defaultSecretPath = resolve(homedir(), ".cortex/secrets/ordio.env");

function usage() {
  return `Usage: node tools/ordio/ordio-delta.mjs [--dry-run] [--fixture path] [--out path] [--post] [--live]

Options:
  --dry-run              Map and validate only. Does not write or POST.
  --fixture <path>       Read Ordio-like JSON from a local fixture/export.
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
  return text(record.sourceId ?? record.id ?? record.uuid ?? record.employeeId ?? record.employee_id, `${fallbackPrefix}-${index + 1}`);
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

export function mapOrdioPayload(rawInput, options = {}) {
  const raw = normalizeEntityCollections(rawInput);
  const capturedAt = text(raw.capturedAt ?? raw.exportedAt, new Date().toISOString());
  const sourceSystem = text(raw.sourceSystem, "ordio");
  const defaultLocation = text(raw.defaultLocation, "Ordio");

  const employees = asArray(raw.employees ?? raw.staff ?? raw.users).map((record, index) => ({
    sourceId: sourceId(record, "employee", index),
    displayName: text(record.displayName ?? record.name ?? record.fullName),
    aliases: asArray(record.aliases),
    roleTitle: text(record.roleTitle ?? record.role ?? record.position, "Mitarbeiter"),
    initials: text(record.initials),
    employmentStatus: text(record.status ?? record.employmentStatus, "active"),
    employeeNumber: record.employeeNumber ?? record.personnelNumber ?? null,
    updatedAt: record.updatedAt ?? capturedAt
  })).filter((record) => record.displayName);

  const locations = asArray(raw.locations).map((record, index) => ({
    sourceId: sourceId(record, "location", index),
    name: text(record.name, defaultLocation),
    updatedAt: record.updatedAt ?? capturedAt
  })).filter((record) => record.name);

  const workAreas = asArray(raw.workAreas ?? raw.areas).map((record, index) => ({
    sourceId: sourceId(record, "area", index),
    name: text(record.name ?? record.area, "Ohne Bereich"),
    updatedAt: record.updatedAt ?? capturedAt
  })).filter((record) => record.name);

  const shifts = asArray(raw.shifts).map((record, index) => {
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

  const timeEntries = asArray(raw.timeEntries ?? raw.times).map((record, index) => {
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

  const absences = asArray(raw.absences ?? raw.leaveRequests).map((record, index) => {
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
      absences: snapshot.absences.length
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
  const responses = [];
  try {
    const page = await browser.newPage();
    page.on("response", async (response) => {
      const request = response.request();
      if (request.method() !== "GET") return;
      if (!/api|graphql|shift|time|absence|employee|staff|user/i.test(response.url())) return;
      const contentType = response.headers()["content-type"] ?? "";
      if (!contentType.includes("json")) return;
      try {
        responses.push({ url: response.url(), body: await response.json() });
      } catch {
        // Ignore non-JSON or streaming responses.
      }
    });

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
    return { sourceSystem: "ordio", capturedAt: new Date().toISOString(), responses };
  } finally {
    await browser.close();
  }
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
    : JSON.parse(readFileSync(options.fixture, "utf8"));
  const snapshot = mapOrdioPayload(raw, options);
  const validation = validateSnapshot(snapshot);
  const summary = snapshotSummary(snapshot);

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
