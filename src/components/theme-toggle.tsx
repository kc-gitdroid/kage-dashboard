"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "kage-dashboard-theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  function selectTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(storageKey, nextTheme);
    } catch {
      // The visual theme still applies when browser storage is unavailable.
    }
  }

  return (
    <div className="inline-flex rounded-lg border border-line bg-panelMuted/70 p-1" aria-label="Color theme">
      {(["light", "dark"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => selectTheme(option)}
          aria-pressed={theme === option}
          className={`rounded-md px-3 py-1.5 font-display text-[9px] font-semibold uppercase tracking-[0.12em] transition ${
            theme === option ? "bg-ink text-canvas shadow-sm" : "text-mute hover:text-ink"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
