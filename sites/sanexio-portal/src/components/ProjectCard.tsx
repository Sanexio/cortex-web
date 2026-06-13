import { useState } from "react";
import type { ProjectCard } from "../data/cards";

type Props = {
  card: ProjectCard;
  onLockedClick: (card: ProjectCard) => void;
  onAdminClick: (card: ProjectCard) => void;
};

export function ProjectCardView({ card, onLockedClick, onAdminClick }: Props) {
  const [hover, setHover] = useState(false);
  const isLocked = card.status === "locked";
  const isAdmin = card.access === "admin";

  const className = [
    "card",
    isLocked ? "card-locked" : "card-active",
    isAdmin ? "card-admin" : "",
    hover ? "card-hover" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = (
    <>
      <div className="card-glitch" aria-hidden="true">
        <span className="card-glitch-r">{card.title}</span>
        <span className="card-glitch-c">{card.title}</span>
      </div>
      <div className="card-head">
        <span className="card-id">{`// ${card.id}`}</span>
        {card.badge && (
          <span
            className={[
              "card-badge",
              isAdmin ? "card-badge-admin" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {card.badge}
          </span>
        )}
        {isLocked && (
          <span className="card-badge card-badge-locked" aria-label="locked">
            RESTRICTED
          </span>
        )}
      </div>
      <h3 className="card-title">{card.title}</h3>
      <p className="card-subtitle">{card.subtitle}</p>
      <p className="card-desc">{card.description}</p>
      <ul className="card-tags">
        {card.tags.map((t) => (
          <li key={t} className="card-tag">
            {t}
          </li>
        ))}
      </ul>
      {isLocked && (
        <div className="card-lock-overlay" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          <span>ACCESS RESTRICTED</span>
        </div>
      )}
    </>
  );

  if (isLocked) {
    return (
      <button
        type="button"
        className={className}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => onLockedClick(card)}
        aria-label={`${card.title} (restricted)`}
      >
        {body}
      </button>
    );
  }

  if (isAdmin) {
    return (
      <button
        type="button"
        className={className}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => onAdminClick(card)}
        aria-label={`${card.title} (admin)`}
      >
        {body}
      </button>
    );
  }

  return (
    <a
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {body}
    </a>
  );
}
