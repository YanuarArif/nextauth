import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/schemas/zod";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    // Provider untuk login dengan email dan password
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        // Validasi input menggunakan schema Zod
        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) {
          return null;
        }
        // Ambil email dan password dari data yang sudah divalidasi
        const { email, password } = validatedFields.data;
        // Cari pengguna berdasarkan email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Block login jika email belum diverifikasi
        if (user && !user.emailVerified) {
          throw new Error("Verify your email first! Check your inbox.");
        }
        // Jika pengguna tidak ditemukan, lempar error
        if (!user || !user.password) {
          throw new Error("User tidak ditemukan atau password salah!");
        }

        // Bandingkan password yang dimasukkan dengan hash password di database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return null;

        return {
          ...user,
          role: user.role ?? "user",
        };
      },
    }),

    // Provider untuk login dengan Google
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // Provider untuk login dengan Resend (email)
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY!,
      from: "no-reply@company.com",

      async generateVerificationToken() {
        return crypto.randomUUID();
      },
    }),
  ],

  // Callbacks untuk menangani logika tambahan setelah autentikasi / pengganti middleware
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
    async signIn({ user, account, profile }) {
      // Block Google login if email exists but isn't verified
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
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
