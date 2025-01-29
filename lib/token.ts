import { randomBytes } from "crypto";
import { hash, compare } from "bcryptjs";
import { database } from "./database";

// Security improvement: Custom error class
class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenError";
  }
}

// function untuk generate token verifikasi email
export const generateVerificationToken = async (email: string) => {
  try {
    const token = randomBytes(32).toString("hex");
    const hashedToken = await hash(token, 10); // Hash the token
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Delete token lama jika ada
    await database.verificationToken.deleteMany({
      where: { identifier: email },
    });

    const lowerCaseEmail = email.toLowerCase();
    // Membuat token baru
    await database.verificationToken.create({
      data: {
        identifier: lowerCaseEmail,
        token: hashedToken,
        expires,
      },
    });

    return token; // Return raw token for email
  } catch (error) {
    throw new TokenError("Gagal membuat token verifikasi");
  }
};

// function untuk verifikasi token verifikasi email
export const validateToken = async (email: string, token: string) => {
  try {
    // Cari token di db by email
    const verificationToken = await database.verificationToken.findFirst({
      where: { identifier: email },
      orderBy: { expires: "desc" },
    });

    // Token beda
    if (!verificationToken) {
      throw new TokenError("Token tidak valid");
    }

    // Token expired
    if (verificationToken.expires < new Date()) {
      // Hapus token expired
      await database.verificationToken.delete({
        where: { id: verificationToken.id },
      });
      throw new TokenError("Token sudah expired");
    }

    // Compare token dengan token di db menggunakan bcrypt
    const isValid = await compare(token, verificationToken.token);

    if (!isValid) {
      throw new TokenError("Token tidak valid");
    }

    // Delete token di db setelah digunakan
    await database.verificationToken.delete({
      where: { id: verificationToken.id },
    });

    return true;
  } catch (error) {
    if (error instanceof TokenError) throw error;
    throw new TokenError("Gagal memverifikasi token");
  }
};

// Delete token di db jika expired
export const deleteExpiredTokens = async () => {
  try {
    await database.verificationToken.deleteMany({
      where: { expires: { lt: new Date() } },
    });
  } catch (error) {
    console.error("Gagal menghapus token expired:", error);
  }
};
