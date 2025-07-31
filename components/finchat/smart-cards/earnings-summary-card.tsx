'use client'

import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ComponentRenderProps } from '@/lib/types/finchat'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface EarningsSummaryData {
  symbol: string
  companyName: string
  reportDate: string
  fiscalPeriod: string
  actualEPS?: number
  estimatedEPS?: number
  actualRevenue?: number
  estimatedRevenue?: number
  surprise?: {
    eps: number
    epsPercent: number
    revenue: number
    revenuePercent: number
  }
  guidance?: {
    nextQuarter?: { low: number; high: number }
    fullYear?: { low: number; high: number }
  }
  yearOverYear?: {
    epsGrowth: number
    revenueGrowth: number
  }
}

export default function EarningsSummaryCard({ data, className }: ComponentRenderProps<EarningsSummaryData>) {
  if (!data) return null

  const epsBeat = data.surprise && data.surprise.epsPercent > 0
  const revenueBeat = data.surprise && data.surprise.revenuePercent > 0

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-teal-600" />
            Earnings Summary - {data.symbol}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {data.fiscalPeriod}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{format(new Date(data.reportDate), 'MMM dd, yyyy')}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* EPS Results */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Earnings Per Share (EPS)</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Actual</div>
              <div className="text-lg font-semibold">
                ${data.actualEPS?.toFixed(2) || 'N/A'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Estimate</div>
              <div className="text-lg font-semibold">
                ${data.estimatedEPS?.toFixed(2) || 'N/A'}
              </div>
            </div>
          </div>
          {data.surprise && (
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-lg",
              epsBeat ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"
            )}>
              {epsBeat ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={cn(
                "text-sm font-medium",
                epsBeat ? "text-green-600" : "text-red-600"
              )}>
                {epsBeat ? 'Beat' : 'Miss'} by ${Math.abs(data.surprise.eps).toFixed(2)} ({data.surprise.epsPercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Revenue Results */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Revenue</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Actual</div>
              <div className="text-lg font-semibold">
                ${((data.actualRevenue || 0) / 1e9).toFixed(2)}B
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Estimate</div>
              <div className="text-lg font-semibold">
                ${((data.estimatedRevenue || 0) / 1e9).toFixed(2)}B
              </div>
            </div>
          </div>
          {data.surprise && (
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-lg",
              revenueBeat ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"
            )}>
              {revenueBeat ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={cn(
                "text-sm font-medium",
                revenueBeat ? "text-green-600" : "text-red-600"
              )}>
                {revenueBeat ? 'Beat' : 'Miss'} by ${(Math.abs(data.surprise.revenue) / 1e6).toFixed(1)}M ({data.surprise.revenuePercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Year over Year Growth */}
        {data.yearOverYear && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-muted/50 text-center">
              <div className="text-xs text-muted-foreground">EPS YoY</div>
              <div className={cn(
                "text-sm font-medium",
                data.yearOverYear.epsGrowth >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {data.yearOverYear.epsGrowth >= 0 ? '+' : ''}{data.yearOverYear.epsGrowth.toFixed(2)}%
              </div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50 text-center">
              <div className="text-xs text-muted-foreground">Revenue YoY</div>
              <div className={cn(
                "text-sm font-medium",
                data.yearOverYear.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {data.yearOverYear.revenueGrowth >= 0 ? '+' : ''}{data.yearOverYear.revenueGrowth.toFixed(2)}%
              </div>
            </div>
          </div>
        )}

        {/* Guidance */}
        {data.guidance && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Forward Guidance</h4>
            <div className="space-y-2 text-xs">
              {data.guidance.nextQuarter && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Next Quarter EPS</span>
                  <span className="font-medium">
                    ${data.guidance.nextQuarter.low.toFixed(2)} - ${data.guidance.nextQuarter.high.toFixed(2)}
                  </span>
                </div>
              )}
              {data.guidance.fullYear && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Year EPS</span>
                  <span className="font-medium">
                    ${data.guidance.fullYear.low.toFixed(2)} - ${data.guidance.fullYear.high.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}