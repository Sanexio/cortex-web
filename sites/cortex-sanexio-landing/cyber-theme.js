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
  /* Harness-SPA (/dashboard/) rendert die Cyber-Skins nativ (builtin
   * sanexio-punk/cyber-white). Dort KEIN Overlay-Attribut setzen —
   * sonst entsteht ein Hybrid aus Overlay + Builtin-Theme. Stattdessen
   * bei pending-Auswahl den Boot-Cache der SPA vorbefuellen; die SPA
   * pusht den Wert selbst (authentifiziert) an den Server und loescht
   * das pending-Flag. */
  if (/^\/dashboard(\/|$)/.test(window.location.pathname)) {
    try {
      if (window.localStorage.getItem(KEY + "_pending") === "1") {
        var portal = window.localStorage.getItem(KEY);
        window.localStorage.setItem(
          "cortex-dashboard-theme",
          portal === "cyber-white" ? "cyber-white" : "sanexio-punk"
        );
      }
    } catch (e) {}
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
