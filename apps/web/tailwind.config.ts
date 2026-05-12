import type { Config } from "tailwindcss";

/**
 * Город-сад — палитра из логотипа.
 * Forest = тёмно-зелёный фон сайта/логотипа коллеги.
 * Wheat  = кремово-жёлтый знак "Город-сад", тёплый акцент.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        forest: {
          DEFAULT: "#2D4D2F",
          900: "#15281A",
          800: "#1E3923",
          700: "#274730",
          600: "#2D4D2F",
          500: "#3A6240",
          400: "#5F8466",
          300: "#8DA993",
        },
        wheat: {
          DEFAULT: "#D9C77A",
          600: "#B8A35F",
          500: "#D9C77A",
          400: "#E5D998",
          300: "#EDE4B5",
        },
        cream: "#F4EDD8",
        bark: "#1A2D1B",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        "wheat-glow": "0 0 32px -8px rgba(217, 199, 122, 0.4)",
        leaf: "0 8px 28px -10px rgba(21, 40, 26, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
