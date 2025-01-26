"use server";

import { DaftarSchema } from "@/schemas/zod";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/token"; // Tambahan
import { sendVerificationEmail } from "@/lib/email"; // Tambahan
import { redirect } from "next/navigation"; // Tambahan

export const register = async (values: z.infer<typeof DaftarSchema>) => {
  // Validasi input menggunakan Zod schema
  const validatedFields = DaftarSchema.safeParse(values);

  // Return error jika validasi gagal
  if (!validatedFields.success) {
    return { error: "Input tidak valid!" };
  }

  // Destructure data yang sudah tervalidasi
  const { username, email, password } = validatedFields.data;

  try {
    // Hash password sebelum disimpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Return error jika email sudah terdaftar
    if (existingUser) {
      return { error: "Email sudah terdaftar!" };
    }

    // Buat user baru di database
    const newUser = await prisma.user.create({
      data: {
        name: username,
        email,
        password: hashedPassword,
      },
    });

    // Generate token verifikasi (tambahan)
    const verificationToken = await generateVerificationToken(email);

    // Kirim email verifikasi (tambahan)
    await sendVerificationEmail(email, verificationToken);

    // Alihkan ke halaman verifikasi (tambahan)
    redirect("/verification?email=" + encodeURIComponent(email));
  } catch (error) {
    console.error("Registrasi error:", error);
    return { error: "Terjadi kesalahan saat registrasi!" };
  }

  // Fallback return (tidak akan pernah tercapai karena ada redirect)
  return { success: "Daftar berhasil!" };
};
