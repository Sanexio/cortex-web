import { useEffect, useState } from "react";

const STORAGE_KEY = "sanexio.portal.session";
const SESSION_VERSION = 1;

// P.1 Dev-Login. Welle P.2 ersetzt diesen Block durch
// magic-link-/per-employee-Auth (siehe Workforce-Time auth.js).
// Defaults aus build-time ENV (VITE_PORTAL_USER / VITE_PORTAL_PASS),
// Fallback Sanexio/Sanexio.
const EXPECTED_USER = (import.meta.env.VITE_PORTAL_USER as string | undefined) ?? "Sanexio";
const EXPECTED_PASS = (import.meta.env.VITE_PORTAL_PASS as string | undefined) ?? "Sanexio";

type Session = {
  v: number;
  user: string;
  loggedInAt: string;
};

function loadSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (parsed.v !== SESSION_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistSession(session: Session): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* quota or disabled — Login bleibt session-only */
  }
}

function clearSession(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignored */
  }
}

type Props = {
  children: React.ReactNode;
};

export function LoginGate({ children }: Props) {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) document.body.classList.add("is-authed");
    else document.body.classList.remove("is-authed");
  }, [session]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    window.setTimeout(() => {
      if (user.trim() === EXPECTED_USER && pass === EXPECTED_PASS) {
        const next: Session = {
          v: SESSION_VERSION,
          user: user.trim(),
          loggedInAt: new Date().toISOString(),
        };
        persistSession(next);
        setSession(next);
        setPass("");
      } else {
        setError("Zugang verweigert. Benutzername oder Passwort falsch.");
      }
      setBusy(false);
    }, 320);
  }

  function logout() {
    clearSession();
    setSession(null);
    setUser("");
    setPass("");
  }

  if (session) {
    return (
      <>
        {children}
        <button type="button" className="logout-pin" onClick={logout} aria-label="Logout">
          <span aria-hidden="true">⎋</span> {session.user} · Logout
        </button>
      </>
    );
  }

  return (
    <div className="login-shell">
      <div className="grid-bg" aria-hidden="true" />
      <div className="scanline" aria-hidden="true" />
      <form className="login-card" onSubmit={submit} autoComplete="off" noValidate>
        <div className="login-eyebrow">
          <span className="hero-dot" /> SANEXIO · ZUGANG
        </div>
        <h1 className="login-title">
          Sanexio <span className="hero-accent">Portal</span>
        </h1>
        <p className="login-sub">Mitarbeiter-Login zum Cortex-Hub.</p>

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

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="login-submit" disabled={busy}>
          {busy ? "// connecting …" : "→ Authenticate"}
        </button>

        <p className="login-hint">
          // dev-stage · welle P.1 · localStorage session
        </p>
      </form>
    </div>
  );
}
