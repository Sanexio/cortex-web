// Sanexio Cortex Dashboard — manuell gepflegte Plattform-Übersicht.
// Update-Workflow: dieses File anpassen + `npm run build` + Service restart
// (oder bei laufendem Dev: HMR greift automatisch).

export type DashboardPhase = {
  id: string;
  label: string;
  done: number;
  total: number;
  topic: string;
};

export type DashboardService = {
  id: string;
  label: string;
  port?: number;
  status: "up" | "degraded" | "down";
  note?: string;
};

export type DashboardClusterNode = {
  hostname: string;
  role: string;
  heartbeat: string;
};

export type DashboardUserAction = {
  text: string;
  owner: string;
  via: string;
};

export type DashboardRecentDeploy = {
  project: string;
  ref: string;
  released_at: string;
  note?: string;
};

export type DashboardData = {
  version: string;
  generated_at: string;
  source: string;
  phases: DashboardPhase[];
  services: DashboardService[];
  cluster: DashboardClusterNode[];
  pending_user_actions: DashboardUserAction[];
  recent_deploys: DashboardRecentDeploy[];
  notes: string[];
};

/**
 * Aktuelle Version. Stand 2026-06-13 nach Welle P.1.
 * Zahlen sind ein Snapshot aus session_overview.py (siehe `source`).
 * Update: dieses Objekt anpassen, dann committen.
 */
export const DASHBOARD: DashboardData = {
  version: "2026-06-13.01",
  generated_at: "2026-06-13T11:08:00Z",
  source:
    "Snapshot aus Nexus/tools/cortex-mode/bin/session_overview.py + _state/platform-state.json",
  phases: [
    { id: "phase-2", label: "PHASE 2", done: 3, total: 3, topic: "Nexus-Build-Pipeline" },
    { id: "phase-3", label: "PHASE 3", done: 2, total: 3, topic: "Cortex-CLI MVP" },
    { id: "phase-4", label: "PHASE 4", done: 1, total: 1, topic: "Cortex-Web OSS-Release" },
    { id: "phase-5", label: "PHASE 5", done: 6, total: 8, topic: "Tenant-Onboarding" },
    { id: "phase-6", label: "PHASE 6", done: 5, total: 12, topic: "Cortex-Layer-Projekte (rollend)" },
  ],
  services: [
    { id: "sanexio-portal", label: "Sanexio Portal", port: 5176, status: "up" },
    { id: "workforce-web",  label: "Workforce-Time Web", port: 5174, status: "up" },
    { id: "workforce-api",  label: "Workforce-Time API", port: 5175, status: "up", note: "8 employees, 1098 time entries" },
  ],
  cluster: [
    { hostname: "Cluster-Mini-02",            role: "home (M2)",         heartbeat: "0h 1m" },
    { hostname: "Cluster-Mini-04",            role: "lab",               heartbeat: "0h 34m" },
    { hostname: "Mac-Studio",                 role: "praxis-studio",     heartbeat: "0h 36m" },
    { hostname: "SSMD-MacBookPro-M5",         role: "praxis-mobile (M5)", heartbeat: "0h 9m" },
    { hostname: "SSMD-MacBookPro",            role: "praxis (Intel)",    heartbeat: "1d 5h" },
  ],
  pending_user_actions: [
    { text: "cortex-cli/server/ Files auf cortex.sanexio.de hochladen", owner: "Stracke", via: "GoDaddy cPanel/SFTP" },
    { text: "Externen Arzt für Welle-5.4-Sitzung ansprechen", owner: "Stracke", via: "Erstkontakt + Bildschirmfreigabe" },
    { text: "Stracke-Templates für cortex-qm B.4/B.5 + cortex-desk B.4 liefern", owner: "Stracke", via: "Repo-Files in projects/" },
    { text: "cortex-qm + cortex-desk auf public flippen", owner: "Stracke", via: "gh repo edit nach adversarial Review" },
  ],
  recent_deploys: [
    { project: "cortex-cli", ref: "0.0.1-w3.0", released_at: "2026-06-02T19:03:49Z", note: "darwin-x64 + arm64" },
    { project: "nexus",      ref: "0.1.0",      released_at: "2026-06-02T04:03:21Z", note: "darwin-x64 + arm64" },
    { project: "Cortex-Web", ref: "7db0b94",    released_at: "2026-06-13T11:08Z",    note: "Sanexio-Portal + dynamic graph" },
  ],
  notes: [
    "Cortex-Harness ist die Skill-Engine für Hermes-Agents — nicht das Sanexio-Dashboard.",
    "Sanexio Cortex Dashboard ist manuell gepflegt (dieses File). Update-Reflex: Datei bearbeiten, committen, Service restart.",
  ],
};
