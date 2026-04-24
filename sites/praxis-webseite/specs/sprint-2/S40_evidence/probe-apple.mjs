#!/usr/bin/env bun
// S40 DS-2 — Puppeteer-Probe apple.com/de (Type-Scale + Button-Metrik).
//
// Ziel: empirische Type-Scale aus Content-Sektion der Apple-Referenz,
// inkl. Button-Geometrie (Padding, Border-Radius, Font-Size). Footer/Nav
// werden ausgeschlossen, damit wir nur produktive Content-Typographie messen.
//
// Output:
//   - apple-scale.json      — Mess-Daten pro Viewport
//   - apple-<vp>.png        — Screenshot pro Viewport
//
// Run:
//   bun run sites/praxis-webseite/specs/sprint-2/S40_evidence/probe-apple.mjs

import { launch } from "puppeteer-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(__dirname, { recursive: true });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = "https://www.apple.com/de/";

const VIEWPORTS = [
  { name: "1920", w: 1920, h: 1080 },
  { name: "1440", w: 1440, h: 900 },
  { name: "430",  w: 430,  h: 932 },
];

const browser = await launch({
  executablePath: CHROME,
  headless: true,
  args: ["--ignore-certificate-errors", "--lang=de-DE"],
});

const allResults = {};

for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 " +
      "(KHTML, like Gecko) Version/17.5 Safari/605.1.15"
  );
  await page.setExtraHTTPHeaders({ "Accept-Language": "de-DE,de;q=0.9" });
  await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 2 });
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 45000 });

  // Cookie-Banner wegklicken
  await page
    .evaluate(() => {
      const sels = [
        "button.ac-gn-bannerCookie-button-accept",
        "#onetrust-accept-btn-handler",
        'button[aria-label*="Akzeptieren" i]',
        'button[aria-label*="Accept" i]',
      ];
      for (const s of sels) {
        const el = document.querySelector(s);
        if (el) { el.click(); return s; }
      }
      return null;
    })
    .catch(() => null);
  await new Promise((r) => setTimeout(r, 800));

  // Screenshot (Top-3000 px, damit mehrere Hero-Tiles drin sind)
  const shotPath = join(__dirname, `apple-${vp.name}.png`);
  await page.screenshot({
    path: shotPath,
    clip: { x: 0, y: 0, width: vp.w, height: Math.min(vp.h * 3, 3000) },
  });

  // Probe: alle sichtbaren Content-Elemente (ohne nav/footer/header-role)
  const probe = await page.evaluate(() => {
    const exclude = (el) =>
      el.closest(
        'nav, footer, [role="banner"], [role="contentinfo"], ' +
          ".ac-gn-header, .ac-gf-footer, .globalnav, .globalfooter"
      );

    const pick = Array.from(
      document.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, a, span, li, button, small, div"
      )
    );

    const samples = [];
    for (const el of pick) {
      if (exclude(el)) continue;
      const text = (el.textContent || "").trim();
      if (!text || text.length < 2) continue;

      // nur sichtbare Elemente mit eigenem Text (nicht Container)
      const hasDirectText = Array.from(el.childNodes).some(
        (n) => n.nodeType === 3 && n.textContent.trim().length > 0
      );
      if (!hasDirectText && el.tagName !== "BUTTON" && el.tagName !== "A") continue;

      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (s.visibility === "hidden" || s.display === "none") continue;

      samples.push({
        tag: el.tagName.toLowerCase(),
        role: el.getAttribute("role") || null,
        cls: (el.className || "").toString().slice(0, 80),
        text: text.slice(0, 60),
        fontSize: parseFloat(s.fontSize),
        lineHeight: s.lineHeight === "normal" ? null : parseFloat(s.lineHeight),
        letterSpacing: s.letterSpacing === "normal" ? 0 : parseFloat(s.letterSpacing),
        weight: parseInt(s.fontWeight, 10),
        color: s.color,
        bg: s.backgroundColor,
      });
    }

    // Buttons + Links, die CTA-artig aussehen (haben Padding + Hintergrund
    // ≠ transparent oder einen border-radius > 8)
    const ctas = [];
    const candidates = document.querySelectorAll(
      'main button, main a, [role="main"] button, [role="main"] a, section button, section a'
    );
    for (const el of candidates) {
      if (exclude(el)) continue;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width < 60 || r.height < 20) continue;

      const padX = parseFloat(s.paddingLeft) + parseFloat(s.paddingRight);
      const padY = parseFloat(s.paddingTop) + parseFloat(s.paddingBottom);
      const radius = parseFloat(s.borderTopLeftRadius);
      const bg = s.backgroundColor;
      const hasBg =
        bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent";
      const looksCta = (hasBg && padY > 8) || radius > 12;
      if (!looksCta) continue;

      ctas.push({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").trim().slice(0, 40),
        fontSize: parseFloat(s.fontSize),
        weight: parseInt(s.fontWeight, 10),
        paddingTop: parseFloat(s.paddingTop),
        paddingRight: parseFloat(s.paddingRight),
        paddingBottom: parseFloat(s.paddingBottom),
        paddingLeft: parseFloat(s.paddingLeft),
        borderRadius: radius,
        height: r.height,
        width: r.width,
        bg,
        color: s.color,
      });
    }

    // Histogramm: font-size → Anzahl
    const hist = {};
    for (const s of samples) {
      const k = s.fontSize.toFixed(0);
      hist[k] = (hist[k] || 0) + 1;
    }

    return { samples, ctas, hist, sampleCount: samples.length };
  });

  // Cluster: dominante font-sizes mit Median-Attributen
  const clusters = {};
  for (const s of probe.samples) {
    const k = Math.round(s.fontSize);
    if (!clusters[k]) clusters[k] = [];
    clusters[k].push(s);
  }
  const stepsRaw = Object.entries(clusters)
    .map(([size, arr]) => {
      arr.sort((a, b) => (a.lineHeight || 99) - (b.lineHeight || 99));
      const midLine = arr[Math.floor(arr.length / 2)].lineHeight;
      arr.sort((a, b) => a.letterSpacing - b.letterSpacing);
      const midTrack = arr[Math.floor(arr.length / 2)].letterSpacing;
      arr.sort((a, b) => a.weight - b.weight);
      const midWeight = arr[Math.floor(arr.length / 2)].weight;
      return {
        size: parseInt(size, 10),
        count: arr.length,
        medianLineHeight: midLine,
        medianTracking: midTrack,
        medianWeight: midWeight,
        examples: arr.slice(0, 3).map((s) => `${s.tag}: "${s.text}"`),
      };
    })
    .sort((a, b) => b.size - a.size);

  allResults[vp.name] = {
    viewport: vp,
    sampleCount: probe.sampleCount,
    ctaCount: probe.ctas.length,
    stepsRaw,
    hist: probe.hist,
    ctas: probe.ctas.slice(0, 12),
    shot: shotPath,
  };

  await page.close();
}

await browser.close();

// JSON speichern
const jsonPath = join(__dirname, "apple-scale.json");
writeFileSync(jsonPath, JSON.stringify(allResults, null, 2));

// Report
console.log("\n=== S40 DS-2 — Apple Type-Scale Probe ===");
console.log(`URL: ${URL}\n`);

for (const [vp, res] of Object.entries(allResults)) {
  console.log(`\n--- Viewport ${vp}px (${res.sampleCount} Text-Samples, ${res.ctaCount} CTAs) ---`);
  console.log(`\nTop 10 font-size-Stufen (Content-Sektion):`);
  console.log(`  px | count | line-h | track   | weight | Beispiel`);
  console.log(`  ---|-------|--------|---------|--------|----------`);
  for (const step of res.stepsRaw.slice(0, 10)) {
    const lh = step.medianLineHeight ? (step.medianLineHeight / step.size).toFixed(2) : "—";
    const tr = step.medianTracking.toFixed(2);
    console.log(
      `  ${String(step.size).padStart(3)} | ${String(step.count).padStart(5)} | ${String(lh).padStart(6)} | ${String(tr).padStart(7)}px | ${String(step.medianWeight).padStart(6)} | ${step.examples[0] || ""}`
    );
  }

  console.log(`\nErste 5 CTA-Kandidaten:`);
  console.log(`  text                          | font | weight | pad(y/x) | radius | h×w`);
  for (const c of res.ctas.slice(0, 5)) {
    console.log(
      `  ${c.text.slice(0, 29).padEnd(30)} | ${String(c.fontSize).padStart(4)} | ${String(c.weight).padStart(6)} | ${String(c.paddingTop).padStart(2)}/${String(c.paddingLeft).padStart(2)}    | ${String(c.borderRadius).padStart(6)} | ${Math.round(c.height)}×${Math.round(c.width)}`
    );
  }
}

console.log(`\nJSON: ${jsonPath}`);
console.log(`Screenshots: apple-{1920,1440,430}.png`);
