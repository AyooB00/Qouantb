'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MarketIndex {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
}

interface MarketSummary {
  indices: MarketIndex[]
  marketStatus: string
  lastUpdated: string
}

export function MarketWidget() {
  const [marketData, setMarketData] = useState<MarketSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchMarketData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchMarketData = async () => {
    try {
      setLoading(true)
      setError(false)
      
      // In production, this would call a real API endpoint
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: MarketSummary = {
        indices: [
          {
            symbol: 'SPX',
            name: 'S&P 500',
            value: 4783.45,
            change: 23.45,
            changePercent: 0.49
          },
          {
            symbol: 'DJI',
            name: 'Dow Jones',
            value: 37688.54,
            change: -120.34,
            changePercent: -0.32
          },
          {
            symbol: 'IXIC',
            name: 'Nasdaq',
            value: 15011.35,
            change: 89.23,
            changePercent: 0.60
          },
          {
            symbol: 'VIX',
            name: 'VIX',
            value: 13.21,
            change: 0.45,
            changePercent: 3.53
          }
        ],
        marketStatus: isMarketOpen() ? 'Open' : 'Closed',
        lastUpdated: new Date().toISOString()
      }
      
      setMarketData(mockData)
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const isMarketOpen = () => {
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const currentTime = hour * 60 + minute
    
    // Market hours: 9:30 AM - 4:00 PM ET (adjust for your timezone)
    const marketOpen = 9 * 60 + 30
    const marketClose = 16 * 60
    
    return day >= 1 && day <= 5 && currentTime >= marketOpen && currentTime < marketClose
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error || !marketData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-sm text-muted-foreground">Unable to load market data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Market Summary</CardTitle>
          <Badge variant={marketData.marketStatus === 'Open' ? 'default' : 'secondary'}>
            {marketData.marketStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {marketData.indices.map((index) => {
            const isPositive = index.change >= 0
            return (
              <div key={index.symbol} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{index.symbol}</span>
                  <Activity className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold">{index.value.toLocaleString()}</p>
                <div className={cn(
                  "flex items-center gap-1 text-sm",
                  isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        
        <p className="text-xs text-muted-foreground mt-3">
          Last updated: {new Date(marketData.lastUpdated).toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  )
}