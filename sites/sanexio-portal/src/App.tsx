import { useState } from "react";
import { CARDS, type ProjectCard } from "./data/cards";
import { ProjectCardView } from "./components/ProjectCard";
import { LockedToast } from "./components/LockedToast";
import { SecondBrainPluginHost } from "./components/SecondBrainPluginHost";
import { LoginGate } from "./components/LoginGate";
import { AdminAuthModal } from "./components/AdminAuthModal";
import { ArchivSyncCard } from "./components/ArchivSyncCard";
import { ThemeToggle } from "./components/ThemeToggle";

export default function App() {
  return (
    <>
      <ThemeToggle />
      <LoginGate>{({ logout }) => <Hub onLogout={logout} />}</LoginGate>
    </>
  );
}

type HubProps = {
  onLogout: () => void;
};

function Hub({ onLogout }: HubProps) {
  const [locked, setLocked] = useState<ProjectCard | null>(null);
  const [localUnavailable, setLocalUnavailable] = useState<ProjectCard | null>(null);
  const [adminOpen, setAdminOpen] = useState<ProjectCard | null>(null);
  const activeCount = CARDS.filter((c) => c.status === "production").length;
  const lockedCount = CARDS.length - activeCount;

  return (
    <div className="app">
      <div className="grid-bg" aria-hidden="true" />
      <div className="scanline" aria-hidden="true" />

      <header className="hero section-accents">
        <div className="hero-topbar">
          <div className="hero-eyebrow badge badge--dark">
            <span className="hero-dot" /> SANEXIO · CORTEX HUB · v0.1
          </div>
          <button type="button" className="hero-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
        <h1 className="hero-title t-h1">
          SANEXIO <span className="hero-accent">Portal</span>
        </h1>
        <p className="hero-sub">
          Praxis-Cortex-Plattform &mdash; Module fuer Mitarbeitende und Aerzte.
          <br />
          Aktive Module: <strong>{activeCount}</strong> · Gesperrt:{" "}
          <strong>{lockedCount}</strong>
        </p>
        <ul className="hero-meta">
          <li>
            <span className="meta-label">stage</span> production
          </li>
          <li>
            <span className="meta-label">host</span> portal.sanexio.de
          </li>
          <li>
            <span className="meta-label">build</span> 2026-06-28
          </li>
        </ul>
      </header>

      <main className="content">
        <section className="cards-section">
          <h2 className="section-title t-h4">
            <span className="section-marker">01</span> Projekte
          </h2>
          <div className="cards-grid">
            {CARDS.map((c) => (
              <ProjectCardView
                key={c.id}
                card={c}
                onLockedClick={setLocked}
                onAdminClick={setAdminOpen}
                onLocalUnavailable={setLocalUnavailable}
              />
            ))}
          </div>
        </section>

        <section className="cards-section archiv-section">
          <h2 className="section-title t-h4">
            <span className="section-marker">02</span> Admin · Sync
          </h2>
          <div className="cards-grid">
            <ArchivSyncCard />
          </div>
        </section>

        <SecondBrainPluginHost />
      </main>

      <footer className="portal-footer">
        <span>// sanexio-portal · cortex-web · Local-Stage</span>
        <span>
          <a
            href="http://127.0.0.1:5174/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Workforce-Time Direct →
          </a>
        </span>
      </footer>

      {locked && (
        <LockedToast title={locked.title} onClose={() => setLocked(null)} />
      )}

      {localUnavailable && (
        <LockedToast
          title="Dashboard-Server nicht geladen"
          subtitle="Bitte com.cortex.dashboard-server per launchctl prüfen."
          onClose={() => setLocalUnavailable(null)}
        />
      )}

      {adminOpen && (
        <AdminAuthModal card={adminOpen} onClose={() => setAdminOpen(null)} />
      )}
    </div>
  );
}
