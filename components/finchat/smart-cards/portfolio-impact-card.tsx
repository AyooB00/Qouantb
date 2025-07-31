'use client'

import { TrendingUp, TrendingDown, PieChart, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ComponentRenderProps, PortfolioImpactData } from '@/lib/types/finchat'
import { cn } from '@/lib/utils'

export default function PortfolioImpactCard({ data, onAction, className }: ComponentRenderProps<PortfolioImpactData>) {
  if (!data) return null

  const { currentPosition, proposedAction, impact } = data
  const isProfit = currentPosition && currentPosition.gainLoss > 0

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-teal-600" />
          Portfolio Impact - {data.symbol}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Current Position */}
        {currentPosition && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <h4 className="text-sm font-medium">Current Position</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Shares:</span>
                <span className="ml-2 font-medium">{currentPosition.shares}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Cost:</span>
                <span className="ml-2 font-medium">${currentPosition.avgCost.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Value:</span>
                <span className="ml-2 font-medium">${currentPosition.currentValue.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">P&L:</span>
                <span className={cn(
                  "ml-2 font-medium",
                  isProfit ? "text-green-600" : "text-red-600"
                )}>
                  {isProfit ? '+' : ''}{currentPosition.gainLoss.toLocaleString()} ({currentPosition.gainLossPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Proposed Action */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Proposed Action</h4>
            <Badge variant={proposedAction.type === 'buy' ? 'default' : proposedAction.type === 'sell' ? 'destructive' : 'secondary'}>
              {proposedAction.type.toUpperCase()}
            </Badge>
          </div>
          {proposedAction.shares && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Shares:</span>
                <span className="ml-2 font-medium">{proposedAction.shares}</span>
              </div>
              {proposedAction.estimatedCost && (
                <div>
                  <span className="text-muted-foreground">Est. Cost:</span>
                  <span className="ml-2 font-medium">${proposedAction.estimatedCost.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Portfolio Impact */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Impact Analysis</h4>
          
          {/* Allocation Change */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">New Allocation</span>
              <span className="font-medium">{impact.newAllocation.toFixed(2)}%</span>
            </div>
            <Progress value={impact.newAllocation} max={100} className="h-2" />
          </div>

          {/* Diversification Score */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Diversification Score</span>
              <span className="font-medium">{impact.diversificationScore.toFixed(2)}/10</span>
            </div>
            <Progress value={impact.diversificationScore * 10} max={100} className="h-2" />
          </div>

          {/* Risk Change */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <span className="text-sm">Risk Level</span>
            <div className="flex items-center gap-2">
              {impact.riskChange === 'increase' ? (
                <TrendingUp className="h-4 w-4 text-red-600" />
              ) : impact.riskChange === 'decrease' ? (
                <TrendingDown className="h-4 w-4 text-green-600" />
              ) : (
                <span className="h-4 w-4 text-gray-600">–</span>
              )}
              <span className={cn(
                "text-sm font-medium capitalize",
                impact.riskChange === 'increase' ? "text-red-600" : 
                impact.riskChange === 'decrease' ? "text-green-600" : 
                "text-gray-600"
              )}>
                {impact.riskChange}
              </span>
            </div>
          </div>

          {/* Projected Return */}
          {impact.projectedReturn !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Projected Return</span>
              <span className="text-sm font-medium">
                {impact.projectedReturn > 0 ? '+' : ''}{impact.projectedReturn.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Warning for high allocation */}
        {impact.newAllocation > 20 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">High concentration risk - consider diversifying</span>
          </div>
        )}

        {/* Actions */}
        {onAction && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant={proposedAction.type === 'buy' ? 'default' : 'destructive'}
              onClick={() => onAction({ 
                label: `${proposedAction.type} ${proposedAction.shares} shares`, 
                action: 'execute-trade', 
                data: proposedAction 
              })}
              className="flex-1"
            >
              Execute {proposedAction.type.charAt(0).toUpperCase() + proposedAction.type.slice(1)}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction({ 
                label: 'View Full Portfolio', 
                action: 'view-portfolio' 
              })}
            >
              View Portfolio
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}