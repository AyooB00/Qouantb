'use client'

import { ChatMessage } from '@/lib/stores/chat-store'
import { MessageItem } from './message-item'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
  streamingMessageId?: string | null
}

export function MessageList({ messages, isLoading, streamingMessageId }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        <p>Start a conversation by typing a message below</p>
      </div>
    )
  }

  return (
    <div className="py-8 space-y-6">
      {messages.map((message) => (
        <MessageItem 
          key={message.id} 
          message={message}
          isStreaming={message.id === streamingMessageId}
        />
      ))}
    </div>
  )
}