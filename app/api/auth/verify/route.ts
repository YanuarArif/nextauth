import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
  token: z.string(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { token } = verifySchema.parse(json);

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    return NextResponse.json({
      message: "Email verified successfully",
    });
  } catch (error: any) {
    console.error("Verification error:", error);

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
