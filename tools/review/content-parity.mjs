// Content-Parity — verifies that the WP page and the Shopify product each
// reflect the trunk source faithfully for their respective views (AK-2, AK-3).
//
// WP (praxis view):
//   - GET /wp/v2/pages?slug=<id>&status=any  → exactly 1 match
//   - content.rendered contains: headline_override.de OR title.de, tagline.de,
//     beschreibung.de, praxis.cta_label.de, praxis.cta_url, all 15 parameter codes.
//
// Shopify (juvantis view):
//   - GET /products.json?handle=<id>         → exactly 1 match
//   - title matches trunk.title.de
//   - body_html contains tagline.de, beschreibung.de, all 15 parameter codes
//   - variants[0].price == price_eur (number-compare, Shopify returns string)
//   - variants[0].sku == trunk.sku
//
// Output: specs/phase-3/evidence/content-parity.json

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

function contains(haystack, needle) {
  return typeof haystack === "string" && typeof needle === "string" && haystack.includes(needle);
}

function allContain(haystack, needles) {
  const missing = needles.filter((n) => !contains(haystack, n));
  return { ok: missing.length === 0, missing };
}

export async function runContentParity(ctx) {
  const { trunk, wpClient, shopifyClient, evidenceDir, wpSlug, shopifyHandle } = ctx;

  const parameterCodes = (trunk.parameters ?? []).map((p) => p.code);

  // ---------- WordPress ----------
  const wpLookup = await wpClient.get(
    `/wp/v2/pages?slug=${encodeURIComponent(wpSlug)}&status=any&per_page=10`
  );
  const wpCount = Array.isArray(wpLookup) ? wpLookup.length : -1;

  const wpDetails = {
    page_id: null,
    link: null,
    lookup_count: wpCount,
    headline_expected: null,
    checks: {},
    missing: {}
  };
  let wpOk = false;

  if (wpCount === 1) {
    const page = wpLookup[0];
    wpDetails.page_id = page.id;
    wpDetails.link = page.link;
    const rendered = page.content?.rendered ?? "";
    const titleRaw = page.title?.rendered ?? "";
    const fullText = titleRaw + "\n" + rendered;

    const expectedHeadline = trunk.views.praxis.headline_override?.de ?? trunk.title.de;
    wpDetails.headline_expected = expectedHeadline;

    const tagline = trunk.tagline?.de ?? "";
    const beschreibung = (trunk.beschreibung?.de ?? "").trim();
    const ctaLabel = trunk.views.praxis.cta_label?.de ?? "";
    const ctaUrl = trunk.views.praxis.cta_url ?? "";

    const headlineCheck = contains(fullText, expectedHeadline);
    const taglineCheck = contains(fullText, tagline);
    // The WP renderer converts \n to <br> — compare against first line only.
    const beschreibungFirstLine = beschreibung.split("\n")[0];
    const beschreibungCheck = contains(fullText, beschreibungFirstLine);
    const ctaLabelCheck = contains(fullText, ctaLabel);
    const ctaUrlCheck = contains(fullText, ctaUrl);
    const paramsCheck = allContain(fullText, parameterCodes.map((c) => `>${c}<`));

    wpDetails.checks = {
      headline: headlineCheck,
      tagline: taglineCheck,
      beschreibung: beschreibungCheck,
      cta_label: ctaLabelCheck,
      cta_url: ctaUrlCheck,
      parameters: paramsCheck.ok
    };
    wpDetails.missing.parameters = paramsCheck.missing;

    wpOk =
      headlineCheck &&
      taglineCheck &&
      beschreibungCheck &&
      ctaLabelCheck &&
      ctaUrlCheck &&
      paramsCheck.ok;
  }

  // ---------- Shopify ----------
  const shopifyLookup = await shopifyClient.get(
    `/products.json?handle=${encodeURIComponent(shopifyHandle)}&fields=id,handle,title,body_html,variants,product_type,tags,vendor,status,published_at,updated_at`
  );
  const products = (shopifyLookup && Array.isArray(shopifyLookup.products)) ? shopifyLookup.products : [];

  const shopifyDetails = {
    product_id: null,
    handle: null,
    lookup_count: products.length,
    checks: {},
    product: null
  };
  let shopifyOk = false;

  if (products.length === 1) {
    const product = products[0];
    shopifyDetails.product_id = product.id;
    shopifyDetails.handle = product.handle;
    shopifyDetails.product = product;

    const tagline = trunk.tagline?.de ?? "";
    const beschreibungFirstLine = (trunk.beschreibung?.de ?? "").trim().split("\n")[0];
    const body = product.body_html ?? "";

    const titleCheck = product.title === trunk.title.de;
    const taglineCheck = contains(body, tagline);
    const beschreibungCheck = contains(body, beschreibungFirstLine);
    const paramsCheck = allContain(body, parameterCodes.map((c) => `>${c}<`));

    const priceNum = Number(product.variants?.[0]?.price);
    const priceCheck = Number.isFinite(priceNum) && priceNum === Number(trunk.price_eur);
    const skuCheck = product.variants?.[0]?.sku === trunk.sku;

    shopifyDetails.checks = {
      title: titleCheck,
      tagline: taglineCheck,
      beschreibung: beschreibungCheck,
      parameters: paramsCheck.ok,
      price: priceCheck,
      sku: skuCheck
    };
    shopifyDetails.missing_parameters = paramsCheck.missing;

    shopifyOk =
      titleCheck && taglineCheck && beschreibungCheck && paramsCheck.ok && priceCheck && skuCheck;
  }

  const output = {
    timestamp: ctx.now,
    trunk_id: trunk.id,
    wp: { ok: wpOk, ...wpDetails },
    shopify: { ok: shopifyOk, ...shopifyDetails }
  };
  writeFileSync(resolve(evidenceDir, "content-parity.json"), JSON.stringify(output, null, 2) + "\n");

  return {
    wp: { ok: wpOk, details: wpDetails },
    shopify: { ok: shopifyOk, details: shopifyDetails }
  };
}
