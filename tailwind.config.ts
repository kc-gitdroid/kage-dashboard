import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        panelStrong: "rgb(var(--color-panel-strong) / <alpha-value>)",
        panelMuted: "rgb(var(--color-panel-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        mute: "rgb(var(--color-mute) / <alpha-value>)",
        white: "rgb(var(--color-white) / <alpha-value>)",
        black: "rgb(var(--color-black) / <alpha-value>)",
        blue: "rgb(var(--color-blue) / <alpha-value>)",
        yellow: "rgb(var(--color-yellow) / <alpha-value>)",
        orange: "rgb(var(--color-orange) / <alpha-value>)",
        purple: "rgb(var(--color-purple) / <alpha-value>)",
        cyan: "rgb(var(--color-cyan) / <alpha-value>)",
        lime: "rgb(var(--color-lime) / <alpha-value>)",
      },
      fontFamily: {
        arcade: ['"ArcadeClassic"', '"Courier New"', "monospace"],
        display: ['"IBM Plex Mono"', '"SFMono-Regular"', "Consolas", "monospace"],
        body: ['"IBM Plex Mono"', '"SFMono-Regular"', "Consolas", "monospace"],
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
      },
      backgroundImage: {
        grid:
          "linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
