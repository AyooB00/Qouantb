'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ComponentRenderProps, MarketAnalysisData } from '@/lib/types/finchat'
import { cn } from '@/lib/utils'

export default function MarketAnalysisCard({ data, className }: ComponentRenderProps<MarketAnalysisData>) {
  const [marketData, setMarketData] = useState<MarketAnalysisData | null>(data)
  const [loading, setLoading] = useState(!data)

  useEffect(() => {
    if (!data) {
      fetchMarketData()
    }
  }, [data])

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/finchat/market-overview')
      if (response.ok) {
        const result = await response.json()
        setMarketData(result)
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Loading Market Analysis...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!marketData) return null

  const getSentimentIcon = () => {
    switch (marketData.sentiment) {
      case 'bullish':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'bearish':
        return <TrendingDown className="h-5 w-5 text-red-500" />
      default:
        return <Minus className="h-5 w-5 text-gray-500" />
    }
  }

  const getSentimentColor = () => {
    switch (marketData.sentiment) {
      case 'bullish':
        return 'text-green-600 bg-green-50 dark:bg-green-950/30'
      case 'bearish':
        return 'text-red-600 bg-red-50 dark:bg-red-950/30'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
    }
  }

  const sentimentProgress = marketData.score > 0 ? (marketData.score + 100) / 2 : 50

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-lg", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600" />
            Market Analysis
          </span>
          <Badge className={cn("capitalize", getSentimentColor())}>
            {getSentimentIcon()}
            <span className="ml-1">{marketData.sentiment}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sentiment Score */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Market Sentiment</span>
            <span className="font-medium">{marketData.score > 0 ? '+' : ''}{marketData.score}%</span>
          </div>
          <Progress value={sentimentProgress} className="h-2" />
        </div>

        {/* Indices */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Major Indices</h4>
          <div className="grid grid-cols-2 gap-2">
            {marketData.indices.map((index) => (
              <div key={index.symbol} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div>
                  <div className="font-medium text-sm">{index.symbol}</div>
                  <div className="text-xs text-muted-foreground">{index.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${index.value.toLocaleString()}</div>
                  <div className={cn(
                    "text-xs font-medium",
                    index.changePercent >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Movers */}
        {marketData.topMovers && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <h4 className="text-sm font-medium text-green-600 mb-1">Top Gainers</h4>
              <div className="space-y-1">
                {marketData.topMovers.gainers.slice(0, 3).map((stock) => (
                  <div key={stock.symbol} className="flex justify-between text-xs">
                    <span className="font-medium">{stock.symbol}</span>
                    <span className="text-green-600">+{stock.changePercent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-600 mb-1">Top Losers</h4>
              <div className="space-y-1">
                {marketData.topMovers.losers.slice(0, 3).map((stock) => (
                  <div key={stock.symbol} className="flex justify-between text-xs">
                    <span className="font-medium">{stock.symbol}</span>
                    <span className="text-red-600">{stock.changePercent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {marketData.summary && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">{marketData.summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}