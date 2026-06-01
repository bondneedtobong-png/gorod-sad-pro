import { ArrowLeft, Leaf, Phone, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { GardenSandbox } from "@/components/garden-sandbox";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Спроектируй свой сад — Город-сад",
  description:
    "Интерактивный конструктор участка: расставь газоны, плитку, деревья и фонари, увидь как сад выглядит в разные сезоны, посчитай стоимость и оставь заявку.",
};

export default function SandboxPage() {
  return (
    <main className="relative">
      <header className="sticky top-0 z-30 border-b border-forest-700/40 bg-forest-900/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-80">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-wheat-500/15 ring-1 ring-wheat-500/30">
              <Leaf className="h-5 w-5 text-wheat-400" strokeWidth={1.8} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-xl font-semibold tracking-wide text-wheat-400">
                Город-сад
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-cream/60">
                ландшафтное бюро
              </div>
            </div>
          </Link>
          <a
            href="tel:+79370388344"
            className="hidden items-center gap-2 rounded-full bg-wheat-500 px-4 py-2 text-sm font-medium text-bark shadow-wheat-glow transition hover:bg-wheat-400 sm:flex"
          >
            <Phone className="h-4 w-4" /> 8-937-038-83-44
          </a>
        </div>
      </header>

      <div className="container pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-cream/60 transition hover:text-wheat-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Назад
        </Link>
      </div>

      <section className="border-b border-forest-700/40 py-10 lg:py-12">
        <div className="container">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-wheat-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-wheat-400 ring-1 ring-wheat-500/30">
              <Sparkles className="h-3.5 w-3.5" /> мини-конструктор
            </div>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-cream lg:text-6xl">
              Спроектируй свой сад
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-cream/75">
              Расставь газон, плитку, деревья и фонари — увидь как участок выглядит весной,
              летом, осенью и зимой. Стоимость считается в реальном времени по нашему прайсу.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-10 lg:py-12">
        <div className="container">
          <GardenSandbox />
        </div>
      </section>

      <footer className="border-t border-forest-700/40 bg-forest-900 py-8">
        <div className="container text-center text-sm text-cream/60">
          © Город-сад · Ландшафтное бюро · С 2012 года
        </div>
      </footer>
    </main>
  );
}
