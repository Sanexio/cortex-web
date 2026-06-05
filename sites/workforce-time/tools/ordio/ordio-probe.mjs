#!/usr/bin/env node
// Debug probe for the Ordio login page structure. Read-only, no
// credentials used — dumps form fields, buttons, iframes and overlay
// hints so the locators in ordio-delta.mjs can match the real page.
// Output goes to stdout; optional screenshot to --shot <path> (keep
// outside the repo, e.g. /tmp). Usage:
//   ORDIO_BASE_URL=... node tools/ordio/ordio-probe.mjs [--shot /tmp/ordio-login.png]

const args = process.argv.slice(2);
const shotIdx = args.indexOf("--shot");
const shotPath = shotIdx >= 0 ? args[shotIdx + 1] : null;

const baseUrl = process.env.ORDIO_BASE_URL;
if (!baseUrl) {
  console.error("ORDIO_BASE_URL fehlt in der Laufzeitumgebung");
  process.exit(1);
}

const { chromium } = await import("playwright");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(4000); // allow SPA hydration / consent overlays

  const summary = await page.evaluate(() => {
    const describe = (el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute("type"),
      name: el.getAttribute("name"),
      id: el.id || null,
      placeholder: el.getAttribute("placeholder"),
      ariaLabel: el.getAttribute("aria-label"),
      autocomplete: el.getAttribute("autocomplete"),
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
    });
    return {
      url: location.href,
      title: document.title,
      inputs: [...document.querySelectorAll("input")].map(describe),
      buttons: [...document.querySelectorAll("button, [role=button], input[type=submit]")]
        .map((b) => ({ text: (b.innerText || b.value || "").trim().slice(0, 60), visible: !!(b.offsetWidth || b.offsetHeight) }))
        .filter((b) => b.text),
      links: [...document.querySelectorAll("a")]
        .map((a) => (a.innerText || "").trim().slice(0, 40))
        .filter((t) => /login|anmeld|passwort|password|sign/i.test(t))
        .slice(0, 10),
      forms: [...document.querySelectorAll("form")].map((f) => ({ action: f.action, method: f.method })),
      iframes: [...document.querySelectorAll("iframe")].map((f) => f.src).slice(0, 5)
    };
  });

  console.log(JSON.stringify(summary, null, 2));

  // Step 2: Ordio hides password login behind a mode-switch button.
  const pwButton = page.getByRole("button", { name: /benutzername.*passwort|username.*password/i });
  if (await pwButton.count()) {
    await pwButton.first().click();
    await page.waitForTimeout(2500);
    const step2 = await page.evaluate(() => ({
      url: location.href,
      inputs: [...document.querySelectorAll("input")].map((el) => ({
        type: el.getAttribute("type"),
        name: el.getAttribute("name"),
        id: el.id || null,
        placeholder: el.getAttribute("placeholder"),
        autocomplete: el.getAttribute("autocomplete"),
        visible: !!(el.offsetWidth || el.offsetHeight)
      })),
      buttons: [...document.querySelectorAll("button, [role=button], input[type=submit]")]
        .map((b) => ({ text: (b.innerText || b.value || "").trim().slice(0, 60), visible: !!(b.offsetWidth || b.offsetHeight) }))
        .filter((b) => b.text)
    }));
    console.log("--- STEP2 (nach Klick auf Passwort-Login) ---");
    console.log(JSON.stringify(step2, null, 2));
  }

  if (shotPath) {
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`screenshot: ${shotPath}`);
  }
} finally {
  await browser.close();
}
