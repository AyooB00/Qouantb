'use client'

import { useEffect, useState, useCallback } from 'react'
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import { formatRelativeTime } from '@/lib/utils/formatters'

interface Insight {
  id: string
  type: 'opportunity' | 'risk' | 'tip' | 'news'
  title: string
  description: string
  impact?: 'high' | 'medium' | 'low'
  relatedSymbol?: string
  timestamp: Date
}

export function InsightsWidget() {
  const { items, totalValue, totalProfitLossPercent } = usePortfolioStore()
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const t = useTranslations('dashboard.insights')
  const locale = useLocale()

  const generateInsights = useCallback(async () => {
    setLoading(true)
    
    // Simulate AI-generated insights based on portfolio
    setTimeout(() => {
      const newInsights: Insight[] = []
      
      // Portfolio performance insight
      if (totalProfitLossPercent > 10) {
        newInsights.push({
          id: '1',
          type: 'opportunity',
          title: t('strongPerformanceTitle'),
          description: t('strongPerformanceDesc'),
          impact: 'high',
          timestamp: new Date(),
        })
      } else if (totalProfitLossPercent < -5) {
        newInsights.push({
          id: '2',
          type: 'risk',
          title: t('underPressureTitle'),
          description: t('underPressureDesc'),
          impact: 'high',
          timestamp: new Date(),
        })
      }

      // Stock-specific insights
      const topGainer = items.reduce((max, item) => 
        (item.profitLossPercent || 0) > (max.profitLossPercent || 0) ? item : max
      , items[0])

      if (topGainer && (topGainer.profitLossPercent || 0) > 20) {
        newInsights.push({
          id: '3',
          type: 'tip',
          title: t('hittingHighsTitle', { symbol: topGainer.symbol }),
          description: t('hittingHighsDesc', { percent: topGainer.profitLossPercent?.toFixed(1) }),
          impact: 'medium',
          relatedSymbol: topGainer.symbol,
          timestamp: new Date(),
        })
      }

      // Market insight
      newInsights.push({
        id: '4',
        type: 'news',
        title: t('techMomentumTitle'),
        description: t('techMomentumDesc'),
        impact: 'medium',
        timestamp: new Date(),
      })

      // Risk insight
      const highBetaStocks = items.filter(item => (item.beta || 0) > 1.5)
      if (highBetaStocks.length > items.length * 0.3) {
        newInsights.push({
          id: '5',
          type: 'risk',
          title: t('highVolatilityTitle'),
          description: t('highVolatilityDesc', { count: highBetaStocks.length }),
          impact: 'medium',
          timestamp: new Date(),
        })
      }

      setInsights(newInsights)
      setLoading(false)
      setLastRefresh(new Date())
    }, 1500)
  }, [items, totalProfitLossPercent, t])

  useEffect(() => {
    generateInsights()
  }, [items, totalValue, generateInsights])

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return TrendingUp
      case 'risk':
        return AlertTriangle
      case 'tip':
        return Lightbulb
      case 'news':
        return Brain
    }
  }

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'text-green-500'
      case 'risk':
        return 'text-red-500'
      case 'tip':
        return 'text-blue-500'
      case 'news':
        return 'text-purple-500'
    }
  }

  return (
    <Card className="overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/20" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {t('title')}
              </span>
            </CardTitle>
            <CardDescription>
              {t('personalizedRecommendations')}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={generateInsights}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => {
              const Icon = getInsightIcon(insight.type)
              return (
                <div
                  key={insight.id}
                  className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-300 hover:shadow-md hover:scale-[1.01]"
                >
                  <Icon className={cn("h-5 w-5 mt-0.5", getInsightColor(insight.type))} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      {insight.impact && (
                        <Badge
                          variant={
                            insight.impact === 'high' ? 'destructive' :
                            insight.impact === 'medium' ? 'default' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {t(`impact.${insight.impact}`)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    {insight.relatedSymbol && (
                      <Badge variant="outline" className="text-xs">
                        {insight.relatedSymbol}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            {t('lastUpdated')}: {formatRelativeTime(lastRefresh, locale)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}