import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DealStatusBadge } from "@/components/account/deal-status-badge";
import { formatRub } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { cardClass } from "@/lib/ui-classes";

export const metadata: Metadata = { title: "Мои заявки — Город-сад" };

export default async function DealsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const deals = await prisma.deal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-mist">Мои заявки</h1>

      {deals.length === 0 ? (
        <div className={cardClass}>
          <p className="text-mist/60">
            Заявок пока нет. Оставьте заявку через{" "}
            <Link href="/#contact" className="text-aqua-400 underline">форму на сайте</Link> или
            рассчитайте стоимость на странице услуги — она появится здесь.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map((d) => (
            <div key={d.id} className={cardClass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-lg text-mist">{d.title}</div>
                  <div className="text-xs text-mist/50">
                    {new Date(d.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
                <DealStatusBadge status={d.status} />
              </div>
              {d.message && <p className="mt-2 text-sm leading-relaxed text-mist/72">{d.message}</p>}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-mist/60">
                {d.estimateRub != null && <span>Ориентировочно: <b className="text-mist">{formatRub(d.estimateRub)}</b></span>}
                {d.adminNote && <span>Комментарий бюро: {d.adminNote}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
