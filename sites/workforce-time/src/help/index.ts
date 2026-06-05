// In-app handbook registry. Chapters are markdown files bundled via Vite
// `?raw` imports; tools/build-handbuch.mjs renders the same files into
// docs/HANDBUCH.md for print/offline use. Content must stay tenant-neutral
// (OSS repo) — practice-specific naming comes from tenant config at runtime.
import einfuehrung from "./content/01-einfuehrung.md?raw";
import anmeldung from "./content/02-anmeldung.md?raw";
import uebersicht from "./content/03-uebersicht.md?raw";
import schichtplan from "./content/04-schichtplan.md?raw";
import arbeitszeiten from "./content/05-arbeitszeiten.md?raw";
import urlaub from "./content/06-urlaub.md?raw";
import stempeluhr from "./content/07-stempeluhr.md?raw";
import freigaben from "./content/08-freigaben.md?raw";
import mitarbeiter from "./content/09-mitarbeiter.md?raw";
import lohnabrechnung from "./content/10-lohnabrechnung.md?raw";
import auswertung from "./content/11-auswertung.md?raw";
import importSync from "./content/12-import-sync.md?raw";
import benutzerEinstellungen from "./content/13-benutzer-einstellungen.md?raw";
import faq from "./content/14-faq.md?raw";

export type HelpRole = "employee" | "admin";

export type HelpChapter = {
  id: string;
  title: string;
  /** Roles whose table of contents lists this chapter. */
  roles: HelpRole[];
  content: string;
};

const ALL: HelpRole[] = ["employee", "admin"];
const ADMIN: HelpRole[] = ["admin"];

export const helpChapters: HelpChapter[] = [
  { id: "einfuehrung", title: "Einführung", roles: ALL, content: einfuehrung },
  { id: "anmeldung", title: "Anmeldung & Sicherheit", roles: ALL, content: anmeldung },
  { id: "uebersicht", title: "Übersicht", roles: ALL, content: uebersicht },
  { id: "schichtplan", title: "Kalenderwoche & Tausch", roles: ALL, content: schichtplan },
  { id: "arbeitszeiten", title: "Arbeitszeiten & Korrekturen", roles: ALL, content: arbeitszeiten },
  { id: "urlaub", title: "Urlaub & Abwesenheit", roles: ALL, content: urlaub },
  { id: "stempeluhr", title: "Stempeluhr", roles: ALL, content: stempeluhr },
  { id: "freigaben", title: "Freigaben", roles: ADMIN, content: freigaben },
  { id: "mitarbeiter", title: "Mitarbeiter-Stammdaten", roles: ADMIN, content: mitarbeiter },
  { id: "lohnabrechnung", title: "Lohnabrechnung & Export", roles: ADMIN, content: lohnabrechnung },
  { id: "auswertung", title: "Auswertung", roles: ADMIN, content: auswertung },
  { id: "import-sync", title: "Import & Sync", roles: ADMIN, content: importSync },
  { id: "benutzer-einstellungen", title: "Benutzer, Rollen & Einstellungen", roles: ADMIN, content: benutzerEinstellungen },
  { id: "faq", title: "Häufige Fragen", roles: ALL, content: faq }
];

/** Maps each app view to the chapter the topbar help button opens. */
export const helpChapterForView: Record<string, string> = {
  dashboard: "uebersicht",
  plan: "schichtplan",
  time: "arbeitszeiten",
  absences: "urlaub",
  approvals: "freigaben",
  employees: "mitarbeiter",
  payroll: "lohnabrechnung",
  reports: "auswertung",
  imports: "import-sync",
  stamp: "stempeluhr",
  admin: "benutzer-einstellungen",
  settings: "benutzer-einstellungen"
};

export function chapterById(id: string): HelpChapter | undefined {
  return helpChapters.find((chapter) => chapter.id === id);
}

export function chaptersForRole(role: HelpRole): HelpChapter[] {
  return helpChapters.filter((chapter) => chapter.roles.includes(role));
}
