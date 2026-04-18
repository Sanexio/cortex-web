#!/usr/bin/env bun
// ============================================================================
// DEPRECATED (2026-04-18) — zugunsten von `tools/ab-diff.mjs` abgelöst.
// ab-diff.mjs ist generisch (Home + Karriere via PXZ_URL env-var), inkognito-
// headless, cache-disabled, mit Alignment-Check und Selector-Probe.
// Dieses Skript bleibt als Ad-hoc-Fallback. Neue Shots über ab-diff.mjs.
// ============================================================================
// Desktop + mobile screenshots of the /karriere/ page and its form card.
// Uses puppeteer-core + local Chrome, same pattern as probe-design.mjs.
import { launch } from "puppeteer-core";
import { mkdir } from "fs/promises";
import { resolve } from "path";

const URL =
  "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/karriere/";
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = resolve(import.meta.dir, "../screenshots/claude");
await mkdir(OUT, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const version = "v2.6.0";

const browser = await launch({
  executablePath: CHROME,
  args: ["--ignore-certificate-errors"],
  headless: "new",
});

async function shoot(label, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 800));

  const fullPath = `${OUT}/${today}_${version}_karriere_${label}_full.png`;
  await page.screenshot({ path: fullPath, fullPage: true });
  console.log("saved", fullPath);

  const card = await page.$(".pxz-kar-card");
  if (card) {
    const cardPath = `${OUT}/${today}_${version}_karriere_${label}_card.png`;
    await card.screenshot({ path: cardPath });
    console.log("saved", cardPath);
  }
  await page.close();
}

await shoot("desktop1440", { width: 1440, height: 900, deviceScaleFactor: 1 });
await shoot("tablet768", { width: 768, height: 1024, deviceScaleFactor: 1 });
await shoot("mobile430", { width: 430, height: 932, deviceScaleFactor: 2 });

await browser.close();
console.log("done");
