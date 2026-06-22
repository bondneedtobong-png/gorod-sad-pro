import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** Общая оболочка страниц авторизации: шапка + центрированная карточка + подвал. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <section className="relative flex flex-1 items-center justify-center px-4 py-14">
        <div className="leaf-frame w-full max-w-md rounded-3xl bg-white/[0.04] p-8 shadow-card ring-1 ring-white/10">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-mist">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-mist/60">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export const authInputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-mist placeholder:text-mist/40 transition focus:border-aqua-400 focus:outline-none focus:ring-2 focus:ring-aqua-400/30";

export const authPrimaryBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-gs-fresh px-5 py-3 font-semibold text-pine-950 shadow-aqua-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50";
