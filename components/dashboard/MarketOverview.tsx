'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatNumber, formatPercentage, formatCurrency } from '@/lib/utils/formatters'
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
  const t = useTranslations('dashboard.market')
  const locale = useLocale()
  
  const [marketIndices] = useState<MarketIndex[]>([
    { symbol: 'COMP', name: t('nasdaqComposite'), value: 15823.45, change: 142.89, changePercent: 0.91 },
    { symbol: 'NDX', name: t('nasdaq100'), value: 17654.32, change: 198.45, changePercent: 1.14 },
    { symbol: 'QQQ', name: t('nasdaqETF'), value: 428.45, change: 3.23, changePercent: 0.76 },
  ])

  const [trendingStocks] = useState<TrendingStock[]>([
    { symbol: 'NVDA', price: 495.22, changePercent: 3.45, volume: '45.2M' },
    { symbol: 'MSFT', price: 378.85, changePercent: 2.12, volume: '42.1M' },
    { symbol: 'GOOGL', price: 142.65, changePercent: 1.89, volume: '28.3M' },
    { symbol: 'META', price: 345.67, changePercent: -0.98, volume: '25.9M' },
    { symbol: 'TSLA', price: 201.12, changePercent: -1.45, volume: '38.7M' },
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
      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/20" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">{t('marketOverview')}</CardTitle>
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full animate-pulse", getStatusColor(marketStatus))} />
              <span className="text-sm font-medium capitalize">
                {t(marketStatus === 'open' ? 'marketOpen' : 
                   marketStatus === 'closed' ? 'marketClosed' :
                   marketStatus === 'pre-market' ? 'preMarket' : 'afterHours')}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marketIndices.map((index) => (
              <div key={index.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-all duration-300">
                <div>
                  <p className="text-sm font-medium">{index.name}</p>
                  <p className="text-xs text-muted-foreground">{index.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatNumber(index.value, locale)}</p>
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
                      {formatPercentage(index.changePercent, locale, true)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Sentiment */}
      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20" />
        <CardHeader className="pb-3 relative">
          <CardTitle className="text-base bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">{t('marketSentiment')}</CardTitle>
          <CardDescription className="text-xs">{t('marketSentimentDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('bearish')}</span>
              <span className="font-medium">{marketSentiment}% {t('bullish')}</span>
              <span className="text-muted-foreground">{t('bullish')}</span>
            </div>
            <Progress value={marketSentiment} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {t('marketShowing', { sentiment: marketSentiment > 50 ? t('bullish').toLowerCase() : t('bearish').toLowerCase() })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trending Stocks */}
      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-purple-50/30 dark:from-violet-950/20 dark:to-purple-950/20" />
        <CardHeader className="pb-3 relative">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-500" />
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              {t('trendingStocks')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trendingStocks.map((stock) => (
              <div
                key={stock.symbol}
                className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50 transition-all duration-300 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">{stock.symbol}</p>
                  <p className="text-xs text-muted-foreground">{t('volumeLabel', { volume: stock.volume })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatCurrency(stock.price, locale)}</p>
                  <Badge
                    variant={stock.changePercent > 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {formatPercentage(stock.changePercent, locale, true)}
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