// page-registry.mjs — Zentrale Liste aller verifizierten Seiten.
//
// Eintrag pro Seite:
//   slug       — kurzer Bezeichner (Screenshot-Dateiname, --slug-Filter)
//   url        — absolute URL für Live-Aufruf
//   viewports  — Array von Viewport-Breiten (Computed-Style-Probe pro VP)
//   expected   — { viewport: { selector: { cssProp: expectedValue } } }
//                Computed-Style-Assertion pro Selector pro Viewport.
//   exists     — Array von Selektoren, die auf ALLEN Viewports im DOM
//                vorhanden sein MÜSSEN (optional). Dient u. a. der
//                DSGVO-Pflichtfeld-Prüfung (PXZ-E-005).
//
// Eingeführt durch Sprint 0 / S0.4 (2026-04-18). Ersetzt die zuvor
// hartkodierten Home-EXPECTED in probe-design.mjs.

const BASE = "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local";

export const pages = [
  {
    slug: "home",
    url: `${BASE}/`,
    viewports: [1440, 768, 430],
    expected: {
      // S55+ (2026-04-30): .pxz-loc-card--combined wurde im Slider-Halbierungs-Sweep
      // nicht mehr auf der Home gerendert — Standorte-Container ersetzt durch
      // pxz-home-Slider-Strip + verlinktem Standorte-Block. Showpiece reduziert
      // auf .pxz-mfa-card (MFA-Karriere-Block, weiterhin auf Home).
      1440: {
        ".pxz-mfa-card": {
          paddingTop: "112px",
          paddingLeft: "96px",
        },
      },
      768: {
        ".pxz-mfa-card": {
          paddingTop: "96px",
          paddingLeft: "72px",
        },
        ".pxz-hero-sub": {
          textAlign: "center",
        },
      },
      430: {
        ".pxz-mfa-card": {
          paddingTop: "72px",
          paddingLeft: "40px",
        },
      },
    },
  },
  {
    slug: "karriere",
    url: `${BASE}/karriere/`,
    viewports: [1440, 768, 430],
    expected: {
      1440: {
        ".pxz-kar-card": {
          paddingTop: "112px",
          paddingLeft: "96px",
          paddingRight: "96px",
        },
        ".pxz-kar-eyebrow": { color: "rgb(245, 184, 0)" },
      },
      768: {
        ".pxz-kar-card": {
          paddingTop: "96px",
          paddingLeft: "72px",
          paddingRight: "72px",
        },
        ".pxz-kar-eyebrow": { color: "rgb(245, 184, 0)" },
      },
      430: {
        ".pxz-kar-card": {
          paddingTop: "72px",
          paddingLeft: "40px",
          paddingRight: "40px",
        },
        ".pxz-kar-eyebrow": { color: "rgb(245, 184, 0)" },
      },
    },
    exists: [
      ".pxz-kar-hero",
      ".pxz-kar-card",
      "form[id^='wpforms-form-']",
      ".wpforms-field-name",
      ".wpforms-field-email",
      ".wpforms-field-phone",
      ".wpforms-field-textarea",
      ".wpforms-field-file-upload",
      ".wpforms-field-checkbox input[required]",
    ],
  },
  // S2.3 Batch B — 3 neue Pages (2026-04-19)
  {
    slug: "praxis",
    url: `${BASE}/praxis/`,
    viewports: [1440, 768, 430],
    expected: {},
    exists: [
      // S58+ (2026-05-01): Praxis-Seite umstrukturiert auf pxz-pg-* (Page-Grundtyp,
      // Praxisgemeinschaft-Refresh + Co-Brand). Alte .pxz-standard-*-Selektoren
      // ersetzt durch dichteres Story-/Stats-/Coop-/Adv-Layout.
      ".pxz-pg-hero",
      ".pxz-pg-hero-inner",
      ".pxz-pg-stats",
      ".pxz-pg-coop",
      ".pxz-pg-adv",
      'script[type="application/ld+json"]',
      'link[rel="canonical"]',
      'meta[name="description"]',
    ],
  },
  {
    slug: "team",
    url: `${BASE}/team/`,
    viewports: [1440, 768, 430],
    expected: {},
    exists: [
      // Team page rebuilt to doctor-grid in S2.3-B revision
      ".pxz-team",
      ".pxz-team-hero",
      "h1.pxz-team-title",
      ".pxz-team-grid",
      ".pxz-team-card",
      ".pxz-team-cta",
      'script[type="application/ld+json"]',
      'link[rel="canonical"]',
      'meta[name="description"]',
    ],
  },
  {
    slug: "404",
    url: `${BASE}/diese-seite-gibt-es-nicht-s23b-probe/`,
    viewports: [1440, 768, 430],
    expected: {},
    exists: [
      ".pxz-404",
      ".pxz-404-hero",
      "h1.pxz-404-title",
      ".pxz-404-search",
      '.pxz-404-search input[type="search"]',
      ".pxz-404-top-links",
      'meta[name="robots"]',
    ],
  },
];

export default pages;
