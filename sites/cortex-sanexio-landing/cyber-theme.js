/* cyber-theme.js — setzt das gewaehlte Cyber-Theme frueh, bevor die
 * statische Landing-Seite rendert (kein Flackern). Auf proxied
 * Harness-Routen wird KEIN data-theme gesetzt; dort rendert die SPA
 * CyberPunk/CyberWhite nativ ueber cortex-dashboard-theme.
 *
 * Landing-Pfade: "/" und "/index.html".
 * Themes: "cyber-dark" (Default, kein Attribut) | "cyber-white" | "praxis2025".
 * Quelle: URL-Param ?theme=... (gewinnt, wird persistiert) >
 * Cookie/localStorage "cortex_cyber_theme".
 *
 * Nicht-Landing-Pfade: pending-Prefill fuer die Harness-SPA, dann return. */
(function () {
  var KEY = "cortex_cyber_theme";
  var DASHBOARD_KEY = "cortex-dashboard-theme";
  var DARK = "cyber-dark";
  var LIGHT = "cyber-white";
  var PRAXIS = "praxis2025";

  function normalize(theme) {
    if (theme === PRAXIS) return PRAXIS;
    if (theme === LIGHT || theme === "white" || theme === "light") return LIGHT;
    if (theme === "sanexio-punk" || theme === "cyber-punk" || theme === "dark") return DARK;
    return DARK;
  }

  function readThemeCookie() {
    try {
      var prefix = KEY + "=";
      var parts = document.cookie ? document.cookie.split(";") : [];
      for (var i = 0; i < parts.length; i += 1) {
        var part = parts[i].replace(/^\s+/, "");
        if (part.indexOf(prefix) === 0) return decodeURIComponent(part.slice(prefix.length));
      }
    } catch (e) {}
    return null;
  }

  function writeThemeCookie(value) {
    try {
      var cookie = KEY + "=" + encodeURIComponent(value) + "; Path=/; Max-Age=31536000; SameSite=Lax";
      var host = window.location.hostname || "";
      var domain = "cortex-sanexio.tech";
      if (host.slice(-domain.length) === domain) cookie += "; Domain=.cortex-sanexio.tech";
      if (window.location.protocol === "https:") cookie += "; Secure";
      document.cookie = cookie;
    } catch (e) {}
  }

  function storageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {}
  }

  function persistTheme(theme) {
    writeThemeCookie(theme);
    storageSet(KEY, theme);
  }

  function applyDocumentTheme(theme) {
    if (theme === LIGHT) {
      document.documentElement.setAttribute("data-theme", LIGHT);
    } else if (theme === PRAXIS) {
      document.documentElement.setAttribute("data-theme", PRAXIS);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function labelTheme(theme) {
    return theme === PRAXIS ? "PRAXIS 2025" : theme === LIGHT ? "CYBERWHITE" : "CYBER-DARK";
  }

  function readStoredTheme() {
    return normalize(readThemeCookie() || storageGet(KEY) || DARK);
  }

  function syncLandingToggle() {
    try {
      var btn = document.getElementById("theme-switch");
      var val = document.getElementById("theme-switch-value");
      var restored = readStoredTheme();
      applyDocumentTheme(restored);
      storageSet(KEY, restored);
      if (val) val.textContent = labelTheme(restored);
      if (!btn) return;
      btn.addEventListener("click", function () {
        window.setTimeout(function () {
          var active = normalize(document.documentElement.getAttribute("data-theme") || DARK);
          persistTheme(active);
          if (val) val.textContent = labelTheme(active);
        }, 0);
      });
    } catch (e) {}
  }

  function prefillDashboardTheme() {
    try {
      var portal = readThemeCookie() || storageGet(KEY);
      if (portal) {
        portal = normalize(portal);
        storageSet(
          DASHBOARD_KEY,
          portal === PRAXIS ? PRAXIS : portal === LIGHT ? "cyber-white" : "sanexio-punk"
        );
      }
    } catch (e) {}
  }

  var path = window.location.pathname;
  if (path !== "/" && path !== "/index.html") {
    prefillDashboardTheme();
    return;
  }

  var theme = null;
  try {
    var m = window.location.search.match(/[?&]theme=(cyber-white|cyber-dark|praxis2025)(&|$)/);
    if (m) {
      theme = normalize(m[1]);
      persistTheme(theme);
    }
    if (!theme) theme = readThemeCookie() || storageGet(KEY);
    if (!theme) {
      theme = DARK;
      persistTheme(theme);
    }
    theme = normalize(theme);
  } catch (e) {}
  applyDocumentTheme(theme);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncLandingToggle);
  } else {
    syncLandingToggle();
  }
})();
