import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateRandomToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email } = forgotPasswordSchema.parse(json);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({
        message:
          "If an account exists with this email, you will receive a password reset link.",
      });
    }

    const resetToken = generateRandomToken();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      message:
        "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
