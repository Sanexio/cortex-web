// Renderer: Trunk-Page + TeamMembers -> Shopify Theme Template JSON
// Target asset: templates/page.<juvantis-slug>.json
// Consumes the existing `juvantis-ueber-uns` custom section in the theme.
// content-bridge-v1 + Option B (Template-Bridge), 2026-04-22.

const TEMPLATE_HEADER = `/*
 * ------------------------------------------------------------
 * IMPORTANT: The contents of this file are auto-generated.
 *
 * This file may be updated by the Shopify admin theme editor
 * or related systems. Please exercise caution as any changes
 * made to this file may be overwritten.
 * ------------------------------------------------------------
 */
`;

function buildTeamBlock(member) {
  // Long-form bio falls back to intro if no bio present.
  const bioText = member.bio?.de?.trim() || member.intro?.de?.trim() || "";
  const qualifications = (member.qualifications || []).join(", ");
  return {
    type: "team_member",
    settings: {
      ...(member.image_asset_shop ? { asset_image: member.image_asset_shop } : {}),
      name: member.name,
      role: member.role?.de || "",
      qualifications,
      bio: bioText
    }
  };
}

function buildValueBlock(value) {
  return {
    type: "value",
    settings: {
      title: value.title,
      text: value.text
    }
  };
}

export function renderTemplateShopUeberUns(page, teamMembers, { sourcePath }) {
  const juv = page.views?.shop;
  if (!juv) {
    throw new Error(`template-shop-ueber-uns: views.shop missing on page id=${page.id}`);
  }
  if (!page.slugs?.shop) {
    throw new Error(`template-shop-ueber-uns: slugs.shop missing on page id=${page.id}`);
  }

  const sortedMembers = [...teamMembers].sort((a, b) => a.order - b.order);

  const blocks = {};
  const blockOrder = [];

  for (const member of sortedMembers) {
    const id = `team_${member.slug.replace(/-/g, "_")}`;
    blocks[id] = buildTeamBlock(member);
    blockOrder.push(id);
  }

  const values = juv.values?.items || [];
  values.forEach((v, idx) => {
    const id = `val_${idx + 1}_${v.title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
    blocks[id] = buildValueBlock(v);
    blockOrder.push(id);
  });

  const aboutSection = {
    type: "juvantis-ueber-uns",
    settings: {
      heading: juv.hero?.heading || "",
      description: juv.hero?.description || "",
      mission_heading: juv.mission?.heading || "",
      mission_text: juv.mission?.text || "",
      team_heading: juv.team?.heading || "",
      history_heading: juv.history?.heading || "",
      history_text: juv.history?.text || "",
      values_heading: juv.values?.heading || "",
      cta_label: juv.cta?.label || "",
      cta_link: juv.cta?.link || "",
      padding_top: juv.padding?.top ?? 0,
      padding_bottom: juv.padding?.bottom ?? 52
    },
    blocks,
    block_order: blockOrder
  };

  const templateJson = {
    sections: {
      main: {
        type: "main-page",
        settings: {
          padding_top: 0,
          padding_bottom: 0
        }
      },
      about: aboutSection
    },
    order: ["main", "about"]
  };

  const assetKey = `templates/page.${page.slugs.shop}.json`;
  const assetValue = TEMPLATE_HEADER + JSON.stringify(templateJson, null, 2) + "\n";

  return {
    asset: {
      key: assetKey,
      value: assetValue
    },
    meta: {
      cw_source: sourcePath,
      cw_view: "shop",
      cw_page_id: page.id,
      cw_team_member_count: sortedMembers.length,
      cw_value_count: values.length,
      cw_section_type: "juvantis-ueber-uns"
    }
  };
}
