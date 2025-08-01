'use client'

import { PieChart, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'
import { BaseSmartCard } from '../base-smart-card'
import { ComponentRenderProps } from '@/lib/types/finchat'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from 'next-intl'

interface PortfolioSummaryData {
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  numberOfHoldings: number
  topPerformer: {
    symbol: string
    gainPercent: number
  }
  diversification: {
    technology: number
    healthcare: number
    finance: number
    consumer: number
    other: number
  }
}

export default function PortfolioSummaryCard({ data, onAction }: ComponentRenderProps) {
  const t = useTranslations('finChat.smartCards.portfolioSummary')
  const portfolioData = data as PortfolioSummaryData

  const isPositive = portfolioData.totalGainLoss >= 0
  
  const sectors = Object.entries(portfolioData.diversification).map(([sector, percentage]) => ({
    name: t(`sectors.${sector}`),
    value: percentage,
    color: getSectorColor(sector)
  }))

  function getSectorColor(sector: string) {
    const colors: Record<string, string> = {
      technology: 'bg-blue-500',
      healthcare: 'bg-green-500',
      finance: 'bg-purple-500',
      consumer: 'bg-orange-500',
      other: 'bg-gray-500'
    }
    return colors[sector] || 'bg-gray-500'
  }

  return (
    <BaseSmartCard
      title={t('title')}
      icon={PieChart}
      iconColor="text-purple-600"
      badge={
        <Badge variant={isPositive ? 'default' : 'destructive'}>
          {isPositive ? '+' : ''}{portfolioData.totalGainLossPercent.toFixed(2)}%
        </Badge>
      }
      onAction={onAction}
    >
      <div className="space-y-4">
        {/* Portfolio Value */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">{t('totalValue')}</p>
          <p className="text-3xl font-bold mt-1">${portfolioData.totalValue.toLocaleString()}</p>
          <p className={`text-sm mt-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''} ${Math.abs(portfolioData.totalGainLoss).toLocaleString()}
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('holdings')}</span>
            </div>
            <p className="text-xl font-bold">{portfolioData.numberOfHoldings}</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">{t('topPerformer')}</span>
            </div>
            <p className="text-sm font-bold">{portfolioData.topPerformer.symbol}</p>
            <p className="text-xs text-green-600">+{portfolioData.topPerformer.gainPercent.toFixed(1)}%</p>
          </div>
        </div>

        {/* Diversification */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {t('diversification')}
          </h4>
          <div className="space-y-2">
            {sectors.map((sector, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{sector.name}</span>
                  <span className="font-medium">{sector.value}%</span>
                </div>
                <Progress value={sector.value} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Action Hint */}
        <div className="text-sm text-muted-foreground text-center pt-3 border-t">
          {t('actionHint')}
        </div>
      </div>
    </BaseSmartCard>
  )
}