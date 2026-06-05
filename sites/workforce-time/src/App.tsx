import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  ClipboardCheck,
  Clock3,
  Coins,
  Columns3,
  Database,
  Download,
  Filter,
  Home,
  KeyRound,
  LogOut,
  Mail,
  PauseCircle,
  Plus,
  QrCode,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Smartphone,
  TimerReset,
  Trash2,
  UserPlus,
  Users,
  X
} from "lucide-react";
import { FormEvent, ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { EmployeesView } from "./views/employees";

// T-002b — Shift-Konflikt-Context. PlanView/ShiftCalendarCard rufen
// `/api/shifts/check-conflicts` on-demand (Hover/Klick) auf und cachen das
// Ergebnis pro Shift-ID. Provider lebt im App-Root mit Zugriff auf `request`.
type ShiftConflict = { employeeId: string | null; type: string; detail: string };
type ShiftConflictCheckPayload = {
  id?: string;
  startsAt: string;
  endsAt: string;
  employeeIds: string[];
};
const ShiftConflictContext = createContext<((payload: ShiftConflictCheckPayload) => Promise<ShiftConflict[]>) | null>(null);

type ViewKey = "dashboard" | "plan" | "time" | "absences" | "approvals" | "employees" | "payroll" | "reports" | "imports" | "admin" | "settings";

type PayrollDay = {
  date: string;
  grossMinutes: number;
  unpaidBreakMinutes: number;
  paidBreakMinutes: number;
  netMinutes: number;
  netHours: number;
  grossHours: number;
  entryTypes: string[];
  entryCount: number;
};

type PayrollEmployee = {
  employeeId: string;
  employeeName: string;
  roleTitle: string;
  personnelNumber: string | null;
  totals: {
    grossMinutes: number;
    unpaidBreakMinutes: number;
    paidBreakMinutes: number;
    netMinutes: number;
    entryCount: number;
    netHours: number;
    grossHours: number;
  };
  days: PayrollDay[];
};

type PayrollReport = {
  period: { year: number; month: number; startDate: string; endDate: string };
  generatedAt: string;
  employees: PayrollEmployee[];
  totals: {
    grossMinutes: number;
    unpaidBreakMinutes: number;
    paidBreakMinutes: number;
    netMinutes: number;
    entryCount: number;
    employeeCount: number;
    netHours: number;
    grossHours: number;
  };
  warnings: {
    missingPersonnelNumbers: Array<{ employeeId: string; employeeName: string }>;
    onlyApprovedEntriesIncluded: boolean;
    lohnartCode: string;
  };
};
type Status = "freigegeben" | "aenderungsantrag" | "konflikt" | "entwurf";
type EntryType = "Arbeitszeit" | "Schichtunabhaengig" | "Dienstgang";
type AbsenceStatus = "offen" | "genehmigt" | "abgelehnt";

type Employee = {
  id: string;
  name: string;
  role: string;
  initials: string;
  employmentStatus?: string;
  email?: string | null;
  weeklyHours?: number | null;
  sourceSystem?: string | null;
  importedAt?: string | null;
};

type TimeEntry = {
  id: string;
  employeeId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  area: string;
  location: string;
  status: Status;
  type: EntryType;
  paidBreakMinutes: number;
  unpaidBreakMinutes: number;
  note?: string;
  audit: string[];
  sourceSystem?: string | null;
  sourceId?: string | null;
};

type Shift = {
  id: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  area: string;
  location: string;
  requiredStaff: number;
  note: string;
  assignments: Employee[];
};

type AbsenceRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startsOn: string;
  endsOn: string;
  status: AbsenceStatus;
  note: string;
};

type ImportBatch = {
  id: string;
  sourceSystem: string;
  mode: string;
  status: string;
  periodStart: string | null;
  periodEnd: string | null;
  recordCount: number;
  insertedCount: number;
  updatedCount: number;
  unchangedCount: number;
  conflictCount: number;
  errorCount: number;
  note: string | null;
  startedAt: string;
  completedAt: string | null;
};

type SyncConflict = {
  id: string;
  localEntity: string;
  localId: string;
  fieldName: string;
  sourceValue: unknown;
  localValue: unknown;
  status: string;
  detectedAt: string;
  sourceEntity: string;
  sourceId: string;
};

type SyncState = {
  database: string;
  sourceSystem: string;
  lastBatch: {
    id: string;
    status: string;
    mode: string;
    periodStart: string | null;
    periodEnd: string | null;
    recordCount: number;
    insertedCount: number;
    updatedCount: number;
    unchangedCount: number;
    conflictCount: number;
    errorCount: number;
    completedAt: string | null;
    note: string | null;
  } | null;
  stats: {
    batches: number;
    sourceRecords: number;
    openConflicts: number;
  };
};

type Role = {
  id: string;
  name: string;
  description: string;
  userCount: number;
};

type User = {
  id: string;
  displayName: string;
  email?: string | null;
  authProvider: string;
  isActive: boolean;
  roles: string[];
};

type AuthUser = {
  id: number;
  email: string;
  displayName: string;
  employeeId: string | null;
  role: "admin" | "employee" | string;
  totpEnrolled: boolean;
  totpVerified: boolean;
  permissions: string[];
};

type AuthStatus = "checking" | "anonymous" | "magic_sent" | "token_pending" | "totp_enroll" | "authenticated" | "offline";

type AuthEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

type AuthMePayload = {
  authenticated: boolean;
  user: AuthUser | null;
};

type MagicLinkPayload = {
  message: string;
  delivery?: {
    delivered?: boolean;
    stdout?: boolean;
    error?: string;
  };
};

type MagicLinkVerifyPayload = {
  user: AuthUser | null;
  enroll_totp: boolean;
};

type TotpEnrollmentPayload = {
  secret: string;
  otpauth_uri: string;
  qr_uri: string;
  recovery_codes: string[];
};

type DashboardState = {
  employees: number;
  shifts: number;
  openAbsences: number;
  openRequests: number;
  timeConflicts: number;
  syncConflicts: number;
  totalMinutes: number;
  liveEntries: number;
};

type CoherenceIssue = {
  id: string;
  type: string;
  tone: "amber" | "rose" | "teal";
  date: string;
  title: string;
  detail: string;
  employeeId?: string;
  employeeName?: string;
  area?: string;
  targetView: ViewKey;
};

type CoherenceState = {
  summary: {
    shifts: number;
    assignments: number;
    openShiftSlots: number;
    entries: number;
    matchedEntries: number;
    missingTime: number;
    timeWithoutShift: number;
    timeOutsideShift: number;
    areaMismatches: number;
    absenceOverlaps: number;
    coveragePercent: number;
    plannedMinutes: number;
    actualMinutes: number;
  };
  daySummaries: {
    date: string;
    shifts: number;
    assignments: number;
    entries: number;
    plannedMinutes: number;
    actualMinutes: number;
    issues: number;
  }[];
  issues: CoherenceIssue[];
};

type MigrationWeekCoverage = {
  week: string;
  weekStart: string;
  weekEnd: string;
  shifts: number;
  requiredStaff: number;
  assignments: number;
  openSlots: number;
  timeEntries: number;
  plannedMinutes: number;
  actualMinutes: number;
  absences: number;
  coveragePercent: number;
  status: string;
  tone: "amber" | "rose" | "teal" | "muted" | string;
  statusLabel: string;
};

type MigrationReport = {
  generatedAt: string;
  latestBatch: ImportBatch | null;
  period: {
    shifts: { start: string | null; end: string | null };
    timeEntries: { start: string | null; end: string | null };
    absences: { start: string | null; end: string | null };
  };
  entityCounts: {
    employees: number;
    locations: number;
    workAreas: number;
    shifts: number;
    assignments: number;
    timeEntries: number;
    absences: number;
    sourceRecords: number;
  };
  sourceRecords: { entity: string; total: number; active: number; removed: number }[];
  latestBatchRecords: { entity: string; records: number }[];
  quality: {
    coveragePercent: number;
    matchedEntries: number;
    entries: number;
    missingTime: number;
    timeWithoutShift: number;
    timeOutsideShift: number;
    areaMismatches: number;
    absenceOverlaps: number;
    openShiftSlots: number;
    openConflicts: number;
  };
  sourceGaps: {
    week: string;
    weekStart: string;
    weekEnd: string;
    type: string;
    tone: "amber" | "rose" | "teal" | "muted" | string;
    title: string;
    detail: string;
    shifts: number;
    assignments: number;
    timeEntries: number;
    coveragePercent: number;
  }[];
  weekCoverage: MigrationWeekCoverage[];
};

// ------------------------------------------------------------
// Tenant-getriebene UI-Konfiguration (kommt aus dem Bootstrap-API,
// gespeist aus tenant.config.json -> workforce.*). Demo-Modus liefert
// neutrale Defaults; Praxis-Modus liefert Praxisanker.
// ------------------------------------------------------------
type WeeklyHoursRule = { tokens: string[]; hours: number };

type WeeklyHoursTable = {
  default: number;
  by_name_tokens: WeeklyHoursRule[];
};

type DisplayNameOverride = { match: string; display: string };

type WorkAreaOverride = {
  match_tokens?: string[];
  match_exact?: string;
  canonical: string;
};

type ShortAreaOverride = { from: string; to: string };

type AvatarStyle = { backgroundColor: string; color: string };

type AggregationGroup = {
  id: string;
  label: string;
  employee_match_tokens: string[];
  countable_area_match_tokens: string[][];
  skip_plausibility_check?: boolean;
  calculation_note?: string;
  avatar_style?: AvatarStyle;
};

type WorkforceTolerances = { monthly_over_soll_warn_percent?: number };

type WorkforceConfig = {
  defaultLocationName: string;
  defaultWeeklyHours: WeeklyHoursTable;
  displayNameOverrides: DisplayNameOverride[];
  workAreaOverrides: WorkAreaOverride[];
  shortAreaOverrides: ShortAreaOverride[];
  aggregationGroups: AggregationGroup[];
  tolerances: WorkforceTolerances;
  defaultCalculationNote: string;
  shiftSchema: ShiftSchemaGroup[];
  isDemo: boolean;
};

const defaultWorkforceConfig: WorkforceConfig = {
  defaultLocationName: "Praxis Demo",
  defaultWeeklyHours: { default: 40, by_name_tokens: [] },
  displayNameOverrides: [],
  workAreaOverrides: [],
  shortAreaOverrides: [],
  aggregationGroups: [],
  tolerances: { monthly_over_soll_warn_percent: 5 },
  defaultCalculationNote:
    "MFA-Zeiten werden nur über die Mitarbeiter-ID gezählt; der Arbeitsbereich ist Herkunft der Buchung, keine feste Zuordnung.",
  shiftSchema: [],
  isDemo: true
};

// Modul-Level-Ref: Helper unten greifen darauf zu, ohne den Config
// durch jede Funktions-Signatur reichen zu muessen. setWorkforceConfig
// wird vom Bootstrap-Loader im App-Component aufgerufen.
let currentWorkforceConfig: WorkforceConfig = defaultWorkforceConfig;

function setWorkforceConfig(next: Partial<WorkforceConfig> | undefined | null) {
  if (!next) {
    currentWorkforceConfig = defaultWorkforceConfig;
    return;
  }
  currentWorkforceConfig = { ...defaultWorkforceConfig, ...next };
}

function getWorkforceConfig(): WorkforceConfig {
  return currentWorkforceConfig;
}

type BootstrapPayload = {
  employees: Employee[];
  workAreas: string[];
  locations: string[];
  timeEntries: TimeEntry[];
  shifts: Shift[];
  absences: AbsenceRequest[];
  importBatches: ImportBatch[];
  syncConflicts: SyncConflict[];
  dashboard: DashboardState;
  coherence: CoherenceState;
  migrationReport: MigrationReport;
  workforce?: WorkforceConfig;
  auth: {
    currentUser: User | null;
    users: User[];
    roles: Role[];
  };
  sync: SyncState;
};

type CalculationRow = {
  id: string;
  label: string;
  detail: string;
  value: string;
  tone?: string;
};

type CalculationDetails = {
  eyebrow: string;
  title: string;
  period: string;
  formula: string;
  total: string;
  note?: string;
  rows: CalculationRow[];
  excludedRows?: CalculationRow[];
};

type ColumnKey =
  | "employee"
  | "start"
  | "end"
  | "area"
  | "location"
  | "status"
  | "type"
  | "time"
  | "paidBreak"
  | "unpaidBreak";

type ShiftTemplate = {
  id: string;
  label: string;
  aliases: string[];
  eligibility: string;
};

type ShiftSegmentKey = "early" | "late";

type ShiftSegment = {
  id: ShiftSegmentKey;
  label: string;
  shortLabel: string;
  startTime: string;
  endTime: string;
};

type ShiftSlotTemplate = ShiftTemplate & {
  baseId: string;
  baseLabel: string;
  segmentId: ShiftSegmentKey;
  segmentLabel: string;
  defaultStartTime: string;
  defaultEndTime: string;
};

type ShiftSchemaGroup = {
  category: string;
  shifts: ShiftTemplate[];
  // Optionale Standort-Vorzugsliste fuer Templates dieser Gruppe.
  // Erste Token-Liste, die im normalisierten Standortnamen vollstaendig
  // vorkommt, gewinnt; sonst Default.
  location_preference_tokens?: string[][];
};

type ShiftDialogDefaults = {
  slotId?: string;
  area: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  requiredStaff: string;
  note: string;
  assignments: string[];
  segmentLabel?: string;
};

type ShiftCreatePayload = {
  area: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  requiredStaff: number;
  note: string;
  assignments: string[];
};

type ShiftCluster = {
  id: string;
  area: string;
  startDate: string;
  endDate: string;
  locations: string[];
  timeWindows: string[];
  count: number;
  plannedMinutes: number;
  assignedStaff: number;
  requiredStaff: number;
};

type ScheduleRecord = {
  id: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  area: string;
};

const fallbackEmployees: Employee[] = [
  { id: "mfa-a", name: "MFA A", role: "Sprechstunde", initials: "MA" },
  { id: "mfa-b", name: "MFA B", role: "Anmeldung", initials: "MB" },
  { id: "mfa-c", name: "MFA C", role: "Labor", initials: "MC" },
  { id: "arzt-a", name: "Arzt A", role: "Sprechstunde", initials: "AA" },
  { id: "backoffice-a", name: "Backoffice A", role: "Verwaltung", initials: "BA" }
];

// Fallback-Listen werden nur verwendet, wenn die Bootstrap-API nicht
// erreichbar ist (Offline-/Demo-Fall). Sie tragen keine Tenant-Strings;
// echte Praxiswerte kommen aus dem Bootstrap (workforce.* via
// tenant.config.json).
const fallbackWorkAreas = [
  "Sprechstunde",
  "Anmeldung links",
  "Anmeldung rechts",
  "Labor",
  "Funktion",
  "Backoffice"
];

const fallbackLocations = ["Praxis Demo", "Homeoffice"];

const shiftSegments: ShiftSegment[] = [
  { id: "early", label: "Frühdienst", shortLabel: "Früh", startTime: "07:00", endTime: "14:00" },
  { id: "late", label: "Spätdienst", shortLabel: "Spät", startTime: "14:00", endTime: "18:00" }
];

// Demo-Schichtschema (greift wenn weder tenant.config.json noch
// /api/bootstrap ein Schema liefern). Enthaelt keine Tenant-Strings;
// echtes Praxis-Schema kommt aus workforce.shift_schema.
const demoShiftSchema: ShiftSchemaGroup[] = [
  {
    category: "Praxis Demo",
    shifts: [
      {
        id: "demo-sprechstunde",
        label: "Sprechstunde",
        aliases: ["Sprechstunde"],
        eligibility: "Demo-Sprechstunde"
      },
      {
        id: "demo-anmeldung-links",
        label: "Anmeldung links",
        aliases: ["Anmeldung links"],
        eligibility: "Demo-Anmeldung"
      },
      {
        id: "demo-anmeldung-rechts",
        label: "Anmeldung rechts",
        aliases: ["Anmeldung rechts"],
        eligibility: "Demo-Anmeldung"
      },
      {
        id: "demo-labor",
        label: "Labor",
        aliases: ["Labor", "Labor / Diagnostik"],
        eligibility: "Demo-Labor"
      },
      {
        id: "demo-backoffice",
        label: "Backoffice",
        aliases: ["Backoffice", "Homeoffice"],
        eligibility: "Demo-Backoffice"
      }
    ]
  }
];

function resolveShiftSchema(): ShiftSchemaGroup[] {
  const tenantSchema = getWorkforceConfig().shiftSchema;
  return Array.isArray(tenantSchema) && tenantSchema.length > 0 ? tenantSchema : demoShiftSchema;
}

const fallbackEntries: TimeEntry[] = [
  {
    id: "t-1001",
    employeeId: "mfa-a",
    startDate: "2026-05-18",
    startTime: "06:47",
    endDate: "2026-05-18",
    endTime: "17:13",
    area: "Sprechstunde",
    location: "Praxis Demo",
    status: "freigegeben",
    type: "Arbeitszeit",
    paidBreakMinutes: 0,
    unpaidBreakMinutes: 30,
    audit: ["Automatisch aus Stempelzeit erstellt", "Von Leitung geprueft"]
  },
  {
    id: "t-1002",
    employeeId: "mfa-b",
    startDate: "2026-05-18",
    startTime: "06:53",
    endDate: "2026-05-18",
    endTime: "17:20",
    area: "Anmeldung links",
    location: "Praxis Demo",
    status: "freigegeben",
    type: "Arbeitszeit",
    paidBreakMinutes: 0,
    unpaidBreakMinutes: 30,
    audit: ["Terminal-Buchung", "Pausenregel erkannt"]
  },
  {
    id: "t-1003",
    employeeId: "mfa-c",
    startDate: "2026-05-18",
    startTime: "07:56",
    endDate: "2026-05-18",
    endTime: "17:30",
    area: "Labor / Diagnostik",
    location: "Praxis Demo",
    status: "aenderungsantrag",
    type: "Arbeitszeit",
    paidBreakMinutes: 0,
    unpaidBreakMinutes: 60,
    note: "Endzeit wurde nachgetragen.",
    audit: ["Mitarbeiterin hat Korrektur beantragt", "Wartet auf Freigabe"]
  }
];

const fallbackData: BootstrapPayload = {
  employees: fallbackEmployees,
  workAreas: fallbackWorkAreas,
  locations: fallbackLocations,
  timeEntries: fallbackEntries,
  shifts: [],
  absences: [],
  importBatches: [],
  syncConflicts: [],
  dashboard: {
    employees: fallbackEmployees.length,
    shifts: 0,
    openAbsences: 0,
    openRequests: 1,
    timeConflicts: 0,
    syncConflicts: 0,
    totalMinutes: fallbackEntries.reduce((sum, entry) => sum + minutesBetween(entry), 0),
    liveEntries: 0
  },
  coherence: {
    summary: {
      shifts: 0,
      assignments: 0,
      openShiftSlots: 0,
      entries: fallbackEntries.length,
      matchedEntries: 0,
      missingTime: 0,
      timeWithoutShift: fallbackEntries.length,
      timeOutsideShift: 0,
      areaMismatches: 0,
      absenceOverlaps: 0,
      coveragePercent: 0,
      plannedMinutes: 0,
      actualMinutes: fallbackEntries.reduce((sum, entry) => sum + minutesBetween(entry), 0)
    },
    daySummaries: [],
    issues: []
  },
  migrationReport: {
    generatedAt: new Date().toISOString(),
    latestBatch: null,
    period: {
      shifts: { start: null, end: null },
      timeEntries: { start: "2026-05-18", end: "2026-05-18" },
      absences: { start: null, end: null }
    },
    entityCounts: {
      employees: fallbackEmployees.length,
      locations: fallbackLocations.length,
      workAreas: fallbackWorkAreas.length,
      shifts: 0,
      assignments: 0,
      timeEntries: fallbackEntries.length,
      absences: 0,
      sourceRecords: 0
    },
    sourceRecords: [],
    latestBatchRecords: [],
    quality: {
      coveragePercent: 0,
      matchedEntries: 0,
      entries: fallbackEntries.length,
      missingTime: 0,
      timeWithoutShift: fallbackEntries.length,
      timeOutsideShift: 0,
      areaMismatches: 0,
      absenceOverlaps: 0,
      openShiftSlots: 0,
      openConflicts: 0
    },
    sourceGaps: [],
    weekCoverage: []
  },
  auth: {
    currentUser: null,
    users: [],
    roles: []
  },
  sync: {
    database: "fallback",
    sourceSystem: "none",
    lastBatch: null,
    stats: { batches: 0, sourceRecords: 0, openConflicts: 0 }
  }
};

const columnLabels: Record<ColumnKey, string> = {
  employee: "Mitarbeiter",
  start: "Start",
  end: "Ende",
  area: "Arbeitsbereich",
  location: "Standort",
  status: "Status",
  type: "Typ",
  time: "Zeit",
  paidBreak: "Pause bezahlt",
  unpaidBreak: "Pause unbezahlt"
};

const defaultVisibleColumns: Record<ColumnKey, boolean> = {
  employee: true,
  start: true,
  end: true,
  area: true,
  location: true,
  status: true,
  type: true,
  time: true,
  paidBreak: true,
  unpaidBreak: true
};

const statusLabels: Record<Status, string> = {
  freigegeben: "Freigegeben",
  aenderungsantrag: "Änderungsantrag",
  konflikt: "Konflikt",
  entwurf: "Entwurf"
};

const typeLabels: Record<EntryType, string> = {
  Arbeitszeit: "Arbeitszeit",
  Schichtunabhaengig: "Schichtunabhängig",
  Dienstgang: "Dienstgang"
};

const absenceLabels: Record<AbsenceStatus, string> = {
  offen: "Offen",
  genehmigt: "Genehmigt",
  abgelehnt: "Abgelehnt"
};

const sourceEntityLabels: Record<string, string> = {
  absence_request: "Abwesenheiten",
  employee: "Mitarbeitende",
  location: "Standorte",
  shift: "Schichten",
  time_entry: "Arbeitszeiten",
  work_area: "Arbeitsbereiche"
};

const viewMeta: Record<ViewKey, { title: string; eyebrow: string }> = {
  dashboard: { title: "Übersicht", eyebrow: "Schichten · Zeiten · Pausen · Urlaub" },
  plan: { title: "Kalenderwoche", eyebrow: "Schichtplanung" },
  time: { title: "Arbeitszeiten", eyebrow: "Zeit & Reporting" },
  absences: { title: "Urlaub & Abwesenheit", eyebrow: "Anträge & Kalender" },
  approvals: { title: "Freigaben", eyebrow: "Korrekturen · Tausch · Urlaub" },
  employees: { title: "Mitarbeiter", eyebrow: "Stammdaten" },
  payroll: { title: "Lohnabrechnung", eyebrow: "DATEV-Export · Monatsstunden" },
  reports: { title: "Auswertung", eyebrow: "Soll vs. Ist · Monatsbericht" },
  imports: { title: "Import & Sync", eyebrow: "Migration" },
  admin: { title: "Benutzer & Rollen", eyebrow: "Rollen-Verwaltung" },
  settings: { title: "Einstellungen", eyebrow: "Rollen & Schutz" }
};

function parseDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

function minutesBetween(entry: TimeEntry) {
  const start = parseDateTime(entry.startDate, entry.startTime).getTime();
  const end = parseDateTime(entry.endDate, entry.endTime).getTime();
  const rawMinutes = Math.max(0, Math.round((end - start) / 60000));
  return Math.max(0, rawMinutes - entry.unpaidBreakMinutes);
}

function shiftMinutes(shift: Shift) {
  const start = parseDateTime(shift.startDate, shift.startTime).getTime();
  const end = parseDateTime(shift.endDate, shift.endTime).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
}

function grossMinutes(entry: TimeEntry) {
  const start = parseDateTime(entry.startDate, entry.startTime).getTime();
  const end = parseDateTime(entry.endDate, entry.endTime).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
}

function requiredBreakMinutes(entry: TimeEntry) {
  const gross = grossMinutes(entry);
  if (gross > 9 * 60) return 60;
  if (gross > 6 * 60) return 30;
  return 0;
}

function breakDelta(entry: TimeEntry) {
  return entry.paidBreakMinutes + entry.unpaidBreakMinutes - requiredBreakMinutes(entry);
}

function addDays(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function addMonths(date: string, months: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  return next.toISOString().slice(0, 10);
}

function startOfMonth(date: string) {
  const current = new Date(`${date}T12:00:00`);
  current.setDate(1);
  return current.toISOString().slice(0, 10);
}

function endOfMonth(date: string) {
  return addDays(addMonths(startOfMonth(date), 1), -1);
}

function startOfWeek(date: string) {
  const current = new Date(`${date}T12:00:00`);
  const day = current.getDay() || 7;
  current.setDate(current.getDate() - day + 1);
  return current.toISOString().slice(0, 10);
}

function isWeekend(date: string) {
  const day = new Date(`${date}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => (
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  ));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function localTodayIso() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

function getPrototypeWeekStart(data: BootstrapPayload) {
  const datedRecords = [
    ...data.shifts.map((shift) => shift.startDate),
    ...data.timeEntries.map((entry) => entry.startDate),
    ...data.absences.flatMap((absence) => [absence.startsOn, absence.endsOn])
  ].sort();
  const today = localTodayIso();
  const currentWeekStart = startOfWeek(today);
  const currentWeekEnd = addDays(currentWeekStart, 6);
  const hasCurrentWeekData = datedRecords.some((date) => dateInRange(date, currentWeekStart, currentWeekEnd));

  if (hasCurrentWeekData) {
    return currentWeekStart;
  }

  const nextDatedRecord = datedRecords.find((date) => date >= today);
  const latestDatedRecord = datedRecords[datedRecords.length - 1];
  return startOfWeek(nextDatedRecord ?? latestDatedRecord ?? "2026-05-25");
}

function latestTimeEntryWeekStart(entries: TimeEntry[]) {
  const latestEntry = entries.reduce<TimeEntry | null>(
    (latest, entry) => (!latest || entry.startDate > latest.startDate ? entry : latest),
    null
  );
  return latestEntry ? startOfWeek(latestEntry.startDate) : null;
}

function hasTimeEntriesInWeek(entries: TimeEntry[], weekStart: string) {
  const weekEnd = addDays(weekStart, 6);
  return entries.some((entry) => dateInRange(entry.startDate, weekStart, weekEnd));
}

function getCalendarWeek(date: string) {
  const current = new Date(`${date}T12:00:00`);
  current.setDate(current.getDate() + 4 - (current.getDay() || 7));
  const yearStart = new Date(current.getFullYear(), 0, 1);
  return Math.ceil(((current.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function dateInRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

function normalizeLabel(value: string) {
  return value
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

function shortAreaName(area: string) {
  // Konfig-getriebene Anzeige-Kuerzungen (workforce.short_area_overrides).
  // Im Demo-Modus sind keine Regeln aktiv -> Identitaet.
  let result = area;
  for (const rule of getWorkforceConfig().shortAreaOverrides) {
    if (!rule || !rule.from || rule.to === undefined) continue;
    result = result.split(rule.from).join(rule.to);
  }
  return result.trim();
}

function canonicalWorkAreaLabel(area: string) {
  const normalized = normalizeLabel(area);
  if (!normalized) return area;

  // Konfig-getriebene Kanonisierung (workforce.work_area_overrides).
  // Erste passende Regel gewinnt. Beide Match-Arten werden unterstuetzt:
  //   - match_exact: Vergleich gegen den vollstaendigen normalisierten Bereichsnamen
  //   - match_tokens: alle Tokens muessen im normalisierten Bereichsnamen vorkommen
  for (const rule of getWorkforceConfig().workAreaOverrides) {
    if (!rule || !rule.canonical) continue;
    if (rule.match_exact && normalized === String(rule.match_exact).toLowerCase()) {
      return rule.canonical;
    }
    if (Array.isArray(rule.match_tokens) && rule.match_tokens.length > 0) {
      const allMatch = rule.match_tokens.every((token) =>
        normalized.includes(String(token).toLowerCase())
      );
      if (allMatch) return rule.canonical;
    }
  }

  return area;
}

function shiftMatchesTemplate(shift: Shift, template: ShiftTemplate) {
  return templateMatchesArea(shift.area, template);
}

function templateMatchesArea(area: string, template: ShiftTemplate) {
  const normalizedArea = normalizeLabel(canonicalWorkAreaLabel(area));
  return (
    normalizeLabel(template.label) === normalizedArea ||
    template.aliases.some((alias) => normalizeLabel(alias) === normalizedArea)
  );
}

function uniqueLabels(labels: string[]) {
  const seen = new Set<string>();
  return labels
    .map((label) => label.trim())
    .filter((label) => {
      if (!label) return false;
      const key = normalizeLabel(label);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function customTemplateId(area: string) {
  const slug = normalizeLabel(area).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `custom-${slug || "planfeld"}`;
}

function schemaGroupsForWorkAreas(workAreas: string[] = []) {
  const fixedTemplates = resolveShiftSchema().flatMap((group) => group.shifts);
  const customAreas = uniqueLabels(workAreas.map(canonicalWorkAreaLabel)).filter(
    (area) => !fixedTemplates.some((template) => templateMatchesArea(area, template))
  );

  if (customAreas.length === 0) {
    return resolveShiftSchema();
  }

  return [
    ...resolveShiftSchema(),
    {
      category: "Weitere Planfelder",
      shifts: customAreas.map((area) => ({
        id: customTemplateId(area),
        label: area,
        aliases: [area],
        eligibility: "lokal angelegtes Planfeld"
      }))
    }
  ];
}

function schemaGroupsForData(data: BootstrapPayload) {
  return schemaGroupsForWorkAreas([
    ...data.workAreas,
    ...data.shifts.map((shift) => shift.area),
    ...data.timeEntries.map((entry) => entry.area)
  ]);
}

function shiftSegmentForTime(startTime: string): ShiftSegmentKey {
  return startTime < shiftSegments[1].startTime ? "early" : "late";
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function overlapMinutes(start: number, end: number, windowStart: number, windowEnd: number) {
  return Math.max(0, Math.min(end, windowEnd) - Math.max(start, windowStart));
}

function shiftSegmentForRecord(record: ScheduleRecord): ShiftSegmentKey {
  const start = timeToMinutes(record.startTime);
  let end = timeToMinutes(record.endTime);
  if (end <= start) {
    end += 24 * 60;
  }

  const [early, late] = shiftSegments;
  const earlyOverlap = overlapMinutes(start, end, timeToMinutes(early.startTime), timeToMinutes(early.endTime));
  const lateOverlap = overlapMinutes(start, end, timeToMinutes(late.startTime), timeToMinutes(late.endTime));

  if (earlyOverlap !== lateOverlap) {
    return earlyOverlap > lateOverlap ? "early" : "late";
  }

  return shiftSegmentForTime(record.startTime);
}

function compareScheduleRecords(left: ScheduleRecord, right: ScheduleRecord) {
  return (
    left.startTime.localeCompare(right.startTime) ||
    left.endTime.localeCompare(right.endTime) ||
    left.id.localeCompare(right.id)
  );
}

function recordsForTemplateDay<T extends ScheduleRecord>(records: T[], day: string, template: ShiftTemplate) {
  return records
    .filter((record) => record.startDate === day && templateMatchesArea(record.area, template))
    .sort(compareScheduleRecords);
}

function recordsForSlot<T extends ScheduleRecord>(records: T[], slot: ShiftSlotTemplate) {
  return records.filter((record) => shiftSegmentForRecord(record) === slot.segmentId);
}

function shiftSlotsForTemplate(template: ShiftTemplate): ShiftSlotTemplate[] {
  return shiftSegments.map((segment) => ({
    ...template,
    id: `${template.id}-${segment.id}`,
    baseId: template.id,
    baseLabel: template.label,
    segmentId: segment.id,
    segmentLabel: segment.label,
    defaultStartTime: segment.startTime,
    defaultEndTime: segment.endTime
  }));
}

function allShiftSlots(workAreas: string[] = []) {
  return schemaGroupsForWorkAreas(workAreas).flatMap((group) =>
    group.shifts.flatMap((template) =>
      shiftSlotsForTemplate(template).map((slot) => ({
        group: group.category,
        slot
      }))
    )
  );
}

function shiftMatchesSlot(shift: Shift, slot: ShiftSlotTemplate) {
  return shiftMatchesTemplate(shift, slot) && shiftSegmentForRecord(shift) === slot.segmentId;
}

function preferredLocationForTemplate(template: ShiftTemplate, locations: string[]) {
  // Sucht im aktiven Schichtschema die Kategorie, die dieses Template
  // enthaelt, und wendet deren location_preference_tokens an. Liefert
  // keine Kategorie Praeferenzen oder findet keinen passenden Standort:
  // erster verfuegbarer Standort, sonst Fallback.
  const normalizedLocations = locations.map((location) => ({
    raw: location,
    normalized: normalizeLabel(location)
  }));

  for (const group of resolveShiftSchema()) {
    if (!group.shifts.some((shift) => shift.id === template.id)) continue;
    const preferenceLists = Array.isArray(group.location_preference_tokens)
      ? group.location_preference_tokens
      : [];
    for (const tokenList of preferenceLists) {
      if (!Array.isArray(tokenList) || tokenList.length === 0) continue;
      const found = normalizedLocations.find((location) =>
        tokenList.every((token) => location.normalized.includes(String(token).toLowerCase()))
      );
      if (found) return found.raw;
    }
    break;
  }

  return locations[0] ?? fallbackLocations[0];
}

function shiftDefaultsFromTemplate(template: ShiftSlotTemplate, day: string, locations: string[]): ShiftDialogDefaults {
  return {
    slotId: template.id,
    area: template.baseLabel,
    location: preferredLocationForTemplate(template, locations),
    startDate: day,
    startTime: template.defaultStartTime,
    endDate: day,
    endTime: template.defaultEndTime,
    requiredStaff: "1",
    note: "",
    assignments: [],
    segmentLabel: template.segmentLabel
  };
}

function shiftDefaultsFromShift(shift: Shift): ShiftDialogDefaults {
  const matchingSlot = allShiftSlots([shift.area]).find(({ slot }) => shiftMatchesSlot(shift, slot))?.slot;
  const segment = shiftSegments.find((item) => item.id === shiftSegmentForTime(shift.startTime)) ?? shiftSegments[0];

  return {
    slotId: matchingSlot?.id,
    area: canonicalWorkAreaLabel(shift.area),
    location: shift.location,
    startDate: shift.startDate,
    startTime: shift.startTime,
    endDate: shift.endTime <= shift.startTime ? shift.endDate : shift.startDate,
    endTime: shift.endTime,
    requiredStaff: String(shift.requiredStaff),
    note: shift.note,
    assignments: shift.assignments.map((employee) => employee.id),
    segmentLabel: matchingSlot?.segmentLabel ?? segment.label
  };
}

function clusterShifts(shifts: Shift[]): ShiftCluster[] {
  const clusters = new Map<string, ShiftCluster>();

  for (const shift of shifts) {
    const key = shift.area;
    const current = clusters.get(key);
    const timeWindow = `${shift.startTime}-${shift.endTime}`;

    if (!current) {
      clusters.set(key, {
        id: key,
        area: shift.area,
        startDate: shift.startDate,
        endDate: shift.startDate,
        locations: [shift.location],
        timeWindows: [timeWindow],
        count: 1,
        plannedMinutes: shiftMinutes(shift),
        assignedStaff: shift.assignments.length,
        requiredStaff: shift.requiredStaff
      });
      continue;
    }

    current.startDate = shift.startDate < current.startDate ? shift.startDate : current.startDate;
    current.endDate = shift.startDate > current.endDate ? shift.startDate : current.endDate;
    if (!current.locations.includes(shift.location)) current.locations.push(shift.location);
    if (!current.timeWindows.includes(timeWindow)) current.timeWindows.push(timeWindow);
    current.count += 1;
    current.plannedMinutes += shiftMinutes(shift);
    current.assignedStaff += shift.assignments.length;
    current.requiredStaff += shift.requiredStaff;
  }

  return Array.from(clusters.values()).sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
    return a.area.localeCompare(b.area);
  });
}

function formatShiftClusterRange(cluster: ShiftCluster) {
  const days = cluster.count === 1 ? "1 Tag" : `${cluster.count} Tage`;
  const dateRange =
    cluster.startDate === cluster.endDate
      ? formatShortDate(cluster.startDate)
      : `${formatShortDate(cluster.startDate)}-${formatShortDate(cluster.endDate)}`;
  return `${days} · ${dateRange}`;
}

function formatShiftClusterDetails(cluster: ShiftCluster) {
  const timeSummary = cluster.timeWindows.length === 1 ? cluster.timeWindows[0] : `${cluster.timeWindows.length} Zeitfenster`;
  const locationSummary = cluster.locations.length === 1 ? cluster.locations[0] : `${cluster.locations.length} Standorte`;
  return `${formatShiftClusterRange(cluster)} · ${timeSummary} · ${locationSummary}`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

function formatShortDate(date: string | null) {
  if (!date) return "offen";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  }).format(new Date(`${date}T12:00:00`));
}

function formatMonth(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

function formatDayNumber(date: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit"
  }).format(new Date(`${date}T12:00:00`));
}

function formatDateTime(value: string | null) {
  if (!value) return "offen";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatPeriod(start: string | null, end: string | null) {
  if (!start && !end) return "offen";
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

function sourceEntityLabel(entity: string) {
  return sourceEntityLabels[entity] ?? entity;
}

function viewForMigrationWeek(week: MigrationWeekCoverage | { type?: string }): ViewKey {
  if ("type" in week && week.type === "unassigned_plan") return "plan";
  if ("status" in week && week.status === "unassigned_plan") return "plan";
  if ("status" in week && week.status === "future_plan") return "plan";
  return "time";
}

function getEmployee(employees: Employee[], id: string) {
  return employees.find((employee) => employee.id === id) ?? employees[0] ?? fallbackEmployees[0];
}

function compactInitials(value: string) {
  const compacted = value.replace(/[^a-zA-ZÄÖÜäöüß0-9]/g, "").toUpperCase();
  return (compacted || "?").slice(0, 2);
}

const employeeAvatarPalette = [
  { backgroundColor: "#0f766e", color: "#ffffff" },
  { backgroundColor: "#1d4ed8", color: "#ffffff" },
  { backgroundColor: "#6d28d9", color: "#ffffff" },
  { backgroundColor: "#9a3412", color: "#ffffff" },
  { backgroundColor: "#be123c", color: "#ffffff" },
  { backgroundColor: "#166534", color: "#ffffff" },
  { backgroundColor: "#0e7490", color: "#ffffff" },
  { backgroundColor: "#92400e", color: "#ffffff" },
  { backgroundColor: "#3730a3", color: "#ffffff" },
  { backgroundColor: "#86198f", color: "#ffffff" },
  { backgroundColor: "#047857", color: "#ffffff" },
  { backgroundColor: "#854d0e", color: "#ffffff" }
];

function stablePaletteIndex(value: string) {
  return Array.from(value).reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 0) % employeeAvatarPalette.length;
}

function employeeAvatarStyle(employee: Pick<Employee, "id" | "name">) {
  // Eine matchende aggregation_group darf einen avatar_style ueberschreiben
  // (z.B. fuer den Praxis-Chef einen Signature-Farbcode). Sonst greift die
  // generische Palette.
  const group = aggregationGroupForEmployee(employee);
  if (group?.avatar_style?.backgroundColor) {
    return {
      backgroundColor: group.avatar_style.backgroundColor,
      color: group.avatar_style.color ?? "#ffffff"
    };
  }
  return employeeAvatarPalette[stablePaletteIndex(employee.id || employee.name)];
}

function weeklyTargetHoursForEmployee(employee: Employee) {
  // Konfig-getriebenes Wochen-Soll (workforce.default_weekly_hours).
  // Erste passende Token-Regel gewinnt; sonst default.
  const cfg = getWorkforceConfig().defaultWeeklyHours;
  const normalizedName = normalizeLabel(employee.name);
  const rules = Array.isArray(cfg?.by_name_tokens) ? cfg.by_name_tokens : [];
  for (const rule of rules) {
    if (!rule || !Array.isArray(rule.tokens) || rule.tokens.length === 0) continue;
    const allMatch = rule.tokens.every((token) =>
      normalizedName.includes(String(token).toLowerCase())
    );
    if (allMatch && Number.isFinite(rule.hours)) return rule.hours;
  }
  return Number.isFinite(cfg?.default) ? cfg.default : 40;
}

function workdaysInRange(start: string, end: string) {
  let day = start;
  let count = 0;

  while (day <= end) {
    if (!isWeekend(day)) count += 1;
    day = addDays(day, 1);
  }

  return count;
}

function monthTargetMinutesForEmployee(employee: Employee, range: { start: string; end: string }) {
  const weeklyMinutes = weeklyTargetHoursForEmployee(employee) * 60;
  return Math.round((weeklyMinutes / 5) * workdaysInRange(range.start, range.end));
}

function monthCounterRange(monthStart: string) {
  const monthEnd = endOfMonth(monthStart);

  return {
    start: monthStart,
    end: monthEnd
  };
}

function aggregationGroupForEmployee(employee: Pick<Employee, "name">): AggregationGroup | null {
  // Liefert die erste workforce.aggregation_group, deren
  // employee_match_tokens vollstaendig im normalisierten Mitarbeiter-
  // namen vorkommen. Mitarbeiter ohne Gruppe zaehlen standardmaessig
  // alle ihre Buchungen.
  const normalizedName = normalizeLabel(employee.name);
  for (const group of getWorkforceConfig().aggregationGroups) {
    if (!group || !Array.isArray(group.employee_match_tokens) || group.employee_match_tokens.length === 0) {
      continue;
    }
    const allMatch = group.employee_match_tokens.every((token) =>
      normalizedName.includes(String(token).toLowerCase())
    );
    if (allMatch) return group;
  }
  return null;
}

function areaMatchesGroup(area: string, group: AggregationGroup): boolean {
  const normalized = normalizeLabel(area);
  if (!normalized) return false;
  for (const tokenList of group.countable_area_match_tokens ?? []) {
    if (!Array.isArray(tokenList) || tokenList.length === 0) continue;
    if (tokenList.every((token) => normalized.includes(String(token).toLowerCase()))) {
      return true;
    }
  }
  return false;
}

function isCountedMonthlyPersonTime(employee: Employee, entry: TimeEntry, range: { start: string; end: string }) {
  if (entry.employeeId !== employee.id) return false;
  if (!dateInRange(entry.startDate, range.start, range.end)) return false;
  const group = aggregationGroupForEmployee(employee);
  return group ? areaMatchesGroup(entry.area, group) : true;
}

function employeeMonthTimeEntries(employee: Employee, entries: TimeEntry[], range: { start: string; end: string }) {
  return entries
    .filter((entry) => isCountedMonthlyPersonTime(employee, entry, range))
    .sort((first, second) => `${first.startDate}T${first.startTime}`.localeCompare(`${second.startDate}T${second.startTime}`));
}

function employeeMonthTimeMinutes(employee: Employee, entries: TimeEntry[], range: { start: string; end: string }) {
  return employeeMonthTimeEntries(employee, entries, range).reduce((sum, entry) => sum + minutesBetween(entry), 0);
}

function monthlyNeedsPlausibilityReview(employee: Employee, actualMinutes: number, targetMinutes: number) {
  const group = aggregationGroupForEmployee(employee);
  if (group?.skip_plausibility_check) return false;
  const warnPercent = Number(getWorkforceConfig().tolerances?.monthly_over_soll_warn_percent ?? 5);
  const factor = 1 + warnPercent / 100;
  return actualMinutes > targetMinutes * factor;
}

function timeEntryCalculationRow(entry: TimeEntry, employees: Employee[]): CalculationRow {
  const employee = getEmployee(employees, entry.employeeId);
  const source = entry.sourceId ? ` · ${entry.sourceId}` : "";
  return {
    id: entry.id,
    label: `${employee.name} · ${formatShortDate(entry.startDate)}`,
    detail: `${entry.startTime}-${entry.endTime} · ${entry.area} · ${statusLabels[entry.status]} · ${entry.unpaidBreakMinutes} Min. unbezahlte Pause${source}`,
    value: formatDuration(minutesBetween(entry)),
    tone: entry.status === "freigegeben" ? "teal" : entry.status === "konflikt" ? "rose" : "amber"
  };
}

function shiftCalculationRow(shift: Shift): CalculationRow {
  const assigned = shift.assignments.map((employee) => employee.name).join(", ") || "ohne Person";
  return {
    id: shift.id,
    label: `${shift.area} · ${formatShortDate(shift.startDate)}`,
    detail: `${shift.startTime}-${shift.endTime} · ${assigned} · ${shift.location}`,
    value: formatDuration(shiftMinutes(shift)),
    tone: shift.assignments.length >= shift.requiredStaff ? "teal" : "amber"
  };
}

function absenceCalculationRow(absence: AbsenceRequest): CalculationRow {
  return {
    id: absence.id,
    label: `${absence.employeeName} · ${absence.type}`,
    detail: `${formatShortDate(absence.startsOn)}-${formatShortDate(absence.endsOn)} · ${absenceLabels[absence.status]}`,
    value: "1",
    tone: absence.status === "genehmigt" ? "teal" : absence.status === "abgelehnt" ? "rose" : "amber"
  };
}

function buildMonthEmployeeCalculation(
  employee: Employee,
  entries: TimeEntry[],
  range: { start: string; end: string }
): CalculationDetails {
  const countedEntries = employeeMonthTimeEntries(employee, entries, range);
  const excludedRows = entries
    .filter((entry) =>
      entry.employeeId === employee.id &&
      dateInRange(entry.startDate, range.start, range.end) &&
      !isCountedMonthlyPersonTime(employee, entry, range)
    )
    .sort((first, second) => `${first.startDate}T${first.startTime}`.localeCompare(`${second.startDate}T${second.startTime}`))
    .map((entry) => timeEntryCalculationRow(entry, [employee]));
  const totalMinutes = countedEntries.reduce((sum, entry) => sum + minutesBetween(entry), 0);
  const targetMinutes = monthTargetMinutesForEmployee(employee, range);
  const weeklyTargetHours = weeklyTargetHoursForEmployee(employee);
  const workdays = workdaysInRange(range.start, range.end);
  const needsReview = monthlyNeedsPlausibilityReview(employee, totalMinutes, targetMinutes);
  const aggregationGroup = aggregationGroupForEmployee(employee);
  const aggregationNote = aggregationGroup?.calculation_note
    ? aggregationGroup.calculation_note
    : getWorkforceConfig().defaultCalculationNote;

  return {
    eyebrow: "Kalkulationsgrundlage",
    title: `${employee.name} · Monatsstunden`,
    period: `${formatShortDate(range.start)} - ${formatShortDate(range.end)}`,
    formula: `Ist = Summe aller personenbezogenen Arbeitszeiten im Kalendermonat minus unbezahlte Pausen. Soll = ${formatMonthHours(weeklyTargetHours)} Wochenstunden / 5 * ${workdays} Mo-Fr-Arbeitstage im Monat = ${formatDuration(targetMinutes)}. Der Status Freigegeben wird in unserer Version nicht als Filter verwendet.`,
    total: formatDuration(totalMinutes),
    note: `${aggregationNote}${needsReview ? ` Plausibilitätsalarm: ${formatDuration(totalMinutes)} liegt mehr als ${Number(getWorkforceConfig().tolerances?.monthly_over_soll_warn_percent ?? 5)}% über dem Monats-Soll von ${formatDuration(targetMinutes)}; diese Zahl muss anhand der Einzelzeilen geprüft werden.` : ""} Fachlich ausgeschlossene Zeilen stehen separat unter \"Nicht gezählt\".`,
    rows: countedEntries.map((entry) => timeEntryCalculationRow(entry, [employee])),
    excludedRows
  };
}

function formatMonthHours(hours: number) {
  return `${Number.isInteger(hours) ? hours : hours.toLocaleString("de-DE", { maximumFractionDigits: 1 })}h`;
}

function formatMonthLabel(date: string) {
  return new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function isStatus(value: string): value is Status {
  return ["freigegeben", "aenderungsantrag", "konflikt", "entwurf"].includes(value);
}

function App() {
  const [data, setData] = useState<BootstrapPayload>(fallbackData);
  const [view, setView] = useState<ViewKey>("plan");
  const [dialog, setDialog] = useState<"time" | "employee" | "shift" | "absence" | null>(null);
  const [shiftDefaults, setShiftDefaults] = useState<ShiftDialogDefaults | null>(null);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [activeWeekStart, setActiveWeekStart] = useState<string | null>(null);
  const [calculation, setCalculation] = useState<CalculationDetails | null>(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [apiMessage, setApiMessage] = useState("API wird geladen");
  const [busy, setBusy] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authMessage, setAuthMessage] = useState("Session wird geprüft");
  const [loginEmail, setLoginEmail] = useState("");
  const [magicToken, setMagicToken] = useState(() => (
    typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("token") ?? ""
  ));
  const [totpCode, setTotpCode] = useState("");
  const [totpSetup, setTotpSetup] = useState<TotpEnrollmentPayload | null>(null);
  const visibleWeekStart = activeWeekStart ?? getPrototypeWeekStart(data);

  function navigateView(nextView: ViewKey) {
    if (nextView === "time") {
      const latestTimeWeek = latestTimeEntryWeekStart(data.timeEntries);
      if (latestTimeWeek && !hasTimeEntriesInWeek(data.timeEntries, visibleWeekStart)) {
        setActiveWeekStart(latestTimeWeek);
      }
    }

    setView(nextView);
  }

  async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {})
      }
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string | { code?: string; message?: string };
      };
      const message = typeof payload.error === "string"
        ? payload.error
        : payload.error?.message ?? "API-Fehler";
      const error = new Error(message) as Error & { code?: string };
      if (typeof payload.error === "object") error.code = payload.error?.code;
      throw error;
    }

    return (await response.json()) as T;
  }

  async function authRequest<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {})
      }
    });
    const payload = (await response.json().catch(() => ({}))) as AuthEnvelope<T>;

    if (!response.ok || payload.ok === false) {
      const error = new Error(payload.error?.message ?? "Auth-Fehler") as Error & { code?: string };
      error.code = payload.error?.code;
      throw error;
    }

    return (payload.data ?? {}) as T;
  }

  async function checkAuth() {
    try {
      const payload = await authRequest<AuthMePayload>("/api/auth/me");
      if (payload.authenticated && payload.user?.totpVerified) {
        setAuthUser(payload.user);
        setAuthStatus("authenticated");
        setAuthMessage("Angemeldet");
        return;
      }

      setAuthUser(payload.user);
      setAuthStatus(magicToken ? "token_pending" : "anonymous");
      setAuthMessage(magicToken ? "Login-Link bereit" : "Login erforderlich");
    } catch {
      setAuthStatus("offline");
      setAuthMessage("Auth-API offline");
    }
  }

  async function refresh() {
    try {
      const payload = await request<BootstrapPayload>("/api/bootstrap");
      setWorkforceConfig(payload.workforce);
      setData(payload);
      setApiConnected(true);
      setApiMessage("SQLite-API verbunden");
    } catch (error) {
      const authCode = (error as Error & { code?: string }).code;
      if (authCode === "SESSION_REQUIRED" || authCode === "TOTP_REQUIRED") {
        setApiConnected(true);
        setApiMessage("Login erforderlich");
        setAuthStatus((current) => (current === "checking" ? "anonymous" : current));
        return;
      }
      setWorkforceConfig(null);
      setData(fallbackData);
      setApiConnected(false);
      setApiMessage("API offline: lokale Beispieldaten aktiv");
    }
  }

  useEffect(() => {
    checkAuth();
    refresh();
  }, []);

  async function requestLoginLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = await authRequest<MagicLinkPayload>("/api/auth/magic-link", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail })
      });
      setAuthStatus("magic_sent");
      setAuthMessage(payload.delivery?.delivered ? "Login-Link verschickt" : "Login-Link lokal erzeugt");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Login-Link konnte nicht erzeugt werden");
    } finally {
      setBusy(false);
    }
  }

  async function startTotpEnrollment() {
    const setup = await authRequest<TotpEnrollmentPayload>("/api/auth/totp/enroll", {
      method: "POST"
    });
    setTotpSetup(setup);
  }

  async function verifyLoginToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = await authRequest<MagicLinkVerifyPayload>("/api/auth/magic-link/verify", {
        method: "POST",
        body: JSON.stringify({ token: magicToken, totp: totpCode || undefined })
      });
      setAuthUser(payload.user);
      setTotpCode("");

      if (payload.enroll_totp) {
        setAuthStatus("totp_enroll");
        setAuthMessage("Zwei-Faktor-Setup bereit");
        await startTotpEnrollment();
        return;
      }

      if (payload.user?.totpVerified) {
        setAuthStatus("authenticated");
        setAuthMessage("Angemeldet");
        await refresh();
        if (typeof window !== "undefined") window.history.replaceState(null, "", window.location.pathname);
      }
    } catch (error) {
      const code = (error as Error & { code?: string }).code;
      setAuthStatus(code === "TOTP_REQUIRED" ? "token_pending" : "anonymous");
      setAuthMessage(error instanceof Error ? error.message : "Login-Link konnte nicht geprüft werden");
    } finally {
      setBusy(false);
    }
  }

  async function confirmTotp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = await authRequest<{ user: AuthUser }>("/api/auth/totp/confirm", {
        method: "POST",
        body: JSON.stringify({ code: totpCode })
      });
      setAuthUser(payload.user);
      setAuthStatus("authenticated");
      setAuthMessage("Angemeldet");
      setTotpCode("");
      setTotpSetup(null);
      await refresh();
      if (typeof window !== "undefined") window.history.replaceState(null, "", window.location.pathname);
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Zwei-Faktor-Code konnte nicht bestätigt werden");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      await authRequest<{ logged_out: boolean }>("/api/auth/logout", { method: "POST" });
    } finally {
      setAuthUser(null);
      setAuthStatus("anonymous");
      setAuthMessage("Abgemeldet");
      setBusy(false);
    }
  }

  async function mutate<T>(action: () => Promise<T>, after?: (result: T) => void) {
    setBusy(true);
    try {
      const result = await action();
      after?.(result);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function updateEntryStatus(id: string, status: Status) {
    const previous = data;
    setData((current) => ({
      ...current,
      timeEntries: current.timeEntries.map((entry) =>
        entry.id === id
          ? { ...entry, status, audit: [...entry.audit, `Status gesetzt: ${statusLabels[status]}`] }
          : entry
      )
    }));

    try {
      await mutate(() =>
        request<TimeEntry>(`/api/time-entries/${encodeURIComponent(id)}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status })
        })
      );
    } catch {
      setData(previous);
      setApiConnected(false);
      setApiMessage("API-Schreibzugriff fehlgeschlagen");
    }
  }

  async function updateEntryBreaks(id: string, unpaidBreakMinutes: number, paidBreakMinutes = 0) {
    const previous = data;
    setData((current) => ({
      ...current,
      timeEntries: current.timeEntries.map((entry) =>
        entry.id === id ? { ...entry, unpaidBreakMinutes, paidBreakMinutes } : entry
      )
    }));

    try {
      await mutate(() =>
        request<TimeEntry>(`/api/time-entries/${encodeURIComponent(id)}/breaks`, {
          method: "PATCH",
          body: JSON.stringify({ unpaidBreakMinutes, paidBreakMinutes })
        })
      );
    } catch {
      setData(previous);
      setApiConnected(false);
      setApiMessage("Pausenkorrektur konnte nicht gespeichert werden");
    }
  }

  async function updateAbsenceStatus(id: string, status: AbsenceStatus) {
    const absence = data.absences.find((item) => item.id === id);
    if (!absence || absence.status !== "offen") return;

    const previous = data;
    setData((current) => ({
      ...current,
      absences: current.absences.map((item) => (item.id === id ? { ...item, status } : item))
    }));

    try {
      await mutate(() =>
        request<AbsenceRequest>(`/api/absences/${encodeURIComponent(id)}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status })
        })
      );
    } catch {
      setData(previous);
      setApiConnected(false);
      setApiMessage("Abwesenheitsstatus konnte nicht gespeichert werden");
    }
  }

  async function runDemoImport() {
    await mutate(() =>
      request<{ batch: ImportBatch; bootstrap: BootstrapPayload }>("/api/imports/demo", {
        method: "POST"
      }),
      (result) => {
        setWorkforceConfig(result.bootstrap.workforce);
        setData(result.bootstrap);
        setActiveWeekStart(getPrototypeWeekStart(result.bootstrap));
      }
    );
  }

  async function runDeltaImport() {
    await mutate(() =>
      request<{ batch: ImportBatch; bootstrap: BootstrapPayload }>("/api/imports/delta-snapshot", {
        method: "POST"
      }),
      (result) => {
        setWorkforceConfig(result.bootstrap.workforce);
        setData(result.bootstrap);
        setActiveWeekStart(getPrototypeWeekStart(result.bootstrap));
      }
    );
  }

  function closeDialog() {
    setDialog(null);
    setShiftDefaults(null);
    setEditingShiftId(null);
  }

  function openShiftDialog(defaults?: ShiftDialogDefaults) {
    setEditingShiftId(null);
    setShiftDefaults(defaults ?? null);
    setDialog("shift");
  }

  function openEditShiftDialog(shift: Shift) {
    setEditingShiftId(shift.id);
    setShiftDefaults(shiftDefaultsFromShift(shift));
    setDialog("shift");
  }

  function openShiftDialogForWeek(day = visibleWeekStart) {
    openShiftDialog(shiftDefaultsFromTemplate(shiftSlotsForTemplate(resolveShiftSchema()[0].shifts[0])[0], day, data.locations));
  }

  async function deleteEditingShift() {
    if (!editingShiftId) return;

    const shiftId = editingShiftId;
    const previous = data;
    setData((current) => ({
      ...current,
      shifts: current.shifts.filter((shift) => shift.id !== shiftId)
    }));

    try {
      await mutate(
        () =>
          request<{ id: string }>(`/api/shifts/${encodeURIComponent(shiftId)}`, {
            method: "DELETE"
          }),
        closeDialog
      );
    } catch {
      setData(previous);
      setApiConnected(false);
      setApiMessage("Schicht konnte nicht gelöscht werden");
    }
  }

  const headerAction = {
    dashboard: (
      <button className="secondary-button" onClick={refresh}>
        <RefreshCw size={17} />
        Aktualisieren
      </button>
    ),
    plan: (
      <button className="primary-button" onClick={() => openShiftDialogForWeek()}>
        <Plus size={18} />
        Schicht
      </button>
    ),
    time: (
      <button className="primary-button" onClick={() => setDialog("time")}>
        <Plus size={18} />
        Arbeitszeit
      </button>
    ),
    absences: (
      <button className="primary-button" onClick={() => setDialog("absence")}>
        <Plus size={18} />
        Abwesenheit
      </button>
    ),
    approvals: (
      <button className="secondary-button" onClick={refresh}>
        <RefreshCw size={17} />
        Aktualisieren
      </button>
    ),
    employees: (
      <button className="primary-button" onClick={() => setDialog("employee")}>
        <UserPlus size={18} />
        Mitarbeiter
      </button>
    ),
    payroll: (
      <button className="secondary-button" onClick={refresh}>
        <RefreshCw size={17} />
        Aktualisieren
      </button>
    ),
    reports: (
      <button className="secondary-button" onClick={refresh}>
        <RefreshCw size={17} />
        Aktualisieren
      </button>
    ),
    imports: (
      <button className="primary-button" onClick={runDeltaImport} disabled={busy}>
        <RefreshCw size={18} />
        Delta-Sync
      </button>
    ),
    admin: (
      <button className="secondary-button" onClick={refresh}>
        <RefreshCw size={17} />
        Aktualisieren
      </button>
    ),
    settings: (
      <button className="secondary-button" onClick={refresh}>
        <RefreshCw size={17} />
        Aktualisieren
      </button>
    )
  } satisfies Record<ViewKey, ReactNode>;

  if (authStatus !== "authenticated" && authStatus !== "offline") {
    return (
      <AuthShell
        status={authStatus}
        email={loginEmail}
        token={magicToken}
        totpCode={totpCode}
        setup={totpSetup}
        message={authMessage}
        busy={busy}
        onEmailChange={setLoginEmail}
        onTokenChange={setMagicToken}
        onTotpChange={setTotpCode}
        onRequestLink={requestLoginLink}
        onVerifyToken={verifyLoginToken}
        onConfirmTotp={confirmTotp}
        onRestart={() => {
          setAuthStatus("anonymous");
          setMagicToken("");
          setTotpCode("");
          setTotpSetup(null);
          setAuthMessage("Login erforderlich");
        }}
      />
    );
  }

  const meta = viewMeta[view];

  // T-002b: Shift-Konflikt-Provider mit ID-basiertem In-Memory-Cache.
  const checkShiftConflicts = async (payload: ShiftConflictCheckPayload): Promise<ShiftConflict[]> => {
    const result = await request<{ ok: boolean; conflicts: ShiftConflict[] }>(
      "/api/shifts/check-conflicts",
      { method: "POST", body: JSON.stringify(payload) }
    );
    return Array.isArray(result?.conflicts) ? result.conflicts : [];
  };

  return (
    <ShiftConflictContext.Provider value={checkShiftConflicts}>
    <div className="app-shell">
      <Sidebar
        activeView={view}
        setView={navigateView}
        setDialog={setDialog}
        onOpenShift={() => openShiftDialogForWeek()}
      />
      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{meta.eyebrow}</p>
            <h1>{meta.title}</h1>
          </div>
          <div className="topbar-actions">
            {authUser ? <UserPill user={authUser} /> : null}
            {authUser ? (
              <button className="icon-button" type="button" aria-label="Abmelden" onClick={logout} disabled={busy}>
                <LogOut size={17} />
              </button>
            ) : null}
            <ConnectionPill connected={apiConnected} message={apiMessage} />
            {headerAction[view]}
          </div>
        </header>

        {view === "dashboard" ? (
          <DashboardView
            activeWeekStart={visibleWeekStart}
            data={data}
            setActiveWeekStart={setActiveWeekStart}
            setView={navigateView}
            setDialog={setDialog}
            onEditShift={openEditShiftDialog}
            onPlanShift={(slot, day) =>
              openShiftDialog(shiftDefaultsFromTemplate(slot, day, data.locations))
            }
            onOpenShift={() => openShiftDialogForWeek()}
            onShowCalculation={setCalculation}
          />
        ) : null}
        {view === "plan" ? (
          <PlanView
            activeWeekStart={visibleWeekStart}
            data={data}
            setActiveWeekStart={setActiveWeekStart}
            setView={navigateView}
            onEditShift={openEditShiftDialog}
            onPlanShift={(slot, day) =>
              openShiftDialog(shiftDefaultsFromTemplate(slot, day, data.locations))
            }
            onShowCalculation={setCalculation}
          />
        ) : null}
        {view === "time" ? (
          <TimeView
            data={data}
            activeWeekStart={visibleWeekStart}
            setActiveWeekStart={setActiveWeekStart}
            updateEntryStatus={updateEntryStatus}
            updateEntryBreaks={updateEntryBreaks}
            setDialog={setDialog}
          />
        ) : null}
        {view === "absences" ? (
          <AbsenceView
            activeWeekStart={visibleWeekStart}
            data={data}
            updateStatus={updateAbsenceStatus}
            request={request}
          />
        ) : null}
        {view === "approvals" ? (
          <ApprovalsView
            request={request}
            authUser={authUser}
            updateAbsenceStatus={updateAbsenceStatus}
          />
        ) : null}
        {view === "employees" ? (
          <EmployeesView data={data} request={request} refresh={refresh} />
        ) : null}
        {view === "payroll" ? <PayrollView request={request} employees={data.employees} /> : null}
        {view === "reports" ? <ReportsView request={request} /> : null}
        {view === "imports" ? (
          <ImportsView
            data={data}
            runDemoImport={runDemoImport}
            runDeltaImport={runDeltaImport}
            busy={busy}
            setView={navigateView}
            setActiveWeekStart={setActiveWeekStart}
          />
        ) : null}
        {view === "admin" ? <AdminRolesView request={request} authUser={authUser} /> : null}
        {view === "settings" ? <SettingsView data={data} apiMessage={apiMessage} /> : null}
      </main>

      {dialog === "time" ? (
        <AddTimeDialog
          employees={data.employees}
          workAreas={data.workAreas}
          locations={data.locations}
          initialDate={visibleWeekStart}
          onClose={closeDialog}
          onAdd={(entry) =>
            mutate(
              () =>
                request<TimeEntry>("/api/time-entries", {
                  method: "POST",
                  body: JSON.stringify(entry)
                }),
              (createdEntry) => {
                setActiveWeekStart(startOfWeek(createdEntry?.startDate ?? entry.startDate));
                closeDialog();
              }
            )
          }
        />
      ) : null}

      {dialog === "employee" ? (
        <AddEmployeeDialog
          onClose={closeDialog}
          onAdd={(employee) =>
            mutate(
              () =>
                request<Employee>("/api/employees", {
                  method: "POST",
                  body: JSON.stringify(employee)
                }),
              closeDialog
            )
          }
        />
      ) : null}

      {dialog === "shift" ? (
        <AddShiftDialog
          key={editingShiftId ?? (shiftDefaults ? `${shiftDefaults.area}-${shiftDefaults.startDate}-${shiftDefaults.startTime}` : "blank-shift")}
          employees={data.employees}
          workAreas={data.workAreas}
          locations={data.locations}
          initial={shiftDefaults ?? undefined}
          mode={editingShiftId ? "edit" : "create"}
          onClose={closeDialog}
          onDelete={editingShiftId ? deleteEditingShift : undefined}
          onAdd={(shift) => {
            if (editingShiftId) {
              const shiftId = editingShiftId;
              mutate(
                () =>
                  request<Shift>(`/api/shifts/${encodeURIComponent(shiftId)}`, {
                    method: "PATCH",
                    body: JSON.stringify(shift)
                  }),
                (updatedShift) => {
                  setActiveWeekStart(startOfWeek(updatedShift?.startDate ?? shift.startDate));
                  closeDialog();
                }
              );
              return;
            }

            mutate(
              () =>
                request<Shift[]>("/api/shifts", {
                  method: "POST",
                  body: JSON.stringify(shift)
                }),
              (createdShifts) => {
                setActiveWeekStart(startOfWeek(createdShifts[0]?.startDate ?? shift.startDate));
                closeDialog();
              }
            )
          }}
        />
      ) : null}

      {dialog === "absence" ? (
        <AddAbsenceDialog
          employees={data.employees}
          initialDate={visibleWeekStart}
          onClose={closeDialog}
          onAdd={(absence) =>
            mutate(
              () =>
                request<AbsenceRequest>("/api/absences", {
                  method: "POST",
                  body: JSON.stringify(absence)
                }),
              (createdAbsence) => {
                setActiveWeekStart(startOfWeek(createdAbsence?.startsOn ?? absence.startsOn));
                closeDialog();
              }
            )
          }
        />
      ) : null}

      {calculation ? (
        <CalculationDetailDialog details={calculation} onClose={() => setCalculation(null)} />
      ) : null}
    </div>
    </ShiftConflictContext.Provider>
  );
}

function AuthShell({
  status,
  email,
  token,
  totpCode,
  setup,
  message,
  busy,
  onEmailChange,
  onTokenChange,
  onTotpChange,
  onRequestLink,
  onVerifyToken,
  onConfirmTotp,
  onRestart
}: {
  status: AuthStatus;
  email: string;
  token: string;
  totpCode: string;
  setup: TotpEnrollmentPayload | null;
  message: string;
  busy: boolean;
  onEmailChange: (value: string) => void;
  onTokenChange: (value: string) => void;
  onTotpChange: (value: string) => void;
  onRequestLink: (event: FormEvent<HTMLFormElement>) => void;
  onVerifyToken: (event: FormEvent<HTMLFormElement>) => void;
  onConfirmTotp: (event: FormEvent<HTMLFormElement>) => void;
  onRestart: () => void;
}) {
  const showTokenForm = status === "magic_sent" || status === "token_pending";
  const showTotpSetup = status === "totp_enroll";

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-live="polite">
        <div className="auth-heading">
          <span className="auth-mark">
            <ShieldCheck size={24} />
          </span>
          <div>
            <p className="eyebrow">Workforce-Time</p>
            <h1>Mitarbeiter-Login</h1>
          </div>
        </div>

        <span className={message.includes("Fehler") || message.includes("ung") ? "auth-message warn" : "auth-message"}>
          <KeyRound size={16} />
          {status === "checking" ? "Session wird geprüft" : message}
        </span>

        {status === "checking" ? (
          <div className="auth-progress">
            <RefreshCw size={18} />
            <span>Prüfung läuft</span>
          </div>
        ) : null}

        {status === "anonymous" ? (
          <form className="auth-form" onSubmit={onRequestLink}>
            <label className="field">
              <span>E-Mail</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="name@beispiel.de"
                required
              />
            </label>
            <button className="primary-button" type="submit" disabled={busy}>
              <Mail size={17} />
              Login-Link
            </button>
          </form>
        ) : null}

        {showTokenForm ? (
          <form className="auth-form" onSubmit={onVerifyToken}>
            <label className="field">
              <span>Magic-Link-Token</span>
              <input
                type="text"
                autoComplete="one-time-code"
                value={token}
                onChange={(event) => onTokenChange(event.target.value)}
                placeholder="Token"
                required
              />
            </label>
            <label className="field">
              <span>TOTP-Code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={totpCode}
                onChange={(event) => onTotpChange(event.target.value)}
                placeholder="000000"
              />
            </label>
            <div className="split-actions">
              <button className="primary-button" type="submit" disabled={busy}>
                <Check size={17} />
                Einlösen
              </button>
              <button className="secondary-button" type="button" onClick={onRestart} disabled={busy}>
                Zurück
              </button>
            </div>
          </form>
        ) : null}

        {showTotpSetup ? (
          <div className="auth-form">
            <div className="totp-box">
              <QrCode size={20} />
              <label className="field">
                <span>TOTP-Secret</span>
                <input type="text" value={setup?.secret ?? ""} readOnly />
              </label>
              <label className="field">
                <span>otpauth URI</span>
                <input type="text" value={setup?.otpauth_uri ?? ""} readOnly />
              </label>
            </div>
            {setup?.recovery_codes.length ? (
              <div className="recovery-grid">
                {setup.recovery_codes.map((code) => (
                  <code key={code}>{code}</code>
                ))}
              </div>
            ) : null}
            <form className="auth-form compact" onSubmit={onConfirmTotp}>
              <label className="field">
                <span>TOTP-Code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={totpCode}
                  onChange={(event) => onTotpChange(event.target.value)}
                  placeholder="000000"
                  required
                />
              </label>
              <button className="primary-button" type="submit" disabled={busy || !setup}>
                <ShieldCheck size={17} />
                Bestätigen
              </button>
            </form>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function UserPill({ user }: { user: AuthUser }) {
  return (
    <span className="user-pill">
      <ShieldCheck size={15} />
      <span>
        <strong>{user.displayName || user.email}</strong>
        <small>{user.role}</small>
      </span>
    </span>
  );
}

function Sidebar({
  activeView,
  setView,
  setDialog,
  onOpenShift
}: {
  activeView: ViewKey;
  setView: (view: ViewKey) => void;
  setDialog: (dialog: "time" | "employee" | "absence") => void;
  onOpenShift: () => void;
}) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const items: Array<{ view: ViewKey; label: string; icon: typeof Home }> = [
    { view: "plan", label: "Kalender", icon: CalendarDays },
    { view: "dashboard", label: "Übersicht", icon: Home },
    { view: "time", label: "Arbeitszeiten", icon: Clock3 },
    { view: "absences", label: "Urlaub", icon: CalendarDays },
    { view: "approvals", label: "Freigaben", icon: ClipboardCheck },
    { view: "employees", label: "Mitarbeiter", icon: Users },
    { view: "payroll", label: "Lohnabrechnung", icon: Coins },
    { view: "reports", label: "Auswertung", icon: BarChart3 },
    { view: "imports", label: "Import & Sync", icon: Database },
    { view: "admin", label: "Rollen-Admin", icon: ShieldCheck },
    { view: "settings", label: "Einstellungen", icon: Settings2 }
  ];
  const actions: Array<{ label: string; icon: typeof Home; onClick: () => void }> = [
    { label: "Schicht planen", icon: CalendarDays, onClick: onOpenShift },
    { label: "Arbeitszeit erfassen", icon: Clock3, onClick: () => setDialog("time") },
    { label: "Urlaub eintragen", icon: CalendarDays, onClick: () => setDialog("absence") },
    { label: "Mitarbeiter anlegen", icon: UserPlus, onClick: () => setDialog("employee") },
    { label: "Import & Sync", icon: Database, onClick: () => setView("imports") },
    { label: "Einstellungen", icon: Settings2, onClick: () => setView("settings") }
  ];

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActionsOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function runAction(action: () => void) {
    action();
    setActionsOpen(false);
  }

  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand-mark">PM</div>
        <div>
          <strong>Praxis</strong>
          <span>Monitoring</span>
        </div>
      </div>
      <div className="action-box">
        <button
          className={actionsOpen ? "action-search active" : "action-search"}
          aria-expanded={actionsOpen}
          aria-controls="quick-actions"
          onClick={() => setActionsOpen((current) => !current)}
        >
          <Activity size={16} />
          Aktionen
          <kbd>⌘K</kbd>
        </button>
        {actionsOpen ? (
          <div className="quick-actions-menu" id="quick-actions">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button className="quick-action" key={action.label} onClick={() => runAction(action.onClick)}>
                  <Icon size={16} />
                  {action.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <nav aria-label="Hauptnavigation">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={activeView === item.view ? "nav-item active" : "nav-item"}
              key={item.view}
              onClick={() => setView(item.view)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function ConnectionPill({ connected, message }: { connected: boolean; message: string }) {
  return (
    <span className={connected ? "connection-pill online" : "connection-pill"}>
      <Database size={15} />
      {message}
    </span>
  );
}

function WeekNavigator({
  weekStart,
  onWeekChange
}: {
  weekStart: string;
  onWeekChange: (weekStart: string) => void;
}) {
  const weekEnd = addDays(weekStart, 6);

  return (
    <div className="week-switcher" aria-label="Kalenderwoche wechseln">
      <button className="icon-button" type="button" aria-label="Vorige Kalenderwoche" onClick={() => onWeekChange(addDays(weekStart, -7))}>
        <ChevronLeft size={17} />
      </button>
      <button
        className="week-pill"
        type="button"
        aria-label="Zur aktuellen Kalenderwoche springen"
        onClick={() => onWeekChange(startOfWeek(localTodayIso()))}
      >
        KW {getCalendarWeek(weekStart)}
        <span>{formatShortDate(weekStart)} - {formatShortDate(weekEnd)}</span>
      </button>
      <button className="icon-button" type="button" aria-label="Nächste Kalenderwoche" onClick={() => onWeekChange(addDays(weekStart, 7))}>
        <ChevronRight size={17} />
      </button>
    </div>
  );
}

type OperationalAlert = {
  id: string;
  count: number;
  label: string;
  detail: string;
  tone: "rose" | "amber" | "teal";
  icon: typeof AlertTriangle;
  onClick: () => void;
};

function OperationalAlertsBanner({
  alerts
}: {
  alerts: OperationalAlert[];
}) {
  const urgent = alerts.filter((alert) => alert.count > 0);
  if (urgent.length === 0) {
    return (
      <section className="ops-alerts ops-alerts-empty" aria-label="Operativ-Alerts">
        <Check size={17} />
        <span>Keine offenen Operativ-Punkte. Alles im Lot.</span>
      </section>
    );
  }
  return (
    <section className="ops-alerts" aria-label="Operativ-Alerts">
      {urgent.map((alert) => {
        const Icon = alert.icon;
        return (
          <button
            key={alert.id}
            type="button"
            className={`ops-alert-pill tone-${alert.tone}`}
            onClick={alert.onClick}
          >
            <Icon size={17} />
            <span className="ops-alert-count">{alert.count}</span>
            <span className="ops-alert-label">
              <strong>{alert.label}</strong>
              <small>{alert.detail}</small>
            </span>
          </button>
        );
      })}
    </section>
  );
}

function DashboardView({
  activeWeekStart,
  data,
  setActiveWeekStart,
  setView,
  setDialog,
  onEditShift,
  onPlanShift,
  onOpenShift,
  onShowCalculation
}: {
  activeWeekStart: string;
  data: BootstrapPayload;
  setActiveWeekStart: (weekStart: string) => void;
  setView: (view: ViewKey) => void;
  setDialog: (dialog: "time" | "employee" | "shift" | "absence") => void;
  onEditShift: (shift: Shift) => void;
  onPlanShift: (template: ShiftSlotTemplate, day: string) => void;
  onOpenShift: () => void;
  onShowCalculation: (details: CalculationDetails) => void;
}) {
  const weekStart = activeWeekStart;
  const weekEnd = addDays(weekStart, 6);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weekShifts = data.shifts.filter((shift) => dateInRange(shift.startDate, weekStart, weekEnd));
  const weekEntries = data.timeEntries.filter((entry) => dateInRange(entry.startDate, weekStart, weekEnd));
  const weekAbsences = data.absences.filter(
    (absence) => absence.startsOn <= weekEnd && absence.endsOn >= weekStart
  );
  const breakWarnings = weekEntries.filter((entry) => breakDelta(entry) < 0);
  const openAbsences = weekAbsences.filter((absence) => absence.status === "offen");
  const openTimeRequests = weekEntries.filter((entry) => entry.status === "aenderungsantrag");
  const shiftClusters = clusterShifts(weekShifts);
  const shiftMinutesTotal = weekShifts.reduce((sum, shift) => sum + shiftMinutes(shift), 0);
  const entryMinutesTotal = weekEntries.reduce((sum, entry) => sum + minutesBetween(entry), 0);
  const coherence = data.coherence;
  const coherenceIssueCount =
    coherence.summary.openShiftSlots +
    coherence.summary.missingTime +
    coherence.summary.timeWithoutShift +
    coherence.summary.timeOutsideShift +
    coherence.summary.areaMismatches +
    coherence.summary.absenceOverlaps;
  const coherenceTone = coherenceIssueCount ? (coherence.summary.coveragePercent < 90 ? "rose" : "amber") : "teal";
  const weekPeriod = `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}`;
  const coherenceRows = coherence.issues.map((issue) => ({
    id: issue.id,
    label: `${issue.title} · ${formatShortDate(issue.date)}`,
    detail: issue.detail,
    value: issue.area ?? issue.targetView,
    tone: issue.tone
  }));
  const showCoherenceCalculation = (title: string, total: string, formula: string) => {
    onShowCalculation({
      eyebrow: "Kalkulationsgrundlage",
      title,
      period: weekPeriod,
      formula,
      total,
      note: "Diese Kennzahl kommt aus der Soll-Ist-Kohärenzprüfung. Die Detailzeilen zeigen die auffälligen Quellzeilen der aktuellen Datenbasis.",
      rows: coherenceRows
    });
  };

  const today = localTodayIso();
  const openAbsencesAll = data.absences.filter((absence) => absence.status === "offen");
  const openTimeRequestsAll = data.timeEntries.filter((entry) => entry.status === "aenderungsantrag");
  const missingTimePast = coherence.issues.filter(
    (issue) => issue.type === "missing_time" && issue.date <= today
  );
  const operationalAlerts: OperationalAlert[] = [
    {
      id: "missing-time",
      count: missingTimePast.length,
      label: "Fehlende Stempel",
      detail: "Plan-Schichten ohne Arbeitszeit-Buchung bis heute",
      tone: "rose",
      icon: TimerReset,
      onClick: () => setView("time")
    },
    {
      id: "vacation-open",
      count: openAbsencesAll.length,
      label: "Urlaubsanträge offen",
      detail: "warten auf Genehmigung",
      tone: "amber",
      icon: CalendarDays,
      onClick: () => setView("absences")
    },
    {
      id: "time-requests",
      count: openTimeRequestsAll.length,
      label: "Zeit-Änderungsanträge",
      detail: "warten auf Freigabe",
      tone: "amber",
      icon: ClipboardCheck,
      onClick: () => setView("time")
    },
    {
      id: "open-shifts",
      count: coherence.summary.openShiftSlots,
      label: "Offene Schicht-Slots",
      detail: "Plan-Slots ohne Person diese Woche",
      tone: "amber",
      icon: AlertTriangle,
      onClick: () => setView("plan")
    },
    {
      id: "break-warnings",
      count: breakWarnings.length,
      label: "Pausen-Warnungen",
      detail: "Mindestpause unterschritten diese Woche",
      tone: "rose",
      icon: PauseCircle,
      onClick: () => setView("time")
    }
  ];

  return (
    <div className="operations-layout">
      <OperationalAlertsBanner alerts={operationalAlerts} />
      <section className="focus-header">
        <div>
          <span className="eyebrow">Planwoche {formatShortDate(weekStart)} - {formatShortDate(weekEnd)}</span>
          <h2>Schichten, Zeiten, Pausen und Urlaub auf einen Blick</h2>
        </div>
        <div className="focus-actions">
          <WeekNavigator weekStart={weekStart} onWeekChange={setActiveWeekStart} />
          <button className="primary-button" onClick={onOpenShift}>
            <Plus size={17} />
            Schicht
          </button>
          <button className="primary-button" onClick={() => setDialog("time")}>
            <Clock3 size={17} />
            Arbeitszeit
          </button>
          <button className="primary-button" onClick={() => setDialog("absence")}>
            <CalendarDays size={17} />
            Urlaub
          </button>
        </div>
      </section>

      <section className="core-strip">
        <CoreMetric
          label="Schichtplan"
          value={`${shiftClusters.length} Gruppen`}
          detail={`${weekShifts.length} Tages-Schichten · ${formatDuration(shiftMinutesTotal)}`}
          tone="blue"
          onClick={() => onShowCalculation({
            eyebrow: "Kalkulationsgrundlage",
            title: "Schichtplan der Woche",
            period: weekPeriod,
            formula: "Gruppen = zusammengefasste Schichten nach Bereich, Zeitraum und Standort. Tages-Schichten und Dauer kommen direkt aus den Schichtplan-Zeilen.",
            total: `${shiftClusters.length} Gruppen · ${formatDuration(shiftMinutesTotal)}`,
            rows: weekShifts.map(shiftCalculationRow)
          })}
        />
        <CoreMetric
          label="Arbeitszeiten"
          value={`${weekEntries.length} Einträge`}
          detail={`${formatDuration(entryMinutesTotal)} erfasst`}
          tone="teal"
          onClick={() => onShowCalculation({
            eyebrow: "Kalkulationsgrundlage",
            title: "Arbeitszeiten der Woche",
            period: weekPeriod,
            formula: "Summe aller personenbezogenen Arbeitszeitbuchungen der Woche minus unbezahlte Pausen. Die Personenzuordnung kommt aus der Zeitbuchung, nicht aus einer festen Schichtzuordnung.",
            total: `${weekEntries.length} Einträge · ${formatDuration(entryMinutesTotal)}`,
            note: "Status wird hier nicht herausgefiltert; der Status steht je Einzelzeile dabei.",
            rows: weekEntries.map((entry) => timeEntryCalculationRow(entry, data.employees))
          })}
        />
        <CoreMetric
          label="Pausen"
          value={`${breakWarnings.length} Warnungen`}
          detail={`${weekEntries.length - breakWarnings.length} ok`}
          tone={breakWarnings.length ? "amber" : "teal"}
          onClick={() => onShowCalculation({
            eyebrow: "Kalkulationsgrundlage",
            title: "Pausenprüfung der Woche",
            period: weekPeriod,
            formula: "Warnung = gebuchte Pause liegt unter der gesetzlichen Mindestpause: > 6h Arbeit 30 Min., > 9h Arbeit 60 Min.",
            total: `${breakWarnings.length} Warnungen`,
            rows: breakWarnings.map((entry) => {
              const employee = getEmployee(data.employees, entry.employeeId);
              const missing = requiredBreakMinutes(entry) - entry.unpaidBreakMinutes - entry.paidBreakMinutes;
              return {
                id: entry.id,
                label: `${employee.name} · ${formatShortDate(entry.startDate)}`,
                detail: `${entry.startTime}-${entry.endTime} · ${formatDuration(grossMinutes(entry))} brutto · Pause ${entry.paidBreakMinutes + entry.unpaidBreakMinutes} Min.`,
                value: `${missing} Min. fehlen`,
                tone: "amber"
              };
            })
          })}
        />
        <CoreMetric
          label="Urlaub"
          value={`${weekAbsences.length} Einträge`}
          detail={`${openAbsences.length} offen`}
          tone={openAbsences.length ? "amber" : "blue"}
          onClick={() => onShowCalculation({
            eyebrow: "Kalkulationsgrundlage",
            title: "Urlaub und Abwesenheit der Woche",
            period: weekPeriod,
            formula: "Gezählt werden Abwesenheiten, deren Zeitraum die angezeigte Kalenderwoche überschneidet.",
            total: `${weekAbsences.length} Einträge · ${openAbsences.length} offen`,
            rows: weekAbsences.map(absenceCalculationRow)
          })}
        />
      </section>

      <section className="coherence-panel">
        <div className="section-heading">
          <div>
            <h2>Soll-Ist-Kohärenz</h2>
            <p>{coherence.summary.assignments} Plan-Zuweisungen · {coherence.summary.entries} Ist-Zeiten</p>
          </div>
          <Badge tone={coherenceTone}>{coherence.summary.coveragePercent}% Abdeckung</Badge>
        </div>
        <div className="summary-list four">
          <Metric
            label="Offene Besetzung"
            value={String(coherence.summary.openShiftSlots)}
            tone={coherence.summary.openShiftSlots ? "amber" : "teal"}
            onClick={() => showCoherenceCalculation("Offene Besetzung", String(coherence.summary.openShiftSlots), "Summe aller Soll-Schichtplätze ohne zugewiesene Person.")}
          />
          <Metric
            label="Zeit fehlt"
            value={String(coherence.summary.missingTime)}
            tone={coherence.summary.missingTime ? "rose" : "teal"}
            onClick={() => showCoherenceCalculation("Zeit fehlt", String(coherence.summary.missingTime), "Plan-Zuweisungen ohne passende personenbezogene Arbeitszeitbuchung.")}
          />
          <Metric
            label="Zeitabweichung"
            value={String(coherence.summary.timeOutsideShift)}
            tone={coherence.summary.timeOutsideShift ? "amber" : "teal"}
            onClick={() => showCoherenceCalculation("Zeitabweichung", String(coherence.summary.timeOutsideShift), "Arbeitszeitbuchungen, deren Zeitfenster deutlich außerhalb der zugeordneten Schicht liegt.")}
          />
          <Metric
            label="Bereich/Abwesenheit"
            value={String(coherence.summary.areaMismatches + coherence.summary.absenceOverlaps)}
            tone={coherence.summary.areaMismatches + coherence.summary.absenceOverlaps ? "amber" : "teal"}
            onClick={() => showCoherenceCalculation("Bereich/Abwesenheit", String(coherence.summary.areaMismatches + coherence.summary.absenceOverlaps), "Summe aus Bereichsabweichungen und Überschneidungen zwischen Arbeitszeit/Schicht und Abwesenheit.")}
          />
        </div>
        <div className="coherence-lists">
          <div className="stack-list mini">
            {coherence.issues.slice(0, 5).map((issue) => (
              <button
                className="list-row interactive"
                key={issue.id}
                type="button"
                onClick={() => setView(issue.targetView)}
              >
                <span>
                  <strong>{issue.title}</strong>
                  <small>{formatShortDate(issue.date)} · {issue.detail}</small>
                </span>
                <Badge tone={issue.tone}>{issue.area ?? issue.targetView}</Badge>
              </button>
            ))}
            {coherence.issues.length === 0 ? <div className="empty-state compact">Keine Soll-Ist-Auffälligkeiten</div> : null}
          </div>
          <div className="coherence-days">
            {coherence.daySummaries.slice(0, 7).map((day) => (
              <button className="coherence-day interactive" key={day.date} type="button" onClick={() => setView(day.issues ? "time" : "plan")}>
                <span>{formatShortDate(day.date)}</span>
                <strong>{day.assignments}/{day.entries}</strong>
                <small>{formatDuration(day.plannedMinutes)} P · {formatDuration(day.actualMinutes)} I</small>
                {day.issues ? <Badge tone={day.issues > 2 ? "rose" : "amber"}>{day.issues}</Badge> : <Badge tone="teal">ok</Badge>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="core-board">
        <CoreColumn title="Schichten" icon={CalendarDays} action="Plan öffnen" onAction={() => setView("plan")}>
          {shiftClusters.slice(0, 6).map((cluster) => (
            <button className="core-row interactive" key={cluster.id} onClick={() => setView("plan")}>
              <span>
                <strong>{cluster.area}</strong>
                <small>{formatShiftClusterDetails(cluster)}</small>
              </span>
              <Badge tone={cluster.assignedStaff >= cluster.requiredStaff ? "teal" : "amber"}>
                {cluster.assignedStaff}/{cluster.requiredStaff}
              </Badge>
            </button>
          ))}
          {shiftClusters.length > 6 ? (
            <button className="core-row interactive compact-row" onClick={() => setView("plan")}>
              <span>
                <strong>{shiftClusters.length - 6} weitere Gruppen</strong>
                <small>vollständig im Wochenplan</small>
              </span>
            </button>
          ) : null}
          {weekShifts.length === 0 ? <div className="empty-state compact">Keine Schichten geplant</div> : null}
        </CoreColumn>

        <CoreColumn title="Arbeitszeiten" icon={Clock3} action="Zeiten öffnen" onAction={() => setView("time")}>
          {data.timeEntries.slice(0, 6).map((entry) => {
            const employee = getEmployee(data.employees, entry.employeeId);
            return (
              <button className="core-row interactive" key={entry.id} onClick={() => setView("time")}>
                <span>
                  <strong>{employee.name}</strong>
                  <small>{formatShortDate(entry.startDate)} · {entry.startTime}-{entry.endTime} · {formatDuration(minutesBetween(entry))}</small>
                </span>
                <StatusBadge status={entry.status} />
              </button>
            );
          })}
          {data.timeEntries.length === 0 ? <div className="empty-state compact">Keine Zeiten erfasst</div> : null}
        </CoreColumn>

        <CoreColumn title="Pausen" icon={PauseCircle} action="Pausen prüfen" onAction={() => setView("time")}>
          {data.timeEntries.slice(0, 6).map((entry) => {
            const employee = getEmployee(data.employees, entry.employeeId);
            const actual = entry.paidBreakMinutes + entry.unpaidBreakMinutes;
            const required = requiredBreakMinutes(entry);
            const delta = actual - required;
            return (
              <button className="core-row interactive" key={entry.id} onClick={() => setView("time")}>
                <span>
                  <strong>{employee.name}</strong>
                  <small>{actual} Min. Pause · Soll {required} Min.</small>
                </span>
                <Badge tone={delta < 0 ? "rose" : "teal"}>{delta < 0 ? `${Math.abs(delta)} Min. fehlen` : "ok"}</Badge>
              </button>
            );
          })}
        </CoreColumn>

        <CoreColumn title="Urlaub" icon={CalendarDays} action="Urlaub öffnen" onAction={() => setView("absences")}>
          {data.absences.slice(0, 6).map((absence) => (
            <button className="core-row interactive" key={absence.id} onClick={() => setView("absences")}>
              <span>
                <strong>{absence.employeeName}</strong>
                <small>{absence.type} · {formatShortDate(absence.startsOn)}-{formatShortDate(absence.endsOn)}</small>
              </span>
              <AbsenceBadge status={absence.status} />
            </button>
          ))}
          {data.absences.length === 0 ? <div className="empty-state compact">Keine Urlaube oder Abwesenheiten</div> : null}
        </CoreColumn>
      </section>

      <section className="week-matrix">
        <div className="section-heading">
          <div>
            <h2>Wochenmatrix</h2>
            <p>Plan, Ist-Zeit und Urlaub pro Mitarbeiter</p>
          </div>
        </div>
        <WeeklyMatrix
          data={data}
          days={weekDays}
          onEditShift={onEditShift}
          onOpenAbsences={() => setView("absences")}
          onOpenEmployees={() => setView("employees")}
          onOpenTime={() => setView("time")}
          onPlanShift={onPlanShift}
        />
      </section>

      <section className="secondary-ops single-panel">
        <Panel title="Offene Freigaben" icon={ClipboardCheck}>
          <div className="stack-list">
            {openTimeRequests.slice(0, 3).map((entry) => {
              const employee = getEmployee(data.employees, entry.employeeId);
              return (
                <button className="list-row interactive" key={entry.id} onClick={() => setView("time")}>
                  <span>
                    <strong>{employee.name}</strong>
                    <small>{entry.area} · {formatShortDate(entry.startDate)}</small>
                  </span>
                  <Badge tone="amber">Zeit</Badge>
                </button>
              );
            })}
            {openAbsences.slice(0, 3).map((absence) => (
              <button className="list-row interactive" key={absence.id} onClick={() => setView("absences")}>
                <span>
                  <strong>{absence.employeeName}</strong>
                  <small>{absence.type} · {formatShortDate(absence.startsOn)}</small>
                </span>
                <Badge tone="amber">Urlaub</Badge>
              </button>
            ))}
            {openTimeRequests.length + openAbsences.length === 0 ? (
              <div className="empty-state compact">Keine offenen Freigaben</div>
            ) : null}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function CoreMetric({
  label,
  value,
  detail,
  tone,
  onClick
}: {
  label: string;
  value: string;
  detail: string;
  tone?: string;
  onClick?: () => void;
}) {
  const className = `core-metric ${tone ?? ""}${onClick ? " interactive" : ""}`;
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </>
  );

  if (onClick) {
    return (
      <button className={className} type="button" onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <article className={className}>
      {content}
    </article>
  );
}

function CoreColumn({
  title,
  icon: Icon,
  action,
  onAction,
  children
}: {
  title: string;
  icon: typeof Home;
  action: string;
  onAction: () => void;
  children: ReactNode;
}) {
  return (
    <section className="core-column">
      <div className="core-column-heading">
        <span>
          <Icon size={18} />
          {title}
        </span>
        <button className="secondary-button compact-button" onClick={onAction}>
          {action}
        </button>
      </div>
      <div className="core-list">{children}</div>
    </section>
  );
}

function WeeklyMatrix({
  data,
  days,
  onEditShift,
  onOpenAbsences,
  onOpenEmployees,
  onOpenTime,
  onPlanShift
}: {
  data: BootstrapPayload;
  days: string[];
  onEditShift?: (shift: Shift) => void;
  onOpenAbsences?: () => void;
  onOpenEmployees?: () => void;
  onOpenTime?: () => void;
  onPlanShift?: (template: ShiftSlotTemplate, day: string) => void;
}) {
  const schemaGroups = schemaGroupsForData(data);
  const defaultSlot = shiftSlotsForTemplate(schemaGroups[0]?.shifts[0] ?? resolveShiftSchema()[0].shifts[0])[0];
  const labelColumn = days.length === 1 ? "minmax(108px, 128px)" : "minmax(142px, 170px)";

  function openDay(day: string) {
    const firstShift = data.shifts.find((shift) => shift.startDate === day);
    if (firstShift && onEditShift) {
      onEditShift(firstShift);
      return;
    }
    onPlanShift?.(defaultSlot, day);
  }

  return (
    <div className="matrix-shell">
      <div className="matrix-grid" style={{ gridTemplateColumns: `${labelColumn} repeat(${days.length}, minmax(0, 1fr))` }}>
        <button className="matrix-head interactive" type="button" onClick={onOpenEmployees}>
          Mitarbeiter
        </button>
        {days.map((day) => (
          <button className="matrix-head interactive" type="button" key={day} onClick={() => openDay(day)}>
            {formatShortDate(day)}
          </button>
        ))}
        {data.employees.map((employee) => (
          <MatrixRow
            data={data}
            days={days}
            employee={employee}
            key={employee.id}
            onEditShift={onEditShift}
            onOpenAbsences={onOpenAbsences}
            onOpenEmployees={onOpenEmployees}
            onOpenTime={onOpenTime}
            onPlanShift={onPlanShift}
          />
        ))}
      </div>
    </div>
  );
}

function MatrixRow({
  data,
  days,
  employee,
  onEditShift,
  onOpenAbsences,
  onOpenEmployees,
  onOpenTime,
  onPlanShift
}: {
  data: BootstrapPayload;
  days: string[];
  employee: Employee;
  onEditShift?: (shift: Shift) => void;
  onOpenAbsences?: () => void;
  onOpenEmployees?: () => void;
  onOpenTime?: () => void;
  onPlanShift?: (template: ShiftSlotTemplate, day: string) => void;
}) {
  const schemaGroups = schemaGroupsForData(data);
  const defaultSlot = shiftSlotsForTemplate(schemaGroups[0]?.shifts[0] ?? resolveShiftSchema()[0].shifts[0])[0];

  function openMatrixCell(day: string, shifts: Shift[], entries: TimeEntry[], absences: AbsenceRequest[]) {
    if (shifts[0] && onEditShift) {
      onEditShift(shifts[0]);
      return;
    }

    if (entries.length && onOpenTime) {
      onOpenTime();
      return;
    }

    if (absences.length && onOpenAbsences) {
      onOpenAbsences();
      return;
    }

    onPlanShift?.(defaultSlot, day);
  }

  return (
    <>
      <button className="matrix-person interactive" type="button" onClick={onOpenEmployees}>
        <span className="avatar tiny" style={employeeAvatarStyle(employee)}>{compactInitials(employee.initials)}</span>
        <span>
          <strong>{employee.name}</strong>
          <small>{employee.role}</small>
        </span>
      </button>
      {days.map((day) => {
        const shifts = data.shifts.filter(
          (shift) => shift.startDate === day && shift.assignments.some((assigned) => assigned.id === employee.id)
        );
        const entries = data.timeEntries.filter((entry) => entry.startDate === day && entry.employeeId === employee.id);
        const absences = data.absences.filter(
          (absence) => absence.employeeId === employee.id && absence.startsOn <= day && absence.endsOn >= day
        );
        const shiftTotal = shifts.reduce((sum, shift) => sum + shiftMinutes(shift), 0);
        const entryTotal = entries.reduce((sum, entry) => sum + minutesBetween(entry), 0);
        const breakWarning = entries.some((entry) => breakDelta(entry) < 0);
        return (
          <button
            className={absences.length ? "matrix-cell away interactive" : "matrix-cell interactive"}
            type="button"
            key={`${employee.id}-${day}`}
            onClick={() => openMatrixCell(day, shifts, entries, absences)}
          >
            {shifts.length ? <span>P {formatDuration(shiftTotal)}</span> : null}
            {entries.length ? <span>I {formatDuration(entryTotal)}</span> : null}
            {breakWarning ? <Badge tone="rose">Pause</Badge> : null}
            {absences.map((absence) => (
              <Badge tone={absence.status === "genehmigt" ? "teal" : "amber"} key={absence.id}>
                {absence.type}
              </Badge>
            ))}
            {!shifts.length && !entries.length && !absences.length ? <small>frei</small> : null}
          </button>
        );
      })}
    </>
  );
}

function PlanView({
  activeWeekStart,
  data,
  setActiveWeekStart,
  setView,
  onEditShift,
  onPlanShift,
  onShowCalculation
}: {
  activeWeekStart: string;
  data: BootstrapPayload;
  setActiveWeekStart: (weekStart: string) => void;
  setView: (view: ViewKey) => void;
  onEditShift: (shift: Shift) => void;
  onPlanShift: (template: ShiftSlotTemplate, day: string) => void;
  onShowCalculation: (details: CalculationDetails) => void;
}) {
  const weekStart = activeWeekStart;
  const weekEnd = addDays(weekStart, 6);
  const isCompactPlanner = useMediaQuery("(max-width: 760px)");
  const [selectedPlanDay, setSelectedPlanDay] = useState(weekStart);
  const [showWeekend, setShowWeekend] = useState(false);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const weekShifts = data.shifts.filter((shift) => dateInRange(shift.startDate, weekStart, weekEnd));
  const weekdayDays = weekDays.filter((day) => !isWeekend(day));
  const weekendDaysWithShifts = weekDays.filter(
    (day) => isWeekend(day) && weekShifts.some((shift) => shift.startDate === day)
  );
  const weekendShiftCount = weekShifts.filter((shift) => isWeekend(shift.startDate)).length;
  const canShowWeekend = weekendShiftCount > 0;
  const selectableDays = canShowWeekend && showWeekend
    ? [...weekdayDays, ...weekendDaysWithShifts]
    : weekdayDays;
  const selectedVisibleDay = selectableDays.includes(selectedPlanDay)
    ? selectedPlanDay
    : selectableDays[0] ?? weekStart;
  const visibleDays = isCompactPlanner ? [selectedVisibleDay] : selectableDays;

  useEffect(() => {
    setSelectedPlanDay(weekStart);
    setShowWeekend(false);
  }, [weekStart]);

  return (
    <div className="calendar-planner">
      <section className="calendar-toolbar">
        <div>
          <span className="eyebrow">Planwoche</span>
          <h2>{formatShortDate(weekStart)} - {formatShortDate(weekEnd)}</h2>
          <WeekNavigator weekStart={weekStart} onWeekChange={setActiveWeekStart} />
        </div>
        <MonthHoursCounter
          employees={data.employees}
          timeEntries={data.timeEntries}
          weekStart={weekStart}
          onShowCalculation={onShowCalculation}
        />
      </section>

      {isCompactPlanner || canShowWeekend ? (
        <div className="planner-day-controls">
          {isCompactPlanner ? (
            <div className="planner-day-tabs" aria-label="Planungstag auswählen">
              {selectableDays.map((day) => (
                <button
                  className={day === selectedVisibleDay ? "planner-day-tab active" : "planner-day-tab"}
                  type="button"
                  key={day}
                  onClick={() => setSelectedPlanDay(day)}
                >
                  <strong>{new Intl.DateTimeFormat("de-DE", { weekday: "short" }).format(new Date(`${day}T12:00:00`))}</strong>
                  <span>{formatShortDate(day)}</span>
                </button>
              ))}
            </div>
          ) : null}
          {canShowWeekend ? (
            <button
              className={showWeekend ? "secondary-button compact-action weekend-toggle active" : "secondary-button compact-action weekend-toggle"}
              type="button"
              onClick={() => setShowWeekend((current) => !current)}
            >
              {showWeekend ? "Wochenende ausblenden" : `Wochenende anzeigen (${weekendShiftCount})`}
            </button>
          ) : null}
        </div>
      ) : null}

      <FixedWeeklyPlanner data={data} days={visibleDays} onEditShift={onEditShift} onPlanShift={onPlanShift} />
    </div>
  );
}

function MonthHoursCounter({
  employees,
  timeEntries,
  weekStart,
  onShowCalculation
}: {
  employees: Employee[];
  timeEntries: TimeEntry[];
  weekStart: string;
  onShowCalculation: (details: CalculationDetails) => void;
}) {
  const monthStart = startOfMonth(weekStart);
  const range = monthCounterRange(monthStart);
  const rows = employees.map((employee) => ({
    employee,
    actualMinutes: employeeMonthTimeMinutes(employee, timeEntries, range),
    targetMinutes: monthTargetMinutesForEmployee(employee, range)
  }));
  const totalActualMinutes = rows.reduce((sum, row) => sum + row.actualMinutes, 0);
  const totalTargetMinutes = rows.reduce((sum, row) => sum + row.targetMinutes, 0);

  return (
    <aside className="month-hours-card" aria-label="Bisherige Monatsstunden">
      <div className="month-hours-head">
        <span>
          <span className="eyebrow">Monatsstunden Ist/Soll</span>
          <strong>{formatMonthLabel(weekStart)}</strong>
          <small>Personenzeiten {formatShortDate(range.start)}-{formatShortDate(range.end)}</small>
        </span>
        <b>{formatDuration(totalActualMinutes)} / {formatDuration(totalTargetMinutes)}</b>
      </div>
      <div className="month-hours-list">
        {rows.map(({ employee, actualMinutes, targetMinutes }) => {
          const completion = targetMinutes ? Math.min(100, Math.round((actualMinutes / targetMinutes) * 100)) : 0;
          const needsReview = monthlyNeedsPlausibilityReview(employee, actualMinutes, targetMinutes);
          const statusClass =
            needsReview ? "review" : actualMinutes > targetMinutes ? "over" : actualMinutes === targetMinutes ? "complete" : "partial";
          return (
            <button
              className={`month-hours-person ${statusClass}`}
              type="button"
              key={employee.id}
              onClick={() => onShowCalculation(buildMonthEmployeeCalculation(employee, timeEntries, range))}
              aria-label={`${employee.name}: Kalkulationsgrundlage für ${formatDuration(actualMinutes)} Personenzeit von ${formatDuration(targetMinutes)} Monats-Soll öffnen${needsReview ? ", Plausibilität prüfen" : ""}`}
            >
              <span className="avatar tiny" style={employeeAvatarStyle(employee)}>{compactInitials(employee.initials)}</span>
              <span className="month-hours-name">{employee.name}</span>
              <strong>{formatDuration(actualMinutes)} / {formatDuration(targetMinutes)}{needsReview ? " · prüfen" : ""}</strong>
              <span className="month-hours-progress" aria-hidden="true">
                <span style={{ width: `${completion}%` }} />
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function ShiftWeekCalendar({
  data,
  days,
  onSelectDay,
  selectedDay
}: {
  data: BootstrapPayload;
  days: string[];
  onSelectDay: (day: string) => void;
  selectedDay: string;
}) {
  return (
    <div className="shift-week-calendar" aria-label="Schichtlage der Woche">
      <div className="shift-week-grid">
        {days.map((day) => {
          const dayShifts = data.shifts
            .filter((shift) => shift.startDate === day)
            .sort((first, second) => `${first.startTime}-${first.area}`.localeCompare(`${second.startTime}-${second.area}`));
          const dayAbsences = data.absences.filter((absence) => absence.startsOn <= day && absence.endsOn >= day);
          const required = dayShifts.reduce((sum, shift) => sum + shift.requiredStaff, 0);
          const assigned = dayShifts.reduce((sum, shift) => sum + shift.assignments.length, 0);
          const coverage = required > 0 ? Math.min(100, Math.round((assigned / required) * 100)) : 0;
          const tone = required === 0 ? "quiet" : assigned >= required ? "complete" : assigned === 0 ? "empty" : "partial";
          const weekday = new Intl.DateTimeFormat("de-DE", { weekday: "short" }).format(new Date(`${day}T12:00:00`));

          return (
            <button
              className={`shift-day-card ${tone}${day === selectedDay ? " selected" : ""}`}
              type="button"
              key={day}
              onClick={() => onSelectDay(day)}
              aria-pressed={day === selectedDay}
            >
              <span className="shift-day-head">
                <span>
                  <strong>{weekday}</strong>
                  <small>{formatShortDate(day)}</small>
                </span>
                <b>{dayShifts.length}</b>
              </span>
              <span className="coverage-track" aria-hidden="true">
                <span style={{ width: `${coverage}%` }} />
              </span>
              <span className="shift-day-stats">
                <span>{assigned}/{required || 0} besetzt</span>
                <span>{formatDuration(dayShifts.reduce((sum, shift) => sum + shiftMinutes(shift), 0))}</span>
                {dayAbsences.length ? <span>{dayAbsences.length} abwesend</span> : null}
              </span>
              <span className="shift-day-lines">
                {dayShifts.slice(0, 5).map((shift) => {
                  const segment = shiftSegmentForTime(shift.startTime);
                  const initials = shift.assignments.map((employee) => compactInitials(employee.initials)).join(" ");
                  return (
                    <span className={`shift-day-line ${segment}`} key={shift.id}>
                      <strong>{shift.startTime}-{shift.endTime}</strong>
                      <em>{shortAreaName(shift.area)}</em>
                      <small>{initials || "frei"}</small>
                    </span>
                  );
                })}
                {dayShifts.length > 5 ? <span className="shift-day-more">+ {dayShifts.length - 5} weitere</span> : null}
                {dayShifts.length === 0 ? <span className="shift-day-empty">keine Dienste</span> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ShiftDayInspector({
  data,
  day,
  onEditShift,
  onOpenAbsences,
  onOpenTime,
  onPlanShift
}: {
  data: BootstrapPayload;
  day: string;
  onEditShift: (shift: Shift) => void;
  onOpenAbsences: () => void;
  onOpenTime: () => void;
  onPlanShift: (template: ShiftSlotTemplate, day: string) => void;
}) {
  const schemaGroups = schemaGroupsForData(data);
  const defaultSlot = shiftSlotsForTemplate(schemaGroups[0]?.shifts[0] ?? resolveShiftSchema()[0].shifts[0])[0];
  const dayShifts = data.shifts
    .filter((shift) => shift.startDate === day)
    .sort((first, second) => `${first.startTime}-${first.area}`.localeCompare(`${second.startTime}-${second.area}`));
  const dayEntries = data.timeEntries.filter((entry) => entry.startDate === day);
  const dayAbsences = data.absences.filter((absence) => absence.startsOn <= day && absence.endsOn >= day);
  const assigned = dayShifts.reduce((sum, shift) => sum + shift.assignments.length, 0);
  const required = dayShifts.reduce((sum, shift) => sum + shift.requiredStaff, 0);
  const openSlots = schemaGroups
    .flatMap((group) =>
      group.shifts.flatMap((template) =>
        shiftSlotsForTemplate(template).map((slot) => ({ group: group.category, slot }))
      )
    )
    .filter(({ slot }) => recordsForSlot(recordsForTemplateDay(dayShifts, day, slot), slot).length === 0);

  return (
    <section className="shift-day-inspector" aria-label="Ausgewählter Planungstag">
      <div className="inspector-summary">
        <span className="eyebrow">Ausgewählter Tag</span>
        <h2>{formatDate(day)}</h2>
        <div className="inspector-kpis">
          <button type="button" onClick={() => onPlanShift(defaultSlot, day)}>
            <strong>{dayShifts.length}</strong>
            <span>Dienste</span>
          </button>
          <button type="button" onClick={dayEntries.length ? onOpenTime : () => onPlanShift(defaultSlot, day)}>
            <strong>{formatDuration(dayEntries.reduce((sum, entry) => sum + minutesBetween(entry), 0))}</strong>
            <span>Ist-Zeit</span>
          </button>
          <button type="button" onClick={dayAbsences.length ? onOpenAbsences : () => onPlanShift(defaultSlot, day)}>
            <strong>{dayAbsences.length}</strong>
            <span>abwesend</span>
          </button>
          <button type="button" onClick={() => onPlanShift(defaultSlot, day)}>
            <strong>{assigned}/{required || 0}</strong>
            <span>Besetzung</span>
          </button>
        </div>
      </div>

      <div className="inspector-main">
        <div className="inspector-heading">
          <div>
            <span className="eyebrow">Tagesdienste</span>
            <h2>{dayShifts.length ? "Geplante Schichten" : "Noch keine Schichten"}</h2>
          </div>
          <button className="primary-button compact-action" type="button" onClick={() => onPlanShift(defaultSlot, day)}>
            <Plus size={17} />
            Dienst
          </button>
        </div>

        <div className="day-shift-list">
          {dayShifts.map((shift) => (
            <button className="day-shift-row" type="button" key={shift.id} onClick={() => onEditShift(shift)}>
              <span className={`shift-segment-dot ${shiftSegmentForTime(shift.startTime)}`} aria-hidden="true" />
              <span>
                <strong>{shortAreaName(shift.area)}</strong>
                <small>{shift.startTime}-{shift.endTime} · {shift.location}</small>
              </span>
              <span className={shift.assignments.length >= shift.requiredStaff ? "coverage-pill complete" : "coverage-pill partial"}>
                {shift.assignments.length}/{shift.requiredStaff}
              </span>
              <span className="assigned-mini">
                {shift.assignments.length
                  ? shift.assignments.map((employee) => compactInitials(employee.initials)).join(" ")
                  : "frei"}
              </span>
            </button>
          ))}
          {dayShifts.length === 0 ? (
            <button className="day-shift-empty" type="button" onClick={() => onPlanShift(defaultSlot, day)}>
              Dienst für diesen Tag anlegen
            </button>
          ) : null}
        </div>

        <details className="slot-picker">
          <summary>Standarddienst auswählen</summary>
          <div>
            {openSlots.map(({ group, slot }) => (
              <button type="button" key={slot.id} onClick={() => onPlanShift(slot, day)}>
                <span>{shortAreaName(slot.baseLabel)}</span>
                <small>{slot.segmentLabel} · {slot.defaultStartTime}-{slot.defaultEndTime} · {group}</small>
              </button>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}

function FixedWeeklyPlanner({
  data,
  days,
  onEditShift,
  onPlanShift
}: {
  data: BootstrapPayload;
  days: string[];
  onEditShift: (shift: Shift) => void;
  onPlanShift: (template: ShiftSlotTemplate, day: string) => void;
}) {
  const schemaGroups = schemaGroupsForData(data);
  const defaultSlot = shiftSlotsForTemplate(schemaGroups[0]?.shifts[0] ?? resolveShiftSchema()[0].shifts[0])[0];
  const labelColumn = days.length === 1 ? "minmax(112px, 126px)" : "minmax(150px, 220px)";

  function openDay(day: string) {
    const firstShift = data.shifts.find((shift) => shift.startDate === day);
    if (firstShift) {
      onEditShift(firstShift);
      return;
    }
    onPlanShift(defaultSlot, day);
  }

  return (
    <section className="schema-planner" id="schema-planner" aria-label="Schichtplan Wochenansicht">
      <div
        className="schema-grid"
        style={{ gridTemplateColumns: `${labelColumn} repeat(${days.length}, minmax(0, 1fr))` }}
      >
        <button
          className="schema-corner interactive"
          type="button"
          onClick={() => onPlanShift(defaultSlot, days[0])}
        >
          Schichtschema
        </button>
        {days.map((day) => {
          const optionalDay = isWeekend(day);

          return (
            <button
              className={optionalDay ? "schema-day-head optional-day interactive" : "schema-day-head interactive"}
              type="button"
              key={day}
              onClick={() => openDay(day)}
            >
              <div className="schema-day-title">
                <strong>{formatDate(day)}</strong>
                {optionalDay ? <span className="optional-shift-label">optional</span> : null}
              </div>
              <small>
                {data.shifts.filter((shift) => shift.startDate === day).length} besetzt ·{" "}
                {data.absences.filter((absence) => absence.startsOn <= day && absence.endsOn >= day).length} abwesend
              </small>
            </button>
          );
        })}

        {schemaGroups.map((group) => (
          <SchemaGroupRows
            data={data}
            days={days}
            group={group}
            key={group.category}
            onEditShift={onEditShift}
            onPlanShift={onPlanShift}
          />
        ))}
      </div>
    </section>
  );
}

function SchemaGroupRows({
  data,
  days,
  group,
  onEditShift,
  onPlanShift
}: {
  data: BootstrapPayload;
  days: string[];
  group: ShiftSchemaGroup;
  onEditShift: (shift: Shift) => void;
  onPlanShift: (template: ShiftSlotTemplate, day: string) => void;
}) {
  const groupSlots = group.shifts.flatMap(shiftSlotsForTemplate);
  const shiftMatchesGroup = (shift: Shift) => group.shifts.some((template) => shiftMatchesTemplate(shift, template));

  function openGroup() {
    const firstShift = data.shifts.find(
      (shift) =>
        days.includes(shift.startDate) &&
        shiftMatchesGroup(shift)
    );

    if (firstShift) {
      onEditShift(firstShift);
      return;
    }

    onPlanShift(groupSlots[0], days[0]);
  }

  function openGroupDay(day: string) {
    const firstShift = data.shifts.find(
      (shift) =>
        shift.startDate === day &&
        shiftMatchesGroup(shift)
    );

    if (firstShift) {
      onEditShift(firstShift);
      return;
    }

    onPlanShift(groupSlots[0], day);
  }

  return (
    <>
      <button className="schema-group-row interactive" type="button" onClick={openGroup}>
        {group.category}
      </button>
      {days.map((day) => {
        const groupDayShifts = data.shifts.filter(
          (shift) =>
            shift.startDate === day &&
            shiftMatchesGroup(shift)
        );

        return (
          <button
            className="schema-group-fill interactive"
            type="button"
            key={`${group.category}-${day}`}
            onClick={() => openGroupDay(day)}
            aria-label={`${group.category} am ${formatShortDate(day)} öffnen`}
          >
            <span>{groupDayShifts.length ? String(groupDayShifts.length) : ""}</span>
          </button>
        );
      })}
      {group.shifts.map((shiftTemplate) => (
        <SchemaShiftRow
          data={data}
          days={days}
          template={shiftTemplate}
          key={shiftTemplate.id}
          onEditShift={onEditShift}
          onPlanShift={onPlanShift}
        />
      ))}
    </>
  );
}

function SchemaShiftRow({
  data,
  days,
  template,
  onEditShift,
  onPlanShift
}: {
  data: BootstrapPayload;
  days: string[];
  template: ShiftTemplate;
  onEditShift: (shift: Shift) => void;
  onPlanShift: (template: ShiftSlotTemplate, day: string) => void;
}) {
  const slots = shiftSlotsForTemplate(template);

  function openTemplate() {
    const firstShift = data.shifts.find(
      (shift) => days.includes(shift.startDate) && shiftMatchesTemplate(shift, template)
    );

    if (firstShift) {
      onEditShift(firstShift);
      return;
    }

    onPlanShift(slots[0], days[0]);
  }

  function openCell(day: string, shifts: Shift[]) {
    if (shifts[0]) {
      onEditShift(shifts[0]);
      return;
    }

    onPlanShift(slots[0], day);
  }

  return (
    <>
      <button className="schema-shift-label interactive" type="button" onClick={openTemplate}>
        <strong>{template.label}</strong>
        <small>{template.eligibility}</small>
      </button>
      {days.map((day) => {
        const optionalDay = isWeekend(day);
        const dayShifts = recordsForTemplateDay(data.shifts, day, template);
        const dayEntries = recordsForTemplateDay(data.timeEntries, day, template);

        return (
          <div
            className={optionalDay ? "schema-cell optional-day interactive-cell" : "schema-cell interactive-cell"}
            key={`${template.id}-${day}`}
            onClick={() => openCell(day, dayShifts)}
          >
            <div className="schema-service-stack">
              {slots.map((slot) => {
                const shifts = recordsForSlot(dayShifts, slot);
                const entries = recordsForSlot(dayEntries, slot);
                const isOpenSlot = shifts.length === 0;
                const marker = slot.segmentId === "early" ? "F" : "S";

                return (
                  <div className={`schema-service-line ${slot.segmentId}`} key={`${slot.id}-${day}`}>
                    {isOpenSlot ? null : (
                      <span className="visually-hidden">
                        {slot.segmentLabel} {slot.defaultStartTime}-{slot.defaultEndTime}
                      </span>
                    )}
                    {shifts.map((shift) => (
                      <ShiftCalendarCard shift={shift} slot={slot} key={shift.id} onEdit={onEditShift} />
                    ))}
                    {entries.length ? (
                      <div className="schema-cell-footnote">
                        {entries.length} Zeiten · {formatDuration(entries.reduce((sum, entry) => sum + minutesBetween(entry), 0))}
                      </div>
                    ) : null}
                    {isOpenSlot ? (
                      <button
                        className="schema-service-open"
                        type="button"
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => {
                          event.stopPropagation();
                          onPlanShift(slot, day);
                        }}
                      >
                        <span className={`slot-marker ${slot.segmentId}`} aria-hidden="true">{marker}</span>
                        <span className="slot-open-copy">
                          <strong>frei</strong>
                          <small>{slot.defaultStartTime}-{slot.defaultEndTime}</small>
                        </span>
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

function ShiftCalendarCard({
  shift,
  slot,
  onEdit
}: {
  shift: Shift;
  slot: ShiftSlotTemplate;
  onEdit: (shift: Shift) => void;
}) {
  const customTime = shift.startTime !== slot.defaultStartTime || shift.endTime !== slot.defaultEndTime;
  const visibleNote = shift.note.startsWith("Praxisregel:") ? "" : shift.note;
  const marker = slot.segmentId === "early" ? "F" : "S";
  const assignmentTitle = shift.assignments.map((employee) => employee.name).join(", ") || "Unbesetzt";
  // T-002b — Konflikt-Pill: on-demand bei Hover/Klick.
  const checkConflicts = useContext(ShiftConflictContext);
  const [conflicts, setConflicts] = useState<ShiftConflict[] | null>(null);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  async function loadConflicts() {
    if (conflicts !== null || checkingConflicts || !checkConflicts) return;
    if (shift.assignments.length === 0) return;
    setCheckingConflicts(true);
    try {
      const list = await checkConflicts({
        id: shift.id,
        startsAt: `${shift.startDate}T${shift.startTime}:00`,
        endsAt: `${shift.endDate}T${shift.endTime}:00`,
        employeeIds: shift.assignments.map((employee) => employee.id)
      });
      setConflicts(list);
    } catch {
      // still render card, just skip pill
    } finally {
      setCheckingConflicts(false);
    }
  }
  const conflictText = conflicts && conflicts.length > 0
    ? conflicts
        .map((conflict) => {
          const who = shift.assignments.find((employee) => employee.id === conflict.employeeId)?.name
            || conflict.employeeId
            || "—";
          return `${who}: ${conflict.detail}`;
        })
        .join("\n")
    : null;
  return (
    <button
      className="calendar-shift-card"
      type="button"
      title={conflictText ? `Konflikt: ${conflictText}` : assignmentTitle}
      onMouseEnter={loadConflicts}
      onFocus={loadConflicts}
      onClick={(event) => {
        event.stopPropagation();
        loadConflicts();
        onEdit(shift);
      }}
      aria-label={`${shift.area} am ${formatShortDate(shift.startDate)} bearbeiten`}
    >
      <span className={`slot-marker ${slot.segmentId}`} aria-hidden="true">{marker}</span>
      <span className="assignment-mini-list">
        {shift.assignments.map((employee) => (
          <span className="mini-avatar" key={employee.id} title={employee.name} style={employeeAvatarStyle(employee)}>
            {compactInitials(employee.initials)}
          </span>
        ))}
        {shift.assignments.length === 0 ? <span className="unassigned-mini">unbesetzt</span> : null}
      </span>
      <span className={shift.assignments.length >= shift.requiredStaff ? "mini-coverage complete" : "mini-coverage partial"}>
        {shift.assignments.length}/{shift.requiredStaff}
      </span>
      {customTime ? <small className="shift-time compact">{shift.startTime}-{shift.endTime}</small> : null}
      {conflictText ? (
        <span
          className="shift-conflict-pill"
          title={conflictText}
          aria-label={`Konflikt: ${conflictText}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 6px",
            borderRadius: 999,
            fontSize: "0.72em",
            fontWeight: 600,
            background: "var(--color-warning-soft, #fef3c7)",
            color: "var(--color-warning, #b45309)",
            lineHeight: 1
          }}
        >
          <AlertTriangle size={12} />
          {conflicts && conflicts.length > 1 ? `${conflicts.length} Konflikte` : "Konflikt"}
        </span>
      ) : null}
      {visibleNote ? <p className="note-box compact">{visibleNote}</p> : null}
    </button>
  );
}

function TimeView({
  data,
  activeWeekStart,
  setActiveWeekStart,
  updateEntryStatus,
  updateEntryBreaks,
  setDialog
}: {
  data: BootstrapPayload;
  activeWeekStart: string;
  setActiveWeekStart: (weekStart: string) => void;
  updateEntryStatus: (id: string, status: Status) => void;
  updateEntryBreaks: (id: string, unpaidBreakMinutes: number, paidBreakMinutes?: number) => void;
  setDialog: (dialog: "time") => void;
}) {
  const [activeTab, setActiveTab] = useState<"all" | "requests">("all");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(data.timeEntries[0]?.id);
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [filters, setFilters] = useState({
    location: "Alle",
    area: "Alle",
    status: "Alle",
    type: "Alle"
  });
  const weekEnd = addDays(activeWeekStart, 6);
  const weekEntries = useMemo(
    () => data.timeEntries.filter((entry) => dateInRange(entry.startDate, activeWeekStart, weekEnd)),
    [activeWeekStart, data.timeEntries, weekEnd]
  );

  const filteredEntries = useMemo(() => {
    return weekEntries.filter((entry) => {
      const employee = getEmployee(data.employees, entry.employeeId);
      const entryArea = canonicalWorkAreaLabel(entry.area);
      const text = `${employee.name} ${employee.role} ${entryArea} ${entry.area} ${entry.location} ${entry.type} ${entry.status}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesTab = activeTab === "all" || entry.status === "aenderungsantrag";
      const matchesLocation = filters.location === "Alle" || entry.location === filters.location;
      const matchesArea = filters.area === "Alle" || entryArea === filters.area;
      const matchesStatus = filters.status === "Alle" || entry.status === filters.status;
      const matchesType = filters.type === "Alle" || entry.type === filters.type;
      return matchesSearch && matchesTab && matchesLocation && matchesArea && matchesStatus && matchesType;
    });
  }, [activeTab, data.employees, filters, search, weekEntries]);

  const summary = useMemo(() => {
    const minutes = filteredEntries.reduce((sum, entry) => sum + minutesBetween(entry), 0);
    return {
      hours: formatDuration(minutes),
      requests: weekEntries.filter((entry) => entry.status === "aenderungsantrag").length,
      conflicts: weekEntries.filter((entry) => entry.status === "konflikt").length,
      entries: filteredEntries.length
    };
  }, [filteredEntries, weekEntries]);

  const breakSummary = useMemo(() => {
    const warnings = weekEntries.filter((entry) => breakDelta(entry) < 0);
    return {
      warnings,
      ok: weekEntries.length - warnings.length
    };
  }, [weekEntries]);

  useEffect(() => {
    if (filteredEntries.length === 0) {
      setSelectedId(undefined);
      return;
    }

    if (!filteredEntries.some((entry) => entry.id === selectedId)) {
      setSelectedId(filteredEntries[0].id);
    }
  }, [filteredEntries, selectedId]);

  const selectedEntry = weekEntries.find((entry) => entry.id === selectedId);

  return (
    <section className="module-grid">
      <div className="time-module">
        <Toolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          search={search}
          setSearch={setSearch}
          filtersOpen={filtersOpen}
          setFiltersOpen={setFiltersOpen}
          columnsOpen={columnsOpen}
          setColumnsOpen={setColumnsOpen}
          weekStart={activeWeekStart}
          setActiveWeekStart={setActiveWeekStart}
          visibleCount={Object.values(visibleColumns).filter(Boolean).length}
        />

        {filtersOpen ? (
          <FilterPanel
            filters={filters}
            locations={data.locations}
            workAreas={data.workAreas}
            setFilters={setFilters}
          />
        ) : null}

        {columnsOpen ? (
          <ColumnPanel visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />
        ) : null}

        <TimeTable
          entries={filteredEntries}
          employees={data.employees}
          visibleColumns={visibleColumns}
          selectedId={selectedEntry?.id}
          onSelect={setSelectedId}
        />
      </div>

      <aside className="right-rail">
        <Panel title="Woche" icon={BarChart3}>
          <div className="summary-list">
            <Metric label="Stunden" value={summary.hours} />
            <Metric label="Einträge" value={String(summary.entries)} />
            <Metric label="Anträge" value={String(summary.requests)} tone="amber" />
            <Metric label="Konflikte" value={String(summary.conflicts)} tone="rose" />
          </div>
        </Panel>
        <Panel title="Pausen" icon={PauseCircle}>
          <div className="summary-list compact">
            <Metric label="Ok" value={String(breakSummary.ok)} tone="teal" />
            <Metric label="Warnungen" value={String(breakSummary.warnings.length)} tone={breakSummary.warnings.length ? "amber" : "teal"} />
          </div>
          <div className="stack-list mini">
            {breakSummary.warnings.slice(0, 3).map((entry) => {
              const employee = getEmployee(data.employees, entry.employeeId);
              return (
                <div className="list-row compact-row" key={entry.id}>
                  <span>
                    <strong>{employee.name}</strong>
                    <small>{requiredBreakMinutes(entry) - entry.unpaidBreakMinutes - entry.paidBreakMinutes} Min. fehlen</small>
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
        {selectedEntry ? (
          <EntryDetails
            entry={selectedEntry}
            employees={data.employees}
            onMarkConflict={() => updateEntryStatus(selectedEntry.id, "konflikt")}
            onSetBreak={(minutes) => updateEntryBreaks(selectedEntry.id, minutes)}
          />
        ) : (
          <Panel title="Detail" icon={Clock3}>
            <div className="empty-state compact">Keine Auswahl</div>
          </Panel>
        )}
        <button className="primary-button full-width" onClick={() => setDialog("time")}>
          <Plus size={18} />
          Arbeitszeit hinzufügen
        </button>
      </aside>
    </section>
  );
}

function Toolbar({
  activeTab,
  setActiveTab,
  search,
  setSearch,
  filtersOpen,
  setFiltersOpen,
  columnsOpen,
  setColumnsOpen,
  weekStart,
  setActiveWeekStart,
  visibleCount
}: {
  activeTab: "all" | "requests";
  setActiveTab: (tab: "all" | "requests") => void;
  search: string;
  setSearch: (value: string) => void;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  columnsOpen: boolean;
  setColumnsOpen: (open: boolean) => void;
  weekStart: string;
  setActiveWeekStart: (weekStart: string) => void;
  visibleCount: number;
}) {
  return (
    <div className="toolbar">
      <div className="tab-row">
        <button
          className={activeTab === "all" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("all")}
        >
          Arbeitszeiten der Woche
        </button>
        <button
          className={activeTab === "requests" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("requests")}
        >
          Offene Änderungsanträge
        </button>
      </div>

      <div className="toolbar-row">
        <WeekNavigator weekStart={weekStart} onWeekChange={setActiveWeekStart} />

        <div className="search-box">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Suche" />
        </div>

        <button className={filtersOpen ? "count-button active" : "count-button"} onClick={() => setFiltersOpen(!filtersOpen)}>
          <Filter size={17} />
          4
        </button>
        <button className={columnsOpen ? "count-button active" : "count-button"} onClick={() => setColumnsOpen(!columnsOpen)}>
          <Columns3 size={17} />
          {visibleCount}
        </button>
      </div>
    </div>
  );
}

function FilterPanel({
  filters,
  locations,
  workAreas,
  setFilters
}: {
  filters: { location: string; area: string; status: string; type: string };
  locations: string[];
  workAreas: string[];
  setFilters: (filters: { location: string; area: string; status: string; type: string }) => void;
}) {
  const workAreaOptions = ["Alle", ...uniqueLabels(workAreas.map(canonicalWorkAreaLabel))];

  return (
    <div className="filter-panel">
      <SelectChip
        label="Standort"
        value={filters.location}
        options={["Alle", ...locations]}
        onChange={(location) => setFilters({ ...filters, location })}
      />
      <SelectChip
        label="Arbeitsbereich"
        value={filters.area}
        options={workAreaOptions}
        onChange={(area) => setFilters({ ...filters, area })}
      />
      <SelectChip
        label="Status"
        value={filters.status}
        options={["Alle", "freigegeben", "aenderungsantrag", "konflikt", "entwurf"]}
        format={(value) => (value === "Alle" || !isStatus(value) ? value : statusLabels[value])}
        onChange={(status) => setFilters({ ...filters, status })}
      />
      <SelectChip
        label="Typ"
        value={filters.type}
        options={["Alle", "Arbeitszeit", "Schichtunabhaengig", "Dienstgang"]}
        format={(value) => (value === "Alle" ? value : typeLabels[value as EntryType])}
        onChange={(type) => setFilters({ ...filters, type })}
      />
    </div>
  );
}

function SelectChip({
  label,
  value,
  options,
  onChange,
  format = (option) => option
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  format?: (option: string) => string;
}) {
  return (
    <label className="select-chip">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option value={option} key={option}>
            {format(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ColumnPanel({
  visibleColumns,
  setVisibleColumns
}: {
  visibleColumns: Record<ColumnKey, boolean>;
  setVisibleColumns: (columns: Record<ColumnKey, boolean>) => void;
}) {
  return (
    <div className="column-panel">
      {(Object.keys(columnLabels) as ColumnKey[]).map((key) => (
        <label className="column-toggle" key={key} title={columnLabels[key]}>
          <input
            type="checkbox"
            checked={visibleColumns[key]}
            onChange={(event) => setVisibleColumns({ ...visibleColumns, [key]: event.target.checked })}
          />
          <span className="toggle-label">{columnLabels[key]}</span>
        </label>
      ))}
    </div>
  );
}

function TimeTable({
  entries,
  employees,
  visibleColumns,
  selectedId,
  onSelect
}: {
  entries: TimeEntry[];
  employees: Employee[];
  visibleColumns: Record<ColumnKey, boolean>;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th className="select-col" />
            {visibleColumns.employee ? <th>{columnLabels.employee}</th> : null}
            {visibleColumns.start ? <th>{columnLabels.start}</th> : null}
            {visibleColumns.end ? <th>{columnLabels.end}</th> : null}
            {visibleColumns.area ? <th>{columnLabels.area}</th> : null}
            {visibleColumns.location ? <th>{columnLabels.location}</th> : null}
            {visibleColumns.status ? <th>{columnLabels.status}</th> : null}
            {visibleColumns.type ? <th>{columnLabels.type}</th> : null}
            {visibleColumns.time ? <th className="numeric">{columnLabels.time}</th> : null}
            {visibleColumns.paidBreak ? <th className="numeric">{columnLabels.paidBreak}</th> : null}
            {visibleColumns.unpaidBreak ? <th className="numeric">{columnLabels.unpaidBreak}</th> : null}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const employee = getEmployee(employees, entry.employeeId);
            const selected = selectedId === entry.id;
            return (
              <tr className={selected ? "selected-row" : ""} key={entry.id} onClick={() => onSelect(entry.id)}>
                <td className="select-col">
                  <span className="row-radio" aria-hidden="true" />
                </td>
                {visibleColumns.employee ? (
                  <td>
                    <div className="employee-cell">
                      <span className="avatar" style={employeeAvatarStyle(employee)}>{compactInitials(employee.initials)}</span>
                      <div>
                        <strong>{employee.name}</strong>
                        <span>{employee.role}</span>
                      </div>
                    </div>
                  </td>
                ) : null}
                {visibleColumns.start ? (
                  <td>
                    {formatDate(entry.startDate)}
                    <span className="muted-time">{entry.startTime}</span>
                  </td>
                ) : null}
                {visibleColumns.end ? (
                  <td>
                    {formatDate(entry.endDate)}
                    <span className="muted-time">{entry.endTime}</span>
                  </td>
                ) : null}
                {visibleColumns.area ? <td>{canonicalWorkAreaLabel(entry.area)}</td> : null}
                {visibleColumns.location ? <td>{entry.location}</td> : null}
                {visibleColumns.status ? (
                  <td>
                    <StatusBadge status={entry.status} />
                  </td>
                ) : null}
                {visibleColumns.type ? <td>{typeLabels[entry.type]}</td> : null}
                {visibleColumns.time ? <td className="numeric">{formatDuration(minutesBetween(entry))}</td> : null}
                {visibleColumns.paidBreak ? <td className="numeric">{formatDuration(entry.paidBreakMinutes)}</td> : null}
                {visibleColumns.unpaidBreak ? <td className="numeric">{formatDuration(entry.unpaidBreakMinutes)}</td> : null}
              </tr>
            );
          })}
        </tbody>
      </table>
      {entries.length === 0 ? <div className="empty-state">Keine Einträge</div> : null}
    </div>
  );
}

function EntryDetails({
  entry,
  employees,
  onMarkConflict,
  onSetBreak
}: {
  entry: TimeEntry;
  employees: Employee[];
  onMarkConflict: () => void;
  onSetBreak: (minutes: number) => void;
}) {
  const employee = getEmployee(employees, entry.employeeId);
  const requiredBreak = requiredBreakMinutes(entry);
  const actualBreak = entry.unpaidBreakMinutes + entry.paidBreakMinutes;
  const checks = [
    { icon: ShieldCheck, label: "Ruhezeit", value: entry.status === "konflikt" ? "prüfen" : "ok" },
    { icon: TimerReset, label: "Pausenregel", value: actualBreak >= requiredBreak ? "ok" : "prüfen" },
    { icon: Smartphone, label: "Erfassung", value: entry.type === "Arbeitszeit" ? "Terminal" : "Mobil" }
  ];

  return (
    <Panel title="Detail" icon={Clock3} badge={<StatusBadge status={entry.status} />}>
      <div className="detail-person">
        <span className="avatar large" style={employeeAvatarStyle(employee)}>{compactInitials(employee.initials)}</span>
        <div>
          <strong>{employee.name}</strong>
          <span>{canonicalWorkAreaLabel(entry.area)}</span>
        </div>
      </div>
      <dl className="detail-list">
        <div>
          <dt>Start</dt>
          <dd>
            {formatDate(entry.startDate)} · {entry.startTime}
          </dd>
        </div>
        <div>
          <dt>Ende</dt>
          <dd>
            {formatDate(entry.endDate)} · {entry.endTime}
          </dd>
        </div>
        <div>
          <dt>Zeit</dt>
          <dd>{formatDuration(minutesBetween(entry))}</dd>
        </div>
        <div>
          <dt>Standort</dt>
          <dd>{entry.location}</dd>
        </div>
      </dl>

      <div className="check-grid">
        {checks.map((check) => {
          const Icon = check.icon;
          return (
            <div className="check-item" key={check.label}>
              <Icon size={16} />
              <span>{check.label}</span>
              <strong>{check.value}</strong>
            </div>
          );
        })}
      </div>

      {entry.note ? <p className="note-box">{entry.note}</p> : null}

      <div className="break-editor">
        <span>
          Pause: {actualBreak} Min. · Soll: {requiredBreak} Min.
        </span>
        <div className="split-actions">
          <button className="secondary-button" onClick={() => onSetBreak(0)}>
            0 Min.
          </button>
          <button className="secondary-button" onClick={() => onSetBreak(30)}>
            30 Min.
          </button>
          <button className="secondary-button" onClick={() => onSetBreak(60)}>
            60 Min.
          </button>
        </div>
      </div>

      <div className="audit-list">
        {entry.audit.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>

      <div className="split-actions">
        <button className="secondary-button" onClick={onMarkConflict}>
          <AlertTriangle size={17} />
          Prüfen
        </button>
      </div>
    </Panel>
  );
}

type AbsenceQuotaRow = {
  employeeId: string;
  employeeName: string;
  year: number;
  allocated: number;
  used: number;
  pending: number;
  remaining: number;
};

function AbsenceView({
  activeWeekStart,
  data,
  updateStatus,
  request
}: {
  activeWeekStart: string;
  data: BootstrapPayload;
  updateStatus: (id: string, status: AbsenceStatus) => void;
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
}) {
  // T-006b Resturlaub-Kontingent: aus /api/absences/quota?year=YYYY
  const currentYear = new Date().getFullYear();
  const [quotaYear, setQuotaYear] = useState(currentYear);
  const [quotaRows, setQuotaRows] = useState<AbsenceQuotaRow[]>([]);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setQuotaLoading(true);
    setQuotaError(null);
    request<{ ok: boolean; quotas: AbsenceQuotaRow[] }>(`/api/absences/quota?year=${quotaYear}`)
      .then((res) => {
        if (cancelled) return;
        setQuotaRows(Array.isArray(res?.quotas) ? res.quotas : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setQuotaError(err instanceof Error ? err.message : "Quota-Abruf fehlgeschlagen");
        setQuotaRows([]);
      })
      .finally(() => {
        if (!cancelled) setQuotaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [quotaYear, request]);

  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(activeWeekStart));
  const [selectedDay, setSelectedDay] = useState(activeWeekStart);
  const monthStart = calendarMonth;
  const monthEnd = endOfMonth(calendarMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarDays = Array.from({ length: 42 }, (_, index) => addDays(calendarStart, index));
  const sortedAbsences = useMemo(
    () =>
      [...data.absences].sort(
        (left, right) =>
          left.startsOn.localeCompare(right.startsOn) ||
          left.endsOn.localeCompare(right.endsOn) ||
          left.employeeName.localeCompare(right.employeeName)
      ),
    [data.absences]
  );
  const monthAbsences = sortedAbsences.filter(
    (absence) => absence.startsOn <= monthEnd && absence.endsOn >= monthStart
  );
  const selectedAbsences = sortedAbsences.filter(
    (absence) => absence.startsOn <= selectedDay && absence.endsOn >= selectedDay
  );
  const openAbsences = data.absences.filter((absence) => absence.status === "offen");
  const approvedMonthAbsences = monthAbsences.filter((absence) => absence.status === "genehmigt");

  useEffect(() => {
    setCalendarMonth(startOfMonth(activeWeekStart));
    setSelectedDay(activeWeekStart);
  }, [activeWeekStart]);

  function changeCalendarMonth(monthDelta: number) {
    const nextMonth = addMonths(calendarMonth, monthDelta);
    setCalendarMonth(nextMonth);
    setSelectedDay(nextMonth);
  }

  function absencesForDay(day: string) {
    return monthAbsences.filter((absence) => absence.startsOn <= day && absence.endsOn >= day);
  }

  return (
    <div className="absence-layout">
      <section className="wide-panel absence-quota-panel">
        <div className="section-heading">
          <div>
            <h2>Resturlaub-Kontingent</h2>
            <p className="section-eyebrow">
              {quotaLoading ? "Lädt …" : quotaError ? `Fehler: ${quotaError}` : `${quotaRows.length} Mitarbeitende · Jahr ${quotaYear}`}
            </p>
          </div>
          <div className="quota-year-switch">
            <button type="button" onClick={() => setQuotaYear((y) => y - 1)} aria-label="Vorheriges Jahr">‹</button>
            <span>{quotaYear}</span>
            <button type="button" onClick={() => setQuotaYear((y) => y + 1)} aria-label="Folgejahr">›</button>
          </div>
        </div>
        {quotaError ? null : (
          <div className="quota-table-wrap" style={{ overflowX: "auto" }}>
            <table className="quota-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92em" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Mitarbeitender</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Jahres-Soll</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Verbraucht</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Offen</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Rest</th>
                </tr>
              </thead>
              <tbody>
                {quotaRows.map((q) => (
                  <tr key={q.employeeId} style={{ borderTop: "1px solid var(--color-line, #e5e7eb)" }}>
                    <td style={{ padding: "6px 8px" }}>{q.employeeName}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{q.allocated} d</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{q.used} d</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{q.pending} d</td>
                    <td style={{
                      padding: "6px 8px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: q.remaining <= 0 ? "var(--color-danger, #b91c1c)" : q.remaining < 5 ? "var(--color-warning, #b45309)" : "inherit"
                    }}>{q.remaining} d</td>
                  </tr>
                ))}
                {quotaRows.length === 0 && !quotaLoading ? (
                  <tr><td colSpan={5} style={{ padding: "12px 8px", textAlign: "center", color: "var(--color-muted, #6b7280)" }}>Keine Daten für {quotaYear}</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="wide-panel absence-calendar-panel">
        <div className="section-heading">
          <div>
            <h2>Urlaubskalender</h2>
            <p>{approvedMonthAbsences.length} genehmigt · {openAbsences.length} offen</p>
          </div>
          <div className="mini-month-switcher" aria-label="Monat wechseln">
            <button className="icon-button" type="button" aria-label="Vorheriger Monat" onClick={() => changeCalendarMonth(-1)}>
              <ChevronLeft size={18} />
            </button>
            <button
              className="week-pill"
              type="button"
              onClick={() => {
                const today = localTodayIso();
                setCalendarMonth(startOfMonth(today));
                setSelectedDay(today);
              }}
            >
              <span>{formatMonth(calendarMonth)}</span>
            </button>
            <button className="icon-button" type="button" aria-label="Naechster Monat" onClick={() => changeCalendarMonth(1)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="absence-calendar-shell">
          <div className="absence-calendar-weekdays" aria-hidden="true">
            {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="absence-month-grid">
            {calendarDays.map((day) => {
              const dayAbsences = absencesForDay(day);
              const isOutsideMonth = day < monthStart || day > monthEnd;
              const isSelected = day === selectedDay;

              return (
                <button
                  className={`absence-day-cell${isOutsideMonth ? " outside-month" : ""}${isSelected ? " selected" : ""}${dayAbsences.length ? " has-absence" : ""}`}
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                >
                  <span className="absence-day-number">{formatDayNumber(day)}</span>
                  <span className="absence-day-items">
                    {dayAbsences.slice(0, 2).map((absence) => {
                      const employee = getEmployee(data.employees, absence.employeeId);
                      return (
                        <span className={`absence-chip ${absence.status}`} key={absence.id}>
                          {compactInitials(employee.initials)} · {absence.type}
                        </span>
                      );
                    })}
                    {dayAbsences.length > 2 ? <span className="absence-chip more">+{dayAbsences.length - 2}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="absence-day-detail">
            <div>
              <span>Auswahl</span>
              <strong>{formatDate(selectedDay)}</strong>
            </div>
            <div className="stack-list mini">
              {selectedAbsences.map((absence) => (
                <div className="absence-detail-row" key={absence.id}>
                  <div>
                    <strong>{absence.employeeName}</strong>
                    <small>{absence.type} · {formatShortDate(absence.startsOn)}-{formatShortDate(absence.endsOn)}</small>
                  </div>
                  <AbsenceBadge status={absence.status} />
                </div>
              ))}
              {selectedAbsences.length === 0 ? <span className="decision-note">Keine Abwesenheit</span> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="wide-panel">
        <div className="section-heading">
          <div>
            <h2>Abwesenheiten</h2>
            <p>{openAbsences.length} offen</p>
          </div>
        </div>
        <div className="table-shell">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Mitarbeiter</th>
                <th>Typ</th>
                <th>Beginn</th>
                <th>Ende</th>
                <th>Status</th>
                <th>Notiz</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sortedAbsences.map((absence) => (
                <tr key={absence.id}>
                  <td>{absence.employeeName}</td>
                  <td>{absence.type}</td>
                  <td>{formatDate(absence.startsOn)}</td>
                  <td>{formatDate(absence.endsOn)}</td>
                  <td>
                    <AbsenceBadge status={absence.status} />
                  </td>
                  <td>{absence.note}</td>
                  <td className="row-actions absence-actions">
                    {absence.status === "offen" ? (
                      <>
                        <button className="decision-button reject" onClick={() => updateStatus(absence.id, "abgelehnt")}>
                          <X size={16} />
                          Ablehnen
                        </button>
                        <button className="decision-button approve" onClick={() => updateStatus(absence.id, "genehmigt")}>
                          <Check size={16} />
                          Genehmigen
                        </button>
                      </>
                    ) : (
                      <span className="decision-note">Entschieden</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.absences.length === 0 ? <div className="empty-state">Keine Abwesenheiten</div> : null}
        </div>
      </section>
    </div>
  );
}

function ImportsView({
  data,
  runDemoImport,
  runDeltaImport,
  busy,
  setView,
  setActiveWeekStart
}: {
  data: BootstrapPayload;
  runDemoImport: () => void;
  runDeltaImport: () => void;
  busy: boolean;
  setView: (view: ViewKey) => void;
  setActiveWeekStart: (weekStart: string) => void;
}) {
  const report = data.migrationReport;
  const latestBatch = report.latestBatch ?? data.sync.lastBatch;
  const latestBatchTone = latestBatch?.errorCount ? "rose" : latestBatch?.conflictCount ? "amber" : "teal";
  const latestBatchLabel = latestBatch
    ? `${latestBatch.mode === "delta_snapshot" ? "Delta" : "Snapshot"} · ${formatDateTime(latestBatch.completedAt)}`
    : "Noch kein Import-Batch";
  const jumpToMigrationWeek = (week: MigrationWeekCoverage | { weekStart: string; type?: string }) => {
    setActiveWeekStart(week.weekStart);
    setView(viewForMigrationWeek(week));
  };

  return (
    <div className="import-layout">
      <section className="wide-panel">
        <div className="section-heading">
          <div>
            <h2>Sync-Status</h2>
            <p>Delta-Abgleich ab gespeichertem Migrationsstand</p>
          </div>
          <div className="inline-actions">
            <button className="primary-button" onClick={runDeltaImport} disabled={busy}>
              <RefreshCw size={17} />
              Delta-Sync
            </button>
            <button className="secondary-button" onClick={runDemoImport} disabled={busy}>
              <RefreshCw size={17} />
              Demo-Sync
            </button>
          </div>
        </div>
        <div className="summary-list four">
          <Metric label="Batches" value={String(data.sync.stats.batches)} />
          <Metric label="Importdaten" value={String(data.sync.stats.sourceRecords)} tone="teal" />
          <Metric label="Konflikte" value={String(data.sync.stats.openConflicts)} tone="rose" />
          <Metric label="Letzter Lauf" value={formatDateTime(data.sync.lastBatch?.completedAt ?? null)} />
        </div>
      </section>

      <section className="wide-panel">
        <div className="section-heading">
          <div>
            <h2>Migrationsbericht</h2>
            <p>
              Schichtplan {formatPeriod(report.period.shifts.start, report.period.shifts.end)} · Arbeitszeiten {formatPeriod(report.period.timeEntries.start, report.period.timeEntries.end)}
            </p>
          </div>
          <Badge tone={latestBatchTone}>{latestBatch?.status ?? "kein Lauf"}</Badge>
        </div>
        <div className="summary-list four">
          <Metric label="Mitarbeitende" value={String(report.entityCounts.employees)} tone="teal" />
          <Metric label="Schichten" value={String(report.entityCounts.shifts)} tone="blue" onClick={() => setView("plan")} />
          <Metric label="Arbeitszeiten" value={String(report.entityCounts.timeEntries)} tone="teal" onClick={() => setView("time")} />
          <Metric label="Plan/Ist" value={`${report.quality.coveragePercent}%`} tone={report.quality.coveragePercent >= 90 ? "teal" : "amber"} />
        </div>
        <div className="migration-status-grid">
          <div className="migration-check">
            <span>Letzter Snapshot</span>
            <strong>{latestBatch ? formatDateTime(latestBatch.completedAt) : "offen"}</strong>
            <small>{latestBatchLabel}</small>
          </div>
          <div className="migration-check">
            <span>Importfehler</span>
            <strong>{String(latestBatch?.errorCount ?? 0)}</strong>
            <small>{latestBatch?.recordCount ?? 0} Datensätze im letzten Lauf</small>
          </div>
          <div className="migration-check">
            <span>Datenlücken</span>
            <strong>{String(report.sourceGaps.length)}</strong>
            <small>{report.sourceGaps.length ? "Bitte gezielt prüfen" : "Keine kritische Lücke erkannt"}</small>
          </div>
          <div className="migration-check">
            <span>Offene Konflikte</span>
            <strong>{String(report.quality.openConflicts)}</strong>
            <small>{report.quality.openConflicts ? "Entscheidung nötig" : "Kein Sync-Konflikt offen"}</small>
          </div>
        </div>
      </section>

      <div className="migration-report-grid">
        <section className="wide-panel">
          <div className="section-heading">
            <div>
              <h2>Delta letzter Lauf</h2>
              <p>{latestBatchLabel}</p>
            </div>
            <Badge tone={latestBatchTone}>{latestBatch?.errorCount ? "Fehler" : latestBatch?.conflictCount ? "Konflikte" : "stabil"}</Badge>
          </div>
          <div className="summary-list four">
            <Metric label="Neu" value={String(latestBatch?.insertedCount ?? 0)} tone={latestBatch?.insertedCount ? "amber" : "teal"} />
            <Metric label="Aktualisiert" value={String(latestBatch?.updatedCount ?? 0)} tone={latestBatch?.updatedCount ? "amber" : "teal"} />
            <Metric label="Unverändert" value={String(latestBatch?.unchangedCount ?? 0)} tone="teal" />
            <Metric label="Fehler" value={String(latestBatch?.errorCount ?? 0)} tone={latestBatch?.errorCount ? "rose" : "teal"} />
          </div>
          <div className="stack-list mini">
            {report.latestBatchRecords.map((row) => (
              <div className="list-row compact-row" key={row.entity}>
                <span>
                  <strong>{sourceEntityLabel(row.entity)}</strong>
                  <small>im letzten Snapshot-Batch enthalten</small>
                </span>
                <Badge tone="teal">{row.records}</Badge>
              </div>
            ))}
            {report.latestBatchRecords.length === 0 ? <div className="empty-state compact">Noch keine Delta-Daten</div> : null}
          </div>
        </section>

        <section className="wide-panel">
          <div className="section-heading">
            <div>
              <h2>Datenlücken</h2>
              <p>{report.sourceGaps.length} Wochen brauchen Aufmerksamkeit</p>
            </div>
          </div>
          <div className="stack-list">
            {report.sourceGaps.map((gap) => (
              <button
                className="list-row interactive"
                key={`${gap.week}-${gap.type}`}
                type="button"
                onClick={() => jumpToMigrationWeek(gap)}
              >
                <span>
                  <strong>{gap.week} · {gap.title}</strong>
                  <small>{formatShortDate(gap.weekStart)} - {formatShortDate(gap.weekEnd)} · {gap.detail}</small>
                </span>
                <Badge tone={gap.tone}>{gap.coveragePercent}%</Badge>
              </button>
            ))}
            {report.sourceGaps.length === 0 ? <div className="empty-state compact">Keine kritischen Datenlücken erkannt</div> : null}
          </div>
        </section>

        <section className="wide-panel">
          <div className="section-heading">
            <div>
              <h2>Importdaten</h2>
              <p>{report.entityCounts.sourceRecords} aktive Records mit Hash und Batch-Bezug</p>
            </div>
          </div>
          <div className="stack-list">
            {report.sourceRecords.map((row) => (
              <div className="list-row compact-row" key={row.entity}>
                <span>
                  <strong>{sourceEntityLabel(row.entity)}</strong>
                  <small>{row.active} aktiv · {row.removed} entfernt markiert</small>
                </span>
                <Badge tone="teal">{row.total}</Badge>
              </div>
            ))}
            {report.sourceRecords.length === 0 ? <div className="empty-state compact">Noch keine Importdaten</div> : null}
          </div>
        </section>
      </div>

      <section className="wide-panel">
        <div className="section-heading">
          <div>
            <h2>Wochenabdeckung</h2>
            <p>Plan, Ist-Zeit und Status je Kalenderwoche</p>
          </div>
        </div>
        <div className="table-shell">
          <table className="compact-table week-coverage-table">
            <thead>
              <tr>
                <th>Woche</th>
                <th>Zeitraum</th>
                <th className="numeric">Schichten</th>
                <th className="numeric">Plan</th>
                <th className="numeric">Ist</th>
                <th className="numeric">Abdeckung</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {report.weekCoverage.map((week) => (
                <tr key={week.weekStart}>
                  <td>{week.week}</td>
                  <td>{formatShortDate(week.weekStart)} - {formatShortDate(week.weekEnd)}</td>
                  <td className="numeric">{week.shifts}</td>
                  <td className="numeric">{week.assignments}</td>
                  <td className="numeric">{week.timeEntries}</td>
                  <td className="numeric">
                    <span className="coverage-value">{week.coveragePercent}%</span>
                    <span className="coverage-bar" aria-hidden="true">
                      <span style={{ width: `${Math.min(100, Math.max(0, week.coveragePercent))}%` }} />
                    </span>
                  </td>
                  <td>
                    <Badge tone={week.tone}>{week.statusLabel}</Badge>
                  </td>
                  <td className="row-actions">
                    <button className="secondary-button compact-action" type="button" onClick={() => jumpToMigrationWeek(week)}>
                      Öffnen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {report.weekCoverage.length === 0 ? <div className="empty-state">Noch keine Wochenabdeckung</div> : null}
        </div>
      </section>

      <section className="wide-panel">
        <div className="section-heading">
          <div>
            <h2>Import-Batches</h2>
            <p>{data.importBatches.length} Läufe</p>
          </div>
        </div>
        <div className="table-shell">
          <table className="compact-table">
            <thead>
              <tr>
                <th>Datenstand</th>
                <th>Status</th>
                <th>Zeitraum</th>
                <th className="numeric">Records</th>
                <th className="numeric">Neu</th>
                <th className="numeric">Aktualisiert</th>
                <th className="numeric">Unverändert</th>
                <th className="numeric">Konflikte</th>
                <th>Abschluss</th>
              </tr>
            </thead>
            <tbody>
              {data.importBatches.map((batch) => (
                <tr key={batch.id}>
                  <td>{batch.mode === "delta_snapshot" ? "Delta" : "Snapshot"}</td>
                  <td>{batch.status}</td>
                  <td>
                    {formatShortDate(batch.periodStart)} - {formatShortDate(batch.periodEnd)}
                  </td>
                  <td className="numeric">{batch.recordCount}</td>
                  <td className="numeric">{batch.insertedCount}</td>
                  <td className="numeric">{batch.updatedCount}</td>
                  <td className="numeric">{batch.unchangedCount}</td>
                  <td className="numeric">{batch.conflictCount}</td>
                  <td>{formatDateTime(batch.completedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="wide-panel">
        <div className="section-heading">
          <div>
            <h2>Konflikte</h2>
            <p>{data.syncConflicts.filter((conflict) => conflict.status === "open").length} offen</p>
          </div>
        </div>
        <div className="stack-list">
          {data.syncConflicts.map((conflict) => (
            <div className="list-row" key={conflict.id}>
              <span>
                <strong>{conflict.localEntity} · {conflict.fieldName}</strong>
                <small>
                  {sourceEntityLabel(conflict.sourceEntity)} · {formatDateTime(conflict.detectedAt)}
                </small>
              </span>
              <Badge tone={conflict.status === "open" ? "rose" : "teal"}>{conflict.status}</Badge>
            </div>
          ))}
          {data.syncConflicts.length === 0 ? <div className="empty-state compact">Keine Konflikte</div> : null}
        </div>
      </section>
    </div>
  );
}

function SettingsView({ data, apiMessage }: { data: BootstrapPayload; apiMessage: string }) {
  return (
    <div className="settings-grid">
      <Panel title="Rollen" icon={ShieldCheck}>
        <div className="stack-list">
          {data.auth.roles.map((role) => (
            <div className="list-row" key={role.id}>
              <span>
                <strong>{role.name}</strong>
                <small>{role.description}</small>
              </span>
              <Badge>{String(role.userCount)}</Badge>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Benutzer" icon={Users}>
        <div className="stack-list">
          {data.auth.users.map((user) => (
            <div className="list-row" key={user.id}>
              <span>
                <strong>{user.displayName}</strong>
                <small>{user.roles.join(", ") || user.authProvider}</small>
              </span>
              <Badge tone={user.isActive ? "teal" : "muted"}>{user.isActive ? "aktiv" : "pausiert"}</Badge>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Schutzmodus" icon={Database}>
        <div className="stack-list">
          <div className="list-row">
            <span>
              <strong>Import-Abgleich</strong>
              <small>read-only</small>
            </span>
            <Badge tone="teal">aktiv</Badge>
          </div>
          <div className="list-row">
            <span>
              <strong>Private Artefakte</strong>
              <small>private/</small>
            </span>
            <Badge tone="teal">gitignored</Badge>
          </div>
          <div className="list-row">
            <span>
              <strong>API</strong>
              <small>{apiMessage}</small>
            </span>
            <Badge tone="blue">lokal</Badge>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  badge,
  children
}: {
  title: string;
  icon: typeof Home;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rail-panel">
      <div className="panel-heading">
        <span>
          <Icon size={18} />
          {title}
        </span>
        {badge}
      </div>
      {children}
    </section>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`kpi ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value, tone, onClick }: { label: string; value: string; tone?: string; onClick?: () => void }) {
  const className = `metric ${tone ?? ""}${onClick ? " interactive" : ""}`;
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
    </>
  );

  if (onClick) {
    return (
      <button className={className} type="button" onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}

function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return <span className={`status-badge ${tone ?? "entwurf"}`}>{children}</span>;
}

function StatusBadge({ status }: { status: Status }) {
  return <span className={`status-badge ${status}`}>{statusLabels[status]}</span>;
}

function AbsenceBadge({ status }: { status: AbsenceStatus }) {
  const tone = status === "genehmigt" ? "freigegeben" : status === "abgelehnt" ? "konflikt" : "aenderungsantrag";
  return <span className={`status-badge ${tone}`}>{absenceLabels[status]}</span>;
}

function AddTimeDialog({
  employees,
  workAreas,
  locations,
  initialDate,
  onClose,
  onAdd
}: {
  employees: Employee[];
  workAreas: string[];
  locations: string[];
  initialDate?: string;
  onClose: () => void;
  onAdd: (entry: TimeEntry) => void;
}) {
  const areaOptions = uniqueLabels(workAreas.map(canonicalWorkAreaLabel));
  const [form, setForm] = useState({
    employeeId: employees[0]?.id ?? fallbackEmployees[0].id,
    area: areaOptions[0] ?? canonicalWorkAreaLabel(fallbackWorkAreas[0]),
    location: locations[0] ?? fallbackLocations[0],
    startDate: initialDate ?? "2026-05-24",
    startTime: "10:00",
    endDate: initialDate ?? "2026-05-24",
    endTime: "11:00",
    paidBreakMinutes: "0",
    unpaidBreakMinutes: "0",
    type: "Arbeitszeit" as EntryType,
    note: ""
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    onAdd({
      id: `time-${Date.now()}`,
      employeeId: form.employeeId,
      startDate: form.startDate,
      startTime: form.startTime,
      endDate: form.endDate,
      endTime: form.endTime,
      area: canonicalWorkAreaLabel(form.area),
      location: form.location,
      status: "entwurf",
      type: form.type,
      paidBreakMinutes: Number(form.paidBreakMinutes),
      unpaidBreakMinutes: Number(form.unpaidBreakMinutes),
      note: form.note,
      audit: ["Manuell angelegt", "Arbeitszeit erfasst"]
    });
  }

  return (
    <Dialog title="Arbeitszeit hinzufügen" eyebrow="Neue Arbeitszeit" onClose={onClose} onSubmit={submit}>
      <div className="form-grid">
        <Field label="Mitarbeiter">
          <select value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })}>
            {employees.map((employee) => (
              <option value={employee.id} key={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Arbeitsbereich">
          <select value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })}>
            {areaOptions.map((area) => (
              <option value={area} key={area}>
                {area}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Standort">
          <select value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })}>
            {locations.map((location) => (
              <option value={location} key={location}>
                {location}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Typ">
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as EntryType })}>
            {(Object.keys(typeLabels) as EntryType[]).map((type) => (
              <option value={type} key={type}>
                {typeLabels[type]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Startdatum">
          <input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
        </Field>
        <Field label="Startzeit">
          <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} />
        </Field>
        <Field label="Enddatum">
          <input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
        </Field>
        <Field label="Endzeit">
          <input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} />
        </Field>
        <Field label="Pause bezahlt">
          <input type="number" min="0" step="5" value={form.paidBreakMinutes} onChange={(event) => setForm({ ...form, paidBreakMinutes: event.target.value })} />
        </Field>
        <Field label="Pause unbezahlt">
          <input type="number" min="0" step="5" value={form.unpaidBreakMinutes} onChange={(event) => setForm({ ...form, unpaidBreakMinutes: event.target.value })} />
        </Field>
      </div>
      <label className="field full-field">
        <span>Notiz</span>
        <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Keine Notiz" />
      </label>
      <DialogActions onClose={onClose} submitLabel="Arbeitszeit hinzufügen" />
    </Dialog>
  );
}

function AddEmployeeDialog({
  onClose,
  onAdd
}: {
  onClose: () => void;
  onAdd: (employee: { firstName: string; lastName: string; name: string; role: string; initials: string }) => void;
}) {
  const [form, setForm] = useState({ firstName: "", lastName: "", role: "MFA", initials: "" });
  const functionOptions = ["MFA", "Minijob", "Teilzeit", "Student"];

  function submit(event: FormEvent) {
    event.preventDefault();
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const name = `${firstName} ${lastName}`.trim();
    const initials =
      form.initials.trim() ||
      [firstName, lastName]
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    onAdd({ ...form, firstName, lastName, name, initials });
  }

  return (
    <Dialog title="Mitarbeiter hinzufügen" eyebrow="Stammdaten" onClose={onClose} onSubmit={submit}>
      <div className="form-grid">
        <Field label="Vorname">
          <input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required />
        </Field>
        <Field label="Nachname">
          <input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} required />
        </Field>
        <Field label="Funktion">
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} required>
            {functionOptions.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Initialen">
          <input value={form.initials} onChange={(event) => setForm({ ...form, initials: event.target.value })} maxLength={2} />
        </Field>
      </div>
      <DialogActions onClose={onClose} submitLabel="Mitarbeiter hinzufügen" />
    </Dialog>
  );
}

function AddShiftDialog({
  employees,
  workAreas,
  locations,
  initial,
  mode = "create",
  onClose,
  onDelete,
  onAdd
}: {
  employees: Employee[];
  workAreas: string[];
  locations: string[];
  initial?: ShiftDialogDefaults;
  mode?: "create" | "edit";
  onClose: () => void;
  onDelete?: () => void;
  onAdd: (shift: ShiftCreatePayload) => void;
}) {
  const defaultArea = canonicalWorkAreaLabel(initial?.area ?? workAreas[0] ?? fallbackWorkAreas[0]);
  const defaultLocation = initial?.location ?? locations[0] ?? fallbackLocations[0];
  const initialStartTime = initial?.startTime ?? "07:00";
  const initialEndTime = initial?.endTime ?? "15:00";
  const slotOptions = allShiftSlots(workAreas);
  const inferredSlot =
    slotOptions.find(({ slot }) => slot.id === initial?.slotId) ??
    slotOptions.find(({ slot }) => slot.baseLabel === defaultArea && slot.segmentId === shiftSegmentForTime(initialStartTime)) ??
    slotOptions.find(({ slot }) => slot.baseLabel === defaultArea) ??
    slotOptions[0];
  const areaOptions = uniqueLabels([defaultArea, ...workAreas.map(canonicalWorkAreaLabel)].filter(Boolean));
  const locationOptions = Array.from(new Set([defaultLocation, ...locations].filter(Boolean)));
  const [form, setForm] = useState({
    slotId: initial?.slotId ?? inferredSlot?.slot.id ?? "",
    area: defaultArea,
    location: defaultLocation,
    startDate: initial?.startDate ?? "2026-05-27",
    startTime: initialStartTime,
    endDate: initial?.endDate ?? initial?.startDate ?? "2026-05-27",
    endTime: initialEndTime,
    requiredStaff: initial?.requiredStaff ?? "1",
    note: initial?.note ?? "",
    assignments: initial?.assignments ?? ([] as string[]),
    segmentLabel: initial?.segmentLabel ?? inferredSlot?.slot.segmentLabel ?? "Frühdienst"
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  function slotForAreaSegment(area: string, segmentId: ShiftSegmentKey) {
    return slotOptions.find(
      ({ slot }) => normalizeLabel(slot.baseLabel) === normalizeLabel(area) && slot.segmentId === segmentId
    )?.slot;
  }

  function applyPredefinedSlot(slotId: string) {
    if (!slotId) {
      setForm((current) => ({ ...current, slotId: "" }));
      return;
    }

    const next = slotOptions.find(({ slot }) => slot.id === slotId);
    if (!next) return;

    const { slot } = next;
    setForm((current) => ({
      ...current,
      slotId,
      area: slot.baseLabel,
      location: preferredLocationForTemplate(slot, locations),
      startTime: slot.defaultStartTime,
      endTime: slot.defaultEndTime,
      segmentLabel: slot.segmentLabel
    }));
  }

  function applySegment(segmentId: ShiftSegmentKey) {
    const segment = shiftSegments.find((item) => item.id === segmentId) ?? shiftSegments[0];
    setForm((current) => {
      const nextSlot = slotForAreaSegment(current.area, segmentId);
      return {
        ...current,
        slotId: nextSlot?.id ?? "",
        startTime: segment.startTime,
        endTime: segment.endTime,
        segmentLabel: segment.label
      };
    });
  }

  function applyArea(area: string) {
    const segmentId = shiftSegmentForTime(form.startTime);
    const nextSlot = slotForAreaSegment(area, segmentId);
    setForm({ ...form, area, slotId: nextSlot?.id ?? "" });
  }

  function toggleAssignment(employeeId: string) {
    setForm((current) => ({
      ...current,
      assignments: current.assignments.includes(employeeId)
        ? current.assignments.filter((id) => id !== employeeId)
        : [...current.assignments, employeeId]
    }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const endDate =
      mode === "edit"
        ? form.endTime <= form.startTime
          ? addDays(form.startDate, 1)
          : form.startDate
        : form.endDate < form.startDate
          ? form.startDate
          : form.endDate;
    const { segmentLabel: _segmentLabel, slotId: _slotId, ...payload } = form;
    onAdd({ ...payload, area: canonicalWorkAreaLabel(payload.area), endDate, requiredStaff: Number(form.requiredStaff) });
  }

  const activeSegment = shiftSegments.find((segment) => segment.id === shiftSegmentForTime(form.startTime)) ?? shiftSegments[0];
  const selectedSlotId = slotOptions.some(({ slot }) => slot.id === form.slotId) ? form.slotId : "";
  const dialogTitle = mode === "edit" ? "Schicht bearbeiten" : "Schicht anlegen";

  return (
    <Dialog title={dialogTitle} eyebrow="Plan" onClose={onClose} onSubmit={submit}>
      <div className="form-grid">
        <Field label="Vordefinierte Schicht">
          <select value={selectedSlotId} onChange={(event) => applyPredefinedSlot(event.target.value)}>
            <option value="">Eigenes Planfeld</option>
            {slotOptions.map(({ group, slot }) => (
              <option value={slot.id} key={slot.id}>
                {group} · {slot.baseLabel} · {slot.segmentLabel} · {slot.defaultStartTime}-{slot.defaultEndTime}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Dienst">
          <select value={activeSegment.id} onChange={(event) => applySegment(event.target.value as ShiftSegmentKey)}>
            {shiftSegments.map((segment) => (
              <option value={segment.id} key={segment.id}>
                {segment.label} · {segment.startTime}-{segment.endTime}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Arbeitsbereich / Planfeld">
          <input
            list="shift-work-area-options"
            value={form.area}
            onChange={(event) => applyArea(event.target.value)}
            placeholder="z. B. Telefonzentrale"
            required
          />
          <datalist id="shift-work-area-options">
            {areaOptions.map((area) => (
              <option value={area} key={area}>
                {area}
              </option>
            ))}
          </datalist>
        </Field>
        <Field label="Standort">
          <input
            list="shift-location-options"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
            placeholder={`z. B. ${locationOptions[0] ?? "Standort"}`}
            required
          />
          <datalist id="shift-location-options">
            {locationOptions.map((location) => (
              <option value={location} key={location}>
                {location}
              </option>
            ))}
          </datalist>
        </Field>
        <Field label={mode === "edit" ? "Datum" : "Von"}>
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => {
              const startDate = event.target.value;
              setForm({
                ...form,
                startDate,
                endDate: mode === "edit" || form.endDate < startDate ? startDate : form.endDate
              });
            }}
          />
        </Field>
        <Field label="Startzeit">
          <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} />
        </Field>
        {mode === "create" ? (
          <Field label="Bis">
            <input type="date" min={form.startDate} value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
          </Field>
        ) : null}
        <Field label="Endzeit">
          <input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} />
        </Field>
        <Field label="Bedarf">
          <input type="number" min="1" value={form.requiredStaff} onChange={(event) => setForm({ ...form, requiredStaff: event.target.value })} />
        </Field>
      </div>
      <label className="field full-field">
        <span>Notiz</span>
        <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Keine Notiz" />
      </label>
      <div className="checkbox-grid">
        {employees.map((employee) => (
          <label className="column-toggle" key={employee.id} title={employee.name}>
            <input type="checkbox" checked={form.assignments.includes(employee.id)} onChange={() => toggleAssignment(employee.id)} />
            <span className="toggle-label">{employee.name}</span>
          </label>
        ))}
      </div>
      <DialogActions
        dangerLabel={confirmDelete ? "Wirklich löschen?" : "Schicht löschen"}
        dangerIcon={<Trash2 size={17} />}
        onClose={onClose}
        onDanger={onDelete ? () => {
          if (!confirmDelete) {
            setConfirmDelete(true);
            return;
          }
          onDelete();
        } : undefined}
        submitLabel={mode === "edit" ? "Schicht speichern" : "Schicht anlegen"}
      />
    </Dialog>
  );
}

function AddAbsenceDialog({
  employees,
  initialDate,
  onClose,
  onAdd
}: {
  employees: Employee[];
  initialDate?: string;
  onClose: () => void;
  onAdd: (absence: {
    employeeId: string;
    type: string;
    startsOn: string;
    endsOn: string;
    status: AbsenceStatus;
    note: string;
  }) => void;
}) {
  const [form, setForm] = useState({
    employeeId: employees[0]?.id ?? fallbackEmployees[0].id,
    type: "Urlaub",
    startsOn: initialDate ?? "2026-06-05",
    endsOn: initialDate ?? "2026-06-05",
    status: "offen" as AbsenceStatus,
    note: ""
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    onAdd(form);
  }

  return (
    <Dialog title="Abwesenheit eintragen" eyebrow="Antrag" onClose={onClose} onSubmit={submit}>
      <div className="form-grid">
        <Field label="Mitarbeiter">
          <select value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })}>
            {employees.map((employee) => (
              <option value={employee.id} key={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Typ">
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            {["Urlaub", "Krankheit", "Fortbildung", "Schule", "Sonstiges"].map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Beginn">
          <input type="date" value={form.startsOn} onChange={(event) => setForm({ ...form, startsOn: event.target.value })} />
        </Field>
        <Field label="Ende">
          <input type="date" value={form.endsOn} onChange={(event) => setForm({ ...form, endsOn: event.target.value })} />
        </Field>
      </div>
      <label className="field full-field">
        <span>Notiz</span>
        <textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Keine Notiz" />
      </label>
      <DialogActions onClose={onClose} submitLabel="Abwesenheit eintragen" />
    </Dialog>
  );
}

function CalculationDetailDialog({
  details,
  onClose
}: {
  details: CalculationDetails;
  onClose: () => void;
}) {
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <section className="time-dialog calculation-dialog">
        <div className="dialog-header">
          <div>
            <p className="eyebrow">{details.eyebrow}</p>
            <h2>{details.title}</h2>
            <small>{details.period}</small>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Schließen">
            <X size={18} />
          </button>
        </div>

        <div className="calculation-summary">
          <span>Ergebnis</span>
          <strong>{details.total}</strong>
          <p>{details.formula}</p>
          {details.note ? <small>{details.note}</small> : null}
        </div>

        <div className="calculation-lines">
          <h3>Gezählt</h3>
          {details.rows.length ? (
            details.rows.map((row) => <CalculationLine row={row} key={row.id} />)
          ) : (
            <div className="empty-state compact">Keine gezählten Einzelzeilen</div>
          )}
        </div>

        {details.excludedRows?.length ? (
          <details className="calculation-excluded">
            <summary>Nicht gezählt ({details.excludedRows.length})</summary>
            <div className="calculation-lines">
              {details.excludedRows.map((row) => <CalculationLine row={row} key={row.id} />)}
            </div>
          </details>
        ) : null}

        <div className="dialog-actions">
          <span className="dialog-action-spacer" aria-hidden="true" />
          <button type="button" className="secondary-button" onClick={onClose}>
            Schließen
          </button>
        </div>
      </section>
    </div>
  );
}

function CalculationLine({ row }: { row: CalculationRow }) {
  return (
    <div className={`calculation-line ${row.tone ?? ""}`}>
      <span>
        <strong>{row.label}</strong>
        <small>{row.detail}</small>
      </span>
      <b>{row.value}</b>
    </div>
  );
}

function Dialog({
  title,
  eyebrow,
  onClose,
  onSubmit,
  children
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
}) {
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <form className="time-dialog" onSubmit={onSubmit}>
        <div className="dialog-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2>{title}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Schließen">
            <X size={18} />
          </button>
        </div>
        {children}
      </form>
    </div>
  );
}

function DialogActions({
  dangerIcon,
  dangerLabel,
  onClose,
  onDanger,
  submitLabel
}: {
  dangerIcon?: ReactNode;
  dangerLabel?: string;
  onClose: () => void;
  onDanger?: () => void;
  submitLabel: string;
}) {
  return (
    <div className="dialog-actions">
      {onDanger ? (
        <button type="button" className="danger-button" onClick={onDanger}>
          {dangerIcon}
          {dangerLabel ?? "Löschen"}
        </button>
      ) : null}
      <span className="dialog-action-spacer" aria-hidden="true" />
      <button type="button" className="secondary-button" onClick={onClose}>
        Abbrechen
      </button>
      <button type="submit" className="primary-button">
        {submitLabel}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

// T-009b — Reports-Frontend (claude-chat, 2026-06-05).
// Soll/Ist-Auswertung pro Mitarbeitendem; Jahres-/Monatswechsler, Tabelle,
// CSV-Download via /api/reports/team/monthly?format=csv.
type TeamSollIstRow = {
  employeeId: string;
  employeeName: string;
  year: number;
  month: number;
  weeklyTargetHours: number;
  workingDaysInMonth: number;
  sollMinutes: number;
  istMinutes: number;
  differenceMinutes: number;
  daysWithEntries: number;
  overlongDays: Array<{ day: string; minutes: number }>;
};

function formatMinutesAsHours(minutes: number): string {
  const sign = minutes < 0 ? "-" : "";
  const abs = Math.abs(minutes);
  const hh = Math.floor(abs / 60);
  const mm = abs % 60;
  return `${sign}${hh}:${String(mm).padStart(2, "0")} h`;
}

function ReportsView({
  request
}: {
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
}) {
  const today = new Date();
  const defaultMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const defaultYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [rows, setRows] = useState<TeamSollIstRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErrorMessage(null);
    request<{ ok: boolean; report: TeamSollIstRow[] }>(
      `/api/reports/team/monthly?year=${year}&month=${month}`
    )
      .then((res) => {
        if (cancelled) return;
        setRows(Array.isArray(res?.report) ? res.report : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : "Auswertung konnte nicht geladen werden");
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [year, month, request]);

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];
  const yearOptions = [defaultYear + 1, defaultYear, defaultYear - 1, defaultYear - 2];

  const totals = rows.reduce(
    (acc, r) => {
      acc.soll += r.sollMinutes;
      acc.ist += r.istMinutes;
      acc.diff += r.differenceMinutes;
      acc.overlong += r.overlongDays.length;
      return acc;
    },
    { soll: 0, ist: 0, diff: 0, overlong: 0 }
  );

  function csvUrl() {
    return `/api/reports/team/monthly?year=${year}&month=${month}&format=csv`;
  }

  return (
    <div className="payroll-view">
      <section className="wide-panel">
        <div className="section-heading">
          <div>
            <h2>Soll vs. Ist · {monthNames[month - 1]} {year}</h2>
            <p className="section-eyebrow">
              {loading
                ? "Lädt …"
                : errorMessage
                  ? `Fehler: ${errorMessage}`
                  : `${rows.length} Mitarbeitende · ${totals.overlong} Tage über 10 h`}
            </p>
          </div>
          <div className="payroll-controls" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Field label="Jahr">
              <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
                {yearOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="Monat">
              <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
                {monthNames.map((name, index) => (
                  <option key={name} value={index + 1}>{name}</option>
                ))}
              </select>
            </Field>
            <a
              href={csvUrl()}
              className="secondary-button"
              style={{ textDecoration: "none", display: "inline-flex", gap: 6, alignItems: "center" }}
              download
            >
              <Download size={16} />
              CSV-Export
            </a>
          </div>
        </div>

        {errorMessage ? null : (
          <div className="quota-table-wrap" style={{ overflowX: "auto" }}>
            <table className="quota-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92em" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Mitarbeitender</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Wochen-Soll</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Soll-Monat</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Ist-Monat</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Differenz</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Tage</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>&gt; 10 h</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.employeeId} style={{ borderTop: "1px solid var(--color-line, #e5e7eb)" }}>
                    <td style={{ padding: "6px 8px" }}>{r.employeeName}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{r.weeklyTargetHours} h</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{formatMinutesAsHours(r.sollMinutes)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{formatMinutesAsHours(r.istMinutes)}</td>
                    <td style={{
                      padding: "6px 8px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: r.differenceMinutes < -60
                        ? "var(--color-danger, #b91c1c)"
                        : r.differenceMinutes > 60
                          ? "var(--color-success, #047857)"
                          : "inherit"
                    }}>{formatMinutesAsHours(r.differenceMinutes)}</td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{r.daysWithEntries} / {r.workingDaysInMonth}</td>
                    <td style={{
                      padding: "6px 8px",
                      textAlign: "right",
                      color: r.overlongDays.length > 0 ? "var(--color-warning, #b45309)" : "inherit"
                    }}>{r.overlongDays.length}</td>
                  </tr>
                ))}
                {rows.length === 0 && !loading ? (
                  <tr><td colSpan={7} style={{ padding: "12px 8px", textAlign: "center", color: "var(--color-muted, #6b7280)" }}>
                    Keine Daten für {monthNames[month - 1]} {year}
                  </td></tr>
                ) : null}
                {rows.length > 0 ? (
                  <tr style={{ borderTop: "2px solid var(--color-line, #e5e7eb)", fontWeight: 600 }}>
                    <td style={{ padding: "8px" }}>Summe</td>
                    <td></td>
                    <td style={{ padding: "8px", textAlign: "right" }}>{formatMinutesAsHours(totals.soll)}</td>
                    <td style={{ padding: "8px", textAlign: "right" }}>{formatMinutesAsHours(totals.ist)}</td>
                    <td style={{ padding: "8px", textAlign: "right" }}>{formatMinutesAsHours(totals.diff)}</td>
                    <td></td>
                    <td style={{ padding: "8px", textAlign: "right" }}>{totals.overlong}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

// T-007b — Freigabe-View (claude-chat, 2026-06-05).
// Sammelview für Korrekturen, Tausch-Wünsche und offene Urlaubsanträge.
// Backend: GET /api/approvals (T-007a). Aktionen via Spezial-Endpoints:
//   PATCH /api/corrections/:id/approve|reject
//   PATCH /api/swap-requests/:id/accept|decline
//   PATCH /api/absences/:id/status (genehmigt|abgelehnt).
type ApprovalItem = {
  type: "correction" | "swap_request" | "absence";
  id: string;
  employeeId: string | null;
  createdAt: string;
  reason: string | null;
  payload: Record<string, unknown>;
};
type ApprovalsResponse = {
  ok: boolean;
  total: number;
  items: ApprovalItem[];
  breakdown: { corrections: number; swap_requests: number; absences: number };
};

function describeApproval(item: ApprovalItem): string {
  const p = item.payload as Record<string, unknown>;
  if (item.type === "correction") {
    const proposedStart = p.proposedStartsAt ?? p.proposed_starts_at;
    const proposedEnd = p.proposedEndsAt ?? p.proposed_ends_at;
    return `Korrektur: neue Zeit ${proposedStart ?? "—"} – ${proposedEnd ?? "—"}`;
  }
  if (item.type === "swap_request") {
    const fromShift = p.fromShiftId ?? p.from_shift_id;
    const toEmp = p.targetEmployeeId ?? p.target_employee_id ?? "offen";
    return `Schichttausch ${fromShift ?? ""} → ${toEmp}`;
  }
  if (item.type === "absence") {
    const startsOn = p.startsOn ?? p.starts_on;
    const endsOn = p.endsOn ?? p.ends_on;
    const absenceType = p.absenceType ?? p.absence_type ?? "Urlaub";
    return `${absenceType} ${startsOn ?? ""} – ${endsOn ?? ""}`;
  }
  return "—";
}

function approvalTypeLabel(type: ApprovalItem["type"]): string {
  if (type === "correction") return "Korrektur";
  if (type === "swap_request") return "Tausch";
  return "Urlaub";
}

function ApprovalsView({
  request,
  authUser,
  updateAbsenceStatus
}: {
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
  authUser: AuthUser | null;
  updateAbsenceStatus: (id: string, status: AbsenceStatus) => Promise<void> | void;
}) {
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [breakdown, setBreakdown] = useState<ApprovalsResponse["breakdown"]>({ corrections: 0, swap_requests: 0, absences: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ApprovalItem["type"]>("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await request<ApprovalsResponse>("/api/approvals");
      setItems(Array.isArray(res?.items) ? res.items : []);
      setBreakdown(res?.breakdown ?? { corrections: 0, swap_requests: 0, absences: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Freigabe-Liste nicht ladbar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reviewerEmployeeId = authUser?.employeeId ?? null;
  const visible = filter === "all" ? items : items.filter((i) => i.type === filter);

  async function decide(item: ApprovalItem, decision: "approve" | "reject") {
    setBusyId(item.id);
    try {
      const note = notes[item.id] ?? "";
      if (item.type === "correction") {
        const path = `/api/corrections/${encodeURIComponent(item.id)}/${decision}`;
        await request(path, {
          method: "PATCH",
          body: JSON.stringify({ reviewerId: reviewerEmployeeId, note })
        });
      } else if (item.type === "swap_request") {
        const action = decision === "approve" ? "accept" : "decline";
        const path = `/api/swap-requests/${encodeURIComponent(item.id)}/${action}`;
        const bodyKey = decision === "approve" ? "accepterEmployeeId" : "declinerEmployeeId";
        await request(path, {
          method: "PATCH",
          body: JSON.stringify({ [bodyKey]: reviewerEmployeeId, note })
        });
      } else if (item.type === "absence") {
        await updateAbsenceStatus(item.id, decision === "approve" ? "genehmigt" : "abgelehnt");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="approvals-view">
      <section className="wide-panel">
        <div className="section-heading">
          <div>
            <h2>Offene Freigaben · {items.length}</h2>
            <p className="section-eyebrow">
              {loading
                ? "Lädt …"
                : error
                  ? `Fehler: ${error}`
                  : `${breakdown.corrections} Korrekturen · ${breakdown.swap_requests} Tausch · ${breakdown.absences} Urlaub`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "correction", "swap_request", "absence"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={filter === key ? "primary-button compact-action" : "secondary-button compact-action"}
              >
                {key === "all" ? "Alle" : approvalTypeLabel(key)}
              </button>
            ))}
          </div>
        </div>
        {!reviewerEmployeeId ? (
          <p style={{ padding: "8px 12px", color: "var(--color-warning, #b45309)", fontSize: "0.9em" }}>
            Hinweis: Eigene Mitarbeiter-ID fehlt im Auth-Profil — Aktionen ohne reviewerEmployeeId.
          </p>
        ) : null}
        {error ? null : visible.length === 0 && !loading ? (
          <p style={{ padding: "12px", textAlign: "center", color: "var(--color-muted, #6b7280)" }}>
            Keine offenen Freigaben in dieser Kategorie.
          </p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {visible.map((item) => (
              <li
                key={`${item.type}-${item.id}`}
                style={{
                  borderTop: "1px solid var(--color-line, #e5e7eb)",
                  padding: "12px",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gridGap: 12,
                  alignItems: "center"
                }}
              >
                <span
                  style={{
                    background: item.type === "correction"
                      ? "var(--color-info-soft, #dbeafe)"
                      : item.type === "swap_request"
                        ? "var(--color-warning-soft, #fef3c7)"
                        : "var(--color-success-soft, #dcfce7)",
                    color: item.type === "correction"
                      ? "var(--color-info, #1d4ed8)"
                      : item.type === "swap_request"
                        ? "var(--color-warning, #b45309)"
                        : "var(--color-success, #047857)",
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: "0.75em",
                    fontWeight: 600
                  }}
                >
                  {approvalTypeLabel(item.type)}
                </span>
                <div>
                  <strong>{describeApproval(item)}</strong>
                  <div style={{ fontSize: "0.85em", color: "var(--color-muted, #6b7280)" }}>
                    Mitarbeitender: {item.employeeId ?? "—"} · gestellt {item.createdAt}
                    {item.reason ? ` · ${item.reason}` : ""}
                  </div>
                  <input
                    type="text"
                    placeholder="Notiz (optional)"
                    value={notes[item.id] ?? ""}
                    onChange={(event) => setNotes((n) => ({ ...n, [item.id]: event.target.value }))}
                    style={{ marginTop: 6, width: "100%", padding: "4px 8px", border: "1px solid var(--color-line, #e5e7eb)", borderRadius: 6, fontSize: "0.9em" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    className="primary-button compact-action"
                    disabled={busyId === item.id}
                    onClick={() => decide(item, "approve")}
                  >
                    <Check size={14} /> Genehmigen
                  </button>
                  <button
                    type="button"
                    className="secondary-button compact-action"
                    disabled={busyId === item.id}
                    onClick={() => decide(item, "reject")}
                  >
                    <X size={14} /> Ablehnen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// T-010b — Rollen-Admin-View (claude-chat, 2026-06-05).
// Listet alle auth_users mit Rolle, erlaubt Rolle-Wechsel via Dropdown
// (employee/manager/admin) → PATCH /api/admin/users/:id/role.
type AuthUserRow = {
  id: number;
  email: string;
  employeeId: string | null;
  displayName: string;
  role: string;
  tenantSlug: string | null;
  lastLoginAt: string | null;
  disabledAt: string | null;
  createdAt: string;
};
const ROLE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "employee", label: "Mitarbeiter" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" }
];

function AdminRolesView({
  request,
  authUser
}: {
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
  authUser: AuthUser | null;
}) {
  const [users, setUsers] = useState<AuthUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await request<{ ok: boolean; users: AuthUserRow[] }>("/api/admin/users");
      setUsers(Array.isArray(res?.users) ? res.users : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Benutzerliste nicht ladbar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setRole(user: AuthUserRow, newRole: string) {
    if (newRole === user.role) return;
    setBusyId(user.id);
    setError(null);
    setInfo(null);
    try {
      await request(`/api/admin/users/${encodeURIComponent(String(user.id))}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole, actorId: authUser?.id ?? null, note: `via Rollen-Admin-UI` })
      });
      setInfo(`${user.email}: Rolle → ${newRole}`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rolle konnte nicht gesetzt werden");
    } finally {
      setBusyId(null);
    }
  }

  const isAdmin = authUser?.role === "admin";

  return (
    <div className="admin-roles-view">
      <section className="wide-panel">
        <div className="section-heading">
          <div>
            <h2>Benutzer & Rollen · {users.length}</h2>
            <p className="section-eyebrow">
              {loading
                ? "Lädt …"
                : error
                  ? `Fehler: ${error}`
                  : info
                    ? info
                    : "Rolle bestimmt Sichtbarkeit & Aktionen."}
            </p>
          </div>
          <button className="secondary-button compact-action" type="button" onClick={load} disabled={loading}>
            <RefreshCw size={14} /> Neu laden
          </button>
        </div>
        {!isAdmin ? (
          <p style={{ padding: "8px 12px", color: "var(--color-warning, #b45309)", fontSize: "0.9em" }}>
            Hinweis: Eigenes Profil ist nicht Admin — Server akzeptiert PATCH ggf. nicht.
          </p>
        ) : null}
        {error ? null : (
          <div className="quota-table-wrap" style={{ overflowX: "auto" }}>
            <table className="quota-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92em" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>E-Mail</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Anzeigename</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Mitarbeiter-ID</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Rolle</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Letzter Login</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderTop: "1px solid var(--color-line, #e5e7eb)" }}>
                    <td style={{ padding: "6px 8px" }}>{user.email}</td>
                    <td style={{ padding: "6px 8px" }}>{user.displayName ?? "—"}</td>
                    <td style={{ padding: "6px 8px", fontFamily: "monospace", fontSize: "0.85em" }}>{user.employeeId ?? "—"}</td>
                    <td style={{ padding: "6px 8px" }}>
                      <select
                        value={user.role}
                        disabled={busyId === user.id || !isAdmin}
                        onChange={(event) => setRole(user, event.target.value)}
                        style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid var(--color-line, #e5e7eb)" }}
                      >
                        {ROLE_OPTIONS.find((opt) => opt.value === user.role) ? null : (
                          <option value={user.role}>{user.role}</option>
                        )}
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "6px 8px", color: "var(--color-muted, #6b7280)" }}>
                      {user.lastLoginAt ?? "nie"}
                    </td>
                    <td style={{ padding: "6px 8px" }}>
                      {user.disabledAt ? (
                        <span style={{ color: "var(--color-danger, #b91c1c)" }}>deaktiviert</span>
                      ) : (
                        <span style={{ color: "var(--color-success, #047857)" }}>aktiv</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading ? (
                  <tr><td colSpan={6} style={{ padding: "12px", textAlign: "center", color: "var(--color-muted, #6b7280)" }}>
                    Keine Benutzer.
                  </td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function PayrollView({
  request,
  employees
}: {
  request: <T>(url: string, options?: RequestInit) => Promise<T>;
  employees: Employee[];
}) {
  const today = new Date();
  const defaultMonth = today.getMonth() === 0 ? 12 : today.getMonth();
  const defaultYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [report, setReport] = useState<PayrollReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [personnelDraft, setPersonnelDraft] = useState<Record<string, string>>({});
  const [savingFor, setSavingFor] = useState<string | null>(null);

  async function loadReport(targetYear: number, targetMonth: number) {
    setLoading(true);
    setErrorMessage(null);
    try {
      const payload = await request<PayrollReport>(
        `/api/payroll/export?year=${targetYear}&month=${targetMonth}&format=json`
      );
      setReport(payload);
      const draft: Record<string, string> = {};
      for (const employee of payload.employees) {
        draft[employee.employeeId] = employee.personnelNumber ?? "";
      }
      setPersonnelDraft(draft);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport(year, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  async function savePersonnelNumber(employeeId: string) {
    const value = personnelDraft[employeeId] ?? "";
    setSavingFor(employeeId);
    setErrorMessage(null);
    try {
      await request(`/api/employees/${encodeURIComponent(employeeId)}/payroll-number`, {
        method: "PATCH",
        body: JSON.stringify({ personnelNumber: value })
      });
      await loadReport(year, month);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Speichern fehlgeschlagen");
    } finally {
      setSavingFor(null);
    }
  }

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];
  const yearOptions = [defaultYear + 1, defaultYear, defaultYear - 1, defaultYear - 2];
  const employeesWithoutData = employees.filter(
    (employee) => report && !report.employees.some((row) => row.employeeId === employee.id)
  );

  function formatHours(hours: number): string {
    return hours.toFixed(2).replace(".", ",");
  }

  function buildDownloadUrl(format: "csv" | "datev_lodas") {
    return `/api/payroll/export?year=${year}&month=${month}&format=${format}`;
  }

  return (
    <div className="payroll-view" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <section className="card" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
        <Field label="Jahr">
          <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {yearOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="Monat">
          <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {monthNames.map((name, index) => (
              <option key={name} value={index + 1}>{name}</option>
            ))}
          </select>
        </Field>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <a className="secondary-button" href={buildDownloadUrl("csv")} download>
            <Download size={16} /> CSV
          </a>
          <a className="primary-button" href={buildDownloadUrl("datev_lodas")} download>
            <Download size={16} /> DATEV-LODAS
          </a>
        </div>
      </section>

      {loading ? <p>Lade Lohn-Report…</p> : null}
      {errorMessage ? <p className="error-message">Fehler: {errorMessage}</p> : null}

      {report && !loading ? (
        <>
          <section className="card">
            <h2 style={{ marginTop: 0 }}>
              Zeitraum {report.period.startDate} – {report.period.endDate}
            </h2>
            <p>
              {report.totals.employeeCount} Mitarbeitende · {report.totals.entryCount} freigegebene Einträge ·
              {" "}<strong>{formatHours(report.totals.netHours)} h netto</strong>
              {" "}(brutto {formatHours(report.totals.grossHours)} h, abzüglich
              {" "}{Math.round(report.totals.unpaidBreakMinutes / 60 * 100) / 100} h unbezahlter Pausen)
            </p>
            <p style={{ fontSize: "0.85em", color: "var(--muted, #666)" }}>
              Nur freigegebene Arbeitszeit-Einträge fließen in den DATEV-Export. Lohnart {report.warnings.lohnartCode} (Pauschal-Stunden).
            </p>
          </section>

          {report.warnings.missingPersonnelNumbers.length > 0 ? (
            <section className="card" style={{ borderColor: "#d97706" }}>
              <h3 style={{ marginTop: 0 }}>⚠ Personalnummern fehlen</h3>
              <p>Diese Mitarbeitenden haben freigegebene Stunden, aber keine DATEV-Personalnummer — sie werden im LODAS-Export übersprungen:</p>
              <ul>
                {report.warnings.missingPersonnelNumbers.map((entry) => (
                  <li key={entry.employeeId}>{entry.employeeName}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="card">
            <h3 style={{ marginTop: 0 }}>Mitarbeiter im Monat</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mitarbeiter</th>
                  <th>Personalnummer</th>
                  <th style={{ textAlign: "right" }}>Brutto h</th>
                  <th style={{ textAlign: "right" }}>Unbezahlte Pausen (min)</th>
                  <th style={{ textAlign: "right" }}>Netto h</th>
                  <th style={{ textAlign: "right" }}>Einträge</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {report.employees.map((employee) => {
                  const draftValue = personnelDraft[employee.employeeId] ?? "";
                  const persisted = employee.personnelNumber ?? "";
                  const dirty = draftValue !== persisted;
                  return (
                    <tr key={employee.employeeId}>
                      <td>
                        <strong>{employee.employeeName}</strong>
                        <div style={{ fontSize: "0.85em", color: "var(--muted, #666)" }}>{employee.roleTitle}</div>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={draftValue}
                          onChange={(event) =>
                            setPersonnelDraft((current) => ({
                              ...current,
                              [employee.employeeId]: event.target.value
                            }))
                          }
                          style={{ width: "8rem" }}
                          placeholder="—"
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>{formatHours(employee.totals.grossHours)}</td>
                      <td style={{ textAlign: "right" }}>{employee.totals.unpaidBreakMinutes}</td>
                      <td style={{ textAlign: "right" }}><strong>{formatHours(employee.totals.netHours)}</strong></td>
                      <td style={{ textAlign: "right" }}>{employee.totals.entryCount}</td>
                      <td>
                        {dirty ? (
                          <button
                            type="button"
                            className="secondary-button"
                            disabled={savingFor === employee.employeeId}
                            onClick={() => savePersonnelNumber(employee.employeeId)}
                          >
                            {savingFor === employee.employeeId ? "…" : "Speichern"}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {employeesWithoutData.length > 0 ? (
            <section className="card">
              <h3 style={{ marginTop: 0 }}>Mitarbeitende ohne freigegebene Stunden</h3>
              <ul>
                {employeesWithoutData.map((employee) => (
                  <li key={employee.id}>{employee.name} ({employee.role})</li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="card">
            <h3 style={{ marginTop: 0 }}>Detail pro Tag</h3>
            {report.employees.length === 0 ? <p>Keine Einträge im gewählten Monat.</p> : null}
            {report.employees.map((employee) => (
              <details key={employee.employeeId} style={{ marginBottom: "1rem" }}>
                <summary>
                  <strong>{employee.employeeName}</strong> — {formatHours(employee.totals.netHours)} h netto an {employee.days.length} Tagen
                </summary>
                <table className="data-table" style={{ marginTop: "0.5rem" }}>
                  <thead>
                    <tr>
                      <th>Datum</th>
                      <th>Eintrags-Typ</th>
                      <th style={{ textAlign: "right" }}>Brutto h</th>
                      <th style={{ textAlign: "right" }}>Unbez. Pause (min)</th>
                      <th style={{ textAlign: "right" }}>Netto h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employee.days.map((day) => (
                      <tr key={`${employee.employeeId}_${day.date}`}>
                        <td>{day.date}</td>
                        <td>{day.entryTypes.join(", ")}</td>
                        <td style={{ textAlign: "right" }}>{formatHours(day.grossHours)}</td>
                        <td style={{ textAlign: "right" }}>{day.unpaidBreakMinutes}</td>
                        <td style={{ textAlign: "right" }}>{formatHours(day.netHours)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default App;
