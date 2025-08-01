'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Clock, TrendingUp, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatTradingHours, formatNumber, formatPercentage } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

interface MarketData {
  composite: {
    value: number
    change: number
    changePercent: number
  }
  nasdaq100: {
    value: number
    change: number
    changePercent: number
  }
  volume: number
  advancers: number
  decliners: number
  unchanged: number
}

export function NasdaqMarketStatus() {
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | 'pre-market' | 'after-hours'>('closed')
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const t = useTranslations('dashboard.market')
  const locale = useLocale()

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Check market status
    checkMarketStatus()

    // Fetch market data
    fetchMarketData()

    return () => clearInterval(timer)
  }, [])

  const checkMarketStatus = () => {
    const now = new Date()
    const hours = now.getUTCHours() - 5 // Convert to ET (UTC-5)
    const minutes = now.getMinutes()
    const day = now.getDay()

    // Skip weekends
    if (day === 0 || day === 6) {
      setMarketStatus('closed')
      return
    }

    const timeInMinutes = hours * 60 + minutes

    if (timeInMinutes >= 240 && timeInMinutes < 570) {
      // 4:00 AM - 9:30 AM ET
      setMarketStatus('pre-market')
    } else if (timeInMinutes >= 570 && timeInMinutes < 960) {
      // 9:30 AM - 4:00 PM ET
      setMarketStatus('open')
    } else if (timeInMinutes >= 960 && timeInMinutes < 1200) {
      // 4:00 PM - 8:00 PM ET
      setMarketStatus('after-hours')
    } else {
      setMarketStatus('closed')
    }
  }

  const fetchMarketData = async () => {
    // Mock data for demonstration
    // In production, this would fetch real NASDAQ data
    setMarketData({
      composite: {
        value: 15832.45,
        change: 142.89,
        changePercent: 0.91
      },
      nasdaq100: {
        value: 17654.32,
        change: 198.45,
        changePercent: 1.14
      },
      volume: 4567890123,
      advancers: 2145,
      decliners: 987,
      unchanged: 156
    })
  }

  const getStatusColor = () => {
    switch (marketStatus) {
      case 'open':
        return 'bg-green-500'
      case 'pre-market':
      case 'after-hours':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = () => {
    switch (marketStatus) {
      case 'open':
        return 'default'
      case 'pre-market':
      case 'after-hours':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            NASDAQ {t('marketOverview')}
          </CardTitle>
          <Badge variant={getStatusBadgeVariant()} className="flex items-center gap-1">
            <div className={cn('w-2 h-2 rounded-full', getStatusColor())} />
            {t(marketStatus === 'open' ? 'marketOpen' : 
               marketStatus === 'closed' ? 'marketClosed' :
               marketStatus === 'pre-market' ? 'preMarket' : 'afterHours')}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Clock className="h-3 w-3" />
          {formatTradingHours(marketStatus, locale)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {marketData && (
          <div className="space-y-4">
            {/* Index Performance */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t('nasdaqComposite')}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {formatNumber(marketData.composite.value, locale)}
                  </span>
                  <span className={cn(
                    'text-sm font-medium',
                    marketData.composite.change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {marketData.composite.change >= 0 ? '+' : ''}
                    {formatNumber(marketData.composite.change, locale)}
                    ({formatPercentage(marketData.composite.changePercent, locale, false)})
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t('nasdaq100')}
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {formatNumber(marketData.nasdaq100.value, locale)}
                  </span>
                  <span className={cn(
                    'text-sm font-medium',
                    marketData.nasdaq100.change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {marketData.nasdaq100.change >= 0 ? '+' : ''}
                    {formatNumber(marketData.nasdaq100.change, locale)}
                    ({formatPercentage(marketData.nasdaq100.changePercent, locale, false)})
                  </span>
                </div>
              </div>
            </div>

            {/* Market Breadth */}
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Market Breadth
              </h4>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">
                  ↑ {formatNumber(marketData.advancers, locale)} {locale === 'ar' ? 'صاعد' : 'Advancing'}
                </span>
                <span className="text-gray-500">
                  → {formatNumber(marketData.unchanged, locale)} {locale === 'ar' ? 'ثابت' : 'Unchanged'}
                </span>
                <span className="text-red-600">
                  ↓ {formatNumber(marketData.decliners, locale)} {locale === 'ar' ? 'هابط' : 'Declining'}
                </span>
              </div>
            </div>

            {/* Volume */}
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('volume')}</span>
                <span className="text-sm font-medium">
                  {formatNumber(marketData.volume, locale)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}