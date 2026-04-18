#!/usr/bin/env bun
// probe-design.mjs — Computed-Style-Probe gegen DESIGN_GUIDELINES §13 harte Werte.
// Exit 0 = alle harten Werte greifen. Exit 1 = mindestens ein Wert falsch.
//
// Usage:
//   bun run tools/probe-design.mjs
//   bun run tools/probe-design.mjs --url=https://... (optional Override)
//
// Reference: _rules/FEHLERPROTOKOLL.md#PXZ-E-004

import { launch } from "puppeteer-core";

const DEFAULT_URL =
  "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/";
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const urlArg = process.argv.find((a) => a.startsWith("--url="));
const URL = urlArg ? urlArg.slice(6) : DEFAULT_URL;

// Expected values per viewport (DESIGN_GUIDELINES §13 + §14, updated v2.5.0).
// Keys are raw CSS selectors (full syntax).
// Badge is now inline (static) on ALL viewports — consistent left-aligned layout.
// MFA card uses the same padding scale as the Standort card.
const EXPECTED = {
  1440: {
    ".pxz-loc-card--main": {
      paddingTop: "112px",
      paddingLeft: "96px",
      paddingRight: "96px",
      paddingBottom: "96px",
      position: "relative",
    },
    ".pxz-loc-card--main .pxz-loc-badge": {
      position: "static",
    },
    ".pxz-mfa-card": {
      paddingTop: "112px",
      paddingLeft: "96px",
    },
    ".pxz-final-card": {
      padding: "0px",
      backgroundColor: "rgba(0, 0, 0, 0)",
      boxShadow: "none",
    },
  },
  768: {
    ".pxz-loc-card--main": {
      paddingTop: "96px",
      paddingLeft: "72px",
    },
    ".pxz-loc-card--main .pxz-loc-badge": {
      position: "static",
    },
    ".pxz-mfa-card": {
      paddingTop: "96px",
      paddingLeft: "72px",
    },
    ".pxz-hero-sub": {
      textAlign: "center",
    },
  },
  430: {
    ".pxz-loc-card--main": {
      paddingTop: "72px",
      paddingLeft: "40px",
    },
    ".pxz-loc-card--main .pxz-loc-badge": {
      position: "static",
    },
    ".pxz-mfa-card": {
      paddingTop: "72px",
      paddingLeft: "40px",
    },
  },
};

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--ignore-certificate-errors", "--allow-insecure-localhost"],
});
const page = await browser.newPage();
await page.setCacheEnabled(false);

let failures = 0;

for (const [vp, specs] of Object.entries(EXPECTED)) {
  const viewport = Number(vp);
  await page.setViewport({ width: viewport, height: 1000 });
  await page.goto(URL + "?v=" + Date.now(), { waitUntil: "networkidle2" });

  console.log(`\n=== Viewport ${viewport}px ===`);
  for (const [sel, props] of Object.entries(specs)) {
    const actual = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return null;
      const cs = window.getComputedStyle(el);
      const out = {};
      for (const p of [
        "padding",
        "paddingTop",
        "paddingLeft",
        "paddingRight",
        "paddingBottom",
        "position",
        "top",
        "right",
        "backgroundColor",
        "boxShadow",
        "border",
        "borderRadius",
        "textAlign",
      ]) {
        out[p] = cs[p];
      }
      return out;
    }, sel);

    if (!actual) {
      console.log(`  ✗ ${sel} — not found in DOM`);
      failures++;
      continue;
    }

    for (const [prop, want] of Object.entries(props)) {
      const got = actual[prop];
      const ok = got === want;
      const mark = ok ? "✓" : "✗";
      console.log(`  ${mark} ${sel} { ${prop}: ${got} }  want: ${want}`);
      if (!ok) failures++;
    }
  }
}

await browser.close();

if (failures > 0) {
  console.log(`\nFAIL — ${failures} mismatch(es).`);
  process.exit(1);
} else {
  console.log("\nOK — all computed styles match DESIGN_GUIDELINES §13.");
  process.exit(0);
}
