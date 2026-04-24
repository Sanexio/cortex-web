// Renderer for praxis-only service pages (S34 B-2a).
// Concatenates all `service-body` sections' body_html.de into WP post_content
// and surfaces wp hints (template, parent_slug, eyebrow, sub) as meta fields
// that the WP adapter layer / theme consume.

export function renderServicePraxis(page, { sourcePath, parentId = null } = {}) {
  if (page.site !== "praxis" && page.site !== "shared") {
    throw new Error(`service-praxis: unsupported site "${page.site}" (id=${page.id})`);
  }
  const slug = page.slugs?.praxis;
  if (!slug) {
    throw new Error(`service-praxis: missing slugs.praxis (id=${page.id})`);
  }
  const title = page.title?.de;
  if (!title) {
    throw new Error(`service-praxis: missing title.de (id=${page.id})`);
  }

  const bodyBlocks = [];
  for (const section of page.sections) {
    if (section.type !== "service-body") {
      throw new Error(`service-praxis: unsupported section "${section.type}" (id=${page.id})`);
    }
    const de = section.body_html?.de;
    if (!de) {
      throw new Error(`service-praxis: section missing body_html.de (id=${page.id})`);
    }
    bodyBlocks.push(de.trim());
  }
  const content = bodyBlocks.join("\n\n");

  const wp = page.wp ?? {};
  const meta = {
    _cortex_web_source: sourcePath,
    _cortex_web_view: "praxis",
    _cortex_web_page_id: page.id
  };
  if (wp.page_template) {
    meta._wp_page_template = wp.page_template;
  }
  if (wp.eyebrow?.de) {
    meta.pxz_standard_eyebrow = wp.eyebrow.de;
  }
  if (wp.sub?.de) {
    meta.pxz_standard_sub = wp.sub.de;
  }

  const payload = {
    slug,
    title,
    content,
    status: "publish",
    meta
  };
  if (parentId !== null && parentId !== undefined) {
    payload.parent = Number(parentId);
  }
  if (wp.parent_slug) {
    payload._parent_slug_hint = wp.parent_slug;
  }
  return payload;
}
