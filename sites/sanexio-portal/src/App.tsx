import { useState } from "react";
import { CARDS, type ProjectCard } from "./data/cards";
import { ProjectCardView } from "./components/ProjectCard";
import { LockedToast } from "./components/LockedToast";
import { SecondBrainGraph } from "./components/SecondBrainGraph";
import { LoginGate } from "./components/LoginGate";
import { AdminAuthModal } from "./components/AdminAuthModal";

export default function App() {
  return (
    <LoginGate>
      <Hub />
    </LoginGate>
  );
}

function Hub() {
  const [locked, setLocked] = useState<ProjectCard | null>(null);
  const [adminOpen, setAdminOpen] = useState<ProjectCard | null>(null);
  const activeCount = CARDS.filter((c) => c.status === "production").length;
  const lockedCount = CARDS.length - activeCount;

  return (
    <div className="app">
      <div className="grid-bg" aria-hidden="true" />
      <div className="scanline" aria-hidden="true" />

      <header className="hero section-accents">
        <div className="hero-eyebrow badge badge--dark">
          <span className="hero-dot" /> SANEXIO · CORTEX HUB · v0.1
        </div>
        <h1 className="hero-title t-h1">
          Sanexio <span className="hero-accent">Portal</span>
        </h1>
        <p className="hero-sub">
          Mitarbeiter-Zugang zu Praxiszentrum Cortex.
          <br />
          Aktive Module: <strong>{activeCount}</strong> · Gesperrt:{" "}
          <strong>{lockedCount}</strong>
        </p>
        <ul className="hero-meta">
          <li>
            <span className="meta-label">stage</span> local-flywheel
          </li>
          <li>
            <span className="meta-label">host</span> 127.0.0.1:5176
          </li>
          <li>
            <span className="meta-label">build</span> P.1 · 2026-06-13
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
              />
            ))}
          </div>
        </section>

        <SecondBrainGraph />
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

      {adminOpen && (
        <AdminAuthModal card={adminOpen} onClose={() => setAdminOpen(null)} />
      )}
    </div>
  );
}
