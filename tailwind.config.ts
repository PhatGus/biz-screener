import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern dark slate base
        ink: {
          950: "#070b14",
          900: "#0b1220",
          850: "#0f1726",
          800: "#141d30",
          700: "#1c2740",
          600: "#26334f",
        },
        // Cyan / teal accent system
        accent: {
          DEFAULT: "#22d3ee",
          dim: "#0e7490",
          glow: "#67e8f9",
        },
        verdict: {
          go: "#10b981",
          caution: "#f5b614",
          pass: "#ef4444",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 0 0 1px rgba(255,255,255,0.04)",
        glow: "0 0 24px -6px rgba(34,211,238,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
