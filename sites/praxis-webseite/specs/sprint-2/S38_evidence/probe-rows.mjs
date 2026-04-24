import { launch } from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = process.env.PXZ_URL || "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/";
const browser = await launch({ executablePath: CHROME, headless: true,
  args: ["--ignore-certificate-errors", "--allow-insecure-localhost"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.setCacheEnabled(false);
await page.goto(URL, { waitUntil: "networkidle0" });
const data = await page.evaluate(() => {
  const list = document.querySelector(".pxz-nav-list");
  if (!list) return { error: "no list" };
  const items = [...list.querySelectorAll(":scope > li")];
  const rows = {};
  items.forEach((li) => {
    const r = Math.round(li.getBoundingClientRect().top);
    if (!rows[r]) rows[r] = [];
    rows[r].push(li.textContent.trim().split(/\s+/)[0]);
  });
  const cs = getComputedStyle(list);
  return {
    grid_template: cs.gridTemplateColumns,
    list_display: cs.display,
    item_count: items.length,
    rows: Object.entries(rows).map(([y, labels]) => ({ y: +y, count: labels.length, labels })),
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
