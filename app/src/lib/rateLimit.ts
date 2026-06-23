import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileoverview Rate limiting middleware for API endpoints
 * Copyright © 2026 NexusChain. All rights reserved.
 * 
 * Proprietary - Unauthorized use or reverse-engineering prohibited.
 */

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

/**
 * Rate limit configuration per endpoint
 * Format: requestsPerMinute
 */
const LIMITS: Record<string, number> = {
  '/api/health': 1000, // Very permissive for health checks
  '/api/mint': 10, // Strict on token minting
  '/api/bots': 5, // Very strict on bot endpoints
  'default': 100, // Default: 100 req/min per IP
};

function getClientId(request: NextRequest): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function getPathKey(pathname: string): string {
  return pathname.split('/').slice(0, 3).join('/');
}

export function rateLimitMiddleware(
  request: NextRequest,
  pathname: string
) {
  const clientId = getClientId(request);
  const pathKey = getPathKey(pathname);
  const limit = LIMITS[pathKey] || LIMITS['default'];
  const key = `${clientId}:${pathKey}`;
  const now = Date.now();

  if (!store[key]) {
    store[key] = { count: 0, resetAt: now + 60_000 };
  }

  const bucket = store[key];

  // Reset if window expired
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + 60_000;
  }

  // Check limit
  if (bucket.count >= limit) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Maximum ' + limit + ' requests per minute.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((bucket.resetAt - now) / 1000)),
        },
      }
    );
  }

  bucket.count++;
  return null;
}

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetAt < now) {
      delete store[key];
    }
  }
}, 5 * 60_000);
