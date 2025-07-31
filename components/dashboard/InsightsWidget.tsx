'use client'

import { useEffect, useState } from 'react'
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { cn } from '@/lib/utils'

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

  useEffect(() => {
    generateInsights()
  }, [items, totalValue])

  const generateInsights = async () => {
    setLoading(true)
    
    // Simulate AI-generated insights based on portfolio
    setTimeout(() => {
      const newInsights: Insight[] = []
      
      // Portfolio performance insight
      if (totalProfitLossPercent > 10) {
        newInsights.push({
          id: '1',
          type: 'opportunity',
          title: 'Strong Portfolio Performance',
          description: 'Your portfolio is outperforming the market. Consider taking some profits on winners.',
          impact: 'high',
          timestamp: new Date(),
        })
      } else if (totalProfitLossPercent < -5) {
        newInsights.push({
          id: '2',
          type: 'risk',
          title: 'Portfolio Under Pressure',
          description: 'Recent market conditions have impacted your holdings. Review stop-loss levels.',
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
          title: `${topGainer.symbol} Hitting New Highs`,
          description: `Up ${topGainer.profitLossPercent?.toFixed(1)}% since purchase. Consider setting trailing stop-loss.`,
          impact: 'medium',
          relatedSymbol: topGainer.symbol,
          timestamp: new Date(),
        })
      }

      // Market insight
      newInsights.push({
        id: '4',
        type: 'news',
        title: 'Tech Sector Momentum',
        description: 'Technology stocks showing strong momentum. AI and semiconductor stocks leading gains.',
        impact: 'medium',
        timestamp: new Date(),
      })

      // Risk insight
      const highBetaStocks = items.filter(item => (item.beta || 0) > 1.5)
      if (highBetaStocks.length > items.length * 0.3) {
        newInsights.push({
          id: '5',
          type: 'risk',
          title: 'High Portfolio Volatility',
          description: `${highBetaStocks.length} stocks with high beta. Consider adding defensive positions.`,
          impact: 'medium',
          timestamp: new Date(),
        })
      }

      setInsights(newInsights)
      setLoading(false)
      setLastRefresh(new Date())
    }, 1500)
  }

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your portfolio
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
              <div key={i} className="space-y-2">
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
                  className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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
                          {insight.impact}
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
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}