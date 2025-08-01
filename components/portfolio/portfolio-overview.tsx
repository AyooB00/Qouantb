'use client'

import { TrendingUp, TrendingDown, DollarSign, Percent, PieChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters'

export function PortfolioOverview() {
  const { 
    totalValue, 
    totalCost, 
    totalProfitLoss, 
    totalProfitLossPercent,
    items 
  } = usePortfolioStore()
  
  const t = useTranslations('portfolio')
  const locale = useLocale()

  // Calculate sector allocation
  const sectorAllocation = items.reduce((acc, item) => {
    const sector = 'Technology' // This would come from stock data
    const value = item.totalValue || 0
    acc[sector] = (acc[sector] || 0) + value
    return acc
  }, {} as Record<string, number>)

  const topSectors = Object.entries(sectorAllocation)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Value */}
      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-teal-50/50 dark:from-blue-950/20 dark:to-teal-950/20" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium">{t('totalValue')}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold">{formatCurrency(totalValue, locale)}</div>
          <p className="text-xs text-muted-foreground">
            {t('costBasis')}: {formatCurrency(totalCost, locale)}
          </p>
        </CardContent>
      </Card>

      {/* Total Profit/Loss */}
      <Card className="overflow-hidden relative">
        <div className={cn(
          "absolute inset-0 opacity-10",
          totalProfitLoss >= 0 ? "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900" : "bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900 dark:to-rose-900"
        )} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium">{t('totalGainLoss')}</CardTitle>
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center",
            totalProfitLoss >= 0 ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50"
          )}>
            {totalProfitLoss >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className={cn(
            "text-2xl font-bold",
            totalProfitLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {formatCurrency(totalProfitLoss, locale)}
          </div>
          <p className={cn(
            "text-xs",
            totalProfitLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {formatPercentage(totalProfitLossPercent, locale)}
          </p>
        </CardContent>
      </Card>

      {/* Number of Holdings */}
      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium">{t('holdings')}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
            <PieChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-2xl font-bold">{items.length}</div>
          <p className="text-xs text-muted-foreground">
            {t('uniqueStocks')}
          </p>
        </CardContent>
      </Card>

      {/* Average Return */}
      <Card className="overflow-hidden relative">
        <div className={cn(
          "absolute inset-0 opacity-10",
          totalProfitLossPercent >= 0 ? "bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900" : "bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900"
        )} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
          <CardTitle className="text-sm font-medium">{t('averageReturn')}</CardTitle>
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center",
            totalProfitLossPercent >= 0 ? "bg-teal-100 dark:bg-teal-900/50" : "bg-orange-100 dark:bg-orange-900/50"
          )}>
            <Percent className={cn(
              "h-4 w-4",
              totalProfitLossPercent >= 0 ? "text-teal-600 dark:text-teal-400" : "text-orange-600 dark:text-orange-400"
            )} />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className={cn(
            "text-2xl font-bold",
            totalProfitLossPercent >= 0 ? "text-teal-600 dark:text-teal-400" : "text-orange-600 dark:text-orange-400"
          )}>
            {formatPercentage(items.length > 0 ? totalProfitLossPercent / items.length : 0, locale)}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('perHolding')}
          </p>
        </CardContent>
      </Card>

      {/* Sector Allocation - Full width */}
      {topSectors.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-violet-50/30 dark:from-indigo-950/10 dark:to-violet-950/10" />
          <CardHeader className="relative">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              {t('topSectors')}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-3">
              {topSectors.map(([sector, value], index) => {
                const percentage = (value / totalValue) * 100
                const colors = [
                  'from-blue-500 to-cyan-500',
                  'from-purple-500 to-pink-500',
                  'from-green-500 to-emerald-500'
                ]
                return (
                  <div key={sector} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full bg-gradient-to-r",
                          colors[index % colors.length]
                        )} />
                        <span className="text-sm font-medium">{sector}</span>
                        <span className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(value, locale)}</span>
                    </div>
                    <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={cn("absolute inset-y-0 left-0 bg-gradient-to-r rounded-full transition-all duration-500", colors[index % colors.length])}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}