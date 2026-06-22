import type { Config } from "tailwindcss";

/**
 * Город-сад — палитра (редизайн 2026, бренд-гайд Claude Design).
 * Тёмная тема «хвоя + изумруд + бирюза», снятая с фирменной фотографии:
 *   pine    — фон и глубокие поверхности;
 *   emerald — карточки/секции;
 *   aqua    — ЕДИНСТВЕННЫЙ акцент (CTA, ссылки, активные состояния);
 *   mist    — текст на тёмном.
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
        pine: {
          DEFAULT: "#063D30",
          950: "#04221B", // основной фон
          900: "#063D30",
          800: "#0A4E3D",
          700: "#0B6B4F",
        },
        emerald: {
          DEFAULT: "#10805F",
          600: "#10805F",
          500: "#16A085",
        },
        aqua: {
          DEFAULT: "#2EE6CD", // акцент
          400: "#2EE6CD",
          300: "#67F0DD",
          200: "#A6F7EC",
        },
        mist: "#EAF5F0", // текст на тёмном
        ink: "#03190F", // самый тёмный (футер/код)
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"], // Manrope
        display: ["var(--font-display)", "sans-serif"], // Unbounded
      },
      backgroundImage: {
        // Градиенты бренд-гайда (см. handoff/tailwind.tokens.ts).
        "gs-aurora": "linear-gradient(135deg, #04221B 0%, #0B6B4F 55%, #2EE6CD 130%)",
        "gs-fresh": "linear-gradient(135deg, #10805F, #2EE6CD)",
        "gs-glow":
          "radial-gradient(circle at 72% 28%, rgba(46,230,205,.5), transparent 58%), linear-gradient(160deg, #063D30, #04221B)",
        "gs-depth": "linear-gradient(160deg, #063D30, #04221B)",
        // Карточки услуг/преимуществ: мягкий бирюзовый блик + изумрудная глубина.
        "gs-card":
          "radial-gradient(circle at 80% 16%, rgba(46,230,205,.14), transparent 56%), linear-gradient(160deg, #0A4E3D, #063D30)",
      },
      boxShadow: {
        "aqua-glow": "0 8px 32px -8px rgba(46, 230, 205, 0.55)",
        card: "0 24px 60px -30px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
