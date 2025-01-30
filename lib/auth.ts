import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { database } from "@/lib/database";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "./auth.config";

const combinedProviders = [
  ...authConfig.providers,
  Resend({
    from: "updates.example.com",
  }),
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: combinedProviders,
  adapter: PrismaAdapter(database),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  // Callbacks untuk pengganti middleware
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedRoutes = ["/dashboard", "/user"];

      if (!isLoggedIn && protectedRoutes.includes(nextUrl.pathname)) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isLoggedIn && ["/login", "/register"].includes(nextUrl.pathname)) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },

    // Simpan role ke JWT
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },

    // Simpan role ke session
    session({ session, token }) {
      session.user.role = token.role;
      return session;
    },

    // Callback untuk menambahkan logika tambahan setelah autentikasi berhasil
    async signIn({ user, account }) {
      // Block Google login if email exists but isn't verified
      if (account?.provider === "google") {
        const existingUser = await database.user.findUnique({
          where: { email: user.email! },
        });

        if (
          existingUser?.provider === "credentials" &&
          !existingUser.emailVerified
        ) {
          throw new Error(
            "Email sudah terdaftar. Silakan verifikasi email Anda sebelum login dengan Google."
          );
        }
      }
      return true;
    },
  },
});
