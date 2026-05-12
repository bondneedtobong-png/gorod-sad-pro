import {
  ArrowRight,
  Calculator,
  Leaf,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    slug: "landscape-design",
    title: "Ландшафтное проектирование",
    tagline: "С учётом всех пожеланий",
  },
  {
    slug: "paving",
    title: "Укладка тротуарной плитки",
    tagline: "Стиль от заказа до обустройства",
  },
  {
    slug: "lawn",
    title: "Обустройство газонов",
    tagline: 'Зелёная мягкость "Под ключ"',
  },
  {
    slug: "lighting",
    title: "Ландшафтное освещение",
    tagline: "Свет природы подчеркнёт Ваш вкус",
  },
  {
    slug: "irrigation",
    title: "Автополив",
    tagline: "С заботой о каждом растении",
  },
  {
    slug: "topiary",
    title: "Топиарная стрижка",
    tagline: "Сложные фигуры и композиции",
  },
];

const advantages = [
  { title: "С 2012 года", desc: "Более 150 уникальных проектов" },
  { title: "Бесплатный выезд", desc: "Замер и консультация — без обязательств" },
  { title: "30+ питомников", desc: "В России и Европе" },
  { title: "Гарантия", desc: "На все виды работ, прописано в договоре" },
];

export default function HomePage() {
  return (
    <main className="relative">
      {/* ===== Хедер ===== */}
      <header className="sticky top-0 z-40 border-b border-forest-700/40 bg-forest-900/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
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
          </div>
          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#services" className="text-cream/80 transition hover:text-wheat-400">
              Услуги
            </a>
            <a href="#advantages" className="text-cream/80 transition hover:text-wheat-400">
              Преимущества
            </a>
            <a href="#contact" className="text-cream/80 transition hover:text-wheat-400">
              Контакты
            </a>
          </nav>
          <a
            href="tel:+79370388344"
            className="hidden items-center gap-2 rounded-full bg-wheat-500 px-4 py-2 text-sm font-medium text-bark shadow-wheat-glow transition hover:bg-wheat-400 sm:flex"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            8-937-038-83-44
          </a>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="leaf-frame relative overflow-hidden border-b border-forest-700/40">
        <div className="container relative grid gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-wheat-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-wheat-400 ring-1 ring-wheat-500/30">
              <Sparkles className="h-3.5 w-3.5" /> С 2012 года · 150+ проектов
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-cream lg:text-6xl">
              Сад мечты —{" "}
              <span className="text-wheat-400">от идеи до реализации</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-cream/75">
              Проектируем, обустраиваем и поддерживаем участки под ключ.
              Балансируем стиль, эргономику и заботу о растениях — чтобы
              получилось красиво, удобно и надолго.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="#services"
                className="inline-flex items-center gap-2 rounded-full bg-wheat-500 px-6 py-3 font-medium text-bark shadow-wheat-glow transition hover:bg-wheat-400"
              >
                Посмотреть услуги <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-wheat-500/40 px-6 py-3 font-medium text-cream transition hover:border-wheat-400 hover:text-wheat-400"
              >
                Бесплатная консультация
              </Link>
            </div>
          </div>

          {/* Декоративная карточка-плашка */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 rounded-3xl bg-forest-700/30 blur-2xl" />
            <div className="relative grid gap-3 rounded-3xl bg-forest-800/60 p-6 shadow-leaf ring-1 ring-forest-600/40">
              <div className="font-display text-2xl text-wheat-400">
                Полный цикл
              </div>
              <ul className="space-y-2 text-sm text-cream/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-wheat-500" />
                  Бесплатная консультация и выезд на участок
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-wheat-500" />
                  Дизайн-проект с визуализацией и сметой
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-wheat-500" />
                  Подбор и доставка растений из 30+ питомников
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-wheat-500" />
                  Реализация и сопровождение после сдачи
                </li>
              </ul>
              <div className="mt-2 rounded-2xl bg-wheat-500/10 p-4 text-sm leading-relaxed text-wheat-300 ring-1 ring-wheat-500/20">
                При заказе комплекса работ — <strong>30%</strong> стоимости
                проекта вычитаем из сметы.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Услуги ===== */}
      <section id="services" className="border-b border-forest-700/40 py-20">
        <div className="container">
          <div className="mb-12 max-w-2xl">
            <div className="text-xs uppercase tracking-[0.22em] text-wheat-400">
              · Направления
            </div>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-cream lg:text-5xl">
              Что мы делаем
            </h2>
            <p className="mt-3 text-cream/70">
              Каждое направление — отдельный кейс с реальными проектами,
              калькулятором стоимости и возможностью спросить ИИ-консультанта.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="group relative overflow-hidden rounded-3xl bg-forest-800/60 p-6 ring-1 ring-forest-600/40 transition hover:bg-forest-700/70 hover:ring-wheat-500/40"
              >
                <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-wheat-500/10 ring-1 ring-wheat-500/30 transition group-hover:bg-wheat-500/20">
                  <Leaf className="h-5 w-5 text-wheat-400" strokeWidth={1.8} />
                </div>
                <div className="font-display text-2xl text-cream group-hover:text-wheat-400">
                  {s.title}
                </div>
                <div className="mt-1 text-sm text-cream/60">{s.tagline}</div>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-forest-600/40 pt-4 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-forest-900/60 px-3 py-1 text-cream/70 ring-1 ring-forest-600/40 group-hover:text-wheat-400">
                    <Calculator className="h-3 w-3" /> калькулятор
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-forest-900/60 px-3 py-1 text-cream/70 ring-1 ring-forest-600/40 group-hover:text-wheat-400">
                    <MessageCircle className="h-3 w-3" /> спросить ИИ
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 text-wheat-400 opacity-0 transition group-hover:opacity-100">
                    Подробнее <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Преимущества ===== */}
      <section id="advantages" className="border-b border-forest-700/40 py-20">
        <div className="container">
          <div className="mb-12">
            <div className="text-xs uppercase tracking-[0.22em] text-wheat-400">
              · Почему мы
            </div>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-cream lg:text-5xl">
              Преимущества бюро
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a) => (
              <div
                key={a.title}
                className="rounded-3xl bg-forest-800/60 p-6 ring-1 ring-forest-600/40"
              >
                <div className="font-display text-2xl text-wheat-400">{a.title}</div>
                <div className="mt-2 text-sm text-cream/70">{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA / Контакты ===== */}
      <section id="contact" className="py-24">
        <div className="container">
          <div className="leaf-frame relative overflow-hidden rounded-3xl bg-forest-800/70 p-10 ring-1 ring-forest-600/40 lg:p-16">
            <div className="relative grid gap-10 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="text-xs uppercase tracking-[0.22em] text-wheat-400">
                  · Свяжитесь
                </div>
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
                  className="flex items-center gap-3 rounded-2xl bg-wheat-500 px-5 py-4 font-medium text-bark shadow-wheat-glow transition hover:bg-wheat-400"
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
                <div className="rounded-2xl bg-forest-900/60 p-4 text-xs leading-relaxed text-cream/60 ring-1 ring-forest-600/40">
                  Ежедневно на связи с 8:00 до 20:00. Бесплатный выезд для замера
                  и оценки.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Подвал ===== */}
      <footer className="border-t border-forest-700/40 bg-forest-900 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-cream/60 md:flex-row">
          <div>© Город-сад · Ландшафтное бюро · С 2012 года</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-wheat-400">
              Политика конфиденциальности
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
