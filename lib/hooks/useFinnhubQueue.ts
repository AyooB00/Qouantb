import { useEffect, useState, useCallback } from 'react'
import { finnhubRateLimiter } from '@/lib/middleware/finnhubRateLimiter'

interface QueueInfo {
  position: number
  totalInQueue: number
  estimatedWaitTime: number
  isProcessing: boolean
}

interface QueueEventData {
  symbol: string
}

export function useFinnhubQueue(symbol?: string) {
  const [queueInfo, setQueueInfo] = useState<QueueInfo>({
    position: 0,
    totalInQueue: 0,
    estimatedWaitTime: 0,
    isProcessing: false
  })

  const updateQueueInfo = useCallback(() => {
    const info = finnhubRateLimiter.getQueueInfo()
    const position = symbol ? finnhubRateLimiter.getPosition(symbol) : 0
    
    setQueueInfo({
      position,
      totalInQueue: info.size,
      estimatedWaitTime: position > 0 ? position * 1000 : 0, // 1 second per request
      isProcessing: info.processing
    })
  }, [symbol])

  useEffect(() => {
    // Update immediately
    updateQueueInfo()

    // Listen for queue updates
    const handleQueueUpdate = () => {
      updateQueueInfo()
    }

    const handleProcessing = (data: QueueEventData) => {
      if (data.symbol === symbol) {
        setQueueInfo(prev => ({ ...prev, isProcessing: true, position: 0 }))
      }
    }

    const handleComplete = (data: QueueEventData) => {
      if (data.symbol === symbol) {
        setQueueInfo(prev => ({ ...prev, isProcessing: false }))
      }
    }

    finnhubRateLimiter.on('queueUpdate', handleQueueUpdate)
    finnhubRateLimiter.on('processing', handleProcessing)
    finnhubRateLimiter.on('requestComplete', handleComplete)

    return () => {
      finnhubRateLimiter.off('queueUpdate', handleQueueUpdate)
      finnhubRateLimiter.off('processing', handleProcessing)
      finnhubRateLimiter.off('requestComplete', handleComplete)
    }
  }, [symbol, updateQueueInfo])

  return queueInfo
}

// Format wait time for display
export function formatWaitTime(ms: number): string {
  if (ms < 1000) return 'less than a second'
  const seconds = Math.ceil(ms / 1000)
  if (seconds === 1) return '1 second'
  if (seconds < 60) return `${seconds} seconds`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes > 1 ? 's' : ''}`
}