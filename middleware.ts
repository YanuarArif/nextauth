// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const publicRoutes = ["/"];
const authRoutes = ["/login", "/register"];
const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const sessionToken = request.cookies.get("sessionToken")?.value;

  // Check if session exists in database
  let isValidSession = false;
  if (sessionToken) {
    try {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      isValidSession = !!session && new Date(session.expires) > new Date();
    } catch (error) {
      console.error("Session validation error:", error);
    }
  }

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Handle API routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Handle auth routes
  if (isAuthRoute) {
    if (isValidSession) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (!isValidSession && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Renew session if expiring soon (optional)
  if (isValidSession && !isAuthRoute) {
    try {
      const response = NextResponse.next();
      const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week

      await prisma.session.update({
        where: { sessionToken },
        data: { expires: newExpires },
      });

      return response;
    } catch (error) {
      console.error("Session renewal error:", error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
