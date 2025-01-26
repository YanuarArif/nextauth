// this file for edge browser compatible
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/schemas/zod";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import Resend from "next-auth/providers/resend";

// Notice this is only an object, not a full Auth.js instance
export default {
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
} satisfies NextAuthConfig;
