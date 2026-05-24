// Puppeteer screenshots (AK-9, AK-10, AK-11) — renders both platforms' views
// as PNG evidence and a side-by-side HTML + PNG montage.
//
// Uses system Chrome via puppeteer-core; avoids bundling Chromium.

import { existsSync, writeFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium"
];

function findChrome() {
  for (const p of CHROME_CANDIDATES) if (existsSync(p)) return p;
  throw new Error(`no chrome/chromium found in: ${CHROME_CANDIDATES.join(", ")}`);
}

function shopifyPreviewHtml(product) {
  const title = product.title ?? "(kein Titel)";
  const price = product.variants?.[0]?.price ?? "-";
  const sku = product.variants?.[0]?.sku ?? "-";
  const tags = Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags ?? "");
  const body = product.body_html ?? "";
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>Shopify body_html preview</title>
<style>
  :root { font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif; color: #1a1a1a; }
  body { max-width: 960px; margin: 2rem auto; padding: 1.5rem; }
  header { border-bottom: 1px solid #e0e0e0; padding-bottom: 1rem; margin-bottom: 1.5rem; }
  h1 { font-size: 2rem; margin: 0; color: #0c2340; }
  .price { font-size: 1.4rem; color: #0a7a2a; margin-top: 0.6rem; font-weight: 600; }
  .cw-tagline { font-style: italic; color: #555; font-size: 1.1rem; }
  .cw-beschreibung { line-height: 1.55; margin: 1rem 0; }
  h3 { margin-top: 1.6rem; font-size: 1.1rem; color: #0c2340; }
  table.cw-laborparameter { border-collapse: collapse; width: 100%; margin-top: 0.6rem; font-size: 0.95rem; }
  th, td { border: 1px solid #dcdcdc; padding: 0.45rem 0.7rem; text-align: left; }
  th { background: #f6f6f6; }
  .meta { font-size: 0.82rem; color: #777; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1rem; }
  .cta { display: inline-block; margin-top: 1.2rem; padding: 0.6rem 1.1rem; background: #0c2340; color: #fff; border-radius: 4px; text-decoration: none; }
</style></head><body>
<header>
  <h1>${title}</h1>
  <div class="price">${price} €</div>
</header>
${body}
<a class="cta" href="#">Jetzt buchen</a>
<div class="meta">
  Shopify Draft-Preview &middot; handle <code>${product.handle ?? "-"}</code> &middot; id <code>${product.id ?? "-"}</code> &middot; status <code>${product.status ?? "-"}</code> &middot; sku <code>${sku}</code> &middot; tags <code>${tags}</code>
</div>
</body></html>`;
}

function sideBySideHtml({ trunkId, wpShot, shopifyShot, wpLink, shopifyAdminUrl, now }) {
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>Cortex-Web Phase 3 — Side by Side</title>
<style>
  :root { font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif; color: #1a1a1a; }
  body { margin: 0; background: #f4f4f6; }
  header { padding: 1.2rem 2rem; background: #0c2340; color: #fff; }
  header h1 { margin: 0; font-size: 1.4rem; }
  header p { margin: 0.3rem 0 0; opacity: 0.85; }
  .row { display: flex; gap: 16px; padding: 20px; }
  .col { flex: 1; background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
  .col header { background: #f6f7fa; color: #0c2340; padding: 0.8rem 1rem; border-bottom: 1px solid #e0e0e0; }
  .col h2 { margin: 0; font-size: 1.05rem; }
  .col .sub { font-size: 0.85rem; color: #555; margin-top: 0.15rem; }
  .shot { padding: 10px; }
  .shot img { display: block; width: 100%; height: auto; border: 1px solid #e9e9e9; border-radius: 4px; }
  .meta { font-size: 0.75rem; color: #888; padding: 0.6rem 1rem 0.9rem; border-top: 1px solid #eee; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
</style></head><body>
<header>
  <h1>Cortex-Web Phase 3 — Side-by-Side Review</h1>
  <p>Trunk-Produkt <code>${trunkId}</code> &middot; dieselbe YAML rendert auf zwei Plattformen &middot; ${now}</p>
</header>
<div class="row">
  <div class="col">
    <header>
      <h2>WordPress (Tenant-Site, Local-WP)</h2>
      <div class="sub">Praxis-Sicht &middot; HWG-konform &middot; ohne Preis &middot; CTA verlinkt auf die Tenant-Shop-Domain</div>
    </header>
    <div class="shot"><img src="./${wpShot}" alt="WP-Page-Screenshot"></div>
    <div class="meta">Quelle: <code>${wpLink ?? "-"}</code></div>
  </div>
  <div class="col">
    <header>
      <h2>Shopify (Tenant-Store)</h2>
      <div class="sub">Shop-Sicht &middot; mit Preis &middot; mit Buchungs-CTA &middot; Draft-Produkt</div>
    </header>
    <div class="shot"><img src="./${shopifyShot}" alt="Shopify body_html Preview"></div>
    <div class="meta">Quelle: Admin <code>${shopifyAdminUrl ?? "-"}</code></div>
  </div>
</div>
</body></html>`;
}

async function shotSize(path) {
  try { return statSync(path).size; } catch { return 0; }
}

export async function runScreenshots(ctx) {
  const { wpPageLink, shopifyProduct, evidenceDir, trunk, shopifyStore, shopifyProductId } = ctx;

  const executablePath = findChrome();
  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    acceptInsecureCerts: true,       // Local-WP uses a self-signed cert
    args: ["--no-sandbox", "--ignore-certificate-errors"]
  });

  const wpShotPath = resolve(evidenceDir, "wp-page-9668.png");
  const shopifyShotPath = resolve(evidenceDir, "shopify-body-preview.png");
  const sideHtmlPath = resolve(evidenceDir, "side-by-side.html");
  const sidePngPath = resolve(evidenceDir, "side-by-side.png");

  let wpOk = false;
  let shopifyOk = false;
  let sideOk = false;
  const errors = [];

  try {
    // WP live screenshot (WP page public URL, HTTP Basic auth if enforced).
    if (!wpPageLink) {
      errors.push("wpPageLink missing — parity failed?");
    } else {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      if (process.env.WP_USER && process.env.WP_APP_PASSWORD) {
        await page.authenticate({ username: process.env.WP_USER, password: process.env.WP_APP_PASSWORD });
      }
      try {
        await page.goto(wpPageLink, { waitUntil: "networkidle2", timeout: 30000 });
        await page.screenshot({ path: wpShotPath, fullPage: true });
        wpOk = (await shotSize(wpShotPath)) > 10_000;
      } catch (err) {
        errors.push(`wp screenshot failed: ${err.message}`);
      }
      await page.close();
    }

    // Shopify preview — body_html in minimal shell.
    if (!shopifyProduct) {
      errors.push("shopifyProduct missing — parity failed?");
    } else {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      await page.setContent(shopifyPreviewHtml(shopifyProduct), { waitUntil: "domcontentloaded" });
      await page.screenshot({ path: shopifyShotPath, fullPage: true });
      shopifyOk = (await shotSize(shopifyShotPath)) > 10_000;
      await page.close();
    }

    // Side-by-side HTML + PNG.
    if (wpOk && shopifyOk) {
      const adminUrl = `https://${shopifyStore.replace(/\.myshopify\.com$/, "")}.myshopify.com/admin/products/${shopifyProductId}`;
      const html = sideBySideHtml({
        trunkId: trunk.id,
        wpShot: "wp-page-9668.png",
        shopifyShot: "shopify-body-preview.png",
        wpLink: wpPageLink,
        shopifyAdminUrl: adminUrl,
        now: ctx.now
      });
      writeFileSync(sideHtmlPath, html);

      const page = await browser.newPage();
      await page.setViewport({ width: 1600, height: 1200 });
      await page.goto("file://" + sideHtmlPath, { waitUntil: "networkidle2", timeout: 30000 });
      await page.screenshot({ path: sidePngPath, fullPage: true });
      sideOk = (await shotSize(sidePngPath)) > 10_000 && existsSync(sideHtmlPath);
      await page.close();
    }
  } finally {
    await browser.close();
  }

  const details = {
    wp_page_png: wpShotPath,
    wp_page_png_bytes: await shotSize(wpShotPath),
    shopify_preview_png: shopifyShotPath,
    shopify_preview_png_bytes: await shotSize(shopifyShotPath),
    side_by_side_html: sideHtmlPath,
    side_by_side_png: sidePngPath,
    side_by_side_png_bytes: await shotSize(sidePngPath),
    errors
  };
  writeFileSync(
    resolve(evidenceDir, "screenshots.json"),
    JSON.stringify({ wp_ok: wpOk, shopify_ok: shopifyOk, side_ok: sideOk, ...details, timestamp: ctx.now }, null, 2) + "\n"
  );

  return {
    wp: { ok: wpOk, details: { png: wpShotPath, bytes: details.wp_page_png_bytes, errors } },
    shopify: { ok: shopifyOk, details: { png: shopifyShotPath, bytes: details.shopify_preview_png_bytes } },
    side: { ok: sideOk, details: { html: sideHtmlPath, png: sidePngPath, bytes: details.side_by_side_png_bytes } }
  };
}
