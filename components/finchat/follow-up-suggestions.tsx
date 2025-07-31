'use client'

import { useEffect, useState, useMemo } from 'react'
import { Sparkles, TrendingUp, Shield, Calculator, Newspaper, BarChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FollowUpSuggestionsProps {
  lastMessage: string
  stockSymbols?: string[]
  onSelectSuggestion: (suggestion: string) => void
  className?: string
}

interface Suggestion {
  text: string
  icon: React.ComponentType<{ className?: string }>
  category: 'analysis' | 'comparison' | 'strategy' | 'news' | 'risk'
}

export function FollowUpSuggestions({ 
  lastMessage, 
  stockSymbols = [], 
  onSelectSuggestion,
  className 
}: FollowUpSuggestionsProps) {
  // Memoize the suggestions generation to prevent unnecessary recalculations
  const suggestions = useMemo(() => {
    const newSuggestions: Suggestion[] = []
    const message = lastMessage.toLowerCase()

    // Stock-specific suggestions
    if (stockSymbols && stockSymbols.length > 0) {
      const mainStock = stockSymbols[0]
      
      if (message.includes('price') || message.includes('quote')) {
        newSuggestions.push({
          text: `Show technical analysis for ${mainStock}`,
          icon: BarChart,
          category: 'analysis'
        })
        newSuggestions.push({
          text: `Get recent news about ${mainStock}`,
          icon: Newspaper,
          category: 'news'
        })
      }

      if (message.includes('technical') || message.includes('indicator')) {
        newSuggestions.push({
          text: `What's the best entry point for ${mainStock}?`,
          icon: TrendingUp,
          category: 'strategy'
        })
        newSuggestions.push({
          text: `Compare ${mainStock} with its competitors`,
          icon: BarChart,
          category: 'comparison'
        })
      }

      if (stockSymbols.length === 1) {
        newSuggestions.push({
          text: `Calculate position size for ${mainStock} with 2% risk`,
          icon: Calculator,
          category: 'risk'
        })
      }
    }

    // General market suggestions
    if (message.includes('market')) {
      newSuggestions.push({
        text: 'Which sectors are performing best today?',
        icon: TrendingUp,
        category: 'analysis'
      })
      newSuggestions.push({
        text: 'Show me the market sentiment analysis',
        icon: BarChart,
        category: 'analysis'
      })
    }

    // Portfolio suggestions
    if (message.includes('portfolio')) {
      newSuggestions.push({
        text: 'How can I improve my diversification?',
        icon: Shield,
        category: 'risk'
      })
      newSuggestions.push({
        text: 'What are my top performing holdings?',
        icon: TrendingUp,
        category: 'analysis'
      })
    }

    // Strategy suggestions
    if (message.includes('buy') || message.includes('sell')) {
      newSuggestions.push({
        text: 'What are the key risks to consider?',
        icon: Shield,
        category: 'risk'
      })
      newSuggestions.push({
        text: 'Show me alternative investment options',
        icon: Sparkles,
        category: 'strategy'
      })
    }

    // Default suggestions if none generated
    if (newSuggestions.length === 0) {
      newSuggestions.push(
        {
          text: 'Show market overview',
          icon: BarChart,
          category: 'analysis'
        },
        {
          text: 'Analyze my portfolio performance',
          icon: TrendingUp,
          category: 'analysis'
        },
        {
          text: 'Find trending stocks today',
          icon: Sparkles,
          category: 'strategy'
        }
      )
    }

    // Limit to 3 suggestions
    return newSuggestions.slice(0, 3)
  }, [lastMessage, stockSymbols?.join(',')]) // Use string comparison for array dependency

  if (suggestions.length === 0) return null

  return (
    <div className={cn("animate-fade-in", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Suggested follow-ups</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSelectSuggestion(suggestion.text)}
              className="group flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            >
              <Icon className="h-3 w-3 group-hover:scale-110 transition-transform" />
              <span className="text-xs">{suggestion.text}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}