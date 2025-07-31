'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface MarketIndex {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
}

interface TrendingStock {
  symbol: string
  price: number
  changePercent: number
  volume: string
}

export function MarketOverview() {
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([
    { symbol: 'SPY', name: 'S&P 500', value: 4783.35, change: 23.45, changePercent: 0.49 },
    { symbol: 'DIA', name: 'Dow Jones', value: 37545.33, change: -123.45, changePercent: -0.33 },
    { symbol: 'QQQ', name: 'NASDAQ', value: 16823.45, change: 87.23, changePercent: 0.52 },
  ])

  const [trendingStocks] = useState<TrendingStock[]>([
    { symbol: 'NVDA', price: 495.22, changePercent: 3.45, volume: '45.2M' },
    { symbol: 'TSLA', price: 201.12, changePercent: 2.87, volume: '38.7M' },
    { symbol: 'AAPL', price: 182.52, changePercent: -1.23, volume: '52.3M' },
    { symbol: 'META', price: 345.67, changePercent: 1.98, volume: '28.9M' },
    { symbol: 'AMZN', price: 145.32, changePercent: -0.67, volume: '31.4M' },
  ])

  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | 'pre-market' | 'after-hours'>('open')
  const [marketSentiment] = useState(65) // Bullish sentiment percentage

  useEffect(() => {
    // Check market hours
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()
    
    if (day === 0 || day === 6) {
      setMarketStatus('closed')
    } else if (hour >= 9.5 && hour < 16) {
      setMarketStatus('open')
    } else if (hour >= 4 && hour < 9.5) {
      setMarketStatus('pre-market')
    } else if (hour >= 16 && hour < 20) {
      setMarketStatus('after-hours')
    } else {
      setMarketStatus('closed')
    }
  }, [])

  const getStatusColor = (status: typeof marketStatus) => {
    switch (status) {
      case 'open':
        return 'bg-green-500'
      case 'pre-market':
      case 'after-hours':
        return 'bg-yellow-500'
      case 'closed':
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Market Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Market Status</CardTitle>
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full animate-pulse", getStatusColor(marketStatus))} />
              <span className="text-sm font-medium capitalize">
                {marketStatus.replace('-', ' ')}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marketIndices.map((index) => (
              <div key={index.symbol} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{index.name}</p>
                  <p className="text-xs text-muted-foreground">{index.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{index.value.toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-1">
                    {index.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={cn(
                      "text-xs",
                      index.change > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {index.change > 0 ? '+' : ''}{index.changePercent}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Sentiment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Market Sentiment</CardTitle>
          <CardDescription className="text-xs">Based on volume and price action</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bearish</span>
              <span className="font-medium">{marketSentiment}% Bullish</span>
              <span className="text-muted-foreground">Bullish</span>
            </div>
            <Progress value={marketSentiment} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Market showing {marketSentiment > 50 ? 'bullish' : 'bearish'} sentiment
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trending Stocks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trendingStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{stock.symbol}</p>
                  <p className="text-xs text-muted-foreground">Vol: {stock.volume}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">${stock.price}</p>
                  <Badge
                    variant={stock.changePercent > 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}