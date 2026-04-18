import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit, getLimitForPath } from '@/lib/utils/rate-limit'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Only apply rate limiting to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Use IP address as rate limit key (fallback to 'unknown')
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const key = `${ip}:${pathname}`
  const limit = getLimitForPath(pathname)
  const { allowed, retryAfter } = checkRateLimit(key, { limit })

  if (!allowed) {
    return Response.json(
      { error: 'Demasiadas solicitudes. Intente nuevamente más tarde.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(limit),
        },
      }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
