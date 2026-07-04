/* cyber-theme.js — setzt das gewaehlte Cyber-Theme frueh, bevor die
 * statische Landing-Seite rendert (kein Flackern). Auf proxied
 * Harness-Routen wird KEIN data-theme gesetzt; dort rendert die SPA
 * CyberPunk/CyberWhite nativ ueber cortex-dashboard-theme.
 *
 * Landing-Pfade: "/" und "/index.html".
 * Themes: "cyber-dark" (Default, kein Attribut) | "cyber-white".
 * Quelle: URL-Param ?theme=... (gewinnt, wird persistiert) >
 * localStorage "cortex_cyber_theme".
 *
 * Nicht-Landing-Pfade: pending-Prefill fuer die Harness-SPA, dann return. */
(function () {
  var KEY = "cortex_cyber_theme";
  var DASHBOARD_KEY = "cortex-dashboard-theme";

  function prefillDashboardTheme() {
    try {
      if (window.localStorage.getItem(KEY + "_pending") === "1") {
        var portal = window.localStorage.getItem(KEY);
        window.localStorage.setItem(
          DASHBOARD_KEY,
          portal === "cyber-white" ? "cyber-white" : "sanexio-punk"
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
    var m = window.location.search.match(/[?&]theme=(cyber-white|cyber-dark)(&|$)/);
    if (m) {
      theme = m[1];
      try { window.localStorage.setItem(KEY, theme); } catch (e) {}
    }
    if (!theme) theme = window.localStorage.getItem(KEY);
  } catch (e) {}
  if (theme === "cyber-white") {
    document.documentElement.setAttribute("data-theme", "cyber-white");
  }
})();
