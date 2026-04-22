// Cortex-Web — WordPress extractor registry (site -> proto-trunk).
// cross-site-transfer Phase C2 (skeleton), 2026-04-22.

export const EXTRACTOR_REGISTRY = {
  "wordpress.page": {
    tool: "adapters/wordpress/extract-page.mjs",
    input: "slug or numeric id",
    output: "proto-trunk JSON (page body + meta + template hint)",
    status: "skeleton"
  },
  "wordpress.theme-file": {
    tool: "adapters/wordpress/extract-theme-file.mjs",
    input: "theme-relative path (e.g. inc/team-data.php)",
    output: "(not built) — requires filesystem or SSH access, no WP REST route",
    status: "planned"
  }
};

export function listExtractors() {
  return Object.entries(EXTRACTOR_REGISTRY).map(([key, val]) => ({ key, ...val }));
}
