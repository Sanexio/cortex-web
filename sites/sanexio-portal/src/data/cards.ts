export type ProjectCard = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: "production" | "locked";
  /** Welche Auth-Stufe vor Öffnen?  "open" = direkt, "admin" = Admin-Gate. */
  access?: "open" | "admin";
  badge?: string;
  href?: string;
  hrefRequiresLocal?: boolean;
  /** Interne Sub-Routen (z.B. "sanexio-cortex") für Admin-Apps im Portal selbst. */
  internalRoute?: string;
  tags: string[];
};

export const CARDS: ProjectCard[] = [
  {
    id: "workforce-time",
    title: "Workforce-Time",
    subtitle: "Arbeitszeit · Schichtplanung",
    description:
      "Browser-App für Stempelzeiten, Schichtplanung und Lohnabrechnungs-Export. Direkter Login mit Mitarbeiter-Mail — Login-Link erscheint sofort im Formular.",
    status: "production",
    access: "open",
    badge: "PRODUCTION",
    href: "http://127.0.0.1:5174/",
    tags: ["Workforce", "Login", "Live"],
  },
  {
    id: "sanexio-cortex",
    title: "Sanexio Cortex",
    subtitle: "Plattform-Dashboard",
    description:
      "Admin-Dashboard zum Cortex-Ökosystem (Plattform-Fortschritt, Cluster-Sync, Live-Deploys, offene User-Aktionen). Läuft als eigener Service (uvicorn).",
    status: "production",
    access: "admin",
    badge: "ADMIN",
    href: "http://127.0.0.1:9119/projects",
    tags: ["Dashboard", "Admin", "Cluster"],
  },
  {
    id: "cortex-qm",
    title: "Cortex-QM",
    subtitle: "Qualitätsmanagement",
    description:
      "QM-Handbuch, Risk-Register, Auditprotokolle für die Praxis. Aktuell intern, nicht freigeschaltet.",
    status: "locked",
    tags: ["QM", "Audit"],
  },
  {
    id: "cortex-desk",
    title: "Cortex-Desk",
    subtitle: "Behörden- & Anwaltspost",
    description:
      "Eingehende Schreiben automatisch klassifizieren, Befundberichte und Stellungnahmen entwerfen.",
    status: "locked",
    tags: ["Verwaltung", "KI"],
  },
  {
    id: "cortex-cli",
    title: "Cortex-CLI",
    subtitle: "Praxis-Workflows aus dem Terminal",
    description:
      "Kommandozeilen-Werkzeug für Skill-Ausführung, Memory-Suche, Multi-Device-Orchestrierung.",
    status: "locked",
    tags: ["CLI", "Tooling"],
  },
  {
    id: "cortex-harness",
    title: "Cortex-Harness",
    subtitle: "Skill-Engine · Hermes-Agents",
    description:
      "Adapter-Harness für Hermes-Style-Agents (interne KI-Engine) mit lokalem Dashboard-Host für Runtime, Skills und Parity-Checks.",
    status: "production",
    access: "open",
    badge: "LOCAL",
    href: "http://127.0.0.1:8765/harness",
    hrefRequiresLocal: true,
    tags: ["Engine", "Agent", "Dashboard"],
  },
  {
    id: "cortex-rename",
    title: "Cortex-Rename",
    subtitle: "Datei-Klassifizierung",
    description:
      "Intelligente Dateiumbennung für Praxisbelege, Steuerdokumente, Behördenpost.",
    status: "locked",
    tags: ["Tooling", "Filing"],
  },
  {
    id: "juvantis",
    title: "Juvantis",
    subtitle: "Sanexio Distribution",
    description:
      "B2C + B2B Distribution von Juvantis-Produkten (DHT, Bluttests, Body Checks).",
    status: "locked",
    tags: ["Shop", "B2B"],
  },
];
