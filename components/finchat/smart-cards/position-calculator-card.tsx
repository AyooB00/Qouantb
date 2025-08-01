'use client'

import { Calculator, DollarSign, Shield, Target } from 'lucide-react'
import { BaseSmartCard } from '../base-smart-card'
import { ComponentRenderProps } from '@/lib/types/finchat'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useTranslations } from 'next-intl'

interface PositionCalculatorData {
  symbol: string
  currentPrice: number
  recommendedShares: number
  totalCost: number
  stopLossPrice: number
  riskAmount: number
  percentOfAccount: number
  maxLoss: number
  breakEvenPrice: number
  target1: number
  target2: number
  target3: number
}

export default function PositionCalculatorCard({ data, onAction }: ComponentRenderProps) {
  const t = useTranslations('finChat.smartCards.positionCalculator')
  const calcData = data as PositionCalculatorData

  const targets = [
    { label: t('target1'), price: calcData.target1, gain: ((calcData.target1 - calcData.currentPrice) / calcData.currentPrice) * 100 },
    { label: t('target2'), price: calcData.target2, gain: ((calcData.target2 - calcData.currentPrice) / calcData.currentPrice) * 100 },
    { label: t('target3'), price: calcData.target3, gain: ((calcData.target3 - calcData.currentPrice) / calcData.currentPrice) * 100 }
  ]

  return (
    <BaseSmartCard
      title={t('title', { symbol: calcData.symbol })}
      icon={Calculator}
      iconColor="text-blue-600"
      badge={{
        label: `${calcData.recommendedShares} ${t('shares')}`,
        variant: 'secondary'
      }}
      onAction={onAction}
    >
      <div className="space-y-4">
        {/* Position Summary */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">{t('totalCost')}</span>
            <span className="font-medium">${calcData.totalCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">{t('accountPercentage')}</span>
            <span className="font-medium">{calcData.percentOfAccount.toFixed(1)}%</span>
          </div>
          <Progress value={calcData.percentOfAccount} className="h-2" />
        </div>

        {/* Risk Management */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-600" />
            {t('riskManagement')}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">{t('stopLoss')}</p>
              <p className="font-medium text-red-600">${calcData.stopLossPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('maxLoss')}</p>
              <p className="font-medium text-red-600">-${calcData.maxLoss.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Profit Targets */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600" />
            {t('profitTargets')}
          </h4>
          <div className="space-y-2">
            {targets.map((target, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm">{target.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">${target.price.toFixed(2)}</span>
                  <Badge variant="outline" className="text-xs text-green-600">
                    +{target.gain.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Entry Price */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-sm text-muted-foreground">{t('entryPrice')}</span>
          <span className="text-lg font-bold">${calcData.currentPrice.toFixed(2)}</span>
        </div>
      </div>
    </BaseSmartCard>
  )
}