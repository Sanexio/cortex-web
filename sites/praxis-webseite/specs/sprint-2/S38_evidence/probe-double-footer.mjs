import { launch } from "puppeteer-core";
const URL = process.env.PXZ_URL;
const browser = await launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true, args: ["--ignore-certificate-errors","--allow-insecure-localhost"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: "networkidle0" });
const data = await page.evaluate(() => {
  const footers = [...document.querySelectorAll("footer, [class*='footer'], #footer, #colophon")];
  return footers
    .filter(f => f.getBoundingClientRect().height > 50)
    .map(f => ({
      tag: f.tagName,
      cls: (f.className||'').toString().slice(0,180),
      id: f.id,
      h: Math.round(f.getBoundingClientRect().height),
      y: Math.round(f.getBoundingClientRect().top + window.scrollY),
      first_120: f.textContent.replace(/\s+/g,' ').trim().slice(0,120)
    }));
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
