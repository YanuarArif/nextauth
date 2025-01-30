"use server";

import { z } from "zod";
import { LoginSchema } from "@/schemas/zod";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  // Validasi input menggunakan Zod schema
  const validatedFields = LoginSchema.safeParse(values);
  // Return error jika validasi gagal
  if (!validatedFields.success) {
    return { error: "Input tidak valid!" }; //
  }

  // Destructure data yang sudah tervalidasi
  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Input tidak valid!" };
        default:
          return { error: "Ada yang salah!" };
      }
    }
    throw error;
  }
};
