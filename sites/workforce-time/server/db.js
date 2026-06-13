import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { tenantConfigGet, tenantIsDemo, tenantPath } from "./tenant.js";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

// Wenn ein Tenant gesetzt ist (CORTEX_TENANT_DIR), legen wir Live-DB,
// Snapshot-Eingang und Migrations-Baseline in den Tenant-Repo unter
// trunk/workforce/ ab. Im Demo-Fallback (kein Tenant) bleibt alles im
// projekt-eigenen private/-Ordner, damit Standalone-Dev nichts kaputt
// macht.
const tenantDbPath = tenantIsDemo()
  ? join(projectRoot, "private", "arbeitszeiten.sqlite")
  : tenantPath(
      tenantConfigGet("workforce.paths.db_dir", "trunk/workforce/db") +
        "/arbeitszeiten.sqlite"
    );

const tenantImportSnapshotPath = tenantIsDemo()
  ? join(projectRoot, "private", "imports", "import-snapshot.json")
  : tenantPath(
      tenantConfigGet("workforce.paths.imports_dir", "trunk/workforce/imports") +
        "/import-snapshot.json"
    );

const tenantMigrationBaselinePath = tenantIsDemo()
  ? join(projectRoot, "private", "migration-baseline.json")
  : tenantPath(
      tenantConfigGet(
        "workforce.paths.migration_baseline_file",
        "trunk/workforce/migration-baseline.json"
      )
    );

export const databasePath = process.env.ARBEITSZEITEN_DB ?? tenantDbPath;
export const importSnapshotPath = process.env.IMPORT_SNAPSHOT_PATH ?? tenantImportSnapshotPath;
export const migrationBaselinePath =
  process.env.MIGRATION_BASELINE_PATH ?? tenantMigrationBaselinePath;

mkdirSync(dirname(databasePath), { recursive: true });

export const db = new DatabaseSync(databasePath);
// C5: WAL lets concurrent readers run alongside a single writer, so the
// synchronous DatabaseSync driver no longer serialises every reader behind a
// writer and stops freezing the single Node event loop under load (8 staff +
// Kiosk). WAL also makes the online .backup unobtrusive. NOTE: WAL creates
// sidecar files <db>-wal and <db>-shm next to the DB — the deployment's
// writable path (systemd ReadWritePaths) must cover that directory, and a
// restore must account for them. busy_timeout raised to 10s.
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA wal_autocheckpoint = 1000;
  PRAGMA busy_timeout = 10000;
  PRAGMA foreign_keys = ON;
`);

const now = () => new Date().toISOString();

const statusLabels = {
  freigegeben: "Freigegeben",
  aenderungsantrag: "Aenderungsantrag",
  konflikt: "Konflikt",
  entwurf: "Entwurf"
};

const allowedStatuses = new Set(Object.keys(statusLabels));
const allowedEntryTypes = new Set(["Arbeitszeit", "Schichtunabhaengig", "Dienstgang"]);

// ------------------------------------------------------------
// Tenant-getriebene Konfiguration
// ------------------------------------------------------------
// Quelle der Wahrheit: tenant.config.json -> workforce.* im aktiven
// Tenant-Repo (CORTEX_TENANT_DIR). Im Demo-Modus greifen die Fallback-
// Werte unten, damit die App ohne Tenant-Anbindung lauffaehig bleibt.
// Tenant-spezifische Identifikatoren erscheinen ab hier ausschliesslich
// in der Tenant-Config, nicht mehr im Code.
const defaultLocationName =
  tenantConfigGet("workforce.default_location_name", "Praxis Demo");

const doctorDefaultSource = "local_doctor_defaults";

// Default-Sprechstundenregeln (Frueh/Spaet) je Stamm-Arzt.
// Erwartetes Schema: [{ employee_match, work_area, segment, start_time, end_time, weekdays? }]
const doctorSprechstundeDefaultsRaw =
  tenantConfigGet("workforce.sprechstunde_defaults", []) ?? [];
const doctorSprechstundeDefaults = doctorSprechstundeDefaultsRaw
  .filter((rule) => rule && typeof rule === "object")
  .map((rule) => ({
    employeeNamePart: String(rule.employee_match ?? "").toLowerCase(),
    workArea: String(rule.work_area ?? "").trim(),
    location:
      String(rule.location ?? "").trim() ||
      // Wenn keine Standort-Angabe vorhanden ist, nimm das erste
      // Wort der work_area (z.B. "Sprechstunde Grueneburgweg" ->
      // "Grueneburgweg"). Praxis-spezifischer Anker bleibt damit in
      // der Tenant-Config.
      (String(rule.work_area ?? "").trim().split(/\s+/).slice(-1)[0] || ""),
    segment: rule.segment === "late" ? "late" : "early",
    startTime: String(rule.start_time ?? "").trim(),
    endTime: String(rule.end_time ?? "").trim(),
    weekdays: Array.isArray(rule.weekdays) ? rule.weekdays : null
  }))
  .filter(
    (rule) =>
      rule.employeeNamePart &&
      rule.workArea &&
      rule.location &&
      rule.startTime &&
      rule.endTime
  );

// Name-Overrides fuer Anzeige: ein Quellsystem-Klarname wird durch eine
// kuratierte Anzeige ersetzt. Schema:
// [{ match: <substring auf compact-Name, lowercase>, display: <Anzeige> }]
const displayNameOverrides = (
  tenantConfigGet("workforce.display_name_overrides", []) ?? []
)
  .filter((entry) => entry && typeof entry === "object")
  .map((entry) => ({
    match: String(entry.match ?? "").toLowerCase().trim(),
    display: String(entry.display ?? "").trim()
  }))
  .filter((entry) => entry.match && entry.display);

// Work-Area-Overrides: Match-String (normalisiert, alle Tokens
// muessen vorkommen) -> kanonischer Bereichsname.
// Schema: [{ match_tokens: ["<tok-a>", "<tok-b>"], canonical: "<Anzeige>" }]
const workAreaOverrides = (
  tenantConfigGet("workforce.work_area_overrides", []) ?? []
)
  .filter((entry) => entry && typeof entry === "object")
  .map((entry) => ({
    matchTokens: Array.isArray(entry.match_tokens)
      ? entry.match_tokens.map((t) => String(t).toLowerCase())
      : [],
    canonical: String(entry.canonical ?? "").trim()
  }))
  .filter((entry) => entry.matchTokens.length > 0 && entry.canonical);

function hashPayload(payload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function safeIdSegment(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || randomUUID();
}

function normalizeLabel(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function canonicalWorkAreaLabel(area) {
  const raw = String(area ?? "").trim();
  if (!raw || workAreaOverrides.length === 0) return raw;

  const normalized = normalizeLabel(raw);
  for (const override of workAreaOverrides) {
    if (override.matchTokens.every((token) => normalized.includes(token))) {
      return override.canonical;
    }
  }

  return raw;
}

function localIdFromSource(prefix, sourceId) {
  return `${prefix}_${safeIdSegment(sourceId)}`;
}

function toIsoDate(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const trimmed = value.trim();
  const german = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (german) {
    return `${german[3]}-${german[2].padStart(2, "0")}-${german[1].padStart(2, "0")}`;
  }

  return trimmed.slice(0, 10);
}

function normalizeTime(value) {
  if (typeof value !== "string") {
    return "";
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return "";
  }

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function practiceDisplayName(value) {
  const name = String(value ?? "").trim();
  if (!name || displayNameOverrides.length === 0) return name;

  const compact = name.replace(/\s+/g, " ").toLowerCase();
  for (const override of displayNameOverrides) {
    // match darf entweder exakt sein oder als enthaltener Token-Teil
    // (z.B. ein Nachname matched eine ausfuehrlichere Quellsystem-Schreibweise).
    if (compact === override.match || compact.includes(override.match)) {
      return override.display;
    }
  }
  return name;
}

function parseDurationMinutes(value) {
  if (typeof value !== "string") {
    return minutes(value);
  }

  const match = value.trim().match(/^(-?)(\d{1,3}):(\d{2})$/);
  if (!match) {
    return minutes(value);
  }

  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

function normalizeRequiredStaff(value, fallback = 1) {
  const staff = Math.round(Number(value) || fallback || 1);
  if (staff < 1) return 1;
  if (staff > 50) return 1;
  return staff;
}

function initialsFromName(name) {
  return String(name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase() || "MA";
}

function idFromName(prefix, name) {
  return `${prefix}_${safeIdSegment(name)}`;
}

function toDateTime(date, time) {
  return `${date}T${time}:00`;
}

function addDays(date, days) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function isWeekday(date) {
  const day = new Date(`${date}T12:00:00`).getDay();
  return day >= 1 && day <= 5;
}

function datesInRange(startDate, endDate) {
  const dates = [];
  let cursor = startDate;
  const finalDate = endDate < startDate ? startDate : endDate;

  while (cursor <= finalDate) {
    dates.push(cursor);
    if (dates.length > 31) {
      throw new Error("Schichtserie darf maximal 31 Tage umfassen");
    }
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function datePart(value) {
  return value.slice(0, 10);
}

function timePart(value) {
  return value.slice(11, 16);
}

function startOfIsoWeek(date) {
  const current = new Date(`${date}T12:00:00`);
  const day = current.getDay() || 7;
  current.setDate(current.getDate() - day + 1);
  return current.toISOString().slice(0, 10);
}

function isoWeekLabel(date) {
  const current = new Date(`${date}T12:00:00`);
  current.setDate(current.getDate() + 4 - (current.getDay() || 7));
  const yearStart = new Date(current.getFullYear(), 0, 1);
  const week = Math.ceil(((current.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${current.getFullYear()}-KW${String(week).padStart(2, "0")}`;
}

function requireString(payload, key) {
  if (!payload || typeof payload[key] !== "string" || payload[key].trim() === "") {
    throw new Error(`Feld fehlt: ${key}`);
  }

  return payload[key].trim();
}

function uniqueLocalId(table, prefix, name) {
  const baseId = idFromName(prefix, name) || `${prefix}_${randomUUID()}`;
  let id = baseId;
  let suffix = 2;

  while (db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(id)) {
    id = `${baseId}_${suffix}`;
    suffix += 1;
  }

  return id;
}

function ensureLocation(name) {
  const existing = db.prepare("SELECT id, name FROM locations WHERE name = ?").get(name);
  if (existing) {
    db.prepare(`
      UPDATE locations
      SET is_active = 1, removed_from_source = 0, updated_at = ?
      WHERE id = ?
    `).run(now(), existing.id);
    return existing;
  }

  const createdAt = now();
  const id = uniqueLocalId("locations", "loc", name);
  db.prepare(`
    INSERT INTO locations (id, name, source_system, source_id, imported_at, created_at, updated_at)
    VALUES (?, ?, 'local', ?, ?, ?, ?)
  `).run(id, name, id, createdAt, createdAt, createdAt);

  return { id, name };
}

function ensureWorkArea(name) {
  const existing = db.prepare("SELECT id, name FROM work_areas WHERE name = ?").get(name);
  if (existing) {
    db.prepare(`
      UPDATE work_areas
      SET is_active = 1, removed_from_source = 0, updated_at = ?
      WHERE id = ?
    `).run(now(), existing.id);
    return existing;
  }

  const createdAt = now();
  const id = uniqueLocalId("work_areas", "area", name);
  db.prepare(`
    INSERT INTO work_areas (id, name, source_system, source_id, imported_at, created_at, updated_at)
    VALUES (?, ?, 'local', ?, ?, ?, ?)
  `).run(id, name, id, createdAt, createdAt, createdAt);

  return { id, name };
}

function readMigrationBaseline() {
  if (!existsSync(migrationBaselinePath)) {
    return null;
  }

  try {
    const baseline = JSON.parse(readFileSync(migrationBaselinePath, "utf8"));
    if (!baseline || typeof baseline !== "object") return null;
    if (typeof baseline.completedAt !== "string" || typeof baseline.sourceSystem !== "string") return null;
    return baseline;
  } catch {
    return null;
  }
}

function sourceRecordKnownAtBaseline(sourceSystem, sourceEntity, sourceId, baseline) {
  if (!baseline) return false;
  return Boolean(
    db.prepare(`
      SELECT id
      FROM source_records
      WHERE source_system = ?
        AND source_entity = ?
        AND source_id = ?
        AND imported_at <= ?
      LIMIT 1
    `).get(sourceSystem, sourceEntity, String(sourceId), baseline.completedAt)
  );
}

function applyMigrationBaseline(snapshot) {
  const baseline = readMigrationBaseline();
  if (!baseline || baseline.sourceSystem !== snapshot.sourceSystem) {
    return { snapshot, deltaOnly: false, baseline: null };
  }

  const onlyNew = (sourceEntity) => (record) =>
    !sourceRecordKnownAtBaseline(snapshot.sourceSystem, sourceEntity, record.sourceId, baseline);
  const filtered = {
    ...snapshot,
    locations: snapshot.locations.filter(onlyNew("location")),
    workAreas: snapshot.workAreas.filter(onlyNew("work_area")),
    employees: snapshot.employees.filter(onlyNew("employee")),
    shifts: snapshot.shifts.filter(onlyNew("shift")),
    timeEntries: snapshot.timeEntries.filter(onlyNew("time_entry")),
    absences: snapshot.absences.filter(onlyNew("absence_request")),
    note: `Delta-Import seit ${baseline.completedAt}; bereits bekannte Daten-IDs werden uebersprungen.`
  };
  const dates = [
    ...filtered.shifts.flatMap((record) => [record.startDate, record.endDate]),
    ...filtered.timeEntries.flatMap((record) => [record.startDate, record.endDate]),
    ...filtered.absences.flatMap((record) => [record.startsOn, record.endsOn])
  ].filter(Boolean).sort();

  return {
    snapshot: {
      ...filtered,
      periodStart: dates[0] ?? snapshot.periodStart,
      periodEnd: dates.at(-1) ?? snapshot.periodEnd
    },
    deltaOnly: true,
    baseline
  };
}

function loadEmployeeResolutionMaps(sourceSystem) {
  const employeeBySourceId = new Map();
  const employeeByName = new Map();

  db.prepare(`
    SELECT employee_id, source_id
    FROM employee_external_ids
    WHERE source_system = ?
  `).all(sourceSystem).forEach((row) => {
    employeeBySourceId.set(String(row.source_id), row.employee_id);
  });

  db.prepare(`
    SELECT id, display_name
    FROM employees
    WHERE removed_from_source = 0
  `).all().forEach((row) => {
    const nameKey = String(row.display_name ?? "").trim().toLowerCase();
    if (nameKey) {
      employeeByName.set(nameKey, row.id);
    }
  });

  return { employeeBySourceId, employeeByName };
}

function minutes(value) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    return 0;
  }

  return Math.round(numberValue);
}

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      email TEXT,
      auth_provider TEXT NOT NULL DEFAULT 'local',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, role_id)
    );

    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      source_system TEXT,
      source_id TEXT,
      imported_at TEXT,
      removed_from_source INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS work_areas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      source_system TEXT,
      source_id TEXT,
      imported_at TEXT,
      removed_from_source INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      source_system TEXT,
      source_id TEXT,
      imported_at TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      source_system TEXT,
      source_id TEXT,
      imported_at TEXT
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      role_title TEXT NOT NULL,
      initials TEXT NOT NULL,
      employment_status TEXT NOT NULL DEFAULT 'active',
      source_system TEXT,
      source_id TEXT,
      imported_at TEXT,
      removed_from_source INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employee_external_ids (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      source_system TEXT NOT NULL,
      source_id TEXT NOT NULL,
      source_entity TEXT NOT NULL DEFAULT 'employee',
      imported_at TEXT NOT NULL,
      UNIQUE (source_system, source_entity, source_id)
    );

    CREATE TABLE IF NOT EXISTS import_batches (
      id TEXT PRIMARY KEY,
      source_system TEXT NOT NULL,
      mode TEXT NOT NULL DEFAULT 'manual_snapshot',
      status TEXT NOT NULL,
      period_start TEXT,
      period_end TEXT,
      record_count INTEGER NOT NULL DEFAULT 0,
      inserted_count INTEGER NOT NULL DEFAULT 0,
      updated_count INTEGER NOT NULL DEFAULT 0,
      unchanged_count INTEGER NOT NULL DEFAULT 0,
      conflict_count INTEGER NOT NULL DEFAULT 0,
      error_count INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      started_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS source_records (
      id TEXT PRIMARY KEY,
      import_batch_id TEXT NOT NULL REFERENCES import_batches(id),
      source_system TEXT NOT NULL,
      source_entity TEXT NOT NULL,
      source_id TEXT NOT NULL,
      raw_hash TEXT NOT NULL,
      source_updated_at TEXT,
      imported_at TEXT NOT NULL,
      raw_payload TEXT NOT NULL,
      removed_from_source INTEGER NOT NULL DEFAULT 0,
      UNIQUE (source_system, source_entity, source_id)
    );

    CREATE TABLE IF NOT EXISTS source_record_links (
      id TEXT PRIMARY KEY,
      source_record_id TEXT NOT NULL REFERENCES source_records(id) ON DELETE CASCADE,
      local_entity TEXT NOT NULL,
      local_id TEXT NOT NULL,
      linked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (source_record_id, local_entity, local_id)
    );

    CREATE TABLE IF NOT EXISTS sync_runs (
      id TEXT PRIMARY KEY,
      import_batch_id TEXT REFERENCES import_batches(id),
      trigger_type TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      summary_json TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_conflicts (
      id TEXT PRIMARY KEY,
      source_record_id TEXT REFERENCES source_records(id),
      local_entity TEXT NOT NULL,
      local_id TEXT NOT NULL,
      field_name TEXT NOT NULL,
      source_value_json TEXT,
      local_value_json TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      detected_at TEXT NOT NULL,
      resolved_at TEXT,
      resolution_note TEXT
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id TEXT PRIMARY KEY,
      work_area_id TEXT REFERENCES work_areas(id),
      location_id TEXT REFERENCES locations(id),
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      required_staff INTEGER NOT NULL DEFAULT 1,
      note TEXT,
      source_system TEXT,
      source_id TEXT,
      imported_at TEXT,
      removed_from_source INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shift_assignments (
      id TEXT PRIMARY KEY,
      shift_id TEXT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
      employee_id TEXT NOT NULL REFERENCES employees(id),
      status TEXT NOT NULL DEFAULT 'assigned',
      source_system TEXT,
      source_id TEXT,
      imported_at TEXT,
      UNIQUE (shift_id, employee_id)
    );

    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employees(id),
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      work_area_id TEXT NOT NULL REFERENCES work_areas(id),
      location_id TEXT NOT NULL REFERENCES locations(id),
      status TEXT NOT NULL,
      entry_type TEXT NOT NULL,
      paid_break_minutes INTEGER NOT NULL DEFAULT 0,
      unpaid_break_minutes INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      local_revision INTEGER NOT NULL DEFAULT 1,
      source_system TEXT,
      source_id TEXT,
      imported_at TEXT,
      removed_from_source INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS breaks (
      id TEXT PRIMARY KEY,
      time_entry_id TEXT NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
      starts_at TEXT,
      ends_at TEXT,
      duration_minutes INTEGER NOT NULL,
      is_paid INTEGER NOT NULL DEFAULT 0,
      source_system TEXT,
      source_id TEXT,
      imported_at TEXT
    );

    CREATE TABLE IF NOT EXISTS absence_requests (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL REFERENCES employees(id),
      absence_type TEXT NOT NULL,
      starts_on TEXT NOT NULL,
      ends_on TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      source_system TEXT,
      source_id TEXT,
      imported_at TEXT,
      removed_from_source INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      actor_type TEXT NOT NULL,
      actor_id TEXT,
      action TEXT NOT NULL,
      reason TEXT,
      old_value_json TEXT,
      new_value_json TEXT,
      created_at TEXT NOT NULL
    );

    -- T-003a Schichttausch-Workflow: Mitarbeiter A bietet seine Schicht
    -- zur Übernahme an; Mitarbeiter B akzeptiert; Plan-Update + Audit.
    CREATE TABLE IF NOT EXISTS shift_swap_requests (
      id TEXT PRIMARY KEY,
      requester_employee_id TEXT NOT NULL REFERENCES employees(id),
      requester_shift_id TEXT NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
      target_employee_id TEXT REFERENCES employees(id),
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      decided_by_employee_id TEXT REFERENCES employees(id),
      decided_at TEXT,
      decision_note TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- T-005a Korrektur-Workflow: Mitarbeiter beantragen Time-Entry-Korrekturen,
    -- Admin genehmigt/lehnt ab (4-Augen).
    CREATE TABLE IF NOT EXISTS time_entry_corrections (
      id TEXT PRIMARY KEY,
      time_entry_id TEXT NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
      employee_id TEXT NOT NULL REFERENCES employees(id),
      requested_changes_json TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      reviewer_id TEXT REFERENCES employees(id),
      reviewed_at TEXT,
      review_note TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_time_entries_starts_at ON time_entries(starts_at);
    CREATE INDEX IF NOT EXISTS idx_time_entries_employee ON time_entries(employee_id);
    CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_events(entity_type, entity_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_source_records_batch ON source_records(import_batch_id);
    CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(status);
    CREATE INDEX IF NOT EXISTS idx_corrections_status ON time_entry_corrections(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_corrections_employee ON time_entry_corrections(employee_id);
    CREATE INDEX IF NOT EXISTS idx_swap_status ON shift_swap_requests(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_swap_requester ON shift_swap_requests(requester_employee_id);
    CREATE INDEX IF NOT EXISTS idx_swap_target ON shift_swap_requests(target_employee_id);

    -- T-004a Stempeluhr-State: Pause läuft aktuell für eine running-time_entry.
    CREATE TABLE IF NOT EXISTS stamp_active_breaks (
      time_entry_id TEXT PRIMARY KEY REFERENCES time_entries(id) ON DELETE CASCADE,
      started_at TEXT NOT NULL
    );

    -- T-010a defensive Vor-Anlage der auth_users-Tabelle, damit Rollen-
    -- Admin-Funktionen auch dann arbeiten können, wenn der Auth-Server
    -- noch nie gelaufen ist. auth.js legt dieselbe Tabelle als IF NOT
    -- EXISTS an, daher kein Konflikt.
    CREATE TABLE IF NOT EXISTS auth_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      employee_id TEXT,
      display_name TEXT,
      role TEXT NOT NULL DEFAULT 'employee',
      tenant_slug TEXT NOT NULL,
      totp_enrolled_at TEXT,
      totp_secret_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT,
      disabled_at TEXT
    );
  `);

  addColumnIfMissing("employees", "email", "TEXT");
  addColumnIfMissing("employees", "weekly_hours", "REAL");
}

function addColumnIfMissing(table, column, ddl) {
  const exists = db
    .prepare(`SELECT 1 FROM pragma_table_info(?) WHERE name = ?`)
    .get(table, column);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  }
}

function insertSourceRecord(
  batchId,
  sourceEntity,
  sourceId,
  localEntity,
  localId,
  payload,
  sourceSystem
) {
  if (!sourceSystem) {
    throw new Error("insertSourceRecord: sourceSystem ist Pflicht (Demo-Defaults entfernt).");
  }
  const importedAt = now();
  const rawPayload = JSON.stringify(payload);
  const sourceRecordId =
    sourceSystem === "demo_seed"
      ? `src_${sourceEntity}_${sourceId}`
      : `src_${sourceSystem}_${sourceEntity}_${sourceId}`;

  db.prepare(`
    INSERT INTO source_records (
      id, import_batch_id, source_system, source_entity, source_id, raw_hash,
      source_updated_at, imported_at, raw_payload
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (source_system, source_entity, source_id) DO UPDATE SET
      import_batch_id = excluded.import_batch_id,
      raw_hash = excluded.raw_hash,
      source_updated_at = excluded.source_updated_at,
      imported_at = excluded.imported_at,
      raw_payload = excluded.raw_payload,
      removed_from_source = 0
  `).run(
    sourceRecordId,
    batchId,
    sourceSystem,
    sourceEntity,
    sourceId,
    hashPayload(payload),
    payload.updatedAt ?? importedAt,
    importedAt,
    rawPayload
  );

  db.prepare(`
    INSERT OR IGNORE INTO source_record_links (id, source_record_id, local_entity, local_id)
    VALUES (?, ?, ?, ?)
  `).run(`link_${sourceSystem}_${sourceEntity}_${sourceId}`, sourceRecordId, localEntity, localId);

  return sourceRecordId;
}

function syncImportedRemovalState(sourceSystem) {
  const linkedEntities = [
    { localEntity: "location", table: "locations", activeColumn: "is_active" },
    { localEntity: "work_area", table: "work_areas", activeColumn: "is_active" },
    { localEntity: "employee", table: "employees" },
    { localEntity: "shift", table: "shifts" },
    { localEntity: "time_entry", table: "time_entries" },
    { localEntity: "absence_request", table: "absence_requests" }
  ];

  for (const entity of linkedEntities) {
    const inactiveSet = entity.activeColumn ? `, ${entity.activeColumn} = 0` : "";
    const activeSet = entity.activeColumn ? `, ${entity.activeColumn} = 1` : "";

    db.prepare(`
      UPDATE ${entity.table}
      SET removed_from_source = 1${inactiveSet}
      WHERE id IN (
        SELECT source_record_links.local_id
        FROM source_record_links
        JOIN source_records ON source_records.id = source_record_links.source_record_id
        WHERE source_records.source_system = ?
          AND source_record_links.local_entity = ?
          AND source_records.removed_from_source = 1
      )
    `).run(sourceSystem, entity.localEntity);

    db.prepare(`
      UPDATE ${entity.table}
      SET removed_from_source = 0${activeSet}
      WHERE id IN (
        SELECT source_record_links.local_id
        FROM source_record_links
        JOIN source_records ON source_records.id = source_record_links.source_record_id
        WHERE source_records.source_system = ?
          AND source_record_links.local_entity = ?
          AND source_records.removed_from_source = 0
      )
    `).run(sourceSystem, entity.localEntity);
  }
}

function insertAudit(entityType, entityId, action, reason, oldValue = null, newValue = null) {
  db.prepare(`
    INSERT INTO audit_events (
      id, entity_type, entity_id, actor_type, actor_id, action, reason,
      old_value_json, new_value_json, created_at
    )
    VALUES (?, ?, ?, 'system', NULL, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    entityType,
    entityId,
    action,
    reason,
    oldValue ? JSON.stringify(oldValue) : null,
    newValue ? JSON.stringify(newValue) : null,
    now()
  );
}

function activeAbsenceOnDate(employeeId, date) {
  return Boolean(
    db.prepare(`
      SELECT id
      FROM absence_requests
      WHERE employee_id = ?
        AND status != 'abgelehnt'
        AND removed_from_source = 0
        AND starts_on <= ?
        AND ends_on >= ?
      LIMIT 1
    `).get(employeeId, date, date)
  );
}

function findEmployeeByNamePart(namePart) {
  return db.prepare(`
    SELECT id, display_name
    FROM employees
    WHERE removed_from_source = 0
      AND lower(display_name) LIKE ?
    ORDER BY display_name
    LIMIT 1
  `).get(`%${namePart.toLowerCase()}%`);
}

function planningDefaultEndDate(startDate) {
  const row = db.prepare(`
    SELECT max(date(starts_at)) AS end_date
    FROM shifts
    WHERE removed_from_source = 0
  `).get();
  const importedEnd = row?.end_date;
  const minimumEnd = addDays(startDate, 11);
  return importedEnd && importedEnd > minimumEnd ? importedEnd : minimumEnd;
}

function findMatchingSprechstundeShift(workAreaId, locationId, date, startTime, endTime) {
  return db.prepare(`
    SELECT id
    FROM shifts
    WHERE work_area_id = ?
      AND location_id = ?
      AND date(starts_at) = ?
      AND time(starts_at) = ?
      AND time(ends_at) = ?
      AND removed_from_source = 0
    ORDER BY source_system = ? DESC, id ASC
    LIMIT 1
  `).get(workAreaId, locationId, date, `${startTime}:00`, `${endTime}:00`, doctorDefaultSource);
}

function removeNonDoctorSprechstundeAssignments(workAreaId) {
  // Schuetzt die Stamm-Sprechstunde davor, dass importierte Schichten
  // andere Personen als die in workforce.sprechstunde_defaults
  // hinterlegten Stamm-Aerzte zuweisen. Match-Teile kommen aus der
  // Tenant-Config (employee_match je Default-Regel).
  const matchParts = Array.from(
    new Set(
      doctorSprechstundeDefaults
        .map((rule) => String(rule.employeeNamePart ?? "").toLowerCase().trim())
        .filter(Boolean)
    )
  );
  if (matchParts.length === 0) return;

  const likeClauses = matchParts.map(() => "lower(display_name) LIKE ?").join(" OR ");
  const likeParams = matchParts.map((part) => `%${part}%`);
  db.prepare(`
    DELETE FROM shift_assignments
    WHERE shift_id IN (
      SELECT shifts.id
      FROM shifts
      WHERE shifts.work_area_id = ?
        AND shifts.removed_from_source = 0
    )
      AND employee_id NOT IN (
        SELECT id
        FROM employees
        WHERE removed_from_source = 0
          AND (${likeClauses})
      )
  `).run(workAreaId, ...likeParams);
}

function removeDoctorDefaultAssignment(employeeId, date, segment) {
  const defaultShiftId = `shift_default_sprechstunde_${segment}_${date.replaceAll("-", "_")}`;
  db.prepare(`
    DELETE FROM shift_assignments
    WHERE employee_id = ?
      AND source_system = ?
      AND shift_id IN (
        SELECT id
        FROM shifts
        WHERE date(starts_at) = ?
          AND (id = ? OR source_system = ?)
      )
  `).run(employeeId, doctorDefaultSource, date, defaultShiftId, doctorDefaultSource);

  db.prepare(`
    UPDATE shifts
    SET removed_from_source = 1, updated_at = ?
    WHERE id = ?
      AND source_system = ?
      AND NOT EXISTS (
        SELECT 1
        FROM shift_assignments
        WHERE shift_assignments.shift_id = shifts.id
      )
  `).run(now(), defaultShiftId, doctorDefaultSource);
}

function ensureDoctorSprechstundeAssignments() {
  if (doctorSprechstundeDefaults.length === 0) {
    // Kein Tenant gesetzt oder keine Default-Sprechstunden definiert:
    // Auto-Vorbelegung bleibt aus, damit der Demo-Modus keine fiktiven
    // Arzt-Defaults erzeugt.
    return;
  }

  // Aktuell laufen alle Default-Regeln einer Praxis auf derselben
  // Stamm-Sprechstunde (work_area + location). Wir nehmen sie aus dem
  // ersten Eintrag und blocken Mischbetrieb mit einem expliziten
  // Console-Hinweis ab, bis Multi-Sprechstunden-Support geschrieben ist.
  const stammWorkArea = doctorSprechstundeDefaults[0].workArea;
  const stammLocation = doctorSprechstundeDefaults[0].location;
  for (const rule of doctorSprechstundeDefaults) {
    if (rule.workArea !== stammWorkArea || rule.location !== stammLocation) {
      console.warn(
        `[workforce] sprechstunde_defaults: mehrere Stamm-Sprechstunden ` +
          `noch nicht unterstuetzt (gefunden: "${rule.workArea}" / "${rule.location}").`
      );
      return;
    }
  }

  const workArea = ensureWorkArea(stammWorkArea);
  const location = ensureLocation(stammLocation);
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const startDate = startOfIsoWeek(today.toISOString().slice(0, 10));
  const endDate = planningDefaultEndDate(startDate);
  const createdAt = now();
  const insertShift = db.prepare(`
    INSERT INTO shifts (
      id, work_area_id, location_id, starts_at, ends_at, required_staff, note,
      source_system, source_id, imported_at, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET
      removed_from_source = 0,
      updated_at = excluded.updated_at
  `);
  const insertAssignment = db.prepare(`
    INSERT OR IGNORE INTO shift_assignments (
      id, shift_id, employee_id, status, source_system, source_id, imported_at
    )
    VALUES (?, ?, ?, 'assigned', ?, ?, ?)
  `);

  db.exec("BEGIN");
  try {
    removeNonDoctorSprechstundeAssignments(workArea.id);

    for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
      if (!isWeekday(date)) continue;

      for (const rule of doctorSprechstundeDefaults) {
        const employee = findEmployeeByNamePart(rule.employeeNamePart);
        if (!employee) continue;

        if (activeAbsenceOnDate(employee.id, date)) {
          removeDoctorDefaultAssignment(employee.id, date, rule.segment);
          continue;
        }

        const existingShift = findMatchingSprechstundeShift(
          workArea.id,
          location.id,
          date,
          rule.startTime,
          rule.endTime
        );
        const shiftId = existingShift?.id ?? `shift_default_sprechstunde_${rule.segment}_${date.replaceAll("-", "_")}`;
        const sourceId = `default_sprechstunde_${rule.segment}_${date}`;

        if (!existingShift) {
          insertShift.run(
            shiftId,
            workArea.id,
            location.id,
            toDateTime(date, rule.startTime),
            toDateTime(date, rule.endTime),
            "Praxisregel: Sprechstunde werktags automatisch vorbelegt.",
            doctorDefaultSource,
            sourceId,
            createdAt,
            createdAt,
            createdAt
          );
          insertAudit("shift", shiftId, "Praxisregel angewendet", "Sprechstunde werktags vorbelegt");
        }

        insertAssignment.run(
          `assign_${shiftId}_${employee.id}`,
          shiftId,
          employee.id,
          doctorDefaultSource,
          `assign_${sourceId}_${employee.id}`,
          createdAt
        );
      }
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function loadTenantSeedFromFile() {
  // Liest seed.json aus dem aktiven Tenant (workforce.paths.seed_file).
  // Liefert null, wenn die Datei fehlt, leer ist oder keine
  // Stamm-Eintraege (employees + locations + work_areas alle leer) hat.
  const seedFileRelative = tenantConfigGet(
    "workforce.paths.seed_file",
    "trunk/workforce/seed.json"
  );
  const seedFilePath = tenantIsDemo() ? null : tenantPath(seedFileRelative);
  if (!seedFilePath || !existsSync(seedFilePath)) return null;

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(seedFilePath, "utf8"));
  } catch (err) {
    console.warn(`[workforce] tenant seed.json parse error at ${seedFilePath}: ${err.message}`);
    return null;
  }

  const employees = Array.isArray(parsed?.employees) ? parsed.employees : [];
  const locations = Array.isArray(parsed?.locations) ? parsed.locations : [];
  const workAreas = Array.isArray(parsed?.work_areas) ? parsed.work_areas : [];
  if (employees.length === 0 && locations.length === 0 && workAreas.length === 0) {
    return null;
  }

  return {
    sourceSystem: String(parsed?.source_system ?? "local_tenant_seed"),
    batchIdPrefix: String(parsed?.batch_id_prefix ?? "tenant_seed"),
    employees,
    locations,
    workAreas,
    shifts: Array.isArray(parsed?.shifts) ? parsed.shifts : [],
    absences: Array.isArray(parsed?.absences) ? parsed.absences : [],
    timeEntries: Array.isArray(parsed?.time_entries) ? parsed.time_entries : [],
    path: seedFilePath
  };
}

function applyTenantSeed(tenantSeed) {
  // Idempotent: alle Inserts gehen ueber INSERT OR IGNORE; deterministische
  // IDs werden aus source_id abgeleitet, sodass wiederholte Aufrufe keine
  // Dubletten erzeugen.
  const importedAt = now();
  const batchId = `${tenantSeed.batchIdPrefix}_${importedAt.replace(/[^0-9]/g, "").slice(0, 14)}`;
  const recordCount =
    tenantSeed.employees.length +
    tenantSeed.locations.length +
    tenantSeed.workAreas.length +
    tenantSeed.shifts.length +
    tenantSeed.absences.length +
    tenantSeed.timeEntries.length;

  db.exec("BEGIN");
  try {
    db.prepare(`
      INSERT OR IGNORE INTO import_batches (
        id, source_system, mode, status, record_count,
        inserted_count, updated_count, unchanged_count, conflict_count, error_count,
        note, started_at, completed_at
      )
      VALUES (?, ?, 'tenant_seed', 'completed', ?, ?, 0, 0, 0, 0, ?, ?, ?)
    `).run(
      batchId,
      tenantSeed.sourceSystem,
      recordCount,
      recordCount,
      `Tenant-Seed aus ${tenantSeed.path}`,
      importedAt,
      importedAt
    );

    for (const location of tenantSeed.locations) {
      const sourceId = String(location?.source_id ?? location?.name ?? "").trim();
      const name = String(location?.name ?? "").trim();
      if (!sourceId || !name) continue;
      const id = `loc_${safeIdSegment(sourceId)}`;
      db.prepare(`
        INSERT OR IGNORE INTO locations (id, name, source_system, source_id, imported_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, name, tenantSeed.sourceSystem, sourceId, importedAt);
    }

    for (const area of tenantSeed.workAreas) {
      const sourceId = String(area?.source_id ?? area?.name ?? "").trim();
      const name = String(area?.name ?? "").trim();
      if (!sourceId || !name) continue;
      const id = `area_${safeIdSegment(sourceId)}`;
      db.prepare(`
        INSERT OR IGNORE INTO work_areas (id, name, source_system, source_id, imported_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, name, tenantSeed.sourceSystem, sourceId, importedAt);
    }

    for (const employee of tenantSeed.employees) {
      const sourceId = String(employee?.source_id ?? employee?.display_name ?? "").trim();
      const displayName = String(employee?.display_name ?? "").trim();
      if (!sourceId || !displayName) continue;
      const id = `emp_${safeIdSegment(sourceId)}`;
      const initials =
        String(employee?.initials ?? "").trim() || initialsFromName(displayName);
      const roleTitle = String(employee?.role_title ?? "MFA").trim();
      const employmentStatus = String(employee?.employment_status ?? "active").trim();
      db.prepare(`
        INSERT OR IGNORE INTO employees (
          id, display_name, role_title, initials, employment_status,
          source_system, source_id, imported_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, displayName, roleTitle, initials, employmentStatus, tenantSeed.sourceSystem, sourceId, importedAt);
    }

    function locationIdByName(name) {
      const row = db.prepare("SELECT id FROM locations WHERE name = ?").get(String(name ?? "").trim());
      return row?.id ?? null;
    }
    function workAreaIdByName(name) {
      const row = db.prepare("SELECT id FROM work_areas WHERE name = ?").get(String(name ?? "").trim());
      return row?.id ?? null;
    }
    function employeeIdBySourceId(sourceId) {
      return `emp_${safeIdSegment(String(sourceId ?? "").trim())}`;
    }

    for (const shift of tenantSeed.shifts) {
      const sourceId = String(shift?.source_id ?? "").trim();
      if (!sourceId) continue;
      const workAreaId = workAreaIdByName(shift?.area);
      const locationId = locationIdByName(shift?.location);
      if (!workAreaId || !locationId) continue;
      const shiftId = `shift_${safeIdSegment(sourceId)}`;
      db.prepare(`
        INSERT OR IGNORE INTO shifts (
          id, work_area_id, location_id, starts_at, ends_at, required_staff, note,
          source_system, source_id, imported_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        shiftId,
        workAreaId,
        locationId,
        String(shift?.starts_at ?? "").trim(),
        String(shift?.ends_at ?? "").trim(),
        Number(shift?.required_staff ?? 1) || 1,
        shift?.note ?? null,
        tenantSeed.sourceSystem,
        sourceId,
        importedAt
      );
      for (const assignmentSourceId of Array.isArray(shift?.assignments) ? shift.assignments : []) {
        const employeeId = employeeIdBySourceId(assignmentSourceId);
        db.prepare(`
          INSERT OR IGNORE INTO shift_assignments (
            id, shift_id, employee_id, status, source_system, source_id, imported_at
          )
          VALUES (?, ?, ?, 'assigned', ?, ?, ?)
        `).run(
          `assign_${shiftId}_${safeIdSegment(assignmentSourceId)}`,
          shiftId,
          employeeId,
          tenantSeed.sourceSystem,
          `assign_${sourceId}_${assignmentSourceId}`,
          importedAt
        );
      }
    }

    for (const absence of tenantSeed.absences) {
      const sourceId = String(absence?.source_id ?? "").trim();
      const employeeId = employeeIdBySourceId(absence?.employee_source_id);
      if (!sourceId || !employeeId) continue;
      db.prepare(`
        INSERT OR IGNORE INTO absence_requests (
          id, employee_id, absence_type, starts_on, ends_on, status, note,
          source_system, source_id, imported_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `abs_${safeIdSegment(sourceId)}`,
        employeeId,
        String(absence?.type ?? "Urlaub").trim(),
        String(absence?.starts_on ?? "").trim(),
        String(absence?.ends_on ?? "").trim(),
        String(absence?.status ?? "offen").trim(),
        absence?.note ?? null,
        tenantSeed.sourceSystem,
        sourceId,
        importedAt
      );
    }

    for (const entry of tenantSeed.timeEntries) {
      const sourceId = String(entry?.source_id ?? "").trim();
      const employeeId = employeeIdBySourceId(entry?.employee_source_id);
      const workAreaId = workAreaIdByName(entry?.area);
      const locationId = locationIdByName(entry?.location);
      if (!sourceId || !employeeId || !workAreaId || !locationId) continue;
      db.prepare(`
        INSERT OR IGNORE INTO time_entries (
          id, employee_id, starts_at, ends_at, work_area_id, location_id,
          status, entry_type, paid_break_minutes, unpaid_break_minutes, note,
          source_system, source_id, imported_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `te_${safeIdSegment(sourceId)}`,
        employeeId,
        String(entry?.starts_at ?? "").trim(),
        String(entry?.ends_at ?? "").trim(),
        workAreaId,
        locationId,
        String(entry?.status ?? "freigegeben").trim(),
        String(entry?.entry_type ?? "Arbeitszeit").trim(),
        Number(entry?.paid_break_minutes ?? 0) || 0,
        Number(entry?.unpaid_break_minutes ?? 0) || 0,
        entry?.note ?? null,
        tenantSeed.sourceSystem,
        sourceId,
        importedAt
      );
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function seed() {
  // Roles + System-Owner sind tenantneutrale Fundament-Datensätze und
  // werden idempotent angelegt, falls die DB leer startet.
  const roles = [
    ["role_owner", "Praxisleitung", "Vollzugriff auf Import, Arbeitszeiten und Freigaben"],
    ["role_admin", "Dienstplanung", "Planung, Arbeitszeiten und Abwesenheiten verwalten"],
    ["role_employee", "MFA Self-Service", "Eigene Zeiten und Antraege einsehen"]
  ];

  db.exec("BEGIN");
  try {
    for (const [id, name, description] of roles) {
      db.prepare("INSERT OR IGNORE INTO roles (id, name, description) VALUES (?, ?, ?)").run(
        id,
        name,
        description
      );
    }
    db.prepare(`
      INSERT OR IGNORE INTO users (id, display_name, auth_provider)
      VALUES ('user_system_owner', 'Praxisleitung', 'local')
    `).run();
    db.prepare(`
      INSERT OR IGNORE INTO user_roles (user_id, role_id)
      VALUES ('user_system_owner', 'role_owner')
    `).run();
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  const employeeCount = db.prepare("SELECT COUNT(*) AS count FROM employees").get().count;
  if (employeeCount > 0) {
    return;
  }

  // Tenant-Seed (Pflicht im Produktivbetrieb) füllt Mitarbeitende,
  // Standorte und Bereiche. Ohne Tenant-Seed bleibt die DB leer —
  // Demo-Daten gibt es nicht mehr.
  const tenantSeed = loadTenantSeedFromFile();
  if (tenantSeed) {
    applyTenantSeed(tenantSeed);
  }
}

function ensureOperationalSeed() {
  // Standorte und Arbeitsbereiche kommen ausschließlich aus
  // tenant.config.json (Block workforce). Ohne Tenant-Anbindung wird
  // hier nichts geschrieben — Demo-Daten gibt es nicht mehr.
  const tenantWorkAreaCategories =
    tenantConfigGet("workforce.work_area_categories", null);
  const tenantLocations = tenantConfigGet("workforce.locations", null);

  const schemaLocations = Array.isArray(tenantLocations) && tenantLocations.length > 0
    ? tenantLocations
    : tenantWorkAreaCategories && typeof tenantWorkAreaCategories === "object"
    ? Object.keys(tenantWorkAreaCategories)
    : [];

  const schemaWorkAreas = tenantWorkAreaCategories && typeof tenantWorkAreaCategories === "object"
    ? Array.from(
        new Set(
          Object.values(tenantWorkAreaCategories).flatMap((entries) =>
            Array.isArray(entries) ? entries.map((v) => String(v).trim()) : []
          )
        )
      ).filter(Boolean)
    : [];

  if (schemaLocations.length === 0 && schemaWorkAreas.length === 0) {
    return;
  }

  const importedAt = now();
  db.exec("BEGIN");
  try {
    for (const location of schemaLocations) {
      const id = idFromName("loc", location);
      db.prepare(`
        INSERT OR IGNORE INTO locations (id, name, source_system, source_id, imported_at)
        VALUES (?, ?, 'local_schema', ?, ?)
      `).run(id, location, id, importedAt);
    }

    for (const area of schemaWorkAreas) {
      const id = idFromName("area", area);
      db.prepare(`
        INSERT OR IGNORE INTO work_areas (id, name, source_system, source_id, imported_at)
        VALUES (?, ?, 'local_schema', ?, ?)
      `).run(id, area, id, importedAt);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function rowToTimeEntry(row, audit) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    startDate: datePart(row.starts_at),
    startTime: timePart(row.starts_at),
    endDate: datePart(row.ends_at),
    endTime: timePart(row.ends_at),
    area: canonicalWorkAreaLabel(row.area),
    location: row.location,
    status: row.status,
    type: row.entry_type,
    paidBreakMinutes: row.paid_break_minutes,
    unpaidBreakMinutes: row.unpaid_break_minutes,
    note: row.note ?? undefined,
    audit,
    sourceSystem: row.source_system,
    sourceId: row.source_id
  };
}

function rowToShift(row, assignments = []) {
  return {
    id: row.id,
    startDate: datePart(row.starts_at),
    startTime: timePart(row.starts_at),
    endDate: datePart(row.ends_at),
    endTime: timePart(row.ends_at),
    area: canonicalWorkAreaLabel(row.area),
    location: row.location,
    requiredStaff: row.required_staff,
    note: row.note ?? "",
    assignments: assignments.map((employee) => ({
      ...employee,
      name: practiceDisplayName(employee.name)
    }))
  };
}

function rowToAbsence(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: practiceDisplayName(row.employee_name),
    type: row.absence_type,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    status: row.status,
    note: row.note ?? ""
  };
}

function rowToBatch(row) {
  return {
    id: row.id,
    sourceSystem: row.source_system,
    mode: row.mode,
    status: row.status,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    recordCount: row.record_count,
    insertedCount: row.inserted_count,
    updatedCount: row.updated_count,
    unchangedCount: row.unchanged_count,
    conflictCount: row.conflict_count,
    errorCount: row.error_count,
    note: row.note,
    startedAt: row.started_at,
    completedAt: row.completed_at
  };
}

function rowToConflict(row) {
  return {
    id: row.id,
    localEntity: row.local_entity,
    localId: row.local_id,
    fieldName: row.field_name,
    sourceValue: row.source_value_json ? JSON.parse(row.source_value_json) : null,
    localValue: row.local_value_json ? JSON.parse(row.local_value_json) : null,
    status: row.status,
    detectedAt: row.detected_at,
    resolutionNote: row.resolution_note ?? "",
    sourceEntity: row.source_entity ?? "",
    sourceId: row.source_id ?? ""
  };
}

function listRoles() {
  return db.prepare(`
    SELECT roles.id, roles.name, roles.description, COUNT(user_roles.user_id) AS user_count
    FROM roles
    LEFT JOIN user_roles ON user_roles.role_id = roles.id
    GROUP BY roles.id
    ORDER BY roles.name
  `).all().map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    userCount: row.user_count
  }));
}

function listUsers() {
  const roleStatement = db.prepare(`
    SELECT roles.name
    FROM user_roles
    JOIN roles ON roles.id = user_roles.role_id
    WHERE user_roles.user_id = ?
    ORDER BY roles.name
  `);

  return db.prepare(`
    SELECT id, display_name AS displayName, email, auth_provider AS authProvider, is_active AS isActive
    FROM users
    ORDER BY display_name
  `).all().map((row) => ({
    ...row,
    isActive: Boolean(row.isActive),
    roles: roleStatement.all(row.id).map((role) => role.name)
  }));
}

function listEmployees() {
  return db.prepare(`
    SELECT
      id,
      display_name AS name,
      role_title AS role,
      initials,
      employment_status AS employmentStatus,
      email,
      weekly_hours AS weeklyHours,
      source_system AS sourceSystem,
      imported_at AS importedAt
    FROM employees
    WHERE removed_from_source = 0
    ORDER BY display_name
  `).all().map((employee) => ({
    ...employee,
    name: practiceDisplayName(employee.name)
  }));
}

function getEmployeeRecord(id) {
  return listEmployees().find((employee) => employee.id === id) ?? null;
}

function listLocations() {
  return db.prepare(`
    SELECT name
    FROM locations
    WHERE is_active = 1 AND removed_from_source = 0
    ORDER BY name
  `).all().map((row) => row.name);
}

function listWorkAreas() {
  const names = db.prepare(`
    SELECT name
    FROM work_areas
    WHERE is_active = 1 AND removed_from_source = 0
    ORDER BY name
  `).all().map((row) => canonicalWorkAreaLabel(row.name));
  return Array.from(new Set(names)).sort((first, second) => first.localeCompare(second, "de-DE"));
}

export function listShifts() {
  const rows = db.prepare(`
    SELECT
      shifts.*,
      work_areas.name AS area,
      locations.name AS location
    FROM shifts
    JOIN work_areas ON work_areas.id = shifts.work_area_id
    JOIN locations ON locations.id = shifts.location_id
    WHERE shifts.removed_from_source = 0
    ORDER BY shifts.starts_at ASC, shifts.id ASC
  `).all();

  const assignmentStatement = db.prepare(`
    SELECT employees.id, employees.display_name AS name, employees.initials, employees.role_title AS role
    FROM shift_assignments
    JOIN employees ON employees.id = shift_assignments.employee_id
    WHERE shift_assignments.shift_id = ?
    ORDER BY employees.display_name
  `);

  return rows.map((row) => rowToShift(row, assignmentStatement.all(row.id)));
}

export function listAbsenceRequests() {
  return db.prepare(`
    SELECT
      absence_requests.*,
      employees.display_name AS employee_name
    FROM absence_requests
    JOIN employees ON employees.id = absence_requests.employee_id
    WHERE absence_requests.removed_from_source = 0
    ORDER BY absence_requests.starts_on ASC, absence_requests.id ASC
  `).all().map(rowToAbsence);
}

export function listImportBatches(limit = 12) {
  return db.prepare(`
    SELECT *
    FROM import_batches
    ORDER BY started_at DESC
    LIMIT ?
  `).all(limit).map(rowToBatch);
}

export function listSyncConflicts() {
  return db.prepare(`
    SELECT
      sync_conflicts.*,
      source_records.source_entity,
      source_records.source_id
    FROM sync_conflicts
    LEFT JOIN source_records ON source_records.id = sync_conflicts.source_record_id
    ORDER BY sync_conflicts.detected_at DESC
  `).all().map(rowToConflict);
}

function getDashboard() {
  const activeEntries = listTimeEntries();
  const totalMinutes = activeEntries.reduce((sum, entry) => {
    const start = new Date(`${entry.startDate}T${entry.startTime}:00`).getTime();
    const end = new Date(`${entry.endDate}T${entry.endTime}:00`).getTime();
    return sum + Math.max(0, Math.round((end - start) / 60000) - entry.unpaidBreakMinutes);
  }, 0);

  const counts = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM employees WHERE removed_from_source = 0) AS employees,
      (SELECT COUNT(*) FROM shifts WHERE removed_from_source = 0) AS shifts,
      (SELECT COUNT(*) FROM absence_requests WHERE status = 'offen' AND removed_from_source = 0) AS open_absences,
      (SELECT COUNT(*) FROM time_entries WHERE status = 'aenderungsantrag' AND removed_from_source = 0) AS open_requests,
      (SELECT COUNT(*) FROM time_entries WHERE status = 'konflikt' AND removed_from_source = 0) AS time_conflicts,
      (SELECT COUNT(*) FROM sync_conflicts WHERE status = 'open') AS sync_conflicts
  `).get();

  return {
    employees: counts.employees,
    shifts: counts.shifts,
    openAbsences: counts.open_absences,
    openRequests: counts.open_requests,
    timeConflicts: counts.time_conflicts,
    syncConflicts: counts.sync_conflicts,
    totalMinutes,
    liveEntries: 1
  };
}

function recordMinutes(startDate, startTime, endDate, endTime) {
  const start = new Date(`${startDate}T${startTime}:00`).getTime();
  const end = new Date(`${endDate}T${endTime}:00`).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
}

function recordStart(record) {
  return new Date(`${record.startDate}T${record.startTime}:00`).getTime();
}

function recordEnd(record) {
  return new Date(`${record.endDate}T${record.endTime}:00`).getTime();
}

function overlapMinutes(first, second) {
  return Math.max(0, Math.round((Math.min(recordEnd(first), recordEnd(second)) - Math.max(recordStart(first), recordStart(second))) / 60000));
}

function outsideShiftMinutes(entry, shift) {
  const early = Math.max(0, Math.round((recordStart(shift) - recordStart(entry)) / 60000));
  const late = Math.max(0, Math.round((recordEnd(entry) - recordEnd(shift)) / 60000));
  return early + late;
}

function netEntryMinutes(entry) {
  return Math.max(
    0,
    recordMinutes(entry.startDate, entry.startTime, entry.endDate, entry.endTime) - entry.unpaidBreakMinutes
  );
}

function getOperationalCoherence() {
  const employees = listEmployees();
  const shifts = listShifts();
  const entries = listTimeEntries();
  const absences = listAbsenceRequests();
  const issues = [];
  const assignmentRows = [];
  const dates = new Set();

  for (const shift of shifts) {
    dates.add(shift.startDate);
    const assignedStaff = shift.assignments.length;
    const gap = Math.max(0, shift.requiredStaff - assignedStaff);

    if (gap > 0) {
      issues.push({
        id: `open_${shift.id}`,
        type: "open_shift",
        tone: "amber",
        date: shift.startDate,
        title: "Offene Schicht",
        detail: `${shift.area} ${shift.startTime}-${shift.endTime}: ${gap} Besetzung fehlt`,
        area: shift.area,
        targetView: "plan"
      });
    }

    for (const employee of shift.assignments) {
      assignmentRows.push({ shift, employee });
    }
  }

  for (const entry of entries) {
    dates.add(entry.startDate);
    const employee = employees.find((candidate) => candidate.id === entry.employeeId);
    const sameDayShifts = shifts.filter(
      (shift) =>
        shift.startDate === entry.startDate &&
        shift.assignments.some((assigned) => assigned.id === entry.employeeId)
    );
    const bestShift = sameDayShifts
      .map((shift) => ({ shift, overlap: overlapMinutes(entry, shift) }))
      .sort((left, right) => right.overlap - left.overlap)[0];

    if (!bestShift) {
      issues.push({
        id: `no_shift_${entry.id}`,
        type: "time_without_shift",
        tone: "rose",
        date: entry.startDate,
        title: "Zeit ohne zugewiesene Schicht",
        detail: `${employee?.name ?? "Mitarbeiter"} ${entry.startTime}-${entry.endTime} in ${entry.area}`,
        employeeId: entry.employeeId,
        employeeName: employee?.name ?? "",
        area: entry.area,
        targetView: "time"
      });
      continue;
    }

    if (bestShift.overlap === 0) {
      issues.push({
        id: `outside_${entry.id}`,
        type: "time_outside_shift",
        tone: "rose",
        date: entry.startDate,
        title: "Zeit liegt außerhalb der Schicht",
        detail: `${employee?.name ?? "Mitarbeiter"} ${entry.startTime}-${entry.endTime}, Plan ${bestShift.shift.startTime}-${bestShift.shift.endTime}`,
        employeeId: entry.employeeId,
        employeeName: employee?.name ?? "",
        area: entry.area,
        targetView: "time"
      });
    } else {
      const outsideMinutes = outsideShiftMinutes(entry, bestShift.shift);
      if (outsideMinutes > 15) {
        issues.push({
          id: `deviation_${entry.id}`,
          type: "time_deviation",
          tone: outsideMinutes > 60 ? "rose" : "amber",
          date: entry.startDate,
          title: "Zeit weicht vom Plan ab",
          detail: `${employee?.name ?? "Mitarbeiter"} ${outsideMinutes} Min. außerhalb ${bestShift.shift.startTime}-${bestShift.shift.endTime}`,
          employeeId: entry.employeeId,
          employeeName: employee?.name ?? "",
          area: entry.area,
          targetView: "time"
        });
      }
    }

    if (entry.area !== bestShift.shift.area) {
      issues.push({
        id: `area_${entry.id}`,
        type: "area_mismatch",
        tone: "amber",
        date: entry.startDate,
        title: "Bereich passt nicht zur Schicht",
        detail: `${employee?.name ?? "Mitarbeiter"} Ist ${entry.area}, Plan ${bestShift.shift.area}`,
        employeeId: entry.employeeId,
        employeeName: employee?.name ?? "",
        area: entry.area,
        targetView: "time"
      });
    }
  }

  for (const { shift, employee } of assignmentRows) {
    const hasEntry = entries.some(
      (entry) => entry.employeeId === employee.id && entry.startDate === shift.startDate
    );
    if (!hasEntry) {
      issues.push({
        id: `missing_${shift.id}_${employee.id}`,
        type: "missing_time",
        tone: "rose",
        date: shift.startDate,
        title: "Schicht ohne Arbeitszeit",
        detail: `${employee.name} ${shift.area} ${shift.startTime}-${shift.endTime}`,
        employeeId: employee.id,
        employeeName: employee.name,
        area: shift.area,
        targetView: "time"
      });
    }
  }

  for (const absence of absences) {
    for (const { shift, employee } of assignmentRows) {
      if (
        absence.employeeId === employee.id &&
        absence.status !== "abgelehnt" &&
        absence.startsOn <= shift.startDate &&
        absence.endsOn >= shift.startDate
      ) {
        issues.push({
          id: `absence_${absence.id}_${shift.id}`,
          type: "absence_on_shift",
          tone: absence.status === "offen" ? "amber" : "rose",
          date: shift.startDate,
          title: "Abwesenheit auf geplanter Schicht",
          detail: `${employee.name}: ${absence.type} und ${shift.area} am selben Tag`,
          employeeId: employee.id,
          employeeName: employee.name,
          area: shift.area,
          targetView: "absences"
        });
      }
    }
  }

  const daySummaries = [...dates].sort().map((date) => {
    const dayShifts = shifts.filter((shift) => shift.startDate === date);
    const dayEntries = entries.filter((entry) => entry.startDate === date);
    const dayAssignments = assignmentRows.filter((row) => row.shift.startDate === date);
    const dayIssues = issues.filter((issue) => issue.date === date);

    return {
      date,
      shifts: dayShifts.length,
      assignments: dayAssignments.length,
      entries: dayEntries.length,
      plannedMinutes: dayAssignments.reduce(
        (sum, row) => sum + recordMinutes(row.shift.startDate, row.shift.startTime, row.shift.endDate, row.shift.endTime),
        0
      ),
      actualMinutes: dayEntries.reduce((sum, entry) => sum + netEntryMinutes(entry), 0),
      issues: dayIssues.length
    };
  });

  const missingTime = issues.filter((issue) => issue.type === "missing_time").length;
  const openShiftSlots = shifts.reduce((sum, shift) => sum + Math.max(0, shift.requiredStaff - shift.assignments.length), 0);
  const timeWithoutShift = issues.filter((issue) => issue.type === "time_without_shift").length;
  const timeOutsideShift = issues.filter((issue) => issue.type === "time_outside_shift" || issue.type === "time_deviation").length;
  const areaMismatches = issues.filter((issue) => issue.type === "area_mismatch").length;
  const absenceOverlaps = issues.filter((issue) => issue.type === "absence_on_shift").length;
  const matchedEntries = entries.length - timeWithoutShift;
  const assignedWithEntry = assignmentRows.filter(({ shift, employee }) =>
    entries.some((entry) => entry.employeeId === employee.id && entry.startDate === shift.startDate)
  ).length;

  return {
    summary: {
      shifts: shifts.length,
      assignments: assignmentRows.length,
      openShiftSlots,
      entries: entries.length,
      matchedEntries,
      missingTime,
      timeWithoutShift,
      timeOutsideShift,
      areaMismatches,
      absenceOverlaps,
      coveragePercent: assignmentRows.length ? Math.round((assignedWithEntry / assignmentRows.length) * 100) : 100,
      plannedMinutes: daySummaries.reduce((sum, day) => sum + day.plannedMinutes, 0),
      actualMinutes: daySummaries.reduce((sum, day) => sum + day.actualMinutes, 0)
    },
    daySummaries,
    issues: issues
      .sort((left, right) => {
        const toneWeight = { rose: 0, amber: 1, teal: 2 };
        return (toneWeight[left.tone] ?? 3) - (toneWeight[right.tone] ?? 3) || left.date.localeCompare(right.date);
      })
      .slice(0, 30)
  };
}

function getMigrationReport(coherence) {
  const employees = listEmployees();
  const shifts = listShifts();
  const entries = listTimeEntries();
  const absences = listAbsenceRequests();
  const latestBatch = listImportBatches(1)[0] ?? null;
  const today = now().slice(0, 10);
  const weekMap = new Map();

  function ensureWeek(date) {
    const weekStart = startOfIsoWeek(date);
    if (!weekMap.has(weekStart)) {
      weekMap.set(weekStart, {
        week: isoWeekLabel(date),
        weekStart,
        weekEnd: addDays(weekStart, 6),
        shifts: 0,
        requiredStaff: 0,
        assignments: 0,
        openSlots: 0,
        timeEntries: 0,
        plannedMinutes: 0,
        actualMinutes: 0,
        absences: 0
      });
    }
    return weekMap.get(weekStart);
  }

  for (const shift of shifts) {
    const week = ensureWeek(shift.startDate);
    week.shifts += 1;
    week.requiredStaff += shift.requiredStaff;
    week.assignments += shift.assignments.length;
    week.openSlots += Math.max(0, shift.requiredStaff - shift.assignments.length);
    week.plannedMinutes += shift.assignments.length * recordMinutes(
      shift.startDate,
      shift.startTime,
      shift.endDate,
      shift.endTime
    );
  }

  for (const entry of entries) {
    const week = ensureWeek(entry.startDate);
    week.timeEntries += 1;
    week.actualMinutes += netEntryMinutes(entry);
  }

  for (const absence of absences) {
    let cursor = startOfIsoWeek(absence.startsOn);
    const finalWeek = startOfIsoWeek(absence.endsOn);
    while (cursor <= finalWeek) {
      ensureWeek(cursor).absences += 1;
      cursor = addDays(cursor, 7);
    }
  }

  const weekCoverage = [...weekMap.values()]
    .sort((left, right) => left.weekStart.localeCompare(right.weekStart))
    .map((week) => {
      const coveragePercent = week.assignments
        ? Math.round((Math.min(week.timeEntries, week.assignments) / week.assignments) * 100)
        : week.timeEntries
          ? 0
          : 100;
      const pastWeek = week.weekEnd < today;
      const futureWeek = week.weekStart > today;
      let status = "ok";
      let tone = "teal";
      let statusLabel = "plausibel";

      if (pastWeek && week.shifts > 0 && week.assignments === 0) {
        status = "unassigned_plan";
        tone = "amber";
        statusLabel = "ohne Zuordnung";
      } else if (pastWeek && week.assignments > 0 && week.timeEntries === 0) {
        status = "source_gap";
        tone = "rose";
        statusLabel = "Datenlücke";
      } else if (pastWeek && week.assignments > 0 && coveragePercent < 80) {
        status = "low_coverage";
        tone = "amber";
        statusLabel = "Teilabdeckung";
      } else if (futureWeek && week.timeEntries === 0) {
        status = "future_plan";
        tone = "muted";
        statusLabel = "zukünftig";
      } else if (week.openSlots > 0) {
        status = "open_slots";
        tone = "amber";
        statusLabel = "offene Besetzung";
      }

      return {
        ...week,
        coveragePercent,
        status,
        tone,
        statusLabel
      };
    });

  const sourceGaps = weekCoverage
    .filter((week) => ["source_gap", "low_coverage", "unassigned_plan"].includes(week.status))
    .map((week) => ({
      week: week.week,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      type: week.status,
      tone: week.tone,
      title:
        week.status === "source_gap"
          ? "Arbeitszeiten fehlen vollständig"
          : week.status === "low_coverage"
            ? "Arbeitszeiten nur teilweise vorhanden"
            : "Planung ohne Zuordnung",
      detail:
        week.status === "source_gap"
          ? `${week.assignments} Plan-Zuweisungen, aber 0 Ist-Arbeitszeiten.`
          : week.status === "low_coverage"
            ? `${week.timeEntries}/${week.assignments} Ist-Arbeitszeiten aus Plan-Zuweisungen ableitbar.`
            : `${week.shifts} Schichten ohne Mitarbeiterzuordnung.`,
      shifts: week.shifts,
      assignments: week.assignments,
      timeEntries: week.timeEntries,
      coveragePercent: week.coveragePercent
    }));

  const sourceRecordRows = db.prepare(`
    SELECT
      source_entity AS entity,
      COUNT(*) AS total,
      SUM(CASE WHEN removed_from_source = 0 THEN 1 ELSE 0 END) AS active,
      SUM(CASE WHEN removed_from_source = 1 THEN 1 ELSE 0 END) AS removed
    FROM source_records
    GROUP BY source_entity
    ORDER BY source_entity
  `).all();

  const latestBatchRows = latestBatch
    ? db.prepare(`
        SELECT source_entity AS entity, COUNT(*) AS records
        FROM source_records
        WHERE import_batch_id = ?
        GROUP BY source_entity
        ORDER BY source_entity
      `).all(latestBatch.id)
    : [];

  const counts = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM locations WHERE removed_from_source = 0) AS locations,
      (SELECT COUNT(*) FROM work_areas WHERE removed_from_source = 0) AS work_areas,
      (SELECT COUNT(*) FROM shift_assignments JOIN shifts ON shifts.id = shift_assignments.shift_id WHERE shifts.removed_from_source = 0) AS assignments,
      (SELECT COUNT(*) FROM source_records WHERE removed_from_source = 0) AS source_records
  `).get();

  function rangeFor(records, dates) {
    const values = records.flatMap(dates).filter(Boolean).sort();
    return {
      start: values[0] ?? null,
      end: values.at(-1) ?? null
    };
  }

  return {
    generatedAt: now(),
    latestBatch,
    period: {
      shifts: rangeFor(shifts, (shift) => [shift.startDate, shift.endDate]),
      timeEntries: rangeFor(entries, (entry) => [entry.startDate, entry.endDate]),
      absences: rangeFor(absences, (absence) => [absence.startsOn, absence.endsOn])
    },
    entityCounts: {
      employees: employees.length,
      locations: counts.locations,
      workAreas: counts.work_areas,
      shifts: shifts.length,
      assignments: counts.assignments,
      timeEntries: entries.length,
      absences: absences.length,
      sourceRecords: counts.source_records
    },
    sourceRecords: sourceRecordRows.map((row) => ({
      entity: row.entity,
      total: row.total,
      active: row.active ?? 0,
      removed: row.removed ?? 0
    })),
    latestBatchRecords: latestBatchRows.map((row) => ({
      entity: row.entity,
      records: row.records
    })),
    quality: {
      coveragePercent: coherence.summary.coveragePercent,
      matchedEntries: coherence.summary.matchedEntries,
      entries: coherence.summary.entries,
      missingTime: coherence.summary.missingTime,
      timeWithoutShift: coherence.summary.timeWithoutShift,
      timeOutsideShift: coherence.summary.timeOutsideShift,
      areaMismatches: coherence.summary.areaMismatches,
      absenceOverlaps: coherence.summary.absenceOverlaps,
      openShiftSlots: coherence.summary.openShiftSlots,
      openConflicts: db.prepare("SELECT COUNT(*) AS count FROM sync_conflicts WHERE status = 'open'").get().count
    },
    sourceGaps,
    weekCoverage
  };
}

function buildWorkforceConfigForBootstrap() {
  // Tenant-spezifische UI-Konfiguration. Reicht die rohen workforce.*-
  // Bloecke aus tenant.config.json an die App durch, ergaenzt um
  // sichere Defaults fuer den Demo-Modus.
  return {
    defaultLocationName: tenantConfigGet("workforce.default_location_name", "Praxis Demo"),
    defaultWeeklyHours: tenantConfigGet("workforce.default_weekly_hours", { default: 40, by_name_tokens: [] }),
    displayNameOverrides: tenantConfigGet("workforce.display_name_overrides", []) ?? [],
    workAreaOverrides: tenantConfigGet("workforce.work_area_overrides", []) ?? [],
    shortAreaOverrides: tenantConfigGet("workforce.short_area_overrides", []) ?? [],
    aggregationGroups: tenantConfigGet("workforce.aggregation_groups", []) ?? [],
    tolerances: tenantConfigGet("workforce.tolerances", { monthly_over_soll_warn_percent: 5 }),
    defaultCalculationNote: tenantConfigGet(
      "workforce.default_calculation_note",
      "MFA-Zeiten werden nur über die Mitarbeiter-ID gezählt; der Arbeitsbereich ist Herkunft der Buchung, keine feste Zuordnung."
    ),
    shiftSchema: tenantConfigGet("workforce.shift_schema", []) ?? [],
    isDemo: tenantIsDemo()
  };
}

export function getBootstrap() {
  ensureDoctorSprechstundeAssignments();
  const employees = listEmployees();
  const locations = listLocations();
  const workAreas = listWorkAreas();

  const entries = listTimeEntries();
  const lastBatch = db.prepare(`
    SELECT *
    FROM import_batches
    ORDER BY started_at DESC
    LIMIT 1
  `).get();

  const importStats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM import_batches) AS batches,
      (SELECT COUNT(*) FROM source_records WHERE removed_from_source = 0) AS source_records,
      (SELECT COUNT(*) FROM sync_conflicts WHERE status = 'open') AS open_conflicts
  `).get();
  const coherence = getOperationalCoherence();

  return {
    employees,
    locations,
    workAreas,
    timeEntries: entries,
    shifts: listShifts(),
    absences: listAbsenceRequests(),
    importBatches: listImportBatches(),
    syncConflicts: listSyncConflicts(),
    dashboard: getDashboard(),
    coherence,
    migrationReport: getMigrationReport(coherence),
    workforce: buildWorkforceConfigForBootstrap(),
    auth: {
      currentUser: listUsers()[0] ?? null,
      users: listUsers(),
      roles: listRoles()
    },
    sync: {
      database: "sqlite",
      sourceSystem: lastBatch?.source_system ?? "none",
      lastBatch: lastBatch
        ? {
            id: lastBatch.id,
            status: lastBatch.status,
            mode: lastBatch.mode,
            periodStart: lastBatch.period_start,
            periodEnd: lastBatch.period_end,
            recordCount: lastBatch.record_count,
            insertedCount: lastBatch.inserted_count,
            updatedCount: lastBatch.updated_count,
            unchangedCount: lastBatch.unchanged_count,
            conflictCount: lastBatch.conflict_count,
            errorCount: lastBatch.error_count,
            completedAt: lastBatch.completed_at,
            note: lastBatch.note
          }
        : null,
      stats: {
        batches: importStats.batches,
        sourceRecords: importStats.source_records,
        openConflicts: importStats.open_conflicts
      }
    }
  };
}

export function listTimeEntries() {
  const rows = db.prepare(`
    SELECT
      time_entries.*,
      work_areas.name AS area,
      locations.name AS location
    FROM time_entries
    JOIN work_areas ON work_areas.id = time_entries.work_area_id
    JOIN locations ON locations.id = time_entries.location_id
    WHERE time_entries.removed_from_source = 0
    ORDER BY time_entries.starts_at DESC, time_entries.id DESC
  `).all();

  const auditStatement = db.prepare(`
    SELECT action, reason
    FROM audit_events
    WHERE entity_type = 'time_entry' AND entity_id = ?
    ORDER BY created_at ASC
  `);

  return rows.map((row) => {
    const audit = auditStatement
      .all(row.id)
      .map((event) => (event.reason ? `${event.action}: ${event.reason}` : event.action));
    return rowToTimeEntry(row, audit);
  });
}

export function createTimeEntry(payload) {
  const employeeId = requireString(payload, "employeeId");
  const startDate = requireString(payload, "startDate");
  const startTime = requireString(payload, "startTime");
  const endDate = requireString(payload, "endDate");
  const endTime = requireString(payload, "endTime");
  const area = canonicalWorkAreaLabel(requireString(payload, "area"));
  const location = requireString(payload, "location");
  const entryType = requireString(payload, "type");
  const status = payload.status && allowedStatuses.has(payload.status) ? payload.status : "entwurf";

  if (!allowedEntryTypes.has(entryType)) {
    throw new Error(`Ungueltiger Typ: ${entryType}`);
  }

  const employee = db.prepare("SELECT id FROM employees WHERE id = ?").get(employeeId);
  const workArea = ensureWorkArea(area);
  const locationRow = db.prepare("SELECT id FROM locations WHERE name = ?").get(location);

  if (!employee || !workArea || !locationRow) {
    throw new Error("Mitarbeiter, Arbeitsbereich oder Standort nicht gefunden");
  }

  const id = payload.id && typeof payload.id === "string" ? payload.id : `time_${randomUUID()}`;
  const createdAt = now();

  db.exec("BEGIN");
  try {
    db.prepare(`
      INSERT INTO time_entries (
        id, employee_id, starts_at, ends_at, work_area_id, location_id, status,
        entry_type, paid_break_minutes, unpaid_break_minutes, note,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      employeeId,
      toDateTime(startDate, startTime),
      toDateTime(endDate, endTime),
      workArea.id,
      locationRow.id,
      status,
      entryType,
      minutes(payload.paidBreakMinutes),
      minutes(payload.unpaidBreakMinutes),
      typeof payload.note === "string" && payload.note.trim() ? payload.note.trim() : null,
      createdAt,
      createdAt
    );

    insertAudit("time_entry", id, "Manuell angelegt", "Noch nicht freigegeben", null, {
      status,
      startDate,
      startTime,
      endDate,
      endTime
    });

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return getTimeEntry(id);
}

export function createEmployee(payload) {
  const firstName = typeof payload.firstName === "string" ? payload.firstName.trim() : "";
  const lastName = typeof payload.lastName === "string" ? payload.lastName.trim() : "";
  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : requireString(payload, "name");
  const roleTitle = requireString(payload, "role");
  const initials =
    typeof payload.initials === "string" && payload.initials.trim()
      ? payload.initials.trim().slice(0, 2).toUpperCase()
      : displayName
          .split(/\s+/)
          .map((part) => part[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
  const id = payload.id && typeof payload.id === "string" ? payload.id : `emp_${randomUUID()}`;
  const createdAt = now();
  const email = normalizeEmployeeEmail(payload.email);
  const weeklyHours = normalizeEmployeeWeeklyHours(payload.weeklyHours);

  db.exec("BEGIN");
  try {
    db.prepare(`
      INSERT INTO employees (
        id, display_name, role_title, initials, employment_status, email, weekly_hours, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?)
    `).run(id, displayName, roleTitle, initials, email, weeklyHours, createdAt, createdAt);
    insertAudit("employee", id, "Mitarbeiter angelegt", "Lokal in Praxis Monitoring erstellt");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return getEmployeeRecord(id);
}

function normalizeEmployeeEmail(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error("Ungueltige E-Mail-Adresse");
  }
  return trimmed.toLowerCase();
}

function normalizeEmployeeWeeklyHours(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0 || num > 168) {
    throw new Error("Wochenstunden muss eine Zahl zwischen 0 und 168 sein");
  }
  return Math.round(num * 100) / 100;
}

export function updateEmployee(id, payload) {
  const current = db.prepare("SELECT * FROM employees WHERE id = ? AND removed_from_source = 0").get(id);
  if (!current) {
    throw new Error("Mitarbeiter nicht gefunden");
  }
  const updates = {};

  if (typeof payload.name === "string" && payload.name.trim()) {
    updates.display_name = payload.name.trim();
  }
  if (typeof payload.role === "string" && payload.role.trim()) {
    updates.role_title = payload.role.trim();
  }
  if (typeof payload.initials === "string" && payload.initials.trim()) {
    updates.initials = payload.initials.trim().slice(0, 2).toUpperCase();
  } else if (updates.display_name) {
    updates.initials = updates.display_name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  if (Object.prototype.hasOwnProperty.call(payload, "email")) {
    updates.email = normalizeEmployeeEmail(payload.email);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "weeklyHours")) {
    updates.weekly_hours = normalizeEmployeeWeeklyHours(payload.weeklyHours);
  }
  if (typeof payload.employmentStatus === "string") {
    const status = payload.employmentStatus.trim();
    if (status !== "active" && status !== "inactive") {
      throw new Error("employmentStatus muss 'active' oder 'inactive' sein");
    }
    updates.employment_status = status;
  }

  const keys = Object.keys(updates);
  if (keys.length === 0) {
    return getEmployeeRecord(id);
  }

  const assignments = keys.map((key) => `${key} = ?`).join(", ");
  const values = keys.map((key) => updates[key]);
  const updatedAt = now();

  db.exec("BEGIN");
  try {
    db.prepare(
      `UPDATE employees SET ${assignments}, updated_at = ? WHERE id = ?`
    ).run(...values, updatedAt, id);
    insertAudit(
      "employee",
      id,
      "Mitarbeiter aktualisiert",
      `Felder: ${keys.join(", ")}`,
      JSON.stringify(
        Object.fromEntries(keys.map((key) => [key, current[key] ?? null]))
      ),
      JSON.stringify(updates)
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return getEmployeeRecord(id);
}

export function deleteEmployee(id) {
  const current = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
  if (!current) {
    throw new Error("Mitarbeiter nicht gefunden");
  }
  if (current.removed_from_source) {
    return { id, removed: true };
  }
  const updatedAt = now();

  db.exec("BEGIN");
  try {
    db.prepare(
      `UPDATE employees SET removed_from_source = 1, employment_status = 'inactive', updated_at = ? WHERE id = ?`
    ).run(updatedAt, id);
    insertAudit(
      "employee",
      id,
      "Mitarbeiter entfernt",
      "Soft-Delete via API; historische Zeiteintraege bleiben erhalten",
      JSON.stringify({ employment_status: current.employment_status, removed_from_source: current.removed_from_source }),
      JSON.stringify({ employment_status: "inactive", removed_from_source: 1 })
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return { id, removed: true };
}

export function createShift(payload) {
  const area = canonicalWorkAreaLabel(requireString(payload, "area"));
  const location = requireString(payload, "location");
  const startDate = requireString(payload, "startDate");
  const startTime = requireString(payload, "startTime");
  const endDate = requireString(payload, "endDate");
  const endTime = requireString(payload, "endTime");
  const requiredStaff = Math.max(1, Math.round(Number(payload.requiredStaff) || 1));
  const dates = datesInRange(startDate, endDate);
  const baseId = payload.id && typeof payload.id === "string" ? payload.id : `shift_${randomUUID()}`;
  const createdAt = now();
  const assignments = Array.isArray(payload.assignments) ? payload.assignments : [];
  const createdIds = [];

  db.exec("BEGIN");
  try {
    const workArea = ensureWorkArea(area);
    const locationRow = ensureLocation(location);
    const insertShift = db.prepare(`
      INSERT INTO shifts (
        id, work_area_id, location_id, starts_at, ends_at, required_staff, note, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertAssignment = db.prepare(`
      INSERT OR IGNORE INTO shift_assignments (id, shift_id, employee_id, status)
      VALUES (?, ?, ?, 'assigned')
    `);
    const note = typeof payload.note === "string" && payload.note.trim() ? payload.note.trim() : null;

    for (const date of dates) {
      const id = dates.length === 1 ? baseId : `${baseId}_${date.replaceAll("-", "_")}`;
      const shiftEndDate = endTime <= startTime ? addDays(date, 1) : date;

      insertShift.run(
        id,
        workArea.id,
        locationRow.id,
        toDateTime(date, startTime),
        toDateTime(shiftEndDate, endTime),
        requiredStaff,
        note,
        createdAt,
        createdAt
      );

      for (const employeeId of assignments) {
        const employee = db.prepare("SELECT id FROM employees WHERE id = ?").get(employeeId);
        if (employee) {
          insertAssignment.run(`assign_${id}_${employeeId}`, id, employeeId);
        }
      }

      insertAudit(
        "shift",
        id,
        dates.length === 1 ? "Schicht angelegt" : "Schichtserie angelegt",
        dates.length === 1 ? "Lokal in Praxis Monitoring erstellt" : "Als Tageswiederholung erstellt"
      );
      createdIds.push(id);
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  const created = new Set(createdIds);
  return listShifts().filter((shift) => created.has(shift.id));
}

export function updateShift(id, payload) {
  const existing = db.prepare("SELECT id FROM shifts WHERE id = ? AND removed_from_source = 0").get(id);

  if (!existing) {
    throw new Error("Schicht nicht gefunden");
  }

  const area = canonicalWorkAreaLabel(requireString(payload, "area"));
  const location = requireString(payload, "location");
  const startDate = requireString(payload, "startDate");
  const startTime = requireString(payload, "startTime");
  const endTime = requireString(payload, "endTime");
  const endDate = endTime <= startTime ? addDays(startDate, 1) : startDate;
  const requiredStaff = Math.max(1, Math.round(Number(payload.requiredStaff) || 1));

  const assignments = Array.isArray(payload.assignments) ? payload.assignments : [];
  const updatedAt = now();
  const note = typeof payload.note === "string" && payload.note.trim() ? payload.note.trim() : null;

  db.exec("BEGIN");
  try {
    const workArea = ensureWorkArea(area);
    const locationRow = ensureLocation(location);
    db.prepare(`
      UPDATE shifts
      SET
        work_area_id = ?,
        location_id = ?,
        starts_at = ?,
        ends_at = ?,
        required_staff = ?,
        note = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      workArea.id,
      locationRow.id,
      toDateTime(startDate, startTime),
      toDateTime(endDate, endTime),
      requiredStaff,
      note,
      updatedAt,
      id
    );

    db.prepare("DELETE FROM shift_assignments WHERE shift_id = ?").run(id);

    const insertAssignment = db.prepare(`
      INSERT OR IGNORE INTO shift_assignments (id, shift_id, employee_id, status)
      VALUES (?, ?, ?, 'assigned')
    `);

    for (const employeeId of assignments) {
      const employee = db.prepare("SELECT id FROM employees WHERE id = ?").get(employeeId);
      if (employee) {
        insertAssignment.run(`assign_${id}_${employeeId}`, id, employeeId);
      }
    }

    insertAudit("shift", id, "Schicht aktualisiert", "Kalenderdialog", null, {
      startDate,
      startTime,
      endDate,
      endTime,
      requiredStaff,
      assignments
    });

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return listShifts().find((shift) => shift.id === id);
}

export function deleteShift(id) {
  const existing = db.prepare("SELECT id FROM shifts WHERE id = ? AND removed_from_source = 0").get(id);

  if (!existing) {
    throw new Error("Schicht nicht gefunden");
  }

  const deletedAt = now();

  db.exec("BEGIN");
  try {
    db.prepare(`
      UPDATE shifts
      SET removed_from_source = 1, updated_at = ?
      WHERE id = ?
    `).run(deletedAt, id);

    db.prepare("DELETE FROM shift_assignments WHERE shift_id = ?").run(id);
    insertAudit("shift", id, "Schicht gelöscht", "Lokal im Kalenderdialog entfernt");

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return { id };
}

export function createAbsenceRequest(payload) {
  const employeeId = requireString(payload, "employeeId");
  const absenceType = requireString(payload, "type");
  const startsOn = requireString(payload, "startsOn");
  const endsOn = requireString(payload, "endsOn");
  const employee = db.prepare("SELECT id FROM employees WHERE id = ?").get(employeeId);

  if (!employee) {
    throw new Error("Mitarbeiter nicht gefunden");
  }

  const status =
    typeof payload.status === "string" && ["offen", "genehmigt", "abgelehnt"].includes(payload.status)
      ? payload.status
      : "offen";
  const id = payload.id && typeof payload.id === "string" ? payload.id : `absence_${randomUUID()}`;
  const createdAt = now();

  db.exec("BEGIN");
  try {
    db.prepare(`
      INSERT INTO absence_requests (
        id, employee_id, absence_type, starts_on, ends_on, status, note, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      employeeId,
      absenceType,
      startsOn,
      endsOn,
      status,
      typeof payload.note === "string" && payload.note.trim() ? payload.note.trim() : null,
      createdAt,
      createdAt
    );
    insertAudit("absence_request", id, "Abwesenheit angelegt", "Lokal in Praxis Monitoring erstellt");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return listAbsenceRequests().find((absence) => absence.id === id);
}

export function updateAbsenceStatus(id, status) {
  if (!["genehmigt", "abgelehnt"].includes(status)) {
    throw new Error(`Ungueltiger Abwesenheitsstatus: ${status}`);
  }

  const existing = db.prepare("SELECT status FROM absence_requests WHERE id = ?").get(id);
  if (!existing) {
    throw new Error("Abwesenheit nicht gefunden");
  }
  if (existing.status !== "offen") {
    throw new Error("Entschiedene Abwesenheitsantraege koennen nicht erneut entschieden werden");
  }

  db.exec("BEGIN");
  try {
    db.prepare("UPDATE absence_requests SET status = ?, updated_at = ? WHERE id = ?").run(
      status,
      now(),
      id
    );
    insertAudit(
      "absence_request",
      id,
      `Status gesetzt: ${status}`,
      null,
      { status: existing.status },
      { status }
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return listAbsenceRequests().find((absence) => absence.id === id);
}

function recordAction(sourceSystem, sourceEntity, sourceId, payload) {
  const rawHash = hashPayload(payload);
  const existing = db.prepare(`
    SELECT raw_hash
    FROM source_records
    WHERE source_system = ? AND source_entity = ? AND source_id = ?
  `).get(sourceSystem, sourceEntity, sourceId);

  if (!existing) {
    return "inserted";
  }

  return existing.raw_hash === rawHash ? "unchanged" : "updated";
}

function incrementSummary(summary, action) {
  if (action === "inserted") summary.insertedCount += 1;
  if (action === "updated") summary.updatedCount += 1;
  if (action === "unchanged") summary.unchangedCount += 1;
  if (action === "conflict") summary.conflictCount += 1;
}

function upsertImportedNamedEntity(
  batchId,
  table,
  sourceEntity,
  localEntity,
  idPrefix,
  record,
  summary,
  sourceSystem,
  importedAt
) {
  const name = typeof record.name === "string" && record.name.trim() ? record.name.trim() : null;
  if (!name) {
    summary.errorCount += 1;
    return null;
  }

  const sourceId = String(record.sourceId ?? idFromName(idPrefix, name));
  const payload = { ...record, name, sourceId, updatedAt: record.updatedAt ?? importedAt };
  const action = recordAction(sourceSystem, sourceEntity, sourceId, payload);
  const existing = db.prepare(`SELECT id, name FROM ${table} WHERE name = ?`).get(name);
  const localId = existing?.id ?? uniqueLocalId(table, idPrefix, name);

  if (action !== "unchanged") {
    db.prepare(`
      INSERT INTO ${table} (id, name, source_system, source_id, imported_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (name) DO UPDATE SET
        source_system = excluded.source_system,
        source_id = excluded.source_id,
        imported_at = excluded.imported_at,
        updated_at = excluded.updated_at,
        removed_from_source = 0,
        is_active = 1
    `).run(localId, name, sourceSystem, sourceId, importedAt, importedAt);
  }

  insertSourceRecord(batchId, sourceEntity, sourceId, localEntity, localId, payload, sourceSystem);
  incrementSummary(summary, action);
  return { id: localId, name };
}

function upsertImportedEmployee(batchId, record, summary, sourceSystem = "ordio", importedAt = now()) {
  const sourceId = String(record.sourceId ?? record.id ?? record.displayName);
  const localId = localIdFromSource("emp", sourceId);
  const payload = { ...record, sourceId, updatedAt: record.updatedAt ?? importedAt };
  const action = recordAction(sourceSystem, "employee", sourceId, payload);
  const displayName = String(record.displayName ?? record.name ?? "").trim();
  const roleTitle = String(record.roleTitle ?? record.role ?? "Mitarbeiter").trim() || "Mitarbeiter";
  const initials = String(record.initials ?? initialsFromName(displayName)).trim().slice(0, 3).toUpperCase();
  const employmentStatus =
    typeof record.employmentStatus === "string" && record.employmentStatus.trim()
      ? record.employmentStatus.trim()
      : "active";

  if (!displayName) {
    summary.errorCount += 1;
    return null;
  }

  if (action !== "unchanged") {
    db.prepare(`
      INSERT INTO employees (
        id, display_name, role_title, initials, employment_status,
        source_system, source_id, imported_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        display_name = excluded.display_name,
        role_title = excluded.role_title,
        initials = excluded.initials,
        employment_status = excluded.employment_status,
        source_system = excluded.source_system,
        source_id = excluded.source_id,
        imported_at = excluded.imported_at,
        updated_at = excluded.updated_at,
        removed_from_source = 0
    `).run(
      localId,
      displayName,
      roleTitle,
      initials,
      employmentStatus,
      sourceSystem,
      sourceId,
      importedAt,
      importedAt
    );
  }

  insertSourceRecord(batchId, "employee", sourceId, "employee", localId, payload, sourceSystem);
  db.prepare(`
    INSERT OR IGNORE INTO employee_external_ids (id, employee_id, source_system, source_id, imported_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(`ext_${sourceSystem}_${safeIdSegment(sourceId)}`, localId, sourceSystem, sourceId, importedAt);
  incrementSummary(summary, action);
  return localId;
}

function upsertImportedShift(batchId, record, summary, sourceSystem = "ordio", importedAt = now()) {
  const sourceId = String(record.sourceId ?? record.id);
  const localId = localIdFromSource("shift", sourceId);
  const payload = { ...record, sourceId, updatedAt: record.updatedAt ?? importedAt };
  const action = recordAction(sourceSystem, "shift", sourceId, payload);
  const area = typeof record.area === "string" && record.area.trim() ? record.area.trim() : "Ohne Bereich";
  const location =
    typeof record.location === "string" && record.location.trim() ? record.location.trim() : defaultLocationName;
  const workArea = ensureWorkArea(area);
  const locationRow = ensureLocation(location);

  if (action !== "unchanged") {
    db.prepare(`
      INSERT INTO shifts (
        id, work_area_id, location_id, starts_at, ends_at, required_staff, note,
        source_system, source_id, imported_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        work_area_id = excluded.work_area_id,
        location_id = excluded.location_id,
        starts_at = excluded.starts_at,
        ends_at = excluded.ends_at,
        required_staff = excluded.required_staff,
        note = excluded.note,
        source_system = excluded.source_system,
        source_id = excluded.source_id,
        imported_at = excluded.imported_at,
        updated_at = excluded.updated_at,
        removed_from_source = 0
    `).run(
      localId,
      workArea.id,
      locationRow.id,
      toDateTime(record.startDate, record.startTime),
      toDateTime(record.endDate, record.endTime),
      normalizeRequiredStaff(record.requiredStaff),
      typeof record.note === "string" && record.note.trim() ? record.note.trim() : null,
      sourceSystem,
      sourceId,
      importedAt,
      importedAt
    );
  }

  db.prepare("DELETE FROM shift_assignments WHERE shift_id = ? AND source_system = ?").run(localId, sourceSystem);

  const assignments = Array.isArray(record.assignments) ? record.assignments : [];
  for (const employeeId of assignments) {
    const employee = db.prepare("SELECT id FROM employees WHERE id = ?").get(employeeId);
    if (!employee) {
      continue;
    }

    db.prepare(`
      INSERT OR IGNORE INTO shift_assignments (
        id, shift_id, employee_id, status, source_system, source_id, imported_at
      )
      VALUES (?, ?, ?, 'assigned', ?, ?, ?)
    `).run(
      `assign_${localId}_${employeeId}`,
      localId,
      employeeId,
      sourceSystem,
      `assign_${sourceId}_${employeeId}`,
      importedAt
    );
  }

  insertSourceRecord(batchId, "shift", sourceId, "shift", localId, payload, sourceSystem);
  incrementSummary(summary, action);
  return localId;
}

function upsertImportedAbsence(batchId, record, summary, sourceSystem = "ordio", importedAt = now()) {
  const sourceId = String(record.sourceId ?? record.id);
  const localId = localIdFromSource("absence", sourceId);
  const payload = { ...record, sourceId, updatedAt: record.updatedAt ?? importedAt };
  const action = recordAction(sourceSystem, "absence_request", sourceId, payload);
  const employee = db.prepare("SELECT id FROM employees WHERE id = ?").get(record.employeeId);

  if (!employee) {
    summary.errorCount += 1;
    return null;
  }

  if (action !== "unchanged") {
    db.prepare(`
      INSERT INTO absence_requests (
        id, employee_id, absence_type, starts_on, ends_on, status, note,
        source_system, source_id, imported_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        employee_id = excluded.employee_id,
        absence_type = excluded.absence_type,
        starts_on = excluded.starts_on,
        ends_on = excluded.ends_on,
        status = excluded.status,
        note = excluded.note,
        source_system = excluded.source_system,
        source_id = excluded.source_id,
        imported_at = excluded.imported_at,
        updated_at = excluded.updated_at,
        removed_from_source = 0
    `).run(
      localId,
      record.employeeId,
      record.type,
      record.startsOn,
      record.endsOn,
      record.status,
      record.note,
      sourceSystem,
      sourceId,
      importedAt,
      importedAt
    );
  }

  insertSourceRecord(
    batchId,
    "absence_request",
    sourceId,
    "absence_request",
    localId,
    payload,
    sourceSystem
  );
  incrementSummary(summary, action);
  return localId;
}

function upsertImportedTimeEntry(batchId, record, summary, sourceSystem = "ordio", importedAt = now()) {
  const sourceId = String(record.sourceId ?? record.id);
  const localId = localIdFromSource("time", sourceId);
  const payload = { ...record, sourceId, updatedAt: record.updatedAt ?? importedAt };
  const action = recordAction(sourceSystem, "time_entry", sourceId, payload);
  const existingLocal = db.prepare("SELECT local_revision, status FROM time_entries WHERE id = ?").get(localId);
  const sourceRecordId =
    sourceSystem === "demo_seed"
      ? `src_time_entry_${sourceId}`
      : `src_${sourceSystem}_time_entry_${sourceId}`;
  const employee = db.prepare("SELECT id FROM employees WHERE id = ?").get(record.employeeId);

  if (!employee) {
    summary.errorCount += 1;
    return null;
  }

  if (action === "updated" && existingLocal?.local_revision > 1) {
    const existingConflict = db.prepare(`
      SELECT id
      FROM sync_conflicts
      WHERE local_entity = 'time_entry'
        AND local_id = ?
        AND field_name = 'source_payload'
        AND status = 'open'
    `).get(localId);

    if (!existingConflict) {
      db.prepare(`
        INSERT INTO sync_conflicts (
          id, source_record_id, local_entity, local_id, field_name,
          source_value_json, local_value_json, status, detected_at
        )
        VALUES (?, ?, 'time_entry', ?, 'source_payload', ?, ?, 'open', ?)
      `).run(
        randomUUID(),
        sourceRecordId,
        localId,
        JSON.stringify(payload),
        JSON.stringify({ localRevision: existingLocal.local_revision, status: existingLocal.status }),
        now()
      );
    }
    insertSourceRecord(batchId, "time_entry", sourceId, "time_entry", localId, payload, sourceSystem);
    incrementSummary(summary, "conflict");
    return localId;
  }

  const area = typeof record.area === "string" && record.area.trim() ? record.area.trim() : "Ohne Bereich";
  const location =
    typeof record.location === "string" && record.location.trim() ? record.location.trim() : defaultLocationName;
  const workArea = ensureWorkArea(area);
  const locationRow = ensureLocation(location);
  if (action !== "unchanged") {
    db.prepare(`
      INSERT INTO time_entries (
        id, employee_id, starts_at, ends_at, work_area_id, location_id, status,
        entry_type, paid_break_minutes, unpaid_break_minutes, note,
        source_system, source_id, imported_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (id) DO UPDATE SET
        employee_id = excluded.employee_id,
        starts_at = excluded.starts_at,
        ends_at = excluded.ends_at,
        work_area_id = excluded.work_area_id,
        location_id = excluded.location_id,
        status = excluded.status,
        entry_type = excluded.entry_type,
        paid_break_minutes = excluded.paid_break_minutes,
        unpaid_break_minutes = excluded.unpaid_break_minutes,
        note = excluded.note,
        source_system = excluded.source_system,
        source_id = excluded.source_id,
        imported_at = excluded.imported_at,
        updated_at = excluded.updated_at,
        removed_from_source = 0
    `).run(
      localId,
      record.employeeId,
      toDateTime(record.startDate, record.startTime),
      toDateTime(record.endDate, record.endTime),
      workArea.id,
      locationRow.id,
      allowedStatuses.has(record.status) ? record.status : "entwurf",
      allowedEntryTypes.has(record.type) ? record.type : "Arbeitszeit",
      record.paidBreakMinutes,
      record.unpaidBreakMinutes,
      record.note,
      sourceSystem,
      sourceId,
      importedAt,
      importedAt
    );
    insertAudit("time_entry", localId, "Aus Importsnapshot importiert", "Read-only Migration");
  }

  insertSourceRecord(batchId, "time_entry", sourceId, "time_entry", localId, payload, sourceSystem);
  incrementSummary(summary, action);
  return localId;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeImportedStatus(value) {
  const status = String(value ?? "").toLowerCase();
  if (status.includes("schichtunabhaengig") || status.includes("schichtunabhängig")) {
    return "konflikt";
  }
  if (status.includes("aenderungsantrag") || status.includes("änderungsantrag")) {
    return status.includes("genehmigt") ? "freigegeben" : "aenderungsantrag";
  }
  if (status.includes("bestätigt") || status.includes("bestaetigt") || status.includes("genehmigt")) {
    return "freigegeben";
  }
  if (status.includes("erfasst")) {
    return "entwurf";
  }
  return allowedStatuses.has(value) ? value : "entwurf";
}

function normalizeAbsenceStatus(value) {
  const status = String(value ?? "").toLowerCase();
  if (status.includes("genehmigt")) return "genehmigt";
  if (status.includes("abgelehnt")) return "abgelehnt";
  return "offen";
}

function endDateFor(startDate, startTime, endDate, endTime) {
  if (endDate) {
    return endDate;
  }

  return endTime <= startTime ? addDays(startDate, 1) : startDate;
}

function normalizeImportSnapshot(snapshot) {
  const importedAt = now();
  const sourceUpdatedAt = String(snapshot.capturedAt ?? snapshot.sourceUpdatedAt ?? snapshot.updatedAt ?? importedAt);
  const sourceSystem = String(snapshot.sourceSystem ?? "ordio");
  const defaultLocation = String(snapshot.defaultLocation ?? defaultLocationName);

  const employees = asArray(snapshot.employees)
    .map((record, index) => {
      const displayName = String(record.displayName ?? record.name ?? "").trim();
      if (!displayName) return null;

      return {
        sourceId: String(record.sourceId ?? record.employeeNumber ?? `employee-${index + 1}`),
        displayName,
        aliases: asArray(record.aliases).map((alias) => String(alias).trim()).filter(Boolean),
        roleTitle: String(record.roleTitle ?? record.role ?? record.employment ?? "Mitarbeiter").trim() || "Mitarbeiter",
        initials: String(record.initials ?? initialsFromName(displayName)).trim().slice(0, 3).toUpperCase(),
        employmentStatus:
          String(record.status ?? record.employmentStatus ?? "active").toLowerCase().includes("inaktiv")
            ? "inactive"
            : "active",
        employeeNumber: record.employeeNumber ?? null,
        updatedAt: record.updatedAt ?? sourceUpdatedAt
      };
    })
    .filter(Boolean);

  const locations = [
    ...asArray(snapshot.locations),
    ...asArray(snapshot.shifts).map((record) => ({ name: record.location })),
    ...asArray(snapshot.timeEntries).map((record) => ({ name: record.location }))
  ]
    .map((record, index) => {
      const name = String(record.name ?? defaultLocation).trim() || defaultLocation;
      return {
        sourceId: String(record.sourceId ?? idFromName("loc", name) ?? `location-${index + 1}`),
        name,
        updatedAt: record.updatedAt ?? sourceUpdatedAt
      };
    })
    .filter((record, index, records) => records.findIndex((item) => item.name === record.name) === index);

  const workAreas = [
    ...asArray(snapshot.workAreas),
    ...asArray(snapshot.shifts).map((record) => ({ name: record.area })),
    ...asArray(snapshot.timeEntries).map((record) => ({ name: record.area }))
  ]
    .map((record, index) => {
      const name = String(record.name ?? record.area ?? "Ohne Bereich").trim() || "Ohne Bereich";
      return {
        sourceId: String(record.sourceId ?? idFromName("area", name) ?? `area-${index + 1}`),
        name,
        updatedAt: record.updatedAt ?? sourceUpdatedAt
      };
    })
    .filter((record, index, records) => records.findIndex((item) => item.name === record.name) === index);

  const shifts = asArray(snapshot.shifts)
    .map((record, index) => {
      const startDate = toIsoDate(record.startDate ?? record.date);
      const startTime = normalizeTime(record.startTime);
      const endTime = normalizeTime(record.endTime);
      if (!startDate || !startTime || !endTime) return null;

      const assignmentSourceIds = asArray(record.assignmentSourceIds ?? record.assignments);
      const assignmentNames = asArray(record.assignmentNames);
      return {
        sourceId: String(record.sourceId ?? `shift-${startDate}-${startTime}-${record.area ?? index}`),
        startDate,
        startTime,
        endDate: endDateFor(startDate, startTime, toIsoDate(record.endDate), endTime),
        endTime,
        area: String(record.area ?? "Ohne Bereich").trim() || "Ohne Bereich",
        location: String(record.location ?? defaultLocation).trim() || defaultLocation,
        requiredStaff: normalizeRequiredStaff(
          record.requiredStaff,
          assignmentSourceIds.length || assignmentNames.length || 1
        ),
        note: typeof record.note === "string" ? record.note : "",
        assignmentSourceIds,
        assignmentNames,
        updatedAt: record.updatedAt ?? sourceUpdatedAt
      };
    })
    .filter(Boolean);

  const timeEntries = asArray(snapshot.timeEntries)
    .map((record, index) => {
      const startDate = toIsoDate(record.startDate ?? record.date);
      const startTime = normalizeTime(record.startTime);
      const endTime = normalizeTime(record.endTime);
      if (!startDate || !startTime || !endTime) return null;

      const importedStatus = normalizeImportedStatus(record.status);
      return {
        sourceId: String(record.sourceId ?? `time-${startDate}-${startTime}-${record.employeeSourceId ?? index}`),
        employeeSourceId: record.employeeSourceId ? String(record.employeeSourceId) : null,
        employeeName: String(record.employeeName ?? "").trim(),
        startDate,
        startTime,
        endDate: endDateFor(startDate, startTime, toIsoDate(record.endDate), endTime),
        endTime,
        area: String(record.area ?? "Ohne Bereich").trim() || "Ohne Bereich",
        location: String(record.location ?? defaultLocation).trim() || defaultLocation,
        status: importedStatus,
        type: importedStatus === "konflikt" ? "Schichtunabhaengig" : "Arbeitszeit",
        paidBreakMinutes: minutes(record.paidBreakMinutes),
        unpaidBreakMinutes: Math.max(0, parseDurationMinutes(record.unpaidBreakMinutes ?? record.breakDuration ?? 0)),
        note: typeof record.note === "string" && record.note.trim() ? record.note.trim() : null,
        updatedAt: record.updatedAt ?? sourceUpdatedAt
      };
    })
    .filter(Boolean);

  const absences = asArray(snapshot.absences)
    .map((record, index) => {
      const startsOn = toIsoDate(record.startsOn ?? record.startDate);
      const endsOn = toIsoDate(record.endsOn ?? record.endDate ?? record.startsOn ?? record.startDate);
      if (!startsOn || !endsOn) return null;

      return {
        sourceId: String(record.sourceId ?? `absence-${startsOn}-${record.employeeSourceId ?? index}`),
        employeeSourceId: record.employeeSourceId ? String(record.employeeSourceId) : null,
        employeeName: String(record.employeeName ?? "").trim(),
        type: String(record.type ?? "Abwesenheit").trim() || "Abwesenheit",
        startsOn,
        endsOn,
        status: normalizeAbsenceStatus(record.status),
        note: typeof record.note === "string" && record.note.trim() ? record.note.trim() : null,
        updatedAt: record.updatedAt ?? sourceUpdatedAt
      };
    })
    .filter(Boolean);

  const dates = [
    ...shifts.flatMap((record) => [record.startDate, record.endDate]),
    ...timeEntries.flatMap((record) => [record.startDate, record.endDate]),
    ...absences.flatMap((record) => [record.startsOn, record.endsOn])
  ].filter(Boolean).sort();

  return {
    sourceSystem,
    importedAt,
    locations,
    workAreas,
    employees,
    shifts,
    timeEntries,
    absences,
    periodStart: toIsoDate(snapshot.periodStart) || dates[0] || null,
    periodEnd: toIsoDate(snapshot.periodEnd) || dates.at(-1) || null,
    note:
      typeof snapshot.note === "string" && snapshot.note.trim()
        ? snapshot.note.trim()
        : "Read-only Importsnapshot aus autorisierter Browser-Sitzung."
  };
}

function resolveImportedEmployeeId(record, employeeBySourceId, employeeByName) {
  if (record.employeeId && db.prepare("SELECT id FROM employees WHERE id = ?").get(record.employeeId)) {
    return record.employeeId;
  }

  if (record.employeeSourceId && employeeBySourceId.has(String(record.employeeSourceId))) {
    return employeeBySourceId.get(String(record.employeeSourceId));
  }

  const nameKey = String(record.employeeName ?? "").trim().toLowerCase();
  return nameKey ? employeeByName.get(nameKey) ?? null : null;
}

function hideDemoDataForRealImport(sourceSystem) {
  if (!String(sourceSystem).startsWith("ordio")) {
    return;
  }

  for (const table of ["employees", "shifts", "time_entries", "absence_requests"]) {
    db.prepare(`
      UPDATE ${table}
      SET removed_from_source = 1, updated_at = ?
      WHERE source_system IS NULL OR source_system IN ('demo_seed', 'ordio_demo')
    `).run(now());
  }

  for (const table of ["locations", "work_areas"]) {
    db.prepare(`
      UPDATE ${table}
      SET removed_from_source = 1, updated_at = ?
      WHERE source_system IS NULL OR source_system IN ('demo_seed', 'ordio_demo', 'local_schema', 'local')
    `).run(now());
  }

  db.prepare(`
    UPDATE source_records
    SET removed_from_source = 1
    WHERE source_system IN ('demo_seed', 'ordio_demo')
  `).run();
}

export function runExternalSnapshotImport(snapshotPath = importSnapshotPath) {
  if (!existsSync(snapshotPath)) {
    throw new Error(`Importsnapshot nicht gefunden: ${snapshotPath}`);
  }

  const normalizedSnapshot = normalizeImportSnapshot(JSON.parse(readFileSync(snapshotPath, "utf8")));
  const { snapshot, deltaOnly } = applyMigrationBaseline(normalizedSnapshot);
  const startedAt = now();
  const batchId = `batch_${snapshot.sourceSystem}_${startedAt.replace(/[^0-9]/g, "")}`;
  const summary = {
    recordCount:
      snapshot.locations.length +
      snapshot.workAreas.length +
      snapshot.employees.length +
      snapshot.shifts.length +
      snapshot.timeEntries.length +
      snapshot.absences.length,
    insertedCount: 0,
    updatedCount: 0,
    unchangedCount: 0,
    conflictCount: 0,
    errorCount: 0
  };

  const { employeeBySourceId, employeeByName } = loadEmployeeResolutionMaps(snapshot.sourceSystem);

  db.exec("BEGIN");
  try {
    if (!deltaOnly) {
      hideDemoDataForRealImport(snapshot.sourceSystem);
    }

    db.prepare(`
      INSERT INTO import_batches (
        id, source_system, mode, status, period_start, period_end, record_count,
        inserted_count, updated_count, unchanged_count, conflict_count, error_count,
        note, started_at
      )
      VALUES (?, ?, ?, 'running', ?, ?, ?, 0, 0, 0, 0, 0, ?, ?)
    `).run(
      batchId,
      snapshot.sourceSystem,
      deltaOnly ? "delta_snapshot" : "manual_snapshot",
      snapshot.periodStart,
      snapshot.periodEnd,
      summary.recordCount,
      snapshot.note,
      startedAt
    );

    if (!deltaOnly) {
      db.prepare(`
        UPDATE source_records
        SET removed_from_source = 1
        WHERE source_system = ?
          AND source_entity IN (
            'location',
            'work_area',
            'employee',
            'shift',
            'time_entry',
            'absence_request'
          )
      `).run(snapshot.sourceSystem);
    }

    for (const location of snapshot.locations) {
      upsertImportedNamedEntity(
        batchId,
        "locations",
        "location",
        "location",
        "loc",
        location,
        summary,
        snapshot.sourceSystem,
        snapshot.importedAt
      );
    }

    for (const workArea of snapshot.workAreas) {
      upsertImportedNamedEntity(
        batchId,
        "work_areas",
        "work_area",
        "work_area",
        "area",
        workArea,
        summary,
        snapshot.sourceSystem,
        snapshot.importedAt
      );
    }

    for (const employee of snapshot.employees) {
      const localId = upsertImportedEmployee(
        batchId,
        employee,
        summary,
        snapshot.sourceSystem,
        snapshot.importedAt
      );
      if (localId) {
        employeeBySourceId.set(String(employee.sourceId), localId);
        for (const name of [employee.displayName, ...asArray(employee.aliases)]) {
          const nameKey = String(name ?? "").trim().toLowerCase();
          if (nameKey) {
            employeeByName.set(nameKey, localId);
          }
        }
      }
    }

    for (const shift of snapshot.shifts) {
      const assignments = [
        ...shift.assignmentSourceIds
          .map((sourceId) => employeeBySourceId.get(String(sourceId)))
          .filter(Boolean),
        ...shift.assignmentNames
          .map((name) => employeeByName.get(String(name).trim().toLowerCase()))
          .filter(Boolean)
      ];

      upsertImportedShift(
        batchId,
        { ...shift, assignments: [...new Set(assignments)] },
        summary,
        snapshot.sourceSystem,
        snapshot.importedAt
      );
    }

    for (const timeEntry of snapshot.timeEntries) {
      const employeeId = resolveImportedEmployeeId(timeEntry, employeeBySourceId, employeeByName);
      if (!employeeId) {
        summary.errorCount += 1;
        continue;
      }

      upsertImportedTimeEntry(
        batchId,
        { ...timeEntry, employeeId },
        summary,
        snapshot.sourceSystem,
        snapshot.importedAt
      );
    }

    for (const absence of snapshot.absences) {
      const employeeId = resolveImportedEmployeeId(absence, employeeBySourceId, employeeByName);
      if (!employeeId) {
        summary.errorCount += 1;
        continue;
      }

      upsertImportedAbsence(
        batchId,
        { ...absence, employeeId },
        summary,
        snapshot.sourceSystem,
        snapshot.importedAt
      );
    }

    if (!deltaOnly) {
      syncImportedRemovalState(snapshot.sourceSystem);
    }

    const completedAt = now();
    db.prepare(`
      UPDATE import_batches
      SET status = 'completed',
        inserted_count = ?,
        updated_count = ?,
        unchanged_count = ?,
        conflict_count = ?,
        error_count = ?,
        completed_at = ?
      WHERE id = ?
    `).run(
      summary.insertedCount,
      summary.updatedCount,
      summary.unchangedCount,
      summary.conflictCount,
      summary.errorCount,
      completedAt,
      batchId
    );

    db.prepare(`
      INSERT INTO sync_runs (
        id, import_batch_id, trigger_type, status, started_at, completed_at, summary_json
      )
      VALUES (?, ?, ?, 'completed', ?, ?, ?)
    `).run(randomUUID(), batchId, deltaOnly ? "delta_snapshot" : "manual_snapshot", startedAt, completedAt, JSON.stringify(summary));

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return {
    batch: listImportBatches(1)[0],
    summary,
    bootstrap: getBootstrap()
  };
}

export function updateTimeEntryStatus(id, status) {
  if (!allowedStatuses.has(status)) {
    throw new Error(`Ungueltiger Status: ${status}`);
  }

  const existing = db.prepare("SELECT status FROM time_entries WHERE id = ?").get(id);
  if (!existing) {
    throw new Error("Arbeitszeit nicht gefunden");
  }

  db.exec("BEGIN");
  try {
    db.prepare(`
      UPDATE time_entries
      SET status = ?, local_revision = local_revision + 1, updated_at = ?
      WHERE id = ?
    `).run(status, now(), id);

    insertAudit(
      "time_entry",
      id,
      `Status gesetzt: ${statusLabels[status]}`,
      null,
      { status: existing.status },
      { status }
    );

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return getTimeEntry(id);
}

export function updateTimeEntryBreaks(id, payload) {
  const existing = db.prepare(`
    SELECT paid_break_minutes, unpaid_break_minutes
    FROM time_entries
    WHERE id = ?
  `).get(id);

  if (!existing) {
    throw new Error("Arbeitszeit nicht gefunden");
  }

  const paidBreakMinutes = minutes(payload.paidBreakMinutes);
  const unpaidBreakMinutes = minutes(payload.unpaidBreakMinutes);

  db.exec("BEGIN");
  try {
    db.prepare(`
      UPDATE time_entries
      SET paid_break_minutes = ?,
        unpaid_break_minutes = ?,
        local_revision = local_revision + 1,
        updated_at = ?
      WHERE id = ?
    `).run(paidBreakMinutes, unpaidBreakMinutes, now(), id);

    insertAudit(
      "time_entry",
      id,
      "Pause korrigiert",
      `${unpaidBreakMinutes} Min. unbezahlt, ${paidBreakMinutes} Min. bezahlt`,
      {
        paidBreakMinutes: existing.paid_break_minutes,
        unpaidBreakMinutes: existing.unpaid_break_minutes
      },
      { paidBreakMinutes, unpaidBreakMinutes }
    );

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  return getTimeEntry(id);
}

export function getTimeEntry(id) {
  const row = db.prepare(`
    SELECT
      time_entries.*,
      work_areas.name AS area,
      locations.name AS location
    FROM time_entries
    JOIN work_areas ON work_areas.id = time_entries.work_area_id
    JOIN locations ON locations.id = time_entries.location_id
    WHERE time_entries.id = ?
  `).get(id);

  if (!row) {
    throw new Error("Arbeitszeit nicht gefunden");
  }

  const audit = db.prepare(`
    SELECT action, reason
    FROM audit_events
    WHERE entity_type = 'time_entry' AND entity_id = ?
    ORDER BY created_at ASC
  `).all(id).map((event) => (event.reason ? `${event.action}: ${event.reason}` : event.action));

  return rowToTimeEntry(row, audit);
}

export function getHealth() {
  const counts = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM employees) AS employees,
      (SELECT COUNT(*) FROM time_entries) AS time_entries,
      (SELECT COUNT(*) FROM shifts) AS shifts,
      (SELECT COUNT(*) FROM absence_requests) AS absence_requests,
      (SELECT COUNT(*) FROM import_batches) AS import_batches,
      (SELECT COUNT(*) FROM source_records) AS source_records,
      (SELECT COUNT(*) FROM sync_conflicts WHERE status = 'open') AS open_conflicts
  `).get();

  return {
    ok: true,
    database: "sqlite",
    databasePath,
    counts
  };
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

// H5: timestamps are stored as naive local wall-clock (YYYY-MM-DDTHH:MM[:SS]).
// `new Date(iso)` interprets them in the host timezone, so a night shift across
// a DST switch (28.03. 22:00 -> 29.03. 06:00) would compute 7h or 9h instead of
// 8h. Anchor both ends to UTC by parsing the wall-clock components directly:
// the (zero) offset is identical for both, so DST never distorts the duration.
function wallClockToUtcMs(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(iso));
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), m[6] ? Number(m[6]) : 0);
}

export function diffMinutes(startIso, endIso) {
  const start = wallClockToUtcMs(startIso);
  const end = wallClockToUtcMs(endIso);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / 60_000);
}

function dayBucketFromIso(iso) {
  return iso.slice(0, 10);
}

function escapeCsvField(value) {
  let text = value === null || value === undefined ? "" : String(value);
  // H7: neutralise CSV formula injection. A field starting with = + - @ (or a
  // leading tab/CR) is executed as a formula by Excel/LibreOffice and can
  // exfiltrate data or run DDE. Prefix such fields with a single quote so the
  // spreadsheet treats them as text. Do this before quoting.
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  if (/[",;\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function loadPayrollPersonnelNumberMap() {
  const rows = db.prepare(`
    SELECT employee_id, source_id
    FROM employee_external_ids
    WHERE source_system = 'datev_payroll' AND source_entity = 'employee'
  `).all();
  const map = new Map();
  for (const row of rows) {
    map.set(row.employee_id, row.source_id);
  }
  return map;
}

// T-004a — Stempeluhr Backend (claude-chat, 2026-06-04).
// Nutzt time_entries-Tabelle mit status='running'. Pausen werden über
// stamp_active_breaks-Tabelle als laufende Pause verfolgt; bei break-end
// werden die Pausen-Minuten in unpaid_break_minutes aufaddiert.
function getActiveTimeEntry(employeeId) {
  return db.prepare(`
    SELECT * FROM time_entries
    WHERE employee_id = ? AND status = 'running'
    ORDER BY starts_at DESC LIMIT 1
  `).get(employeeId);
}

function newTimeEntryId() {
  return `te_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export function stampStart(employeeId, options = {}) {
  if (!employeeId) throw new Error("employeeId ist Pflicht");
  const emp = db.prepare(`SELECT id FROM employees WHERE id = ?`).get(employeeId);
  if (!emp) throw new Error(`Mitarbeitender nicht gefunden: ${employeeId}`);
  const active = getActiveTimeEntry(employeeId);
  if (active) throw new Error(`Bereits gestempelt seit ${active.starts_at}`);
  // Standard-WorkArea + Location aus erster shift_assignment heute oder Default
  const today = new Date().toISOString().slice(0, 10);
  const fallback = db.prepare(`
    SELECT shifts.work_area_id, shifts.location_id
    FROM shift_assignments
    INNER JOIN shifts ON shifts.id = shift_assignments.shift_id
    WHERE shift_assignments.employee_id = ?
      AND date(shifts.starts_at) = ?
    ORDER BY shifts.starts_at ASC LIMIT 1
  `).get(employeeId, today);
  const workAreaId = options.workAreaId || fallback?.work_area_id
    || db.prepare(`SELECT id FROM work_areas ORDER BY id LIMIT 1`).get()?.id;
  const locationId = options.locationId || fallback?.location_id
    || db.prepare(`SELECT id FROM locations ORDER BY id LIMIT 1`).get()?.id;
  if (!workAreaId || !locationId) {
    throw new Error("Kein Standard-Bereich oder Standort konfiguriert");
  }
  const id = newTimeEntryId();
  const startsAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO time_entries (
      id, employee_id, starts_at, ends_at, work_area_id, location_id,
      status, entry_type, paid_break_minutes, unpaid_break_minutes, note
    ) VALUES (?, ?, ?, ?, ?, ?, 'running', 'regular', 0, 0, ?)
  `).run(id, employeeId, startsAt, startsAt, workAreaId, locationId, options.note ?? null);
  recordAuditEvent({
    entityType: "time_entry",
    entityId: id,
    actorType: options.actorType || "kiosk",
    actorId: options.actorId || employeeId,
    action: "stamp_start",
    newValue: { startsAt, workAreaId, locationId }
  });
  return { ok: true, timeEntryId: id, startsAt };
}

export function stampEnd(employeeId, options = {}) {
  const active = getActiveTimeEntry(employeeId);
  if (!active) throw new Error("Keine laufende Stempel-Session");
  // Falls noch eine Pause läuft, automatisch beenden.
  const openBreak = db.prepare(`SELECT started_at FROM stamp_active_breaks WHERE time_entry_id = ?`).get(active.id);
  let unpaidExtra = 0;
  if (openBreak) {
    unpaidExtra = Math.max(0, Math.floor((Date.now() - Date.parse(openBreak.started_at)) / 60000));
    db.prepare(`DELETE FROM stamp_active_breaks WHERE time_entry_id = ?`).run(active.id);
  }
  const endsAt = new Date().toISOString();
  const newUnpaid = Number(active.unpaid_break_minutes ?? 0) + unpaidExtra;
  db.prepare(`
    UPDATE time_entries
    SET ends_at = ?, status = 'completed', unpaid_break_minutes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(endsAt, newUnpaid, active.id);
  recordAuditEvent({
    entityType: "time_entry",
    entityId: active.id,
    actorType: options.actorType || "kiosk",
    actorId: options.actorId || employeeId,
    action: "stamp_end",
    newValue: { endsAt, unpaidBreakMinutes: newUnpaid }
  });
  return { ok: true, timeEntryId: active.id, endsAt };
}

export function stampBreakStart(employeeId, options = {}) {
  const active = getActiveTimeEntry(employeeId);
  if (!active) throw new Error("Keine laufende Stempel-Session");
  const existing = db.prepare(`SELECT 1 FROM stamp_active_breaks WHERE time_entry_id = ?`).get(active.id);
  if (existing) throw new Error("Pause läuft bereits");
  const startedAt = new Date().toISOString();
  db.prepare(`INSERT INTO stamp_active_breaks (time_entry_id, started_at) VALUES (?, ?)`).run(active.id, startedAt);
  recordAuditEvent({
    entityType: "time_entry",
    entityId: active.id,
    actorType: options.actorType || "kiosk",
    actorId: options.actorId || employeeId,
    action: "stamp_break_start",
    newValue: { startedAt }
  });
  return { ok: true, timeEntryId: active.id, breakStartedAt: startedAt };
}

export function stampBreakEnd(employeeId, options = {}) {
  const active = getActiveTimeEntry(employeeId);
  if (!active) throw new Error("Keine laufende Stempel-Session");
  const openBreak = db.prepare(`SELECT started_at FROM stamp_active_breaks WHERE time_entry_id = ?`).get(active.id);
  if (!openBreak) throw new Error("Keine laufende Pause");
  const breakMinutes = Math.max(0, Math.floor((Date.now() - Date.parse(openBreak.started_at)) / 60000));
  const newUnpaid = Number(active.unpaid_break_minutes ?? 0) + breakMinutes;
  db.exec("BEGIN");
  try {
    db.prepare(`DELETE FROM stamp_active_breaks WHERE time_entry_id = ?`).run(active.id);
    db.prepare(`UPDATE time_entries SET unpaid_break_minutes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newUnpaid, active.id);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  recordAuditEvent({
    entityType: "time_entry",
    entityId: active.id,
    actorType: options.actorType || "kiosk",
    actorId: options.actorId || employeeId,
    action: "stamp_break_end",
    newValue: { breakMinutes, totalUnpaidBreakMinutes: newUnpaid }
  });
  return { ok: true, timeEntryId: active.id, breakMinutes, totalUnpaidBreakMinutes: newUnpaid };
}

export function getStampState(employeeId) {
  const active = getActiveTimeEntry(employeeId);
  if (!active) return { active: false };
  const openBreak = db.prepare(`SELECT started_at FROM stamp_active_breaks WHERE time_entry_id = ?`).get(active.id);
  return {
    active: true,
    timeEntryId: active.id,
    startsAt: active.starts_at,
    onBreak: !!openBreak,
    breakStartedAt: openBreak?.started_at ?? null,
    accruedUnpaidBreakMinutes: Number(active.unpaid_break_minutes ?? 0)
  };
}

// T-007a — Freigabe-Aggregator Backend (claude-chat, 2026-06-04).
export function listAllPendingApprovals() {
  const corrections = listPendingCorrections().map((c) => ({
    type: "correction",
    id: c.id,
    employeeId: c.employeeId,
    createdAt: c.createdAt,
    reason: c.reason,
    payload: c
  }));
  const swapRequests = listOpenSwapRequests().map((s) => ({
    type: "swap_request",
    id: s.id,
    employeeId: s.requesterEmployeeId,
    createdAt: s.createdAt,
    reason: s.reason,
    payload: s
  }));
  const absenceRows = db.prepare(`
    SELECT id, employee_id, absence_type, starts_on, ends_on, status, note, created_at
    FROM absence_requests
    WHERE status = 'open'
    ORDER BY created_at ASC
  `).all();
  const absences = absenceRows.map((r) => ({
    type: "absence",
    id: r.id,
    employeeId: r.employee_id,
    createdAt: r.created_at,
    reason: r.note ?? `${r.absence_type} ${r.starts_on}–${r.ends_on}`,
    payload: {
      id: r.id,
      employeeId: r.employee_id,
      absenceType: r.absence_type,
      startsOn: r.starts_on,
      endsOn: r.ends_on,
      status: r.status,
      note: r.note
    }
  }));
  const all = [...corrections, ...swapRequests, ...absences].sort((a, b) =>
    String(a.createdAt).localeCompare(String(b.createdAt))
  );
  return { total: all.length, items: all, breakdown: { corrections: corrections.length, swap_requests: swapRequests.length, absences: absences.length } };
}

// T-010a — Rollen-Admin Backend (claude-chat, 2026-06-04).
const ALLOWED_ROLES = ["employee", "manager", "admin"];

export function listAuthUsersWithRoles() {
  const rows = db.prepare(`
    SELECT id, email, employee_id, display_name, role, tenant_slug, last_login_at, disabled_at, created_at
    FROM auth_users
    ORDER BY created_at ASC
  `).all();
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    employeeId: r.employee_id,
    displayName: r.display_name,
    role: r.role,
    tenantSlug: r.tenant_slug,
    lastLoginAt: r.last_login_at,
    disabledAt: r.disabled_at,
    createdAt: r.created_at
  }));
}

// T-005c — Mail-Helpers (claude-chat, 2026-06-05).
export function listAdminEmails() {
  const rows = db.prepare(`
    SELECT email FROM auth_users
    WHERE role = 'admin' AND disabled_at IS NULL AND email IS NOT NULL AND email != ''
  `).all();
  return rows.map((r) => r.email);
}

export function getEmailForEmployeeId(employeeId) {
  if (!employeeId) return null;
  const row = db.prepare(`
    SELECT email FROM auth_users
    WHERE employee_id = ? AND disabled_at IS NULL AND email IS NOT NULL AND email != ''
    LIMIT 1
  `).get(employeeId);
  return row?.email ?? null;
}

export function updateAuthUserRole(authUserId, newRole, actorId, note) {
  if (!ALLOWED_ROLES.includes(newRole)) {
    throw new Error(`Rolle ungültig. Erlaubt: ${ALLOWED_ROLES.join(", ")}`);
  }
  const user = db.prepare(`SELECT id, role, email FROM auth_users WHERE id = ?`).get(authUserId);
  if (!user) throw new Error(`Auth-User nicht gefunden: ${authUserId}`);
  if (user.role === newRole) {
    return { ok: true, unchanged: true, role: newRole };
  }
  db.prepare(`UPDATE auth_users SET role = ? WHERE id = ?`).run(newRole, authUserId);
  recordAuditEvent({
    entityType: "auth_user",
    entityId: String(authUserId),
    actorType: "admin",
    actorId,
    action: "role_changed",
    reason: note,
    oldValue: { role: user.role },
    newValue: { role: newRole }
  });
  return { ok: true, unchanged: false, oldRole: user.role, newRole, email: user.email };
}

// T-003a — Schichttausch-Workflow Backend (claude-chat, 2026-06-04).
function newSwapId() {
  return `swap_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export function createSwapRequest(payload) {
  const requesterEmployeeId = String(payload?.requesterEmployeeId || "").trim();
  const requesterShiftId = String(payload?.requesterShiftId || "").trim();
  const targetEmployeeId = payload?.targetEmployeeId
    ? String(payload.targetEmployeeId).trim()
    : null;
  const reason = String(payload?.reason || "").trim() || null;
  if (!requesterEmployeeId || !requesterShiftId) {
    throw new Error("requesterEmployeeId und requesterShiftId sind Pflicht");
  }
  // Prüfe dass requester wirklich an der Schicht assigned ist.
  const assigned = db.prepare(`
    SELECT 1 FROM shift_assignments WHERE shift_id = ? AND employee_id = ?
  `).get(requesterShiftId, requesterEmployeeId);
  if (!assigned) {
    throw new Error("Mitarbeiter ist nicht an dieser Schicht zugewiesen");
  }
  const id = newSwapId();
  db.prepare(`
    INSERT INTO shift_swap_requests (
      id, requester_employee_id, requester_shift_id, target_employee_id, reason, status
    ) VALUES (?, ?, ?, ?, ?, 'open')
  `).run(id, requesterEmployeeId, requesterShiftId, targetEmployeeId, reason);
  recordAuditEvent({
    entityType: "shift_swap_request",
    entityId: id,
    actorType: "employee",
    actorId: requesterEmployeeId,
    action: "created",
    reason,
    newValue: { requesterShiftId, targetEmployeeId }
  });
  return getSwapRequest(id);
}

export function getSwapRequest(id) {
  const row = db.prepare(`
    SELECT id, requester_employee_id, requester_shift_id, target_employee_id,
           reason, status, decided_by_employee_id, decided_at, decision_note,
           created_at, updated_at
    FROM shift_swap_requests WHERE id = ?
  `).get(id);
  if (!row) return null;
  return {
    id: row.id,
    requesterEmployeeId: row.requester_employee_id,
    requesterShiftId: row.requester_shift_id,
    targetEmployeeId: row.target_employee_id,
    reason: row.reason,
    status: row.status,
    decidedByEmployeeId: row.decided_by_employee_id,
    decidedAt: row.decided_at,
    decisionNote: row.decision_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function listOpenSwapRequests(filter = {}) {
  const conditions = ["status = 'open'"];
  const params = {};
  if (filter.targetEmployeeId) {
    conditions.push("(target_employee_id IS NULL OR target_employee_id = @targetEmployeeId)");
    params.targetEmployeeId = filter.targetEmployeeId;
  }
  const sql = `
    SELECT id FROM shift_swap_requests
    WHERE ${conditions.join(" AND ")}
    ORDER BY created_at ASC
  `;
  const rows = db.prepare(sql).all(params);
  return rows.map((r) => getSwapRequest(r.id));
}

export function acceptSwapRequest(id, accepterEmployeeId, note) {
  const swap = getSwapRequest(id);
  if (!swap) throw new Error(`Tausch-Anfrage nicht gefunden: ${id}`);
  if (swap.status !== "open") throw new Error(`Tausch-Anfrage nicht offen: ${swap.status}`);
  if (swap.requesterEmployeeId === accepterEmployeeId) {
    throw new Error("Akzeptierer darf nicht der Antragsteller sein");
  }
  if (swap.targetEmployeeId && swap.targetEmployeeId !== accepterEmployeeId) {
    throw new Error("Diese Tausch-Anfrage ist an einen anderen Mitarbeitenden gerichtet");
  }
  const decidedAt = new Date().toISOString();
  db.exec("BEGIN");
  try {
    db.prepare(`
      UPDATE shift_swap_requests
      SET status = 'accepted', decided_by_employee_id = ?, decided_at = ?, decision_note = ?, updated_at = ?
      WHERE id = ?
    `).run(accepterEmployeeId, decidedAt, note ?? null, decidedAt, id);
    // Plan-Update: requester-assignment durch accepter ersetzen.
    db.prepare(`
      DELETE FROM shift_assignments WHERE shift_id = ? AND employee_id = ?
    `).run(swap.requesterShiftId, swap.requesterEmployeeId);
    const assignmentId = `asg_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    db.prepare(`
      INSERT INTO shift_assignments (id, shift_id, employee_id, status)
      VALUES (?, ?, ?, 'assigned')
    `).run(assignmentId, swap.requesterShiftId, accepterEmployeeId);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  recordAuditEvent({
    entityType: "shift_swap_request",
    entityId: id,
    actorType: "employee",
    actorId: accepterEmployeeId,
    action: "accepted",
    reason: note,
    newValue: { shiftId: swap.requesterShiftId, newAssignee: accepterEmployeeId }
  });
  return getSwapRequest(id);
}

export function declineSwapRequest(id, declinerEmployeeId, note) {
  const swap = getSwapRequest(id);
  if (!swap) throw new Error(`Tausch-Anfrage nicht gefunden: ${id}`);
  if (swap.status !== "open") throw new Error(`Tausch-Anfrage nicht offen: ${swap.status}`);
  if (swap.requesterEmployeeId === declinerEmployeeId) {
    throw new Error("Antragsteller kann eigene Anfrage nicht ablehnen, nur stornieren");
  }
  const decidedAt = new Date().toISOString();
  db.prepare(`
    UPDATE shift_swap_requests
    SET status = 'declined', decided_by_employee_id = ?, decided_at = ?, decision_note = ?, updated_at = ?
    WHERE id = ?
  `).run(declinerEmployeeId, decidedAt, note ?? null, decidedAt, id);
  recordAuditEvent({
    entityType: "shift_swap_request",
    entityId: id,
    actorType: "employee",
    actorId: declinerEmployeeId,
    action: "declined",
    reason: note
  });
  return getSwapRequest(id);
}

export function cancelSwapRequest(id, cancellerEmployeeId, note) {
  const swap = getSwapRequest(id);
  if (!swap) throw new Error(`Tausch-Anfrage nicht gefunden: ${id}`);
  if (swap.status !== "open") throw new Error(`Tausch-Anfrage nicht offen: ${swap.status}`);
  if (swap.requesterEmployeeId !== cancellerEmployeeId) {
    throw new Error("Nur der Antragsteller darf stornieren");
  }
  const decidedAt = new Date().toISOString();
  db.prepare(`
    UPDATE shift_swap_requests
    SET status = 'cancelled', decided_by_employee_id = ?, decided_at = ?, decision_note = ?, updated_at = ?
    WHERE id = ?
  `).run(cancellerEmployeeId, decidedAt, note ?? null, decidedAt, id);
  recordAuditEvent({
    entityType: "shift_swap_request",
    entityId: id,
    actorType: "employee",
    actorId: cancellerEmployeeId,
    action: "cancelled",
    reason: note
  });
  return getSwapRequest(id);
}

// T-009a — Reporting/Auswertung Backend (claude-chat, 2026-06-04).
function netWorkedMinutes(row) {
  const start = Date.parse(row.starts_at);
  const end = Date.parse(row.ends_at);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  const gross = Math.floor((end - start) / 60000);
  const unpaidBreak = Number(row.unpaid_break_minutes ?? 0);
  const net = gross - unpaidBreak;
  return net > 0 ? net : 0;
}

function getEmployeeWeeklyTargetHours(employeeId) {
  const row = db.prepare(`SELECT weekly_hours FROM employees WHERE id = ?`).get(employeeId);
  if (row && Number.isFinite(Number(row.weekly_hours)) && row.weekly_hours > 0) {
    return Number(row.weekly_hours);
  }
  // Fallback aus tenant-config
  const defaults = tenantConfigGet("workforce.default_weekly_hours", null);
  if (typeof defaults === "number" && defaults > 0) return defaults;
  if (defaults && typeof defaults === "object" && Number.isFinite(Number(defaults.default))) {
    return Number(defaults.default);
  }
  return 40;
}

function workingDaysInMonth(year, month) {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  let count = 0;
  for (let d = 1; d <= last; d++) {
    const dow = new Date(Date.UTC(year, month - 1, d)).getUTCDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

export function buildEmployeeMonthlySollIst(employeeId, year, month) {
  const yearNum = Number(year);
  const monthNum = Number(month);
  if (!Number.isInteger(yearNum) || yearNum < 2000 || yearNum > 2100) {
    throw new Error("year muss eine ganze Zahl zwischen 2000 und 2100 sein");
  }
  if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    throw new Error("month muss zwischen 1 und 12 liegen");
  }
  const emp = db.prepare(`SELECT id, display_name AS name FROM employees WHERE id = ?`).get(employeeId);
  if (!emp) throw new Error(`Mitarbeitender nicht gefunden: ${employeeId}`);
  const monthStart = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
  const last = new Date(Date.UTC(yearNum, monthNum, 0)).getUTCDate();
  const monthEnd = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  const rows = db.prepare(`
    SELECT starts_at, ends_at, unpaid_break_minutes
    FROM time_entries
    WHERE employee_id = @employeeId
      AND date(starts_at) >= @monthStart
      AND date(starts_at) <= @monthEnd
      AND status IN ('completed', 'approved')
  `).all({ employeeId, monthStart, monthEnd });
  let totalNetMinutes = 0;
  const dayBuckets = new Map();
  for (const r of rows) {
    const day = r.starts_at.slice(0, 10);
    const minutes = netWorkedMinutes(r);
    totalNetMinutes += minutes;
    dayBuckets.set(day, (dayBuckets.get(day) || 0) + minutes);
  }
  const overlongDays = [];
  for (const [day, mins] of dayBuckets.entries()) {
    if (mins > 600) overlongDays.push({ day, minutes: mins });
  }
  const weeklyTarget = getEmployeeWeeklyTargetHours(employeeId);
  const workingDays = workingDaysInMonth(yearNum, monthNum);
  const sollMinutes = Math.round((weeklyTarget / 5) * workingDays * 60);
  return {
    employeeId,
    employeeName: emp.name,
    year: yearNum,
    month: monthNum,
    weeklyTargetHours: weeklyTarget,
    workingDaysInMonth: workingDays,
    sollMinutes,
    istMinutes: totalNetMinutes,
    differenceMinutes: totalNetMinutes - sollMinutes,
    daysWithEntries: dayBuckets.size,
    overlongDays
  };
}

export function buildTeamSollIstSummary(year, month) {
  const employees = db.prepare(`SELECT id FROM employees`).all();
  return employees.map((e) => buildEmployeeMonthlySollIst(e.id, year, month));
}

export function renderTeamSollIstCsv(report) {
  const headers = ["employeeId", "employeeName", "weeklyTargetHours", "sollMinutes", "istMinutes", "differenceMinutes", "daysWithEntries", "overlongDayCount"];
  const lines = [headers.join(";")];
  for (const r of report) {
    lines.push([
      r.employeeId,
      escapeCsvField(r.employeeName),
      r.weeklyTargetHours,
      r.sollMinutes,
      r.istMinutes,
      r.differenceMinutes,
      r.daysWithEntries,
      r.overlongDays.length
    ].join(";"));
  }
  return lines.join("\n");
}

// T-002 — Shift-Konflikterkennung (claude-chat, 2026-06-04).
// Erkennt Overlap und Absence-Conflicts für eine geplante oder existierende
// Schicht. Wird vor jedem Create/Update aufgerufen oder als Preview-Endpoint
// per /api/shifts/check-conflicts.
//
// Input: { id?, startsAt, endsAt, employeeIds: string[] }
// Output: { conflicts: [{ employeeId, type, detail }] }
export function detectShiftConflicts(payload) {
  const startsAt = String(payload?.startsAt || "").trim();
  const endsAt = String(payload?.endsAt || "").trim();
  const employeeIds = Array.isArray(payload?.employeeIds) ? payload.employeeIds : [];
  const excludeShiftId = payload?.id || null;
  if (!startsAt || !endsAt) {
    throw new Error("startsAt und endsAt sind Pflicht");
  }
  if (Date.parse(startsAt) >= Date.parse(endsAt)) {
    return {
      conflicts: [{ employeeId: null, type: "invalid_range", detail: "endsAt muss nach startsAt liegen" }]
    };
  }
  const conflicts = [];
  for (const employeeId of employeeIds) {
    // Overlap mit anderer Schicht
    const overlapRows = db.prepare(`
      SELECT shifts.id AS shift_id, shifts.starts_at, shifts.ends_at
      FROM shift_assignments
      INNER JOIN shifts ON shifts.id = shift_assignments.shift_id
      WHERE shift_assignments.employee_id = @employeeId
        AND (@excludeShiftId IS NULL OR shifts.id <> @excludeShiftId)
        AND shifts.starts_at < @endsAt
        AND shifts.ends_at > @startsAt
    `).all({ employeeId, excludeShiftId, startsAt, endsAt });
    for (const row of overlapRows) {
      conflicts.push({
        employeeId,
        type: "shift_overlap",
        detail: `bereits eingeplant in Schicht ${row.shift_id} (${row.starts_at}–${row.ends_at})`,
        conflictingShiftId: row.shift_id
      });
    }
    // Absence-Conflict: vacation oder sick, approved, überlappt
    const absenceRows = db.prepare(`
      SELECT id, absence_type, starts_on, ends_on
      FROM absence_requests
      WHERE employee_id = @employeeId
        AND status = 'approved'
        AND starts_on <= date(@endsAt)
        AND ends_on >= date(@startsAt)
    `).all({ employeeId, startsAt, endsAt });
    for (const row of absenceRows) {
      conflicts.push({
        employeeId,
        type: "absence_conflict",
        detail: `${row.absence_type} ${row.starts_on}–${row.ends_on} genehmigt`,
        conflictingAbsenceId: row.id
      });
    }
  }
  return { conflicts };
}

// T-005a — Time-Entry-Korrektur-Workflow Backend (claude-chat, 2026-06-04).
// Mitarbeiter beantragen Korrekturen an einer Time-Entry; Admin entscheidet.
function newCorrectionId() {
  return `corr_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function recordAuditEvent({ entityType, entityId, actorType, actorId, action, reason, oldValue, newValue }) {
  db.prepare(`
    INSERT INTO audit_events (
      id, entity_type, entity_id, actor_type, actor_id, action, reason, old_value_json, new_value_json, created_at
    ) VALUES (
      @id, @entityType, @entityId, @actorType, @actorId, @action, @reason, @oldValue, @newValue, @createdAt
    )
  `).run({
    id: `audit_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    entityType,
    entityId,
    actorType: actorType || "system",
    actorId: actorId ?? null,
    action,
    reason: reason ?? null,
    oldValue: oldValue == null ? null : JSON.stringify(oldValue),
    newValue: newValue == null ? null : JSON.stringify(newValue),
    createdAt: new Date().toISOString()
  });
}

export function requestTimeEntryCorrection(timeEntryId, payload) {
  const entry = db.prepare(`SELECT id, employee_id FROM time_entries WHERE id = ?`).get(timeEntryId);
  if (!entry) throw new Error(`Time-Entry nicht gefunden: ${timeEntryId}`);
  const requestedChanges = payload?.requestedChanges;
  const reason = String(payload?.reason || "").trim();
  if (!requestedChanges || typeof requestedChanges !== "object") {
    throw new Error("requestedChanges muss ein Objekt sein");
  }
  if (!reason) {
    throw new Error("reason ist Pflicht");
  }
  const id = newCorrectionId();
  db.prepare(`
    INSERT INTO time_entry_corrections (
      id, time_entry_id, employee_id, requested_changes_json, reason, status
    ) VALUES (?, ?, ?, ?, ?, 'open')
  `).run(id, timeEntryId, entry.employee_id, JSON.stringify(requestedChanges), reason);
  recordAuditEvent({
    entityType: "time_entry_correction",
    entityId: id,
    actorType: "employee",
    actorId: entry.employee_id,
    action: "requested",
    reason,
    newValue: { timeEntryId, requestedChanges }
  });
  return getCorrection(id);
}

export function getCorrection(id) {
  const row = db.prepare(`
    SELECT id, time_entry_id, employee_id, requested_changes_json, reason, status,
           reviewer_id, reviewed_at, review_note, created_at, updated_at
    FROM time_entry_corrections WHERE id = ?
  `).get(id);
  if (!row) return null;
  return {
    id: row.id,
    timeEntryId: row.time_entry_id,
    employeeId: row.employee_id,
    requestedChanges: JSON.parse(row.requested_changes_json),
    reason: row.reason,
    status: row.status,
    reviewerId: row.reviewer_id,
    reviewedAt: row.reviewed_at,
    reviewNote: row.review_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function listPendingCorrections() {
  const rows = db.prepare(`
    SELECT id FROM time_entry_corrections WHERE status = 'open' ORDER BY created_at ASC
  `).all();
  return rows.map((r) => getCorrection(r.id));
}

export function approveCorrection(id, reviewerId, note) {
  const corr = getCorrection(id);
  if (!corr) throw new Error(`Korrektur nicht gefunden: ${id}`);
  if (corr.status !== "open") throw new Error(`Korrektur ist nicht offen: ${corr.status}`);
  if (corr.employeeId === reviewerId) {
    throw new Error("4-Augen-Prinzip verletzt: Reviewer darf nicht der Antragsteller sein");
  }
  const reviewedAt = new Date().toISOString();
  db.prepare(`
    UPDATE time_entry_corrections
    SET status = 'approved', reviewer_id = ?, reviewed_at = ?, review_note = ?, updated_at = ?
    WHERE id = ?
  `).run(reviewerId, reviewedAt, note ?? null, reviewedAt, id);
  // Apply changes to time_entry (whitelist der erlaubten Felder)
  const oldEntry = db.prepare(`SELECT * FROM time_entries WHERE id = ?`).get(corr.timeEntryId);
  const changes = corr.requestedChanges;
  const allowed = ["startsAt", "endsAt", "paidBreakMinutes", "unpaidBreakMinutes", "note"];
  const setClauses = [];
  const params = { id: corr.timeEntryId };
  for (const k of Object.keys(changes)) {
    if (!allowed.includes(k)) continue;
    const dbCol = k === "startsAt" ? "starts_at"
      : k === "endsAt" ? "ends_at"
      : k === "paidBreakMinutes" ? "paid_break_minutes"
      : k === "unpaidBreakMinutes" ? "unpaid_break_minutes"
      : "note";
    setClauses.push(`${dbCol} = @${k}`);
    params[k] = changes[k];
  }
  if (setClauses.length > 0) {
    db.prepare(`UPDATE time_entries SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run(params);
  }
  recordAuditEvent({
    entityType: "time_entry_correction",
    entityId: id,
    actorType: "admin",
    actorId: reviewerId,
    action: "approved",
    reason: note,
    oldValue: oldEntry,
    newValue: changes
  });
  return getCorrection(id);
}

export function rejectCorrection(id, reviewerId, note) {
  const corr = getCorrection(id);
  if (!corr) throw new Error(`Korrektur nicht gefunden: ${id}`);
  if (corr.status !== "open") throw new Error(`Korrektur ist nicht offen: ${corr.status}`);
  if (corr.employeeId === reviewerId) {
    throw new Error("4-Augen-Prinzip verletzt: Reviewer darf nicht der Antragsteller sein");
  }
  const reviewedAt = new Date().toISOString();
  db.prepare(`
    UPDATE time_entry_corrections
    SET status = 'rejected', reviewer_id = ?, reviewed_at = ?, review_note = ?, updated_at = ?
    WHERE id = ?
  `).run(reviewerId, reviewedAt, note ?? null, reviewedAt, id);
  recordAuditEvent({
    entityType: "time_entry_correction",
    entityId: id,
    actorType: "admin",
    actorId: reviewerId,
    action: "rejected",
    reason: note
  });
  return getCorrection(id);
}

// T-006 — Urlaubsrest-Kontingent (claude-chat, 2026-06-04).
// Berechnet pro Mitarbeitendem den Resturlaub für ein Jahr aus
// tenant.config.workforce.absence_quotas und genehmigten
// vacation-Anträgen.
export function getAbsenceQuotaConfig() {
  const defaultDays = Number(tenantConfigGet("workforce.absence_quotas.default_days", 28));
  const byEmployee = tenantConfigGet("workforce.absence_quotas.by_employee", {}) || {};
  return { defaultDays, byEmployee };
}

function countApprovedVacationDaysForYear(employeeId, year) {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const rows = db.prepare(`
    SELECT starts_on, ends_on
    FROM absence_requests
    WHERE employee_id = @employeeId
      AND absence_type = 'vacation'
      AND status = 'approved'
      AND ends_on >= @yearStart
      AND starts_on <= @yearEnd
  `).all({ employeeId, yearStart, yearEnd });
  let totalDays = 0;
  for (const row of rows) {
    const start = row.starts_on < yearStart ? yearStart : row.starts_on;
    const end = row.ends_on > yearEnd ? yearEnd : row.ends_on;
    const days = Math.floor((Date.parse(end) - Date.parse(start)) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 0) totalDays += days;
  }
  return totalDays;
}

export function calculateAbsenceQuota(employeeId, year) {
  const yearNum = Number(year);
  if (!Number.isFinite(yearNum) || yearNum < 1900 || yearNum > 2999) {
    throw new Error(`Ungültiges Jahr: ${year}`);
  }
  const emp = db.prepare(`SELECT id, display_name AS name FROM employees WHERE id = ?`).get(employeeId);
  if (!emp) {
    throw new Error(`Mitarbeitender nicht gefunden: ${employeeId}`);
  }
  const { defaultDays, byEmployee } = getAbsenceQuotaConfig();
  const allocated = Number(byEmployee?.[employeeId] ?? defaultDays);
  const used = countApprovedVacationDaysForYear(employeeId, yearNum);
  const pendingRows = db.prepare(`
    SELECT starts_on, ends_on
    FROM absence_requests
    WHERE employee_id = ?
      AND absence_type = 'vacation'
      AND status = 'open'
      AND ends_on >= ?
      AND starts_on <= ?
  `).all(employeeId, `${yearNum}-01-01`, `${yearNum}-12-31`);
  let pending = 0;
  for (const r of pendingRows) {
    const days = Math.floor((Date.parse(r.ends_on) - Date.parse(r.starts_on)) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 0) pending += days;
  }
  return {
    employeeId,
    employeeName: emp.name,
    year: yearNum,
    allocated,
    used,
    pending,
    remaining: Math.max(0, allocated - used - pending)
  };
}

export function calculateAbsenceQuotasForAll(year) {
  const employees = db.prepare(`SELECT id FROM employees`).all();
  return employees.map((e) => calculateAbsenceQuota(e.id, year));
}

export function buildPayrollExport({ year, month } = {}) {
  const numericYear = Number(year);
  const numericMonth = Number(month);
  if (!Number.isInteger(numericYear) || numericYear < 2000 || numericYear > 2100) {
    throw new Error("year muss eine ganze Zahl zwischen 2000 und 2100 sein");
  }
  if (!Number.isInteger(numericMonth) || numericMonth < 1 || numericMonth > 12) {
    throw new Error("month muss zwischen 1 und 12 liegen");
  }

  const periodStart = `${numericYear}-${pad2(numericMonth)}-01`;
  const nextMonth = numericMonth === 12 ? 1 : numericMonth + 1;
  const nextYear = numericMonth === 12 ? numericYear + 1 : numericYear;
  const periodEndExclusive = `${nextYear}-${pad2(nextMonth)}-01`;
  const periodEndInclusive = new Date(new Date(periodEndExclusive).getTime() - 86_400_000)
    .toISOString().slice(0, 10);

  const rows = db.prepare(`
    SELECT
      time_entries.id,
      time_entries.employee_id,
      time_entries.starts_at,
      time_entries.ends_at,
      time_entries.entry_type,
      time_entries.status,
      time_entries.paid_break_minutes,
      time_entries.unpaid_break_minutes,
      employees.display_name AS employee_name,
      employees.role_title AS employee_role
    FROM time_entries
    JOIN employees ON employees.id = time_entries.employee_id
    WHERE time_entries.removed_from_source = 0
      AND time_entries.status = 'freigegeben'
      AND time_entries.starts_at >= ?
      AND time_entries.starts_at < ?
    ORDER BY employees.display_name, time_entries.starts_at
  `).all(periodStart, periodEndExclusive);

  const personnelMap = loadPayrollPersonnelNumberMap();
  const perEmployee = new Map();
  // Data-quality findings surfaced to the operator instead of being silently
  // swallowed (H6) or under-pausing freigegeben entries (H8, ArbZG §4).
  const breakExceedsWork = [];
  const arbzgBreakViolations = [];

  for (const row of rows) {
    const grossMinutes = diffMinutes(row.starts_at, row.ends_at);
    const unpaidBreak = Number(row.unpaid_break_minutes) || 0;
    const paidBreak = Number(row.paid_break_minutes) || 0;
    // H6: clamping a >gross unpaid break to net=0 hides obvious data errors
    // (e.g. an 874-min break on a 194-min shift). Keep the clamp so the export
    // never goes negative, but flag the entry so a human reviews it.
    if (unpaidBreak > grossMinutes) {
      breakExceedsWork.push({
        timeEntryId: row.id,
        employeeId: row.employee_id,
        employeeName: practiceDisplayName(row.employee_name),
        date: dayBucketFromIso(row.starts_at),
        grossMinutes,
        unpaidBreakMinutes: unpaidBreak
      });
    }
    // H8: ArbZG §4 minimum unpaid breaks — >6h ⇒ 30 min, >9h ⇒ 45 min.
    const requiredBreak = grossMinutes > 9 * 60 ? 45 : grossMinutes > 6 * 60 ? 30 : 0;
    if (requiredBreak > 0 && unpaidBreak < requiredBreak) {
      arbzgBreakViolations.push({
        timeEntryId: row.id,
        employeeId: row.employee_id,
        employeeName: practiceDisplayName(row.employee_name),
        date: dayBucketFromIso(row.starts_at),
        grossMinutes,
        unpaidBreakMinutes: unpaidBreak,
        requiredBreakMinutes: requiredBreak
      });
    }
    const netMinutes = Math.max(0, grossMinutes - unpaidBreak);
    const day = dayBucketFromIso(row.starts_at);

    if (!perEmployee.has(row.employee_id)) {
      perEmployee.set(row.employee_id, {
        employeeId: row.employee_id,
        employeeName: practiceDisplayName(row.employee_name),
        roleTitle: row.employee_role,
        personnelNumber: personnelMap.get(row.employee_id) ?? null,
        days: new Map(),
        totals: {
          grossMinutes: 0,
          unpaidBreakMinutes: 0,
          paidBreakMinutes: 0,
          netMinutes: 0,
          entryCount: 0
        }
      });
    }

    const employeeBucket = perEmployee.get(row.employee_id);
    const dayBucket = employeeBucket.days.get(day) ?? {
      date: day,
      grossMinutes: 0,
      unpaidBreakMinutes: 0,
      paidBreakMinutes: 0,
      netMinutes: 0,
      entryTypes: new Set(),
      entryCount: 0
    };

    dayBucket.grossMinutes += grossMinutes;
    dayBucket.unpaidBreakMinutes += unpaidBreak;
    dayBucket.paidBreakMinutes += paidBreak;
    dayBucket.netMinutes += netMinutes;
    dayBucket.entryTypes.add(row.entry_type);
    dayBucket.entryCount += 1;
    employeeBucket.days.set(day, dayBucket);

    employeeBucket.totals.grossMinutes += grossMinutes;
    employeeBucket.totals.unpaidBreakMinutes += unpaidBreak;
    employeeBucket.totals.paidBreakMinutes += paidBreak;
    employeeBucket.totals.netMinutes += netMinutes;
    employeeBucket.totals.entryCount += 1;
  }

  const employees = Array.from(perEmployee.values()).map((entry) => ({
    employeeId: entry.employeeId,
    employeeName: entry.employeeName,
    roleTitle: entry.roleTitle,
    personnelNumber: entry.personnelNumber,
    totals: {
      ...entry.totals,
      netHours: Math.round((entry.totals.netMinutes / 60) * 100) / 100,
      grossHours: Math.round((entry.totals.grossMinutes / 60) * 100) / 100
    },
    days: Array.from(entry.days.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((day) => ({
        date: day.date,
        grossMinutes: day.grossMinutes,
        unpaidBreakMinutes: day.unpaidBreakMinutes,
        paidBreakMinutes: day.paidBreakMinutes,
        netMinutes: day.netMinutes,
        netHours: Math.round((day.netMinutes / 60) * 100) / 100,
        grossHours: Math.round((day.grossMinutes / 60) * 100) / 100,
        entryTypes: Array.from(day.entryTypes).sort(),
        entryCount: day.entryCount
      }))
  }));

  const totals = employees.reduce((acc, employee) => ({
    grossMinutes: acc.grossMinutes + employee.totals.grossMinutes,
    unpaidBreakMinutes: acc.unpaidBreakMinutes + employee.totals.unpaidBreakMinutes,
    paidBreakMinutes: acc.paidBreakMinutes + employee.totals.paidBreakMinutes,
    netMinutes: acc.netMinutes + employee.totals.netMinutes,
    entryCount: acc.entryCount + employee.totals.entryCount,
    employeeCount: acc.employeeCount + 1
  }), {
    grossMinutes: 0,
    unpaidBreakMinutes: 0,
    paidBreakMinutes: 0,
    netMinutes: 0,
    entryCount: 0,
    employeeCount: 0
  });

  totals.netHours = Math.round((totals.netMinutes / 60) * 100) / 100;
  totals.grossHours = Math.round((totals.grossMinutes / 60) * 100) / 100;

  const missingPersonnelNumbers = employees
    .filter((employee) => employee.totals.netMinutes > 0 && !employee.personnelNumber)
    .map((employee) => ({
      employeeId: employee.employeeId,
      employeeName: employee.employeeName
    }));

  return {
    period: {
      year: numericYear,
      month: numericMonth,
      startDate: periodStart,
      endDate: periodEndInclusive
    },
    generatedAt: now(),
    employees,
    totals,
    warnings: {
      missingPersonnelNumbers,
      breakExceedsWork,
      arbzgBreakViolations,
      onlyApprovedEntriesIncluded: true,
      lohnartCode: "100"
    }
  };
}

export function renderPayrollExportCsv(report) {
  const headers = [
    "Personalnummer",
    "Mitarbeitername",
    "Rolle",
    "Datum",
    "Brutto-Stunden",
    "Unbezahlte Pause (min)",
    "Bezahlte Pause (min)",
    "Netto-Stunden",
    "Eintraege"
  ];
  const lines = [headers.join(";")];
  for (const employee of report.employees) {
    for (const day of employee.days) {
      lines.push([
        escapeCsvField(employee.personnelNumber ?? ""),
        escapeCsvField(employee.employeeName),
        escapeCsvField(employee.roleTitle),
        escapeCsvField(day.date),
        escapeCsvField(day.grossHours.toFixed(2).replace(".", ",")),
        escapeCsvField(day.unpaidBreakMinutes),
        escapeCsvField(day.paidBreakMinutes),
        escapeCsvField(day.netHours.toFixed(2).replace(".", ",")),
        escapeCsvField(day.entryCount)
      ].join(";"));
    }
  }
  return `${lines.join("\r\n")}\r\n`;
}

export function renderPayrollExportDatevLodas(report) {
  // C3: refuse to render rather than silently dropping employees without a
  // personnel number — they would be paid 0€ unnoticed. Hard-fail so the
  // operator must assign numbers first.
  const missing = report.warnings?.missingPersonnelNumbers ?? [];
  if (missing.length > 0) {
    const names = missing.map((m) => m.employeeName || m.employeeId).join(", ");
    const error = new Error(
      `LODAS-Export abgebrochen: ${missing.length} Mitarbeiter ohne Personalnummer (${names}). ` +
        `Erst Personalnummern vergeben — sonst fehlen diese Personen im Lohn.`
    );
    error.code = "MISSING_PERSONNEL_NUMBERS";
    throw error;
  }
  const lohnart = report.warnings.lohnartCode ?? "100";
  const headerLines = [
    "[Allgemein]",
    "Ziel=lodas",
    "Version_SST=1.0",
    `Berater=${process.env.DATEV_BERATERNUMMER ?? "0000000"}`,
    `Mandant=${process.env.DATEV_MANDANTENNUMMER ?? "00000"}`,
    "Kommentarzeichen=*",
    "Feldtrennzeichen=;",
    "Zahlenkomma=,",
    `Datumsformat=TT.MM.JJJJ`,
    "Stringbegrenzer=\"",
    "DatensatzEnde=\\r\\n",
    "Feldnamen=Ja",
    "",
    "[Satzbeschreibung]",
    "1;Bewegungsdaten;u_lod_bwd_buchung",
    "1;pnr#bwd;",
    "1;abrechnung_zeitraum#bwd;",
    "1;lohnart_nr#bwd;",
    "1;anzahl#bwd;",
    "1;buchung_belegfeld_1#bwd;",
    "",
    "[Bewegungsdaten]",
    "Personalnummer;Abrechnungszeitraum;Lohnart;Stunden;Belegfeld"
  ];

  const lines = [...headerLines];
  const period = `${pad2(report.period.month)}.${report.period.year}`;
  for (const employee of report.employees) {
    if (!employee.personnelNumber) continue;
    if (employee.totals.netMinutes <= 0) continue;
    const stundenStr = employee.totals.netHours.toFixed(2).replace(".", ",");
    lines.push([
      escapeCsvField(employee.personnelNumber),
      escapeCsvField(period),
      escapeCsvField(lohnart),
      escapeCsvField(stundenStr),
      escapeCsvField(`Praxis ${report.period.year}-${pad2(report.period.month)}`)
    ].join(";"));
  }
  return `${lines.join("\r\n")}\r\n`;
}

export function setPayrollPersonnelNumber(employeeId, personnelNumber) {
  const trimmedId = typeof employeeId === "string" ? employeeId.trim() : "";
  const trimmedNumber = typeof personnelNumber === "string" ? personnelNumber.trim() : "";
  if (!trimmedId) throw new Error("employeeId fehlt");
  const employee = db.prepare("SELECT id FROM employees WHERE id = ?").get(trimmedId);
  if (!employee) throw new Error("Mitarbeiter nicht gefunden");

  if (!trimmedNumber) {
    db.prepare(`
      DELETE FROM employee_external_ids
      WHERE employee_id = ? AND source_system = 'datev_payroll' AND source_entity = 'employee'
    `).run(trimmedId);
    return { employeeId: trimmedId, personnelNumber: null };
  }

  const importedAt = now();
  db.prepare(`
    INSERT INTO employee_external_ids (id, employee_id, source_system, source_id, source_entity, imported_at)
    VALUES (?, ?, 'datev_payroll', ?, 'employee', ?)
    ON CONFLICT(source_system, source_entity, source_id) DO UPDATE SET
      employee_id = excluded.employee_id,
      imported_at = excluded.imported_at
  `).run(`payroll_${randomUUID()}`, trimmedId, trimmedNumber, importedAt);
  return { employeeId: trimmedId, personnelNumber: trimmedNumber };
}

migrate();
seed();
ensureOperationalSeed();
