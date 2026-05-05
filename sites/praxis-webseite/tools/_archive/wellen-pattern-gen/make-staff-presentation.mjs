#!/usr/bin/env bun
// make-staff-presentation.mjs — Builds a staff-review PDF of the homepage.
// W1: three separate PDFs (cover + desktop + mobile), merged via pdfunite.
// Output: /Users/cluster-mini-02/Downloads/<filename>.pdf

import { launch } from "puppeteer-core";
import { execFileSync } from "child_process";
import { existsSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/";
const PXZ_VERSION = "2.7.67";
const TODAY = new Date().toISOString().slice(0, 10);
const OUT = `/Users/cluster-mini-02/Downloads/Praxis-Webseite-Homepage-Beurteilung-${TODAY}.pdf`;
const TMP = tmpdir();
const COVER = join(TMP, `pxz-cover-${Date.now()}.pdf`);
const DESKTOP = join(TMP, `pxz-desktop-${Date.now()}.pdf`);

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--ignore-certificate-errors", "--allow-insecure-localhost"],
});

// ---------- Cover ----------
console.log("→ Building cover...");
const coverHTML = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<title>Homepage-Beurteilung</title>
<style>
  @page { size: A4; margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
         color: #111; margin: 0; -webkit-print-color-adjust: exact; }
  .wrap { min-height: 250mm; display: flex; flex-direction: column; justify-content: center; }
  h1 { font-size: 30pt; line-height: 1.15; margin: 0 0 12mm; font-weight: 700;
       letter-spacing: -0.02em; }
  h1 small { display: block; font-weight: 400; color: #555; font-size: 19pt; margin-top: 4mm; }
  .meta { font-size: 11pt; color: #555; line-height: 1.7; margin-bottom: 14mm; }
  .meta strong { color: #111; font-weight: 600; }
  .ask { font-size: 12pt; line-height: 1.55; padding: 8mm; border-radius: 4mm;
         background: #F4F4F6; border-left: 3px solid #C0392B; }
  .ask h2 { margin: 0 0 4mm; font-size: 13pt; font-weight: 600; }
  ul { margin: 0; padding-left: 5mm; }
  li { margin-bottom: 1.5mm; }
</style></head>
<body><div class="wrap">
  <h1>Praxiszentrum Dr. Stracke &amp; Kollegen<small>Homepage-Entwurf zur Beurteilung</small></h1>
  <div class="meta">
    <strong>Stand:</strong> ${TODAY}<br>
    <strong>Version:</strong> PXZ ${PXZ_VERSION}<br>
    <strong>Inhalt dieser PDF:</strong> Startseite in der Desktop-Ansicht<br>
    <strong>Status:</strong> Entwurf, lokale Vorschau (noch nicht live)
  </div>
  <div class="ask">
    <h2>Bitte um Feedback</h2>
    <p style="margin: 0 0 4mm;">Ich bitte Euch, die folgenden Seiten anzuschauen und mir Rückmeldung zu geben:</p>
    <ul>
      <li>Wirkt die Seite einladend und professionell?</li>
      <li>Sind die Texte verständlich und sprechen die richtigen Patient:innen an?</li>
      <li>Fehlt eine wichtige Information?</li>
      <li>Stimmen die fachlichen Angaben (Fachrichtungen, Team, Standorte)?</li>
    </ul>
    <p style="margin: 4mm 0 0;">Feedback gerne direkt an mich — schriftlich oder im Gespräch.</p>
  </div>
</div></body></html>`;

const coverPage = await browser.newPage();
await coverPage.setContent(coverHTML, { waitUntil: "load", timeout: 30000 });
await coverPage.pdf({
  path: COVER,
  format: "A4",
  printBackground: true,
  margin: { top: "18mm", right: "18mm", bottom: "18mm", left: "18mm" },
});
await coverPage.close();

// ---------- Desktop ----------
async function captureViewport(viewport, scale, outPath, label) {
  console.log(`→ Capturing ${label} (${viewport}px)...`);
  const p = await browser.newPage();
  await p.setCacheEnabled(false);
  await p.setViewport({
    width: viewport,
    height: 900,
    deviceScaleFactor: scale,
  });
  await p.goto(URL + "?cb=" + Date.now(), {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  // 1. Disable lazy loading on all images and force any data-src into src
  await p.evaluate(() => {
    document.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      if (img.dataset.src && !img.src) img.src = img.dataset.src;
    });
  });
  // 2. Scroll through entire page to trigger IntersectionObserver-based loaders
  await p.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        y += step;
        if (y >= document.body.scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 80);
    });
  });
  // 3. Wait for all images to actually finish loading
  await p.evaluate(async () => {
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((res) => {
              img.addEventListener("load", res, { once: true });
              img.addEventListener("error", res, { once: true });
            })
      )
    );
  });
  // 4. Settle frame for slider-init etc.
  await new Promise((r) => setTimeout(r, 1000));
  await p.emulateMediaType("screen");
  await p.pdf({
    path: outPath,
    width: `${viewport}px`,
    printBackground: true,
    pageRanges: "1-",
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await p.close();
}

await captureViewport(1440, 1, DESKTOP, "desktop");

await browser.close();

// ---------- Merge ----------
console.log("→ Merging via pdfunite...");
execFileSync("/opt/homebrew/bin/pdfunite", [COVER, DESKTOP, OUT]);

// ---------- Cleanup ----------
[COVER, DESKTOP].forEach((f) => existsSync(f) && unlinkSync(f));

console.log(`✓ PDF written: ${OUT}`);
