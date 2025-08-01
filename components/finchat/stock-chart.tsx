'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { cn } from '@/lib/utils'
import { QueueIndicator } from '@/components/ui/queue-indicator'
import { useTranslations, useLocale } from 'next-intl'
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils/formatters'

interface StockChartProps {
  symbol: string
  className?: string
  height?: number
}

interface ChartData {
  date: string
  price: number
  displayDate: string
}

interface StockQuote {
  c: number  // Current price
  d: number  // Change
  dp: number // Change percentage
  h: number  // High
  l: number  // Low
  o: number  // Open
  pc: number // Previous close
}

export function StockChart({ symbol, className, height = 200 }: StockChartProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [quote, setQuote] = useState<StockQuote | null>(null)
  const t = useTranslations('dashboard.market')
  const locale = useLocale()

  useEffect(() => {
    fetchStockData()
  }, [symbol])

  const fetchStockData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch current quote
      const quoteResponse = await fetch(`/api/finchat/stock-quote?symbol=${symbol}`)
      if (!quoteResponse.ok) throw new Error('Failed to fetch quote')
      const quoteData = await quoteResponse.json()
      setQuote(quoteData.quote)

      // Fetch historical data
      const historicalResponse = await fetch(`/api/finchat/stock-history?symbol=${symbol}&days=30`)
      if (!historicalResponse.ok) throw new Error('Failed to fetch historical data')
      const historicalData = await historicalResponse.json()

      // Transform data for recharts
      const transformed = historicalData.prices.map((price: number, index: number) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - index))
        return {
          date: date.toISOString(),
          price: price,
          displayDate: formatDate(date, locale, { dateStyle: 'medium' }).split(',')[0] // Get just month and day
        }
      })

      setChartData(transformed)
    } catch (err) {
      console.error('Error fetching stock data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load chart')
    } finally {
      setLoading(false)
    }
  }

  const formatTooltipValue = (value: number) => {
    return [formatCurrency(value, locale), 'Price']
  }

  if (loading) {
    return (
      <Card className={cn("w-full bg-card/50 backdrop-blur animate-pulse", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="h-6 w-16 bg-muted rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 bg-muted rounded animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center" style={{ height: height - 100 }}>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !quote) {
    return (
      <Card className={cn("w-full bg-card/50 backdrop-blur", className)}>
        <CardContent className="flex flex-col items-center justify-center gap-2" style={{ height }}>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-destructive">Unable to load chart</p>
            <p className="text-xs text-muted-foreground">{symbol}</p>
            {error && (
              <p className="text-xs text-muted-foreground/60">{error}</p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchStockData}
            className="mt-2"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const isPositive = quote.dp >= 0
  const chartColor = isPositive ? '#10b981' : '#ef4444'

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-medium">{symbol}</CardTitle>
            <QueueIndicator symbol={symbol} className="text-xs" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold">{formatCurrency(quote.c, locale)}</span>
            <Badge 
              variant={isPositive ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {formatPercentage(quote.dp, locale)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart 
            data={chartData} 
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => formatCurrency(value, locale, true)}
            />
            <Tooltip 
              formatter={formatTooltipValue}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#gradient-${symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-4 gap-2 mt-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t('open')}</p>
            <p className="font-medium">{formatCurrency(quote.o)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('high')}</p>
            <p className="font-medium">{formatCurrency(quote.h)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('low')}</p>
            <p className="font-medium">{formatCurrency(quote.l)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('previousClose')}</p>
            <p className="font-medium">{formatCurrency(quote.pc)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}