'use client'

import { useEffect, useState } from 'react'
import { Bot, User, Copy, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatMessage } from '@/lib/stores/chat-store'
import { StockCard } from './stock-card'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface MessageItemProps {
  message: ChatMessage
  isStreaming?: boolean
}

export function MessageItem({ message, isStreaming }: MessageItemProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isError = message.metadata?.error

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Extract stock symbols from content for inline cards
  const stockSymbols = message.metadata?.stocks || []

  return (
    <div className={cn(
      "flex gap-3 px-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
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
          "rounded-lg px-4 py-2 max-w-[85%] relative group",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : isError 
              ? "bg-destructive/10 border border-destructive/20"
              : "bg-muted"
        )}>
          {isError && (
            <div className="flex items-center gap-2 mb-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
          )}

          {/* Message Text */}
          <div className={cn(
            "prose prose-sm dark:prose-invert max-w-none",
            isUser && "prose-p:text-primary-foreground"
          )}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
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

          {/* Copy Button */}
          {!isUser && message.content && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity",
                "h-8 w-8"
              )}
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3" />
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

        {/* Stock Cards */}
        {stockSymbols.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {stockSymbols.map((symbol) => (
              <StockCard key={symbol} symbol={symbol} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}