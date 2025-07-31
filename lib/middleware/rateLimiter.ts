import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  max: number // Max requests per window
}

interface RequestRecord {
  count: number
  resetTime: number
}

class InMemoryRateLimiter {
  private requests: Map<string, RequestRecord> = new Map()
  private cleanupInterval: NodeJS.Timeout

  constructor(private options: RateLimitOptions) {
    // Clean up expired records every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, record] of this.requests.entries()) {
        if (record.resetTime < now) {
          this.requests.delete(key)
        }
      }
    }, 60000)
  }

  async check(identifier: string): Promise<boolean> {
    const now = Date.now()
    const record = this.requests.get(identifier)

    if (!record || record.resetTime < now) {
      // New window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.options.windowMs
      })
      return true
    }

    if (record.count >= this.options.max) {
      return false
    }

    record.count++
    return true
  }

  getRemainingRequests(identifier: string): number {
    const record = this.requests.get(identifier)
    if (!record || record.resetTime < Date.now()) {
      return this.options.max
    }
    return Math.max(0, this.options.max - record.count)
  }

  getResetTime(identifier: string): number {
    const record = this.requests.get(identifier)
    return record?.resetTime || Date.now() + this.options.windowMs
  }

  destroy() {
    clearInterval(this.cleanupInterval)
  }
}

// Global rate limiter instances
const rateLimiters = new Map<string, InMemoryRateLimiter>()

export function getRateLimiter(name: string, options: RateLimitOptions): InMemoryRateLimiter {
  if (!rateLimiters.has(name)) {
    rateLimiters.set(name, new InMemoryRateLimiter(options))
  }
  return rateLimiters.get(name)!
}

// Middleware function
export async function withRateLimit(
  request: NextRequest,
  options: RateLimitOptions = { windowMs: 60 * 1000, max: 30 }
): Promise<NextResponse | null> {
  // Get identifier (IP address or API key)
  const identifier = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'anonymous'

  const limiter = getRateLimiter('api', options)
  const allowed = await limiter.check(identifier)

  if (!allowed) {
    const resetTime = limiter.getResetTime(identifier)
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)

    return NextResponse.json(
      { 
        error: 'Too many requests', 
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter 
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': options.max.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toString(),
          'Retry-After': retryAfter.toString()
        }
      }
    )
  }

  // Add rate limit headers to response
  const remaining = limiter.getRemainingRequests(identifier)
  const resetTime = limiter.getResetTime(identifier)

  request.headers.set('X-RateLimit-Limit', options.max.toString())
  request.headers.set('X-RateLimit-Remaining', remaining.toString())
  request.headers.set('X-RateLimit-Reset', resetTime.toString())

  return null // Continue with request
}

// Decorator for API routes
export function rateLimit(options?: RateLimitOptions) {
  return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (request: NextRequest, ...args: unknown[]) {
      const rateLimitResponse = await withRateLimit(request, options)
      if (rateLimitResponse) {
        return rateLimitResponse
      }
      return originalMethod.apply(this, [request, ...args])
    }

    return descriptor
  }
}