import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, RefreshCw } from "lucide-react";

type EmployeeRecord = {
  id: string;
  name: string;
  role: string;
};

type AuthUser = {
  employeeId: string | null;
  role: string;
};

type AbsenceTypeSummary = {
  approved: number;
  pending: number;
};

type AbsenceSummaryYear = {
  year: number;
  vacation: {
    allocated: number;
    used: number;
    pending: number;
    remaining: number;
  };
  byType: Record<string, AbsenceTypeSummary>;
};

type AbsenceSummary = {
  employeeId: string;
  employeeName: string;
  years: AbsenceSummaryYear[];
};

type RequestFn = <T>(path: string, init?: RequestInit) => Promise<T>;

type Props = {
  employees: EmployeeRecord[];
  authUser: AuthUser | null;
  request: RequestFn;
};

function formatDays(value: number) {
  const formatted = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
  return `${formatted} ${value === 1 ? "Tag" : "Tage"}`;
}

function TypeBreakdown({ label, summary }: { label: string; summary?: AbsenceTypeSummary }) {
  const approved = summary?.approved ?? 0;
  const pending = summary?.pending ?? 0;
  return (
    <div className="absence-type-row">
      <span>{label}</span>
      <strong>{formatDays(approved + pending)}</strong>
      <small>{formatDays(approved)} genehmigt · {formatDays(pending)} offen</small>
    </div>
  );
}

function VacationMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="kpi absence-summary-kpi">
      <span>{label}</span>
      <strong>{formatDays(value)}</strong>
    </div>
  );
}

export function AbsenceSummaryView({ employees, authUser, request }: Props) {
  const isAdmin = !authUser || authUser.role === "admin";
  const ownEmployeeId = authUser?.employeeId ?? null;
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(() =>
    isAdmin ? employees[0]?.id ?? "" : ownEmployeeId ?? ""
  );
  const [summary, setSummary] = useState<AbsenceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId]
  );

  useEffect(() => {
    if (isAdmin) {
      if (selectedEmployeeId && employees.some((employee) => employee.id === selectedEmployeeId)) return;
      setSelectedEmployeeId(employees[0]?.id ?? "");
      return;
    }
    setSelectedEmployeeId(ownEmployeeId ?? "");
  }, [employees, isAdmin, ownEmployeeId, selectedEmployeeId]);

  useEffect(() => {
    const targetEmployeeId = isAdmin ? selectedEmployeeId : ownEmployeeId;
    if (!isAdmin && !ownEmployeeId) {
      setSummary(null);
      setError("Dieses Login ist keinem Mitarbeitenden zugeordnet.");
      setLoading(false);
      return;
    }
    if (isAdmin && !targetEmployeeId) {
      setSummary(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const path = isAdmin
          ? `/api/absence-summary?employeeId=${encodeURIComponent(targetEmployeeId ?? "")}`
          : "/api/absence-summary";
        const result = await request<AbsenceSummary>(path);
        if (!cancelled) setSummary(result);
      } catch (err) {
        if (!cancelled) {
          setSummary(null);
          setError(err instanceof Error ? err.message : "Fehlzeiten konnten nicht geladen werden.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, ownEmployeeId, reloadKey, request, selectedEmployeeId]);

  return (
    <section className="wide-panel absence-summary-view">
      <div className="section-heading absence-summary-heading">
        <div>
          <h2>Fehlzeiten</h2>
          <p>
            {summary?.employeeName ?? selectedEmployee?.name ?? "Mitarbeitenden wählen"}
          </p>
        </div>
        <div className="absence-summary-actions">
          {isAdmin ? (
            <label className="field absence-summary-select">
              <span>Mitarbeiter</span>
              <select
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                disabled={loading || employees.length === 0}
              >
                <option value="">Mitarbeitenden wählen</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="absence-summary-identity">{summary?.employeeName ?? selectedEmployee?.name ?? "Eigenes Konto"}</span>
          )}
          <button
            className="secondary-button"
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
            disabled={loading || (isAdmin && !selectedEmployeeId)}
          >
            <RefreshCw size={17} />
            Aktualisieren
          </button>
        </div>
      </div>

      {loading ? <div className="empty-state compact">Fehlzeiten werden geladen.</div> : null}
      {error ? <div className="empty-state error-state">{error}</div> : null}
      {!loading && !error && isAdmin && employees.length === 0 ? (
        <div className="empty-state">Noch keine Mitarbeitenden angelegt.</div>
      ) : null}

      {!loading && !error && summary ? (
        <div className="absence-year-grid">
          {summary.years.map((year) => {
            const sick = year.byType.Krankheit;
            const otherTypes = Object.entries(year.byType).filter(([type]) => type !== "Krankheit");
            return (
              <article className="absence-year-card" key={year.year}>
                <div className="absence-year-title">
                  <span className="absence-year-icon">
                    <CalendarDays size={18} />
                  </span>
                  <div>
                    <h3>{year.year}</h3>
                    <p>Urlaub und weitere Fehlzeiten</p>
                  </div>
                </div>

                <div className="absence-summary-metrics">
                  <VacationMetric label="Urlaubsanspruch" value={year.vacation.allocated} />
                  <VacationMetric label="Genommen" value={year.vacation.used} />
                  <VacationMetric label="Offen/geplant" value={year.vacation.pending} />
                  <VacationMetric label="Resturlaub" value={year.vacation.remaining} />
                </div>

                <div className="absence-type-list">
                  <TypeBreakdown label="Krankheit" summary={sick} />
                  {otherTypes.map(([type, item]) => (
                    <TypeBreakdown key={type} label={type} summary={item} />
                  ))}
                  {otherTypes.length === 0 && !sick ? (
                    <div className="absence-type-empty">
                      <AlertTriangle size={16} />
                      Keine weiteren Fehlzeiten in diesem Jahr.
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
