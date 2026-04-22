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
    tool: "(not built)",
    source_shape: "(tbd)",
    target_shape: "WordPress template-*.php partial or inc/*.php data file",
    status: "planned"
  }
};

export function listRenderers() {
  return Object.entries(RENDERER_REGISTRY).map(([key, val]) => ({ key, ...val }));
}
