"use server";

import { DaftarSchema } from "@/app/schemas";
import { z } from "zod";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const daftar = async (values: z.infer<typeof DaftarSchema>) => {
  const validatedFields = DaftarSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Input tidak valid!" };
  }

  const { username, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email sudah terdaftar!" };
  }

  await prisma.user.create({
    data: {
      name: username,
      email,
      password: hashedPassword,
    },
  });

  return { success: "Login berhasil!" };
};
