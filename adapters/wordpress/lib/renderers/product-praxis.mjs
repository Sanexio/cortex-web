// Renderer for products in the "praxis" view — HWG-compliant.
// Emits Gutenberg HTML (core/paragraph, core/heading, core/table, core/buttons).
// Reads only the `.de` locale (Phase 1 scope).

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function paragraphBlock(text) {
  const safe = escapeHtml(text).replace(/\n/g, "<br>");
  return `<!-- wp:paragraph -->\n<p>${safe}</p>\n<!-- /wp:paragraph -->`;
}

function headingBlock(text, level = 2) {
  const safe = escapeHtml(text);
  return `<!-- wp:heading {"level":${level}} -->\n<h${level} class="wp-block-heading">${safe}</h${level}>\n<!-- /wp:heading -->`;
}

function parameterTableBlock(parameters) {
  const rows = parameters
    .map((p) => `<tr><td>${escapeHtml(p.code)}</td><td>${escapeHtml(p.einheit)}</td></tr>`)
    .join("");
  const html = `<figure class="wp-block-table"><table><thead><tr><th>Parameter</th><th>Einheit</th></tr></thead><tbody>${rows}</tbody></table></figure>`;
  return `<!-- wp:table -->\n${html}\n<!-- /wp:table -->`;
}

function ctaButtonBlock(label, url) {
  const safeLabel = escapeHtml(label);
  const safeUrl = escapeAttr(url);
  const inner = `<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="${safeUrl}">${safeLabel}</a></div>`;
  return `<!-- wp:buttons -->\n<div class="wp-block-buttons">${inner}</div>\n<!-- /wp:buttons -->`;
}

export function renderProductPraxis(product, { sourcePath }) {
  const praxis = product.views.praxis;

  // HWG safeguard, schema also enforces this
  if (praxis.show_price !== false) {
    throw new Error(`product-praxis: HWG violation — show_price must be false for praxis view (id=${product.id})`);
  }

  const title = praxis.headline_override?.de ?? product.title.de;

  const blocks = [];

  if (product.tagline?.de) {
    blocks.push(paragraphBlock(product.tagline.de));
  }
  if (product.beschreibung?.de) {
    blocks.push(paragraphBlock(product.beschreibung.de));
  }

  blocks.push(headingBlock("Laborparameter", 2));
  blocks.push(parameterTableBlock(product.parameters));

  blocks.push(ctaButtonBlock(praxis.cta_label.de, praxis.cta_url));

  const content = blocks.join("\n\n");

  return {
    slug: product.id,
    title,
    content,
    status: "publish",
    meta: {
      _cortex_web_source: sourcePath,
      _cortex_web_view: "praxis",
      _cortex_web_product_id: product.id
    }
  };
}
