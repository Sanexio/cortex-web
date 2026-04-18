// Renderer for products in the "juvantis" view — Shopify Product payload.
// Reads only the .de locale (Phase 2 scope).
// body_html is intentionally minimal: theme owns price, variant, images, CTA.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraph(text, cls) {
  const safe = escapeHtml(text).replace(/\n/g, "<br>");
  return `<p class="${cls}">${safe}</p>`;
}

function parameterTable(parameters) {
  const rows = parameters
    .map((p) => `<tr><td>${escapeHtml(p.code)}</td><td>${escapeHtml(p.einheit)}</td></tr>`)
    .join("");
  return `<table class="cw-laborparameter"><thead><tr><th>Code</th><th>Einheit</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function buildBodyHtml(product) {
  const parts = [];
  if (product.tagline?.de) parts.push(paragraph(product.tagline.de, "cw-tagline"));
  if (product.beschreibung?.de) parts.push(paragraph(product.beschreibung.de, "cw-beschreibung"));
  parts.push("<h3>Laborparameter</h3>");
  parts.push(parameterTable(product.parameters));
  return parts.join("\n");
}

function formatPrice(value) {
  // Shopify expects price as string with two decimals.
  if (value === undefined || value === null) return "0.00";
  return Number(value).toFixed(2);
}

export function renderProductJuvantis(product, { sourcePath }) {
  const juvantis = product.views.juvantis;
  if (!juvantis) {
    throw new Error(`product-juvantis: views.juvantis missing (id=${product.id})`);
  }

  const tags = ["cortex-web", product.category]
    .filter(Boolean)
    .join(", ");

  const variant = {
    option1: "Default",
    sku: product.sku,
    price: formatPrice(product.price_eur),
    inventory_management: null,
    requires_shipping: false,
    taxable: true
  };

  return {
    product: {
      handle: product.id,         // explicit handle — Shopify would otherwise derive one from title
      title: product.title.de,
      body_html: buildBodyHtml(product),
      vendor: "Sanexio",
      product_type: product.category,
      tags,
      status: "draft",            // C-1: hardcoded, never overridable
      published_scope: "web",
      variants: [variant]
    },
    meta: {
      cw_source: sourcePath,
      cw_view: "juvantis",
      cw_product_id: product.id
    }
  };
}
