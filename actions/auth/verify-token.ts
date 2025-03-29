"use server";

import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/validate-token";
import { database } from "@/lib/database";
import { compare } from "bcryptjs";

// Security improvement: Custom error class
class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenError";
  }
}

// function untuk verifikasi token verifikasi email
export const validateToken = async (email: string, token: string) => {
  try {
    // Cari token di db by Token
    const existingToken = await getVerificationTokenByToken(token);
    if (!existingToken) {
      throw new TokenError("Token tidak valid");
    }

    // Verify email association - More specific error
    if (existingToken.email !== email) {
      throw new TokenError("Token tidak valid untuk email ini.");
    }

    // Cek apakah token expired
    const isExpired = existingToken.expires < new Date();
    if (isExpired) {
      throw new TokenError("Token sudah expired");
    }

    // Cek apakah user ada
    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      throw new TokenError("User tidak ditemukan");
    }

    // Update user telah verifikasi email
    await database.user.update({
      where: { id: existingUser.id },
      data: { emailVerified: new Date() },
    });

    // Hapus token dari db
    await database.verificationToken.delete({
      where: { id: existingToken.id },
    });

    return { success: "Email berhasil diverifikasi" };
  } catch (error) {
    if (error instanceof TokenError) throw error;
    console.error("Gagal memverifikasi token:", error);
    throw new TokenError("Gagal memverifikasi token");
  }
};
