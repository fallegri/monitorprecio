/**
 * In-memory rate limiter.
 * For multi-instance production deployments, replace with Upstash Redis.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

const WINDOW_MS = 60_000 // 1 minute

export interface RateLimitConfig {
  limit: number
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, retryAfter: 0 }
  }

  if (entry.count >= config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  entry.count++
  return { allowed: true, retryAfter: 0 }
}

// Route-specific limits (requests per minute)
export const RATE_LIMITS: Record<string, number> = {
  '/api/health': 60,
  '/api/spec': 60,
  '/api/products': 30,
  '/api/price-logs': 30,
  '/api/monitoring-config': 30,
  '/api/cron/run': 5,
}

export function getLimitForPath(pathname: string): number {
  // Exact match first
  if (RATE_LIMITS[pathname] !== undefined) return RATE_LIMITS[pathname]

  // Prefix match for dynamic routes like /api/products/[id]
  for (const [route, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(route)) return limit
  }

  // Default: 60 req/min for unmatched routes
  return 60
}
