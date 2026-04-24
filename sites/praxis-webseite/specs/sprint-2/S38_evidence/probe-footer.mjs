import { launch } from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = process.env.PXZ_URL;
const browser = await launch({ executablePath: CHROME, headless: true,
  args: ["--ignore-certificate-errors", "--allow-insecure-localhost"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.setCacheEnabled(false);
await page.goto(URL, { waitUntil: "networkidle0" });
const data = await page.evaluate(() => {
  const out = [];
  // last 4 sections of the page
  const sections = [...document.querySelectorAll("body section, body footer, body .pxz-final, body .ct-footer, body #footer, body [class*='footer']")];
  return {
    last_8_blocks: sections.slice(-8).map(s => ({
      tag: s.tagName,
      cls: s.className.toString().slice(0,140),
      id: s.id,
      h: Math.round(s.getBoundingClientRect().height),
      first_text: (s.textContent || '').replace(/\s+/g,' ').trim().slice(0,80)
    })),
    has_pxz_final: !!document.querySelector(".pxz-final"),
    has_pxz_site_footer: !!document.querySelector(".pxz-site-footer, footer.pxz-footer, #pxz-footer"),
    has_blocksy_footer: !!document.querySelector("#footer, .ct-footer"),
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
