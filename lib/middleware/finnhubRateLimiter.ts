import { EventEmitter } from 'events'

interface QueuedRequest<T = unknown> {
  id: string
  execute: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
  priority: number
  timestamp: number
  retries: number
  symbol?: string // For deduplication
}

interface RateLimiterOptions {
  requestsPerMinute: number
  maxRetries?: number
  enableDeduplication?: boolean
}

export class FinnhubRateLimiter extends EventEmitter {
  private queue: QueuedRequest<any>[] = []
  private processing = false
  private lastRequestTime = 0
  private requestInterval: number
  private maxRetries: number
  private enableDeduplication: boolean
  private pendingRequests = new Map<string, QueuedRequest<any>>()

  constructor(options: RateLimiterOptions) {
    super()
    this.requestInterval = 60000 / options.requestsPerMinute // Convert to ms between requests
    this.maxRetries = options.maxRetries || 3
    this.enableDeduplication = options.enableDeduplication ?? true
  }

  async addRequest<T>(
    execute: () => Promise<T>,
    priority: number = 0,
    symbol?: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7)
      
      // Check for duplicate requests
      if (this.enableDeduplication && symbol) {
        const existing = this.pendingRequests.get(symbol)
        if (existing) {
          // Return the same promise for duplicate requests
          return existing.execute().then(resolve as (value: unknown) => void).catch(reject)
        }
      }

      const request: QueuedRequest<T> = {
        id,
        execute,
        resolve: resolve as (value: T | PromiseLike<T>) => void,
        reject,
        priority,
        timestamp: Date.now(),
        retries: 0,
        symbol
      }

      // Store in pending requests map
      if (symbol) {
        this.pendingRequests.set(symbol, request)
      }

      // Add to queue and sort by priority
      this.queue.push(request)
      this.queue.sort((a, b) => b.priority - a.priority)

      // Emit queue update event
      this.emit('queueUpdate', {
        size: this.queue.length,
        position: this.queue.findIndex(r => r.id === id) + 1
      })

      // Start processing if not already running
      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      const timeToWait = Math.max(0, this.requestInterval - timeSinceLastRequest)

      if (timeToWait > 0) {
        // Emit wait event
        this.emit('waiting', {
          timeToWait,
          queueSize: this.queue.length
        })
        await this.delay(timeToWait)
      }

      const request = this.queue.shift()!
      this.lastRequestTime = Date.now()

      // Remove from pending requests
      if (request.symbol) {
        this.pendingRequests.delete(request.symbol)
      }

      try {
        // Emit processing event
        this.emit('processing', {
          id: request.id,
          symbol: request.symbol,
          queueSize: this.queue.length
        })

        const result = await request.execute()
        request.resolve(result)

        // Emit success event
        this.emit('requestComplete', {
          id: request.id,
          symbol: request.symbol,
          success: true
        })
      } catch (error) {
        // Check if it's a rate limit error
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('rate limit') && request.retries < this.maxRetries) {
          request.retries++
          
          // Calculate exponential backoff
          const backoffDelay = Math.min(
            this.requestInterval * Math.pow(2, request.retries),
            60000 // Max 1 minute
          )

          // Re-add to queue with higher priority
          this.queue.unshift({
            ...request,
            priority: request.priority + 10
          })

          // Emit retry event
          this.emit('retry', {
            id: request.id,
            symbol: request.symbol,
            attempt: request.retries,
            delay: backoffDelay
          })

          await this.delay(backoffDelay)
        } else {
          request.reject(error instanceof Error ? error : new Error(String(error)))
          
          // Emit error event
          this.emit('requestComplete', {
            id: request.id,
            symbol: request.symbol,
            success: false,
            error: errorMessage
          })
        }
      }

      // Emit queue update
      this.emit('queueUpdate', {
        size: this.queue.length,
        position: 0
      })
    }

    this.processing = false
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getQueueInfo() {
    return {
      size: this.queue.length,
      processing: this.processing,
      estimatedWaitTime: this.queue.length * this.requestInterval
    }
  }

  clearQueue() {
    this.queue.forEach(request => {
      request.reject(new Error('Queue cleared'))
    })
    this.queue = []
    this.pendingRequests.clear()
    this.emit('queueCleared')
  }

  // Get position of a symbol in queue
  getPosition(symbol: string): number {
    const index = this.queue.findIndex(r => r.symbol === symbol)
    return index === -1 ? 0 : index + 1
  }

  // Check if a symbol is already queued
  isQueued(symbol: string): boolean {
    return this.pendingRequests.has(symbol)
  }
}

// Create singleton instance with 60 requests per minute limit
export const finnhubRateLimiter = new FinnhubRateLimiter({
  requestsPerMinute: 60,
  maxRetries: 3,
  enableDeduplication: true
})

// Export types
export type { QueuedRequest, RateLimiterOptions }