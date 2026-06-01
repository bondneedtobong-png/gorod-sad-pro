import type { Config } from "tailwindcss";

/**
 * Город-сад — палитра.
 * Светлая тёплая тема «шалфей + крем»: светлый фон, тёмно-зелёный текст,
 * пшеничные (wheat) акценты. Forest-шкала расширена светлыми ступенями
 * (50–200) для светлых поверхностей и карточек.
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
          200: "#B7CBBB",
          100: "#D8E4DA",
          50: "#EEF3EC",
        },
        wheat: {
          DEFAULT: "#D9C77A",
          700: "#9A8748",
          600: "#B8A35F",
          500: "#D9C77A",
          400: "#E5D998",
          300: "#EDE4B5",
        },
        cream: "#F4EDD8",
        // Светло-зелёная («салатовая») база темы.
        canvas: "#DEE9C2",
        canvas2: "#E8F1D6",
        paper: "#F1F6E6",
        sand: "#E9E1CC",
        bark: "#1A2D1B",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        "wheat-glow": "0 0 32px -8px rgba(217, 199, 122, 0.45)",
        leaf: "0 8px 28px -10px rgba(21, 40, 26, 0.6)",
        card: "0 16px 44px -24px rgba(21, 40, 26, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
