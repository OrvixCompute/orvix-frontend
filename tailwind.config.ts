import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class", // forced via html class
  theme: {
    extend: {
      colors: {
        // Backgrounds (almost pure black)
        bg: {
          primary: "#030303",
          secondary: "#0a0a0a",
          tertiary: "#141414",
        },
        // Borders (very subtle)
        border: {
          DEFAULT: "#1f1f1f",
          strong: "#2a2a2a",
        },
        // Text
        text: {
          primary: "#fafafa",
          secondary: "#a3a3a3",
          tertiary: "#666666",
          muted: "#444444",
        },
        // Single accent (used sparingly)
        accent: {
          DEFAULT: "#9945ff",
          hover: "#a855f7",
        },
        // Status (only for actual status indicators)
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "1.5" }],
        sm: ["13px", { lineHeight: "1.6" }],
        base: ["14px", { lineHeight: "1.7" }],
        lg: ["16px", { lineHeight: "1.7" }],
        xl: ["18px", { lineHeight: "1.5" }],
        "2xl": ["22px", { lineHeight: "1.4", letterSpacing: "-0.01em" }],
        "3xl": ["28px", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
        "4xl": ["36px", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
      },
      maxWidth: {
        page: "64rem", // 1024px max — narrower than typical
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "cursor-blink": "blink 1s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
