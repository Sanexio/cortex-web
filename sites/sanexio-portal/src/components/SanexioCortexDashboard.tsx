import { useEffect, useState } from "react";
import { DASHBOARD } from "../data/dashboard";

const STORAGE_KEY = "sanexio.cortex.admin.session";
const SESSION_VERSION = 1;

// Admin-Login. Welle P.2 ersetzt das durch echte Auth.
const EXPECTED_USER = (import.meta.env.VITE_CORTEX_ADMIN_USER as string | undefined) ?? "clusteradm";
const EXPECTED_PASS = (import.meta.env.VITE_CORTEX_ADMIN_PASS as string | undefined) ?? "X3sfd19sj!";

type AdminSession = { v: number; user: string; loggedInAt: string };

function loadAdmin(): AdminSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (parsed.v !== SESSION_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveAdmin(s: AdminSession): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota */
  }
}

function clearAdmin(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

type Props = {
  onClose: () => void;
};

export function SanexioCortexDashboard({ onClose }: Props) {
  const [session, setSession] = useState<AdminSession | null>(() => loadAdmin());
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    window.setTimeout(() => {
      if (user.trim() === EXPECTED_USER && pass === EXPECTED_PASS) {
        const next: AdminSession = {
          v: SESSION_VERSION,
          user: user.trim(),
          loggedInAt: new Date().toISOString(),
        };
        saveAdmin(next);
        setSession(next);
        setPass("");
      } else {
        setError("Admin-Zugang verweigert.");
      }
      setBusy(false);
    }, 320);
  }

  function logout() {
    clearAdmin();
    setSession(null);
    setUser("");
    setPass("");
  }

  return (
    <div className="admin-overlay" role="dialog" aria-modal="true">
      <header className="admin-top">
        <div className="admin-id">
          <span className="section-marker">02</span> Sanexio · Cortex Dashboard
          <span className="admin-version">v{DASHBOARD.version}</span>
        </div>
        <div className="admin-controls">
          {session && (
            <button type="button" className="logout-pin" onClick={logout}>
              <span aria-hidden="true">⎋</span> {session.user} · Logout
            </button>
          )}
          <button type="button" className="admin-close" onClick={onClose} aria-label="Schließen">
            ✕ schließen
          </button>
        </div>
      </header>

      {!session && (
        <div className="admin-login-wrap">
          <form className="login-card" onSubmit={submit} autoComplete="off" noValidate>
            <div className="login-eyebrow">
              <span className="hero-dot" /> SANEXIO · CORTEX · ADMIN
            </div>
            <h1 className="login-title">Admin-Login</h1>
            <p className="login-sub">
              Zugriff auf das Plattform-Dashboard.
            </p>

            <label className="login-field">
              <span className="login-label">User</span>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoFocus
                autoComplete="username"
                spellCheck={false}
                required
              />
            </label>
            <label className="login-field">
              <span className="login-label">Password</span>
              <input
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button type="submit" className="login-submit" disabled={busy}>
              {busy ? "// connecting …" : "→ Authenticate"}
            </button>
            <p className="login-hint">// admin-stage · welle P.1 · localStorage session</p>
          </form>
        </div>
      )}

      {session && (
        <div className="admin-body">
          <div className="admin-meta">
            <span>source · {DASHBOARD.source}</span>
            <span>snapshot · {new Date(DASHBOARD.generated_at).toLocaleString("de-DE")}</span>
            <span>manual-only · update via src/data/dashboard.ts</span>
          </div>

          <section className="admin-section">
            <h2 className="section-title">
              <span className="section-marker">A</span> Plattform-Fortschritt
            </h2>
            <ul className="admin-phases">
              {DASHBOARD.phases.map((p) => {
                const pct = Math.round((p.done / p.total) * 100);
                return (
                  <li key={p.id} className="admin-phase">
                    <div className="admin-phase-head">
                      <span className="admin-phase-label">{p.label}</span>
                      <span className="admin-phase-topic">{p.topic}</span>
                      <span className="admin-phase-count">
                        {p.done} / {p.total} · {pct}%
                      </span>
                    </div>
                    <div className="admin-bar">
                      <div className="admin-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="admin-section">
            <h2 className="section-title">
              <span className="section-marker">B</span> Lokale Services
            </h2>
            <ul className="admin-services">
              {DASHBOARD.services.map((s) => (
                <li key={s.id} className={`admin-service status-${s.status}`}>
                  <span className="admin-service-dot" aria-hidden="true" />
                  <span className="admin-service-label">{s.label}</span>
                  {s.port && <span className="admin-service-port">:{s.port}</span>}
                  {s.note && <span className="admin-service-note">{s.note}</span>}
                </li>
              ))}
            </ul>
          </section>

          <section className="admin-section admin-section-split">
            <div className="admin-half">
              <h2 className="section-title">
                <span className="section-marker">C</span> Cluster
              </h2>
              <ul className="admin-cluster">
                {DASHBOARD.cluster.map((c) => (
                  <li key={c.hostname} className="admin-cluster-row">
                    <span className="admin-cluster-host">{c.hostname}</span>
                    <span className="admin-cluster-role">{c.role}</span>
                    <span className="admin-cluster-hb">{c.heartbeat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="admin-half">
              <h2 className="section-title">
                <span className="section-marker">D</span> Offene User-Aktionen
              </h2>
              <ul className="admin-actions">
                {DASHBOARD.pending_user_actions.map((a, i) => (
                  <li key={i} className="admin-action">
                    <span className="admin-action-text">{a.text}</span>
                    <span className="admin-action-meta">
                      owner · {a.owner} · via {a.via}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="admin-section">
            <h2 className="section-title">
              <span className="section-marker">E</span> Letzte Releases
            </h2>
            <ul className="admin-deploys">
              {DASHBOARD.recent_deploys.map((d) => (
                <li key={`${d.project}-${d.ref}`} className="admin-deploy">
                  <span className="admin-deploy-project">{d.project}</span>
                  <span className="admin-deploy-ref">{d.ref}</span>
                  <span className="admin-deploy-time">
                    {new Date(d.released_at).toLocaleString("de-DE")}
                  </span>
                  {d.note && <span className="admin-deploy-note">{d.note}</span>}
                </li>
              ))}
            </ul>
          </section>

          {DASHBOARD.notes.length > 0 && (
            <section className="admin-section">
              <h2 className="section-title">
                <span className="section-marker">F</span> Notes
              </h2>
              <ul className="admin-notes">
                {DASHBOARD.notes.map((n, i) => (
                  <li key={i} className="admin-note">// {n}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
