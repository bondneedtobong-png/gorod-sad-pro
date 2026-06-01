import type { Metadata } from "next";
import { Golos_Text, Spectral } from "next/font/google";

import { AiChatWidget } from "@/components/ai-chat-widget";
import { CursorGlow } from "@/components/cursor-glow";
import { SeasonBadge } from "@/components/season-badge";

import "./globals.css";

// Тело — Golos Text (русский гуманистический гротеск, кириллица-first).
const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

// Заголовки — Spectral (современный книжный антиквенный, с кириллицей).
const spectral = Spectral({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gorod-sad.pro"),
  title: "Город-сад — ландшафтное бюро",
  description:
    "Город-сад — ландшафтное бюро под ключ. Проектирование, обустройство газонов, тротуарная плитка, освещение, автополив, топиарная стрижка. Калькулятор стоимости и ИИ-консультант.",
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  openGraph: {
    title: "Город-сад — ландшафтное бюро",
    description: "Сад мечты от идеи до реализации. С 2012 года.",
    type: "website",
    locale: "ru_RU",
    siteName: "Город-сад",
    url: "https://gorod-sad.pro",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${golos.variable} ${spectral.variable}`}>
      <body className="min-h-screen font-sans">
        <CursorGlow />
        {children}
        <SeasonBadge />
        <AiChatWidget />
      </body>
    </html>
  );
}
