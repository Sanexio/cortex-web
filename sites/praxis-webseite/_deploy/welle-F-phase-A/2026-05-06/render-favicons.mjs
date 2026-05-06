#!/usr/bin/env bun
// SVG-Favicon zu PNG-Varianten rendern via Headless Chrome.

import { launch } from "puppeteer-core";
import { resolve } from "path";
import { readFileSync } from "fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HERE = import.meta.dir;
const svg = readFileSync(resolve(HERE, "favicon.svg"), "utf8");

const sizes = [
  { name: "favicon-16.png", size: 16 },
  { name: "favicon-32.png", size: 32 },
  { name: "favicon-48.png", size: 48 },
  { name: "apple-touch-icon.png", size: 180 },
];

const browser = await launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();

for (const { name, size } of sizes) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  const html = `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;width:${size}px;height:${size}px;}svg{display:block;width:${size}px;height:${size}px;}</style></head><body>${svg}</body></html>`;
  await page.goto(`data:text/html;base64,${Buffer.from(html).toString("base64")}`);
  await page.screenshot({ path: resolve(HERE, name), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  console.log(`✓ ${name} (${size}×${size})`);
}

await browser.close();
