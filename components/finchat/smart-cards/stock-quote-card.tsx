'use client'

import { TrendingUp, TrendingDown, Building2, Activity } from 'lucide-react'
import { BaseSmartCard } from '../base-smart-card'
import { ComponentRenderProps } from '@/lib/types/finchat'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from 'next-intl'

interface StockQuoteData {
  symbol: string
  companyName: string
  currentPrice: number
  change: number
  changePercent: number
  dayHigh: number
  dayLow: number
  openPrice: number
  previousClose: number
  marketCap?: number
  sector?: string
  exchange?: string
  timestamp: string
}

export default function StockQuoteCard({ data, onAction }: ComponentRenderProps) {
  const t = useTranslations('finChat.smartCards.stockQuote')
  const quoteData = data as StockQuoteData

  const isPositive = quoteData.change >= 0
  const dayRange = ((quoteData.currentPrice - quoteData.dayLow) / (quoteData.dayHigh - quoteData.dayLow)) * 100

  const formatMarketCap = (cap?: number) => {
    if (!cap) return 'N/A'
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
    return `$${cap.toLocaleString()}`
  }

  return (
    <BaseSmartCard
      title={quoteData.symbol}
      icon={isPositive ? TrendingUp : TrendingDown}
      iconColor={isPositive ? 'text-green-600' : 'text-red-600'}
      badge={{
        label: `${isPositive ? '+' : ''}${quoteData.change.toFixed(2)} (${isPositive ? '+' : ''}${quoteData.changePercent.toFixed(2)}%)`,
        variant: isPositive ? 'default' : 'destructive',
        className: 'gap-1'
      }}
      onAction={onAction}
    >
      <div className="space-y-4">
        {/* Company Name and Price */}
        <div>
          <p className="text-sm text-muted-foreground">{quoteData.companyName}</p>
          <p className="text-3xl font-bold mt-1">${quoteData.currentPrice.toFixed(2)}</p>
        </div>

        {/* Day Range */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">{t('dayRange')}</span>
            <span>{quoteData.dayLow.toFixed(2)} - {quoteData.dayHigh.toFixed(2)}</span>
          </div>
          <Progress value={dayRange} className="h-2" />
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">{t('open')}</p>
            <p className="font-medium">${quoteData.openPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('prevClose')}</p>
            <p className="font-medium">${quoteData.previousClose.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('marketCap')}</p>
            <p className="font-medium">{formatMarketCap(quoteData.marketCap)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('volume')}</p>
            <p className="font-medium">
              <Activity className="inline h-3 w-3 mr-1" />
              {t('active')}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center gap-2 pt-2 border-t">
          {quoteData.sector && (
            <Badge variant="secondary" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              {quoteData.sector}
            </Badge>
          )}
          {quoteData.exchange && (
            <Badge variant="outline" className="text-xs">
              {quoteData.exchange}
            </Badge>
          )}
        </div>
      </div>
    </BaseSmartCard>
  )
}