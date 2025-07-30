'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Menu, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore } from '@/lib/stores/chat-store'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { ConversationSidebar } from './conversation-sidebar'
import { cn } from '@/lib/utils'

interface ChatInterfaceProps {
  onBackToWelcome?: () => void
}

export function ChatInterface({ onBackToWelcome }: ChatInterfaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { 
    messages, 
    isLoading,
    streamingMessageId,
    error,
    addMessage,
    updateMessage,
    createConversation,
    currentConversationId
  } = useChatStore()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages, streamingMessageId])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Create conversation if none exists
    if (!currentConversationId) {
      createConversation(content.slice(0, 50))
    }

    // Add user message
    const userMessageId = addMessage({
      role: 'user',
      content
    })

    // Add placeholder assistant message
    const assistantMessageId = addMessage({
      role: 'assistant',
      content: ''
    })

    try {
      useChatStore.setState({ 
        isLoading: true, 
        streamingMessageId: assistantMessageId,
        error: null 
      })

      const response = await fetch('/api/finchat/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content }],
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  accumulatedContent += parsed.content
                  updateMessage(assistantMessageId, { content: accumulatedContent })
                }
                if (parsed.metadata) {
                  updateMessage(assistantMessageId, { 
                    content: accumulatedContent,
                    metadata: parsed.metadata 
                  })
                }
              } catch (e) {
                console.error('Error parsing streaming data:', e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      updateMessage(assistantMessageId, {
        content: 'Sorry, I encountered an error. Please try again.',
        metadata: { error: true }
      })
      useChatStore.setState({ 
        error: error instanceof Error ? error.message : 'An error occurred' 
      })
    } finally {
      useChatStore.setState({ 
        isLoading: false, 
        streamingMessageId: null 
      })
    }
  }

  const handleNewChat = () => {
    createConversation()
    if (onBackToWelcome) {
      onBackToWelcome()
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <ConversationSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {onBackToWelcome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToWelcome}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <h1 className="font-semibold">FinChat</h1>
          
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          <div className="max-w-4xl mx-auto">
            <MessageList 
              messages={messages}
              isLoading={isLoading}
              streamingMessageId={streamingMessageId}
            />
            
            {isLoading && !streamingMessageId && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto">
            <MessageInput 
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              placeholder="Ask about stocks, markets, or investment strategies..."
            />
            
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              FinChat can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}