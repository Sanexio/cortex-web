#!/usr/bin/env bun
// probe-design.mjs — Computed-Style-Probe via Page-Registry.
//
// Liest tools/page-registry.mjs und iteriert über alle Pages × Viewports ×
// Selektoren. Exit 0 = alle Assertions greifen auf allen Pages.
// Exit 1 = mindestens ein Computed-Style-Mismatch oder fehlendes Element.
//
// Usage:
//   bun run tools/probe-design.mjs                 # alle Pages
//   bun run tools/probe-design.mjs --slug=home     # nur eine Page
//   bun run tools/probe-design.mjs --slug=karriere
//
// Reference: _rules/FEHLERPROTOKOLL.md#PXZ-E-004, Sprint-0 S0.4.

import { launch } from "puppeteer-core";
import { pages } from "./page-registry.mjs";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const slugArg = process.argv.find((a) => a.startsWith("--slug="));
const onlySlug = slugArg ? slugArg.slice(7) : null;

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--ignore-certificate-errors", "--allow-insecure-localhost"],
});
const page = await browser.newPage();
await page.setCacheEnabled(false);

const PROBED_PROPS = [
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
  "color",
  "maxWidth",
  // S2.0e — Component-Probe: Typografie- und Transform-Properties
  "textTransform",
  "fontWeight",
  "fontSize",
];

let failures = 0;
let pageCount = 0;

for (const pageDef of pages) {
  if (onlySlug && pageDef.slug !== onlySlug) continue;
  pageCount++;

  console.log(`\n=== Page: ${pageDef.slug} (${pageDef.url}) ===`);

  for (const vp of pageDef.viewports) {
    const specs = pageDef.expected?.[vp] ?? {};
    const existsList = pageDef.exists ?? [];

    await page.setViewport({ width: vp, height: 1000 });
    await page.goto(pageDef.url + "?v=" + Date.now(), {
      waitUntil: "networkidle2",
    });

    console.log(`\n  [Viewport ${vp}px]`);

    for (const sel of existsList) {
      const ok = await page.evaluate(
        (s) => !!document.querySelector(s),
        sel
      );
      const mark = ok ? "✓" : "✗";
      console.log(`    ${mark} ${sel} exists in DOM`);
      if (!ok) failures++;
    }

    for (const [sel, props] of Object.entries(specs)) {
      const actual = await page.evaluate(
        (s, probed) => {
          const el = document.querySelector(s);
          if (!el) return null;
          const cs = window.getComputedStyle(el);
          const out = {};
          for (const p of probed) out[p] = cs[p];
          return out;
        },
        sel,
        PROBED_PROPS
      );

      if (!actual) {
        console.log(`    ✗ ${sel} — not found in DOM`);
        failures++;
        continue;
      }

      for (const [prop, want] of Object.entries(props)) {
        const got = actual[prop];
        const ok = got === want;
        const mark = ok ? "✓" : "✗";
        console.log(`    ${mark} ${sel} { ${prop}: ${got} }  want: ${want}`);
        if (!ok) failures++;
      }
    }
  }
}

await browser.close();

if (pageCount === 0) {
  console.log(`\nFAIL — kein Page-Match für --slug=${onlySlug}`);
  process.exit(1);
}

if (failures > 0) {
  console.log(`\nFAIL — ${failures} mismatch(es) auf ${pageCount} Page(s).`);
  process.exit(1);
} else {
  console.log(
    `\nOK — alle Assertions auf ${pageCount} Page(s) greifen (DESIGN_GUIDELINES §13).`
  );
  process.exit(0);
}
