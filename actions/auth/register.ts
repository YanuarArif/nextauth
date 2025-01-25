"use server";

import { DaftarSchema } from "@/schemas/zod";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const register = async (values: z.infer<typeof DaftarSchema>) => {
  // Validasi input menggunakan Zod schema
  const validatedFields = DaftarSchema.safeParse(values);
  // Return error jika validasi gagal
  if (!validatedFields.success) {
    return { error: "Input tidak valid!" };
  }

  // Destructure data yang sudah tervalidasi
  const { username, email, password } = validatedFields.data;
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
  await prisma.user.create({
    data: {
      name: username,
      email,
      password: hashedPassword,
    },
  });

  // Return success message jika pendaftaran berhasil
  return { success: "Daftar berhasil!" };
};
