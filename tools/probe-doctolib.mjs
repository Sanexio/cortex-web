import puppeteer from 'puppeteer-core';

const URL = 'https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/aerzte/dr-stracke/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--ignore-certificate-errors', '--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });

const result = await page.evaluate(() => {
  const a = document.querySelector('a[href*="doctolib.de"][style*="position:fixed"]');
  if (!a) return { found: false };
  const cs = getComputedStyle(a);
  const r = a.getBoundingClientRect();
  return {
    found: true,
    bg: cs.backgroundColor,
    opacity: cs.opacity,
    top: cs.top,
    transform: cs.transform,
    rectTop: r.top,
    rectRight: window.innerWidth - r.right,
    rectWidth: r.width,
    rectHeight: r.height,
  };
});

console.log(JSON.stringify(result, null, 2));

await page.screenshot({ path: '/tmp/pxz-doctolib-after.png', fullPage: false });
await browser.close();
