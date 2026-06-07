// Einmal-Scrape: /e-Mitarbeitertabelle → Name + E-Mail + PNr.
// Läuft auf Mini-02 (Ordio-Zugang). Schreibt /tmp/ordio-employees.json.
import { writeFileSync } from "node:fs";
const BASE = process.env.ORDIO_BASE_URL;
const EMAIL = process.env.ORDIO_EMAIL || process.env.ORDIO_USER || "";
const PW = process.env.ORDIO_PASSWORD || "";
const { chromium } = await import("playwright");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } });
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 45000 });
  const pw = page.getByRole("button", { name: /benutzername.*passwort|username.*password/i });
  if (await pw.count()) await pw.first().click();
  await page.locator("#e-mail-oder-benutzername").or(page.locator('input[autocomplete="username"]')).first().fill(EMAIL);
  await page.locator("#passwort").or(page.locator('input[type="password"]')).first().fill(PW);
  await page.getByRole("button", { name: /^(anmelden|login|sign in)$/i }).first().click();
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await page.goto(new URL("/e", BASE).href, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(2500);
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 4000).catch(() => {});
    await page.evaluate(() => { for (const el of document.querySelectorAll("*")) { if (el.scrollHeight > el.clientHeight + 200 && /auto|scroll/.test(getComputedStyle(el).overflowY)) el.scrollTop = el.scrollHeight; } });
    await page.waitForTimeout(500);
  }
  const rows = await page.evaluate(() => {
    const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
    const norm = (v) => clean(v).toLowerCase();
    for (const table of document.querySelectorAll("table")) {
      const headers = [...table.querySelectorAll("thead th")].map((c) => norm(c.innerText));
      const idxName = headers.findIndex((h) => h.includes("name"));
      const idxMail = headers.findIndex((h) => h.includes("mail") || h.includes("e-mail"));
      const idxPnr = headers.findIndex((h) => h.includes("pnr") || h.includes("personal") || h.includes("nummer"));
      if (idxName < 0 || idxMail < 0) continue;
      const out = [];
      for (const tr of table.querySelectorAll("tbody tr")) {
        const cells = [...tr.querySelectorAll("td, th")].map((c) => clean(c.innerText));
        const name = cells[idxName] || "";
        const email = (cells[idxMail] || "").match(/[^\s@]+@[^\s@]+\.[^\s@]+/)?.[0] || "";
        const pnr = (cells[idxPnr] || "").match(/\d{1,8}/)?.[0] || "";
        if (name) out.push({ name, email, pnr });
      }
      if (out.length) return out;
    }
    return [];
  });
  writeFileSync("/tmp/ordio-employees.json", JSON.stringify(rows, null, 2));
  console.log(`geschrieben: ${rows.length} Mitarbeiter, davon mit E-Mail: ${rows.filter((r) => r.email).length}, mit PNr: ${rows.filter((r) => r.pnr).length}`);
} finally { await browser.close(); }
