import { ArrowLeft, Phone, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
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
      <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-pine-950/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition hover:opacity-80">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
              <BrandMark className="w-6 text-mist" title="Город-сад" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg font-semibold tracking-wide text-mist">
                Город-сад
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-mist/50">
                ландшафтное бюро
              </div>
            </div>
          </Link>
          <a
            href="tel:+79370388344"
            className="hidden items-center gap-2 rounded-full bg-gs-fresh px-4 py-2 text-sm font-semibold text-pine-950 shadow-aqua-glow transition hover:brightness-110 sm:flex"
          >
            <Phone className="h-4 w-4" /> 8-937-038-83-44
          </a>
        </div>
      </header>

      <div className="container pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-mist/60 transition hover:text-aqua-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Назад
        </Link>
      </div>

      <section className="border-b border-white/[0.07] py-10 lg:py-12">
        <div className="container">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-aqua-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-aqua-400 ring-1 ring-aqua-400/30">
              <Sparkles className="h-3.5 w-3.5" /> мини-конструктор
            </div>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-mist lg:text-6xl">
              Спроектируй свой сад
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mist/72">
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

      <footer className="border-t border-white/[0.07] bg-ink py-8">
        <div className="container text-center text-sm text-mist/55">
          © Город-сад · Ландшафтное бюро · С 2012 года
        </div>
      </footer>
    </main>
  );
}
