import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0a0f1e",
          card:    "#0d1526",
          border:  "#1a2540",
          hover:   "#111827",
        },
        brand: {
          DEFAULT: "#6366f1",
          hover:   "#4f52d9",
          light:   "#a5b4fc",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        blob: {
          "0%":   { transform: "translate(0px, 0px) scale(1)" },
          "33%":  { transform: "translate(30px, -50px) scale(1.1)" },
          "66%":  { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%":      { opacity: "1" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        blob:         "blob 8s infinite ease-in-out",
        float:        "float 4s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "slide-up":   "slide-up 0.5s ease-out forwards",
        shimmer:      "shimmer 2.5s linear infinite",
        "spin-slow":  "spin-slow 20s linear infinite",
      },
      backgroundImage: {
        "gradient-radial":  "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":   "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient":   "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
