import { useEffect, useState } from "react";

// Persistenz-Key identisch zur cortex-sanexio.tech-Landing; der frühe
// Boot (Attribut vor erstem Paint) passiert in index.html.
const KEY = "cortex_cyber_theme";

type Theme = "cyber-dark" | "cyber-white";

function currentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "cyber-white"
    ? "cyber-white"
    : "cyber-dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => currentTheme());

  useEffect(() => {
    if (theme === "cyber-white") {
      document.documentElement.setAttribute("data-theme", "cyber-white");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      /* storage disabled — Theme gilt dann nur für diese Ansicht */
    }
  }, [theme]);

  return (
    <button
      type="button"
      className="theme-pin"
      aria-label="Theme wechseln"
      onClick={() =>
        setTheme((t) => (t === "cyber-white" ? "cyber-dark" : "cyber-white"))
      }
    >
      THEME: {theme === "cyber-white" ? "CYBERWHITE" : "CYBER-DARK"}{" "}
      <span className="theme-pin-action">· WECHSELN →</span>
    </button>
  );
}
