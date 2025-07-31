'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
}

export function AnimatedText({ 
  text, 
  className, 
  delay = 0, 
  speed = 50 
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTyping(true)
      let currentIndex = 0

      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.substring(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(interval)
          setIsTyping(false)
        }
      }, speed)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, delay, speed])

  return (
    <span className={cn('inline-block', className)}>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-0.5 h-[1.2em] bg-current animate-pulse ml-0.5" />
      )}
    </span>
  )
}