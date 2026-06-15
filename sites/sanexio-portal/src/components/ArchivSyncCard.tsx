import { useCallback, useEffect, useRef, useState } from "react";

// Admin-Session-Pattern aus AdminAuthModal (12h TTL, localStorage).
// Bewusst inline dupliziert, statt Helper-Lift — Modul bleibt isoliert.
const ADMIN_KEY = "sanexio.admin.session";
const ADMIN_VERSION = 1;
const ADMIN_TTL_MS = 12 * 60 * 60 * 1000;

function isAdmin(): boolean {
  try {
    const raw = window.localStorage.getItem(ADMIN_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { v: number; loggedInAt: number };
    if (parsed.v !== ADMIN_VERSION) return false;
    return Date.now() - parsed.loggedInAt <= ADMIN_TTL_MS;
  } catch {
    return false;
  }
}

const API_BASE =
  (import.meta.env.VITE_ARCHIV_SYNC_API as string | undefined) ?? "http://127.0.0.1:5177";

type FolderStat = {
  folder: string;
  rc: number;
  added: number;
  modified: number;
  deleted: number;
  new_dirs: number;
};

type StatusPayload = {
  running: boolean;
  lastSyncEndedAt: string | null;
  lastRc: number | null;
  folders: FolderStat[];
  tail: string[];
};

type UiState = "idle" | "running" | "ok" | "error" | "offline";

export function ArchivSyncCard() {
  const [admin, setAdmin] = useState(isAdmin);
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [ui, setUi] = useState<UiState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const pollRef = useRef<number | null>(null);

  // Admin-Login kann im selben Tab passieren — alle 4s re-checken.
  useEffect(() => {
    const id = window.setInterval(() => setAdmin(isAdmin()), 4000);
    return () => window.clearInterval(id);
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/status`, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = (await r.json()) as StatusPayload;
      setStatus(data);
      setUi((prev) => {
        if (data.running) return "running";
        if (prev === "running") {
          return data.lastRc === 0 ? "ok" : "error";
        }
        return prev === "offline" ? "idle" : prev;
      });
      return data;
    } catch (err) {
      setUi("offline");
      setMessage(String(err));
      return null;
    }
  }, []);

  // Initial-Fetch nur wenn Admin sichtbar.
  useEffect(() => {
    if (!admin) return;
    void fetchStatus();
  }, [admin, fetchStatus]);

  // Polling während running.
  useEffect(() => {
    if (!admin) return;
    if (ui !== "running") {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current !== null) return;
    pollRef.current = window.setInterval(() => {
      void fetchStatus();
    }, 2000);
    return () => {
      if (pollRef.current !== null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [admin, ui, fetchStatus]);

  async function trigger() {
    setMessage(null);
    setUi("running");
    try {
      const r = await fetch(`${API_BASE}/trigger`, { method: "POST" });
      const data = (await r.json()) as { started: boolean; error?: string; pid?: number };
      if (!data.started) {
        setUi("error");
        setMessage(data.error ?? `HTTP ${r.status}`);
        return;
      }
      setMessage(`Sync gestartet (pid ${data.pid ?? "?"}) …`);
      void fetchStatus();
    } catch (err) {
      setUi("offline");
      setMessage(String(err));
    }
  }

  if (!admin) {
    return null;
  }

  const totalChanges =
    status?.folders.reduce(
      (a, f) => a + f.added + f.modified + f.deleted + f.new_dirs,
      0,
    ) ?? 0;

  const pillLabel =
    ui === "running"
      ? "// SYNC …"
      : ui === "ok"
      ? "OK"
      : ui === "error"
      ? "ERROR"
      : ui === "offline"
      ? "API OFFLINE"
      : status?.lastSyncEndedAt
      ? "IDLE"
      : "NEW";

  const pillClass =
    ui === "running"
      ? "archiv-pill archiv-pill--running"
      : ui === "ok"
      ? "archiv-pill archiv-pill--ok"
      : ui === "error" || ui === "offline"
      ? "archiv-pill archiv-pill--err"
      : "archiv-pill";

  return (
    <section className="card cyber-frame card-active card-admin archiv-card">
      <div className="card-head">
        <span className="card-id">// archiv-icloud-sync</span>
        <span className={pillClass}>{pillLabel}</span>
      </div>
      <h3 className="card-title t-h4">ARCHIV → iCloud Sync</h3>
      <p className="card-subtitle">
        Spiegelt <code>~/Cortex/Desk/ARCHIV/</code> (APO · ASBN · PRV · PRX · SNX · VERSICHERUNGEN)
        einseitig nach iCloud-Drive-Desktop.
      </p>

      <dl className="archiv-meta">
        <div>
          <dt>last sync</dt>
          <dd>{status?.lastSyncEndedAt ?? "—"}</dd>
        </div>
        <div>
          <dt>rc</dt>
          <dd>{status?.lastRc ?? "—"}</dd>
        </div>
        <div>
          <dt>changes</dt>
          <dd>{totalChanges}</dd>
        </div>
      </dl>

      {status && status.folders.length > 0 && (
        <ul className="archiv-folders">
          {status.folders.map((f) => (
            <li key={f.folder} className="card-tag badge badge--dark">
              {f.folder} · +{f.added} ~{f.modified} −{f.deleted}
            </li>
          ))}
        </ul>
      )}

      <div className="archiv-actions">
        <button
          type="button"
          className="btn btn--primary archiv-trigger"
          onClick={trigger}
          disabled={ui === "running" || ui === "offline"}
        >
          {ui === "running" ? "// syncing …" : "▸ Sync jetzt anstoßen"}
        </button>
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => setShowLog((v) => !v)}
        >
          {showLog ? "Log ausblenden" : "Log einblenden"}
        </button>
      </div>

      {message && <p className="archiv-message">{message}</p>}

      {showLog && status && (
        <pre className="archiv-log" aria-label="archiv-icloud-sync log tail">
          {status.tail.slice(-30).join("\n")}
        </pre>
      )}
    </section>
  );
}
