'use client'

import React from 'react'
import { Clock, Loader2 } from 'lucide-react'
import { useFinnhubQueue, formatWaitTime } from '@/lib/hooks/useFinnhubQueue'
import { cn } from '@/lib/utils'

interface QueueIndicatorProps {
  symbol?: string
  className?: string
  showDetails?: boolean
}

export function QueueIndicator({ symbol, className, showDetails = true }: QueueIndicatorProps) {
  const queueInfo = useFinnhubQueue(symbol)

  // Don't show if not in queue or processing
  if (queueInfo.position === 0 && !queueInfo.isProcessing) {
    return null
  }

  return (
    <div className={cn(
      "flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-300",
      className
    )}>
      {queueInfo.isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Fetching data...</span>
        </>
      ) : (
        <>
          <Clock className="h-4 w-4" />
          <span>
            Position {queueInfo.position} in queue
            {showDetails && queueInfo.estimatedWaitTime > 0 && (
              <> • ~{formatWaitTime(queueInfo.estimatedWaitTime)} wait</>
            )}
          </span>
        </>
      )}
    </div>
  )
}

// Inline queue status for smaller displays
export function QueueBadge({ symbol }: { symbol?: string }) {
  const queueInfo = useFinnhubQueue(symbol)

  if (queueInfo.position === 0 && !queueInfo.isProcessing) {
    return null
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded-full">
      {queueInfo.isProcessing ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <>
          <Clock className="h-3 w-3" />
          <span>#{queueInfo.position}</span>
        </>
      )}
    </div>
  )
}