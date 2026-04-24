import { launch } from "puppeteer-core";
const URL = process.env.PXZ_URL;
const browser = await launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true, args: ["--ignore-certificate-errors","--allow-insecure-localhost"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(URL, { waitUntil: "networkidle0" });
const data = await page.evaluate(() => {
  const finalSec = document.querySelector(".pxz-final");
  if (!finalSec) return { error: "no .pxz-final" };
  return {
    outerHTML_len: finalSec.outerHTML.length,
    text: finalSec.textContent.replace(/\s+/g," ").trim(),
    children_classes: [...finalSec.querySelectorAll(":scope > *")].map(c => c.className || c.tagName),
    child_count: finalSec.children.length
  };
});
console.log(JSON.stringify(data, null, 2));
await browser.close();
