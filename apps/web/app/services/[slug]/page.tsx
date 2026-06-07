import { ArrowLeft, CheckCircle2, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Calculator } from "@/components/calculator";
import { Reveal } from "@/components/reveal";
import { SectionLabel } from "@/components/section-label";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getService } from "@/lib/content";

const ALL_SLUGS = [
  "landscape-design",
  "paving",
  "lawn",
  "lighting",
  "irrigation",
  "topiary",
];

const STEPS: Record<string, string[]> = {
  "landscape-design": [
    "Выезд на участок, замер, фотофиксация",
    "Эскизная концепция (2–3 варианта)",
    "Согласование выбранного направления",
    "Рабочий проект — дендроплан, разбивочный чертёж, смета",
    "Передача документации заказчику или сразу к реализации",
  ],
  "paving": [
    "Замер площади, выбор материала с образцами",
    "Подготовка основания: выемка, дренаж, песчано-щебневая подушка",
    "Установка бордюров, разметка рисунка",
    "Укладка плитки, заделка швов",
    "Уборка, передача участка",
  ],
  "lawn": [
    "Анализ почвы, расчёт уклонов, дренаж",
    "Снятие верхнего слоя, выравнивание",
    "Укладка плодородного слоя и автополива (по желанию)",
    "Рулонный или посевной газон",
    "Уход в первый сезон (полив, стрижка, удобрения)",
  ],
  "lighting": [
    "Световой план: акценты на деревьях, дорожках, водоёмах",
    "Прокладка кабеля, монтаж низковольтных трансформаторов",
    "Установка LED-светильников с регулировкой",
    "Подключение автоматики (таймер, фотодатчик)",
    "Финальная настройка яркости и сцен",
  ],
  "irrigation": [
    "Гидрозонирование участка по типам растений",
    "Подбор оборудования (капельный/веерный/скрытый)",
    "Прокладка магистрали, монтаж дождевателей",
    "Установка контроллера со смартфон-управлением",
    "Тестовый запуск и обучение хозяев",
  ],
  "topiary": [
    "Подбор подходящих растений (туя, самшит, бирючина)",
    "Создание каркаса (для сложных фигур)",
    "Стрижка по этапам — несколько проходов в сезон",
    "Регулярный уход и поддержание формы",
    "Питание и защита от вредителей",
  ],
};

const FAQ: Record<string, { q: string; a: string }[]> = {
  "landscape-design": [
    { q: "Сколько длится проектирование?", a: "От 2 до 6 недель в зависимости от площади и сложности." },
    { q: "Что входит в проект?", a: "Концепция, дендроплан, разбивочный чертёж, визуализация, смета на материалы и работы." },
    { q: "Можно ли вносить правки?", a: "Да, 2 круга правок включены в стоимость. Дополнительные — по договорённости." },
  ],
  "paving": [
    { q: "Какой материал лучше?", a: "Брусчатка — универсальна. Клинкер — премиум. Натуральный камень — на десятилетия. Подберём под бюджет." },
    { q: "Сколько служит?", a: "При правильной укладке — 25+ лет. Гарантия на работы — 3 года." },
  ],
  "lawn": [
    { q: "Рулонный или посевной?", a: "Рулонный — газон через 2 недели, дороже. Посевной — 1.5 месяца до густоты, дешевле." },
    { q: "Когда лучше укладывать?", a: "С апреля по октябрь. Лучшие месяцы — май и сентябрь." },
  ],
  "lighting": [
    { q: "Дорого ли по электричеству?", a: "LED-светильники на 5-15 Вт. Весь сад горит за копейки — 100-300 ₽ в месяц." },
  ],
  "irrigation": [
    { q: "Работает зимой?", a: "Нет, на зиму консервируем. Запуск весной — входит в обслуживание." },
    { q: "Управление?", a: "Через приложение на смартфоне. Можно с любой точки мира." },
  ],
  "topiary": [
    { q: "Сколько раз в год стричь?", a: "Простые формы — 2-3 раза, сложные — 4-6 раз за сезон." },
  ],
};

export async function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}
export const revalidate = 120;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await getService(params.slug);
  if (!service) return { title: "Услуга не найдена — Город-сад" };
  return {
    title: `${service.title} — Город-сад`,
    description: service.description,
  };
}

export default async function ServicePage({ params }: { params: { slug: string } }) {
  const service = await getService(params.slug);
  if (!service) notFound();

  const steps = STEPS[params.slug] ?? [];
  const faq = FAQ[params.slug] ?? [];

  return (
    <main className="relative">
      <SiteHeader />

      {/* Хлебная крошка */}
      <div className="container pt-8">
        <Link
          href="/#services"
          className="inline-flex items-center gap-1.5 text-sm text-forest-600 transition hover:text-wheat-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Все услуги
        </Link>
      </div>

      {/* Hero услуги */}
      <section className="leaf-frame border-b border-forest-200/70 py-12 lg:py-16">
        <div className="container">
          <Reveal>
            <SectionLabel>{service.tagline}</SectionLabel>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-forest-900 lg:text-6xl">
              {service.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-forest-700/90">
              {service.description}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Калькулятор + этапы */}
      <section className="border-b border-forest-200/70 py-16">
        <div className="container grid gap-8 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <Calculator service={service} />
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-3xl bg-paper p-6 shadow-card ring-1 ring-forest-200/70 lg:p-8">
              <SectionLabel>Как мы работаем</SectionLabel>
              <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900">
                Этапы
              </h2>
              <ol className="mt-6 space-y-4">
                {steps.map((s, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-wheat-500/15 font-display text-sm text-wheat-700 ring-1 ring-wheat-500/30">
                      {i + 1}
                    </div>
                    <div className="pt-1 text-forest-700">{s}</div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="border-b border-forest-200/70 py-16">
          <div className="container">
            <Reveal>
              <SectionLabel>Вопросы</SectionLabel>
              <h2 className="mt-3 font-display text-3xl font-semibold text-forest-900">
                Часто спрашивают
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-3 lg:grid-cols-2">
              {faq.map((item, i) => (
                <Reveal key={i} delay={i * 80}>
                  <details className="group rounded-2xl border border-forest-200/70 bg-paper p-5 transition open:shadow-card">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-forest-800">
                      <span className="font-medium">{item.q}</span>
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-wheat-700 transition group-open:rotate-90" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-forest-600">{item.a}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <Reveal>
            <div className="leaf-frame rounded-3xl bg-paper p-10 shadow-card ring-1 ring-forest-200/70 lg:p-14">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-forest-900 lg:text-4xl">
                    Готовы начать?
                  </h2>
                  <p className="mt-3 text-forest-700/90">
                    Бесплатный выезд для замера и оценки. Алексей Юрьевич перезвонит в течение часа.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <a
                    href="tel:+79370388344"
                    className="inline-flex items-center gap-3 rounded-2xl bg-wheat-500 px-5 py-4 font-medium text-forest-900 shadow-wheat-glow transition hover:bg-wheat-400"
                  >
                    <Phone className="h-5 w-5" /> 8-937-038-83-44
                  </a>
                  <a
                    href="tel:+79374509900"
                    className="inline-flex items-center gap-3 rounded-2xl border border-forest-300 px-5 py-4 font-medium text-forest-800 transition hover:border-wheat-600 hover:text-wheat-700"
                  >
                    <Phone className="h-5 w-5" /> 8-937-450-99-00
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
