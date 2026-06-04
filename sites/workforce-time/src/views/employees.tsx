import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

// T-001 Stammdaten-CRUD: dedizierte employees-View mit Edit-Modal.
// Tenant-Override: defaultWeeklyHours kommt aus
// workforce.default_weekly_hours (siehe server/db.js buildWorkforceConfigForBootstrap).

export type EmployeeRecord = {
  id: string;
  name: string;
  role: string;
  initials: string;
  employmentStatus?: string;
  email?: string | null;
  weeklyHours?: number | null;
};

type DefaultWeeklyHoursOverride = {
  default?: number;
  by_name_tokens?: Array<{ tokens: string[]; hours: number }>;
};

type EmployeesViewBootstrap = {
  employees: EmployeeRecord[];
  workforce?: {
    defaultWeeklyHours?: number | DefaultWeeklyHoursOverride | null;
  } | null;
};

type RequestFn = <T>(path: string, init?: RequestInit) => Promise<T>;

type Props = {
  data: EmployeesViewBootstrap;
  request: RequestFn;
  refresh: () => Promise<void> | void;
};

type EditState = { mode: "create" } | { mode: "edit"; employee: EmployeeRecord } | null;

export function EmployeesView({ data, request, refresh }: Props) {
  const [editing, setEditing] = useState<EditState>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallback = useMemo(() => resolveDefaultWeeklyHours(data.workforce?.defaultWeeklyHours), [
    data.workforce
  ]);

  async function handleSubmit(payload: EmployeePayload, employee: EmployeeRecord | null) {
    setBusy(true);
    setError(null);
    try {
      if (employee) {
        await request(`/api/employees/${encodeURIComponent(employee.id)}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        });
      } else {
        await request(`/api/employees`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      await refresh();
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(employee: EmployeeRecord) {
    const ok = window.confirm(
      `Mitarbeiter "${employee.name}" entfernen? Historische Zeiteintraege bleiben erhalten.`
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    try {
      await request(`/api/employees/${encodeURIComponent(employee.id)}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Loeschen fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="wide-panel">
      <div className="section-heading">
        <div>
          <h2>Team</h2>
          <p>{data.employees.length} aktive Datensaetze</p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => setEditing({ mode: "create" })}
          disabled={busy}
        >
          <Plus size={16} />
          Neuer Mitarbeiter
        </button>
      </div>

      {error ? <div className="empty-state error-state">{error}</div> : null}

      <div className="people-grid">
        {data.employees.map((employee) => {
          const effectiveHours = resolveEffectiveWeeklyHours(employee, fallback);
          return (
            <article className="person-card" key={employee.id}>
              <span className="avatar large" style={avatarStyle(employee)}>
                {initialsFor(employee)}
              </span>
              <div>
                <strong>{employee.name}</strong>
                <span>{employee.role}</span>
                <small>
                  {employee.employmentStatus === "inactive" ? "pausiert" : "aktiv"}
                  {effectiveHours != null ? ` - ${effectiveHours} h/Woche` : ""}
                </small>
                {employee.email ? <small className="muted">{employee.email}</small> : null}
              </div>
              <div className="row-actions">
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Mitarbeiter bearbeiten"
                  onClick={() => setEditing({ mode: "edit", employee })}
                  disabled={busy}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Mitarbeiter loeschen"
                  onClick={() => handleDelete(employee)}
                  disabled={busy}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {data.employees.length === 0 ? (
        <div className="empty-state">Noch keine Mitarbeiter angelegt.</div>
      ) : null}

      {editing ? (
        <EmployeeEditModal
          employee={editing.mode === "edit" ? editing.employee : null}
          defaultWeeklyHoursFallback={fallback?.value ?? null}
          busy={busy}
          onClose={() => setEditing(null)}
          onSubmit={(payload) =>
            handleSubmit(payload, editing.mode === "edit" ? editing.employee : null)
          }
        />
      ) : null}
    </section>
  );
}

type EmployeePayload = {
  name: string;
  role: string;
  email: string | null;
  weeklyHours: number | null;
};

type ModalProps = {
  employee: EmployeeRecord | null;
  defaultWeeklyHoursFallback: number | null;
  busy: boolean;
  onClose: () => void;
  onSubmit: (payload: EmployeePayload) => Promise<void> | void;
};

function EmployeeEditModal({
  employee,
  defaultWeeklyHoursFallback,
  busy,
  onClose,
  onSubmit
}: ModalProps) {
  const [name, setName] = useState(employee?.name ?? "");
  const [role, setRole] = useState(employee?.role ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [weeklyHours, setWeeklyHours] = useState(
    employee?.weeklyHours != null ? String(employee.weeklyHours) : ""
  );
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setName(employee?.name ?? "");
    setRole(employee?.role ?? "");
    setEmail(employee?.email ?? "");
    setWeeklyHours(employee?.weeklyHours != null ? String(employee.weeklyHours) : "");
    setLocalError(null);
  }, [employee]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    const trimmedName = name.trim();
    const trimmedRole = role.trim();
    if (!trimmedName) {
      setLocalError("Name ist Pflicht");
      return;
    }
    if (!trimmedRole) {
      setLocalError("Rolle ist Pflicht");
      return;
    }
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLocalError("E-Mail-Adresse ist ungueltig");
      return;
    }
    let hours: number | null = null;
    if (weeklyHours.trim()) {
      const parsed = Number(weeklyHours.replace(",", "."));
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 168) {
        setLocalError("Wochenstunden muss zwischen 0 und 168 liegen");
        return;
      }
      hours = parsed;
    }
    onSubmit({
      name: trimmedName,
      role: trimmedRole,
      email: trimmedEmail || null,
      weeklyHours: hours
    });
  }

  const heading = employee ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter";

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-label={heading}>
      <form className="dialog-card" onSubmit={handleSubmit}>
        <div className="dialog-header">
          <h3>{heading}</h3>
          <button type="button" className="icon-button" aria-label="Schliessen" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="dialog-body">
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
              required
            />
          </label>
          <label className="field">
            <span>Rolle</span>
            <input
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              required
              placeholder="MFA, Aerztin, Anmeldung ..."
            />
          </label>
          <label className="field">
            <span>Wochenstunden</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.25"
              min="0"
              max="168"
              value={weeklyHours}
              onChange={(event) => setWeeklyHours(event.target.value)}
              placeholder={
                defaultWeeklyHoursFallback != null
                  ? `Tenant-Default: ${defaultWeeklyHoursFallback} h`
                  : "z.B. 40"
              }
            />
          </label>
          <label className="field">
            <span>E-Mail</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="vorname.nachname@praxis.de"
            />
          </label>
          {localError ? <div className="empty-state error-state">{localError}</div> : null}
        </div>
        <div className="dialog-footer">
          <button type="button" className="secondary-button" onClick={onClose} disabled={busy}>
            Abbrechen
          </button>
          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? "Speichere..." : "Speichern"}
          </button>
        </div>
      </form>
    </div>
  );
}

type DefaultWeeklyHoursResult =
  | { value: number; rules: Array<{ tokens: string[]; hours: number }> }
  | null;

function resolveDefaultWeeklyHours(
  raw: number | DefaultWeeklyHoursOverride | null | undefined
): DefaultWeeklyHoursResult {
  if (raw == null) return null;
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? { value: raw, rules: [] } : null;
  }
  const value = typeof raw.default === "number" ? raw.default : null;
  const rules = Array.isArray(raw.by_name_tokens) ? raw.by_name_tokens : [];
  if (value == null && rules.length === 0) return null;
  return { value: value ?? 0, rules };
}

function resolveEffectiveWeeklyHours(
  employee: EmployeeRecord,
  fallback: DefaultWeeklyHoursResult
): number | null {
  if (employee.weeklyHours != null) return employee.weeklyHours;
  if (!fallback) return null;
  const lowerName = employee.name.toLowerCase();
  for (const rule of fallback.rules) {
    if (!rule || !Array.isArray(rule.tokens)) continue;
    const matches = rule.tokens.every(
      (token) => typeof token === "string" && lowerName.includes(token.toLowerCase())
    );
    if (matches && rule.tokens.length > 0) {
      return rule.hours;
    }
  }
  return fallback.value;
}

const avatarPalette = [
  { background: "#fde68a", color: "#92400e" },
  { background: "#bfdbfe", color: "#1e3a8a" },
  { background: "#bbf7d0", color: "#166534" },
  { background: "#fbcfe8", color: "#9d174d" },
  { background: "#ddd6fe", color: "#5b21b6" },
  { background: "#fed7aa", color: "#9a3412" }
];

function avatarStyle(employee: EmployeeRecord): CSSProperties {
  const key = `${employee.id}-${employee.name}`;
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  const palette = avatarPalette[hash % avatarPalette.length];
  return { backgroundColor: palette.background, color: palette.color };
}

function initialsFor(employee: EmployeeRecord) {
  const source = employee.initials || employee.name;
  return source
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
