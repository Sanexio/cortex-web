#!/usr/bin/env bun
// shoot.mjs — Generischer Screenshot-Runner via Page-Registry.
//
// Nimmt für eine oder alle Seiten aus tools/page-registry.mjs Full-Page-
// Screenshots auf, pro Viewport. Dateiname-Schema:
//   screenshots/claude/YYYY-MM-DD_vX.Y.Z_<slug>_<label><vp>_full.png
//
// Usage:
//   bun run tools/shoot.mjs                         # alle Pages, alle VPs
//   bun run tools/shoot.mjs --slug=home
//   bun run tools/shoot.mjs --slug=karriere --ver=2.6.0
//
// Eingeführt durch Sprint 0 / S0.4. Ersetzt shoot_karriere.mjs.

import { launch } from "puppeteer-core";
import { mkdir } from "fs/promises";
import { resolve } from "path";
import { pages } from "./page-registry.mjs";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = resolve(import.meta.dir, "../screenshots/claude");
await mkdir(OUT, { recursive: true });

const slugArg = process.argv.find((a) => a.startsWith("--slug="));
const verArg = process.argv.find((a) => a.startsWith("--ver="));
const onlySlug = slugArg ? slugArg.slice(7) : null;
const ver = (verArg ? verArg.slice(6) : "unversioned").replace(/^v/, "");

const today = new Date().toISOString().slice(0, 10);

function labelFor(vp) {
  if (vp >= 1200) return "desktop";
  if (vp >= 600) return "tablet";
  return "mobile";
}

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--ignore-certificate-errors", "--allow-insecure-localhost"],
});

async function shoot(pageDef, viewport) {
  const p = await browser.newPage();
  await p.setCacheEnabled(false);
  await p.setViewport({
    width: viewport,
    height: 900,
    deviceScaleFactor: viewport <= 430 ? 2 : 1,
  });
  await p.goto(pageDef.url + "?v=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 30000,
  });
  await new Promise((r) => setTimeout(r, 800));
  const label = labelFor(viewport);
  const filename = `${today}_v${ver}_${pageDef.slug}_${label}${viewport}_full.png`;
  const path = `${OUT}/${filename}`;
  await p.screenshot({ path, fullPage: true });
  console.log("saved", filename);
  await p.close();
}

let matched = 0;
for (const pageDef of pages) {
  if (onlySlug && pageDef.slug !== onlySlug) continue;
  matched++;
  for (const vp of pageDef.viewports) {
    await shoot(pageDef, vp);
  }
}

await browser.close();

if (matched === 0) {
  console.error(`FAIL — kein Page-Match für --slug=${onlySlug}`);
  process.exit(1);
}
console.log("done");
