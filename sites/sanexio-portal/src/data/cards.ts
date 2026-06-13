export type ProjectCard = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  status: "production" | "locked";
  badge?: string;
  href?: string;
  tags: string[];
};

export const CARDS: ProjectCard[] = [
  {
    id: "workforce-time",
    title: "Workforce-Time",
    subtitle: "Arbeitszeit · Schichtplanung",
    description:
      "Browser-App für Stempelzeiten, Schichtplanung und Lohnabrechnungs-Export. Magic-Link-Login + TOTP.",
    status: "production",
    badge: "PRODUCTION",
    href: "http://127.0.0.1:5174/",
    tags: ["Workforce", "Login", "Live"],
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
    subtitle: "Agent-Testbed",
    description:
      "Skill-Engine + Adapter-Harness für Hermes-Style-Agents. Internal.",
    status: "locked",
    tags: ["Engine", "Agent"],
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
