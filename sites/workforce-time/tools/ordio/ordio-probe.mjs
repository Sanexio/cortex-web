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
// --post-login: log in (password mode) and inventory the app's JSON API
// traffic while walking the main navigation. Prints URLs, methods and
// top-level payload keys/array sizes ONLY — never field values.
const postLogin = args.includes("--post-login");

const baseUrl = process.env.ORDIO_BASE_URL;
if (!baseUrl) {
  console.error("ORDIO_BASE_URL fehlt in der Laufzeitumgebung");
  process.exit(1);
}

function describePayload(value) {
  if (Array.isArray(value)) {
    const first = value[0];
    return {
      kind: "array",
      length: value.length,
      itemKeys: first && typeof first === "object" ? Object.keys(first).slice(0, 25) : typeof first
    };
  }
  if (value && typeof value === "object") {
    return { kind: "object", keys: Object.keys(value).slice(0, 25) };
  }
  return { kind: typeof value };
}

const { chromium } = await import("playwright");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } });

  if (postLogin) {
    const email = process.env.ORDIO_EMAIL || process.env.ORDIO_USER || "";
    const password = process.env.ORDIO_PASSWORD || "";
    if (!email || !password) {
      console.error("ORDIO_EMAIL/ORDIO_USER oder ORDIO_PASSWORD fehlt");
      process.exit(1);
    }
    const apiLog = [];
    page.on("response", async (response) => {
      const contentType = response.headers()["content-type"] ?? "";
      if (!contentType.includes("json")) return;
      const url = response.url();
      if (!/ordio/i.test(url)) return;
      let payload = null;
      try { payload = await response.json(); } catch { return; }
      apiLog.push({
        method: response.request().method(),
        status: response.status(),
        url: url.length > 160 ? url.slice(0, 160) + "…" : url,
        payload: describePayload(payload)
      });
    });

    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    const pwModeButton = page.getByRole("button", { name: /benutzername.*passwort|username.*password/i });
    if (await pwModeButton.count()) await pwModeButton.first().click();
    await page.locator("#e-mail-oder-benutzername").or(page.locator('input[autocomplete="username"]')).first().fill(email);
    await page.locator("#passwort").or(page.locator('input[type="password"]')).first().fill(password);
    await page.getByRole("button", { name: /^(anmelden|login|sign in)$/i }).first().click();
    await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(4000);

    const nav = await page.evaluate(() =>
      [...document.querySelectorAll("a[href], nav [role=link], aside a")]
        .map((a) => ({ text: (a.innerText || "").trim().slice(0, 40), href: a.getAttribute("href") }))
        .filter((l) => l.text && l.href && !l.href.startsWith("http"))
        .slice(0, 40)
    );
    console.log("--- NAV nach Login ---");
    console.log(JSON.stringify({ url: page.url(), nav }, null, 2));

    // Also log every request URL (any type) so non-JSON/graphql data
    // channels become visible too. URL + method only.
    const reqLog = new Set();
    page.on("request", (request) => {
      const url = request.url();
      if (/app\.ordio\.com\/(api|graphql)/i.test(url)) {
        reqLog.add(`${request.method()} ${url.length > 150 ? url.slice(0, 150) + "…" : url}`);
      }
    });

    // SPA-internal navigation (clicks) with per-step diagnostics; falls
    // back to goto when the link is not clickable (collapsed sidebar etc.).
    const walk = [];
    for (const link of nav) {
      const before = apiLog.length;
      let how = "click";
      try {
        await page.locator(`a[href="${link.href}"]`).first().click({ timeout: 8000 });
      } catch {
        how = "goto";
        try {
          await page.goto(new URL(link.href, baseUrl).href, { waitUntil: "domcontentloaded", timeout: 30000 });
        } catch {
          how = "failed";
        }
      }
      await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});
      await page.waitForTimeout(3000);
      walk.push({ href: link.href, how, urlAfter: page.url(), newApiResponses: apiLog.length - before });
    }
    console.log("--- WALK-DIAGNOSE ---");
    console.log(JSON.stringify(walk, null, 2));

    console.log("--- REQUEST-LOG (alle api/graphql-Requests) ---");
    console.log(JSON.stringify([...reqLog], null, 2));

    console.log("--- API-INVENTAR (URLs + Strukturschluessel, keine Werte) ---");
    console.log(JSON.stringify(apiLog, null, 2));
    if (shotPath) await page.screenshot({ path: shotPath });
    await browser.close();
    process.exit(0);
  }

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
