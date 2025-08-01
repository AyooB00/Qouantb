'use client'

import { ChatMessage } from '@/lib/stores/chat-store'
import { MessageItem } from './message-item'
import { TypingIndicator } from './typing-indicator'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
  streamingMessageId?: string | null
  onAction?: (action: { type: string; data?: unknown }) => void
}

export function MessageList({ messages, isLoading, streamingMessageId, onAction }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Start a conversation by typing a message below</p>
      </div>
    )
  }

  // Check if we should show typing indicator
  const showTypingIndicator = isLoading && !streamingMessageId

  return (
    <div className="py-8 space-y-6">
      {messages.map((message) => (
        <MessageItem 
          key={message.id} 
          message={message}
          isStreaming={message.id === streamingMessageId}
          onAction={onAction}
        />
      ))}
      
      {/* Show typing indicator when AI is thinking but not yet streaming */}
      {showTypingIndicator && (
        <TypingIndicator />
      )}
    </div>
  )
}