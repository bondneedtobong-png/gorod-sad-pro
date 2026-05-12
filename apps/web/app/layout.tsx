import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Город-сад — ландшафтное бюро",
  description:
    "Город-сад — ландшафтное бюро под ключ. Проектирование, обустройство газонов, тротуарная плитка, освещение, автополив, топиарная стрижка. Калькулятор стоимости и ИИ-консультант.",
  openGraph: {
    title: "Город-сад — ландшафтное бюро",
    description: "Сад мечты от идеи до реализации. С 2012 года.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${cormorant.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
