// Cortex-Web — WordPress renderer registry.
// cross-site-transfer Phase C (registry skeleton), 2026-04-22.

export const RENDERER_REGISTRY = {
  "wordpress.page.praxis": {
    tool: "tools/sync-wp.sh",
    source_shape: "trunk/content/products/**/<id>.yaml (views.praxis)",
    target_shape: "WordPress Page via /wp/v2/pages",
    status: "stable"  // in use since Phase 1 POC (Session 1)
  },
  "wordpress.template.praxis": {
    tool: "tools/sync-team-wp.sh",
    source_shape: "trunk/content/team/*.yaml (8 members)",
    target_shape: "Praxis-Theme file inc/data/team.json (consumed by pxz_team_doctors)",
    status: "stable"  // N-1 Session 29 (2026-04-23), Pattern B reverse for WP
  }
};

export function listRenderers() {
  return Object.entries(RENDERER_REGISTRY).map(([key, val]) => ({ key, ...val }));
}
