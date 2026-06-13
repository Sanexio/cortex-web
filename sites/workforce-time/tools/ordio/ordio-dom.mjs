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

function normalizeLookup(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " ")
    .replace(/\b(?:und|and)\b/g, " ")
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

function isoDateFromText(value, fallbackYear = null) {
  const direct = isoDate(value);
  if (direct) return direct;
  const raw = cleanText(value).toLowerCase();
  const months = {
    januar: "01",
    februar: "02",
    maerz: "03",
    märz: "03",
    april: "04",
    mai: "05",
    juni: "06",
    juli: "07",
    august: "08",
    september: "09",
    oktober: "10",
    november: "11",
    dezember: "12"
  };
  const match = raw.match(/\b(\d{1,2})\.?\s+(januar|februar|maerz|märz|april|mai|juni|juli|august|september|oktober|november|dezember)(?:\s+(\d{4}))?\b/i);
  if (!match) return null;
  const year = match[3] || fallbackYear;
  return year ? `${year}-${months[match[2]]}-${match[1].padStart(2, "0")}` : null;
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

export function buildNameResolver({ knownNames = [], aliases = {}, fallbackName = "" } = {}) {
  const byKey = new Map();
  for (const name of knownNames) {
    const clean = cleanText(name);
    if (clean) byKey.set(normalizeLookup(clean), clean);
  }
  for (const [canonical, values] of Object.entries(aliases || {})) {
    const canonicalName = byKey.get(normalizeLookup(canonical)) || cleanText(canonical);
    if (!canonicalName) continue;
    byKey.set(normalizeLookup(canonicalName), canonicalName);
    for (const value of Array.isArray(values) ? values : [values]) {
      const alias = normalizeLookup(value);
      if (alias) byKey.set(alias, canonicalName);
    }
  }
  return {
    resolve(value) {
      const raw = cleanText(value);
      if (!raw) return { name: fallbackName, resolved: false, raw };
      const exact = byKey.get(normalizeLookup(raw));
      if (exact) return { name: exact, resolved: true, raw };
      if (byKey.size === 0) return { name: raw, resolved: true, raw };
      const tokens = normalizeLookup(raw).split(" ").filter(Boolean);
      const fuzzy = [...byKey.entries()].find(([key]) =>
        tokens.length > 0 && tokens.every((token) => key.includes(token))
      )?.[1];
      if (fuzzy) return { name: fuzzy, resolved: true, raw };
      return { name: fallbackName || raw, resolved: false, raw };
    }
  };
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

function decodeHtmlEntities(value) {
  return String(value ?? "")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&#x22;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function rawAttrValue(html, name) {
  const match = String(html).match(new RegExp(`\\b${name}=["']([^"']*)["']`, "i"));
  return match ? decodeHtmlEntities(match[1]) : "";
}

function cleanLines(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "\n")
    .split(/\r?\n/)
    .map(cleanText)
    .filter(Boolean);
}

function parseDateRangeLine(value) {
  const match = cleanText(value).match(/(\d{1,2}\.\d{1,2}\.\d{2,4})\s*-\s*(\d{1,2}\.\d{1,2}\.\d{2,4})/);
  if (!match) return null;
  const startsOn = isoDateFromText(match[1]);
  const endsOn = isoDateFromText(match[2], startsOn?.slice(0, 4)) || startsOn;
  return startsOn && endsOn ? { startsOn, endsOn } : null;
}

function isDurationLine(value) {
  return /^\d+(?:[,.]\d+)?\s+(?:tag|tage|day|days|std\.?|stunden|hour|hours)\b/i.test(cleanText(value));
}

function isAbsenceTypeLine(value) {
  return /^(?:urlaub|krankheit|krank|feiertagsausgleich|fortbildung|abwesenheit|fehltag|frei)$/i.test(cleanText(value));
}

function isDateLikeLine(value) {
  const line = cleanText(value);
  return Boolean(isoDateFromText(line) || parseDateRangeLine(line) || /^(?:mo|di|mi|do|fr|sa|so|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/i.test(line));
}

function personNameFromLines(lines) {
  const candidates = lines
    .map((line) => cleanText(line).replace(/^\d+\s+(?!tag(?:e)?\b|day(?:s)?\b)/i, ""))
    .filter((line) => line && !isDurationLine(line) && !isAbsenceTypeLine(line) && !isDateLikeLine(line));
  const withComma = candidates.find((line) => line.includes(","));
  if (withComma) return displayNameFromOrdioName(withComma);
  const twoWords = candidates.find((line) => normalizeName(line).split(" ").filter(Boolean).length >= 2);
  return twoWords ? displayNameFromOrdioName(twoWords) : "";
}

function parseAbsenceLabel(label, fallbackText = "") {
  const lines = cleanLines(label);
  const rangeLine = lines.find((line) => parseDateRangeLine(line));
  const range = parseDateRangeLine(rangeLine ?? "");
  const employeeName = personNameFromLines([...lines].reverse().filter((line) => line !== rangeLine));
  const firstLine = lines.find((line) => line !== rangeLine && !isDurationLine(line)) ?? "";
  const firstLineLooksLikeEmployee = employeeName && normalizeName(firstLine) === normalizeName(employeeName);
  const type = firstLine && !firstLineLooksLikeEmployee && !isDurationLine(firstLine) ? firstLine : "";
  const legacy = cleanText(label || fallbackText).match(/Zeitraum\s+f(?:ü|ue)r\s+(.+?)\s+am\s+(\d{1,2}\.\d{1,2}\.\d{2,4})/i);
  return {
    employeeName: employeeName || (legacy ? displayNameFromOrdioName(legacy[1]) : ""),
    startsOn: range?.startsOn || isoDateFromText(legacy?.[2] || ""),
    endsOn: range?.endsOn || isoDateFromText(legacy?.[2] || ""),
    type
  };
}

function absenceStatusFrom(value, pending = false) {
  const raw = cleanText(value);
  if (raw) return raw;
  return pending ? "Beantragt" : "Genehmigt";
}

function sourceIdFromAbsenceId(value) {
  const id = cleanText(value);
  if (!id) return "";
  return id.startsWith("absence-bar-") ? id : `absence-bar-${id}`;
}

function isAbsencePayloadBar(value) {
  return Boolean(
    value
    && typeof value === "object"
    && !Array.isArray(value)
    && value.id != null
    && value.tooltip
    && value.startDayIndex != null
    && value.endDayIndex != null
  );
}

function employeeLabelFromRecord(record, employeeMap) {
  if (!record || typeof record !== "object") return "";
  const id = cleanText(record.employeeId ?? record.employee_id ?? record.userId ?? record.user_id ?? record.id ?? "");
  const mapped = id ? employeeMap.get(id) : "";
  return cleanText(mapped || record.employeeLabel || record.employeeName || record.displayName || record.display_name || record.name || record.label || "");
}

function employeeIdFromRecord(record) {
  if (!record || typeof record !== "object") return "";
  return cleanText(record.employeeId ?? record.employee_id ?? record.userId ?? record.user_id ?? record.id ?? "");
}

function rowsFromAbsencePayload(root, employeeMap = new Map()) {
  const rows = [];
  const seen = new Set();
  const visit = (value, context = {}) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item, context);
      return;
    }

    if (isAbsencePayloadBar(value)) {
      const parsed = parseAbsenceLabel(value.tooltip ?? "", value.label ?? "");
      const tooltipLines = cleanLines(value.tooltip ?? "");
      const sourceId = sourceIdFromAbsenceId(value.id);
      const rowEmployee = displayNameFromOrdioName(context.employeeName || employeeMap.get(context.employeeId) || "");
      const label = cleanText(value.label);
      const labelIsEmployee = rowEmployee && normalizeName(label) === normalizeName(rowEmployee);
      // Ordio-Timeline (verifiziert 2026-06-06): Balken sind eine FLACHE
      // Liste ohne Employee-Wrapper. Das `label` ist bei Urlaub der
      // MITARBEITERNAME, bei Spezial-Typen (Krankheit/Feiertagsausgleich/…)
      // der TYP. Bei Typ-Bars ist der Mitarbeiter in keiner erreichbaren
      // Datenquelle → Eintrag wird mangels Mitarbeiter verworfen (NICHT
      // die Dauer „1 Tag" aus tooltip[3] als Name nehmen).
      const labelIsKnownType = /\b(urlaub|krank|krankheit|feiertag|feiertagsausgleich|fortbildung|abwesen|^frei$|elternzeit|mutterschutz|sonderurlaub|gleitzeit|berufsschule|schule|unbezahlt|bildungsurlaub|kur|reha|pflege|home\s?office|dienstreise|seminar)\b/i.test(label);
      const labelLooksLikeName = label && !labelIsKnownType && !isDurationLine(label) && !parseDateRangeLine(label) && /[A-Za-zÀ-ÿ].*(?:\s|,).*[A-Za-zÀ-ÿ]/.test(label);
      const resolvedEmployeeName = displayNameFromOrdioName(rowEmployee || (labelLooksLikeName ? label : "") || (labelIsEmployee ? label : ""));
      if (!seen.has(sourceId)) {
        seen.add(sourceId);
        rows.push({
          __rowId: sourceId,
          sourceId,
          id: sourceId,
          rowEmployee,
          rowEmployeeId: context.employeeId || "",
          employeeName: resolvedEmployeeName,
          startsOn: parsed.startsOn,
          endsOn: parsed.endsOn,
          type: labelIsKnownType && label && !isDurationLine(label) && !parseDateRangeLine(label)
            ? label
            : (labelLooksLikeName
                ? (tooltipLines[0] && normalizeName(tooltipLines[0]) !== normalizeName(label) && !isDurationLine(tooltipLines[0]) && !parseDateRangeLine(tooltipLines[0]) ? tooltipLines[0] : "Urlaub")
                : (parsed.type || "Abwesenheit")),
          status: absenceStatusFrom(tooltipLines[3], Boolean(value.isPending)),
          rawText: cleanText(value.tooltip),
          ariaLabel: String(value.tooltip ?? "")
        });
      }
      return;
    }

    const ownEmployeeId = employeeIdFromRecord(value);
    const ownEmployeeName = employeeLabelFromRecord(value, employeeMap);
    const nextContext = ownEmployeeName || employeeMap.get(ownEmployeeId)
      ? { employeeId: ownEmployeeId || context.employeeId || "", employeeName: ownEmployeeName || employeeMap.get(ownEmployeeId) || context.employeeName || "" }
      : context;

    for (const [key, child] of Object.entries(value)) {
      if (key === "employees" && Array.isArray(child)) {
        for (const employee of child) visit(employee, {
          employeeId: employeeIdFromRecord(employee),
          employeeName: employeeLabelFromRecord(employee, employeeMap)
        });
      } else if (/^(?:bars|absences|items|records|rows|children|lanes)$/i.test(key)) {
        visit(child, nextContext);
      } else {
        visit(child, nextContext);
      }
    }
  };
  visit(root);
  return rows;
}

function extractJsonCandidatesFromHtml(html) {
  const decoded = decodeHtmlEntities(html);
  const candidates = [];
  for (const match of decoded.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
    const body = match[1]?.trim();
    if (body) candidates.push(body);
  }
  for (const match of decoded.matchAll(/<script\b[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    const body = match[1]?.trim();
    if (body) candidates.push(body);
  }
  if (/^\s*[\[{]/.test(decoded)) candidates.push(decoded);
  return [...new Set(candidates)];
}

function parseJsonCandidate(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  for (const candidate of [
    raw,
    raw.replace(/^self\.__next_f\.push\(\s*/, "").replace(/\s*\)\s*;?$/, ""),
    raw.match(/=\s*({[\s\S]*})\s*;?$/)?.[1] || ""
  ]) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next shape.
    }
  }
  return null;
}

function employeeMapFromAbsencesApi(apiPayload = {}) {
  const employees = Array.isArray(apiPayload?.employees) ? apiPayload.employees : [];
  return new Map(employees
    .map((employee) => [cleanText(employee.id), cleanText(employee.label ?? employee.name ?? employee.displayName)])
    .filter(([id, label]) => id && label));
}

export function parseAbsencePayloadHtml(html, apiPayload = {}) {
  const employeeMap = employeeMapFromAbsencesApi(apiPayload);
  const rows = [];
  const seen = new Set();
  for (const candidate of extractJsonCandidatesFromHtml(html)) {
    const parsed = parseJsonCandidate(candidate);
    if (!parsed) continue;
    for (const row of rowsFromAbsencePayload(parsed, employeeMap)) {
      const key = row.sourceId || row.__rowId;
      if (key && !seen.has(key)) {
        seen.add(key);
        rows.push(row);
      }
    }
  }
  return rows;
}

function absenceElementMatches(html) {
  return [...String(html).matchAll(/<div\b[^>]*data-testid=["']absence-bar-[^"']*["'][\s\S]*?<\/div>/gi)]
    .map((match) => ({ block: match[0], index: match.index ?? 0 }));
}

function absenceRowEmployeeFromContext(html, index) {
  const source = String(html);
  const rowStart = Math.max(
    source.lastIndexOf("<tr", index),
    source.lastIndexOf('role="row"', index),
    source.lastIndexOf("role='row'", index),
    source.lastIndexOf("data-employee", index)
  );
  const context = source.slice(Math.max(0, rowStart > -1 ? rowStart : index - 3000), index);
  const employeeAttr = attrValue(context, "data-employee");
  const employeeNumber = attrValue(context, "data-pnr") || attrValue(context, "data-employee-number") || attrValue(context, "data-personnel-number");
  const rowHeader = context.match(/<(?:th|div|span)\b[^>]*(?:role=["']rowheader["']|data-testid=["'][^"']*(?:employee|row-header|name)[^"']*["'])[^>]*>([\s\S]*?)<\/(?:th|div|span)>/i)?.[1];
  const rowEmployee = displayNameFromOrdioName(employeeAttr || personNameFromLines(cleanLines(rowHeader || context)));
  return { rowEmployee, rowEmployeeNumber: cleanText(employeeNumber) };
}

function shiftElementMatches(html) {
  return [...String(html).matchAll(/<[^>]+\b(?:data-shift-id=["'][^"']+["']|data-testid=["']shift-card-[^"']+["'])[^>]*>[\s\S]*?<\/(?:div|article|li|tr)>/gi)]
    .map((match) => ({ block: match[0], index: match.index ?? 0 }));
}

function planContextDate(html, index) {
  const context = String(html).slice(Math.max(0, index - 4000), index);
  const dates = [...context.matchAll(/\bdata-date=["'](\d{4}-\d{2}-\d{2})["']/gi)].map((match) => match[1]);
  if (dates.length) return dates.at(-1);
  const deDates = [...context.matchAll(/\b(\d{1,2}\.\d{1,2}\.(?:\d{2,4}))\b/g)].map((match) => isoDateFromText(match[1])).filter(Boolean);
  return deDates.at(-1) ?? null;
}

function planAssignmentNames(text, explicitName) {
  if (explicitName) return [displayNameFromOrdioName(explicitName)];
  const match = text.match(/\b(?:Mitarbeiter|Name):?\s*([^|,;\n]+(?:,\s*[^|,;\n]+)?)/i);
  return match ? [displayNameFromOrdioName(match[1])] : [];
}

function parsePlanTextFields(value) {
  const rawLines = cleanLines(value);
  const text = cleanText(value);
  const times = [...text.matchAll(/\b(\d{1,2}:\d{2})\b/g)].map((match) => match[1]);
  const startTime = times[0] ? hhmm(times[0]) : null;
  const endTime = times[1] ? hhmm(times[1]) : null;
  const areaLabeled = text.match(/\b(?:Bereich|Area):\s*([^|,;\n]+)\b/i)?.[1];
  const locationLabeled = text.match(/\b(?:Standort|Location):\s*([^|,;\n]+)\b/i)?.[1];
  const employeeLabeled = text.match(/\b(?:Mitarbeiter|Name):?\s*([^|;\n]+(?:,\s*[^|;\n]+)?)/i)?.[1];
  const lines = rawLines.filter((line) => !/\b\d{1,2}:\d{2}\b/.test(line));
  const locationLine = lines.find((line) => /\b(?:Standort|Location)\b/i.test(line));
  const employeeLine = lines.find((line) => line.includes(",") && line !== locationLine);
  const areaLine = lines.find((line) => line !== locationLine && line !== employeeLine);
  return {
    startTime,
    endTime,
    area: cleanText(areaLabeled || areaLine || ""),
    location: cleanText(locationLabeled || locationLine || ""),
    employeeName: displayNameFromOrdioName(employeeLabeled || employeeLine || "")
  };
}

// Original-Migrations-Methode (verifiziert 2026-06-06 gegen die echte
// archivierte /absences-Seite: 37/37 Records, 37/37 Mitarbeiter korrekt).
// /absences ist pro Mitarbeiter gruppiert: Zeilen-Header (Name im
// `<p class="...font-medium...">`) gefolgt von den Abwesenheits-Balken.
// Mitarbeiter = naechster vorausgehender Header in Dokument-Reihenfolge.
export function parseAbsencesByRowHtml(html) {
  const source = String(html ?? "");
  const events = [];
  for (const m of source.matchAll(/<p[^>]*font-medium[^>]*>([^<]{2,60})<\/p>/gi)) {
    const name = cleanText(m[1]);
    if (/^[A-Za-zÀ-ÿ][\wÀ-ÿ.'-]*(?:\s+[A-Za-zÀ-ÿ][\wÀ-ÿ.'-]*)+$/.test(name)
        && !/abwesenheit|urlaub|krank|genehmigt|mitarbeiter|monat|quartal|reporting|payroll/i.test(name)) {
      events.push({ pos: m.index, kind: "emp", value: name });
    }
  }
  // Fallback-Quelle: Zeit-Selektor-Buttons tragen den Mitarbeiternamen
  // im aria-label ("Zeitraum fuer Fjolla Statovci am 01.06.2026
  // auswaehlen"). Wir sammeln diese als "emp-fallback"-Events, sodass
  // ein Bar, der keinen vorausgehenden <p font-medium>-Header hat,
  // den nächsten benachbarten Slot-Namen erbt.
  for (const m of source.matchAll(/aria-label="Zeitraum\s+f(?:ü|ue)r\s+([^"]+?)\s+am\s+\d/gi)) {
    const name = cleanText(m[1]);
    if (name && name.length >= 2) {
      events.push({ pos: m.index, kind: "emp-fallback", value: name });
    }
  }
  for (const m of source.matchAll(/data-testid="absence-bar-(\d+)"[^>]*?aria-label="([^"]*)"/gi)) {
    events.push({ pos: m.index, kind: "bar", id: m[1], aria: m[2] });
  }
  for (const m of source.matchAll(/aria-label="([^"]*)"[^>]*?data-testid="absence-bar-(\d+)"/gi)) {
    if (!events.some((e) => e.kind === "bar" && e.id === m[2])) {
      events.push({ pos: m.index, kind: "bar", id: m[2], aria: m[1] });
    }
  }
  events.sort((a, b) => a.pos - b.pos);

  const decodeAria = (s) => String(s).replace(/&amp;/g, "&").replace(/&#10;|&#x0?a;/gi, "\n").replace(/&quot;/g, '"');
  const rows = [];
  const seen = new Set();
  // currentEmp wird vom <p font-medium>-Header gesetzt. emp-fallback
  // dient nur dann, wenn currentEmp leer ist oder ein Bar VOR dem
  // ersten Header steht — z.B. wenn das Grid-Layout die Bars im DOM
  // vor dem Namen rendert.
  let currentEmp = "";
  let lastFallbackEmp = "";
  for (const ev of events) {
    if (ev.kind === "emp") { currentEmp = ev.value; lastFallbackEmp = ev.value; continue; }
    if (ev.kind === "emp-fallback") { lastFallbackEmp = ev.value; continue; }
    if (seen.has(ev.id)) continue;
    const employeeForBar = currentEmp || lastFallbackEmp;
    if (!employeeForBar) continue;
    seen.add(ev.id);
    const lines = cleanLines(decodeAria(ev.aria));
    const range = lines.map(parseDateRangeLine).find(Boolean);
    const typeLine = lines.find((l) => !parseDateRangeLine(l) && !isDurationLine(l) && !/genehmigt|beantragt|abgelehnt|offen/i.test(l));
    rows.push({
      __rowId: `absence-bar-${ev.id}`,
      sourceId: `absence-${ev.id}`,
      rowEmployee: employeeForBar,
      employeeName: employeeForBar,
      startsOn: range?.startsOn || "",
      endsOn: range?.endsOn || range?.startsOn || "",
      type: typeLine || "Abwesenheit",
      status: lines.find((l) => /genehmigt|beantragt|abgelehnt|offen/i.test(l)) || "",
      ariaLabel: decodeAria(ev.aria),
      rawText: decodeAria(ev.aria)
    });
  }
  return rows;
}

export function parseAbsencesHtml(html) {
  // Zuerst die row-basierte Methode (Original, robust gegen Spezial-Typen).
  const rowBased = parseAbsencesByRowHtml(html);
  if (rowBased.length) return rowBased;
  const payloadRows = parseAbsencePayloadHtml(html);
  if (payloadRows.length) return payloadRows;
  return absenceElementMatches(html)
    .map(({ block, index }) => {
      const aria = rawAttrValue(block, "aria-label");
      const testId = attrValue(block, "data-testid");
      const text = cleanText(block);
      const parsed = parseAbsenceLabel(aria, text);
      const row = absenceRowEmployeeFromContext(html, index);
      const employeeName = displayNameFromOrdioName(attrValue(block, "data-employee") || row.rowEmployee || parsed.employeeName || "");
      const startDate = isoDateFromText(attrValue(block, "data-start") || attrValue(block, "data-date")) || parsed.startsOn || isoDateFromText(text);
      const endDate = isoDateFromText(attrValue(block, "data-end"), startDate?.slice(0, 4)) || parsed.endsOn || startDate;
      const type = attrValue(block, "data-type") || parsed.type || text.match(/\b(Urlaub|Krankheit|Krank|Feiertagsausgleich|Fortbildung|Abwesenheit|Fehltag)\b/i)?.[1] || "Abwesenheit";
      const status = attrValue(block, "data-status") || text.match(/\b(genehmigt|abgelehnt|offen|beantragt)\b/i)?.[1] || "offen";
      return { __rowId: testId, rowEmployee: row.rowEmployee, rowEmployeeNumber: row.rowEmployeeNumber, employeeName, startsOn: startDate, endsOn: endDate, type, status, rawText: text };
    })
    .filter((row) => row.employeeName && row.startsOn && row.endsOn);
}

export function parsePlanHtml(html) {
  const matches = shiftElementMatches(html);
  return matches
    .map(({ block, index }) => {
      const text = cleanText(block);
      const textFields = parsePlanTextFields(block);
      const testId = attrValue(block, "data-testid") || rowId(block);
      const sourceId = attrValue(block, "data-shift-id") || testId;
      const date = isoDateFromText(attrValue(block, "data-date") || text) || planContextDate(html, index);
      const startTime = hhmm(attrValue(block, "data-start")) || textFields.startTime || hhmm(text);
      const endTime = hhmm(attrValue(block, "data-end")) || textFields.endTime || hhmm(text.replace(startTime || "", ""));
      const area = attrValue(block, "data-area") || textFields.area || "Ohne Bereich";
      const location = attrValue(block, "data-location") || textFields.location || "Ordio";
      const employeeRaw = attrValue(block, "data-employee") || textFields.employeeName || "";
      const assignmentNames = planAssignmentNames(text, employeeRaw);
      return { __rowId: testId, sourceId, date, startTime, endTime, area: cleanText(area), location: cleanText(location), assignmentNames };
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
  const html = await page.content();
  const apiPayload = await page.evaluate(async () => {
    try {
      const response = await fetch("/api/absences", { credentials: "include" });
      if (!response.ok) return {};
      return await response.json();
    } catch {
      return {};
    }
  }).catch(() => ({}));
  const payloadRows = parseAbsencePayloadHtml(html, apiPayload);
  if (payloadRows.length) return payloadRows;

  return page.evaluate(() => {
    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const normalizeName = (value) => clean(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    const numberFrom = (value) => clean(value).match(/\b(?:pnr|personal(?:nummer)?|mitarbeiter(?:nummer)?|employee)?\s*#?\s*([0-9]{1,8})\b/i)?.[1] || "";
    const lines = (value) => String(value ?? "").split(/\r?\n/).map(clean).filter(Boolean);
    const isDuration = (value) => /^\d+(?:[,.]\d+)?\s+(?:tag|tage|day|days|std\.?|stunden|hour|hours)\b/i.test(clean(value));
    const isType = (value) => /^(?:urlaub|krankheit|krank|feiertagsausgleich|fortbildung|abwesenheit|fehltag|frei)$/i.test(clean(value));
    const isDateLike = (value) => /\b\d{1,2}\.\d{1,2}\.(?:\d{2,4})\b/.test(clean(value))
      || /^(?:mo|di|mi|do|fr|sa|so|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/i.test(clean(value));
    const personFrom = (value) => {
      const candidates = lines(value)
        .map((line) => line.replace(/^\d+\s+(?!tag(?:e)?\b|day(?:s)?\b)/i, ""))
        .filter((line) => line && !isDuration(line) && !isType(line) && !isDateLike(line));
      const withComma = candidates.find((line) => line.includes(","));
      const candidate = withComma || candidates.find((line) => normalizeName(line).split(" ").filter(Boolean).length >= 2) || "";
      if (!candidate) return "";
      if (!candidate.includes(",")) return candidate;
      const [last, first] = candidate.split(",", 2).map((part) => part.trim()).filter(Boolean);
      return [first, last].filter(Boolean).join(" ");
    };
    const rowEmployeeFor = (bar) => {
      const explicit = bar.getAttribute("data-employee") || "";
      if (explicit) return { rowEmployee: explicit, rowEmployeeNumber: bar.getAttribute("data-pnr") || bar.getAttribute("data-employee-number") || "" };
      for (let current = bar.parentElement; current && current !== document.body; current = current.parentElement) {
        const attrEmployee = current.getAttribute("data-employee") || current.getAttribute("data-name") || "";
        const attrNumber = current.getAttribute("data-pnr") || current.getAttribute("data-employee-number") || current.getAttribute("data-personnel-number") || "";
        if (attrEmployee) return { rowEmployee: attrEmployee, rowEmployeeNumber: attrNumber || numberFrom(attrEmployee) };
        const header = current.querySelector('[role="rowheader"], th, [data-testid*="row-header"], [data-testid*="employee"], [data-testid*="name"]');
        const headerText = header && !header.matches('div[data-testid^="absence-bar-"]') ? clean(header.innerText || header.getAttribute("aria-label") || "") : "";
        const fromHeader = personFrom(headerText);
        if (fromHeader) return { rowEmployee: fromHeader, rowEmployeeNumber: attrNumber || numberFrom(headerText) };
        if (current.getAttribute("role") === "row" || current.tagName === "TR") {
          const clone = current.cloneNode(true);
          clone.querySelectorAll('div[data-testid^="absence-bar-"], button, [role="gridcell"]').forEach((node) => node.remove());
          const fromRow = personFrom(clone.innerText || clone.getAttribute("aria-label") || "");
          if (fromRow) return { rowEmployee: fromRow, rowEmployeeNumber: attrNumber || numberFrom(clone.innerText || "") };
        }
      }
      return { rowEmployee: "", rowEmployeeNumber: "" };
    };
    // Ordio-Timeline (verifiziert 2026-06-06): flache Bar-Liste ohne
    // Employee-Row. Das Bar-LABEL (= aria-label Zeile 1 / sichtbarer Text)
    // ist bei Urlaub der Mitarbeitername, bei Spezial-Typen der Typ.
    const labelKnownType = (v) => /\b(urlaub|krank|krankheit|feiertag|feiertagsausgleich|fortbildung|abwesen|elternzeit|mutterschutz|sonderurlaub|gleitzeit|berufsschule|schule|unbezahlt|bildungsurlaub|kur|reha|pflege|home\s?office|dienstreise|seminar)\b/i.test(clean(v)) || isType(v);
    const employeeFromLabel = (label) => {
      const l = clean(label);
      if (!l || labelKnownType(l) || isDuration(l) || isDateLike(l)) return "";
      // Name-like: mind. zwei Wort-Token oder Komma.
      if (l.includes(",") || normalizeName(l).split(" ").filter(Boolean).length >= 2) {
        if (l.includes(",")) { const [last, first] = l.split(",", 2).map((p) => p.trim()); return [first, last].filter(Boolean).join(" "); }
        return l;
      }
      return "";
    };
    return [...document.querySelectorAll('div[data-testid^="absence-bar-"]')].map((el) => {
      const row = rowEmployeeFor(el);
      const label = clean((el.getAttribute("aria-label") || "").split(/\r?\n/)[0] || el.innerText || "");
      return {
        __rowId: el.getAttribute("data-testid") || "",
        ariaLabel: el.getAttribute("aria-label") || "",
        rowEmployee: row.rowEmployee,
        rowEmployeeNumber: row.rowEmployeeNumber,
        employeeName: el.getAttribute("data-employee") || employeeFromLabel(label) || "",
        startsOn: el.getAttribute("data-start") || el.getAttribute("data-date") || "",
        endsOn: el.getAttribute("data-end") || "",
        type: el.getAttribute("data-type") || "",
        status: el.getAttribute("data-status") || "",
        rawText: clean(el.innerText || "")
      };
    });
  });
}

export async function extractPlanRowsFromPage(page, week = {}) {
  return page.evaluate((weekMeta) => {
    const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
    const lines = (value) => String(value ?? "").split(/\r?\n/).map(clean).filter(Boolean);
    const timePair = (value) => [...clean(value).matchAll(/\b(\d{1,2}:\d{2})\b/g)].map((match) => match[1]);
    const parseTextFields = (value) => {
      const rawLines = lines(value);
      const text = clean(value);
      const times = timePair(text);
      const contentLines = rawLines.filter((line) => !/\b\d{1,2}:\d{2}\b/.test(line));
      const locationLine = contentLines.find((line) => /\b(?:Standort|Location)\b/i.test(line)) || "";
      const employeeLine = contentLines.find((line) => line.includes(",") && line !== locationLine) || "";
      const areaLine = contentLines.find((line) => line !== locationLine && line !== employeeLine) || "";
      return {
        startTime: times[0] || "",
        endTime: times[1] || "",
        area: clean(text.match(/\b(?:Bereich|Area):\s*([^|,;\n]+)\b/i)?.[1] || areaLine),
        location: clean(text.match(/\b(?:Standort|Location):\s*([^|,;\n]+)\b/i)?.[1] || locationLine),
        employeeName: clean(text.match(/\b(?:Mitarbeiter|Name):?\s*([^|;\n]+(?:,\s*[^|;\n]+)?)/i)?.[1] || employeeLine)
      };
    };
    const dateFromAncestor = (el) => {
      for (let current = el; current; current = current.parentElement) {
        const attr = current.getAttribute("data-date") || current.getAttribute("aria-label") || "";
        const iso = clean(attr).match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
        if (iso) return iso;
      }
      return "";
    };
    const dateFromColumn = (el) => {
      const inherited = dateFromAncestor(el);
      if (inherited) return inherited;
      const days = Array.isArray(weekMeta?.days) ? weekMeta.days : [];
      if (!days.length) return "";
      const box = el.getBoundingClientRect();
      if (!box.width && !box.height) return "";
      const centerX = box.left + box.width / 2;
      const headers = [...document.querySelectorAll("[role='columnheader'], [data-date]")]
        .map((header) => ({ header, box: header.getBoundingClientRect(), date: header.getAttribute("data-date") || "" }))
        .filter((item) => item.box.width > 0 && item.box.height > 0)
        .sort((left, right) => left.box.left - right.box.left);
      const datedHeader = headers.find((item) => item.date && centerX >= item.box.left && centerX <= item.box.right);
      if (datedHeader) return datedHeader.date;
      const headerHit = headers.findIndex((item, index) => {
        const next = headers[index + 1]?.box.left ?? item.box.right + item.box.width;
        return centerX >= item.box.left && centerX < next;
      });
      if (headerHit >= 0 && headerHit < days.length) return days[headerHit];
      const container = el.closest("[role='grid'], [data-testid*='plan'], main, body");
      const containerBox = container?.getBoundingClientRect();
      if (!containerBox || containerBox.width <= 0) return "";
      const index = Math.max(0, Math.min(6, Math.floor(((centerX - containerBox.left) / containerBox.width) * 7)));
      return days[index] || "";
    };
    return [...document.querySelectorAll('[data-testid^="shift-card-"], [data-shift-id]')]
      .map((el) => {
        const rawText = String(el.innerText || el.getAttribute("aria-label") || "");
        const textFields = parseTextFields(rawText);
        return {
          __rowId: el.getAttribute("data-testid") || "",
          sourceId: el.getAttribute("data-shift-id") || "",
          ariaLabel: el.getAttribute("aria-label") || "",
          date: el.getAttribute("data-date") || dateFromColumn(el),
          startTime: el.getAttribute("data-start") || textFields.startTime,
          endTime: el.getAttribute("data-end") || textFields.endTime,
          area: el.getAttribute("data-area") || textFields.area,
          location: el.getAttribute("data-location") || textFields.location,
          employeeName: el.getAttribute("data-employee") || textFields.employeeName,
          rawText: clean(rawText)
        };
      })
  }, week);
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
    const displayName = displayNameFromOrdioName(record.displayName ?? record.display_name ?? record.name ?? "");
    const sourceId = cleanText(record.sourceId ?? record.source_id ?? employeeNumberSourceId(record.employeeNumber ?? record.employee_number) ?? "");
    if (!displayName || !sourceId) return;
    const value = { sourceId, displayName, match: "name" };
    addUnique(byName, normalizeName(displayName), value);
    addUnique(bySignature, nameSignature(displayName), { ...value, match: "name_signature" });
    addUnique(byInitials, nameInitials(displayName), { ...value, match: "initials" });
    const numberId = employeeNumberSourceId(record.employeeNumber ?? record.employee_number ?? sourceId);
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
  const displayName = typeof employeeName === "string"
    ? displayNameFromOrdioName(employeeName)
    : displayNameFromOrdioName(employeeName?.name ?? employeeName?.displayName ?? employeeName?.display_name ?? "");
  if (resolved.sourceId) {
    return {
      employeeSourceId: resolved.sourceId,
      employee: {
        sourceId: resolved.sourceId,
        displayName: resolved.displayName || displayName,
        roleTitle: "Mitarbeiter",
        initials: nameInitials(displayName).slice(0, 3),
        employmentStatus: "active",
        updatedAt: capturedAt
      }
    };
  }
  unresolvedEmployees.set(displayName, {
    displayName,
    initials: nameInitials(displayName),
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
  const locationsByName = new Map();
  const areasByName = new Map();
  const locationResolver = options.locationResolver ?? buildNameResolver({
    knownNames: options.canonicalLocations ?? [],
    aliases: options.locationAliases ?? {},
    fallbackName: options.defaultLocation || "Ordio"
  });
  const areaResolver = options.areaResolver ?? buildNameResolver({
    knownNames: options.canonicalWorkAreas ?? [],
    aliases: options.workAreaAliases ?? {},
    fallbackName: options.defaultWorkArea || "Ohne Bereich"
  });
  const timeEntries = [];
  const unresolvedEmployees = new Map();
  const unresolvedAreas = new Map();
  const unresolvedLocations = new Map();

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
    const areaResolved = areaResolver.resolve(cellFor(row, ["bereich", "Bereich"], 8) || "Ohne Bereich");
    const locationResolved = locationResolver.resolve(cellFor(row, ["standort", "Standort"], 9) || options.defaultLocation || "Ordio");
    if (!areaResolved.resolved) unresolvedAreas.set(areaResolved.raw, { name: areaResolved.raw, mappedTo: areaResolved.name, reason: "no_work_area_match" });
    if (!locationResolved.resolved) unresolvedLocations.set(locationResolved.raw, { name: locationResolved.raw, mappedTo: locationResolved.name, reason: "no_location_match" });
    const area = areaResolved.name;
    const location = locationResolved.name;
    const violationRaw = cleanText(cellFor(row, ["verstoss", "verstoß", "Verstoss", "Verstoß"], 10));
    const violation = violationRaw === "-" || violationRaw === "—" ? "" : violationRaw;
    const rowKey = cleanText(row.__rowId);
    const sourceId = rowKey || `time_${stableHash(`${employeeName}|${startDate}|${startTime}|${endTime}`)}`;

    if (employeeSourceId) {
      employeesBySourceId.set(employeeSourceId, resolved.employee);
    }
    const unresolvedNote = employeeSourceId ? "" : "UNRESOLVED_EMPLOYEE: keine bestehende employee-source_id gefunden";
    const note = [violation ? `Ordio-Verstoss: ${violation}` : "", unresolvedNote].filter(Boolean).join(" | ") || null;
    areasByName.set(area, { sourceId: `area_${stableHash(area)}`, name: area, updatedAt: capturedAt });
    locationsByName.set(location, { sourceId: `location_${stableHash(location)}`, name: location, updatedAt: capturedAt });
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
    locations: [...locationsByName.values()],
    workAreas: [...areasByName.values()],
    timeEntries,
    unresolvedEmployees: [...unresolvedEmployees.values()],
    unresolvedAreas: [...unresolvedAreas.values()],
    unresolvedLocations: [...unresolvedLocations.values()],
    stats: {
      extracted: rows.length,
      afterDateFilter: timeEntries.length,
      afterResolve: timeEntries.filter((entry) => entry.employeeSourceId).length,
      mapped: timeEntries.length
    }
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
  const stats = { extracted: rows.length, afterDateFilter: 0, afterResolve: 0, mapped: 0 };
  for (const row of rows) {
    const parsed = parseAbsenceLabel(row.ariaLabel ?? "", row.rawText ?? "");
    // NICHT auf parsed.employeeName zurueckfallen: bei Ordios flacher
    // Timeline ist tooltip[3] die Dauer („1 Tag"), kein Name. Mitarbeiter
    // nur aus rowEmployee (DOM-Row) oder row.employeeName (label-als-Name
    // bei Urlaub-Bars, gesetzt in rowsFromAbsencePayload). Typ-Bars ohne
    // erreichbaren Mitarbeiter fallen mangels employeeName sauber raus.
    const employeeName = displayNameFromOrdioName(row.rowEmployee || row.employeeName || "");
    const startsOn = isoDateFromText(row.startsOn) || parsed.startsOn || isoDateFromText(row.rawText);
    const endsOn = isoDateFromText(row.endsOn, startsOn?.slice(0, 4)) || parsed.endsOn || startsOn;
    if (!employeeName || !startsOn || !endsOn) continue;
    if (options.from && endsOn < options.from) continue;
    if (options.to && startsOn > options.to) continue;
    stats.afterDateFilter += 1;
    const employeeInput = row.rowEmployeeNumber
      ? { name: employeeName, pnr: row.rowEmployeeNumber, __cells: [] }
      : employeeName;
    const resolved = mapResolvedEmployee(resolver, employeeInput, capturedAt, unresolvedEmployees);
    if (resolved.employee) employeesBySourceId.set(resolved.employeeSourceId, resolved.employee);
    if (resolved.employeeSourceId) stats.afterResolve += 1;
    const sourceId = sourceIdFromRecord(row, "absence", `${employeeName}|${startsOn}|${endsOn}|${row.type ?? ""}`);
    const unresolvedNote = resolved.employeeSourceId ? "" : "UNRESOLVED_EMPLOYEE: keine bestehende employee-source_id gefunden";
    absences.push({
      sourceId,
      employeeSourceId: resolved.employeeSourceId,
      employeeName,
      startsOn,
      endsOn,
      type: cleanText(row.type) || parsed.type || "Abwesenheit",
      status: cleanText(row.status) || "offen",
      note: unresolvedNote || null,
      updatedAt: capturedAt
    });
    stats.mapped += 1;
  }
  return { employees: [...employeesBySourceId.values()], absences, unresolvedEmployees: [...unresolvedEmployees.values()], stats };
}

export function mapPlanRows(rows, options = {}) {
  const capturedAt = options.capturedAt ?? new Date().toISOString();
  const resolver = options.employeeResolver ?? buildEmployeeResolver({
    employeeRows: options.employeeRows ?? [],
    existingEmployees: options.existingEmployees ?? []
  });
  const employeesBySourceId = new Map();
  const areasByName = new Map();
  const locationsByName = new Map();
  const areaResolver = options.areaResolver ?? buildNameResolver({
    knownNames: options.canonicalWorkAreas ?? [],
    aliases: options.workAreaAliases ?? {},
    fallbackName: options.defaultWorkArea || "Ohne Bereich"
  });
  const locationResolver = options.locationResolver ?? buildNameResolver({
    knownNames: options.canonicalLocations ?? [],
    aliases: options.locationAliases ?? {},
    fallbackName: options.defaultLocation || "Ordio"
  });
  const unresolvedEmployees = new Map();
  const unresolvedAreas = new Map();
  const unresolvedLocations = new Map();
  const shifts = [];
  const stats = { extracted: rows.length, afterDateFilter: 0, afterResolve: 0, mapped: 0 };
  for (const row of rows) {
    const date = isoDateFromText(row.date || row.ariaLabel || row.rawText, options.from?.slice(0, 4));
    const startTime = hhmm(row.startTime || row.rawText);
    const endTime = hhmm(row.endTime || String(row.rawText ?? "").replace(startTime || "", ""));
    if (!date || !startTime || !endTime) continue;
    if (options.from && date < options.from) continue;
    if (options.to && date > options.to) continue;
    stats.afterDateFilter += 1;
    const assignmentNames = (row.assignmentNames?.length ? row.assignmentNames : [row.employeeName]).filter(Boolean);
    let areaCandidate = cleanText(row.area || "");
    const areaAsEmployee = areaCandidate ? resolver.resolve(areaCandidate) : null;
    if (areaAsEmployee?.sourceId) {
      if (!assignmentNames.some((name) => normalizeName(name) === normalizeName(areaCandidate))) {
        assignmentNames.push(areaCandidate);
      }
      areaCandidate = options.defaultWorkArea || "Ohne Bereich";
    }
    const assignmentSourceIds = [];
    for (const name of assignmentNames) {
      const employeeName = displayNameFromOrdioName(name);
      const resolved = mapResolvedEmployee(resolver, employeeName, capturedAt, unresolvedEmployees);
      if (resolved.employee) {
        employeesBySourceId.set(resolved.employeeSourceId, resolved.employee);
        assignmentSourceIds.push(resolved.employeeSourceId);
      }
    }
    if (assignmentNames.length === 0 || assignmentSourceIds.length > 0) stats.afterResolve += 1;
    const areaResolved = areaResolver.resolve(areaCandidate || "Ohne Bereich");
    const locationResolved = locationResolver.resolve(row.location || options.defaultLocation || "Ordio");
    if (!areaResolved.resolved) unresolvedAreas.set(areaResolved.raw, { name: areaResolved.raw, mappedTo: areaResolved.name, reason: "no_work_area_match" });
    if (!locationResolved.resolved) unresolvedLocations.set(locationResolved.raw, { name: locationResolved.raw, mappedTo: locationResolved.name, reason: "no_location_match" });
    const area = areaResolved.name;
    const location = locationResolved.name;
    areasByName.set(area, { sourceId: `area_${stableHash(area)}`, name: area, updatedAt: capturedAt });
    locationsByName.set(location, { sourceId: `location_${stableHash(location)}`, name: location, updatedAt: capturedAt });
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
    stats.mapped += 1;
  }
  return {
    employees: [...employeesBySourceId.values()],
    workAreas: [...areasByName.values()],
    locations: [...locationsByName.values()],
    shifts,
    unresolvedEmployees: [...unresolvedEmployees.values()],
    unresolvedAreas: [...unresolvedAreas.values()],
    unresolvedLocations: [...unresolvedLocations.values()],
    stats
  };
}
