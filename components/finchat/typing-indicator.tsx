'use client'

import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TypingIndicatorProps {
  className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex gap-3 px-4", className)}>
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
        <Bot className="h-4 w-4" />
      </div>

      {/* Typing Animation */}
      <div className="flex items-center gap-1 px-4 py-3 rounded-lg bg-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-typing-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-typing-bounce" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-typing-bounce" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  )
}