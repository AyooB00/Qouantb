import { NextResponse } from 'next/server'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  metadata?: {
    timestamp: string
    requestId?: string
    [key: string]: unknown
  }
}

export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Common error codes
export const ErrorCodes = {
  // Client errors
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
} as const

// Success response helper
export function successResponse<T>(
  data: T,
  metadata?: Partial<ApiResponse['metadata']>
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata
    }
  }

  return NextResponse.json(response, { status: 200 })
}

// Error response helper
export function errorResponse(
  error: ApiError | Error | string,
  statusCode?: number
): NextResponse<ApiResponse> {
  let apiError: ApiError

  if (error instanceof ApiError) {
    apiError = error
  } else if (error instanceof Error) {
    apiError = new ApiError(
      ErrorCodes.INTERNAL_ERROR,
      error.message,
      statusCode || 500
    )
  } else {
    apiError = new ApiError(
      ErrorCodes.INTERNAL_ERROR,
      error,
      statusCode || 500
    )
  }

  const response: ApiResponse = {
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details
    },
    metadata: {
      timestamp: new Date().toISOString()
    }
  }

  return NextResponse.json(response, { status: apiError.statusCode })
}

// Async handler wrapper with error handling
export function apiHandler<T = unknown>(
  handler: (request: Request) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (request: Request): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      return await handler(request)
    } catch (error) {
      console.error('API Handler Error:', error)
      
      if (error instanceof ApiError) {
        return errorResponse(error)
      }
      
      // Handle Zod validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        return errorResponse(
          new ApiError(
            ErrorCodes.VALIDATION_ERROR,
            'Invalid request data',
            400,
            error
          )
        )
      }
      
      // Generic error
      return errorResponse(
        new ApiError(
          ErrorCodes.INTERNAL_ERROR,
          error instanceof Error ? error.message : 'An unexpected error occurred',
          500
        )
      )
    }
  }
}

// Validate required environment variables
export function validateEnvVars(vars: string[]): void {
  const missing = vars.filter(v => !process.env[v])
  if (missing.length > 0) {
    throw new ApiError(
      ErrorCodes.CONFIGURATION_ERROR,
      `Missing required environment variables: ${missing.join(', ')}`,
      500
    )
  }
}