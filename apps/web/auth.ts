import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import VK from "next-auth/providers/vk";
import { z } from "zod";

import authConfig from "@/auth.config";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: { email: {}, password: {} },
    authorize: async (creds) => {
      const parsed = credentialsSchema.safeParse(creds);
      if (!parsed.success) return null;
      const email = parsed.data.email.toLowerCase();
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;
      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name, role: user.role };
    },
  }),
];

// VK — только если заданы env (иначе провайдер не активен, сборка не падает).
if (process.env.VK_CLIENT_ID && process.env.VK_CLIENT_SECRET) {
  providers.push(
    VK({
      clientId: process.env.VK_CLIENT_ID,
      clientSecret: process.env.VK_CLIENT_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  events: {
    // При первом входе через VK проставляем vkId в профиль.
    async linkAccount({ user, account }) {
      if (account.provider === "vk" && user.id) {
        await prisma.user
          .update({
            where: { id: user.id },
            data: { vkId: account.providerAccountId },
          })
          .catch(() => undefined);
      }
    },
  },
});
