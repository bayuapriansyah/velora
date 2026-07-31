import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // present but unused — Velora is light-theme only, see SDD 6.3
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0b0b0b",
        surface: "#141414",
        surfaceHover: "#1c1c1c",
        ink: "#f5f5f5",
        muted: "#9a9aa2",
        hairline: "#26262b",
        accent: {
          DEFAULT: "#fe4d47ff",
          soft: "#EEEEFE",
          hover: "#e3231cff",
        },
        approved: {
          DEFAULT: "#34d399",
          soft: "rgba(52, 211, 153, 0.12)",
        },
        rejected: {
          DEFAULT: "#fb7185",
          soft: "rgba(251, 113, 133, 0.12)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,17,20,0.04), 0 1px 1px rgba(17,17,20,0.03)",
        "card-hover": "0 12px 24px -8px rgba(17,17,20,0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(91,91,246,0.35)" },
          "100%": { boxShadow: "0 0 0 12px rgba(91,91,246,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
