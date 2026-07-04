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
    description: "Login mit E-Mail und Passwort.",
    status: "production",
    access: "open",
    badge: "PRODUCTION",
    href: "https://workforce-time.cortex-sanexio.tech/",
    tags: ["Workforce", "Login", "Live"],
  },
  {
    id: "pg-kalkulation",
    title: "Pg-Kalkulation",
    subtitle: "Kostenkalkulation Grueneburgweg",
    description:
      "Kalkulationstool fuer Standort Grueneburgweg. Login mit User + Passwort.",
    status: "production",
    access: "open",
    badge: "PRODUCTION",
    href: "https://pg-kalkulation.cortex-sanexio.tech/",
    tags: ["Kalkulation", "Finanzen"],
  },
  {
    id: "cortex-qm",
    title: "Cortex-QM",
    subtitle: "QM-Plattform Praxiszentrum",
    description:
      "Digitales, selbstlernendes Qualitätsmanagement — Module, Glossar, Suche, Anmerkungs-Workflow. Login: Sanexio / Cortex-QM.",
    status: "production",
    access: "open",
    badge: "PRODUCTION",
    href: "https://qm.cortex-sanexio.tech/",
    tags: ["QM", "Praxis", "Selbstlernend"],
  },
  {
    id: "sanexio-cortex",
    title: "Sanexio Cortex",
    subtitle: "Plattform-Dashboard",
    description:
      "Admin-Dashboard zum Cortex-Ökosystem (Plattform-Fortschritt, Cluster-Sync, Live-Deploys, offene User-Aktionen). Aktuell nicht freigeschaltet.",
    status: "locked",
    tags: ["Dashboard", "Admin", "Cluster"],
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
      "Adapter-Harness für Hermes-Style-Agents (interne KI-Engine) mit Runtime, Skills und Parity-Checks. Aktuell nicht freigeschaltet.",
    status: "locked",
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
  // -- Weitere Projekte (Repo-Inventar, vorlaeufig locked) --
  {
    id: "praxis-webseite",
    title: "Praxis-Webseite",
    subtitle: "westend-hausarzt.com / .de",
    description: "Praxis-Live-Webseite (WordPress + Blocksy Child-Theme).",
    status: "locked",
    tags: ["Web", "WordPress"],
  },
  {
    id: "praxiszentrum-theme",
    title: "Praxiszentrum-Theme",
    subtitle: "Blocksy-Child-Theme",
    description: "Theme-Repo der Praxis-Webseite, Git-tracked.",
    status: "locked",
    tags: ["Theme", "CSS"],
  },
  {
    id: "cortex-med-web",
    title: "Cortex-Med-Web",
    subtitle: "Medizinisches Web-Framework",
    description: "Schwester-Repo zu Cortex-Web, medizinische Site-Sammlung.",
    status: "locked",
    tags: ["Framework", "Medical"],
  },
  {
    id: "cortex-web-framework",
    title: "Cortex-Web",
    subtitle: "OSS Framework",
    description: "Reines Framework-Repo (Schemas, Adapter, Slot-Definitionen).",
    status: "locked",
    tags: ["Framework", "OSS"],
  },
  {
    id: "sanexio-tenant",
    title: "Sanexio-Tenant",
    subtitle: "Tenant-Datenraum",
    description: "Private Tenant-Daten + Site-Konfiguration (workforce, praxis).",
    status: "locked",
    tags: ["Tenant", "Data"],
  },
  {
    id: "nexus",
    title: "Nexus",
    subtitle: "Wissenskern + Skill-Engine",
    description: "Portabler Wissenskern (Vault, Memory, Skills, Mode-Hook).",
    status: "locked",
    tags: ["Knowledge", "Agent"],
  },
  {
    id: "nexus-layer",
    title: "Nexus-Layer",
    subtitle: "Layer-Spezifikationen",
    description: "Layer-Architektur fuer Nexus-Erweiterungen.",
    status: "locked",
    tags: ["Spec", "Architecture"],
  },
  {
    id: "cortex-agent",
    title: "Cortex-Agent",
    subtitle: "Hermes-style Skill-Engine",
    description: "Python-Agent mit Mode-/Skill-/Memory-Pipeline.",
    status: "locked",
    tags: ["Agent", "Python"],
  },
  {
    id: "cortex-archive",
    title: "Cortex-Archive",
    subtitle: "Plattform-Archiv",
    description: "Snapshots stillgelegter Local-Instanzen pro Nexus-Geraet.",
    status: "locked",
    tags: ["Archive", "Ops"],
  },
  {
    id: "cortex-tenant-template",
    title: "Cortex-Tenant-Template",
    subtitle: "Tenant-Skeleton",
    description: "Template-Repo zum Bootstrap neuer Tenant-Datenraeume.",
    status: "locked",
    tags: ["Template", "Tenant"],
  },
  {
    id: "cortex-rename-internal",
    title: "Cortex-Rename (Internal)",
    subtitle: "Privat-Layer Rename",
    description: "Praxis-spezifischer Layer ueber dem OSS Cortex-Rename.",
    status: "locked",
    tags: ["Tooling", "Internal"],
  },
  {
    id: "cortex-sanexio-landing",
    title: "Cortex-Sanexio-Landing",
    subtitle: "Statische Landing-Page",
    description: "Cyber-Look Landing fuer cortex-sanexio.tech.",
    status: "locked",
    tags: ["Web", "Static"],
  },
  {
    id: "proxmox",
    title: "Proxmox",
    subtitle: "VM-Orchestrierung",
    description: "Proxmox-Konfiguration + Migrations-Skripte fuer Hostinger.",
    status: "locked",
    tags: ["Infra", "VM"],
  },
  {
    id: "avatar-engine",
    title: "Avatar-Engine",
    subtitle: "Avatar-Generierung",
    description: "Bild- und Avatar-Tooling.",
    status: "locked",
    tags: ["Media", "AI"],
  },
  {
    id: "atelier-plugin",
    title: "Atelier-Plugin",
    subtitle: "Praxis-Atelier",
    description: "Plugin fuer kreative Praxis-Tooling-Layer.",
    status: "locked",
    tags: ["Plugin", "Praxis"],
  },
  {
    id: "scribe-plugin",
    title: "Scribe-Plugin",
    subtitle: "Schreib-Assistenz",
    description: "Schreib- und Befund-Assistenz-Plugin.",
    status: "locked",
    tags: ["Plugin", "Writing"],
  },
  {
    id: "render-befundbericht",
    title: "Render-Befundbericht",
    subtitle: "Befund-Rendering",
    description: "Template-Rendering fuer Befundberichte.",
    status: "locked",
    tags: ["Render", "Reports"],
  },
  {
    id: "businessplan",
    title: "Businessplan",
    subtitle: "Sanexio-Strategie",
    description: "Businessplan- und Strategie-Dokumente.",
    status: "locked",
    tags: ["Business", "Docs"],
  },
  {
    id: "sanexio-github-io",
    title: "Sanexio.github.io",
    subtitle: "Oeffentliche Github-Seite",
    description: "GitHub-Pages-Site der Sanexio-Organisation.",
    status: "locked",
    tags: ["Web", "Docs"],
  },
];
