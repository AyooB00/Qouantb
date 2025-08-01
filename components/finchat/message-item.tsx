'use client'

import { useEffect, useState, Suspense } from 'react'
import { Bot, User, Copy, Check, AlertCircle, Loader2, TrendingUp, BarChart3, Newspaper, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatMessage } from '@/lib/stores/chat-store'
import { StockCard } from './stock-card'
import { StockChart } from './stock-chart'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Badge } from '@/components/ui/badge'
import { ResponseParser } from '@/lib/finchat/response-parser'
import { SmartComponent, EnhancedChatMessage, QuickAction } from '@/lib/types/finchat'
import { SmartComponentErrorBoundary } from './smart-component-error-boundary'
import { SmartComponentRenderer } from './smart-component-renderer'
import { SmartCardSkeleton } from './smart-card-skeleton'
import { SmartComponentGrid } from './smart-component-grid'
import { useTranslations } from 'next-intl'
import { useLocale } from '@/lib/locale-context'

interface MessageItemProps {
  message: ChatMessage | EnhancedChatMessage
  isStreaming?: boolean
  onAction?: (action: any) => void
}


export function MessageItem({ message, isStreaming, onAction }: MessageItemProps) {
  const [copied, setCopied] = useState(false)
  const [parsedComponents, setParsedComponents] = useState<SmartComponent[]>([])
  const isUser = message.role === 'user'
  const isError = message.metadata?.error
  // const isThinking = message.metadata?.isThinking
  // const toolStatus = message.metadata?.toolStatus
  const t = useTranslations('finChat.messageItem')
  const toolsT = useTranslations('finChat.tools')
  const locale = useLocale()

  // Parse message content for smart components
  useEffect(() => {
    if (!isUser && !isStreaming) {
      const parser = ResponseParser.getInstance()
      const { components } = parser.parseResponse(message.content || '')
      
      // Merge with any components already in the message
      const messageComponents = (message as EnhancedChatMessage).components || []
      const allComponents = [...messageComponents, ...components]
      
      // Deduplicate by ID
      const uniqueComponents = allComponents.filter((comp, index, self) => 
        index === self.findIndex((c) => c.id === comp.id)
      )
      
      setParsedComponents(uniqueComponents)
    }
  }, [message.content, isUser, isStreaming, (message as EnhancedChatMessage).components])

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Extract stock symbols from content for inline cards
  const stockSymbols = (message.metadata && 'stocks' in message.metadata ? (message.metadata as any).stocks : undefined) || []

  // Get icon for tool
  const getToolIcon = (toolName: string) => {
    if (toolName.includes('stock_quote') || toolName.includes('compare')) return TrendingUp
    if (toolName.includes('technical')) return BarChart3
    if (toolName.includes('news')) return Newspaper
    if (toolName.includes('calculate')) return Calculator
    return TrendingUp
  }

  // Get tool display name
  const getToolDisplayName = (toolName: string) => {
    if (toolName.includes('stock_quote')) return toolsT('stockQuote')
    if (toolName.includes('technical')) return toolsT('technicalAnalysis')
    if (toolName.includes('news')) return toolsT('newsAnalysis')
    if (toolName.includes('compare')) return toolsT('compare')
    if (toolName.includes('fundamentals')) return toolsT('fundamentals')
    return toolName
  }

  return (
    <div className={cn(
      "flex gap-3 px-4 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110",
        isUser ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg" : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 shadow-md"
      )}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 space-y-2",
        isUser ? "flex flex-col items-end" : "flex flex-col items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-3 max-w-[85%] relative group transition-all duration-300",
          isUser 
            ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]" 
            : isError 
              ? "bg-destructive/10 border border-destructive/20 backdrop-blur-md"
              : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-lg hover:scale-[1.02]"
        )}>
          {isError && (
            <div className="flex items-center gap-2 mb-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
          )}

          {/* Thinking Indicator - Commented out due to type issues */}
          {/* {isThinking && !message.content && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm animate-pulse">Thinking...</span>
            </div>
          )} */}

          {/* Tool Status - Commented out due to type issues */}
          {/* {toolStatus && (
            <div className="mb-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{toolStatus.message}</span>
              </div>
              {toolStatus.tools && toolStatus.tools.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {toolStatus.tools.map((tool: string, index: number) => {
                    const Icon = getToolIcon(tool)
                    return (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs flex items-center gap-1"
                      >
                        <Icon className="h-3 w-3" />
                        {tool.replace(/_/g, ' ')}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          )} */}

          {/* Message Text */}
          {message.content && (
            <div className={cn(
              "prose prose-sm max-w-none",
              isUser 
                ? "prose-p:text-white prose-headings:text-white prose-a:text-white/90 prose-strong:text-white prose-code:text-white/90" 
                : "prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-headings:text-gray-900 dark:prose-headings:text-gray-100"
            )}>
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Copy Button */}
          {!isUser && message.content && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200",
                "h-7 w-7 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg rounded-full"
              )}
              onClick={handleCopy}
              title={copied ? t('copied') : t('copy')}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}

          {/* Streaming Indicator */}
          {isStreaming && (
            <span className="inline-block w-1 h-4 bg-current animate-pulse ml-1" />
          )}
        </div>

        {/* Smart Components */}
        {!isUser && parsedComponents.length > 0 && (
          <div className="mt-3 max-w-[85%]">
            {parsedComponents.length > 1 ? (
              <SmartComponentGrid 
                components={parsedComponents}
                onAction={onAction}
                maxColumns={2}
              />
            ) : (
              <SmartComponentErrorBoundary componentType={parsedComponents[0].type}>
                <Suspense fallback={<SmartCardSkeleton />}>
                  <SmartComponentRenderer 
                    component={parsedComponents[0]} 
                    onAction={onAction} 
                  />
                </Suspense>
              </SmartComponentErrorBoundary>
            )}
          </div>
        )}

        {/* Stock Cards and Charts - only show if no smart components */}
        {!isUser && parsedComponents.length === 0 && stockSymbols.length > 0 && (
          <div className="space-y-3 mt-3 max-w-[85%]">
            {/* Show charts for up to 2 stocks to avoid cluttering */}
            {stockSymbols.slice(0, 2).map((symbol: string) => (
              <StockChart key={symbol} symbol={symbol} height={180} />
            ))}
            
            {/* Show compact cards for additional stocks */}
            {stockSymbols.length > 2 && (
              <div className="flex flex-wrap gap-2">
                {stockSymbols.slice(2).map((symbol: string) => (
                  <StockCard key={symbol} symbol={symbol} />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Quick Actions */}
        {!isUser && (message as EnhancedChatMessage).actions && (message as EnhancedChatMessage).actions!.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 max-w-[85%]">
            {(message as EnhancedChatMessage).actions!.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={(action.variant === 'primary' ? 'default' : action.variant) || 'outline'}
                onClick={() => onAction?.(action)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground/60 px-2 animate-fade-in animation-delay-200">
          {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}