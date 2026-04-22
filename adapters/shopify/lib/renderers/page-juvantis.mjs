// Renderer: Trunk-Page + Sections + TeamMembers -> Shopify Page payload.
// Reads only the .de locale for now (Phase 2 scope, consistent with product renderer).
// body_html is a single HTML string; Shopify Pages treat this as the rendered content.
// Classes prefixed "cw-uber-*" so the Sanexio theme can style them later (content-bridge-v1).
// No inline styles — theme keeps full control over typography/colors.
// content-bridge-v1, 2026-04-22.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Minimal Markdown -> HTML: paragraphs split on blank lines, inline formatting preserved as plain text.
// Intentionally not a full MD parser — the trunk YAML body_md content is curated prose, not rich markup.
function renderMarkdownDe(md) {
  const blocks = String(md).trim().split(/\n{2,}/);
  return blocks
    .map((block) => {
      const normalized = block.replace(/\n/g, " ").trim();
      if (!normalized) return "";
      return `<p class="cw-uber-p">${escapeHtml(normalized)}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

// Strip titles + honorifics across DE / EN / FR for initials fallback
// (mirrors pxz_doctor_initials() in the WP theme so visuals stay consistent).
function doctorInitials(name) {
  const cleaned = String(name)
    .replace(/(Dr\.|med\.|méd\.|MBA|Docteur|en|Prof\.|N\.)/gu, "")
    .replace(/[,\.]/gu, " ")
    .trim();
  const parts = cleaned.split(/\s+/u).filter(Boolean);
  return parts.slice(0, 2).map((p) => Array.from(p)[0] ?? "").join("").toUpperCase();
}

function renderIntroSection(section) {
  const parts = ['<section class="cw-uber-intro">'];
  if (section.heading?.de) {
    parts.push(`  <h2 class="cw-uber-intro-heading">${escapeHtml(section.heading.de)}</h2>`);
  }
  if (section.body_md?.de) {
    parts.push(`  <div class="cw-uber-intro-body">\n${renderMarkdownDe(section.body_md.de)}\n  </div>`);
  }
  parts.push("</section>");
  return parts.join("\n");
}

function renderTeamCard(member) {
  const initials = doctorInitials(member.name);
  const accent = `cw-uber-avatar--${escapeHtml(member.accent)}`;
  const role = member.role?.de ? `<p class="cw-uber-card-role">${escapeHtml(member.role.de)}</p>` : "";
  const langs = (member.languages || [])
    .map((l) => `<li class="cw-uber-lang">${escapeHtml(l.toUpperCase())}</li>`)
    .join("");
  const langsHtml = langs ? `<ul class="cw-uber-langs" aria-label="Sprachen">${langs}</ul>` : "";
  const introHtml = member.intro?.de
    ? `<p class="cw-uber-card-intro">${escapeHtml(member.intro.de.trim())}</p>`
    : "";
  return [
    '<li class="cw-uber-card">',
    '  <div class="cw-uber-card-head">',
    `    <span class="cw-uber-avatar ${accent}" aria-hidden="true"><span class="cw-uber-initials">${escapeHtml(initials)}</span></span>`,
    '    <div class="cw-uber-card-ident">',
    `      <h3 class="cw-uber-card-name">${escapeHtml(member.name)}</h3>`,
    `      ${role}`,
    "    </div>",
    "  </div>",
    `  ${introHtml}`,
    `  ${langsHtml}`,
    "</li>"
  ].join("\n");
}

function renderTeamGridSection(section, teamMembers) {
  const requested = section.members === "all"
    ? teamMembers
    : teamMembers.filter((m) => section.members.includes(m.slug));

  if (requested.length === 0) {
    throw new Error(`page-juvantis: team-grid section produced 0 members (requested="${JSON.stringify(section.members)}")`);
  }

  const heading = section.heading?.de
    ? `  <h2 class="cw-uber-team-heading">${escapeHtml(section.heading.de)}</h2>`
    : "";

  const cards = requested.map(renderTeamCard).join("\n");

  return [
    '<section class="cw-uber-team">',
    heading,
    '  <ul class="cw-uber-team-grid">',
    cards,
    "  </ul>",
    "</section>"
  ].filter(Boolean).join("\n");
}

function renderSection(section, teamMembers) {
  switch (section.type) {
    case "intro": return renderIntroSection(section);
    case "team-grid": return renderTeamGridSection(section, teamMembers);
    default: throw new Error(`page-juvantis: unknown section type "${section.type}"`);
  }
}

// Inline-CSS, content-bridge-v1 Option A (Dr. Stracke, 2026-04-22).
// Scoped on `.cw-uber-root` to avoid colliding with the Shopify theme.
// Design-neutral defaults; full Praxis/Sanexio token bridge is out of scope here.
const INLINE_CSS = `
<style>
.cw-uber-root { max-width: 1080px; margin: 0 auto; padding: 2rem 1.25rem; color: #1f2937; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.55; }
.cw-uber-root * { box-sizing: border-box; }

.cw-uber-intro { margin: 0 0 3rem; }
.cw-uber-intro-heading { font-size: clamp(1.75rem, 3vw, 2.5rem); font-weight: 600; line-height: 1.2; margin: 0 0 1rem; color: #111827; letter-spacing: -0.01em; }
.cw-uber-intro-body .cw-uber-p { font-size: 1.0625rem; margin: 0 0 1rem; color: #374151; }
.cw-uber-intro-body .cw-uber-p:last-child { margin-bottom: 0; }

.cw-uber-team { margin: 0; }
.cw-uber-team-heading { font-size: clamp(1.375rem, 2.25vw, 1.875rem); font-weight: 600; line-height: 1.25; margin: 0 0 1.5rem; color: #111827; letter-spacing: -0.01em; }

.cw-uber-team-grid { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }

.cw-uber-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.875rem; transition: box-shadow 0.2s ease, transform 0.2s ease; }
.cw-uber-card:hover { box-shadow: 0 4px 16px rgba(17, 24, 39, 0.08); transform: translateY(-2px); }

.cw-uber-card-head { display: flex; align-items: center; gap: 0.875rem; }
.cw-uber-avatar { flex: 0 0 auto; width: 56px; height: 56px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 1.125rem; letter-spacing: 0.02em; color: #ffffff; }
.cw-uber-avatar--red   { background: #b91c1c; }
.cw-uber-avatar--amber { background: #d97706; }
.cw-uber-avatar--ink   { background: #374151; }
.cw-uber-initials { display: inline-block; line-height: 1; }

.cw-uber-card-ident { flex: 1 1 auto; min-width: 0; }
.cw-uber-card-name { font-size: 1.0625rem; font-weight: 600; line-height: 1.3; margin: 0 0 0.125rem; color: #111827; }
.cw-uber-card-role { font-size: 0.9375rem; color: #6b7280; margin: 0; line-height: 1.35; }

.cw-uber-card-intro { font-size: 0.9375rem; color: #374151; margin: 0; line-height: 1.55; }

.cw-uber-langs { list-style: none; padding: 0; margin: auto 0 0; display: flex; flex-wrap: wrap; gap: 0.375rem; padding-top: 0.5rem; border-top: 1px solid #f3f4f6; }
.cw-uber-lang { font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.06em; padding: 0.25rem 0.5rem; background: #f3f4f6; color: #4b5563; border-radius: 4px; }

@media (max-width: 520px) {
  .cw-uber-root { padding: 1.5rem 1rem; }
  .cw-uber-team-grid { grid-template-columns: 1fr; }
  .cw-uber-card { padding: 1.25rem; }
}
</style>`;

function buildBodyHtml(page, teamMembers) {
  const wrapper = [INLINE_CSS, '<div class="cw-uber-root" data-cw-source="content-bridge-v1">'];
  for (const section of page.sections) {
    wrapper.push(renderSection(section, teamMembers));
  }
  wrapper.push("</div>");
  return wrapper.join("\n");
}

export function renderPageJuvantis(page, teamMembers, { sourcePath }) {
  if (!page.slugs?.juvantis) {
    throw new Error(`page-juvantis: slugs.juvantis missing (id=${page.id})`);
  }
  if (!page.title?.de) {
    throw new Error(`page-juvantis: title.de missing (id=${page.id})`);
  }

  // CW-001: Shopify-Pages use "published: false" for draft, not a status field.
  const published = page.status_juvantis === "active";

  return {
    page: {
      handle: page.slugs.juvantis,
      title: page.title.de,
      body_html: buildBodyHtml(page, teamMembers),
      published: published,
      template_suffix: null
    },
    meta: {
      cw_source: sourcePath,
      cw_view: "juvantis",
      cw_page_id: page.id,
      cw_team_member_count: teamMembers.length
    }
  };
}
