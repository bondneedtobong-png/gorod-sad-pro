import {
  ArrowLeft,
  CalendarDays,
  Droplets,
  Ruler,
  Snowflake,
  Sprout,
  Sun,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AskAiButton } from "@/components/ask-ai-button";
import { PlantImage } from "@/components/plant-image";
import { Reveal } from "@/components/reveal";
import { SectionLabel } from "@/components/section-label";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPlantBySlug, getSimilarPlants, PLANTS } from "@/lib/plants-data";

export function generateStaticParams() {
  return PLANTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const plant = getPlantBySlug(params.slug);
  if (!plant) return { title: "Растение не найдено — Город-сад" };
  return {
    title: `${plant.name} — энциклопедия растений · Город-сад`,
    description: plant.short,
  };
}

export default function PlantPage({ params }: { params: { slug: string } }) {
  const plant = getPlantBySlug(params.slug);
  if (!plant) notFound();

  const similar = getSimilarPlants(plant);
  const specs = [
    { Icon: Sprout, label: "Категория", value: plant.category },
    { Icon: Sun, label: "Освещение", value: plant.light.join(" / ") },
    { Icon: Droplets, label: "Уход", value: plant.care },
    { Icon: Snowflake, label: "Зона морозостойкости", value: plant.hardinessZone },
    { Icon: CalendarDays, label: "Декоративность", value: plant.season },
    { Icon: Ruler, label: "Высота", value: plant.height },
  ];

  return (
    <main className="relative">
      <SiteHeader />

      {/* Возврат */}
      <div className="container pt-8">
        <Link
          href="/plants"
          className="inline-flex items-center gap-1.5 text-sm text-forest-600 transition hover:text-wheat-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Вся энциклопедия
        </Link>
      </div>

      {/* Hero растения */}
      <section className="border-b border-forest-200/70 py-10 lg:py-14">
        <div className="container grid gap-8 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <PlantImage
              src={plant.image}
              alt={plant.name}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="aspect-[4/3] rounded-3xl shadow-card ring-1 ring-forest-200/70"
            />
          </Reveal>
          <Reveal delay={120}>
            <SectionLabel>{plant.category}</SectionLabel>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-forest-900 lg:text-5xl">
              {plant.name}
            </h1>
            <div className="mt-1 font-display text-xl italic text-forest-500">
              {plant.latin}
            </div>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-forest-700/85">
              {plant.short}
            </p>
            {plant.tags && plant.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {plant.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-forest-50 px-3 py-1 text-xs text-forest-600 ring-1 ring-forest-200/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-6">
              <AskAiButton plantName={plant.name} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Характеристики */}
      <section className="border-b border-forest-200/70 py-12">
        <div className="container">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {specs.map(({ Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-2xl bg-paper p-5 ring-1 ring-forest-200/70"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-wheat-500/15 ring-1 ring-wheat-500/30">
                    <Icon className="h-5 w-5 text-wheat-700" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.16em] text-forest-500">
                      {label}
                    </div>
                    <div className="mt-0.5 font-medium text-forest-800">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Описание + где применяем */}
      <section className="border-b border-forest-200/70 py-14">
        <div className="container grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold text-forest-900">
              О растении
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-forest-700/90">
              {plant.description}
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="leaf-frame rounded-3xl bg-paper p-6 ring-1 ring-forest-200/70 lg:p-8">
              <SectionLabel>В ландшафте</SectionLabel>
              <h3 className="mt-3 font-display text-2xl font-semibold text-forest-900">
                Где применяем
              </h3>
              <p className="mt-3 leading-relaxed text-forest-700/90">{plant.uses}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Похожие */}
      {similar.length > 0 && (
        <section className="py-14">
          <div className="container">
            <Reveal className="mb-8">
              <SectionLabel>Из той же группы</SectionLabel>
              <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900">
                Похожие растения
              </h2>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p, i) => (
                <Reveal key={p.slug} delay={i * 80}>
                  <Link
                    href={`/plants/${p.slug}`}
                    className="group block h-full overflow-hidden rounded-3xl bg-paper shadow-card ring-1 ring-forest-200/70 transition-all duration-300 hover:-translate-y-1.5 hover:ring-wheat-500/50"
                  >
                    <PlantImage src={p.image} alt={p.name} className="aspect-[4/3]" />
                    <div className="p-5">
                      <div className="font-display text-xl text-forest-800 transition-colors group-hover:text-wheat-700">
                        {p.name}
                      </div>
                      <div className="text-sm italic text-forest-500">{p.latin}</div>
                      <p className="mt-2 text-sm leading-relaxed text-forest-700/80">
                        {p.short}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </main>
  );
}
