'use client'

import { useEffect, useState } from 'react'
import { Activity, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ComponentRenderProps, TechnicalAnalysisData } from '@/lib/types/finchat'
import { cn } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function TechnicalAnalysisCard({ data, onAction, className }: ComponentRenderProps<TechnicalAnalysisData>) {
  const [techData, setTechData] = useState<TechnicalAnalysisData | null>(data)
  const [loading, setLoading] = useState(!data)

  useEffect(() => {
    if (!data && data !== null) {
      // Fetch technical data if needed
      setLoading(false)
    }
  }, [data])

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <CardTitle>Loading Technical Analysis...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!techData || !techData.indicators) return null

  const { indicators, support, resistance, trend, signal } = techData

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'strong-buy':
      case 'buy':
        return 'text-green-600 bg-green-50 dark:bg-green-950/30'
      case 'strong-sell':
      case 'sell':
        return 'text-red-600 bg-red-50 dark:bg-red-950/30'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30'
    }
  }

  const getRSIColor = (value: number) => {
    if (value < 30) return 'text-green-600'
    if (value > 70) return 'text-red-600'
    return 'text-gray-600'
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'uptrend':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'downtrend':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  // Mock chart data for moving averages
  const chartData = indicators.movingAverages ? Array.from({ length: 20 }, (_, i) => ({
    day: i + 1,
    price: indicators.movingAverages.sma20 + (Math.random() - 0.5) * 10,
    sma20: indicators.movingAverages.sma20,
    sma50: indicators.movingAverages.sma50,
    sma200: indicators.movingAverages.sma200,
  })) : []

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600" />
            Technical Analysis - {techData.symbol}
          </CardTitle>
          <Badge className={cn("capitalize", getSignalColor(signal))}>
            {signal.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Trend Overview */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className="font-medium capitalize">{trend}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {support?.[0] && `S: $${support[0].toFixed(2)}`}
            {support?.[0] && resistance?.[0] && ' | '}
            {resistance?.[0] && `R: $${resistance[0].toFixed(2)}`}
          </div>
        </div>

        {/* RSI Indicator */}
        {indicators.rsi && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">RSI (14)</span>
              <Badge variant="outline" className={cn("text-xs", getRSIColor(indicators.rsi.value))}>
                {indicators.rsi.value.toFixed(1)} - {indicators.rsi.signal}
              </Badge>
            </div>
            <Progress value={indicators.rsi.value} max={100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Oversold</span>
              <span>30</span>
              <span>70</span>
              <span>Overbought</span>
            </div>
          </div>
        )}

        {/* MACD */}
        {indicators.macd && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">MACD</span>
              <Badge variant="outline" className={cn(
                "text-xs",
                indicators.macd.trend === 'bullish' ? 'text-green-600' : 'text-red-600'
              )}>
                {indicators.macd.trend}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">MACD:</span>
                <span className="ml-1 font-medium">{indicators.macd.value.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Signal:</span>
                <span className="ml-1 font-medium">{indicators.macd.signal.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Histogram:</span>
                <span className={cn(
                  "ml-1 font-medium",
                  indicators.macd.histogram > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {indicators.macd.histogram.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Moving Averages Chart */}
        {indicators.movingAverages && chartData.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Moving Averages</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                    name="Price"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sma20" 
                    stroke="#10b981" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="SMA 20"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sma50" 
                    stroke="#f59e0b" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="SMA 50"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sma200" 
                    stroke="#ef4444" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="SMA 200"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-primary" />
                <span>Price</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-green-500" style={{ borderTop: '1px dashed' }} />
                <span>SMA 20</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-amber-500" style={{ borderTop: '1px dashed' }} />
                <span>SMA 50</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-red-500" style={{ borderTop: '1px dashed' }} />
                <span>SMA 200</span>
              </div>
            </div>
          </div>
        )}

        {/* Bollinger Bands */}
        {indicators.bollingerBands && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Bollinger Bands</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Upper Band:</span>
                <span className="font-medium">${indicators.bollingerBands.upper.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Middle Band:</span>
                <span className="font-medium">${indicators.bollingerBands.middle.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lower Band:</span>
                <span className="font-medium">${indicators.bollingerBands.lower.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Price:</span>
                <span className={cn(
                  "font-medium",
                  indicators.bollingerBands.price > indicators.bollingerBands.upper ? 'text-red-600' :
                  indicators.bollingerBands.price < indicators.bollingerBands.lower ? 'text-green-600' :
                  'text-gray-600'
                )}>
                  ${indicators.bollingerBands.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Support & Resistance Levels */}
        {(support?.length > 0 || resistance?.length > 0) && (
          <div className="grid grid-cols-2 gap-3">
            {support?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-600">Support Levels</h4>
                <div className="space-y-1">
                  {support.map((level, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">S{i + 1}:</span>
                      <span className="font-medium">${level.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {resistance?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-600">Resistance Levels</h4>
                <div className="space-y-1">
                  {resistance.map((level, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">R{i + 1}:</span>
                      <span className="font-medium">${level.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}