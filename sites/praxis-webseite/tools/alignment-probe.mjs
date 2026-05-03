#!/usr/bin/env bun
/**
 * alignment-probe.mjs — Spezifitäts- und Alignment-Check (PXZ-E-008).
 *
 * Prüft headless/incognito/cache-disabled, dass alle Showpiece-Elemente
 * horizontal zentriert rendern (|center - viewportCenter| < 5 px).
 *
 * Der Check deckt die PXZ-E-008-Klasse ab: globale Element-Resets wie
 * `.pxz-home p { margin: 0 }` überschreiben stille jede Klassen-Regel,
 * Block-Elemente mit `max-width + margin: auto` rutschen links statt
 * mittig. Wenn dieser Check rot ist → zuerst Spezifität des p/h-Resets
 * prüfen, nicht das Layout.
 *
 * Exit 0 bei allen ✓, Exit 1 bei mindestens einem ✗.
 */
import puppeteer from 'puppeteer-core';

const URL = process.env.PXZ_URL
  || 'https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// S55+ (2026-04-30): .pxz-loc-card--combined nicht mehr auf Home (Slider-Halbierung).
// Probe prüft jetzt das Hero-Subtitle und den MFA-Karriere-Block (weiterhin auf Home).
const CHECKS = [
  '.pxz-hero-sub',
  '.pxz-mfa-card',
];

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--ignore-certificate-errors', '--no-sandbox', '--incognito'],
});

let fails = 0;
for (const vp of [
  { width: 1440, height: 900, label: '1440px' },
  { width: 430,  height: 900, label: '430px', isMobile: true },
]) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  await page.setCacheEnabled(false);
  await page.goto(URL + (URL.includes('?') ? '&' : '?') + 'cb=' + Date.now(),
    { waitUntil: 'networkidle2', timeout: 30000 });
  console.log(`\n=== Viewport ${vp.label} ===`);
  const results = await page.evaluate((sels) => {
    const vpCenter = window.innerWidth / 2;
    return sels.map(s => {
      const el = document.querySelector(s);
      if (!el) return { sel: s, missing: true };
      const r = el.getBoundingClientRect();
      const c = (r.left + r.right) / 2;
      return { sel: s, center: Math.round(c), delta: Math.round(c - vpCenter),
               ok: Math.abs(c - vpCenter) < 5 };
    });
  }, CHECKS);
  for (const r of results) {
    if (r.missing) { console.log(`  ? ${r.sel}: NOT FOUND`); continue; }
    const sign = r.delta > 0 ? '+' : '';
    console.log(`  ${r.ok ? '✓' : '✗'} ${r.sel.padEnd(22)} center=${r.center}  delta=${sign}${r.delta}px`);
    if (!r.ok) fails++;
  }
  await page.close();
}
await browser.close();
if (fails === 0) {
  console.log('\nOK — alle Showpiece-Elemente zentriert.');
  process.exit(0);
} else {
  console.log(`\nFAIL — ${fails} Element(e) nicht zentriert. Spezifität von .pxz-home p / h*-Resets prüfen (PXZ-E-008).`);
  process.exit(1);
}
