'use client'

import { Grid3x3, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ComponentRenderProps } from '@/lib/types/finchat'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface SectorAnalysisData {
  sector: string
  performance: {
    daily: number
    weekly: number
    monthly: number
    yearly: number
  }
  topPerformers: Array<{
    symbol: string
    name: string
    changePercent: number
  }>
  marketCap: number
  peRatio: number
  volume: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  subsectors?: Array<{
    name: string
    performance: number
    weight: number
  }>
}

export default function SectorAnalysisCard({ data, onAction, className }: ComponentRenderProps<SectorAnalysisData>) {
  if (!data) return null

  const performanceData = [
    { period: '1D', value: data.performance.daily },
    { period: '1W', value: data.performance.weekly },
    { period: '1M', value: data.performance.monthly },
    { period: '1Y', value: data.performance.yearly }
  ]

  const getSentimentColor = () => {
    switch (data.sentiment) {
      case 'bullish':
        return 'text-green-600 bg-green-50 dark:bg-green-950/30'
      case 'bearish':
        return 'text-red-600 bg-red-50 dark:bg-red-950/30'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
    }
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5 text-teal-600" />
            {data.sector} Sector Analysis
          </CardTitle>
          <Badge className={cn("capitalize", getSentimentColor())}>
            {data.sentiment}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Performance Chart */}
        <div>
          <h4 className="text-sm font-medium mb-2">Performance Overview</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis dataKey="period" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {performanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value >= 0 ? '#10b981' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-muted-foreground">Market Cap</div>
            <div className="font-medium">${(data.marketCap / 1e12).toFixed(2)}T</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-muted-foreground">Avg P/E</div>
            <div className="font-medium">{data.peRatio.toFixed(2)}</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <div className="text-muted-foreground">Volume</div>
            <div className="font-medium">{(data.volume / 1e9).toFixed(2)}B</div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Top Performers</h4>
          <div className="space-y-1">
            {data.topPerformers.slice(0, 3).map((stock, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{stock.symbol}</span>
                  <span className="text-xs text-muted-foreground">{stock.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {stock.changePercent >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    stock.changePercent >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subsectors */}
        {data.subsectors && data.subsectors.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Subsector Breakdown</h4>
            <div className="space-y-1">
              {data.subsectors.map((subsector, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{subsector.name}</span>
                    <span className={cn(
                      "font-medium",
                      subsector.performance >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {subsector.performance >= 0 ? '+' : ''}{subsector.performance.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all",
                        subsector.performance >= 0 ? "bg-green-600" : "bg-red-600"
                      )}
                      style={{ width: `${subsector.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {onAction && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction({ 
                label: 'View Sector ETFs', 
                action: 'view-etfs',
                data: { sector: data.sector }
              })}
              className="flex-1"
            >
              View ETFs
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction({ 
                label: 'Compare Sectors', 
                action: 'compare-sectors'
              })}
              className="flex-1"
            >
              Compare
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

import { Button } from '@/components/ui/button'