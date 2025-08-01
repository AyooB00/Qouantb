import { z } from 'zod'

// Common schemas
export const stockSymbolSchema = z.string()
  .min(1)
  .max(5)
  .regex(/^[A-Z]+$/, 'Stock symbol must be uppercase letters only')
  .transform(val => val.toUpperCase())

export const priceRangeSchema = z.object({
  min: z.number().min(0, 'Minimum price must be non-negative'),
  max: z.number().positive('Maximum price must be positive')
}).refine(data => data.min <= data.max, {
  message: 'Minimum price must be less than or equal to maximum price'
})

// Stock analysis schemas
export const searchCriteriaSchema = z.object({
  priceRange: priceRangeSchema,
  marketCapRange: z.object({
    min: z.number().min(0, 'Minimum market cap must be non-negative'),
    max: z.number().positive('Maximum market cap must be positive')
  }).optional(),
  volumeRequirement: z.number().min(0).optional(),
  sectors: z.array(z.string()).optional(),
  riskTolerance: z.enum(['low', 'medium', 'high']),
  holdingPeriod: z.enum(['short', 'medium', 'long'])
})

// Portfolio schemas
export const portfolioItemSchema = z.object({
  symbol: stockSymbolSchema,
  companyName: z.string().min(1),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  avgCost: z.number().positive('Average cost must be positive')
})

export const updatePortfolioItemSchema = portfolioItemSchema.partial()

// Chat schemas
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content cannot be empty').max(10000, 'Message too long')
})

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, 'At least one message is required'),
  stream: z.boolean().optional().default(true),
  provider: z.enum(['openai', 'gemini', 'auto']).optional()
})

// Swing trading schemas
export const swingTradingPromptSchema = z.object({
  prompt: z.string()
    .min(3, 'Prompt must be at least 3 characters')
    .max(500, 'Prompt must be less than 500 characters')
})

// Stock quote schemas
export const stockQuoteRequestSchema = z.object({
  symbol: stockSymbolSchema
})

export const multipleStockQuotesSchema = z.object({
  symbols: z.array(stockSymbolSchema)
    .min(1, 'At least one symbol is required')
    .max(20, 'Maximum 20 symbols allowed')
})

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20)
})

// Error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional()
  }),
  metadata: z.object({
    timestamp: z.string(),
    requestId: z.string().optional()
  }).optional()
})

// Success response schema factory
export function createSuccessResponseSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    metadata: z.object({
      timestamp: z.string(),
      requestId: z.string().optional()
    }).optional()
  })
}

// Validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
      throw new Error(`Validation failed: ${JSON.stringify(formattedErrors)}`)
    }
    throw error
  }
}