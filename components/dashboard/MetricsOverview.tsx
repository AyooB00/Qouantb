'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { cn } from '@/lib/utils'
import { formatCurrency, formatPercentage, formatPercentageChange } from '@/lib/utils/formatters'

interface Metric {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  sparkline?: number[]
}

export function MetricsOverview() {
  const { totalValue, totalProfitLoss, totalProfitLossPercent, items } = usePortfolioStore()
  const [metrics, setMetrics] = useState<Metric[]>([])
  const t = useTranslations('dashboard.metrics')
  const locale = useLocale()

  useEffect(() => {
    // Calculate metrics
    const dayChange = items.reduce((sum, item) => sum + (item.dayChange || 0), 0)
    const dayChangePercent = totalValue > 0 ? (dayChange / totalValue) * 100 : 0
    
    // Count winning/losing positions
    const winners = items.filter(item => (item.profitLoss || 0) > 0).length
    const totalPositions = items.length

    setMetrics([
      {
        title: t('totalValue'),
        value: formatCurrency(totalValue, locale),
        change: formatPercentage(totalProfitLossPercent, locale),
        changeType: totalProfitLossPercent >= 0 ? 'positive' : 'negative',
        icon: DollarSign,
        iconColor: 'text-green-500',
        sparkline: [65, 68, 65, 70, 72, 78, 75, 80, 82] // Mock sparkline
      },
      {
        title: t('dayChange'),
        value: (dayChange >= 0 ? '+' : '') + formatCurrency(Math.abs(dayChange), locale),
        change: formatPercentage(dayChangePercent, locale),
        changeType: dayChange >= 0 ? 'positive' : 'negative',
        icon: Activity,
        iconColor: 'text-blue-500',
      },
      {
        title: t('totalReturn'),
        value: (totalProfitLoss >= 0 ? '+' : '') + formatCurrency(Math.abs(totalProfitLoss), locale),
        change: formatPercentage(totalProfitLossPercent, locale),
        changeType: totalProfitLoss >= 0 ? 'positive' : 'negative',
        icon: totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
        iconColor: totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500',
      },
      {
        title: t('winRate'),
        value: formatPercentage(totalPositions > 0 ? (winners / totalPositions) * 100 : 0, locale, false),
        change: t('positions', { winners, total: totalPositions }),
        changeType: winners > totalPositions / 2 ? 'positive' : 'negative',
        icon: PieChart,
        iconColor: 'text-teal-500',
      },
    ])
  }, [totalValue, totalProfitLoss, totalProfitLossPercent, items, t, locale])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const gradients = [
          'from-blue-50/50 to-teal-50/50 dark:from-blue-950/20 dark:to-teal-950/20',
          'from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20',
          'from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20',
          'from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20'
        ]
        
        return (
          <Card key={metric.title} className={cn(
            "overflow-hidden relative transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
            `animate-stagger animate-stagger-${index + 1}`
          )}>
            <div className={cn("absolute inset-0 bg-gradient-to-br", gradients[index % gradients.length])} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                metric.changeType === 'positive' ? 'bg-green-100 dark:bg-green-900/50' :
                metric.changeType === 'negative' ? 'bg-red-100 dark:bg-red-900/50' :
                'bg-gray-100 dark:bg-gray-900/50'
              )}>
                <Icon className={cn("h-4 w-4", metric.iconColor)} />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={cn(
                "text-xs mt-1",
                metric.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 
                metric.changeType === 'negative' ? 'text-red-600 dark:text-red-400' : 
                'text-muted-foreground'
              )}>
                {metric.change}
              </p>
              
              {/* Mini sparkline visualization */}
              {metric.sparkline && (
                <div className="mt-3 flex items-end gap-0.5 h-8">
                  {metric.sparkline.map((value, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 rounded-sm transition-all duration-300",
                        metric.changeType === 'positive' ? 'bg-green-400/30' :
                        metric.changeType === 'negative' ? 'bg-red-400/30' :
                        'bg-primary/20'
                      )}
                      style={{ 
                        height: `${(value / 100) * 32}px`,
                        animationDelay: `${i * 50}ms`
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}