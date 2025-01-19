import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "anonymous";
};

export function rateLimit(
  request: NextRequest,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute
) {
  // Get IP address from request
  const ip = getClientIp(request);
  const now = Date.now();

  // Clean up expired entries
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }

  // Initialize or get existing record
  if (!store[ip] || store[ip].resetTime < now) {
    store[ip] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return null;
  }

  // Increment count
  store[ip].count++;

  // Check if rate limit exceeded
  if (store[ip].count > maxRequests) {
    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfter: Math.ceil((store[ip].resetTime - now) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(
            (store[ip].resetTime - now) / 1000
          ).toString(),
        },
      }
    );
  }

  return null;
}

// Rate limit configuration for different endpoints
export const authRateLimits = {
  login: {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
  },
  register: {
    maxRequests: 3,
    windowMs: 3600000, // 1 hour
  },
  forgotPassword: {
    maxRequests: 3,
    windowMs: 3600000, // 1 hour
  },
  resetPassword: {
    maxRequests: 3,
    windowMs: 3600000, // 1 hour
  },
  verifyEmail: {
    maxRequests: 5,
    windowMs: 300000, // 5 minutes
  },
};
