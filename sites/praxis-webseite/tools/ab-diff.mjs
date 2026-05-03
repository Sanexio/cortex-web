#!/usr/bin/env bun
/**
 * ab-diff.mjs — Side-by-side Vorher/Nachher-Vergleich für CSS-Änderungen.
 *
 * Zweck: Nach jeder CSS-Änderung VERPFLICHTEND laufen lassen. Erzeugt zwei
 * Full-Page-Screenshots in Desktop 1440 + Mobile 430 — einmal Ist-Zustand,
 * einmal mit per Puppeteer injiziertem Override, der den vorherigen Zustand
 * rekonstruiert. Ergibt Dr. Stracke eine Beweis-Grundlage, ohne selbst
 * DevTools öffnen zu müssen.
 *
 * Usage:
 *   bun run tools/ab-diff.mjs                          # nur aktueller Shot
 *   bun run tools/ab-diff.mjs --baseline=path.css      # mit CSS-File als "Vorher"
 *   bun run tools/ab-diff.mjs --override='.x{p:0}'     # Inline-CSS als "Vorher"
 *
 * Ausgabe: screenshots/claude/YYYY-MM-DD_vX.Y.Z_AB_{before,after}_{desktop,mobile}.png
 *          + Höhen-Delta + Selector-Probe auf stdout.
 *
 * Regel (PRE_FLIGHT_CHECKLIST §8, 2026-04-18):
 *   Keine Meldung "fertig" nach einer CSS-Änderung ohne AB-Shot.
 *   Keine Bitte an Dr. Stracke, visuell zu vergleichen, ohne beide Shots
 *   bereitzustellen. Dr. Stracke prüft die Fotos, nicht das Live-System.
 */

import puppeteer from 'puppeteer-core';
import { readFileSync, existsSync } from 'fs';

const TARGET_URL = process.env.PXZ_URL
  || 'https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = new URL('../screenshots/claude/', import.meta.url).pathname;

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  return m ? [m[1], m[2] ?? true] : [a, true];
}));

let overrideCss = '';
if (args.baseline && existsSync(args.baseline)) {
  overrideCss = readFileSync(args.baseline, 'utf8');
} else if (args.override) {
  overrideCss = args.override;
}

const today = new Date().toISOString().slice(0, 10);
const version = args.version || readVersion();
const tag = `${today}_v${version}_AB`;

function readVersion() {
  const fnPath = '/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum/functions.php';
  try {
    const txt = readFileSync(fnPath, 'utf8');
    const m = txt.match(/PXZ_VERSION',\s*'([^']+)'/);
    return m ? m[1] : 'unknown';
  } catch { return 'unknown'; }
}

const PROBE_SELECTORS = [
  { sel: '#fachrichtungen', prop: 'paddingTop' },
  { sel: '#fachrichtungen', prop: 'paddingBottom' },
  { sel: '#team',           prop: 'paddingTop' },
  { sel: '#service',        prop: 'paddingTop' },
  { sel: '#standorte',      prop: 'paddingTop' },
  { sel: '.pxz-mfa-sub',    prop: 'maxWidth' },
  { sel: '.pxz-mfa-card',   prop: 'paddingTop' },
  { sel: '.pxz-loc-card--main', prop: 'paddingTop' },
  { sel: '.pxz-hero-sub',   prop: 'maxWidth' },
  { sel: '.pxz-btn',        prop: 'padding' },
];

// Alignment probe (PXZ-E-008): Showpiece-Elemente MUST be centered.
// S55+ (2026-04-30): .pxz-loc-card--combined nicht mehr auf Home (Slider-Halbierung).
const ALIGNMENT_CHECKS = [
  '.pxz-hero-sub',
  '.pxz-mfa-card',
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--ignore-certificate-errors', '--no-sandbox', '--incognito'],
});

async function capture(label, viewport, inject) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.setCacheEnabled(false);
  const urlCb = TARGET_URL + (TARGET_URL.includes('?') ? '&' : '?') + 'cb=' + Date.now();
  await page.goto(urlCb, { waitUntil: 'networkidle2', timeout: 30000 });
  if (inject) await page.addStyleTag({ content: inject });
  await new Promise(r => setTimeout(r, 500));
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const probes = {};
  for (const p of PROBE_SELECTORS) {
    probes[`${p.sel} ${p.prop}`] = await page.evaluate(
      (s, pr) => {
        const el = document.querySelector(s);
        return el ? getComputedStyle(el)[pr] : 'NOT FOUND';
      }, p.sel, p.prop);
  }
  const alignment = await page.evaluate((sels) => {
    const vpCenter = window.innerWidth / 2;
    return sels.map(s => {
      const el = document.querySelector(s);
      if (!el) return { sel: s, missing: true };
      const r = el.getBoundingClientRect();
      const c = (r.left + r.right) / 2;
      return { sel: s, center: Math.round(c), delta: Math.round(c - vpCenter),
               ok: Math.abs(c - vpCenter) < 5 };
    });
  }, ALIGNMENT_CHECKS);
  const file = `${OUT}${tag}_${label}_${viewport.width}.png`;
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
  return { label, viewport: viewport.width, height, probes, alignment, file };
}

console.log(`\n=== ab-diff.mjs · tag=${tag} · override=${overrideCss ? 'yes' : 'no'} ===\n`);

const results = [];
for (const vp of [
  { width: 1440, height: 900, deviceScaleFactor: 1 },
  { width: 430,  height: 900, deviceScaleFactor: 1, isMobile: true },
]) {
  if (overrideCss) {
    results.push(await capture('before', vp, overrideCss));
  }
  results.push(await capture('after', vp, null));
}
await browser.close();

for (const r of results) {
  console.log(`[${r.viewport}px] ${r.label.padEnd(7)} h=${r.height}px  ${r.file.split('/').pop()}`);
  for (const [k, v] of Object.entries(r.probes)) {
    console.log(`  ${k.padEnd(40)} = ${v}`);
  }
  console.log(`  Alignment (centered Showpiece-Elemente):`);
  for (const a of r.alignment) {
    if (a.missing) { console.log(`    ? ${a.sel}: NOT FOUND`); continue; }
    console.log(`    ${a.ok ? '✓' : '✗'} ${a.sel.padEnd(22)} center=${a.center}  delta=${a.delta > 0 ? '+' : ''}${a.delta}px`);
  }
}

if (overrideCss) {
  console.log('\n=== HEIGHT DELTAS ===');
  for (const vp of [1440, 430]) {
    const b = results.find(r => r.viewport === vp && r.label === 'before');
    const a = results.find(r => r.viewport === vp && r.label === 'after');
    if (b && a) {
      const d = b.height - a.height;
      console.log(`${vp}px: before=${b.height}  after=${a.height}  delta=${d > 0 ? '+' : ''}${d}px`);
    }
  }
}
console.log('\nDone. Shots in screenshots/claude/');
