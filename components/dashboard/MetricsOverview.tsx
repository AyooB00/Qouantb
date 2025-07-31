'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { cn } from '@/lib/utils'

interface Metric {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: any
  iconColor: string
  sparkline?: number[]
}

export function MetricsOverview() {
  const { totalValue, totalProfitLoss, totalProfitLossPercent, items } = usePortfolioStore()
  const [metrics, setMetrics] = useState<Metric[]>([])

  useEffect(() => {
    // Calculate metrics
    const dayChange = items.reduce((sum, item) => sum + (item.dayChange || 0), 0)
    const dayChangePercent = totalValue > 0 ? (dayChange / totalValue) * 100 : 0
    
    // Count winning/losing positions
    const winners = items.filter(item => (item.profitLoss || 0) > 0).length
    const totalPositions = items.length

    setMetrics([
      {
        title: 'Total Portfolio Value',
        value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: `${totalProfitLossPercent >= 0 ? '+' : ''}${totalProfitLossPercent.toFixed(2)}%`,
        changeType: totalProfitLossPercent >= 0 ? 'positive' : 'negative',
        icon: DollarSign,
        iconColor: 'text-green-500',
        sparkline: [65, 68, 65, 70, 72, 78, 75, 80, 82] // Mock sparkline
      },
      {
        title: "Today's Performance",
        value: `${dayChange >= 0 ? '+' : ''}$${Math.abs(dayChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: `${dayChangePercent >= 0 ? '+' : ''}${dayChangePercent.toFixed(2)}%`,
        changeType: dayChange >= 0 ? 'positive' : 'negative',
        icon: Activity,
        iconColor: 'text-blue-500',
      },
      {
        title: 'Total Return',
        value: `${totalProfitLoss >= 0 ? '+' : ''}$${Math.abs(totalProfitLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: `${totalProfitLossPercent >= 0 ? '+' : ''}${totalProfitLossPercent.toFixed(2)}%`,
        changeType: totalProfitLoss >= 0 ? 'positive' : 'negative',
        icon: totalProfitLoss >= 0 ? TrendingUp : TrendingDown,
        iconColor: totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500',
      },
      {
        title: 'Win Rate',
        value: totalPositions > 0 ? `${Math.round((winners / totalPositions) * 100)}%` : '0%',
        change: `${winners}/${totalPositions} positions`,
        changeType: winners > totalPositions / 2 ? 'positive' : 'negative',
        icon: PieChart,
        iconColor: 'text-teal-500',
      },
    ])
  }, [totalValue, totalProfitLoss, totalProfitLossPercent, items])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className={`animate-stagger animate-stagger-${index + 1}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={cn("h-4 w-4", metric.iconColor)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={cn(
                "text-xs mt-1",
                metric.changeType === 'positive' ? 'text-green-600' : 
                metric.changeType === 'negative' ? 'text-red-600' : 
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
                      className="flex-1 bg-primary/20 rounded-sm"
                      style={{ height: `${(value / 100) * 32}px` }}
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