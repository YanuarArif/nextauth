import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) return NextResponse.redirect("/login?error=invalid_token");

  const user = await prisma.user.findFirst({ where: { token } });

  if (!user) return NextResponse.redirect("/login?error=invalid_token");

  // Mark email as verified & clear token
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), token: null },
  });

  return NextResponse.redirect("/dashboard");
}
