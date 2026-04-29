import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--ignore-certificate-errors', '--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/', { waitUntil: 'networkidle2', timeout: 30000 });
const result = await page.evaluate(() => {
  const a = document.querySelector('a[href*="doctolib.de"][style*="position:fixed"]');
  if (!a) return { found: false };
  const cs = getComputedStyle(a);
  return { found: true, display: cs.display, bg: cs.backgroundColor };
});
console.log('Homepage:', JSON.stringify(result));
await browser.close();
