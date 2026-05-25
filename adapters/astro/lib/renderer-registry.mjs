// Cortex-Web Astro-Adapter — Section-Renderer-Registry.
// Maps Trunk-Section-Types to Sanexio-Astro-Component invocations.
//
// Each renderer is a pure function:
//   (section, opts) => { astroImport: string, astroBlock: string }
// where astroImport adds to the Astro-page's frontmatter and astroBlock
// produces the rendered template fragment.
//
// Phase-2 Skelett: 5 Section-Types stubs. Full implementation comes in
// Phase 3 along with the pages-to-astro renderer pipeline.

const REGISTRY = new Map();

function escAttr(s) {
  return String(s ?? "").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function pickLang(obj, lang = "de") {
  if (!obj || typeof obj !== "object") return "";
  return obj[lang] || obj.de || obj.en || "";
}

/** Intro section → <VisionHero> */
REGISTRY.set("intro", (sec, { lang = "de" } = {}) => ({
  astroImport: `import VisionHero from "../components/VisionHero.astro";`,
  astroBlock: `<VisionHero heading="${escAttr(pickLang(sec.heading, lang))}" body={\`${pickLang(sec.body_md, lang).replace(/`/g, "\\`")}\`} />`,
}));

/** team-grid section → <TeamGrid> with members prop */
REGISTRY.set("team-grid", (sec, { lang = "de" } = {}) => {
  const members = sec.members === "all" ? "all" : JSON.stringify(sec.members ?? []);
  return {
    astroImport: `import TeamGrid from "../components/TeamGrid.astro";\nimport { TEAM } from "../data/team";`,
    astroBlock: `<TeamGrid heading="${escAttr(pickLang(sec.heading, lang))}" members={${members === "all" ? "TEAM" : `TEAM.filter(m => ${members}.includes(m.slug))`}} />`,
  };
});

/** body-md → markdown rendered via Astro's set:html */
REGISTRY.set("body-md", (sec, { lang = "de" } = {}) => ({
  astroImport: `import { marked } from "marked";`,
  astroBlock: `<section set:html={marked.parse(\`${pickLang(sec.body_md, lang).replace(/`/g, "\\`")}\`)} />`,
}));

/** body-html → trusted HTML pass-through */
REGISTRY.set("body-html", (sec, { lang = "de" } = {}) => ({
  astroImport: "",
  astroBlock: `<section set:html={\`${pickLang(sec.body_html, lang).replace(/`/g, "\\`")}\`} />`,
}));

/** cross-brand-cta → <CrossBrandCTA> with partner+product slugs */
REGISTRY.set("cross-brand-cta", (sec) => ({
  astroImport: `import CrossBrandCTA from "../components/CrossBrandCTA.astro";`,
  astroBlock: `<CrossBrandCTA partner="${escAttr(sec.partner || "practice")}" product="${escAttr(sec.product || "")}" />`,
}));

export function renderSection(section, opts = {}) {
  const t = section?.type;
  const renderer = REGISTRY.get(t);
  if (!renderer) {
    return {
      astroImport: "",
      astroBlock: `<!-- unknown section type: ${escAttr(t || "")} -->`,
    };
  }
  return renderer(section, opts);
}

export function supportedTypes() {
  return Array.from(REGISTRY.keys());
}
