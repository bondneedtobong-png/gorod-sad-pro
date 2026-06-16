import NextAuth from "next-auth";

import authConfig from "@/auth.config";

// Лёгкий (Edge) экземпляр без Prisma/bcrypt — только чтение сессии из JWT.
export const { auth: middleware } = NextAuth(authConfig);

export default middleware;

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
