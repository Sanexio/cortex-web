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
// --dom-structure: after login, visit the data pages and dump their
// table/grid STRUCTURE ONLY — table count, header-cell labels, row
// counts, ARIA roles. Never cell values (no employee names, no hours).
const domStructure = args.includes("--dom-structure");
// --deep <path>: after login, navigate to <path>, scroll to force
// virtualized lists to render, and dump STRUCTURE ONLY of repeated
// containers — tag, role, data-testid, child field-label hints, count,
// and whether a scroll container exists. Never inner data values.
const deepIdx = args.indexOf("--deep");
const deepPath = deepIdx >= 0 ? args[deepIdx + 1] : null;
// --picker: open /work-hours, click "Zeitraum wählen", dump the date
// picker popover STRUCTURE (buttons, nav controls, inputs, aria-labels)
// so the interactive paging in ordio-delta can drive it. No data values.
const pickerProbe = args.includes("--picker");
// --absrows: dump /absences grid row→employee linkage. For each
// absence-bar, walk ancestors to find the row container + its left
// row-header (employee). Prints initials + ancestor tag/testid chain.
const absRows = args.includes("--absrows");
// --absclick: click the first absence-bar and dump the resulting
// detail popover/dialog structure (does it expose the employee?).
const absClick = args.includes("--absclick");
// --apijson <path>: after login, fetch a same-origin JSON API path in the
// authenticated page context and dump its STRUCTURE (keys, array sizes,
// value TYPES) — string values shown as "str", never the value itself.
const apiIdx = args.indexOf("--apijson");
const apiPath = apiIdx >= 0 ? args[apiIdx + 1] : null;
// --abssniff: load /absences and report which request(s) actually return
// absence records (method+url+whether body has dates/employee refs).
const absSniff = args.includes("--abssniff");
// --absembed: fetch /absences page payload and dump redacted fragments
// around embedded absence records to reveal the id↔employee↔date shape.
const absEmbed = args.includes("--absembed");
// --raw <path> <cssSelector>: after login navigate to <path>, scroll,
// then dump the outerHTML of the first 4 matching elements with all
// person-name-looking tokens redacted (keep dates/times/numbers/attrs).
const rawIdx = args.indexOf("--raw");
const rawPath = rawIdx >= 0 ? args[rawIdx + 1] : null;
const rawSelector = rawIdx >= 0 ? args[rawIdx + 2] : null;

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

  async function loginPassword() {
    const email = process.env.ORDIO_EMAIL || process.env.ORDIO_USER || "";
    const password = process.env.ORDIO_PASSWORD || "";
    if (!email || !password) { console.error("Credentials fehlen"); process.exit(1); }
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
    const pw = page.getByRole("button", { name: /benutzername.*passwort|username.*password/i });
    if (await pw.count()) await pw.first().click();
    await page.locator("#e-mail-oder-benutzername").or(page.locator('input[autocomplete="username"]')).first().fill(email);
    await page.locator("#passwort").or(page.locator('input[type="password"]')).first().fill(password);
    await page.getByRole("button", { name: /^(anmelden|login|sign in)$/i }).first().click();
    await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(4000);
  }

  if (rawPath && rawSelector) {
    await loginPassword();
    await page.goto(new URL(rawPath, baseUrl).href, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(3500);
    for (let i = 0; i < 4; i += 1) {
      await page.evaluate(() => {
        for (const el of document.querySelectorAll("*")) {
          if (el.scrollHeight > el.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(el).overflowY)) el.scrollTop = el.scrollHeight;
        }
      });
      await page.waitForTimeout(500);
    }
    const dump = await page.evaluate((sel) => {
      const els = [...document.querySelectorAll(sel)].slice(0, 4);
      // Redact capitalised name-like word pairs but keep dates/times/numbers.
      const redact = (html) => html
        .replace(/\b([A-ZÄÖÜ][a-zäöüß]+),\s*([A-ZÄÖÜ][a-zäöüß]+)\b/g, "NACHNAME, VORNAME")
        .replace(/\b([A-ZÄÖÜ][a-zäöüß]{2,})\s+([A-ZÄÖÜ][a-zäöüß]{2,})\b/g, "VORNAME NACHNAME");
      return els.map((el) => redact(el.outerHTML).slice(0, 700));
    }, rawSelector);
    console.log(`--- RAW ${rawPath} ${rawSelector} (${dump.length} Elemente, Namen redigiert) ---`);
    dump.forEach((h, i) => console.log(`[${i}] ${h}\n`));
    await browser.close();
    process.exit(0);
  }

  if (absEmbed) {
    await loginPassword();
    let html = "";
    page.on("response", async (res) => {
      if (res.url().endsWith("/absences") && (res.headers()["content-type"] || "").includes("html")) {
        try { html = (await res.body()).toString("utf8"); } catch { /* */ }
      }
    });
    await page.goto(new URL("/absences", baseUrl).href, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(3000);
    if (!html) html = await page.content();
    // Find a real absence-bar id from the DOM, then locate it in the payload
    const barId = await page.evaluate(() => (document.querySelector('div[data-testid^="absence-bar-"]')?.getAttribute("data-testid") || "").replace("absence-bar-", ""));
    const redact = (t) => String(t)
      .replace(/\b([A-ZÄÖÜ][a-zäöüß]+),\s*([A-ZÄÖÜ][a-zäöüß]+)\b/g, "NACHNAME,VORNAME")
      .replace(/\b([A-ZÄÖÜ][a-zäöüß]{2,})\s+([A-ZÄÖÜ][a-zäöüß]{2,})\b/g, "V N");
    console.log(`--- ABSEMBED (barId=${barId}, payload ${html.length} bytes) ---`);
    if (barId) {
      const idx = html.indexOf(barId);
      // Wide window BEFORE the bar to reveal the per-employee wrapper.
      const before = html.slice(Math.max(0, idx - 2200), idx);
      console.log("Kontext VOR barId (Mitarbeiter-Gruppierung):\n" + redact(before).replace(/\\"/g, '"').slice(-1600));
    }
    // Also: keys near "absence" occurrences
    const sample = [...html.matchAll(/[\{,]"(\w*(?:absence|employee|start|end|type|date|user|staff)\w*)":/gi)].map((m) => m[1].toLowerCase());
    console.log("Feld-Namen (absence/employee/date-nahe):", JSON.stringify([...new Set(sample)].slice(0, 40)));
    await browser.close();
    process.exit(0);
  }

  if (absSniff) {
    await loginPassword();
    const hits = [];
    page.on("response", async (res) => {
      try {
        const req = res.request();
        const url = res.url();
        if (!/ordio\.com\/(api|absences)/i.test(url)) return;
        let body = "";
        try { body = (await res.body()).toString("utf8"); } catch { return; }
        const low = body.toLowerCase();
        // absence record markers: a date + absence-type/employee reference
        const hasDate = /\d{4}-\d{2}-\d{2}|\d{2}\.\d{2}\.\d{4}/.test(body);
        const hasAbs = /absence|urlaub|krank|abwesen|holiday|disease|vacation/i.test(low);
        const hasEmp = /employee|user_id|staff|"label"/i.test(low);
        if (hasDate && hasAbs) {
          hits.push({ method: req.method(), url: url.replace(/^https:\/\/app\.ordio\.com/, "").slice(0, 120), ct: (res.headers()["content-type"] || "").split(";")[0], bytes: body.length, hasEmp, sampleKeys: (() => { try { const j = JSON.parse(body); return Array.isArray(j) ? `array(${j.length})` : Object.keys(j).slice(0, 12); } catch { return "non-json(rsc?)"; } })() });
        }
      } catch { /* ignore */ }
    });
    await page.goto(new URL("/absences", baseUrl).href, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(4000);
    console.log("--- ABSSNIFF (Requests mit Datum+Abwesenheit) ---");
    console.log(JSON.stringify(hits, null, 2));
    await browser.close();
    process.exit(0);
  }

  if (apiPath) {
    await loginPassword();
    // Make sure the SPA/session cookies are warm.
    await page.goto(new URL("/absences", baseUrl).href, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
    const result = await page.evaluate(async (rawPaths) => {
      const paths = rawPaths.split(",").map((p) => p.trim()).filter(Boolean);
      // structure-only: keys, array lengths, value types; never raw strings
      const shape = (v, depth = 0) => {
        if (Array.isArray(v)) return { array: v.length, of: v.length ? shape(v[0], depth + 1) : "empty" };
        if (v && typeof v === "object") {
          if (depth > 4) return "object";
          const o = {};
          for (const k of Object.keys(v).slice(0, 40)) o[k] = shape(v[k], depth + 1);
          return o;
        }
        return typeof v;
      };
      const summarize = (status, method, body) => {
        const flat = JSON.stringify(body).toLowerCase();
        const hints = ["absence", "urlaub", "krank", "abwesen", "starts_on", "startson", "start_date", "from", "employee_id", "employeeid", "user_id", "type_id"].filter((h) => flat.includes(h));
        return { status, method, hints, structure: shape(body) };
      };
      const out = {};
      for (const path of paths) {
        try {
          const res = await fetch(path, { headers: { accept: "application/json" } });
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("json")) { out[path] = summarize(res.status, "GET", await res.json()); continue; }
          if (res.status === 405) {
            // Retry as POST with a date-range body (several common shapes).
            const m = path.match(/[?&](?:from|start)=(\d{4}-\d{2}-\d{2})/);
            const m2 = path.match(/[?&](?:to|end)=(\d{4}-\d{2}-\d{2})/);
            const from = m?.[1] || "2026-05-25", to = m2?.[1] || "2026-06-05";
            const url = path.split("?")[0];
            const payload = { from, to, start: from, end: to, startDate: from, endDate: to, start_date: from, end_date: to };
            const pres = await fetch(url, { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(payload) });
            const pct = pres.headers.get("content-type") || "";
            out[path] = pct.includes("json") ? summarize(pres.status, "POST", await pres.json()) : { status: pres.status, method: "POST", note: "kein JSON" };
          } else {
            out[path] = { status: res.status, method: "GET", note: "kein JSON" };
          }
        } catch (e) { out[path] = { error: String(e) }; }
      }
      return out;
    }, apiPath);
    console.log(`--- APIJSON (${apiPath}, Struktur, keine Werte) ---`);
    console.log(JSON.stringify(result, null, 2));
    await browser.close();
    process.exit(0);
  }

  if (absClick) {
    await loginPassword();
    await page.goto(new URL("/absences", baseUrl).href, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(3500);
    const bar = page.locator('div[data-testid^="absence-bar-"]').first();
    if (!(await bar.count())) { console.log("keine absence-bar gefunden"); await browser.close(); process.exit(0); }
    await bar.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const dump = await page.evaluate(() => {
      const redact = (t) => String(t || "")
        .replace(/\b([A-ZÄÖÜ][a-zäöüß]+),\s*([A-ZÄÖÜ][a-zäöüß]+)\b/g, "NACHNAME, VORNAME")
        .replace(/\b([A-ZÄÖÜ][a-zäöüß]{2,})\s+([A-ZÄÖÜ][a-zäöüß]{2,})\b/g, "VORNAME NACHNAME");
      const scope = document.querySelector('[role="dialog"], [data-testid*="detail"], [data-testid*="drawer"], [data-radix-popper-content-wrapper], aside');
      return {
        opened: !!scope,
        scopeTestid: scope?.getAttribute("data-testid") || scope?.getAttribute("role") || "",
        labels: scope ? [...scope.querySelectorAll('[data-testid], dt, label, [aria-label]')].map((e) => redact(e.getAttribute("data-testid") || e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 50)).filter(Boolean).slice(0, 30) : [],
        textSample: scope ? redact(scope.textContent || "").replace(/\s+/g, " ").slice(0, 400) : ""
      };
    });
    console.log("--- ABSCLICK (Detail nach Balken-Klick, redigiert) ---");
    console.log(JSON.stringify(dump, null, 2));
    await browser.close();
    process.exit(0);
  }

  if (absRows) {
    await loginPassword();
    await page.goto(new URL("/absences", baseUrl).href, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(3500);
    const dump = await page.evaluate(() => {
      const ini = (s) => String(s || "").trim().split(/\s+/).map((w) => w[0] || "").join("").toUpperCase().slice(0, 4);
      const bars = [...document.querySelectorAll('div[data-testid^="absence-bar-"]')].slice(0, 6);
      return bars.map((bar) => {
        const chain = [];
        let el = bar;
        for (let i = 0; i < 8 && el; i += 1) {
          chain.push({
            tag: el.tagName.toLowerCase(),
            testid: el.getAttribute("data-testid") || "",
            role: el.getAttribute("role") || "",
            dataRow: el.getAttribute("data-row-id") || el.getAttribute("data-employee-id") || el.getAttribute("data-employee") || "",
            cls: (el.className || "").toString().slice(0, 40)
          });
          el = el.parentElement;
        }
        // candidate row = nearest ancestor with role=row or data-row*/data-employee*
        let row = bar.parentElement, hops = 0;
        while (row && hops < 8 && !(row.getAttribute("role") === "row" || row.getAttribute("data-row-id") || row.getAttribute("data-employee-id") || row.getAttribute("data-employee"))) { row = row.parentElement; hops += 1; }
        // left row-header text: first descendant text of the row's first cell
        let headerIni = "";
        if (row) {
          const firstCell = row.querySelector('[role="rowheader"], [data-testid*="employee"], [data-testid*="row-label"], a, span');
          headerIni = ini(firstCell ? firstCell.textContent : "");
        }
        return { barTestid: bar.getAttribute("data-testid"), barTop: bar.style.top || "", rowFound: !!row, rowAttrs: row ? { role: row.getAttribute("role") || "", testid: row.getAttribute("data-testid") || "", dataEmp: row.getAttribute("data-employee-id") || row.getAttribute("data-employee") || "" } : null, rowHeaderInitials: headerIni, ancestorChain: chain };
      });
    });
    console.log("--- ABSROWS (/absences Bar→Zeile→Mitarbeiter, Initialen) ---");
    console.log(JSON.stringify(dump, null, 2));
    await browser.close();
    process.exit(0);
  }

  if (pickerProbe) {
    await loginPassword();
    await page.goto(new URL("/work-hours", baseUrl).href, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(3000);
    const before = await page.evaluate(() => location.href);
    const btn = page.getByRole("button", { name: /zeitraum.*w[äa]hlen|zeitraum/i });
    const opened = await btn.count();
    if (opened) { await btn.first().click().catch(() => {}); await page.waitForTimeout(1500); }
    const dump = await page.evaluate(() => {
      const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
      // Likely popover: a dialog/listbox/grid that appeared. Capture its
      // interactive controls and labels (NOT data values).
      const scope = document.querySelector("[role=dialog], [role=listbox], [data-radix-popper-content-wrapper], .popover, [role=menu]") || document.body;
      return {
        urlBeforeClick: location.href,
        pickerOpened: scope !== document.body,
        buttons: [...scope.querySelectorAll("button, [role=button], [role=menuitem], [role=option]")]
          .map((b) => clean(b.getAttribute("aria-label") || b.innerText)).filter(Boolean).slice(0, 30),
        inputs: [...scope.querySelectorAll("input")].map((i) => ({ type: i.type, placeholder: i.placeholder, ariaLabel: i.getAttribute("aria-label") })).slice(0, 10),
        navHints: [...scope.querySelectorAll("[aria-label]")].map((e) => clean(e.getAttribute("aria-label"))).filter((l) => /woche|week|monat|month|vor|zurück|next|prev|kalender|tag|day|von|bis/i.test(l)).slice(0, 20)
      };
    });
    console.log("--- PICKER (Zeitraum wählen, Struktur) ---");
    console.log(JSON.stringify(dump, null, 2));
    await browser.close();
    process.exit(0);
  }

  if (deepPath) {
    await loginPassword();
    await page.goto(new URL(deepPath, baseUrl).href, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});
    await page.waitForTimeout(3500);
    // Force virtualized lists to render more rows by scrolling the page
    // and any inner scroll containers.
    for (let i = 0; i < 6; i += 1) {
      await page.mouse.wheel(0, 4000).catch(() => {});
      await page.evaluate(() => {
        for (const el of document.querySelectorAll("*")) {
          if (el.scrollHeight > el.clientHeight + 200 && getComputedStyle(el).overflowY !== "visible") el.scrollTop = el.scrollHeight;
        }
      });
      await page.waitForTimeout(800);
    }
    const dump = await page.evaluate(() => {
      const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
      // Repeated structural containers: group by tag+role+testid-prefix.
      const groups = {};
      const sel = "[data-testid], [role=row], [role=listitem], [role=gridcell], tr, li, article";
      for (const el of document.querySelectorAll(sel)) {
        const testid = el.getAttribute("data-testid") || "";
        const key = `${el.tagName.toLowerCase()}|role=${el.getAttribute("role") || ""}|testid=${testid.replace(/[0-9].*$/, "*")}`;
        groups[key] = (groups[key] || 0) + 1;
      }
      const repeated = Object.entries(groups).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).slice(0, 20);
      // Field-label hints: any element with a data-field / data-column / aria-label
      const fieldHints = [...new Set([...document.querySelectorAll("[data-field],[data-column],[aria-colindex],[aria-label]")]
        .map((el) => el.getAttribute("data-field") || el.getAttribute("data-column") || el.getAttribute("aria-label") || "")
        .map(clean).filter(Boolean))].slice(0, 30);
      // Scroll containers
      const scrollers = [...document.querySelectorAll("*")]
        .filter((el) => el.scrollHeight > el.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(el).overflowY))
        .map((el) => `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]}`).slice(0, 8);
      return { url: location.href, repeatedContainers: repeated, fieldHints, scrollContainers: [...new Set(scrollers)], tableCount: document.querySelectorAll("table").length };
    });
    console.log(`--- DEEP ${deepPath} (Struktur, keine Werte) ---`);
    console.log(JSON.stringify(dump, null, 2));
    await browser.close();
    process.exit(0);
  }

  if (domStructure) {
    await loginPassword();
    const pages = ["/e", "/work-hours", "/absences", "/reporting"];
    const out = [];
    for (const path of pages) {
      try {
        await page.goto(new URL(path, baseUrl).href, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});
        await page.waitForTimeout(3500);
      } catch { /* still dump what rendered */ }
      // STRUCTURE ONLY: header labels + row counts + roles. No data cells.
      const struct = await page.evaluate(() => {
        const tables = [...document.querySelectorAll("table, [role=table], [role=grid]")].map((t) => ({
          headers: [...t.querySelectorAll("thead th, [role=columnheader]")].map((h) => (h.innerText || "").trim().slice(0, 40)),
          bodyRows: t.querySelectorAll("tbody tr, [role=row]").length
        }));
        // Common SPA list pattern: repeated role=listitem / data-testid rows
        const listGroups = {};
        for (const el of document.querySelectorAll("[data-testid], [role=listitem]")) {
          const key = el.getAttribute("data-testid") || "role:listitem";
          listGroups[key] = (listGroups[key] || 0) + 1;
        }
        return {
          tables,
          repeatedTestIds: Object.entries(listGroups).filter(([, n]) => n > 2).sort((a, b) => b[1] - a[1]).slice(0, 15)
        };
      });
      out.push({ path, urlAfter: page.url(), ...struct });
    }
    console.log("--- DOM-STRUKTUR (nur Spaltenlabels + Zeilenzahlen, keine Werte) ---");
    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    process.exit(0);
  }

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

    // Broad channel sniffer: every response of any data-ish content type,
    // logged by host + path + type + byte size (no bodies). Reveals
    // GraphQL/tRPC/RSC/streaming endpoints the JSON-GET filter misses.
    const channelLog = [];
    page.on("response", async (response) => {
      const ct = response.headers()["content-type"] ?? "";
      if (!/json|graphql|text\/x-component|event-stream|octet-stream|protobuf|grpc/i.test(ct)) return;
      let size = null;
      try { size = (await response.body()).length; } catch { /* streamed */ }
      const u = new URL(response.url());
      channelLog.push({
        method: response.request().method(),
        status: response.status(),
        host: u.host,
        path: u.pathname + (u.search ? "?…" : ""),
        ct: ct.split(";")[0],
        bytes: size
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

    console.log("--- CHANNEL-LOG (alle Daten-Responses, Host+Pfad+Typ+Bytes) ---");
    // Dedupe by host+path+method, keep max bytes seen
    const byKey = new Map();
    for (const e of channelLog) {
      const k = `${e.method} ${e.host}${e.path}`;
      const prev = byKey.get(k);
      if (!prev || (e.bytes ?? 0) > (prev.bytes ?? 0)) byKey.set(k, e);
    }
    console.log(JSON.stringify([...byKey.values()].sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0)), null, 2));

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
