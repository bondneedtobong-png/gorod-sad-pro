import { ArrowRight, Calculator, Leaf, MessageCircle, Phone, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AmbientParticles } from "@/components/ambient-particles";
import { BeforeAfter } from "@/components/before-after";
import { CountUp } from "@/components/count-up";
import { DayNightScene } from "@/components/day-night-scene";
import { GrassField } from "@/components/grass-field";
import { LeadForm } from "@/components/lead-form";
import { Parallax } from "@/components/parallax";
import { PhotoBackdrop } from "@/components/photo-backdrop";
import { PlantImage } from "@/components/plant-image";
import { Reveal } from "@/components/reveal";
import { SectionLabel } from "@/components/section-label";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BACKGROUNDS, BEFORE_AFTER_CASES } from "@/lib/media";
import { PLANTS } from "@/lib/plants-data";

const services = [
  { slug: "landscape-design", title: "Ландшафтное проектирование", tagline: "С учётом всех пожеланий" },
  { slug: "paving", title: "Укладка тротуарной плитки", tagline: "Стиль от заказа до обустройства" },
  { slug: "lawn", title: "Обустройство газонов", tagline: 'Зелёная мягкость "Под ключ"' },
  { slug: "lighting", title: "Ландшафтное освещение", tagline: "Свет природы подчеркнёт Ваш вкус" },
  { slug: "irrigation", title: "Автополив", tagline: "С заботой о каждом растении" },
  { slug: "topiary", title: "Топиарная стрижка", tagline: "Сложные фигуры и композиции" },
];

const advantages: { count?: number; suffix?: string; title: string; desc: string }[] = [
  { count: 150, suffix: "+", title: "уникальных проектов", desc: "с 2012 года" },
  { title: "Бесплатный выезд", desc: "Замер и консультация — без обязательств" },
  { count: 30, suffix: "+", title: "питомников", desc: "в России и Европе" },
  { title: "Гарантия", desc: "На все виды работ, прописано в договоре" },
];

const plantsPreview = PLANTS.slice(0, 4);

export default function HomePage() {
  return (
    <main className="relative">
      <SiteHeader />

      {/* ===== Hero ===== */}
      <section className="relative isolate overflow-hidden border-b border-forest-200/70">
        {/* фон: фото + параллакс + тонировка + частицы */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Parallax speed={0.14} className="absolute inset-x-0 -top-[20%] h-[140%]">
            <Image
              src={BACKGROUNDS.hero}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ filter: "blur(2px)", transform: "scale(1.06)" }}
            />
          </Parallax>
          <div className="absolute inset-0 bg-forest-500/12" />
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/85 to-canvas/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-canvas/30" />
          <AmbientParticles mode="day" />
        </div>
        {/* трава у основания (Задача 1) */}
        <GrassField className="pointer-events-none absolute inset-x-0 bottom-0 -z-10" />

        <div className="container relative z-10 grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <Reveal className="space-y-6">
            <SectionLabel>Ландшафтное бюро · Ульяновск</SectionLabel>
            <h1 className="font-display text-5xl font-semibold leading-[1.04] tracking-tight text-forest-900 lg:text-7xl">
              Сад мечты <span className="accent-underline">от идеи</span>
              <br className="hidden sm:block" /> до реализации.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-forest-700/90">
              Проектируем, обустраиваем и поддерживаем участки под ключ. Балансируем
              стиль, эргономику и заботу о растениях — чтобы получилось красиво,
              удобно и надолго.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="#services"
                className="inline-flex items-center gap-2 rounded-full bg-wheat-500 px-6 py-3 font-medium text-forest-900 shadow-wheat-glow transition hover:bg-wheat-400"
              >
                Посмотреть услуги <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-forest-300 bg-paper/40 px-6 py-3 font-medium text-forest-800 backdrop-blur-sm transition hover:border-wheat-600 hover:text-wheat-700"
              >
                Бесплатная консультация
              </Link>
            </div>
            {/* статы */}
            <div className="grid max-w-md grid-cols-3 gap-6 pt-6">
              {[
                { node: <CountUp to={14} />, label: "лет в ландшафте Ульяновска" },
                { node: <CountUp to={150} suffix="+" />, label: "проектов под ключ" },
                { node: <CountUp to={30} suffix="+" />, label: "питомников-партнёров" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-display text-4xl text-forest-900">{s.node}</div>
                  <div className="mt-1 text-[11px] uppercase leading-snug tracking-[0.12em] text-forest-600">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* акцентная карточка — связка с энциклопедией */}
          <Reveal delay={150} className="hidden lg:block">
            <Link
              href="/plants"
              className="group relative block overflow-hidden rounded-[2rem] shadow-card ring-1 ring-forest-300/40"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={BACKGROUNDS.heroAccent}
                  alt="Глициния в перголе"
                  fill
                  priority
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/15 to-forest-900/5" />
                <div className="absolute right-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-forest-800">
                  по Ульяновску и области
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 text-cream">
                  <div className="text-[11px] uppercase tracking-[0.25em] text-wheat-300">
                    Сезон в саду
                  </div>
                  <div className="mt-1 font-display text-3xl">Глициния в перголе</div>
                  <div className="mt-1 text-sm text-cream/80">
                    Май–июнь · аромат · вертикальное озеленение
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-wheat-300 transition group-hover:gap-2.5">
                    В энциклопедию растений <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== О бюро ===== */}
      <section className="border-b border-forest-200/70 py-20">
        <div className="container grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal className="space-y-5">
            <SectionLabel>О бюро</SectionLabel>
            <h2 className="font-display text-4xl font-semibold leading-tight tracking-tight text-forest-900 lg:text-5xl">
              Бюро, в котором сад — <span className="accent-underline">ремесло</span>
            </h2>
            <p className="text-lg leading-relaxed text-forest-700/90">
              С 2012 года мы проектируем, обустраиваем и сопровождаем участки под
              ключ — от концепции и дендроплана до посадки и ухода в первый сезон.
              Подбираем растения, проверенные в нашем климате, и доводим каждую
              деталь до результата, которым приятно жить.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="#services"
                className="inline-flex items-center gap-2 rounded-full border border-forest-300 px-5 py-2.5 text-sm font-medium text-forest-800 transition hover:border-wheat-600 hover:text-wheat-700"
              >
                Наши услуги <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/plants"
                className="inline-flex items-center gap-2 rounded-full border border-forest-300 px-5 py-2.5 text-sm font-medium text-forest-800 transition hover:border-wheat-600 hover:text-wheat-700"
              >
                Энциклопедия растений
              </Link>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] shadow-card ring-1 ring-forest-200/70">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={BACKGROUNDS.about}
                    alt="Сад, обустроенный бюро «Город-сад»"
                    fill
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="absolute -bottom-5 -left-2 rounded-2xl bg-wheat-500 px-5 py-3 shadow-wheat-glow sm:-left-5">
                <div className="font-display text-3xl leading-none text-forest-900">
                  <CountUp to={14} />
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-forest-800/80">
                  лет в ландшафте Ульяновска
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Sandbox CTA (тёмный акцент-баннер) ===== */}
      <section className="border-b border-forest-200/70 py-12">
        <div className="container">
          <Reveal>
            <Link
              href="/sandbox"
              className="group relative block overflow-hidden rounded-3xl bg-gradient-to-r from-forest-800 via-forest-700 to-forest-800 p-8 ring-1 ring-forest-700/50 transition hover:ring-wheat-500/60 lg:p-10"
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60"
                style={{
                  background:
                    "radial-gradient(circle at 80% 50%, rgba(217,199,122,0.25), transparent 60%)",
                }}
              />
              <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <SectionLabel tone="light">новая фишка</SectionLabel>
                  <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-cream lg:text-5xl">
                    Спроектируй свой сад{" "}
                    <span className="text-wheat-400">прямо сейчас</span>
                  </h2>
                  <p className="mt-3 max-w-xl text-cream/75">
                    Интерактивный конструктор: расставь газоны, плитку, деревья и
                    фонари, переключай сезоны и увидь стоимость в реальном времени.
                  </p>
                </div>
                <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-wheat-500 px-6 py-3 font-medium text-forest-900 shadow-wheat-glow transition group-hover:bg-wheat-400">
                  Открыть конструктор <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== Услуги ===== */}
      <section id="services" className="border-b border-forest-200/70 py-20">
        <div className="container">
          <Reveal className="mb-12 max-w-2xl">
            <SectionLabel>Направления</SectionLabel>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-forest-900 lg:text-5xl">
              Что мы делаем
            </h2>
            <p className="mt-3 text-forest-700/80">
              Каждое направление — отдельный кейс с реальными проектами,
              калькулятором стоимости и возможностью спросить ИИ-консультанта.
            </p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={i * 80}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group relative block h-full overflow-hidden rounded-3xl bg-paper p-6 shadow-card ring-1 ring-forest-200/70 transition-all duration-300 hover:-translate-y-1.5 hover:ring-wheat-500/50 hover:shadow-[0_22px_48px_-22px_rgba(21,40,26,0.5)]"
                >
                  <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-wheat-500/15 ring-1 ring-wheat-500/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-wheat-500/25">
                    <Leaf className="h-5 w-5 text-wheat-700" strokeWidth={1.8} />
                  </div>
                  <div className="font-display text-2xl text-forest-800 transition-colors group-hover:text-wheat-700">
                    {s.title}
                  </div>
                  <div className="mt-1 text-sm text-forest-600">{s.tagline}</div>
                  <div className="mt-6 flex flex-wrap gap-2 border-t border-forest-200/70 pt-4 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-3 py-1 text-forest-600 ring-1 ring-forest-200/70">
                      <Calculator className="h-3 w-3" /> калькулятор
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-3 py-1 text-forest-600 ring-1 ring-forest-200/70">
                      <MessageCircle className="h-3 w-3" /> спросить ИИ
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-wheat-700 opacity-0 transition group-hover:opacity-100">
                      Подробнее <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Тизер энциклопедии ===== */}
      <section className="relative isolate overflow-hidden border-b border-forest-200/70 py-20">
        <PhotoBackdrop src={BACKGROUNDS.plants} blurPx={4} overlay="veil" />
        <div className="container relative z-10">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <SectionLabel>Энциклопедия</SectionLabel>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-forest-900 lg:text-5xl">
                Загляните в нашу энциклопедию растений
              </h2>
              <p className="mt-3 text-forest-700/85">
                Проверенные в нашем климате растения с честными характеристиками по
                свету, уходу и зимостойкости — те, что мы используем в проектах.
              </p>
            </div>
            <Link
              href="/plants"
              className="inline-flex items-center gap-2 rounded-full bg-wheat-500 px-6 py-3 font-medium text-forest-900 shadow-wheat-glow transition hover:bg-wheat-400"
            >
              Открыть энциклопедию <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {plantsPreview.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <Link
                  href={`/plants/${p.slug}`}
                  className="group block h-full overflow-hidden rounded-3xl bg-paper shadow-card ring-1 ring-forest-200/70 transition-all duration-300 hover:-translate-y-1.5 hover:ring-wheat-500/50"
                >
                  <PlantImage src={p.image} alt={p.name} className="aspect-[4/3]" />
                  <div className="p-4">
                    <div className="font-display text-lg text-forest-800 transition-colors group-hover:text-wheat-700">
                      {p.name}
                    </div>
                    <div className="text-xs italic text-forest-500">{p.latin}</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Было / Стало ===== */}
      <section className="border-b border-forest-200/70 py-20">
        <div className="container">
          <Reveal className="mb-10 max-w-2xl">
            <SectionLabel>Результат</SectionLabel>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-forest-900 lg:text-5xl">
              Было / Стало
            </h2>
            <p className="mt-3 text-forest-700/80">
              Потяните ползунок — и голый участок превратится в готовый сад. Так
              меняются объекты после нашей работы.
            </p>
          </Reveal>
          <Reveal>
            <BeforeAfter
              before={BEFORE_AFTER_CASES[0].before}
              after={BEFORE_AFTER_CASES[0].after}
              caption={BEFORE_AFTER_CASES[0].caption}
              className="mx-auto max-w-4xl"
            />
          </Reveal>
        </div>
      </section>

      {/* ===== Сцена День / Ночь ===== */}
      <section className="border-b border-forest-200/70 py-20">
        <div className="container">
          <Reveal className="mb-10 max-w-2xl">
            <SectionLabel>Атмосфера</SectionLabel>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-forest-900 lg:text-5xl">
              День сменяется ночью
            </h2>
            <p className="mt-3 text-forest-700/80">
              Хороший сад красив круглые сутки. Переключите сцену и посмотрите, как
              ландшафтное освещение продолжает сад после заката.
            </p>
          </Reveal>
          <Reveal>
            <DayNightScene />
          </Reveal>
        </div>
      </section>

      {/* ===== Преимущества ===== */}
      <section id="advantages" className="border-b border-forest-200/70 py-20">
        <div className="container">
          <Reveal className="mb-12">
            <SectionLabel>Почему мы</SectionLabel>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-forest-900 lg:text-5xl">
              Преимущества бюро
            </h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a, i) => (
              <Reveal key={a.title} delay={i * 80}>
                <div className="h-full rounded-3xl bg-paper p-6 shadow-card ring-1 ring-forest-200/70 transition-all duration-300 hover:-translate-y-1 hover:ring-wheat-500/50">
                  {a.count != null ? (
                    <>
                      <div className="font-display text-5xl leading-none text-forest-900">
                        <CountUp to={a.count} suffix={a.suffix} />
                      </div>
                      <div className="mt-2 font-display text-xl text-forest-700">{a.title}</div>
                    </>
                  ) : (
                    <div className="font-display text-2xl text-wheat-700">{a.title}</div>
                  )}
                  <div className="mt-2 text-sm text-forest-600">{a.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Заявка ===== */}
      <section className="border-b border-forest-200/70 py-20">
        <div className="container">
          <Reveal className="mb-8 max-w-2xl">
            <SectionLabel>Заявка</SectionLabel>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-forest-900 lg:text-5xl">
              Оставьте заявку
            </h2>
            <p className="mt-3 text-forest-700/80">
              Перезвоним, бесплатно проконсультируем и предложим выезд на замер.
              Если вы вошли в аккаунт — заявка появится в личном кабинете.
            </p>
          </Reveal>
          <Reveal>
            <LeadForm className="mx-auto max-w-2xl" />
          </Reveal>
        </div>
      </section>

      {/* ===== Контакты (тёмный финал) ===== */}
      <section id="contact" className="py-24">
        <div className="container">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-800 to-forest-900 p-10 ring-1 ring-forest-700/50 lg:p-16">
              <div
                aria-hidden
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 80% at 100% 0%, rgba(217,199,122,0.18), transparent 60%)",
                }}
              />
              <div className="relative grid gap-10 lg:grid-cols-2">
                <div className="space-y-4">
                  <SectionLabel tone="light">Свяжитесь</SectionLabel>
                  <h2 className="font-display text-4xl font-semibold tracking-tight text-cream lg:text-5xl">
                    От идеального участка вас отделяет один шаг
                  </h2>
                  <p className="text-cream/75">
                    Оставьте телефон — Алексей Юрьевич перезвонит и предложит
                    бесплатную консультацию ведущего специалиста.
                  </p>
                </div>
                <div className="space-y-3">
                  <a
                    href="tel:+79370388344"
                    className="flex items-center gap-3 rounded-2xl bg-wheat-500 px-5 py-4 font-medium text-forest-900 shadow-wheat-glow transition hover:bg-wheat-400"
                  >
                    <Phone className="h-5 w-5" />
                    <span className="flex flex-col">
                      <span className="text-xs uppercase tracking-[0.18em] opacity-70">
                        Позвонить
                      </span>
                      <span className="text-lg">8-937-038-83-44</span>
                    </span>
                  </a>
                  <a
                    href="tel:+79374509900"
                    className="flex items-center gap-3 rounded-2xl border border-wheat-500/40 px-5 py-4 font-medium text-cream transition hover:border-wheat-400 hover:text-wheat-400"
                  >
                    <Phone className="h-5 w-5" />
                    <span className="flex flex-col">
                      <span className="text-xs uppercase tracking-[0.18em] opacity-70">
                        Запасной номер
                      </span>
                      <span className="text-lg">8-937-450-99-00</span>
                    </span>
                  </a>
                  <div className="rounded-2xl bg-forest-900/60 p-4 text-xs leading-relaxed text-cream/60 ring-1 ring-forest-700/50">
                    Ежедневно на связи с 8:00 до 20:00. Бесплатный выезд для замера
                    и оценки.
                  </div>
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
