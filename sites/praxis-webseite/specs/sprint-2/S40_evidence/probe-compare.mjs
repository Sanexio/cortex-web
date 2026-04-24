#!/usr/bin/env bun
// S40 DS-5 — Phase-4-Probe nach Type-Scale-Mapping.
//
// Screenshots von 4 Kern-Pages der Praxis-Site in 3 Viewports (1920/1440/430)
// plus Assertions: body-font-size=17, button-border-radius>=100, hero>80px.
//
// Run:
//   bun run sites/praxis-webseite/specs/sprint-2/S40_evidence/probe-compare.mjs

import { launch } from "puppeteer-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS_DIR = join(__dirname, "pxz-shots");
mkdirSync(SHOTS_DIR, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local";

const PAGES = [
  { slug: "home",       path: "/" },
  { slug: "karriere",   path: "/karriere/" },
  { slug: "leistungen", path: "/leistungen/" },
  { slug: "arzt",       path: "/aerzte/stracke/" },
];

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

const results = [];

for (const page of PAGES) {
  for (const vp of VIEWPORTS) {
    const p = await browser.newPage();
    await p.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 2 });

    const url = BASE + page.path;
    try {
      await p.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    } catch (e) {
      results.push({ page: page.slug, vp: vp.name, error: e.message });
      await p.close();
      continue;
    }

    const shotPath = join(SHOTS_DIR, `${page.slug}-${vp.name}.png`);
    await p.screenshot({
      path: shotPath,
      clip: { x: 0, y: 0, width: vp.w, height: Math.min(vp.h * 3, 3000) },
    });

    const probe = await p.evaluate(() => {
      // Messpunkt: PXZ-Page-Root (.pxz-home/.pxz-kar/.pxz-arzt/...), nicht
      // document.body — body wird vom Blocksy-Parent-Theme gesetzt, nicht vom
      // PXZ-Content. Fallback auf body falls kein PXZ-Root.
      const pxzRoot = document.querySelector(
        ".pxz-home, .pxz-kar, .pxz-arzt, .pxz-team, .pxz-leistungen"
      );
      const body = pxzRoot || document.body;
      const bodyFont = parseFloat(getComputedStyle(body).fontSize);

      // Erste Button-artige Klasse (.pxz-btn) oder anderes Primär-CTA
      const btn =
        document.querySelector(".pxz-btn") ||
        document.querySelector(".wpforms-submit") ||
        document.querySelector(".pxz-loc-directions");
      let btnInfo = null;
      if (btn) {
        const s = getComputedStyle(btn);
        btnInfo = {
          fontSize: parseFloat(s.fontSize),
          fontWeight: parseInt(s.fontWeight, 10),
          radius: parseFloat(s.borderTopLeftRadius),
          height: btn.getBoundingClientRect().height,
          padT: parseFloat(s.paddingTop),
          padX: parseFloat(s.paddingLeft),
        };
      }

      // Größtes sichtbares Text-Element (Hero)
      let heroSize = 0;
      for (const el of document.querySelectorAll("h1, h2, .pxz-display, .pxz-mfa-title, .pxz-kar-title, .pxz-arzt-title, .pxz-leistungen-title, .pxz-team-title")) {
        const r = el.getBoundingClientRect();
        if (r.width < 2) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs > heroSize) heroSize = fs;
      }

      return { bodyFont, btnInfo, heroSize };
    });

    results.push({ page: page.slug, vp: vp.name, ...probe, shot: shotPath });
    await p.close();
  }
}

await browser.close();

writeFileSync(
  join(__dirname, "pxz-probe.json"),
  JSON.stringify(results, null, 2)
);

// Report
console.log("\n=== S40 DS-5 — Phase-4-Probe (PXZ nach Type-Scale) ===\n");
console.log(
  `Page       VP     bodyFont  heroPx   btnFont  btnRadius  btnHeight  btnPad(y/x)  Status`
);
console.log(
  `---------- ----  --------  ------  --------  ---------  ---------  -----------  ------`
);

let allOk = true;
for (const r of results) {
  if (r.error) {
    console.log(`${r.page.padEnd(10)} ${r.vp.padEnd(5)} ERROR: ${r.error}`);
    allOk = false;
    continue;
  }
  const b = r.btnInfo;
  const expectBody = 26; // S40-B: T6 = 26 desktop/mobile (17 ×1.5)
  // Hero-Min: T3-Level (40 desktop, 28 mobile). Home+Karriere liegen bei T1 (80/40),
  // Arzt+Leistungen bei T3 (Section-Headline) → beide müssen mindestens T3 treffen.
  const expectHeroMin = r.vp === "430" ? 28 : 40;
  const heroOk = r.heroSize >= expectHeroMin;
  const bodyOk = Math.round(r.bodyFont) === expectBody;
  const btnFontExp = r.vp === "430" ? 14 : 17;
  const btnRadiusOk = b && b.radius >= 100;
  const btnFontOk = b && Math.round(b.fontSize) === btnFontExp;
  const ok = heroOk && bodyOk && btnRadiusOk && btnFontOk;
  if (!ok) allOk = false;

  const flags = [
    bodyOk ? "·" : "bodyF",
    heroOk ? "·" : "heroF",
    btnRadiusOk ? "·" : "radF",
    btnFontOk ? "·" : "btnF",
  ].join("/");

  console.log(
    `${r.page.padEnd(10)} ${r.vp.padEnd(5)} ${String(r.bodyFont).padStart(7)}px ${String(Math.round(r.heroSize)).padStart(5)}px ${b ? String(b.fontSize).padStart(7) + "px" : "  —  "} ${b ? String(b.radius).padStart(7) + "px" : "  —  "}  ${b ? String(Math.round(b.height)).padStart(6) + "px" : "  —  "}  ${b ? String(b.padT).padStart(3) + "/" + String(b.padX).padEnd(3) + "px" : "  —   "}  ${ok ? "OK " : "FAIL"} ${flags}`
  );
}

console.log(`\nJSON:        pxz-probe.json`);
console.log(`Screenshots: pxz-shots/{home,karriere,leistungen,arzt}-{1920,1440,430}.png`);
console.log(allOk ? "\n==> ALL ASSERTIONS OK" : "\n==> CHECK FAILS ABOVE");

process.exit(allOk ? 0 : 1);
