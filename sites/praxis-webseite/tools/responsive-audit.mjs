#!/usr/bin/env bun
// responsive-audit.mjs — Multi-Viewport-Audit gegen .de-Live (Basic-Auth).
//
// Schießt 5 Viewports × N Pages, misst horizontal-Overflow + computed-Widths
// fuer Hero/Card/Footer/Input-Container, und schreibt Screenshots + JSON.
//
// Usage:
//   bun run tools/responsive-audit.mjs                # alle Pages, alle VPs
//   bun run tools/responsive-audit.mjs --slug=home    # Filter
//   PXZ_AUTH=user:pass bun run tools/responsive-audit.mjs
//
// Output:
//   screenshots/responsive-audit-YYYY-MM-DD/
//     <slug>_<vp>.png         — full-page screenshot
//     report.json             — defects pro page-vp

import { launch } from "puppeteer-core";
import { mkdir, writeFile } from "fs/promises";
import { resolve } from "path";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const today = new Date().toISOString().slice(0, 10);
const OUT = resolve(import.meta.dir, `../screenshots/responsive-audit-${today}`);
await mkdir(OUT, { recursive: true });

const AUTH = process.env.PXZ_AUTH || "praxis:Sanexio";
const [USER, PASS] = AUTH.split(":");
const BASE = "https://westend-hausarzt.de";

const VIEWPORTS = [
  { w: 375,  h: 812,  label: "375"  },  // iPhone 13/14 Mini
  { w: 768,  h: 1024, label: "768"  },  // iPad portrait
  { w: 1024, h: 768,  label: "1024" },  // iPad landscape / small laptop
  { w: 1440, h: 900,  label: "1440" },  // standard desktop
  { w: 1920, h: 1080, label: "1920" },  // full-HD
];

const PAGES = [
  { slug: "home",        path: "/" },
  { slug: "karriere",    path: "/karriere/" },
  { slug: "praxis",      path: "/praxis/" },
  { slug: "team",        path: "/team/" },
  { slug: "untersuchungen", path: "/untersuchungen/" },
  { slug: "labor",       path: "/labor/" },
  { slug: "standorte",   path: "/standorte/" },
  { slug: "kontakt",     path: "/contact-us/" },
  { slug: "faq",         path: "/faq/" },
  { slug: "dr-stracke",  path: "/dr-stracke/" },
  { slug: "body-check",  path: "/body-check/" },
  { slug: "labor-status-baseline", path: "/labor/status-baseline/" },
];

const slugArg = process.argv.find((a) => a.startsWith("--slug="));
const onlySlug = slugArg ? slugArg.slice(7) : null;

const SELECTORS = [
  "body",
  "main",
  ".pxz-hero, .pxz-kar-hero, .pxz-pg-hero, .pxz-hub-hero",
  ".pxz-mfa-card, .pxz-kar-card, .pxz-hub-product-hero",
  ".pxz-footer-inner",
  ".pxz-footer-grid",
  "form",
];

function pxToNum(s) {
  if (!s) return null;
  const m = String(s).match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--ignore-certificate-errors", "--no-sandbox"],
});

const report = {
  generated: new Date().toISOString(),
  base: BASE,
  viewports: VIEWPORTS.map((v) => v.label),
  pages: [],
};

let totalProbes = 0;
let totalDefects = 0;

for (const pageDef of PAGES) {
  if (onlySlug && pageDef.slug !== onlySlug) continue;
  const url = `${BASE}${pageDef.path}`;
  const pageReport = { slug: pageDef.slug, url, viewports: {} };
  console.log(`\n=== ${pageDef.slug} → ${url} ===`);

  for (const vp of VIEWPORTS) {
    totalProbes++;
    const page = await browser.newPage();
    await page.authenticate({ username: USER, password: PASS });
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
    await page.setCacheEnabled(false);

    let nav;
    try {
      nav = await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });
    } catch (e) {
      console.log(`  [${vp.label}] NAV-ERROR: ${e.message}`);
      pageReport.viewports[vp.label] = { error: e.message };
      await page.close();
      continue;
    }
    if (!nav || nav.status() !== 200) {
      const code = nav ? nav.status() : "no-response";
      console.log(`  [${vp.label}] HTTP ${code}`);
      pageReport.viewports[vp.label] = { http: code };
      await page.close();
      continue;
    }

    const measurement = await page.evaluate((selectors) => {
      const out = {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
        windowInnerWidth: window.innerWidth,
        elements: {},
        widestOverflowingChild: null,
      };
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        out.elements[sel] = {
          rect: { left: rect.left, right: rect.right, width: rect.width },
          maxWidth: cs.maxWidth,
          width: cs.width,
          padding: cs.padding,
          fontSize: cs.fontSize,
          overflowX: cs.overflowX,
        };
      }
      // Find the widest element that overflows the viewport
      const all = document.querySelectorAll("body *");
      let worst = null;
      for (const el of all) {
        const r = el.getBoundingClientRect();
        if (r.right > window.innerWidth + 1) {
          const overflow = r.right - window.innerWidth;
          if (!worst || overflow > worst.overflow) {
            const id = el.id ? `#${el.id}` : "";
            const cls = el.className && typeof el.className === "string"
              ? `.${el.className.trim().split(/\s+/).slice(0, 3).join(".")}`
              : "";
            worst = {
              tag: el.tagName.toLowerCase(),
              id: id || cls,
              right: Math.round(r.right),
              width: Math.round(r.width),
              overflow: Math.round(overflow),
            };
          }
        }
      }
      out.widestOverflowingChild = worst;
      return out;
    }, SELECTORS);

    const overflow = measurement.scrollWidth - vp.w;
    const isOverflow = overflow > 1;

    const screenshotPath = `${OUT}/${pageDef.slug}_${vp.label}.png`;
    try {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (e) {
      console.log(`  [${vp.label}] SCREENSHOT-ERROR: ${e.message}`);
    }

    const defects = [];
    if (isOverflow) {
      defects.push({
        kind: "horizontal-overflow",
        amount: overflow,
        worst: measurement.widestOverflowingChild,
      });
      totalDefects++;
    }

    // Container-Width-Check: hero/card sollte nicht WEITER sein als viewport
    for (const [sel, m] of Object.entries(measurement.elements)) {
      const w = m.rect.width;
      if (w > vp.w + 1) {
        defects.push({
          kind: "container-wider-than-viewport",
          selector: sel,
          width: Math.round(w),
        });
        totalDefects++;
      }
    }

    pageReport.viewports[vp.label] = {
      vp: vp.w,
      overflow,
      defects,
      measurement,
    };

    const status = defects.length === 0 ? "OK" : `${defects.length} defect(s)`;
    console.log(`  [${vp.label}] ${status}${isOverflow ? ` overflow=+${overflow}px` : ""}`);
    if (measurement.widestOverflowingChild) {
      console.log(`           worst: ${JSON.stringify(measurement.widestOverflowingChild)}`);
    }

    await page.close();
  }
  report.pages.push(pageReport);
}

await browser.close();

await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(`\n=== Summary: ${totalProbes} probes · ${totalDefects} defects ===`);
console.log(`Report: ${OUT}/report.json`);
console.log(`Screenshots: ${OUT}/`);
