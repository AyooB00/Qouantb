'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Menu } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useChatStore } from '@/lib/stores/chat-store'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { ConversationSidebar } from './conversation-sidebar'
import { FollowUpSuggestions } from './follow-up-suggestions'
import { WelcomeContent } from './welcome-content'
import { SuggestedPrompts } from './suggested-prompts'
import { getFeaturedPrompts } from '@/lib/finchat/localized-financial-prompts'
import { cn } from '@/lib/utils'
import { SmartComponent, EnhancedChatMessage, QuickAction } from '@/lib/types/finchat'

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const locale = useLocale()
  const t = useTranslations('finChat')
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
  
  const featuredPrompts = getFeaturedPrompts(locale)

  // Auto-scroll to bottom when new messages arrive or when typing indicator shows
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages, streamingMessageId, isLoading])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for new chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        handleNewChat()
      }
      
      // Escape to close sidebar
      if (e.key === 'Escape' && sidebarOpen) {
        e.preventDefault()
        setSidebarOpen(false)
      }
      
      // Cmd/Ctrl + / to toggle sidebar (only on mobile)
      if ((e.metaKey || e.ctrlKey) && e.key === '/' && window.innerWidth < 1024) {
        e.preventDefault()
        setSidebarOpen(!sidebarOpen)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

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
    
    let accumulatedComponents: SmartComponent[] = []
    let messageContext: Record<string, unknown> | null = null

    try {
      useChatStore.setState({ 
        isLoading: true, 
        streamingMessageId: assistantMessageId,
        error: null 
      })

      // Get user's provider preference
      const userProvider = localStorage.getItem('preferredAIProvider')
      
      const response = await fetch('/api/finchat/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content }],
          stream: true,
          provider: userProvider !== 'auto' ? userProvider : 'openai',
          locale
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''
      let toolStatus = null

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
                
                // Handle tool status updates
                if (parsed.status) {
                  toolStatus = {
                    message: parsed.status,
                    tools: parsed.toolCalls
                  }
                  updateMessage(assistantMessageId, { 
                    content: accumulatedContent
                  })
                }
                
                // Handle content
                if (parsed.content) {
                  accumulatedContent += parsed.content
                  updateMessage(assistantMessageId, { 
                    content: accumulatedContent,
                    metadata: {}
                  })
                }
                
                // Handle components
                if (parsed.components) {
                  accumulatedComponents = [...accumulatedComponents, ...parsed.components]
                  updateMessage(assistantMessageId, {
                    content: accumulatedContent,
                    metadata: {}
                  })
                }
                
                // Handle context
                if (parsed.context) {
                  messageContext = parsed.context
                  updateMessage(assistantMessageId, {
                    content: accumulatedContent,
                    metadata: {}
                  })
                }
                
                // Handle metadata
                if (parsed.metadata) {
                  updateMessage(assistantMessageId, { 
                    content: accumulatedContent,
                    metadata: { ...parsed.metadata }
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
  }
  
  const handleQuickAction = (action: { type: string; data?: unknown }) => {
    // Handle quick actions from smart components
    if (action.type === 'send-message' && action.data && typeof action.data === 'object' && 'message' in action.data) {
      handleSendMessage((action.data as { message: string }).message)
    } else if (action.type === 'analyze' && action.data && typeof action.data === 'object' && 'symbol' in action.data) {
      handleSendMessage(`Analyze ${(action.data as { symbol: string }).symbol} in detail`)
    } else if (action.type === 'compare' && action.data && typeof action.data === 'object' && 'symbols' in action.data) {
      handleSendMessage(`Compare ${((action.data as { symbols: string[] }).symbols).join(', ')}`)
    } else if (action.type === 'watchlist' && action.data) {
      // TODO: Implement watchlist functionality
      console.log('Add to watchlist:', action.data)
    }
  }

  return (
    <div className="h-full w-full flex">
      {/* Conversation Sidebar */}
      <ConversationSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Messages Area with integrated controls */}
        <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto py-4 relative">
            {/* Floating controls for mobile */}
            <div className="lg:hidden fixed top-16 right-4 z-10 flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 shadow-lg"
                      onClick={() => setSidebarOpen(true)}
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('chatInterface.toggleSidebar')}</p>
                    <p className="text-xs text-muted-foreground">⌘/</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            {messages.length === 0 ? (
              <WelcomeContent />
            ) : (
              <MessageList 
                messages={messages}
                isLoading={isLoading}
                streamingMessageId={streamingMessageId}
                onAction={handleQuickAction}
              />
            )}
          </div>
        </div>

        {/* Fixed Input Area */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 shadow-sm">
          <div className="max-w-4xl mx-auto">
            {/* Suggested Prompts when no messages */}
            {messages.length === 0 && !isLoading && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-3 text-center text-muted-foreground">{t('chatInterface.tryAsking')}</h3>
                <SuggestedPrompts 
                  prompts={featuredPrompts}
                  onSelectPrompt={handleSendMessage}
                />
              </div>
            )}
            
            {/* Follow-up Suggestions when messages exist */}
            {messages.length > 0 && !isLoading && (() => {
              const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')
              if (lastAssistantMessage && lastAssistantMessage.content) {
                return (
                  <FollowUpSuggestions
                    lastMessage={lastAssistantMessage.content}
                    stockSymbols={lastAssistantMessage.metadata?.stocks || []}
                    onSelectSuggestion={handleSendMessage}
                    className="mb-4"
                  />
                )
              }
              return null
            })()}
            
            <MessageInput 
              onSendMessage={handleSendMessage}
              disabled={isLoading}
            />
            
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              {t('chatInterface.disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}