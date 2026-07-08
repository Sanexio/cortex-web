import { useEffect, useState } from "react";

// Persistenz-Key identisch zur cortex-sanexio.tech-Landing; der frühe
// Boot (Attribut vor erstem Paint) passiert in index.html.
const KEY = "cortex_cyber_theme";

type Theme = "cyber-dark" | "cyber-white" | "praxis2025";

const THEME_LABEL: Record<Theme, string> = {
  "cyber-dark": "CYBER-DARK",
  "cyber-white": "CYBERWHITE",
  praxis2025: "PRAXIS 2025",
};

function currentTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "cyber-white" || attr === "cyber-dark" || attr === "praxis2025") return attr;

  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored === "cyber-white" || stored === "cyber-dark" || stored === "praxis2025") return stored;
  } catch {
    /* storage disabled */
  }

  return "praxis2025";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => currentTheme());

  useEffect(() => {
    if (theme === "cyber-dark") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
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
        setTheme((t) =>
          t === "cyber-dark"
            ? "cyber-white"
            : t === "cyber-white"
              ? "praxis2025"
              : "cyber-dark"
        )
      }
    >
      THEME: {THEME_LABEL[theme]}{" "}
      <span className="theme-pin-action">· WECHSELN →</span>
    </button>
  );
}
