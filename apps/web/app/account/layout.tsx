import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AccountNav } from "@/components/account/account-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  return (
    <main className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <section className="container flex-1 py-10 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
          <aside>
            <AccountNav
              isAdmin={session.user.role === "ADMIN"}
              name={session.user.name ?? session.user.email ?? "Гость"}
            />
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
