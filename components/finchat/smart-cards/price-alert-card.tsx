'use client'

import { Bell, BellOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ComponentRenderProps } from '@/lib/types/finchat'
import { cn } from '@/lib/utils'

interface PriceAlertData {
  symbol: string
  currentPrice: number
  alertType: 'above' | 'below' | 'range'
  targetPrice?: number
  upperBound?: number
  lowerBound?: number
  message: string
  triggered?: boolean
}

export default function PriceAlertCard({ data, onAction, className }: ComponentRenderProps<PriceAlertData>) {
  if (!data) return null

  const isTriggered = data.triggered
  const Icon = isTriggered ? Bell : BellOff

  return (
    <Card className={cn(
      "overflow-hidden transition-all",
      isTriggered && "ring-2 ring-amber-500 animate-pulse-slow",
      className
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon className={cn(
              "h-5 w-5",
              isTriggered ? "text-amber-600 animate-bounce" : "text-gray-600"
            )} />
            Price Alert - {data.symbol}
          </span>
          <Badge variant={isTriggered ? "destructive" : "secondary"}>
            {isTriggered ? "Triggered" : "Active"}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Price</span>
          <span className="text-lg font-semibold">${data.currentPrice.toFixed(2)}</span>
        </div>

        {data.alertType === 'range' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Upper Bound</span>
              <span className="font-medium">${data.upperBound?.toFixed(2)}</span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-teal-600"
                style={{
                  left: `${((data.lowerBound || 0) / data.currentPrice) * 50}%`,
                  right: `${100 - ((data.upperBound || 0) / data.currentPrice) * 50}%`
                }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-800 rounded-full"
                style={{ left: `${(data.currentPrice / ((data.upperBound || 0) + (data.lowerBound || 0)) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Lower Bound</span>
              <span className="font-medium">${data.lowerBound?.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Alert when price goes {data.alertType}
            </span>
            <span className="font-medium">${data.targetPrice?.toFixed(2)}</span>
          </div>
        )}

        <div className="p-2 rounded-lg bg-muted/50">
          <p className="text-sm">{data.message}</p>
        </div>

        {onAction && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isTriggered ? "default" : "outline"}
              onClick={() => onAction({ 
                label: 'View Chart', 
                action: 'view-chart',
                data: { symbol: data.symbol }
              })}
              className="flex-1"
            >
              View Chart
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction({ 
                label: isTriggered ? 'Set New Alert' : 'Edit Alert', 
                action: 'edit-alert',
                data: data as unknown as Record<string, unknown>
              })}
            >
              {isTriggered ? 'Set New' : 'Edit'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}