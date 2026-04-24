// Renderer: Trunk TeamMembers -> Praxis-Theme JSON data file
// Target file: inc/data/team.json (consumed by pxz_team_doctors() after patch)
// N-1 WP-Template-Adapter (Pattern B reverse), Session 29, 2026-04-23.
//
// Schema mapping Trunk -> Praxis-View (CW-004 DE canonical):
//   slug                -> slug
//   name                -> name
//   role.de             -> title
//   languages           -> languages (array, 1:1)
//   intro.de (trimmed)  -> intro
//   accent              -> accent
//   image (media://...) -> image_id (phase 0: always 0, matches IST behavior)
//   profile_urls.praxis -> profile_url (fallback: "/<slug>/")
//
// Fields intentionally dropped from praxis view: id, order (implicit via sort),
// qualifications, bio, image_asset_juvantis. They remain in the trunk for the
// shopify/juvantis view.

function pick(member, path, fallback = null) {
  const segs = path.split(".");
  let v = member;
  for (const s of segs) {
    if (v == null || typeof v !== "object") return fallback;
    v = v[s];
  }
  return v ?? fallback;
}

function mapSingle(member) {
  if (!member || typeof member !== "object") {
    throw new Error(`team-praxis: invalid member entry (not an object)`);
  }
  if (!member.slug) throw new Error(`team-praxis: member missing slug`);
  if (!member.name) throw new Error(`team-praxis: member "${member.slug}" missing name`);

  const roleDe = pick(member, "role.de", "");
  const introDe = (pick(member, "intro.de", "") || "").trim();
  const profileUrl = pick(member, "profile_urls.praxis", `/${member.slug}/`);

  return {
    slug: member.slug,
    name: member.name,
    title: roleDe,
    languages: Array.isArray(member.languages) ? [...member.languages] : [],
    intro: introDe,
    accent: member.accent || "ink",
    // Numeric image -> image_id (Block A shortcut, Session 32). Non-numeric (null /
    // future media:// URIs) still renders as 0 until N-1b media-ID-Resolver lands.
    image_id: typeof member.image === "number" ? member.image : 0,
    profile_url: profileUrl
  };
}

export function renderTeamPraxis(teamMembers) {
  if (!Array.isArray(teamMembers)) {
    throw new Error(`team-praxis: teamMembers is not an array`);
  }
  if (teamMembers.length === 0) {
    throw new Error(`team-praxis: no team members supplied`);
  }

  // Sort by trunk order ascending. Stable for equal order values.
  const sorted = [...teamMembers].sort((a, b) => {
    const oa = Number.isFinite(a.order) ? a.order : 9999;
    const ob = Number.isFinite(b.order) ? b.order : 9999;
    return oa - ob;
  });

  return sorted.map(mapSingle);
}

export const RENDERER_META = {
  id: "wordpress.template.praxis.team",
  consumes: "trunk/content/team/*.yaml",
  produces: "inc/data/team.json (Praxis-Theme)",
  schema_ref: "trunk/schema/team-member.schema.json"
};
