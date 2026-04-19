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
      1440: {
        ".pxz-loc-card--main": {
          paddingTop: "112px",
          paddingLeft: "96px",
          paddingRight: "96px",
          paddingBottom: "96px",
          position: "relative",
        },
        ".pxz-loc-card--main .pxz-loc-badge": {
          position: "static",
        },
        ".pxz-mfa-card": {
          paddingTop: "112px",
          paddingLeft: "96px",
        },
        ".pxz-final-card": {
          padding: "0px",
          backgroundColor: "rgba(0, 0, 0, 0)",
          boxShadow: "none",
        },
      },
      768: {
        ".pxz-loc-card--main": {
          paddingTop: "96px",
          paddingLeft: "72px",
        },
        ".pxz-loc-card--main .pxz-loc-badge": {
          position: "static",
        },
        ".pxz-mfa-card": {
          paddingTop: "96px",
          paddingLeft: "72px",
        },
        ".pxz-hero-sub": {
          textAlign: "center",
        },
      },
      430: {
        ".pxz-loc-card--main": {
          paddingTop: "72px",
          paddingLeft: "40px",
        },
        ".pxz-loc-card--main .pxz-loc-badge": {
          position: "static",
        },
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
];

export default pages;
