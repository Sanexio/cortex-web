import { launch } from "puppeteer-core";
const browser = await launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1");
await page.setCacheEnabled(false);
await page.goto("https://westend-hausarzt.com/karriere/?_v=" + Date.now(), { waitUntil: "networkidle2" });
const elt = await page.$('.wpforms-field-name');
await elt.scrollIntoView();
await new Promise(r=>setTimeout(r, 500));
await elt.screenshot({ path: '/tmp/com-shots/after-karriere-name.png' });
// Also check first block dimensions
const dims = await page.evaluate(() => {
  const fb = document.querySelector('.wpforms-field-name .wpforms-first');
  const sb = document.querySelectorAll('.wpforms-field-name .wpforms-field-row-block')[1];
  const e = document.querySelector('.wpforms-field-email input');
  const r = (el) => { const b = el.getBoundingClientRect(); return { x: b.x, w: b.width }; };
  return { firstBlock: r(fb), secondBlock: r(sb), emailInput: r(e), flexBasis: getComputedStyle(fb).flexBasis };
});
console.log(JSON.stringify(dims, null, 2));
await browser.close();
