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
  for (const name of names) {
    const key = normalizeKey(name);
    if (row[key]) return row[key];
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

export function parseWorkHoursHtml(html) {
  const tables = tableBlocks(html);
  for (const table of tables) {
    const headerRow = rowBlocks(table, "thead")[0] ?? rowBlocks(table)[0] ?? "";
    const headers = cellTexts(headerRow, "th");
    const normalizedHeaders = headers.map(normalizeKey);
    if (!normalizedHeaders.some((header) => header.includes("name")) || !normalizedHeaders.some((header) => header.includes("datum"))) {
      continue;
    }

    const bodyRows = rowBlocks(table, "tbody");
    return bodyRows
      .map((rowHtml) => {
        const cells = cellTexts(rowHtml, "t[dh]");
        const row = { __cells: cells, __rowId: rowId(rowHtml) };
        headers.forEach((header, index) => {
          row[normalizeKey(header)] = cells[index] ?? "";
        });
        return row;
      })
      .filter((row) => row.__cells.some(Boolean));
  }
  return [];
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

    for (const table of document.querySelectorAll("table")) {
      const headers = [...table.querySelectorAll("thead th")].map((cell) => clean(cell.innerText));
      const keys = headers.map(normalize);
      if (!keys.some((key) => key.includes("name")) || !keys.some((key) => key.includes("datum"))) continue;

      return [...table.querySelectorAll("tbody tr")].map((tr) => {
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
    }
    return [];
  });
}

export function mapWorkHoursRows(rows, options = {}) {
  const capturedAt = options.capturedAt ?? new Date().toISOString();
  const employeesByName = new Map();
  const locationNames = new Set();
  const areaNames = new Set();
  const timeEntries = [];

  for (const row of rows) {
    const employeeName = displayNameFromOrdioName(cellFor(row, ["name", "Name"], 0));
    const startDate = isoDate(cellFor(row, ["datum", "Datum"], 1));
    const startTime = hhmm(cellFor(row, ["start", "Start"], 2));
    const endTime = hhmm(cellFor(row, ["ende", "Ende"], 3));
    if (!employeeName || !startDate || !startTime || !endTime) continue;
    if (options.from && startDate < options.from) continue;
    if (options.to && startDate > options.to) continue;

    const employeeSourceId = `employee_${stableHash(employeeName)}`;
    const area = cleanText(cellFor(row, ["bereich", "Bereich"], 8)) || "Ohne Bereich";
    const location = cleanText(cellFor(row, ["standort", "Standort"], 9)) || options.defaultLocation || "Ordio";
    const violationRaw = cleanText(cellFor(row, ["verstoss", "verstoß", "Verstoss", "Verstoß"], 10));
    const violation = violationRaw === "-" || violationRaw === "—" ? "" : violationRaw;
    const rowKey = cleanText(row.__rowId);
    const sourceId = rowKey || `time_${stableHash(`${employeeName}|${startDate}|${startTime}|${endTime}`)}`;

    employeesByName.set(employeeName, {
      sourceId: employeeSourceId,
      displayName: employeeName,
      roleTitle: "Mitarbeiter",
      initials: employeeName.split(/\s+/).map((part) => part[0]).join("").slice(0, 3).toUpperCase(),
      employmentStatus: "active",
      updatedAt: capturedAt
    });
    areaNames.add(area);
    locationNames.add(location);
    timeEntries.push({
      sourceId,
      employeeSourceId,
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
      note: violation ? `Ordio-Verstoss: ${violation}` : null,
      updatedAt: capturedAt
    });
  }

  return {
    employees: [...employeesByName.values()],
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
    timeEntries
  };
}
