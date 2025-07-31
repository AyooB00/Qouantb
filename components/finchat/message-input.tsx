'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function MessageInput({ 
  onSendMessage, 
  disabled, 
  placeholder = "Type a message...",
  className 
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // Voice recording logic would go here
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "flex items-end gap-2 p-2 rounded-2xl transition-all duration-300",
        isFocused 
          ? "bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-teal-950/30 dark:to-blue-950/30 shadow-lg ring-2 ring-teal-500/20" 
          : "bg-card/50 backdrop-blur"
      )}>
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[60px] max-h-[200px] pr-24 resize-none bg-transparent border-0 focus:ring-0",
              "placeholder:text-muted-foreground/60"
            )}
            rows={1}
          />
          
          <div className="absolute bottom-1 right-1 flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                isRecording 
                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={toggleRecording}
              disabled={disabled}
              type="button"
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                message.trim() 
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-lg hover:scale-105" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
              onClick={handleSend}
              disabled={!message.trim() || disabled}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-2 px-2">
        <span className="text-xs text-muted-foreground/60">Press Enter to send, Shift+Enter for new line</span>
        {isRecording && (
          <span className="text-xs text-red-500 animate-pulse flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Recording...
          </span>
        )}
      </div>
    </div>
  )
}