import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, registerSchema, generateRandomToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = registerSchema.parse(json);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(body.password);
    const verificationToken = generateRandomToken();

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
        verificationToken,
      },
    });

    // Send verification email
    await sendVerificationEmail(body.email, verificationToken);

    return NextResponse.json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error: any) {
    console.error("Registration error:", error);

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
