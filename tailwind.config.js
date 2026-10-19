/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/theme");

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/(button|snippet|code|input|modal).js",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Chogathon 2026 design system palette
        chog: {
          bg: "#0e0b1a",
          bg2: "#141026",
          bg3: "#181330",
          card: "#161228",
          purple: "#836ef9",
          "purple-light": "#a99bfc",
          "purple-hover": "#9d8dfc",
          green: "#5ce68a",
          gold: "#f59e0b",
          pink: "#836ef9", // mapped to Chogathon primary accent
          "pink-deep": "#7058f5",
          cream: "#1e183a",
          ink: "#f4f1fe", // light text on dark theme
          navy: "#141026",
          mauve: "#836EF9",
          mint: "#5ce68a",
          sand: "#141026",
          text: "#f4f1fe",
          muted: "rgba(244, 241, 254, 0.65)",
          border: "rgba(244, 241, 254, 0.12)",
          "border-bright": "rgba(169, 155, 252, 0.28)",
        },
      },
      boxShadow: {
        chog: "0 8px 30px -4px rgba(131, 110, 249, 0.35)",
        "chog-sm": "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        "chog-lg": "0 16px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(169, 155, 252, 0.2)",
        "chog-glow": "0 0 25px rgba(131, 110, 249, 0.45)",
        "chog-green-glow": "0 0 25px rgba(92, 230, 138, 0.35)",
        "chog-gold-glow": "0 0 25px rgba(245, 158, 11, 0.4)",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
