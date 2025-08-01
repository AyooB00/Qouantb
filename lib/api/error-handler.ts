import { NextResponse } from 'next/server'

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Handle known API errors
  if (error instanceof APIError) {
    return NextResponse.json(
      { 
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      },
      { status: error.statusCode }
    )
  }

  // Handle standard errors
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('rate limit')) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          timestamp: new Date().toISOString()
        },
        { status: 429 }
      )
    }

    if (error.message.includes('API key')) {
      return NextResponse.json(
        { 
          error: 'Invalid or missing API key',
          code: 'INVALID_API_KEY',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        error: error.message,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }

  // Handle unknown errors
  return NextResponse.json(
    { 
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    },
    { status: 500 }
  )
}

export function validateRequired<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missingFields = requiredFields.filter(field => !data[field])
  
  if (missingFields.length > 0) {
    throw new APIError(
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      'MISSING_REQUIRED_FIELDS'
    )
  }
}

export function validateAPIKeys(requiredKeys: string[]): void {
  const missingKeys = requiredKeys.filter(key => !process.env[key])
  
  if (missingKeys.length > 0) {
    throw new APIError(
      'Required API keys are not configured',
      500,
      'MISSING_API_KEYS'
    )
  }
}