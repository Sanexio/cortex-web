import { createHash } from "node:crypto";

function cleanText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKey(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function stableHash(value, length = 16) {
  return createHash("sha256").update(String(value)).digest("hex").slice(0, length);
}

function normalizeName(value) {
  return displayNameFromOrdioName(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function nameTokens(value) {
  const stopwords = new Set(["von", "van", "de", "del", "der", "den", "zu", "zur", "zum"]);
  return normalizeName(value).split(" ").filter((token) => token.length > 1 && !stopwords.has(token));
}

function nameSignature(value) {
  return [...new Set(nameTokens(value))].sort().join(" ");
}

function nameInitials(value) {
  return nameTokens(value).map((token) => token[0]?.toUpperCase()).filter(Boolean).join("");
}

function employeeNumberSourceId(value) {
  const raw = cleanText(value);
  const match = raw.match(/\b(?:pnr|personal(?:nummer)?|mitarbeiter(?:nummer)?|employee)?\s*#?\s*([0-9]{1,8})\b/i);
  return match ? `employee-number-${Number(match[1])}` : null;
}

function isoDate(value) {
  const raw = cleanText(value);
  const iso = raw.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const de = raw.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})\b/);
  if (!de) return null;
  const year = de[3].length === 2 ? `20${de[3]}` : de[3];
  return `${year}-${de[2].padStart(2, "0")}-${de[1].padStart(2, "0")}`;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function hhmm(value) {
  const raw = cleanText(value);
  const match = raw.match(/\b(\d{1,2}):(\d{2})\b/);
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function minutes(value) {
  const raw = cleanText(value).toLowerCase();
  if (!raw || raw === "-" || raw === "—") return 0;
  const clock = raw.match(/\b(\d{1,2}):(\d{2})\b/);
  if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
  const hourMinute = raw.match(/(?:(\d+(?:[,.]\d+)?)\s*h)?\s*(?:(\d+)\s*m(?:in)?)?/);
  if (hourMinute && (hourMinute[1] || hourMinute[2])) {
    return Math.round(Number(String(hourMinute[1] ?? "0").replace(",", ".")) * 60) + Number(hourMinute[2] ?? 0);
  }
  const numeric = raw.match(/\b\d+\b/);
  return numeric ? Number(numeric[0]) : 0;
}

function displayNameFromOrdioName(value) {
  const name = cleanText(value);
  if (!name.includes(",")) return name;
  const [last, first] = name.split(",", 2).map((part) => part.trim()).filter(Boolean);
  return [first, last].filter(Boolean).join(" ");
}

function sourceIdFromRecord(record, fallbackPrefix, fallbackValue) {
  const existing = cleanText(record.sourceId ?? record.id ?? record.uuid ?? record.__rowId ?? "");
  return existing || `${fallbackPrefix}_${stableHash(fallbackValue)}`;
}

function cellFor(row, names, fallbackIndex = null) {
  const dataKeys = Object.keys(row).filter((key) => key !== "__cells" && key !== "__rowId");
  for (const name of names) {
    const key = normalizeKey(name);
    // Exact header match first.
    if (row[key]) return row[key];
    // Then substring match — real Ordio headers are compound, e.g. the
    // name column is "name_nachname_vorname", not bare "name" (verified
    // live 2026-06-05). Match the first column key containing the needle.
    const hit = dataKeys.find((candidate) => candidate.includes(key) && row[candidate]);
    if (hit) return row[hit];
  }
  if (fallbackIndex !== null) return row.__cells?.[fallbackIndex] ?? "";
  return "";
}

function tableBlocks(html) {
  return [...String(html).matchAll(/<table\b[\s\S]*?<\/table>/gi)].map((match) => match[0]);
}

function rowBlocks(tableHtml, section = "") {
  const scoped = section
    ? tableHtml.match(new RegExp(`<${section}\\b[\\s\\S]*?<\\/${section}>`, "i"))?.[0] ?? ""
    : tableHtml;
  return [...scoped.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((match) => match[0]);
}

function cellTexts(rowHtml, selector = "t[dh]") {
  return [...rowHtml.matchAll(new RegExp(`<${selector}\\b[^>]*>([\\s\\S]*?)<\\/${selector}>`, "gi"))]
    .map((match) => cleanText(match[1]));
}

function rowId(rowHtml) {
  const attr = rowHtml.match(/\b(?:data-row-key|data-id|data-testid|id)=["']([^"']+)["']/i);
  return attr ? cleanText(attr[1]) : "";
}

// The /work-hours page renders THREE tables (probe 2026-06-05): the real
// 14-column time table plus two empty summary tables whose headers also
// contain "Name" + "Datum". Require the time-specific columns (start AND
// ende) so the empty Differenz/Zeit tables are skipped, and among matches
// keep the one with the most data rows.
function isWorkHoursHeaders(normalizedHeaders) {
  const has = (needle) => normalizedHeaders.some((header) => header.includes(needle));
  return has("name") && has("datum") && has("start") && has("ende");
}

export function parseWorkHoursHtml(html) {
  const tables = tableBlocks(html);
  let best = [];
  for (const table of tables) {
    const headerRow = rowBlocks(table, "thead")[0] ?? rowBlocks(table)[0] ?? "";
    const headers = cellTexts(headerRow, "th");
    const normalizedHeaders = headers.map(normalizeKey);
    if (!isWorkHoursHeaders(normalizedHeaders)) continue;

    const rows = rowBlocks(table, "tbody")
      .map((rowHtml) => {
        const cells = cellTexts(rowHtml, "t[dh]");
        const row = { __cells: cells, __rowId: rowId(rowHtml) };
        headers.forEach((header, index) => {
          row[normalizeKey(header)] = cells[index] ?? "";
        });
        return row;
      })
      .filter((row) => row.__cells.some(Boolean));
    if (rows.length > best.length) best = rows;
  }
  return best;
}

export function parseEmployeesHtml(html) {
  const rows = [];
  for (const table of tableBlocks(html)) {
    const headerRow = rowBlocks(table, "thead")[0] ?? rowBlocks(table)[0] ?? "";
    const headers = cellTexts(headerRow, "th");
    const normalizedHeaders = headers.map(normalizeKey);
    const hasName = normalizedHeaders.some((header) => header.includes("name"));
    // Ordio's personnel-number column header is "PNr." (→ "pnr"), not
    // "Personalnummer" (verified live 2026-06-05 via deep probe).
    const hasNumber = normalizedHeaders.some((header) => header.includes("personal") || header.includes("nummer") || header === "pnr" || header.includes("pnr"));
    if (!hasName || !hasNumber) continue;
    for (const rowHtml of rowBlocks(table, "tbody")) {
      const cells = cellTexts(rowHtml, "t[dh]");
      const row = { __cells: cells, __rowId: rowId(rowHtml) };
      headers.forEach((header, index) => {
        row[normalizeKey(header)] = cells[index] ?? "";
      });
      const name = displayNameFromOrdioName(cellFor(row, ["name", "Name"], 0));
      const number = cellFor(row, ["pnr", "personalnummer", "personal", "nummer", "Personalnummer"], 1);
      if (name && number) rows.push({ displayName: name, employeeNumber: cleanText(number), sourceId: employeeNumberSourceId(number) });
    }
  }

  if (rows.length) return rows.filter((row) => row.sourceId);

  for (const match of String(html).matchAll(/<(?:li|div|article)\b[^>]*(?:data-testid|role)=["'][^"']*(?:employee|listitem|row)[^"']*["'][^>]*>([\s\S]*?)<\/(?:li|div|article)>/gi)) {
    const text = cleanText(match[1]);
    const sourceId = employeeNumberSourceId(text);
    if (!sourceId) continue;
    const withoutNumber = text.replace(/\b(?:pnr|personal(?:nummer)?|mitarbeiter(?:nummer)?|employee)?\s*#?\s*[0-9]{1,8}\b/i, "").trim();
    if (withoutNumber) rows.push({ displayName: displayNameFromOrdioName(withoutNumber), employeeNumber: sourceId.replace("employee-number-", ""), sourceId });
  }
  return rows;
}

function elementBlocks(html, pattern) {
  return [...String(html).matchAll(pattern)].map((match) => match[0]);
}

function attrValue(html, name) {
  const match = String(html).match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"));
  return match ? cleanText(match[1]) : "";
}

export function parseAbsencesHtml(html) {
  return elementBlocks(html, /<div\b[^>]*data-testid=["']absence-bar-[^"']*["'][\s\S]*?<\/div>/gi)
    .map((block) => {
      const aria = attrValue(block, "aria-label");
      const testId = attrValue(block, "data-testid");
      const text = cleanText(block);
      const match = aria.match(/Zeitraum\s+f(?:ü|ue)r\s+(.+?)\s+am\s+(\d{1,2}\.\d{1,2}\.\d{2,4})/i);
      const employeeName = match ? displayNameFromOrdioName(match[1]) : displayNameFromOrdioName(attrValue(block, "data-employee") || text);
      const startDate = isoDate(attrValue(block, "data-start") || attrValue(block, "data-date") || match?.[2] || text);
      const endDate = isoDate(attrValue(block, "data-end")) || startDate;
      const type = attrValue(block, "data-type") || text.match(/\b(Urlaub|Krank|Fortbildung|Abwesenheit|Fehltag)\b/i)?.[1] || "Abwesenheit";
      const status = attrValue(block, "data-status") || text.match(/\b(genehmigt|abgelehnt|offen|beantragt)\b/i)?.[1] || "offen";
      return { __rowId: testId, employeeName, startsOn: startDate, endsOn: endDate, type, status, rawText: text };
    })
    .filter((row) => row.employeeName && row.startsOn && row.endsOn);
}

export function parsePlanHtml(html) {
  const blocks = elementBlocks(html, /<[^>]+\bdata-testid=["'][^"']*(?:shift|plan)[^"']*["'][\s\S]*?<\/(?:div|article|li|tr)>/gi);
  return blocks
    .map((block) => {
      const text = cleanText(block);
      const testId = attrValue(block, "data-testid") || rowId(block);
      const date = isoDate(attrValue(block, "data-date") || text);
      const startTime = hhmm(attrValue(block, "data-start") || text);
      const endTime = hhmm(attrValue(block, "data-end") || text.replace(startTime || "", ""));
      const area = attrValue(block, "data-area") || text.match(/\b(?:Bereich|Area):?\s*([^|,;]+)\b/i)?.[1] || "Ohne Bereich";
      const location = attrValue(block, "data-location") || text.match(/\b(?:Standort|Location):?\s*([^|,;]+)\b/i)?.[1] || "Ordio";
      const employeeRaw = attrValue(block, "data-employee") || text.match(/\b(?:Mitarbeiter|Name):?\s*([^|,;]+)\b/i)?.[1] || "";
      const assignmentNames = employeeRaw ? [displayNameFromOrdioName(employeeRaw)] : [];
      return { __rowId: testId, date, startTime, endTime, area: cleanText(area), location: cleanText(location), assignmentNames };
    })
    .filter((row) => row.date && row.startTime && row.endTime);
}

export async function extractWorkHoursRowsFromPage(page) {
  return page.evaluate(() => {
    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const normalize = (value) => clean(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    // Three tables render on /work-hours; require start+ende and keep the
    // one with the most rows (the empty summary tables also have name+datum).
    let best = [];
    for (const table of document.querySelectorAll("table")) {
      const headers = [...table.querySelectorAll("thead th")].map((cell) => clean(cell.innerText));
      const keys = headers.map(normalize);
      const has = (needle) => keys.some((key) => key.includes(needle));
      if (!(has("name") && has("datum") && has("start") && has("ende"))) continue;

      const rows = [...table.querySelectorAll("tbody tr")].map((tr) => {
        const cells = [...tr.querySelectorAll("td, th")].map((cell) => clean(cell.innerText));
        const row = {
          __cells: cells,
          __rowId: tr.getAttribute("data-row-key") || tr.getAttribute("data-id") || tr.id || tr.getAttribute("data-testid") || ""
        };
        headers.forEach((header, index) => {
          row[normalize(header)] = cells[index] || "";
        });
        return row;
      }).filter((row) => row.__cells.some(Boolean));
      if (rows.length > best.length) best = rows;
    }
    return best;
  });
}

export async function extractEmployeeRowsFromPage(page) {
  return page.evaluate(() => {
    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const normalize = (value) => clean(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    const numberFrom = (value) => {
      const match = clean(value).match(/\b(?:pnr|personal(?:nummer)?|mitarbeiter(?:nummer)?|employee)?\s*#?\s*([0-9]{1,8})\b/i);
      return match ? match[1] : "";
    };

    // Ordio's personnel-number column header is "PNr." (→ "pnr"), not
    // "Personalnummer" (verified live 2026-06-05).
    const isNumberKey = (key) => key.includes("personal") || key.includes("nummer") || key.includes("pnr");
    for (const table of document.querySelectorAll("table")) {
      const headers = [...table.querySelectorAll("thead th")].map((cell) => clean(cell.innerText));
      const keys = headers.map(normalize);
      const hasName = keys.some((key) => key.includes("name"));
      const hasNumber = keys.some(isNumberKey);
      if (!hasName || !hasNumber) continue;
      const rows = [...table.querySelectorAll("tbody tr")].map((tr) => {
        const cells = [...tr.querySelectorAll("td, th")].map((cell) => clean(cell.innerText));
        const row = {};
        headers.forEach((header, index) => { row[normalize(header)] = cells[index] || ""; });
        const nameKey = Object.keys(row).find((key) => key.includes("name"));
        const numberKey = Object.keys(row).find(isNumberKey);
        const employeeNumber = numberFrom(row[numberKey] || cells.join(" "));
        return {
          displayName: row[nameKey] || cells[0] || "",
          employeeNumber,
          sourceId: employeeNumber ? `employee-number-${Number(employeeNumber)}` : ""
        };
      }).filter((row) => row.displayName && row.sourceId);
      if (rows.length) return rows;
    }

    return [...document.querySelectorAll("[data-testid*='employee'], [role='listitem'], article")]
      .map((el) => {
        const text = clean(el.innerText);
        const employeeNumber = numberFrom(text);
        return {
          displayName: employeeNumber ? text.replace(new RegExp(`\\\\b(?:pnr|personal(?:nummer)?|mitarbeiter(?:nummer)?|employee)?\\\\s*#?\\\\s*${employeeNumber}\\\\b`, "i"), "").trim() : "",
          employeeNumber,
          sourceId: employeeNumber ? `employee-number-${Number(employeeNumber)}` : ""
        };
      })
      .filter((row) => row.displayName && row.sourceId);
  });
}

export async function extractAbsenceRowsFromPage(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('div[data-testid^="absence-bar-"]')].map((el) => ({
      __rowId: el.getAttribute("data-testid") || "",
      ariaLabel: el.getAttribute("aria-label") || "",
      employeeName: el.getAttribute("data-employee") || "",
      startsOn: el.getAttribute("data-start") || el.getAttribute("data-date") || "",
      endsOn: el.getAttribute("data-end") || "",
      type: el.getAttribute("data-type") || "",
      status: el.getAttribute("data-status") || "",
      rawText: String(el.innerText || "").replace(/\s+/g, " ").trim()
    }))
  );
}

export async function extractPlanRowsFromPage(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('[data-testid*="shift"], [data-testid*="plan"], tr')]
      .map((el) => ({
        __rowId: el.getAttribute("data-testid") || el.getAttribute("data-row-key") || el.id || "",
        date: el.getAttribute("data-date") || "",
        startTime: el.getAttribute("data-start") || "",
        endTime: el.getAttribute("data-end") || "",
        area: el.getAttribute("data-area") || "",
        location: el.getAttribute("data-location") || "",
        employeeName: el.getAttribute("data-employee") || "",
        rawText: String(el.innerText || "").replace(/\s+/g, " ").trim()
      }))
  );
}

export function buildEmployeeResolver({ employeeRows = [], existingEmployees = [] } = {}) {
  const byName = new Map();
  const bySignature = new Map();
  const byInitials = new Map();
  const byNumber = new Map();
  const addUnique = (map, key, value) => {
    if (!key) return;
    const current = map.get(key);
    if (!current) map.set(key, value);
    else if (current.sourceId !== value.sourceId) map.set(key, { ...current, ambiguous: true });
  };
  const add = (record) => {
    const displayName = displayNameFromOrdioName(record.displayName ?? record.name ?? "");
    const sourceId = cleanText(record.sourceId ?? employeeNumberSourceId(record.employeeNumber) ?? "");
    if (!displayName || !sourceId) return;
    const value = { sourceId, displayName, match: "name" };
    addUnique(byName, normalizeName(displayName), value);
    addUnique(bySignature, nameSignature(displayName), { ...value, match: "name_signature" });
    addUnique(byInitials, nameInitials(displayName), { ...value, match: "initials" });
    const numberId = employeeNumberSourceId(record.employeeNumber ?? sourceId);
    if (numberId) byNumber.set(numberId, { sourceId, displayName, match: "employee_number" });
  };
  existingEmployees.forEach(add);
  employeeRows.forEach(add);
  return {
    resolve(rowOrName) {
      const displayName = typeof rowOrName === "string"
        ? displayNameFromOrdioName(rowOrName)
        : displayNameFromOrdioName(cellFor(rowOrName, ["name", "Name"], 0));
      const numberId = typeof rowOrName === "string"
        ? null
        : employeeNumberSourceId(cellFor(rowOrName, ["pnr", "personalnummer", "personal", "nummer", "Personalnummer"], null));
      if (numberId && byNumber.has(numberId)) return byNumber.get(numberId);
      const nameKey = normalizeName(displayName);
      const signatureKey = nameSignature(displayName);
      const initialsKey = nameInitials(displayName);
      for (const candidate of [byName.get(nameKey), bySignature.get(signatureKey), byInitials.get(initialsKey)]) {
        if (candidate && !candidate.ambiguous) return candidate;
      }
      const tokens = nameTokens(displayName);
      const fuzzy = [...bySignature.entries()].find(([signature, value]) =>
        !value.ambiguous && tokens.length >= 2 && tokens.every((token) => signature.includes(token))
      )?.[1];
      if (fuzzy) return { ...fuzzy, match: "name_fuzzy" };
      return { sourceId: null, displayName, match: "unresolved" };
    },
    initialsFor(value) {
      return nameInitials(value);
    }
  };
}

function mapResolvedEmployee(resolver, employeeName, capturedAt, unresolvedEmployees) {
  const resolved = resolver.resolve(employeeName);
  if (resolved.sourceId) {
    return {
      employeeSourceId: resolved.sourceId,
      employee: {
        sourceId: resolved.sourceId,
        displayName: resolved.displayName || employeeName,
        roleTitle: "Mitarbeiter",
        initials: nameInitials(employeeName).slice(0, 3),
        employmentStatus: "active",
        updatedAt: capturedAt
      }
    };
  }
  unresolvedEmployees.set(employeeName, {
    displayName: employeeName,
    initials: nameInitials(employeeName),
    reason: "no_employee_source_id_match"
  });
  return { employeeSourceId: null, employee: null };
}

export function mapWorkHoursRows(rows, options = {}) {
  const capturedAt = options.capturedAt ?? new Date().toISOString();
  const resolver = options.employeeResolver ?? buildEmployeeResolver({
    employeeRows: options.employeeRows ?? [],
    existingEmployees: options.existingEmployees ?? []
  });
  const employeesBySourceId = new Map();
  const locationNames = new Set();
  const areaNames = new Set();
  const timeEntries = [];
  const unresolvedEmployees = new Map();

  for (const row of rows) {
    const employeeName = displayNameFromOrdioName(cellFor(row, ["name", "Name"], 0));
    const startDate = isoDate(cellFor(row, ["datum", "Datum"], 1));
    const startTime = hhmm(cellFor(row, ["start", "Start"], 2));
    const endTime = hhmm(cellFor(row, ["ende", "Ende"], 3));
    if (!employeeName || !startDate || !startTime || !endTime) continue;
    if (options.from && startDate < options.from) continue;
    if (options.to && startDate > options.to) continue;

    const resolved = mapResolvedEmployee(resolver, employeeName, capturedAt, unresolvedEmployees);
    const employeeSourceId = resolved.employeeSourceId;
    const area = cleanText(cellFor(row, ["bereich", "Bereich"], 8)) || "Ohne Bereich";
    const location = cleanText(cellFor(row, ["standort", "Standort"], 9)) || options.defaultLocation || "Ordio";
    const violationRaw = cleanText(cellFor(row, ["verstoss", "verstoß", "Verstoss", "Verstoß"], 10));
    const violation = violationRaw === "-" || violationRaw === "—" ? "" : violationRaw;
    const rowKey = cleanText(row.__rowId);
    const sourceId = rowKey || `time_${stableHash(`${employeeName}|${startDate}|${startTime}|${endTime}`)}`;

    if (employeeSourceId) {
      employeesBySourceId.set(employeeSourceId, resolved.employee);
    }
    const unresolvedNote = employeeSourceId ? "" : "UNRESOLVED_EMPLOYEE: keine bestehende employee-source_id gefunden";
    const note = [violation ? `Ordio-Verstoss: ${violation}` : "", unresolvedNote].filter(Boolean).join(" | ") || null;
    areaNames.add(area);
    locationNames.add(location);
    const entry = {
      sourceId,
      employeeSourceId: employeeSourceId ?? null,
      employeeName,
      startDate,
      startTime,
      endDate: endTime <= startTime ? null : startDate,
      endTime,
      area,
      location,
      status: cleanText(cellFor(row, ["status", "Status"], 7)) || "erfasst",
      paidBreakMinutes: 0,
      unpaidBreakMinutes: minutes(cellFor(row, ["pause", "Pause"], 5)),
      note,
      updatedAt: capturedAt
    };
    if (!timeEntries.some((existing) => existing.sourceId === entry.sourceId)) {
      timeEntries.push(entry);
    }
  }

  return {
    employees: [...employeesBySourceId.values()],
    locations: [...locationNames].map((name) => ({
      sourceId: `location_${stableHash(name)}`,
      name,
      updatedAt: capturedAt
    })),
    workAreas: [...areaNames].map((name) => ({
      sourceId: `area_${stableHash(name)}`,
      name,
      updatedAt: capturedAt
    })),
    timeEntries,
    unresolvedEmployees: [...unresolvedEmployees.values()]
  };
}

export function mapAbsenceRows(rows, options = {}) {
  const capturedAt = options.capturedAt ?? new Date().toISOString();
  const resolver = options.employeeResolver ?? buildEmployeeResolver({
    employeeRows: options.employeeRows ?? [],
    existingEmployees: options.existingEmployees ?? []
  });
  const employeesBySourceId = new Map();
  const unresolvedEmployees = new Map();
  const absences = [];
  for (const row of rows) {
    const aria = cleanText(row.ariaLabel ?? "");
    const ariaMatch = aria.match(/Zeitraum\s+f(?:ü|ue)r\s+(.+?)\s+am\s+(\d{1,2}\.\d{1,2}\.\d{2,4})/i);
    const employeeName = displayNameFromOrdioName(row.employeeName || ariaMatch?.[1] || row.rawText || "");
    const startsOn = isoDate(row.startsOn || ariaMatch?.[2] || row.rawText);
    const endsOn = isoDate(row.endsOn) || startsOn;
    if (!employeeName || !startsOn || !endsOn) continue;
    if (options.from && endsOn < options.from) continue;
    if (options.to && startsOn > options.to) continue;
    const resolved = mapResolvedEmployee(resolver, employeeName, capturedAt, unresolvedEmployees);
    if (resolved.employee) employeesBySourceId.set(resolved.employeeSourceId, resolved.employee);
    const sourceId = sourceIdFromRecord(row, "absence", `${employeeName}|${startsOn}|${endsOn}|${row.type ?? ""}`);
    const unresolvedNote = resolved.employeeSourceId ? "" : "UNRESOLVED_EMPLOYEE: keine bestehende employee-source_id gefunden";
    absences.push({
      sourceId,
      employeeSourceId: resolved.employeeSourceId,
      employeeName,
      startsOn,
      endsOn,
      type: cleanText(row.type) || "Abwesenheit",
      status: cleanText(row.status) || "offen",
      note: unresolvedNote || null,
      updatedAt: capturedAt
    });
  }
  return { employees: [...employeesBySourceId.values()], absences, unresolvedEmployees: [...unresolvedEmployees.values()] };
}

export function mapPlanRows(rows, options = {}) {
  const capturedAt = options.capturedAt ?? new Date().toISOString();
  const resolver = options.employeeResolver ?? buildEmployeeResolver({
    employeeRows: options.employeeRows ?? [],
    existingEmployees: options.existingEmployees ?? []
  });
  const employeesBySourceId = new Map();
  const areaNames = new Set();
  const locationNames = new Set();
  const unresolvedEmployees = new Map();
  const shifts = [];
  for (const row of rows) {
    const date = isoDate(row.date || row.rawText);
    const startTime = hhmm(row.startTime || row.rawText);
    const endTime = hhmm(row.endTime || String(row.rawText ?? "").replace(startTime || "", ""));
    if (!date || !startTime || !endTime) continue;
    if (options.from && date < options.from) continue;
    if (options.to && date > options.to) continue;
    const assignmentNames = (row.assignmentNames?.length ? row.assignmentNames : [row.employeeName]).filter(Boolean);
    const assignmentSourceIds = [];
    for (const name of assignmentNames) {
      const employeeName = displayNameFromOrdioName(name);
      const resolved = mapResolvedEmployee(resolver, employeeName, capturedAt, unresolvedEmployees);
      if (resolved.employee) {
        employeesBySourceId.set(resolved.employeeSourceId, resolved.employee);
        assignmentSourceIds.push(resolved.employeeSourceId);
      }
    }
    const area = cleanText(row.area) || "Ohne Bereich";
    const location = cleanText(row.location) || options.defaultLocation || "Ordio";
    areaNames.add(area);
    locationNames.add(location);
    shifts.push({
      sourceId: sourceIdFromRecord(row, "shift", `${date}|${startTime}|${endTime}|${area}|${assignmentSourceIds.join(",")}`),
      startDate: date,
      startTime,
      endDate: endTime <= startTime ? addDays(date, 1) : date,
      endTime,
      area,
      location,
      requiredStaff: Math.max(1, assignmentSourceIds.length || assignmentNames.length || Number(row.requiredStaff ?? 1) || 1),
      note: cleanText(row.note) || null,
      assignmentSourceIds,
      assignmentNames,
      updatedAt: capturedAt
    });
  }
  return {
    employees: [...employeesBySourceId.values()],
    workAreas: [...areaNames].map((name) => ({ sourceId: `area_${stableHash(name)}`, name, updatedAt: capturedAt })),
    locations: [...locationNames].map((name) => ({ sourceId: `location_${stableHash(name)}`, name, updatedAt: capturedAt })),
    shifts,
    unresolvedEmployees: [...unresolvedEmployees.values()]
  };
}
