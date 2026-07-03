/* cyber-theme.js — setzt das gewaehlte Cyber-Theme frueh, bevor die
 * Seite rendert (kein Flackern). Gilt NUR fuer die Landing-Seite;
 * die proxied Sub-Container bleiben CyberDark (die Harness-SPA ist
 * nicht vollstaendig tokenisiert, siehe cyber-overlay.css).
 *
 * Themes: "cyber-dark" (Default, kein Attribut) | "cyber-white" (Tron).
 * Quelle: URL-Param ?theme=... (gewinnt, wird persistiert) >
 * localStorage "cortex_cyber_theme". */
(function () {
  var KEY = "cortex_cyber_theme";
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
