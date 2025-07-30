'use client'

import { TrendingUp, TrendingDown, DollarSign, Percent, PieChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import { cn } from '@/lib/utils'

export function PortfolioOverview() {
  const { 
    totalValue, 
    totalCost, 
    totalProfitLoss, 
    totalProfitLossPercent,
    items 
  } = usePortfolioStore()

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Cost basis: {formatCurrency(totalCost)}
          </p>
        </CardContent>
      </Card>

      {/* Total Profit/Loss */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Profit/Loss</CardTitle>
          {totalProfitLoss >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {formatCurrency(totalProfitLoss)}
          </div>
          <p className={cn(
            "text-xs",
            totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {formatPercent(totalProfitLossPercent)}
          </p>
        </CardContent>
      </Card>

      {/* Number of Holdings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Holdings</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{items.length}</div>
          <p className="text-xs text-muted-foreground">
            Unique stocks
          </p>
        </CardContent>
      </Card>

      {/* Average Return */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Return</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold",
            totalProfitLossPercent >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {formatPercent(items.length > 0 ? totalProfitLossPercent / items.length : 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            Per holding
          </p>
        </CardContent>
      </Card>

      {/* Sector Allocation - Full width */}
      {topSectors.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Sectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSectors.map(([sector, value]) => {
                const percentage = (value / totalValue) * 100
                return (
                  <div key={sector} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{sector}</span>
                      <span className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-sm">{formatCurrency(value)}</span>
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