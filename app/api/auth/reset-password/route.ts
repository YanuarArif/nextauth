import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { token, password } = resetPasswordSchema.parse(json);

    // Find user by reset token and check if it's not expired
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password and clear reset token
    const hashedPassword = hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);

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
