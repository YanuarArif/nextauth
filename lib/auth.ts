import { compareSync, hashSync } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import { z } from "zod";

export const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Password handling
export const hashPassword = (password: string) => {
  return hashSync(password, SALT_ROUNDS);
};

export const verifyPassword = (password: string, hash: string) => {
  return compareSync(password, hash);
};

// JWT handling
export const generateToken = (userId: string) => {
  return sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  try {
    const decoded = verify(token, JWT_SECRET);
    return decoded as { userId: string };
  } catch (error) {
    return null;
  }
};

// Generate random tokens
export const generateRandomToken = () => {
  return crypto.randomUUID();
};

// Error handling
export class AuthError extends Error {
  constructor(
    public code:
      | "INVALID_CREDENTIALS"
      | "USER_NOT_FOUND"
      | "EMAIL_IN_USE"
      | "INVALID_TOKEN",
    message: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}
