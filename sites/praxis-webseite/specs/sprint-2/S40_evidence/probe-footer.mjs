#!/usr/bin/env bun
// S40-Footer — Probe nach Text-×2 + full-width (Dr. Stracke 2026-04-24).
//
// Misst Footer-Texte + max-width + macht Full-Footer-Screenshot pro Viewport.

import { launch } from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS_DIR = join(__dirname, "footer-shots");
mkdirSync(SHOTS_DIR, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/";

const VIEWPORTS = [
  { name: "1920", w: 1920, h: 1080 },
  { name: "1440", w: 1440, h: 900 },
  { name: "430",  w: 430,  h: 932 },
];

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--ignore-certificate-errors", "--allow-insecure-localhost"],
});

console.log("\n=== S40-Footer — Probe (Text ×2, full-width) ===\n");

for (const vp of VIEWPORTS) {
  const p = await browser.newPage();
  await p.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 2 });
  await p.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });

  const probe = await p.evaluate(() => {
    const pick = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        sel,
        fontSize: parseFloat(s.fontSize),
        width: Math.round(r.width),
      };
    };

    const footer = document.querySelector(".pxz-footer");
    const footerInner = document.querySelector(".pxz-footer-inner");
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    const innerRect = footerInner ? footerInner.getBoundingClientRect() : null;

    return {
      footerWidth: footerRect ? Math.round(footerRect.width) : null,
      innerWidth: innerRect ? Math.round(innerRect.width) : null,
      innerMaxWidth: footerInner ? getComputedStyle(footerInner).maxWidth : null,
      samples: [
        pick(".pxz-footer-brand-name"),
        pick(".pxz-footer-brand-tagline"),
        pick(".pxz-footer-brand-claim"),
        pick(".pxz-footer-col-title"),
        pick(".pxz-footer-nav a"),
        pick(".pxz-footer-contact-link"),
        pick(".pxz-footer-hours-row"),
        pick(".pxz-footer-bottom"),
      ].filter(Boolean),
    };
  });

  // Scroll to footer and screenshot only footer-area
  await p.evaluate(() => {
    const f = document.querySelector(".pxz-footer");
    if (f) f.scrollIntoView({ block: "start" });
  });
  await new Promise((r) => setTimeout(r, 300));

  const shotPath = join(SHOTS_DIR, `footer-${vp.name}.png`);
  await p.screenshot({
    path: shotPath,
    clip: { x: 0, y: 0, width: vp.w, height: Math.min(vp.h, 1400) },
  });

  console.log(`--- VP ${vp.name}px ---`);
  console.log(
    `  footer width:     ${probe.footerWidth}px (viewport ${vp.w}px)  ${
      probe.footerWidth === vp.w ? "✓ full-width" : "FAIL"
    }`
  );
  console.log(
    `  inner max-width:  ${probe.innerMaxWidth}  ${
      probe.innerMaxWidth === "none" ? "✓" : "(not 'none')"
    }`
  );
  console.log(`  Text-Samples:`);
  for (const s of probe.samples) {
    console.log(`    ${s.sel.padEnd(36)} ${String(s.fontSize).padStart(3)}px`);
  }
  console.log(`  screenshot:       footer-shots/footer-${vp.name}.png\n`);

  await p.close();
}

await browser.close();
console.log("Done.");
