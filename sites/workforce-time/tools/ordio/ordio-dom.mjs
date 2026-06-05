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

export function buildEmployeeResolver({ employeeRows = [], existingEmployees = [] } = {}) {
  const byName = new Map();
  const byNumber = new Map();
  const add = (record) => {
    const displayName = displayNameFromOrdioName(record.displayName ?? record.name ?? "");
    const sourceId = cleanText(record.sourceId ?? employeeNumberSourceId(record.employeeNumber) ?? "");
    if (!displayName || !sourceId) return;
    byName.set(normalizeName(displayName), { sourceId, displayName, match: "name" });
    const numberId = employeeNumberSourceId(record.employeeNumber ?? sourceId);
    if (numberId) byNumber.set(numberId, { sourceId, displayName, match: "employee_number" });
  };
  existingEmployees.forEach(add);
  employeeRows.forEach(add);
  return {
    resolve(row) {
      const displayName = displayNameFromOrdioName(cellFor(row, ["name", "Name"], 0));
      const numberId = employeeNumberSourceId(cellFor(row, ["personalnummer", "personal", "nummer", "Personalnummer"], null));
      if (numberId && byNumber.has(numberId)) return byNumber.get(numberId);
      const nameKey = normalizeName(displayName);
      if (nameKey && byName.has(nameKey)) return byName.get(nameKey);
      return { sourceId: null, displayName, match: "unresolved" };
    }
  };
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

    const resolvedEmployee = resolver.resolve(row);
    const employeeSourceId = resolvedEmployee.sourceId;
    const area = cleanText(cellFor(row, ["bereich", "Bereich"], 8)) || "Ohne Bereich";
    const location = cleanText(cellFor(row, ["standort", "Standort"], 9)) || options.defaultLocation || "Ordio";
    const violationRaw = cleanText(cellFor(row, ["verstoss", "verstoß", "Verstoss", "Verstoß"], 10));
    const violation = violationRaw === "-" || violationRaw === "—" ? "" : violationRaw;
    const rowKey = cleanText(row.__rowId);
    const sourceId = rowKey || `time_${stableHash(`${employeeName}|${startDate}|${startTime}|${endTime}`)}`;

    if (employeeSourceId) {
      employeesBySourceId.set(employeeSourceId, {
        sourceId: employeeSourceId,
        displayName: resolvedEmployee.displayName || employeeName,
        roleTitle: "Mitarbeiter",
        initials: employeeName.split(/\s+/).map((part) => part[0]).join("").slice(0, 3).toUpperCase(),
        employmentStatus: "active",
        updatedAt: capturedAt
      });
    } else {
      unresolvedEmployees.set(employeeName, { displayName: employeeName, reason: "no_employee_source_id_match" });
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
