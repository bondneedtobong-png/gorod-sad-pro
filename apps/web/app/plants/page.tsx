import type { Metadata } from "next";

import { PhotoBackdrop } from "@/components/photo-backdrop";
import { PlantsCatalog } from "@/components/plants-catalog";
import { Reveal } from "@/components/reveal";
import { SectionLabel } from "@/components/section-label";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPlants } from "@/lib/content";
import { BACKGROUNDS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Энциклопедия растений — Город-сад",
  description:
    "Растения, которые мы любим и используем в проектах: хвойные, кустарники, деревья и многолетники для средней полосы. Поиск и фильтры по категории, сезону и зимостойкости.",
};

// ISR: подтягивать правки из БД (админка) без полного ребилда.
export const revalidate = 120;

export default async function PlantsPage() {
  const plants = await getPlants();
  return (
    <main className="relative">
      <SiteHeader />

      {/* Hero энциклопедии */}
      <section className="relative isolate overflow-hidden border-b border-white/[0.07]">
        <PhotoBackdrop
          src={BACKGROUNDS.encyclopedia}
          blurPx={3}
          overlay="veil"
          priority
        />
        <div className="container relative z-10 py-16 lg:py-20">
          <Reveal>
            <SectionLabel>Энциклопедия</SectionLabel>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-mist lg:text-6xl">
              Растения, которые{" "}
              <span className="accent-underline">мы любим</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-mist/72">
              Каталог растений, которые мы используем в проектах — проверенные в
              нашем климате, с честными характеристиками по свету, уходу и
              зимостойкости. Выбирайте по категории и сезону декоративности.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Каталог */}
      <section className="py-14 lg:py-16">
        <div className="container">
          <PlantsCatalog plants={plants} />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
