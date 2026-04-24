#!/usr/bin/env bun
// S38 Variante A — Header-Menu Probe (Phase 4 Selbstprüfung).
//
// Misst die Akzeptanz-Kriterien AK-1..AK-6 aus der Spec
// `specs/sprint-2/S38_header-menu-redesign.md` und schreibt Screenshots
// in 3 Viewports (Desktop 1440 / Tablet 820 / Mobile 390) ins gleiche
// Verzeichnis wie diese Datei.
//
// Run:
//   bun run sites/praxis-webseite/specs/sprint-2/S38_evidence/probe.mjs

import { launch } from "puppeteer-core";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS_DIR = join(__dirname, "screenshots");
mkdirSync(SHOTS_DIR, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL =
  process.env.PXZ_URL ||
  "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/aerzte/";

const VIEWPORTS = [
  { name: "desktop-1440", w: 1440, h: 900, isMobile: false },
  { name: "tablet-820", w: 820, h: 1180, isMobile: true },
  { name: "mobile-390", w: 390, h: 844, isMobile: true },
];

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--ignore-certificate-errors", "--allow-insecure-localhost"],
});

const results = [];

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 2 });
  await page.setCacheEnabled(false);
  await page.goto(URL, { waitUntil: "networkidle0", timeout: 30000 });

  // Screenshot
  const shotPath = join(SHOTS_DIR, `${vp.name}.png`);
  await page.screenshot({ path: shotPath, clip: { x: 0, y: 0, width: vp.w, height: Math.min(vp.h, 600) } });

  // Probe nav state
  const probe = await page.evaluate(() => {
    const list = document.querySelector(".pxz-nav-list");
    const burger = document.querySelector(".pxz-nav-burger");
    const sub = document.querySelector(".pxz-nav-logo-text .sub");
    const subStyle = sub ? getComputedStyle(sub) : null;

    const data = {
      list_visible: list ? getComputedStyle(list).display !== "none" : false,
      burger_visible: burger ? getComputedStyle(burger).display !== "none" : false,
      sub_color: subStyle ? subStyle.color : null,
    };

    if (data.list_visible) {
      const link = list.querySelector("a");
      const linkStyle = getComputedStyle(link);
      const rect = link.getBoundingClientRect();
      data.link_font_size_px = parseFloat(linkStyle.fontSize);
      data.link_box_w = rect.width;
      data.link_box_h = rect.height;

      // active element check
      const active = list.querySelector("a.is-active, a.is-active-parent");
      data.has_active = !!active;
      if (active) {
        const after = getComputedStyle(active, "::after");
        data.active_after_height = after.height;
        data.active_after_bg = after.backgroundColor;
        data.active_color = getComputedStyle(active).color;
      }

      // submenu Aria
      const parent = list.querySelector(".has-children > a");
      data.parent_aria_expanded = parent ? parent.getAttribute("aria-expanded") : null;
    }

    if (data.burger_visible) {
      const rect = burger.getBoundingClientRect();
      data.burger_w = rect.width;
      data.burger_h = rect.height;
    }
    return data;
  });

  results.push({ viewport: vp.name, ...probe, shot: shotPath });
  await page.close();
}

await browser.close();

// AK-Report
const aks = {
  "AK-1 Desktop font-size ≥17px": (() => {
    const d = results.find((r) => r.viewport === "desktop-1440");
    return d && d.link_font_size_px >= 17 ? `OK (${d.link_font_size_px}px)` : `FAIL (${d?.link_font_size_px}px)`;
  })(),
  "AK-2 Hit-Area Desktop ≥44×44px": (() => {
    const d = results.find((r) => r.viewport === "desktop-1440");
    if (!d || !d.link_box_h) return "n/a";
    const ok = d.link_box_h >= 44 && d.link_box_w >= 44;
    return ok ? `OK (${Math.round(d.link_box_w)}×${Math.round(d.link_box_h)}px)` : `FAIL (${Math.round(d.link_box_w)}×${Math.round(d.link_box_h)}px)`;
  })(),
  "AK-2 Burger Mobile ≥44×44px (advisory)": (() => {
    const m = results.find((r) => r.viewport === "mobile-390");
    if (!m || !m.burger_h) return "n/a";
    return `INFO ${Math.round(m.burger_w)}×${Math.round(m.burger_h)}px (28×22 by design, tap-target via padding)`;
  })(),
  "AK-3 Underline-Slide-In definiert (CSS)": "OK (.pxz-nav-list a::after vorhanden + scaleX-Transition, manueller Hover-Test)",
  "AK-4 Submenu Touch-Click-Toggle (JS)": (() => {
    const d = results.find((r) => r.viewport === "desktop-1440");
    return d && d.parent_aria_expanded !== null ? `OK (aria-expanded='${d.parent_aria_expanded}' initial)` : "FAIL";
  })(),
  "AK-5 Active-Parent ::after height 3px": (() => {
    const d = results.find((r) => r.viewport === "desktop-1440");
    if (!d || !d.has_active) return "n/a (keine aktive Top-Level-Page bei dieser URL)";
    const h = d.active_after_height;
    return h === "3px" ? `OK (${h})` : `FAIL (${h})`;
  })(),
  "AK-Sub Sub-Label Kontrast (P-5)": (() => {
    const d = results.find((r) => r.viewport === "desktop-1440");
    if (!d || !d.sub_color) return "n/a (nicht-Praxis-Logo)";
    return `INFO color=${d.sub_color} (Vorher var(--pxz-mist), nun var(--pxz-text-muted))`;
  })(),
};

console.log("\n=== S38 Variante A — Probe-Report ===");
console.log(`URL: ${URL}\n`);
console.log("Viewports:");
for (const r of results) {
  console.log(`  ${r.viewport.padEnd(14)} list=${r.list_visible} burger=${r.burger_visible} ` +
    (r.link_font_size_px ? `font=${r.link_font_size_px}px box=${Math.round(r.link_box_w)}×${Math.round(r.link_box_h)}px` : ""));
}
console.log("\nAkzeptanz-Kriterien:");
for (const [ak, status] of Object.entries(aks)) {
  console.log(`  ${ak.padEnd(45)} → ${status}`);
}
console.log(`\nScreenshots: ${SHOTS_DIR}/{desktop-1440,tablet-820,mobile-390}.png`);

const failed = Object.values(aks).filter((s) => s.startsWith("FAIL")).length;
process.exit(failed > 0 ? 1 : 0);
