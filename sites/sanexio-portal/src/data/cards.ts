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
      "Browser-App für Stempelzeiten, Schichtplanung und Lohnabrechnungs-Export. Magic-Link-Login + TOTP. Auf Local-Stage landet der Login-Link in der Mailpit-Inbox (Card „Login-Mails").",
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
    id: "mailpit",
    title: "Login-Mails",
    subtitle: "Mailpit · Magic-Link-Inbox",
    description:
      "Lokaler Mail-Catcher für Workforce-Time-Login-Links. Auf Local-Stage landen alle Auth-Mails hier, nicht im echten Postfach.",
    status: "production",
    access: "open",
    badge: "INBOX",
    href: "http://127.0.0.1:8025/",
    tags: ["Mail", "Login-Link", "Dev"],
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
      "Adapter-Harness für Hermes-Style-Agents (interne KI-Engine), keine Visualisierung — nicht das Sanexio-Dashboard.",
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
