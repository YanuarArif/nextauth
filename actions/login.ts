"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export const login = async (values: { email: string; password: string }) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (!existingUser || !existingUser.password) {
      return { error: "Email atau password salah!" };
    }

    const passwordValid = await bcrypt.compare(
      values.password,
      existingUser.password
    );

    if (!passwordValid) {
      return { error: "Password Salah!" };
    }

    // Membuat session token
    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 Minggu

    // Simpan session di database
    await prisma.session.create({
      data: {
        sessionToken,
        userId: existingUser.id,
        expires,
      },
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("sessionToken", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires,
      path: "/",
    });

    return { success: "Login Berhasil!" };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Terjadi kesalahan saat login!" };
  }
};
