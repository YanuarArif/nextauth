import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, authRateLimits } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  // Only apply to auth endpoints
  if (!request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Apply security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // Get the specific endpoint from the path
  const endpoint = request.nextUrl.pathname.split("/").pop();

  // Apply rate limiting based on endpoint
  if (endpoint && endpoint in authRateLimits) {
    const { maxRequests, windowMs } =
      authRateLimits[endpoint as keyof typeof authRateLimits];
    const rateLimitResponse = rateLimit(request, maxRequests, windowMs);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  return response;
}

// Configure the middleware to run only on auth API routes
export const config = {
  matcher: "/api/auth/:path*",
};
