'use client'

import { useMemo } from 'react'
import { Sparkles, TrendingUp, Shield, Calculator, Newspaper, BarChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('finChat.suggestions')
  // Memoize the suggestions generation to prevent unnecessary recalculations
  const suggestions = useMemo(() => {
    const newSuggestions: Suggestion[] = []
    const message = lastMessage.toLowerCase()

    // Stock-specific suggestions
    if (stockSymbols && stockSymbols.length > 0) {
      const mainStock = stockSymbols[0]
      
      if (message.includes('price') || message.includes('quote')) {
        newSuggestions.push({
          text: t('stockSpecific.technicalAnalysis', { symbol: mainStock }),
          icon: BarChart,
          category: 'analysis'
        })
        newSuggestions.push({
          text: t('stockSpecific.recentNews', { symbol: mainStock }),
          icon: Newspaper,
          category: 'news'
        })
      }

      if (message.includes('technical') || message.includes('indicator')) {
        newSuggestions.push({
          text: t('stockSpecific.entryPoint', { symbol: mainStock }),
          icon: TrendingUp,
          category: 'strategy'
        })
        newSuggestions.push({
          text: t('stockSpecific.compareCompetitors', { symbol: mainStock }),
          icon: BarChart,
          category: 'comparison'
        })
      }

      if (stockSymbols.length === 1) {
        newSuggestions.push({
          text: t('stockSpecific.positionSize', { symbol: mainStock }),
          icon: Calculator,
          category: 'risk'
        })
      }
    }

    // General market suggestions
    if (message.includes('market')) {
      newSuggestions.push({
        text: t('general.sectorsToday'),
        icon: TrendingUp,
        category: 'analysis'
      })
      newSuggestions.push({
        text: t('general.marketSentiment'),
        icon: BarChart,
        category: 'analysis'
      })
    }

    // Portfolio suggestions
    if (message.includes('portfolio')) {
      newSuggestions.push({
        text: t('general.diversification'),
        icon: Shield,
        category: 'risk'
      })
      newSuggestions.push({
        text: t('general.topPerformers'),
        icon: TrendingUp,
        category: 'analysis'
      })
    }

    // Strategy suggestions
    if (message.includes('buy') || message.includes('sell')) {
      newSuggestions.push({
        text: t('general.keyRisks'),
        icon: Shield,
        category: 'risk'
      })
      newSuggestions.push({
        text: t('general.alternatives'),
        icon: Sparkles,
        category: 'strategy'
      })
    }

    // Default suggestions if none generated
    if (newSuggestions.length === 0) {
      newSuggestions.push(
        {
          text: t('general.marketOverview'),
          icon: BarChart,
          category: 'analysis'
        },
        {
          text: t('general.portfolioPerformance'),
          icon: TrendingUp,
          category: 'analysis'
        },
        {
          text: t('general.trendingStocks'),
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
        <span className="text-sm text-muted-foreground">{t('title')}</span>
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