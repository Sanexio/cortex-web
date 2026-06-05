#!/usr/bin/env node
// Renders the in-app help chapters (src/help/content/*.md) into a single
// printable handbook at docs/HANDBUCH.md. The chapter files are the single
// source of truth — edit them, then re-run: node tools/build-handbuch.mjs
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "src", "help", "content");
const outFile = join(root, "docs", "HANDBUCH.md");

// Titles and role tags mirror src/help/index.ts (kept simple on purpose:
// this script must run without a TS toolchain).
const chapterMeta = {
  "01-einfuehrung.md": { title: "Einführung", admin: false },
  "02-anmeldung.md": { title: "Anmeldung & Sicherheit", admin: false },
  "03-uebersicht.md": { title: "Übersicht", admin: false },
  "04-schichtplan.md": { title: "Kalenderwoche & Tausch", admin: false },
  "05-arbeitszeiten.md": { title: "Arbeitszeiten & Korrekturen", admin: false },
  "06-urlaub.md": { title: "Urlaub & Abwesenheit", admin: false },
  "07-stempeluhr.md": { title: "Stempeluhr", admin: false },
  "08-freigaben.md": { title: "Freigaben", admin: true },
  "09-mitarbeiter.md": { title: "Mitarbeiter-Stammdaten", admin: true },
  "10-lohnabrechnung.md": { title: "Lohnabrechnung & Export", admin: true },
  "11-auswertung.md": { title: "Auswertung", admin: true },
  "12-import-sync.md": { title: "Import & Sync", admin: true },
  "13-benutzer-einstellungen.md": { title: "Benutzer, Rollen & Einstellungen", admin: true },
  "14-faq.md": { title: "Häufige Fragen", admin: false }
};

const files = readdirSync(contentDir).filter((name) => name.endsWith(".md")).sort();
const missing = files.filter((name) => !chapterMeta[name]);
if (missing.length) {
  console.error(`Kapitel ohne Meta-Eintrag in build-handbuch.mjs: ${missing.join(", ")}`);
  process.exit(1);
}

const slug = (title) =>
  title
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const toc = files
  .map((name, index) => {
    const meta = chapterMeta[name];
    const tag = meta.admin ? " *(Admin)*" : "";
    return `${index + 1}. [${meta.title}](#${index + 1}-${slug(meta.title)})${tag}`;
  })
  .join("\n");

const chapters = files
  .map((name, index) => {
    const meta = chapterMeta[name];
    const body = readFileSync(join(contentDir, name), "utf8").trim();
    // Demote chapter-internal headings one level under the chapter heading.
    const demoted = body.replace(/^### /gm, "#### ").replace(/^## /gm, "### ");
    return `## ${index + 1}. ${meta.title}\n\n${demoted}`;
  })
  .join("\n\n---\n\n");

const handbook = `# Workforce-Time — Handbuch

> Generiert aus \`src/help/content/\` (identisch mit der In-App-Hilfe).
> Nicht direkt editieren — Kapitel ändern und \`node tools/build-handbuch.mjs\` ausführen.

## Inhalt

${toc}

---

${chapters}
`;

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, handbook);
console.log(`Handbuch geschrieben: ${outFile} (${files.length} Kapitel)`);
