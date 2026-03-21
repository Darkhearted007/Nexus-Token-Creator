import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory rate limiting map.
// Note: Edge functions spin up/down, so this is volatile, but it absorbs localized burst DDoS.
// For distributed scale, integrate Upstash Redis.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 100;

export function proxy(request: NextRequest) {
  // Apply rate limiting to explicit API routes and webhooks
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const now = Date.now();
    let record = rateLimitMap.get(ip);

    // Reset window or increment
    if (!record || now - record.lastReset > RATE_LIMIT_WINDOW_MS) {
      record = { count: 1, lastReset: now };
    } else {
      record.count += 1;
    }
    rateLimitMap.set(ip, record);

    if (record.count > MAX_REQUESTS_PER_MINUTE) {
      console.warn(`[Security] Blocked DDoS attempt from IP: ${ip}`);
      return new NextResponse(
        JSON.stringify({ error: "Too Many Requests - Rate Limit Exceeded" }), 
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  return NextResponse.next();
}

// Ensure middleware only runs on API paths to avoid slowing down static asset delivery
export const config = {
  matcher: '/api/:path*',
};
