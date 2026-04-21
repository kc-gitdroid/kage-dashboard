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
        canvas: "#05070A",
        panel: "#0B0F14",
        panelStrong: "#111720",
        panelMuted: "#0D1218",
        line: "#1B2633",
        ink: "#EEF3F8",
        mute: "#93A0B2",
        blue: "#2D7FF9",
        yellow: "#F4D23C",
        orange: "#F38B2A",
        purple: "#8A63D2",
        cyan: "#72D9FF",
        lime: "#B6E84A",
      },
      fontFamily: {
        arcade: ['"ArcadeClassic"', '"Courier New"', "monospace"],
        display: ['"JetBrains Mono"', '"SFMono-Regular"', "Menlo", "Monaco", '"Liberation Mono"', "monospace"],
        body: ['"Avenir Next"', '"Segoe UI"', '"Helvetica Neue"', "Arial", "sans-serif"],
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(27, 38, 51, 0.68), 0 18px 56px rgba(0, 0, 0, 0.22)",
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
