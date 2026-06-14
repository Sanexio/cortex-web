import { useEffect, useRef, useState } from "react";
import type { ProjectCard } from "../data/cards";

const STORAGE_KEY = "sanexio.admin.session";
const SESSION_VERSION = 1;
// Session bleibt 12 Stunden gültig, dann erneut Login.
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const EXPECTED_USER = (import.meta.env.VITE_CORTEX_ADMIN_USER as string | undefined) ?? "clusteradm";
const EXPECTED_PASS = (import.meta.env.VITE_CORTEX_ADMIN_PASS as string | undefined) ?? "X3sfd19sj!";

type AdminSession = { v: number; user: string; loggedInAt: number };

function loadAdmin(): AdminSession | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (parsed.v !== SESSION_VERSION) return null;
    if (Date.now() - parsed.loggedInAt > SESSION_TTL_MS) return null;
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

type Props = {
  card: ProjectCard;
  onClose: () => void;
};

export function AdminAuthModal({ card, onClose }: Props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const autoFiredRef = useRef(false);

  // Beim Mount: gültige Session? Direkt durchreichen.
  useEffect(() => {
    if (autoFiredRef.current) return;
    const s = loadAdmin();
    if (s && card.href) {
      autoFiredRef.current = true;
      window.open(card.href, "_blank", "noopener,noreferrer");
      onClose();
    }
  }, [card.href, onClose]);

  // Body-Scroll-Lock solange Modal offen.
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
          loggedInAt: Date.now(),
        };
        saveAdmin(next);
        if (card.href) {
          window.open(card.href, "_blank", "noopener,noreferrer");
        }
        setPass("");
        setBusy(false);
        onClose();
      } else {
        setError("Admin-Zugang verweigert.");
        setBusy(false);
      }
    }, 320);
  }

  return (
    <div
      className="admin-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form className="login-card cyber-frame --pink admin-modal" onSubmit={submit} autoComplete="off" noValidate>
        <div className="login-eyebrow badge badge--dark">
          <span className="hero-dot" /> SANEXIO · CORTEX · ADMIN
        </div>
        <h1 className="login-title t-h2">{card.title}</h1>
        <p className="login-sub">
          Admin-Zugang erforderlich. Nach Login öffnet sich das Dashboard auf{" "}
          <code>{card.href}</code> in einem neuen Tab.
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

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-close btn btn--outline"
            onClick={onClose}
          >
            abbrechen
          </button>
          <button type="submit" className="login-submit btn btn--primary" disabled={busy}>
            {busy ? "// connecting …" : "→ Authenticate"}
          </button>
        </div>

        <p className="login-hint">
          // admin-session · 12h TTL · localStorage
        </p>
      </form>
    </div>
  );
}
